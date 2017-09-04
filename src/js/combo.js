/**
 * Created by rory on 2017/6/12.
 */
$(function () {

    //poptip
    $('.js-tips').poptip({
        offsetX : -26
    });

    //poptip ajax
    // 退改签
    var timeId = null;
    $document.on("mouseover", ".tui-gai-qian", function () {
        var $this = $(this);
        var $tgqInfo = $(".tgq-info");
        clearTimeout(timeId);
        $tgqInfo.hide();
        $(".tgq-loading").show();
        $(".tgq-info .tgq-info-part").hide();
        // TODO: 填充内容

        var thisL = $this.offset().left,
            thisT = $this.offset().top,
            thisH = $this.outerHeight(true);

        var left = thisL - 12;

        if (thisL + $tgqInfo.outerWidth(true) > $(window).width()) {
            left = thisL - 379;
            $tgqInfo.addClass("tgq-info-left");
        } else {
            $tgqInfo.removeClass("tgq-info-left");
        }

        $tgqInfo.show().css({
            'left': left,
            'top': thisT + thisH + 10
        });
        setTimeout(function () {
            $(".tgq-loading").hide();
            if ($this.parents(".JS-tl-ac-part").length) {
                $(".tgq-info-part-ac").show();
            } else {
                $(".tgq-info-part-default").show();
            }
        }, 200);
    });

    $document.on("mouseout", ".tui-gai-qian", function () {
        timeId = setTimeout(function () {
            $('.tgq-info, .tgq-info-part').hide();
        }, 200);
        $('.tgq-info').off("mouseenter mouseleave");
        $('.tgq-info').mouseenter(function () {
            clearTimeout(timeId);
        }).mouseleave(function () {
            $(this).hide();
        });
    });

    // 机型
    $document.on("mouseover", ".plane-type", function(){
        clearTimeout(timeId);
        var $this = $(this);
        var $planeInfo = $(".plane-info");
        var $planeInfoDetail = $(".plane-info-detail");
        var thisL = $this.offset().left,
            thisT = $this.offset().top,
            thisH = $this.outerHeight(true);

        $planeInfoDetail.find(".pi-plan").text($this.data("plan"));
        $planeInfoDetail.find(".pi-name").text($this.data("name"));
        $planeInfoDetail.find(".pi-type").text($this.data("type"));
        $planeInfoDetail.find(".pi-min").text($this.data("min"));
        $planeInfoDetail.find(".pi-max").text($this.data("max"));

        var left = thisL - 12;

        if(thisL + $planeInfo.outerWidth(true) >$(window).width()){
            left = thisL - 381;
            $planeInfo.addClass("plane-info-left");
        } else {
            $planeInfo.removeClass("plane-info-left");
        }

        $('.plane-info').show().css({
            'left': left,
            'top': thisT + thisH + 10
        });
        $('.plane-info-loading').show();
        $planeInfoDetail.hide();


        //模拟异步加载
        setTimeout(function(){

            $('.plane-info-loading').hide();
            $planeInfoDetail.show();

            $planeInfoDetail.find(".pi-plan").text($this.data("plan"));
            $planeInfoDetail.find(".pi-name").text($this.data("name"));
            $planeInfoDetail.find(".pi-type").text($this.data("type"));
            $planeInfoDetail.find(".pi-min").text($this.data("min"));
            $planeInfoDetail.find(".pi-max").text($this.data("max"));

        },2000);//模拟异步加载
    });

    $document.on("mouseout", ".plane-type", function(){
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

    //点击展开
    var $top = 0;
    $document.on('click','.list-ticket-more',function () {
        var $this = $(this);
        if(!$this.hasClass('list-ticket-close')){
            $this.siblings('.list-ticket-li').show();
            $this.addClass('list-ticket-close');
            $this.html('收起全部门票<i></i>');
            $top = $document.scrollTop();
        }else {
            $this.siblings('.list-ticket-li').filter(':gt(2)').hide();
            $('html,body').animate({
                scrollTop:$top
            },300);
            $this.removeClass('list-ticket-close');
            $this.html('展开全部门票<i></i>');
        }
    })


    //hover出现加入购物车按钮
    $document.on('mouseover','.list-left-wrapper',function () {
        if (!$(this).parent().hasClass('list-ticket')) {
            $(this).find('.btn-add-cart-new').show();
        }
    });
    $document.on('mouseout','.list-left-wrapper',function () {
        $(this).find('.btn-add-cart-new').hide();
    });

    $document.on('mouseover','.list-ticket-li',function () {
        $(this).find('.btn-add-cart-new').show();
    });
    $document.on('mouseout','.list-ticket-li',function () {
        $(this).find('.btn-add-cart-new').hide();
    });
});
