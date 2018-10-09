/**
 * Created by jinn on 2015/11/4.
 */


/***
 * 等级符号图
 */
define(function (require, exports, module) {
    var Tools = require("component/tools");
    var ThematicUtil = require("ThematicUtil");
    var SpatialQuery = require("spatial.query");
    var timeLinr = require("timeLinr");          //时间轴
    var Layer = require('layer');
    var map = Layer.getMap();
    var resultData;            //从数据库里查找到的结果对象数据-已经从小到大排序了
    var allInicators = [];     //解析全部指标（包括分组子指标）
    var config;
    var _isInit = false;
    var currFeatrues = null;

    var pieLayer = null;    //饼图专题图图层
    var pieDiv;             //饼div对象
    var zrpie;

    var temp = ""; //是否取第二个指标

    var pieMaxMinVal = null;
    var currRegions,currLevel;

    var pieParam = {        //饼图等级
        iden: {
            indicator: "",
            idenname: "",
            unit: ""
        },
        indicator: "",
        idenname: "",
        unit: "",
        time: null,
        iden_index: 0,
        time_index: 0,
        index: 2
    };

    var radius = {     //用来表示饼的最大最小值
        piexMax: 5,
        piexsMin: 30
    };

    var targetId;          //标签被选中的对象的id


    var hasCreatePie = false;           //是否已经创建等级符号图

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
                seajs.use('component/legend.pie',function(pieLegend){
                        //设置饼图图例
                        pieLegend.setup({
                            onClick: function (colors) {
                                if (colors && colors.length == 2){
                                    //切换饼图专题图
                                    switchPicColor(colors);
                                    //重绘饼图图例
                                    pieLegend.reDraw(pieParam.iden, radius,colors, [pieMaxMinVal.maxData, pieMaxMinVal.minData]);
                                }
                            },
                            onClose: function () {
                                //TODO  图例关闭事件处理
                            }
                        });
                        //标记已经初始化
                        _isInit = true;
                        callback && callback();
                    });
            });
        }
    };


    var initLayer = function () {
        if (!pieLayer) {
            pieLayer = new SuperMap.Layer.Elements("PieThematic");
            map.addLayers([pieLayer]);
            $(pieLayer.div).css("z-index", 666);
            pieDiv = pieLayer.getDiv();
            var size = map.getSize();
            pieDiv.style.width = size.w + "px";
            pieDiv.style.height = size.h + "px";

            //添加Element重绘函数
            map.events.on({
                "moveend": drawPie
            });
        }
    };

    /**
     * 创建专题图
     * @param re
     */
    var createThematic = function (re,_currentLevel,_regions,two) {
        if(two=="two"){
           temp = "two"; //TODO
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
        allInicators = _allInicators;           //TODO 存到 ThematicUtil 里

        init(function () {
            var len = allInicators.length;
            var _sumIndicators= [];  //饼图指标
            $.each(allInicators, function (i, o) {
                var type = o.idenType;
                //非累计单位：等级、比率
                if (type==5 || new RegExp(config.rex.sum).test(o.idenUnit) || new RegExp(config.rex.sum).test(o.unit)) {
                    _sumIndicators.push(o);
                }
            });
            if (_sumIndicators.length > 0) {
                var periodlen = resultData.periods.length;
                $.extend(true, pieParam, {
                    iden: {
                        indicator: _sumIndicators[_sumIndicators.length-1].idenCode || _sumIndicators[_sumIndicators.length-1].code,
                        idenname: _sumIndicators[_sumIndicators.length-1].idenName || _sumIndicators[_sumIndicators.length-1].name,
                        unit: _sumIndicators[0].idenUnit || _sumIndicators[0].unit
                    },
                    time: {
                        year: resultData.periods[periodlen-1].year,      //取最后一个年份
                        month: resultData.periods[periodlen-1].month
                    }
                });
                //添加饼图专题图
                addPie(pieParam);
            }else if(len>0){  //没有比率型指标就取所有指标的最后一个
                var periodlen = resultData.periods.length;
                $.extend(true, pieParam, {
                    iden: {
                        indicator: allInicators[len-1].idenCode || allInicators[len-1].code,
                        idenname:  allInicators[len-1].idenName || allInicators[len-1].name,
                        unit:      allInicators[len-1].idenUnit || allInicators[len-1].unit
                    },
                    time: {
                        year: resultData.periods[periodlen-1].year,      //取最后一个年份
                        month: resultData.periods[periodlen-1].month
                    }
                });
                //添加饼图专题图
                addPie(pieParam);
            }

            //添加时间轴
            ThematicUtil.createTimeLinr("pie",switchPie,pieParam);
            //createTimeLinr();
        });
    };


    /**
     * 添加饼图
     * @param _pieParam
     */
    var addPie = function (_pieParam) {
        if (_pieParam.iden)
            $.extend(true, pieParam, _pieParam || {});
        else
            $.extend(true, pieParam.iden, _pieParam || {});
        if (!pieParam.time)
            pieParam.time = {
                year: resultData.periods[0].year,
                month: resultData.periods[0].month
            };


        if (pieParam.iden.indicator && pieParam.time) {
            pieParam.iden_index = ThematicUtil.getIndicatorindex(pieParam.iden.indicator,allInicators);
            pieParam.time_index = ThematicUtil.getTimeindex(pieParam.time,resultData.periods);
            pieParam.index = ThematicUtil.getDataIndex(pieParam.iden_index, pieParam.time_index,allInicators);
            pieParam.iden = ThematicUtil.getIdenInfo(pieParam.iden.indicator,allInicators);

            if (pieParam.iden_index != -1 && pieParam.time_index != -1) {

                var selFeatures = currFeatrues;
                if (!selFeatures || selFeatures==null) {
                    SpatialQuery.queryRegionFeature(currRegions,2, function (_selFeatures) {
                        currFeatrues = _selFeatures;
                        gotoPieThemtic();
                    });
                }else{
                    gotoPieThemtic();
                }

                function gotoPieThemtic(){
                    if (!pieLayer)initLayer();

                    //将得到的值按照某一个指标排序
                    pieMaxMinVal = ThematicUtil.getMaxMinData(pieParam.index,resultData);
                    drawPie(); //绘制

                    seajs.use('component/legend.pie',function(pieLegend){
                        if(temp == "two"){
                            pieLegend.init($("#map-container"), pieParam.iden, {
                                    piexMax: radius.piexMax ,
                                    piexsMin: radius.piexsMin
                                }, config.pieThemantic.pieColors,
                                [pieMaxMinVal.maxData, pieMaxMinVal.minData],true).show();
                        }else{
                            pieLegend.init($("#map-container"), pieParam.iden, {
                                    piexMax: radius.piexMax ,
                                    piexsMin: radius.piexsMin
                                }, config.pieThemantic.pieColors,
                                [pieMaxMinVal.maxData, pieMaxMinVal.minData]).show();
                        }


                    });
                }
            }
        }
    };


    /**
     * 绘制分段饼图
     */
    var drawPie = function () {
        if (zrpie) {
            zrpie.clear();
            zrpie.dispose();
        }
        zrpie = zrender.init(document.getElementById(pieDiv.id));
        radius = getPiexRank(SGIS.Region.recognitionLevel(resultData.content[0][0]));

        var pointlonlat, pointPix;
        var leng = currFeatrues.length;
        for (var i = 0; i < leng; i++) {
            var center = currFeatrues[i].geometry.getCentroid();
            //经纬度坐标
            pointlonlat = new SuperMap.LonLat(center.x, center.y);
            //窗口坐标
            pointPix = map.getPixelFromLonLat(pointlonlat);

            //找到数据与区划代码的对应关系
            var data = getData(currFeatrues[i]);

            var circleShape = new Circle({
                    id: "sharp_" + i,
                    style: {
                        x: pointPix.x,
                        y: pointPix.y,
                        r: getR(data.data),  //半径
                        brushType: "both",
                        color: config.pieThemantic.pieColors[0],
                        strokeColor: config.pieThemantic.pieColors[1],
                        lineWidth: 1,
                        highlightStyle: {},
                        data: data
                    },
                    onmouseover: function (params) {
                        if (params.target) {
                            if (targetId != params.target.id) {
                                //保存当前圆饼id
                                targetId = params.target.id;

                                var data = params.target.style.data;
                                var x = params.target.style.x, y = params.target.style.y, r = params.target.style.r;

                                //内容
                                var html = data.regionname + ":<br>" + data.iden.idenname + "：" + data.data;
                                var tooltip = '<div id="thematic-tooltip" class="cluster-tip">' +
                                    '<div class="cluster-content">' + html + '</div>' +
                                    '</div>';
                                var $tooltip = $('#thematic-tooltip');
                                if ($tooltip.length == 0) {
                                    $('#map-container').append(tooltip);
                                } else {
                                    var htmlContent = '<div class="cluster-content">' + html + '</div>';
                                    $('#map-container >#thematic-tooltip').html(htmlContent);
                                }

                                //设置偏移 迅速显示
                                var _x = parseInt(x) + parseInt(r) + 5, _y = parseInt(y) - 15;
                                $('#map-container >#thematic-tooltip').css({
                                    "top": _y + "px",
                                    "left": _x + "px"
                                });

                                //关联部分
                                var qh_code = data.regioncode;

                                //联动
                                seajs.use(["chart","grid"], function (Chart,Grid) {
                                    Chart.selectOne(qh_code);//统计图选中一列
                                    Grid.selectRow(qh_code);
                                });
                            }
                        }
                    },
                    onmouseout: function (params) {
                        if (params.target) {
                            var $tip = $('#map-container >#thematic-tooltip');
                            if ($tip.length > 0) {
                                $tip.remove();
                            }
                            targetId = "";
                        }
                    },
                    onclick: function (params) {
                        alert();
                    }
                }
            );
            zrpie.addShape(circleShape);
        }
        zrpie.render();
        map.updateSize();

        hasCreatePie = true;
        ThematicUtil.setCreatePie(true);
    };

    /**
     * 改变颜色
     * @param _colors
     */
    var switchPicColor = function (_colors) {
        if (!_colors)
            return;

        if (_colors && _colors.length == 2){
            config.pieThemantic.pieColors = _colors;
            //重绘饼图
            drawPie();
        }
    };

    /***
     * 切换饼图指标
     * @param _pieParam
     *          饼图参数
     * @param _type
     *          专题图类型
     */
    var switchPie = function (_pieParam) {
        if (!_pieParam)
            return;
        if (!resultData) {
            alert("请先执行一次专题图操作后再进行切换操作！");
            return;
        }

        $.extend(true, pieParam.iden, _pieParam || {});

        pieParam.iden_index = ThematicUtil.getIndicatorindex(pieParam.iden.indicator,allInicators);
        pieParam.time_index = ThematicUtil.getTimeindex(pieParam.time,resultData.periods);
        pieParam.index = ThematicUtil.getDataIndex(pieParam.iden_index, pieParam.time_index,allInicators);
        pieParam.iden = ThematicUtil.getIdenInfo(pieParam.iden.indicator,allInicators);
        if (pieParam.iden_index != -1) {

            addPie(pieParam);

            seajs.use('component/legend.pie',function(pieLegend){
                pieLegend.reDraw(pieParam.iden, {
                    piexMax: radius.piexMax,
                    piexsMin: radius.piexsMin
                }, config.pieThemantic.pieColors, [pieMaxMinVal.maxData, pieMaxMinVal.minData]);
            });
        }
    };
    
    /**
     * 联动指定的pie
     * @param code
     */
    var linkPie = function (code) {
        //TODO
    }

    /**
     * 销毁等级符号图层
     */
    var destroy = function () {
        temp = "";
        hasCreatePie = false;
        ThematicUtil.setCreatePie(false);
        if (pieLayer) {
            if (zrpie) {
                zrpie.clear();
                zrpie.dispose();
                zrpie = null;
            }
            map.removeLayer(pieLayer, false);
            map.events.un({
                "moveend": drawPie
            });
            pieLayer = null;
        }

        seajs.use('component/legend.pie',function(pieLegend){
            pieLegend.destroy();
        });

    };

    /**
     * 根据regionlevel采取不同的等级圆大小半径分布（有对比感）
     * <p>
     *    说明：以后可以做成配置文件形式。
     * </p>
     * @param level
     *         行政级别（regionlevel）
     */
    var getPiexRank = function (level) {
        switch (level) {
            case 2:
                radius.piexsMin = 1;
                radius.piexMax = 10;
                break;
            case 3:
                radius.piexsMin = 1;
                radius.piexMax = 5;
                break;
            case 4:
                radius.piexsMin = 1;
                radius.piexMax = 3;
                break;
            case 5:
                radius.piexsMin = 1;
                radius.piexMax = 3;
                break;
            case 6:
                radius.piexsMin = 1;
                radius.piexMax = 3;
                break;
            default :
                radius.piexsMin = 0;
                radius.piexMax = 0;
                break;
        }
        return radius;
    };

    /**
     * 根据数据从小到大的排序,获取当前数据对应的半径值（R）
     *
     * @param data
     *          当前数据
     * @returns {number}
     */
    //todo:专题图只有一个指标时，无论data大小如何，绘制的圆形大小都不变，可能规范化方式不对。
    var getR = function (data) {
        if (data == 0)
            return 0;
        var per = 0;
        if ((pieMaxMinVal.maxData - pieMaxMinVal.minData) != 0) {
            per = (radius.piexMax - radius.piexsMin) / (pieMaxMinVal.maxData - pieMaxMinVal.minData);
        }
        var result = 5 + (data - pieMaxMinVal.minData) * per;
        if (result < 0)
            result = 0;
        return result;
    };


    /**
     * 找到数据与区划代码的对应关系
     * @param fea
     * @returns {{data: number, index: number, iden: {}, regioncode: string, regionname: string}}
     */
    var getData = function (fea) {
        var result = {
            data: 0,
            index: 0,
            iden: {},
            regioncode: "",
            regionname: ""
        };

        var index = pieParam.index;
        var iden = pieParam.iden;
        var content = resultData.content;
        for (var i = 0, len = content.length; i < len; i++) {
            if (content[i][0] == fea.data.QH_CODE) {
                result = {
                    data: content[i][index],
                    index: i,
                    iden: iden,
                    regioncode: fea.data.QH_CODE,
                    regionname: fea.data.QH_NAME
                };
                break;
            }
        }
        return result;
    };


    var hasCreate = function () {
        return hasCreatePie;
    };

    var toggleLegend = function () {
        seajs.use('component/legend.pie',function(pieLegend){
            pieLegend.toggle();
        });
    }

    var hideLegend = function () {
        seajs.use('component/legend.pie',function(pieLegend){
            pieLegend.hide();
        });
    }


    return{
        createThematic:createThematic,
        linkPie:linkPie,
        destroy:destroy,
        hasCreate:hasCreate,
        toggleLegend:toggleLegend,
        hideLegend:hideLegend
    }
});