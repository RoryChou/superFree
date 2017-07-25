/**
 * Created by rory on 2017/6/7.
 */
$(function(){

    //默认事件取消弹窗等
    $(document).on('click',function(e){
        $('.detail_from_city').hide();
    });

    //标签提示文字
    $(".js_tip,.detail_product_tit .tagsback").poptip({place : 6});

    $(".js_tip12").poptip({place : 12});

    //自定义下拉框
    //pandora.selectModel({'autoWidth':false, 'selectElement': $('.room_num,.select_time')});

    //展开房型
    $(document).on('click','.btn_list_more',function(e){
        var $this = $(this),
            typeText = $this.attr('data-type')+'<i class="detail_icon detail_icon_jt1"></i>';
        if ($this.hasClass('list_more_close')) {
            $this.removeClass('list_more_close').html('更多'+typeText);
            if ($this.siblings('table').find('th').length>0) {
                $this.siblings('table').find('tr:gt(1)').hide();
            }else{
                $this.siblings('table').find('tr:gt(0)').hide();
            };

            if (typeof moreCallback == 'function') {
                moreCallback($this);
            };
        }else{
            $this.addClass('list_more_close').html('收起'+typeText);
            $this.siblings('table').find('tr').show();
        };
    });


    //展开更多可选服务
    $(document).on('click','.btn_serve_more',function(e){
        var $this = $(this),
            typeText = $this.attr('data-type')+'<i class="detail_icon detail_icon_jt1"></i>';
        if ($this.hasClass('list_more_close')) {
            $this.removeClass('list_more_close').html('展开'+typeText);
            $this.siblings('.booking_serve_list:gt(0)').hide();
            $this.siblings('.booking_serve_list').eq(0).find('tr:gt(1)').hide();
        }else{
            $this.addClass('list_more_close').html('收起'+typeText);
            $this.siblings('.booking_serve_list:gt(0)').show();
            $this.siblings('.booking_serve_list').eq(0).find('tr:gt(1)').show();
        };
    });


    //出发城市展开弹层
    $(document).on('click','.js_start_city',function(e){
        e.preventDefault();
        e.stopPropagation();
        var L = $(this).offset().left,
            T = $(this).offset().top,
            H = $(this).outerHeight(true);
        $('.detail_from_city').css({'left':L,'top':T+H}).slideDown(200);
    });
    //出发城市切换
    $(document).on('click','.from_city_tab li',function(e){
        e.preventDefault();
        e.stopPropagation();
        var num = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $(this).parent().siblings('.from_city_list').find('li').eq(num).show().siblings().hide();
    });
    //出发城市选择
    $(document).on('click','.from_city_list a',function(e){
        if (!$(this).hasClass('stop_sell')){
            var cityName = $(this).find('b').text();
            $('.js_start_city .start_city_input').text(cityName);
            $('.detail_from_city').slideUp(200);
        }else{
            return false;
        };

    });

    // 自定义复选框
    $(document).on('click','.js_checkbox',function(e){
        var $this = $(this);
        if ($this.hasClass('checkbox_ok')) {
            $this.removeClass('checkbox_ok');
        }else{
            $this.addClass('checkbox_ok');
        };
    });


    /*多行程切换*/
    $('.instance_tab li').click(function(){
        var num = $(this).index(),
            L = $(this).offset().left,
            pL = $(this).parent().offset().left,
            W = $(this).outerWidth(),
            jtL = L-pL+W/2-10;
        $(this).addClass('active').siblings().removeClass('active');
        $('.instance_list li').eq(num).show().siblings().hide();
        $('.instance_list2_box').each(function(){
            $(this).find('.instance_list2').eq(num).show().siblings().hide();
        });
        $('.instance_jt').css('left',jtL);
    });


    $('.travel-fixed').each(function(){
        var This = $(this)
        setTimeout(function(){
            This.find('li').eq(0).addClass('active');
        },300)
    })

    for(var i=1;i<=$('.instance_tab li').length;i++){
        $('#J_scrollnav'+i).scrollNav({
            thisName:'active', //导航高亮class，默认是active
            difference: 84 //滚动差值，默认是取导航高度
        });
    }

    /*
     * 行程介绍交通标签切换效果
     */
    var $trafficType = $(".traffic-type");
    $trafficType.each(function(){
        $(this).find('li').bind("click", function (e) {
            var $currentTarget = $(e.currentTarget),
                dest = $currentTarget.data("traffic");
            $(this).addClass('active').siblings().removeClass("active");
            $("#" + dest + "-container").show().siblings().hide();
            automaticHeight();
        });
    });


    // 线路推荐
    $('#product-recommend').on('click','.product-line-tab li',function(){
        $productnum = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $(this).parents('.product-line-tab').siblings('.product-line-list').eq($productnum).show().siblings('.product-line-list').hide();
    });
    var $titleTab = $('.title-tab li');
    $titleTab.click(function(){
        $titlenum = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $(this).parent().parent().siblings('.product-content').eq($titlenum).show().siblings('.product-content').hide();
    });
    $('.product-line-list li').hover(function(){
        $(this).find('.product-line-bg').show();
    },function(){
        $(this).find('.product-line-bg').hide();
    });


    //hover标题展示信息
    var tit_timer = null;
    window.titleHover = function(self,showId){
        var L = self.offset().left,
            T = self.offset().top,
            H = self.height();
        clearTimeout(tit_timer);
        showId.show().css({'left':L,'top':T+H+5});
    };
    $(document).on('mouseover','.title_float_box',function(e){
        clearTimeout(tit_timer);
    });

    //鼠标离开  隐藏标题展示信息
    $(document).on('mouseout','.table_list_name,.title_float_box',function(e){
        tit_timer = setTimeout(function(){
            $('.title_float_box').hide();
        },300);
    });



    //点击切换航班推荐和组合
    $(document).on('click','.cgFlightAll_tab li',function(e){
        var num = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $('.cgFlightAll .changeBox-clear').eq(num).show().siblings('.changeBox-clear').hide();
    });


    //点击切换自由组合 去程 返程
    $(document).on('click','.cgFlight-goback-tb li',function(e){
        var num = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $(this).parent().siblings('.cgFlight-goback-list').eq(num).show().siblings('.cgFlight-goback-list').hide();
    });


    //点击切换酒店详情弹窗内容
    $(document).on('click','.cgDetail_tab li',function(e){
        var num = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $(this).parent().siblings('.cgDetail_list').eq(num).fadeIn(400).siblings('.cgDetail_list').hide();
    });



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



    //酒店详情弹窗 图片切换
    var $jsScroll = $('.js_cgDetail_scroll');
    $(document).on('click','.img_type_tab a',function(e){
        var num = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $jsScroll.eq(num).show().siblings('.js_cgDetail_scroll').hide();
    });

    $('.js_cgDetail_scroll').each(function(){
     $(this).imgScroll1({
     migBox: '.img_scroll_box', //运动列表ul的父级；
     tabBox: '.img_scroll_tab',   //切换列表ul的父级
     btnL : '.img_scroll_l',    //左按钮
     btnR : '.img_scroll_r',    //右按钮
     tab_name : 'active',  //切换高亮状态的class
     runStyle : 1         //大图切换方式，1是左右滚动，2是渐变切换
     });
     })


    $(document).on('click','.JS_menuMore',function(e) {
        e.preventDefault();
        e.stopPropagation();
        var $me = $(this),
            $p = $me.parents('dl'),
            $d = $p.find('dd'),
            html = $me.html();

        if ( $p.hasClass('showAll') ) {
            $p.removeClass('showAll');
            $d.filter(':gt(3)').not('.JS_menuMore').hide();
            $me.html(html.replace('收起','展开全部'));
        } else {
            $p.addClass('showAll');
            $d.show();
            $me.html(html.replace('展开全部','收起'));
        }

    });


    $(document).on('click','.JS_moreSpace',function(){
        var $me = $(this),
            $oP = $me.parents('.tl-detail'),
            $group = $me.parents('.tl-group'),
            val = $me.html();

        //文字替换
        if ( $oP.hasClass('allSpace') ) {
            $oP.removeClass('allSpace');
            $me.html(val.replace('收起','更多'));
        } else {
            $oP.addClass('allSpace');
            $me.html(val.replace('更多','收起'));
        }

        //组合显示总选择按钮
        if ( $group ) {
            $group.find('.allSpace').length ? $group.addClass('open') : $group.removeClass('open');
        }
    });

});


