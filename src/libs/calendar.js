/**
 * Created by rory on 2017/5/22.
 */
/*!
 * calendar.js
 * 2016-03-15
 * 2016-06-12
 * Sheng Jiang
 * 1.0.0.0
 */

(function (window, $, lv, nova) {

    "use strict";

    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.io/#x15.4.4.18
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback, thisArg) {
            var T, k;
            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== "function") {
                throw new TypeError(callback + ' is not a function');
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }

    if (lv.calendar) {
        return false;
    }

    var $document = $(document);  //文档
    var $body = $("body");  //body

    var today = new Date();  //今天
    var fiveMinutes = 1000 * 60 * 5;

    //每月天数
    var monthSize = {
        0: 31,
        1: 28,
        2: 31,
        3: 30,
        4: 31,
        5: 30,
        6: 31,
        7: 31,
        8: 30,
        9: 31,
        10: 30,
        11: 31
    };

    //获取北京时间1970年1月1日 00:00:00.0000
    function getEpochOfCST() {
        var epoch = new Date(0);
        epoch.setHours(0);
        return epoch;
    }

    function padNumber(num, digits, trim) {
        var neg = "";
        if (num < 0) {
            neg = "-";
            num = -num;
        }
        num = "" + num;
        while (num.length < digits) {
            num = "0" + num;
        }
        if (trim) {
            num = num.substr(num.length - digits);
        }
        return neg + num;
    }

    function dateGetter(name, size, offset, trim) {
        return function (date) {
            var value = date["get" + name]();
            if (offset > 0 || value > -offset) {
                value += offset;
            }
            if (value === 0 && offset === -12) {
                value = 12;
            }
            return padNumber(value, size, trim);
        }
    }

    function dateSetter(name, size, offset, trim) {
        return function (date, value) {

            if (offset > 0 || value > -offset) {
                value -= offset;
            }
            if (value === 0 && offset === -12) {
                value = 12;
            }

            date["set" + name](value);
        }
    }

    var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/;
    var DATE_FORMATS = {
        yyyy: ["FullYear", 4],
        yy: ["FullYear", 2, 0],
        MM: ["Month", 2, 1],
        M: ["Month", 1, 1],
        dd: ["Date", 2],
        d: ["Date", 1],
        HH: ["Hours", 2],
        H: ["Hours", 1],
        hh: ["Hours", 2, -12],
        h: ["Hours", 1, -12],
        mm: ["Minutes", 2],
        m: ["Minutes", 1],
        ss: ["Seconds", 2],
        s: ["Seconds", 1],
        E: ["Day", 1]
    };

    /**
     * 工厂类
     * @constructor
     */
    function Factory(options) {
        options = $.extend({}, Factory.defaults, options);
        return new Calendar(options);
    }

    //默认值
    Factory.defaults = {
        priceTipText: "因最低价实时变化，请以实际价格为准",
        showPriceTip: true,
        sectionSelect: false,  //单个日历区间选择
        allowMutiSelected: false,  //是否支持多选
        triggerEvent: "click",  //默认点击触发
        date: "",  //初始化定位
        target: "body",  //日历控件加载DOM区域
        //定位偏移
        offsetAmount: {
            top: 0,
            left: 0
        },
        //english week title
        englishWeekTitle: {
            0: 'sun',
            1: 'mon',
            2: 'tue',
            3: 'wed',
            4: 'thu',
            5: 'fri',
            6: 'sat'
        },
        //星期短标题
        weekShortTitle: {
            0: "日",
            1: "一",
            2: "二",
            3: "三",
            4: "四",
            5: "五",
            6: "六"
        },
        //星期标题
        wrapClass: "",
        weekTitle: {
            0: "星期日",
            1: "星期一",
            2: "星期二",
            3: "星期三",
            4: "星期四",
            5: "星期五",
            6: "星期六"
        },
        titleTip: "{{year}}年{{month}}月",
        template: "big",  //模板
        bimonthly: false,  //是否双月显示
        dateFormat: "yyyy-MM-dd",  //日历格式
        monthChangeOffset: 1,  //月份每次翻页页数
        sourceFn: null,
        selectDateCallback: null,  //点击选择日期后的回调函数
        cancelDateCallback: null,  //取消选择日期的回调函数
        completeCallback: null,  //数据加载完成并显示出日历后的回调函数
        clearCallback: null,  //清空回调函数
        okCallback: null,  //确认回调函数
        renderReadonly: true,  //只读触发者是否加载日历控件
        cascading: false,  //是否级联
        cascadingMin: 1,  //级联自动下一个限制
        cascadingOffset: 1,  //级联自动下一个偏移
        cascadingMax: -1,  //级联后续可选天数，-1为不限制
        cascadingNextAuto: true,  //是否自动显示级联下一个日历
        minLimit: null,  //最小限制
        maxLimit: null,  //最大限制
        monthNext: 6,  //可翻页后续月份，-1为不限制
        monthPrev: 0,  //可翻页之前月份，-1为不限制
        dayNext: -1,  //可选后续天数，-1为不限制
        dayPrev: 0,  //可选之前天数，-1为不限制
        dayDisableNext: 0,  //当前之后几天不可选择
        isTodayClick: true,  //当天是否可点击
        numberOfDays: "{{num}}晚",
        division: false,  //上下分月
        showNumberOfDays: false,  //是否显示级联间隔日期
        isBirthday: false,  //是否是生日日历
        hasTime: false,  //是否含时间
        clickDocumentHide: true,  //是点击
        festival: {
            '2016-01-01': {
                name: '元旦',
                vacationName: '元旦'
            },
            '2016-02-07': {
                name: '除夕',
                vacationName: '除夕'
            },
            '2016-02-08': {
                name: '春节',
                vacationName: '春节'
            },
            '2016-02-09': {
                vacationName: '春节假期'
            },
            '2016-02-10': {
                vacationName: '春节假期'
            },
            '2016-02-11': {
                vacationName: '春节假期'
            },
            '2016-02-12': {
                vacationName: '春节假期'
            },
            '2016-02-13': {
                vacationName: '春节假期'
            },
            '2016-04-02': {
                vacationName: '清明节假期'
            },
            '2016-04-03': {
                vacationName: '清明节假期'
            },
            '2016-04-04': {
                name: '清明',
                vacationName: '清明节'
            },
            '2016-04-30': {
                vacationName: '劳动节假期'
            },
            '2016-05-01': {
                name: '劳动',
                vacationName: '劳动节'
            },
            '2016-05-02': {
                vacationName: '劳动节假期'
            },
            '2016-06-09': {
                name: '端午',
                vacationName: '端午节'
            },
            '2016-06-10': {
                vacationName: '端午节假期'
            },
            '2016-06-11': {
                vacationName: '端午节假期'
            },
            '2016-09-15': {
                name: '中秋',
                vacationName: '中秋节假期'
            },
            '2016-09-16': {
                vacationName: '中秋节假期'
            },
            '2016-09-17': {
                vacationName: '中秋节'
            },
            '2016-10-01': {
                name: '国庆',
                vacationName: '国庆节'
            },
            '2016-10-02': {
                vacationName: '国庆节假期'
            },
            '2016-10-03': {
                vacationName: '国庆节假期'
            },
            '2016-10-04': {
                vacationName: '国庆节假期'
            },
            '2016-10-05': {
                vacationName: '国庆节假期'
            },
            '2016-10-06': {
                vacationName: '国庆节假期'
            },
            '2016-10-07': {
                vacationName: '国庆节假期'
            },
            '2016-12-31': {
                vacationName: '元旦假期'
            },
            '2017-01-01': {
                name: '元旦',
                vacationName: '元旦'
            },
            '2017-01-02': {
                vacationName: '元旦假期'
            },
            '2017-01-27': {
                name: '除夕',
                vacationName: '除夕'
            },
            '2017-01-28': {
                name: '春节',
                vacationName: '春节'
            },
            '2017-01-29': {
                vacationName: '春节假期'
            },
            '2017-01-30': {
                vacationName: '春节假期'
            },
            '2017-01-31': {
                vacationName: '春节假期'
            },
            '2017-02-01': {
                vacationName: '春节假期'
            },
            '2017-02-02': {
                vacationName: '春节假期'
            },
            '2017-04-02': {
                vacationName: '清明节假期'
            },
            '2017-04-03': {
                vacationName: '清明节假期'
            },
            '2017-04-04': {
                name: '清明',
                vacationName: '清明节'
            },
            '2017-04-29': {
                vacationName: '劳动节假期'
            },
            '2017-04-30': {
                vacationName: '劳动节假期'
            },
            '2017-05-01': {
                name: '劳动',
                vacationName: '劳动节'
            },
            '2017-05-28': {
                vacationName: '端午节假期'
            },
            '2017-05-29': {
                vacationName: '端午节假期'
            },
            '2017-05-30': {
                name: '端午',
                vacationName: '端午节'
            },
            '2017-10-01': {
                name: '国庆',
                vacationName: '国庆节'
            },
            '2017-10-02': {
                vacationName: '国庆节、中秋节假期'
            },
            '2017-10-03': {
                vacationName: '国庆节、中秋节假期'
            },
            '2017-10-04': {
                name: '中秋',
                vacationName: '中秋节'
            },
            '2017-10-05': {
                vacationName: '国庆节、中秋节假期'
            },
            '2017-10-06': {
                vacationName: '国庆节、中秋节假期'
            },
            '2017-10-07': {
                vacationName: '国庆节、中秋节假期'
            },
            '2017-10-08': {
                vacationName: '国庆节、中秋节假期'
            }
        },
        cascadingEndNotShowStart: false,  //级联第二个日历不显示第一个选中元素,
        weekOffset: 0,
        dayOffset: 0
    };

    /**
     * 日历类
     * @constructor
     */
    function Calendar(options) {
        this.init(options);
    }

    //静态属性方法
    /**
     * 当前
     * @returns {Date} 当前时间
     */
    Calendar.now = function () {
        return new Date();
    };

    /**
     * 数字补零
     * @param number 一位数
     * @returns {string} 补零后的字符串
     */
    Calendar.pad = function (number) {
        var r = String(number);
        if (r.length === 1) {
            r = '0' + r;
        }
        return r;
    };

    /**
     * 是否是同一天
     * @param dateA
     * @param dateB
     * @returns {boolean}
     */
    Calendar.isSameDay = function (dateA, dateB) {
        if (dateA.getFullYear() !== dateB.getFullYear()) {
            return false;
        }
        if (dateA.getMonth() !== dateB.getMonth()) {
            return false;
        }
        if (dateA.getDate() !== dateB.getDate()) {
            return false;
        }
        return true;
    };

    /**
     * 是否是同一月
     * @param dateA
     * @param dateB
     * @returns {boolean}
     */
    Calendar.isSameMonth = function (dateA, dateB) {
        if (dateA.getFullYear() !== dateB.getFullYear()) {
            return false;
        }
        if (dateA.getMonth() !== dateB.getMonth()) {
            return false;
        }
        return true;
    };

    /**
     * 判断闰年
     * 目前使用的格里历闰年规则如下：
     * 1. 公历年份除以400可整除，为闰年。
     * 2. 公历年份除以4可整除但除以100不可整除，为闰年。
     * 3. 公历年份除以4不可整除，为平年。
     * 4. 公历年份除以100可整除但除以400不可整除，为平年
     * @param fullYear 四位数年份
     * @returns {boolean} 是否
     */
    Calendar.isLeapYear = function (fullYear) {
        /**
         * https://en.wikipedia.org/wiki/Leap_year
         * if ((西元年份是400的倍数)或(西元年份是4的倍数但不是100的倍数)): 闰年
         * else : 平年
         */
        if ((fullYear % 400 === 0 ) || ((fullYear % 4 === 0) && (fullYear % 100 !== 0))) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * 日期格式化
     * https://github.com/RubyLouvre/mass-Framework/blob/1.41/avalon.js#L2147
     * E    星期
     * yyyy-MM-dd hh-mm-ss
     * yyyy 四位年      yy 两位年
     * MM   两位月      M  月
     * dd   两位日      d  日
     * HH   两位时(24)  H  时(24)
     * hh   两位时(12)  h  时(12)
     * mm   两位分      m  分
     * ss   两位秒      s  秒
     * @param date
     * @param format 日期格式
     * @returns {string}
     */
    Calendar.dateFormat = function (date, format) {
        var text = "";
        var match;
        var parts = [];
        var fn;
        while (format) {
            match = DATE_FORMATS_SPLIT.exec(format);
            if (match) {
                parts = parts.concat(match.slice(1));
                format = parts.pop();
            } else {
                parts.push(format);
                format = null;
            }
        }
        parts.forEach(function (value) {
            var dateGetterParameter = DATE_FORMATS[value];
            if (dateGetterParameter) {
                text += dateGetter.apply(this, dateGetterParameter)(date)
            } else {
                text += value;
            }
        });
        return text;
    };

    /**
     * 从格式化字符串获取日期时间
     * @param str 已经被格式化的字符串
     * @param format 格式
     * @returns {Date} 日期对象
     */
    Calendar.getDateFromFormattedString = function (str, format) {
        var date = getEpochOfCST();

        var match;
        var parts = [];
        var strParts = [];
        var fn;
        while (format) {
            match = DATE_FORMATS_SPLIT.exec(format);
            if (match) {
                parts = parts.concat(match.slice(1));
                format = parts.pop();
                var matchSize = (match[1].length);
                var leftStr = str.substr(0, matchSize);
                str = str.substr(matchSize);
                strParts.push(leftStr);
            } else {
                parts.push(format);
                strParts.push(str);
            }
        }
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var strPart = strParts[i];
            if (strPart == "") {
                break
            }
            var number = parseInt(strPart, 10);
            var dateSetterParameter = DATE_FORMATS[part];
            if (dateSetterParameter) {
                fn = dateSetter.apply(this, dateSetterParameter);
                fn(date, number);
            }
        }
        return date;
    };

    /**
     * 日期间隔天数
     * @param start 开始日期
     * @param end 结束日期
     * @returns {number} 间隔天数
     */
    Calendar.getDaysBetween = function (start, end) {
        return Math.abs(start - end) / 60 / 60 / 1000 / 24;
    };

    /**
     * 月份的第一天
     * @param date 日期
     * @returns {Date} 第一天日期
     */
    Calendar.getFirstDateInMonth = function (date) {
        return new Date(date.getFullYear, date.getMonth(), 1);
    };

    /**
     * 月份的最后一天
     * @param date 日期
     * @returns {Date} 最后一天日期
     */
    Calendar.getLastDateInMonth = function (date) {
        return new Date(date.getFullYear, date.getMonth() + 1, 0);
    };

    /**
     * 获取每月天数
     * @param month 月份，一月为0
     * @param fullYear [option] 四位数年份，可选
     * @returns number 天数
     */
    Calendar.getDaysInMonth = function (month, fullYear) {
        //如果是闰年2月
        if (month === 1 && fullYear !== undefined && Calendar.isLeapYear(fullYear)) {
            return 29;
        }
        return monthSize[month];
    };

    /**
     * 月偏移
     * @param date 原始日期
     * @param monthOffset 偏移月数，正数向后，负数向前
     * @returns {Date} 新日期
     * @constructor
     */
    Calendar.monthOffset = function (date, monthOffset) {
        var newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + monthOffset);
        return newDate;
    };

    /**
     * 年偏移
     * @param date 原始日期
     * @param yearOffset 偏移年数，正数向后，负数向前
     * @returns {Date} 新日期
     * @constructor
     */
    Calendar.yearOffset = function (date, yearOffset) {
        var newDate = new Date(date);
        newDate.setFullYear(newDate.getFullYear() + yearOffset);
        return newDate;
    };

    /**
     * 日偏移
     * @param date
     * @param dayOffset
     * @returns {Date}
     */
    Calendar.dateOffset = function (date, dayOffset) {
        var newDate = new Date(date);
        newDate.setDate(newDate.getDate() + dayOffset);
        return newDate;
    };

    /**
     * 日历取整
     * @param date
     * @returns {Date}
     */
    Calendar.dateToDay = function (date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    /**
     * 天数转毫秒
     * @param days
     * @returns {number}
     */
    Calendar.dayToMS = function (days) {
        return days * 1000 * 60 * 60 * 24;
    };

    var n = 0;

    //原型属性方法
    Calendar.prototype = {

        //版本号
        version: "1.0.0.0",

        //构造函数
        construction: Calendar,

        //析构函数
        destruction: function () {
            this.unLoadCal();
        },

        initLimit: function () {

            var maxLimit = this.options.maxLimit;
            var minLimit = this.options.minLimit;

            if (maxLimit) {
                this.maxLimitDate = Calendar.getDateFromFormattedString(maxLimit, this.options.dateFormat);
            }
            if (minLimit) {
                this.minLimitDate = Calendar.getDateFromFormattedString(minLimit, this.options.dateFormat);
            }

        },

        //初始化
        init: function (options) {

            //模板
            var template;

            if (options.template == "birthday") {
                this.isBirthday = true;
            }

            if (typeof options.template == "object") {
                template = smallTemplate;
                for (var temp in options.template) {
                    template[temp] = options.template[temp];
                }
            } else {
                switch (options.template) {
                    case "big":
                        //大日历
                        template = bigTemplate;
                        break;
                    case "birthday":
                        template = birthdayTemplate;
                        break;
                    case "small":
                        template = smallTemplate;
                        break;
                    default:
                        template = smallTemplate;
                        break;
                }
            }

            options.template = template;

            //生日日历
            if (options.isBirthday && Factory.defaults.titleTip == options.titleTip) {
                options.titleTip = '<span class="cal-year-select">{{year}}年<i></i></span><span class="cal-month-select">{{month}}月<i></i></span>';
            }

            this.options = options;
            this.defaults = Factory.defaults;
            this.wrap = this.wrap || this.initWrap();
            this.date = new Date();
            this.selected = {};
            this.selectedTime = getEpochOfCST();

            this.cascadingSelected = {
                start: null,
                end: null,
                startTime: getEpochOfCST(),
                endTime: getEpochOfCST()
            };
            this.cascadingIndex = 0;
            this.id = n++;
            this.initLimit();
            this.initNow();
            this.loadCal();
        },

        initNow: function () {
            var dateStr = this.options.date;
            if (typeof dateStr == "string" && dateStr !== "") {
                this.now = Calendar.getDateFromFormattedString(dateStr, this.options.dateFormat);
            } else {
                this.now = new Date()
            }
        },

        /**
         * 初始化日历DOM
         * @returns {*|HTMLElement}
         */
        initWrap: function () {
            var html = $.trim(this.options.template.wrap);
            html = this.replaceWith(html, {
                bimonthly: 'data-bimonthly="' + this.options.bimonthly + '"',
                float: 'data-float="' + !this.options.autoRender + '"'
            });
            return $(html);
        },

        /**
         * 加载日历
         */
        loadCal: function () {
            var options = this.options;
            if (options.autoRender) {  //静态日历
                this.render();
                this.bindEvent();
                $(options.trigger).append(this.wrap)
            } else {  //浮动日历
                $(document).off(options.triggerEvent, options.trigger, this.triggerEventHandler);
                $(document).on(options.triggerEvent, options.trigger, {self: this}, this.triggerEventHandler);
                this.triggerBlur();
            }
        },

        unLoadCal: function () {
            var options = this.options;
            $(document).off(options.triggerEvent, options.trigger, this.triggerEventHandler);
            this.unBindEvent();
        },

        /**
         * 销毁日历
         */
        triggerBlur: function () {
            var self = this;
            $document.on("click", {self: self}, this.destroyHandler);
        },

        destroy: function () {
            this.wrap.remove();
            $(".calhover").remove();
            $(".cal-number-of-days").remove();
        },

        destroyHandler: function (e) {
            var $target = $(e.target);
            var self = e.data.self;
            var $calendar = $target.parents(".ui-calendar");
            var options = self.options;
            if ($calendar.length <= 0 && options.clickDocumentHide == true) {
                self.destroy();
            }
        },

        /**
         * 日历触发者事件绑定
         * @param e
         */
        triggerEventHandler: function (e) {
            var self = e.data.self;
            e.stopPropagation();
            var $this = $(this);
            var date;

            if (self.options.cascading) {

                var start = self.cascadingSelected.start;
                var end = self.cascadingSelected.end;

                var $triggers = $(self.options.trigger);

                var $triggerFirst = $triggers.first();
                var triggerFirstValue = $triggerFirst.val();

                var $triggerLast = $triggers.last();
                var triggerLastValue = $triggerLast.val();


                if (!start) {
                    if (triggerFirstValue) {
                        start = triggerFirstValue;
                        self.cascadingSelected.start = start
                    }
                }

                if (!end) {
                    if (triggerLastValue) {
                        end = triggerLastValue;
                        self.cascadingSelected.end = end
                    }
                }

                var index = $triggers.index($this);
                if (index == 0) {

                    if (start) {
                        date = Calendar.getDateFromFormattedString(start, self.options.dateFormat);
                    }

                } else if (index == 1) {

                    if (end) {
                        date = Calendar.getDateFromFormattedString(end, self.options.dateFormat);
                    }

                }
                if (date) {
                    self.now = date;
                }
            } else {

                var value = $this.val();
                //如果触发者已经有日期，则获取之
                if (value) {
                    date = Calendar.getDateFromFormattedString(value, self.options.dateFormat);
                    self.selected = {};
                    self.selected[value] = true;
                    self.now = date;
                }
            }

            //如果触发者只读并且配置为不渲染只读，则不进行渲染
            if ($this.is("[readonly]") && !self.options.renderReadonly) {
                return false;
            }
            self.$trigger = $this;
            var offset = self.getOffset();
            self.wrap.css({
                "top": offset.top,
                "left": offset.left
            });
            var zIndex = self.options.zIndex;
            if (zIndex) {
                self.wrap.css("z-index", zIndex);
            }
            var $target = $(self.options.target);
            $('.ui-calendar[data-float=true]').remove();
            $target.append(self.wrap);
            self.render();
            self.bindEvent();
        },

        /**
         * 获取浮动日历将要显示的位置
         * @returns {{top: (*|Number), left: (*|Number)}}
         */
        getOffset: function () {
            var $trigger = this.$trigger;
            var offsetAmount = this.options.offsetAmount;
            var top = this.getInt($trigger.offset().top + $trigger.outerHeight(false) + offsetAmount.top);
            var left = this.getInt($trigger.offset().left + offsetAmount.left);
            return {
                top: top,
                left: left
            };
        },

        /**
         * 取整
         * @param floatNumber
         * @returns {Number}
         */
        getInt: function (floatNumber) {
            var intNumber = parseInt(floatNumber, 10);
            return intNumber;
        },

        /**
         * 绑定事件
         */
        bindEvent: function () {
            this.bindMonthChangeEvent();
            this.bindSelectEvent();
            this.bindMouseOverEvent();
            this.bindMouseLeaveEvent();
            this.bindBirthdayEvent();
        },

        //生日日历事件
        bindBirthdayEvent: function () {

            this.wrap.off("click", this.hideDropdownHandler);
            this.wrap.on("click", {self: this}, this.hideDropdownHandler);

            this.wrap.off("click", ".cal-year-select", this.yearDropdownHandler);
            this.wrap.on("click", ".cal-year-select", {self: this}, this.yearDropdownHandler);

            this.wrap.off("click", ".cal-month-select", this.monthDropdownHandler);
            this.wrap.on("click", ".cal-month-select", {self: this}, this.monthDropdownHandler);

            this.wrap.off("click", ".cal-year-dropdown li", this.yearSelectHandler);
            this.wrap.on("click", ".cal-year-dropdown li", {self: this}, this.yearSelectHandler);

            this.wrap.off("click", ".cal-month-dropdown li", this.monthSelectHandler);
            this.wrap.on("click", ".cal-month-dropdown li", {self: this}, this.monthSelectHandler);

            this.wrap.off("click", ".cal-birthday-clear", this.birthdayClearHandler);
            this.wrap.on("click", ".cal-birthday-clear", {self: this}, this.birthdayClearHandler);

            this.wrap.off("click", ".cal-birthday-ok", this.birthdayOkHandler);
            this.wrap.on("click", ".cal-birthday-ok", {self: this}, this.birthdayOkHandler);

            this.wrap.off("click", ".cal-hour", this.birthdayHourHandler);
            this.wrap.on("click", ".cal-hour", {self: this}, this.birthdayHourHandler);

            this.wrap.off("click", ".cal-minute", this.birthdayMinuteHandler);
            this.wrap.on("click", ".cal-minute", {self: this}, this.birthdayMinuteHandler);

            this.wrap.off("click", ".cal-hour-dropdown li", this.hourSelectHandler);
            this.wrap.on("click", ".cal-hour-dropdown li", {self: this}, this.hourSelectHandler);

            this.wrap.off("click", ".cal-minute-dropdown li", this.minuteSelectHandler);
            this.wrap.on("click", ".cal-minute-dropdown li", {self: this}, this.minuteSelectHandler);

            this.wrap.off("click", ".cal-minute-dropdown .close", this.minuteCloseHandler);
            this.wrap.on("click", ".cal-minute-dropdown .close", {self: this}, this.minuteCloseHandler);

            this.wrap.off("click", ".cal-hour-dropdown .close", this.hourCloseHandler);
            this.wrap.on("click", ".cal-hour-dropdown .close", {self: this}, this.hourCloseHandler);
        },

        hourCloseHandler: function (e) {
            e.stopPropagation();
            var self = e.data.self;
            var $hourDropdown = self.wrap.find(".cal-hour-dropdown");
            $hourDropdown.remove();
            self.wrap.find(".cal-hour").removeClass("active");
        },

        minuteCloseHandler: function (e) {
            e.stopPropagation();
            var self = e.data.self;
            var $minuteDropdown = self.wrap.find(".cal-minute-dropdown");
            $minuteDropdown.remove();
            self.wrap.find(".cal-minute").removeClass("active");
        },

        //时间是否合法
        validateTime: function () {
            var cascadingSelected = this.cascadingSelected;
            if (cascadingSelected.start && (cascadingSelected.start == cascadingSelected.end)) {

                var startTime = cascadingSelected.startTime;
                var endTime = cascadingSelected.endTime;

                var lastTime = getEpochOfCST();
                lastTime.setHours(23);
                lastTime.setMinutes(55);

                if (+startTime == +lastTime) {

                    this.cascadingSelected.end = null;
                    this.cascadingSelected.endTime = getEpochOfCST();

                } else if (startTime >= endTime) {

                    startTime = new Date(startTime.getTime() + fiveMinutes);
                    this.cascadingSelected.endTime.setTime(startTime);
                }
            }
        },

        hourSelectHandler: function (e) {

            e.stopPropagation();
            var self = e.data.self;
            var $this = $(this);

            if ($this.is('[data-disabled="true"]')) {
                return false;
            }
            var hourStr = $this.attr("data-hour");
            var hour = parseInt(hourStr, 10);
            var $calHour = self.wrap.find(".cal-hour");

            if (self.options.cascading) {
                if (self.cascadingIndex === 0) {
                    self.cascadingSelected.startTime.setHours(hour);
                } else {
                    self.cascadingSelected.endTime.setHours(hour);
                }
                self.validateTime();
            } else {
                self.selectedTime.setHours(hour);
            }

            var $hourDropdown = self.wrap.find(".cal-hour-dropdown");
            $hourDropdown.remove();
            $calHour.html(hourStr).removeClass("active");
        },

        minuteSelectHandler: function (e) {


            e.stopPropagation();
            var self = e.data.self;
            var $this = $(this);

            if ($this.is('[data-disabled="true"]')) {
                return false;
            }

            var minuteStr = $this.attr("data-minute");
            var $calMinute = self.wrap.find(".cal-minute");
            var minute = parseInt(minuteStr, 10);

            if (self.options.cascading) {
                if (self.cascadingIndex === 0) {
                    self.cascadingSelected.startTime.setMinutes(minute);
                } else {
                    self.cascadingSelected.endTime.setMinutes(minute);
                }
                self.validateTime();
            } else {
                self.selectedTime.setMinutes(minute);
            }

            var $minuteDropdown = self.wrap.find(".cal-minute-dropdown");
            $minuteDropdown.remove();
            $calMinute.html(minuteStr).removeClass("active");
        },

        birthdayHourHandler: function (e) {

            var self = e.data.self;
            var $this = $(this);

            var val = $this.html();

            $this.addClass("active");

            self.wrap.find(".cal-hour-dropdown").remove();
            self.wrap.find(".cal-minute-dropdown").remove();

            var $hourDropdown = $('' +
                '<div class="cal-hour-dropdown">' +
                '<div class="title">小时<div class="close"><i></i></div></div>' +
                '</div>');

            var $ul = $("<ul></ul>");
            var liArr = [];
            var activeClass;
            var startHour = 0;
            var disabled;
            if (self.options.cascading && self.cascadingIndex === 1) {
                var start = self.cascadingSelected.start;
                var end = self.cascadingSelected.end;
                var startTime = self.cascadingSelected.startTime;
                if (start && (start == end)) {
                    startHour = startTime.getHours();
                }
            }

            for (var i = 0; i < 24; i += 1) {
                var dataHour = padNumber(i, 2);
                if (dataHour == val) {
                    activeClass = true;
                } else {
                    activeClass = false;
                }
                if (i < startHour) {
                    disabled = true;
                } else {
                    disabled = false;
                }
                liArr.push('' +
                    '<li' +
                    ' class="' + (activeClass ? 'active' : '') + '"' +
                    ' data-disabled="' + (disabled ? 'true' : 'false') + '"' +
                    ' data-hour="' + dataHour + '">' +
                    i +
                    '</li>');
            }
            var liStr = liArr.join("");
            $ul.html(liStr);
            $hourDropdown.append($ul);
            self.wrap.append($hourDropdown);
        },

        birthdayMinuteHandler: function (e) {

            var $this = $(this);
            var self = e.data.self;

            $this.addClass("active");

            var val = $this.html();
            var startMinute = 0;
            var disabled;
            var sameDayAndHour = false;

            self.wrap.find(".cal-hour-dropdown").remove();
            self.wrap.find(".cal-minute-dropdown").remove();

            if (self.options.cascading && self.cascadingIndex === 1) {
                var start = self.cascadingSelected.start;
                var end = self.cascadingSelected.end;
                var startTime = self.cascadingSelected.startTime;
                var endTime = self.cascadingSelected.endTime;
                if (start && (start == end)) {
                    var startHour = startTime.getHours();
                    var endHour = endTime.getHours();
                    if (startHour === endHour) {
                        sameDayAndHour = true;
                        startMinute = startTime.getMinutes();
                    }
                }
            }

            var $minuteDropdown = $('' +
                '<div class="cal-minute-dropdown">' +
                '<div class="title">分钟<div class="close"><i></i></div></div>' +
                '</div>');

            var $ul = $("<ul></ul>");
            var liArr = [];
            var activeClass;
            for (var i = 0; i < 60; i += 5) {
                var dataMinute = padNumber(i, 2);
                if (dataMinute == val) {
                    activeClass = true;
                } else {
                    activeClass = false;
                }

                if (sameDayAndHour && (i < startMinute + 5)) {
                    disabled = true;
                } else {
                    disabled = false;
                }
                liArr.push('' +
                    '<li class="' + (activeClass ? 'active' : '') + '"' +
                    ' data-disabled="' + (disabled ? 'true' : 'false') + '"' +
                    ' data-minute="' + dataMinute + '">' + i + '</li>');
            }
            var liStr = liArr.join("");
            $ul.html(liStr);
            $minuteDropdown.append($ul);
            self.wrap.append($minuteDropdown);

        },

        birthdayOkHandler: function (e) {
            e.stopPropagation();
            var self = e.data.self;

            self.inputTime();

            self.destroy();

            var okCallback = self.options.okCallback;
            if (okCallback && $.isFunction(okCallback)) {
                okCallback.call(self, self);
            }

            self.toNextCal();
        },

        inputTime: function () {
            var self = this;

            var date;
            var start = self.cascadingSelected.start;
            var end = self.cascadingSelected.end;
            var result;

            if (self.options.cascading) {
                if ((self.cascadingIndex === 0) && start) {
                    date = Calendar.getDateFromFormattedString(start, self.options.dateFormat);
                    result = self.getDateResult(date);
                } else if (end) {
                    date = Calendar.getDateFromFormattedString(end, self.options.dateFormat);
                    result = self.getDateResult(date);
                }

                if (result) {
                    self.$trigger.val(result);
                }
            }
        },

        birthdayClearHandler: function (e) {
            var self = e.data.self;
            self.$trigger.val("");

            if (self.options.cascading) {
                if (self.cascadingIndex === 0) {
                    self.cascadingSelected.start = null;
                    self.cascadingSelected.startTime = getEpochOfCST();
                } else {
                    self.cascadingSelected.end = null;
                    self.cascadingSelected.endTime = getEpochOfCST();
                }
            } else {
                self.selected = {};
                self.selectedTime = getEpochOfCST();
            }

            //销毁
            self.destroy();

            //清空回调函数
            var clearCallback = self.options.clearCallback;
            if (clearCallback && $.isFunction(clearCallback)) {
                clearCallback.call(self, self);
            }

            e.stopPropagation();
        },

        monthSelectHandler: function (e) {
            var self = e.data.self;
            var $this = $(this);
            var selectedMonth = $this.attr("data-month");
            var month = parseInt(selectedMonth, 10);
            self.now.setDate(1);
            self.now.setMonth(month);
            self.render();
            self.bindEvent();
            e.stopPropagation();
        },

        limitDropdown: function () {

            var minLimitDate = this.minLimitDate;
            var maxLimitDate = this.maxLimitDate;

            var now = this.now;
            var nowYear = now.getFullYear();
            var nowMonth = now.getMonth();

            if (minLimitDate && nowYear == minLimitDate.getFullYear()) {
                var minMonth = minLimitDate.getMonth();
                if (nowMonth < minMonth) {
                    this.now.setDate(1);
                    this.now.setMonth(minMonth)
                }
            }

            if (maxLimitDate && nowYear == maxLimitDate.getFullYear()) {
                var maxMonth = maxLimitDate.getMonth();
                if (nowMonth > maxMonth) {
                    this.now.setDate(1);
                    this.now.setMonth(maxMonth)
                }
            }
        },

        yearSelectHandler: function (e) {
            var self = e.data.self;
            var $this = $(this);
            var selectedYear = $this.attr("data-year");
            var year = parseInt(selectedYear, 10);

            self.now.setFullYear(year);
            self.limitDropdown();

            self.render();
            self.bindEvent();
            e.stopPropagation();
        },

        hideDropdownHandler: function (e) {
            var self = e.data.self;
            var $target = $(e.target);

            var $yearDropdown = self.wrap.find(".cal-year-dropdown-box");
            var $monthDropdown = self.wrap.find(".cal-month-dropdown-box");
            var $hourDropdown = self.wrap.find(".cal-hour-dropdown");
            var $minuteDropdown = self.wrap.find(".cal-minute-dropdown");
            var $hour = self.wrap.find(".cal-hour");
            var $minute = self.wrap.find(".cal-minute");

            $yearDropdown.hide();
            $monthDropdown.hide();
            $hourDropdown.hide();
            $minuteDropdown.hide();
            $hour.removeClass("active");
            $minute.removeClass("active");

            if ($target.is(".cal-year-select") || $target.parents(".cal-year-select").length > 0) {
                $yearDropdown.show();
            }

            if ($target.is(".cal-month-select") || $target.parents(".cal-month-select").length > 0) {
                $monthDropdown.show();
            }

            if ($target.is(".cal-hour") || $target.is(".cal-hour-dropdown") || $target.parents(".cal-hour-dropdown").length > 0) {
                $hourDropdown.show();
                $hour.addClass("active");
            }

            if ($target.is(".cal-minute") || $target.is(".cal-minute-dropdown") || $target.parents(".cal-minute-dropdown").length > 0) {
                $minuteDropdown.show();
                $minute.addClass("active");
            }

        },

        //生日日历年选择事件
        yearDropdownHandler: function (e) {
            var self = e.data.self;

            var $this = $(this);
            var $yearDropdown = self.wrap.find(".cal-year-dropdown-box");
            if ($yearDropdown.length <= 0) {
                $yearDropdown = self.createYearDropdown($this);
            }

            if ($this.hasClass("active")) {
                //$this.removeClass("active");
                $yearDropdown.hide();
            } else {
                //$this.addClass("active");
                $yearDropdown.show();
            }

            var calOffset = {
                top: self.wrap.offset().top,
                left: self.wrap.offset().left
            };
            var offset = {
                top: $this.offset().top,
                left: $this.offset().left
            };

            var calDate = self.now;
            var calYear = calDate.getFullYear();

            var $yearCurrentLi = $yearDropdown.find("[data-year=" + calYear + "]");

            $yearDropdown.css({
                top: offset.top - calOffset.top,
                left: offset.left - calOffset.left
            });

            self.wrap.append($yearDropdown);

            $yearCurrentLi.addClass("active");
            var currentLiHeight = $yearCurrentLi.outerHeight();
            var currentLiIndex = $yearCurrentLi.index();
            var currentLiTop = currentLiHeight * currentLiIndex;
            $yearDropdown.find(".cal-year-dropdown").scrollTop(currentLiTop)

        },
        //生日日历月选择事件
        monthDropdownHandler: function (e) {
            var self = e.data.self;

            var $this = $(this);
            var $monthDropdown = self.wrap.find(".cal-month-dropdown-box");
            if ($monthDropdown.length <= 0) {
                $monthDropdown = self.createMonthDropdown($this);
            }

            if ($this.hasClass("active")) {
                //$this.removeClass("active");
                $monthDropdown.hide();
            } else {
                //$this.addClass("active");
                $monthDropdown.show();
            }

            var calOffset = {
                top: self.wrap.offset().top,
                left: self.wrap.offset().left
            };
            var offset = {
                top: $this.offset().top,
                left: $this.offset().left
            };

            var calDate = self.now;
            var calMonth = calDate.getMonth();

            var $yearCurrentLi = $monthDropdown.find("[data-month=" + calMonth + "]");

            $monthDropdown.css({
                top: offset.top - calOffset.top,
                left: offset.left - calOffset.left
            });

            self.wrap.append($monthDropdown);

            $yearCurrentLi.addClass("active");
            var currentLiHeight = $yearCurrentLi.outerHeight();
            var currentLiIndex = $yearCurrentLi.index();
            var currentLiTop = currentLiHeight * currentLiIndex;
            $monthDropdown.scrollTop(currentLiTop)
        },

        createMonthDropdown: function () {

            var minLimitDate = this.minLimitDate;
            var maxLimitDate = this.maxLimitDate;

            var minYear = minLimitDate ? minLimitDate.getFullYear() : 1900;
            var maxYear = maxLimitDate ? maxLimitDate.getFullYear() : 2099;

            var minMonth = 0;
            var maxMonth = 11;

            var nowYear = this.now.getFullYear();

            if (nowYear == minYear && minLimitDate) {
                minMonth = minLimitDate.getMonth();
            }
            if (nowYear == maxYear && maxLimitDate) {
                maxMonth = maxLimitDate.getMonth();
            }

            var $dropdownBox = $('' +
                '<div class="cal-month-dropdown-box">' +
                '    <div class="cal-month-select-active">' + (this.now.getMonth() + 1) + '月<i></i></div>' +
                '</div>');
            var $ul = $('<ul class="cal-month-dropdown"></ul>');
            $dropdownBox.append($ul);
            var liStr = [];

            for (var index = minMonth; index <= maxMonth; index++) {
                liStr.push('<li data-month="' + index + '">' + (index + 1) + '</li>');
            }

            $ul.html(liStr.join(""));
            return $dropdownBox;
        },

        createYearDropdown: function () {
            var minLimitDate = this.minLimitDate;
            var maxLimitDate = this.maxLimitDate;

            var minYear = minLimitDate ? minLimitDate.getFullYear() : 1900;
            var maxYear = maxLimitDate ? maxLimitDate.getFullYear() : 2099;

            var $dropdownBox = $('' +
                '<div class="cal-year-dropdown-box">' +
                '    <div class="cal-year-select-active">' + this.now.getFullYear() + '年<i></i></div>' +
                '</div>');
            var $ul = $('<ul class="cal-year-dropdown"></ul>');
            $dropdownBox.append($ul);
            var liStr = [];

            for (var i = minYear; i <= maxYear; i++) {
                liStr.push('<li data-year="' + i + '">' + i + '</li>');
            }

            $ul.html(liStr.join(""));
            return $dropdownBox;
        },

        bindMouseOverEvent: function () {
            this.wrap.off("mouseenter", "[data-date-map]", this.bindMouseOverHandler);
            this.wrap.on("mouseenter", "[data-date-map]", {self: this}, this.bindMouseOverHandler);
        },

        bindMouseLeaveEvent: function () {
            this.wrap.off("mouseleave", "[data-date-map]", this.bindMouseLeaveHandler);
            this.wrap.on("mouseleave", "[data-date-map]", {self: this}, this.bindMouseLeaveHandler);
        },

        bindMouseLeaveHandler: function (e) {
            var self = e.data.self;
            if (self.options.cascading) {
                self.hideNumberOfDays();
                self.renderSelected(false, false);
            }

            if (self.options.sectionSelect) {
                self.renderSelected(false, false);
            }
        },

        bindMouseOverHandler: function (e) {
            //e.stopPropagation();
            var self = e.data.self;
            var $this = $(this);

            var dateStr = $this.attr("data-date-map");

            if (self.options.cascading) {
                if (!$this.children().is(".nodate,.caldisabled")) {
                    if (!self.options.cascadingEndNotShowStart) {
                        self.renderSelected(dateStr, false);
                    }
                }
            }

            if (self.options.sectionSelect && self.sectionSelectFlag) {
                if (!$this.children().is(".notThisMonth,.nodate")) {
                    self.renderSelected(dateStr, false);
                }
            }

        },

        /**
         * 日期选择事件
         */
        bindSelectEvent: function () {
            this.wrap.off("click", "[data-date-map]", this.bindSelectHandler);
            this.wrap.on("click", "[data-date-map]", {self: this}, this.bindSelectHandler);
        },

        getDateResult: function (dateVal) {
            var self = this;

            if (self.options.cascading) {
                if (self.cascadingIndex === 0) {

                    var startTime = self.cascadingSelected.startTime;

                    dateVal.setHours(startTime.getHours());
                    dateVal.setMinutes(startTime.getMinutes());
                } else {
                    var endTime = self.cascadingSelected.endTime;
                    dateVal.setHours(endTime.getHours());
                    dateVal.setMinutes(endTime.getMinutes());

                }

            } else {
                var time = self.selectedTime;
                dateVal.setHours(time.getHours());
                dateVal.setMinutes(time.getMinutes());
            }

            var dateResult = Calendar.dateFormat(dateVal, self.options.dateFormat);
            return dateResult;
        },

        /**
         * 是否可以点击区间
         * @param td
         * @param self
         * @param date
         * @returns {boolean}
         */
        canSectionSelect: function (td, self, date) {
            var hasProductStr = td.attr("data-has-product");
            var hasProduct = false;
            if (hasProductStr == "true") {
                hasProduct = true;
            }

            var canSelect = 0;

            if (!self.sectionSelectFlag) {
                //起始

                if (hasProduct) {

                    self.sectionSelectFlag = true;
                    self.sectionSelectEnd = null;
                    self.sectionSelectStart = date;
                    self.sectionSelectEnd = Calendar.dateOffset(date, 1)
                }


            } else {
                //结束

                var middle;
                var sectionSelectStart;
                var sectionSelectEnd;
                var middleStr;


                if (+self.sectionSelectStart == +date) {
                } else {
                    if (self.sectionSelectStart > date) {

                        if (hasProduct) {
                            return 4;
                        } else {
                            return 3;
                        }
                        //交换
                        //sectionSelectStart = date;
                        //sectionSelectEnd = self.sectionSelectStart;

                        //判断交换后入住是否合法
                        // var dateStr = Calendar.dateFormat(date, self.options.dateFormat);
                        // var $startDate = self.wrap.find('[data-date-map='+ dateStr +']')
                        // if($startDate.attr("data-has-product")!=="true"){
                        //     return false;
                        // }

                    } else {
                        sectionSelectStart = self.sectionSelectStart;
                        sectionSelectEnd = date;
                    }

                    canSelect = 1;
                    middle = Calendar.dateOffset(sectionSelectStart, 1);
                    while (middle < sectionSelectEnd) {
                        middleStr = Calendar.dateFormat(middle, self.options.dateFormat);
                        var $middle = self.wrap.find('[data-date-map=' + middleStr + ']');

                        if ($middle.attr("data-has-product") !== "true") {
                            canSelect = 2;
                            break;
                        }

                        middle = Calendar.dateOffset(middle, 1);
                    }

                }


            }

            return canSelect;
        },
        /**
         * 日期选择句柄
         */
        bindSelectHandler: function (e) {
            e.stopPropagation();
            var self = e.data.self;
            //执行回调函数
            var selectDateCallback = self.options.selectDateCallback;
            var cancelDateCallback = self.options.cancelDateCallback;
            var autoRender = self.options.autoRender;

            var $this = $(this);

            function runSelectDateCallback() {
                if (selectDateCallback) {
                    selectDateCallback.call(self, self, $this);
                }
            }

            function runCancelDateCallback() {
                if (cancelDateCallback) {
                    cancelDateCallback.call(self, self, $this);
                }
            }

            if ($this.children().first().is(".nodate,.caldisabled")) {
                //不可用
            } else if ($this.children().is(".notThisMonth") && self.options.bimonthly) {
                //不可用
            } else {
                var dateStr = $this.attr("data-date-map");
                var format = self.options.dateFormat;
                if (dateStr) {
                    var date = Calendar.getDateFromFormattedString(dateStr, format);

                    if (!self.options.sectionSelect) {
                        self.now = new Date(date);
                    }
                }

                var end = self.cascadingSelected.end;
                if (end) {
                    var endDate = Calendar.getDateFromFormattedString(end, format);
                }

                //var date
                if (self.options.cascading) {
                    //级联

                } else if (self.options.sectionSelect) {
                    //单日历区间选择

                    var canSelect = self.canSectionSelect($this, self, date);

                    if (canSelect == 1 || canSelect == 2) {
                        self.sectionSelectFlag = false;
                        self.sectionSelectEnd = date;
                    }

                    if (canSelect == 1 || canSelect == 0 || canSelect == 4) {
                        runSelectDateCallback()
                    } else {
                        runCancelDateCallback()
                    }

                    //可选
                    if (canSelect == 4) {
                        self.sectionSelectFlag = true;
                        self.sectionSelectStart = date
                        self.sectionSelectEnd = Calendar.dateOffset(date, 1);
                    }

                    self.renderSelected();
                    self.bindEvent();

                } else {
                    var hasInventory = $this.children().hasClass("hasInventory");

                    if (self.options.allowMutiSelected) {
                        //多选
                        var isSelect = $this.is(".td-selected");

                        if (isSelect) {
                            //已选择
                            delete self.selected[dateStr];
                            $this.removeClass("td-selected");
                            if (autoRender) {
                                runCancelDateCallback();
                            }

                        } else {
                            //未选择
                            self.selected[dateStr] = true;
                            $this.addClass("td-selected");
                            if (autoRender) {
                                runSelectDateCallback();
                            }

                        }
                    } else {
                        //单选
                        self.selected = {};
                        self.selected[dateStr] = true;
                        var $date = self.wrap.find("[data-date-map]");
                        $date.removeClass("td-selected");
                        $this.addClass("td-selected");
                        if (autoRender) {
                            runSelectDateCallback();
                        }

                    }
                }

            }

            if (!autoRender) {
                var $td = $this;
                if ($this.find(".nodate,.caldisabled").length > 0) {
                    return false;
                }
                if ($this.children().is(".notThisMonth") && self.options.bimonthly) {
                    return false;
                }
                var dateMap = $td.attr("data-date-map");
                var dateVal = Calendar.getDateFromFormattedString(dateMap, self.options.dateFormat);

                var dateResult = self.getDateResult(dateVal);


                self.$trigger.val(dateResult);  //填充日期到$trigger中

                runSelectDateCallback();

                if (self.options.cascading) {
                    //级联

                    if (self.cascadingIndex === 0) {
                        //开始
                        self.cascadingSelected.start = dateMap
                    } else {
                        //结束
                        self.cascadingSelected.end = dateMap

                    }
                    if (self.cascadingIndex === 0 && end && dateStr) {

                        var max = self.options.cascadingMax;
                        var min = self.options.cascadingMin;
                        var offset = self.options.cascadingOffset;
                        var dayNext = self.options.dayNext;

                        var thisDate = Calendar.dateToDay(self.date);

                        var newEndDate;

                        var maxDate = new Date(+date + Calendar.dayToMS(max));
                        if (maxDate < endDate && max != -1) {
                            newEndDate = Calendar.dateFormat(maxDate, format);
                            self.cascadingSelected.end = newEndDate;
                        }

                        var offsetDate = new Date(+date + Calendar.dayToMS(offset));
                        if (offsetDate > endDate) {
                            newEndDate = Calendar.dateFormat(offsetDate, format);
                            self.cascadingSelected.end = newEndDate;
                        }
                        if (dayNext != -1) {
                            var lastDate = Calendar.dateOffset(thisDate, dayNext);
                            if (offsetDate && (+offsetDate > +lastDate)) {
                                newEndDate = Calendar.dateFormat(lastDate, format);
                                self.cascadingSelected.end = newEndDate;
                            }
                        }
                    }

                    self.validateTime();

                    if (!self.options.hasTime) {
                        self.destroy();
                        self.toNextCal();


                    } else {
                        self.dateValidate();
                        self.render();
                        self.bindEvent();
                    }

                } else {
                    self.destroy();
                }

            }

        },

        unBindEvent: function () {
            this.unBindMonthChangeEvent();
        },

        /**
         * 绑定月切换事件
         */
        bindMonthChangeEvent: function () {
            var monthChangeOffset = this.options.monthChangeOffset || 1;
            var $monthPrev = this.wrap.find(".month-prev");
            var $monthNext = this.wrap.find(".month-next");
            $monthPrev.off("click", this.monthChangeHandler);
            $monthPrev.on("click", {self: this, monthOffset: -monthChangeOffset}, this.monthChangeHandler);
            $monthNext.off("click", this.monthChangeHandler);
            $monthNext.on("click", {self: this, monthOffset: +monthChangeOffset}, this.monthChangeHandler);
        },

        unBindMonthChangeEvent: function () {
            var $monthPrev = this.wrap.find(".month-prev");
            var $monthNext = this.wrap.find(".month-next");
            $monthPrev.off("click", this.monthChangeHandler);
            $monthNext.off("click", this.monthChangeHandler);
        },

        dateValidate: function () {
            var $triggers = $(this.options.trigger);
            var end = this.cascadingSelected.end;
            if (end) {
                var endDate = Calendar.getDateFromFormattedString(end, this.options.dateFormat);
                var endTime = this.cascadingSelected.endTime;
                endDate.setHours(endTime.getHours());
                endDate.setMinutes(endTime.getMinutes());
                var endDateStr = Calendar.dateFormat(endDate, this.options.dateFormat);
                $triggers.eq(1).val(endDateStr);
            } else {
                $triggers.eq(1).val("");
            }

        },

        toNextCal: function () {

            var $triggers = $(this.options.trigger);
            var triggerSize = $triggers.length;
            var cascadingCallback = this.options.cascadingCallback;

            this.dateValidate();

            if (this.options.cascadingNextAuto) {
                var index = $triggers.index(this.$trigger);
                //已经是最后一个
                if (triggerSize - 1 == index) {
                } else {
                    var eventName = this.options.triggerEvent;
                    $triggers.eq(index + 1).trigger(eventName);
                    //级联回调函数
                    if (cascadingCallback) {
                        cascadingCallback.call(this, this, $triggers.eq(index + 1));
                    }

                }
            }
        },

        //月份切换限制
        monthLimit: function () {
            var mosNext = this.options.monthNext;
            var mosPrev = this.options.monthPrev;

            var upperLimit = Calendar.monthOffset(today, mosNext);
            var lowerLimit = Calendar.monthOffset(today, -mosPrev);

            if (mosNext != -1 && Calendar.isSameMonth(upperLimit, this.now)) {
                this.hideMonthNext();
            }

            if (mosPrev != -1 && Calendar.isSameMonth(lowerLimit, this.now)) {
                this.hideMonthPrev();
            }
        },

        //时间区间限制
        DateLimit: function () {

            if (this.maxLimitDate) {

                var isSameMonthNext = Calendar.isSameMonth(this.maxLimitDate, this.now);
                if (isSameMonthNext) {
                    this.hideMonthNext();
                }
            }

            if (this.minLimitDate) {
                var isSameMonthPrev = Calendar.isSameMonth(this.minLimitDate, this.now);
                if (isSameMonthPrev) {
                    this.hideMonthPrev();
                }
            }

        },

        hideMonthNext: function () {
            this.wrap.find(".month-next").hide();
        },

        hideMonthPrev: function () {
            this.wrap.find(".month-prev").hide();
        },

        showMonthNext: function () {
            this.wrap.find(".month-next").show();
        },

        showMonthPrev: function () {
            this.wrap.find(".month-prev").show();
        },

        /**
         * 月份切换处理器
         * @param e
         */
        monthChangeHandler: function (e) {
            var self = e.data.self;
            var monthOffset = e.data.monthOffset;
            self.now.setDate(1);
            self.now = Calendar.monthOffset(self.now, monthOffset);

            self.render();

            self.bindEvent();

            e.stopPropagation();
        },

        //兼容老版本方法
        toMonth: function (yearStr, monthStr) {
            var year = parseInt(yearStr, 10);
            var month = parseInt(monthStr, 10) - 1;
            if (typeof year === "number") {
                this.now.setFullYear(year);
            }
            if (typeof month === "number") {
                this.now.setDate(1);
                this.now.setMonth(month);
            }
            this.render();
            this.bindEvent();
        },

        //月份切换限制
        hideNumberOfDays: function () {
            $(".cal-number-of-days").hide();
        },

        /**
         * 渲染
         * @param disableCallback 不执行回调函数
         */
        render: function (disableCallback) {
            var self = this;

            if (this.options.cascading) {
                var $trigger = self.$trigger;
                var $triggers = $(self.options.trigger);
                this.cascadingIndex = $triggers.index($trigger);
            }

            this.hideNumberOfDays();
            this.wrap.html("");
            this.wrap.append(this.createHead());
            this.wrap.append(this.createBody());

            if (this.wrap.is(".ui-calendar-big") && this.options.showPriceTip) {
                this.wrap.append("<div class='nova-calendar-tip'><i></i>" + this.options.priceTipText + "</div>")
            }

            var sourceFn = this.options.sourceFn;

            if (!disableCallback && $.isFunction(sourceFn)) {
                sourceFn.call(self, self);
            }

            this.wrap.addClass(this.options.wrapClass);

            var completeCallback = this.options.completeCallback;

            this.renderFestival();
            this.renderSelected(false, true);
            this.renderTime();

            this.monthLimit();

            this.DateLimit();

            if (!disableCallback && $.isFunction(completeCallback)) {
                completeCallback.call(this, this);
            }

        },

        renderTime: function () {

            if (this.options.hasTime) {
                this.wrap.find(".cal-pane").children().css({
                    "display": "inline-block"
                });
            }

            if (this.options.cascading) {
                this.renderCascadingTime();
            } else {
                this.renderNormalTime();
            }

        },

        setTimeHtml: function (time) {

            var hour = time.getHours();
            var minute = time.getMinutes();

            var hourStr = padNumber(hour, 2);
            var minuteStr = padNumber(minute, 2);

            var $hour = this.wrap.find(".cal-hour");
            var $minute = this.wrap.find(".cal-minute");

            $hour.html(hourStr);
            $minute.html(minuteStr);
        },

        renderNormalTime: function () {

            this.setTimeHtml(this.selectedTime);

        },

        renderCascadingTime: function () {
            var startTime = this.cascadingSelected.startTime;
            var endTime = this.cascadingSelected.endTime;

            if (this.cascadingIndex === 0) {
                //开始
                this.setTimeHtml(startTime);
            } else if (this.cascadingIndex === 1) {
                //结束
                this.setTimeHtml(endTime);
            }

        },

        /**
         * 选择
         */
        renderSelected: function (mouseOverEnd, isClick) {
            var self = this;
            var selected = this.selected;
            var $dates = this.wrap.find("[data-date-map]").has(".caldate");
            var cascadingMin = this.options.cascadingMin;
            var cascadingMax = self.options.cascadingMax;
            var cascadingEndNotShowStart = self.options.cascadingEndNotShowStart;

            $dates.children().removeClass("calmiddle");

            //级联
            var dateFormat = self.options.dateFormat;
            if (self.options.cascading) {
                var start = self.cascadingSelected.start;
                var end = mouseOverEnd || self.cascadingSelected.end;

                var $startDate = $dates.filter('[data-date-map="' + start + '"]').has(".caldate");
                var $endDate = $dates.filter('[data-date-map="' + end + '"]').has(".caldate");

                if (start) {
                    var startDate = Calendar.getDateFromFormattedString(start, dateFormat);
                }
                if (end) {
                    var endDate = Calendar.getDateFromFormattedString(end, dateFormat);
                }

                if (this.cascadingIndex === 0) {
                    //第一个输入框

                } else {
                    //第二个输入框

                    if (start) {

                        $dates.each(function (index, domEle) {
                            var $date = $(domEle);
                            var dateStr = $date.attr("data-date-map");
                            var date = Calendar.getDateFromFormattedString(dateStr, self.options.dateFormat);

                            //已经选中开始与结束，填充中间值
                            if (end) {
                                if (date > startDate && date < endDate) {
                                    if (!self.options.cascadingEndNotShowStart) {
                                        $date.children().addClass("calmiddle");
                                    }

                                }
                            }

                            //联级天数限制

                            if (cascadingMin != -1) {
                                //最小限制
                                if (date < +startDate + Calendar.dayToMS(cascadingMin)) {
                                    $date.children().addClass("caldisabled")
                                }
                            }

                            if (cascadingMax != -1) {
                                //最大限制
                                if (date > +startDate + Calendar.dayToMS(cascadingMax)) {
                                    $date.children().addClass("caldisabled");
                                }
                            }

                        });

                        if (end && $endDate.length > 0) {

                            var numberOfDays = Calendar.getDaysBetween(startDate, endDate);
                            var size = {
                                width: $endDate.width(),
                                height: $endDate.height(),
                                left: $endDate.offset().left,
                                top: $endDate.offset().top
                            };

                            var $numberOfDays = $(".cal-number-of-days");

                            if ($numberOfDays.length <= 0) {
                                $numberOfDays = $('' +
                                    '<div class="cal-number-of-days">' +
                                    '    <div class="triangle"></div>' +
                                    '    <span></span>' +
                                    '</div>');
                            }

                            $numberOfDays.css({
                                left: 0,
                                top: 0
                            });

                            var $numberOfDaysSpan = $numberOfDays.children("span");

                            var template = self.options.numberOfDays;
                            var numberOfDaysHtml = self.replaceWith(template, {
                                num: numberOfDays
                            });
                            $numberOfDaysSpan.html(numberOfDaysHtml);

                            $body.append($numberOfDays);
                            var width = $numberOfDays.width();
                            $numberOfDays.css({
                                left: size.left - ~~(width - size.width / 2) + 2,
                                top: size.top + size.height + 7
                            });
                            if (self.options.zIndex) {
                                $numberOfDays.css("zIndex", self.options.zIndex + 1);
                            }

                            if (self.options.showNumberOfDays) {
                                $numberOfDays.show();
                            }

                        }
                    }

                    if (end) {
                        if (!mouseOverEnd) {
                            $endDate.addClass("td-selected");
                        }
                    }

                }

                if (end && mouseOverEnd && !self.options.hasTime) {
                    $dates.removeClass("td-selected");
                }

                if (start && !((cascadingEndNotShowStart && this.cascadingIndex === 1))) {
                    //开始
                    $startDate.addClass("td-selected")
                }

            }

            if (self.options.sectionSelect) {

                var $wrap = self.wrap;
                var $tds = $wrap.find("td[data-date-map]").filter(function (index, ele) {
                    var $ele = $(ele);
                    if ($ele.find(".notThisMonth").length > 0) {
                        return false
                    } else {
                        return true;
                    }
                });

                $tds.removeClass("td-selected").children().removeClass("calmiddle").find(".calday").each(function (index, ele) {
                    var $ele = $(ele);
                    var backup = $ele.attr("data-backup");
                    if (backup) {
                        $ele.text(backup);
                    }
                });

                //交换开始结束位置
                var sectionSelectStart = self.sectionSelectStart;
                var sectionSelectEnd = self.sectionSelectEnd;

                if (mouseOverEnd) {
                    sectionSelectEnd = Calendar.getDateFromFormattedString(mouseOverEnd, self.options.dateFormat);
                }

                if (+sectionSelectStart == +sectionSelectEnd) {
                    return;
                }

                if (sectionSelectStart && sectionSelectEnd) {

                    if (+sectionSelectStart > +sectionSelectEnd) {

                        //var temp = sectionSelectStart;
                        sectionSelectStart = null;
                        sectionSelectEnd = null;

                        //更新数据
                        if (!mouseOverEnd) {

                            self.sectionSelectStart = sectionSelectStart;
                            self.sectionSelectEnd = sectionSelectEnd;
                        }
                    }

                    var middle = Calendar.dateOffset(sectionSelectStart, 1);
                    var $middle;
                    var middleStr;
                    while (+middle < +sectionSelectEnd) {
                        middleStr = Calendar.dateFormat(middle, dateFormat);
                        $middle = $tds.filter('td[data-date-map=' + middleStr + ']');
                        $middle.children().addClass("calmiddle");
                        middle = Calendar.dateOffset(middle, 1);

                    }

                }

                //开始
                if (sectionSelectStart) {
                    var sectionSelectStartStr = Calendar.dateFormat(sectionSelectStart, dateFormat);

                    var $start = $tds.filter('td[data-date-map=' + sectionSelectStartStr + ']');
                    $start.addClass("td-selected");
                    var $startCalDay = $start.find(".calday");
                    $startCalDay.attr("data-backup", $startCalDay.text()).text("入住");
                }

                //结束
                if (sectionSelectEnd) {
                    var sectionSelectEndStr = Calendar.dateFormat(sectionSelectEnd, dateFormat);
                    var $end = $tds.filter('td[data-date-map=' + sectionSelectEndStr + ']');
                    $end.addClass("td-selected");
                    var $endCalDay = $end.find(".calday");
                    $endCalDay.attr("data-backup", $endCalDay.text()).text("退房");
                }

            }

            $dates.each(function (index, domEle) {
                var $td = $(domEle);
                if (!$td.find(".nodate").length > 0) {

                    var date = $td.attr("data-date-map");
                    if (self.selected[date]) {
                        if (self.options.autoRender) {
                            $td.addClass("td-selected");
                        } else {
                            if (self.$trigger.val() != "") {
                                $td.addClass("td-selected");
                            }
                        }

                        var $thisTd = self.wrap.find('[data-date-map="' + date + '"]');
                        if ($thisTd.length > 1) {
                            $thisTd.has(".notThisMonth").removeClass("td-selected");
                        }
                    }
                }
            });

        },

        /**
         * 节日
         */
        renderFestival: function () {

            var festival = this.options.festival;
            var self = this;

            var $tds = this.wrap.find('td[data-date-map]');

            var dateToday = new Date(self.date.getFullYear(), self.date.getMonth(), self.date.getDate());
            var dateTodayStr = Calendar.dateFormat(dateToday, self.options.dateFormat);

            $tds.each(function (i, domEle) {
                var $td = $(domEle);

                var $date = $td.find(".caldate");
                var $calActive = $date.find(".calactive");
                var $calday = $date.find(".calday");

                var date = $td.attr("data-date-map");
                var tdFestival = festival[date];
                if (tdFestival) {

                    if ($(self.wrap).is(".ui-calendar-mini")) {
                        //小日历
                        if (tdFestival.name) {
                            $date.html(tdFestival.name);
                            $date.addClass("festival");
                        }

                    } else {
                        //大日历
                        var $calFestival = $('<div class="calfestival">休</div>');
                        $calActive.append($calFestival);

                        if (tdFestival.name) {
                            $date.addClass("festival");
                            $calday.html(tdFestival.name);
                        }
                    }
                }
                //小日历
                if (dateTodayStr === date) {
                    if ($(self.wrap).is(".ui-calendar-mini")) {
                        $date.html("今天");
                    } else {
                        //大日历
                        $calday.html("今天");
                    }
                }

                //分割
                var thisDate = Calendar.getDateFromFormattedString(date, self.options.dateFormat);
                var thisDateMonth = thisDate.getMonth();
                var thisDateDay = thisDate.getDate();
                if (self.options.division && thisDateDay == 1) {

                    if ($(self.wrap).is(".ui-calendar-mini")) {
                        //小日历
                    } else {
                        //大日历
                        $calday.html((thisDateMonth + 1) + "月" + thisDateDay + "日");
                    }
                }
            })
        },

        /**
         * 创建头部DOM
         */
        createHead: function () {
            return this.options.template.calControl;
        },

        /**
         * 创建身体DOM
         * @returns {string}
         */
        createBody: function () {
            var options = this.options;
            var html = "";
            var date = this.now;
            html += this.createSingleCalendar(date, 0);
            if (options.bimonthly) {
                var nextMonthDate = new Date(date);
                nextMonthDate.setDate(1);
                nextMonthDate = Calendar.monthOffset(nextMonthDate, 1);
                html += this.createSingleCalendar(nextMonthDate, 1);
            }
            html = this.replaceWith(options.template.calWrap, {
                content: html
            });
            return html;
        },

        /**
         * 创建单月日历HTML字符串
         * @param date
         * @param offset
         * @returns {string}
         */
        createSingleCalendar: function (date, offset) {
            var html = "";
            var options = this.options;
            var month = date.getMonth();
            var year = date.getFullYear();
            var nextMonthDate = Calendar.monthOffset(date, 1);
            var nextMonthYear = nextMonthDate.getFullYear();
            var nextMonthMonth = nextMonthDate.getMonth();

            html += this.replaceWith(options.template.calTitle, {
                month: this.replaceWith(options.titleTip, {
                    year: year,
                    month: month + 1
                })
            });
            if (this.options.division) {
                var nextMonthTitle = this.replaceWith(options.template.calTitle, {
                    month: this.replaceWith(options.titleTip, {
                        year: nextMonthYear,
                        month: nextMonthMonth + 1
                    })
                });
                nextMonthTitle = nextMonthTitle.replace("caltitle", "caltitle caltitlenext");
                html += nextMonthTitle
            }
            var weekOffset = this.options.weekOffset;
            var dayOffset = this.options.dayOffset;
            var englishWeekTitle = this.options.englishWeekTitle;
            var weekShortTitle = this.options.weekShortTitle;
            html += this.replaceWith(options.template.calBody, {
                month: month + 1,
                date: this.createDate(date),
                'englishWeekTitle[0]': englishWeekTitle[(0 + weekOffset + dayOffset) % 7],
                'englishWeekTitle[1]': englishWeekTitle[(1 + weekOffset + dayOffset) % 7],
                'englishWeekTitle[2]': englishWeekTitle[(2 + weekOffset + dayOffset) % 7],
                'englishWeekTitle[3]': englishWeekTitle[(3 + weekOffset + dayOffset) % 7],
                'englishWeekTitle[4]': englishWeekTitle[(4 + weekOffset + dayOffset) % 7],
                'englishWeekTitle[5]': englishWeekTitle[(5 + weekOffset + dayOffset) % 7],
                'englishWeekTitle[6]': englishWeekTitle[(6 + weekOffset + dayOffset) % 7],
                'shortWeekTitle[0]': weekShortTitle[(0 + weekOffset + dayOffset) % 7],
                'shortWeekTitle[1]': weekShortTitle[(1 + weekOffset + dayOffset) % 7],
                'shortWeekTitle[2]': weekShortTitle[(2 + weekOffset + dayOffset) % 7],
                'shortWeekTitle[3]': weekShortTitle[(3 + weekOffset + dayOffset) % 7],
                'shortWeekTitle[4]': weekShortTitle[(4 + weekOffset + dayOffset) % 7],
                'shortWeekTitle[5]': weekShortTitle[(5 + weekOffset + dayOffset) % 7],
                'shortWeekTitle[6]': weekShortTitle[(6 + weekOffset + dayOffset) % 7]
            });
            html = this.replaceWith(options.template.calMonth, {
                content: html,
                offset: 'data-offset="' + offset + '"'
            });
            return html;
        },

        /**
         * 创建单日HTML字符串
         * @param date
         * @returns {string}
         */
        createDate: function (date) {
            var self = this;
            var html = "";
            var dateHtml = "";
            var dates = this.getDateArrayByMonth(date);
            var options = this.options;
            dates.forEach(function (row) {
                dateHtml = "";
                row.forEach(function (cal) {
                    if (cal) {
                        var dateMap = Calendar.dateFormat(cal, self.options.dateFormat);
                        var singleDateHtml = self.replaceWith(options.template.day, {
                            week: cal.getDay(),
                            day: Calendar.dateFormat(cal, "dd"),
                            className: self.getClass(cal, date),
                            dateMap: 'data-date-map="' + dateMap + '"'
                        });
                    } else {
                        singleDateHtml = '<td><div class="date caldate caldisabled"></div></td>';
                    }

                    dateHtml += singleDateHtml;
                });
                html += self.replaceWith(options.template.weekWrap, {
                    week: dateHtml
                });
            });

            return html;
        },

        /**
         * 获取单日class
         * @param cal 单日
         * @param date 月
         * @returns {string}
         */
        getClass: function (cal, date) {
            var year = cal.getFullYear();
            var month = cal.getMonth();
            var calDate = Calendar.dateToDay(cal);
            var className = "date";
            var thisDate = Calendar.dateToDay(this.date);
            var dayNext = this.options.dayNext;
            var dayPrev = this.options.dayPrev;

            var dayDisableNext = this.options.dayDisableNext;

            var cascadingOffset = this.options.cascadingOffset;
            var cascadingMin = this.options.cascadingMin;
            var cascading = this.options.cascading;

            if ((year == date.getFullYear()) && (month == date.getMonth())) {
                className += " caldate";
            } else if (this.options.division) {
                //分割
                className += " caldate notThisMonth";
            } else {
                if (this.wrap.is(".ui-calendar-mini")) {
                    className += " nodate notThisMonth";
                } else {
                    className += " caldate notThisMonth";
                }
            }

            var dayBetween = Calendar.getDaysBetween(thisDate, calDate);

            if (calDate > thisDate && dayNext != -1 && dayBetween > dayNext) {
                className += " nodate";
            }

            if (calDate >= thisDate && dayBetween < dayDisableNext) {
                className += " nodate";
            }

            //级联第一个不能选择最后一天
            if (cascading && this.cascadingIndex === 0) {

                var minDate = Calendar.dateOffset(calDate, cascadingMin);
                var lastDate = Calendar.dateOffset(thisDate, dayNext);

                if (minDate > lastDate && dayNext != -1) {
                    className += " nodate";
                }
            }

            if ((calDate < thisDate) && (dayPrev != -1) && (dayBetween > dayPrev)) {
                className += " nodate";
            }

            //当天
            if (Calendar.isSameDay(thisDate, cal)) {
                className += " today";
                if (!this.options.isTodayClick) {
                    className += " caldisabled"
                }
            }
            return className;
        },

        /**
         * 替换匹配的内容
         * @param str
         * @param obj
         * @returns {*}
         */
        replaceWith: function (str, obj) {
            for (var i in obj) {
                str = str.replace("{{" + i + "}}", obj[i]);
            }
            return str;
        },

        //获取日期
        getDate: function () {
            return this.now.getDate();
        },

        //获取月份 从0开始
        getMonth: function () {
            return this.now.getMonth();
        },

        //获取四位年份
        getFullYear: function () {
            return this.now.getFullYear();
        },

        //获取星期
        getDay: function () {
            return this.now.getDay();
        },

        //获取星期标题
        getWeekTitle: function (i) {
            return this.options.weekTitle[i];
        },

        //获取星期短标题
        getWeekShortTitle: function (i) {
            return this.options.weekShortTitle[i];
        },

        getDateArrayByMonth: function (date) {
            var division = this.options.division;
            var dateArray = [];
            var year = date.getFullYear();
            var month = date.getMonth();
            var firstDate = new Date(year, month, 1);
            var nextMonthFirstDate = new Date(year, month + 1, 1);
            var firstDateDay = firstDate.getDay();
            var index = -firstDateDay + this.options.weekOffset;
            index = index > 0 ? index - 7 : index;
            index += this.options.dayOffset;
            var row = 0;
            var col = 0;
            var space;
            var spaceStart = false;

            if (division) {
                //分割
                var lastDayIndex = firstDateDay + Calendar.getDaysInMonth(month, year);
                if (lastDayIndex > 35) {
                    index += 22;
                } else {
                    index += 15;
                }
                if (lastDayIndex == 35) {
                    space = 0
                } else {
                    space = 7;
                }
                for (row = 0; row < 6; row++) {
                    dateArray[row] = [];
                    for (col = 0; col < 7; col++) {
                        var newDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), index);
                        if (space && ( spaceStart || (+nextMonthFirstDate == +newDate))) {
                            space--;
                            dateArray[row][col] = null;
                        } else {
                            index++;
                            dateArray[row][col] = newDate;
                        }
                    }
                }
            } else {
                //正常
                for (row = 0; row < 6; row++) {
                    dateArray[row] = [];
                    for (col = 0; col < 7; col++) {
                        index++;
                        dateArray[row][col] = new Date(firstDate.getFullYear(), firstDate.getMonth(), index);
                    }
                }
            }

            return dateArray;
        },

        //获取选择
        getSelect: function () {
            var cascading = this.options.cascading;
            if (cascading) {
                return [
                    this.cascadingSelected.start,
                    this.cascadingSelected.end
                ];
            } else {
                var selected = [];
                for (var s in this.selected) {
                    selected.push(s)
                }
                return selected;
            }
        },

        //获取星期或者节假日(一般日期显示星期x，特殊日期显示如今天、中秋)信息
        getDayOfWeek: function (date, noFestival) {

            date = date || this.now;

            if (date) {

                //当天
                if (Calendar.isSameDay(today, date)) {
                    return "今天";
                }

                if (!noFestival) {
                    //节日
                    var nowStr = Calendar.dateFormat(date, this.options.dateFormat);
                    if (nowStr) {

                        var festival = this.options.festival[nowStr];
                        if (festival) {
                            if (festival.name) {
                                return festival.name;
                            }
                        }
                    }
                }

                //星期
                var dayOfTheWeek = date.getDay();
                return this.options.weekTitle[dayOfTheWeek];

            }

        },

        loading: function () {
            var $loading = this.wrap.find(".month-loading");
            $loading.show();
        },

        loaded: function () {
            var $loading = this.wrap.find(".month-loading");
            $loading.hide();
        }

    };

    //公用模板
    var calControl = '<span class="month-prev" title="上一月">‹</span><span class="month-next" title="下一月">›</span>';
    var calWrap = '<div class="calwrap clearfix">{{content}}</div>';
    var calMonth = '<div class="calmonth" {{offset}}>{{content}}</div>';
    var calTitle = '<div class="caltitle"><span class="mtitle">{{month}}</span></div>';
    var calTable = '<table class="caltable">' +
        '    <thead>' +
        '        <tr>' +
        '            <th class="{{englishWeekTitle[0]}}">{{shortWeekTitle[0]}}</th>' +
        '            <th class="{{englishWeekTitle[1]}}">{{shortWeekTitle[1]}}</th>' +
        '            <th class="{{englishWeekTitle[2]}}">{{shortWeekTitle[2]}}</th>' +
        '            <th class="{{englishWeekTitle[3]}}">{{shortWeekTitle[3]}}</th>' +
        '            <th class="{{englishWeekTitle[4]}}">{{shortWeekTitle[4]}}</th>' +
        '            <th class="{{englishWeekTitle[5]}}">{{shortWeekTitle[5]}}</th>' +
        '            <th class="{{englishWeekTitle[6]}}">{{shortWeekTitle[6]}}</th>' +
        '        </tr>' +
        '    </thead>' +
        '    <tbody>' +
        '        {{date}}' +
        '    </tbody>' +
        '    </table>';
    var calBody = '' +
        '<div class="calbox">' +
        calTable +
        '    <div class="month-loading"></div>' +
        '</div>';
    var weekWrap = '<tr>{{week}}</tr>';

    //小日历模板
    var smallTemplate = {
        wrap: '<div class="ui-calendar ui-calendar-mini" {{bimonthly}} {{float}}></div>',
        calControl: calControl,
        calWrap: calWrap,
        calMonth: calMonth,
        calTitle: calTitle,
        calBody: calBody,
        weekWrap: weekWrap,
        day: '' +
        '<td data-week="{{week}}" {{dateMap}}>' +
        '    <div class="{{className}}">{{day}}</div>' +
        '</td>'
    };

    //大日历模板
    var bigTemplate = {
        wrap: '<div class="ui-calendar ui-calendar-big" {{bimonthly}} {{float}}></div>',
        calControl: calControl,
        calWrap: calWrap,
        calMonth: calMonth,
        calTitle: calTitle,
        calBody: calBody,
        weekWrap: weekWrap,
        day: '' +
        '<td data-week="{{week}}" {{dateMap}}>' +
        '    <div class="{{className}}">' +
        '        <div class="calday">{{day}}</div>' +
        '        <div class="calinfo"></div>' +
        '        <div class="calprice"></div>' +
        '        <div class="calactive"></div>' +
        '        <div class="calselected"></div>' +
        '    </div>' +
        '</td>'
    };

    //生日日历模板
    var birthdayTemplate = {
        wrap: '<div class="ui-calendar ui-calendar-mini ui-calendar-birthday" {{bimonthly}} {{float}}></div>',
        calControl: calControl,
        calWrap: calWrap,
        calMonth: calMonth,
        calTitle: calTitle,
        calBody: '' +
        '<div class="calbox">' +
        calTable +
        '<div class="cal-pane">' +
        '<span class="cal-time-text">时间</span>' +
        '<span class="cal-time-input">' +
        '<span class="cal-hour">00</span><span class="cal-time-to">:</span><span class="cal-minute">00</span>' +
        '</span>' +
        '<span class="btn btn-xs cal-birthday-clear">清空</span>' +
        '<span class="btn btn-xs cal-birthday-ok">确定</span>' +
        '</div>' +
        '<div class="month-loading"></div>' +
        '</div>',
        weekWrap: weekWrap,
        day: '' +
        '<td data-week="{{week}}" {{dateMap}}>' +
        '    <div class="{{className}}">{{day}}</div>' +
        '</td>'
    };

    lv.calendar = Factory;
    window.lv = lv;

    nova.calendar = Factory;
    window.nova = nova;

    for (var c in Calendar) {
        if (typeof Calendar[c] === "function") {
            Factory[c] = Calendar[c]
        }
    }

})(window, jQuery, window.lv || {}, window.nova || {});