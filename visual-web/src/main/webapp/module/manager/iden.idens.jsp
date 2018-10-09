<%--
  Created by IntelliJ IDEA.
  User: Augustine
  Date: 2014/9/1
  Time: 15:57
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<!doctype html>
<html>
<head>
    <title>指标管理</title>
    <link rel="stylesheet" type="text/css" href="../../lib/bootstrap/css/bootstrap.min.css">

    <link rel="stylesheet" href="../../lib/dhtmlx/dhtmlxgrid.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/skins/dhtmlxgrid_dhx_skyblue.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/skins/dhtmlxgrid_dhx_terrace.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/dhtmlxtree.css"/>

    <script src="../../lib/jquery/jquery-1.11.3.js"></script>

    <link rel="stylesheet" type="text/css" href="../../page/mcom.css">
    <style type="text/css" rel="stylesheet">
       div.cnt{
           display: none;
       }
       #sel-type select{
           position: relative;
           left: 20px;
           width: 150px;
           height: 25px;
           margin: 10px;
       }

       #modal-set-enumcatalog .modal-dialog.modal-sm{
           width: 56rem;
       }

       #modal-set-enumcatalog .modal-content{
           height: 30rem;
       }

       #modal-set-enumcatalog .modal-body{
           height: 20rem;
       }
       #modal-set-enumcatalog .col-sm-9{
           padding-left: 10rem;
           width: 35rem;
       }
       #modal-set-enumcatalog #iden-grid{
           width: 25rem;
           height: 15rem;
       }

       #modal-set-enumcatalog .col-sm-3{
           padding-left: 3rem;
           width: 20rem;
       }
       .table.row{
           margin-top:10px;
           margin-bottom:0px;
       }

      #cnt_table div button{
          width:80px;
          margin-bottom: 5px;
      }
    </style>
</head>
<body>
<div class="container-fluid">
    <div class="row">
        <div class="col-sm-3">
            <div class="row">
                <h3>指标分类筛选</h3>
            </div>
            <div class="row">
                <form class="form-horizontal" role="form">
                    <div class="form-group">
                        <label class="col-sm-3 control-label">数据类型</label>

                        <div class="col-sm-7">
                            <select class="form-control" id="data-type" data-value="1">
                                <option value="11">年报</option>
                                <option value="12">季报</option>
                                <option value="13">月报</option>
                                <option value="4">年鉴</option>
                                <option value="1">经济普查</option>
                                <option value="2">人口普查</option>
                                <option value="3">农业普查</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-sm-3 control-label">行政级别</label>
                        <div class="col-sm-7">
                            <select class=" col-sm-8 form-control" id="data-level" data-value="1">
                                <%--<option value="1">全国</option>--%>
                                <option value="2">省、直辖市</option>
                                <option value="3">地市</option>
                                <option value="4">区县</option>
                                <option value="5">乡镇街道</option>
                                <option value="6">村居委会</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>

            <div class="row" style="padding-right: 10px">
                <div id="tree_root" style="cursor:pointer;">综合目录树</div>
                <div id="mix-tree" class="tree-container"></div>
            </div>

        </div>
        <div id="right_content" class="col-sm-9">
            <h3 class="operhead">分类、表和指标管理</h3>
            <div class="row catalog hide">
                <div class="btn-group">
                    <button type="button" id="btn-add-toc" class="btn btn-default">添加分类</button>
                    <button type="button" id="btn-edit-toc" class="toc btn btn-default">修改分类</button>
                    <button type="button" id="btn-del-toc" class="toc btn btn-danger">删除分类</button>
                </div>
                <button id="btn-imp-toc" style="position:relative;left: 20px" type="button"
                        class="btn btn-primary" title="excel导入当前目录下的子分类">导入分类</button>
                <button id="btn-copy-toc" style="position:relative;left: 20px" type="button"
                        class="btn btn-primary" title="复制选中子分类到当前目录下">复制分类</button>
            </div>

            <div class="row table hide">
                <div class="btn-group">
                    <button type="button" id="btn-add-table" class="btn btn-default">添加表</button>
                    <button type="button" id="btn-edit-table" class="btn btn-default tab disabled" >修改表</button>
                    <button type="button" id="btn-del-table" class="btn btn-danger tab disabled">删除表</button>
                </div>
                <button id="btn-imp-table" style="position:relative;left: 20px" type="button" class="btn btn-primary">导入表</button>
             </div>

             <div class="row iden hide">
                <div class="btn-group">
                    <button type="button" id="btn-add-iden" class="btn btn-default">添加</button>
                    <button type="button" id="btn-edit-iden" class="btn btn-default">修改</button>
                    <button type="button" id="btn-del-iden" class="btn btn-danger">删除</button>
                </div>
                <button id="btn-imp-iden" style="position:relative;left: 20px" type="button"
                        class="btn btn-primary" title="excel导入当前（表）下的指标">导入</button>
                <button id="btn-copy-iden" style="position:relative;left: 20px" type="button"
                        class="btn btn-primary" title="复制选中指标到当前（表）下">复制</button>
                <button id="btn-set-enum" style="position:relative;left: 20px" type="button"
                        class="btn btn-default" title="设置枚举型指标对应的枚举分组">设置分组</button>
             </div>

            <div class="row">
                <div id="mix_gridbox" class="grid-container"></div>
            </div>
    </div>
