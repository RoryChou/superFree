/**
 * Created by rory on 2017/5/18.
 */
$(function () {
    var $document = $(document);

    var search = {
        suggestionFinished:false,
        target:null,
        container:$('.search-container'),
        suggestionBox: $('.drop-suggestion-citys'),
        completeBox: $('.drop-complete'),
        init: function () {
            this.bindEvent();
            //tab切换
            tabSwitch('.letter-tabs li','.letter-city-contents li');
            this.calendatInit();
            this.getDefaultInfo();
        },
        getDefaultInfo:function () {
            //填写默认信息
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
            lv.calendar({
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
                    }
                }
            })
        },
        bindEvent: function () {
            var self = this;
            //点击section
            $document.on('click','.section-input',function (e) {
                e.stopPropagation();
                self.target = $(e.target).hasClass('section-input')?$(e.target):$(e.target).parent('.section-input');
                //判断是否需要drop
                if(!self.target.hasClass('search-city') && !self.target.hasClass('search-date')){
                    return
                }
                self.getPosition();
                //判断是suggestion还是calendar
                if(self.target.hasClass('search-city')){
                    self.getData('data/citys.json',{},'click');
                }else if(self.target.hasClass('search-date')){

                }
            });
            //drop中选择城市
            $document.on('click','.drop-city',function (e) {
                var value = $(this).html();
                //填写在input内,判断是suggestion还是complete
                var input = self.target.hasClass('section-input')?self.target.find('input'):self.target;
                input.val(value);
                self.suggestionBox.hide();
            });
            //drop中切换城市列表
            $document.on('click','.letter-tabs',function (e) {
                e.stopPropagation();
            });
            //input输入
            $document.on('input','.section-input input',function (e) {
                self.target = $(e.target);
                self.getPosition();

                var value = $(this).val();
                self.getData('data/citys.json',{},'input');
            });
            //点击加数量
            $document.on('click','.num-add',function (e) {
                self.target = $(this).parent('.section-input');
                self.numCalc(1)
            });
            //点击减数量
            $document.on('click','.num-minus',function (e) {
                self.target = $(this).parent('.section-input');
                self.numCalc(-1)
            });

            //点击其他位置
            $document.on('click',$document,function () {
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
        numCalc: function (move) {
            var inputBox = this.target.find('input');
            var max = inputBox.data('max');
            var min = inputBox.data('min');
            var oldValue = parseInt(inputBox.val());
            var newValue = oldValue+move;

            //判断最大最小值
            if(newValue>max) {
                newValue = max;
                this.target.find('.num-add').addClass('disabled')
            }else if(newValue<min) {
                newValue = min;
                this.target.find('.num-minus').addClass('disabled')
            }else {
                this.target.find('.num-minus').removeClass('disabled');
                this.target.find('.num-add').removeClass('disabled');
            }

            //判断不同的规则
            if(this.target.hasClass('combo-days')){
                inputBox.val(newValue+'天')
            }else {
                inputBox.val(newValue)
            }

        },
        getData: function (url,data,type) {
            var self = this;
            if(type === 'click'){
                //判断是否已经加载过
                if(!this.suggestionFinished){
                    $.ajax({
                        url:url,
                        data: data,
                        success: function (res) {
                            self.renderData(res)
                        },
                        error: function (error) {
                            console.log('error',error)
                        }
                    });
                }else {
                    self.suggestionBox.show();
                }
            }else {
                //input 搜索
                $.ajax({
                    url:url,
                    data: data,
                    success: function (res) {
                        self.renderData(res)
                    },
                    error: function (error) {
                        console.log('error',error)
                    }
                });
            }
        },
        renderData: function (res) {
            //根据target判断如何渲染数据
            if(this.target.hasClass('search-city')){
                var hotCitys = res.hot;
                var allCitys = res.all;
                for(var i in hotCitys){
                    var li = $('<li class="drop-city"></li>');
                    li.html(hotCitys[i]);
                    this.suggestionBox.find('.city-hot').append(li)
                }
                var dts = $('.letter-city-contents').find('dt');
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
            }else if(this.target.hasClass('search-date')){
                //弹出日历

            }else {
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
            }
        },
        setCookie: function (info) {

        }
    };
    //search.init();

    /**
     * @param
     * tabs tabs对应的jq选择器
     * details 相应tabs点击的内容容器jq选择器
     */
    function tabSwitch(tabs, details,shouldInitSearch) {
        shouldInitSearch = shouldInitSearch||false;
        //添加默认样式
        $(tabs).eq(0).addClass("current").siblings(tabs).removeClass("current");
        $(details).eq(0).show().siblings(details).hide();
        shouldInitSearch && search.init();
        //点击切换
        $(tabs).click(function () {
            $(this).addClass("current").siblings(tabs).removeClass("current");
            console.log($(details).eq($(this).index()));
            $(details).eq($(this).index()).show().siblings(details).hide();
            shouldInitSearch && search.init();
        })
    }

    tabSwitch('.search-tabs>li','.search-contents>li',true)
});