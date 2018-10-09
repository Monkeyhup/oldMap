/**
 * Created by Augustine on 2014/9/1.
 */
define(function(require,exports,module){
    var common = require("component/common");
    var Modal = require("component/modal");
    var File = require("component/file");

    var ct = {
        toc:"toc",
        table:"table",
        iden:"iden"
    };

    //Modal设置
    var ModalSet = {
        sm:{
            size:"sm",
            fade:true
        },
        md:{
            size:"md",
            fade:true
        }
    }

    var UIInit = function(){
        $("#right_content div").first().css("display","block"); // 默认显示第一项 目录管理

        $(window).resize(SGIS.Util.throttle(function(){
            var h = $(window).height();
            $("#mix-tree").height(h- 156 -30);
            $(".grid-container").height(h- 100 -20);
            $("#copy-tree").height("250px");
        }, 200)).resize();

        Toc.init();
        // /初始化枚举分类模块
        enumCatalog.init();
    };

    /**
     * 右侧界面控制
     * @param currentType
     */
    var rightContent = function(currentType){
        var rc = $("#right_content");
        rc.find(".row.catalog,.row.table,.row.iden").addClass("hide");
        var head ="分类管理";
        switch (currentType){
            case ct.toc:
                head ="分类管理";
                $(".row.catalog .toc").removeClass("disabled");
                $(".row.catalog").removeClass("hide");
                Gtable.destroy();
                Giden.destroy();
                break;
            case ct.table:
                head ="分类和表管理";
                $(".row.catalog").removeClass("hide");
                $(".row.table").removeClass("hide");
                Gtoc.destroy();
                Giden.destroy();
                break;
            case ct.iden:
                head ="指标管理";
                $(".row.iden").removeClass("hide");
                Gtoc.destroy();
                Gtable.destroy();
                break;
            default :
                head ="分类管理";
                $(".row.catalog").removeClass("hide");
        }
        rc.find(".operhead").html(head);
    };

    /**
     * 分类、表  目录树构建  操作 带checkbox和不带checbox一起管理
     */
    var Toc = (function(){
        var mixTree,copyTree;
        var _selId, _selMetaType;
//
        var type = "#data-type";
        var level = "#data-level";

        var c_type = "#c_data-type",//复制指标里的
            c_level ="#c_data-level";

        var reportType =$(type).val() ,
            regionLevel=$(level).val();

        var c_reportType =$(type).val() ,//复制指标里的
            c_regionLevel=$(level).val();

        var type_no ="1"; //类型 是否为复制里的
        var type_copy="2";
        var isCopyInit = false ;

        var _currentTree = type_no ;

        var init = function(){
            $(type+","+c_type).on("change",function(){
               var type = $(this).attr("data-value");
               if(type == type_no){
                   reportType = $(this).val();
                   initTree(type);
                   rightContent(ct.toc);
//                   Gtoc.init();
               }else if(type == type_copy){
                   c_reportType   = $(this).val();
                   initTree(type);
               }
            });

            $(level+","+c_level).on("change",function(){
                var type = $(this).attr("data-value");
                if(type == type_no){
                    regionLevel = $(this).val();
                    initTree(type);
                    rightContent(ct.toc);
//                    Gtoc.init();
                }else if(type == type_copy){
                    c_regionLevel = $(this).val();
                    initTree(type);
                }
            });

            $("#tree_root").on("click",function(){
                rightContent(ct.toc);
//                Gtoc.init();
                initTree(type_no);
            });

            initTree(type_no,"root");

        };

        /**
         * 树
         */
        var initTree = function(type,id){
            if(type == null){
                type = type_no;
            }
            _currentTree = type ;
            if(type == type_no){
                _selId = null;
                mixTree&&mixTree.destructor();
                SGIS.API.get("macro/Types/?/rootItems",reportType).data({
                    regionLevel:regionLevel,
                    hasCheckbox:false
                }).text(function(xml){
                    mixTree = SGIS.Tree.create("mix-tree",xml,actions,lazyLoad);
                   //选中结点 触发右侧grid加载
                    mixTree.selectItem(!id?(!_selId?"root":_selId):id,true);

                });
            }else{
                copyTree&&copyTree.destructor();
//                SGIS.API.get("macro/Types/?/rootItems",c_reportType).data({
//                    regionLevel:c_regionLevel,
//                    hasCheckbox:true
//                }).text(function(xml){
//                    copyTree = SGIS.Tree.createCheckableTree("copy-tree",xml,actions1,lazyLoad);
//                });
                SGIS.API.get("macro/Types/?/tree",c_reportType).data({
                    regionLevel:c_regionLevel,
                    hasCheckbox:true
                }).text(function(xml){
                    copyTree = SGIS.Tree.createCheckableTree("copy-tree",xml,actions1,null);
                });
            }
            //复制树，check时默认加载节点
            var actions1 ={
                onCheck:function(id,state){
                    //check操作
                    if(state == 1){
                        copyTree.openAllItems(id);
//                        Tutil.openLeafTree(copyTree,id)
                    }
                }
            };
            var actions = {
                onClick :function(id,obj){
                    //展开子结点
                    mixTree.openItem(id) ;
                    _selId = id=="root"?0:id ;//root为根节点
                    _selMetaType =  mixTree.getUserData(id,"metaType");

                    if(_selMetaType==1){  // 目录
                        rightContent(ct.table); //打开 表管理（包括目录）
                        Gtable.init();
                    }else if(_selMetaType==2){ //表
                        rightContent(ct.iden); // 打开指标管理
                        Giden.init();
                    }else{ //根节点
                        rightContent(ct.toc);
                        Gtoc.init();
                        return ;
                    }
                }
            };

           var lazyLoad = function(obj,id){
               Tutil.openLeafTree(obj,id)
           }

        };



        //树加载工具
        var Tutil = (function(){

            /**
             * 判断是否还有load节点
             * @param obj
             * @param id
             * @returns {boolean}
             */
            var hasTempNode = function (obj, id) {
                var tempnode = obj.getAllSubItems(id).indexOf("load");
                if (tempnode == 0) {
                    return true;//未加载
                }
            };

            // 请求子节点
            var addTreeNode = function(id,callback){
                if(_currentTree == type_no){
                    SGIS.API.get("macro/Types/?/leafItems",reportType).data({
                        itemid:id,
                        hasCheckbox:false
                    }).text(function(xml){
                        mixTree.loadXMLString(xml);
                            callback&&callback();
                    });
                }else{
                    SGIS.API.get("macro/Types/?/leafItems",c_reportType).data({
                        itemid:id,
                        hasCheckbox:true
                    }).text(function(xml){
                        copyTree.loadXMLString(xml);
                        callback&&callback();
                    });
                }
            };

            // 打开子节点
            var openLeafTree = function(obj, id){
                if(Tutil.hasTempNode(obj,id)){
                    obj.deleteChildItems(id);//删除子节点
                    Tutil.addTreeNode(id);//查询并加载子节点
                }
            };

            //删除指定项
            var delItem = function(itemId,selectParent){
                mixTree.deleteItem(itemId,selectParent);
            };

            // 刷新叶子
            var refreshLeaf = function(id){
                _currentTree = type_no; //该操作只有左侧树才有
                var selId = id||mixTree.getSelectedItemId();
                if(selId=="root"||selId =="0"){
                    //根节点直接刷新
                    initTree() ;
                    return ;
                }
                //表节点不再请求下一结点
                var metaType = parseInt(mixTree.getUserData(selId,"metaType"));
                if(metaType == 1){
                    mixTree.deleteChildItems(selId);
                    addTreeNode(selId ,function(){
                        mixTree.selectItem(selId,true);
                    });
                }
                else if(metaType ==2){
                    mixTree.selectItem(selId,true);
                }
            };

            // 选中指定项
            var selectItem = function(id){
                mixTree.selectItem(id,true);
            };

            return {
                hasTempNode:hasTempNode,
                addTreeNode:addTreeNode,
                openLeafTree:openLeafTree,
                refreshLeaf:refreshLeaf,
                delItem:delItem,
                selectItem:selectItem
            }

        })();


        var leftParam = function(){
            var param = {
                reportType:reportType,
                regionLevel:regionLevel,
                selId:_selId,
                selMetaType:_selMetaType
              };
            return param;
        };

        var getCopyParams = function(){
            var p ={};
            p.reportType = reportType ;
            p.regionLevel = regionLevel ;
            var itemId = mixTree.getSelectedItemId();
            var checkeds = copyTree.getAllChecked();
            var matmids= [];
            if(!checkeds){ return matmids ;}
            var checkedsArr = checkeds.split(",");
            for(var i=0; i<checkedsArr.length ; i++){
                var id = checkedsArr[i];
                //不筛选
                if(id =="root"){
                    continue ;
                }
                var subs = copyTree.getAllSubItems(id);
                var subIds = !subs||subs==""?[]:subs.split(",") ;
                var flag = true ;
                for(var j =0; j<subIds.length ;j++){
                    console.log(copyTree.isItemChecked(subIds[j]));
                    if(copyTree.isItemChecked(subIds[j])){
                        continue;
                    }
                    flag = false;
                }
                if(flag){
                    matmids.push(id);
                }
            }
            p.itemId = itemId ;
            p.matmids = matmids ;
            return p;
        };

        var getSelItemId = function(){
            var id = mixTree.getSelectedItemId() ;
            return id=="root"||id==""?'0':id;
        };

        return {
            init:init,
            initTree:initTree,
            leftParam:leftParam,
            delItem:Tutil.delItem,
            refresh:Tutil.refreshLeaf,
            selectItem:Tutil.selectItem,
            getCopyParams:getCopyParams,
            getSelItemId:getSelItemId
        }

    })();

    /**
     * 公用的一些方法
     */
    var Common =(function(){

        //检查选中的状态 用于修改操作
        var checkSel = function(selIds){
            if(selIds==null){
                SGIS.UI.alert("请选中要编辑的行！");
                return false;
            }
            if(selIds.indexOf(",")!=-1){
                SGIS.UI.alert("只能选择一条数据进行编辑");
                return false;
            }
            return true ;
        }

        /**
         * 表格数据 metaType显示用中文
         * @param d
         */
        var metaTypeToCn =function(d){
            var re = d;
            for(var i=0,len=re.length; i<len; i++){
                var obj = re[i];
                if(obj.macmetaType==1){
                    obj.macmetaType="分类";
                }
                if(obj.macmetaType==2){
                    obj.macmetaType="表";
                }
                if(obj.macmetaType==3){
                    obj.macmetaType="指标";
                }
            }
            return re ;
        }


        // 分类 表 指标模板下载
        var downTocTemplate = function(metaType){
            window.open(SGIS.API.getURL("macro/Types/Items/import/template/download?metaType="+metaType));
        };

        return{
            checkSel:checkSel,
            metaTypeToCn:metaTypeToCn,
            downTocTemplate:downTocTemplate
        }
    })();

    var grid =null ;//统一grid命名

    /**
     * 目录管理
     */
    var Gtoc = (function(){
       var newTocModal,editTocModal,impTocModal;

       var selgridId;// 当前选中的grid行
       var addTocForm,editTocForm;
       var lParam;
       var _uploadFileName = "";//上传后新的文件名
       var file ;

       var init = function(){
           selgridId= null;

           lParam = Toc.leftParam();
           var reportType = lParam.reportType;
           var regionLevel = lParam.regionLevel;

           grid&&grid.destructor();
           //重新指定grid高度
           var h = $(window).height();
           $("#mix_gridbox").height(h- 100 -20);
           grid = SGIS.Grid.create('mix_gridbox');
           grid.setHeader("编号,ID,类别,名称,备注");
           grid.setInitWidths("80,80,100,150,*");
           grid.setColAlign("center,left,left,left,left");
           grid.setColTypes("ed,ed,ed,ed,ed");
           grid.setColSorting("int,int,str,str,str");
           grid.enableMultiselect(true);
           grid.init();

           SGIS.API.get("macro/Types/?/Items",reportType)
               .data({regionLevel:regionLevel,parid:0})
               .data(JSON.stringify([])) //@RequestBody
               .json(function (re) {
                re = Common.metaTypeToCn(re) ;
               var id ="matmid";
               var fields = ["matmid","macmetaType","idenName","memo"];
               grid.parse(common.jsonToGridData(re,id,fields,true),"json");

               grid.attachEvent("onRowSelect",function(e){
                   selgridId = e;
               })

           });
       };

       var modalInit = (function(){
           newTocModal = new Modal("fm-new-toc","新建分类",ModalSet.sm);
           newTocModal.active("btn-add-toc");

           editTocModal = new Modal("fm-edit-toc","编辑分类",ModalSet.sm);

           impTocModal = new Modal("fm-imp-toc","导入分类",ModalSet.sm);

           addTocForm = new SGIS.AutoForm("#fm-new-toc form");
           editTocForm = new SGIS.AutoForm("#fm-edit-toc form");

           $("#btn-edit-toc").on("click",function(){
                 if(!Common.checkSel(grid.getSelectedRowId())){
                     return ;
                 }
               editTocForm.reset();
               editTocModal.show();

               //窗体弹出后 读取数据自动填充表单
               var selId = grid.getSelectedRowId() ;
               SGIS.API.get("macro/Types/Type/Items/?",selId).json(function(re){
                   editTocForm.setInitValue(re);
                   editTocForm.tempData = re;
               });
           });

           $("#btn-del-toc").on("click",function(){
               var selIds = grid.getSelectedRowId();
               if(selIds==null){
                   SGIS.UI.alert("请选中要编辑的行！");
                   return;
               }
               if(confirm("谨慎操作！")){
                   delTOC();
               }
           });

            //添加
           $("#submit-create-toc").on("click",function(){
               addTOC();
           });

           $("#fm-new-toc .modal-content").on("keypress",function(e){
               if(e.keyCode==13){
                   $("#submit-create-toc").click();
               }
           });

            //编辑
           $("#submit-edit-toc").on("click",function(){
               editTOC();
           });

           $("#fm-edit-toc .modal-content").on("keypress",function(e){
               if(e.keyCode==13){
                   $("#submit-edit-toc").click();
               }
           });
            $("#btn-imp-toc").click(function(){
                impTocModal.find("input[type=file]").val("");
                impTocModal.find("select[name=sheetname] option").remove();
                _uploadFileName =null
                impTocModal.show();
            });
           //导入 分类
           $("#submit-imp-toc").on("click",function(){
               impTOC();
           });

           // 导入分类模板下载
           $("#btn-toc-down-template").click(function(){
               Common.downTocTemplate(1);
           });

           file = new File("in-toc-file",function(re){
               getExcelSheets(re) ;
           })

           //复制结构 同指标复制的入口一致
           $("#btn-copy-toc").click(function(){
               $("#btn-copy-iden").click();
           });

       })();

        //添加分类
        var addTOC = function(){
            SGIS.UI.addLoadingBar0();
            var tocJson = addTocForm.serializeObject();
            tocJson.parid = Toc.getSelItemId() ;//取最新的
            tocJson.macmetaType = 1;
            tocJson.regionLevel = lParam.regionLevel;
            tocJson.hasChild = 1;

            SGIS.API.post("macro/Types/?/Items",lParam.reportType)
                .data(tocJson).json(function (re) {
                    SGIS.UI.clearLoadingBar0();
//                  Toc.initTree();
                    Toc.refresh();//刷新
//                  Gtoc.init();
                    newTocModal.hide();
                    SGIS.UI.alert("添加分类成功");
            });

        };
        // 编辑分类
       var editTOC = function(){
           SGIS.UI.addLoadingBar0();
           var tocJson = editTocForm.serializeObject();
           var entity  =  editTocForm.tempData;
           entity = $.extend(entity,tocJson);
           var selId = grid.getSelectedRowId() ;
           SGIS.API.put("macro/Types/"+ lParam.reportType +"/Items/"+selId)
               .data(entity).json(function(re){
               SGIS.UI.clearLoadingBar0();
               if(re!=null) {
                   editTocModal.hide();
//                   Gtoc.init();
                   Toc.refresh();//刷新
                   SGIS.UI.alert("更新成功");
               } else{
                   SGIS.UI.alert("更新出错！")
               }

           });

       };

       //删除分类
       var delTOC = function(){
           var ids = grid.getSelectedRowId() ;
           SGIS.UI.addLoadingBar0();
          SGIS.API.del("macro/Types/Type/Items/?",ids)
              .data(JSON.stringify(ids.split(",")))
              .json(function(re){
              SGIS.UI.clearLoadingBar0();
              Toc.delItem(grid.getSelectedRowId());
              grid.deleteSelectedRows();
              Toc.refresh();
              SGIS.UI.alert("操作成功！");
          });
       };

        //导入分类
       var impTOC = function () {
            var reportType = $("#data-type").val();
            var parid = Toc.getSelItemId() ;
           if(_uploadFileName ==""||!_uploadFileName){
               alert("请选择导入文件");
               return ;
           }
           SGIS.UI.addLoadingBar0();
           var sheetName = $("#fm-imp-toc select[name=sheetname] option:selected").text();
           SGIS.API.post("macro/Types/"+reportType+"/Items/"+parid+"/import")
               .data({
                   metaType :1,
                   regionLevel :lParam.regionLevel,
                   fileName:_uploadFileName,
                   sheetName: sheetName
               })
               .json(function(re){
                   SGIS.UI.clearLoadingBar0();
                   SGIS.UI.alert(re.msg) ;
                   Toc.refresh();
                   impTocModal.hide();
                   _uploadFileName=null ;
               })
       };

        /**
         * 设置Excel 上传的相关参数
         *
         * @param re
         */
        var getExcelSheets = function(re){
            if(typeof re == "string")
                re = JSON.parse(re);

            _uploadFileName = re.fileName ;  //保存新的文件名
            var arr = re["sheets"];
            var par = $("#fm-imp-toc select[name=sheetname]");
            var templ ="<option value='{{index}}'>{{name}}</option>";
            var html = "";
            var leng = arr.length;
            for(var i = 0; i < leng; i++){
                html += SGIS.Util.template(templ,arr[i]);
            }
            par.html(html);
        };
       var destroy = function(){
            selgridId = null;
       };

       return {
           init:init,
           destroy:destroy
       }


    })();

    /**
     * 表管理 (包括分类)
     */
    var Gtable = (function(){
        var selTableGridId;

        var newTableModal,editTableModal,impTableModal;
        var addTableForm,editTableForm;

        var lParam;

        var _uploadFileName = "";//上传后新的文件名
        var file ;

        var init = function(){

            $(".table .tab").addClass("disabled");
            $(".catalog .toc").addClass("disabled");

            lParam = Toc.leftParam();
            var reportType = lParam.reportType;
            var regionLevel = lParam.regionLevel;
            var selId = lParam.selId;

            //重新指定grid高度
            var h = $(window).height();
            $("#mix_gridbox").height(h- 144 -20);
            grid&&grid.destructor();
            grid = SGIS.Grid.create('mix_gridbox')
            grid.setHeader("编号,ID,类别,名称,备注,数据情况");
            grid.setInitWidths("100,100,100,200,200,*");
            grid.setColAlign("center,left,left,left,left,left");
            grid.setColTypes("ed,ed,ed,ed,ed,ed");
            grid.setColSorting("int,int,str,str,str,str");
            grid.enableMultiselect(true);
            grid.init();

            SGIS.API.get("macro/Types/?/Items", reportType)
                .data({regionLevel: regionLevel, parid: selId})
                .data(JSON.stringify([]))
                .json(function(re) {
                   re = Common.metaTypeToCn(re) ;
                    var id ="matmid";
                    var fields = ["matmid","macmetaType","idenName","memo"];
                    grid.parse(common.jsonToGridData(re,id,fields,true,true),"json");

                    grid.attachEvent("onRowSelect",function(e){
                        selTableGridId = e;
                        var value = grid.cells(selTableGridId,2).getValue();

                        if(value.indexOf("表")!=-1){
                            $(".row.table .tab").removeClass("disabled");
                            $(".row.catalog .toc").addClass("disabled");
                        }else if(value.indexOf("分类")!=-1){
                            $(".row.catalog .toc").removeClass("disabled");
                            $(".row.table .tab").addClass("disabled");
                        }
                    })
                });
        };

        var modalInit = (function(){

            //////////////////////////表的操作开始
            newTableModal= new Modal("fm-new-table","新建表",ModalSet.sm);
            newTableModal.active("btn-add-table");

            editTableModal = new Modal("fm-edit-table","编辑表",ModalSet.sm);

            impTableModal = new Modal("fm-imp-table","导入表",ModalSet.sm);

            addTableForm = new SGIS.AutoForm("#fm-new-table form");
            editTableForm  = new SGIS.AutoForm("#fm-edit-table form");

            $("#btn-edit-table").on("click",function(){
                if(selTableGridId==null){
                    SGIS.UI.alert("请选中要编辑的行！");
                    return;
                }
                editTableForm.reset();
                editTableModal.show();
                //窗体弹出后 读取数据自动填充表单
                SGIS.API.get("macro/Types/Type/Items/?",selTableGridId).json(function(re){
                    editTableForm.setInitValue(re);
                    editTableForm.tempData = re;
                });
            });


            $("#btn-del-table").on("click",function(){
                if(selTableGridId==null){
                    SGIS.UI.alert("请选中要编辑的行！");
                    return;
                }
                if(confirm("谨慎操作！")){
                    delTable();  // 与删除目录相同
                }
            });

            //添加
            $("#submit-create-table").on("click",function(){
                addTable();
            });

            $("#fm-new-table .modal-content").on("keypress",function(e){
                if(e.keyCode==13){
                    $("#submit-create-table").click();
                }
            });

            //编辑
            $("#submit-edit-table").on("click",function(){
                var ids = grid.getSelectedRowId() ;
                if(!Common.checkSel(ids)){
                    return ;
                }
                editTable();
            });

            $("#fm-edit-table .modal-content").on("keypress",function(e){
                if(e.keyCode==13){
                    $("#submit-edit-table").click();
                }
            });

            $("#btn-imp-table").click(function(){
                impTableModal.find("input[type=file]").val("");
                impTableModal.find("select[name=sheetname] option").remove();
                _uploadFileName =null
                impTableModal.show();
            });

            // 导入综合表模板下载
            $("#btn-table-down-template").click(function(){
                Common.downTocTemplate(2);
            });
            //导入
            $("#submit-imp-table").on("click",function(){
                impTable();
            });

            file = new File("in-table-file",function(re){
                getExcelSheets(re) ;
            })
        })();

        /////////////表的操作
        //添加表
        var addTable = function(){
            SGIS.UI.addLoadingBar0();
            var tableJson = addTableForm.serializeObject();
            tableJson.parid = Toc.getSelItemId(); //现取
            tableJson.macmetaType = 2;
            tableJson.regionLevel = lParam.regionLevel;
            tableJson.hasChild = 1;

            SGIS.API.post("macro/Types/?/Items",lParam.reportType).data(tableJson).json(function (re) {
                SGIS.UI.clearLoadingBar0();
                var itemId = lParam.selId;
                Toc.refresh();
//                Gtable.init();
                newTableModal.hide();
                SGIS.UI.alert("添加成功");
            });
        };
         // 编辑表
        var editTable = function(){
            SGIS.UI.addLoadingBar0();
            var tableJson = editTableForm.serializeObject();
            var entity  =  editTableForm.tempData;
            entity = $.extend(entity,tableJson);
            SGIS.API.put("macro/Types/"+ lParam.reportType +"/Items/"+selTableGridId).data(entity).json(function(re){
                SGIS.UI.clearLoadingBar0();
                if(re!=null) {
                    editTableModal.hide();
                    Toc.refresh();
//                    Gtable.init();
                    SGIS.UI.alert("更新成功");
                } else{
                    SGIS.UI.alert("更新出错！")
                }

            });
        };
        //删除表
        var delTable = function(){
            SGIS.UI.addLoadingBar0();
            var ids = grid.getSelectedRowId();
            SGIS.API.del("macro/Types/Type/Items/?",ids)
                .data(JSON.stringify(ids.split(",")))
                .json(function(re){
                SGIS.UI.clearLoadingBar0();
                Toc.delItem(grid.getSelectedRowId());
                grid.deleteSelectedRows();
//                Toc.initTree();
                Toc.refresh();
                SGIS.UI.alert("操作成功！");
            });
        };

        var getExcelSheets = function(re){
            if(typeof re == "string")
                re = JSON.parse(re);

            _uploadFileName = re.fileName ;  //保存新的文件名
            var arr = re["sheets"];
            var par = $("#fm-imp-table select[name=sheetname]");
            var templ ="<option value='{{index}}'>{{name}}</option>";
            var html = "";
            var leng = arr.length;
            for(var i = 0; i < leng; i++){
                html += SGIS.Util.template(templ,arr[i]);
            }
            par.html(html);
        };

         // 导入表
        var impTable = function(){
            var reportType = $("#data-type").val();
            var parid = Toc.getSelItemId() ;
            if(_uploadFileName ==""||!_uploadFileName){
                alert("请选择导入文件");
                return ;
            }
            var sheetName = $("#fm-imp-table select[name=sheetname] option:selected").text();
            SGIS.API.post("macro//Types/"+reportType+"/Items/"+parid+"/import")
                .data({
                    metaType :2, //表
                    regionLevel :lParam.regionLevel,
                    fileName:_uploadFileName,
                    sheetName: sheetName
                })
                .json(function(re){
                    SGIS.UI.alert(re.msg) ;
                    impTableModal.hide();
                    Toc.refresh();
                    _uploadFileName =null ;
            })
        };

        var gridParam = function(){
            var _param = {
                selTableGridId:selTableGridId
            };

            return _param;
        };

        var destroy = function(){
           selTableGridId = null;
        };

        return {
            init:init,
            destroy:destroy,
            gridParam:gridParam
        }

    })();

    /**
     * 指标管理
     */
    var Giden = (function(){
        var selIdenGridId;

        var newIdenModal,editIdenModal,impIdenModal,copyIdenModal;
        var addIdenForm,editIdenForm;

        var lParam;
        var _isCopyModalFirstShow = true ;//初次弹出复制指标框要先加载树

        var _uploadFileName = "";//上传后新的文件名
        var file ;

        var init = function(){
            lParam = Toc.leftParam();
            var reportType = lParam.reportType;
            var regionLevel = lParam.regionLevel;
            var selId = lParam.selId;

            grid&&grid.destructor();
            //重新指定grid高度
            var h = $(window).height();
            $("#mix_gridbox").height(h- 100 -20);

            grid = SGIS.Grid.create('mix_gridbox')
            grid.setHeader("编号,ID,代码,名称,单位,备注");
            grid.setInitWidths("100,100,100,100,200,*");
            grid.setColAlign("center,left,left,left,left,left");
            grid.setColTypes("ed,ed,ed,ed,ed,ed");
            grid.setColSorting("int,int,str,str,str,str");
            grid.enableMultiselect(true);
            grid.init();

            SGIS.API.get("macro/Types/?/Items", reportType)
                .data({regionLevel: regionLevel, parid: selId})
                .data(JSON.stringify([]))
                .json(function(re) {
                    var id ="matmid";
                    var fields = ["matmid","idenCode","idenName","idenUnit","memo"];
                    grid.parse(common.jsonToGridData(re,id,fields,true),"json");

                    grid.attachEvent("onRowSelect",function(e){
                        selIdenGridId = e;
                    })
                });
        };

        var modalInit = (function () {
            newIdenModal = new Modal("fm-new-iden","新建指标",ModalSet.sm);
            newIdenModal.active("btn-add-iden");

            editIdenModal = new Modal("fm-edit-iden","修改指标",ModalSet.sm);

            impIdenModal = new Modal("fm-imp-iden","导入指标",ModalSet.sm);

            copyIdenModal = new Modal("fm-copy-iden","复制分类、表、指标",ModalSet.md);
//            copyIdenModal.active("btn-copy-iden");
            $("#btn-copy-iden").click(function(){
                if(_isCopyModalFirstShow){
                    Toc.initTree(2);
                }
                copyIdenModal.show();
            });

            addIdenForm = new SGIS.AutoForm("#fm-new-iden form");
            editIdenForm = new SGIS.AutoForm("#fm-edit-iden form");

            $("#btn-edit-iden").on("click",function(){
                var ids = grid.getSelectedRowId() ;
                if(!Common.checkSel(ids)){
                    return ;
                }
                editIdenForm.reset();
                editIdenModal.show();

                //窗体弹出后 读取数据自动填充表单
                SGIS.API.get("macro/Types/Type/Items/?",selIdenGridId).json(function(re){
                    editIdenForm.setInitValue(re);
                    editIdenForm.tempData = re;
                });
            });

            $("#btn-del-iden").on("click",function(){
                if(selIdenGridId==null){
                    SGIS.UI.alert("先选中要删除的行");
                    return;
                }
                if(confirm("谨慎操作！")){
                    delIden();
                }
            });

            $("#submit-create-iden").click(function(){
                addIden();
            });

            $("#fm-new-iden .modal-content").on("keypress",function(e){
                if(e.keyCode==13){
                    $("#submit-create-iden").click();
                }
            });

            $("#submit-edit-iden").click(function(){
                var ids = grid.getSelectedRowId();
                if(ids.indexOf(",")!=-1){
                    SGIS.UI.alert("只能操作一条记录！")
                    return ;
                }
                editIden();
            });

            $("#fm-edit-iden .modal-content").on("keypress",function(e){
                if(e.keyCode==13){
                    $("#submit-edit-iden").click();
                }
            });

            $("#btn-imp-iden").click(function(){
                impIdenModal.find("input[type=file]").val("");
                impIdenModal.find("select[name=sheetname] option").remove();
                _uploadFileName =null
                impIdenModal.show();
            });

            // 导入指标模板下载
            $("#btn-iden-down-template").click(function(){
                Common.downTocTemplate(3);
            });

            file = new File("in-iden-file",function(re){
                getExcelSheets(re) ;
            });
            $("#submit-imp-iden").click(function(){
                impIden();
            });

            $("#copy-iden-ok").click(function(){
                var param = Toc.getCopyParams() ;
                var reportType = param.reportType ;
                var regionLevel = param.regionLevel ;
                var itemId = param.itemId ;
                var matmids = param.matmids ;
                if(matmids.length<1){
                     SGIS.UI.alert("请选择要复制的节点");
                    return ;
                }
                copyIden(reportType,regionLevel,itemId,matmids);
            })

        })();

        var addIden = function(){
            SGIS.UI.addLoadingBar0();
            var idenJson = addIdenForm.serializeObject();
            idenJson.parid = Toc.getSelItemId(); //现取
            idenJson.macmetaType = 3;
            idenJson.regionLevel = lParam.regionLevel;
            idenJson.hasChild = 0;
            idenJson.idenPrecision = !idenJson.idenPrecision?0:idenJson.idenPrecision;

            SGIS.API.post("macro/Types/?/Items",lParam.reportType).data(idenJson).json(function (re) {
//                Giden.init();
                SGIS.UI.clearLoadingBar0();
                Toc.refresh();
                newIdenModal.hide();
                SGIS.UI.alert("添加指标成功");
            });
        };

        var editIden = function(){
            SGIS.UI.addLoadingBar0();
            var idenJson = editIdenForm.serializeObject();
            var entity  =  editIdenForm.tempData;
            entity = $.extend(entity,idenJson);
            SGIS.API.put("macro/Types/"+ lParam.reportType +"/Items/"+selIdenGridId).data(entity).json(function(re){
                SGIS.UI.clearLoadingBar0();
                if(re!=null) {
                    Toc.refresh();
                    editIdenModal.hide();
//                    Giden.init();
                    SGIS.UI.alert("更新成功");
                } else{
                    SGIS.UI.alert("更新出错！")
                }

            });
        };

        var delIden = function(){
            SGIS.UI.addLoadingBar0();
            SGIS.API.del("macro/Types/Type/Items/?",grid.getSelectedRowId())
                .json(function(re){
                    SGIS.UI.clearLoadingBar0();
//                Toc.delItem(grid.getSelectedRowId());
                Toc.refresh();
                grid.deleteSelectedRows();
                SGIS.UI.alert("操作成功！");
            });
        };

        var impIden = function(){
            var reportType = $("#data-type").val();
            var parid = Toc.getSelItemId() ;
            if(_uploadFileName ==""||!_uploadFileName){
                alert("请选择导入文件");
                return ;
            }
            SGIS.UI.addLoadingBar0();
            var sheetName = $("#fm-imp-iden select[name=sheetname] option:selected").text();
            SGIS.API.post("macro//Types/"+reportType+"/Items/"+parid+"/import")
                .data({
                    metaType :3,
                    regionLevel :lParam.regionLevel,
                    fileName:_uploadFileName,
                    sheetName:sheetName
                })
                .json(function(re){
                    SGIS.UI.clearLoadingBar0();
                    SGIS.UI.alert(re.msg) ;
                    Toc.refresh();
                    impIdenModal.hide();
                    _uploadFileName = null ;
                })
        };

        var getExcelSheets = function(re){
            if(typeof re == "string")
                re = JSON.parse(re);

            _uploadFileName = re.fileName ;  //保存新的文件名
            var arr = re["sheets"];
            var par = $("#fm-imp-iden select[name=sheetname]");
            var templ ="<option value='{{index}}'>{{name}}</option>";
            var html = "";
            var leng = arr.length;
            for(var i = 0; i < leng; i++){
                html += SGIS.Util.template(templ,arr[i]);
            }
            par.html(html);
        };

        var copyIden = function(reportType,regionLevel,itemId ,matmids){
            copyIdenModal.hide();
            SGIS.UI.addLoadingBar0("正在复制,请稍候");
            SGIS.API.post("macro/Types/"+reportType+"/copy/"+(itemId=="root"?0:itemId)+"")
                .data(JSON.stringify(matmids))
                .data({
                    regionLevel:regionLevel
                })
                .json(function(re){
                     SGIS.UI.alert(re.msg);
//                    Giden.init();
                    Toc.refresh();
                    SGIS.UI.clearLoadingBar0();
            })
        };

        var destroy = function(){
           selIdenGridId = null;
        };

        var getSelId=function(){
            return selIdenGridId;
        };

        return {
            init:init,
            destroy:destroy,
            getSelId:getSelId
        }
    })();

    //枚举分类模块
    var enumCatalog=(function(){
        var formContainer="modal-set-enumcatalog";
        var setEnumForm= new SGIS.AutoForm("#modal-set-enumcatalog form");
        var treeContainer="iden-grid";
        //对话框左侧列表、及所选ID
        var enumTree,parGridSelId;
        //所选ID指标对应的枚举分类

        //初始化枚举分类管理按钮事件，枚举分类管理
        var initSetBtn =function(){
            var $btnSetEnum= $(".container-fluid #btn-set-enum");
            $btnSetEnum.click(function(){
                //初始化对话框数据
                idenAndEnums();
            });

            //取消指标分组
            $("#del-enum-ok").click(function(){
                var selId = enumTree.getSelectedItemId();
                if(!selId){
                       SGIS.UI.alert("请选择要删除的分组");
                    return ;
                }
                SGIS.API.del("macro/enum/info/"+Giden.getSelId())
                    .data({
                        "maitid":selId
                    })
                    .json(function(re){
                        if(re.status){
                             SGIS.UI.alert("取消分组成功");
                        }else{

                             SGIS.UI.alert("操作失败,已导入数据不允许取消");
                        }
                        initTree();
                });
            });
        };

        var actions = {
            onClick :function(code){
                parGridSelId=code;
                var hasSet =enumTree.getUserData(code,"hasSet");
                var setBtn = $("#set-enum-ok");
                var delBtn = $("#del-enum-ok") ;
                setBtn.show();
                delBtn.show();
                if(hasSet){
                    setBtn.hide();
                }else{
                    delBtn.hide();
                }
            }

        };
        var initTree = function(callback){
            enumTree&&enumTree.destructor();
            SGIS.API.get("macro/enumGroups/tree").text(function(xml){
                enumTree = SGIS.Tree.create(treeContainer,xml,actions,null);
                enumTree.openItem("root");
                SGIS.API.get("macro/enum/info/"+Giden.getSelId()).json(function(re){
                    //将已设置的枚举分组 高亮显示
                    for(var i = 0,len=re.length; i < len; i++){
                        var maitid = re[i].tmacroIdent.maitid ;
                        enumTree.setItemColor(maitid,"red","red");
                        enumTree.setUserData(maitid,"hasSet",true);
                    }
                    callback&&callback();
                });
            })
         };

        //查询所选指标的枚举分类
        var idenAndEnums=function(){
            parGridSelId=Giden.getSelId();
            if(parGridSelId==null){
                SGIS.UI.alert("请选择一行指标");
                return;
            }
            initTree();
            $("#modal-set-enumcatalog").modal("toggle");
        };

        var init=function(){
            initSetBtn();
            //对话框查询、添加按钮初始化事件
            var $setEnumOk=$("#modal-set-enumcatalog #set-enum-ok");
            var $queryBtn=$("#modal-set-enumcatalog #query-btn");
            var $queryInput=$("#modal-set-enumcatalog #queryKey");
            var $resultEnum=$("#modal-set-enumcatalog #resultEnum");

            //检索分组
            $queryBtn.click(function(){
                var idStr=enumTree.getAllSubItems("root") ;
                var ids=idStr.split(",");
                var enumDatas=[];
                for(var i=0,len=ids.length; i<len; i++){
                    var json={
                        "id":ids[i],
                        "name":enumTree.getItemText(ids[i])
                    };
                    enumDatas.push(json);
                }
                var value=  $queryInput.val();
                if(value==""){
                    return;
                }
                $resultEnum.empty();
                var tpl="<div class='.ui.checkbox'><input name='a' type='radio' id='{{id1}}'><label for='{{id2}}'>{{name}}</label></div>";
                for(var i =0 ,_size =enumDatas.length ; i< _size ;i++){
                   if((enumDatas[i].name.indexOf(value))!=-1) {
                       $resultEnum.append(tpl.replace("{{name}}",enumDatas[i].name).replace("{{id1}}",enumDatas[i].id).replace("{{id2}}",enumDatas[i].id));
                   }
                }
            });

            //设置分组
            $setEnumOk.click(function(){
                var selID1= enumTree.getSelectedItemId();
                var selID2 =  $("#resultEnum input:checked").eq(0).attr("id");

                var selId = selID2;
                if(!selID2){
                   selId = selID1;
                }

                if(!selId){
                       SGIS.UI.alert("请选择要设置的分组");
                    return ;
                }                                //所选指标
                SGIS.API.post("macro/enum/info/"+Giden.getSelId())
                    .data({
                       "maitid":selId
                    })
                    .json(function(re){
                        if(re.status){
                            SGIS.UI.alert("设置分组成功");
                        }else{
                            SGIS.UI.alert("设置分组失败");
                        }
                        initTree();
                });
            });
        }

        return {
            init:init,
            initSetBtn:initSetBtn
        }
    })();

    $(function(){
        UIInit();
    })
});
