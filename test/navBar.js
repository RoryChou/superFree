/**
 * Created by Administrator on 2017/8/5.
 */
/*导航跟随与点击*/
!function navFollow() {
    var container = $('.m-wrap'),
        nav = container.find('.nav-bar'),
        units = container.find('.floor'),
        btns = container.find('.nav-bar .btn'),
        flag = true;

    //获取每个unit的offsettop
    var arr = []; //handler瘦身
    units.each(function () {
        arr.push($(this).offset().top)
    });
    //滚动监听
    $(window).on('scroll',function () {
        if(!flag) return; //防止点击事件干扰
        throttle(scrollHandler,50,100)() //节流函数优化
    });

    function scrollHandler() {
        var sTop = $(window).scrollTop(),
            num = 0;
        for(var i = arr.length-1;i > 0;i--){
            if(arr[i]-sTop < 0){
                num = i;
                break
            }
        }
        btns.eq(num).addClass('current').siblings().removeClass('current');
    }

    //点击导航栏
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
            flag = true;
        })
    });

    //一个节流函数的简单实现
    function throttle(func, wait, mustRun) {
        var timeout,
            startTime = new Date();

        return function() {
            var context = this,
                args = arguments,
                curTime = new Date();
            clearTimeout(timeout);
            // 如果达到了规定的触发时间间隔，触发 handler
            if(curTime - startTime >= mustRun){
                func.apply(context,args);
                startTime = curTime;
                // 没达到触发间隔，重新设定定时器
            }else{
                timeout = setTimeout(func, wait);
            }
        };
    };
}();