<%--
  Created by IntelliJ IDEA.
  User: Augustine
  Date: 2014/9/1
  Time: 14:55
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
<head>
    <title>指标分组管理</title>

    <link rel="stylesheet" type="text/css" href="../../lib/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../lib/dhtmlx/dhtmlxgrid.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/skins/dhtmlxgrid_dhx_skyblue.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/skins/dhtmlxgrid_dhx_terrace.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/dhtmlxtree.css"/>
    <script src="../../lib/jquery/jquery-1.11.3.js"></script>

    <link rel="stylesheet" type="text/css" href="../../page/mcom.css">
    <style type="text/css" rel="stylesheet">
           .selected-vl-itemText{
               font-size: 1em;
               margin-left: 10px;
               color:#000080;
           }
           .idenv-tree-container{
               width: 100%;
               margin-top: 15px;
               padding-top:10px;
               padding-bottom:5px;
               max-height:300px;
               overflow: auto !important;
               border:1px #f5f5f5 solid;
               box-sizing: content-box;
           }
           p.help-block{
               color:#f00;
               font-weight: bold;
           }
    </style>
</head>
<body>
<div class="container-fluid">
    <div class="row">
        <div class="col-sm-3">
            <div class="row">
                <h3>指标分组</h3>
                <div class="btn-group">
                    <button type="button" id="btn-new-tem" class="btn btn-default"><span class="glyphicon glyphicon-plus"></span></button>
                    <button type="button" id="btn-edit-tem" class="btn btn-default"><span class="glyphicon glyphicon-pencil"></span></button>
                    <button type="button" id="btn-remove-tem" class="btn btn-default"><span class="glyphicon glyphicon-minus"></span></button>
                </div>
            </div>
            <div class="row" style="padding-right: 10px">
                <div id="ideng-gridbox" class="grid-container"></div>
            </div>

        </div>
        <div class="col-sm-9" >
            <div class="row">
                <h3>分组值管理</h3>
                <div class="btn-group">
                    <button type="button" id="btn-new-iden" class="btn btn-default">添加</button>
                    <button type="button" id="btn-edit-iden" class="btn btn-default">修改</button>
                    <button type="button" id="btn-remove-iden" class="btn btn-danger">删除</button>
                </div>
                <button style="position:relative;left: 20px" type="button" id="btn-import-iden" class="btn btn-primary">导入</button>
            </div>
            <div class="row">
                <div id="idenv-gridbox" class="grid-container"></div>
            </div>
        </div>
    </div>
</div>

<!--指标分组添加 start -->
<div class="fm fade" id="fm-new-group">
    <div class="mbody">
        <form role="form">
            <input type="hidden" name="status" value="1">
            <div class="form-group">
                <label  class="input-primary">分组名称</label>
                <input type="text" name="name"  data-validation="notnull" class="form-control"  placeholder="分组名称">
            </div>
            <div class="form-group">
                <label >备注</label>
                <input type="text"  name ="memo" class="form-control"  placeholder="备注">
            </div>
        </form>

    </div>
    <div class="mfooter">
        <button type="button" class="btn btn-default" id="new-group-cancel" data-dismiss="modal">取消</button>
        <button type="button" class="btn btn-primary" id="new-group-ok">确认</button>
    </div>
</div><!-- 指标分组添加 end -->

<!--指标分组修改 start -->
<div class="fm fade" id="fm-edit-group">
    <div class="mbody">
        <form role="form">
            <input type="hidden" name="maitid">
            <input type="hidden" name="status" value="1">
            <div class="form-group">
                <label  class="input-primary">分组名称</label>
                <input type="text" name="name" data-validation="notnull" class="form-control"  placeholder="分组名称">
            </div>
            <div class="form-group">
                <label >备注</label>
                <input type="text" name ="memo" class="form-control"  placeholder="备注">
            </div>
        </form>
    </div>
    <div class="mfooter">
        <button type="button" class="btn btn-default" id="edit-group-cancel" data-dismiss="modal">取消</button>
        <button type="button" class="btn btn-primary" id="edit-group-ok">确认</button>
    </div>
</div><!-- 指标分组修改 end -->

