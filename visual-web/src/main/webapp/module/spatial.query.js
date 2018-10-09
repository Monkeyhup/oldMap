/**
 * Created by jinn on 2015/11/16.
 */
/**
 * 模拟空间查询
 * 加载本地缓存文件
 */


/**
 * 缓存文件存放规则:
 * 1.多边形：省级以国家为单位存放；地市级、区县以省为单位存放；乡镇、村以区县为单位存放
 * 2.点   ：省、市、县 以国家为单位存放；乡镇、村以省级为单位存放
 */
define(function (require, exports, module) {
    var Compress = require("compress");

    var Tools = require("component/tools");
    var events = require("component/app.events");
    var isShowLable = true;//显示行政区划标签

    var basepath ="data/";//根目录

    var allSN = [11,12,13,14,15,21,22,23,31,32,33,34,35,36,37,41,42,43,44,45,46,50,51,52,53,54,61,62,63,64,65,71,81,82]; //全国所有省

    var allXN = []; //某个省的所有区县  省级部署时需要这个


    var map;
    /**
     * 缓存数据类型
     * @type {{polygon: number, point: number}}
     */
    var featureType = {
        "polygon":1,    //多边形
        "point":2       //点
    };


    //彩色区划图配色
    var colors = ["#E7A09E","#F8F6B8","#D0E1BC","#F4BF7F","#ACCF8E","#F9F181","#E4DBDC","#D9C3C5","#FCFBCF","#AFD48D"];

    /**
     * 获取文件路径
     * @param _level
     * @param _type  1:面  2：点
     * @param _regions
     */
    var getFilePath = function (_level,_type,_regions) {
        var paths = [];

        _level = _level + "";
        switch (_level){
            case "0":
                if(_type==2){

                }else{

                }
                break;
            case "1":
                if(_type==2){
                    paths.push(basepath+ "wd/" + "wd_p.js");   //
                }else{
                    paths.push(basepath+ "wd/" + "wd_00.js");   //国家
                }
                break;
            case "2":
                if(_type==2){
                    paths.push(basepath+ "sn/" + "sn_p.js");   //
                }else{
                    paths.push(basepath+ "sn/" + "sn_00.js");  //省
                }
                break;
            case "3":
                if(_type==2){
                    paths.push(basepath+ "sh/" + "sh_p.js");
                }else{
                    var reg = _regions[0];
                    var code = reg.getCode();
                    if(code.indexOf("##**")>=0){
                        //看全国所有地市
                        for(var i = 0,len = allSN.length;i<len;i++){
                            var a = allSN[i];
                            paths.push(basepath + "sh/sh_" + a + ".js");
                        }
                    }else{
                        code = code.substring(0,2);
                        paths.push(basepath + "sh/sh_" + code + ".js");
                    }
                }
                break;
            case "4":                   //TODO 查看非全国所有区县 而是跨省区县
                if(_type == 2){
                    paths.push(basepath+ "xn/" + "xn_p.js");
                }else{
                    var reg = _regions[0];
                    var code = reg.getCode();
                    if(code.indexOf("##****")>=0){
                        // 看全国所有区县
                        for(var i = 0,len = allSN.length;i<len;i++){
                            var a = allSN[i];
                            paths.push(basepath + "xn/xn_" + a + ".js");
                        }
                    }else{
                        code = code.substring(0,2);
                        paths.push(basepath + "xn/xn_" + code + ".js");
                    }
                }
                break;
            case "5":                            //乡镇
                var reg = _regions[0];
                var code = reg.getCode();
                if (_type == 2) {
                    code = code.substr(0, 2);
                    paths.push(basepath + "xa/xa_p_" + code + ".js");
                } else {
                    code = code.substr(0, 2);
                    paths.push(basepath + "xa/xa_" + code + ".js");
                }
                break;
            case "6":                            //村
                var reg = _regions[0];
                var code = reg.getCode();
                if (_type == 2) {
                    code = code.substr(0, 2);
                    paths.push(basepath + "cn/cn_p_" + code + ".js");
                } else {
                    code = code.substr(0, 2);
                    paths.push(basepath + "cn/cn_" + code + ".js");
                }
                break;
        }

        return paths;
    };

    /**
     * 从文件路径中获取文件名
     * @param _path
     * @returns {string}
     */
    var getNameFromPath = function (_path) {
        var startIndex = _path.lastIndexOf("/");
        var endIndex = _path.indexOf(".js");

        return _path.substring(startIndex+1,endIndex);
    };

    /**
     * feature过滤
     * @param regions
     * @param result
     * @returns {Array}
     */
    var filterFeatures = function (regions, result) {
        var re = [];
        try{
            if (result) {
                for(var i = 0,len = result.length;i<len;i++){
                    var feature = result[i];
                    var code = feature.data["QH_CODE"];
                    var name = feature.data["QH_NAME"];

                    for(var j = 0,ll = regions.length;j<ll;j++){
                        var rg = regions[j];
                        var rgcode = rg.getCode();
                        if(rgcode.indexOf("##")<0 ){
                            if(rgcode==code){
                                re.push(feature);
                                continue;
                            }
                        }else{
                            var ind = rgcode.indexOf("##");
                            //判断是否是直辖市
                            if(SGIS.Region.isMunicipality(rgcode)){
                                var _level = regions[0].getLevel();

                                if( (_level < 5 && rgcode.substr(0,2)==code.substr(0,2) && rgcode.substring(ind+2) == code.substring(ind+2)) ||
                                    rgcode.substring(0,ind) == code.substring(0,ind)   ){
                                    re.push(feature);
                                    continue;
                                }
                            }else{
                                var subrgcode = rgcode.substring(0,ind);
                                code = code.substring(0,ind);
                                if(code == subrgcode){
                                    re.push(feature);
                                    continue;
                                }
                            }
                        }
                    }
                }
            }
        }catch(e) {

        }finally {
            if(re.length==0)return result
            else return re;
        }


    };


    /**
     * 解码json文件
     * @param obj
     * @returns {*}
     */
    var decodeJson = function (obj) {
         if(!obj.encode || obj.encode=="done"){  //无需解码
            return obj;
         }
         var feas = obj.features;
         for(var i = 0,len = feas.length;i<len;i++){
            var fea = feas[i];
            fea.fieldNames = obj.fields;
            fea.geometry.center = arrToObj(fea.geometry.center,obj.sys) ;

            for(var j = 0,ll = fea.geometry.points.length;j<ll;j++){
                fea.geometry.points[j] = arrToObj(fea.geometry.points[j],obj.sys);
            }
        }
        obj.encode = "done";
        obj.sys = "done";
        return obj;

        //样例数据格式：
        //{
        //    "fields" : ["QH_NAME", "QH_CODE"],
        //    "features" : [{
        //    "ID" : 5,
        //    "fieldValues" : ["北京市", "110000000000"],
        //    "geometry" : {
        //        "id" : 5,
        //        "center" : [4903220.188294357, 12984711.670249164],
        //        "parts" : [1],
        //        "points" : [[4810283.95061394, 13003495.210187115]],
        //        "type" : "REGION"
        //    }
        //}
        //]
        //}
    };
    
    var arrToObj = function (arr,sys) {
        var y = arr[0];
        var x = arr[1];

        if(sys===true){
             y = sysConvert(y);
             x = sysConvert(x);
        }
        return {"y":y,"x":x};
    };

    /**
     * 36进制转10进制
     * @param num
     * @returns {*}
     */
    var sysConvert = function (num) {
        var dotIndex = (num + "").indexOf(".");
        var leftN = num, rightN = 0;
        if (dotIndex > 0) {
            leftN = (num + "").substring(0, dotIndex);
            rightN = (num + "").substring(dotIndex + 1);

            leftN =  parseInt(leftN, 36);
            rightN = parseInt(rightN, 36);

            num = leftN + "." + rightN;
        } else {
            num = parseInt(leftN, 36);
        }
        return num;
    }

    /**
     * 查询地图feature要素
     * @param _regions
     * @param _type 边界图层1,行政标签2
     * @param callback
     * @param hl 是否是高亮边界
     */
    var queryRegionFeature = function (_regions,_type,callback,hl) {
        var level = 0;
        if (_regions.length == 1) {
            var region = _regions[0];
            var code = region.getCode();
            var lv = region.getLevel();
            if(code.indexOf("##")>=0){
                level = lv;
            }else {
                level = lv+1;  //单个行政区划 级别向下一级
            }
        } else if (_regions.length> 1) {
            var region = _regions[0];
            var code = region.getCode();
            level = region.getLevel();
        }

        if(hl){ //高亮边界 需要的是上一级别
            level --;
        }


        var filePath = getFilePath(level,_type,_regions);
        var fileNames = [];
        for(var i= 0,len = filePath.length;i<len;i++){
            var tempName = getNameFromPath(filePath[i]);
            fileNames.push(tempName);
        }

        var temp = window[fileNames[0]];

        if(!temp){
            Tools.load(filePath).done(function () {
                var feas = [];
                $.map(fileNames,function(name,i){
                    var win_data = window[name];//JS文件名为变量名的JSON对象
                    if(win_data) {
                        var obj;
                        if(win_data.encode){
                            obj = decodeJson(win_data);
                        }else if(win_data.UTF8Encoding === true){
                            obj = Compress.decode(win_data);
                            obj = Compress.toSMjson(obj,true);
                        }
                        else if(win_data.recordsets){
                            obj = win_data.recordsets[0];
                        }else{
                            obj = win_data;
                        }

                        var fea = SuperMap.REST.Recordset.fromJson(obj).features;//读取专题面
                        feas = feas.concat(fea);//合并数组
                    }else{
                        console.log("专题【"+name+"】JS文件加载失败，请检查文件配置");
                    }
                });
                callback&&callback(feas);
            });
        }else{
            var feas = [];
            $.map(fileNames,function(name,i){
                var win_data = window[name];//JS文件名为变量名的JSON对象
                if(win_data) {
                    var obj;
                    if(win_data.encode){
                        obj = decodeJson(win_data);
                    }else if(win_data.issm === true){
                        obj = win_data;
                    }
                    else if(win_data.UTF8Encoding !== undefined){
                        obj = win_data;
                    }
                    else if(win_data.recordsets){
                        obj = win_data.recordsets[0];
                    }else{
                        obj = win_data;
                    }
                    var fea = SuperMap.REST.Recordset.fromJson(obj).features;//读取专题面
                    feas = feas.concat(fea);//合并数组
                }else{
                    console.log("专题【"+name+"】JS文件加载失败，请检查文件配置");
                }
            });
            callback&&callback(feas);
        }
    };




    /**
     * 显示行政区划边界
     * @param result 地区feature,当前区域region,boolean
     *
     */
    var renderBoundary = function(result,_region,hl){
        if(!map){
            seajs.use("layer", function (ly) {
                map = ly.getMap();
            });
        }

        var boundaryLayer  = null;
        if(hl){
            boundaryLayer = map.getLayersByName("hl")[0];
        }else{
            boundaryLayer = map.getLayersByName("bline")[0];
        }
        if(!boundaryLayer){
            return;
        }


        var style = {
            fillColor:"#01ACE2",//灰色   //TODO 搞到配置文件里去  000000  #01ACE2
            fillOpacity:1,
            strokeColor:"#FFFFFF",
            strokeOpacity:1,
            strokeWidth:1,
            fill:true,
            //toggle:true, //单击可以取消选中
            //label:"呵呵",
            pointRadius: 2
        };

        //高亮边界样式
        var hlStyle = {
            fillOpacity:1,
            strokeColor:"#FF0000",  //边界颜色 红色
            strokeOpacity:1,
            strokeWidth:1,
            fill:false,
            pointRadius: 2
        };

        var selectStyle = style;

        if (result) {
            var geometries = [];
            var pointResults = [];

            var selfeatures = [];
            if(result.features){//空间对象（数组）
                selfeatures = result.features;
            }else if(result.recordsets){//记录集（空间对象）
                for(var i= 0,size=result.recordsets.length; i<size; i++){
                    selfeatures = selfeatures.concat(result.recordsets[i].features);//合并每个图层的查询结果集
                }
            }else{
                selfeatures = result;
            }
            for (var i = 0, size = selfeatures.length; i < size; i++) {
                var _i = i;
                while (_i>9){
                   _i = _i-9;
                }

                var fillColor = colors[_i];

                var _style = {
                    fillColor:fillColor,
                    fillOpacity:boundaryLayer.showcolor?1:0,
                    stroke:!boundaryLayer.showcolor,   //是否显示边界
                    strokeColor:"#FFFFFF",     //边界白色
                    strokeOpacity:1,
                    strokeWidth:1,
                    fill:true   ,//boundaryLayer.showcolor?true:false,   //不填充 不响应事件
                    pointRadius: 1
                };

                if(hl){
                    selfeatures[i].style = hlStyle;//高亮样式
                    selfeatures[i].selectStyle = hlStyle;
                }else{
                    selfeatures[i].style = _style;
                    selfeatures[i].selectStyle = selectStyle;
                }


                //集成缩放到的geometry
                var geo = selfeatures[i].geometry;
                //var data= selfeatures[i].data;
                geometries.push(geo);

                //集成点集数据
                //var cenGeo = geo.getCentroid();
                //var pf = new SuperMap.Feature.Vector(cenGeo,data,null);
                //pointResults.push(pf);                                 //从面图层中获取点集
            }

            var addedFeatures = boundaryLayer.features;
            boundaryLayer.removeFeatures(addedFeatures);
            boundaryLayer.addFeatures(selfeatures);
            //boundaryLayer.addFeatures(addedFeatures);
            if(!hl){
                //缩放到
                var collection = new SuperMap.Geometry.Collection(geometries);
                collection.calculateBounds();
                map.zoomToExtent(collection.bounds);
                //添加区划标签  TODO 区县级别 用面集中获取的点集 不再查询
                queryRegionFeature(_region,2, function (_feas) {
                    var filFeas = filterFeatures(_region,_feas);
                    renderLabelLayer(filFeas);
                });

                if(SGIS.agent=="iclient"){
                    map.zoomIn();//地图放大
                }


            }





        }
    };

    /**
     * 渲染标签图层
     * @param result array 存放各个地区信息
     */
    var renderLabelLayer = function (result) {
        if(!map){
            seajs.use("layer", function (ly) {
                map = ly.getMap();
            });
        }

        var labelLayer = map.getLayersByName("lbregion")[0];
        labelLayer.clearMarkers();
        if (result) {
            var selfeatures = [];
            if(result.features){//空间对象（数组）undifind
                selfeatures = result.features;
            }else if(result.recordsets){//记录集（空间对象） undifind
                for(var i= 0,size=result.recordsets.length; i<size; i++){
                    selfeatures = selfeatures.concat(result.recordsets[i].features);//合并每个图层的查询结果集
                }
            }else{
                selfeatures = result;
            }

            var len = selfeatures.length ;
            for(var i = 0 ; i < len  ; i++){
                var feature = selfeatures[i];
                var code = feature.data["QH_CODE"];  //行政区划码
                var name = feature.data["QH_NAME"];  //行政区划名
                var level = SGIS.Region.recognitionLevel(code);  //行政区划等级
                var name =level==2?(/内蒙古|黑龙江/g.test(name)?  name.substr(0, 3) : name.substr(0, 2)): name;
                var smx = feature.geometry.x;
                var smy = feature.geometry.y;
                var size = new SuperMap.Size(20, 20),
                    offset = new SuperMap.Pixel(-(size.w / 2), -size.h),
                    icon = new SuperMap.Icon("assets/image/red_marker.png", size, offset);
                var marker = new SuperMap.Marker(new SuperMap.LonLat(smx, smy), icon);
                marker.id = code;

                //扩展marker内容
                var tileNode = document.createElement("div");
                var fontsize = 10   ;//  level>2?5:10;                            //#fff3a1                                    //#000000
                tileNode.innerHTML = "<div class='reglab' code='"+code+"' style='text-shadow:none !important;width: 100px;color: rgb(0,0,0); ;font-size: "+fontsize+"px'>"+name+"</div>";
                icon.imageDiv.style.width = "auto";
                icon.imageDiv.appendChild(tileNode);                      //font-weight: bold; #  7F8C8D
                labelLayer.addMarker(marker);
                $(labelLayer.div).find("img[id*=_innerImage]").css("display","none");// .addClass("hide");

                labelLayer.setVisibility(isShowLable);
            }
        }
        
        //$("div.reglab").unbind();
        //$("div.reglab").click(function () {
        //    var code = $(this).attr("code");
        //    var name = $(this).text();
        //    var _region = new SGIS.Region(code,name);
        //    events.trigger("region.dbclick",_region);
        //});
        //
        //var domLab = $("div.reglab").get(0);
        //domLab.addEventListener('touchend', function(event) {
        //
        //    alert(event.target)
        //
        //    // 如果这个元素的位置内只有一个手指的话
        //    if (event.targetTouches.length == 1) {
        //        event.preventDefault();// 阻止浏览器默认事件，重要
        //
        //        alert(event.target);
        //    }
        //}, false);


    };

    /**
     * 隐藏标签图层
     */
    var hideLabelLayer = function () {
        var labelLayer = map.getLayersByName("lbregion")[0];
        if(labelLayer){
            labelLayer.setVisibility(false);
        }
    }

    /**
     * 显示标签图层
     */
    var showLabelLayer = function () {
        var labelLayer = map.getLayersByName("lbregion")[0];
        if(labelLayer){
            labelLayer.setVisibility(true);
        }
    }


    return{
        getFilePath:getFilePath,
        getNameFromPath:getNameFromPath,
        filterFeatures:filterFeatures,
        renderBoundary:renderBoundary,
        renderLabelLayer:renderLabelLayer,
        hideLabelLayer:hideLabelLayer,
        showLabelLayer:showLabelLayer,
        queryRegionFeature:queryRegionFeature,
        getIsShowLabel: function () {
            return isShowLable;
        },
        setIsShowLable: function (sl) {
            isShowLable = sl;
        }
    }

});
