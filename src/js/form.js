/**
 * Created by rory on 2017/6/29.
 */
/**
 * author: Sheng JIANG
 * date: 2017-03-02
 */
$(function () {

    var $document = $(document);

    //<editor-fold desc="标签提示文字">
    $(".js_tip,.JS_tlStopTip,.add-one-day").poptip({place: 6});
    //</editor-fold>


    //航班信息
    $(document).on("mouseout", ".plane-type", function(){
        timeId = setTimeout(function() {
            $('.plane-info').hide();
        }, 300);
        $('.plane-info').off("mouseenter mouseleave");
        $('.plane-info').on("mouseenter", function() {
            clearTimeout(timeId);
        }).on("mouseleave", function() {
            $(this).hide();
        });
    });



    //hover标题展示信息
    var tit_timer = null;
    window.titleHover = function(self,showId){
        var L = self.offset().left,
            T = self.offset().top,
            H = self.height();
        clearTimeout(tit_timer);
        showId.show().css({'left':L,'top':T+H+5}).siblings('.title_float_box').hide();
    };
    $(document).on('mouseover','.title_float_box',function(e){
        clearTimeout(tit_timer);
    });

    //鼠标离开  隐藏标题展示信息
    $(document).on('mouseout','.order-product-name,.title_float_box',function(e){
        tit_timer = setTimeout(function(){
            $('.title_float_box').hide();
        },100);
    });



    $(document).on('click','.order-product-other',function(e){
        if ($(this).hasClass('other-up')) {
            $(this).removeClass('other-up').html('显示明细<span class="order-icon"><i></i></span>');
            $(this).siblings().hide();
        }else{
            $(this).addClass('other-up').html('隐藏明细<span class="order-icon"><i></i></span>');
            $(this).siblings().show();
        };
    });



    // $(document).on("click", ".tl-col-right .btn", function () {
    //     var $this = $(this);
    //     var $item = $this.parents(".tl-item");
    //     $item.toggleClass("active")
    // })

    //<editor-fold desc="生日日历">
    var birthdayCalendar = lv.calendar({
        date: "1980-01-01",
        autoRender: false,
        trigger: ".js_smallcalendar",
        triggerEvent: "click",
        isBirthday: true,
        template: "birthday",
        minLimit: "1900-01",
        maxLimit: lv.calendar.dateFormat(new Date(), "yyyy-MM"),
        monthPrev: -1,
        monthNext: 0,
        dayPrev: -1,
        dayNext: 0,
        zIndex:29,
        //点击选择日期后的回调函数 默认返回值: calendar对象
        selectDateCallback: function () {
            var self = this;
            lv_validation.thisYz(self.$trigger,false);
        }
    });
    //</editor-fold>

    //<editor-fold desc="右侧模块悬浮">
    (function floatSide() {
        var $orderInfo = $('.orderTicketInfo-fix'),
            oldT = $orderInfo.offset().top,
            oldL = $orderInfo.offset().left,
            // $main_r_fixed = $('.orderInfo'),
            right_H = $orderInfo.height();

        $(window).scroll(function () {
            scrollMap();
        });
        scrollMap();

        function scrollMap() {
            var newT = $(document).scrollTop();
            var moveH = $(document.body).height() - newT - right_H;
            if (newT >= oldT) {
                if (moveH > 230) {
                    $orderInfo.css({'position': 'fixed', 'top': 0})
                } else {
                    $orderInfo.css({'position': 'fixed', 'top': moveH - 230});
                }

            } else {
                $orderInfo.removeAttr('style', '');
            }
        }
    })();
    //</editor-fold>

    //<editor-fold desc="底部浮动">
    var fixed_box = $('.fk_box_fixed');
    if (fixed_box.length > 0) {
        function fk_scroll() {
            var win_t = $(window).height() - fixed_box.height();
            var obj_t = fixed_box.offset().top;
            var scroll_t = $(document).scrollTop();
            if (scroll_t > obj_t - win_t) {
                //fixed_box.find('.fk_box').css('position', 'absolute')
                $(".JS_submit_group").hide();
            } else {
                //fixed_box.find('.fk_box').css('position', 'fixed')

                $(".JS_submit_group").show();
            }
        }

        $(window).scroll(function () {
            fk_scroll();
        });
        fk_scroll();

    }
    //</editor-fold>

    //<editor-fold desc="更多用户展开与收起">

    $(document).on('click','.js_name_shouqi', function () {
        var $this = $(this),
            $html = $(this).html();
        var $nameListbox = $(this).parent();

        if ($this.hasClass('btnUp')) {
            $this.removeClass('btnUp').html($html.replace('收起', "更多"));
            $nameListbox.removeClass('moreOpen');
        } else {
            $this.addClass('btnUp').html($html.replace('更多', '收起'));
            $nameListbox.addClass('moreOpen');
        }
    });
    //</editor-fold>

    //<editor-fold desc="展开收起">
    function expandMethod(options) {
        $(document).on("click", options.button, function () {
            var $a = $(this);
            var $expand = $a.parents(options.expand);
            var text = $expand.attr("data-text");
            if (!text) {
                text = "";
            }
            var $rows = $expand.parents(options.area);
            if ($rows.hasClass(options.expanded)) {
                $rows.removeClass(options.expanded);
                $expand.find("em").html("更多" + text);
            } else {
                $rows.addClass(options.expanded);
                $expand.find("em").html("收起" + text);
            }
        });
    }

    expandMethod({
        button: ".oag-expand a",
        expand: ".oag-expand",
        area: ".oag-rows",
        expanded: "oag-expanded"
    });
    expandMethod({
        button: ".oag-area-expand a",
        expand: ".oag-area-expand",
        area: ".oag-area",
        expanded: "oag-area-expanded"
    });
    //</editor-fold>

    //<editor-fold desc="可享促销展开">
    $('.youhui_list2').on('click', '.youhui_tit', function () {
        $('.js_nameFull,.js_popTips').remove();
        if (!$(this).hasClass('info_show')) {
            $(this).addClass('info_show').siblings('.youhui_info').show();
        } else {
            $(this).removeClass('info_show').siblings('.youhui_info').hide();
        }
    });
    //</editor-fold>

    //<editor-fold desc="手机号码放大">
    var bigHtml = '<div id="text_big" style="height:36px; line-height:36px; padding:0 10px; background:#FFFDE6;  border:#FFAA00 solid 1px; position:absolute; color:#333; font-family:Arial; font-size:20px; display:none;"></div>';
    $('body').append(bigHtml)
    $('.js_textBig').live('keyup', function () {
        var This = $(this);
        textBig(This);

    })
    $('.js_textBig').live('focus', function () {
        var This = $(this);
        var text = This.val();
        if (text.length > 0) {
            textBig(This);
        }
    })
    $('.js_textBig').live('blur', function () {
        $('#text_big').hide().html('');
    });

    function textBig(This) {
        var text = This.val();
        var L = This.offset().left;
        var T = This.offset().top - 37;
        var arr = [];
        for (var i = 0; i < text.length; i++) {
            arr.push(text.substring(i, i + 1));
            if (This.attr('type_name') == 'mobile') {
                if (i == 2 || i == 6) {
                    arr.push(" ");
                }
            } else if (This.attr('type_name') == 'user_ID') {
                if (i == 5 || i == 13) {
                    arr.push(" ");
                }
            }

        }
        $('#text_big').show().css({'left': L, 'top': T, 'min-width': $(This).outerWidth() - 22}).html(arr.join(''));
    }

    //</editor-fold>

    //<editor-fold desc="范例点击">
    (function Fanli() {
        var $fanliBox = $('.fanli_box');
        var $fanliExpBtn = $('.js_exp');
        $fanliExpBtn.live('hover', function (e) {
            e.stopPropagation();
            var obj = $(this);
            $fanliBox.show();
            fanlixy(obj);
        });
        $fanliExpBtn.on('click', function (e) {
            e.stopPropagation();
        });

        $(document).on('click', 'html', function (e) {
            $fanliBox.hide();
        });

        $fanliBox.live('click', function (e) {
            e.stopPropagation();
        });

        $(window).resize(function () {
            var obj = $('.js_exp');
            fanlixy(obj);
        });

        function fanlixy(obj) {
            if (obj.length > 0) {
                var L = obj.offset().left + obj.width() + 10,
                    T = obj.offset().top - 20;
                $fanliBox.css({'left': L, 'top': T});
            }

        }

        $('.fanli_tab li').hover(function () {
            var num = $(this).index();
            $(this).addClass('active').siblings().removeClass('active');
            $('.fanli_list li').eq(num).show().siblings().hide();
        });

        // 出境用户名填写 弹出范例填写提示
        $('.chujinUser .input').on('click', function (e) {
            e.stopPropagation();
            $fanliBox.show();
            fanlixy($fanliExpBtn);
        });
    })();
    //</editor-fold>

    $document.on("change", ".xieyi_ok [type=checkbox], .tpt-clause [type=checkbox]", function () {
        var $this = $(this);
        var checkState = $this.prop("checked");
        $(".xieyi_ok [type=checkbox], .tpt-clause [type=checkbox]").prop("checked", checkState);

        var ui = nova.ui({});
        ui.render();
    })

});