// 弹窗原型
function myAlert(elem) {
    this.o = elem;
};
myAlert.prototype = {
    opcity : $('.opacityBox'),
    init: function() {
        var self = this;
        // this.o.find('.detailIcon-close').live('click', function(event) {
        //     self.close();
        // });

        this.o.on('click','.detailIcon-close',function(){
            self.close();
        });

        // this.opcity.click(function(event){
        //     self.close();
        // });

        this.initOther && this.initOther()
    },
    hasAlert:function(){
        var isHide = true;
        for (var i = 0; i < $('.changeBox').length; i++) {
            if (!$('.changeBox').eq(i).is(':hidden')) {
                isHide = false;
            };
        };
        if (isHide) {
            return false;
        }else{
            return true;
        };
    },
    open: function() {
        var self = this;

        if (this.hasAlert()) {
            this.opcity.css('z-index',100);
            this.o.css('z-index',100);
        };


        this.o.show();

        //计算高度
        this.myResize();
        this.opcity.show();

        //阻止body滚动
        $('body').css('overflow','hidden');



    },
    close: function() {
        this.o.hide();

        if (!this.hasAlert()) {
            this.opcity.hide();
        };

        this.opcity.css('z-index',99);
        this.o.css('z-index',99);

        //放开body滚动
        $('body').css('overflow','auto');
    },
    myResize: function(){
        winH = $(window).height();

        if ( this.o.hasClass('cgFlight') || this.o.hasClass('cgFlightAll') ) {
            //机酒自适应高度
            // 可视区域小于弹窗最大高度
            if ( winH < 820 ) {

                this.o.css({'height':winH - 40,'marginTop': -(winH-40)/2});
                this.menu.css({'height':winH - 136});
                this.menuCon.css({'height':winH - 191});
                this.con.css({'height':winH - 126});
                this.list.css({'height':winH - 221});
            }
        } else if( this.o.hasClass('cgHotel') ) {
            //更换酒店自适应高度
            if ( winH < 768 ) {
                this.o.css({'height':winH - 103,'marginTop': -(winH-46)/2});
                this.cgHotelScroll.css({'height':winH - 170});
            }

        } else{
            //更换酒店自适应高度
            if ( winH < 768 ) {
                this.o.css({'height':winH - 103,'marginTop': -(winH-46)/2});
                this.cgHotelScroll.css({'height':winH - 170});
            }

        }

    }
};

