/**
 * Created by jinn on 2015/10/26.
 */

/**
 * 专题图公用方法
 */
define(function (require, exports, module) {
    var timeLinr = require("timeLinr");          //时间轴

    var hasCreateSegment = false;       //是否已经创建分段图
    var hasCreatePie = false;           //是否已经创建等级符号图
    var hasCreateComparison = false;    //是否已经创建对比图

    var setCreateSegment = function (_bl) {
        hasCreateSegment = _bl;
    };
    var getCreateSegment = function () {
        return hasCreateSegment;
    };

    var setCreatePie = function (_bl) {
        hasCreatePie = _bl;
    };
    var getCreatePie = function () {
        return hasCreatePie;
    };

    var setCreateComparison = function (_bl) {
        hasCreateComparison = _bl;
    };
    var getCreateComparison = function () {
        return hasCreateComparison;
    };


    //结果数据

    var dataRamp = null;
    var setDataRamp = function (_re) {
        dataRamp = _re;
    };
    var getDataRamp = function () {
        return dataRamp;
    };


    var resultData = null;
    var setResultData = function (_re) {
        resultData = _re;
    };
    var getResultData = function () {
        return resultData;
    };

    var range = null;
    var setRange = function (_re) {
        range = _re;
    };
    var getRange = function () {
        return range;
    };

    var rankParamLaySeg = null;
    var setRankParamLaySeg = function (_re) {
        rankParamLaySeg = _re;
    };
    var getRankParamLaySeg = function () {
        return rankParamLaySeg;
    };

    var getCurrYear = function(){
        return currYear;
    }

    //全部指标（包括分组子指标）
    var allInicators = [];
    var setAllInicators = function (_allInicators) {
        allInicators = _allInicators;
    };
    var getAllInicators = function () {
        return allInicators;
    };

    var ThematicType = {
        SEGMENT:"segment",
        PIE:"pie",
        COMPARISON:"comparison"
    };


    var switchEventMap = new SGIS.Util.Hashtable();
    var thematicParam = new SGIS.Util.Hashtable();



    /**
     * 解析全部指标（包括多层分组子指标）
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
                //添加：递归子指标项
                _sumIndicators = _sumIndicators.concat(getSubInicators(subs));
            }
        });
        return _sumIndicators;
    };


    /**
     * 获当前指标对应数据的index(数组下标)
     * @param indicator 当前指标（idenCode）
     * @returns {number}
     */
    var getIndicatorindex = function (indicator,_allInicators) {
        if (_allInicators) {
            var len = _allInicators.length;
            for (var index = 0; index < len; index++) {
                if (indicator === _allInicators[index].idenCode || indicator === _allInicators[index].code) {
                    return Number(index);
                }
            }
        }
        return -1;
    };


    /**
     * 获当前时间对应数据的index
     * @param time
     *         当前时间对象（{year:"",month:""}）
     * @returns {number}
     */
    var getTimeindex = function (time,periods) {
        for (var index = 0; index < periods.length; index++) {
            if (time.year == periods[index].year &&
                time.month == periods[index].month) {
                return Number(index);
            }
        }

        return -1;
    };


    /**
     * 根据时间index和指标index确定数据index
     * @param iden_index
     *          当前指标下标
     * @param time_index
     *          当前时间下标
     * @param type
     *          专题图类型
     * @returns {*}
     */
    var getDataIndex = function (iden_index, time_index,_allInicators) {
        return iden_index + time_index * _allInicators.length + 2;
    };


    /**
     * 取得指标信息
     *
     * @param indicator
     *         当前指标（idenCode）
     * @returns {*}
     */
    var getIdenInfo = function (indicator,_allInicators) {
        var result = {indicator: indicator, idenname: "", unit: ""};
        if (_allInicators) {
            var len = _allInicators.length;
            for (var index = 0; index < len; index++) {
                if (indicator === _allInicators[index].idenCode || indicator === _allInicators[index].code) {
                    return {
                        indicator: indicator,
                        idenname: _allInicators[index].idenName || _allInicators[index].name,
                        unit: _allInicators[index].idenUnit || _allInicators[index].unit
                    };
                }
            }
        }
        return result;
    };



    /**
     * 获取某一指标的值中的最大最小值
     * @param _index
     *          根据指标所在的序号
     * @returns {{maxData: number, minData: number}}
     */
    var getMaxMinData = function (_index,_resultData) {
         var  dataValues = $.map(_resultData.content, function (element, index) {
                return Number(_resultData.content[index][_index] || 0);
            });
        return{
            maxData: Math.max.apply(Math, dataValues) || 0,
            minData: Math.min.apply(Math, dataValues) || 0
        };
    };
    /**
     *分段专用
     */
    var getMaxMinDataSeg = function (_resultData) {
        var  dataValues = [];
        for(var i = 2 ; i < _resultData.content[0].length ; i++){
            dataValues[i-2] = $.map(_resultData.content, function (element, index) {
                return Number(_resultData.content[index][i] || 0);
            });
        }
        var final = [];
        for(var j = 0 ; j < dataValues.length ; j++){
            final.push.apply( final, dataValues[j] );
        }
        return{
            maxData: Math.max.apply(Math, final) || 0,
            minData: Math.min.apply(Math, final) || 0
        };
    };

    /**
     * 创建时间轴
     */
    var createTimeLinr = function (type,func,param) {
        switchEventMap.update(type,func);
        thematicParam.update(type,param);

        //一个时段就没有必要了吧 改为大于1
        if (resultData.periods.length > 1) {
            if (timeLinr.isInit()) {
                timeLinr.updateYears(resultData.periods);
            } else {
                var periodlen = resultData.periods.length;
                timeLinr.TimeLinr(resultData.periods, "", {
                    autoPlayDirection: 'forward',
                    startAt: periodlen-1                         //激活最后一个
                }, switchTime);
            }
        }
    };

    var switchTime = function(_timeParam){
        var  _periods = [];
        _periods.push({
            year: _timeParam.year,
            month: _timeParam.month,
            reporttype: _timeParam.reporttype
        });

        if (_timeParam && hasCreateSegment) {
            var rankParam = thematicParam.items(ThematicType.SEGMENT);
            $.extend(true,rankParam.time, _periods[0]);

            var segCB = switchEventMap.items(ThematicType.SEGMENT);
            segCB&&segCB(rankParam.iden);
        }

        if (_timeParam && hasCreatePie) {
            var pieParam = thematicParam.items(ThematicType.PIE);
            $.extend(true, pieParam.time, _periods[0]);
            var pieCB = switchEventMap.items(ThematicType.PIE);
            pieCB&&pieCB(pieParam.iden);
        }

        if (_timeParam && hasCreateComparison) {
            var comparisonParam = thematicParam.items(ThematicType.COMPARISON);
            $.extend(true,comparisonParam.time, _periods[0]);
            var compCB = switchEventMap.items(ThematicType.COMPARISON);
            compCB&&compCB(comparisonParam);
        }

        //更新表格数据
        seajs.use(['grid','chart'], function (g,c) {
            $("#enlarge").addClass("hide");
            g.active(resultData,_periods);
            c.active(resultData,null,_periods);
        });

        currYear = _periods.year;
    };

    /**
     * 清除数据
     */
    var clearAll = function () {
        resultData = null;
        allInicators.length = 0;

        hasCreateComparison = false;
        hasCreatePie = false;
        hasCreateSegment= false;

        switchEventMap.clear();
        thematicParam.clear();

        timeLinr.destroy();
    };

    return{
        getSubInicators:getSubInicators,
        getIndicatorindex:getIndicatorindex,
        getTimeindex:getTimeindex,
        getDataIndex:getDataIndex,
        getIdenInfo:getIdenInfo,
        getMaxMinData:getMaxMinData,
        getMaxMinDataSeg:getMaxMinDataSeg,
        createTimeLinr:createTimeLinr,

        setDataRamp:setDataRamp,
        getDataRamp:getDataRamp,
        setRange:setRange,
        getRange:getRange,
        setRankParamLaySeg:setRankParamLaySeg,
        getRankParamLaySeg:getRankParamLaySeg,

        setResultData:setResultData,
        getResultData:getResultData,
        setAllInicators:setAllInicators,
        setCreateSegment:setCreateSegment,
        getCreateSegment:getCreateSegment,
        setCreatePie:setCreatePie,
        getCreatePie:getCreatePie,
        setCreateComparison:setCreateComparison,
        getCreateComparison:getCreateComparison,
        clearAll:clearAll
};
});
