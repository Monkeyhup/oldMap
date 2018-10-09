/**
 * Created by chenpeng on 16/1/7.
 */
define(function(require, exports, module){
    //var data = require("layer.comparison");

    var DataAxis = [];
    var IndexAxis = [];
    var LegendData =[];
    var PieData = [];
    var BarDate = [];

    var init = function () {
        $("#enlarge").Drag();
    };

    (function () {
        init();
    })();

   var drawSVG = function(Data){
       if(!Data) {
           return ;
       }

       $("#enlarge").find(".item.close").click(function () {
           $("#enlarge").addClass("hide");
       });
       IndexAxis.length = 0;
       DataAxis.length = 0;
       PieData.length = 0;
       BarDate.length = 0;
       LegendData.length = 0;
       $("#enlarge-title").text(Data.split(";")[2] +"("+ Data.split(";")[0]+")");
       //放大功能 div id = enlarge-svg
       var Svg = echarts.init(document.getElementById('enlarge-svg'));
       for(var i=0; i < (Data.split(";").length - 3)/2;i++){
           var temp = [];
           IndexAxis.push(Data.split(";")[i*2+3]);
           DataAxis.push(Data.split(";")[i*2+4]);
           PieData.push({value:Data.split(";")[i*2+4], name:Data.split(";")[i*2+3]});
           temp.push(Data.split(";")[i*2+4]);
           BarDate.push({name:Data.split(";")[i*2+3],type:'bar',data:temp});
       }
       LegendData.push(Data.split(";")[0]);
       var option;

       switch(Data.split(";")[1]){
           case "pie":
               //饼图
               option = {
                   tooltip : {
                       trigger: 'item',
                       formatter: "{a} <br/>{b} : {c} ({d}%)"
                   },
                   legend: {
                       data:IndexAxis
                   },
                   series : [
                       {
                           name:Data.split(";")[0],
                           type:'pie',
                           radius : '55%',
                           center: ['50%', '60%'],
                           data:PieData
                       }
                   ]
               };
               break;
           case "bar":
               //柱图
               option = {
                   tooltip : {
                       trigger: 'item'
                   },
                   legend: {
                       data:IndexAxis
                   },
                   xAxis : [
                       {
                           type : 'category',
                           data : LegendData
                       }
                   ],
                   yAxis : [
                       {
                           type : 'value'
                       }
                   ],
                   series : BarDate
               };
               break;
       }
        Svg.setOption(option);

    }

    return{
        drawSVG:drawSVG
    }
})