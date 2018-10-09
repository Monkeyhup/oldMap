/**
 * Created by zhangjunfeng on 14-4-21.
 */
define(function (require, exports, module) {
    /**
     * 用于读取基层数据查询结果
     * @param queryResult
     * @constructor
     */
    var Reader = function(queryResult){
        this.indicators = queryResult.indicators;//结果数据对应指标
        this.periods = queryResult.periods;//报告期时段
        this.head = queryResult.head;//数据标题
        this.data = queryResult.content;//二维结果数据

        if(!this.data) return;
        //处理行政区划省级名称 简称
        for(var i=0,len=this.data.length; i<len; i++){
            var row = this.data[i] ;
            var  rnum = row.length ;
            if(rnum<3){
                break ;
            }
            var level  = SGIS.Region.recognitionLevel(this.data[i][0]);
            var name =this.data[i][1];
            name = level==2?(/内蒙古|黑龙江/g.test(name)?  name.substr(0, 3)
                : name.substr(0, 2)): name;
            this.data[i][1] = name ;
        }
    };

    Reader.prototype ={
        /**
         * 筛选（报告期*指标）数据，默认显示前两项指标
         * @param filterIdencodes 指标数组
         * @param filterPeriods   时段数组
         * @return 返回指定指标、报告期的二维数据
         */
         getFilterData: function(filterIdencodes,filterPeriods){
            var head = [];
            var content =[];
            var periods = this.periods;//查询全部报告期
            var indicators = this.indicators;//查询全部指标

            var indexArr = [0,1];//行政区划代码和名称
            for(var i=0,len=filterIdencodes.length; i<len; i++){
//                var indIndex = this.getIndicatorIndex(indicators,filterIdencodes[i]);
//                var index = filterPeriods.length>i?i:filterIdencodes.length-1;
//                var pIndex = this.getPeriodIndex(periods,filterPeriods[index]);
                var pindex = filterPeriods.length>i ? i : filterPeriods.length-1;
                var colIndex = this.getColIndex(filterPeriods[pindex],filterIdencodes[i]);//所在列序号
                if(colIndex!=-1){
//                    var varIndex=colIndex+indexArr.length;//这么写有问题
                    var varIndex=colIndex+2;
                    indexArr.push(varIndex);
                }
            }
            //默认显示第一个报告期的前两个指标
            if(indexArr.length ==2){
                for(var i=0,len=indicators.length; i<len; i++){
                    if(i>1){
                        break;
                    }
//                    var pindex = periods.length>i?i:periods.length-1;
                    var pindex = 0; //第一个报告期
                    var colIndex = this.getColIndex(periods[pindex],indicators[i].idenCode||indicators[i].code);
                    indexArr.push(colIndex+2);
                }
            }

            //表头处理
            for(var i=0,len=indexArr.length; i<len; i++){
                head.push((this.head[indexArr[i]]=='undefined')?'':this.head[indexArr[i]]);
            }
            //数据
            for(var i=0,len=this.data.length; i<len; i++){
                content[i] = [];
                for(var j=0,len1=indexArr.length; j<len1; j++){

                    //保留两位小数
                    var aa = (this.data[i][indexArr[j]]=='undefined')?'':this.data[i][indexArr[j]] + "";
                    var b = aa.split(".");
                    if(b.length==2 && b[1].length>2){
                        b = b[0] + ".";
                        var c = b[1].substring(0,2);
                        if(c.length ==1){
                            c = c+"0";
                        }
                        b = b + c;
                        b = parseFloat(b);
                        content[i][j] = b;
                    }else{
                        content[i][j] = aa;
                    }
                    //content[i][j] = (this.data[i][indexArr[j]]=='undefined')?'':this.data[i][indexArr[j]];
                }
            }
            return {
                head :head,
                content:content,
                indicators:indicators,
                periods :periods
            }
        },
        /**
         * 获取某字段某时段的数据索引值（二维数组的列号）
         * @param currP 时段
         * @param idenCode 指标代码
         * @param periods
         * @param indicators
         * @returns {number}
         */
        getColIndex :function(currP, idenCode){
            var periods = this.periods;
            var indicators = this.indicators;

            var index = -1;
            var num = indicators.length;
            var leng = periods.length;
            for (var i = 0; i < leng; i++) {
                var p = periods[i];
                for (var j = 0; j < num; j++) {
                    var ind = indicators[j];
                    var isFind = false ;
                    var head = ind.periods ? this.getAllIndCode(p, ind) : [ind.code];
                    var len = head.length;
                    if(!(currP.year == p.year && currP.month == p.month)){
                        index += len;
                        continue;
                    }
                    for(var h=0; h<len; h++ ){
                        index++;
                        if(head[h] == idenCode){
                            isFind = true ;
                            break;
                        }
                    }
                    if(isFind){
                        break;
                    }
                }
                if(currP.year == p.year && currP.month == p.month){
                    return index ;
                }
            }
            return -1;
        },
        /**
         * 分组指标扁平化
         * @param p
         */
        getAllIndCode :function(p, r){
            var head = new Array();
            var hasPeriods = r.periods;
            var count = 0 ;
            for(var i=0,len=hasPeriods.length; i<len; i++){
                var period = hasPeriods[i];
                count =0 ;
                if(p.reportType == period.reportType ){
                    count++;
                }
                if(p.year == period.year ){
                    count++;
                }
                if(p.month == period.month){
                    count++;
                }
                if(count ==3){
                    break;
                }
            }
            //如果该时段下有此指标
            if(count ==3){
                head.push(r.idenCode);
                var subs = r.subs;
                var leng = subs.length;
                for(var j=0; j<leng; j++){
                    head = head.concat(this.getAllIndCode(p,subs[j]));
                }
            }
            return head ;
        },

        getIndicatorIndex :function(indicators, idencode){
            var index = -1;
            var leng = indicators.length;
            for(var i = 0 ; i<leng; i++){
                if(indicators[i].idenCode == idencode){
                    index = i ;
                    break ;
                }
            }
            return index;
        },
        getPeriodIndex :function(periods,period){
            var index = -1;
            var leng = periods.length;
            for(var i = 0 ; i<leng; i++){
                var count =0;
                var p = periods[i];
                if(p.reportType == period.reporttype){
                    count++;
                }
                if(p.year == period.year){
                    count++;
                }
                if(p.month == period.month){
                    count++;
                }
                if(count == 3){
                    index = i;
                    break;
                }
            }
            return index;
        },

        getContent :function(){
            return this.data ;
        },
        /**
         * 根据支持的图表类型 读取数据
         * @param support 支持的图表类型
         */
        getChartData :function(support){
            var re ={
                legendData:[],
                xAxisData:[],
                data :[]
            };
            var xField ="";
            var rit = support.tpl.split(",");//包含三维度数据类型
            if(support.x!=undefined){
                xField = support.x;
            }else{
                for(var i=0,len=rit.length; i<len; i++){
                    if(rit[i].indexOf("+")==-1){
                        continue ;
                    }
                    xField = rit[i].substring(0,1);
                    break ;
                }
            }
            re.xAxisData[0] = new Array();
//            var colnum = this.periods.length*this.indicators.length+2;//?????加入分组指标后 这么写有问题
            var colnum = this.head.length;
            var rownum = this.data.length;
            //各指标的列索引值
            var colNumArr = new Array();
            var indNum = this.indicators.length;
            var perNum = this.periods.length;
            for(var i=0; i<indNum; i++){
                for(var j=0; j<perNum; j++){
                    colNumArr.push(2 + this.getColIndex(this.periods[j], this.indicators[i].idenCode||this.indicators[i].code));
                }
            }
            //区域
            if(xField == "R"){
                var tStatus = rit[2];
                //x坐标抽 为区划名称
                for(var i =0; i<rownum ;i++){
                    re.xAxisData[0].push(this.data[i][1]);
                }
                var leng = colNumArr.length;
                for(var colInd=0; colInd<leng; colInd++){
                    for(var rowInd=0; rowInd<rownum; rowInd++){
                        if(re.data[colInd] == null){
                            re.data[colInd] = new Array();
                        }
                        re.data[colInd].push(this.data[rowInd][colNumArr[colInd]]);
                    }
                }
                //多时段
                if(tStatus.indexOf("+")!=-1){
                    for(var i=0; i < perNum; i++){
                        var p = this.periods[i];
                        var pname = "";
                        if(p.reportType == 11){
                            pname = p.year+"年";
                        }else if(p.reportType == 12){

                        }else if(p.reportType == 13){
                            pname = p.year+"年"+ p.month+"月";
                        }
                        re.legendData.push({
                            name :pname
                        });
                    }

                }else{
                    //单或者多指标
                    for(var i=0; i<indNum; i++){
                        re.legendData.push({
                            name :this.indicators[i].idenName||this.indicators[i].name
                        });
                    }
                }
            }else if(xField == "I"){//指标
                var tStatus = rit[2] ;
                //多时段
                //图例为多时段
                if(tStatus.indexOf("+")!=-1){
                    for(var i=0; i < perNum; i++){
                        var p = this.periods[i];
                        var pname = "";
                        if(p.reportType == 11){
                            pname = p.year+"年";
                        }else if(p.reportType == 12){

                        }else  if(p.reportType == 13){
                            pname = p.year+"年"+ p.month+"月";
                        }
                        re.legendData.push({
                            name :pname
                        });
                    }

                    rownum = this.periods.length ;
                    colnum = this.indicators.length ;
                    for(var rowInd = 0; rowInd < rownum; rowInd++){
                        if(re.data[rowInd] == null){
                            re.data[rowInd] = new Array();
                        }
                        var pInd= this.getPeriodIndex(this.periods, this.periods[rowInd]);
                        for(var colInd =0; colInd <colnum ;colInd++){
//                            var indInd = this.getIndicatorIndex(this.indicators,this.indicators[colInd]);
//                            var col = this.indicators.length*pInd+indInd+2;
                            var col = this.getColIndex(this.periods[rowInd],this.indicators[colInd].idenCode);
                            re.data[rowInd].push(this.data[0][col]); //单区域 所以为0
                        }
                    }
                }else{
                    //单或者多区域
                    //图例为多区域
                    for(var i =0; i < rownum; i++){
                        re.legendData.push({
                            name :this.data[i][1] //区划名称
                        });
                    }
                    //x坐标轴 指标名称
                    for(var i=0,len=colNumArr.length; i<len; i++){
                        re.xAxisData[0].push(this.head[colNumArr[i]]);
                    }
                    //数据 按区域组织成二维数组
                    for(var rowInd=0; rowInd < rownum; rowInd++){
                        if(re.data[rowInd] == null){
                            re.data[rowInd] = new Array();
                        }
                        for(var colInd=0,len=colNumArr.length; colInd<len; colInd++){
                            re.data[rowInd].push(this.data[rowInd][colNumArr[colInd]]);
                        }
                    }
                }

            }else if(xField == "T"){//多时段（报告期）
                var rStatus = rit[0];
                for(var i=0,len=this.periods.length; i<len; i++){
                    var p = this.periods[i];
                    var pname = "";
                    if(p.reportType == 11){
                        pname = p.year+"年";
                    }else if(p.reportType == 12){

                    }else  if(p.reportType == 13){
                        pname = p.year+"年"+ p.month+"月";
                    }
                    re.xAxisData[0].push(pname);
                }
                //多区域
                if(rStatus.indexOf("+")!=-1){

                    for(var rowInd =0 ;rowInd< rownum ;rowInd++){
                        if(re.data[rowInd] == null){
                            re.data[rowInd] = new Array();
                        }
                        var name = "";
                        if(this.data.length > rowInd && this.data[rowInd].length > 1){
                            name = this.data[rowInd][1];
                        }
                        //图例为区域
                        re.legendData.push({
                            name :name
                        });
                        for(var colInd=0,size=colNumArr.length; colInd<size; colInd++){
                            if(this.data.length > rowInd && this.data[rowInd].length > colNumArr[colInd]){
                                re.data[rowInd].push(this.data[rowInd][colNumArr[colInd]]);
                            }
                        }
                    }

                }else{ //单或者多指标
                    rownum = this.indicators.length ;
                    colnum = this.periods.length ;

                    //单或者多指标
                    //图例为多指标
                    for(var i=0,len=this.indicators.length; i<len; i++){
                        re.legendData.push({
                            name :this.indicators[i].idenName||this.indicators[i].name
                        });
                    }

                    /***
                     * 注意：此处取得数据为单区域的数据
                     */
                    var data = this.data;
                    if(data && data[0]){
                        //一个或者多个指标
                        for(var rowInd=0;rowInd < rownum;rowInd++){
                            if(re.data[rowInd] == null){
                                re.data[rowInd] = new Array();
                            }
                            for(var colInd=0,colLen=this.periods.length; colInd<colLen; colInd++){
                                //同一指标不同时间的
                                var index = rowInd*colLen + colInd;
                                if(data.length>0 && data[0].length > colNumArr[index]){
                                    re.data[rowInd].push(this.data[0][colNumArr[index]]);
                                }
                            }
                        }
                    }
                }
            }
            return re ;
        },
        sort:function(){
        }
    };
    return Reader;
});