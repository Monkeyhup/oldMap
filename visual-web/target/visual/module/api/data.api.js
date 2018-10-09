/**
 * Created by jinn on 2015/12/5.
 */

/**
 * 远程api访问接口
 */
define(function (require, exports, module) {

   var APITYPE = {    //a;i访问类型
        REPORT:1,
        DIMENSION:2,
        IDEN:3,
        REGION:4,
        DATA:5
    };


    /**
     *
     */
    var API = (function () {
        var dataType = {
            11:{
                "name":"年报",
                "code":"nd",
                "type":"11"
            },
            12:{
                "name":"季报",
                "code":"jd",
                "type":"12"
            },
            13:{
                "name":"月报",
                "code":"yd",
                "type":"13"
            }
        };

        var Level = {
            2:{
                "name":"省",
                "code":"fs",
                "level":2
            },
            3:{
                "name":"地市",
                "code":"fx",
                "level":3
            },
            4:{
                "name":"区县",
                "code":"fx",
                "level":4
            }
        };

        /**
         * 获取分类与指标
         * @param type 数据类型
         * @param level 区划级别
         * @param parid 父节点
         * @param callback
         */
        var getIdens = function (type,level,parid,callback) {
            var typeObj = dataType[type];
            var levelObj = Level[level];
            var dbcode = levelObj.code + typeObj.code;

            if(!parid){
                parid = "";
            }else if (parid.indexOf("_") != -1) {
                parid = parid.substring(0, parid.indexOf("_"));  // TODO 1 需要与TODO2同时解决
            }

            var args = 's={"dbcode":"'+dbcode+'","wdcode":"zb","code":"'+parid+'"}';
            SGIS.API.get("/api/?/data",APITYPE.IDEN).data({args:args}).json(function (re) {
                re = eval("(" + re + ")");
                re = re.returndata;
                re = DataAdapter.covertIdens(re,typeObj.type,levelObj.level);
                callback&&callback(re);
            });
        };

        var queryData = function (type,level,zbs,sj,reg,callback) {
            var typeObj = dataType[type];
            var levelObj = Level[level];
            var dbcode = levelObj.code + typeObj.code;

            if(!sj || sj==""){
                switch(type){
                    case "11":
                        sj = "LAST5";
                        break;
                    case "12":
                        sj = "LAST6";
                        break;
                    case "13":
                        sj = "LAST6";
                        break;
                }
            }

            if(!reg || reg==""){
                reg = "00";
            }

            var args = 's={"dbcode":"'+dbcode+'","where":{"nodes":{"sj":["'+sj+'"],"zb":'+zbs+',"reg":["'+reg+'"]}}}';
            SGIS.API.get("/api/?/data",APITYPE.DATA).data({args:args}).json(function (re) {
                re = eval("(" +re + ")");
                if(re.returncode!=200){
                    alert("无相关数据");
                    return;
                }
                re = re.returndata;
                re = DataAdapter.convertData(re);
                if (!re.content || re.content.length < 1) {
                    alert("无相关数据");
                    return;
                }
                callback&&callback(re);
            });
        };


        return {
            getIdens:getIdens,
            queryData:queryData
        }

    })();


    /**
     * 数据适配器（华通人）
     * @type {{convertData}}
     */
    var DataAdapter = (function () {

        /**
         * 指标转换
         * @param res
         * @returns {*}
         */
        var covertIdens = function (res,reportType,regionLevel) {
            for(var i = 0,len = res.length;i<len;i++){
                var obj = res[i];
                obj.idenName = obj.name;
                obj.idenCode = obj.code;
                obj.idenUnit = obj.unit;
                obj.reportType = reportType;
                obj.regionLevel = regionLevel || 2;
                obj.matmid = obj.code+ "_" + reportType;         //TODO 1 暂时这样处理 保持唯一

                //判断是指标还是分类
                var nodesort = obj.nodesort;
                if(nodesort==1 || nodesort == 2 || nodesort==3){
                    obj.macmetaType = 3;
                }else {
                    obj.macmetaType = 1;
                }

                //Nodesort：
                //0（分类，大类）、4（表）
                //1，	有值指标；2，有值指标（分层 GDP、1、2、3GDP）；
                //3，这一层没有指标，下一层有值；
            }
            return res;
        };

        /**
         * 数据转换
         * @param re
         * @returns {{content: Array, head: Array, indicators: Array, periods: Array}}
         */
        var convertData = function (re) {
            var reData = {
                content:[],
                head:[],
                indicators:[],
                periods:[]
            };
            var datanodes = re.datanodes;
            var wdnodes = re.wdnodes;

            var tempArrs = [];
            for(var i = 0,len = datanodes.length;i<len;i++){
                var tempArr = [];

                var item = datanodes[i];
                var val = item.data.data;
                var wds = item.wds;
                var regioncode,idencode,time;

                for(var j = 0,ll = wds.length;j<ll;j++){
                    var o = wds[j];
                    if(o.wdcode=="zb"){
                        idencode = o.valuecode;
                    }else if(o.wdcode=="reg"){
                        regioncode = o.valuecode;
                    }else if(o.wdcode=="sj"){
                        time = o.valuecode;
                    }
                }

                tempArr.push(regioncode);
                tempArr.push(idencode);
                tempArr.push(time);
                tempArr.push(val);

                tempArrs.push(tempArr);
            }

            var hashReg = new SGIS.Util.Hashtable();
            var hashIden = new SGIS.Util.Hashtable();
            var hashTime = new SGIS.Util.Hashtable();
            for(i=0,len<tempArrs.length;i<len;i++){
                var one = tempArrs[i];

                var regInfo = getNodeInfo(wdnodes,one[0],"reg");
                hashReg.add(one[0],regInfo);

                var idenInfo = getNodeInfo(wdnodes,one[1],"zb");
                hashIden.add(one[1],idenInfo);

                var sjInfo =  getNodeInfo(wdnodes,one[2],"sj");
                hashTime.add(one[2],sjInfo);
            }

            var indicators = hashIden.toArray();
            var periods = hashTime.toArray();
            var regions = hashReg.toArray();

            var head = [];

            for(i = 0,len = regions.length;i<len;i++){
                var temp = [];
                var rcode = regions[i].code;
                var fullCode = padR(rcode,12);  //行政区划码补全
                temp.push(fullCode);
                temp.push(regions[i].name);

                if(i==0){
                    head.push("行政区划码");
                    head.push("行政区划名");
                }

                for(var a = 0,l2 = periods.length;a<l2;a++){
                    var pcode = periods[a].code;
                    var pname = periods[a].name;

                    //把periods处理一下  怎么去分报告期类型
                    if(i==0 && pcode.length==4){ //年
                        periods[a].reportType = 11;
                        periods[a].reportTypeName = periods[a].name;
                        periods[a].month = 0;
                        periods[a].year = pcode;
                    }else if(i==0 &&pcode.length==6){ //月
                        periods[a].reportType = 13;
                        periods[a].reportTypeName = periods[a].name;

                        periods[a].month = pcode.substring(4);
                        periods[a].year = pcode.substring(0,4)
                    }else if(i==0 &&pcode.length==5){ //季
                        periods[a].reportType = 12;
                        periods[a].reportTypeName = periods[a].name;
                        periods[a].year = pcode.substring(0,4);
                        var m = pcode.substring(4);
                        switch (m){
                            case "A":
                                periods[a].month = 13;
                                break;
                            case "B":
                                periods[a].month = 14;
                                break;
                            case "C":
                                periods[a].month = 15;
                                break;
                            case "D":
                                periods[a].month = 16;
                                break;
                        }
                    }

                    for(var b = 0,l3= indicators.length;b<l3;b++){
                        var icode = indicators[b].code;
                        var iname = indicators[b].name;
                        var val = pushData(tempArrs,rcode,icode,pcode);
                        temp.push(val);

                        if(i==0){
                            head.push(pname +" "+iname);
                        }
                    }
                }

                reData.content.push(temp);
            }
            reData.indicators = indicators;
            reData.head = head;
            reData.periods = periods;


            return reData;
        };

        /**
         * 行政区划码补全
         * @param num
         * @param n
         * @returns {string}
         */
        var padR = function(num, n) {
            return num+Array(n>num.length?(n-(''+num).length+1):0).join("0");
        };

        /**
         * 获取值
         * @param tempArrs 全部数据
         * @param _reg  地区
         * @param _zb   指标
         * @param _sj   时间
         * @returns {*}
         */
        var pushData = function (tempArrs,_reg,_zb,_sj) {
            for(var i = 0,len = tempArrs.length;i<len;i++){
                var one = tempArrs[i];
                var reg = one[0];
                var zb = one[1];
                var sj = one[2];
                var val = one[3];

                if(reg==_reg && zb == _zb && sj== _sj){
                    return val;
                }
            }

            return -1;
        };


        /**
         * 获取节点信息
         * @param wdnodes  全部节点
         * @param value    节点值
         * @param type     节点类型  zb reg sj
         * @returns {{}}
         */
        var getNodeInfo = function (wdnodes,value,type){
            var node = {};
            for(var i = 0,len = wdnodes.length;i<len;i++){
                var item = wdnodes[i];
                if(item.wdcode == type){
                    var nodes = item.nodes;
                    for(var j = 0,ll = nodes.length;j<ll;j++){
                        var _node = nodes[j];
                        if(value==_node.code){
                            node = _node;
                            break;
                        }
                    }
                }
            }
            return node;
        };



        return{
            convertData:convertData,
            covertIdens:covertIdens
        }

    })();


    return{
        getIdens:API.getIdens,
        queryData:API.queryData
    }
});