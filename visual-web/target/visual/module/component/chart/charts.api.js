/**
 * Created by W.Qiong on 14-4-28.
 * 图表通用接口
 */
/*
titleText String
data  二维数组
legendData  一维数组
xAxisData 二维数组
type  初始的渲染类型  数组
chart = new Chart("chart-container",titleText,data,legendData,xAxisData,type,null);
cahrt.render();
 */
define("component/chart/charts.api",function (require, exports, module){
    //各种图表默认的参数
    var config = {
        // 图表类型
        CHART_TYPE_LINE: 'line',
        CHART_TYPE_BAR: 'bar',
        CHART_TYPE_SCATTER: 'scatter',
        CHART_TYPE_PIE: 'pie',
        CHART_TYPE_RADAR: 'radar',
        CHART_TYPE_MAP: 'map',
        CHART_TYPE_K: 'k',
        CHART_TYPE_ISLAND: 'island',
        CHART_TYPE_FORCE : 'force',
        CHART_TYPE_CHORD : 'chord',

        //公用的配置
        common:{
            title:{
                text: "",
                x:"center",
                y:"top"
            },
            legend:{
                x:"center",
                y:"bottom",
                data:[]
            },
            animation:false
        },

        //各项非公用的配置
        bar:{
            grid:{
               x:'5px'
            },
            tooltip : {
                trigger: 'axis'
            },
            xAxis : [
                {
                    type : 'category',
                    boundaryGap:true,
                    data : []
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    name : '',
                    axisLabel : {
                        show:false,
                        formatter: "{value}"
                    },
                    axisLine:{
                      show:true
                    },
                    splitLine : {show : false}
                }
            ],
            series:[
                {
                    name :"",
                    type:"",
                    xAxisIndex:0,
                    yAxisIndex:0,
                    data:[]
                }
            ]
        },
        line :{
            tooltip : {
                trigger: 'axis'
            },
            xAxis : [
                {
                    type : 'category',
                    boundaryGap:true,
                    data : [],
                    splitLine:{show : false}
                }

            ],
            yAxis : [
                {
                    type : 'value',
                    name : '',
                    axisLabel : {
                        formatter: '{value}'
                    },
                    splitLine:{show : false}
                }
            ]
        },
        pie:{
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            }
        },
        scatter:{
            tooltip : {
                trigger: 'item',
                formatter : function(value) {
                    if (value[2].length > 1) {
                        return value[0] + ' :<br/>'
                            + value[2][0] + 'cm '
                            + value[2][1] + 'kg ';
                    }
                    else {
                        return value[0] + ' :<br/>'
                            + value[1] + ' : '
                            + value[2] + 'kg ';
                    }
                }
            },
            xAxis : [
                {
                    type : 'value',
                    power: 1,
                    precision: 2,
                    scale:true,
                    axisLabel : {
                        formatter: '{value} cm'
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    power: 1,
                    precision: 2,
                    scale:true,
                    axisLabel : {
                        formatter: '{value} kg'
                    },
                    splitArea : {show : true}
                }
            ]
        }
    };
    //chart.config里没有type信息 先放这
    var  typeConfig ={
        //bar
        bar:"bar",
        stack:"bar",
        //line
        line:"line",
        "h-line":"line",
        "area":"line",
        //pie
        "pie":"pie",
        "loop":"pie"
    };

    /**
     * 统计图对象
     * @param container 所在元素ID
     * @param title 标题
     * @param data 二位数组
     * @param legendData 图例数据
     * @param xAxisData
     * @param selfOption
     * */
    var Chart = function(container,title,data,legendData,xAxisData,selfOption){
        this.parent = $("#"+container)||$(document.body);//统计图所在容器
        this.title = title||"" ;
        this.data = data||[];//二维数组
        this.legendData = legendData ||[];
        this.xAxisData = xAxisData||[] ;

        this.chartType = [];
        this._chartId= null;
        this._mychart = null ;
        this._option ={} ;
        this.style = null ;

        this.shapeList = [];

        this.selfOption = selfOption!=null?selfOption:{};
        this.createOption();
   };
   Chart.prototype = {

       _getCharID :function(){
           var num = this.parent.find(".charts").length;
           var h = this.parent.height()+"px";
           var w = this.parent.width()+"px";
           var id = "chart-body-"+(num+"") ;
           $("<div>",{
               id: id,
               class:"charts",
               height:h,
               width : w
           }).appendTo(this.parent);
          this._chartId = id ;
          return id ;
       },
       /**
        * 设置样式
        * @param style 数组
        */
       setItemStyle :function(style){
           if(this._option == null){
               this.createOption();
           }
           for(var i= 0,_size=this._option.series.length ; i<_size ;i++){
               if(i <style.length){
                   this._option.series[i].itemStyle = style[i];
               }
           }
       },
       /**
        * 标题设置
        * @param title
        */
       setTitle :function(title){
           this._option.title = title ;
           this._mychart&&this.render();

       },
       hideTitle :function(){
           delete  this._option.title ;
           this.refresh() ;
       },
       showTitle : function(){
           this._option.title ={
               text:this.title
           };
           this.refresh();
       },
       /**
        * 图例操作
        */
       hideLegend :function(){
           if(this._mychart){
               this._option.legend.data =[];
               this.refresh();
           }
       },
       showLegend :function(){
           if(this._mychart){
               this._option.legend.data=this.legendData;
               this.refresh();
           }
       },
       setLegendStyle :function(legend){
           if(this._mychart){
               if(legend.data==undefined||legend.data.length==0){
                   legend.data  = this.legendData;
               }
               var tempL = $.extend(this._option.legend,legend);
               this._option.legend=tempL;
               this.refresh();
           }
       },
       /**
        * xAxis操作
        */
       hideXAxis :function(){
            this._showOrHideXAxis(false);
       },
       showXAxis :function(){
           this._showOrHideXAxis(true);
       },
       _showOrHideXAxis :function(isShow){
           if(this._mychart){
               var hasXAxis = false ;
               for(var i=0,len=this.chartType.length; i<len; i++){
                   if(this.chartType[i]==config.CHART_TYPE_BAR || this.chartType[i]==config.CHART_TYPE_LINE){
                       hasXAxis = true ;
                       break;
                   }
               }
               if(hasXAxis){
                   var xAxis = this._option.xAxis;
                   for(var i=0,len=xAxis.length; i<len; i++){
//                        xAxis[i].axisLine = {show:false };
                       xAxis[i].axisLabel = {show:isShow } ;
                       xAxis[i].splitLine = {show:isShow } ;
                       xAxis[i].axisTick = {show:isShow } ;
                   }
                   this.refresh();
               }
           }
        },
       /**
        *重新加载数据
        * @param data
        */
       setData :function(data){
           this.data = data ;
           this._mychart&&this.render();
       },
       /**
        * 支持自己设置option,支持原始的，与已有的参数做个合并
        * @param option
        */
       setOption :function(option){
            this.option = option ;
           this._mychart&&this.render();
       },
       refresh:function(){
           this._mychart && this._mychart.setOption(this._option,true);
       },
       /**
        * 数据排序
        */
       sort :function(){
           if(this._mychart){
               var leng = this._option.series.length;
               for(var index=0; index<leng; index++){
                   var array = this._option.series[index].data ;
                   var xAxisData = this._option.xAxis[0].data;
                   var i = 0, len = array.length, j, d, xData;
                   for(; i<len; i++){
                       for(j=0; j<len; j++){
                           if(array[i] > array[j]){
                               d = array[j];
                               array[j] = array[i];
                               array[i] = d;

                             //xAxixData 也要跟这排序
                               xData = xAxisData[j];
                               xAxisData[j] = xAxisData[i];
                               xAxisData[j] = xData;
                           }
                       }
                   }
                   this._option.xAxis[0].data = xAxisData ;
                   this._option.series[index].data = array ;
               }
               this.refresh();
           }
       },
       /**
        * 渲染出图表
        */
       render :function(){
           if(this._option == null){
               this.createOption();
           }
           if( this._chartId!=null){
               this._mychart = echarts.init(document.getElementById(this._chartId));
           }else{
               this._mychart = echarts.init(document.getElementById(this._getCharID()));
           }
//           console.log(JSON.stringify(this._option));
           this._mychart.setOption(this._option);
       },
       /**
        * 通过option模板 进行渲染
        * @param cfg
        */
       renderByCfg:function(cfg){
//           console.log(JSON.stringify(cfg));
           var seriesTpl = cfg.seriesTpl ;
           var id=cfg.id?cfg.id:"bar";
           var type = typeConfig[id] ;

           var option = $.extend(true,{},cfg);
           //可以定义一些公共配置 比如title的位置
           option = $.extend(true,option,this.selfOption);
           if(option.xAxis&&option.xAxis[0].type =="category"){
               option.xAxis[0].data = this.xAxisData[0];
           }
           if(option.yAxis&&option.yAxis[0].type == "category"){
               option.yAxis[0].data = this.xAxisData[0];
           }

           if(type==config.CHART_TYPE_LINE){
               option.yAxis[0].splitLine ={show : false};
               option.xAxis[0].splitLine ={show : false};

               if(id.indexOf("h")!=-1){                    //横向折线图
                   option.yAxis[0].splitArea ={show : true};
                   option.xAxis[0].splitArea ={show : false};
               }else{
                   option.yAxis[0].splitArea ={show : false};
                   option.xAxis[0].splitArea ={show : true};
               }


           }


           var series = [];
           var legend = [];
           var leng = this.data.length;
           for(var index = 0; index < leng; index++){
               var oneseries ={
                   name:"",
                   type:""
               };
               var name = this.legendData[index].name;
               oneseries = seriesTpl!=null? $.extend(true,oneseries,seriesTpl):oneseries;
               oneseries.type = type ;
               this.chartType.push(type);
               legend.push(name);
               oneseries.name = name ;

               if(type == config.CHART_TYPE_PIE){
                   legend = this.xAxisData[0];
                   oneseries.data = this.handlePieData(this.data[index]);

               }else if(type ==  config.CHART_TYPE_SCATTER){

               }else{
                   oneseries.data = this.data[index];
               }
               series.push(oneseries);
           }
           option.legend.data = legend;
           option.series = series ;
           if(legend.length >10 && type != config.CHART_TYPE_PIE){
               option.grid ={
                   y2:80
               };
           }
           this._option =option;
//           console.log(JSON.stringify(this._option));
           if( this._chartId!=null){
               this._mychart = echarts.init(document.getElementById(this._chartId));
           }else{
               this._mychart = echarts.init(document.getElementById(this._getCharID()));
           }
           this._mychart.setOption(this._option);
       },
       /**
        * 初始化构造出option
        * @param typeArr
        */
       createOption :function(typeArr){
           var option = $.extend(true,{},config.common);
           option = $.extend(true,option,this.selfOption);
           option.title.text = this.title;

//           console.log(JSON.stringify(option));
           var  legend = [];

           if(typeArr!=null){
               this.chartType = typeArr ;
           }
           if(this.chartType == null){
               this.chartType = [];
           }
           var series = [];
           var leng = this.data.length;
           for(var index = 0; index < leng; index++){
               var type =config.CHART_TYPE_BAR;//默认是柱状图
               if(index >= this.legendData.length){
                   continue ;
               }
               legend.push(this.legendData[index].name);
               var oneseries = $.extend(true,{},this.legendData[index]);
               type = oneseries.type!=undefined&&oneseries.type!=""?oneseries.type:type;
               this.chartType.push(type);
               oneseries.type = type ;
                if(type == config.CHART_TYPE_BAR){//柱状图
                    if(!option.xAxis){
                        option = $.extend(true,option,$.extend(true,config.bar,option));
                        option.xAxis[0].data = this.xAxisData[0] ;
                    }
                    oneseries.data = this.data[index];

                }else if(type == config.CHART_TYPE_LINE){//折线图
                    if(!option.xAxis){
                        option = $.extend(true,option,$.extend(true,config.line,option));
                        option.xAxis[0].data = this.xAxisData[0] ;
                    }
                    oneseries.data = this.data[index];

                }else if(type ==  config.CHART_TYPE_PIE){//饼状图
                    option = $.extend(true,option,$.extend(true,config.pie,option));
                    legend = this.xAxisData[0];//饼图的图例由数据决定的
                    oneseries.data = this.handlePieData(this.data[index]);
                    oneseries.center =['50%','50%'];
                    oneseries.radius = ['0','65%'];

                }else if(type ==  config.CHART_TYPE_SCATTER){//聚散图
                    if(!option.xAxis){
                        option = $.extend(true,option,$.extend(true,config.scatter,option));
                        option.xAxis[0].data = this.xAxisData[0] ;
                    }
                }
               series.push(oneseries);
           }
           option.legend.data = legend;
           option.series = series ;
           this._option =option;

       },
       /**
        *多种图表类型间切换 重构option  保留之前的设置 只在图表类别做修改
        * @param type 数组
        */
       refreshByChartType :function(type){
            if(this._mychart !=null ){
                var len = this._option.series.length ;
                for(var i =0 ; i< len ;i++){
                    if(i< type.length){
                        this._option.series[i].type = type[i];
                    }else{
                        //默认bar
                        this._option.series[i].type = config.CHART_TYPE_BAR;
                    }
                }
                this.refresh();
            }
       },
       /**
        * 将数组转化为饼图的json数据
        * @param d
        */
       handlePieData :function(d){
           if(!this.xAxisData||this.xAxisData[0].length <1){
               return [];
           }
           var re =[];
           for(var index = 0,_size = d.length; index <_size; index++){
                var o ={};
                if(this.xAxisData[0].length >index){
                    o.name = this.xAxisData[0][index];
                    o.value = d[index];
                    re.push(o);
                }
           }
           return re ;
       },

       /**
        * 折线图 相关设置
        */
       lines:function(){
           this.chartType = [];
           for(var i=0,len=this.data.length; i < len; i++){
               this.chartType.push(config.CHART_TYPE_LINE);
           }
           this.refreshByChartType(this.chartType);
       },

       /**
        * 柱状图 相关设置
        */
       bars:function(){
           this.chartType = [];
           for(var i=0,len=this.data.length; i < len; i++){
               this.chartType.push(config.CHART_TYPE_BAR);
           }
           this.refreshByChartType(this.chartType);
       },
       setBarWidth:function(width){
           if(this._mychart){
               var ava = Math.floor((this.parent.width()-150)/this._option.xAxis[0].data.length);
               if(width > ava){
                   width = ava;
               }
           }
           for(var i=0,len=this.chartType.length; i<len;i++){
               if(this.chartType[i] == config.CHART_TYPE_BAR){
                   this._option.series[i].barWidth = width;
               }
           }
           this.refresh();
       },

       /**
        * 饼图相关设置
        */
       pie:function(){
           this.chartType = [];
           for(var i=0,len=this.data.length; i < len; i++){
               this.chartType.push(config.CHART_TYPE_PIE);
           }
           this.refreshByChartType(this.chartType);
       },

       /**
        * 散点图 相关设置
        */
       scatter:function(){
           this.chartType = [];
           for(var i=0,len=this.data.length; i < len; i++){
               this.chartType.push(config.CHART_TYPE_SCATTER);
           }
           this.refreshByChartType(this.chartType);
       },

       /**
        * 事件绑定
        * @param callback
        */
       onclick :function(callback){
           if(this._mychart!=null){
               var that = this ;
               this._mychart.on("click",function(m){
                    //m.seriesIndex m.dataIndex m.value
                    var zr = that._mychart.chart.island.zr;
                    zr.delShape("hover");

                    callback&&callback(m);
               })
           }
       },
       onHover :function(callback){
           if(this._mychart!=null){
               var that = this ;
               this._mychart.on("hover",function(m){
                   var zr = that._mychart.chart.island.zr;
                   zr.delShape("hover");

                   zr.delShape("hover_text");

                   callback&&callback(m);
               });
           }
       },
       // 三视图 随着地图或者表格联动 只支持柱图
       selectOne :function(idx,style){
          if(this._mychart){
              var zr = this._mychart.getZrender();// this._mychart.chart.island.zr;
              var shapeList = this._mychart.chart.bar.shapeList ;
              var shape = shapeList[idx];
              zr.delShape("hover");
              zr.delShape("hover_text");

              zr.refresh();
              var w  = shape.style.width ;
              var h = shape.style.height;
              w = w<2? 2:w;//数据量大的时候宽度加倍

              var style = {
                  x : shape.style.x,
                  y : shape.style.y,
                  width : w,
                  height: shape.style.height,
                  radius: shape.style.radius,
                  brushType : 'both',
                  color : style!=null?style.color:"#FF0000",
                  strokeColor : style!=null?style.strokeColor:"#FF0000",
                  lineWidth : shape.style.lineWidth
              };
              var shapeRect = new Rectangle({
                  id : "hover",
                  style : style,
                  draggable : false
              });
              zr.addShape(shapeRect);

              //把地区名字也加上
              var zh = zr.getHeight();
              var data = shape._echartsData;
              var regName = data._name;
              var value = data._data;
              var txt = regName+ ":" + value;
              var shapeText = new TextShape({
                  id:"hover_text",
                  style:{
                      x :w*idx,
                      y :zh-h,
                      brushType : 'fill',
                      color : "#fff",
                      shadowColor : 'black',
                      shadowBlur : 5,
                      lineWidth : 1,
                      text : txt,
                      textFont : 'normal 10px verdana',
                      textAlign : 'left',
                      textBaseline : 'top'
                  },
                  draggable:false
              });
              //zr.addShape(shapeText);

              zr.refresh();
          }
      },
       /**
        * 扩展  添加背景文字等
        */
      addBackgroundText :function(style){
           var zr = this._mychart.getZrender();
           var w = zr.getWidth();
           var h = zr.getHeight();

           var textShape = new TextShape({
               id:zr.getId() + "_shape",
               style:
                   $.extend(true,{
                       x : w / 2+15,
                       y :h/2-30,
                       brushType : 'fill',
                       color : "#fff",
                       shadowColor : 'black',
                       shadowBlur : 10,
                       lineWidth : 1,
                       text : "",
                       textFont : 'normal 20px verdana',
                       textAlign : 'center',
                       textBaseline : 'top'
                   },style)
           });
           zr.addShape(textShape);
           zr.refresh();
       },
      showMarkLine :function(data){
          var len = this._option.series.length ;
          for(var i =0 ;i <len ;i++){
              this._option.series[i].markLine ={};
              this._option.series[i].markLine.data = data;
          }
          this.refresh();

      },
      hideMarkLine :function(data){
          var len = this._option.series.length ;
          for(var i =0 ;i <len ;i++){
              delete this._option.series[i].markLine;
          }
          this.refresh();
      },
      showMarkPoint :function(data){
          var len = this._option.series.length ;
          for(var i =0 ;i <len ;i++){
              this._option.series[i].markPoint ={};
              this._option.series[i].markPoint.data = data;
          }
          this.refresh();
      },
      hideMarkPoint:function(data){
          var len = this._option.series.length ;
          for(var i =0 ;i <len ;i++){
              delete  this._option.series[i].markPoint ;
          }
          this.refresh();
      },
      showDataZoom :function(dataZoom){
          this.showLegend();
          if(this._mychart !=null ){
              this._option.dataZoom = dataZoom ;
          }
          this.refresh();

      },
      hideDataZoom :function(){
          if(this._mychart !=null ){
              delete this._option.dataZoom  ;
          }
          this.refresh();

      },
       /**
        *销毁
      */
      dispose :function(){
           try{
               this._mychart!=null&&this._mychart.dispose();
           }catch(e){
              console.log(e);
           }
           this.parent.html("");
      }
   };

    return  Chart;

});