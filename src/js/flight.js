/**
 * Created by rory on 2017/6/6.
 */
$(function() {
    var $document = $(document);

    // 筛选条件复选框
    $(".select-div input[type=checkbox]").on("click", function () {
        var $this = $(this);
        var desc = $this.data("desc");
        var selectIndex = $(".select-div").index($this.parents(".select-div"));
        var checkboxIndex = $this.parents("li").index();
        var $frResult = $(".filter-result");
        var $frContent = $(".fr-content");
        if ($this.prop("checked")) {
            // 加条件
            if (!$(".ft-main").hasClass("ft-main-fixed")) {
                $frResult.show();
            }
            var newCondition = '<span ' + 'data-select="' + selectIndex + '" ' + 'data-check="' + checkboxIndex + '" ' + '>' + desc + '<a class="fr-close" title="删除" href="javascript:;">×</a></span>';

            // 排序
            var positionIndex = -1;
            var $spanList = $frContent.find("span");
            for (var i = 0; i < $spanList.length; i++) {
                if ($spanList.eq(i).data("select") > selectIndex) {
                    positionIndex = i;
                    break;
                }
            }
            if (positionIndex != -1) {
                $spanList.eq(positionIndex).before(newCondition);
            } else {
                $frContent.find(".fr-close-all").before(newCondition);
            }
        } else {
            // 减条件
            $frContent.find("span[data-select=" + selectIndex + "]" + "[data-check=" + checkboxIndex + "]").remove();
            if ($frContent.find("span").length == 0) {
                $frResult.hide();
            }
        }
    });

    // 删除筛选条件
    $(".ft-filter").on("click", ".fr-close", function () {
        var $thisCondition = $(this).parent();
        var selectIndex = $thisCondition.data("select");
        var checkboxIndex = $thisCondition.data("check");
        $thisCondition.remove();
        $(".filter-main .select-div").eq(selectIndex).find("li").eq(checkboxIndex).find("input[type=checkbox]").prop("checked", false);
        if ($(".fr-content").find("span").length == 0) {
            $(".filter-result").hide();
        }
    });

    // 清空筛选条件
    $(".fr-close-all").on("click", function () {
        var $this = $(this);
        $this.siblings("span").remove();
        $this.parents(".filter-result").hide();
        $this.parents(".ft-filter").find(".select-div input[type=checkbox]").prop("checked", false);
    });

    // 价格日历滑动
    $document.on("click", ".ft-price-calendar a:not(.slider-btn-disable)", function () {
        console.log(123)
        var $this = $(this);
        var $innerBox = $(".ft-price-box-inner");
        var width = $(".ft-price-box").css("width");
        var removeStr = ".ft-price-box-inner ul:";

        $(".slider-btn-right").removeClass("color-e38");

        // TODO:填充html, 填充isLeftDisable,isRightDisable
        var html = $(".ft-calendar-template").html();
        var isLeftDisable = false;
        var isRightDisable = false;

        if (isLeftDisable) {
            $(".slider-btn-left").addClass("slider-btn-disable");
        }
        if (isRightDisable) {
            $(".slider-btn-right").addClass("slider-btn-disable");
        }

        if ($this.hasClass("slider-btn-right")) {
            $innerBox.append(html);
            $innerBox.stop(true, true).animate({"left": "-" + width}, 500, function () {
                $(removeStr + "first").remove();
                if ($innerBox.find("li:last").hasClass("active")) {
                    $(".slider-btn-right").addClass("color-e38");
                }
                $innerBox.css("left", "0");
            });
        } else {
            $innerBox.prepend(html);
            $innerBox.css("left", "-" + width);
            $innerBox.stop(true, true).animate({"left": 0}, 500, function () {
                $(removeStr + "last").remove();
                if ($innerBox.find("li:last").hasClass("active")) {
                    $(".slider-btn-right").addClass("color-e38");
                }
            });
        }
    });

    $document.on("click", ".ft-price-calendar li", function () {
        var $this = $(this);
        //var $sliderRightBtn = $(".slider-btn-right");
        $this.addClass("active").siblings().removeClass("active");
        // TODO 刷新列表
    });

    var lastTime = new Date();
    var TEN_MINUTE = 10 * 60 * 1000;

    //mousemove事件
    $document.on("mousemove", mousemove);

    //200ms执行一次事件
    function mousemove() {
        $document.off("mousemove", mousemove);
        setTimeout(function () {
            checkTimeAgain();
        }, 200);

    }

    function checkTimeAgain() {
        var now = new Date();
        var diff = now - lastTime;

        if (diff > TEN_MINUTE) {
            showTimeout();
            setTimeout(function(){
                window.location.reload();
            }, 1000);
        }
        lastTime = now;
        $document.off("mousemove", mousemove);
        $document.on("mousemove", mousemove)
    }

    // 选择按钮 2016-07修改
    var $ftMain = $(".ft-main");
    $document.on("click", ".ticket-list .tl-item", function () {
        var $this = $(this);
        var isOpen = $this.hasClass("tl-item-open");
        if (!isOpen) {
            // 展开时收起其他的
            var $items = $this.siblings(".tl-item-open");
            $items.each(function () {
                $(this).find(".select-btn").click();
            });
            // 滚动到对应位置
            var fixedHeight = 90;
            var hasPadding = $ftMain.hasClass('ft-main-fixed');
            var itemTop = $this.offset().top - fixedHeight - 10;
            if (!hasPadding) {
                // 80为了$(".ticket-list")的padding值
                fixedHeight = fixedHeight + $(".search").outerHeight() + 110;
                itemTop = $this.offset().top - fixedHeight;
            }
            $("html, body").stop(true, true).animate({scrollTop: itemTop}, 500);
        }

        // 异步加载
        if (!isOpen && !$this.hasClass('js-tl-loaded')) {
            setTimeout(function () {
                // TODO 开发去除setTimeout

                $.ajax({
                    url: "_flight-list-template.html"
                }).done(function (data) {
                    $this.find(".tl-detail").after(data);
                    $this.find(".tl-item-loading").remove();
                    $this.addClass('js-tl-loaded');
                }).error(function (e) {
                    //console.error(e);
                });
            }, 2000);
        }


        $this.toggleClass("tl-item-open");
//            if($this.find(".flight-warning").length == 0) {
////                if($this.hasClass("tl-item-open")){
////                    $this.css("padding-bottom","40px");
////                } else {
////                    $this.css("padding-bottom","20px");
////                }
//            }
        // 收起
        if ($this.hasClass("tl-item-open") && $this.find(".tl-all").hasClass("tl-all-open")) {
            $this.find(".tl-more-btn").click();
        }
        // 2016-07 第一个航班
        $this.find(".tl-part").show();
    });

    // 更多舱位
    $document.on("click", ".tl-more-btn", function (e) {
        e.stopPropagation();
        var $this = $(this);
        var $thisAll = $this.parents(".tl-all");
        if ($thisAll.hasClass("tl-all-open")) {
            $this.html("更多舱位（共<em>8</em>个）<i></i>");
            var $part = $thisAll.find(".tl-part");
            $thisAll.find(".tl-part:gt(2)").hide();
            for (var i = 0; i < $part.length; i++) {
                var num = $part.eq(i).data("num") - 1 >= 0 ? $part.eq(i).data("num") - 1 : 0;
                $part.eq(i).find("li:gt(" + num + ")").hide();
            }
        } else {
            $thisAll.find(".tl-part").show();
            $thisAll.find("li").show();
            $this.html("收起更多舱位<i></i>");
        }
        $thisAll.toggleClass("tl-all-open");
    });


    //日历框的弹出
    /*var salesCalendar = lv.calendar({
     autoRender: false,
     trigger: ".ft-pc",
     triggerEvent: "click",
     bimonthly: true,
     wrapClass: "sales-calendar",
     selectDateCallback: function(that){
        alert("所选日期：" + that.getSelect()[0])
     },
     //数据加载完成并显示出日历后的回调函数,点击上下月回调函数。
     completeCallback: function () {
         this.loading();
         // 边框样式调整
         var $cal = $(".sales-calendar");
         var $ftPrice = $(".ft-price-calendar");
         var left = $ftPrice.offset().left+261;
         var top = $ftPrice.offset().top+55;
         $cal.css({
         left: left,
         top: top,
         width: 940
     });
     // var $calbox = $('.ft-main .ui-calendar .calbox');
     // $calbox.eq(0).css("border-left","1px solid #dcdcdc");
     // $calbox.eq(1).css("border-right","1px solid #dcdcdc");
     // $calbox.find("tbody tr:last td").css("border-bottom-width","0");

     $cal.append("<div class='ftc-tip'><i></i>因票价变动频繁，请以实时查询报价为准</div>");

     // //日历数据填充
     $('.sales-calendar td').each(function(){
     var $this = $(this);
     var $calactive = $this.find('.calactive'); //提示信息
     var $calprice = $this.find('.calprice'); //价格信息
     var dateMap = $this.attr('data-date-map');//日历时间


     //模拟填充
     if (dateMap == '2016-07-30') {
     $calprice.html('<i>¥</i>'+'1670');
     }

     //模拟填充“低”标签
     if (dateMap == '2016-09-15' || dateMap == '2016-07-27') {
     $calprice.html('<i>¥</i>' + '711');
     if (!$calactive.find(".callow").length) {
     $calactive.prepend('<div class="callow">低</div>');
     }
     $calactive.show();
     }

     //模拟填充已选日期
     if (dateMap == '2016-07-28') {
     $calprice.html('<i>¥</i>'+'1711');
     $this.addClass('td-selected');
     $this.find('.caldate').addClass("nodate");//设为不可点击
     }

     //模拟填充售罄
     if (dateMap == '2016-07-29') {
     $calprice.html('售罄');
     $this.addClass('calSoldout');
     $this.find('.caldate').addClass("nodate");
     }

     // //模拟填充 查看详情
     if (dateMap == '2016-07-31') {
     $calprice.html('点击查看');
     $this.addClass('calMore');
     }

     });

     this.loaded();

     }
     });*/
    $(function(){
        //异步加载套餐列表开始
        /*var fromId=null;
        fromId=$("#districtId").val();
        $.ajax({
            url:"http://www.lvmama.com/date/packages.do",
            type:"get",
            dataType:"json", //设置请求头信息
            data:{
                onSaleNearDate:'2017-06-09',
                startId:fromId,
                productId:'1493223'
            },
            success: function (data) {
                if(data.flg){
                    concole.log("Sync Package List Success");
                }else{
                    concole.log("Sync Package List Failed");
                }
            }
        });*/
        //异步加载套餐列表结束
        //日历框的弹出
        $(document).on('click','.js-pop-calender',function(){
            // 特价日历
            var date='2017-06-12';
            var startDate=date.split('-');
            var y = startDate[0];
            var m = startDate[1]-1;
            var d = startDate[2];
            var myBigCalendar = lv.calendar({
                date:lv.calendar.dateFormat(new Date(y,m,d), "yyyy-MM-dd"),
                autoRender: true,  //自动渲染日历
                trigger: ".canderBox1",  //触发的位置
                triggerEvent: "click",  //响应的触发事件 自动渲染时此参数无效
                isTodayClick: true,
                zIndex: 1000,
                sourceFn: fillData,  //填充时间价格表
                selectDateCallback:function (that) {
                    var select=that.getSelect();
                    var dateMap=select[0];
                    var jumpFlg=$("#jumpFlg").val();
                    $("#visitTime").val(dateMap);
                    if($("#seltntpkgid").val()!='null'){
                        $("#sellPackageHidden").val($("#seltntpkgid").val());
                    }
                    $('.canderBox1').hide();
                    $('.pop-layer-reply-fade').remove();
                    $('.ui-calendar').remove();
                    $(".calhover").remove();
                    var station= $("#districtId").val();
                    var buCode = $("#buCode").val();
                    var categorySubType = $("#categorySubType").val();
                    var categoryType = $("#categoryType").val();
                    $.ajax({
                        type: "post",
                        async: false,
                        dataType: "html",
                        url: "http://www.lvmama.com/seckill/route/tntpackage.do",
                        data: {
                            startDate: dateMap,
                            endDate:dateMap,
                            startId:station,
                            productId:'1493223',
                            branchType:'PROD',
                            productStatic:'ptcp',
                            seckillStatus:'starting',
                            packageType:'LVMAMA',
                            priceUnit:'起/人',
                            buCode:buCode,
                            categoryType:categoryType,
                            categorySubType:categorySubType
                        },
                        success: function(data) {
                            $("#packageDataId").html(data);
                            //重新给展开套餐绑定事件start
                            $('.js-overflow-control').each(function(){
                                var $this=$(this),
                                    $tr=$this.find('tbody tr'),
                                    $span=$this.find('.js-packing-control');
                                if($tr.length>5)
                                {
                                    $this.find('tbody tr:gt(4)').hide();
                                }

                                $span.on('click',function(){
                                    var This=$(this);
                                    $i=This.find('i');
                                    if($i.hasClass('arrow-down'))
                                    {
                                        $tr.show();
                                        $(this).html('收起全部套餐<i></i>');
                                    }
                                    else
                                    {
                                        $this.find('tbody tr:gt(4)').hide();
                                        $(this).html('展开全部套餐<i class="arrow-down"></i>');
                                    }
                                });
                            });
                            //重新给展开套餐绑定事件end
                            //if (data.success) {
                            $("input[name='visitTime']").val(dateMap);

                            $('.canderBox1').hide();
                            $('.pop-layer-reply-fade').remove();
                            $('.ui-calendar').remove();
                            //$('.js-close-calender').click();
                            //横排日历居中显示start
                            var curr=0;
                            var dayPriceList=null;
                            dayPriceList=[{"date":"2017-06-12","number":"充足","price":3130,"route":"","routeId":"","week":"周一"},{"date":"2017-06-13","number":"充足","price":3130,"route":"","routeId":"","week":"周二"},{"date":"2017-06-14","number":"充足","price":3080,"route":"","routeId":"","week":"周三"},{"date":"2017-06-15","number":"充足","price":3400,"route":"","routeId":"","week":"周四"},{"date":"2017-06-16","number":"充足","price":3330,"route":"","routeId":"","week":"周五"},{"date":"2017-06-17","number":"充足","price":3400,"route":"","routeId":"","week":"周六"},{"date":"2017-06-18","number":"充足","price":3430,"route":"","routeId":"","week":"周日"},{"date":"2017-06-19","number":"充足","price":3130,"route":"","routeId":"","week":"周一"},{"date":"2017-06-20","number":"充足","price":3430,"route":"","routeId":"","week":"周二"},{"date":"2017-06-21","number":"充足","price":3430,"route":"","routeId":"","week":"周三"},{"date":"2017-06-22","number":"充足","price":3680,"route":"","routeId":"","week":"周四"},{"date":"2017-06-23","number":"充足","price":3480,"route":"","routeId":"","week":"周五"},{"date":"2017-06-24","number":"售完","price":"","route":"","routeId":"","week":"周六"},{"date":"2017-06-25","number":"充足","price":3700,"route":"","routeId":"","week":"周日"},{"date":"2017-06-26","number":"充足","price":3690,"route":"","routeId":"","week":"周一"},{"date":"2017-06-27","number":"售完","price":"","route":"","routeId":"","week":"周二"},{"date":"2017-06-28","number":"售完","price":3680,"route":"","routeId":"","week":"周三"},{"date":"2017-06-29","number":"售完","price":"","route":"","routeId":"","week":"周四"},{"date":"2017-06-30","number":"售完","price":3880,"route":"","routeId":"","week":"周五"},{"date":"2017-07-01","number":"售完","price":"","route":"","routeId":"","week":"周六"},{"date":"2017-07-02","number":"售完","price":"","route":"","routeId":"","week":"周日"},{"date":"2017-07-03","number":"充足","price":3780,"route":"","routeId":"","week":"周一"},{"date":"2017-07-04","number":"充足","price":4130,"route":"","routeId":"","week":"周二"},{"date":"2017-07-05","number":"充足","price":3980,"route":"","routeId":"","week":"周三"},{"date":"2017-07-06","number":"充足","price":4130,"route":"","routeId":"","week":"周四"},{"date":"2017-07-07","number":"充足","price":3980,"route":"","routeId":"","week":"周五"},{"date":"2017-07-08","number":"充足","price":4100,"route":"","routeId":"","week":"周六"},{"date":"2017-07-09","number":"充足","price":4000,"route":"","routeId":"","week":"周日"},{"date":"2017-07-10","number":"充足","price":3930,"route":"","routeId":"","week":"周一"},{"date":"2017-07-11","number":"售完","price":"","route":"","routeId":"","week":"周二"},{"date":"2017-07-12","number":"充足","price":3980,"route":"","routeId":"","week":"周三"},{"date":"2017-07-13","number":"充足","price":4000,"route":"","routeId":"","week":"周四"},{"date":"2017-07-14","number":"充足","price":3980,"route":"","routeId":"","week":"周五"},{"date":"2017-07-15","number":"充足","price":4000,"route":"","routeId":"","week":"周六"},{"date":"2017-07-16","number":"充足","price":4000,"route":"","routeId":"","week":"周日"},{"date":"2017-07-17","number":"充足","price":3880,"route":"","routeId":"","week":"周一"},{"date":"2017-07-18","number":"充足","price":4130,"route":"","routeId":"","week":"周二"},{"date":"2017-07-19","number":"充足","price":3980,"route":"","routeId":"","week":"周三"},{"date":"2017-07-20","number":"充足","price":4000,"route":"","routeId":"","week":"周四"},{"date":"2017-07-21","number":"充足","price":4000,"route":"","routeId":"","week":"周五"},{"date":"2017-07-22","number":"充足","price":4000,"route":"","routeId":"","week":"周六"},{"date":"2017-07-23","number":"充足","price":4000,"route":"","routeId":"","week":"周日"},{"date":"2017-07-24","number":"充足","price":3980,"route":"","routeId":"","week":"周一"},{"date":"2017-07-25","number":"充足","price":4000,"route":"","routeId":"","week":"周二"},{"date":"2017-07-26","number":"充足","price":4000,"route":"","routeId":"","week":"周三"},{"date":"2017-07-27","number":"充足","price":4000,"route":"","routeId":"","week":"周四"},{"date":"2017-07-28","number":"充足","price":4000,"route":"","routeId":"","week":"周五"},{"date":"2017-07-29","number":"充足","price":4000,"route":"","routeId":"","week":"周六"},{"date":"2017-07-30","number":"充足","price":4000,"route":"","routeId":"","week":"周日"},{"date":"2017-07-31","number":"充足","price":4000,"route":"","routeId":"","week":"周一"},{"date":"2017-08-01","number":"充足","price":4000,"route":"","routeId":"","week":"周二"},{"date":"2017-08-02","number":"充足","price":4000,"route":"","routeId":"","week":"周三"},{"date":"2017-08-03","number":"充足","price":4000,"route":"","routeId":"","week":"周四"},{"date":"2017-08-04","number":"充足","price":4230,"route":"","routeId":"","week":"周五"},{"date":"2017-08-05","number":"售完","price":"","route":"","routeId":"","week":"周六"},{"date":"2017-08-06","number":"充足","price":4130,"route":"","routeId":"","week":"周日"},{"date":"2017-08-07","number":"充足","price":3890,"route":"","routeId":"","week":"周一"},{"date":"2017-08-08","number":"充足","price":4130,"route":"","routeId":"","week":"周二"},{"date":"2017-08-09","number":"充足","price":4030,"route":"","routeId":"","week":"周三"},{"date":"2017-08-10","number":"充足","price":4230,"route":"","routeId":"","week":"周四"},{"date":"2017-08-11","number":"充足","price":4030,"route":"","routeId":"","week":"周五"},{"date":"2017-08-12","number":"充足","price":4130,"route":"","routeId":"","week":"周六"},{"date":"2017-08-13","number":"售完","price":"","route":"","routeId":"","week":"周日"},{"date":"2017-08-14","number":"充足","price":3890,"route":"","routeId":"","week":"周一"},{"date":"2017-08-15","number":"售完","price":"","route":"","routeId":"","week":"周二"},{"date":"2017-08-16","number":"充足","price":4030,"route":"","routeId":"","week":"周三"},{"date":"2017-08-17","number":"售完","price":"","route":"","routeId":"","week":"周四"},{"date":"2017-08-18","number":"充足","price":3830,"route":"","routeId":"","week":"周五"},{"date":"2017-08-19","number":"售完","price":"","route":"","routeId":"","week":"周六"},{"date":"2017-08-20","number":"充足","price":3730,"route":"","routeId":"","week":"周日"},{"date":"2017-08-21","number":"充足","price":3890,"route":"","routeId":"","week":"周一"},{"date":"2017-08-22","number":"充足","price":3630,"route":"","routeId":"","week":"周二"},{"date":"2017-08-23","number":"充足","price":4230,"route":"","routeId":"","week":"周三"},{"date":"2017-08-24","number":"充足","price":3630,"route":"","routeId":"","week":"周四"},{"date":"2017-08-25","number":"充足","price":4230,"route":"","routeId":"","week":"周五"},{"date":"2017-08-26","number":"充足","price":3630,"route":"","routeId":"","week":"周六"},{"date":"2017-08-27","number":"售完","price":"","route":"","routeId":"","week":"周日"},{"date":"2017-08-28","number":"充足","price":3480,"route":"","routeId":"","week":"周一"},{"date":"2017-08-29","number":"售完","price":"","route":"","routeId":"","week":"周二"},{"date":"2017-08-30","number":"充足","price":3580,"route":"","routeId":"","week":"周三"}];
                            //alert(dayPriceList);
                            for(var i =0;i <dayPriceList.length;i++){
                                var selectedDate=dayPriceList[i].date;
                                if(selectedDate==dateMap){
                                    curr=i;
                                }
                            }
                            //h1 start
                            if(dayPriceList!=null&&curr+5>dayPriceList.length&&dayPriceList.length>=8){
                                listIndex=dayPriceList.length-1;
                                var n = 0;//用于标记下标
                                for(var i =dayPriceList.length-8;i <dayPriceList.length;i++){
                                    $(".ft-calendar-template").find("#priceli_"+n).removeClass("nchline-sell-out");
                                    $(".ft-calendar-template").find("#priceli_"+n).removeClass('noPrice');
                                    if(i==curr){
                                        if($(".ft-calendar-template").find("li").hasClass("active")){
                                            $(".ft-calendar-template").find("li").removeClass("active");
                                        }
                                        $(".ft-calendar-template").find("#priceli_"+n).addClass("active");

                                    }
                                    if(dayPriceList[i].route==null||dayPriceList[i].route==''){
                                        $(".ft-calendar-template").find("#day"+n).html(dayPriceList[i].date.substring(5, 10)+"<span>"+dayPriceList[i].week+"</span>");
                                    }else{
                                        $(".ft-calendar-template").find("#day"+n).html(dayPriceList[i].date.substring(5, 10)+"<span>"+dayPriceList[i].week+"</span>"+"<i class='tip-icon tip-icon-trip'>"+dayPriceList[i].route.substring(0,1)+"</i>");
                                    }
                                    $(".ft-calendar-template").find("#date"+n).val(dayPriceList[i].date);
                                    $(".ft-calendar-template").find("#route"+n).val(dayPriceList[i].route);
                                    $(".ft-calendar-template").find("#routeId"+n).val(dayPriceList[i].routeId);
                                    $(".ft-calendar-template").find("#price"+n).val(dayPriceList[i].price);
                                    //alert("write date:"+dayPriceList[i].date+",number:"+dayPriceList[i].number);
                                    $(".ft-calendar-template").find("#number"+n).val(dayPriceList[i].number);
                                    if( $(".ft-calendar-template").find("#price"+n).val()!=null && $(".ft-calendar-template").find("#price"+n).val()!=""){
                                        $(".ft-calendar-template").find("#priceli_"+n).removeClass('noPrice');
                                        if(dayPriceList[i].promotion=='促销'){
                                            $(".ft-calendar-template").find("#dayprice"+n).html("<i>￥</i><b>"+dayPriceList[i].price+"</b>起/人<span>促</span>");
                                        }else{
                                            $(".ft-calendar-template").find("#dayprice"+n).html("<i>￥</i><b>"+dayPriceList[i].price+"</b>起/人");
                                        }
                                        $("#dayprice"+i).attr("class","price-info");
                                    } else {
                                        $(".ft-calendar-template").find("#dayprice"+n).html('');
                                        if($(".ft-calendar-template").find("#routeId"+n).val()==null||$(".ft-calendar-template").find("#routeId"+n).val()==""){
                                            $(".ft-calendar-template").find("#priceli_"+n).addClass('noPrice');
                                        }

                                    }
                                    //alert("i="+i+",n="+n+",date="+$(".ft-calendar-template").find("#date"+n).val()+",number="+$(".ft-calendar-template").find("#number"+n).val());
                                    if( $(".ft-calendar-template").find("#number"+n).val()=="售完"){
                                        $(".ft-calendar-template").find("#priceli_"+n).addClass('nchline-sell-out noPrice');
                                    }
                                    n++;
                                }
                                var html = $(".ft-calendar-template").html();
                                $(".ft-price-box-inner").html(html);
                            }
                            //h1 end
                            //h2 start
                            if(dayPriceList!=null&&curr-3>=0&&curr+5<=dayPriceList.length&&dayPriceList.length>=8){
                                listIndex=curr+4;
                                var n = 0;//用于标记下标
                                for(var i =curr-3;i <curr+5;i++){
                                    $(".ft-calendar-template").find("#priceli_"+n).removeClass("nchline-sell-out");
                                    $(".ft-calendar-template").find("#priceli_"+n).removeClass('noPrice');
                                    if(i==curr){
                                        if($(".ft-calendar-template").find("li").hasClass("active")){
                                            $(".ft-calendar-template").find("li").removeClass("active");
                                        }
                                        $(".ft-calendar-template").find("#priceli_"+n).addClass("active");
                                    }
                                    if(dayPriceList[i].route==null||dayPriceList[i].route==''){
                                        $(".ft-calendar-template").find("#day"+n).html(dayPriceList[i].date.substring(5, 10)+"<span>"+dayPriceList[i].week+"</span>");
                                    }else{
                                        $(".ft-calendar-template").find("#day"+n).html(dayPriceList[i].date.substring(5, 10)+"<span>"+dayPriceList[i].week+"</span>"+"<i class='tip-icon tip-icon-trip'>"+dayPriceList[i].route.substring(0,1)+"</i>");
                                    }
                                    $(".ft-calendar-template").find("#date"+n).val(dayPriceList[i].date);
                                    $(".ft-calendar-template").find("#route"+n).val(dayPriceList[i].route);
                                    $(".ft-calendar-template").find("#routeId"+n).val(dayPriceList[i].routeId);
                                    $(".ft-calendar-template").find("#price"+n).val(dayPriceList[i].price);
                                    //alert("write date:"+dayPriceList[i].date+",number:"+dayPriceList[i].number);
                                    $(".ft-calendar-template").find("#number"+n).val(dayPriceList[i].number);
                                    if( $(".ft-calendar-template").find("#price"+n).val()!=null &&$(".ft-calendar-template").find("#price"+n).val()!=""){
                                        $(".ft-calendar-template").find("#priceli_"+n).removeClass('noPrice');
                                        if(dayPriceList[i].promotion=='促销'){
                                            $(".ft-calendar-template").find("#dayprice"+n).html("<i>￥</i><b>"+dayPriceList[i].price+"</b>起/人<span>促</span>");
                                        }else{
                                            $(".ft-calendar-template").find("#dayprice"+n).html("<i>￥</i><b>"+dayPriceList[i].price+"</b>起/人");
                                        }
                                        $("#dayprice"+i).attr("class","price-info");
                                    } else {
                                        $(".ft-calendar-template").find("#dayprice"+n).html('');
                                        if($(".ft-calendar-template").find("#routeId"+n).val()==null||$(".ft-calendar-template").find("#routeId"+n).val()==""){
                                            $(".ft-calendar-template").find("#priceli_"+n).addClass('noPrice');
                                        }
                                    }
                                    //alert("i="+i+",n="+n+",date="+$(".ft-calendar-template").find("#date"+n).val()+",number="+$(".ft-calendar-template").find("#number"+n).val());
                                    if( $(".ft-calendar-template").find("#number"+n).val()=="售完"){
                                        $(".ft-calendar-template").find("#priceli_"+n).addClass('nchline-sell-out noPrice');
                                    }
                                    n++;
                                }
                                var html = $(".ft-calendar-template").html();
                                $(".ft-price-box-inner").html(html);
                            }
                            //h2 end
                            //h3 start
                            if(dayPriceList!=null&&curr-3<0&&dayPriceList.length>=8){
                                listIndex=7;
                                var n = 0;//用于标记下标
                                for(var i =0;i <8;i++){
                                    $(".ft-calendar-template").find("#priceli_"+n).removeClass("nchline-sell-out");
                                    $(".ft-calendar-template").find("#priceli_"+n).removeClass("noPrice");
                                    if(i==curr){
                                        if($(".ft-calendar-template").find("li").hasClass("active")){
                                            $(".ft-calendar-template").find("li").removeClass("active");
                                        }
                                        $(".ft-calendar-template").find("#priceli_"+n).addClass("active");
                                    }
                                    if(dayPriceList[i].route==null||dayPriceList[i].route==''){
                                        $(".ft-calendar-template").find("#day"+n).html(dayPriceList[i].date.substring(5, 10)+"<span>"+dayPriceList[i].week+"</span>");
                                    }else{
                                        $(".ft-calendar-template").find("#day"+n).html(dayPriceList[i].date.substring(5, 10)+"<span>"+dayPriceList[i].week+"</span>"+"<i class='tip-icon tip-icon-trip'>"+dayPriceList[i].route.substring(0,1)+"</i>");
                                    }
                                    $(".ft-calendar-template").find("#date"+n).val(dayPriceList[i].date);
                                    $(".ft-calendar-template").find("#route"+n).val(dayPriceList[i].route);
                                    $(".ft-calendar-template").find("#routeId"+n).val(dayPriceList[i].routeId);
                                    $(".ft-calendar-template").find("#price"+n).val(dayPriceList[i].price);
                                    //alert("write date:"+dayPriceList[i].date+",number:"+dayPriceList[i].number);
                                    $(".ft-calendar-template").find("#number"+n).val(dayPriceList[i].number);
                                    if( $(".ft-calendar-template").find("#price"+n).val()!=null && $(".ft-calendar-template").find("#price"+n).val()!=""){
                                        $(".ft-calendar-template").find("#priceli_"+n).removeClass('noPrice');
                                        if(dayPriceList[i].promotion=='促销'){
                                            $(".ft-calendar-template").find("#dayprice"+n).html("<i>￥</i><b>"+dayPriceList[i].price+"</b>起/人<span>促</span>");
                                        }else{
                                            $(".ft-calendar-template").find("#dayprice"+n).html("<i>￥</i><b>"+dayPriceList[i].price+"</b>起/人");
                                        }
                                        $("#dayprice"+i).attr("class","price-info");
                                    } else {
                                        $(".ft-calendar-template").find("#dayprice"+n).html('');
                                        if($(".ft-calendar-template").find("#routeId"+n).val()==null||$(".ft-calendar-template").find("#routeId"+n).val()==""){
                                            $(".ft-calendar-template").find("#priceli_"+n).addClass('noPrice');
                                        }
                                    }
                                    //alert("i="+i+",n="+n+",date="+$(".ft-calendar-template").find("#date"+n).val()+",number="+$(".ft-calendar-template").find("#number"+n).val());
                                    if( $(".ft-calendar-template").find("#number"+n).val()=="售完"){
                                        $(".ft-calendar-template").find("#priceli_"+n).addClass('nchline-sell-out noPrice');
                                    }
                                    n++;
                                }

                                var html = $(".ft-calendar-template").html();
                                $(".ft-price-box-inner").html(html);
                            }
                            //h3 end
                            //设置滚动不可用 start
                            var isLeftDisable=false;
                            var isRightDisable = false;
                            // TODO:填充html, 填充isLeftDisable,isRightDisable
                            if(listIndex <= 7){
                                isLeftDisable = true;
                            }
                            if(curr+5 >=dayPriceList.length){
                                isRightDisable = true;
                            }
                            if(isLeftDisable){
                                $(".slider-btn-left").addClass("slider-btn-disable");
                            } else {
                                $(".slider-btn-left").removeClass("slider-btn-disable");
                            }
                            if(isRightDisable){
                                $(".slider-btn-right").addClass("slider-btn-disable");
                            } else {
                                $(".slider-btn-right").removeClass("slider-btn-disable");
                            }
                            //设置滚动不可用 end
                            //横排日历居中显示end
                            //}
                        }
                    });//ajax结束
                },
                completeCallback: function () {//数据加载完成并显示出日历后的回调函数,点击上下月回调函数。

                    // 边框样式调整
                }, //日历加载完成后执行的回掉函数

                bimonthly: true

            });
            function fillData() {
                var self = this;
                var url = "json/calendar-data.json";

                /**
                 * 获取剩余HTML
                 * @param number 剩余数量
                 * @returns {string} 生成的HTML
                 */
                function getStoreHTML(number) {
                    var html = "";
                    if (number <= 0) {
                        html = "售罄";
                    } else if (number < 10) {
                        html = "余" + number
                    }else if(number=="充足"||number=="售完"||number=="售罄"){
                        html=number;
                    }
                    return html;
                }

                /**
                 * 创建浮动框
                 * @returns {*|jQuery|HTMLElement}  被创建的浮动框jQuery对象
                 */
                function createHover() {
                    var $hover = $(".calhover");
                    if ($hover.length <= 0) {
                        $hover = $('<div class="calhover"><div class="triangle"></div></div>');
                    } else {
                        $hover.html('<div class="triangle"></div>');
                    }
                    $("body").append($hover);
                    $hover.removeClass("calhover-right");
                    return $hover;
                }

                /**
                 * 设置显示
                 * @param data Ajax返回值
                 * @returns {boolean}
                 */
                function setDate(data) {

                    /**
                     * 退化的情况，无任何返回值
                     */
                    if (!data) {
                        return false;
                    }

                    var $allTd = self.wrap.find('td[data-date-map]');  //所有的日历单元格
                    $allTd.children().addClass("caldisabled");  //先禁用所有的日历日期

                    //对json对象进行迭代处理
                    data.forEach(function (row) {
                        //row 每个json对象中的元素单元，格式如下所示
                        // {
                        //     "price": 3988,
                        //     "route": "A",
                        //     "isPromotion": "下单满3000减200元，成人儿童可享受，不与其他优惠同享；\n下单满2000减150元，成人儿童可享受，不与其他优惠同享；\n下单满1000减100元，成人儿童可享受，不与其他优惠同享；"
                        //     "routeId": 0,
                        //     "number": -1,
                        //     "date": "2016-06-11",
                        // }

                        var jsonDateStr = row.date;  //json单元-日期

                        //将json单元日期字符串转化为JS日历对象(new Date())
                        var date = lv.calendar.getDateFromFormattedString(jsonDateStr, self.options.dateFormat);

                        //将日历对象转换为字符串(只保留参数dateFormat设定的数据，默认值为年月日)
                        var dateStr = lv.calendar.dateFormat(date, self.options.dateFormat);

                        //json单元-价格
                        var price = row.price;

                        //价格-浮点数
                        var number = row.number;

                        //json单月-是否促销
                        var promotion = row.isPromotion;

                        //json单元-日期对应文档中的td单元格
                        var $td = self.wrap.find('td[data-date-map=' + dateStr + ']');

                        //如果json中的数据有td单元格相对应，则显示数据信息
                        if ($td) {

                            //促销等元素的显示位置
                            var $calActive = $td.find(".calactive");

                            //显示价格
                            if(price&&price!='0'&&price!=''){
                                $td.find(".calprice").html('<i>¥</i><em>' + price + '</em>起');
                            }
                            //显示库存
                            if(number&&number!=''){
                                $td.find(".calinfo").html(getStoreHTML(number));
                            }

                            //是否售罄
                            if (number <= 0||number=="售罄"||number=="售完") {
                                $td.find(".calinfo").addClass("sellout");
                            } else {
                                $td.children().removeClass("caldisabled")
                            }

                            //是否促销
                            if (price&&price!='0'&&price!=''&&promotion&&promotion!='') {
                                var $sale = $('<div class="calsale">促</div>');
                                $calActive.append($sale);
                            }
                        }
                    });


                    //显示促销/线路/休假浮动框
                    (function () {

                        var festival;  //节日
                        var route;  //线路
                        var sale;  //促销

                        //鼠标移开，隐藏浮动框
                        self.wrap.on("mouseleave", "[data-date-map]", function () {
                            var $hover = $(".calhover");
                            $hover.hide();
                            $hover.css({
                                left: 0,
                                top: 0
                            });
                        });

                        //鼠标移入，显示浮动框
                        self.wrap.on("mouseenter", "[data-date-map]", function () {
                            var hasOnce = false;

                            //td单元格
                            var $this = $(this);

                            //sting 当前单元格日期字符串
                            var date = $this.attr("data-date-map");

                            //创建浮动框jQuery DOM对象
                            var $hover = createHover();

                            //休假
                            var $calfestival = $('<p class="calfestival"><i>休</i><span></span></p>');
                            var $calfestivalContent = $calfestival.find("span");

                            //线路
                            var $calroute = $('<p class="calroute"><i> </i><span></span></p>');
                            var $calrouteTitle = $calroute.find("i");
                            var $calrouteContent = $calroute.find("span");

                            //促销
                            var $calsale = $('<p class="calsale"><i>促</i><span></span></p>');
                            var $calsaleContent = $calsale.find("span");

                            //显示坐标
                            var left = $this.offset().left;
                            var top = $this.offset().top + $this.outerHeight();

                            //节日
                            var thatFestival = self.options.festival[date];
                            festival = thatFestival;
                            if (thatFestival) {
                                hasOnce = true;
                                $calfestivalContent.html(thatFestival.vacationName);
                                $hover.append($calfestival);
                            }

                            //获取json数据填充到页面中
                            data.forEach(function (row) {
                                if (row.date == date) {
                                    var route = row.route;
                                    if (row.price&&row.price!='0'&&row.price!=''&&row.isPromotion&&row.isPromotion!='') {
                                        var sale = row.isPromotion;
                                    }

                                    if (route&&route!='') {
                                        hasOnce = true;
                                        $calrouteTitle.html(route);
                                        $calrouteContent.html("行程");
                                        $hover.append($calroute);
                                    }
                                    if (sale&&sale!='') {
                                        hasOnce = true;
                                        $calsaleContent.html(sale);
                                        $hover.append($calsale);
                                    }
                                }
                            });

                            //页面右侧处理，如果屏幕过小，则显示在左侧
                            var width = $hover.outerWidth();

                            var $table = $this.parents(".caltable");
                            var tableLeft = $table.offset().left;
                            var tableWidth = $table.outerWidth();
                            if (width + left - tableLeft > tableWidth) {
                                left = tableLeft + (tableWidth - width);
                                $hover.addClass("calhover-right");
                            }

                            //显示
                            if (hasOnce) {

                                if ($this.children().is(".notThisMonth") && self.options.bimonthly) {
                                    //hide
                                }else if (!self.wrap.is(".ui-calendar-mini")) {
                                    $hover.show();
                                }

                                $hover.css({
                                    left: left,
                                    top: top
                                });

                                if (self.options.zIndex) {
                                    $hover.css("zIndex", self.options.zIndex + 1);
                                }
                            }

                        });

                    })();
                }

                this.loading();
                var dayPriceList=[{"date":"2017-06-12","number":"充足","price":3130,"route":"","routeId":"","week":"周一"},{"date":"2017-06-13","number":"充足","price":3130,"route":"","routeId":"","week":"周二"},{"date":"2017-06-14","number":"充足","price":3080,"route":"","routeId":"","week":"周三"},{"date":"2017-06-15","number":"充足","price":3400,"route":"","routeId":"","week":"周四"},{"date":"2017-06-16","number":"充足","price":3330,"route":"","routeId":"","week":"周五"},{"date":"2017-06-17","number":"充足","price":3400,"route":"","routeId":"","week":"周六"},{"date":"2017-06-18","number":"充足","price":3430,"route":"","routeId":"","week":"周日"},{"date":"2017-06-19","number":"充足","price":3130,"route":"","routeId":"","week":"周一"},{"date":"2017-06-20","number":"充足","price":3430,"route":"","routeId":"","week":"周二"},{"date":"2017-06-21","number":"充足","price":3430,"route":"","routeId":"","week":"周三"},{"date":"2017-06-22","number":"充足","price":3680,"route":"","routeId":"","week":"周四"},{"date":"2017-06-23","number":"充足","price":3480,"route":"","routeId":"","week":"周五"},{"date":"2017-06-24","number":"售完","price":"","route":"","routeId":"","week":"周六"},{"date":"2017-06-25","number":"充足","price":3700,"route":"","routeId":"","week":"周日"},{"date":"2017-06-26","number":"充足","price":3690,"route":"","routeId":"","week":"周一"},{"date":"2017-06-27","number":"售完","price":"","route":"","routeId":"","week":"周二"},{"date":"2017-06-28","number":"售完","price":3680,"route":"","routeId":"","week":"周三"},{"date":"2017-06-29","number":"售完","price":"","route":"","routeId":"","week":"周四"},{"date":"2017-06-30","number":"售完","price":3880,"route":"","routeId":"","week":"周五"},{"date":"2017-07-01","number":"售完","price":"","route":"","routeId":"","week":"周六"},{"date":"2017-07-02","number":"售完","price":"","route":"","routeId":"","week":"周日"},{"date":"2017-07-03","number":"充足","price":3780,"route":"","routeId":"","week":"周一"},{"date":"2017-07-04","number":"充足","price":4130,"route":"","routeId":"","week":"周二"},{"date":"2017-07-05","number":"充足","price":3980,"route":"","routeId":"","week":"周三"},{"date":"2017-07-06","number":"充足","price":4130,"route":"","routeId":"","week":"周四"},{"date":"2017-07-07","number":"充足","price":3980,"route":"","routeId":"","week":"周五"},{"date":"2017-07-08","number":"充足","price":4100,"route":"","routeId":"","week":"周六"},{"date":"2017-07-09","number":"充足","price":4000,"route":"","routeId":"","week":"周日"},{"date":"2017-07-10","number":"充足","price":3930,"route":"","routeId":"","week":"周一"},{"date":"2017-07-11","number":"售完","price":"","route":"","routeId":"","week":"周二"},{"date":"2017-07-12","number":"充足","price":3980,"route":"","routeId":"","week":"周三"},{"date":"2017-07-13","number":"充足","price":4000,"route":"","routeId":"","week":"周四"},{"date":"2017-07-14","number":"充足","price":3980,"route":"","routeId":"","week":"周五"},{"date":"2017-07-15","number":"充足","price":4000,"route":"","routeId":"","week":"周六"},{"date":"2017-07-16","number":"充足","price":4000,"route":"","routeId":"","week":"周日"},{"date":"2017-07-17","number":"充足","price":3880,"route":"","routeId":"","week":"周一"},{"date":"2017-07-18","number":"充足","price":4130,"route":"","routeId":"","week":"周二"},{"date":"2017-07-19","number":"充足","price":3980,"route":"","routeId":"","week":"周三"},{"date":"2017-07-20","number":"充足","price":4000,"route":"","routeId":"","week":"周四"},{"date":"2017-07-21","number":"充足","price":4000,"route":"","routeId":"","week":"周五"},{"date":"2017-07-22","number":"充足","price":4000,"route":"","routeId":"","week":"周六"},{"date":"2017-07-23","number":"充足","price":4000,"route":"","routeId":"","week":"周日"},{"date":"2017-07-24","number":"充足","price":3980,"route":"","routeId":"","week":"周一"},{"date":"2017-07-25","number":"充足","price":4000,"route":"","routeId":"","week":"周二"},{"date":"2017-07-26","number":"充足","price":4000,"route":"","routeId":"","week":"周三"},{"date":"2017-07-27","number":"充足","price":4000,"route":"","routeId":"","week":"周四"},{"date":"2017-07-28","number":"充足","price":4000,"route":"","routeId":"","week":"周五"},{"date":"2017-07-29","number":"充足","price":4000,"route":"","routeId":"","week":"周六"},{"date":"2017-07-30","number":"充足","price":4000,"route":"","routeId":"","week":"周日"},{"date":"2017-07-31","number":"充足","price":4000,"route":"","routeId":"","week":"周一"},{"date":"2017-08-01","number":"充足","price":4000,"route":"","routeId":"","week":"周二"},{"date":"2017-08-02","number":"充足","price":4000,"route":"","routeId":"","week":"周三"},{"date":"2017-08-03","number":"充足","price":4000,"route":"","routeId":"","week":"周四"},{"date":"2017-08-04","number":"充足","price":4230,"route":"","routeId":"","week":"周五"},{"date":"2017-08-05","number":"售完","price":"","route":"","routeId":"","week":"周六"},{"date":"2017-08-06","number":"充足","price":4130,"route":"","routeId":"","week":"周日"},{"date":"2017-08-07","number":"充足","price":3890,"route":"","routeId":"","week":"周一"},{"date":"2017-08-08","number":"充足","price":4130,"route":"","routeId":"","week":"周二"},{"date":"2017-08-09","number":"充足","price":4030,"route":"","routeId":"","week":"周三"},{"date":"2017-08-10","number":"充足","price":4230,"route":"","routeId":"","week":"周四"},{"date":"2017-08-11","number":"充足","price":4030,"route":"","routeId":"","week":"周五"},{"date":"2017-08-12","number":"充足","price":4130,"route":"","routeId":"","week":"周六"},{"date":"2017-08-13","number":"售完","price":"","route":"","routeId":"","week":"周日"},{"date":"2017-08-14","number":"充足","price":3890,"route":"","routeId":"","week":"周一"},{"date":"2017-08-15","number":"售完","price":"","route":"","routeId":"","week":"周二"},{"date":"2017-08-16","number":"充足","price":4030,"route":"","routeId":"","week":"周三"},{"date":"2017-08-17","number":"售完","price":"","route":"","routeId":"","week":"周四"},{"date":"2017-08-18","number":"充足","price":3830,"route":"","routeId":"","week":"周五"},{"date":"2017-08-19","number":"售完","price":"","route":"","routeId":"","week":"周六"},{"date":"2017-08-20","number":"充足","price":3730,"route":"","routeId":"","week":"周日"},{"date":"2017-08-21","number":"充足","price":3890,"route":"","routeId":"","week":"周一"},{"date":"2017-08-22","number":"充足","price":3630,"route":"","routeId":"","week":"周二"},{"date":"2017-08-23","number":"充足","price":4230,"route":"","routeId":"","week":"周三"},{"date":"2017-08-24","number":"充足","price":3630,"route":"","routeId":"","week":"周四"},{"date":"2017-08-25","number":"充足","price":4230,"route":"","routeId":"","week":"周五"},{"date":"2017-08-26","number":"充足","price":3630,"route":"","routeId":"","week":"周六"},{"date":"2017-08-27","number":"售完","price":"","route":"","routeId":"","week":"周日"},{"date":"2017-08-28","number":"充足","price":3480,"route":"","routeId":"","week":"周一"},{"date":"2017-08-29","number":"售完","price":"","route":"","routeId":"","week":"周二"},{"date":"2017-08-30","number":"充足","price":3580,"route":"","routeId":"","week":"周三"}];
                setDate(dayPriceList);

                self.loaded();
            }
            $('.canderBox1').show();
            $('body').append('<div class="pop-layer-reply-fade"></div>');
        });
        $(document).on('click','.js-close-calender',function(){
            $("#seltntpkgid").val('null');
            $('.canderBox1').hide();
            $('.pop-layer-reply-fade').remove();
            $('.ui-calendar').remove();
        });
        //计算标题的字数
        function sub(str,n){
            var r=/[^\x00-\xff]/g;
            if(str.replace(r,"mm").length<=n){return str;}
            var m=Math.floor(n/2);
            for(var i=m;i<str.length;i++){
                if(str.substr(0,i).replace(r,"mm").length>=n){
                    return str.substr(0,i);
                }
            }
            return str;
        }

        function getLength(str){
            return String(str).replace(/[^\x00-\xff]/g,'aa').length;
        }
        (function(){
            $('.js-reckon-word').each(function(){
                var $this=$(this),
                    html=$this.html().replace(/\s+/g,""),
                    num=$this.attr('data-number');
                var len=getLength(html);
                len=Math.ceil(len/2);
                if(len>num)
                {
                    html=sub(html,num*2)+'...';
                }
                $(this).html(html);
            });
        })();
        //倒计时
    });


    /*所有poptips*/

    $(".js-tips").poptip({
        offsetX : -20
    });

    // +1天
    $(".add-one-day").poptip({
        offsetX: -29,
        place: 7
    });
    // 报销,12以上
    $(".reimbursement, .adult-tip, .dis-tip").poptip({
        offsetX: -12
    });

    var timeId = null;
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

    // 退改签
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

    /*所有poptips END*/

    //超时提示
    function showTimeout() {
        $(".ft-overlay, .ft-dialog-timeout").show();
    }

    function hideTimeout() {
        $(".ft-overlay, .ft-dialog-timeout").hide();
    }
});
