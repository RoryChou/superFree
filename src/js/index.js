/**
 * Created by rory on 2017/5/18.
 */
$(function () {
    var $document = $(document);
    //TODO 优化forin
    var search = {
        target:null,
        targetSection:null,
        container:$('.search-container'),
        currentLi:null,
        currentLiName:null,
        suggestionBox: null,
        keywordsBox: $('.drop-suggestion-keywords'),
        suggestionBoxHotel: null,
        selectBoxs: $('.search-contents-selections'),
        searchBtn: $('.search-btn-words'),
        calendar:null,
        calendarFlightReturn:null,
        calendarHotel:null,
        selectFlag:false,
        localCity:'',
        passCombo: true,
        passFlight: true,
        passHotel: true,
        passTicket: true,
        completeBox: $('.drop-complete'),
        init: function () {
            this.refresh();
            this.bindEvent();
            this.tabSwitch('.search-contents-combo .letter-tabs li','.search-contents-combo .letter-city-contents li');
            this.tabSwitch('.search-contents-flight .letter-tabs li','.search-contents-flight .letter-city-contents li');
            this.tabSwitch('.search-contents-hotel .letter-tabs li','.search-contents-hotel .letter-city-contents li');
            this.getDefaultInfo();
            this.calendarInit();
        },
        refresh: function () {
            console.log('refresh');
            this.closePop();
            this.currentLi = this.container.find('.search-contents li:visible');

            this.suggestionBox = this.currentLi.find('.drop-suggestion-citys');
            //this.suggestionBox = $('.drop-suggestion-citys');

            if(this.currentLi.hasClass('search-contents-combo')){
                this.currentLiName = 'combo';
                //修改btn内容
                this.searchBtn.html('搜索自由行套餐')
                //修改completeBox的尺寸
                this.completeBox.css({
                    width: 285
                })
            }
            if(this.currentLi.hasClass('search-contents-flight')){
                this.currentLiName = 'flight';
                //修改btn内容
                this.searchBtn.html('开始搜索')
                //修改completeBox的尺寸
                this.completeBox.css({
                    width: 255
                })
            }
            if(this.currentLi.hasClass('search-contents-hotel')){
                this.currentLiName = 'hotel';
                this.suggestionBoxHotel = this.currentLi.find('.drop-suggestion-keywords');
                //修改btn内容
                this.searchBtn.html('开始搜索')
                //修改completeBox的尺寸
                this.completeBox.css({
                    width: 418
                })
            }
            if(this.currentLi.hasClass('search-contents-ticket')){
                this.currentLiName = 'ticket';
                //修改btn内容
                this.searchBtn.html('开始搜索')
                //修改completeBox的尺寸
                this.completeBox.css({
                    width: 585
                })
            }
        },
        closePop: function () {
            $('.drop-suggestion-citys').hide();
            this.keywordsBox.hide();
            this.completeBox.hide();
        },
        getDefaultInfo:function () {
            //TODO 获取当前站点
            this.localCity = '上海';
            //this.localCity = $('#currentCity').html();

            var nextDay = this.dateNow(Date.now(),1);
            var nextDayPlus = this.dateNow(Date.now(),2);

            //填写默认信息
            $('.combo-date input').val(nextDay);
            this.getWeekday($('.combo-date'),nextDay);
            $('.flight-date-start input').val(nextDay);
            this.getWeekday($('.flight-date-start'),nextDay);
            $('.hotel-date-start input').val(nextDay);
            this.getWeekday($('.hotel-date-start'),nextDay);
            $('.hotel-date-end input').val(nextDayPlus);
            this.getWeekday($('.hotel-date-end'),nextDayPlus);
            $('.ticket-date-start input').val(nextDay);
            this.getWeekday($('.ticket-date-start'),nextDay);
            $('.flight-date-return').find('input').val('YYYY-MM-DD');
            this.freshInfo();

            //默认出发地为本站站点
            $('.combo-from input').val(this.localCity);
            $('.flight-from input').val(this.localCity);
        },
        dateNow: function (set,moveDays) {
            var date = set?new Date(set):new Date();
            var move = moveDays?86400000*moveDays:0;
            date = new Date(date.getTime()+move);
            var dateArr = date.toLocaleDateString().split('/');
            //+0
            dateArr[1] = dateArr[1]<10?'0'+dateArr[1]:dateArr[1];
            dateArr[2] = dateArr[2]<10?'0'+dateArr[2]:dateArr[2];
            return dateArr.join('-');
        },
        getPosition: function () {
            //获取container的位置
            var dropT = this.targetSection.offset().top-this.container.offset().top+this.targetSection.height();
            var dropL = this.targetSection.offset().left-this.container.offset().left;

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
        getWeekday: function (targetSection,date) {
            //判断星期几并写入info
            var dateObj = new Date(date);
            var week = ['周日','周一','周二','周三','周四','周五','周六']
            var weekDay = week[dateObj.getDay()];
            targetSection.find('.search-contents-info').html(weekDay);
            //刷新返程时间info
            this.freshInfo();
            //刷新返程的日历起始时间
            //$('.flight-date-return input').val(this.dateNow(date,1));
        },
        calendarInit: function () {
            //TODO 多日历是否OK
            var self = this;
            //初始化通用日历
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
                        self.targetSection.find('input').val(i)
                        self.getWeekday(self.targetSection,i);
                    }
                }
            });
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
                cascadingNextAuto: false,
                //点击选择日期后的回调函数 默认返回值: calendar对象
                selectDateCallback: function () {
                    var date = self.targetSection.find('input').val();
                    self.getWeekday(self.targetSection,date);
                }
            });
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
                cascadingNextAuto: false,
                //点击选择日期后的回调函数 默认返回值: calendar对象
                selectDateCallback: function () {
                    var date = self.targetSection.find('input').val();
                    self.getWeekday(self.targetSection,date);
                }
            })
        },
        calendarFresh: function () {
            var self = this;
            this.calendarFlightReturn.destroy();
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
                cascadingNextAuto: false,
                //点击选择日期后的回调函数 默认返回值: calendar对象
                selectDateCallback: function () {
                    var date = self.targetSection.find('input').val();
                    self.getWeekday(self.targetSection,date);
                }
            });
        },
        bindEvent: function () {
            var self = this;
            //点击search-city
            $document.on('click','.search-city',function (e) {
                console.log('search-city clicked')
                var data = {
                    channel:'zhuzhan',
                    callback:'receive'
                };
                //FIXME 默认ticket,需要后期更新
                var url = 'data/citys.json';
                //FIXME nginx hack
                //url = '/seo_api/departureList/getDepartVo.do';
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
                    //url = '';
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
                var data = {};
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
                console.log('search-date clicked')
                self.targetSection = $(e.target).parent('.search-date');
                self.target = $(e.target);
            });
            //drop中选择城市
            $document.on('mousedown','.drop-city',function (e) {
                console.log('.drop-city mousedown',self.targetSection);
                var className = '';
                var value = $(this).html();
                //判断触发位置
                //FIXME 这里可以用attr
                if(self.targetSection.hasClass('combo-from')){
                    className = 'combo-from'
                }
                if(self.targetSection.hasClass('combo-to')){
                    className = 'combo-to'
                }
                if(self.targetSection.hasClass('flight-from')){
                    className = 'flight-from'
                }
                if(self.targetSection.hasClass('flight-to')){
                    className = 'flight-to'
                }
                if(self.targetSection.hasClass('hotel-to')){
                    className = 'hotel-to'
                }
                if(self.targetSection.hasClass('hotel-keywords')){
                    className = 'hotel-keywords';
                    if($(this).find('.name').length !== 0){
                        value = $(this).find('.name').html();
                    }
                }
                if(self.targetSection.hasClass('ticket-keywords')){
                    className = 'ticket-keywords'
                }

                //填写在input内
                var input = self.targetSection.find('input');
                input.val(value);

                //判断是在哪个tab下，初始化字母分组
                self.tabSwitchInit(self.currentLi.find('.letter-tabs li'),self.currentLi.find('.letter-city-contents li'));
                //清除error
                self.showError('',true,className);
                self.suggestionBox.hide();
                self.keywordsBox.hide();
                self.completeBox.hide();
                self.target = $(e.target);
            });
            //input输入
            $document.on('input','.section-input input',function (e) {
                console.log('input')
                self.targetSection = $(e.target).parent('.section-input');
                self.target = $(e.target);
                var value = $(this).val() ;
                if($(this).parent('.section-input').hasClass('search-city')){
                    self.getPosition();
                    //判断触发的具体位置
                    /*if($(e.target).hasClass('input-city-from')){
                        //出发地
                        locale = 'city-from'
                    }else if($(e.target).hasClass('input-city-to')){
                        //目的地
                        locale = 'city-to'
                    }else {
                        console.log('input事件触发位置异常')
                    }*/

                    //判断内容
                    if ($(this).val()===""){
                        //内容为空
                        //FIXME nginx hack
                        //var url = '/seo_api/departureList/getDepartVo.do';
                        var url = 'data/citys.json';
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

                    //判断内容
                    if ($(this).val()===""){
                        //TODO 内容为空
                        //self.getData('data/keywords.json',{},'reset');
                    }else {
                        //正常内容
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
            });
            //input on blur
            $document.on('blur','.section-input input',function (e) {
                console.log('blur');

                //TODO 过滤letter-tabs点击
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
                if($(this).hasClass('search-contents-select')){
                    self.selectFlag = false;
                    self.showSelectbox(false);
                }

                self.completeBox.hide();
                self.keywordsBox.hide();
                self.selectBoxs.hide();
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
                $(this).addClass('current').next().removeClass('current');
                $('.flight-date-return').removeClass('search-cascading').addClass('disabled');
                $('.flight-date-return').find('input').val('YYYY-MM-DD');
            });
            //机票返程
            $document.on('click','.flight-double',function () {
                var startTime = $('.flight-date-start input').val();
                $(this).addClass('current').siblings('.flight-single').removeClass('current');
                $('.flight-date-return').addClass('search-cascading').removeClass('disabled');
                $('.flight-date-return input').val(self.dateNow(startTime,4));
                self.getWeekday($('.flight-date-return'),self.dateNow(startTime,4));
                self.calendarFresh();
            });
            //机票切换出发地与到达
            $document.on('click','.flight-change',function () {
                var fromInput = $('.flight-from input');
                var toInput = $('.flight-to input');
                var start = fromInput.val();
                var to = toInput.val();
                toInput.val(start);
                fromInput.val(to);
                //TODO 处理error

            });
            //下拉框点击
            $document.on('click','.search-contents-select',function (e) {
                console.log('search-contents-select clicked')
                self.selectFlag = !self.selectFlag;
                self.targetSection = $(this).parent('.section-input');
                self.target = $(e.target);
                self.showSelectbox(self.selectFlag);
            });
            //下拉框内容确定
            $document.on('mousedown','.search-contents-selections li',function () {
                $(this).parent().siblings('b').removeClass('active');
                $(this).parent().parent('.section-input').find('.search-contents-select').val($(this).html());
                //清除error
                self.numCheck();
            });
            //blur补充条件=>点击suggestion内部tab
            $document.on('mousedown',document,function () {
                console.log(self.target)
                if(self.target&&self.target.parent().hasClass('letter-tabs')){
                    console.log(1)
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
                //setCookie

                //跳转页面

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
                this.target.siblings('.search-contents-selections').show();
            }else {
                this.target.siblings('b').removeClass('active');
                this.target.siblings('.search-contents-selections').hide();
            }
        },
        freshInfo: function () {
            var startDateStr = $('.combo-date').find('input').val();
            var period = parseInt($('.combo-days input').val());
            var returnDate = this.dateNow(startDateStr,period).substring(5);
            $('.combo-days .search-contents-info').html(returnDate+'返回')
        },
        getData: function (url,data,type,dataType) {
            var self = this;
            var str = '';
            var className = '';
            dataType = dataType?dataType:'jsonp';
            //判断触发位置
            if(self.targetSection.hasClass('combo-from')){
                str = '暂不支持该出发地';
                className = 'combo-from'
            }
            if(self.targetSection.hasClass('combo-to')){
                str = '暂不支持该目的地';
                className = 'combo-to'
            }
            if(self.targetSection.hasClass('flight-from')){
                str = '暂不支持该目的地';
                className = 'flight-from'
            }
            if(self.targetSection.hasClass('flight-to')){
                str = '暂不支持该目的地';
                className = 'flight-to'
            }
            if(self.targetSection.hasClass('hotel-to')){
                str = '暂不支持该目的地';
                className = 'hotel-to'
            }
            if(self.targetSection.hasClass('hotel-keywords')){
                str = '没有匹配的结果';
                className = 'hotel-keywords'
            }
            if(self.targetSection.hasClass('ticket-keywords')){
                str = '没有匹配的结果';
                className = 'ticket-keywords'
            }
            //TODO....

            //判断类型
            if(type === 'click'||type === 'reset'){
                if(type === 'reset') {
                    //确定需要reset的className
                    self.showError('',true,className);
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
                            console.log(res)
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
                            self.showError('',true,className);
                            self.renderData(res,'complete');
                        },
                        error: function (error) {
                            console.log('error',error)
                        }
                    });
                }
            }
        },
        showError: function (info,reset,className) {
            console.log('showError')
            var tipBox = this.currentLi.find('.nova-tip-form');
            var tipContent = tipBox.find('.tip-content');
            var $className = "."+className;
            var targetLi = tipContent.find($className);
            reset = reset===undefined?false:reset;

            if(reset){
                $($className).removeClass('error');
                tipContent.find($className).remove();
                var tipContentLis = tipContent.find('li');
                if(tipContentLis.length === 0){
                    tipBox.hide();
                }else {
                   console.log('still have error')
                }
            }else {
                console.log($className)
                $($className).addClass('error');
                //判断是否已经存在此error
                if(targetLi.length === 0){
                    var li = $('<li></li>');
                    li.addClass(className);
                    li.html(info);
                    tipContent.append(li);
                }else if(targetLi.length === 1){
                    targetLi.html(info);
                }else {
                    console.log('error 数量错误')
                }
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
                    for(var i in transport){
                        var span = $('<span class="drop-city"></span>');
                        span.html(transport[i].searchValue);
                        transportDetails.append(span)
                    }
                    for(var j in subway){
                        var span = $('<span class="drop-city"></span>');
                        span.html(subway[j].searchValue);
                        subwayDetails.append(span)
                    }
                    this.keywordsBox.show();
                }else {
                    var hotCitys = res.hot;
                    //flight中没有hotcitys
                    if(this.currentLiName !== 'flight'){
                        this.suggestionBox.find('.city-hot').empty();
                        for(var i in hotCitys){
                            var li = $('<li class="drop-city"></li>');
                            li.html(hotCitys[i].districtName);
                            this.suggestionBox.find('.city-hot').append(li)
                        }
                    }

                    var dts = $('.letter-city-contents').find('dt');
                    dts.siblings('dd').remove();
                    dts.each(function () {
                        var letter = $(this).html();
                        var dl = $(this).parent('dl');
                        //如果没有对应的城市（dl），则隐藏
                        if(res[letter].length === 0){
                            dl.hide();
                        }else {
                            for(var j in res[letter]){
                                var dd = $('<dd class="drop-city"></dd>');
                                dd.html(res[letter][j].districtName);
                                dl.append(dd);
                            }
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
                console.log(res)
                var matchList = res.matchList;
                //FIXME hack
                if(matchList && matchList.length === 0){
                    //TODO 暂不处理不匹配情况
                    this.completeBox.hide();
                    //this.completeBox.addClass('error');
                    //this.completeBox.html('');
                }else {
                    this.completeBox.removeClass('error');

                    //TODO 酒店渲染不同
                    if(this.targetSection.hasClass('search-keywords')){
                        for(var i in matchList){
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
                        for(var i in matchList){
                            var li = $('<li class="drop-city"></li>');
                            li.html(matchList[i].searchValue);
                            this.completeBox.append(li)
                        }
                    }
                    this.completeBox.show();
                }

            }else {
                console.log('search renderData error!')
            }
        },
        tabSwitch: function (tabs, details) {
            console.log('tabSwitch')
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
                e.stopPropagation();
                self.target = $(e.target);
                console.log(2,self.target)
                $(this).addClass("current").siblings().removeClass("current");//TODO 舍弃了siblings()的选择器筛选
                $details.eq($(this).index()).show().siblings().hide();
            })
        },
        tabSwitchInit: function ($tabs, $details) {
            console.log('tabSwitchInit');
            $tabs.eq(0).addClass("current").siblings().removeClass("current");
            $details.eq(0).show().siblings().hide();
        },
        formCheck: function () {
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
                //判断人数
                this.numCheck();

                if(this.passCombo&&this.currentLi.find('.tip-content').html()===''){
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
                if(this.passFlight&&this.currentLi.find('.tip-content').html()===''){
                    alert('flight pass!')
                }
            }
            if(this.currentLiName === 'hotel'){
                this.passHotel = true;
                //TODO ...
                if(this.passHotel&&this.currentLi.find('.tip-content').html()===''){
                    alert('hotel pass!')
                }
            }
            if(this.currentLiName === 'ticket'){
                //FIXME 主站没有检测
                this.passTicket = true;
                /*if($('.ticket-keywords input').val()===''){
                    this.showError('关键字不能为空',false,'ticket-keywords')
                    this.passFlight = false;
                }*/
                //TODO ...
                if(this.passTicket&&this.currentLi.find('.tip-content').html()===''){
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

    tabSwitch('.search-tabs>li','.search-contents>li',true);

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
        $(tabs).mousedown(function () {
            $(this).addClass("current").siblings(tabs).removeClass("current");
            $(details).eq($(this).index()).show().siblings(details).hide();
            search.refresh();
        })
    }

});