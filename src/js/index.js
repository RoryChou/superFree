/**
 * Created by rory on 2017/5/18.
 */
$(function () {
    var $document = $(document);

    var search = {
        target:null,
        targetInput:null,
        container:$('.search-container'),
        suggestionBox: $('.drop-suggestion-citys'),
        selectBox: $('.search-contents-selections'),
        calendar:null,
        calendarFlightReturn:null,
        tabSwitcher:null,
        localCity:'上海',
        completeBox: $('.drop-complete'),//当前页面是否唯一？
        init: function () {
            //this.suggestionBox = $('.drop-suggestion-citys');
            this.bindEvent();
            this.tabSwitcherCombo = this.tabSwitch('.search-contents-combo .letter-tabs li','.search-contents-combo .letter-city-contents li');
            this.tabSwitcherFlight = this.tabSwitch('.search-contents-flight .letter-tabs li','.search-contents-flight .letter-city-contents li');
            this.getDefaultInfo();
            this.calendarInit();
        },
        getDefaultInfo:function () {
            //填写默认信息
            $('.combo-date input').val(this.dateNow());
            $('.flight-date-start input').val(this.dateNow());
            $('.flight-date-return input').val(this.dateNow(Date.now()+86400000));
            //默认出发地为本站站点
            $('.combo-from input').val(this.localCity);
            $('.flight-from input').val(this.localCity);
        },
        dateNow: function (set) {
            var date = set?new Date(set):new Date();
            var dateArr = date.toLocaleDateString().split('/');
            //+0
            dateArr[1] = dateArr[1]<10?'0'+dateArr[1]:dateArr[1];
            dateArr[2] = dateArr[2]<10?'0'+dateArr[2]:dateArr[2];
            return dateArr.join('-');
        },
        getPosition: function () {
            //获取container的位置
            var dropT = this.targetInput.offset().top-this.container.offset().top+this.targetInput.height();
            var dropL = this.targetInput.offset().left-this.container.offset().left;
            if(this.targetInput.hasClass('search-city')){
                this.suggestionBox.css({
                    top: dropT,
                    left: dropL
                });
                this.completeBox.css({
                    top: dropT,
                    left: dropL
                });
            }else {
                //弹出calendar
            }
        },
        calendarInit: function () {
            var self = this;
            this.calendar = lv.calendar({
                date: self.dateNow(),
                autoRender: false,
                trigger: ".search-calendar-common",
                triggerEvent: "click",
                bimonthly: true,
                //定位偏移
                monthNext: 10,
                monthPrev: 10,
                dayPrev: 0,
                template: "small",
                //点击选择日期后的回调函数 默认返回值: calendar对象
                selectDateCallback: function () {
                    for(var i in this.selected){
                        self.targetInput.find('input').val(i)
                        //判断星期几并写入info
                        var date = new Date(i);
                        var week = ['周日','周一','周二','周三','周四','周五','周六']
                        var weekDay = week[date.getDay()];
                        self.targetInput.find('.search-contents-info').html(weekDay);
                        //刷新返程时间info
                        self.freshInfo();
                        //刷新返程的日历起始时间
                        $('.flight-date-return input').val(self.dateNow((new Date(i)).getTime()+86400000))
                    }
                }
            });
            this.calendarFlightReturn = lv.calendar({
                autoRender: false,
                trigger: ".search-cascading input",
                triggerEvent: "click",
                bimonthly: false,
                //定位偏移
                monthNext: 10,
                monthPrev: 10,
                dayPrev: 0,
                template: "small",
                cascading: true,
                cascadingNextAuto: false,
                //点击选择日期后的回调函数 默认返回值: calendar对象
                selectDateCallback: function () {
                    var week = ['周日','周一','周二','周三','周四','周五','周六']
                    var date = new Date(self.targetInput.find('input').val());
                    var weekDay = week[date.getDay()];
                    self.targetInput.find('.search-contents-info').html(weekDay);
                }
            })
        },
        bindEvent: function () {
            var self = this;
            //点击search-city
            $document.on('click','.search-city',function (e) {
                var data = {};
                //e.stopPropagation();
                self.targetInput = $(e.target).parent('.search-city');
                self.getPosition();
                //判断是何种请求
                if(self.targetInput.hasClass('combo-from')) {
                    data = {};
                    self.getData('data/citys.json',data,'click');
                }
                if(self.targetInput.hasClass('flight-from')) {
                    data = {};
                    self.getData('data/citys.json',data,'click');
                }
                if(self.targetInput.hasClass('combo-to')) {
                    data = {};
                    self.getData('data/citys.json',data,'click');
                }
                if(self.targetInput.hasClass('flight-to')) {
                    data = {};
                    self.getData('data/citys.json',data,'click');
                }
                //self.calendar && self.calendar.destroy();
            });
            //点击search-date
            $document.on('click','.search-date',function (e) {
                self.targetInput = $(e.target).parent('.search-date');
                self.target = $(e.target);
            });
            //drop中选择城市
            $document.on('mousedown','.drop-city',function (e) {
                console.log('.drop-city mousedown')
                //e.stopPropagation();
                var value = $(this).html();


                //填写在input内,判断是suggestion还是complete???
                var input = self.targetInput.find('input');
                input.val(value);

                //判断是在哪个tab下，初始化字母分组
                if(self.targetInput.parent().hasClass('search-contents-combo')){
                    self.tabSwitchInit('.search-contents-combo .letter-tabs li','.search-contents-combo .letter-city-contents li');
                }else if(self.targetInput.parent().hasClass('search-contents-flight')){
                    self.tabSwitchInit('.search-contents-flight .letter-tabs li','.search-contents-flight .letter-city-contents li');
                }

                self.suggestionBox.hide();
                self.completeBox.hide();
                self.target = $(e.target);
            });
            //input输入
            $document.on('input','.section-input input',function (e) {
                self.targetInput = $(e.target).parent('.section-input');
                if($(this).parent('.section-input').hasClass('search-date')||$(this).parent('.section-input').hasClass('search-city')){
                    self.getPosition();
                    //判断是否为空
                    if ($(this).val()===''){
                        self.getData('data/citys.json',{},'click');
                    }else {
                        self.getData('data/citys.json',{},'input');
                    }
                }
            });
            //input on blur
            $document.on('blur','.section-input input',function (e) {
                console.log('blur');
                //过滤suggestion内字母切换
                if(!self.target.parent().hasClass('letter-tabs')){
                    self.suggestionBox.hide();
                    if(self.target.parent().hasClass('search-contents-combo')){
                        self.tabSwitchInit('.search-contents-combo .letter-tabs li','.search-contents-combo .letter-city-contents li');
                    }else if(self.target.parent().hasClass('search-contents-flight')){
                        self.tabSwitchInit('.search-contents-flight .letter-tabs li','.search-contents-flight .letter-city-contents li');
                    }
                }
                //self.target = $(e.target).parent('.section-input');
                //过滤输入框，待优化
                if(!$(this).parent('.section-input').hasClass('search-date')&&!$(this).parent('.section-input').hasClass('search-city')&&!$(this).hasClass('search-contents-select')){
                    var value = parseInt($(this).val())||0;
                    value = value>=0?value:-value;
                    self.numCalc(0,value)
                }
                //下拉菜单旋转箭头
                if($(this).hasClass('search-contents-select')){
                    $(this).siblings('b').removeClass('active');
                }
                //过滤suggestion中的点击

                self.completeBox.hide();
                self.selectBox.hide();
            });
            //点击加数量
            $document.on('click','.num-add',function () {
                self.targetInput = $(this).parent('.section-input');
                self.numCalc(1)
            });
            //点击减数量
            $document.on('click','.num-minus',function () {
                self.targetInput = $(this).parent('.section-input');
                self.numCalc(-1)
            });
            //机票单程
            $document.on('click','.flight-single',function () {
                $(this).addClass('current').next().removeClass('current');
                $('.flight-date-return').removeClass('search-cascading').addClass('disabled');
            });
            //下拉框点击
            $document.on('click','.search-contents-select',function (e) {
                self.target = $(e.target);
                self.showSelectbox();
            });
            //下拉框内容确定
            $document.on('mousedown','.search-contents-selections li',function () {
                console.log('selections mousedown');
                $(this).parent().siblings('b').removeClass('active');
                $(this).parent().parent('.section-input').find('.search-contents-select').val($(this).html());
            });
            //机票返程
            $document.on('click','.flight-double',function () {
                $(this).addClass('current').siblings('.flight-single').removeClass('current');
                $('.flight-date-return').addClass('search-cascading').removeClass('disabled');
            });
            //点击提交
            $document.on('click','.search-btn',function () {
                //表单验证

                //setCookie

                //跳转页面

            })
        },
        numCalc: function (move,inputValue) {
            var inputBox = this.targetInput.find('input');
            var max = inputBox.data('max');
            var min = inputBox.data('min');
            var btnAdd = this.targetInput.find('.num-add');
            var btnMinus = this.targetInput.find('.num-minus');
            var oldValue = parseInt(inputBox.val());
            var newValue = inputValue === undefined?oldValue+move:inputValue;

            //判断输入还是加减

            //判断最大最小值
            if(newValue>=max) {
                newValue = max;
                btnAdd.addClass('disabled');
                btnMinus.removeClass('disabled');
            }else if(newValue<=min) {
                newValue = min;
                btnMinus.addClass('disabled');
                btnAdd.removeClass('disabled');
            }else {
                btnMinus.removeClass('disabled');
                btnAdd.removeClass('disabled');
            }

            //判断不同的规则
            if(this.targetInput.hasClass('combo-days')){
                inputBox.val(newValue+'天');
                this.freshInfo()
            }else {
                inputBox.val(newValue)
            }

        },
        showSelectbox: function () {
            this.target.siblings('b').addClass('active');
            this.target.siblings('.search-contents-selections').show();
        },
        freshInfo: function () {
            var startDateStr = $('.combo-date').find('input').val();
            var startDate = new Date(startDateStr);
            var startTime = startDate.getTime();
            var period = parseInt($('.combo-days input').val())*86400000;
            var returnTime = new Date(startTime+period);
            var returnDate = returnTime.toLocaleDateString().substring(5).replace(/\//,'-');
            $('.combo-days .search-contents-info').html(returnDate+'返回')
        },
        getData: function (url,data,type) {
            var self = this;
            if(type === 'click'){
                $.ajax({
                    url:url,
                    data: data,
                    success: function (res) {
                        self.renderData(res,'suggestion')
                    },
                    error: function (error) {
                        console.log('error',error)
                    }
                });
                self.suggestionBox.show();
                self.completeBox.hide();
            }else {
                //input 搜索
                $.ajax({
                    url:url,
                    data: data,
                    success: function (res) {
                        self.renderData(res,'complete')
                    },
                    error: function (error) {
                        console.log('error',error)
                    }
                });
            }
        },
        renderData: function (res,type) {
            //根据target判断如何渲染数据
            if(type === 'suggestion'){
                var hotCitys = res.hot;
                var allCitys = res.all;
                this.suggestionBox.find('.city-hot').empty();
                for(var i in hotCitys){
                    var li = $('<li class="drop-city"></li>');
                    li.html(hotCitys[i]);
                    this.suggestionBox.find('.city-hot').append(li)
                }
                var dts = $('.letter-city-contents').find('dt');
                dts.siblings('dd').remove();
                dts.each(function () {
                    var letter = $(this).html().toLowerCase();
                    var dl = $(this).parent('dl');
                    for(var j in allCitys[letter]){
                        var dd = $('<dd class="drop-city"></dd>');
                        dd.html(allCitys[letter][j]);
                        dl.append(dd);
                    }
                });
                this.suggestionFinished = true;
                this.suggestionBox.show();
            }else if(type === 'complete'){
                //input事件
                //清除当前内容
                this.completeBox.empty();
                var resCitys = res.hot;
                for(var i in resCitys){
                    var li = $('<li class="drop-city"></li>');
                    li.html(resCitys[i]);
                    this.completeBox.append(li)
                }
                this.completeBox.show();
            }else {
                console.log('search renderData error!')
            }
        },
        tabSwitch: function (tabs, details) {
            var self = this;
            //添加默认样式
            this.tabSwitchInit(tabs, details);
            //点击切换
            $(tabs).mousedown(function (e) {
                self.target = $(e.target);
                $(this).addClass("current").siblings(tabs).removeClass("current");
                $(details).eq($(this).index()).show().siblings(details).hide();
            })
        },
        tabSwitchInit: function (tabs, details) {
            $(tabs).eq(0).addClass("current").siblings(tabs).removeClass("current");
            $(details).eq(0).show().siblings(details).hide();
        },
        setCookie: function (info) {

        }
    };

    /**
     * @param
     * tabs tabs对应的jq选择器
     * details 相应tabs点击的内容容器jq选择器
     */
    function tabSwitch(tabs, details,shouldInitSearch) {
        shouldInitSearch = shouldInitSearch||false;
        //添加默认样式
        this.init = function () {
            $(tabs).eq(0).addClass("current").siblings(tabs).removeClass("current");
            $(details).eq(0).show().siblings(details).hide();
            shouldInitSearch && search.init();
        };
        this.init();
        //点击切换
        $(tabs).mousedown(function () {
            $(this).addClass("current").siblings(tabs).removeClass("current");
            $(details).eq($(this).index()).show().siblings(details).hide();
        })
    }

    new tabSwitch('.search-tabs>li','.search-contents>li',true)
});