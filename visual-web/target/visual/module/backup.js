/**
 * Created by jinn on 2015/11/5.
 */
var supportLayers = [
    {"code": "0", "name": "mapabc", "url": "", "memo": "mapabc影像"},
    {"code": "1", "name": "mapabc", "url": "", "memo": ""},
    {"code": "2", "name": "tdtvec", "url": "", "memo": ""},
    {"code": "3", "name": "tdtimg", "url": "", "memo": ""},
    {"code": "4", "name": "canvas", "url": "", "memo": "canvas图层"},
    {"code": "5", "name": "svg", "url": "", "memo": "svg图层"},
    {"code": "6", "name": "baidu", "url": "", "memo": "百度地图"}

];



var setLayer = function (id) {
    var ly = null;
    for (var i = 0, len = supportLayers.length; i < len; i++) {
        var obj = supportLayers[i];
        if (obj.code == id) {
            ly = obj;
            break;
        }
    }
    if (ly == null) {
        throw new Error("传入的地图序号不被支持！");
    } else {
        if (ly.code == "0" || ly.code == "1" || ly.code == "2" || ly.code == "3") {
            iClientLayer(ly);
        } else if (ly.code == "4") {
            canvasLayer();
        } else if (ly.code == "5") {
            svgLayer();
        } else if (ly.code == "6") {
            bdLayer();
        }
    }
};

var iClientLayer = function (ly) {
    switch (ly.code) {
        case "0":
            break;
        case "1":
            layer = new SuperMap.Layer.MapABC(ly.name || "base:mapABC", ly.URL || null);
            break;
        case "2":
            break;
        case "3":
            break;
        case "4":
            break;
    }

    layer.isBaseLayer = true;
    map.addLayer(layer);
    map.setCenter(new SuperMap.LonLat(11339634.286396, 4588716.5813769), 5);
};

var canvasLayer = function () {


    var hasMapData = false;
    if (!hasMapData) {
        setEchartMapData();
        hasMapData = true;
    }

    map = echarts.init(document.getElementById(container));

    var option = {
        //tooltip : {
        //    trigger: 'item',
        //    formatter: '{b}'
        //},
        series: [
            {
                name: '中国',
                type: 'map',
                mapType: 'ch',
                roam: true,
                selectedMode: 'single',
                itemStyle: {
                    normal: {label: {show: false}},
                    emphasis: {label: {show: true}}
                },
                data: [],
                // 自定义名称
                nameMap: {
                    //'宁夏':'津巴布韦'
                }
            }
        ]
    };
    map.setOption(option);
};

var svgLayer = function () {

};

/**
 * 设置地图数据
 */
var setEchartMapData = function () {
    var filename = "module/data/sn/china.json";
    echarts.util.mapData.params.params["ch"] = {
        getGeoJson: function (callback) {
            $.getJSON(filename, function (data) {
                //callback(echarts.util.mapData.params.decode(data));
                callback(convertTool.decode(data));
            });
        }
    };

};

/**
 * 百度地图
 */
