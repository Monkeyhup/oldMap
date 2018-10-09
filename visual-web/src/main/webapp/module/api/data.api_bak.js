/**
 * 外部Api调用
 * Created by W.Qiong on 15-11-30.
 */
var DataApi =(function(){

    var isHTR = false ; //是否为华通人接口

    var Http = (function(){

        /**
         * 地址配置
         * @type {{}}
         */
        var  URL={
            region:"http://data.stats.gov.cn/chinese/api_2.0/acmrdatashow/api_2.0/getweidusubnodedatas",
            catalog:'http://data.stats.gov.cn/chinese/api_2.0/acmrdatashow/api_2.0/getweidusubnodedatas',
            query:"http://121.42.160.106/NationApi2.0/fsnd/data"
        };

        /**
         * get方法
         * @param args
         * @param callback
         */
        var get = function(url,args,callback){
            function getUrl(){
                var loc = window.location;
                if (loc.origin){
                    return loc.origin;
                }
                return loc.protocol+"//"+loc.host+"/data/api";
            };

            $.ajax({
                url: getUrl() ,
                type:"GET",
                data:{
                  params: args
                },
                beforeSend: function(){

                },
                complete: function(){

                },
                success:function(re){
                    callback&&callback(re) ;
                }
            });
        };

        //完整地址
        var getFullUrl = function(url,args){
            if(!args){
                return url ;
            }
            return url+"?"+args ;
        };

        return {
            URL:URL,
            get:get
        }

    })();

    /**
     * 接口调用
     */
    var Api = (function(){
        /**
         * 获取数据类型
         * @param args
         * @param callback
         */
        var getDataType = function(args,callback){
            var re = [{
                "name":"年报",
                "type":"fsnb"
            },{
                "name":"季报",
                "type":"fsjb"
            },{
                "name":"月报",
                "type":"fsyb"
            }];
            callback&&callback(re) ;
        };

        /**
         * 获取当前数据类别下的区划级别
         * @param args
         * @param callback
         */
        var getLevel = function(args,callback){
            var  re =[{
                "name":"省",
                "code":"fs",
                "level":2
            },{
                "name":"地市",
                "code":"fs",
                "level":3
            },{
                "name":"区县",
                "code":"fx",
                "level":4
            }];
            callback&&callback(re) ;
        };

        /**
         * 获取区划级别
         * @param args
         * @param callback
         */
        var getRegion =  function(args,callback){
            var newArgs ='s={"dbcode":"fsnd","wdcode":"reg","code":"00"}';
            Http.get(Http.URL.region,newArgs||args,function(re){
                if(isHTR){
                    re = HTRAdapter.convertRegion(re) ;
                }
                callback&&callback(re) ;
            });
        };

        /**
         * 获取分类指标
         * @param args  s={"dbcode":"fsnd","wdcode":"zb","code":""}
         * @param callback
         */
        var getCatalogInd = function(args,callback){
             Http.get(Http.URL.catalog,args,function(re){
                 if(isHTR){
                     re = HTRAdapter.convertCatalog(re) ;
                 }
                 callback&&callback(re) ;
             });
        };

        /**
         * 查询数据
         * @param args  {"dbcode":"fsnd","where":{"nodes":{"sj":["2011"],"zb":["A010101"],"reg":["110000","120000"]}}}
         * @param callback
         */
        var query = function(args,callback){
           var newArgs = {};
           if(isHTR){
               newArgs.regions = args.where.nodes.reg ;
               newArgs.temporals =   args.where.nodes.sj ;
               newArgs.indicators =   args.where.nodes.zb ;
           }
            Http.get(Http.URL.query,args,function(re){
                if(isHTR){
                    re = HTRAdapter.convertData(re) ;
                }
                callback&&callback(re) ;
            });
        };

        return {
            getDataType:getDataType,
            getLevel:getLevel,
            getRegion:getRegion,
            getCatalogInd:getCatalogInd,
            query:query
        }

    })();

    /**
     * 华通人接口适配
     */
    var HTRAdapter = (function(){
        /**
         * 区划格式转换
         * @param re
         */
        var convertRegion = function(re){

            var regions = [];
            $.each(re,function(i,o){
                var r ={};
                r.name = o.cname ;
                r.code = padR(o.code,12)  ;
            });
            function padR(num, n) {
                return num+Array(n>num.length?(n-(''+num).length+1):0).join("0");
            }
            return regions;
        };

        /**
         * 分类指标格式转换
         * @param re
         */
        var convertCatalog = function(re){
            var catalogs = [];
            $.each(re,function(i,o){
                var c ={};
                c.name = o.cname ;
                c.code = o.code;
                c.type = o.dotcount>0?"C":"I";
                c.unit = o.unit ;
            });
            return catalogs;
        };

        /**
         * 数据格式转换
         * @param re
         */
        var convertData = function(re){
            var data = [];
            var one ={dataType :"",level:"" };
            one.returnData =[];
            $.each(re,function(i,o){
                var obj = {} ;
                var datas = o.datas ;
                obj.sj = datas[0] ;
                obj.zb = {
                    name:datas[1][3] ,
                    code:""
                };
                var newd = [] ;
                newd =  $.grep(datas,function(i,d){
                    return i>1 ;
                });
                obj.data= newd ;
                one.returnData.push(obj) ;
            });
            data.push(one) ;
            return data;

        };
        return{
            convertRegion:convertRegion ,
            convertCatalog:convertCatalog,
            convertData:convertData
    }

    })() ;

    return {
        getDataType:Api.getDataType,
        getLevel:Api.getLevel,
        getRegion:Api.getRegion,
        getCatalogInd:Api.getCatalogInd,
        query:Api.query

    };
})();

//**调用实例
//DataApi.getDataType(args,callback)
