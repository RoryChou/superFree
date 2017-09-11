/**
 * Created by rory on 2017/5/31.
 */
$(function () {
    var $document = $(document);
    var searchFlag = false;

    //搜索条吸顶
    searchBar();

    /*selectbox区域*/
    var $search_sort = $('.search_sort');

    //单选
    $search_sort.on('click','.navListSpan a',function () {
        var $This = $(this),
            $buxian = $This.parents('.search_theme_list').find('dt a'),
            $selectLen;

        if ( $This.hasClass('select') ) {
            $This.removeClass('select');
            $selectLen = $This.parents('dd').find('.select').length;
            $selectLen == 0 && $buxian.addClass('select');
        } else {
            $This.addClass('select');
            $buxian.removeClass('select');
        }

    });

    //不限
    $search_sort.on('click','.search_theme_list dt a',function () {
        var $This = $(this),
            $allA = $This.parent().parent().find('a');

        $allA.removeClass('select');
        $This.addClass('select');
    });

    //展开更多
    $search_sort.on('click','.js_moreOpt_btn',function () {
        var $This = $(this),
            $search_theme_list = $This.prev('.search_theme_list'),
            $arrow = $This.children('.arrow');

        if ( $search_theme_list.hasClass('search_more') ) {
            $search_theme_list.removeClass('search_more');

            $This.html($This.html().replace('收起<i class="arrow_up"></i>','更多<i class="arrow"></i>'));
            $arrow.addClass();
        } else {
            $search_theme_list.addClass('search_more');
            $This.html($This.html().replace('更多<i class="arrow"></i>','收起<i class="arrow_up"></i>'));
        }
    });

    /*selectbox区域 END*/

    //搜索
    var search = {
        target:null,
        targetSection:null,
        container:$('.main_search:visible'),
        currentLi:null,
        currentLiName:null,
        suggestionBox: null,
        keywordsBox: $('.drop-suggestion-keywords'),
        suggestionBoxHotel: null,
        selectBoxs: $('.search-contents-selections'),
        searchBtn: $('.search-btn-words'),
        flightReturn: $('.flight-date-return'),
        calendar:null,
        calendarFlightReturn:null,
        calendarHotel:null,
        selectFlag:false,
        localCity:'',
        passCombo: true,
        passFlight: true,
        passHotel: true,
        passTicket: true,
        selectIndex: 0,
        hotelDays: 4,
        oneDayTime: 86400000,
        errorArr:[],
        completeBox: $('.drop-complete'),
        init: function () {
            this.calendarInit();
            this.refresh();
            this.bindEvent();
        },
        refresh: function () {
            this.currentLi = this.container;
            this.getDefaultInfo();
            this.closePop();
            //初始化tabSwitch
            this.tabSwitch(this.container.find('.letter-tabs li'),this.container.find('.letter-city-contents li'));

            //去除所有error
            $('.section-input').removeClass('error');
            $('.error-box').hide();

            this.suggestionBox = this.currentLi.find('.drop-suggestion-citys');
            //this.suggestionBox = $('.drop-suggestion-citys');

            if(this.currentLi.hasClass('search-contents-combo')){
                this.currentLiName = 'combo';
                //修改btn内容
                this.searchBtn.html('搜索自由行套餐')
                //修改completeBox的尺寸
                /*this.completeBox.css({
                 width: 285
                 });*/
                //this.errorArr = ['combo-from','combo-to','combo-persons-adult','combo-persons-children'].reverse();
            }
            if(this.currentLi.hasClass('search-contents-flight')){
                this.currentLiName = 'flight';
                //修改btn内容
                //this.searchBtn.html('开始搜索')
                //修改completeBox的尺寸
                /*this.completeBox.css({
                 width: 255
                 })*/
            }
            if(this.currentLi.hasClass('search-contents-hotel')){
                this.currentLiName = 'hotel';
                this.suggestionBoxHotel = this.currentLi.find('.drop-suggestion-keywords');
                //修改btn内容
                //this.searchBtn.html('开始搜索')
                //修改completeBox的尺寸
                /*this.completeBox.css({
                 width: 418
                 })*/
            }
            if(this.currentLi.hasClass('search-contents-ticket')){
                this.currentLiName = 'ticket';
                //修改btn内容
                //this.searchBtn.html('开始搜索')
                //修改completeBox的尺寸
                /*this.completeBox.css({
                 width: 585
                 })*/
            }
        },
        closePop: function () {
            $('.drop-suggestion-citys').hide();
            this.keywordsBox.hide();
            this.completeBox.hide();
        },
        getDefaultInfo:function () {
            //获取当前页游玩信息
            var defaultBox = this.currentLi.find('.default-box'),
                changeBox = this.currentLi.find('.change-box');

            var cityFrom = defaultBox.find('.city-from-str').html(),
                cityTo = defaultBox.find('.city-to-str').html(),
                dateFrom = this.dateNow(defaultBox.find('.date-from-str').html()),
                dateTo = this.dateNow(defaultBox.find('.date-to-str').html()),
                days = defaultBox.find('.hotel-days').html(),
                adultNum = defaultBox.find('.adult-num').html(),
                kidNum = defaultBox.find('.kid-num').html();

            this.hotelDays = days;

            changeBox.find('.input-city-from').val(cityFrom);
            changeBox.find('.input-city-to').val(cityTo);
            changeBox.find('.input-date-from').val(dateFrom);
            changeBox.find('.input-date-to').val(dateTo);
            changeBox.find('.input-days').val(days+'天');
            changeBox.find('.combo-persons-adult .search-contents-select').val(adultNum);
            changeBox.find('.combo-persons-children .search-contents-select').val(kidNum);

            //刷新weekday
            this.getWeekday();

            //判断机票单程返程
            if($('.search-contents-flight .flight-from').next().hasClass('icon-flight-double')){
                this.fillInputFlight();
            }else {
                this.fillInputFlight('single');
            }
        },
        dateNow: function (set,moveDays) {
            if(typeof set === 'string'&& $.browser.msie){
                set = set.replace('-','/');
            }
            var date = set?new Date(set):new Date();
            var move = moveDays?86400000*moveDays:0;
            date = new Date(date.getTime()+move);
            //IE下返回2017年01月01日
            var dateArr = [date.getFullYear(),date.getMonth()+1,date.getDate()];
            //+0
            dateArr[1] = dateArr[1]<10?'0'+dateArr[1]:dateArr[1];
            dateArr[2] = dateArr[2]<10?'0'+dateArr[2]:dateArr[2];
            return dateArr.join('-');
        },
        dateTime: function (dateStr) {
            if(typeof dateStr === 'string'&& $.browser.msie){
                dateStr = dateStr.replace('-','/');
            }
            var date = dateStr?new Date(dateStr):new Date();
            date = date.getTime();
            return date;
        },
        getPosition: function () {
            //获取container的位置
            var wrapper = this.container.find('.search-bar-wrapper');
            var dropT = this.targetSection.offset().top-wrapper.offset().top+this.targetSection.height();
            var dropL = this.targetSection.offset().left-wrapper.offset().left;
            this.suggestionBox.css({
                top: dropT+3,
                left: dropL
            });
            this.keywordsBox.css({
                top: dropT+3,
                left: dropL
            });
            this.completeBox.css({
                top: dropT+3,
                left: dropL
            });
        },
        getWeekday: function () {
            var infos = $('.search-date .search-contents-info');
            var week = ['周日','周一','周二','周三','周四','周五','周六']
            infos.each(function () {
                var $this = $(this);
                var $date = $this.siblings('input').val();
                if(typeof $date === 'string' && $.browser.msie){
                    $date = $date.replace('-','/');
                }
                var dateObj = new Date($date);
                var weekDay = week[dateObj.getDay()];
                $this.html(weekDay);
            });
            this.freshInfo();
        },
        calendarInit: function () {
            var self = this;
            //初始化通用日历
            this.calendar = lv.calendar({
                // date: self.dateNow(),
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
                        self.targetSection.find('input').val(i)
                        self.getWeekday();
                    }
                }
            });
            //机票日历
            this.calendarFresh();
            //初始化连级日历-hotel
            this.calendarHotel = lv.calendar({
                autoRender: false,
                trigger: ".search-cascading-hotel input",
                triggerEvent: "click",
                bimonthly: true,
                //定位偏移
                monthNext: 10,
                monthPrev: 10,
                dayPrev: 0,
                template: "small",
                cascading: true,
                cascadingNextAuto: true,
                cascadingOffset: 2,
                showNumberOfDays: true,
                cascadingMax: 20,
                //点击选择日期后的回调函数 默认返回值: calendar对象
                selectDateCallback: function () {
                    self.getWeekday();
                }
            })
        },
        calendarFresh: function () {
            var self = this;
            this.calendarFlightReturn && this.calendarFlightReturn.destroy();
            //判断单程还是返程
            var cascadingNextAutoFlag = true;
            if(this.container.find('.flight-single').hasClass('current')){
                cascadingNextAutoFlag = false;
            }
            //初始化连级日历
            this.calendarFlightReturn = lv.calendar({
                autoRender: false,
                trigger: ".search-cascading input",
                triggerEvent: "click",
                bimonthly: true,
                //定位偏移
                monthNext: 10,
                monthPrev: 10,
                dayPrev: 0,
                template: "small",
                cascading: true,
                cascadingOffset: 1,
                cascadingNextAuto: cascadingNextAutoFlag,
                //点击选择日期后的回调函数 默认返回值: calendar对象
                selectDateCallback: function () {
                    if(self.targetSection.hasClass('flight-date-return')){
                        $('.flight-double').addClass('current').siblings('.flight-single').removeClass('current');
                        self.flightReturn.removeClass('disabled');
                    }
                    self.getWeekday();
                }
            });
        },
        bindEvent: function () {
            var self = this;
            //点击search-city
            $document.on('click','.search-city',function (e) {
                var data = {
                    channel:'zhuzhan',
                    callback:'receive'
                };
                //FIXME MOCK data
                //url = '/seo_api/departureList/getDepartVo.do';//nginx hack
                url = 'data/citys.json';
                var dataType = 'json';
                self.targetSection = $(e.target).parent('.search-city');
                self.target = $(e.target);
                self.getPosition();
                //判断是何种请求
                if(self.targetSection.hasClass('combo-from')) {
                    //data = {};
                    //url = '';
                }
                if(self.targetSection.hasClass('flight-from')) {
                    //data = {};
                    //url = '';
                }
                if(self.targetSection.hasClass('combo-to')) {
                    //data = {};
                    //url = 'data/comboCitys.json';
                }
                if(self.targetSection.hasClass('flight-to')) {
                    //data = {};
                    //url = '';
                }
                if(self.targetSection.hasClass('hotel-to')) {
                    //data = {};
                    //url = '';
                }
                self.getData(url,data,'click',dataType);
            });
            //点击酒店关键字
            $document.on('click','.search-keywords',function (e) {
                self.targetSection = $(e.target).parent('.search-keywords');
                self.target = $(e.target);
                self.getPosition();
                self.getData('http://s.lvmama.com/autocomplete/autoCompleteHotel.do',{
                    type:'REC',
                    districtId:9
                },'click');
            });
            //点击search-date,需要在calendar点击前触发
            $document.on('mousedown','.search-date',function (e) {
                self.targetSection = $(e.target).parent('.search-date');
                self.target = $(e.target);
                self.calendarFresh();
            });
            //drop中选择城市
            $document.on('mousedown','.drop-city',function (e) {
                var value = $(this).html();

                if(self.targetSection.hasClass('hotel-keywords')){
                    if($(this).find('.name').length !== 0){
                        value = $(this).find('.name').html();
                    }
                }

                //填写在input内
                var input = self.targetSection.find('input');
                input.val(value);

                //判断是在哪个tab下，初始化字母分组
                self.tabSwitchInit(self.currentLi.find('.letter-tabs li'),self.currentLi.find('.letter-city-contents li'));
                //清除error
                self.showError('',true);
                self.suggestionBox.hide();
                self.keywordsBox.hide();
                self.completeBox.hide();
                self.target = $(e.target);
            });
            //input输入
            var eventType = $.browser.msie?'keyup':'input';
            $document.on(eventType,'.section-input input',function (e) {
                var which = e.which||e.keyCode;
                self.targetSection = $(e.target).parent('.section-input');
                self.target = $(e.target);
                var value = $(this).val() ;
                //IE7 hack
                if(which !== 40&&which !== 38&&which !== 13){
                    if($(this).parent('.section-input').hasClass('search-city')){
                        self.getPosition();

                        //判断内容
                        if ($(this).val()===""){
                            //内容为空
                            //FIXME mock data
                            //var url = '/seo_api/departureList/getDepartVo.do';//nginx hack
                            var url = '';
                            if($(this).parent().hasClass('combo-to')){
                                url = 'data/comboCitys.json';
                            }else {
                                url = 'data/citys.json';
                            }
                            var data = {
                                channel:'zhuzhan',
                                callback:'receive'
                            };
                            var dataType = 'json';
                            self.getData(url,data,'click',dataType);
                        }else {
                            //正常内容
                            //FIXME 应该使用套餐与机票的接口
                            self.getData('http://s.lvmama.com/autocomplete/autoCompleteNew.do',{
                                type:'TICKET',
                                keyword: value
                            },'input');
                        }
                    }
                    if($(this).parent('.section-input').hasClass('search-keywords')){
                        self.getPosition();

                        //判断内容
                        if ($(this).val()===""){
                            //内容为空
                            self.getData('http://s.lvmama.com/autocomplete/autoCompleteHotel.do',{
                                type:'REC',
                                districtId:9
                            },'click');
                        }else {
                            //正常内容
                            self.getData('http://s.lvmama.com/autocomplete/autoCompleteHotel.do',{
                                type:'HOTEL',
                                keyword: value,
                                districtId:9
                            },'input');
                        }
                    }
                    if($(this).parent('.section-input').hasClass('ticket-keywords')){
                        self.getPosition();
                        self.getData('http://s.lvmama.com/autocomplete/autoCompleteNew.do',{
                            type:'TICKET',
                            keyword: value
                        },'input');

                    }
                }
            });
            //focus
            $document.on('focus','.combo-days input',function (e) {
                self.targetSection = $(e.target).parent('.section-input');
                self.target = $(e.target);
                var value = $(this).val() ;
                $(this).val(parseInt(value));
                $(this).select();
            });
            //input on blur
            $document.on('blur','.section-input input',function (e) {
                // 过滤letter-tabs点击
                if(!self.target.parent().hasClass('letter-tabs')){
                    self.targetSection = $(e.target).parent('.section-input');
                    self.target = $(e.target);
                    self.suggestionBox.hide();
                    self.tabSwitchInit(self.currentLi.find('.letter-tabs li'),self.currentLi.find('.letter-city-contents li'));
                }

                //过滤输入框，待优化
                if($(this).parent('.section-input').hasClass('combo-days')){
                    var value = parseInt($(this).val())||0;
                    value = value>=0?value:-value;
                    self.numCalc(0,value)
                }
                //下拉菜单旋转箭头
                /*if($(this).hasClass('search-contents-select')){
                 self.selectFlag = false;
                 self.showSelectbox(false);
                 }*/
                self.selectFlag = false;
                self.showSelectbox(false);
                self.completeBox.hide();
                self.keywordsBox.hide();
                //self.selectionsInit(true);
                //self.showSelectbox(self.selectFlag);
            });
            //点击加数量
            $document.on('click','.num-add',function () {
                self.targetSection = $(this).parent('.section-input');
                self.numCalc(1)
            });
            //点击减数量
            $document.on('click','.num-minus',function () {
                self.targetSection = $(this).parent('.section-input');
                self.numCalc(-1)
            });
            //机票单程
            $document.on('click','.flight-single',function () {
                self.fillInputFlight('single')
            });
            //机票返程
            $document.on('click','.flight-double',function () {
                self.fillInputFlight()
            });
            //机票切换出发地与到达
            $document.on('click','.flight-change',function () {
                var fromInput = $('.flight-from input');
                var toInput = $('.flight-to input');
                var start = fromInput.val();
                var to = toInput.val();
                toInput.val(start);
                fromInput.val(to);
                // 处理error
                self.showError('',true,'flight-from');
                self.showError('',true,'flight-to');
                // if(!self.passFlight){
                //     self.formCheck()
                // }
            });
            //下拉框点击
            $document.on('click','.search-contents-select',function (e) {
                self.selectFlag = !self.selectFlag;
                self.targetSection = $(this).parent('.section-input');
                self.target = $(e.target);
                self.showSelectbox(self.selectFlag);
            });
            //下拉框内容确定
            $document.on('mousedown','.search-contents-selections li',function () {
                //$(this).parent().siblings('b').removeClass('active');
                $(this).parent().parent('.section-input').find('.search-contents-select').val($(this).html());
                //self.selectionsInit();
                self.showSelectbox(self.selectFlag);
                //清除error
                self.numCheck();
            });
            //下拉框内容选择
            $document.on('keydown',document,function (e){
                var which = e.which||e.keyCode;
                if(self.selectFlag&&(which === 40||which === 38)){
                    e.preventDefault();
                }
            });
            //键盘选中下拉框
            $document.on('keyup',document,function (e) {
                if(!self.targetSection){
                    return
                }
                var length = 0;
                e.preventDefault();
                var which = e.which||e.keyCode;
                var targetLis = self.targetSection.find('.search-contents-selections li');
                if(self.targetSection.hasClass('combo-persons-adult')){
                    length = 9

                }else if(self.targetSection.hasClass('combo-persons-children')){
                    length = 7
                }else {
                    //return;
                    //获取completeBox
                    targetLis = self.completeBox.find('li');
                    length = targetLis.length;
                }

                //下
                if(which === 40){
                    self.selectIndex++;
                    self.selectIndex = self.selectIndex%length;
                }
                //上
                if(which === 38){
                    self.selectIndex--;
                    self.selectIndex = self.selectIndex===-1?(length-1):self.selectIndex;
                    self.selectIndex = self.selectIndex%length;
                }

                targetLis.eq(self.selectIndex).addClass('current').siblings().removeClass('current');
                //enter
                if(which === 13){
                    if(!self.selectFlag){
                        return
                    }
                    if(self.targetSection.hasClass('hotel-keywords')){
                        self.target.val(targetLis.eq(self.selectIndex).find('.name').html());
                    }else {
                        self.target.val(targetLis.eq(self.selectIndex).html());
                    }
                    self.selectFlag = !self.selectFlag;
                    self.showSelectbox(self.selectFlag);

                    self.numCheck();
                }
            });
            //blur补充条件=>点击suggestion内部tab
            $document.on('mousedown',document,function (e) {
                if(!$(e.target).parent().hasClass('letter-tabs')){
                    self.suggestionBox.hide();
                    self.tabSwitchInit(self.currentLi.find('.letter-tabs li'),self.currentLi.find('.letter-city-contents li'));
                }else {
                    console.log('do nothing')
                }
            });
            //点击提交
            $document.on('click','.search-btn',function () {
                //表单验证
                self.formCheck();
                //TODO setCookie

                //TODO 跳转页面

            });
            //取消更改
            $document.on('click','.search-btn-cancle',function () {
                //返回
                $('.change-box').hide();
                $('.default-box').show();
            })
        },
        numCalc: function (move,inputValue) {
            var inputBox = this.targetSection.find('input');
            var max = inputBox.data('max');
            var min = inputBox.data('min');
            var btnAdd = this.targetSection.find('.num-add');
            var btnMinus = this.targetSection.find('.num-minus');
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
            if(this.targetSection.hasClass('combo-days')){
                inputBox.val(newValue+'天');
                this.freshInfo()
            }else {
                inputBox.val(newValue)
            }

        },
        showSelectbox: function (flag) {
            if(flag){
                this.target.siblings('b').addClass('active');
                this.targetSection.find('.search-contents-selections li').eq(0).addClass('current').siblings().removeClass('current')
                this.target.siblings('.search-contents-selections').show();
            }else {
                this.selectIndex = 0;
                this.target.siblings('b').removeClass('active');
                this.target.siblings('.search-contents-selections').hide();
                this.completeBox.hide();
            }
        },
        freshInfo: function () {
            //刷新combo-days返回日期
            var startDateStr = $('.combo-date').find('input').val();
            var period = parseInt($('.combo-days input').val());
            var returnDate = this.dateNow(startDateStr,(period-1)).substring(5);
            $('.combo-days .search-contents-info').html(returnDate+'返回')
        },
        fillInputFlight: function (type) {
            if(type === 'single'){
                $('.flight-single').addClass('current').siblings('.flight-double').removeClass('current');
                this.flightReturn.addClass('disabled');
            }else {
                // var startTime = $('.flight-date-start').find('input').val();
                $('.flight-double').addClass('current').siblings('.flight-single').removeClass('current');
                this.flightReturn.removeClass('disabled');
                // this.flightReturn.find('input').val(this.dateNow(startTime,this.hotelDays));
            }
            this.getWeekday();
            this.calendarFresh();
        },
        getData: function (url,data,type,dataType) {
            var self = this;
            dataType = dataType?dataType:'jsonp';

            //判断类型
            if(type === 'click'||type === 'reset'){
                if(type === 'reset') {
                    //确定需要reset的className
                    self.showError('',true);
                }
                //FIXME mock
                if(url.match(/\.json/)){
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
                }else {

                    $.ajax({
                        url:url,
                        data: data,
                        dataType: dataType,
                        success: function (res) {
                            self.renderData(res,'suggestion')
                        },
                        error: function (error) {
                            console.log('error',error)
                        }
                    });
                }
                self.completeBox.hide();
            }else {
                //input 搜索
                //FIXME mock
                if(url.match(/\.json/)){
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
                }else {
                    $.ajax({
                        url: url,
                        data: data,
                        dataType: dataType,
                        jsonpCallback: "receive",
                        success: function (res) {
                            //如果没有匹配到结果

                            //如果匹配到结果
                            self.showError('',true);
                            self.renderData(res,'complete');
                        },
                        error: function (error) {
                            console.log('error',error)
                        }
                    })
                }
            }
        },
        showError: function (info,reset,className) {
            var self = this;
            var tipBox;
            if(className === undefined){
                if(this.targetSection.hasClass('combo-from')){
                    className = 'combo-from'
                }
                if(this.targetSection.hasClass('combo-to')){
                    className = 'combo-to'
                }
                if(this.targetSection.hasClass('flight-from')){
                    className = 'flight-from'
                }
                if(this.targetSection.hasClass('flight-to')){
                    className = 'flight-to'
                }
                if(this.targetSection.hasClass('hotel-to')){
                    className = 'hotel-to'
                }
                if(this.targetSection.hasClass('hotel-keywords')){
                    className = 'hotel-keywords';
                }
                if(this.targetSection.hasClass('ticket-keywords')){
                    className = 'ticket-keywords'
                }
            }
            var $className = "."+className;
            //var targetLi = tipContent.find($className);
            reset = reset===undefined?false:reset;
            tipBox = $($className).find('.error-box')
            var tipContent = tipBox.find('p');
            if(reset){
                $($className).removeClass('error');
                tipBox.hide();
            }else {
                $($className).addClass('error');
                tipContent.html(info);
                tipBox.show();
            }
        },
        renderData: function (res,type,error) {
            //根据target判断如何渲染数据
            if(type === 'suggestion'){
                //hotel-keywrods中
                if(this.targetSection.hasClass('hotel-keywords')){
                    var transport = res.traffic;
                    var subway = res.metro;
                    var transportDetails = this.keywordsBox.find('.keywords-transport .keywords-details');
                    var subwayDetails = this.keywordsBox.find('.keywords-subway .keywords-details');
                    transportDetails.empty();
                    subwayDetails.empty();
                    for(var i=0;i< transport.length;i++){
                        var span = $('<span class="drop-city"></span>');
                        span.html(transport[i].searchValue);
                        transportDetails.append(span)
                    }
                    for(var j=0;j < subway.length;j++){
                        var span = $('<span class="drop-city"></span>');
                        span.html(subway[j].searchValue);
                        subwayDetails.append(span)
                    }
                    this.keywordsBox.show();
                }/*else if(this.targetSection.hasClass('combo-to')){
                    var hotCitys = res.hot,
                        hotCitysBox = this.keywordsBox.find('.drop-suggestion-keywords-ul');

                    hotCitysBox.empty();
                    for(var i=0;i< hotCitys.length;i++){
                        var li = $('<li class="drop-city"></li>');
                        li.html(hotCitys[i].districtName);
                        hotCitysBox.append(li)
                    }
                    this.keywordsBox.show();
                }*/else {
                    var hotCitys = res.hot;
                    //flight中没有hotcitys
                    if(this.currentLiName !== 'flight'){
                        this.suggestionBox.find('.city-hot').empty();
                        //判断出发地还是目的地
                        if(this.target.hasClass('input-city-from')){
                            this.suggestionBox.find('.drop-title').html('热门出发地')
                        }
                        if(this.target.hasClass('input-city-to')){
                            this.suggestionBox.find('.drop-title').html('热门目的地')
                        }
                        for(var i=0;i< hotCitys.length;i++){
                            var li = $('<li class="drop-city"></li>');
                            li.html(hotCitys[i].districtName);
                            this.suggestionBox.find('.city-hot').append(li)
                        }
                    }

                    var dts = $('.letter-city-contents').find('dt');
                    dts.siblings('dd').remove();

                    dts.each(function () {
                        var letter = $(this).html().substr(0,1);//IE7 hack
                        var dl = $(this).parent('dl');

                        if(res[letter].length !== 0){
                            for(var j=0;j<res[letter].length;j++){
                                var dd = $('<dd class="drop-city"></dd>');
                                dd.html(res[letter][j].districtName);
                                dl.append(dd);
                            }
                        }else {
                            //如果没有对应的城市（dl），则隐藏
                            dl.hide();
                        }
                    });
                    this.suggestionBox.show();
                }
            }else if(type === 'complete'){
                //input事件
                //隐藏suggestion
                this.suggestionBox.hide();
                this.keywordsBox.hide();
                //清除当前内容
                this.completeBox.empty();
                var matchList = res.matchList;
                //FIXME hack
                if(matchList && matchList.length === 0){
                    //TODO 暂不处理不匹配情况
                    this.completeBox.hide();
                    //this.completeBox.addClass('error');
                    //this.completeBox.html('');
                }else {
                    this.completeBox.removeClass('error');

                    //酒店渲染不同
                    if(this.targetSection.hasClass('search-keywords')){
                        for(var i=0;i<matchList.length;i++){
                            var li = $('<li class="drop-city"></li>');
                            var spanName = $('<span class="name"></span>');
                            spanName.html(matchList[i].name);
                            var spanCount = $('<span class="hotelCount"></span>');
                            spanCount.html(matchList[i].hotelCount === 0?'':'约'+ matchList[i].hotelCount +'家酒店');
                            var spanType = $('<span class="type"></span>');
                            spanType.html(matchList[i].type);
                            li.append(spanName);
                            li.append(spanCount);
                            li.append(spanType);
                            this.completeBox.append(li)
                        }
                    }else {
                        //matchList = res.hot;
                        for(var i=0;i<matchList.length;i++){
                            var li = $('<li class="drop-city"></li>');
                            li.html(matchList[i].searchValue);
                            this.completeBox.append(li)
                        }
                    }
                    this.selectFlag = true;
                    this.completeBox.find('li').eq(0).addClass('current');
                    this.completeBox.show();
                }

            }else {
                console.log('search renderData error!')
            }
        },
        tabSwitch: function (tabs, details) {
            var $tabs,$details;
            if(typeof tabs === 'string'){
                $tabs = $(tabs)
            }else if(tabs instanceof jQuery){
                $tabs = tabs
            }else {
                console.log('tabSwitch tabs type error')
            }
            if(typeof details === 'string'){
                $details = $(details)
            }else if(details instanceof jQuery){
                $details = details
            }else {
                console.log('tabSwitch details type error')
            }
            var self = this;
            //添加默认样式
            this.tabSwitchInit($tabs, $details);
            //点击切换
            $tabs.mousedown(function (e) {
                self.target = $(e.target);
                $(this).addClass("current").siblings().removeClass("current");//舍弃了siblings()的选择器筛选
                $details.eq($(this).index()).show().siblings().hide();
            })
        },
        tabSwitchInit: function ($tabs, $details) {
            $tabs.eq(0).addClass("current").siblings().removeClass("current");
            $details.eq(0).show().siblings().hide();
        },
        formCheck: function () {
            //清除errorbox
            this.container.find('.tip-content').empty();
            this.currentLi.find('.nova-tip-form').hide();
            //逐个判断(empty/notfound/num-error)
            if(this.currentLiName === 'combo'){
                this.passCombo = true;
                if($('.combo-from input').val()===''){
                    this.showError('出发地不能为空',false,'combo-from')
                    this.passCombo = false;
                }
                if($('.combo-to input').val()===''){
                    this.showError('目的地不能为空',false,'combo-to')
                    this.passCombo = false;
                }
                //判断出发地与目的地是否相同
                if(this.passCombo){
                    if($('.combo-from input').val() === $('.combo-to input').val()){
                        this.showError('出发地与目的地不能相同',false,'combo-to')
                        this.passCombo = false;
                    }
                }
                //判断人数
                this.numCheck();

                if(this.passCombo){
                    alert('combo pass!')
                }
            }
            if(this.currentLiName === 'flight'){
                this.passFlight = true;
                if($('.flight-from input').val()===''){
                    this.showError('出发地不能为空',false,'flight-from')
                    this.passFlight = false;
                }
                if($('.flight-to input').val()===''){
                    this.showError('目的地不能为空',false,'flight-to')
                    this.passFlight = false;
                }
                //判断出发地与目的地是否相同
                if(this.passFlight){
                    if($('.flight-from input').val() === $('.flight-to input').val()){
                        this.showError('出发地与目的地不能相同',false,'flight-to')
                        this.passFlight = false;
                    }
                }
                if(this.passFlight){
                    alert('flight pass!')
                }
            }
            if(this.currentLiName === 'hotel'){
                this.passHotel = true;
                if($('.hotel-to input').val()===''){
                    this.showError('目的地不能为空',false,'hotel-to')
                    this.passHotel = false;
                }
                if(this.passHotel){
                    alert('hotel pass!')
                }
            }
            if(this.currentLiName === 'ticket'){
                this.passTicket = true;
                if($('.ticket-keywords input').val()===''){
                    this.showError('关键字不能为空',false,'ticket-keywords')
                    this.passTicket = false;
                }
                if(this.passTicket){
                    alert('ticket pass!')
                }
            }
        },
        numCheck: function () {
            var adultNum = parseInt($('.combo-persons-adult input').val());
            var kidsNum = parseInt($('.combo-persons-children input').val());
            //判断人数
            if(adultNum+kidsNum>9){
                this.showError('总人数不能超过9人哦',false,'combo-persons-adult');
                this.passCombo = false;
            }else {
                this.showError('',true,'combo-persons-adult');
            }
            if(kidsNum-adultNum*2>0){
                this.showError('儿童数最多为'+ adultNum*2 +'人哦',false,'combo-persons-children');
                this.passCombo = false;
            }else {
                this.showError('',true,'combo-persons-children');
            }
        },
        setCookie: function (info) {

        }
    };

    //更改行程
    $document.on('click','.btn-change',function () {
        $('.default-box').hide();
        if(!searchFlag) {
            search.init();
        }else {
            search.refresh();
        }
        searchFlag = true;
        $('.change-box').show();
        //判断如果已经出现吸顶，则点击更换套餐滑动到ticket_search
        if($('.main_search').hasClass('fix-top')){
            $("html,body").animate({
                scrollTop:$(".ticket_search").offset().top
            },500,'swing')
        }
    });

    //酒店间数选择
    $document.on('click','.select-num',function () {
        $(this).siblings('.select-num-selections').show();
    });
    $document.on('blur','.select-num',function () {
        $(this).siblings('.select-num-selections').hide();
    });
    $document.on('mousedown','.select-num-selections li',function () {
        $(this).parent().siblings('input').val($(this).html());
        $(this).parent().siblings('input').trigger('input');
    });

    // 切换排序
    $document.on("click", ".rank_box li", function(){
        var $this = $(this);
        var title = $this.attr("title");
        if($this.hasClass('active') && !$this.hasClass('tl-overall')){
            if($this.hasClass("tl-col-down")){
                $this.attr("title", title.replace("从晚到早", "从早到晚").replace("从高到低", "从低到高").replace("从长到短", "从短到长"));
                $this.removeClass("tl-col-down");
            } else {
                $this.attr("title", title.replace("从早到晚", "从晚到早").replace("从低到高", "从高到低").replace("从短到长", "从长到短"));
                $this.addClass("tl-col-down");
            }
        }
        $this.addClass('active').siblings().removeClass('active');
        //清除自定义过滤
        if($this.find('.search-filter-price-new').length === 0){
            $('.search-filter-price-new').find('input').val('').removeClass("input-error");
            $(".price-tip").removeClass("price-tip-error")
        }
    });

    //IE placeholder hack
    if(!placeholderSupport()){   // 判断浏览器是否支持 placeholder
        $('[placeholder]').focus(function() {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function() {
            var input = $(this);
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur();
    };
    function placeholderSupport() {
        return 'placeholder' in document.createElement('input');
    }

    //加入购物车
    var success = $('.cart-success');
    var fail = $('.cart-fail');
    $document.on('click','.btn-add-cart',function () {
        //TODO
        $.ajax({
            url: 'data/cart.json',
            data: {

            },
            dataType: 'json',
            //jsonpCallback: "receive",
            success: function (res) {
                //TODO 弹出提示框,成功
                nova.dialog({
                    showClose: false,  //是否显示关闭按钮
                    button: null,  //按钮组
                    fixed: true,  //是否position:fixed
                    masked: true,  //是否有遮罩层
                    drag: false,  //是否可以拖拽

                    topFixed: false,  //是否弹窗顶部与窗口顶部保持固定尺寸
                    topOffset: 60,  //弹窗顶部与窗口顶部的距离

                    initHeight: "300px",  //iframe高度

                    content: success,  //内容
                    contentClone: true,  //是否克隆content内容
                    title: null,  //标题

                    time: 1500,  //定时关闭 单位毫秒(ms)

                    width: "420",  //宽度
                    height: "150",  //高度

                    wrapClass: "",  //弹窗class
                    maskClass: "nova-overlay",  //遮罩层class

                    zIndex: 100  //z-index
                });
                //TODO 改变购物车数量
                var proNum = res.proNum;
                $('.pro-num').html(proNum)
            },
            error: function (error) {
                //弹出提示框,失败
                nova.dialog({
                    showClose: false,  //是否显示关闭按钮
                    button: null,  //按钮组
                    fixed: true,  //是否position:fixed
                    masked: true,  //是否有遮罩层
                    drag: false,  //是否可以拖拽

                    topFixed: false,  //是否弹窗顶部与窗口顶部保持固定尺寸
                    topOffset: 60,  //弹窗顶部与窗口顶部的距离

                    initHeight: "300px",  //iframe高度

                    content: fail,  //内容
                    contentClone: true,  //是否克隆content内容
                    title: null,  //标题

                    time: 1500,  //定时关闭 单位毫秒(ms)

                    width: "420",  //宽度
                    height: "150",  //高度

                    wrapClass: "",  //弹窗class
                    maskClass: "nova-overlay",  //遮罩层class

                    zIndex: 100  //z-index
                });
            }
        });
    })

    // 搜索条固定
    function searchBar() {
        var searchBar = $('.main_search'),
            searchSortBar = searchBar.next(),
            searchBarTop = searchBar.offset().top;
        $(window).on('searchBarChange',function(){
            searchBarTop = searchBar.offset().top;
        })
        $(window).scroll(function () {
            scrollTop(searchBar,searchBarTop,searchSortBar)
        });
        scrollTop(searchBar,searchBarTop,searchSortBar);
    };
    function scrollTop(searchBar,searchBarTop,searchSortBar) {
        var scrollTop = $(window).scrollTop(),
            searchBarHeight = searchBar.outerHeight();
        if (scrollTop > searchBarTop) {
            if (!searchBar.hasClass('fix-top')) {
                searchBar.addClass('fix-top');
                searchSortBar.css({
                    marginTop: searchBarHeight
                })
            }
        } else {
            if (searchBar.hasClass('fix-top')) {
                searchBar.removeClass('fix-top');
                searchSortBar.css({
                    marginTop: 0
                })
            }
        }
    }


});