/**
 * Created by duanxiaofei on 2014/10/8.
 */
define(function (require, exports, module) {
    var firstClick = true; //第一次播放
    var ia;
    var initialized;
    var TimeLinr = function (years, selector, options, callback) {
        var settings = $.extend({
            orientation: 'horizontal',		// value: horizontal | vertical, default to horizontal
            containerDiv: '#timeline',		// value: any HTML tag or #id, default to #timeline
            datesDiv: '#dates',			// value: any HTML tag or #id, default to #dates
            datesSelectedClass: 'selected',			// value: any class, default to selected
            datesSpeed: 'normal',			// value: integer between 100 and 1000 (recommended) or 'slow', 'normal' or 'fast'; default to normal
            issuesDiv: '#issues',			// value: any HTML tag or #id, default to #issues
            issuesSelectedClass: 'selected',			// value: any class, default to selected
            issuesSpeed: 'fast',				// value: integer between 100 and 1000 (recommended) or 'slow', 'normal' or 'fast'; default to fast
            issuesTransparency: 0.2,				// value: integer between 0 and 1 (recommended), default to 0.2
            issuesTransparencySpeed: 500,				// value: integer between 100 and 1000 (recommended), default to 500 (normal)
            prevButton: '#prev',			// value: any HTML tag or #id, default to #prev
            nextButton: '#next',			// value: any HTML tag or #id, default to #next
            settingButton:'#setting',
            autoPlayButton: '#autoPlay',
            arrowKeys: 'false',			// value: true | false, default to false
            startAt: 1,					// value: integer, default to 1 (first)
            autoPlay: 'false',			// value: true | false, default to false
            autoPlayDirection: 'forward',			// value: forward | backward, default to forward
            autoPlayPause: 1200,				// value: integer (1000 = 1 seg), default to 2000 (2segs)
            offset: 50,
            bottom: 22,
            maxCount:6   //最多同时显示的时间个数
        }, options);

        /**
         * 安装时间轴控件
         */
        var setupUI = function () {
            var bodyWidth = $(document).width() - 100;
            settings.maxCount =  parseInt(bodyWidth/60+"");

            //自动播放
            var autoPlayBtn = $("<img/>").attr("id", "autoPlay").attr("src", "assets/image/timelinr/play_c.png").css({width:"24px",height:"24px"});
            var autoDiv = $("<div class='tl'></div>").attr("id", "autoDiv").css("cursor", "pointer");
            autoDiv.append(autoPlayBtn).css({
                width: "24px",
                height: "24px",
                position: "fixed"
            });

            //向后播放
            var prevPlayBtn = $("<img/>").attr("id", "prev").attr("src", "assets/image/timelinr/left.png").css({width:"24px",height:"24px"});
            var prevDiv = $("<div class='tl'></div>").attr("id", "prevDiv").css("cursor", "pointer");
            prevDiv.append(prevPlayBtn).css({
                width: "24px",
                height: "24px",
                position: "fixed"
            });

            //向前播放
            var nextPlayBtn = $("<img/>").attr("id", "next").attr("src", "assets/image/timelinr/right.png").css({width:"24px",height:"24px"}); //step_right.png
            var nextDiv = $("<div class='tl'></div>").attr("id", "nextDiv").css("cursor", "pointer");
            nextDiv.append(nextPlayBtn).css({
                width: "24px",
                height: "24px",
                position: "fixed"
            });

            //设置按钮
            //var settingBtn = $("<img/>").attr("id", "setting").attr("src", "assets/image/timelinr/setting.png");
            //var settingDiv = $("<div class='tl'></div>").attr("id", "settingDiv").css("cursor", "pointer");
            //settingDiv.append(settingBtn).css({
            //    width:"24px",
            //    height:"24px",
            //    position:"fixed"
            //});


            //时间轴
            var timeLine = $("<div class='tl'></div>").attr("id", "timeline");
            //var templateTime = '{{#.}} <li><a href="#" data-value="{{month}}-{{reportname}}-{{reporttype}}-{{year}}">{{year}}年</a></li>{{/.}}';
            var timeUl = $("<ul></ul>").attr("id", "dates");
            //var lis="";
            if (years) {
                var leng = years.length;
                for (var i = 0; i < leng; i++) {
                    if(years[i].hasdata === false){
                        continue;
                    }

                    var $li = $("<li></li>");
                    var dataValue = years[i].month + "-" + years[i].reportTypeName + "-" + years[i].reportType + "-" + years[i].year;
                    var text = ""; //不显示中文，避免拥挤
                    switch (years[i].reportType){
                        case 12: //季度
                            text = years[i].year+"."+(years[i].month-12) ;//约定季度月份为13-16
                            break;
                        case 13: //月度
                            text = years[i].year+"."+years[i].month;
                            break;
                        default :
                            text = years[i].year;
                            break;
                    }
                    var $a = $("<a></a>").attr("href", "#").attr("data-value", dataValue).text(text);
                    $a.appendTo($li);
                    $li.appendTo(timeUl);
                }
            }
            timeUl.appendTo(timeLine);

            //添加到页面
            var _body = selector || "body";
            timeLine.appendTo(_body);
            autoDiv.appendTo(_body);
            prevDiv.appendTo(_body);
            nextDiv.appendTo(_body);
            //settingDiv.appendTo(_body);

            var timeLineWidth = 420;
            if(timeLineWidth>bodyWidth){
                timeLineWidth = 60*settings.maxCount - 20 ;
            }
            //设置样式               时间轴的宽度 420px
            $("#timeline").css({
                //width: years.length*60+"px",
                display: "inline-block",
                width: timeLineWidth + "px",
                height: "50px",
                overflow: "hidden",
                position: "fixed",
                background: "url('assets/image/timelinr/dots.png') left 41px repeat-x"  //dot.gif
            });
            $("#dates").css({
                width: timeLineWidth + "px",
                height: "50px",
                overflow: "hidden"
            });
            $("#dates li").css({
                "list-style": "none",
                "float": "left",
                "width": "60px",
                "height": "30px",
                "font-size": "12px",
                "text-align": "top",
                "background": "url('assets/image/timelinr/dot.png') center bottom no-repeat"  //biggerdot.png
            });
            $("#dates a").css({
                "color" :"rgb(26, 188, 181)",
                "text-decoration": "none"
            });
            $("#dates a").mouseover(function () {
                $(this).css({
                    "text-decoration": "underline"       //下划线
                });
            });
            $("#dates a").mouseout(function () {
                $(this).css({
                    "text-decoration": "none"
                });
            });

            //修正位置  首次激活最后一个时段
            var ct = settings.maxCount;

            var sumCount = $(settings.datesDiv).children().length;   //总个数
            var sumLength = sumCount*60;    //总长度
            if(sumCount>ct){  //如果总数大于6 需要将年份条左移
                var wd = -(sumCount-ct)*60;
                wd = wd + "px";
                $(settings.datesDiv).animate({'marginLeft': wd}, {queue: false, duration: 'settings.datesSpeed'});
            }

            //安装时间设置按钮
            //timeSetter();

        };

        /**
         * 设置时间轴组件位置
         * @param UI
         */
        var setUILocation = function (UI) {
            if (!$("#timeline")) {
                return;
            } else {
                var documentWidth = $(document).width();
                $("#timeline").css({
                    "margin-left": (Number(documentWidth) - Number($("#timeline").width()) - 24 ) / 2,
                    "bottom": settings.bottom + "px"
                });
                var left1 = $("#timeline").css("margin-left");
                var lc = Number(left1.substring(0, left1.length - 2)) - $("#autoDiv").width();
                $("#autoDiv").css({
                    "margin-left": lc + "px",
                    "bottom": settings.bottom + "px"
                });

                lc = Number(left1.substring(0, left1.length - 2)) + $("#timeline").width();
                $("#prevDiv").css({
                    "margin-left": lc + "px",
                    "bottom": settings.bottom + "px"
                });

                left1 = $("#prevDiv").css("margin-left");
                lc = Number(left1.substring(0, left1.length - 2)) + $("#prevDiv").width();
                $("#nextDiv").css({
                    "margin-left": lc + "px",
                    "bottom": settings.bottom + "px"
                });

                left1 = $("#nextDiv").css("margin-left");
                lc = Number(left1.substring(0, left1.length - 2)) + $("#nextDiv").width();
                $("#settingDiv").css({
                    "margin-left": lc + "px",
                    "bottom": settings.bottom + "px"
                });

            }
        };

        /**
         * 添加事件
         */
        var addEvent = function () {
            // setting variables... many of them
            var howManyDates = $(settings.datesDiv + ' li').length;
            var howManyIssues = $(settings.issuesDiv + ' li').length;
            var currentDate = $(settings.datesDiv).find('a.' + settings.datesSelectedClass);
            var currentIssue = $(settings.issuesDiv).find('li.' + settings.issuesSelectedClass);
            var widthContainer = $(settings.containerDiv).width();
            var heightContainer = $(settings.containerDiv).height();
            var widthIssues = $(settings.issuesDiv).width();
            var heightIssues = $(settings.issuesDiv).height();
            var widthIssue = $(settings.issuesDiv + ' li').width();
            var heightIssue = $(settings.issuesDiv + ' li').height();
            var widthDates = $(settings.datesDiv).width();
            var heightDates = $(settings.datesDiv).height();
            var widthDate = $(settings.datesDiv + ' li').width();
            var heightDate = $(settings.datesDiv + ' li').height();
            // set positions!
            if (settings.orientation == 'horizontal') {
                //宽度大小会影响时间轴年份的水平排列，不确定会有多少年份，这里暂时设置为document宽度。
                //$(settings.datesDiv).width(widthDate * howManyDates).css('marginLeft', widthContainer / 2 - widthDate / 2);
                $(settings.datesDiv).width($(document).width());
                var defaultPositionDates = parseInt($(settings.datesDiv).css('marginLeft').substring(0, $(settings.datesDiv).css('marginLeft').indexOf('px')));
            } else if (settings.orientation == 'vertical') {
                $(settings.datesDiv).height(heightDate * howManyDates).css('marginTop', heightContainer / 2 - heightDate / 2);
                var defaultPositionDates = parseInt($(settings.datesDiv).css('marginTop').substring(0, $(settings.datesDiv).css('marginTop').indexOf('px')));
            }

            //时间点点击
            $(settings.datesDiv + ' a').click(function (event) {
                event.preventDefault();
                // first vars
                var whichIssue = $(this).text();
                var currentIndex = $(this).parent().prevAll().length;
                // now moving the dates
                $(settings.datesDiv + ' a').each(function () {
                    $(this).css({
                        "font-size": "12px",
                        "color" :"#FEFEFE", //   "rgb(26, 188, 181)",  #2286d8
                        "font-weight": "normal"
                    }).removeClass(settings.datesSelectedClass);
                });
                $(this).css({
                    "font-size": "16px",
                    "color":"#FEFEFE" ,//"rgb(26, 188, 200)",
                    "font-weight": "bold"
                }).addClass(settings.datesSelectedClass);

                var sumCount = $(settings.datesDiv).children().length;   //总个数
                var sumLength = sumCount*widthDate;                      // 总长度   420
                var mL = parseInt($(settings.datesDiv).css("marginLeft"));       // 左


                var   timeLineWidth = 60*settings.maxCount;

                if (sumLength > timeLineWidth) {
                    var currI = 0;
                    if(mL<0){
                        var lm = -mL/60;    //左侧隐藏的个数
                        currI = currentIndex-lm;

                    }else if(mL>=0){
                        var lm = mL/60;
                        currI = currentIndex+lm;
                    }

                    var aa = currentIndex-2;
                    if(currI<=1 ){
                        if(currentIndex>2){
                            if (settings.orientation == 'horizontal') {
                                $(settings.datesDiv).animate({'marginLeft': defaultPositionDates - (widthDate * aa)}, {queue: false, duration: 'settings.datesSpeed'});
                            } else if (settings.orientation == 'vertical') {
                                $(settings.datesDiv).animate({'marginTop': defaultPositionDates - (heightDate * aa)}, {queue: false, duration: 'settings.datesSpeed'});
                            }
                        }
                    }else if(currI>=4){
                         if((sumCount-currentIndex)>1){
                             if (settings.orientation == 'horizontal') {
                                 $(settings.datesDiv).animate({'marginLeft': defaultPositionDates - (widthDate * aa)}, {queue: false, duration: 'settings.datesSpeed'});
                             } else if (settings.orientation == 'vertical') {
                                 $(settings.datesDiv).animate({'marginTop': defaultPositionDates - (heightDate * aa)}, {queue: false, duration: 'settings.datesSpeed'});
                             }
                         }
                    }
                }

                if (callback) {
                    var text = $(this).attr("data-value");
                    var attrs = text.split("-");
                    var data = {};
                    data.month = attrs[0];
                    data.reportname = attrs[1];
                    data.reporttype = attrs[2];
                    data.year = attrs[3];
                    callback(data);
                }
            });

            //向下一个移动
            $(settings.nextButton).bind('click', function (event) {
                event.preventDefault();
                if (settings.orientation == 'horizontal') {
                    var $currentA = null;
                    $(settings.datesDiv + ' a').each(function () {
                        if ($(this).hasClass(settings.datesSelectedClass)) {
                            $currentA = $(this);
                        }
                    });
                    if ($currentA) {
                        if ($currentA.text() == $(settings.datesDiv + " li:last-child a").text()) {
                            return;
                        } else {
                            $currentA.parent().next().find("a")[0].click();
                            var currentPositionDates = parseInt($(settings.datesDiv).css('marginLeft').substring(0, $(settings.datesDiv).css('marginLeft').indexOf('px')));
                            var currentIssueDate = currentPositionDates - widthDate;
                            if (!$(settings.datesDiv).is(':animated')) {
                                $(settings.datesDiv).animate({'marginLeft': currentIssueDate}, {queue: false, duration: 'settings.datesSpeed'});
                            }
                        }
                    }
                }
            });

            //向上一个移动
            $(settings.prevButton).click(function (event) {
                event.preventDefault();
                if (settings.orientation == 'horizontal') {
                    var $currentA = null;
                    $(settings.datesDiv + ' a').each(function () {
                        if ($(this).hasClass(settings.datesSelectedClass)) {
                            $currentA = $(this);
                        }
                    });
                    if ($currentA) {
                        if ($currentA.text() == $(settings.datesDiv + " li:first-child a").text()) {
                            return;
                        } else {
                            $currentA.parent().prev().find("a")[0].click();
                            var currentPositionDates = parseInt($(settings.datesDiv).css('marginLeft').substring(0, $(settings.datesDiv).css('marginLeft').indexOf('px')));
                            var currentIssueDate = currentPositionDates + widthDate;
                            if (!$(settings.datesDiv).is(':animated')) {
                                $(settings.datesDiv).animate({'marginLeft': currentIssueDate}, {queue: false, duration: 'settings.datesSpeed'});
                            }
                        }
                    } else {
                    }
                }
            });

            //时间设置按钮
            //$(settings.settingButton).unbind();
            //$(settings.settingButton).click(function (event) {
            //    event.preventDefault();
            //
            //    var left1 = $("#timeline").css("margin-left");
            //    var lc = Number(left1.substring(0, left1.length - 2)) + $("#timeline").width();
            //    $("#slider-wrap").css({
            //        "margin-left": lc-150 + "px",
            //        "bottom": settings.bottom + 50 + "px",
            //        "position": "fixed"
            //    });
            //
            //    var wrap = $("#slider-wrap");
            //    if(wrap.css("display")=="none"){
            //        wrap.fadeIn();
            //    }else{
            //        wrap.fadeOut();
            //    }
            //});

            // keyboard navigation, added since 0.9.1
            if (settings.arrowKeys == 'true') {
                if (settings.orientation == 'horizontal') {
                    $(document).keydown(function (event) {
                        if (event.keyCode == 39) {
                            $(settings.nextButton).click();
                        }
                        if (event.keyCode == 37) {
                            $(settings.prevButton).click();
                        }
                    });
                } else if (settings.orientation == 'vertical') {
                    $(document).keydown(function (event) {
                        if (event.keyCode == 40) {
                            $(settings.nextButton).click();
                        }
                        if (event.keyCode == 38) {
                            $(settings.prevButton).click();
                        }
                    });
                }
            }


            /**
             * 默认最后一个，不要采用trigger("click"),会影响最大化视图展现
             */
            var liLen = $(settings.datesDiv + ' li').length;
            if(settings.startAt>liLen){
                settings.startAt = liLen-1;
            }

            $(settings.datesDiv + ' a').each(function () {
                $(this).css({
                    "font-size": "12px",
                    "color" :"#FEFEFE",//  "rgb(26, 188, 181)",
                    "font-weight": "normal"
                }).removeClass(settings.datesSelectedClass);
            });
            $(settings.datesDiv + ' li').eq(settings.startAt).find('a').css({
                "font-size": "15px",
                "color":"#FEFEFE",// "rgb(26, 188, 200)",
                "font-weight": "bold"
            }).addClass("selected");

            // autoPlay, added since 0.9.4
            if (settings.autoPlay == 'true') {
            }

            $(settings.autoPlayButton).click(function (event) {
                var currentDate = $(settings.datesDiv).find('a.' + settings.datesSelectedClass);
                if (currentDate.parent().is('li:last-child')) {  //当前是最后一个  从第一个开始地点击
                    currentDate.parent().parent().find("li:first-child").find('a').trigger("click");
                }

                if ($(this).attr("src").indexOf("play") != -1) {
                    $(this).attr("src", "assets/image/timelinr/pause_c.png").css({width:"24px",height:"24px"});
                    if (ia) {
                        ia = null;
                    }
                    ia = setInterval(autoPlay, settings.autoPlayPause);
                } else {
                    $(this).attr("src", "assets/image/timelinr/play_c.png").css({width:"24px",height:"24px"});
                    if (ia) {
                        clearInterval(ia);
                    }
                }
            });

            $(window).bind("resize", function () {
                if (initialized) {
                    setUILocation();
                }
            })
        };

        /**
         * 自动播放
         */
        var autoPlay = function () {
            var currentDate = $(settings.datesDiv).find('a.' + settings.datesSelectedClass);
            if (settings.autoPlayDirection == 'forward') {
                if (currentDate.parent().is('li:last-child')) {
                    if (ia) {
                        clearInterval(ia);
                    }
                    $(settings.autoPlayButton).attr("src", "assets/image/timelinr/play_c.png").css({width:"24px",height:"24px"})
                    //settings.autoPlayDirection = "backward";
                } else {
                    currentDate.parent().next().find('a').trigger('click');
                }
            }
            if (settings.autoPlayDirection == 'backward') {
                if (currentDate.parent().is('li:first-child')) {
                    if (ia) {
                        clearInterval(ia);
                    }
                    $(settings.autoPlayButton).attr("src", "assets/image/timelinr/play_c.png").css({width:"24px",height:"24px"})
                    settings.autoPlayDirection = "forward";
                } else {
                    currentDate.parent().prev().find('a').trigger('click');
                }
            }
        };

        $(function () {
            setupUI();
            setUILocation();
            addEvent();
            initialized = true;
        });
    };

    /**
     * 根据综合指标的periods时段更新时间轴上的年份
     * @param years
     */
    var updateYears = function (years) {
        var $li = $("#timeline #dates li:last-child");
        $li.css({"font-size":"12px","font-weight":"normal"});
        $li.find("a").css({"font-size":"12px","font-weight":"normal"});
        var as = [];

        var leng = years.length;
        for (var i = 0; i < leng; i++) {
            if(years[i].hasdata === false){
                continue;
            }

            var newObject = $li.clone(true);
            var dataValue = years[i].month + "-" + years[i].reportTypeName + "-" + years[i].reportType + "-" + years[i].year;
            newObject.find("a").attr("data-value", dataValue);

            var text = ""; //不显示中文，避免拥挤
            switch (years[i].reportType){
                case 12: //季度
                    text = years[i].year+"."+(years[i].month-12) ;//约定季度月份为13-16
                    break;
                case 13: //月度
                    text = years[i].year+"."+years[i].month;
                    break;
                default :
                    text = years[i].year;
                    break;
            }

            newObject.find("a").text(text);
            as.push(newObject);
        }
        $("#timeline #dates").find("li").remove();
        for (var j = 0,len=as.length; j < len; j++) {
            $("#timeline #dates").append(as[j]);
        }

        $("#timeline #dates li:last-child").find("a").css({
            "font-size": "15px",
            "color":   "#FEFEFE",// "rgb(26, 188, 200)",
            "font-weight": "bold"
        }).addClass("selected");
    };

    var isInit = function () {
        return initialized;
    };


    //var timeSetter = function () {
    //    var html = '<div id="slider-wrap" class="tl" style="display:none;"><input type="hidden" class="range-slider" value="2008,2015"/> </div>';
    //
    //    if($("#slider-wrap").length<1){
    //        $(html).appendTo("body");
    //        $('.range-slider').jRange({
    //            from: 1980,
    //            to: 2016,
    //            step: 1,
    //            scale: [1990,2000,2010,2016],
    //            format: '%s',
    //            width: 200,
    //            showLabels: true,
    //            isRange : true
    //        });
    //    }
    //};

    /**
     * 模块切换时需要调用
     */
    var destroy = function () {
        $("#timeline").remove();
        $("#autoDiv").remove();
        $("#prevDiv").remove();
        $("#nextDiv").remove();
        $("#setting").remove();
        initialized = false;
        clearInterval(ia);
        ia = null;

        //$("#slider-wrap").css("display","none");
    };

    return {
        TimeLinr: TimeLinr,
        isInit: isInit,
        updateYears: updateYears,
        destroy: destroy
    }
});
