#一.CSS
##1.IE7中z-index有BUG，父元素如果有position属性，则子元素的zindex就失效了，不想解决这个问题。
###解决办法：为父元素也添加z-index属性
##2.flight引用了hotel的css，如何处理图片问题
##3.scss嵌套过深导致后面覆盖困难
##4.用border来代替IE的box-shadow时，会导致尺寸变化
```css
.head-wrapper {
  border: 1px solid #ccc\9; //IE hack
  margin-bottom: 20px;
}
.ft-price-calendar .ft-pc {
  width: 74px;
  width: 72px\9; //导致的尺寸变化
  background: $color-bg-orange;
  cursor: pointer;
  //border-right: 1px solid #fea1cb;
  text-align: center;
}
```
#一.js
##1.$.ajax会把url中的相对路径自动变为绝对路径，这里即使相对路径写错了也会被转换，容易发生错误
```js
$.ajax({
            url: '../../data/cart.json',// => localhost:3000/data/cart.json
            data: {

            },
            dataType: 'json',
            //jsonpCallback: "receive",
            success: function (res) {
                //TODO 弹出提示框,成功
            },
            error: function (error) {
                //弹出提示框,失败
                });
            }
        });
```
##2.在实现吸顶效果时，由于某元素的位置变化，又分别在两个不同的js文件中，所以使用了自定义事件来解决作用域的问题
```js
$(function(){
    // 搜索条固定
        function searchBar() {
            var searchBar = $('.main_search'),
                searchSortBar = searchBar.next(),
                searchBarTop = searchBar.offset().top;
            $(window).on('searchBarChange',function(e){ //监听事件
                searchBarTop = searchBar.offset().top;
            })
            $(window).scroll(function () {
                scrollTop(searchBar,searchBarTop,searchSortBar)
            });
            scrollTop(searchBar,searchBarTop,searchSortBar);
        };
})
$(function(){
    //就这么玩切换
        $('.play-btn').click(function () {
            var $this = $(this);
            if($this.hasClass('play-btn-overview')){
                $('.play-main-overview').show();
                $('.play-main-details').hide();
            }else {
                $('.play-main-details').show();
                $('.play-main-overview').hide();
                //宝典图文滚动
                bottomBarFix();
            }
            //重新计算searchBar
            $(window).trigger('searchBarChange'); //触发事件
            $this.addClass('active').siblings().removeClass('active');
        });
})
```
#一.html
##1.通过srcset属性来处理html中的retina图片问题
##2.IE9及以下不支持Input的placeholder属性，IE10的字体颜色也有问题
###解决方法：js处理
```js
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
            console.log(0)
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
                console.log(1)
            }
            console.log(2)
        }).blur();
    };
    function placeholderSupport() {
        return 'placeholder' in document.createElement('input');
    }
```
#一.tool
##1.使用gulp-css-spritesmith替代原来的gulp-css-spriter，因为它可以处理retina图片问题（通过@media）
##2.build资源路径合并时，内部不能有注释
##3.dist-img经常出错

  * 1.九周年滚动监听优化
  ```js
  /*导航跟随与点击*/
      !function navFollow() {
          var container = $('.m-wrap'),
              nav = container.find('.nav-bar'),
              units = container.find('.floor'),
              btns = container.find('.nav-bar .btn'),
              flag = true;
  
          //获取每个unit的offsettop
          var arr = [];
          units.each(function () {
              arr.push($(this).offset().top)
          });
          //滚动监听
          $(window).on('scroll',function () {
              if(!flag) return;
              var sTop = $(window).scrollTop(),
                  num = 0;
              for(var i = arr.length-1;i > 0;i--){
                  if(arr[i]-sTop < 0){
                      num = i;
                      break
                  }
              }
              btns.eq(num).addClass('current').siblings().removeClass('current');
          });
  
          btns.on('click',function () {
              flag = false;
              var index = $(this).index();
              if(index>=units.length){
                  index = 0
              }
              btns.eq(index).addClass('current').siblings().removeClass('current');
              $('html,body').animate({
                  scrollTop: units.eq(index).offset().top + 1
              },500,function () {
                  flag = true
              })
          });
      }();
  ```
  * 2.css垂直居中，专题
  ```css
  /*两个左右的div都设置成这样，就可以高度100%自适应*/
  div {
        padding-bottom: 1000px;
        margin-bottom: -1000px;
  }
         
  ```
  * 3.弹框组件是否定制化，没毛病
  * 4.看与开发的聊天记录
  * 5.vue-iconfont使用
  * 6.轮播图组件开发
  ```js
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
    function RorySwiper(container,configs) {
        var s = this;
        configs = configs || {};
        s.container = $(container);
        s.wrapper = s.container.find('.swiper-wrapper');
        s.sliders = s.wrapper.find('.swiper-slide');
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
           
  ```
  * 7.事件绑定全部在document上
  * 8.添加了成人和儿童身份证号与出生日期的验证
  * 9.vue-添加过渡效果