/**
 * Created by jinn on 2015/11/4.
 */

/**
 * 统计对比图
 */
define(function (require, exports, module) {
    var Tools = require("component/tools");
    var ThematicUtil = require("ThematicUtil");
    var SpatialQuery = require("spatial.query");
    var timeLinr = require("timeLinr");          //时间轴
    var Layer = require('layer');
    var enlarge = require("enlarge");
    var map = Layer.getMap();
    var resultData;            //从数据库里查找到的结果对象数据-已经从小到大排序了8
    var allInicators = [];     //解析全部指标（包括分组子指标）
    var config;
    var _isInit = false;
    var Data = null;

    var currRegions,currLevel;  //当前行政区划 当前级别

    var currFeatrues = null;
    var comparisonLayer;                //对比统计专题图图层
    var comparisonDiv;                  //对比统计div对象


    var bar_dataStyleByFields;
    var line_dataStyleByFields;
    var pie_dataStyleByFields;
    /**
     * 对比图类型
     * @type {{BAR: string, LINE: string, PIE: string}}
     */
    var ComparisonTypes = {
        "BAR":"bar",
        "LINE":"line",
        "PIE":"pie"
    };
    var currComparisonType = "bar"; //当前对比图类型 默认柱图

     //对比统计专题参数
    var comparisonParam = {
        idencode:null,
        idenname: null,
        time: null,
        unit: "",
        type:ComparisonTypes.BAR,        //默认为柱状图
        time_index: null,
        iden_index: null,
        index: null
    };


    var hasCreateComparison = false; //是否已经创建对比图

    /**
     * 取得专题图配置信息
     * @param callback
     *              回调函数
     */
    var getConfig = function(callback){
        if(config){
            callback && callback(config);
            return
        }else{
            $.getJSON(require.resolve("component/thematic.config.json")
                ,function (re) {
                    config = re;    //保存配置信息
                    //保存
                    bar_dataStyleByFields =  config.comparison.settingForBar.dataStyleByFields;
                    line_dataStyleByFields = config.comparison.settingForLine.dataStyleByFields;
                    pie_dataStyleByFields =  config.comparison.settingForPie.dataStyleByFields;
                    callback && callback(config);
                });
        };
    };


    /**
     * 初始化  专题图例
     * @param callback
     */
    var init = function(callback){
        if(_isInit){
            callback && callback();
        }else{
            getConfig(function(config){
                seajs.use(['component/legend.comparison'],
                    function(comparisonLegend){
                        //设置统计对比图的参数
                        comparisonLegend.setup({
                            onClick:function(){
                                //TODO
                            },
                            onClose:function(){
                                //TODO
                            }
                        });

                        //标记已经初始化
                        _isInit = true;
                        callback && callback();
                    });
            });
        }


        $(window).resize(SGIS.Util.throttle(function () {
            comparisonLayer&&comparisonLayer.redraw();
        },200))
    };


    /**
     * 初始化一个图层
     */
    var initLayer = function () {
        var comparisonType = comparisonParam.type;
        switch(comparisonType){
            case ComparisonTypes.LINE:
                comparisonLayer = new SuperMap.Layer.Graph("ThemeLayer", "Line");
                // 配置图表参数
                comparisonLayer.chartsSetting = config.comparison.settingForLine;
                break;
            case ComparisonTypes.PIE:
                comparisonLayer = new SuperMap.Layer.Graph("ThemeLayer", "Pie");
                comparisonLayer.chartsSetting = config.comparison.settingForPie;
                break;
            default :
                comparisonLayer = new SuperMap.Layer.Graph("ThemeLayer", "Bar");
                comparisonLayer.chartsSetting = config.comparison.settingForBar;
                break;
        }
        comparisonLayer.isOverLay = false; //不避让

        comparisonLayer.setOpacity(0.9);
        map.addLayers([comparisonLayer]);

        $(comparisonLayer.div).css("z-index", 630);

        comparisonDiv = comparisonLayer.div;
        var size = map.getSize();
        comparisonDiv.style.width = size.w + "px";
        comparisonDiv.style.height = size.h + "px";

        //注册事件
        comparisonLayer.on("mousemove", showInfoWin);
        comparisonLayer.on("mouseout", closeInfoWin);

        comparisonLayer.on("click", function () {
            //alert("");
        });

    };

    var createThematic = function (re,_currentLevel,_regions, _type) {
        if(_type){
            currComparisonType = _type;
        }

        resultData = re;
        ThematicUtil.setResultData(resultData);
        currRegions = _regions;
        currLevel = _currentLevel;

        if(_currentLevel!=currRegions){
            currFeatrues = null;
        }


        //获取全部指标（包括多层分组子指标）
        var _allInicators = ThematicUtil.getSubInicators(re.indicators);
        if(!_allInicators || _allInicators.length==0){
            alert("获取指标空");
            return;
        }
        //设置所有的指标
        allInicators = _allInicators;  //TODO 存到 ThematicUtil 里


        init(function () {
            var _comparisonInicators = {};  //对比指标
            //根据指标类型 将指标填充到相应类型中
            $.each(allInicators, function (i, o) {
                var unit = o.idenUnit || o.unit;

                //添加统计图的分组指标
                var comparisonInicator = _comparisonInicators[unit];
                if(!comparisonInicator){
                    _comparisonInicators[unit] = [];
                }
                _comparisonInicators[unit].push(o);
            });


            var currComparisonInicator = [];
            for(var a in _comparisonInicators){
                currComparisonInicator = _comparisonInicators[a];
                break;
            }

            var currObj = {
                idencode:[],
                idenname:[],
                type:currComparisonType,   //当前对比图的类型
                unit:""
            };
            for(var i = 0,len = currComparisonInicator.length;i<len;i++){
                var one = currComparisonInicator[i];

                var _code = one.idenCode || one.code;
                var _name = one.idenName || one.name;
                var _unit = one.idenUnit || one.unit;

                currObj.idencode.push(_code);
                currObj.idenname.push(_name);
                currObj.unit = _unit;
            }
            $.extend(true, comparisonParam,currObj);


            if(_comparisonInicators && JSON.stringify(_comparisonInicators) != "{}"){
                var periodlen = resultData.periods.length;
                $.extend(true, comparisonParam, {
                    time: {
                        year: resultData.periods[periodlen-1].year,      //取最后一个年份
                        month: resultData.periods[periodlen-1].month
                    }
                });
            }
            addComparison();

            ThematicUtil.createTimeLinr("comparison",switchComparison,comparisonParam);
        });

    };

    /**
     * 添加统计对比图
     */
    var addComparison = function(){
        if (!comparisonParam.time) {
            comparisonParam.time = {
                year: resultData.periods[0].year,
                month: resultData.periods[0].month
            };
        }

        if(comparisonParam.idencode && comparisonParam.idencode.length > 0 && comparisonParam.time){
            //时间序号
            comparisonParam.time_index = ThematicUtil.getTimeindex(comparisonParam.time,resultData.periods);

            var len = comparisonParam.idencode.length;
            for(var i=0;i<len;i++){
                var indicator = comparisonParam.idencode[i];
                if(!comparisonParam.iden_index){
                    comparisonParam.iden_index = [];
                }
                //指标所在序号
                var iden_index = ThematicUtil.getIndicatorindex(indicator,allInicators);
                if(iden_index > -1){
                    comparisonParam.iden_index.push(iden_index);

                    if(!comparisonParam.index){
                        comparisonParam.index = [];
                    }
                    //指标所在元素的序号
                    var index = ThematicUtil.getDataIndex(iden_index,comparisonParam.time_index,allInicators);
                    if(index > -1){
                        comparisonParam.index.push(index);
                    }
                }
            }

            if(comparisonParam.iden_index && comparisonParam.iden_index.length > 0  && comparisonParam.time_index != -1){
                SpatialQuery.queryRegionFeature(currRegions,2, function (_selFeatures) {
                    currFeatrues = _selFeatures;
                    if(!comparisonLayer){
                        initLayer();
                        goto();
                    }else{
                        goto();
                    }
                });

                function goto(){
                    drawComparison(); //绘制

                    //图例
                    seajs.use('component/legend.comparison',function(legend){
                        legend.setup({
                            type:comparisonParam.type,
                            onClick:function(idens){
                                //切换统计图类型
                                if(idens){
                                   //TODO 切换类型
                                }
                            }
                        });
                        var _config = {
                            "bar":config.comparison.settingForBar.dataStyleByFields,
                            "line":config.comparison.settingForLine.dataStyleByFields,
                            "pie":config.comparison.settingForPie.dataStyleByFields
                        };
                        legend.init($("#map-container"),comparisonParam,_config).show();
                    });
                }
            }
        }
    };


    /**
     * 绘制统计专题图
     */
    var drawComparison = function () {

        //设置统计图参数()
        var width = 10 * comparisonParam.idencode.length;
        if(width < 40){
            width = 40;
        }

        var codomain = _getCodomainByindex();
        var axisXLabels = _getAxisXLabels();

        var param = {
            width:width,
            codomain:codomain,
            axisYLabels:[codomain[1],codomain[0]],
            axisXLabels:axisXLabels
        };

        var comparisonConfig = config.comparison;
        //修改参数
        $.extend(comparisonConfig.settingForBar,param,{
            dataStyleByFields:_getBarDataStyleByFields()
        });
        $.extend(comparisonConfig.settingForLine,param,{
            dataStyleByFields:_getLineDataStyleByFields()
        });
        $.extend(comparisonConfig.settingForPie,{
            codomain:codomain,
            dataStyleByFields:_getPieDataStyleByFields()
        });

        switch(comparisonParam.type){
            case ComparisonTypes.LINE:
                comparisonLayer.chartsSetting = comparisonConfig.settingForLine;
                break;
            case ComparisonTypes.PIE:
                comparisonLayer.chartsSetting = comparisonConfig.settingForPie;
                break;
            default:
                comparisonLayer.chartsSetting = comparisonConfig.settingForBar;
                break;
        }

        comparisonLayer.themeFields = comparisonParam.idencode;

        //添加统计图
        var leng = currFeatrues.length;
        for(var i = 0 ;i< leng;i++){
            var fea = currFeatrues[i];
            //获取数据
            var data = _getDataByFeature(fea);
            if(data && data != null){
                //取到下标
                var index = comparisonParam.index;
                var d = [];
                for(var k = 0; k < index.length; k++){
                    var ii = index[k];
                    //取到指标对应的值
                    d.push(data[ii]);
                }

                //设置每个指标值
                var cLen = comparisonParam.idencode.length;
                for(var j = 0; j < cLen; j++){
                    fea.attributes[comparisonParam.idencode[j]] = d[j];
                }
                // 向专题图层添加数据
                comparisonLayer.addFeatures(fea);
            }
        }
        map.updateSize();
        hasCreateComparison = true;
        ThematicUtil.setCreateComparison(true);

        //bindClick();

    };

    var bindClick = function () {
        $("div[id*='OL_Icon']").click(function () {
            $("#enlarge").removeClass("hide");
            var name =  $(this).children("div").children("div").text();
            var reportTypeName = null;
            for(var con = 0;con< resultData.content.length;con++){
                if(name == resultData.content[con][1]){
                    $("#dates").find("li").each(function(){
                        if($(this).find("a").hasClass("selected")){
                          for(var per = 0; per < resultData.periods.length;per++){
                              if($(this).text() == resultData.periods[per].year){
                                  reportTypeName = resultData.periods[per].reportTypeName;

                                  Data = name + ";"+ currComparisonType + ";" + reportTypeName;

                                  for (var ind = 0 ;ind < resultData.indicators.length; ind++){
                                      Data = Data + ";" +resultData.indicators[ind].idenName;
                                      Data = Data + ";" + resultData.content[con][2 + per * resultData.indicators.length + ind];
                                  }
                              }
                          }
                        }
                    });
                }
            }
            enlarge.drawSVG(Data);
        });
    }


    var switchComparison = function () {
        if(!resultData){
            alert("请先执行一次对比统计专题图操作后再进行切换操作！");
            return;
        }

        if(comparisonParam.idencode && comparisonParam.idencode.length > 0 && comparisonParam.time){

            //时间序号
            comparisonParam.time_index = ThematicUtil.getTimeindex(comparisonParam.time,resultData.periods);

            //重置值
            comparisonParam.iden_index = [];
            comparisonParam.index = [];


            var len = comparisonParam.idencode.length;
            for(var i=0;i<len;i++){
                var indicator = comparisonParam.idencode[i];
                //指标所在序号
                var iden_index = ThematicUtil.getIndicatorindex(indicator,allInicators);
                if(iden_index > -1){
                    comparisonParam.iden_index.push(iden_index);
                    //指标所在元素的序号
                    var index = ThematicUtil.getDataIndex(iden_index,comparisonParam.time_index,allInicators);
                    if(index > -1){
                        comparisonParam.index.push(index);
                    }
                }
            }

            if(comparisonParam.iden_index && comparisonParam.iden_index.length > 0 && comparisonParam.time_index != -1){
                if (comparisonLayer) {
                    //重新获得值域
                    var codomain = _getCodomainByindex();
                    var comparisonConfig = config.comparison;
                    comparisonConfig.settingForBar.codomain = codomain;
                    comparisonConfig.settingForBar.axisYLabels = [codomain[1], codomain[0]];
                    comparisonConfig.settingForLine.codomain = codomain;
                    comparisonConfig.settingForLine.axisYLabels = [codomain[1], codomain[0]];
                    comparisonConfig.settingForPie.codomain = codomain;

                    var feas = comparisonLayer.features;
                    for (var i = 0, leni = feas.length; i < leni; i++) {
                        var fea = feas[i];

                        //获取数据
                        var data = _getDataByFeature(fea);
                        if (data && data != null) {
                            //取到下标
                            var index = comparisonParam.index;
                            var d = [];
                            for (var k = 0; k < index.length; k++) {
                                var ii = index[k];
                                //取到指标对应的值
                                d.push(data[ii]);
                            }
                            //设置每个指标值
                            var cLen = comparisonParam.idencode.length;
                            for (var j = 0; j < cLen; j++) {
                                fea.attributes[comparisonParam.idencode[j]] = d[j];
                            }
                        }
                    }//end for
                    switch (comparisonParam.type) {
                        case "line":
                            comparisonLayer.chartsSetting = comparisonConfig.settingForLine;
                            break;
                        case "pie":
                            comparisonLayer.chartsSetting = comparisonConfig.settingForPie;
                            break;
                        default:
                            comparisonLayer.chartsSetting = comparisonConfig.settingForBar;
                            break;
                    }

                    // 重绘图层
                    comparisonLayer.redraw();
                }
            }
        }
    };

    /**
     * 销毁统计专题图图层
     */
    var destroy = function () {
        hasCreateComparison = false;
        ThematicUtil.setCreateComparison(false);
        if(comparisonLayer){
            map.removeLayer(comparisonLayer, false);
            comparisonLayer = null;
            comparisonParam = {             //对比统计专题参数
                idencode:null,
                idenname: null,
                time: null,
                unit: "",
                type:ComparisonTypes.BAR,        //默认为柱状图
                time_index: null,
                iden_index: null,
                index: null
            };
        }

        seajs.use('component/legend.comparison',function(legend){
            legend.destroy();
        });

    };

    var showInfoWin = function(e){
        if(comparisonLayer && e.target && e.target.refDataID && e.target.dataInfo){
            closeInfoWin();

            // 获取图形对应的数据 (feature)
            var fea = comparisonLayer.getFeatureById(e.target.refDataID);
            var info = e.target.dataInfo;

            if(fea && info){
                var content = fea.data.QH_NAME + ": <br>";
                var regionCode = fea.data.QH_CODE;          //行政区划码

                var field = info.field;
                var idencode = comparisonParam.idencode;
                var idenname = comparisonParam.idenname;
                var name = "";
                for(var i=0;i<idencode.length;i++){
                    if(idencode[i] == field){
                        name = idenname[i];
                        break;
                    }
                }
                content += name +"："+info.value;

                var tooltip = '<div id="thematic-tooltip" class="cluster-tip">'+
                    '<div class="cluster-content">' + content + '</div>'+
                    '</div>';

                var clientX = 0,clientY = 0;
                if(e.event &&e.event.clientX){
                    clientX = e.event.clientX;
                    clientY = e.event.clientY;
                }else{
                    //取得当前feature对象的中心点
                    var point = fea.geometry.getCentroid();
                    //取得指定地图点在窗口屏幕的位置
                    var screenPoint = mainMap.getViewPortPxFromLonLat(new SuperMap.LonLat(point.x, point.y));

                    clientX = screenPoint.x;
                    clientY = screenPoint.y;
                }

                var $tooltip = $('#thematic-tooltip');
                if ($tooltip.length == 0) {
                    $('#map-container').append(tooltip);
                }else{
                    var html = '<div class="cluster-content">' + content + '</div>';
                    $('#map-container >#thematic-tooltip').html(html);
                }

                //修改位置
                $("#map-container >#thematic-tooltip").css({
                    "top": clientY - $tooltip.height() / 2,
                    "left": clientX + 15
                });


                //联动图表
                seajs.use(['grid','chart'], function (g,c) {
                    c.selectOne(regionCode);
                    g.selectRow(regionCode);
                });


            }
        }
    };

    var closeInfoWin = function(e){
        var $tooltip = $("#map-container >#thematic-tooltip");
        if ($tooltip.length > 0) {
            $tooltip.remove();
        }
    };
    var _getBarDataStyleByFields = function(){
        var len = comparisonParam.idencode.length;
        var cLen = bar_dataStyleByFields.length;

        var re = [];
        for(var i=0;i<len;i++){
            if(i < cLen){
                re.push(bar_dataStyleByFields[i]);
            }else{
                i = -1;
            }
            if(re.length == len){
                break;
            }
        }
        return re;
    };

    var _getLineDataStyleByFields = function(){
        var len = comparisonParam.idencode.length
        var cLen = line_dataStyleByFields.length;

        var re = [];
        for(var i=0;i<len;i++){
            if(i < cLen){
                re.push(line_dataStyleByFields[i]);
            }else{
                i = -1;
            }
            if(re.length == len){
                break;
            }
        }

        return re;
    };

    var _getPieDataStyleByFields = function(){
        var len = comparisonParam.idencode.length;
        var cLen = pie_dataStyleByFields.length;

        var re = [];
        for(var i=0;i<len;i++){
            if(i < cLen){
                re.push(pie_dataStyleByFields[i]);
            }else{
                i = -1;
            }
            if(re.length == len){
                break;
            }
        }

        return re;
    };

    /**
     * 切换统计图类型
     * @param type
     * @private
     */
    var changeComparisonType = function(type){
        if(!comparisonLayer){
            return ;
        }
        if(!type || type == ""){
            type = ComparisonTypes.BAR;
        }
        //保存当前统计图类型
        comparisonParam.type = type;

        switch(type){
            case ComparisonTypes.LINE:
                comparisonLayer.chartsSetting = comparisonConfig.settingForLine;
                comparisonLayer.setOpacity(0.9);
                comparisonLayer.setChartsType("Line");
                break;
            case ComparisonTypes.PIE:
                comparisonLayer.chartsSetting = comparisonConfig.settingForPie;
                comparisonLayer.setOpacity(1);
                comparisonLayer.setChartsType("Pie");
                break;
            default:
                comparisonLayer.chartsSetting = comparisonConfig.settingForBar;
                comparisonLayer.setOpacity(0.9);
                comparisonLayer.setChartsType("Bar");
                break;
        }

        main.updateSize();
    };

    /**
     * 获取x周的简称
     * @returns {Array}
     * @private
     */
    var _getAxisXLabels = function(){
        var re = [];
        var len = comparisonParam.idenname.length;
        for(var i=0;i<len;i++){
            re.push("["+(i+1)+"]");
        }
        return re;
    };

    /**
     * 取得数据范围
     * @returns {Array}
     * @private
     */
    var _getCodomainByindex = function(){
        var content = resultData.content;
        var index = comparisonParam.index;
        var all = [];
        for(var i=0;i<content.length;i++){
            for(var j=0;j<index.length;j++) {
                var d = content[i][index[j]];
                if(typeof d == "string" && d != ""){
                    d = parseFloat(d);
                }
                if(all.indexOf(d) == -1)
                    all.push(d);
            }
        }

        var max = 0;
        var min = 0;
        for(var k=0;k<all.length;k++){
            var a = all[k];
            if(a > max){
                max = a;
            }else if(a < min){
                min = a;
            }
        }
        if(max == 0){
            max = 10;
        }

        if(min > 0){
            min = 0;
        }
        return [min,max];
    };

    /**
     * 获取指定fea对应的数据
     * @param fea
     * @returns {Array}
     */
    var _getDataByFeature = function(fea){
        var result = null;
        var content = resultData.content;
        for(var i=0;i<content.length;i++){
            if(content[i][0] == fea.data.QH_CODE){
                result = content[i];
                break;
            }
        }
        return result;
    };

    var hasCreate = function () {
        return hasCreateComparison;
    };

    var toggleLegend = function () {
        seajs.use(['component/legend.comparison'],function(comparisonLegend){
            comparisonLegend.toggle();
        });
    }

    var hideLegend = function () {
        seajs.use(['component/legend.comparison'],function(comparisonLegend){
            comparisonLegend.hide();
        });
    }

    var getData = function(){
        return Data;
    }

    return{
        createThematic:createThematic,
        destroy:destroy,
        hasCreate:hasCreate,
        toggleLegend:toggleLegend,
        hideLegend:hideLegend,
        getData:getData
    }
});
