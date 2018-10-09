/**
 * Created by jinn on 2015/11/3.
 */


/**
 * 分段专题图图层
 */
define(function (require,exports,module) {
    var ThematicUtil = require("ThematicUtil");
    var SpatialQuery = require("spatial.query");
    var KMeans = require("component/KMeans");              //算法
    var SDO = require("component/segmented.data.optimize");//对分段数据的一个取整优化算法
    var timeLinr = require("timeLinr");          //时间轴
    var Tools = require("component/tools");
    var Layer = require('layer');
    var map = Layer.getMap();
    var selCallbacks = Layer.getSelCallbacks();
    var segLayer,segSelect,currFeatrues= null;

    var _isInit = false;            //标记是否初始化

    var resultData;                                         //从数据库里查找到的结果对象数据-已经从小到大排序了
    var allInicators = [];                                  //解析全部指标（包括分组子指标）

    var config;                     //专题图查询配置

    var currRegions,currLevel;


    var segementMaxMinVal = {       //分段最大最小值
        minData: 0,
        maxData: 0
    };

    var rankParam = {              //分段色阶
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

    var hasCreateSegment = false;                  //是否已经创建分段图

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
                seajs.use(['component/legend','component/colorpicker'],
                    function(segLegend,colorpicker){
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
                                            var dataRamp = globalDataRamp;
                                            if(dataRamp == null || (dataRamp.length != colors.num+1)){
                                                //重新获取新的数据分段
                                                dataRamp = getDataRamp();
                                            }
                                            //切换分段专题图显示颜色
                                            switchSegmentColor(colors,dataRamp);
                                            //切换分段图例的颜色显示
                                            if (resultData)
                                                segLegend.switchLengend(rankParam.iden, colors.data,dataRamp);
                                        }
                                    }
                                });
                                //显示色段面板
                                colorpicker.init(config.segmentThemantic.colors);
                            },
                            //关闭图例事件
                            onClose: function () {
                                //TODO  关闭图例
                            }
                        });
                        //标记已经初始化
                        _isInit = true;
                        callback && callback();
                    });
            });
        }
    };

    /**
     * 初始化Vector图层
     */
    var initLayer = function () {
        if (!segLayer) {
            //以下可以判定浏览器是否支持Canvas，如果不支持，则使用SVG渲染
            segLayer = new SuperMap.Layer.Vector("segthema", {
                renderers: ["Canvas2"]
            });
            //需要控制图层顺序
            map.addLayers([segLayer]);
            $(segLayer.div).css("z-index", 10);

            //分段专题控制器
            segSelect = new SuperMap.Control.SelectFeature(segLayer, {
                onSelect: onFeatureSelect,                //注册三视图联动
                onUnselect: onFeatureUnselect,              //注册三视图联动
                callbacks:selCallbacks,
                hover: true,
                repeat: false
            });
            //分段专题选中样式
            segSelect.selectStyle = {};
            map.addControl(segSelect);
        } else {
            segLayer.removeAllFeatures();
        }
    };

    /**
     * 选中地图区域
     * @param fea
     */
    var onFeatureSelect  = function (fea) {
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
        var screenPoint = map.getViewPortPxFromLonLat(new SuperMap.LonLat(point.x, point.y));

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
        seajs.use(["grid","chart"], function (g,c){
            g.selectRow(qh_code);
            c.selectOne(qh_code);
        });
    };

    var onFeatureUnselect = function () {
        var $tooltip = $("#map-container >#thematic-tooltip");
        if ($tooltip.length > 0) {
            $tooltip.remove();
        }
    };


    /**
     * 创建分段
     * @param re
     */
    var createThemantic = function (re,_currentLevel,_regions) {
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
        allInicators = _allInicators;
        
        init(function () {

            var _rateInicators = [];

            $.each(allInicators, function (i, o) {
                var type = o.idenType;
                //累计单位：累计数（元、个、人...）
                if (type==2 || new RegExp(config.rex.rate).test(o.idenUnit) || new RegExp(config.rex.rate).test(o.unit)) {
                    _rateInicators.push(o);//分段显示指标
                }
            });

            //做分段色阶初始化
            if (_rateInicators.length > 0) {
                var periodlen = resultData.periods.length;
                //构建列维度查询参数【指标、时段】
                $.extend(true, rankParam, {
                    iden: {
                        indicator: _rateInicators[0].idenCode || _rateInicators[0].code,
                        idenname: _rateInicators[0].idenName || _rateInicators[0].name,
                        unit: _rateInicators[0].idenUnit || _rateInicators[0].unit
                    },
                    time: {
                        year: resultData.periods[periodlen-1].year,      //取最后一个年份
                        month: resultData.periods[periodlen-1].month
                    }
                });
                ThematicUtil.setRankParamLaySeg(rankParam);
                //进行数据分段
                var dataRamp = getDataRamp();
                ThematicUtil.setDataRamp(dataRamp);
                //添加分段专题图
                addSegment(rankParam);
            }

            ThematicUtil.createTimeLinr("segment",switchSegement,rankParam);
        });
        

    };


    /**
     * 添加分段专题图
     * @param _rankParam
     */
    var addSegment = function (_rankParam) {
        if (_rankParam.iden)
            $.extend(true, rankParam, _rankParam || {});
        else
            $.extend(true, rankParam.iden, _rankParam || {});


        if (!rankParam.time) {
            var periodlen = resultData.periods.length;
            rankParam.time = {
                year: resultData.periods[periodlen-1].year,      //取最后一个年份
                month: resultData.periods[periodlen-1].month
            };
        }

        if(rankParam.iden.indicator && rankParam.time){

            rankParam.iden_index = ThematicUtil.getIndicatorindex(rankParam.iden.indicator,allInicators);
            rankParam.time_index = ThematicUtil.getTimeindex(rankParam.time,resultData.periods);
            rankParam.index = ThematicUtil.getDataIndex(rankParam.iden_index, rankParam.time_index,allInicators);
            rankParam.iden = ThematicUtil.getIdenInfo(rankParam.iden.indicator,allInicators);
            if (rankParam.iden_index != -1 && rankParam.time_index != -1) {
                var selFeatures = currFeatrues;
                if (!selFeatures || selFeatures==null) {
                    SpatialQuery.queryRegionFeature(currRegions,1, function (_selFeatures) {
                        var  __selFeatures = SpatialQuery.filterFeatures(currRegions,_selFeatures);
                        currFeatrues = __selFeatures;
                        gotoSegementThematic();
                    });
                }else{
                    gotoSegementThematic();
                }

                /**创建专题图*/
                function gotoSegementThematic(){
                    if (!segLayer || segLayer == null){
                        initLayer();
                    }
                    //得到色接数据中的最值
                    segementMaxMinVal =  ThematicUtil.getMaxMinDataSeg(resultData);

                    drawSeg(currFeatrues,ThematicUtil.getDataRamp());   //画图
                    seajs.use('component/legend',function(segLegend){
                        segLegend.init($("#map-container"), rankParam.iden, config.segmentThemantic.colors.data,ThematicUtil.getDataRamp()).show();
                    });
                }
            }else {
                alert("创建色阶图失败");
            }
        }

    };


    /**
     * 绘制分段专题图
     * @param _features
     */
    var drawSeg = function (_features,dataRamp) {
        var timerFlag = null;
        if(_features){
            currFeatrues = _features;
        }

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

                var indexInfo  = getStyle(feature, resultData.content, config.segmentThemantic.colors.data, dataRamp);
                feature.style = indexInfo.style;
                feature.info = {
                    iden: rankParam.iden,
                    value: (indexInfo.index == -1) ? 0 :resultData.content[indexInfo.index][rankParam.index]
                };


                if(kk===1){
                    segLayer.removeAllFeatures();   //清除延后防止播放时白图
                    segLayer.setVisibility(true);
                }
                segLayer.addFeatures([feature]);
            }
        }, 25);

        hasCreateSegment = true;
        ThematicUtil.setCreateSegment(true);

        var blineLayer = map.getLayersByName("bline");
        if(blineLayer && blineLayer[0]){
           blineLayer[0].setVisibility(false);
        }

    };


    /**
     * 选中指定区域
     * @param code
     */
    var linkToRegion = function (code) {
        if(!segSelect || segSelect == null){
            return;
        }
        //清除分段专题图选择器的所选高亮
        segSelect.unselectAll();
        if (code) {
            //分段专题图层
            var linkedFeature = segLayer.getFeaturesByAttribute("QH_CODE", code);
            if (linkedFeature && linkedFeature.length > 0){
                //行政区划高亮选中
                segSelect.select(linkedFeature[0]);
            }
        }
    };


    /**
     * 销毁分段专题图层
     */
    var destroy = function () {
        hasCreateSegment = false;
        ThematicUtil.setCreateSegment(false);
        if (segLayer && segSelect) {
            map.removeLayer(segLayer, false);   //不可见
            segSelect.deactivate();                        //取消分段选中
            map.removeControl(segSelect);              //移除控件
            segLayer = null;
            segSelect = null;
            globalDataRamp =null ; //分段值置空
        }

        var blineLayer = map.getLayersByName("bline");
        if(blineLayer && blineLayer[0]){
            blineLayer[0].setVisibility(true);
        }


        seajs.use('component/legend',function(segLegend){
            segLegend.destroy();
        });

    };


    /**
     *  切换分段专题图显示颜色
     * @param _colors
     *          颜色值
     * @param dataRamp
     *          分段数据范围
     */
    var switchSegmentColor = function (_colors,dataRamp) {
        if (resultData) {
            //设置颜色
            config.segmentThemantic.colors.data = _colors.data;
            drawSeg(null,dataRamp);
        } else {
            alert("没有数据!");
        }
    };

    /**
     * 切换色阶图指标
     * @param _rankParam
     *          分段参数
     * @param type
     *          专题图类型
     * @param dataRamp
     *          专题图数据分段
     */
    var switchSegement = function (_rankParam, _type, _dataRamp) {
        if (!_rankParam)
            return;
        if (!resultData) {
            alert("请先执行一次专题图操作后再进行切换操作！");
            return;
        }
        $.extend(true, rankParam.iden, _rankParam || {});


        rankParam.iden_index = ThematicUtil.getIndicatorindex(rankParam.iden.indicator,allInicators);
        rankParam.time_index = ThematicUtil.getTimeindex(rankParam.time,resultData.periods);
        rankParam.index = ThematicUtil.getDataIndex(rankParam.iden_index, rankParam.time_index,allInicators);
        rankParam.iden = ThematicUtil.getIdenInfo(rankParam.iden.indicator,allInicators);

        if (rankParam.iden_index != -1 && rankParam.time_index != -1) {
            addSegment(rankParam);
            //切换分段
            //segLegend.switchLengend(rankParam.iden, config.segmentThemantic.colors.data, globalDataRamp);
        }
    };



    /**
     * 提供数据划分方法
     */
    var divideMethod = (function () {
        /**
         * 等距分段(其实数据已经是经过从小到大排序的了)
         */
        var isometricSegmented = function (data, segment) {
            var maxVal = Segement.getSegementMaxMinVal().maxData,
                minVal = Segement.getSegementMaxMinVal().minData,
                per = (maxVal - minVal) / segment;
            var dataRamp = [];
            for (var i = 0; i < segment; i++) {
                dataRamp.push(minVal + i * per);
            }
            dataRamp.push(maxVal);
            return dataRamp;
        };
        /**
         平方根分段(对专题变量所确定的专题值的平方根为分段数据进行等距离分段。首先取所有专题值的平方根，
         然后进行等距离分段，得到处理后数据的分段点，然后将这些分段点的值进行平方得到对应专题值的分段点，
         从而得到专题值的分段方案。)
         */
        var squareRootSegmented = function (data, segment) {
            var dataRamp = [];
            for (var i = 0,len=data.length; i < len; i++) {
                data[i].push(Math.sqrt(data[i][rankParam.index]));
            }
            var maxVal = Math.sqrt(data[data.length - 1][rankParam.index]), minVal = Math.sqrt(data[0][rankParam.index]), per = (maxVal - minVal) / segment;
            for (var i = 0; i < segment; i++) {
                dataRamp.push(Math.pow(minVal + i * per, 2));
            }
            dataRamp.push(Math.pow(maxVal, 2));
            return dataRamp;
        };
        /**
         标准差分段(反映各对象的某属性值对其平均值的偏离。首先计算出专题变量所确定的专题值的平均值和标准
         偏差，在此基础上进行分段。标准差分段的每个分段长度都是一个标准差，最中间的那一段以平均值为中心，
         左边分段点和右边分段点分别与平均值相差0.5个标准差。标准差分段方法所得的“段数”由计算结果决定，
         用户不可控制。)
         */
        var standardDeviationSegmented = function (data) {
            var stdev , average , max_mun , min_mun , sum_seg;
            //计算出最大最小值
            max_mun = data[data.length - 1][rankParam.index], min_mun = data[0][rankParam.index];
            //计算标准差
            var temp = 0, sum = 0;
            for (var i = 0,len=data.length; i < len; i++) {
                sum += data[i][rankParam.index];
            }
            average = sum / data.length;
            for (var i = 0,len=data.length; i < len; i++) {
                temp += Math.pow(data[i][rankParam.index] - average, 2);
            }
            stdev = Math.sqrt(temp / data.length);
            //计算出平均值所在左右分段点值和分段数
            var seg_r = average + stdev / 2, num_r = 0;
            while (seg_r < max_mun) {
                seg_r += stdev;
                num_r++;
            }
            var seg_l = average - stdev / 2, num_l = 0;
            while (seg_l > min_mun) {
                seg_l -= stdev;
                num_l++;
            }
            //计算总的分段数
            sum_seg = num_l + num_r + 1;
            //计算每一段的值
            var dataRamp = [];
            for (var i = 0; i < sum_seg + 1; i++) {
                dataRamp.push(seg_l + i * stdev);
            }
            return dataRamp;
        }
        /**
         对数分段（与平方根分段方法基本相同，所不同的是平方根方法是对专题值取平方根，而对数分段方法是对
         专题值取对数，即对专题值的以10为底的对数值进行等距离分段。首先对所有专题值的对数进行等距离分段，
         得到处理后数据的分段点，然后以10为底，这些分段点的值作为指数的幂，得到对应的专题值的各分段点的
         值，从而得到分段方案。）
         */
        var logarithmSegmented = function (data, segment) {
            var dataRamp = [], maxVal, minVal, per;
            for (var i = 0,len=data.length; i < len; i++) {
                data[i].push(Math.log(data[i][rankParam.index]));
            }
            maxVal = data[data.length - 1][rankParam.index], minVal = data[0][rankParam.index], per = (maxVal - minVal) / segment;
            for (var i = 0; i < segment; i++) {
                dataRamp.push(Math.pow(10, minVal + i * per));
            }
            dataRamp.push(Math.pow(10, maxVal));
            return dataRamp;
        };

        /**
         * 取一个合适的index
         * @param d
         */
        var getFitIndex = function (d,index,maxIndex) {
            //取一个相对合适的index
            var flag = 0;
            for(var i =0;i< d.length;i++){
                var temp = d[i];

                if(temp==0){
                    flag ++;
                }
            }
            if(flag == d.length && index<maxIndex){ //全部都是0
                index++;
            }
            return index;
        };

        /**
         * 获取制定index 的数据
         * @param data
         * @param index
         * @returns {Array}
         */
        var getIndexData = function (data, index) {
            var d = new Array();
            for (var i=0,len=data.length; i<len; i++) {
                var v = data[i][index];
                if ((typeof v == "string") || (typeof v == "number")) {
                    //排除null的情况
                    d.push(v != "" ? parseFloat(v) : 0);
                } else {
                    d.push(0);
                }
            }
            return d;
        }

        /**
         * 分段算法
         * k-means 算法的工作过程说明如下：首先从n个数据对象任意选择 k 个对象作为初始聚类中心；而对于所剩下其它对象，则根据它们与这些聚类中心的相似度（距离），
         * 分别将它们分配给与其最相似的（聚类中心所代表的）聚类；然后再计算每个所获新聚类的聚类中心（该聚类中所有对象的均值）；
         * 不断重复这一过程直到标准测度函数开始收敛为止。一般都采用均方差作为标准测度函数. k个聚类具有以下特点：各聚类本身尽可能的紧凑，而各聚类之间尽可能的分开
         * @param data
         * @param segment
         */
        var kMeansSegmented = function(data,segment) {
            var maxVal = segementMaxMinVal.maxData,
                minVal = segementMaxMinVal.minData;
            if (!KMeans) {
                KMeans = require("component/KMeans");
            }
            var index = rankParam.index;
            var d = getIndexData(data,index);
            var maxIndex = index;
            if(data.length>0){
                maxIndex = data[0].length+2;
            }

            //找一个合适的index 防止第一个年份的数据全部为0的时 导致后面的年份数据无法展示。
            var fitIndex =  getFitIndex(d,index,maxIndex);
            while(fitIndex != index){
                index = fitIndex;
                d = getIndexData(data,index);
                fitIndex =  getFitIndex(d,index,maxIndex);
            }

            var leng = d.length;
            //没有数据
            if (leng == 0) {
                var re = [];
                for (var i = 0; i < segment; i++) {
                    re.push(0);
                }
                //注意：返回的数组长度是（segment+1）
                return re;
                //判断数据个数只有一个(此时：maxVal == minVal)
            }else if(leng == 1){
                var re = [];
                if(maxVal == 0){
                    for (var i = 0; i < segment+1; i++) {
                        re.push(0);
                    }
                }else{
                    //取前（segment）个
                    for (var i = 0; i < segment; i++) {
                        re.push(0);
                    }

                    if(maxVal < 1){
                        re.push(maxVal);
                    }else{
                        re.push(Math.ceil(maxVal));
                    }
                }//end if(maxVal == 0) else
                //注意：返回的数组长度是（segment+1）
                return re;
            }

            //返回的结果个数不够分段,前面补0
            if(leng <= segment){
                var re = [];
                for (var i = 0; i < (segment-leng+1); i++) {
                    re.push(0);
                }
                for (var j = 0; j < leng; j++) {
                    re.push(d[j]);
                }

                d = re; //重新赋值
            }//end if(d.length < segment)

            var m = new KMeans(segment,d);
            var re = m.result ;

            //返回的值可能存在，null
            var len = re.length;
            for(var i = 0; i<len; i++){
                if(typeof re[i] == "undefined"){
                    re[i] = 0;
                }
            }

            //升序排序
            re.sort(function(a,b){
                return a-b ;
            });

            //最大最小值处理
            re[0] = re[0]>minVal ? minVal : re[0] ;
            re[len-1] = re[len-1]<maxVal ? maxVal : re[len-1];

            //最大值大于1才处理
            if(re[len-1] >= 1){
                for(var i=0;i<len;i++){
                    if(i == 0){
                        //第一向下取整
                        re[i] = (re[i]==null) ? 0 : Math.floor(re[i]);
                    }else if(i == len-1){
                        //最后一个向上取整
                        re[i] = (re[i]==null) ? 0 : Math.ceil(re[i]);
                    }else{
                        //小数四舍五入
                        re[i] = (re[i]==null) ? 0 : Math.round(re[i]);
                    }
                }

                var SDOObj = new SDO(re);
                re = SDOObj.excute();
            }//end if(re[re.length-1] >= 1)

            return re;
        };
        /**
         * k-means统一分段
         */
        var kMeansSegmentedUnify = function(data,segment){
            var maxVal = segementMaxMinVal.maxData,
                minVal = segementMaxMinVal.minData;
            if (!KMeans) {
                KMeans = require("component/KMeans");
            }

            var d = [];
            for(var i = 2; i < data[0].length ; i++){
                var q = getIndexData(data,i);
                var sample = getArrayItems(q,3);
                //随机取三个若为0则判断为无数据
                if(sample[0] == 0 && sample[1] == 0 && sample[2] == 0){
                    continue;
                }
                d.push.apply(d,q);
            }
            var leng = d.length;
            //没有数据
            if (leng == 0) {
                var re = [];
                for (var i = 0; i < segment; i++) {
                    re.push(0);
                }
                //注意：返回的数组长度是（segment+1）
                return re;
                //判断数据个数只有一个(此时：maxVal == minVal)
            }else if(leng == 1){
                var re = [];
                if(maxVal == 0){
                    for (var i = 0; i < segment+1; i++) {
                        re.push(0);
                    }
                }else{
                    //取前（segment）个
                    for (var i = 0; i < segment; i++) {
                        re.push(0);
                    }

                    if(maxVal < 1){
                        re.push(maxVal);
                    }else{
                        re.push(Math.ceil(maxVal));
                    }
                }//end if(maxVal == 0) else
                //注意：返回的数组长度是（segment+1）
                return re;
            }

            //返回的结果个数不够分段,前面补0
            if(leng <= segment){
                var re = [];
                for (var i = 0; i < (segment-leng+1); i++) {
                    re.push(0);
                }
                for (var j = 0; j < leng; j++) {
                    re.push(d[j]);
                }

                d = re; //重新赋值
            }//end if(d.length < segment)

            var m = new KMeans(segment,d);
            var re = m.result ;

            //返回的值可能存在，null
            var len = re.length;
            for(var i = 0; i<len; i++){
                if(typeof re[i] == "undefined"){
                    re[i] = 0;
                }
            }

            //升序排序
            re.sort(function(a,b){
                return a-b ;
            });

            //最大最小值处理
            re[0] = re[0]>minVal ? minVal : re[0] ;
            re[len-1] = re[len-1]<maxVal ? maxVal : re[len-1];

            //最大值大于1才处理
            if(re[len-1] >= 1){
                for(var i=0;i<len;i++){
                    if(i == 0){
                        //第一向下取整
                        re[i] = (re[i]==null) ? 0 : Math.floor(re[i]);
                    }else if(i == len-1){
                        //最后一个向上取整
                        re[i] = (re[i]==null) ? 0 : Math.ceil(re[i]);
                    }else{
                        //小数四舍五入
                        re[i] = (re[i]==null) ? 0 : Math.round(re[i]);
                    }
                }

                var SDOObj = new SDO(re);
                re = SDOObj.excute();
            }//end if(re[re.length-1] >= 1)

            return re;
        }
        /**
         * 随机取num个数
         */
        function getArrayItems(arr, num) {
            //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
            var temp_array = new Array();
            //for (var index in arr) {
            //    temp_array.push(arr[index]);
            //}
            for(var j = 0 ; j < arr.length ; j++){
                temp_array.push(arr[j]);
            }
            //取出的数值项,保存在此数组
            var return_array = new Array();
            for (var i = 0; i<num; i++) {
                //判断如果数组还有可以取出的元素,以防下标越界
                if (temp_array.length>0) {
                    //在数组中产生一个随机索引
                    var arrIndex = Math.floor(Math.random()*temp_array.length);
                    //将此随机索引的对应的数组元素值复制出来
                    return_array[i] = temp_array[arrIndex];
                    //然后删掉此索引的数组元素,这时候temp_array变为新的数组
                    temp_array.splice(arrIndex, 1);
                } else {
                    //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
                    break;
                }
            }
            return return_array;
        }
        return{
            isometricSegmented: isometricSegmented,
            squareRootSegmented: squareRootSegmented,
            standardDeviationSegmented: standardDeviationSegmented,
            logarithmSegmented: logarithmSegmented,
            kMeansSegmented:kMeansSegmented,
            kMeansSegmentedUnify:kMeansSegmentedUnify
        };
    })();



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
    var getStyle = function (fea, re, colors, dataRamp) {
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
            }
        }
        return {
            style: config.segmentThemantic.emptyStyle,
            index: -1
        };
    };


    /**
     * 进行数据分段（默认用均分法）
     *
     * @returns {Array}
     */
    var getDataRamp = function (type) {
        var content = resultData.content;
        var re = [];

        //分段方法
        switch (config.segmentThemantic.segmentMethod) {
            case SEGMENT_METHODS.KEANS:                 //默认分段方法0
                re = divideMethod.kMeansSegmentedUnify(content, config.segmentThemantic.colors.num);                  //等比例
                break;
            case SEGMENT_METHODS.SQUARE_ROOT:           //1
                re = divideMethod.squareRootSegmented(content, config.segmentThemantic.colors.num);             //平方根
                break;
            case SEGMENT_METHODS.STANDARD_DEVIATION:    //2
                re = divideMethod.standardDeviationSegmented(content);                                          //标准差
                break;
            case SEGMENT_METHODS.LOGARITHM:             //3
                re = divideMethod.logarithmSegmented(content, config.segmentThemantic.colors.num);              //对数
                break;
            case SEGMENT_METHODS.ISOMETRIC:             //4
                re = divideMethod.isometricSegmented(content, config.segmentThemantic.colors.num);              //等比例
                break;
            default :                                   //0
                re = divideMethod.kMeansSegmentedUnify(content, config.segmentThemantic.colors.num);                 //k-means 算法(并优化)
                break;
        }
        //修改两端的最值，覆盖整个数据
        re[0] = -999999999999999999999999999;
        re[re.length-1] =999999999999999999999999999999;
        //console.log(re);//分段数组

        //取得全局分段数据变量
        globalDataRamp = re;

        return re;
    };



    var hasCreate = function () {
        return hasCreateSegment;
    };

    var toggleLegend = function () {
        seajs.use(['component/legend'], function (legend) {
            legend.toggle();
        });
    };

    var hideLegend = function () {
        seajs.use(['component/legend'], function (legend) {
            legend.hide();
        });
    }

    return{
        initLayer:initLayer,
        drawSeg:drawSeg,
        addSegment:addSegment,
        createThemantic:createThemantic,
        linkToRegion:linkToRegion,
        destroy:destroy,
        hasCreate:hasCreate,
        toggleLegend:toggleLegend,
        hideLegend:hideLegend
    }
});
