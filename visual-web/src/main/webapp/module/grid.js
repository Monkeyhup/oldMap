/**
 * Created by jinn on 2015/10/26.
 */

/**
 * 数据表格
 */
define(function (require, exports, module) {
    var Reader = require("query.reader");
    var gridPanel = $("#grid-panel");
    var grid = null;
    var grid2 = null;
    var reData = null;

    var isInit = false;

    var client = false;


    var init = function () {
        //if (SGIS.agent == "client") {
        //    client = true;
        //}


        if (grid) {
            grid.destructor();                  //销毁
            grid = null;
        }

        if (grid2) {
            grid2.destructor();                  //销毁
            grid2 = null;
        }
        if(client)grid2 = SGIS.Grid.create("grid-container2");
        grid = SGIS.Grid.create("grid-container");
    };

    /**
     * 获取panel
     * @returns {*|jQuery|HTMLElement}
     */
    var getPanel = function () {
        return gridPanel;
    };

    //显示面板
    var show = function () {
        if (!isInit)return;
        gridPanel.removeClass("hide");
    };

    //隐藏面板
    var hide = function () {
        gridPanel.addClass("hide");
    };

    var toggle = function () {
        if (gridPanel.hasClass("hide") && isInit) {
            gridPanel.removeClass("hide");
        } else {
            gridPanel.addClass("hide");
        }

    };

    $(function () {
        gridPanel.Drag();
        //关闭按钮
        gridPanel.find(".item.close").click(function () {
            hide();
        });
    });


    var action = {
        //选择行 id：第一列（行政区划编码）
        onRowSelect: function (id, ind) {
            grid2&&grid2.selectRowById(id);
            grid&&grid.selectRowById(id);
            seajs.use(["chart", "layer.segment"], function (Chart, Segment) {
                Chart.selectOne(id);//统计图选中一列
                Segment.linkToRegion(id);
            });
        }
    };

    /**
     * 清空grid
     */
    var clearAll = function () {
        if (grid) {
            grid && grid.clearAll();              //清除
            grid.destructor();                  //销毁
            grid = null;
        }
        if (grid2) {
            grid2 && grid2.clearAll();              //清除
            grid2.destructor();                  //销毁
            grid2 = null;
        }
        reData = null;
        isInit = false;
        hide();
    };


    /**
     * 初始化表格
     * @param re 查询显示数据
     * @param idencodes 当前指标
     * @param periods 当前时段
     * */
    var active = function (re, _period) {
        if (re.content.length == 0) {
            return;
        }

        isInit = true;
        reData = re;

        init();
        show();

        var reader = new Reader(re);

        var idencodes = [];
        for (var i = 0, len = re.indicators.length; i < len; i++) {
            idencodes.push(re.indicators[i].idenCode || re.indicators[i].code);
        }
        var periodlen = re.periods.length;
        var periods = [re.periods[periodlen - 1]];
        if (_period) {
            periods = _period;
        }

        var d = reader.getFilterData(idencodes, periods);//筛选（报告期*指标）结果数据，默认前两项指标
        var indicators = d.head;//标题
        var data = d.content;
        data = formatNum(data);  //标准计数法


        //去除行政区划代码
        var filterIndicators = [];

        if(client){
            for (var i = 0, len = indicators.length; i < len - 2; i++) {
                filterIndicators[i] = indicators[i + 2];
            }

            //先对数据进行一次转置
            var dataT = transformArr(data, 2); //数组转置
        }else{
            for (var i = 0, len = indicators.length; i < len - 1; i++) {
                filterIndicators[i] = indicators[i + 1];
            }

            var dataT = transformArr(data, 1); //数组转置
        }



        //设置表头
        grid.setHeader($.map(filterIndicators, function (n) {
            return n;
        }).join(','));


        //for(var len=2; len<dataT.length;len++){
        //    if(indicators[len-1].replace(/[^\x00-\xff]/g, "NB").length > dataT[len].sort(sortNumber())[0].length*4){
        //        widths = widths +  "," + (indicators[len-1].replace(/[^\x00-\xff]/g, "NB").length*2+28);
        //    }
        //    else{
        //        widths = widths +  "," + (dataT[len].sort(sortNumber())[0].length*6+28);
        //    }
        //}


        var widths = calcColWidth(dataT, filterIndicators);
        grid.setInitWidths(widths);

        grid.setColTypes($.map(filterIndicators, function (n, i) {
            //if(i<1){
            //    return "ed";
            //}else{
            //    return "ed";
            //}
            return "ed";
        }).join(","));
        //列排序
        grid.setColSorting($.map(filterIndicators, function (n, i) {
            if(client){
                return "int";
            }else{
                if(i<1){
                    return "str";
                }else{
                    return "int";
                }
            }
        }).join(','));

        //对齐，数值右对齐
        grid.setColAlign($.map(filterIndicators, function (n, i) {
            if(client){
                return "left";
            }else{
                return i<1?"left":"right";
            }
        }).join(','));

        //设置皮肤样式
        grid.setSkin('dhx_terrace');
        grid.init();//刷新表格

        for (var key in action) {
            grid.attachEvent(key, action[key]);//绑定表格事件
        }
        grid.clearAll();//清空数据

        var _index = 1;
        if(client){
            _index = 2;
        }

        grid.parse({rows: getJsonData(data,_index)}, "json");//设置省份数据

        //$("#btn-down").click(function(){
        //    var url = SGIS.Util.getBaseUrl();
        //    url += "/visdata/excel/export";
        //    DownExcel(url, indicators+";"+data);
        //});

        if(client){
            active2(indicators, data);
            scrollsync();
        }

    };
    var active2 = function (indicators, data) {

        //设置表头
        grid2.setHeader(indicators[1]);
        grid2.setInitWidths("*");
        grid2.setColTypes("ed");
        grid2.setColSorting("str");
        grid2.setColAlign("left");
        grid2.setSkin('dhx_terrace');//设置皮肤样式
        grid2.init();//刷新表格

        for (var key in action) {
            grid2.attachEvent(key, action[key]);//绑定表格事件
        }

        grid2.clearAll();//清空数据
        var rowdata = getJsonData2(data);
        grid2.parse({rows: rowdata}, "json");//设置省份名称

        //设置表头高度
        syncHeaderHeight();
    };

    var DownExcel = function (URL, Data) {
        var temp = document.createElement("form");
        temp.action = URL;
        temp.method = "post";
        temp.style.display = "none";
        var opt = document.createElement("textarea");
        opt.name = "data";
        opt.value = Data;
        temp.appendChild(opt);
        document.body.appendChild(temp);
        temp.submit();
        return temp;
    }


    //选择一行（根据id）
    var selectRow = function (id) {
        if (grid) {
            grid.selectRowById(id);
        }
        if (grid2) {
            grid2.selectRowById(id);
        }
    };


    /**
     * 计算列宽
     * 计算数值的最大宽度 考虑表头的最小宽度
     */
    var calcColWidth = function (datas, heads) {
        if (datas.length != heads.length) {
            throw Error("数据不符合规范");
        }

        var wids = "";
        for (var i = 0, len = datas.length; i < len; i++) {
            var colMaxWid = calcColMax(datas[i]);
            var headWid = heads[i].replace(/[^\x00-\xff]/g, "NB").length * 6 + 30;

            if (i == 0) {
                wids += "80,";
                continue;
            }

            if (headWid / 3 > colMaxWid) {
                wids += parseInt(headWid / 3 + "") + ",";
            } else {
                wids += colMaxWid + ",";
            }
        }
        //wids += "*";
        wids = wids.substring(0, wids.length - 1);

        return wids;
    };

    /**
     * 计算列的最大宽度
     * @param cols
     * @returns {*}
     */
    var calcColMax = function (cols) {
        var arr = [];
        for (var i = 0, len = cols.length; i < len; i++) {
            var wid = (  cols[i] + "").length * 6 + 30;   //一个数字的宽度设置为6
            if (wid < 45) {
                wid = 45;
            }
            arr.push(wid);
        }
        return arr.max();
    };


    /**
     * 获取json格式数组的表格行数据
     * @param data
     */
    var getJsonData = function (data,index) {
        var jsonData = [];
        for (var row = 0, len = data.length; row < len; row++) {
            var json = {
                id: "",
                data: []
            };
            var d = [];
            json.id = data[row][0];//行政区划编码
            //行政区划代码不显示
            var leng = data[row].length;
            for (var col = index; col < leng; col++) {
                d.push(data[row][col]);
            }
            json.data = d;
            jsonData.push(json);
        }
        return jsonData;
    };


    var getJsonData2 = function (data) {
        var jsonData = [];
        for (var row = 0, len = data.length; row < len; row++) {
            var json = {
                id: "",
                data: ""
            };
            json.id = data[row][0];//行政区划编码
            json.data = [data[row][1]];
            jsonData.push(json);
        }
        return jsonData;
    };


    var scrollsync = function () {
        $('.objbox').scroll(function () {
            $('.objbox').scrollTop($(this).scrollTop());
        });
        $('.targetDiv').scroll(function () {
            $('.objbox').scrollTop($(this).scrollTop());
        });
    };


    //同步表头高度
    var syncHeaderHeight = function () {
        $("#grid-container2 div.xhdr").height($("#grid-container div.xhdr").height());
        $(".objbox:eq(0)").height($(".objbox:eq(1)").height());
        $(".objbox:eq(0)").css("overflow-y", "hidden");
        if ($(".objbox:eq(1) table").width() > $(".objbox:eq(1)").width()) {
            $(".objbox:eq(0)").css("overflow-x", "scroll");
        } else {
            $(".objbox:eq(0)").css("overflow-x", "hidden");
        }
    };

    /**
     * 大数值分割
     * @param data
     * @returns {*}
     */
    var formatNum = function (data) {
        for (var ii = 0, len = data.length; ii < len; ii++) {
            var one = data[ii];
            for (var jj = 2, lenn = one.length; jj < lenn; jj++) {
                var aa = data[ii][jj] + "";
                var b = aa.split(".");
                if (b.length == 2) {
                    if (b[0].length > 5) {
                        b[0] = parseInt(b[0]).format();
                    }
                    b = b[0] + "." + b[1];
                    data[ii][jj] = b;
                } else {
                    if (aa.length != 12 && aa.length > 5) {
                        aa = parseInt(aa).format();
                        data[ii][jj] = aa;
                    }
                }
            }
        }

        return data;
    };


    /**
     * 数组转置
     * @param data
     * @param index 从第几列开始转置
     * @returns {Array}
     */
    var transformArr = function (data, index) {
        var ll = data[0].length;
        if (index >= ll) {
            throw Error("开始列大于数据列长");
        }
        var arr = [];
        for (var a = index; a < ll; a++) {
            var brr = [];
            for (var b = 0; b < data.length; b++) {
                brr.push(data[b][a]);
            }
            arr.push(brr);
        }
        return arr;
    };


    return {
        init: init,
        getPanel: getPanel,
        show: show,
        hide: hide,
        toggle: toggle,
        active: active,
        selectRow: selectRow,
        clearAll: clearAll,
        syncHeaderHeight: syncHeaderHeight
    }
});

