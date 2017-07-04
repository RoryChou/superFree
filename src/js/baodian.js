/**
 * Created by rory on 2017/6/26.
 */
$(function () {
    //tips
    $('.js-tips').poptip({
        offsetX: -26
    });

    //点赞
    $('.icon-bd-hearts').click(function(){
        var $this = $(this);
        if(!$this.hasClass('active')){
            //TODO
            $.ajax({
                url:'data/cart.json',
                data:{},
                dataType: 'json',
                success: function(){
                    $this.addClass('active');
                    $this.siblings('.icon-plus').addClass('active');
                }
            })
        }
    })
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
            navFollow()
        }
        //重新计算searchBar
        $(window).trigger('searchBarChange');
        $this.addClass('active').siblings().removeClass('active');
    });


    //宝典图文滚动
    function bottomBarFix() {
        var daysBar = $('.play-main-details-left'),
            detialsBar = $('.play-main-details-right'),
            detialsBarH = detialsBar.height(),
            daysBarH = daysBar.outerHeight(),
            daysBarTop = daysBar.offset().top;
            detialsBarTop = detialsBar.offset().top;
            scrollTop(daysBar,daysBarTop,detialsBar,daysBarH,detialsBarH,detialsBarTop);

        $(window).scroll(function () {
            scrollTop(daysBar,daysBarTop,detialsBar,daysBarH,detialsBarH,detialsBarTop)
        });

    };
    function scrollTop(daysBar,daysBarTop,detialsBar,daysBarH,detialsBarH,detialsBarTop) {
        var scrollTop = $(window).scrollTop();
        //searchBar高度为70px
        if (daysBarTop < scrollTop) {
            if(detialsBarTop + detialsBarH - daysBarH< scrollTop){
                daysBar.addClass('fix-top-days-bottom').removeClass('fix-top-days');
            }else {
                daysBar.removeClass('fix-top-days-bottom').addClass('fix-top-days');
            }
        } else {
            daysBar.removeClass('fix-top-days');
            daysBar.removeClass('fix-top-days-bottom');
        }
    }
    //宝典图文跟随与点击
    function navFollow() {
        var container = $('.play-main-details'),
            units = container.find('.play-main-details-day-wrapper'),
            btns = container.find('.play-main-details-day'),
            flag = true;

        //获取每个unit的offsettop
        var arr = [];
        units.each(function () {
            arr.push($(this).offset().top)
        });
        console.log(arr)
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
    };

    //图片点击详情
    $('.js-img-show').click(function(){
        var dataSrcArr = $(this).data('src');
        $('.opacityBox').show();
        $('.img-alert-container').show();

        new imgShow(dataSrcArr);
    });

    function imgShow(dataSrcArr) {
        var s = this;
        s.smallLi = null;
        s.closeBtn = $('.img-alert-close');
        s.btnL = $('.img-alert-list-left');
        s.btnR = $('.img-alert-list-right');
        s.smallUl = $('.img-alert-small-list');
        s.bigUl = $('.img-alert-big-list');
        s.bigLiWidth = 0;
        s.smallWidth = 0;
        s.index = 0;
        s.imgNum = dataSrcArr.length;
        s.init = function () {
            s.createElem(dataSrcArr);
            s.getDefaultInfo();
            s.bindEvent();
        };
        s.createElem = function (dataSrcArr) {
            for(var i = 0;i < s.imgNum;i++){
                //填充大图
                $li = $('<li></li>');
                $img = $('<img src="" />');
                $img.attr('src',dataSrcArr[i])
                $li.append($img);
                s.bigUl.append($li);
                //填充小图
                $liS = $('<li></li>');
                $imgS = $('<img src="" />');
                $span= $('<span class="img-alert-small-over"></span>');
                $imgS.attr('src',dataSrcArr[i])
                $liS.append($imgS);
                $liS.append($span);
                s.smallUl.append($liS)
            };
        };
        s.getDefaultInfo = function () {
            //填写总张数
            s.bigUl.siblings('.bd-pro-imgs-num').html('共'+ s.imgNum +'张')

            s.smallLi = $('.img-alert-small-list li');
            s.smallLi.eq(0).addClass('current');
            s.bigLiWidth = s.bigUl.find('li').width();//675
            s.smallWidth = s.smallUl.find('li').width();//99
            s.bigUl.css({
                marginLeft: 0,
                width: s.bigLiWidth*s.imgNum
            });
            s.smallUl.css({
                marginLeft: 0,
                width: (s.smallWidth+5)*s.imgNum //5px margin-right
            })

        };
        s.bindEvent = function () {
            s.smallLi.click(function(){
                s.index = $(this).index()
                s.move();
            });
            s.btnL.click(function(){
                s.index = s.index - 1;
                if(s.index < 0){
                    s.index = s.imgNum-1
                }
                s.move();
            });
            s.btnR.click(function(){
                s.index = s.index + 1;
                if(s.index >= s.imgNum){
                    s.index = 0
                }
                s.move();
            });
            s.closeBtn.click(function(){
                s.bigUl.empty();
                s.smallUl.empty();
                $('.img-alert-container').hide();
                $('.opacityBox').hide();
                s.index = 0;
            })
        };
        s.move = function () {
            var index = s.index;
            s.smallLi.eq(index).addClass('current').siblings('li').removeClass('current');
            //如果smallLi超出容器，则容器移动
            var smallIndex = s.index > 5?s.index-5:0;
            s.smallUl.stop(true).animate({
                marginLeft: -(s.smallWidth+5)*smallIndex
            },300);
            s.bigUl.stop(true).animate({
                marginLeft: -s.bigLiWidth*index
            },300)

        };
        s.init();
        return s;
    }

    //查看套餐
    $('.btn-check-combo').click(function(){
        $("html,body").animate({
            scrollTop:$(".ticket_search").offset().top
        },500,'swing')
    })
})