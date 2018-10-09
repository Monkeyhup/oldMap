/**
 * Created by zhangjunfeng on 14-4-22.
 */
define(function (require, exports, module) {
    /**
     * 综合数据查询对象
     * @param parid表id
     * @param regions 区域
     * @param queryTime 查询事件段（可为空）
     * @constructor
     */
    var MacroQuery = function (parid, reportType, regions, queryTime, indicatorCodes, catalogId, matmids, regionLevel, Sort) {
        this.parid = parid;//目录树表节点ID点ID
        this.reportType = reportType;//报告期类型（年/季/月/人口/经济普查）
        this.regions = regions;//统计区划区域
        this.timeRank = queryTime;//报告期时段from-to(年月)
        this.indicatorCodes = indicatorCodes;//选中查询指标编码集
        this.catalog = catalogId;//区划树ID
        this.matmids = matmids;//选中查询指标ID
        this.regionLevel = regionLevel;//查询当前指标（统计数据）区划级别
        this.sort = Sort;//指标排序对象
    };
    //综合数据查询入口
    MacroQuery.prototype = {
        //表格分页：返回MacroDataResult
        getData: function (pageInfo, callback) {
            SGIS.API.get("macro/Data/Query")
                .data(JSON.stringify(this)).data({
                    pageNumber: pageInfo.getPageNumber(),
                    pageSize: pageInfo.getPageSize()
                })
                .json(function (re) {
                    callback && callback(re);
                });
        },
        //统计图&三视图：返回MacroDataResult
        getAllData: function (callback) {
            SGIS.API.get("macro/data/queryext")
                .data(JSON.stringify(this.getExtParam()))
                .json(function (re) {
                callback && callback(re);
            });
        },
        //导出类型结果excel
        downloadData: function (type, pageInfo) {
            SGIS.UI.addLoadingBar("正在导出，请稍候");
            SGIS.API.post("macro/download/?",type)
                .data(JSON.stringify(this)).data({
                    pageNumber: pageInfo.getCurrPage(),
                    pageSize: pageInfo.getPageSize()
                }).json(function (re) {
                    if (re.status) {
//                        window.open(SGIS.API.getURL("common/download/excel"));
                          SGIS.Util.downloadData("ifr-download",SGIS.API.getURL("common/download/excel"))
                    } else {
                        alert("下载失败");
                    }
                });
            SGIS.UI.clearLoadingBar();
        },
        //转换当前JSON查询条件
        getExtParam: function () {
            return {
                parid: this.parid,
                reportType: this.reportType,
                region: this.region,
                timeRank: this.timeRank,
                indicatorCodes: this.indicatorCodes,
                catalog: this.catalog,
                regions: this.regions,
                matmids: this.matmids,
                regionLevel: this.regionLevel,
                Sort: this.Sort
            };
        }
    };

    //报告期对象
    var TimeRank = function (fromYear, toYear, fromMonth, toMonth) {
        this.fromYear = fromYear;//开始年份
        this.toYear = toYear;//结束年份
        this.fromMonth = fromMonth;//开始月
        this.toMonth = toMonth;//结束月
    };

    //指标项对象
    var Indicator = function (dataIndex, idenCode, idenName, renderType) {
        this.dataIndex = dataIndex;
        this.idenCode = idenCode;
        this.idenName = idenName;
        this.renderType = renderType;
    };

    /**
     * 综合查询 某一指标结果排名对象
     * @param property 指标字段名
     * @param direction 升序asc（后几名）/降序desc（前几名）
     * @param top 返回前多少位
     * @param propertyName 属性名称
     * @constructor
     */
    var Sort = function(property,direction,top,propertyName){
        this.property = property;
        this.direction = direction;
        this.top = top;
        this.propertyName = propertyName;
    };
    Sort.prototype = {
        toTitle: function () {
            if(!this.property || this.property=="") return "";
            var text = "排名：";
            if(this.propertyName && this.propertyName!=""){
                text += this.propertyName;
            }else{
                text += this.property;
            }
            if (this.direction.toLocaleLowerCase() == "asc") {
                text += " 后几名"
            } else if (this.direction.toLocaleLowerCase() == "desc") {
                text += " 前几名";
            }
            if (this.top > 0) {
                text += " 取结果数" + this.top;
            }
            return text;
        }
    };

    return {
        MacroQuery: MacroQuery,
        TimeRank: TimeRank,
        Indicator: Indicator,
        Sort:Sort
    };
});