/**
 * author: rory zhou
 * date:2017-06-29
 * */
$(function () {
    //预订须知-查看更多
    $('.xieyi_gd').click(function () {
        var $this = $(this);
        if($this.html() === '查看更多'){
            $this.html('收起');
            $this.siblings('.lv-agree ').addClass('xieyi_show')
        }else {
            $this.html('查看更多');

            $this.siblings('.lv-agree ').removeClass('xieyi_show').animate({
                scrollTop: 0
            },20)
        }
    })
    var $document = $(document);
    //联系人提示
    var memberTip = {
        $target: null,
        $ulContainer: $('.members-tip-container'),
        $selectionsArr: [{
            name:'张启山',
            checked: false
        },{
            name:'郑丽君',
            checked: false
        },{
            name:'张启山',
            checked: true
        },{
            name:'张启山',
            checked: false
        }],
        $container: $('.cyr-info-container'),
        $inputs: $('.input-type-name'),
        init: function () {
            //this.getData(this.$selectionsArr);
            this.bindEvent();
        },
        getPosition: function () {
            //获取container的位置
            var dropT = this.$target.offset().top-this.$container.offset().top+this.$target.height();
            var dropL = this.$target.offset().left-this.$container.offset().left;
            this.$ulContainer.css({
                top: dropT+18,
                left: dropL
            });
            this.$ulContainer.show();
        },
        getData: function (selectionsArr) {
            this.$ulContainer.empty();
            for(var i = 0;i < selectionsArr.length;i++){
                var li = $('<li></li>');
                if(selectionsArr[i].checked){
                    li.addClass('disabled')
                }else {
                    li.addClass('member-li')
                }
                li.html(selectionsArr[i].name)
                this.$ulContainer.append(li);
            }
        },
        bindEvent: function () {
            var self = this;
            this.$inputs.click(function (e) {
                self.$target = $(e.target);
                //self.getData(self.$selectionsArr);
                self.getPosition();
            });
            //选择常用联系人
            $document.on('mousedown','.member-li',function () {
                self.changeMember($(this).index(),true)
                //TODO 填写Input

            });
            //清除form
            $document.on('mousedown','.clear-form',function () {
                var $thisForm = $(this).parents('.inputBox');
                $thisForm.find('input').val('');
                $thisForm.find('.error_text').hide();
                //TODO 判断是否需要还原常用联系人

            });

            this.$inputs.blur(function (e) {
                self.$ulContainer.hide();
            });
        },
        changeMember: function (index,checkedBl) {
            this.$selectionsArr[index].checked = checkedBl;
        }
    }
    memberTip.init();

    //退改签提示
    //poptip
    $('.js-tips').poptip({
        offsetX: -26
    });
});