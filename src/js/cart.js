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
                    wrapClass: "alert-combos-wrapper",
                    content: $(".alert-combos-container"),
                    width: 479,
                    height: 350
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
                url: '../data/cart.json',
                data: {},
                dataType: 'json',
                success: function (res) {
                    if(res.success){
                        for(var i in self.proObj){
                            for(var j = 0;j < self.proObj[i].length;j++){
                                $('#'+proId).find('.cart-section-'+i+'-container').append(self.proObj[i][j]);
                            }
                        }
                        //刷新checkBox
                        checkBox.whetherTriggerSection();
                        checkBox.whetherTriggerAll();

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
        },
        getProducts: function ($this) {
            var self = this;
            if($this.parent().hasClass('bottom-bar-left')){
                //多产品
                $('.cart-section-details .icon-checkBox').each(function () {
                    if($(this).data('checked')){
                        self.proArr.push($(this).parent().parent())
                    }
                })
            }else {
                //单产品
                self.proArr.push($this.parents('.cart-section-pro-wrapper').parent())
            }
        },
        getData: function () {
            var self = this;
            $.ajax({
                url: '../data/cart.json',
                data: {},
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
                var $thisDetails = $thisContainer.parents('.cart-section-details');
                var $thisSection = $thisContainer.parents('.cart-section');
                $thisContainer.remove();
                //判断是否套餐为空
                emptyCombo();
            }

            //计算总价
            checkBox.moneyCalc();

            //刷新checkBox
            checkBox.whetherTriggerSection();
            checkBox.whetherTriggerAll();

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
                    url:'../data/cart.json',
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
                var $this = $(this);
                //判断是否勾选了商品
                if($this.hasClass('disabled')){
                    self.novaDialog('time',$('.alert-choose-none'))
                }else {
                    self.checkBoxLimit();
                    self.sendData()
                }
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
        checkBoxLimit: function () {
            var self = this;
            var checkedBoxs = $('.cart-section-details .icon-checkBox.checked');
            var kucuns = checkedBoxs.parents('.cart-section-pro-wrapper').find('.pro-num-notice');
            var checkedSections = checkedBoxs.parents('.cart-section');
            if(checkedSections.length > 1){
                this.novaDialog('time',$('.alert-only'))
            }else if(true){
                //判断行程是否冲突

            }else{
                //判断数量是否不足
                kucuns.each(function () {
                    var $this = $(this);
                    if($this.html() !== ''){
                        var num = $this.prev().val();
                        var proWrapper = $this.parents('.cart-section-pro-wrapper');
                        var comboId = $this.parents('.cart-section').attr('id');
                        var info = '';
                        var comboName = '';
                        var base = '我的套餐1中航班HNBS数量只能预订2张';
                        var str = '';


                        var comboIdArr = comboId.split('-');
                        if(comboIdArr[1] === 'diy'){
                            comboName = '自选单品'
                        }else {
                            comboName = '我的套餐'+comboIdArr[2]
                        }

                        if(proWrapper.find('.hotel-name').length !== 0){
                            info = proWrapper.find('.hotel-name').html();
                            str = comboName+'中航班'+ info +'数量只能预订'+ num +'张'
                        }else if(proWrapper.find('.ticket-name').length !== 0){
                            info = proWrapper.find('.ticket-name').html();
                            str = comboName+'中'+ info +'数量只能预订'+ num +'张'
                        }else {
                            info = proWrapper.find('.flight-plane-num').html();
                            str = comboName+'中航班'+ info +'数量只能预订'+ num +'张'
                        }

                        self.noticeArr.push(obj);
                    }
                })
            }
        },
        sendData: function () {
            $.ajax({
                url: '',
                data: {},
                dataType: 'json',
                success: function (res) {

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
                $this.addClass('current-checkBox');
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
            if (type) {
                this.target.addClass('checked');
                this.target.data('checked', true);
            } else {
                this.target.removeClass('checked');
                this.target.data('checked', false);
            }

            if (this.target.parent().hasClass('cart-section-title')) {
                var titleBox = this.target.parents('.cart-section').find('.cart-section-title').find('.icon-checkBox');
                //判断是否为title
                this.chooseSection(titleBox,type);
            } else if (this.target.hasClass('icon-checkBox-all')) {
                //判断是否为全选
                this.chooseAll(type);
            } else {
                this.whetherTriggerSection();
                //checkBox结束
                this.checkFinish();
            }
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
            //判断是否触发全选
            this.whetherTriggerAll();
            //checkBox结束
            this.checkFinish();
        },
        chooseAll: function (type,reset) {
            var allBoxs = $('.icon-checkBox');
            if (type) {
                allBoxs.addClass('checked');
                allBoxs.data('checked', true);
            } else {
                if(reset){
                    this.chooseAllBox.removeClass('checked');
                    this.chooseAllBox.data('checked', false);
                }else {
                    allBoxs.removeClass('checked');
                    allBoxs.data('checked', false);
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
        whetherTriggerAll: function () {
            var targetBoxs = $('.cart-section-title .icon-checkBox');
            if(this.each(targetBoxs)){
                this.chooseAll(true)
            }else {
                this.chooseAll(false,true)
            }
        },
        checkFinish: function () {
            //计算价格
            this.moneyCalc();
            //去除class
            this.target && this.target.removeClass('current-checkBox')
            //刷新预定按钮
            this.checkBtn();
        },
        moneyCalc: function () {
            var checkBoxs = $('.cart-section-pro-wrapper .icon-checkBox');
            var checkedBoxs = [];
            var totalMoneyOld = 0;
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
                url:'../data/cart.json',
                data: {},
                dataType: 'json',
                success: function(res){
                    if(res.success){
                        //计算商品价格
                        $proMoney.html($singlePrice*$thisNum)
                        //计算总价
                        checkBox.moneyCalc()
                        //库存不足
                        if(res.proNum < $thisNum){
                            $thisError.html('库存不足'+ $thisNum +'份')
                            $thisError.show()
                        }else {
                            $thisError.hide()
                        }
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
        $(window).scroll(function () {
            searchBarTop = $('.sft-bottom-bar-container').offset().top;
            scrollTop(searchBar,searchBarTop,clientH)
        });
        scrollTop(searchBar,searchBarTop,clientH);
    };
    function scrollTop(searchBar,searchBarTop,clientH) {
        var scrollTop = $(window).scrollTop();
        if (searchBarTop > scrollTop +clientH) {
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