<!--指标分组值添加 start -->
<div class="fm fade" id="fm-new-groupval">
    <div class="mbody">
        <form role="form">
            <input type="hidden" name="status" value="1">
            <div class="form-group">
                <label  class="input-primary">名称</label>
                <input type="text" name="name" data-validation="notnull" class="form-control"  placeholder="名称">
            </div>
            <div class="form-group">
                <label  class="input-primary">代码</label>
                <input type="text" name="code" data-validation="notnull" class="form-control"  placeholder="代码">
                <p class="help-block"></p>
            </div>
            <div class="form-group">
                <label >备注</label>
                <input type="text" name="memo" class="form-control"  placeholder="备注">
            </div>
            <div class="form-group hidden">
                <label >父节点</label>
                <input type="hidden" name="parid" data-validation="notnull" class="form-control" placeholder="父节点">
            </div>
            <div class="form-group">
                <label >所属父节点<span id="selected-vl-new-itemText" class="selected-vl-itemText"></span></label>
                <p class="help-block"></p>
                <div id="idenv-tree-new" class="idenv-tree-container"></div>
            </div>
        </form>
    </div>
    <div class="mfooter">
        <button type="button" class="btn btn-default" id="new-groupval-cancel" data-dismiss="modal">取消</button>
        <button type="button" class="btn btn-primary" id="new-groupval-ok">确认</button>
    </div>
</div><!-- 指标分组添加 end -->

<!--指标分组值修改 start -->
<div class="fm fade" id="fm-edit-groupval">
    <div class="mbody">
        <form role="form">
            <input type="hidden" name="status">
            <input type="hidden" name="tmacroIdent.maitid">
            <input type="hidden" name="maivid">
            <div class="form-group">
                <label  class="input-primary">名称</label>
                <input type="text" name="name" data-validation="notnull" class="form-control"  placeholder="名称">
            </div>
            <div class="form-group">
                <label  class="input-primary">代码</label>
                <input type="text" name="code" data-validation="notnull" class="form-control"  placeholder="代码">
                <p class="help-block"></p>
            </div>
            <div class="form-group">
                <label >备注</label>
                <input type="text" name="memo" class="form-control"  placeholder="备注">
            </div>
            <div class="form-group hidden">
                <label >父节点</label>
                <input type="hidden" name="parid" data-validation="notnull" class="form-control" placeholder="父节点">
            </div>
            <div class="form-group">
                <label >所属父节点<span id="selected-vl-edit-itemText" class="selected-vl-itemText"></span></label>
                <p class="help-block"></p>
                <div id="idenv-tree-edit" class="idenv-tree-container"></div>
            </div>
        </form>

    </div>
    <div class="mfooter">
        <button type="button" class="btn btn-default" id="edit-groupval-cancel" data-dismiss="modal">取消</button>
        <button type="button" class="btn btn-primary" id="edit-groupval-ok">确认</button>
    </div>
</div><!-- 枚举分组值修改 end -->

<!--指标分组值导入 start -->
<div class="fm fade" id="fm-import-groupval">
    <div class="mbody">

        <form role="form"  id="import-form" target="upload-iframe" enctype="multipart/form-data" method="post">
            <div class="form-group">
                <button type="button"  id="import-template-download-btn" class="btn btn-link">模板下载</button>
            </div>
            <div class="form-group">
                <label  class="input-primary">选择文件</label>
                <input type="file" id="file" name="file" class="form-control"  placeholder="支持格式.xls .xlsx">
                <input type="hidden" id="filename" name="filename" class="form-control hidden" >
                <select name="sheetname" id="sheetname" class="form-control">

                </select>
                <%--<input type="hidden" id="sheetname" name="sheetname"   hidden" value="Sheet0" >--%>
            </div>
            <iframe id="upload-iframe" name="upload-iframe" style="display: none;"></iframe>
        </form>

    </div>
    <div class="mfooter">
        <button type="button" class="btn btn-default" id="import-groupval-cancel" data-dismiss="modal">取消</button>
        <button type="button" class="btn btn-primary" id="import-groupval-ok">确认</button>
    </div>
</div><!-- 指标分组值导入 end -->


</body>

<script src="../../lib/bootstrap/js/bootstrap.min.js"></script>

<script src="../../lib/dhtmlx/dhtmlxcommon.js"></script>
<script src="../../lib/dhtmlx/dhtmlxgrid.js"></script>
<script src="../../lib/dhtmlx/dhtmlxgridcell.js"></script>
<script src="../../lib/dhtmlx/ext/dhtmlxgrid_drag.js"></script>
<script src="../../lib/dhtmlx/dhtmlxtree.js"></script>

<script src="../../lib/seajs/sea.js"></script>

<script src="../../page/base.js"></script>
<script>
    var baseUrl = SGIS.BASE_URL + "module/";
    seajs.config({
        base: baseUrl      // sea.js用到的基础路径
        ,map:[
            ['.json', '.json?t=' + new Date().getTime()]
            ,['.js', '.js?t=' + new Date().getTime()],
            ['.css', '.css?t=' + new Date().getTime()]
        ]
    });
    seajs.use('manager/iden.group',function(obj){
        obj.init();
    });
</script>
</html>
