<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DCTYPE html>
<head>
    <title>数据导入</title>
    <link rel="stylesheet" type="text/css" href="../../lib/bootstrap/css/bootstrap.min.css">
    <script src="../../lib/jquery/jquery-1.11.3.js"></script>

    <link rel="stylesheet" href="../../lib/dhtmlx/dhtmlxgrid.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/skins/dhtmlxgrid_dhx_skyblue.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/skins/dhtmlxgrid_dhx_terrace.css"/>
    <link rel="stylesheet" href="../../lib/dhtmlx/dhtmlxtree.css"/>

    <link rel="stylesheet" type="text/css" href="../../page/mcom.css">
    <style>
        body{
            height: 90%;
            width: 100%;
        }
        .container-fluid{
            position: relative;
        }
        .right{
            text-align: right;
        }
        #excel-grid{
            position: relative;
            margin-top: 0px;
            top: 0px;
        }

    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-3" >
                <div class="row">
                    <h3>指标分类筛选</h3>
                </div>
                <div class="row">
                    <form class="form-horizontal" role="form" >
                        <div class="form-group">
                            <label class="col-sm-3 control-label">数据类型</label>
                            <div class="col-sm-7">
                                <select class="form-control" id="reportType">
                                    <option value="1">经济普查</option>
                                    <option value="2">人口普查</option>
                                    <option value="3">农业普查</option>
                                    <option value="11">年报</option>
                                    <option value="12">季报</option>
                                    <option value="13">月报</option>
                                    <option value="4">年鉴</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3 control-label">区划类型</label>
                            <div class="col-sm-7">
                                <select class=" col-sm-8 form-control" id="catalogs" name="tregioncatalog.rcid">
                                    <option value="{{rcid}}">{{name}}</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-3 control-label">行政级别</label>
                            <div class="col-sm-7">
                                <select class=" col-sm-8 form-control" id="level">
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
                <div class="row">
                    <div id="catalog-tree"> 目录树</div>
                </div>
            </div>
            <div class="col-sm-9" >
                <div class="row">
                    <h3>数据导入</h3>
                </div>
                <div class="row">
                    <form class="form-inline" role="form" >
                        <div class="form-group">
                            <label >数据格式：</label>
                        </div>
                        <div class="form-group">
                            <input type="radio" value="region" name="dataType" checked>
                            <label >分地区格式</label>
                        </div>
                        <%--<div class="form-group">--%>
                            <%--<input type="radio" value="sum" name="dataType">--%>
                            <%--<label >总量格式</label>--%>
                        <%--</div>--%>
                    </form>
                </div>
                <div class="row region">
                    <form class="form-inline" role="form" >
                        <div class="form-group">
                            <label >数据时间：</label>
                        </div>
                        <div class="form-group years">
                            <label >年份</label>
                            <select class="form-control" id="years">
                                <option value="{{year}}">{{year}}年</option>
                            </select>
                        </div>
                        <div class="form-group months">
                            <label >月份</label>
                            <select class="form-control" id="months">
                                <option value="1">1月</option>
                                <option value="2">2月</option>
                                <option value="3">3月</option>
                                <option value="4">4月</option>
                                <option value="5">5月</option>
                                <option value="6">6月</option>
                                <option value="7">7月</option>
                                <option value="8">8月</option>
                                <option value="9">9月</option>
                                <option value="10">10月</option>
                                <option value="11">11月</option>
                                <option value="12">12月</option>
                            </select>
                        </div>
                        <div class="form-group seasons hide">
                            <label >季度</label>
                            <select class="form-control" id="seasons">
                                <option value="13">第一季度</option>
                                <option value="14">第二季度</option>
                                <option value="15">第三季度</option>
                                <option value="16">第四季度</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="row sum hide">
                    <form class="form-inline" role="form" >
                        <div class="form-group">
                            <label >数据区域：</label>
                        </div>
                        <div class="form-group">
                            <select class="form-control" id="regions">
                            </select>
                        </div>
                    </form>
                </div>
                <div class="row">
                    <form class="form-inline" role="form" target="upload-iframe" enctype="multipart/form-data" method="post" >
                        <div class="form-group">
                            <label >导入文件：</label>
                        </div>
                        <div class="form-group">
                            <div class="input-group">
                                <input class="form-control" id="file" name="file" type="file" placeholder="选择文件">
                            </div>
                        </div>
                        <div class="form-group">
                            <label >选择工作薄</label>
                            <select id="sheetList" class="form-control">
                            </select>
                            <iframe id="upload-iframe" name="upload-iframe" style="display: none"></iframe>
                        </div>
                    </form>
                </div>
                <div class="row">
                    <div id="impInstruments" class="panel panel-danger">
                        <div class="panel-heading">
                            <h3 class="panel-title">导入数据简要说明</h3>
                        </div>
                        <div class="panel-body">
                            <p class="text-muted">1、请上传符合导入规范的Excel数据文件。</p>
                            <p class="text-primary">2、在左侧选取待导入的数据指标，可进行分组设置。</p>
                            <p class="text-success">3、确定指标后，调整待选列表中顺序。</p>
                            <p class="text-info">4、点击数据导入按钮，完成数据导入。</p>
                        </div>
                    </div>
                    <div id="excel-grid" class="grid-container hide"></div>
                    <%--<div id="excelGridPanel" class="panel panel-default hide">--%>
                        <%--<div class="panel-body">--%>
                            <%--<div id="excel-grid" class="grid-container"  style="height: 300px;">excelgrid</div>--%>
                        <%--</div>--%>
                    <%--</div>--%>
                </div>
                <div class="row">
                    <ul class="nav nav-tabs" role="tablist" id="myTab">
                        <li class="active"><a href="#sel-ind-div" role="tab" data-toggle="tab">已选指标</a></li>
                        <li><a href="#imp-data-div" role="tab" data-toggle="tab">导入数据</a></li>
                    </ul>

                    <div class="tab-content">
                        <div class="tab-pane active right" id="sel-ind-div">
                            <div id="selInd-grid" class="grid-container"> </div>
                            <div class="footer">
                                <button type="button"id="selInd-ok" class="btn btn-primary">确定指标</button>
                            </div>
                        </div>
                        <div class="tab-pane right" id="imp-data-div">
                            <div id="impInd-grid" class="grid-container"></div>
                            <div class="footer">
                                <label>导入数据必要条件：</label>
                                <button type="button" id="hasStartCol" class="btn btn-inverse btn-xs">数据起始列</button>
                                <button type="button" id="hasStartRow"  class="btn btn-inverse btn-xs">数据起始行</button>
                                <button type="button" id="hasRegionCol"   class="btn btn-inverse btn-xs">行政区划列</button>
                                <button type="button" id="startImp-btn" class="btn btn-danger ">导入数据</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!--设置分组 面板 start -->
    <div id="set-group-modal" class="fm hide">
        <div class="mbody">
            <div id="groupGrid" class="grid-container" style="height: 150px;"></div>
        </div>
        <div class="mfooter">
            <button id="set-group-cancel" type="button" class="btn btn-inverse">设置无分组</button>
            <button id="set-group-close" type="button" class="btn btn-primary" data-toggle="modal" data-target="#set-group-modal">关闭</button>
        </div>
    </div>
    <!--设置分组 面板 end -->

    <!--设置列面板 start -->
    <div id="set-col-modal" class="fm hide">
        <div class="mbody">
            <div class="radio">
                <label>
                    <input type="radio" name="colradio" value="region">
                    地区：行政区划代码或者名称（使用行政区划代码能够精确导入数据）
                </label>
            </div>
            <div class="radio">
                <label>
                    <input type="radio" name="colradio" value="start">
                    起始列：数据从这一列开始导入
                </label>
            </div>
        </div>
        <div class="mfooter">
            <%--<button id="set-col-remove" type="button" class="btn btn-danger">移除列设置</button>--%>
            <button id="set-col-close" type="button" class="btn btn-primary" data-toggle="modal" data-target="#set-col-modal">关闭</button>
        </div>
    </div>
    <!--设置列面板 end -->

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

    seajs.use("manager/data.imp",function(m){
        m.init();
    });
</script>
</html>