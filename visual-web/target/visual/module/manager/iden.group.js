/**
 * Created by Augustine on 2014/9/1.
 */

define(function(require,exports,module){

    var common = require("component/common");
    var Modal = require("component/modal");
    var idengGrid = "ideng-gridbox" ,idenvGrid = "idenv-gridbox",idenvlTreeNew="idenv-tree-new",idenvlTreeEdit="idenv-tree-edit";

    /**
     * 总入口
     */
    var init = function(){
        $(window).resize(SGIS.Util.throttle(function(){
            var h = $(window).height() - 94 -20;
            $("#"+idengGrid+",#"+idenvGrid).height(h);
        }, 200)).resize();

        Group.init();
        GroupVal.init();
    };

    /**
     * 综合分组操作
     */
    var Group = (function(){
        var tree ;
        var newGroupModal,editGroupModal;
        var newGroupForm ,editGroupForm;
        var _selId;

        /**
         * 初始化
         */
        var init = function(){
            _selId = null;
            newGroupModal = new Modal("fm-new-group","添加分组");
            editGroupModal = new Modal("fm-edit-group","修改分组");

            newGroupForm = new SGIS.AutoForm("#fm-new-group form");
            editGroupForm = new SGIS.AutoForm("#fm-edit-group form");

            /**
             * 注册点击事件
             */
            $("div.container-fluid .btn[id*=tem]").click(function(){
                var id = $(this).attr("id");
                var split = id.split("-");
                switch(split[1]){
                    case "new":
                        newGroupForm.reset();
                        newGroupModal.show();
                        break;
                    case "edit":
                        if(!hasSelected()){
                           SGIS.UI.alert("请选择一个分组！");
                            return ;
                        }
                        editGroupForm.reset();
                        SGIS.API.get("macro/enumGroups/"+getSelId())
                            .json(function(re){
                                editGroupForm.setInitValue(re);
                                editGroupModal.show();
                            });
                        break;
                    case "remove":
                        if(!hasSelected()){
                           SGIS.UI.alert("请选择一个分组！");
                            return ;
                        }
                        delGroup(); //删除指定分组
                        break;
                }//end switch
            });

            /**
             * 注册提交点击事件
             */
            $(".modal .btn[id*=group-ok]").click(function(){
                var id = $(this).attr("id");
                var split = id.split("-");

                switch(split[0]){
                    case "new":
                        newAddGroup();
                        break;
                    case "edit":
                        editGroup();
                        break;
                }
            });

            initTree(function(){
                tree && tree.selectItem(1,true);   //选中第一个元素
            }); //加载目录树
        };

        /**
         * 目录选择操作
         *
         * @type {{onClick: onClick}}
         */
        var actions = {
            onClick:function(_id){
                if(_id == "root"){
                    setSelId(null);
                    GroupVal.setSelGroupId(null);
                }else{
                    setSelId(_id);
                    //显示右边数据
                    GroupVal.refreshGrid(getSelId());
                }
            }
        };

        /**
         *  加载目录树
         *
         * @param callback
         *          回调函数
         */
        var initTree = function(callback){
            tree && tree.destructor();
            SGIS.API.get("macro/enumGroups/tree").text(function(xml){
                tree = SGIS.Tree.create(idengGrid,xml,actions);
                tree.openItem("root");
                callback && callback();
            });
        };

        /**
         * 新增分组提交
         */
        var newAddGroup = function(){
            if(!newGroupForm.validation()){
                $("#fm-new-group input[data-validation]").focus();
                return ;
            }
            SGIS.UI.addLoadingBar0();
            SGIS.API.post("macro/enumGroups")
                .data(newGroupForm.serializeObject())
                .json(function(re){
                    SGIS.UI.clearLoadingBar0();
                    if(re.status){
                       SGIS.UI.alert("添加分组成功");
                    }else{
                       SGIS.UI.alert("添加分组失败");
                    }
                    newGroupModal.hide();
                    initTree(function(){
                        var selId = getSelId();
                        if(selId && tree){
                            tree.selectItem(selId,true);   //选中原来的元素
                        }
                    }) ;
                });
        };

        /**
         * 编辑小组提交
         */
        var editGroup = function(){
            if(!editGroupForm.validation()){
                $("#fm-edit-group input[data-validation]").focus();
                return ;
            }
            SGIS.UI.addLoadingBar0();
            SGIS.API.put("macro/enumGroups/"+getSelId())
                .data(editGroupForm.serializeObject())
                .json(function(re){
                    SGIS.UI.clearLoadingBar0();
                    if(re.maitid == getSelId()){
                       SGIS.UI.alert("修改分组成功");
                    }else{
                       SGIS.UI.alert("修改分组失败");
                    }
                    editGroupModal.hide();
                    initTree(function(){
                        var selId = getSelId();
                        if(selId){
                            tree.selectItem(selId,true);   //选中原来的元素
                        }
                    });
                });

        };

        /**
         * 删除指定分组提交
         *
         */
        var delGroup = function(){
            if(confirm("确定删除该分组吗?")){
                SGIS.UI.addLoadingBar0();
                SGIS.API.del("macro/enumGroups/"+getSelId()).json(function(re){
                    SGIS.UI.clearLoadingBar0();
                    if(re.status){
                       SGIS.UI.alert("删除分组成功");
                    }else{
                       SGIS.UI.alert("删除分组失败");
                    }
                    initTree(function(){
                        tree && tree.selectItem(1,true);   //选中第一个元素
                    });
                });
            }else{
                return ;
            }
        };

        /**
         * 判断是否选中
         *
         * @returns {boolean}
         */
        var hasSelected = function(){
            var setId = getSelId();
            return setId != null && setId != undefined ? true:false ;
        };

        /**
         * 取得选中的值
         *
         * @returns {*}
         */
        var getSelId = function(){
            return _selId ;
        };

        /**
         * 设置选中的值
         *
         * @param id
         *          选中的id
         */
        var setSelId = function(id){
            _selId = id;
        };

        return {
            init : init,
            setSelId:setSelId,
            getSelId:getSelId
        };
    })();

    /**
     * 分组目录值
     */
    var GroupVal = (function(){
        var grid ;
        var vlTree;
        var newGroupvalModal,editGroupvalModal,importGroupvalModal ;
        var newGroupvalForm ,editGroupvalForm,importGroupvalForm;
        var _groupId ;      //分组id
        var _groupvalId ;   //分组值id

        /**
         * 初始化
         */
        var init = function(){
            newGroupvalModal = new Modal("fm-new-groupval","添加分组值");
            editGroupvalModal = new Modal("fm-edit-groupval","修改分组值");
            importGroupvalModal = new Modal("fm-import-groupval","导入分组值",{"size":"sm"});

            newGroupvalForm = new SGIS.AutoForm("#fm-new-groupval form");
            editGroupvalForm = new SGIS.AutoForm("#fm-edit-groupval form");
            importGroupvalForm = new SGIS.AutoForm("#fm-import-groupval form");

            /**
             * 注册点击事件
             */
            $("div.container-fluid .btn[id*=iden]").click(function(){
                var id = $(this).attr("id") ;
                var split = id.split("-");
                switch (split[1]){
                    case "new":
                        if(!getSelGroupId()){
                           SGIS.UI.alert("请先选择一个指标分组");
                            return ;
                        }
                        newGroupvalForm.reset();
                        getAllIdenvalTree(false);   //获取指定分组下的分组值树
                        newGroupvalModal.show();
                        break;
                    case "edit" :
                        var valId = grid.getSelectedRowId() ;
                        if(!valId){
                           SGIS.UI.alert("请先选择一条分组值");
                            return ;
                        }
                        if(valId.indexOf(",")!=-1){
                            SGIS.UI.alert("只能选择一条分组值进行修改");
                            return ;
                        }
                        editGroupvalForm.reset();
                        SGIS.API.get("macro/enumGroups/"+getSelGroupId()+"/enums/"+valId)
                            .json(function(re){
                                var settings = { "maivid":"tmicroIdent.maitid"};
                                editGroupvalForm.setInitValue(re,settings);
                                getAllIdenvalTree(true);   //获取指定分组下的分组值树
                                editGroupvalModal.show() ;
                            });
                        break;
                    case "remove":
                        var valId = grid.getSelectedRowId() ;
                        if(!valId){
                           SGIS.UI.alert("请先选择一条分组值");
                            return ;
                        }
                        delGroupVal() ;
                        break;
                    case "import":
                        if(!getSelGroupId()){
                           SGIS.UI.alert("请先选择一个指标分组");
                            return ;
                        }
                        importGroupvalForm.reset();
                        importGroupvalModal.show() ;
                        break;
                    default :
                        break;
                }
            });

            /**
             * 注册提交点击事件
             */
            $(".modal .btn[id*=groupval-ok]").click(function(){
                var id = $(this).attr("id") ;
                var split = id.split("-");
                switch (split[0]){
                    case "new":
                        newGroupVal();
                        break;
                    case "edit" :
                        editGroupVal();
                        break;
                    case "import":
                        importGroupVal();
                        break;
                    default :
                        break;
                }
            });

            /**
             * 点击模板下载
             */
            $("#import-template-download-btn").click(function(){
                downloadTemplate();
            });

            /**
             * 选中文件
             */
            $("#file").change(function(){
                uploadFile();
            });

            initGrid(); //初始化grid的数据
        };

        /**
         * 初始化grid的数据
         */
        var initGrid = function(){
            grid && grid.destructor();
            grid = SGIS.Grid.create(idenvGrid);
            grid.setHeader("序号,代码,名称,备注,所属父节点");
            grid.setInitWidths("100,150,150,300,*");
            grid.setColSorting("int,str,str,str,str");
            grid.enableMultiselect(true) ;
            grid.init();
        };

        /**
         * 新建指定分组的值操作
         */
        var newGroupVal = function(){
            if(!newGroupvalForm.validation()){
                var parid = $("#fm-new-groupval input[name=parid]").val();
                if(parid == ""){
                    $("#fm-new-groupval p.help-block:last").html("未选择父节点");

                    setTimeout(function(){
                        $("#fm-new-groupval p.help-block:last").html("");
                    },1500);
                }
                return ;
            }
            SGIS.UI.addLoadingBar0();
            var code = $("#fm-new-groupval input[name=code]").val();
            //判断Code是否存在，保证唯一性
            SGIS.API.get("macro/enumGroups/"+getSelGroupId()+"/enums/code/"+code)
                .json(function(re){
                    SGIS.UI.clearLoadingBar0();
                    if(re.status){
                        $("#fm-new-groupval input[name=code]").next().html("该值已经存在！");
                        $("#fm-new-groupval input[name=code]").select().focus();
                        setTimeout(function(){
                            $("#fm-new-groupval input[name=code]").next().html("");
                        },1500);

                        return ;
                    }else{
                        //新增
                        SGIS.API.post("macro/enumGroups/"+getSelGroupId()+"/enums")
                            .data(newGroupvalForm.serializeObject())
                            .json(function(re){
                                if(re.status){
                                   SGIS.UI.alert("添加分组值成功");
                                }else{
                                   SGIS.UI.alert("添加分组值失败");
                                }
                                newGroupvalModal.hide();

                                refreshGrid(getSelGroupId());
                        });
                    }
                });
        };

        /**
         * 编辑指定分组值操作
         */
        var editGroupVal = function(){
            if(!editGroupvalForm.validation()){
                var name = $("#fm-edit-groupval input[name=name]").val();
                var code = $("#fm-edit-groupval input[name=code]").val();
                if(name == ""){
                    $("#fm-edit-groupval input[name=name]").focus();
                }else if(code == ""){
                    $("#fm-edit-groupval input[name=code]").focus();
                }

                return ;
            }
            SGIS.UI.addLoadingBar0();
            var valId = grid.getSelectedRowId() ;

            var code = $("#fm-edit-groupval input[name=code]").val();
            //判断Code是否存在，保证唯一性
            SGIS.API.get("macro/enumGroups/"+getSelGroupId()+"/enums/"+valId+"/code/"+code)
                .json(function(re){
                    SGIS.UI.clearLoadingBar0();
                    if(re.status){
                        $("#fm-edit-groupval input[name=code]").next().html("该值已经存在！");
                        $("#fm-edit-groupval input[name=code]").select().focus();
                        setTimeout(function(){
                            $("#fm-edit-groupval input[name=code]").next().html("");
                        },1500);

                        return ;
                    }else{
                        //修改
                        SGIS.API.put("macro/enumGroups/"+getSelGroupId()+"/enums/"+valId)
                            .data(JSON.stringify(editGroupvalForm.serializeObject()))
                            .json(function(re){
                                if(re.status){
                                   SGIS.UI.alert("修改分组值成功");
                                }else{
                                   SGIS.UI.alert("修改分组值失败");
                                }
                                editGroupvalModal.hide();
                                refreshGrid(getSelGroupId());
                            });
                    }
                });
        };

        /**
         * 删除指定指标分组值操作
         */
        var delGroupVal = function(){
            var valId = grid.getSelectedRowId() ;
            if(confirm("确定删除该分组值吗?")){
                SGIS.UI.addLoadingBar0();
                SGIS.API.del("macro/enumGroups/"+getSelGroupId()+"/enums/"+valId)
                    .data(JSON.stringify(valId.split(",")))
                    .json(function(re){
                        SGIS.UI.clearLoadingBar0();
                        if(re.status){
                           SGIS.UI.alert("删除分组值成功");
                        }else{
                           SGIS.UI.alert("删除分组值失败");
                        }
                        refreshGrid(getSelGroupId());
                    });
            }else{
                return ;
            }
        };

        /**
         * 导入分组值操作
         */
        var importGroupVal = function(){
            var path = $("#fm-import-groupval input[type=file]").val();
            if(!path){
               SGIS.UI.alert("请先选择文件");
                return ;
            }
            var extendName =path.substring( path.lastIndexOf(".")+1);
            if(extendName!="xls"&&extendName!="xlsx"
                &&extendName!="XLS"&&extendName!="XLSX"){
               SGIS.UI.alert("文件格式错误，请选择excel文件");
                return ;
            }
            var sheet = $("#sheetname").val();  //获取sheetname值
            SGIS.UI.addLoadingBar0();
            SGIS.API.post("macro/enumGroups/"+getSelGroupId()+"/enums/import")
                .data({
                    path:$("#filename").val(),  //文件
                    sheetName :(sheet && sheet != "") ? sheet : "Sheet0"
                })
                .json(function(re){
                    SGIS.UI.clearLoadingBar0();
                    if(re.status){
                       SGIS.UI.alert("导入成功");
                    }else{
                       SGIS.UI.alert("导入失败");
                    }
                    importGroupvalModal.hide();
                    refreshGrid(getSelGroupId());
                });
        };

        /**
         * 导入文件模板下载
         */
        var downloadTemplate = function(){
            window.open(SGIS.API.getURL("macro/enumGroups/enums/import/template/download"));
        };

        /**
         * 上传文件
         */
        var uploadFile = function(){
            var path = $("#fm-import-groupval input[type=file]").val();
            if(!path){
               SGIS.UI.alert("请先选择文件");
                return  ;
            }
            var extendName =path.substring( path.lastIndexOf(".")+1);
            if(extendName!="xls"&&extendName!="xlsx"
                &&extendName!="XLS"&&extendName!="XLSX"){
               SGIS.UI.alert("文件格式错误，请选择excel文件");
                return ;
            }

            $("#import-form").attr("action",SGIS.API.getURL("common/upload"));
            $("#import-form").submit();

            //监听一次iframe的change事件
            $("#upload-iframe").one("load", function(){
                var c = $(this).contents().find("body");
                var re = $.trim(c.text());
                if (re){
                    getExcelSheets(re);
                }
                c.empty();
            });
        };

        /**
         * 设置Excel 上传的相关参数
         *
         * @param re
         */
        var getExcelSheets = function(re){
            if(typeof re == "string")
                re = JSON.parse(re);

            $("#filename").val(re.fileName);    //保存新的文件名

            var arr = re["sheets"];
            var par = $("#sheetname");
            var templ ="<option value='{{index}}'>{{name}}</option>";
            var html = "";
            var leng = arr.length;
            for(var i =0 ; i < leng; i++){
                html += SGIS.Util.template(templ,arr[i]);
            }
            par.html(html);
        };


        /**
         * 清空grid
         */
        var clearAll = function(){
            setSelGroupId(null);
            grid && grid.clearAll(false);
        };

        /**
         * 刷新指定分组下的grid内容
         *
         * @param groupId
         *             指定分组id
         */
        var refreshGrid = function(groupId){
            groupId && setSelGroupId(groupId);

            SGIS.API.get("macro/enumGroups/"+getSelGroupId()+"/enums")
                .json(function(re){
                    var id ="maivid";
                    var fields = ["code","name","memo","parid"];
                    grid&&grid.clearAll(false);
                    grid&&grid.parse(common.jsonToGridData(re,id,fields,true),"json");

                });
        };

        /**
         * 获取指定分组下所有的 (未父节点指定节点)
         *
         * @param editUpdate
         *          是否是编辑调用的
         */
        var getAllIdenvalTree = function(editUpdate){
            vlTree && vlTree.destructor();
            if(editUpdate) {
                $("#selected-vl-edit-itemText").html("");    //清空选择
                $("#fm-edit-groupval input[name=parid]").val("");

                //加载所有的节点
                SGIS.API.get("macro/enumGroups/"+getSelGroupId()+"/enums/allItems")
                    .text(function(xml){
                        vlTree = SGIS.Tree.create(idenvlTreeEdit,xml,editActions);
                        vlTree.openItem("root");

                        var valId = $("#fm-edit-groupval input[name=parid]").val();
                        vlTree.openAllItems("root");      //打开所有的节点

                        var currentValId = grid.getSelectedRowId() ;            //当前要修改的元素
                        var parItemId = vlTree.getParentId(currentValId);       //获取父节点(再删除之前获取，否则为空)
                        vlTree.selectItem(parItemId,true);                      //选中父节点元素

                        /**
                         * 设置不可选的为灰色
                         */
                        vlTree.setItemColor(currentValId,"#aaaaaa","#aaaaaa");
                        var array = vlTree.getAllSubItems(currentValId);     //获取所有子节点id
                        if(array){
                            array = array.split(",");
                            for(var i in array){
                                if(typeof array[i] == "string")
                                    vlTree.setItemColor(array[i],"#aaaaaa","#aaaaaa");
                            }
                        }
                        vlTree.closeAllItems(currentValId);      //关闭所有的节点
                    });
            }else{  //新增
                $("#selected-vl-new-itemText").html("");    //清空选择
                $("#fm-new-groupval input[name=parid]").val("");

                //动态加载子节点
                SGIS.API.get("macro/enumGroups/"+getSelGroupId()+"/enums/rootItems")
                    .text(function(xml){
                        vlTree = SGIS.Tree.create(idenvlTreeNew,xml,newActions,newLazyLoad);
                        vlTree.openItem("root");
                    });
            }

            /**
             * 新增时目录树的点击事件
             * @type {{onClick: onClick}}
             */
            var newActions = {
                onClick:function(_id){
                    var itemText = vlTree.getItemText(_id);
                    var code = vlTree.getUserData(_id,"code");    //获取选中的code作为当前节点的父节点
                    $("#selected-vl-new-itemText").html(itemText);
                    $("#fm-new-groupval input[name=parid]").val(code=="root"?"0":code);//根节点用0
                }
            };

            /**
             * 编辑时目录树的点击事件
             * @type {{onClick: onClick}}
             */
            var editActions = {
                onClick:function(_id){
                    var itemText = vlTree.getItemText(_id);
                    var code = vlTree.getUserData(_id,"code");    //获取选中的code作为当前节点的父节点
                    $("#selected-vl-edit-itemText").html(itemText);
                    $("#fm-edit-groupval input[name=parid]").val(code=="root"?"0":code);//根节点用0

                    /**
                     * 设置不可选的为灰色
                     */
                    var currentValId = grid.getSelectedRowId() ;            //当前要修改的元素
                    var array = vlTree.getAllSubItems(currentValId);     //获取所有子节点id
                    if(_id == currentValId){
                        vlTree.setItemColor(currentValId,"#aaaaaa","#aaaaaa");

                        var parItemId = vlTree.getParentId(currentValId);       //获取父节点(再删除之前获取，否则为空)
                        vlTree.selectItem(parItemId,true);                      //选中父节点元素

                        return ;
                    }//end if(_id == currentValId)
                    if(array){
                        array = array.split(",");
                        for(var i in array){
                            if(typeof array[i] == "string" && array[i] == _id){
                                vlTree.setItemColor(array[i],"#aaaaaa","#aaaaaa");

                                var parItemId = vlTree.getParentId(currentValId);       //获取父节点(再删除之前获取，否则为空)
                                vlTree.selectItem(parItemId,true);                      //选中父节点元素
                                return ;
                            }
                        }
                    }//end if(array)

                    /**end 设置不可选的为灰色*/
                }
            };

            /**
             *
             * @param obj
             * @param id
             *          当前点击的节点
             */
            var newLazyLoad = function(obj,id){
                VLTREEOPTION.openLeafTree(obj,id);  //打开子节点
            };

        };

        /**
         * 树操作
         */
        var VLTREEOPTION = (function(){
            /**
             * 是否是临时节点（存在loading节点）
             * @param obj
             * @param id
             */
            var isTempNode = function(obj,id){
                var tempnode = obj.getAllSubItems(id).indexOf("load");
                if (tempnode == 0) {
                    return true;//未加载
                }
                return false;
            };

            /**
             * 打开子节点
             */
            var openLeafTree = function(obj, id){
                if(isTempNode(obj,id)){
                    obj.deleteChildItems(id);//删除子节点
                    addTreeNode(id);//查询并加载子节点
                }
            };

            /**
             * 加载子节点
             *
             * @param id
             */
            var addTreeNode = function(id){
                SGIS.API.get("macro/enumGroups/"+getSelGroupId()+"/enums/"+id+"/rootItems")
                    .text(function(xml){
                        vlTree.loadXMLString(xml);
                    });
            };

            return{
                openLeafTree:openLeafTree
            };
        })();


        /**
         * 设置选中的分组id
         *
         * @param groupid
         */
        var setSelGroupId = function(groupid){
            _groupId = groupid;
        };

        /**
         * 获取选中的分组
         *
         * @returns {*}
         */
        var getSelGroupId = function(){
            return _groupId;
        };

        /**
         * 设置选中的分组下的值id
         *
         * @param groupid
         */
        var setSelGroupValId = function(groupvalid){
            _groupvalId = groupvalid;
        };

        /**
         * 获取选中的分组
         *
         * @returns {*}
         */
        var getSelGroupValId = function(){
            return _groupvalId;
        };


        return {
            init:init,
            clearAll:clearAll,
            refreshGrid:refreshGrid,
            setSelGroupId:setSelGroupId
        };
    })();



    /**
     * 返回总入口方法接口
     */
    return {
        init : init
    };
});