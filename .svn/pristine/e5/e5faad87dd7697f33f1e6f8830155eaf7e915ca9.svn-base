/**
 * Created by jinn on 2015/10/22.
 */
define(function (require, exports, module) {
    var events = require("component/app.events");
    var Bread = require('component/bread');                     //面包屑路径标题
    var regionset = require("regionset");
    var query = require("query");
    var layer = require("layer");
    var DataApi = require("api/data.api");

    var ThematicUtil = require("ThematicUtil");

    var SegmentLayer,PieLayer,ComparisonLayer;

    var isCheckedPip = false;      //false指标选项列表，true已选中指标列表

    var Grid = require("grid");
    var Chart = require("chart");


    var catalogId = 1;
    var currRegions = [];

    var PreIdens;//保存上一次查询的指标


    var currVisType;
    var VisType = {
        "SEG": 1,
        "PIE": 2,
        "BING":3,
        "ZHU": 4,
        "GROUP": 5
    };



    var currentLevel = 2; //当前区划级别
    var currentType = 1;  //当前报告期
    var preType = -1; //上一个报告期
    var currSource = "local"; //当前报告期数据来源  local：本地库   api：远程api获取

    var queryParm = null;                                       //查询参数
    var allData = null;                                         //综合数据查询结果暂存

    $(function () {
        events.on("level.switch", function (level) {
            currentLevel = level;
            currentType = $("#switcher-report a.item.active").attr("data-value");
            ListItem.init(currentType, currentLevel);

            clearAllThematic();

            seajs.use(['grid', 'chart'], function (g, c) {
                $("#chart-control").attr("hasdata","no");
                $("#chart-control").addClass("hide");

                g.clearAll();
                c.clearAll();
            });
        });

        events.on("region.switch", function (regions) {
            PreIdens = ListItem.getCurrentIden();  //在触发下钻前,记录前一次查询的指标

            var level = currentLevel;
            //regions点击下钻地区 需要注意,trigger方法传入的参数被转化成数组
            if (regions && regions.length > 0) {
                level = regions[0].getLevel();
                if (level != currentLevel) {  //级别改变了  重新刷新指标

                    currentLevel = level;
                    currentType = $("#switcher-report a.item.active").attr("data-value");
                    //ListItem初始化,需要传入当前被激活的指标选择项和当前行政区划级别
                    ListItem.init(currentType, currentLevel);

                    //清除
                    clearAllThematic();
                    seajs.use(['grid', 'chart'], function (g, c) {
                        $("#chart-control").attr("hasdata","no");
                        $("#chart-control").addClass("hide");

                        g.clearAll();
                        c.clearAll();
                    });


                    if (!PreIdens.keys || PreIdens.keys().length < 1) {
                        return;
                    }
                    //获取选中指标
                    var codes = [];
                    var idens = PreIdens.toArray();
                    for (var i = 0, len = idens.length; i < len; i++) {
                        codes.push(idens[i].idenCode);
                    }
                    ListItem.getAppoitItem(codes, doQuery);
                }
            }
        });

        //绑定"指标检索"按钮
        $("#iden-query").click(function () {
            doIdenQuery();
        });
        //绑定输入框回车事件
        $("#input-iden").keydown(function (e) {
            if (e.keyCode == 13) {
                //检索指标
                doIdenQuery();
            }
        });

        //绑定"已选中指标数"标题点击事件
        $("#select-title").click(function () {
            //标记显示选中指标
            isCheckedPip = true;
            //当前分类/级别下的选中指标
            var items = ListItem.getCurrentIden().toArray();
            if (items && items.length > 0) {
                ListItem.render(items, true);   //显示已选中指标
                //ListItem.checkAll();            //全选
            } else {
                $("#selection-items").html(""); //否则清空
            }
        });


        $("#btn-do-seg").click(function () {
            currVisType = VisType.SEG;
            doQuery();
        });
        $("#btn-do-pie").click(function () {
            currVisType = VisType.PIE;
            doQuery();
        });

        $("#btn-do-bing").click(function () {
            currVisType = VisType.BING;
            doQuery();
        });

        $("#btn-do-zhu").click(function () {
            currVisType = VisType.ZHU;
            doQuery();
        });
        $("#btn-do-group").click(function () {
            currVisType = VisType.GROUP;
            doQuery();
        });
        
        //
        //$("#btn-view").click(function () {
        //    var matmidArr = ListItem.getCurrentIden().keys();
        //
        //    if (!matmidArr || matmidArr.length < 1) {
        //        alert("请选指标!");
        //        SGIS.UI.clearLoadingBar();
        //        return;
        //    }
        //
        //    var len = matmidArr.length;
        //    if(len == 1){
        //        currVisType = VisType.PIE;
        //        doQuery();
        //    }else if(len>1){
        //        currVisType = VisType.BING;
        //        doQuery();
        //    }
        //});


        $("#btn-help").popup({
            position:"top left",
            on:'click',
            title:'作图规则',
            //content: '',
            html:"<div style='text-align: center;font-weight: 700'>作图规则</div><div>单个指标：分段图和等级图;</div> <div> 两个指标：复合图、饼图、柱图;</div> <div>三个及以上指标：饼图和柱图</div>"
        });

    });

    var bindClickToReport = function () {
        //报告期切换事件
        $("#switcher-report >a").click(function () {
            var $this = $(this);

            if($this.hasClass("dis")){
                return;
                //直接返回  提示已经通过tip解决
            }

            currSource = $this.attr("source"); //此报告期数据来源
            $this.siblings("a").removeClass("active");
            $this.addClass("active");
            if(currSource=="api"){
                $("#search-head").css("visibility","hidden");
            }else {
                $("#search-head").css("visibility","visible");
            }
            currentType = $(this).attr("data-value");
            ListItem.clearAllSel();  //重新初始化一个应该清空已选
            //ListItem.init(currentType, currentLevel);
            var items = $("#selection-items");
            if (!items.html())
                items.html("<span>没有数据</span>");
        });

        //tip提示
        $("#switcher-report >a.item.dis").popup({
            content : '暂无此类型数据',
            on    : 'hover',
            position : 'right center'
        });
    }


    var init = function (appconfig) {
        //初始化要显示的报告期
        if(appconfig){
            $("#switcher-report").empty();
            var datasource = appconfig.datasource;
            for(var i = 0,len = datasource.length;i<len;i++){
                 var one = datasource[i];

                 if(!one.status){
                    continue;
                 }

                 var active = one.default?"active":"";  //默认激活
                 var dis = one.hasdata?"":"dis";
                 var tpl = '<a class="item '+active+ ' ' + dis +'" data-value="'+one.code+'" source = "'+one.source+'">'+one.name+'</a>';
                 $("#switcher-report").append(tpl);
            }
        }

        bindClickToReport();
        seajs.use(["layer.segment","layer.pie","layer.comparison"], function (seg,pie,comp) {
            SegmentLayer = seg;
            PieLayer = pie;
            ComparisonLayer = comp;
        });

        //获取行政区划相关配置
        regionset.getConfig(function (config) {
            catalogId = config.catalogid;
            currRegions = config.defaultRegion;
            currentLevel = currRegions[0].getLevel();
            //$("#switcher-report a[data-value='1']").click();    //  加载指标开始

            $("#switcher-report a.item.active").click();
        });

    };

    /**
     * 指标查询
     */
    var doIdenQuery = function () {
        var name = $("#input-iden").val();
        if (!name || name == "") {
            alert("请输入查询指标!");
            return;
        }
        //面包屑初始化
        ListItem.resetBread();
        //刷新检索指标下列表
        ListItem.idenRefresh(name);
    };


    /**
     * 执行查询操作
     */
    var doQuery = function (_matmidArr) {
        $.mobile&&$("#iden-panel").panel("close");  // TODO

        $("#indi-panel").addClass("hide");
        $("#v-toolbar").fadeIn();

        SGIS.UI.addLoadingBar("正在加载数据...");


        preType = currentType;


        var regions = regionset.getRegions();  //当前行政区划
        if (regions.length == 0) {
            regions = currRegions;
        } else {
            currRegions = regions;
        }

        //所选指标ID
        var matmidArr = [];
        if (_matmidArr) {
            matmidArr = _matmidArr;
        } else {
            matmidArr = ListItem.getCurrentIden().keys();
        }

        if (!matmidArr || matmidArr.length < 1) {
            alert("请选指标!");
            SGIS.UI.clearLoadingBar();
            return;
        }

        if(currSource=="local"){
            queryParm = new query.MacroQuery('', currentType, regions, null, [], catalogId, matmidArr, currentLevel, null);
            SGIS.API.post("macro/Data/Query/hasRanks")
                .data(JSON.stringify(queryParm))
                .json(function (re) {

                    var timeRank = re; //返回年月
                    var setTm = getTimeVal();
                    if(setTm.length == 2){
                        var fromYear = re.fromYear;
                        var toYear = re.toYear;

                        if(fromYear<setTm[0]){
                            timeRank.fromYear = setTm[0];
                        }

                        if(toYear>setTm[1]){
                            timeRank.toYear = setTm[1];
                        }
                    }

                    queryParm = new query.MacroQuery('', currentType, regions, timeRank, [], catalogId, matmidArr, currentLevel, null);
                    queryParm.getAllData(function (re) {
                        if (!re.content || re.content.length < 1) {
                            alert("无相关数据");
                            SGIS.UI.clearLoadingBar();
                            return;
                        }
                        allData = re;
                        // 初始化专题图
                        drawThematic(re);
                    });
                });
        } else if (currSource == "api") {
            var tempStr = "[";
            for (var i = 0, len = matmidArr.length; i < len; i++) {
                var maid = matmidArr[i];
                if (maid.indexOf("_") != -1) {
                    maid = maid.substring(0, maid.indexOf("_"));
                }
                tempStr += '"' + maid + '",'
            }
            tempStr = tempStr.substr(0, tempStr.length - 1) + "]";

            var sj = "";
            var setTm = getTimeVal();
            if(setTm.length == 2){
                var fromY = setTm[0];
                var toY = setTm[1];

                fromY = parseInt(fromY);
                toY = parseInt(toY);
                if(toY-fromY>1){
                    for(var i = fromY;i<=toY;i++){
                        sj +=  "\"" + i + "\"" + ",";
                    }
                    sj = sj.substring(1,sj.length-2);
                }else{
                    sj =  "\"" +  fromY + "\""  +  "," + "\"" + toY  + "\"";
                }
            }

            DataApi.queryData(currentType, currentLevel, tempStr, sj, null, function (re) { //TODO sj reg参数暂不做处理
                drawThematic(re);
            });
        }

    };


    /**
     * 绘制专题图
     * @param _queryParam
     */
    var drawThematic = function (re) {
            SGIS.UI.clearLoadingBar();
            
            console.log(JSON.stringify(re));


            Grid.active(re);     // 表格
            Chart.active(re);    // 柱状图

           var dis = $("#tm-set").css("display");

           //$("#chart-control").css("display",dis);
           $("#chart-control").removeClass("hide");
           $("#chart-control").attr("hasdata","yes");
            clearAllThematic();

            /**
             * 对比图类型
             * @type {{BAR: string, LINE: string, PIE: string}}
             */
            var ComparisonTypes = {
                "BAR": "bar",
                "LINE": "line",
                "PIE": "pie"
            };

            switch (currVisType) {
                case 1:
                    SegmentLayer.createThemantic(re, currentLevel, currRegions);     //分段
                    break;
                case 2:
                    PieLayer.createThematic(re, currentLevel, currRegions);          //等级
                    break;
                case 3:
                    ComparisonLayer.createThematic(re, currentLevel, currRegions, ComparisonTypes.PIE);   //对比统计
                    break;
                case 4:
                    ComparisonLayer.createThematic(re, currentLevel, currRegions, ComparisonTypes.BAR);   //对比统计
                    break;
                case 5: //复合（分段、等级）
                    SegmentLayer.createThemantic(re, currentLevel, currRegions);
                    PieLayer.createThematic(re, currentLevel, currRegions, "two");

                    $(".reglab").css({"color":"rgb(8,22,52)"});
                    break;
            }


    };


    /**
     * 清除
     */
    var clearAllThematic = function () {
        SegmentLayer.destroy();
        PieLayer.destroy();
        ComparisonLayer.destroy();
        ThematicUtil.clearAll();

        var map = layer.getMap();
        var boundaryLayer = map.getLayersByName("bline")[0];
        if (boundaryLayer) {
            if(boundaryLayer.showcolor){
                $(".reglab").css({"color":"rgb(0,0,0)"});
            }else{
                $(".reglab").css({"color":"rgb(0,0,0)"});
            }
        }

    };


    /**
     * ListItem选项列表控制
     */
    var ListItem = (function () {
        var $selection = $("#selection-items");                     //元素列表对象
        var tpl = SGIS.Util.template($selection.html());            //html模板
        var identpl = SGIS.Util.template($("#iden-templet").html());//检索指标html模板
        var cache = new SGIS.Util.Hashtable();                      //已加载的列表缓存
        var checked = new SGIS.Util.Hashtable();                    //已选所有指标列表项
        var items, bread, allItems = [];
        var lastMenuId;                                             //最近表ID
        var _type, _level;                                          //当前选中的报告期类型，级别

        //事件绑定
        (function () {
            //绑定列表项点击事件（目录/表/指标项）
            $selection.delegate("a,div.item", "click", function () {
                var type = $(this).attr("data-type");   //元数据类型
                var id = $(this).attr("data-id");       //节点ID
                var reportType = $(this).attr("reporttype");
                if (type == 3) {                         //指标值
                    //$(this).find('i').toggleClass('empty checked'); //切换勾选

                    $(this).find('i').toggleClass('outline').toggleClass("blue"); //切换勾选


                    var item = $.grep(allItems, function (o) {        //通过单击项ID找到当前点击的数据
                        return o.matmid == id && o.reportType == reportType;
                    })[0];
                    var className = $(this).find('i')[0].className;
                    //var re = new RegExp("checked");
                    var re = new RegExp("outline");

                    var isSelect = className.match(re);             //是否选中  有outline没有选中  ，没有outline是选中
                    if (item) {
                        changeItems(!isSelect, item);                //改变指标选中记录
                        switchBtnStatus();
                    }
                } else {                                  //指标目录/表
                    if (isCheckedPip) return;                        //在已选中指标列表中
                    //目录或表的点击事件 type = 1 | 2
                    var name = $(this).text();
                    var name2 = $(this).attr("data-content");
                    if(name2){
                        name = name2;
                    }

                    lastMenuId = id;                                //上次父节点ID
                    refresh(id, name);                              //重载子列表
                }
            });

            //绑定点击“上一级”
            $("#selection-operator-up").click(function () {
                bread.pop();    //面包屑上级返回
                //修改选择页面的高度
                modifySelItemsHeight();
            });

            //绑定“全选”
            $("#selection-operator-all").click(function () {
                selItems(true);         //全选
                switchBtnStatus();
            });

            //绑定“反选”
            $("#selection-operator-opposite").click(function () {
                selItems(false);        //反选
                switchBtnStatus();
            });

            //绑定"清空选项"（所有）
            $("#selection-operator-clear").click(function () {
                clearAllSel();
            });
        })();


        /**
         * 根据制定指标码获取相应级别的指标
         * @param codes
         */
        var getAppoitItem = function (codes, callback) {
            var key = [currentType, currentLevel];
            SGIS.API.post("macro/Items/level/?", currentLevel).data(JSON.stringify(codes)).json(function (re) {
                if (!re || re.length < 1) {
                    return;
                }
                var parid = "";
                for (var i = 0, len = re.length; i < len; i++) {
                    var meta = re[i];
                    parid = meta.parid;          //获取父id
                    key.push(parid);
                    if (key.length == 3) {
                        key = key.join(",");
                        break;
                    }
                }
                items = createObj(re, parid, "");
                render(items, true);
                //cache.add(key, items); //不加入缓存
                for (i = 0, len = items.length; i < len; i++) {
                    changeItems(true, items[i]); //将这些指标加入选中
                }
                checkedItems();  //勾选已选中指标
                callback && callback();
            });

        }


        /**
         *切换查询按钮状态
         */
        var switchBtnStatus = function () {
            var matmidArr = ListItem.getCurrentIden().keys();
            var len = matmidArr.length;
            $("#query-btns .ui.button").attr("disabled", true);
            if (len == 1) {
                $("#query-btns .button.one").removeAttr("disabled");
            } else if (len == 2) {
                $("#query-btns .button.two").removeAttr("disabled");
            } else if (len > 2) {
                $("#query-btns .button.three").removeAttr("disabled");
            }

            $("#btn-help").removeAttr("disabled");
        };

        /**
         * 切换 全选 反选 按钮状态
         * @param items 根据条件查询到的ListItem内容
         */
        var switchCkStatus = function (items) {
            //清空按钮
            var dis = $("#selection-operator-clear").css("display");
            if (items.length > 0 && items[0].macmetaType == 3) {
                //进入到指标项,全选,反选按钮将会显现出来
                $("#selection-operator-all,#selection-operator-opposite").css("display", dis); // .addClass("link").find("i").removeClass("disabled");
            } else {
                $("#selection-operator-all,#selection-operator-opposite").css("display", "none");//.removeClass("link").find("i").addClass("disabled");
            }
        };


        /**
         * 初始化指标/目录列表
         * @param reportType   选中的报告期类型值
         * @param level  选中的行政级别值
         */
        var init = function (reportType, level) {
            _type = reportType;          //报告期类型值
            _level = level;              //当前级别值

            //元素列表对象,jquery对象
            $selection.empty();          //清空列表子项
            refresh("");                  //显示顶层目录

            if (!bread) {
                //初始化面包屑-捆绑点击事件
                bread = new Bread($("#selection-bread"), breadClick);
                bread.init();
            } else {
                bread.reset();
            }

            //若选中的话，移除以选中个数按钮的选中状态
            $("#select-title.active").removeClass("active");
            //显示当前（报告期/行政级别）选项卡下所选的指标
            $("#select-title span").text(ListItem.getCurrentIden().count() + "指标");
        };


        /**
         * 刷新列表
         *
         * @param parid
         *          当前父节点对象（0代表总结点）
         * @param name
         */
        var refresh = function (parid, name) {
            isCheckedPip = false;
            if (name) {
                bread.push(parid, name);//记录层级目录
                modifySelItemsHeight();
            }
            //报告期类型,行政区划等级,当前节点ID
            var key = [_type, _level, parid].join(",");
            //已加载的列表缓存(Hashtable,key=报告期类型,行政区划等级,当前节点ID)已经存在
            if (cache.contains(key) && cache.items(key).length>0) {
                items = cache.items(key);//设置当前列表数据,返回一个object(Array)

                switchCkStatus(items);
                //初次加载刷新时,是不给第二个参数
                render(items);
                return true;
            }

            if (currSource == "local") {
                SGIS.API.get("/macro/Types/?/Items", _type).data({
                    regionLevel: _level,
                    parid: parid
                }).data(JSON.stringify([])).json(function (re) {
                    items = createObj(re, parid, name);    //设置前次列表数据
                    switchCkStatus(items);
                    render(items);
                    cache.add(key, items);                 //缓存
                });
            } else if (currSource == "api") {
                DataApi.getIdens(currentType, currentLevel, parid, function (re) {
                    items = createObj(re, parid, name);    //设置前次列表数据
                    switchCkStatus(items);
                    render(items);
                    cache.add(key, items);
                });
            } else {
                console.log("【config.js】文件source项配置有误");
            }

        };




        /**
         * 显示列表元素
         *
         * @param items
         *      项列表显示
         * @param isCheckedIden
         *      (false供选，true选中)
         */
        var render = function (items, isCheckedIden) {
            allItems = arrJoin(allItems, items);
            var html = [];
            var leng = items.length;
            for (var i = 0; i < leng; i++) {
                var page = items[i];

                //pc端的操作
                if(SGIS.agent!="client"){
                    var idenName = page.idenName;
                    page.content = "";
                    //如果指标名过长,则进行截断
                    if(idenName&&idenName.length>12){
                        page.content = idenName;
                        var subName = idenName.substring(0,12) + "...";
                        page.idenName = subName;
                    }
                }


                if (isCheckedIden)
                    html.push(identpl(page));               //添加列表项HTML组(已选指标html)
                else
                    html.push(tpl(page));                   //添加列表项HTML组（供选指标html）
            }
            $selection.html(html.join(''));
            $("#sel-panel").removeClass("hide"); //显示选择指标面板
            checkedItems();                                 //对已选指标默认勾选


            $('#sel-panel-idens a.item').popup({
                position:"right center"
            });

            modifySelItemsHeight();

        };

        /**
         * (遍历)列表默认勾选已选中（）指标
         */
        var checkedItems = function () {
            $("#selection-items a, div.item").each(function (i, o) {
                var type = $(this).attr("data-type");       //元数据类型
                var id = $(this).attr("data-id");           //指标ID
                if (type == 3) {
                    var item = $.grep(checked.toArray(), function (obj) {
                        return obj.matmid == id;            //存在已选中
                    })[0];
                    if (item) {
                        var icon = $(this).find('i')[0];
                        //选上
                        icon.className = "flag icon blue";
                    }
                }
            });
        };


        /**
         * 面包屑导航的点击（目录标题点击处理）
         * @param id
         */
        var breadClick = function (id) {
            //清空搜索输入框
            $("#input-iden").val('');
            //隐藏查询结果
            // $("#selection-operator-header").addClass('hide');

            //显示返回上一级
            // $("#selection-operator-up").removeClass('hide');

            refresh(id);                //刷新列表
            modifySelItemsHeight();     //修改列表框样式
        };


        /**
         * 刷新检索指标下列表
         * @param name
         *          检索的内容
         */
        var idenRefresh = function (name) {
            isCheckedPip = false;
            //根据类型、级别、名称片段检索指标相关信息
            SGIS.API.get("/macro/Types/?/Items/query", _type)
                .data({
                    regionLevel: _level,
                    idenName: name
                }).json(function (re) {
                items = re;         //设置当前列表数据
                render(items, true);

                //显示面板
                var box = $("#iden-box");
                if (box.hasClass("hide")) {
                    box.fadeIn();
                    var i = $("#iden-panel .ustool").find("i:visible");
                    i.addClass("hide");
                    i.siblings("i").removeClass("hide");
                }
            });
        };


        /**
         * 列表指标全选OR反选
         *
         * @param fag (true,false)（全选或者反选）
         */
        var selItems = function (fag) {
            $("#selection-items a, #selection-items div.item").each(function (i, o) {
                var type = $(this).attr("data-type");       //元数据类型
                var id = $(this).attr("data-id");           //节点ID
                var item = $.grep(allItems, function (obj) {
                    return obj.matmid == id;                //单击项ID,在上次列表数据内
                })[0];
                //指标点击 type = 3
                if (type == 3) {
                    var icon = $(this).find('i')[0];
                    if (fag) {
                        icon.className = "flag icon blue";
                        changeItems(true, item);            //改变指标选中记录
                    } else {//反选
                        if (!$(icon).hasClass("outline")) {
                            //去选
                            icon.className = "flag outline icon";
                            changeItems(false, item);       //改变指标选中记录
                        } else {
                            //选上
                            icon.className = "flag icon blue";
                            changeItems(true, item);        //改变指标选中记录
                        }
                    }
                }
            });
        };

        /**
         * 改变指标选中记录
         * @param isSelect
         *          是否设置为选中
         * @param item
         *          当前节点
         */
        var changeItems = function (isSelect, item) {
            if (!item) return;
            var id = item.matmid;
            if (isSelect) {
                var selItem = checked.items(id);
                if (!selItem)                   //未存在
                    checked.add(id, item);      //添加选中项
            } else {                            //去掉选中
                checked.remove(id);
            }
            $("#select-title span").text(getCurrentIden().count() + "指标");
        };

        /**
         * 两数组合并，去掉重复项(arr2合并到arr1)
         * 数组内容为obj只是,去重标准为matmid不相等
         * @param arr1
         *          数组1
         * @param arr2
         *          数组2
         * @returns {*} 仍是一个数组
         */
        var arrJoin = function (arr1, arr2) {
            var all = arr1;
            var size = arr1.length;
            var leng = arr2.length;
            for (var i = 0; i < leng; i++) {
                //判断arr2中的元素,arr1中是否存在
                var fag = false;
                for (var j = 0; j < size; j++) {
                    if (arr1[j].matmid == arr2[i].matmid) {
                        fag = true;
                        break;
                    }
                }
                if (!fag) all.push(arr2[i]);
            }
            return all;
        };

        /**
         * 创建记录父节点信息的指标列表
         * @param items
         *          结果指标项
         * @param parid
         *          父节点（表）ID
         * @param name
         *          父名称
         * @returns 数组对象
         * */
        var createObj = function (items, parid, name,_reportType,_regionLevel) {
            if (!items) return [];
            var arr = new Array();
            var leng = items.length;
            for (var i = 0; i < leng; i++) {
                var obj = items[i];
                //
                //if(obj.name){
                //    obj.idenName = obj.name;
                //    obj.idenCode = obj.code;
                //    obj.idenUnit = obj.unit;
                //    obj.reportType = _reportType;
                //    obj.regionLevel = _regionLevel || 2;
                //    obj.matmid = obj.code+ "_" +_reportType;
                //
                //    //判断是指标还是分类
                //    var nodesort = obj.nodesort;
                //    if(nodesort==1 || nodesort == 2 || nodesort==3){
                //        obj.macmetaType = 3;
                //    }else {
                //        obj.macmetaType = 1;
                //    }
                //
                //    //Nodesort：
                //    //0（分类，大类）、4（表）
                //    //1，	有值指标；2，有值指标（分层 GDP、1、2、3GDP）；
                //    //3，这一层没有指标，下一层有值；
                //
                //}


                //指标项，记录父节点
                if (obj.macmetaType == 3) {
                    obj.tableName = !name ? "" : name;
                    obj.tableId = !parid ? 0 : parid;
                    obj.dirId = 0;
                    obj.dirName = "";
                }
                arr.push(obj);
            }
            return arr;
        };

        /**
         * 根据当前报告期类型、行政级别，筛选当前选中指标
         * 每选一次指标都将会调用一次这个函数
         * @returns hash对象
         */
        var getCurrentIden = function () {
            //已加载多层列表缓存
            var hash = new SGIS.Util.Hashtable();

            //当前所有选中指标空或不存在 checked也是Hashtable类型
            if (!checked || checked.count() < 1)
                return hash;
            //将已选指标变成数组格式(value值)
            var items = checked.toArray();
            var leng = items.length;
            for (var i = 0; i < leng; i++) {
                var obj = items[i];
                var id = obj.matmid;
                //报告期类型、行政级别匹配
                if (obj.reportType == 0)
                    continue;
                //当前级别
                if (obj.regionLevel == currentLevel) {
                    //当前报告期类型
                    if (obj.reportType == currentType) {
                        //判断是否能够取到值
                        var isOk = hash.items(id);
                        if (!isOk)
                            hash.add(id, obj);                      //添加选中项
                        /**此处注意，若不是月报或者季报类型的，也作为同一报告期类型****/
                    } else if (obj.reportType != 12 && obj.reportType != 13 &&
                        currentType != 12 && currentType != 13) {    //年份类（非月报，季报）
                        var isOk = hash.items(id);
                        if (!isOk)
                            hash.add(id, obj);                      //添加选中项
                    }
                }
            }
            return hash;
        };

        /**
         * 重置面包屑导航
         */
        var resetBread = function () {
            if (bread)
                bread.reset();
        };

        /**
         * 面包屑文件过长时导致查询按钮被挤出，所以每次点击分类或者表、
         * 首页、返回上一层都要调用该方法，保证高度自适应
         */
        var modifySelItemsHeight = function () {
            var minus = $("#selection-bread").height() - 15;
            //var h = $("#module-container").height();
            var h = $("#iden-panel").height();
            if(h<10){
                h = $("body").height();
            }
            //$("#selection-items").height(h - 315 - (minus > 0 ? minus + 5 : 5));


            //
            //if(SGIS.agent == "client"){
            //    var hei =$("body").height();
            //    var breadH = $("#selection-bread").height();
            //    var selItmesH = $("#selection-items").height();
            //    $("#sel-panel").height(breadH+selItmesH+20-1);
            //    var maxH = hei - 160;
            //    $("#sel-panel").css("max-height",maxH);
            //}




        };

        /**
         * 清除所有选中指标、初始左侧面板
         */
        var clearAllSel = function () {
            //清空左侧面板 所有选中指标
            checked.clear();
            $("#select-title span").text("0指标");
            //初始综合查询左侧面板
            $("#selection-items").html("");
            ListItem.init(currentType, currentLevel);

            switchBtnStatus();
        };

        return {
            init: init,
            checked: checked,
            render: render,
            idenRefresh: idenRefresh,
            getCurrentIden: getCurrentIden,
            resetBread: resetBread,
            createObj: createObj,
            clearAllSel: clearAllSel,
            getAppoitItem: getAppoitItem
        }
    })();	//ListItem end


    var toggleLegend = function () {
        SegmentLayer.toggleLegend();
        PieLayer.toggleLegend();
        ComparisonLayer.toggleLegend();
    };

    var hideLegend = function () {
        SegmentLayer.hideLegend();
        PieLayer.hideLegend();
        ComparisonLayer.hideLegend();
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
        var datanodes = re.datanodes;var wdnodes = re.wdnodes;

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
    }

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


    //获取时间设置值
    var getTimeVal = function () {
        if($(".range-slider").length>0){
            var tm = $(".range-slider").val();
            return tm.split(",");
        }else{
            return "";
        }
    };


    return {
        init: init,
        clearAllThematic: clearAllThematic,
        clearAllSel: ListItem.clearAllSel,
        toggleLegend: toggleLegend,
        hideLegend:hideLegend
    }
});
