/**
 * Created by jinn on 2015/10/21.
 */
define(function (require, exprots, module) {
    //var convertTool = require("component/convertTool");
    //var Tools = require("component/tools");
    var events = require("component/app.events");
    var spatial = require("spatial.query.js");
    var container = "map-container";
    var map, layer,boundaryLayer,boundarySel,labelLayer,hlblayer;//边界图层、标签图层、高亮边界图层


    var selCallbacks = {
        dblclick: function (_fea) {
            //双击下钻
            var data = _fea.data;
            var regionCode = data.QH_CODE;
            var regionName = data.QH_NAME;
            //返回一个行政区划对象
            var _region = new SGIS.Region(regionCode,regionName);
            //alert(regionCode);
            if(_region.getLevel()<4)
                events.trigger("region.dbclick",_region);
        }
        ,click: function (_fea) {
            //TODO 单击选中区域
            //var data = _fea.data;
            //var regionCode = data.QH_CODE;
            //var regionName = data.QH_NAME;
            //
            //var _region = new SGIS.Region(regionCode,regionName);
            //events.trigger("region.click",_region);
        }
    };


    var initMap = function (config,callback) {
        var mapfile = config.mapfile;
        var mapbounds = config.mapbounds;
        mapfile = 'assets/map/' + mapfile;

        map = new SuperMap.Map(container, {
            allOverlays: true
            , controls: [new SuperMap.Control.DragPan(),
                //new SuperMap.Control.MousePosition(),
                new SuperMap.Control.Navigation({
                    dragPanOptions: {
                        enableKinetic: true
                    }
                })
            ],
            maxResolution:11718.75
            //restrictedExtent:new SuperMap.Bounds(5000000,0, 17000000, 11000000)
            //,maxExtent: new SuperMap.Bounds(50,0, 160, 60)
            ,projection: "EPSG:900913"
            //displayProjection: "EPSG:900913"
        });

        var scales = [1.0318602803469382e-13,2.0318602803469382e-13,3.0637205606938765e-13,4.0637205606938765e-13,8.127441121387753e-13,1.6254882242775506e-12,3.250976448555101e-12,6.501952897110202e-12,1.3003905794220405e-11,2.600781158844081e-11,5.201562317688162e-11,2.0806249270752648e-10,4.1612498541505295e-10];
        var options = {numZoomLevels:15,useCanvas:false,isBaseLayer:true}; //,scales:scales
        var bounds= new SuperMap.Bounds(mapbounds[0],mapbounds[1], mapbounds[2], mapbounds[3]);
        layer=new SuperMap.Layer.Image(
            'map',
            mapfile,
            bounds,
            options
        );

        boundaryLayer = new SuperMap.Layer.Vector("bline", {renderers: ["Canvas2"]}); //边界图层
        boundaryLayer.showcolor = false; //显示图层颜色(自定义变量)
        labelLayer = new SuperMap.Layer.Markers("lbregion",{});                //行政区划标签

        //浏览器判断
        if(SGIS.agent=="pc"){
            hlblayer = new SuperMap.Layer.Vector("hl", {renderers: ["Canvas2"]}); //边界高亮图层
            //向地图中添加多个图层,layer:地图背景图片,添加各种图层,然后这些图层分别在main.js,spatial.query.js中处理
            map.addLayers([layer,boundaryLayer,labelLayer,hlblayer]);
        }else{
            map.addLayers([layer,boundaryLayer,labelLayer]);
        }

        //map.zoomToMaxExtent();

        //设置选择要素控件(边界图层)
        boundarySel = new SuperMap.Control.SelectFeature(boundaryLayer, {
            callbacks:selCallbacks,
            hover: false,
            repeat: false
        });
        boundarySel.selectStyle = {};
        map.addControl(boundarySel);
        boundarySel.activate();

        //map.setCenter(new SuperMap.LonLat(116, 32), 1);

        map.events.on({
            "zoomend": function (o) {
                //var r = map.getResolution();
                //var sc = map.getScale();
                //console.log("分辨率：" + r);
                //console.log("比例尺：" + sc);
                var size = map.getZoom()*1+10;
                $(".reglab").css({"font-size":size+"px"});
                var $tooltip = $("#thematic-tooltip");
                //缩放结束,如果此时标签存在,则去除
                if ($tooltip.length > 0) {
                    $tooltip.remove();
                }

                var ecTip = $(".echarts-tooltip.zr-element");
                if(ecTip.length>0){
                    ecTip.remove();
                }
            },
            //应该是鼠标移开
            "moveend": function () {
                var $tooltip = $("#thematic-tooltip");
                if ($tooltip.length > 0) {
                    $tooltip.remove();
                }

                var ecTip = $(".echarts-tooltip.zr-element");
                if(ecTip.length>0){
                    ecTip.remove();
                }
            }
        });

        //判断callback是否定义,如果定义则直接运行.
        callback&&callback();
    };


    (function () {
        //initMap();
        //getConfig();
    })();


    return {
        init:initMap,
        getMap: function () {
            return map;
        },
        getSelCallbacks: function () {
            return selCallbacks;
        }
    }
});
