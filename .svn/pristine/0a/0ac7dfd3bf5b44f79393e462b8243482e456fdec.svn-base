/**
 * 综合数据导入
 */
define(function(require , exports , module){
    var common = require("component/common");
    var File = require("component/file");
    var Modal = require("component/modal");

    var catalogTreeDiv ="catalog-tree",
        excelGridDiv="excel-grid",
        selIndGridDiv ="selInd-grid",
        impIndGridDiv ="impInd-grid";


    var init =function(){
        $(window).resize(SGIS.Util.throttle(function(){
            var h = $("body").height();
            $("#"+catalogTreeDiv).height(h-56-147-10);
            $("#"+excelGridDiv).height(200);
            $("#sel-ind-div,#imp-data-div").height(h-214-200);

            $("#"+selIndGridDiv+",#"+impIndGridDiv).height(h-214-220).css("width","100%");
            Import.resize() ;
        }, 200)).resize();

        Catalog.init() ;
        Import.init() ;
    };


    /**
     * 左侧目录树的操作
     */
    var Catalog = (function(){

        var tree ;//目录树
        var currLevel,currReportType;

        var init = function(){

            $("select[name='tregioncatalog.rcid']").change(function(){
                getLevels($(this).val());
            });

            $("#reportType,#level").change(function(){
                var reportType =$("#reportType option:selected").val();
                var level = $("#level option:selected").val() ;

                if($(this).attr("id") == "reportType"){
                    Import.checkTimeDisplay(reportType);
                    getCatalogTree(reportType,level,null);
                }else{
                    var dataType = $("input[name=dataType]:checked").val() ;
                    var callback = null ;
                    if(dataType =="sum"){
                        callback = Import.getRegions
                    }
                    getCatalogTree(reportType,level,callback);
                }
            });

            getCatalogs();

        };

        //初始化区划类别
        var getCatalogs = function(){
            SGIS.API.get("regionCatalogs/valid").json(function(re){
                var first ;
                $("select[name='tregioncatalog.rcid']").each(function(){
                    var templ = $(this).html();
                    var html = "";
                    var leng = re.length;
                    for(var i =0 ; i < leng; i++){
                        i==0 && (first = re[i].rcid);
                        html += SGIS.Util.template(templ,re[i]);
                    }
                    $(this).html(html) ;
                });
                if(first){
                    getLevels(first);
                }
            });
        };

        //初始化区划级别
        var getLevels = function(catalogId){
            if(!catalogId){ return ;}
            SGIS.API.get("regionCatalogs/"+catalogId+"/maxlevel")
                .text(function(id){
                    $("#level option").each(function(){
                        var val = $(this).val();
                        if(val>=id){
                            $(this).removeClass("hide");
                        }else{
                            $(this).addClass("hide");
                        }
                    })
                    var sel = $("#level option:not(.hide):eq(0)") ;
                    sel.attr("selected","selected");

                    var reportType =$("#reportType option:selected").val();
                    getCatalogTree(reportType,sel.val());

                    Import.checkTimeDisplay(reportType);
            });
        };

        //绑定目录树节点事件
        var attachEvents = {
            onClick: function (id) {
                var metaType = tree.getUserData(id,"metaType") ;
                if(metaType == 2){
                    Import.getTableInds(id) ;
                }else{
                    Import.clear() ;
                }
            }
        };

        /**
         * 获取指标目录树
         * @param reportType
         * @param regionLevel
         * @param callback
         */
        var getCatalogTree = function(reportType,regionLevel,callback){
            if(!reportType||!regionLevel||regionLevel<1||regionLevel>6){
                tree&&tree.destructor();
                return ;
            }
            SGIS.API.get("/macro/Types/?/rootItems", reportType)
                .data({
                    regionLevel: regionLevel
                }).json(function (re) {
                    tree&&tree.destructor();
                    tree = SGIS.Tree.create(catalogTreeDiv, re, attachEvents, lazyLoad);
                    currLevel = regionLevel ;
                    currReportType = reportType ;
                    callback&&callback();
                });
        };

        /**
         * 指标目录树子节点
         * @param itemid
         * @param obj
         */
        var addTreeNode = function (itemid, obj) {
            SGIS.API.get("/macro/Types/?/leafItems", currReportType)
                .data({
                    itemid: itemid
                }).json(function (param) {
                    if (param != null && param != "") {
                        obj.loadXMLString(param);
                    }
                });
        };

        var lazyLoad = function (obj, id) {
            onpenStartTree(obj, id);
        };

        var onpenStartTree = function (obj, id) {
            if (hasTempNode(obj, id)) {
                obj.deleteChildItems(id);
                addTreeNode(id, obj);
            }
        };
        /**
         * 判断是否还有load节点
         * @param obj
         * @param id
         * @returns {boolean}
         */
        var hasTempNode = function (obj, id) {
            var tempnode = obj.getAllSubItems(id).indexOf("load");
            if (tempnode == 0) {
                return true;
            }
        };

        /**
         * 获取表id
         * @returns {*}
         */
        var getTableId = function(){
            if(tree){
                return tree.getSelectedItemId();
            }
            return -1;
        };

        return{
            init :init,
            getTableId:getTableId
        }
    })();


    /**
     * 数据导入操作
     */
    var Import =(function(){

        var init = function(){
            $("input[name=dataType]").change(function(){
                var checked = $(this).val();
                $(".row.sum,.row.region").addClass("hide");
                $(".row."+checked).removeClass("hide");
                if(checked =="sum"){
                    getRegions();
                }
            });
            initYears() ;  //初始化年份 加载近十年
            Indicators.init() ;
            Excel.init();
            Data.init() ;
        };

        //显示近十年的年份
        var initYears = function(){
            var year = new Date().getFullYear();
            var templ = $("#years").html();
            var html ="";
            for(var i=0 ; i < 15 ;i++){
                var o ={
                    "year":(year-i)
                };
                html +=SGIS.Util.template(templ,o);
            }
            $("#years").html(html) ;
        };

        var getRegions = function(){
            var catalogId = $("#catalogs option:selected").val();
            var level = $("#level option:selected").val();
            if(!catalogId||!level){
                $("#regions").html("");
                return ;
            }
            var templ = "<option value='{{regioncode}}'>{{name}}</option>";
            SGIS.API.post("/regionCatalogs/?/regions", catalogId)
                .data({ "regionLevel" :level})
                .json(function(re){
                    var html ="";
                    for(var i =0 ; i < re.length ; i++){
                        html += SGIS.Util.template(templ,re[i]) ;
                    }
                    $("#regions").html(html);
                })
        };

        //根据数据类型显示时间选择 年报年份 月报年月 季报年季
        var checkTimeDisplay = function(reportType){
            $(".region.row .form-group").removeClass("hide");
            if(reportType == "1"||reportType == "2"
                ||reportType == "3"||reportType == "4"||reportType == "11"){
                $(".region.row .form-group.months").addClass("hide");
                $(".region.row .form-group.seasons").addClass("hide");

            }else if(reportType == "12"){
                $(".region.row .form-group.months").addClass("hide");

            }else if(reportType == "13"){
                $(".region.row .form-group.seasons").addClass("hide");
            }
        };


        /**
         * excel表格相关操作
         */
        var Excel =(function(){
            var excelGrid;
            var file,setColModal ;
            var _fileName ;
            var _currColIndex ;

            var init = function(){
                file = new File("file",function(re){
                    _fileName = re.fileName ;
                    getExcelSheets(re.sheets);
                });
                setColModal = new Modal("set-col-modal","设置列");

                $("#sheetList").change(function(){
                    var sheetName = $(this).find("option:selected").text();
                    getExcelAllData(sheetName);
                });

                $("#set-col-modal input[name=colradio]").click(function(){
                    var val = $(this).val();
                    setCol(val);
                });
            };

            /**
             * 读取Excel的sheet
             * @param re
             */
            var getExcelSheets = function(re){
                var par = $("#sheetList");
                var templ ="<option value='{{index}}'>{{name}}</option>";
                var html = "";
                var leng = re.length;
                for(var i =0 ; i < leng; i++){
                    html += SGIS.Util.template(templ,re[i]);
                }
                par.html(html);

                var sheetName = $(this).find("option:selected").text();
                if(!sheetName){
                    getExcelAllData(sheetName);
                }
            };

            /**
             * 读取Excel数据
             * @param sheetName
             */
            var getExcelAllData= function(sheetName){
                SGIS.UI.addLoadingBar0("正在读取excel数据...");
                SGIS.API.get("common/sheet/data")
                    .data({
                        "sheetName":sheetName,
                        "fileName":_fileName
                    }).json(function(re){
                        SGIS.UI.clearLoadingBar0();
                        excelGrid&&excelGrid.destructor();
                        creatGrid(re);
                    });
            };

            //获取最大列数目
            var getMaxLen = function(re){
                var max = 0 ;
                var leng = re.length;
                for(var i =0 ; i < leng; i++){
                    var len = re[i].length ;
                    max = len>max?len:max;
                }
                return max ;
            };

            var creatGrid = function(re){
                if(re.length==0){
                    return ;
                }
                var len = getMaxLen(re) ;
                var header ="";
                var widths ="";
                var aligns ="";
                var headTempl ="<a class='setCol' index='{{index}}' href='#'>设置第{{index}}列</a>";
                var flag = false ;
                for(var i =0 ;i < len ;i++){
                    header +=(flag?",":"") +headTempl.replace("{{index}}",i+1).replace("{{index}}",i+1);
                    widths +=(flag?",":"")+"100";
                    aligns +=(flag?",":"")+"left";
                    flag = true ;
                }
                excelGrid = SGIS.Grid.create(excelGridDiv);
                excelGrid.setHeader(header);
                excelGrid.setInitWidths(widths);
                excelGrid.setColAlign(aligns);
                excelGrid.attachEvent("onRowSelect",function(id){
                    var rowIndex =excelGrid.getRowIndex(id);
                    Data.set(rowIndex,"startRow") ;
                    $("#hasStartRow")
                        .removeClass("btn-inverse")
                        .addClass("btn-primary");
                     SGIS.UI.alert("选择第"+(rowIndex+1)+"行为起始行","info");
                });
                excelGrid.init();
                excelGrid.parse(re,"jsarray");
                showGrid(true);
                Data.reset();//数据重新加载需重置参数
                bindHeaderEvent("set");
                return excelGrid ;
            };

            var setCol = function(type){
                if(!_currColIndex){ return ;}
                var newLabel ="";
                var flag = false ;
                if(type ==  "region"){
                    var col =Data.get("regionCol") ;
                    if( col!=-1){
                        SGIS.UI.alert("不能重复设置行政区划列，请先移除第"+col+"列");
                        setColModal.hide();
                        return ;
                    };
                    newLabel ="<strong>行政区划列</strong> ";
                    flag = true ;
                }else if(type == "start"){
                    var col =Data.get("startCol") ;
                    if( col!=-1){
                        SGIS.UI.alert("不能重复设置数据起始列，请先移除第"+col+"列");
                        setColModal.hide();
                        return ;
                    };
                    newLabel ="<strong>数据起始列</strong> ";
                    flag = true ;
                }
                if(!flag){ return  ;}
                newLabel +="<a class='removeColSet' index='{{index}}' type='{{type}}' href='#'>移除</a>";
                newLabel = newLabel.replace("{{type}}",type);
                newLabel= newLabel.replace("{{index}}",_currColIndex);
                excelGrid.setColLabel(_currColIndex-1,newLabel);
                Data.set(_currColIndex-1,type=="region"?"regionCol":"startCol");
                $("#has"+(type=="region"?"RegionCol":"StartCol"))
                    .removeClass("btn-inverse")
                    .addClass("btn-primary");
                bindHeaderEvent("remove");
                setColModal.hide();
            };

            var removeColSet = function(colIndex,type){
                var newLabel ="<a class='setCol' index='{{index}}' href='#'>设置第{{index}}列</a>";
                newLabel= newLabel.replace("{{index}}",colIndex);
                newLabel= newLabel.replace("{{index}}",colIndex);
                excelGrid.setColLabel(colIndex-1,newLabel);
                $("#has"+(type=="region"?"RegionCol":"StartCol"))
                    .removeClass("btn-primary")
                    .addClass("btn-inverse");
                bindHeaderEvent("set");
            };

            var bindHeaderEvent = function(type){
                if(type == "set"){
                    $("a.setCol").unbind();
                    $("a.setCol").bind("click",function(){
                        var index = $(this).attr("index") ;
                        _currColIndex = index ;
                        setColModal.show();
                    });
                    return ;
                }
                if(type == "remove"){
                    $("a.removeColset").unbind("click");
                    $("a.removeColset").bind("click",function(){
                        var type = $(this).attr("type") ;
                        var colIndex = $(this).attr("index") ;
                        _currColIndex = colIndex ;
                        removeColSet(colIndex,type);
                        Data.clear(type=="region"?"regionCol":"startCol");
                    });
                    return ;
                }
            };

            var showGrid = function(isshow){
                if(isshow){
                    $("#impInstruments").addClass("hide");
                    $("#excel-grid").removeClass("hide");
                }else{
                    $("#impInstruments").removeClass("hide");
                    $("#excel-grid").addClass("hide");
                }
            };

            var clear = function(){
                showGrid(false);
            };

            var getFileName = function(){
                return _fileName ;
            };
            var resize=function(){
                excelGrid&&excelGrid.setSizes();
            };

            return{
                init: init,
                getFileName:getFileName,
                clear:clear,
                resize:resize
            }
        })();


        /**
         * 选择指标相关操作
         */
        var Indicators = (function(){
            var selIndGrid ,impIndGrid ;
            var groupModal ;
            var groupGrid ;
            var _isInitIdent = false ;//枚举分组只需要获取一次
            var _selNum =0;

            var init = function(){

                groupModal = new  Modal("set-group-modal","设置分组");

                $("#set-group-cancel").click(function(){
                    setGroupOk("0");
                });

                $("#selInd-ok").click(function(){
                    selIndOk();
                });

                initGrid();

                $("#selInd-op-reset").click(function(){
                    selIndReset();
                });
                $("#selInd-op-clear").click(function(){
                    selIndClear() ;
                });

                $("#imp-op-checkall").click(function(){
                    impIndCheckAll();
                });

            };

            var initGrid = function(){
                selIndGrid = SGIS.Grid.create(selIndGridDiv);
                selIndGrid.setHeader('指标名称,指标代码,宾栏分组 <a href="#" id="selInd-op-reset">重置</a>,' +
                    '<a href="#" id="selInd-op-clear">删除所有</a>');
                selIndGrid.setInitWidths("200,200,200,*");
                selIndGrid.setColSorting("na,na,na,na");
                selIndGrid.setColAlign("left,left,left,left");
                selIndGrid.enableMultiselect(true);
                selIndGrid.init();

                impIndGrid = SGIS.Grid.create(impIndGridDiv);
                impIndGrid.setHeader('<a id="imp-op-checkall" href="#">全选</a>,待导入指标列表,操作');
                impIndGrid.setInitWidths("100,300,*");
                impIndGrid.setColTypes("ro,ro,ro");
                impIndGrid.setColSorting("na,na,na");
                impIndGrid.setColAlign("center,left,left");
                impIndGrid.enableDragAndDrop(true);
                impIndGrid.attachEvent("onRowSelect",doOnRowSelected);
//                impIndGrid.attachEvent("onCheck", function(){
//                impIndGrid.check();
//                });
                impIndGrid.init();

                groupGrid = SGIS.Grid.create("groupGrid");
                groupGrid.setHeader('分组编码,分组名称,备注');
                groupGrid.setInitWidths("100,200,*");
                groupGrid.setColSorting("na,na,na");
                groupGrid.setColAlign("left,left,left");
                groupGrid.attachEvent("onRowSelect", function(id){
                    setGroupOk(id);
                });
                groupGrid.init();
            };

            var doOnRowSelected = function(id){
                if(_selNum<3){
                    SGIS.UI.alert("操作提示:请拖拽表格调整顺序");
                }
                _selNum++ ;
            };

            //初始化分组值
            var initIdents= function(matmid){
                SGIS.API.get("macro/enum/info/?",matmid).json(function(re){
                    var id ="tmacroIdent.maitid";
                    var fields =["tmacroIdent.maitid","name","memo"];
                    var d = common.jsonToGridData(re,id,fields,false);
                    groupGrid&&groupGrid.clearAll();
                    groupGrid&&groupGrid.parse(d,"json");
                });

            };

            //左侧树 表点击事件
            var getTableInds = function(parid){
                var reportType = $("#reportType option:selected").val();
                var level  = $("#level option:selected").val();
                if(!reportType||!level){
                    clear();
                    return ;
                }
                SGIS.API.get("macro/Types/?/Items",reportType).data({
                    "parid":parid,
                    "regionLevel":level
                }).data(JSON.stringify([]))
                    .json(function(re){
                        var id ="matmid";
                        var fields =["idenName","idenCode"];
                        var d = common.jsonToGridData(re,id,fields,false);
                        d = operSelIndGridData(d) ;
                        selIndGrid&&selIndGrid.clearAll();
                        selIndGrid&&selIndGrid.parse(d,"json");
                        setIndGridUserData(d.rows);
                        //设置分组弹出框
                        $("a.set-group-cell").click(function(){
                            var id = $(this).attr("rowid");
                            openGroupModal(id) ;
                        });
                        $("a.selInd-del-cell").click(function(){
                            var id = $(this).attr("rowid");
                            selIndGrid.deleteRow(id) ;
                        });
                        $("#myTab li:eq(0) a").tab("show");
                    });
            };

            var setIndGridUserData = function(d){
                for(var i =0  ; i< d.length ; i++){
                    var id = d[i].id ;
                    var userData = d[i].data ;
                    selIndGrid.setUserData(id,"data",userData);
                }
            };

            var openGroupModal = function(id){
                initIdents(id) ;
                groupModal.show();
            };

            //处理选择指标的grid数据 添加分组按钮 和删除按钮
            var operSelIndGridData = function(d){
                var gData = d ;
                var setGroupBtn ="<a class='set-group-cell' rowid='{{matmid}}'>设置分组</a>";
                var removeIndBtn = "<a  class='selInd-del-cell' rowid='{{matmid}}'>删除</a>";
                for(var i = 0 ; i< gData.rows.length ; i++){
                    var o ={"matmid":gData.rows[i].id};
                    gData.rows[i].data.push(SGIS.Util.template(setGroupBtn,o));
                    gData.rows[i].data.push(SGIS.Util.template(removeIndBtn,o));
                }
                return gData ;
            };

            var setGroupOk = function(groupid){
                var selIndId=selIndGrid.getSelectedRowId();
                var text = groupid!="0"?" "+groupGrid.cellById(groupid,1).getValue():"";
                var selCell = selIndGrid.cellById(selIndId,2) ;
                var td = selCell.cell ;
                var old = td.getElementsByTagName("strong");
                if(old.length >0){
                    td.removeChild(old[0]);
                }
                var span = document.createElement("strong");
                span.innerHTML =text ;
                td.appendChild(span);
                selIndGrid.setUserData(selIndId,"groupid",groupid);
                groupModal.hide();
            };

            var selIndReset = function(){
                if(!selIndGrid){
                    return ;
                }
                selIndGrid.forEachRow(function(id){
                    var selCell = selIndGrid.cellById(id,2) ;
                    var td = selCell.cell ;
                    var old = td.getElementsByTagName("strong");
                    if(old.length >0){
                        td.removeChild(old[0]);
                    }
                    selIndGrid.setUserData(id,"groupid","0");
                });
            };

            var selIndClear = function(){
                clear() ;
            };

            var _orderNum = 0;//导入指标确定好顺序记录
            //确定指标
            var selIndOk = function(){
               if(!selIndGrid){
                   return ;
               }
                _orderNum = 0;
                impIndGrid&&impIndGrid.clearAll();
               var checkbox ="<input  type='checkbox' checked class='impIndCheck'>";
               var impGridData = new Array() ;
               var impUserData = new Array();
               selIndGrid.forEachRow(function(id){
                   //这么取不安全吧？？
//                   var name = selIndGrid.cellById(id,0).getValue();
//                   var code = selIndGrid.cellById(id,1).getValue();
                   var data = selIndGrid.getUserData(id,"data");
                   var rIndex = selIndGrid.getRowIndex(id) ;
                   var name = data[0];
                   var code = data[1];
                   var groupId = selIndGrid.getUserData(id,"groupid");
                   groupId = groupId==null?"0":groupId;
//                   var operText = getOkCellText(id);
                   var operText = "";
                   var d ={},uD={};
                   d.id = id ;
                   d.data = [checkbox,name,operText] ;
                   uD.id =id;
                   uD.data ={
                       "matmid":id,
                       "idenCode":code,
                       "groupId":groupId
                   };
                   impGridData.push(d);
                   impUserData.push(uD) ;
//                   impIndGrid.addRow(id,[checkbox,name,operText],rIndex);
//                   impIndGrid.setUserData(id,"data",{
//                       "matmid":id,
//                       "idenCode":code,
//                       "groupId":groupId
//                   });
               });
                impIndGrid&&impIndGrid.clearAll(false);
                impIndGrid&&impIndGrid.parse({rows:impGridData},"json");
                for(var i =0; i<impUserData.length;i++){
                    var o = impUserData[i] ;
                    impIndGrid.setUserData(o.id, "data",o.data);
                }
//                bindOKOrderEvent() ;

                $("#myTab li:eq(1) a").tab("show");
            };

            var getOkCellText = function(id){
                var operTempl = "<a class='setOrder' rowid='{{id}}'>确定 </a>"
                    +"<a class='moveup' rowid='{{id}}'>上移 </a> | "
                    +"<a class='movedown' rowid='{{id}}'>下移 </a> ";
                return SGIS.Util.template(operTempl,{"id":id});
            };

            var getCancleCellText = function(id){
                var templ = "<a class='cancleOrder' rowid='{{id}}'>取消</a> |"
                    +"<a class='moveup' rowid='{{id}}'>上移 </a> | "
                    +"<a class='movedown' rowid='{{id}}'>下移 </a> ";
                ;
                return SGIS.Util.template(templ,{"id":id});
            };

            var bindOKOrderEvent =function(){
                $("a.setOrder").unbind("click");
                $("a.setOrder").bind("click",function(){
                    var id = $(this).attr("rowid");
                    var isOrder = impIndGrid.getUserData(id,"isOrder");
                    if(isOrder&&isOrder!=""){ return ;}
                    moveRow(id,_orderNum);
                    _orderNum++;
                    var newCellText = getCancleCellText(id);
                    var cell = impIndGrid.cellById(id,2).cell;
                    cell.innerHTML = newCellText ;
                    bindCancelOrderEvent();
                });
                $("a.moveup").unbind("click");
                $("a.moveup").bind("click",function(){
                    var id = $(this).attr("rowid");
                    impIndGrid.moveRowUp(id);
                });
                $("a.movedown").unbind("click");
                $("a.movedown").bind("click",function(){
                    var id = $(this).attr("rowid");
                    impIndGrid.moveRowDown(id);
                });
            };

            var bindCancelOrderEvent = function(){
                $("a.cancleOrder").unbind("click");
                $("a.cancleOrder").bind("click",function(){
                    var id = $(this).attr("rowid");
                    var isOrder = impIndGrid.getUserData(id,"isOrder");
                    if(isOrder&&isOrder!=""){
                        impIndGrid.setUserData(id,"isOrder","");
                    }
                    moveRow(id,_orderNum);
                    _orderNum--;
                    var newCellText = getOkCellText(id);
                    var cell = impIndGrid.cellById(id,2).cell;
                    cell.innerHTML = newCellText ;
                    bindOKOrderEvent();
                });
                $("a.moveup").unbind("click");
                $("a.moveup").bind("click",function(){
                    var id = $(this).attr("rowid");
                    impIndGrid.moveRowUp(id);
                });
                $("a.movedown").unbind("click");
                $("a.movedown").bind("click",function(){
                    var id = $(this).attr("rowid");
                    impIndGrid.moveRowDown(id);
                });
            };

            var impIndCheckAll = function(){
                impIndGrid.forEachRow(function(id){
                    var cell = impIndGrid.cellById(id,0);
                    var element = cell.cell ;
                    var checkbox = element.getElementsByTagName("input");
                    checkbox[0].checked =true ;
                })

            };

            var moveRow = function(rowId ,endRowIndex){
                if(!impIndGrid){ return ;}
                var index = impIndGrid.getRowIndex(rowId) ;
                var dis = index - endRowIndex ;
                var pace = dis<0?Math.abs(dis+1):Math.abs(dis);
                for(var i=0; i<  pace;i++){
                    if(dis >0){
                        impIndGrid.moveRowUp(rowId);
                    }else{
                        impIndGrid.moveRowDown(rowId);
                    }
                }
            };

            var generateIndParam = function(){
                var params = new Array();
                var count=impIndGrid.getRowsNum();
                //foreachrow的顺序是最开始的顺序
                for(var rIndex =0;rIndex< count ;rIndex++){
                    var id = impIndGrid.getRowId(rIndex) ;
                    var isChecked = $(".impIndCheck:eq("+rIndex+")").get(0).checked;
                    if(!isChecked){
                        continue ;
                    }
                    var data = impIndGrid.getUserData(id,"data");
                    params.push(data);
                }
                return params ;
            };

            var clear = function(){
                selIndGrid&&selIndGrid.clearAll();
                impIndGrid&&impIndGrid.clearAll();
            };

            var resize =function(){
                selIndGrid&&selIndGrid.setSizes();
                impIndGrid&&impIndGrid.setSizes();
            };


            return {
                getTableInds:getTableInds,
                clear :clear,
                init:init,
                openGroupModal:openGroupModal,
                generateIndParam:generateIndParam,
                resize:resize
            }
        })();

        /**
         * 数据导入相关
         */
        var Data =(function(){
            var _running = false ;
            //构建的参数对象
            var _params={
                "startRow":-1,
                "startCol":-1,
                "regionCol":-1
            };

            var init =function(){
                $("#startImp-btn").click(function(){
                    if(_running){
                        SGIS.UI.alert("正在导入，不能重复提交","dange");
                        return ;
                    }
                    importStart();
                });


            };
            var get =function(name){
                return _params[name] ;
            };

            var set = function(index,name){
                _params[name] =  index ;
            };

            var clear =function(name){
                _params[name] =  -1 ;
            };

            var createProxy = function(){
                _params.matmid = Catalog.getTableId() ;
                if(_params.matmid== -1){
                    SGIS.UI.alert("请选择要导入数据的综合表");
                    return ;
                }
                _params.reportType = $("#reportType").val();
                _params.catalogId = $("#catalogs").val();
                _params.regionLevel = $("#level").val();
                _params.excelFormat = $("input[name=dataType]:checked").val();
                _params.year = $("#years").val();
                _params.month = "0";
                //季报
                if( _params.reportType =="12"){
                    _params.month = $("#seasons").val();
                }
                //月报
                else if( _params.reportType == "13"){
                    _params.month = $("#months").val();
                }
                _params.fileName =Excel.getFileName();
                _params.sheetName =$("#sheetList option:selected").text();
                _params.indicators = Indicators.generateIndParam() ;
                return _params ;
            };

            var importStart = function(){
                var params =createProxy() ;
                if(!checkParams(params)){
                    return ;
                }
                _running = true ;
                SGIS.UI.addLoadingBar0("正在导入...请稍后");
                SGIS.API.post("macro/data/import")
                    .data(JSON.stringify(params))
                    .text(function(re){
                        _running = false ;
                        SGIS.UI.clearLoadingBar0();
                        SGIS.UI.alert0(re);
                        var errorNum = re.substring(re.indexOf(";有")+2,re.indexOf("条数据导入失败"));
                        console.log(errorNum)
                        errorNum = parseInt(errorNum) ;
                        if(errorNum>0){
                            SGIS.Util.downloadData("ifr-download",SGIS.API.getURL("common/download/excel"))
                        }
                    })
            };

            var checkParams = function(params){
                if(!params.fileName||!params.sheetName){
                    SGIS.UI.alert("请选择导入文件");
                    return false;
                }
                if(params.startRow==-1){
                    SGIS.UI.alert("请先设置起始行");
                    return false;
                }
                if(params.startCol==-1){
                    SGIS.UI.alert("请先设置起始列");
                    return false;
                }
                if(params.regionCol ==-1){
                    SGIS.UI.alert("请先设置区划列");
                    return false;
                }

                return true ;
            };


            var reset = function(){
                _params={
                    "startRow":-1,
                    "startCol":-1,
                    "regionCol":-1
                };
            };

            return{
                init :init,
                get : get ,
                set : set ,
                clear:clear,
                reset:reset
            }
        })();

        var resize = function(){
            Excel.resize();
            Indicators.resize();
        };

        return{
            init : init,
            resize:resize,
            checkTimeDisplay:checkTimeDisplay,
            getRegions:getRegions,
            getTableInds:Indicators.getTableInds,
            clear :Indicators.clear,
            openGroupModal:Indicators.openGroupModal
        }

    })();


    return{
        init :init
    }
})