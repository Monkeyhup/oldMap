/**
 * Created by jinn on 2015/10/26.
 */

/**
 * 统计图表
 */
define(function (require, exports, module) {
    var Reader =require("query.reader");
    var Chart = require("component/chart/charts.api");

    var chartPanel = $("#chart-panel");
    var $select = chartPanel.find("select"); //指标选择
    var reData = null ;
    var _sortData = null;
    var mychart = null;

    var isInit = false;


    var currIdenCodes = []; //当前指标
    var currPeriods = [];   //当前时段


    var init = function () {
        if(mychart != null){
            mychart.dispose();//清除
            mychart = null ;
        }
    };
    
    $(function () {
        chartPanel.Drag();
        chartPanel.find(".item.close").click(function () {
            hide();
        });


        //切换指标
        $select.change(function () {
            var value = $(this).val();
            switchIdenCode([value]);
        });
    });

    var getPanel = function () {
        return chartPanel;
    }

    var show = function () {
        if(!isInit)return;
        chartPanel.removeClass("hide");
    };

    var hide = function () {
        chartPanel.addClass("hide");
    };

    var toggle = function () {
        //chartPanel.toggle();
        if(chartPanel.hasClass("hide")  && isInit){
            chartPanel.removeClass("hide");
        }else{
            chartPanel.addClass("hide");
        }
    };


    var clearAll = function(){
        if(mychart != null){
            mychart.dispose();//清除
            mychart = null ;
        }
        reData = null;
        _sortData = null;
        isInit = false;
        hide();
    };


    /**
     * 指标切换
     * @param _codes
     */
    var switchIdenCode = function (_codes){
        active(reData,_codes,currPeriods);
    };


    /**
     * 切换时段
     * @param _periods
     */
    var switchPeriod = function (_periods) {
        active(reData,currIdenCodes,_periods);
    };

    /**
     * 激活统计图
     * @param re
     * @param idencodes
     * @param periods
     */
    var active = function(re,_idencodes,_periods){
        if(re.content.length==0){
            return;
        }

        isInit = true;
        show();
        reData = re;
        if(mychart != null){
            mychart.dispose();//清除
            mychart = null ;
        }


        var reader = new Reader(re);

        //指标
        var idencodes = [];
        if(_idencodes){
            idencodes = _idencodes;
        }else{
            $select.empty();
            var tempCodes = [];
            for(var i = 0,len = re.indicators.length;i<len;i++){
                var code = re.indicators[i].idenCode||re.indicators[i].code;
                var name = re.indicators[i].idenName||re.indicators[i].name;
                var option = "<option value='"+code+"'>"+name+"</option>";
                $select.append(option);

                tempCodes.push(code);
            }
            idencodes.push(tempCodes[0]);
        }


        //时段
        var periodlen =  re.periods.length;
        var periods = [re.periods[periodlen-1]];
        if(_periods){
           periods = _periods;
        }

        currIdenCodes = idencodes;
        currPeriods = periods;


        var d = reader.getFilterData(idencodes,periods);   //筛选（报告期*指标）结果数据
        var indicators = d.head;                                //标题（编码、名称、指标123...）
        var content  = d.content;                               //数据（编码、名称、指标123...）

        //默认按第一个指标排序
        content = sortData(content);
        var legendData = [];
        var data = [];
        var p = periods.length>0 ? periods[0] : re.periods[0];  //默认第一个报告期
        var backgroundText = getCNPeroidText(p);                //获取报告期中文标题
        var xAxisData = [];
        xAxisData[0] = [];

        //最后一行统计图数据值
        var leng = content.length;
        for(var i=0; i<leng; i++){
            var row = content[i];
            //行政区划名称
            xAxisData[0].push(row[1]);
            var size = row.length;
            for(var j=2; j < size; j++){
                if(data[j-2] == null){
                    data[j-2] = [];
                }
                data[j-2].push(row[j]);
            }
        }

        //标题（指标名）
        for(var i=2,len=indicators.length; i<len; i++){
            var d = {
                name:indicators[i],
                type:i==2 ? "bar" : "line",
                yAxisIndex:0
            };
            if(i == 2){
                d.itemStyle ={
                    normal:{
                        color:"rgba(255,140,0,0.8)"
                    },
                    emphasis: {
                        color:"rgb(255,127,80)"
                    }
                }
            }
            legendData.push(d);//图例数据
        }
        var extOption ={
            title:{
                show:true,
                text: backgroundText+"分地区图",
                x:"center",
                y:"top",
                textStyle:{
                    fontSize: 14,
                    fontWeight: 'normal',
                    color: '#333'
                }
            },
            grid:{
                x:10,
                y:30,
                x2:10,
                y2:10
            },

            tooltip : {
                trigger: 'axis',
                position : function(p) {
                    var pageLeft = chartPanel.css("left");
                    var pageTop = chartPanel.css("top");
                    var x = parseInt(pageLeft)  + p[0];
                    var y = parseInt(pageTop) + p[1];
                    return [x,y];
                }
            }


        };
        mychart = new Chart("chart-container",backgroundText+"分地区图",data,legendData,xAxisData,extOption);//新建统计图
        mychart.render();

        //柱子点击事件
        mychart.onclick(function(e){
            seajs.use(['grid','layer.segment'], function (Grid,Segment) {
                var _da  = _sortData;
                if(!_da){
                    _da =  reData.content;
                }
                var code = _da[e.dataIndex][0];//行政区域代码
                Grid.selectRow(code);
                Segment.linkToRegion(code);
            });
        });

        mychart.onHover(function (e) {

        });

        //mychart.showMarkLine([
        //    {type:"average",name:"平均值"}
        //]);
        mychart.hideXAxis();
        //mychart.hideTitle();
        mychart.hideLegend();
        //mychart.addBackgroundText({
        //    text :backgroundText,
        //    textFont:'normal 30px verdana'
        //});
    };

    /**
     * 获取period 中文 2008年1月
     * @param period
     */
    var getCNPeroidText = function(period){
        if(period == null){
            return "";
        }
        var type = (period.reportType||period.reporttype) + "";
        var text ="";
        switch(type){
            case "1":
            case "2":
            case "3":
            case "4":
            case "11" :
                text = period.year+"年";
                break;
            case "12" :
                text = period.year+"年第"+(period.month-12)+"季度";
                break ;
            case "13":
                text = period.year+"年"+period.month+"月";
                break;
            default :
                break;
        }
        return text ;
    };
    /**
     * 统计图选中一列
     * @param regioncode 行政区划编码
     */
    var selectOne =function(regioncode){
        var idx = getidIndex(regioncode);
        if(idx !=-1){
            mychart.selectOne(idx,null);
        }
    };
    /**
     * 对应结果数据行序号
     * @param regioncode 行政区划编码
     */
    var getidIndex = function(regioncode){
        var content =  _sortData;
        if(!content){
           content =  reData.content;
        }

        for(var index = 0; index < content.length ; index++){
            if(content[index][0] == regioncode){
                return index ;
            }
        }
        return -1;
    };
    /**
     * 将统计图表的数据排序  默认按第一个指标排序（从大到小排序）
     *
     * @param data
     * @param index 指标索引值
     */
    var sortData = function(data,index){
        var re = data;

        //去掉空项目
        for(var i=0,len=data.length; i<len; i++){
            if(data[i][0] ==null ||data[i][0] ==""){
                //delete  re[i];
                re.remove(i);
            }
        }

        var temp ;
        for(var j = re.length-1; j > 0; j--){
            var rowData = re[j];
            var index = index !=null && index <rowData.length ? index:2;

            for(var k= 0; k< j; k++){
                //当前行指定指标的值
                var curr = re[k][index];
                if(typeof curr == "string"){
                    curr = parseFloat(curr);
                }

                //被比较的
                var compare = re[k+1][index];
                if(typeof compare == "string"){
                    compare = parseFloat(compare);
                }

                if(curr < compare){
                    temp = re[k];
                    re[k] = re[k+1];
                    re[k+1] = temp ;
                }
            }
        }

        _sortData = re;
        return re ;
    };




    return{
        init:init,
        getPanel:getPanel,
        show:show,
        hide:hide,
        toggle:toggle

        ,active:active,
        selectOne:selectOne,
        switchIdenCode:switchIdenCode,
        switchPeriod:switchPeriod,
        clearAll:clearAll
    }
});