</div>

<!--新建目录（分类）的form -->
<div id="fm-new-toc" class="fm hide">
    <div class="mbody">
        <form role="form">
            <div class="form-group">
                <label for="in-toc-name" class="input-primary">分类名称</label>
                <input type="text" name="idenName" class="form-control" id="in-toc-name" placeholder="">
            </div>
            <div class="form-group">
                <label for="in-toc-memo">备注</label>
                <input type="text" name="memo" class="form-control" id="in-toc-memo" placeholder="">
            </div>

        </form>
    </div>

    <div class="mfooter">
        <button id="submit-create-toc" type="button" class="btn btn-primary">创建</button>
    </div>

</div>

<!--编辑目录（分类）的form -->
<div id="fm-edit-toc" class="fm hide">
    <div class="mbody">
        <form role="form">
            <div class="form-group">
                <label for="ine-toc-name" class="input-primary">分类名称</label>
                <input type="text" name="idenName" class="form-control" id="ine-toc-name" placeholder="">
            </div>
            <div class="form-group">
                <label for="ine-toc-memo">备注</label>
                <input type="text" name="memo" class="form-control" id="ine-toc-memo" placeholder="">
            </div>
        </form>
    </div>

    <div class="mfooter">
        <button id="submit-edit-toc" type="button" class="btn btn-primary">确定</button>
    </div>
</div>

<!--导入目录（分类）的form -->
<div id="fm-imp-toc" class="fm hide">
    <div class="mbody">
        <form role="form" id="imp-toc-form" target="toc-upload-iframe" enctype="multipart/form-data" method="post">
            <div class="form-group">
                <button type="button"  id="btn-toc-down-template" class="btn btn-link">模板下载</button>
            </div>
            <div class="form-group">
                <label  class="input-primary">选择文件</label>
                <input type="file" id="in-toc-file" name="file" class="form-control"  placeholder="支持格式.xls .xlsx">
            </div>
            <div class="form-group">
                <select name="sheetname"  class="form-control">
                </select>
            </div>
            <iframe id="toc-upload-iframe" name="toc-upload-iframe" style="display: none"></iframe>
        </form>
    </div>

    <div class="mfooter">
        <button id="submit-imp-toc"  type="button" class="btn btn-primary">确定</button>
    </div>
</div>

<!-- 表的操作-->
<!--新建表的form -->
<div id="fm-new-table" class="fm hide">
    <div class="mbody">
        <form role="form">
            <div class="form-group">
                <label for="in-table-name" class="input-primary">表名称</label>
                <input type="text" name="idenName" class="form-control" id="in-table-name" placeholder="">
            </div>
            <div class="form-group">
                <label for="in-table-memo">备注</label>
                <input type="text" name="memo" class="form-control" id="in-table-memo" placeholder="">
            </div>
        </form>
    </div>
    <div class="mfooter">
        <button id="submit-create-table" type="button" class="btn btn-primary">创建</button>
    </div>

