/**
 * Created by jinn on 2015/10/16.
 */
define(function (require, exports, module) {
    var Layer = require("layer");
    var regionSet = require("regionset");
    var SpatialQuery = require("spatial.query");
    var Idens = require("idens");
    var Grid = require("grid");
    var Chart = require("chart");

    var operate = require("operate");

    var map = Layer.getMap();

    var config;
    /**
     * 获取配置
     * @param callback
     */
    var getConfig = function (callback) {
        //判断配置是否已经读取,若已读取,则直接运行
        if(config){
            callback && callback(config);
            return
        }else{
            require.async("../config", function (re) {
                //re就相当于整个网页的对象,可以直接使用
                config = re;
                callback && callback(re);
            });
        }
    };

    //此处使用一个自执行方法,初始化layer图层,获取map
    +function () {
       getConfig(function (re) {
           SGIS.API.setServerName(re.serverName || "visdata");
           Layer.init(re,function () {
               //地图初始化
               regionSet.init();
               Idens.init(config);
               map = Layer.getMap();
           });
       });
    }();

    (function(){
        var url = "check";
        SGIS.API.get(url).json(function (re) {
            if(re.status){
                //true已经登录
                $("#btn-down").show();
                $("#manager").show();
                $("#register").hide();
                $("#login").hide();
            }else{
                $("#btn-down").hide();
                $("#manager").hide();
                $("#register").show();
                $("#login").show();
            }
        });
    })();

    $(function () {

        $(window).resize(SGIS.Util.throttle(function () {
            resize();
        },200)).resize();

        $('.ui.dropdown').dropdown();

        /**
         * 伸缩指标面板
         */
        $("#iden-panel .ustool").click(function () {
            var i = $(this).find("i:visible");
            if (i.hasClass("up")) {
                $("#iden-box,#par-qbtns").fadeOut();
            } else {
                $("#iden-box,#par-qbtns").fadeIn();
            }
            i.addClass("hide");
            i.siblings("i").removeClass("hide");
        });

        //区域选择面板
        $("#region-tool i.icon").click(function () {
            regionSet.toggle();
        });

        $("#region-tool i.icon").mouseover(function () {
            $(this).addClass("large")
        });
        $("#region-tool i.icon").mouseout(function () {
            $(this).removeClass("large")
        });


        //区域选择标签页
        $('#region-panel>div .item').tab();


        //数据查询事件注册
        $("#btn-do-map").click(function () {
            $("#btn-do-grid,#btn-do-chart").removeClass("disabled"); //数据查询后 启用表格和图表按钮
        });
        $("#btn-do-grid").click(function () {
            Grid.show();
        });
        $("#btn-do-chart").click(function () {
            Chart.show();
        });
        


        //工具栏
        //全屏
        $("#tool-full").click(function () {
            fullView();
        });
        //清除
        $("#tool-clear").click(function () {
            clearAll();
        });
        //图表toggle
        $("#tool-cg").click(function () {
            Grid.toggle();
            Chart.toggle();
        });
        //图例toggle
        $("#tool-legend").click(function () {
             Idens.toggleLegend();
        });

        //边界图层颜色控制
        $("#tool-col").click(function () {
            var boundaryLayer = map.getLayersByName("bline")[0];
            if (boundaryLayer) {
                var features = boundaryLayer.features;
                var showColor = boundaryLayer.showcolor;

                //var op = features[0].style.fillOpacity;
                //if(op == "1"){
                //    boundaryLayer.showcolor = true;
                //}else{
                //    boundaryLayer.showcolor = false;
                //}

                if (showColor) {
                    for (var i = 0, n = features.length; i < n; i++) {
                        features[i].style.fillOpacity = 0;
                        features[i].style.stroke = true;
                    }
                    boundaryLayer.showcolor = false;
                    $(".reglab").css({"color":"rgb(0,0,0)"});
                } else {
                    for (var i = 0, n = features.length; i < n; i++) {
                        features[i].style.fillOpacity = 1;
                        features[i].style.stroke = false;
                        features[i].style.fill = true;
                    }
                    boundaryLayer.showcolor = true;

                    $(".reglab").css({"color":"rgb(0,0,0)"});
                }

                boundaryLayer.redraw();
            }

        });


        //行政区划标签控制
        $("#tool-lbregion").click(function () {
            var i = $(this).find("i");
            var labelLayer = map.getLayersByName("lbregion")[0];
            if (i.hasClass("unhide")) { //关闭
                i.removeClass("unhide").addClass("hides");
                $(this).attr("title", "打开行政区划标签");
                SpatialQuery.setIsShowLable(false);

                labelLayer.setVisibility(false);
            } else {   //打开
                i.removeClass("hides").addClass("unhide");
                $(this).attr("title", "关闭行政区划标签");

                SpatialQuery.setIsShowLable(true);
                labelLayer.setVisibility(true);
            }
        });

        //截屏
        $("#tool-img").click(function () {
             var box = $("#map-container");
             renderImage(box, function (canvas) {
                 var baseM = canvas.toDataURL("image/jpg");

                 var html = "<div  style='position: fixed;top:-50px; z-index: 999999999; display: block; text-align: center; " +
                     "width: 100%; height: 110%;line-height:1px; background-color: rgba(33, 33, 33, 0.498039);'>" + //line-height: 955px;
                     "<a {{attrs}}>" +
                     "<img style='position:relative;vertical-align:middle;top:30%;width:60%;height:50%;text-align: center;' src="+baseM+" title='点击保存'>" +
                     "</a>"+
                     "</div>";

                 var attrs ="href='"+baseM+"' download='save.jpg'";
                 html = html.replace("{{attrs}}",attrs);
                 $(html).appendTo($("#save-img"));
                 $("#save-img").unbind("click");
                 $("#save-img").on("click", function () {
                     $("#save-img").empty();
                 });
                 //var ifrdownload = $("#ifr-download");
                 //ifrdownload.css("display","block");
                 //ifrdownload.attr("src",baseM);
                 //ifrdownload.css("display","none");//加载完关闭

             })
        });

        //分享
        $("#tool-share").click(function () {
            //TODO
            //alert("此功能正在开发，请稍后...");
        });
        //帮助
        $("#tool-help").click(function () {
            //TODO
            //alert("帮助文档正在编写中，请稍后...");
        });


        $("body").click(function () {
            $(".ui.popup").remove();
        });

    });


    /**
     * 窗口调整
     */
    var resize = function () {
        var height = $(window).height();
        var width = $(window).width();

        var left = width - 300 -15;
        var gtop = 60;
        var ctop = 400 + 60;

        //重新调整右侧panel的位置
        Grid.getPanel().css({"left":left + "px","top":gtop + "px"});
        Chart.getPanel().css({"left":left + "px","top":ctop + "px"});


    };

    var init = function () {
        Grid.init();
        Chart.init();
    };


    /**
     * 全屏显示
     */
    var fullView = function () {
        Grid.hide();
        Chart.hide();
        regionSet.hide();//隐藏区划面板

        //收起指标面板
        var box = $("#iden-box");
        if(!box.hasClass("hide") || box.css("display")=="block"){
            $("#iden-box,#par-qbtns").fadeOut();
            var $this =  $("#iden-panel .ustool");
            var i = $this.find("i:visible");
            i.addClass("hide");
            i.siblings("i").removeClass("hide");
        }
    };

    /**
     * html渲染成图片
     * @param selector  jQuery选择器
     * @param callback  渲染成功回调
     */
    var  renderImage = function (selector, callback) {
        html2canvas(selector, {
            allowTaint:false,
            onrendered: callback
        })
    };

    /**
     * 清除全部
     */
    var clearAll = function () {
        Idens.clearAllThematic();  //清除专题图
        Grid.clearAll();           //清除表格
        Chart.clearAll();          //清除图表

        Idens.clearAllSel();    //重置指标状态


        var boundaryLayer = map.getLayersByName("bline")[0];
        if (boundaryLayer) {
            if(boundaryLayer.showcolor){
                $(".reglab").css({"color":"rgb(0,0,0)"});
            }else{
                $(".reglab").css({"color":"rgb(0,0,0)"});
            }
        }
    };


    var browser={
        versions:function(){
            var u = navigator.userAgent, app = navigator.appVersion;
            return {//移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
            };
        }(),
        language:(navigator.browserLanguage || navigator.language).toLowerCase()
    };

    //if(browser.versions.mobile || browser.versions.ios || browser.versions.android ||
    //    browser.versions.iPhone || browser.versions.iPad){
    //    alert("移动端哈哈");
    //}


    return {
        init: init
    }
});
