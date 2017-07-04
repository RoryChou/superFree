/**
 * Created by rory on 2017/6/16.
 */
$(function () {
    var $document = $(document);

    //poptip
    $('.js-tips').poptip({
        offsetX: -26
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
    $document.on("mouseover", ".flight-plane-type", function () {
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

        if (thisL + $planeInfo.outerWidth(true) > $(window).width()) {
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


        //TODO 模拟异步加载
        setTimeout(function () {

            $('.plane-info-loading').hide();
            $planeInfoDetail.show();

            $planeInfoDetail.find(".pi-plan").text($this.data("plan"));
            $planeInfoDetail.find(".pi-name").text($this.data("name"));
            $planeInfoDetail.find(".pi-type").text($this.data("type"));
            $planeInfoDetail.find(".pi-min").text($this.data("min"));
            $planeInfoDetail.find(".pi-max").text($this.data("max"));

        }, 2000);//模拟异步加载
    });

    $document.on("mouseout", ".flight-plane-type", function () {
        timeId = setTimeout(function () {
            $('.plane-info').hide();
        }, 300);
        $('.plane-info').off("mouseenter mouseleave");
        $('.plane-info').on("mouseenter", function () {
            clearTimeout(timeId);
        }).on("mouseleave", function () {
            $(this).hide();
        });
    });

    //购买bar固定
    bottomBarFix();

    //移入其他套餐
    var moveCombos = {
        proObj: {
            'hotel':[],
            'flight':[],
            'ticket':[]
        },
        novaDialogCombos: null,
        init: function () {
           this.bindEvent();
        },
        bindEvent: function () {
            var self = this;
            //移入其他套餐
            $('.cart-move').click(function () {
                self.format();
                var $this = $(this);
                self.getProducts($this);
                self.novaDialogCombos = nova.dialog({
                    title: '选择要移入的套餐',
                    wrapClass: "alert-combos-wrapper",
                    content: $(".alert-combos-container"),
                    width: 479,
                    height: 416
                });
            });
            //点击套餐弹窗中的套餐
            $('.alert-combos-container li').click(function () {
                var proId = $(this).attr('class');
                self.getData(proId);
            });
        },
        getData: function (proId) {
            var self = this;
            $.ajax({
                url: 'data/cart.json',
                data: {},
                dataType: 'json',
                success: function (res) {
                    if(res.success){
                        for(var i in self.proObj){
                            for(var j = 0;j < self.proObj[i].length;j++){
                                self.proObj[i][j].find('.icon-checkBox').removeClass('checked');
                                self.proObj[i][j].find('.icon-checkBox').data('checked', false);
                                $('#'+proId).find('.cart-section-'+i+'-container').append(self.proObj[i][j]);
                            }
                        }
                        //刷新checkBox
                        checkBox.checkFinish();

                        //判断是否套餐为空
                        emptyCombo();

                        self.novaDialogCombos.close();
                    }
                },
                error: function () {
                    novaDialogCombos.close();
                    nova.dialog({
                        title: null,  //标题
                        wrapClass: "alert-combos-wrapper",
                        time: 1500,  //定时关闭 单位毫秒(ms)
                        content: $(".alert-move-fail"),
                        width: 421,
                        height: 168
                    });
                }
            })
        },
        getProducts: function ($this) {
            var self = this;
            if($this.parent().hasClass('bottom-bar-left')){
                //多产品
                $('.cart-section-details .icon-checkBox').each(function () {
                    if($(this).data('checked')){
                        self.proObj[(self.proTypeFilter($(this)))].push($(this).parent().parent())
                    }
                })
            }else {
                //单产品
                this.proObj[(this.proTypeFilter($this))].push($this.parents('.cart-section-pro-wrapper').parent())
            }
        },
        proTypeFilter: function ($this) {
            var proContainer = $this.parents('.cart-section-pro-wrapper').parent();
            var type = '';
            if(proContainer.hasClass('cart-section-pro-hotel')){
                type = 'hotel';
            }else if(proContainer.hasClass('cart-section-pro-flight')){
                type = 'flight';
            }else if(proContainer.hasClass('cart-section-pro-ticket')){
                type = 'ticket';
            }else {
                console.log('proTypeFilter error')
            }
            return type;
        },
        format: function () {
            this.proObj = {
                'hotel':[],
                'flight':[],
                'ticket':[]
            }
        }
    };
    moveCombos.init();

    //删除商品
    var deleteCombos = {
        proArr: [],
        init: function () {
            this.bindEvent()
        },
        bindEvent: function () {
            var self = this;
            $('.cart-delete').click(function () {
                self.format()
                var $this = $(this);
                self.getProducts($this);
                self.getData($this)
            })
            //清空购物车
            $('.cart-clear-all').click(function () {
                self.format()
                var $this = $(this);
                var data = {}
                self.getProducts($this);
                self.getData(data)
            })
        },
        getProducts: function ($this) {
            var self = this;
            if($this.hasClass('cart-clear-all')){
                //清空购物车
                $('.cart-section-details .pro-price-single').each(function () {
                    self.proArr.push($(this).parent().parent())
                })
            }else {
                //单产品
                self.proArr.push($this.parents('.cart-section-pro-wrapper').parent())
            }
        },
        getData: function (data) {
            var self = this;
            $.ajax({
                url: 'data/cart.json',
                data: data,
                dataType: 'json',
                success: function (res) {
                    if(res.success){
                        nova.dialog({
                            title: null,  //标题
                            content: $('.alert-delete-content'),
                            okCallback: function () {
                                self.operations()
                            },
                            cancelCallback: true
                        });
                    }else {
                        console.log('.cart-delete fail')
                    }
                },
                error: function (error) {
                    console.log('.cart-delete error',error)
                }
            });
        },
        operations: function () {
            //删除产品
            for(var i = 0;i < this.proArr.length;i++){
                var $thisContainer = this.proArr[i];
                $thisContainer.remove();
            }
            //判断是否套餐为空
            emptyCombo();

            //刷新checkBox
            checkBox.checkFinish();

            //计算底部bar
            var searchBar = $('.sft-bottom-bar'),
                clientH = $(window).height(),
                searchBarTop = $('.sft-bottom-bar-container').offset().top;
            scrollTop(searchBar,searchBarTop,clientH);
        },
        format: function () {
            this.proArr = []
        }
    };
    deleteCombos.init();

    //清空失效产品
    $('.bottom-bar-clear').click(function () {
        nova.dialog({
            title: null,  //标题
            content: $('.alert-clear-content'),
            okCallback: function () {
                $.ajax({
                    url:'data/cart.json',
                    data:{},
                    dataType: 'json',
                    success: function (res) {
                        $('.pro-disabled').remove();
                        //判断是否套餐为空
                        emptyCombo();
                    },
                    error: function (error) {
                        console.log('清空失效产品错误',error)
                    }
                })

            },
            cancelCallback: true
        });
    })

    //判断是否套餐为空
    function emptyCombo() {
        $('.cart-section').each(function () {
            if($(this).find('.cart-section-details').find('.cart-section-pro-wrapper').length === 0){
                $(this).remove()
            }
        })
    }

    //产品hover
    $('.cart-section-pro-wrapper').parent().hover(function(){
        $(this).addClass('active')
    },function(){
        $(this).removeClass('active')
    });

    //立即预定
    var buyNow = {
        noticeArr: [],
        init: function () {
            this.bindEvent()
        },
        bindEvent: function () {
            var self = this;
            $('.bottom-bar-button').click(function () {
                self.checkBoxLimit($(this));
            })
        },
        novaDialog: function (type,content,okCallback) {
            if(type === 'time'){
                nova.dialog({
                    title: null,  //标题
                    wrapClass: "alert-combos-wrapper",
                    time: 1500,  //定时关闭 单位毫秒(ms)
                    content: content,
                    width: 421,
                    height: 168
                });
            }else if(type === 'confirm'){
                nova.dialog({
                    title: null,  //标题
                    content: content,
                    okCallback: okCallback,
                    cancelCallback: true
                });
            }
        },
        checkBoxLimit: function ($this) {
            var checkedBoxs = $('.cart-section-details .icon-checkBox.checked');
            var checkedSections = checkedBoxs.parents('.cart-section');
            if($this.hasClass('disabled')){
                //判断是否勾选了商品
                this.novaDialog('time',$('.alert-choose-none'))
            }else if(checkedSections.length > 1){
                //判断是否跨套餐
                this.novaDialog('time',$('.alert-only'))
            }else{
                this.sendData();
            }
        },
        sendData: function () {
            var self = this;
            $.ajax({
                url: 'data/cart.json',
                data: {},
                dataType: 'json',
                success: function (res) {
                    //TODO 判断是否行程冲突
                    if(res.flightConflict){
                        self.novaDialog('time',$('.alert-conflict'))
                    }else {
                        if(res.notice){
                            self.novaDialog('confirm',$('.alert-num-notEnough'),function () {
                                alert('填单页go')
                            })
                        }else {
                            alert('填单页go')
                        }
                    }
                },
                error: function (error) {

                }
            })
        }
    };
    buyNow.init()

    //checkbox点击
    var checkBox = {
        target: null,
        chooseAllBox: $('.icon-checkBox-all'),
        init: function () {
            this.bindEvent();
            this.checkFinish();
        },
        bindEvent: function () {
            var self = this;
            $document.on('click', '.icon-checkBox', function (e) {
                var $this = $(this);
                self.target = $(e.target);
                if ($this.hasClass('checked')) {
                    self.chooseSingle(false)
                } else {
                    self.chooseSingle(true)
                }
            })
            $document.on('click', '.choose-all', function () {
                if ($(this).prev().hasClass('checked')) {
                    self.chooseAll(false)
                } else {
                    self.chooseAll(true)
                }
            })
        },
        each: function (elements) {
            var flag = true;
            elements.each(function () {
                if (!$(this).data('checked')) {
                    flag = false;
                }
            })
            return flag;
        },
        chooseSingle: function (type) {
            var targetSection = this.target.parents('.cart-section');
            var siblingsSection = targetSection.siblings('.cart-section');
            if (type) {
                this.target.addClass('checked');
                this.target.data('checked', true);

                //清除其他套餐checkBox
                targetSection.addClass('current-section');
                siblingsSection.removeClass('current-section');
                siblingsSection.find('.icon-checkBox').each(function(){
                    var $this = $(this);
                    $this.removeClass('checked');
                    $this.data('checked', false);
                })

            } else {
                this.target.removeClass('checked');
                this.target.data('checked', false);
            }

            if (this.target.parent().hasClass('cart-section-title')) {
                var titleBox = this.target.parents('.cart-section').find('.cart-section-title').find('.icon-checkBox');
                //判断是否为title
                this.chooseSection(titleBox,type);
            } else {
                //checkBox结束
                this.checkFinish();
            }
        },
        checkCurSection: function () {
            $('.cart-section').each(function(){
                if($(this).find('.checked').length === 0){
                    $(this).removeClass('current-section');
                }
            })
        },
        chooseSection: function (titleBox,type,reset) {
            var childBoxs = titleBox.parents('.cart-section').find('.cart-section-details').find('.icon-checkBox');
            if (type) {
                titleBox.addClass('checked');
                childBoxs.addClass('checked');
                titleBox.data('checked', true);
                childBoxs.data('checked', true);
            } else {
                if(reset){
                    titleBox.removeClass('checked');
                    titleBox.data('checked', false);
                }else {
                    titleBox.removeClass('checked');
                    childBoxs.removeClass('checked');
                    titleBox.data('checked', false);
                    childBoxs.data('checked', false);
                }
            }
            //checkBox结束
            this.checkFinish();
        },
        whetherTriggerSection: function () {
            var self = this;
            //操作产品时（删除，移入）,重新计算checkbox
            var titleBoxs = $('.cart-section-title .icon-checkBox');
            titleBoxs.each(function () {
                var proBoxs = $(this).parent().siblings('.cart-section-details').find('.icon-checkBox');
                var $this = $(this);
                if($this.data('checked')){
                    if(!self.each(proBoxs)){
                        self.chooseSection($this,false,true)
                    }
                }else {
                    if(self.each(proBoxs)){
                        self.chooseSection($this,true)
                    }
                }
            })
        },
        checkFinish: function () {
            //判断是否触发section
            this.whetherTriggerSection();
            //计算价格
            this.moneyCalc();
            //刷新预定按钮
            this.checkBtn();
            //刷新当前section
            this.checkCurSection()
        },
        moneyCalc: function () {
            var checkBoxs = $('.cart-section-pro-wrapper .icon-checkBox');
            var sections = $('.cart-section');
            var checkedBoxs = [];
            var totalMoneyOld = 0;

            sections.each(function () {
                var totalMoneySec = 0;
                var $this = $(this);
                var sectionCheckBoxs = $this.find('.cart-section-pro-wrapper .icon-checkBox');
                var sectionTitleBox = $this.find('.cart-section-title span').eq(0);
                sectionCheckBoxs.each(function () {
                    totalMoneySec += ($(this).parent().find('.pro-money').find('span').html()) / 1;
                });
                if(sectionCheckBoxs.length === 0){
                    sectionTitleBox.removeClass('icon-checkBox').addClass('icon-checkBox-disabled');
                }else {
                    sectionTitleBox.removeClass('icon-checkBox-disabled').addClass('icon-checkBox');
                }
                $this.find('.cart-section-money-total-num b').html(totalMoneySec);
            })

            checkBoxs.each(function () {
                if ($(this).data('checked')) {
                    checkedBoxs.push($(this))
                }
            });
            for (var i = 0; i < checkedBoxs.length; i++) {
                totalMoneyOld += (checkedBoxs[i].parent().find('.pro-money').find('span').html()) / 1;
            }
            //计算总价
            $('.money-total-old i').html(totalMoneyOld)
        },
        checkBtn: function () {
            if($('.icon-checkBox').hasClass('checked')){
                $('.bottom-bar-button').removeClass('disabled')
            }else {
                $('.bottom-bar-button').addClass('disabled')
            }
        }
    };
    checkBox.init();

    //产品数量选择
    chooseProNum();

    function chooseProNum() {
        $('.pro-num').on('change',function(){
            var $this = $(this);
            var $thisNum = $this.val();
            var $thisError = $this.next();
            var $singlePrice = $this.parent().siblings('.pro-price-single').html().substring(1);
            var $proMoney = $this.parent().siblings('.pro-money').find('span');
            $.ajax({
                url:'data/cart.json',
                data: {},
                dataType: 'json',
                success: function(res){
                    if(res.success){

                        if($this.hasClass('pro-num-flightGo')){
                            var flightReturn = $this.parents('.cart-section-pro-wrapper').find('.pro-num-flightReturn');
                            var $flightReturnSinglePrice = flightReturn.parent().siblings('.pro-price-single').html().substring(1);
                            flightReturn.val($thisNum);
                            flightReturn.parent().siblings('.pro-money').find('span').html($flightReturnSinglePrice*$thisNum)
                        }

                        //计算商品价格
                        $proMoney.html($singlePrice*$thisNum)

                        //计算总价
                        checkBox.moneyCalc()

                    }
                },
                error: function(mes){
                    console.log('chooseProNum error!',mes)
                }
            })
        })
    }

    function bottomBarFix() {
        var searchBar = $('.sft-bottom-bar'),
            clientH = $(window).height(),
            searchBarTop = $('.sft-bottom-bar-container').offset().top;
        $(window).resize(function () {
            clientH = $(window).height();
            searchBarTop = $('.sft-bottom-bar-container').offset().top;
        })
        $(window).scroll(function () {
            searchBarTop = $('.sft-bottom-bar-container').offset().top;
            scrollTop(searchBar,searchBarTop,clientH)
        });
        scrollTop(searchBar,searchBarTop,clientH);
    };
    function scrollTop(searchBar,searchBarTop,clientH) {
        var scrollTop = $(window).scrollTop();
        //searchBar高度为70px
        if (searchBarTop > scrollTop +clientH-70) {
            if (!searchBar.hasClass('fix-bottom')) {
                searchBar.addClass('fix-bottom');
            }
        } else {
            if (searchBar.hasClass('fix-bottom')) {
                searchBar.removeClass('fix-bottom');
            }
        }
    }
});