</div>

<!--编辑表的form -->
<div id="fm-edit-table" class="fm hide">
    <div class="mbody">
        <form role="form">
            <div class="form-group">
                <label for="ine-table-name" class="input-primary">表名称</label>
                <input type="text" name="idenName" class="form-control" id="ine-table-name" placeholder="">
            </div>
            <div class="form-group">
                <label for="ine-table-memo">备注</label>
                <input type="text" name="memo" class="form-control" id="ine-table-memo" placeholder="">
            </div>
        </form>
    </div>

    <div class="mfooter">
        <button id="submit-edit-table" type="button" class="btn btn-primary">确定</button>
    </div>
</div>

<!--导入表的form -->
<div id="fm-imp-table" class="fm hide">
    <div class="mbody">
        <form role="form" target="table-upload-iframe" enctype="multipart/form-data" method="post">
            <div class="form-group">
                <button type="button"  id="btn-table-down-template" class="btn btn-link">模板下载</button>
            </div>
            <div class="form-group">
                <label  class="input-primary">选择文件</label>
                <input type="file" id="in-table-file" name="file" class="form-control"  placeholder="支持格式.xls .xlsx">
            </div>
            <div class="form-group">
                <select name="sheetname"  class="form-control">
                </select>
            </div>
            <iframe id="table-upload-iframe" name="table-upload-iframe" style="display: none"></iframe>
        </form>
    </div>

    <div class="mfooter">
        <button id="submit-imp-table"  type="button" class="btn btn-primary">确定</button>
    </div>
