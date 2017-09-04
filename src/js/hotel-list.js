/**
 * Created by rory on 2017/6/5.
 */
(function(){
    LoadHotelList();
})();
function LoadHotelList(){

    /*房型区域*/
    var $mainLeft = $('.mainLeft');
    //单一展开房型
    $mainLeft.on('click','.js_roomDtl',function(e){
        var $This = $(this),
            $dl = $This.parents('dl');

        $dl.hasClass('open') ? $dl.removeClass('open') : $dl.addClass('open');

    });

    //单一收起
    $mainLeft.on('click','.js_room_up',function(e){
        $(this).parents('dl').removeClass('open');
    });

    // 展开全部房型
    var $top = 0;
    $mainLeft.on('click','.js_room_show',function(e){
        var $This = $(this),
            $room_list = $This.parents('.room_list'),
            $dl = $room_list.find('dl'),
            $roomUl = $('.room-li');

        /*if ( $This.hasClass('room_up') ) {
            $This.removeClass('room_up').html($This.html().replace('收起','展开'));
            $dl.removeClass('open').filter(':gt(2)').hide();
            $roomUl.each(function(){
                var $me = $(this);
                $me.find('li').filter(':gt(2)').hide();
            });

        } else {
            $This.addClass('room_up').html($This.html().replace('展开','收起'));
            $dl.removeClass('open').show();
            $roomUl.each(function(){
                var $me = $(this);
                $me.find('li').filter(':gt(2)').show();
            });
        }*/

        var $oLi = $room_list.find('li');
        if ( $This.hasClass('room_up') ) {
            //收起
            $This.removeClass('room_up').html($This.html().replace('收起','展开'));
            $dl.removeClass('open').filter(':gt(0)').hide()
            $oLi.filter(':gt(0)').hide();
            $('html,body').animate({
                scrollTop:$top
            },300);
        } else {
            //展开
            $top = $(document).scrollTop();
            $dl.removeClass('open').show();
            $oLi.show();
            $This.addClass('room_up').html($This.html().replace('展开','收起'));

        }
    });

    //展开全部酒+景推荐
    $mainLeft.on('click','.js_room_freetour',function(e){
        var $This = $(this),
            $oLi = $This.parents('.room-freetour').find('li');

        if ( $This.hasClass('room_up') ) {
            $This.removeClass('room_up').html($This.html().replace('收起','展开'));
            $oLi.filter(':gt(1)').hide();
        } else {
            $This.addClass('room_up').html($This.html().replace('展开','收起'));
            $oLi.show();
        }
    });

    // 户型 && 景+酒 tab切换
    $mainLeft.on('click','.prd_switch li',function(e){
        var $This = $(this),
            $prdHeadTit = $This.parent().next(),
            $room_list = $This.parent().parent().next('.room_list'),
            $room_freetour = $This.parents('.prdLi').find('.room-freetour'),
            $index = $This.index(),
            $saleTip = $This.parents('.prdLi').find('.saleTip'),
            $saleBox = $This.parents('.prdLi').find('.saleBox');

        $This.addClass('active').siblings().removeClass('active');

        if ( $index == 0 ) {
            $prdHeadTit.show();
            $room_list.show();
            hide1();
            hide2();
        } else if ($index == 2){
            hide0();
            hide1();
            $saleTip.show();
            $saleBox.show();
        } else {
            hide0();
            hide2();
            $room_freetour.show();
        }

        function hide0 () {
            $prdHeadTit.hide();
            $room_list.hide();
        }
        function hide1(){
            $room_freetour.hide();
        }
        function hide2() {
            $saleTip.hide();
            $saleBox.hide();
        }

    });


    $('.js_tips').poptip({offsetX : -20});

    /*右侧模块悬浮*/
    /*var oldT = $('.mainRight').offset().top,
        left_H = $('.mainLeft').height(),
        $main_r_fixed = $('.main_r_fixed'),
        right_H = $main_r_fixed.height(),
        $mapBtn = $('.JS_mapgundong'),
        $documentH = $(document.body).height(),
        mapScroll = true;

    $mapBtn.click(function(){
        if ( $mapBtn.hasClass('select') ) {
            mapScroll = false;
            $mapBtn.removeClass('select');
            $main_r_fixed.removeAttr('style','');
        } else {
            $mapBtn.addClass('select');
            mapScroll = true;
        }
    });


    if(left_H>right_H){
        $(window).scroll(function(){
            if ( !mapScroll ) return false;
            scrollMap();
        });
        scrollMap();
    };
    function scrollMap(){

        var newT = $(document).scrollTop();
        var moveH = $documentH - newT - right_H;
        var searchBarHeight = $('.main_search:visible').innerHeight();
        if(newT>=(oldT-searchBarHeight)){
            if (moveH > 230) {
                $main_r_fixed.css({'position':'fixed','top':(searchBarHeight+10)})
            } else {
                $main_r_fixed.css({'position':'fixed','top': moveH - 230})
            }

        }else{
            $main_r_fixed.removeAttr('style','');
        };
    }*/


    /*百度地图*/
    /*$(function () {

        try{
            var $listBox = $('.prdLi');

            /!*地图创建位置的ID*!/
            var mapID = document.getElementById('baidu_map');
            /!*创建地图*!/
            var map = new BMap.Map("baidu_map");
            /!*获取第一个酒店坐标和名字*!/
            var xy1 = $listBox.eq(0).attr('point').split(",");
            /!*默认显示第一个酒店得地图位置*!/
            map.centerAndZoom(new BMap.Point(xy1[0],xy1[1]), 14);
            /!*开启滚动条缩放*!/
            map.enableScrollWheelZoom();
            /!*鼠标hover对应酒店，跳转到对应地图位置*!/
            var hoverIn = true;
            $listBox.hover(function(){
                if(hoverIn){
                    hoverIn = false;
                    var num = $(this).index(),
                        xy = $(this).attr('point').split(","),
                        name = $(this).attr('name');
                    //map.centerAndZoom(new BMap.Point(xy[0],xy[1]), 14);
                    //$('.mapThis').removeClass('num_this').eq(num).addClass('num_this');
                    $('.mapThis').each(function(){
                        if ( $(this).index() == num ){
                            $(this).addClass('num_this').siblings().removeClass('num_this');
                        }
                    });
                    map.panTo(new BMap.Point(xy[0],xy[1]));
                }
            },function(){
                hoverIn = true;
            });

            /!*创建所有酒店覆盖物*!/
            for(var i=0;i<$listBox.length;i++){
                var xy = $listBox.eq(i).attr('point').split(","),
                    name = $listBox.eq(i).attr('name');
                thisMap(xy,name,i+1);
                console.log(xy + '----' + name + '----' + i);
            }

            /!*创建覆盖物函数*!/
            function thisMap(xy,name,num){

                //地图覆盖物创建
                function ComplexCustomOverlay(point, text, mouseoverText){
                    this._point = point;
                    this._text = text;
                    this._overText = mouseoverText;
                }
                ComplexCustomOverlay.prototype = new BMap.Overlay();

                /!*创建自定义覆盖物dom*!/
                ComplexCustomOverlay.prototype.initialize = function(map){
                    // 保存map对象实例
                    this._map = map;
                    // 创建div元素，作为自定义覆盖物的容器
                    var mapThis = document.createElement("div");
                    mapThis.className = 'mapThis';
                    mapThis.innerHTML = '<div class="mapNum">'+ num +'</div><p>'+ name +'</p>'
                    // 将div添加到覆盖物容器中
                    map.getPanes().labelPane.appendChild(mapThis);
                    // 保存div实例
                    this._div = mapThis;
                    // 需要将div元素作为方法的返回值，当调用该覆盖物的show、
                    // hide方法，或者对覆盖物进行移除时，API都将操作此元素。
                    return mapThis;
                };
                /!*创建覆盖物位置*!/
                ComplexCustomOverlay.prototype.draw = function(){
                    // 根据地理坐标转换为像素坐标，并设置给容器
                    var position = this._map.pointToOverlayPixel(this._point);
                    this._div.style.left = position.x -14 + "px";
                    this._div.style.top = position.y -35 + "px";
                }
                var mySquare = new ComplexCustomOverlay(new BMap.Point(xy[0],xy[1]),name,name);
                map.addOverlay(mySquare);

                /!*一个酒店层级默认是最高*!/
                $('.mapThis:first').addClass('num_this');

            }
        } catch (e) {
            console.log(e.message);
        }
    });*/


};

