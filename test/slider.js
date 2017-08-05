/**
 * Created by Administrator on 2017/8/5.
 */
/**
 * Created by rory on 2017/5/2.
 */
/**
 * @param
 * container 外层容器的jq选择器
 * configs:{
                width:100,
                height:100,
                time: 1000,
                btnL: null,
                btnR: null,
                autoPlay: true,
                hover: true,
                nav: {
                    classes:null,//[]
                    width:12,
                    height:12,
                    bottom:0,
                    borderRadius: 6,
                    marginRight: 10,
                }
            }
 * */
function RorySlider(container,configs) {
    var s = this;
    configs = configs || {};
    s.container = $(container);
    s.wrapper = s.container.find('.rory-wrapper');
    s.sliders = s.wrapper.find('.rory-slider');
    s.nav = null;
    s.navDots = {};
    s.sliderWidth = s.sliders.eq(0).width();
    s.sliderHeight = s.sliders.eq(0).height();
    s.sliderNum = s.sliders.length;
    s.currentIndex=0;
    s.configs = {};
    s.flag = true;
    s.defaults = {
        width:100,
        height:100,
        time: 1000,
        waitTime: 2000,
        btnL: null,
        btnR: null,
        autoPlay: true,
        hover: true,
        infinite:false,
        easing: 'swing',
        nav: {
            classes:null,//[]
            width:12,
            height:12,
            bottom:0,
            borderRadius: 6,
            marginRight: 10
        }
    };

    //是否使用默认配置
    for(var i in s.defaults){
        s.configs[i] = configs.hasOwnProperty(i)?configs[i]:s.defaults[i];
    }

    //设置初始尺寸
    s.container.css({
        width: s.configs.width,
        height: s.configs.height,
        position: 'relative',
        overflow: 'hidden'
    });
    s.wrapper.css({
        width: s.configs.width*s.sliderNum,
        height: s.configs.height
    });
    s.sliders.css({
        float: 'left'
    });
    //slider高度问题

    //判断是否轮播
    if(s.sliderNum <= 1){
        s.container.find('.btn-l').hide();
        s.container.find('.btn-r').hide();
        return
    }

    //创建nav
    s.createNav = function () {
        s.nav = $('<ul class="nav"></ul>');
        s.nav.css({
            position: 'absolute',
            textAlign: 'center',
            width: '100%',
            bottom: s.configs.nav.bottom
        });
        s.container.append(s.nav);
        for(var i = 0;i < s.sliderNum;i++){
            var li = $('<li></li>');
            li.css({
                width: s.configs.nav.width,
                height: s.configs.nav.height,
                borderRadius: s.configs.nav.borderRadius,
                marginRight: s.configs.nav.marginRight
            });
            s.configs.nav.classes&&li.addClass(s.configs.nav.classes[i]);
            //IE7兼容
            li.addClass('inline-block');
            s.nav.append(li);
        }
        s.navDots = s.nav.find('li');
        //初始current
        s.navDots.eq(0).addClass('current').siblings().removeClass('current');
    };

    //创建无限循环用的slider
    s.createSlider = function () {
        s.sliders.eq(0).clone().appendTo(s.wrapper);
        s.sliderNum++;
        s.wrapper.css({
            width: s.configs.width*s.sliderNum
        });
    };
    //下一张
    s.next = function () {
        if(s.flag){
            s.flag = false;
            s.currentIndex = s.currentIndex >= s.sliderNum-1 ? 0:s.currentIndex+1;
            s.play(s.currentIndex)
        }
    };
    //play
    s.play = function (index) {
        s.wrapper.stop().animate({
            marginLeft: -index*s.sliderWidth
        },s.configs.time,s.configs.easing,function () {
            s.flag = true;
            if(s.configs.infinite&& index===s.sliderNum-1){
                s.wrapper.css({
                    marginLeft:0
                })
                s.currentIndex = 0
            }
        });
        s.configs.nav && s.navDots.eq(index).addClass('current').siblings().removeClass('current');
    };
    //自动轮播
    s.autoPlay = function () {
        s.timer = setInterval(function () {
            s.next()
        },s.configs.waitTime)
    };
    //左右按钮
    s.click = function () {
        s.configs.btnL && s.configs.btnL.click(function () {
            if(s.flag){
                s.flag = false;
                s.currentIndex = s.currentIndex < 1 ? s.sliderNum-1:s.currentIndex-1;
                s.play(s.currentIndex)
            }
        });
        s.configs.btnR && s.configs.btnR.click(function () {
            s.next()
        });
    };
    //鼠标悬停
    s.hover = function () {
        s.wrapper.hover(function () {
            s.stopAutoplay()
        },function () {
            s.autoPlay();
        });
        //nav hover
        if(s.configs.nav){
            s.navDots.hover(function () {
                s.stopAutoplay();
                s.currentIndex = $(this).index();
                s.play(s.currentIndex)
            },function () {
                s.autoPlay();
            })
        }
    };
    //清除autoplay
    s.stopAutoplay = function () {
        clearInterval(s.timer)
    };
    //clean css
    s.cleanCss = function () {
        s.wrapper.removeAttr('style');
    };
    //destroy
    s.destroy = function () {
        s.stopAutoplay();
        s.cleanCss();
        delete s.flag;
        s = null;
    };
    s.init = function () {
        s.click();
        s.configs.infinite && s.createSlider();
        s.configs.nav && s.createNav();
        s.configs.autoPlay && s.autoPlay();
        s.configs.hover && s.hover();
    };
    s.init();
    return s;
}