var bdLayer = function () {
    var map = new BMap.Map(container,{minZoom:5,maxZoom:10});
    map.centerAndZoom(new BMap.Point(105, 34), 5);
    //map.getContainer().style.background = '#081734';
    var mapStyle = {
        features: [],
        styleJson: [{
            featureType: 'water',
            elementType: 'all',
            stylers: {
                color: '#044161'
                //visibility: 'off'
            }
        }, {
            featureType: 'land',
            elementType: 'all',
            stylers: {
                color: '#091934'
            }
        }, {
            featureType: 'boundary',
            elementType: 'geometry',
            stylers: {
                color: '#064f85'
                //visibility: 'off'
            }
        }, {
            featureType: 'railway',
            elementType: 'all',
            stylers: {
                visibility: 'off'
            }
        }, {
            featureType: 'highway',
            elementType: 'geometry',
            stylers: {
                //color: '#004981'
                visibility: 'off'
            }
        }, {
            featureType: 'highway',
            elementType: 'geometry.fill',
            stylers: {
                //color: '#005b96',
                //lightness: 1
                visibility: 'off'
            }
        }, {
            featureType: 'highway',
            elementType: 'labels',
            stylers: {
                //visibility: 'on'
                visibility: 'off'
            }
        }, {
            featureType: 'arterial',
            elementType: 'geometry',
            stylers: {
                //color: '#004981',
                //lightness: -39
                visibility: 'off'
            }
        }, {
            featureType: 'arterial',
            elementType: 'geometry.fill',
            stylers: {
                //color: '#00508b'
                visibility: 'off'
            }
        }, {
            featureType: 'poi',
            elementType: 'all',
            stylers: {
                visibility: 'off'
            }
        }, {
            featureType: 'green',
            elementType: 'all',
            stylers: {
                color: '#056197',
                visibility: 'off'
            }
        }, {
            featureType: 'subway',
            elementType: 'all',
            stylers: {
                visibility: 'off'
            }
        }, {
            featureType: 'manmade',
            elementType: 'all',
            stylers: {
                visibility: 'off'
            }
        }, {
            featureType: 'local',
            elementType: 'all',
            stylers: {
                visibility: 'off'
            }
        }, {
            featureType: 'arterial',
            elementType: 'labels',
            stylers: {
                visibility: 'off'
            }
        }, {
            featureType: 'boundary',
            elementType: 'geometry.fill',
            stylers: {
                color: '#029fd4'
            }
        }, {
            featureType: 'building',
            elementType: 'all',
            stylers: {
                //color: '#1a5787'
                visibility: 'off'
            }
        }, {
            featureType: 'label',
            elementType: 'all',
            stylers: {
                visibility: 'off'
            }
        }, {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: {
                //color: '#ffffff'
                visibility: 'off'
            }
        }, {
            featureType: 'poi',
            elementType: 'labels.text.stroke',
            stylers: {
                color: '#1e1c1c'
            }
        }]
    }
    map.setMapStyle(mapStyle);
};


/**
 * 背景图层
 */
var bgLayer = function () {
    var segLayer = new SuperMap.Layer.Vector("bgl", {
        renderers: ["Canvas2"]
    });
    //需要控制图层顺序
    map.addLayers([segLayer]);
    $(segLayer.div).css("z-index", 9);
    var segSelect = new SuperMap.Control.SelectFeature(segLayer, {
        onSelect: $.noop(),
        onUnselect: $.noop(),
        hover: true,
        repeat: false
    });
    //分段专题选中样式
    segSelect.selectStyle = {};
    map.addControl(segSelect);

    var  _daNames  = ['wd']
        ,_paths = ['module/data/wd/wd.js'];

    Tools.load(_paths).done(function () {
        var currFeatrues = [];
        $.map(_daNames,function(name,i){
            var win_data = window[name];//JS文件名为变量名的JSON对象
            if(win_data) {
                var fea = SuperMap.REST.Recordset.fromJson(win_data.recordsets[0]).features;//读取专题面
                currFeatrues = currFeatrues.concat(fea);//合并数组
            }else{
                console.log("专题【"+name+"】JS文件加载失败，请检查文件配置");
            }
        });

        var timerFlag = null;
        var feature, flag = 0,max = 0;
        var kk = 0;
        timerFlag = setInterval(function () {
            flag++;
            max = 100*(flag-1);
            var leng = 100*flag;
            for (var k = max; k < leng; k++) {
                kk ++;
                if (kk > currFeatrues.length) {
                    clearInterval(timerFlag);
                    segSelect.activate();
                    k = 0;
                    kk = 0;
                    break;
                }
                feature = currFeatrues[k];

                //var indexInfo  = getStyle(feature, resultData.content, config.segmentThemantic.colors.data, dataRamp);
                feature.style = {
                    fillColor: "rgb(172, 203, 224)",
                    fillOpacity: 0.7,
                    strokeColor: "#FFF",
                    strokeOpacity: 1
                };
                //feature.info = {
                //    iden: rankParam.iden,
                //    value: (indexInfo.index == -1) ? 0 :resultData.content[indexInfo.index][rankParam.index]
                //};

                if(kk===1){
                    segLayer.removeAllFeatures();   //清除延后防止播放时白图
                    segLayer.setVisibility(true);
                }
                segLayer.addFeatures([feature]);
            }
        }, 25);

    });



};