/**
 * Created by jinn on 2015/10/26.
 */
define(function (require, exports, module) {

    var ThematicUtil = require("ThematicUtil");

    var _isInit = false;            //标记是否初始化
    var config;
    var currData = null;

    var init = function (re) {
       currData = re;
    };

    var createSegmentMap = function (re) {
        if(re){
            currData = re;
        }
        var allInicators = Tools.getSubInicators(currData.indicators);
    }



    /**
     * 分段专题图
     */
    var Segement = (function () {
        var id;                                        //事件振荡id
        var segmentLayer = null;                       //分段专题图图层
        var select = null;                             //图层选择控件
        var segementMaxMinVal = {                      //分段最大最小值
            minData: 0,
            maxData: 0
        };

        var rankParam = {                              //分段色阶
            iden: {
                indicator: "",
                idenname: "",
                unit: ""
            },
            time: null,
            iden_index: 0,
            time_index: 0,
            index: 2                                   //指标所在下标位置默认从第三个开始取值，第一第二分别为行政区划编码和名称
        };

        var SEGMENT_METHODS = {                        //可用的分段算法
            KEANS:0,                                   //keans算法
            SQUARE_ROOT:1,                             //平方根算法
            STANDARD_DEVIATION:2,                      //标准差分段
            LOGARITHM:3,                               //对数算法
            ISOMETRIC:4                                //等距分段
        };

        var globalDataRamp = null;                     //保存的全局分段数据变量

        /**
         * 设置全局分段数据变量
         *
         * @param _globalDataRamp
         */
        var setGlobalDataRamp = function(_globalDataRamp){
            globalDataRamp = _globalDataRamp;
        };

        /**
         * 取得全局分段数据变量
         * @returns {*}
         */
        var getGlobalDataRamp = function(){
            return globalDataRamp;
        };

        /**
         * 分段色阶
         * @returns {{iden: {indicator: string, idenname: string, unit: string}, time: null, iden_index: number, time_index: number, index: number}}
         */
        var getRankParam = function(){
            return rankParam;
        };

        /**
         * 取得分段专题图层
         * @returns {*}
         */
        var getSegmentLayer = function(){
            return segmentLayer;
        };

        /**
         * 取得select 对象
         * @returns {*}
         */
        var getSelect = function(){
            return select;
        };

        /**
         * 设置分段最大最小值
         *
         * @param _segementMaxMinVal
         */
        var setSegementMaxMinVal = function(_segementMaxMinVal){
            segementMaxMinVal = _segementMaxMinVal;
        };

        /**
         * 取得分段最大最小值
         *
         * @returns {{minData: number, maxData: number}}
         */
        var getSegementMaxMinVal = function(){
            return segementMaxMinVal;
        };

        /**
         * 初始化分段专题图层
         */
        var _initSegementLayer = function () {
            if (!segmentLayer) {
                mainMap = map.getMap();

                //以下可以判定浏览器是否支持Canvas，如果不支持，则使用SVG渲染
                segmentLayer = new SuperMap.Layer.Vector("SegementThematic", {
                    renderers: ["Canvas2"]
                });
                //需要控制图层顺序
                mainMap.addLayers([segmentLayer]);
                $(segmentLayer.div).css("z-index", 540);

                //分段专题控制器
                select = new SuperMap.Control.SelectFeature(segmentLayer, {
                    onSelect: onFeatureSelect,                //注册三视图联动
                    onUnselect: onFeatureUnselect,            //注册三视图联动
                    hover: true,
                    repeat: false
                });

                //分段专题选中样式
                select.selectStyle = config.segmentThemantic.selectStyle;

                //添加专题项选中事件
                mainMap.addControl(select);
            } else {
                segmentLayer.removeAllFeatures();
            }
        };

        /**
         * 绘制分段专题图 （segmentLayer初始化后才能使用）
         *
         * @param type
         *        分段专题图类型（THEME中取值）
         * @param dataRamp
         *        数据分段
         */
        var _segmentThemantic = function (type,_dataRamp) {
            //标记已创建专题图
            isCreateSegement = true;
            var dataRamp  ;
            if(globalDataRamp){
                dataRamp = globalDataRamp ;
            }
            if(!dataRamp || dataRamp.length< 1){
                dataRamp = ThemanticUtil.Segement.getDataRamp(type);
            }
            if(_dataRamp){
                dataRamp = _dataRamp ;
            }

            var _reg = selFeatures[0].attributes.QH_CODE;
            var level = SGIS.Region.recognitionLevel(_reg);

            var feature, flag = 0,max = 0;
            var kk = 0;
            id = setInterval(function () {
                flag++;
                max = 100*(flag-1);
                //渲染到一半时，添加区划名称标签
                if(kk== parseInt(selFeatures.length/2) &&(level<4 || selFeatures.length<100)){
                    RegionLabel.addThemeRLabel();
                }
                var leng = 100*flag;
                for (var k = max; k < leng; k++) {
                    kk ++;
                    if (kk > selFeatures.length) {
                        clearInterval(id);
                        select.activate();
                        mainMap.updateSize();
                        k = 0;
                        kk = 0;
                        break;
                    }
                    feature = selFeatures[k];
                    var indexInfo = null;
                    if (type == THEME.CALC.PARENT) {
                        indexInfo = ThemanticUtil.Segement._getStyle(feature, calIndCollection.content, config.segmentThemantic.colors.data, dataRamp);
                    } else {
                        indexInfo = ThemanticUtil.Segement._getStyle(feature, resultData.content, config.segmentThemantic.colors.data, dataRamp);
                    }
                    feature.style = indexInfo.style;
                    feature.info = {
                        iden: rankParam.iden,
                        value: (indexInfo.index == -1) ? 0 : (type && type == THEME.CALC.PARENT) ? calIndCollection.content[indexInfo.index][rankParam.index] : resultData.content[indexInfo.index][rankParam.index]
                    };

                    if(kk===1){
                        segmentLayer.removeAllFeatures();   //清除延后防止播放时白图
                        segmentLayer.setVisibility(true);
                    }

                    segmentLayer.addFeatures([feature]);
                }
            }, 25);
        };

        /**
         * 分段专题图中获取fillColor
         * @param fea
         *          feature对象
         * @param re
         *          数据内容
         * @param colors
         *          可用的颜色
         * @param dataRamp
         *          数据分段
         * @returns {*}
         */
        var _getStyle = function (fea, re, colors, dataRamp) {
            var leng = re.length;
            if(fea && fea.data){
                for (var i = 0; i < leng; i++) {
                    var dStr = re[i][rankParam.index] ;
                    dStr = !dStr ? "0" :dStr ;
                    var d = parseFloat(dStr) ;
                    if (re[i][0] == fea.data.QH_CODE) {
                        for (var j=0,size=colors.length; j < size; j++) {
                            if (d >= dataRamp[j] && d<= dataRamp[j+1]) {
                                return{
                                    style: $.extend({
                                        fillColor: colors[j]
                                    }, config.segmentThemantic.style),
                                    index: i
                                }
                            }
                        }
                    }
                }//end for (var i = 0; i < re.length; i++)
            }
            return {
                style: config.segmentThemantic.emptyStyle,
                index: -1
            };
        };

        /**
         * 销毁分段专题图层
         */
        var destroy = function () {
            if (segmentLayer && select) {
                mainMap = map.getMap();
                mainMap.removeLayer(segmentLayer, false);   //不可见
                select.deactivate();                        //取消分段选中
                mainMap.removeControl(select);              //移除控件

                segmentLayer = null;
                select = null;
                isCreateSegement = false;                   //标记已销毁

                //区划标签图层移除
                RegionLabel.destroy() ;
                selFeatures = null;
                globalDataRamp =null ; //分段值置空
            }
        };

        /**
         * 选中专题图色块时给出提示，并且联动表格和统计图(如果右侧可见)
         *
         * @param fea
         *          feature对象
         */
        var onFeatureSelect = function (fea) {
            //取得当前的数据
            var value = fea.info.value;
            if((typeof value == "object" || value == null)
                || (value == "null" || value == "")
                || (typeof value == "undefined")){
                value = "无数据";
            }

            var content = fea.data.QH_NAME + ": <br>"
                + fea.info.iden.idenname + "：" + value;

            var tooltip = '<div id="thematic-tooltip" class="cluster-tip">'+
                '<div class="cluster-content">' + content + '</div>'+
                '</div>';

            //取得当前feature对象的中心点
            var point = fea.geometry.getCentroid();
            //取得指定地图点在窗口屏幕的位置
            var screenPoint = mainMap.getViewPortPxFromLonLat(new SuperMap.LonLat(point.x, point.y));

            var $tooltip = $('#thematic-tooltip');
            if ($tooltip.length == 0) {
                $('#map-container').append(tooltip);
            }else{
                var html = '<div class="cluster-content">' + content + '</div>';
                $('#map-container >#thematic-tooltip').html(html);
            }

            //修改位置
            $("#map-container >#thematic-tooltip").css({
                "top": screenPoint.y - $tooltip.height() / 2,
                "left": screenPoint.x + 15
            });

            //联动
            var qh_code = fea.attributes["QH_CODE"];

            //基层专业汇总的专题图，没有联动，故加上判断
            var content = frame.RightSidebar.content();
            if(content && content.seajs){
                content.seajs.use("macro/view.macro", function (c) {
                    c.selectGrid(qh_code);
                    c.selectChart(qh_code);
                });
            }//end if(content && content.seajs)
        };

        /**
         *  退出选中色块时，移除tooltip
         */
        var onFeatureUnselect = function () {
            var $tooltip = $("#map-container >#thematic-tooltip");
            if ($tooltip.length > 0) {
                $tooltip.remove();
            }
        };


        /**
         * 进行数据分段（默认用均分法）
         *
         * @returns {Array}
         */
        var getDataRamp = function (type) {
            var content = resultData.content;

            //运算指标类型
            if (type && type == THEME.CALC.PARENT) {
                content = calIndCollection.content;
            }

            var re = [];

            //分段方法
            switch (config.segmentThemantic.segmentMethod) {
                case SEGMENT_METHODS.KEANS:                 //默认分段方法0
                    re = ThemanticUtil.divideMethod.kMeansSegmented(content, config.segmentThemantic.colors.num);                  //等比例
                    break;
                case SEGMENT_METHODS.SQUARE_ROOT:           //1
                    re = ThemanticUtil.divideMethod.squareRootSegmented(content, config.segmentThemantic.colors.num);             //平方根
                    break;
                case SEGMENT_METHODS.STANDARD_DEVIATION:    //2
                    re = ThemanticUtil.divideMethod.standardDeviationSegmented(content);                                          //标准差
                    break;
                case SEGMENT_METHODS.LOGARITHM:             //3
                    re = ThemanticUtil.divideMethod.logarithmSegmented(content, config.segmentThemantic.colors.num);              //对数
                    break;
                case SEGMENT_METHODS.ISOMETRIC:             //4
                    re = ThemanticUtil.divideMethod.isometricSegmented(content, config.segmentThemantic.colors.num);              //等比例
                    break;
                default :                                   //0
                    re = ThemanticUtil.divideMethod.kMeansSegmented(content, config.segmentThemantic.colors.num);                 //k-means 算法(并优化)
                    break;
            }
            //修改两端的最值，覆盖整个数据
            re[0] = -999999999999999999999999999;
            re[re.length-1] =999999999999999999999999999999;
            //console.log(re);//分段数组

            //取得全局分段数据变量
            setGlobalDataRamp(re);

            return re;
        };

        return{
            _initSegementLayer: _initSegementLayer,
            _segmentThemantic: _segmentThemantic,
            _getStyle: _getStyle,
            getDataRamp: getDataRamp,
            destroy: destroy,
            setSegementMaxMinVal:setSegementMaxMinVal,
            getSegementMaxMinVal:getSegementMaxMinVal,
            getSegmentLayer:getSegmentLayer,
            getRankParam:getRankParam,
            getSelect:getSelect,
            setGlobalDataRamp:setGlobalDataRamp,
            getGlobalDataRamp:getGlobalDataRamp,
            SEGMENT_METHODS:SEGMENT_METHODS
        };
    })();
    /**
     * 初始化  专题图例
     * @param callback
     */
    var legendInit = function(callback){
        if(_isInit){
            callback && callback();
        }else{
            Tools.getConfig(function(config){
                seajs.use(['component/legend','component/legend.pie','component/legend.comparison','component/colorpicker'],
                    function(segLegend,pieLegend,comparisonLegend,colorpicker){
                        //设置分段图图例
                        segLegend.setup({
                            //色条单击事件
                            onClick: function () {
                                if (colorpicker.isShow()) {
                                    return;
                                }
                                //初始化色段选择面板
                                colorpicker.setup({
                                    default: {
                                        position: "center"
                                    },
                                    //色段选中事件，改变专题图显示
                                    onChange: function (colors) {
                                        if (colors) {

                                            //当前选中色段（必须放在最前面，保证getDataRamp方法取到的分段数争取）
                                            config.segmentThemantic.colors = colors;

                                            //进行数据分段(只切换颜色时，不改变分段数据)
                                            var dataRamp = ThematicUtil.Segement.getGlobalDataRamp();
                                            if(dataRamp == null || (dataRamp.length != colors.num+1)){
                                                //重新获取新的数据分段
                                                dataRamp = ThematicUtil.Segement.getDataRamp();
                                            }

                                            var rankParam =  ThematicUtil.Segement.getRankParam();


                                            //切换分段专题图显示颜色
                                            thematic.SwitchHanlder.switchSegmentColor(colors,dataRamp);


                                            //切换分段图例的颜色显示
                                            if (thematic.hasData())
                                                segLegend.switchLengend(rankParam.iden, colors.data,dataRamp);
                                        }//end if (colors)
                                    }
                                });
                                //显示色段面板
                                colorpicker.init(config.segmentThemantic.colors);
                            },
                            //关闭图例事件
                            onClose: function () {
                                //清除全局事件
                                var rankParam =  thematic.ThemanticUtil.Segement.getRankParam();
                                appEvents.trigger("removeTheme",null,rankParam.time,
                                    null,null,thematic.THEME.SEGEMENT);

                                //删除分段图层
                                // 关闭分段设色图例，分段值一并置空
                                thematic.ThemanticUtil.Segement.destroy();
                                //移除工具栏分段下拉
                                UI.removeToolbar(thematic.THEME.SEGEMENT);
                            }
                        });

                        //设置饼图图例
                        pieLegend.setup({
                            onClick: function (colors) {
                                if (colors && colors.length == 2) {
                                    //切换饼图专题图
                                    thematic.SwitchHanlder.switchPicColor(colors);

                                    var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
                                    var pieMaxMinVal = thematic.ThemanticUtil.Pie.getPieMaxMinVal();

                                    //重绘饼图图例
                                    pieLegend.reDraw(pieParam.iden, thematic.ThemanticUtil.Pie.getRadius(),
                                        colors, [pieMaxMinVal.maxData, pieMaxMinVal.minData]);
                                }
                            },
                            onClose: function () {
                                //清除全局事件
                                var rankParam =  thematic.ThemanticUtil.Segement.getRankParam();
                                var resultData = thematic.getResultData();
                                appEvents.trigger("removeTheme",null,rankParam.time,
                                    null,resultData,thematic.THEME.PIE);

                                //删除图层
                                thematic.ThemanticUtil.Pie.destroy();
                                //移除工具栏饼图下拉
                                UI.removeToolbar(thematic.THEME.PIE);
                            }
                        });

                        //设置统计对比图的参数
                        comparisonLegend.setup({
                            onClick:function(){
                            },
                            onClose:function(){
                                //删除图层
                                thematic.ThemanticUtil.ComparisonThematic.destroy()
                                //移除分段专题工具栏标题
                                UI.removeToolbar(thematic.THEME.COMPARISON);
                            }
                        });

                        //标记已经初始化
                        _isInit = true;
                        callback && callback();
                    });//end seajs.use(
            });//end thematic.getConfig(function(config)
        }
    };


    var Tools = (function () {
        /**
         * 获取全部指标（包括多层分组子指标）
         * */
        var getSubInicators = function(inicators){
            var _sumIndicators = [];
            if(!inicators || inicators.length==0){
                return [];
            }
            $.each(inicators, function (i, o) {
                var subs = o.subs;
                var obj = {};
                $.extend(true, obj, o);
                obj.subs = [];
                _sumIndicators.push(obj);//添加：本级指标项
                if(subs && subs.length>0){
                    _sumIndicators = _sumIndicators.concat(getSubInicators(subs));//添加：递归子指标项
                }
            });
            return _sumIndicators;
        };


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
                $.getJSON(require.resolve("component/thematic.config.json"),function (re) {
                        config = re;    //保存配置信息
                        callback && callback(config);
                    });
            };
        };

        return{
            getSubInicators:getSubInicators,
            getConfig:getConfig
        }
    })();


    return {

    }
});
