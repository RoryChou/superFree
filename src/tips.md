#一.CSS
##1.IE7中z-index有BUG，父元素如果有position属性，则子元素的zindex就失效了，不想解决这个问题。
###解决办法：为父元素也添加zindex属性
##2.flight引用了hotel的css，如何处理图片问题
##3.scss嵌套过深导致后面覆盖困难
#一.js
##1.
##2.

#一.html
##1.通过srcset属性来处理html中的retina图片问题
##2.

#一.tool
##1.使用gulp-css-spritesmith替代原来的gulp-css-spriter，因为它可以处理retina图片问题（通过@media）
##2.build资源路径合并时，内部不能有注释
##3.dist-img经常出错