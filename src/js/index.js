/**
 * Created by rory on 2017/5/18.
 */
$(function () {
    var $document = $(document);

    var search = {
        target:null,
        container:$('.search-container'),
        contentsLi:null,
        suggestionBox: null,
        calendar:null,
        tabSwitcher:null,
        startDate:null,
        completeBox: $('.drop-complete'),//当前页面是否唯一？
        init: function () {
            this.suggestionBox = $('.drop-suggestion-citys');
            this.bindEvent();
            this.tabSwitcher = new tabSwitch('.letter-tabs li','.letter-city-contents li');
            this.calendatInit();
            this.getDefaultInfo();
        },
        getDefaultInfo:function () {
            //填写默认信息
            this.startDate = $('.combo-date').find('input').val()||this.dateNow();
        },
        dateNow: function (set) {
            var date = set?new Date(set):new Date();
            return date.toLocaleDateString();
        },
        getPosition: function () {
            //获取container的位置
            var dropT = this.target.offset().top-this.container.offset().top+this.target.height();
            var dropL = this.target.offset().left-this.container.offset().left;
            if(this.target.hasClass('search-city')){
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
        calendatInit: function () {
            var self = this;
            this.calendar = lv.calendar({
                date: "2017-05-19",
                autoRender: false,
                trigger: ".search-date",
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
                        self.target.find('input').val(i)
                        //判断星期几并写入info
                        var date = new Date(i);
                        var week = ['周日','周一','周二','周三','周四','周五','周六']
                        var weekDay = week[date.getDay()];
                        self.target.find('.search-contents-info').html(weekDay);
                        self.startDate = $('.combo-date').find('input').val();
                    }
                }
            })
        },
        bindEvent: function () {
            var self = this;
            //点击search-city
            $document.on('click','.search-city',function (e) {
                console.log('.search-city clicked',$(e.target));
                var data = {};
                e.stopPropagation();
                self.target = $(e.target).hasClass('search-city')?$(e.target):$(e.target).parent('.search-city');
                self.getPosition();
                //判断是何种请求
                if(self.target.hasClass('combo-from')) {
                    data = {};
                    self.getData('data/citys.json',data,'click');
                }
                if(self.target.hasClass('flight-from')) {
                    data = {};
                    self.getData('data/citys.json',data,'click');
                }
                if(self.target.hasClass('combo-to')) {
                    data = {};
                    self.getData('data/citys.json',data,'click');
                }
                if(self.target.hasClass('flight-to')) {
                    data = {};
                    self.getData('data/citys.json',data,'click');
                }

                self.calendar && self.calendar.destroy();
            });
            //点击search-date
            $document.on('click','.search-date',function (e) {
                e.stopPropagation();
                self.target = $(e.target).hasClass('search-date')?$(e.target):$(e.target).parent('.search-date');
                self.getPosition();
                self.suggestionBox.hide();
                self.completeBox.hide();
            });
            //drop中选择城市
            $document.on('click','.drop-city',function (e) {
                e.stopPropagation();
                var value = $(this).html();
                //填写在input内,判断是suggestion还是complete
                var input = self.target.hasClass('section-input')?self.target.find('input'):self.target;
                input.val(value);
                self.suggestionBox.hide();
                self.tabSwitcher.init();
                self.completeBox.hide();
            });
            //drop中切换城市列表
            $document.on('click','.letter-tabs',function (e) {
                e.stopPropagation();
            });
            //input输入
            $document.on('input','.section-input input',function (e) {
                self.target = $(e.target).parent('.section-input');
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
                self.target = $(e.target).parent('.section-input');
                if(!$(this).parent('.section-input').hasClass('search-date')&&!$(this).parent('.section-input').hasClass('search-city')){
                    var value = parseInt($(this).val())||0;
                    value = value>=0?value:-value;
                    self.numCalc(0,value)
                }
            });
            //点击加数量
            $document.on('click','.num-add',function () {
                self.target = $(this).parent('.section-input');
                self.numCalc(1)
            });
            //点击减数量
            $document.on('click','.num-minus',function () {
                self.target = $(this).parent('.section-input');
                self.numCalc(-1)
            });
            //点击其他位置
            $document.on('click',$document,function () {
                console.log('hide')
                self.suggestionBox.hide();
                self.completeBox.hide();
            });
            //点击提交
            $document.on('click','.search-btn',function () {
                //表单验证

                //setCookie

                //跳转页面

            })
        },
        numCalc: function (move,inputValue) {
            var inputBox = this.target.find('input');
            var max = inputBox.data('max');
            var min = inputBox.data('min');
            var btnAdd = this.target.find('.num-add');
            var btnMinus = this.target.find('.num-minus');
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
            if(this.target.hasClass('combo-days')){
                inputBox.val(newValue+'天')
                this.target.find('.search-contents-info').html(this.startDate.substring(5)+'返回');
            }else {
                inputBox.val(newValue)
            }

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
        $(tabs).click(function () {
            $(this).addClass("current").siblings(tabs).removeClass("current");
            $(details).eq($(this).index()).show().siblings(details).hide();
        })
    }

    new tabSwitch('.search-tabs>li','.search-contents>li',true)
});