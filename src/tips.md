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