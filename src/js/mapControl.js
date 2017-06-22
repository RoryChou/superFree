/**
 * Created by rory on 2017/6/19.
 */
(function (global) {
    "use strict"
    function Factory(options) {
        var options = options || {},
            defaults = Factory.defaults;

        for (var i in defaults) {
            if (options[i] === undefined) {
                options[i] = defaults[i];
            };

        };
        return new MapControl(options);
    }

    function MapControl(opt) {
        this.init(opt);
    }



//key=AIzaSyAxD3V20_zKzgdCDZopmvj-NF4gX78TJ88&
    MapControl.prototype = {
        constructor: MapControl,
        init: function (opt) {
            var _this = this,
                keyArr = ['','key=AIzaSyAxD3V20_zKzgdCDZopmvj-NF4gX78TJ88&','key=AIzaSyDOLUU355I1oDAme7wqF_lz7wN1gp-mLmM&'];
            //判断keyType是否为0-2的数字
            if(!/^[0-2]$/.test(opt.keyType)){
                opt.keyType = 0;
            }
            var googleSrc = "http://maps.google.cn/maps/api/js?"+keyArr[opt.keyType]+"sensor=false&language=zh-CN.js",
                baiduSrc = "http://api.map.baidu.com/api?v=2.0&ak=i2ccGvMLyR86WI0YcodIe7Lu";

            var script = document.createElement('script');
            script.src = opt.type === "google" ? googleSrc : (opt.type === "baidu" ? baiduSrc : _this.errorCatch("未获取到地图类型"));
            script.onload = script.onreadystatechange = function () {
                if( !this.readyState || this.readyState==='loaded' || this.readyState==='complete' ){
                    switch (opt.type) {
                        case "google":
                            _this.googleMapInit(opt);
                            break;
                        case "baidu":
                            window.BMap_loadScriptTime = (new Date).getTime();
                            var style = document.createElement('link');
                            style.href = "http://api.map.baidu.com/res/14/bmap.css";
                            style.type = "text/css";
                            style.rel = "stylesheet";
                            document.getElementsByTagName("head")[0].appendChild(style);
                            _this.baiduMapInit(opt);
                            break;
                    }

                }
            }
            document.body.appendChild(script);
        },
        googleMapInit: function (opt) {
            var myLatlng = { lng: opt.coordinate.lng, lat: opt.coordinate.lat };
            var myOptions = {
                zoom: opt.zoom,
                center: myLatlng,
                zoomControl:true
            }

            var map = new google.maps.Map(document.getElementById(opt.containerID), myOptions);


            if (opt.scrollWheel==false) {
                map.setOptions({scrollwheel:false})
            };
            var mapId = document.getElementById(opt.containerID);
            mapId.onclick = function(){
                map.setOptions({scrollwheel:true})
            };
            mapId.onmouseout = function(e){
                e.stopPropagation();
                map.setOptions({scrollwheel:false})
            };


            if (opt.marker) {
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map
                });
                if (opt.markerTips.content !== "") {
                    var markerDiv = "<div><h4 style='margin:5px 0;'>" + opt.markerTips.title + "</h1><div>" + opt.markerTips.content + "</div></div>";
                    var infowindow = new google.maps.InfoWindow({
                        content: markerDiv,
                        maxWidth: opt.marker.maxWidth
                    });
                    marker.addListener('click', function () {
                        infowindow.open(map, marker);
                    });

                }
            }

            if(opt.labels && opt.labels.length) {
                var labels = opt.labels;
                var labelsLength = labels.length;
                for (var labelIndex = 0; labelIndex < labelsLength; labelIndex++) {
                    (function () {
                        var label = labels[labelIndex];
                        var labelMarker = new google.maps.Marker({
                            position: label.position,
                            map: map/*,
                             label: label.title*/
                        });
                        var labelInfoWindow = new google.maps.InfoWindow({
                            content: label.title,
                            maxWidth: label.maxWidth
                        });
                        labelMarker.addListener('click', function () {
                            labelInfoWindow.open(map, labelMarker);
                        });
                    })();
                }
            }
        },
        baiduMapInit: function (opt) {
            var map = new BMap.Map(opt.containerID);
            var point = new BMap.Point(opt.coordinate.lng, opt.coordinate.lat);
            var marker = new BMap.Marker(point);

            if (opt.scrollWheel==true) {
                map.enableScrollWheelZoom();
            };

            var mapId = document.getElementById(opt.containerID);
            mapId.onclick = function(){
                map.enableScrollWheelZoom();
            };
            mapId.onmouseout = function(e){
                e.stopPropagation();
                map.disableScrollWheelZoom();
            };

            map.enableKeyboard();
            map.centerAndZoom(point, opt.zoom);
            var ctrl_nav = new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_LEFT, type: BMAP_NAVIGATION_CONTROL_LARGE });
            map.addControl(ctrl_nav);
            var ctrl_ove = new BMap.OverviewMapControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, isOpen: 1 });
            map.addControl(ctrl_ove);
            var ctrl_sca = new BMap.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT });
            map.addControl(ctrl_sca);

            if (opt.marker) {
                map.addOverlay(marker);
                if (opt.markerTips.content !== "") {
                    var opts = {
                        width: opt.markerTips.maxWidth,
                        height: opt.markerTips.maxHeight,
                        title: opt.markerTips.title
                    }
                    var infoWindow = new BMap.InfoWindow(opt.markerTips.content, opts);
                    marker.addEventListener("click", function () {
                        map.openInfoWindow(infoWindow, point);
                    });
                }
            }

            if(opt.labels && opt.labels.length) {
                var labels = opt.labels;
                var labelsLength = labels.length;
                for (var labelIndex = 0; labelIndex < labelsLength; labelIndex++) {
                    (function () {
                        var label = labels[labelIndex];
                        var point = new BMap.Point(label.position.lng, label.position.lat);

                        var marker = new BMap.Marker(point);
                        map.addOverlay(marker);
                        var textLabel = new BMap.Label(label.title + '<div style="background: url(http://pic.lvmama.com/img/v6/line/map-arrow.png); position: absolute; width: 11px; height: 10px; top: 22px; left: 10px; overflow: hidden;"></div>', {
                            position: point,
                            offset: new BMap.Size(-10, -60)
                        });
                        map.addOverlay(textLabel);
                        textLabel.setStyle({
                            "display": "inline-block",
                            "position": "absolute",
                            "background-color": "#ee5d5b",
                            "color": "#FFF",
                            "border": "1px solid #bc3b3a",
                            "padding": "2px",
                            "line-height": "18px",
                            "height": "18px"
                        });

                    })();
                }
            }
        },
        errorCatch: function (mes) {
            throw new Error("地图组件异常: " + mes);
        }
    };

    Factory.defaults = {
        type: "google",
        marker: false,
        coordinate: { lng: 116.407, lat: 39.9 },
        zoom: 15,
        keyType:0,//key的类型，0是没有key，1是频道页的key，2是lvyou页面的key
        containerID: "mapContainer",
        scrollWheel: false,
        markerTips: { title: "", content: "", maxWidth: 150, maxHeight: 100 }
    };
    global.lvmap = Factory;
}(window));