</div>

    <!-- 指标 -->
    <!-- 新建指标-->
    <div id="fm-new-iden" class="fm hide">
        <div class="mbody">
            <form role="form">
                <input type="hidden" name="idenType" value="2">
                <div class="form-group">
                    <label for="in-iden-name" class="input-primary">指标名称</label>
                    <input type="text" name="idenName" class="form-control" id="in-iden-name" placeholder="">
                </div>
                <div class="form-group">
                    <label for="in-iden-unit" class="input-primary">指标单位</label>
                    <input type="text" name="idenUnit" class="form-control" id="in-iden-unit" placeholder="">
                </div>
                <div class="form-group">
                    <label for="in-iden-unit" class="input-primary">小数位数</label>
                    <input type="text" name="idenPrecision" class="form-control" id="in-iden-precision" placeholder="">
                </div>
                <div class="form-group">
                    <label for="in-iden-memo">备注</label>
                    <input type="text" name="memo" class="form-control" id="in-iden-memo" placeholder="">
                </div>
            </form>
        </div>
        <div class="mfooter">
            <button id="submit-create-iden" type="button" class="btn btn-primary">创建</button>
        </div>

    </div>

    <!--编辑指标的form -->
    <div id="fm-edit-iden" class="fm hide">
        <div class="mbody">
            <form role="form">
                <div class="form-group">
                    <label for="ine-iden-name" class="input-primary">指标名称</label>
                    <input type="text" name="idenName" class="form-control" id="ine-iden-name" placeholder="">
                </div>
                <div class="form-group">
                    <label for="ine-iden-unit" class="input-primary">指标单位</label>
                    <input type="text" name="idenUnit" class="form-control" id="ine-iden-unit" placeholder="">
                </div>
                <div class="form-group">
                    <label for="in-iden-unit" class="input-primary">小数位数</label>
                    <input type="text" name="idenPrecision" class="form-control"  placeholder="">
                </div>
                <div class="form-group">
                    <label for="ine-iden-memo">备注</label>
                    <input type="text" name="memo" class="form-control" id="ine-iden-memo" placeholder="">
                </div>
            </form>
        </div>

        <div class="mfooter">
            <button id="submit-edit-iden" type="button" class="btn btn-primary">确定</button>
        </div>
    </div>

    <!--导入指标的form -->
    <div id="fm-imp-iden" class="fm hide">
        <div class="mbody">
            <form role="form" target="iden-upload-iframe" enctype="multipart/form-data" method="post">
                <div class="form-group">
                    <button type="button"  id="btn-iden-down-template" class="btn btn-link">模板下载</button>
                </div>
                <div class="form-group">
                    <label  class="input-primary">选择文件</label>
                    <input type="file" id="in-iden-file" name="file" class="form-control"  placeholder="支持格式.xls .xlsx">
                </div>
                <div class="form-group">
                    <select name="sheetname"  class="form-control">
                    </select>
                </div>
                <iframe id="iden-upload-iframe" name="iden-upload-iframe" style="display: none"></iframe>
            </form>
        </div>

        <div class="mfooter">
            <button id="submit-imp-iden"  type="button" class="btn btn-primary">确定</button>
        </div>
    </div>

    <!--设置枚举分组 start -->
    <div class="modal fade" id="modal-set-enumcatalog">
        <div class="modal-dialog modal-sm" >
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                    <h4 class="modal-title" id="modal-role-title">分组管理</h4>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-sm-3">
                            <div class="row">
                                <h5>全部分组</h5>
                            </div>
                            <div class="row">
                                <div id="iden-grid"></div>
                            </div>
                        </div>
                        <div class="col-sm-9">
                            <div class="row"><h5>检索分组</h5></div>
                            <div class="row">
                                <input style="position: relative; width: 15rem" type="text" id="queryKey" name="queryKey" placeholder="快速检索枚举分组">
                                <button style="position: relative" type="button" class="btn btn-primary" id="query-btn">查询</button>
                            </div>
                            <div class="row" style="height: 145px; overflow-y: auto">
                                <div id="enum-form">
                                    <form role="form" id="resultEnum">
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" id="set-enum-cancel" data-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" id="set-enum-ok">设置分组</button>
                    <button type="button" class="btn btn-primary" id="del-enum-ok">取消分组</button>
                </div>
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- -->

    <!--复制指标  -->
    <div id="fm-copy-iden" class="fm hide">
        <div class="mbody">
            <div class="row">
                <form class="form-inline form-two" role="form">
                    <div class="form-group">
                        <label  for="data-type">数据类型：</label>
                        <select name="type" id="c_data-type" data-value="2" style="width: 150px;height: 25px">
                            <option value="11">年报</option>
                            <option value="12">季报</option>
                            <option value="13">月报</option>
                            <option value="4">年鉴</option>
                            <option value="1">经济普查</option>
                            <option value="2">人口普查</option>
                            <option value="3">农业普查</option>

                            <%--<option value="11">年报</option>--%>
                        </select>
                    </div>
                    <div class="form-group">
                        <label  for="data-level">行政级别：</label>
                        <select name="level" id="c_data-level" data-value="2" style="width: 150px;height: 25px">
                            <option value="2">省级</option>
                            <option value="3">市级</option>
                            <option value="4">区县</option>
                            <option value="5">乡镇</option>
                            <option value="6">村</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="row" style="padding-top:20px;padding-left: 50px">
                <div id="copy-tree" class="tree-container"></div>
            </div>
        </div>
        <div class="mfooter">
            <button id="copy-iden-cal"  type="button" class="btn btn-primary" data-dismiss="modal">取消</button>
            <button id="copy-iden-ok"  type="button" class="btn btn-primary">确定</button>
        </div>
    </div>
</div>
</body>

<script src="../../lib/bootstrap/js/bootstrap.min.js"></script>

<script src="../../lib/dhtmlx/dhtmlxcommon.js"></script>
<script src="../../lib/dhtmlx/dhtmlxgrid.js"></script>
<script src="../../lib/dhtmlx/dhtmlxgridcell.js"></script>
<script src="../../lib/dhtmlx/ext/dhtmlxgrid_drag.js"></script>
<script src="../../lib/dhtmlx/dhtmlxtree.js"></script>

<script src="../../page/base.js"></script>
<script src="../../lib/seajs/sea.js"></script>
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
    seajs.use('manager/iden.idens');
</script>
</html>
