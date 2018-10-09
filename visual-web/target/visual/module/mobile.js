/**
 * Created by jinn on 2016/2/18.
 */
define(function (require, exports, module) {

    var Layer = require("layer");
    var regionSet = require("regionset");
    var SpatialQuery = require("spatial.query");
    var Idens = require("idens");
    var Grid = require("grid");
    var Chart = require("chart");

    var map = Layer.getMap();

    var config;
    /**
     * 获取配置
     * @param callback
     */
    var getConfig = function (callback) {
        if (config) {
            callback && callback(config);
            return
        } else {
            require.async("../config", function (re) {
                config = re;
                callback && callback(re);
            });
        }
    };

    +function () {
        getConfig(function (re) {

            SGIS.UI.addLoadingBar("正在加载数据...","#main-container");


            SGIS.API.setServerName(re.serverName || "visdata");
            Layer.init(re, function () {
                map = Layer.getMap();
                regionSet.init(function () {

                    var bdwidth = $("body").width();
                    if(bdwidth<400){   //小于400的 地图放大
                        map.panTo(new SuperMap.LonLat(12630117,4400000));
                        var zoom = map.getZoom();
                        map.zoomTo(zoom+2);
                    }

                    SGIS.UI.clearLoadingBar();

                });
                Idens.init(config);
            });
        });
    }();

    $(function () {
        //方向改变事件
        $(window).on("orientationchange",function(event){
            //alert("方向是: " + event.orientation);
        });

        $(window).resize(SGIS.Util.throttle(function () {
            resize();
        },200)).resize();


        $('.ui.dropdown').dropdown();
        //区域选择标签页
        $('#region-panel>div .item').tab();

        //指标选择面板
        $("#iden-content").bind("tap", function () {
            $("#iden-panel").panel("open");
        });
        $("#clo-iden").bind("click tap", function () {
            $("#iden-panel").panel("close");
        });


        //区域选择面板
        $(".item.loc").click(function (){
            regionSet.toggle();
        });

        //时间设置
        $("#tm-set").click(function () {
            regionSet.hide();//隐藏区划面板

            timeSetter();
        });


        $("body").click(function () {
            //$(".ui.popup").remove();
        });

        //全屏
        $("#tool-full").click(function () {
            fullView();
        });

        //清除
        $("#tool-clear").click(function () {
            clearAll();
        });

        //图例toggle
        $("#tool-legend").click(function () {
            Idens.toggleLegend();
        });

        //边界图层颜色控制
        $("#tool-col").click(function () {
            layerColor();
        });

        //工具栏
        //行政区划标签控制
        $("#tool-lbregion").click(function () {
            layerLabel($(this));
        });



        //图表控制
        $("#chart-control").click(function () {
            if($("#gc-panel").hasClass("hide")){
                $("#gc-panel").removeClass("hide");
            }else{
                $("#gc-panel").addClass("hide");
            }
        });

        //关闭图表
        $("#clo-gc").click(function () {
            $("#gc-panel").addClass("hide");
        });


        //指标面板打开事件
        $("#iden-panel").panel({
            beforeopen:function(event,ui){
               //将其他面板关闭
                $("#input-iden").attr("disabled");


                regionSet.hide();//隐藏区划面板
                $("#slider-wrap").fadeOut();  //隐藏区域面板
                $("#gc-panel").addClass("hide"); //隐藏右侧面板

                Idens.hideLegend();   //图例隐藏


                $("#query-btns").focus();

                setTimeout(function () {

                   $("#input-iden").removeAttr("disabled");

                    //alert($("#input-iden").attr("disabled"));

                    $("#query-btns").focus();

                },300);


            }
        });


    });


    /**
     * 窗口调整
     */
    var resize = function () {
        var height = $("body").height();
        var width = $("body").width();
        //var cgWidth = $("#cg-panel").width();



        var gccH = height*0.9 - 40 ;
        var gccW = width*0.5;
        if(gccW>400){
            gccW = 400;
        }


        //gc面板的高度
        var gcHeight = $("#gc-panel").height();
        var gcWidth = $("#gc-panel").width();

        //var gcHeight = gccH;
        //var gcWidth =  gccW;


        var gHeight = (gcHeight-40-40)*0.7;
        var cHeight = (gcHeight-40-40)*0.3;

        $("#grid-container").css({"width":gcWidth,"height":gHeight});
        $("#chart-container").css({"width":gcWidth,"height":cHeight});


    };

    var init = function () {

    };


    /**
     * 全屏显示
     */
    var fullView = function () {
        regionSet.hide();//隐藏区划面板

        $("#iden-panel").panel("close");

        $("#slider-wrap").fadeOut();

        $("#gc-panel").addClass("hide");

        Idens.hideLegend();   //图例隐藏
    };


    /**
     * 区划标签控制
     */
    var layerLabel = function (that) {
        var i = that.find("i");
        var labelLayer = map.getLayersByName("lbregion")[0];
        if (i.hasClass("unhide")) { //关闭
            i.removeClass("unhide").addClass("hides");
            that.attr("title", "打开行政区划标签");
            SpatialQuery.setIsShowLable(false);

            labelLayer.setVisibility(false);
        } else {   //打开
            i.removeClass("hides").addClass("unhide");
            that.attr("title", "关闭行政区划标签");

            SpatialQuery.setIsShowLable(true);
            labelLayer.setVisibility(true);
        }
    }

    /**
     * 彩色涂层
     */
    var layerColor = function () {
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
            } else {
                for (var i = 0, n = features.length; i < n; i++) {
                    features[i].style.fillOpacity = 1;
                    features[i].style.stroke = false;
                    features[i].style.fill = true;
                }
                boundaryLayer.showcolor = true;
            }

            boundaryLayer.redraw();
        }

    };

    /**
     * 清除全部
     */
    var clearAll = function () {
        SGIS.UI.clearLoadingBar();

        Idens.clearAllThematic();  //清除专题图
        Grid.clearAll();           //清除表格
        Chart.clearAll();          //清除图表

        $("#chart-control").css("display","none");

        Idens.clearAllSel();    //重置指标状态

        $("#slider-wrap").fadeOut();

        $("#gc-panel").addClass("hide");
    };



    var timeSetter = function () {
        var html = '<div id="slider-wrap" style="display:none;"><input type="hidden" class="range-slider" value="2008,2015"/> </div>';
        if($("#slider-wrap").length<1){
            $(html).appendTo("body");
            $('.range-slider').jRange({
                from: 1990,
                to: 2016,
                step: 1,
                scale: [1990,2000,2010,2016],
                format: '%s',
                width: 200,
                showLabels: true,
                isRange : true,
                theme:"theme-blue"
            });
        }

        var bw = $("body").width();
        var ml = (bw -200)/2-10;

        $("#slider-wrap").css({
            "position": "fixed",
            "top":"70px",
            "margin-left":ml+"px"
        });

        var wrap = $("#slider-wrap");
        if(wrap.css("display")=="none"){
            wrap.fadeIn();
        }else{
            wrap.fadeOut();
        }
    };



    return{
        init:init
    }
});