//更换机酒
var changeFlight = new myAlert($('.cgFlight'));

// 机酒弹窗添加其他属性及方法调用
changeFlight.initOther = function() {
    var self = this;
    self.menu = $('.changeBox-menu');
    self.con =  $('.changeBox-con');
    self.list = $('.cgFlight-list');
    self.menuCon = $('.cgFlight-mune-scroll');
}


//初使化并添加其他方法
changeFlight.init();

//changeFlight.open();

//更换机票
var changeFlightAll = new myAlert($('.cgFlightAll'));
// 机酒弹窗添加其他属性及方法调用
changeFlightAll.initOther = function() {
    var self = this;
    self.menu = $('.changeBox-menu');
    self.con =  $('.changeBox-con');
    self.list = $('.cgFlight-list');
    self.menuCon = $('.cgFlight-mune-scroll');
};
changeFlightAll.init();


//更换酒店弹窗
var changeHotel = new myAlert($('.cgHotel'));
changeHotel.initOther = function() {
    this.cgHotelScroll = this.o.find('.cgHotel-scroll');
};

changeHotel.init();

//更换酒店套餐
var changePackage = new myAlert($('.cgPackage'));
changePackage.initOther = function() {
    this.cgHotelScroll = this.o.find('.cgHotel-scroll');
};

changePackage.init();

//酒店明细弹窗
var changecgHotelDetail = new myAlert($('.cgHotelDetail'));
changecgHotelDetail.initOther = function() {
    this.cgHotelScroll = this.o.find('.cgHotel-scroll');
};

changecgHotelDetail.init();


var changecgTicketDetail = new myAlert($('.cgTicketDetail'));
changecgTicketDetail.initOther = function() {
    this.cgHotelScroll = this.o.find('.cgHotel-scroll');
};

changecgTicketDetail.init();







