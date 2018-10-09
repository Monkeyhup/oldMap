
/**
 * Created by Augustine on 8/12/2014.
 * 通用脚本库
 */

define(function(require,exports,module){
    var impStatus ={
        imp:"已导入",
        unImp:"未导入"
    };

    var Data = (function(){
        /**
         * 将后台拿到的数据转成grid数据
         * @param re
         * @param id 行id字段
         * @param fields  筛选的字段
         * @param isRownum 是否显示序列号
         * @param status 是否将status字段转换为导入、未导入信息 用于调查对象和综合表
         */
        var jsonToGridData = function(re,id,fields,isRownum,status){
            var gridData = [];
            if(!re){ return gridData ;}
            for(var i =0 ,_size =re.length ; i< _size ;i++){
                var json = {
                    id:"",
                    data:[]
                };
//                json.id = re[i][id];
                json.id= find(id,re[i]);
                if(!json.id){
                    continue ;
                }
                isRownum&&json.data.push(i+1) ;
                for(var j =0 ;j < fields.length ;j++){
                    var val = find(fields[j],re[i]);
                    json.data.push(val);
                }
                var isMicro = false ;
                re[i].mitmid&&(isMicro=true);
                re[i].matmid&&(isMicro=false);
                var str = isMicro?(re[i].status>1?impStatus.imp:impStatus.unImp):
                    (re[i].macmetaType=='表'?(re[i].status>1?impStatus.imp:impStatus.unImp):"");
                status&&json.data.push(str);
                gridData.push(json);
            }

            //逐层级去寻找数据 key中间的点号代表层级
            function find(key,data){
                if(typeof data =='object'){
                    var split = key.split(".");
                    for(var k in data){
                        if(k != split[0]){
                            continue ;
                        }
                        if(typeof  data[k] !='object'){
                            return data[k];
                        }else{
                            var newKey = key.substring(key.indexOf(".")+1);
                            return find(newKey,data[k]);
                        }
                    }
                }
                return "";
            }
            return {rows:gridData} ;
        };

        /**
         * xml转json
         * @param xml
         */
        var xml2Json = function(xml){
            //如果为Json,直接返回Json
//            if(typeof xml =="object")
//                return xml;
//            var list = [];
//            var data = [];
//            $("<xml>" + xml + "</xml>").find("item").each(function() {
//                var re = {}
//
//                var o = $(this);
//                var id = o.attr("id");
//                var text = o.attr("text");
//
//
//                $(this).find("userdasta").each(function() {
//                    var o = $(this);
//                    //岛洞多边形
//                    var v = o.attr("V"),v1 = o.attr("V1")
//                    re[o.attr("N")] = v ? v : v1;
//
//                });
//                list.push(re);
//
//            });
//
//            return list;
        };

        return {
            jsonToGridData:jsonToGridData,
            xml2Json:xml2Json
        }
    })();

    var Util = (function(){
        /**
         * 根据行政区划编码，识别级别
         * @static
         * @param {string|number} regionCode
         * @return {Number}
         */
        var recognitionLevel = function(regionCode) {
            var regionlevel = 1;
            if (regionCode.indexOf("00000000") == 0){
                regionlevel = 1;
            }else if (regionCode.toString().lastIndexOf("0000000000") != -1) {
                regionlevel = 2;
                // 市
            } else if (regionCode.toString().lastIndexOf("00000000") != -1) {
                regionlevel = 3;
                // 区县
            } else if (regionCode.toString().lastIndexOf("000000") != -1) {
                regionlevel = 4;
                // 乡镇
            } else if (regionCode.toString().substring(9, 12) == "000") {
                regionlevel = 5;
            } else if (regionCode.length > 12 && regionCode.length<20) {
                //社区
                regionlevel = 7;
            } else if (regionCode.length >= 20) {
                //建筑物
                regionlevel = 8;
            } else {
                //村
                regionlevel = 6;
            }
            //如果行政区划需要特殊判断的，后续在这里加入
            return regionlevel;
        };
        /**
         * 获取行政区划编码的前缀编码，即去0之后的，此方法可能对于特殊区域并不适用，比如北京的亦庄开发区，陕西的杨凌开发区等
         * @static
         * @param {String} regionCode	行政区划编码
         * @return {String}
         */
        var getPrefixCode = function(regionCode) {
            var re = "";
            if (regionCode.toString().lastIndexOf("0000000000") != -1) {
                re = regionCode.toString().substring(0, 2);
            } else if (regionCode.toString().lastIndexOf("00000000") != -1) {
                re = regionCode.toString().substring(0, 4);
            } else if (regionCode.toString().lastIndexOf("000000") != -1) {
                re = regionCode.toString().substring(0, 6);
            } else if (regionCode.toString().substring(9, 12) == "000") {
                re = regionCode.toString().substring(0, 9);
            } else {
                re = regionCode.toString().substring(0, 12);
            }
            return re;
        };

        /**
         * 获取上级行政区划编码*/
        var getParCode = function(regionCode){
            var str = "000000000000";
            var fixCode = getPrefixCode(regionCode);
            var parcode = fixCode;
            var level = recognitionLevel(regionCode);
            if(level==1) parcode="0";
            else if(level==2) parcode = "000000000000";
            else if(level>=3 && level<=4) parcode = fixCode.substr(0,fixCode.length-2) + str.substr(fixCode.length-2);
            else if(level>=5 && level<=6) parcode = fixCode.substr(0,fixCode.length-3) + str.substr(fixCode.length-3);
            return parcode;
        }

        /**
         * 获取行政区划代码对应的行政区划级别名称
         * @param {String} regionCode	行政区划代码
         * @return {String} 全国、省、市、区县、街道乡镇、村居委会
         */
        var getRegionLevelName = function(regionCode){
            regionCode = regionCode.replace(/_/g, "0");
            if (regionCode == "000000000000") {
                return "全国";
            }
            else {
                switch (SGIS.Region.recognitionLevel(regionCode)) {
                    case 2:
                        return "省";
                    case 3:
                        return "市";
                    case 4:
                        return "区县";
                    case 5:
                        return "街道乡镇";
                    case 6:
                        return "村居委会";
                    case 8:
                        return "建筑物";
                    default:
                        return "无";
                }
            }
        }
        /**
         * 直辖市区划代码前两位
         * @type Array<String>
         */
        var MunicipalRegions = ["11","12","31","50"];
        /**
         * 判断该行政区划代码是否属于直辖市
         * @param {String} regioncode
         */
        var isMunicipality = function(regioncode){
            var m = SGIS.Region.MunicipalRegions;
            var prefix = regioncode.substring(0, 2);
            var re = false;
            for (var i = 0, _size = m.length; i < _size; i++) {
                if (prefix == m[i]){
                    re = true;
                    break;
                }
            }
            return re;
        };
        return {
            recognitionLevel:recognitionLevel,
            getPrefixCode: getPrefixCode,
            getRegionLevelName: getRegionLevelName,
            isMunicipality:isMunicipality,
            getParCode:getParCode
        }
    })();


    //求两个字符串的相似度,返回差别字符数,Levenshtein Distance算法实现
    var Levenshtein_Distance = function (s, t) {
        var n = s.length;// length of s
        var m = t.length;// length of t
        var d = [];// matrix
        var i;// iterates through s
        var j;// iterates through t
        var s_i;// ith character of s
        var t_j;// jth character of t
        var cost;// cost

        // Step 1
        if (n == 0) return m;
        if (m == 0) return n;

        // Step 2
        for (i = 0; i <= n; i++) {
            d[i] = [];
            d[i][0] = i;
        }
        for (j = 0; j <= m; j++) {
            d[0][j] = j;
        }

        // Step 3
        for (i = 1; i <= n; i++) {

            s_i = s.charAt(i - 1);

            // Step 4
            for (j = 1; j <= m; j++) {

                t_j = t.charAt(j - 1);

                // Step 5
                if (s_i == t_j) {
                    cost = 0;
                } else {
                    cost = 1;
                }

                // Step 6
                d[i][j] = Minimum(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            }
        }

        // Step 7
        return d[n][m];
    };

    //求两个字符串的相似度,返回相似度百分比
    var similarPercent = function (s, t) {
        var l = s.length > t.length ? s.length : t.length;
        var d = Levenshtein_Distance(s, t);
        return (1 - d / l).toFixed(4);
    };

    //求三个数字中的最小值
    var Minimum = function (a, b, c) {
        return a < b ? (a < c ? a : c) : (b < c ? b : c);
    };
    //阻止事件冒泡
    var stopBubble =function(e){
        // 如果传入了事件对象，那么就是非ie浏览器
        if(e&&e.stopPropagation){
            //因此它支持W3C的stopPropagation()方法
            e.stopPropagation();
        }else{
            //否则我们使用ie的方法来取消事件冒泡
            window.event.cancelBubble = true;
        }
    };
    return {
        jsonToGridData :Data.jsonToGridData,
        xml2Json:Data.xml2Json,
        recognitionLevel: Util.recognitionLevel,
        getPrefixCode: Util.getPrefixCode,
        getRegionLevelName: Util.getRegionLevelName,
        isMunicipality: Util.isMunicipality,
        getParCode: Util.getParCode,
        similarPercent:similarPercent,
        stopBubble:stopBubble
    };

});