/**
 * Created by jinn on 2016/2/18.
 */
define(function (require, exports, module) {

    var Layer = require("layer");                  //初始化地图主页面，调用initMap()，加载地图，并为其绑定单击，双击等事件
    var regionSet = require("regionset");          //获取配置信息，初始化地区选择面板，行政区划树，绑定面板中各种事件,管理行政区划树
    var SpatialQuery = require("spatial.query");   //加载本地缓存文件。本系统在第一次加载完成后做了一次缓存，将压缩后的缓存文件保存至本地，之后再进行加载的时候可以迅速调用。此外彩色地图也是在这个文件中进行配置
    var Idens = require("idens");                  //获取行政区划相关配置，初始化显示的报告期进行指标查询并进行专题图绘制工作，绑定自定义事件
    var Grid = require("grid");                    //由于表格的绘制使用第三方插件，所以需要对表格进行初始化。在初始化完成后，将获得的数据进行一定处理，调整表格样式，格式完成数据展示
    var Chart = require("chart");                  //对统计图表进行初始化后，等待数据，激活统计图，并未相应元素绑定事件

    var map = Layer.getMap();                      //获取地图

    var config;                                    //声明配置
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
    };    //获取配置，如果没有配置就引入地图的基本配置？

    +function () {
        getConfig(function (re) {

            SGIS.UI.addLoadingBar("正在加载数据...","#map-container");


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

                    setTimeout(function () {
                        $("#logo").removeClass("hide");
                    },400);

                });
                Idens.init(config);
            });
        });
    }();

    $(function () {
        //方向改变事件
        $(window).on("orientationchange",function(event){
            //alert("方向是: " + event.orientation);
            resize();
        });

        $(window).resize(SGIS.Util.throttle(function () {
            resize();
        },200)).resize();


        $('.ui.dropdown').dropdown();
        //区域选择标签页
        $('#region-panel>div .item').tab();

        //$("#vbar-control").click(function () {
        //    var vbar = $("#v-toolbar");
        //    if(vbar.css("display")=="none"){
        //        vbar.fadeIn();
        //    }else{
        //        vbar.fadeOut();
        //    }
        //});

        //指标选择面板
        $("#iden-content").bind("click", function () {
            if($("#indi-panel").hasClass("hide")){
                $("#indi-panel").removeClass("hide");
                $("#gc-panel").addClass("hide");

                var items = $("#selection-items");
                if (!items.html())
                    items.html("<span>没有数据</span>");
                
                //假如有数据 需要让gc控制按钮显示出来
                if($("#chart-control").attr("hasdata")=="yes"){
                    $("#chart-control").removeClass("hide");
                }
            }else{
                $("#indi-panel").addClass("hide");
            }

            $("#v-toolbar").fadeOut();
        });

        $("#clo-iden").bind("click", function () {
            $("#indi-panel").addClass("hide");

            $("#v-toolbar").fadeIn();
        });


        //区域选择面板
        $(".item.loc").click(function (){
            regionSet.toggle();

            //$("#v-toolbar").fadeOut();

        });

        //时间设置
        $("#tm-set").click(function () {
            regionSet.hide();//隐藏区划面板
            $("#indi-panel").addClass("hide");
            timeSetter();

            //$("#v-toolbar").fadeOut();

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
                $("#indi-panel").addClass("hide");

                $("#chart-control").addClass("hide");

                Grid.syncHeaderHeight();

            }else{
                $("#gc-panel").addClass("hide");
            }
        });

        //关闭图表
        $("#clo-gc").click(function () {
            $("#gc-panel").addClass("hide");
            $("#chart-control").removeClass("hide");
        });


        //关于
        //$("#about").popup({
        //    position:"top right",
        //    on:'click',
        //    exclusive:true,
        //    //content: ''
        //    html:'<div>技术支持:超图-北邮大数据中心</div>'
        //});

        //关于
        $("#about").click(function () {
            $('.ui.modal.about').modal("show");
        });

        //反馈
        $("#feedback").click(function () {
            location.href = "feedback.html";
        });

        //操作指南
        $("#puzzle").click(function () {
            $(".ui.modal.puz").modal("show");
        });
        
        //点击logo
        $("#logo").click(function () {
            if($("#v-toolbar").css("display")=="none"){
                $("#v-toolbar").fadeIn();
            }
        });


    });


    /**
     * 窗口调整
     */
    var resize = function () {
        var height = $("body").height();
        var width = $("body").width();


        //gc面板的高度
        var gcHeight = $("#gc-panel").height();
        var gcWidth = $("#gc-panel").width();
        var gHeight = (gcHeight-30-30)*0.7;
        var cHeight = (gcHeight-30-30)*0.3;

        //$("#grid-container").css({"width":gcWidth,"height":gHeight});
        //$("#grid-container2").css({"width":gcWidth,"height":gHeight});

        //$("#grid-container").css({"height":gHeight});
        //$("#grid-container2").css({"height":gHeight});



        $("#chart-container").css({"width":gcWidth,"height":cHeight});

        $("#grid-container").css({"height":gHeight});
        //$("#grid-container2").css({"width":"90px","height":gHeight});
        //$("#grid-container").css({"width":(gcWidth-93)+"px","height":gHeight});
        //$("#grid-container2").css({"width":"93px","height":gHeight});


        $("#chart-container").css({"width":gcWidth,"height":cHeight});

        //Iden面板宽度

        var idenWidth = $("#indi-panel").width();
        var idenHeight =$("#indi-panel").height();
        var rWid = idenWidth - 55;
        var selHeight = idenHeight - 170;

        //var sumH = $("#search-head").height() + $(".ui.text.menu").height() + 7 + $("#selection-bread").height() + $("#btn-view").height() + 20;

        $("#sel-panel-idens").css({"width":rWid,"height":selHeight});
        $("#selection-bread").css({"width":rWid});


        $("#search-head").css({"width":(idenWidth-60) + "px"});
        $("#input-iden").css("width",(idenWidth-110) + "px");

        //var tw = $("#v-toolbar").height();
        //$("#v-toolbar").css("top",(height-tw)/2 + "px");
    };




    /**
     * 全屏显示
     */
    var fullView = function () {
        regionSet.hide();//隐藏区划面板

        $("#indi-panel").addClass("hide")

        $("#slider-wrap").fadeOut();

        $("#gc-panel").addClass("hide");

        Idens.hideLegend();   //图例隐藏

        $("#v-toolbar").fadeIn();


        if($("#chart-control").attr("hasdata")=="yes"){
            $("#chart-control").removeClass("hide");
        }


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
     * 彩色图层
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

    };

    /**
     * 清除全部
     */
    var clearAll = function () {
        SGIS.UI.clearLoadingBar();

        Idens.clearAllThematic();  //清除专题图
        Grid.clearAll();           //清除表格
        Chart.clearAll();          //清除图表

        //$("#chart-control").css("display","none");

        Idens.clearAllSel();    //重置指标状态

        $("#slider-wrap").fadeOut();

        $("#gc-panel").addClass("hide");

        $("#indi-panel").addClass("hide");

        $("#chart-control").attr("hasdata","no");
        $("#chart-control").addClass("hide");


        var boundaryLayer = map.getLayersByName("bline")[0];
        if (boundaryLayer) {
            if(boundaryLayer.showcolor){
                $(".reglab").css({"color":"rgb(0,0,0)"});
            }else{
                $(".reglab").css({"color":"rgb(0,0,0)"});
            }
        }



    };



    var timeSetter = function () {
        var html = '<div id="slider-wrap" style="display:none;"><input type="hidden" class="range-slider" value="2008,2015"/> </div>';
        if($("#slider-wrap").length<1){
            $(html).appendTo("body");
            $('.range-slider').jRange({
                from: 1990,
                to: 2014,
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


    var init = function () {
        if(SGIS.agent=="pc"){
            $("#logo").css("height","100px");
            $("#v-toolbar").css("top","150px");
            $("#indi-panel").css("top","100px");
        }
    };

    return{
        init:init
    }
});
