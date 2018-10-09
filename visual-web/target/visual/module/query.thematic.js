/**
 * 综合专题图
 * Created by zhangjunfeng on 14-5-6.
 * Created by Linhao on 2015/3/26.
 */
define(function (require, exports, module) {
    var thematic = require('component/thematic');      //公共专题图
    //var appEvents = require("app.events");             //全局事件
    var mustache = require("mustache");                //Mustache 模板

    var timeLinr = require("timeLinr");          //时间轴

    //工具条配置{SEGEMENT分段、PIE饼图、CALC指标切换、LABEL排名标签、COMPARISON分组对比}
    var TOOL_CONTAINER = {
        SEGEMENT:"macro-theme-segement",
        PIE:"macro-theme-pie",
        CALC:"macro-theme-calc",
        LABEL:"macro-theme-label",
        COMPARISON:"macro-theme-comparison" //分组对比指标
    };

    var _isInit = false;            //标记是否初始化
    var _rateInicators = [];        //分段指标
    var _sumIndicators = [];        //饼图指标
    var _calcRateIndicators = [];   //计算的分段指标
    var _calcSumIndicators = [];    //计算的饼图指标
    var _labelInicators = [];       //标签指标
    var _comparisonInicators = {};  //对比指标

    (function(){

        /**
         * 清除综合专题图：绑定“清除全部”按钮
         */
        $("#tool-macro-clear").click(function () {
            //清除所有的专题图
            clearAll();
            //清除左侧选中指标
            var content = frame.content("macrodata");
            content.seajs.use("macro/macrox",function(m){
                m.clear();
            });
        });

        /**
         * “三视图”和“最大图”切换
         */
        $("#tool-macro-3views,#tool-macro-max").click(function () {
            $("#tool-macro-3views,#tool-macro-max").toggleClass('hide');

            var id = $(this).attr("id");
            if(id == "tool-macro-max"){
                frame.RightSidebar.setMapMax(true);
                frame.RightSidebar.hide();
            }else{
                frame.RightSidebar.setMapMax(false);
                frame.RightSidebar.show();
            }
            seajs.use('view', function (view) {
                view.switchView(view.VIEWS.MAP);
            });
        });


        /**
         * 控制专题图区划标签显示事件
         */
        $("#hide-themeRlabel").click(function(){
            var isVisibility = thematic.ThemanticUtil.RegionLabel.toggle();
            if(isVisibility){
                $(this).find("i").addClass("blue");
            }else{
                $(this).find("i").removeClass("blue");
            }
        });

    })();

    /**
     * 销毁所有的专题图
     */
    var destroy =function(){
        if(_isInit){
            //销毁所有专题图
            thematic.destroy();
            //销毁时间轴
            destroyTimeLinr();
        }
    };

    /**
     * 销毁时间轴
     */
    var destroyTimeLinr = function () {
        //删除时间轴
        timeLinr.destroy();
    };


    /**
     * 清除所有的专题图
     */
    var clearAll = function(){
        //销毁所有的专题图
        destroy();
        //重新设置regions
        thematic.ThemanticUtil.setRegions(null);

        seajs.use(["app.events","view","macro/panel"], function (app,view,panel) {
            //清除综合查询数据数据，保证地图视图正确
            app.trigger('map.clear');

            //禁止点击（表格和图表）
            view.disableView(view.VIEWS.CHART);
            view.disableView(view.VIEWS.GRID);

            //移除综合专题图控件
            $("#navigation-container").removeClass(view.THEMATIC_TYPE.MACRO);

            //切换到地图视图（注意需要在'map.clear'全局事件执行完后执行）
            view.switchView(view.VIEWS.MAP);
            //右侧隐藏
            frame.RightSidebar.hide();

            //隐藏显示的框
            panel.hide();

            //清除公共专题图
            thematic.clear()
        });
    };

    /**
     * 初始化  专题图例
     * @param callback
     */
    var init = function(callback){
        if(_isInit){
            callback && callback();
        }else{
            thematic.getConfig(function(config){
                seajs.use(['component/legend','component/legend.pie','component/legend.comparison','component/colorpicker'],
                    function(segLegend,pieLegend,comparisonLegend,colorpicker){
                        //设置分段图图例
                        segLegend.setup({
                            //色条单击事件
                            onClick: function () {
                                if (colorpicker.isShow()) {
                                    return;
                                }
                                //初始化色段选择面板
                                colorpicker.setup({
                                    default: {
                                        position: "center"
                                    },
                                    //色段选中事件，改变专题图显示
                                    onChange: function (colors) {
                                        if (colors) {

                                            //当前选中色段（必须放在最前面，保证getDataRamp方法取到的分段数争取）
                                            config.segmentThemantic.colors = colors;

                                            //进行数据分段(只切换颜色时，不改变分段数据)
                                            var dataRamp = thematic.ThemanticUtil.Segement.getGlobalDataRamp();
                                            if(dataRamp == null || (dataRamp.length != colors.num+1)){
                                                //重新获取新的数据分段
                                                dataRamp = thematic.ThemanticUtil.Segement.getDataRamp();
                                            }//end if(dataRamp == null && (dataRamp.length != colors.num+1))

                                            var rankParam =  thematic.ThemanticUtil.Segement.getRankParam();

                                            //var dataRamp = thematic.ThemanticUtil.Segement.getDataRamp();

                                            //切换分段专题图显示颜色
                                            thematic.SwitchHanlder.switchSegmentColor(colors,dataRamp);
                                            //获取分段值
                                            //var dataRamp = thematic.ThemanticUtil.Segement.getGlobalDataRamp();


                                            //切换分段图例的颜色显示
                                            if (thematic.hasData())
                                                segLegend.switchLengend(rankParam.iden, colors.data,dataRamp);
                                        }//end if (colors)
                                    }
                                });
                                //显示色段面板
                                colorpicker.init(config.segmentThemantic.colors);
                            },
                            //关闭图例事件
                            onClose: function () {
                                //清除全局事件
                                var rankParam =  thematic.ThemanticUtil.Segement.getRankParam();
                                appEvents.trigger("removeTheme",null,rankParam.time,
                                    null,null,thematic.THEME.SEGEMENT);

                                //删除分段图层
                                // 关闭分段设色图例，分段值一并置空
                                thematic.ThemanticUtil.Segement.destroy();
                                //移除工具栏分段下拉
                                UI.removeToolbar(thematic.THEME.SEGEMENT);
                            }
                        });

                        //设置饼图图例
                        pieLegend.setup({
                            onClick: function (colors) {
                                if (colors && colors.length == 2) {
                                    //切换饼图专题图
                                    thematic.SwitchHanlder.switchPicColor(colors);

                                    var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
                                    var pieMaxMinVal = thematic.ThemanticUtil.Pie.getPieMaxMinVal();

                                    //重绘饼图图例
                                    pieLegend.reDraw(pieParam.iden, thematic.ThemanticUtil.Pie.getRadius(),
                                        colors, [pieMaxMinVal.maxData, pieMaxMinVal.minData]);
                                }
                            },
                            onClose: function () {
                                //清除全局事件
                                var rankParam =  thematic.ThemanticUtil.Segement.getRankParam();
                                var resultData = thematic.getResultData();
                                appEvents.trigger("removeTheme",null,rankParam.time,
                                    null,resultData,thematic.THEME.PIE);

                                //删除图层
                                thematic.ThemanticUtil.Pie.destroy();
                                //移除工具栏饼图下拉
                                UI.removeToolbar(thematic.THEME.PIE);
                            }
                        });

                        //设置统计对比图的参数
                        comparisonLegend.setup({
                            onClick:function(){
                            },
                            onClose:function(){
                                //删除图层
                                thematic.ThemanticUtil.ComparisonThematic.destroy()
                                //移除分段专题工具栏标题
                                UI.removeToolbar(thematic.THEME.COMPARISON);
                            }
                        });

                        //标记已经初始化
                        _isInit = true;
                        callback && callback();
                    });//end seajs.use(
            });//end thematic.getConfig(function(config)
        }
    };

    /**
     * 其中有些选择器写的比较死，不利于后来添加的专题图类型的修改，还有待优化
     */
    var UI = (function(){
        var templateIndicators = '{{#.}}<a class="item" render-type="{{renderType}}" data-value="{{idenCode}}">{{idenName}}</a>{{/.}}';
        var templaterecommend = '<div class="header item" data-value="-1"><strong>推荐指标</strong></div>';
        var templatedisrecommend = '<div class="header item" data-value="-1"><strong>不推荐指标</strong></div>';

        var templateraterecommend = '<div class="header item" data-value="-1"><strong>范围分段</strong></div>';
        var templatesumrecommend = '<div class="header item" data-value="-1"><strong>等级符号</strong></div>';

        //标签下拉中的清除标签
        var labelTemplate = '<div class="header item" data-value="clear-label" style="text-align: center"><div id="clear-label-theme" class="mini ui button">清除标签</div></div>';
        //对比统计下拉中的清除标签
        var comparisonTemplate = '<div class="header item" data-value="clear-comparison" style="text-align: center"><div id="clear-comparison-theme" class="mini ui button">清除对比统计图</div></div>';

        /**
         * 当添加了专题图，用来添加工具栏
         *
         * @param toolname
         *              工具（专题图名字THEME）名字
         * @param text
         *              内容
         */
        var listToolbar = function (toolname, text) {
            var $currentDropdown, render = "";
            if (toolname == thematic.THEME.SEGEMENT) {//分段
                render += templaterecommend;
                render += mustache.render(templateIndicators, _rateInicators);  //累计指标
                render += templatedisrecommend;
                render += mustache.render(templateIndicators, _sumIndicators);  //非累计指标
                $currentDropdown = $("#"+TOOL_CONTAINER.SEGEMENT);
            } else if (toolname === thematic.THEME.PIE) {//饼图
                render += templaterecommend;
                render += mustache.render(templateIndicators, _sumIndicators);
                render += templatedisrecommend;
                render += mustache.render(templateIndicators, _rateInicators);
                $currentDropdown = $("#"+TOOL_CONTAINER.PIE);
            } else if (toolname === thematic.THEME.CALC.PARENT) {//运算指标图
                render += templateraterecommend;
                render += mustache.render(templateIndicators, _calcRateIndicators);
                render += templatesumrecommend;
                render += mustache.render(templateIndicators, _calcSumIndicators);
                $currentDropdown = $("#"+TOOL_CONTAINER.CALC);
            }else if(toolname === thematic.THEME.LABEL){//标签排名图
                render += labelTemplate;
                render += mustache.render(templateIndicators, _labelInicators); //标签
                $currentDropdown = $("#"+TOOL_CONTAINER.LABEL);
            }else if(toolname === thematic.THEME.COMPARISON){//对比图
                render += comparisonTemplate;
                $currentDropdown = $("#"+TOOL_CONTAINER.COMPARISON);
            }

            //填充下拉框
            $currentDropdown.find(".menu").html(render);    //下拉内容
            $currentDropdown.find(".cus-text").html(text);  //当前选中的
            $currentDropdown.removeClass("hide");           //显示运算指标切换

            //防止指标多 列表过长
            var wh = $(window).height() - 150;
            var menus = $currentDropdown.find(".menu");
            var itcount = menus.find("a.item").length;
            var hei = 35*itcount;
            if(hei>wh){
                menus.css("max-height",wh+"px");
                $currentDropdown.find(".menu").css({"overflow-y":"auto","overflow-x":"hidden"});
            }


            //这里需要手动写Dropdown代码，用来控制标题点击
            $currentDropdown.dropdown({
                onChange:onChange
            });

            /**
             * 下拉切换指标
             *
             * @param value
             * @param text
             */
            function onChange(value, text){
                //标签下拉框中的清除按钮
                if(value == "clear-label"){
                    //销毁标签专题图
                    thematic.destoryLabelTheme();
                    return;
                }
                //统计专题图下拉框中的清楚按钮
                if(value == "clear-comparison"){
                    //销毁统计专题图
                    thematic.destroyComparisonTheme();
                    return ;
                }

                //标题
                if (value == -1) {
                    return;
                }

                //指标切换
                var type = null;
                $.each($currentDropdown.find("a"), function (i, o) {
                    //指标
                    if (o.attributes[2].value == value) {
                        type = o.attributes[1].value;
                    }
                });

                if (value) {
                    //填充选中的值
                    $currentDropdown.find(".cus-text").html(text);

                    //控制三视图
                    var content = null;
                    var temp = document.getElementById("module-iframe-macro-3views");
                    if (temp) {
                        content = document.getElementById("module-iframe-macro-3views").contentWindow;
                    }

                    //如果专题图被销毁掉，这里需要重建
//                  createTimeLinr();  //切换指标时不需要销毁时间轴控件

                    switch (toolname) {
                        //分段色阶
                        case thematic.THEME.SEGEMENT:
                            //切换分段图指标，分段值需重新设置
                            thematic.ThemanticUtil.Segement.setGlobalDataRamp(null);
                            //切换分段图指标
                            thematic.SwitchHanlder.switchSegement({indicator: value,idenname:text},null,null);
//                            seajs.use('component/legend.pie',function(pieLegend){
//                                //调整专题图的位置适应分段图
//                                pieLegend.adjustLocation("");
//                            });
                            break;
                        //饼图
                        case thematic.THEME.PIE:
                            //设置指标来源为null
                            thematic.setIndSrc(null);

                            //切换饼图指标
                            thematic.SwitchHanlder.switchPic({indicator: value,idenname:text});

                            thematic.getConfig(function(config) {
                                seajs.use('component/legend.pie',function(pieLegend){
                                    var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
                                    var pieMaxMinVal = thematic.ThemanticUtil.Pie.getPieMaxMinVal();
                                    //重绘制
                                    pieLegend.reDraw(pieParam.iden,thematic.ThemanticUtil.Pie.getRadius(),
                                        config.pieThemantic.pieColors, [pieMaxMinVal.maxData, pieMaxMinVal.minData]);
                                });
                            });
                            break;
                        //标签专题
                        case thematic.THEME.LABEL:
                            thematic.SwitchHanlder.switchLabel({indicator: value,idenname:text});
                            break;
                        //运算指标
                        case thematic.THEME.CALC.PARENT:
                            //分段色阶
                            if (type == thematic.THEME.CALC.CHILD.SEGEMENT) {
                                var isCreateSegement = thematic.IsCreateSegement();
                                if (!isCreateSegement) {
                                    var rankParam = thematic.ThemanticUtil.Segement.getRankParam();
                                    var calIndCollection = thematic.getCalIndCollection();
                                    $.extend(true, rankParam, {
                                        iden: {
                                            indicator: _calcRateIndicators[0].idenCode || _calcRateIndicators[0].idenCode,  // 兼容基层汇总
                                            idenname: _calcRateIndicators[0].idenName || _calcRateIndicators[0].idenName,
                                            unit: _calcRateIndicators[0].unit
                                        },
                                        time: {
                                            year: calIndCollection.periods[0].year,
                                            month: calIndCollection.periods[0].month
                                        }
                                    });
                                    //增加计算后的分段专题图
                                    Interface.addCalcSegmentThemantic(rankParam);

                                    //标记创建
                                    thematic.setIsCreateSegement(true);
                                } else {
                                    thematic.SwitchHanlder.switchSegement({indicator: value}, thematic.THEME.CALC.PARENT,  thematic.ThemanticUtil.Segement.getDataRamp(thematic.THEME.CALC.PARENT));
                                    seajs.use('component/legend.pie',function(pieLegend){
                                        //调整专题图的位置适应分段图
                                        pieLegend.adjustLocation("");
                                    });
                                }//end if (!isCreateSegement) else
                                //饼图
                            }else{
                                //设置指标来源
                                thematic.setIndSrc(thematic.THEME.CALC.PARENT);
                                var isCreatePie = thematic.IsCreatePie();
                                if (!isCreatePie) {
                                    var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
                                    var calIndCollection = thematic.getCalIndCollection();
                                    $.extend(true, pieParam, {
                                        iden: {
                                            indicator: _calcSumIndicators[0].idenCode || _calcSumIndicators[0].idenCode,
                                            idenname: _calcSumIndicators[0].idenName || _calcSumIndicators[0].idenName,
                                            unit: _calcSumIndicators[0].unit
                                        },
                                        time: {
                                            year: calIndCollection.periods[0].year,
                                            month: calIndCollection.periods[0].month
                                        }
                                    });
                                    //计算后的饼状专题图
                                    Interface.addCalcPieThemantic(pieParam);

                                    //标记创建
                                    thematic.setIsCreatePie(true);
                                } else {
                                    thematic.SwitchHanlder.switchPic({indicator: value},
                                        thematic.THEME.CALC.PARENT);

                                    thematic.getConfig(function(config){
                                        seajs.use('component/legend.pie',function(pieLegend){
                                            var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
                                            var radius = thematic.ThemanticUtil.Pie.getRadius();
                                            var pieMaxMinVal = thematic.ThemanticUtil.Pie.getPieMaxMinVal();

                                            pieLegend.reDraw(pieParam.iden, {
                                                    piexMax: radius.piexMax,
                                                    piexsMin: radius.piexsMin
                                                }, config.pieThemantic.pieColors,
                                                [pieMaxMinVal.maxData, pieMaxMinVal.minData]);

                                        });
                                    });
                                }//end if (!isCreatePie) else
                            }//end
                            break;
                    }//end switch (toolname)

                    if (content && content != null) {
                        //三视图切换指标
                        content.seajs.use("macro/view.macro", function (views) {
                            //取得存放运算后的指标结果数据
                            var calIndCollection = thematic.getCalIndCollection();
                            var rankParam = thematic.ThemanticUtil.Segement.getRankParam();
                            var resultData = thematic.getResultData();

                            var period = toolname == thematic.THEME.CALC.PARENT ? calIndCollection.periods[0]:
                                (rankParam.time ? rankParam.time : resultData.periods[0]);
                            views.switchIndicator([value], [period],
                                (toolname == thematic.THEME.CALC.PARENT) ? thematic.THEME.CALC.PARENT : null,
                                (toolname ==  thematic.THEME.CALC.PARENT) ? calIndCollection : null,toolname);
                        });
                    }//end if (content && content != null)
                }else {
                    alert("切换指标失败！");
                }//end  if (value)
            }//end function
        };

        /**
         * 初始化三视图中界面中事件或者按钮部分
         */
        var initViewsUI = function () {
            //initTimeRank();

            /**
             * 注册"添加专题图"事件
             */
            $("#theme-add", parent.document).click(function () {
                var $that = $(this);
                require.async("macro/panel.js", function (panel) {
                    var param = {
                        visualPanels: [],
                        activePanel: ""
                    };
                    //未创建饼图
                    if (!thematic.IsCreatePie()) {
                        param.visualPanels.push({
                            name: panel.PANELS.PANEL_PIE,
                            data: {
                                recommend: _sumIndicators,
                                disrecommend: _rateInicators
                            }
                        });
                    }
                    //未创建分段
                    if (!thematic.IsCreateSegement()) {
                        param.visualPanels.push({
                            name: panel.PANELS.PANEL_SEGMENT,
                            data: {
                                recommend: _rateInicators,
                                disrecommend: _sumIndicators
                            }
                        });
                    }
                    //未创建标签
                    if(!thematic.IsCreateLabel()){
                        param.visualPanels.push({
                            name: panel.PANELS.PANEL_LABEL,
                            data: {
                                recommend: _labelInicators,
                                disrecommend: []
                            }
                        });
                    }

                    //面板的设置参数
                    var settings = {
                        //这里其实传递的是点击按钮的位置
                        position: {
                            margin_left: $that.offset().left,
                            top: 100
                        }
                    };

                    //未创建
                    var comparisonParam = null;
                    if(!thematic.IsCreateComparison()){
                        comparisonParam = {
                            name: panel.PANELS.PANEL_COMPARISON,
                            data:_comparisonInicators,                  //统计专题按单位分组的指标
                            periods:thematic.getResultData().periods    //统计专题时间段参数
                        };
                        //默认选中统计图标记
                        param.activePanel = panel.PANELS.PANEL_COMPARISON;
                    }

                    //可添加新的专题图（标签专题图）
                    if (param.visualPanels.length > 0) {
                        param.activePanel = param.visualPanels[0].name;
                        settings = $.extend(settings,{
                            onSegementOkClick: function (indicator) {
                                if (indicator) {
                                    //添加分段专题图
                                    Interface.addSegmentThemantic({
                                        indicator: indicator.idenCode||indicator.idencode,
                                        idenname:indicator.idenName  ||indicator.idenname,
                                        unit:indicator.unit
                                    });
                                }
                            },
                            onPieOkClick: function (indicator) {
                                if (indicator) {
                                    //添加饼状专题图
                                    Interface.addPieThemantic({
                                        indicator: indicator.idenCode||indicator.idencode,
                                        idenname:indicator.idenName  ||indicator.idenname,
                                        unit:indicator.unit
                                    });
                                }
                            },
                            onLabelOkClick: function (indicator) {
                                if (indicator) {
                                    thematic.setStype(indicator.sType);
                                    thematic.setSnum(indicator.sNum);

                                    //添加标签专题图
                                    Interface.addLabelThemantic({
                                        indicator: indicator.idenCode ||indicator.idencode,
                                        idenname:indicator.idenName  ||indicator.idenname,
                                        unit:indicator.unit
                                    });
                                }
                            }
                        });
                    }//end if (param.visualPanels.length > 0) else

                    //可以添加统计图
                    if(comparisonParam != null){
                        settings = $.extend(settings,{
                            onComparisonOkClick:function(indicator){
                                if(indicator){
                                    Interface.addComparisonThematic({
                                        idencode: indicator.idenCode ||indicator.idencode,
                                        idenname:indicator.idenName  ||indicator.idenname,
                                        unit:indicator.unit,
                                        type:indicator.type
                                    });
                                }//end if(indicator)
                            }
                        });
                    }//end if(comparisonParam != null)

                    panel.setup(settings);
                    panel.init("", param , comparisonParam);
                });
            });
        };

        /**
         * 移除一个Toolbar
         * @param typeName
         *           工具条类型（THEME）
         */
        var removeToolbar = function(typeName){
            //调用公共的方法
            thematic.UI.removeToolbar(typeName,TOOL_CONTAINER);
        };

        return {
            listToolbar:listToolbar,
            initViewsUI:initViewsUI,
            removeToolbar:removeToolbar
        };
    })();

    /**
     * 各种切换的处理
     */
    var SwitchHanlder = (function(){

        /**
         * 切换时间
         * @param _timeParam
         *          事件参数
         */
        //todo:这块涉及到运算产生的指标做专题图，没有过多年份维度，因此后续优化。
        var switchTime = function(_timeParam){
            if (_timeParam) {
                var _indicators = [], _periods = [];
                var segindSrc=null;
                var pieindSrc=null;
                _periods.push({
                    year: _timeParam.year,
                    month: _timeParam.month,
                    reporttype: _timeParam.reporttype
                });

                //取得存放运算后的指标结果数据
                var calIndCollection = thematic.getCalIndCollection();

                var isCreatePie = thematic.IsCreatePie();//饼图？
                var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
                if (isCreatePie && pieParam.time!=null && pieParam.iden.indicator!=null) {
                    $.extend(pieParam.time, _timeParam || {});
                    _indicators.push(pieParam.iden.indicator);
                    //判断指标的位置
                    if(calIndCollection !=null) {
                        var indNum = calIndCollection.indicators.length;
                        for (var i = 0; i < indNum; i++) {
                            if (calIndCollection.indicators[i].idenCode == pieParam.iden.indicator) {
                                pieindSrc = thematic.THEME.CALC.PARENT;
                                break;
                            }
                        }
                    }
                    if(pieindSrc == null){
                        thematic.SwitchHanlder.switchPic(pieParam.iden, pieindSrc);
                    }
                }

                var isCreateSegement = thematic.IsCreateSegement();
                var rankParam = thematic.ThemanticUtil.Segement.getRankParam();
                if (isCreateSegement && rankParam.time!=null && rankParam.iden.indicator!=null) {
                    $.extend(true, rankParam.time, _timeParam || {});
                    _indicators.push(rankParam.iden.indicator);
                    //判断指标的位置
                    if(calIndCollection!=null) {
                        var indNum2 = calIndCollection.indicators.length;
                        for (var i = 0; i < indNum2; i++) {
                            if (calIndCollection.indicators[i].idenCode == rankParam.iden.indicator) {
                                segindSrc = thematic.THEME.CALC.PARENT;
                                break;
                            }
                        }
                    }
                    if(segindSrc == null){
                        thematic.SwitchHanlder.switchSegement(rankParam.iden, segindSrc);
                    }
                }

                var isCreateLabel = thematic.IsCreateLabel();
                var labelParam = thematic.ThemanticUtil.Label.getLabelParam();
                if(isCreateLabel && labelParam.time!=null && labelParam.iden.indicator!=null){
                    $.extend(true, labelParam.time, _timeParam || {});
                    thematic.SwitchHanlder.switchLabel(labelParam.iden);
                }

                //时间轴播放对比统计图
                var isCreateComparison = thematic.IsCreateComparison();
                var comparisonParam = thematic.ThemanticUtil.ComparisonThematic
                    .getComparisonParam();
                if(isCreateComparison && comparisonParam.time && comparisonParam.idencode){
                    $.extend(true, comparisonParam.time, _timeParam || {});
                    thematic.SwitchHanlder.switchComparison(comparisonParam);
                }

                //运算产生的指标不能使用时间轴。
                if(segindSrc !=null && pieindSrc!=null){
                    return;
                }

                //修改三视图的数据
                var content = document.getElementById("module-iframe-macro-3views").contentWindow;
                content.seajs.use("macro/view.macro", function (c) {
                    var currdatas = c.getCurrIndAndPeriod();
                    //if(indSrc){
                    //    c.switchIndicator(currdatas.indicator, _periods,indSrc,calIndCollection);
                    // }else{
                    c.switchIndicator(currdatas.indicator, _periods);
                    // }
                });
            }//end if (_timeParam)
        };

        return {
            switchTime:switchTime
        };
    })();

    /**
     * 向外部提供接口
     */
    var Interface = (function(){

        /**
         * 创建时间轴
         */
        var createTimeLinr = function () {
            var resultData = thematic.getResultData();
            //一个时段就没有必要了吧 改为大于1
            if (resultData.periods.length > 1) {
                if (timeLinr.isInit()) {
                    timeLinr.updateYears(resultData.periods);
                } else {
                    timeLinr.TimeLinr(resultData.periods, "", {
                        autoPlayDirection: 'forward',
                        startAt: 1
                    }, SwitchHanlder.switchTime);
                }
            }
        };

        /**
         * 创建专题图总的入口（根据返回结果）
         *
         * @param re 综合数据结果对象
         * @param _currentLevel 当前区域查询级别
         */
        var createThemantic = function (re,_currentLevel){
            //综合重新设置regions，保证从regionset中获取
            thematic.ThemanticUtil.setRegions(null);
            if(_currentLevel){
                var currentLevel = thematic.getCurrentLevel();
                //首次加载时（currentLevel不存在）
                if(!currentLevel){
                    //保存当前级别
                    thematic.setCurrentLevel(_currentLevel);
                }else{
                    //跟之前的级别不一样
                    if(currentLevel != _currentLevel){
                        //设置为null
                        thematic.setSelFeatures(null);
                        thematic.setPointSelFeatures(null);
                    }
                    //保存当前级别
                    thematic.setCurrentLevel(_currentLevel);
                }//end  if(!currentLevel)
            }//end if(_currentLevel)

            if (!re){
                SGIS.UI.alert("查询结果空","dange",false);
                return;
            }

            thematic.setResultData(re);                      //保存数据结果对象
            thematic.SwitchHanlder.switchThemeVisiable();    //专题图层显示切换
            //获取全部指标（包括多层分组子指标）
            var allInicators = thematic.ThemanticUtil.getSubInicators(re.indicators);
            if(!allInicators || allInicators.length==0){
                SGIS.UI.alert("获取指标空","warn",false);
                return;
            }
            //设置所有的指标
            thematic.setAllInicators(allInicators);
            //图例初始化完成后再 开始作图
            init(function(){
                //指标对应专题图分类
                _rateInicators.length = 0;  //分段指标重置
                _sumIndicators.length = 0;  //饼图指标重置
                _labelInicators.length = 0; //标签指标重置
                _comparisonInicators = {};  //对比指标重置

                //获取全部指标（包括分组子指标）
                if(!allInicators || allInicators.length==0){
                    SGIS.UI.alert("获取指标空","warn",false);
                    return;
                }

                //获取专题图样式配置信息
                thematic.getConfig(function(config) {
                    //根据指标类型 将指标填充到相应类型中
                    $.each(allInicators, function (i, o) {
                        var type = o.idenType;
                        //累计单位：累计数（元、个、人...）
                        if (type==2 || new RegExp(config.rex.rate).test(o.idenUnit)) {
                            _rateInicators.push(o);//分段显示指标
                        }
                        //非累计单位：等级、比率
                        if (type==5 || new RegExp(config.rex.sum).test(o.idenUnit)) {
                            _sumIndicators.push(o);//饼图显示指标
                        }
                        _labelInicators.push(o);  //标签专题图添加所有指标

                        //添加统计图的分组指标
                        var comparisonInicator = _comparisonInicators[o.idenUnit];
                        if(!comparisonInicator){
                            _comparisonInicators[o.idenUnit] = [];
                        }
                        _comparisonInicators[o.idenUnit].push(o);
                    });

                    //做分段色阶初始化
                    if (_rateInicators.length > 0) {
                        //构建列维度查询参数【指标、时段】
                        var rankParam = thematic.ThemanticUtil.Segement.getRankParam();
                        $.extend(true, rankParam, {
                            iden: {
                                indicator: _rateInicators[0].idenCode,
                                idenname: _rateInicators[0].idenName,
                                unit: _rateInicators[0].idenUnit
                            },
                            time: {
                                year: thematic.getResultData().periods[0].year,
                                month: thematic.getResultData().periods[0].month
                            }
                        });
                        //添加分段专题图
                        addSegmentThemantic(rankParam);
                    } else {
                        thematic.setIsCreateSegement(false);
                    }//end if (_rateInicators.length > 0) else

                    //做饼图等级符号初始化
                    if (_sumIndicators.length > 0) {
                        var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
                        $.extend(true, pieParam, {
                            iden: {
                                indicator: _sumIndicators[0].idenCode || _sumIndicators[0].idenCode,
                                idenname: _sumIndicators[0].idenName || _sumIndicators[0].idenName,
                                unit: _sumIndicators[0].idenUnit
                            },
                            time: {
                                year: thematic.getResultData().periods[0].year,
                                month: thematic.getResultData().periods[0].month
                            }
                        });
                        //添加饼图专题图
                        addPieThemantic(pieParam);
                    } else{
                        thematic.setIsCreatePie(false);
                    }//end if (_sumIndicators.length > 0) else

                    //指标专题图初始化
                    if(_labelInicators.length>0){
                        var labelParam = thematic.ThemanticUtil.Label.getLabelParam();
                        $.extend(true, labelParam, {
                            iden: {
                                indicator: _labelInicators[0].idenCode || _labelInicators[0].idenCode,
                                idenname: _labelInicators[0].idenName || _labelInicators[0].idenName,
                                unit: _labelInicators[0].idenUnit
                            },
                            time: {
                                year: thematic.getResultData().periods[0].year,
                                month: thematic.getResultData().periods[0].month
                            }
                        });
                    }//end if (_labelInicators.length > 0) else

                    //统计专题图初始化
                    if(_comparisonInicators && JSON.stringify(_comparisonInicators) != "{}"){
                        var comparisonParam = thematic.ThemanticUtil.ComparisonThematic.getComparisonParam();
                        $.extend(true, comparisonParam, {
                            time: {
                                year: thematic.getResultData().periods[0].year,
                                month: thematic.getResultData().periods[0].month
                            }
                        });
                    }//end if(_comparisonInicators && JSON.stringify(_comparisonInicators) != "{}")

                    //销毁标签专题图
                    thematic.destoryLabelTheme();
                    //销毁对比统计专题图
                    thematic.destroyComparisonTheme();

                    //添加时间轴
                    createTimeLinr();

                    //初始化添加专题图事件或者按钮部分
                    UI.initViewsUI();
                });
            });//end init(function()
        };

        /**
         * 添加分段专题图（前提是第一次初始化时候没有出来，然后这次是使用不推荐列表添加的）
         *
         * @param _rankParam
         *          指标参数
         */
        var addSegmentThemantic = function (_rankParam) {
            var rankParam = thematic.ThemanticUtil.Segement.getRankParam();
            if (_rankParam.iden)
                $.extend(true, rankParam, _rankParam || {});
            else
                $.extend(true, rankParam.iden, _rankParam || {});

            if (!rankParam.time) {
                rankParam.time = {
                    year: thematic.getResultData().periods[0].year,
                    month: thematic.getResultData().periods[0].month
                };
            }

            //$.extend(true, rankParam.iden, _rankParam || {});

            if(rankParam.iden.indicator && rankParam.time){
                //触发全局事件：调用右侧视图(基层不需要)
                //appEvents.trigger("addTheme", rankParam.iden.indicator, rankParam.time,null,null,thematic.THEME.SEGEMENT);

                rankParam.iden_index = thematic.ThemanticUtil.getIndicatorindex(rankParam.iden.indicator);
                rankParam.time_index = thematic.ThemanticUtil.getTimeindex(rankParam.time);
                rankParam.index = thematic.ThemanticUtil.getDataIndex(rankParam.iden_index, rankParam.time_index);
                rankParam.iden = thematic.ThemanticUtil.getIdenInfo(rankParam.iden.indicator);
                if (rankParam.iden_index != -1 && rankParam.time_index != -1) {
                    var selFeatures = thematic.getSelFeatures();
                    if (!selFeatures || selFeatures==null) {
                        thematic.ThemanticUtil._queryRegion(function (_selFeatures) {
                            thematic.setSelFeatures(_selFeatures);
                            //重新获取
                            selFeatures = thematic.getSelFeatures();
                            //创建专题图
                            gotoSegementThematic();
                        },thematic.THEME.SEGEMENT);
                    }else{
                        //创建专题图
                        gotoSegementThematic();
                    }//end if (!selFeatures || selFeatures==null) else

                    /**创建专题图*/
                    function gotoSegementThematic(){
                        //取得分段的图层
                        var segmentLayer = thematic.ThemanticUtil.Segement.getSegmentLayer();
                        if (!segmentLayer || segmentLayer == null){
                            thematic.ThemanticUtil.Segement._initSegementLayer();
                        }

                        //得到色接数据中的最值
                        var segementMaxMinVal = thematic.ThemanticUtil.getMaxMinData(rankParam.index);
                        //存储色接数据中的最值
                        thematic.ThemanticUtil.Segement.setSegementMaxMinVal(segementMaxMinVal);

                        //进行数据分段
                        var dataRamp = thematic.ThemanticUtil.Segement.getDataRamp();
                        try {
                            thematic.ThemanticUtil.Segement._segmentThemantic(thematic.THEME.SEGEMENT
                                ,dataRamp);
                        } catch (e) {
                            //标记不创建专题图
                            thematic.setIsCreateSegement(false);
                            thematic.ThemanticUtil.Segement.destroy();
                            SGIS.UI.alert("绘制分段专题图出错","",false);
                            SGIS.Log("消息提示：绘制分段专题图出错!");
                            return;
                        }

                        //销毁统计专题图
                        var isCreateComparison = thematic.IsCreateComparison();
                        if(isCreateComparison){
                            thematic.destroyComparisonTheme();
                        }

                        //指标文本
                        var text = (!_rankParam || !_rankParam.idenname) ? _rateInicators[0].idenName:_rankParam.idenname;
                        UI.listToolbar(thematic.THEME.SEGEMENT, text);

                        thematic.getConfig(function(config) {
                            seajs.use('component/legend',function(segLegend){
                                segLegend.init("", rankParam.iden, config.segmentThemantic.colors.data,dataRamp).show();
                            });
                        });
                    }//end function
                }else {
                    SGIS.UI.alert("创建色阶图失败","",false);
                }//
            }else {
                SGIS.UI.alert("创建色阶图失败","",false);
            }//end if(rankParam.iden.indicator && rankParam.time) else
        };

        /**
         * 添加饼专题图（前提是第一次初始化时候没有出来，然后这次是使用不推荐列表添加的）
         * @param pieParam
         *          pieParam参数
         */
        var addPieThemantic = function(_pieParam){
            var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
            if (_pieParam.iden)
                $.extend(true, pieParam, _pieParam || {});
            else
                $.extend(true, pieParam.iden, _pieParam || {});
            if (!pieParam.time) {
                pieParam.time = {
                    year: thematic.getResultData().periods[0].year,
                    month: thematic.getResultData().periods[0].month
                };
            }

            if (pieParam.iden.indicator && pieParam.time) {
                //调用右侧视图
                appEvents.trigger("addTheme",pieParam.iden.indicator,pieParam.time,null,null,thematic.THEME.PIE);

                pieParam.iden_index = thematic.ThemanticUtil.getIndicatorindex(pieParam.iden.indicator);
                pieParam.time_index = thematic.ThemanticUtil.getTimeindex(pieParam.time);
                pieParam.index = thematic.ThemanticUtil.getDataIndex(pieParam.iden_index, pieParam.time_index);
                pieParam.iden = thematic.ThemanticUtil.getIdenInfo(pieParam.iden.indicator);

                if (pieParam.iden_index != -1 && pieParam.time_index != -1) {

                    //等级符号专题图空间数据不走缓存
                    thematic.ThemanticUtil._queryRegion(function (_selFeatures) {
                        //存储点空间数据
                        thematic.setPointSelFeatures(_selFeatures);

                        var pieLayer = thematic.ThemanticUtil.Pie.getPieLayer();
                        //读取区划边界
                        if (!pieLayer)
                            thematic.ThemanticUtil.Pie._initPieLayer();

                        //将得到的值按照某一个指标排序
                        var pieMaxMinVal = thematic.ThemanticUtil.getMaxMinData(pieParam.index);
                        //设置饼图最大最小值
                        thematic.ThemanticUtil.Pie.setPieMaxMinVal(pieMaxMinVal);

                        try {
                            thematic.ThemanticUtil.Pie._piexThemantic();
                        } catch (e) {
                            //标记未创建饼状专题图
                            thematic.setIsCreatePie(false);
                            //销毁饼状专题图
                            thematic.destroyPieTheme();
                            SGIS.Log("消息提示：绘制饼专题图出错!");
                            return;
                        }


                        //销毁统计专题图
                        var isCreateComparison = thematic.IsCreateComparison();
                        if(isCreateComparison){
                            thematic.destroyComparisonTheme();
                        }

                        var text = (!_pieParam||!_pieParam.idenname)?_sumIndicators[0].idenName:_pieParam.idenname;
                        UI.listToolbar(thematic.THEME.PIE, text);

                        thematic.getConfig(function(config) {
                            seajs.use('component/legend.pie',function(pieLegend){
                                //取得饼半径
                                var radius = thematic.ThemanticUtil.Pie.getRadius();
                                pieLegend.init("", pieParam.iden, {
                                        piexMax: radius.piexMax ,
                                        piexsMin: radius.piexsMin
                                    }, config.pieThemantic.pieColors,
                                    [pieMaxMinVal.maxData, pieMaxMinVal.minData]).show();
                            });
                        });
                    },thematic.THEME.PIE);
                }else{
                    SGIS.UI.alert("添加饼图专题图失败!!","",false);
                }//end if
            }else{
                SGIS.UI.alert("添加饼图专题图失败!!","",false);
            }//end if (pieParam.iden.indicator && pieParam.time) else
        };

        /**
         * 创建标签专题图
         * @param _labelParam
         *          标题参数
         * @param _type
         *          专题类类型
         */
        var addLabelThemantic = function (_labelParam,_type) {
            var labelLayer = thematic.ThemanticUtil.Label.getLabelLayer();
            if (!labelLayer)
                thematic.ThemanticUtil.Label._initLabelLayer();

            var labelParam = thematic.ThemanticUtil.Label.getLabelParam();
            try {
                $.extend(true, labelParam.iden, _labelParam || {});

                labelParam.iden_index = thematic.ThemanticUtil.getIndicatorindex(labelParam.iden.indicator);
                labelParam.time_index = thematic.ThemanticUtil.getTimeindex(labelParam.time);
                labelParam.index = thematic.ThemanticUtil.getDataIndex(labelParam.iden_index, labelParam.time_index, _type);
                labelParam.iden = thematic.ThemanticUtil.getIdenInfo(labelParam.iden.indicator);

                thematic.ThemanticUtil.Label._labelThemantic();
            } catch (e) {
                //标记未创建标签专题图
                thematic.setIsCreateLabel(false);
                //销毁标签专题图
                thematic.destoryLabelTheme();
                SGIS.Log("消息提示：绘制标签图出错!");
                return;
            }

            //销毁统计专题图
            var isCreateComparison = thematic.IsCreateComparison();
            if(isCreateComparison){
                thematic.destroyComparisonTheme();
            }
            // 工具栏
            UI.listToolbar(thematic.THEME.LABEL, _labelParam.idenname);
        };

        /**
         * 根据数据行的行政区划高亮对应图形
         *  <p>
         *      说明：提供给三视图的调用
         *  </p>
         * @param code
         *          行政区划编码
         */
        var linkToRegion = function (code) {
            var select = thematic.ThemanticUtil.Segement.getSelect();
            if(!select || select == null){
                SGIS.Log("消息提示：当前没有分段专题图！");
                return;
            }
            //清除分段专题图选择器的所选高亮
            select.unselectAll();
            if (code) {
                //分段专题图层
                var linkedFeature = thematic.ThemanticUtil.Segement.getSegmentLayer()
                    .getFeaturesByAttribute("QH_CODE", code);

                if (linkedFeature && linkedFeature.length > 0){
                    //行政区划高亮选中
                    select.select(linkedFeature[0]);
                }
            }
        };


        /**
         * 添加计算后的分段专题图
         *
         * @param _rankParam
         */
        var addCalcSegmentThemantic = function (_rankParam) {
            var rankParam = thematic.ThemanticUtil.Segement.getRankParam();
            var resultData = thematic.getResultData();

            if (_rankParam.iden)
                $.extend(true, rankParam, _rankParam || {});
            else
                $.extend(true, rankParam.iden, _rankParam || {});
            if (!rankParam.time) {
                rankParam.time = {
                    year: resultData.periods[0].year,
                    month: resultData.periods[0].month
                };
            }
            $.extend(true, rankParam.iden, _rankParam || {});
            if (rankParam.iden.indicator && rankParam.time) {
                rankParam.iden_index = thematic.ThemanticUtil.getIndicatorindex(rankParam.iden.indicator);
                rankParam.time_index = thematic.ThemanticUtil.getTimeindex(rankParam.time);
                rankParam.index = thematic.ThemanticUtil.getDataIndex(rankParam.iden_index, rankParam.time_index,
                    thematic.THEME.CALC.PARENT);
                rankParam.iden = thematic.ThemanticUtil.getIdenInfo(rankParam.iden.indicator);
                if (rankParam.iden_index != -1 && rankParam.time_index != -1) {
                    var selFeatures = thematic.getSelFeatures();
                    if (!selFeatures || selFeatures == null) {
                        thematic.ThemanticUtil._queryRegion(function (_selFeatures) {

                            thematic.setSelFeatures(_selFeatures);
                            //重新获取
                            selFeatures = thematic.getSelFeatures();

                            //创建专题图
                            gotoSegementThematic();
                        },thematic.THEME.SEGEMENT);
                    } else {
                        //创建专题图
                        gotoSegementThematic();
                    }

                    /**创建专题图*/
                    function gotoSegementThematic(){
                        //取得分段的图层
                        var segmentLayer = thematic.ThemanticUtil.Segement.getSegmentLayer();
                        if (!segmentLayer || segmentLayer == null){
                            thematic.ThemanticUtil.Segement._initSegementLayer();
                        }

                        //得到色接数据中的最值
                        var segementMaxMinVal = thematic.ThemanticUtil.getMaxMinData(rankParam.index);
                        //存储色接数据中的最值
                        thematic.ThemanticUtil.Segement.setSegementMaxMinVal(segementMaxMinVal);

                        //进行数据分段
                        var dataRamp = thematic.ThemanticUtil.Segement.getDataRamp();
                        try {
                            thematic.ThemanticUtil.Segement._segmentThemantic(thematic.THEME.SEGEMENT
                                ,dataRamp);
                        } catch (e) {
                            //标记不创建专题图
                            thematic.setIsCreateSegement(false);
                            thematic.ThemanticUtil.Segement.destroy();
                            SGIS.UI.alert("绘制分段专题图出错","",false);
                            SGIS.Log("消息提示：绘制分段专题图出错!");
                            return;
                        }
                        //销毁统计专题图
                        var isCreateComparison = thematic.IsCreateComparison();
                        if(isCreateComparison){
                            thematic.destroyComparisonTheme();
                        }
                        thematic.getConfig(function(config) {
                            seajs.use('component/legend',function(segLegend){
                                segLegend.init("", rankParam.iden, config.segmentThemantic.colors.data,dataRamp).show();
                            });
                        });
                    }//end function
                }
            } else {
                SGIS.UI.alert("添加分段专题图失败!!","",false);
            }
        };

        /**
         * 以下2函数可以和现有代码合并，暂时这样，方便后边调试
         * @param _pieParam
         */
        var addCalcPieThemantic = function (_pieParam) {
            var pieParam = thematic.ThemanticUtil.Pie.getPieParam();
            var calIndCollection = thematic.getCalIndCollection();
            if (_pieParam.iden)
                $.extend(true, pieParam, _pieParam || {});
            else
                $.extend(true, pieParam.iden, _pieParam || {});
            if (!pieParam.time) {
                pieParam.time = {
                    year: calIndCollection.periods[0].year,
                    month: calIndCollection.periods[0].month
                };
            }
            if (pieParam.iden.indicator && pieParam.time) {
                pieParam.iden_index = thematic.ThemanticUtil.getIndicatorindex(pieParam.iden.indicator);
                pieParam.time_index = thematic.ThemanticUtil.getTimeindex(pieParam.time);
                pieParam.index = thematic.ThemanticUtil.getDataIndex(pieParam.iden_index, pieParam.time_index,
                    thematic.THEME.CALC.PARENT);
                pieParam.iden = thematic.ThemanticUtil.getIdenInfo(pieParam.iden.indicator);
                if (pieParam.iden_index != -1 && pieParam.time_index != -1) {
                    //等级符号专题图空间数据不走缓存
                    thematic.ThemanticUtil._queryRegion(function (_selFeatures) {
                        //存储点空间数据
                        thematic.setPointSelFeatures(_selFeatures);

                        var pieLayer = thematic.ThemanticUtil.Pie.getPieLayer();
                        //读取区划边界
                        if (!pieLayer)
                            thematic.ThemanticUtil.Pie._initPieLayer();

                        //将得到的值按照某一个指标排序
                        var pieMaxMinVal = thematic.ThemanticUtil.getMaxMinData(pieParam.index);
                        //设置饼图最大最小值
                        thematic.ThemanticUtil.Pie.setPieMaxMinVal(pieMaxMinVal);

                        try {
                            thematic.ThemanticUtil.Pie._piexThemantic();
                        } catch (e) {
                            //标记未创建饼状专题图
                            thematic.setIsCreatePie(false);
                            //销毁饼状专题图
                            thematic.destroyPieTheme();
                            SGIS.Log("消息提示：绘制饼专题图出错!");
                            return;
                        }
                        //销毁统计专题图
                        var isCreateComparison = thematic.IsCreateComparison();
                        if(isCreateComparison){
                            thematic.destroyComparisonTheme();
                        }
                        thematic.getConfig(function(config) {
                            seajs.use('component/legend.pie',function(pieLegend){
                                //取得饼半径
                                var radius = thematic.ThemanticUtil.Pie.getRadius();
                                pieLegend.init("", pieParam.iden, {
                                        piexMax: radius.piexMax ,
                                        piexsMin: radius.piexsMin
                                    }, config.pieThemantic.pieColors,
                                    [pieMaxMinVal.maxData, pieMaxMinVal.minData]).show();
                            });
                        });
                    },thematic.THEME.PIE);
                }//end if
            } else {
                SGIS.UI.alert("添加饼图专题图失败!!","",false);
            }
        };

        /**
         * 专门处理运算后的指标，目标：制作专题图
         * ps:与服务器获取的指标分离开，不融入其中，避免数据混乱
         * 运算产生的指标也需要根据单位进行分段和等级区分。
         *
         * @param obj
         *         新的指标对象
         */
        var createNewThematic = function (obj) {

            //收集运算产生的原始指标数据,转换成专题图使用的数据格式
            var calIndCollection = thematic.getCalIndCollection();
            var resultData = thematic.getResultData();

            if (calIndCollection == null) {
                var _obj = {};
                _obj.head = [];
                _obj.head.push("行政区划代码");
                _obj.head.push("行政区划名称");
                _obj.head.push(obj.indicatorName);

                _obj.content = [];
                var leng = obj.regionCodes.length;
                for (var i = 0; i < leng; i++) {
                    _obj.content[i] = [];
                    _obj.content[i].push(obj.regionCodes[i]);
                    _obj.content[i].push(obj.regionNames[i]);
                    _obj.content[i].push(obj.datas[i]);
                }
                _obj.indicators = [];
                _obj.indicators[0] = {};
                _obj.indicators[0].idenCode = new Date().getMilliseconds();
                _obj.indicators[0].idenName = obj.indicatorName;
                _obj.indicators[0].unit = obj.indicatorUnit;
                _obj.indicators[0].periods = resultData.periods;
                _obj.indicators[0].subs=[];
                _obj.periods = resultData.periods;

                //保存运算后的指标数据
                calIndCollection = _obj;

                //保存指标运算
                thematic.setCalIndCollection(calIndCollection);
            } else {
                var codenum = obj.regionCodes.length;
                //覆盖指标运算结果
                calIndCollection.head.push(obj.indicatorName);
                var length = calIndCollection.content.length;
                for (var i = 0; i < length; i++) {
                    var item = calIndCollection.content[i];
                    for (var j = 0; j < codenum; j++) {
                        if (item[0] == obj.regionCodes[j]) {
                            calIndCollection.content[i].push(obj.datas[j]);
                            break;
                        }
                    }
                }
                var _tobj = {};
                _tobj.idenCode = new Date().getMilliseconds();
                _tobj.idenName = obj.indicatorName;
                _tobj.unit = obj.indicatorUnit;
                _tobj.periods = resultData.periods;
                _tobj.subs=[];

                calIndCollection.indicators.push(_tobj);
                //保存指标运算
                thematic.setCalIndCollection(calIndCollection);
            }
            //清空指标
            _calcRateIndicators.length = 0;
            _calcSumIndicators.length = 0;

            thematic.getConfig(function(config){
                $.each(calIndCollection.indicators, function (i, o) {
                    if (new RegExp(config.rex.rate).test(o.unit)) {
                        o.renderType = thematic.THEME.CALC.CHILD.SEGEMENT;
                        _calcRateIndicators.push(o);    //分段显示指标
                    } else if (new RegExp(config.rex.sum).test(o.unit)) {
                        o.renderType = thematic.THEME.CALC.CHILD.PIE;
                        _calcSumIndicators.push(o);     //饼图显示指标
                    } else {
                        o.renderType = thematic.THEME.CALC.CHILD.SEGEMENT;
                        _calcRateIndicators.push(o);    //默认范围分段
                    }
                });
                //如果单位区分不出来，就默认范围分段。
                if (_calcRateIndicators.length == 0 && _calcSumIndicators.length == 0) {
                    $.each(calIndCollection.indicators, function (i, o) {
                        o.renderType = thematic.THEME.CALC.CHILD.SEGEMENT;
                        _calcRateIndicators.push(o);    //分段显示指标
                    });
                }
                //根据收集的指标更新菜单栏
//                if(_calcRateIndicators.length !=0){
//                    UI.listToolbar(thematic.THEME.CALC.PARENT,_calcRateIndicators[0].idenname);
//                }else{
//                    if(_calcRateIndicators.length>0){
//                        var segmentLayer = thematic.ThemanticUtil.Segement.getSegmentLayer();
//                        if (!segmentLayer){
//                            thematic.ThemanticUtil.Segement._initSegementLayer();
//                        }
//                    }
//                    if(_calcSumIndicators.length>0) {
//                        var pieLayer = thematic.ThemanticUtil.Pie.getPieLayer();
//                        if (!pieLayer){
//                            thematic.ThemanticUtil.Pie._initPieLayer();
//                        }
//                    }
                UI.listToolbar(thematic.THEME.CALC.PARENT, "运算指标");
//                }
            });
        };

        /**
         * 创建统计专题图
         *
         * @param comparisonParam
         *              统计图参数
         */
        var addComparisonThematic = function(_comparisonParam){
            var isCreateComparison  = thematic.IsCreateComparison();
            if(isCreateComparison){
                thematic.destroyComparisonTheme();
            }

            var comparisonParam = thematic.ThemanticUtil.ComparisonThematic.getComparisonParam();
            $.extend(true, comparisonParam, _comparisonParam || {});

            if (!comparisonParam.time) {
                comparisonParam.time = {
                    year: thematic.getResultData().periods[0].year,
                    month: thematic.getResultData().periods[0].month
                };
            }

            if(comparisonParam.idencode &&
                comparisonParam.idencode.length > 0
                && comparisonParam.time){
                //时间序号
                comparisonParam.time_index = thematic.ThemanticUtil.getTimeindex(comparisonParam.time);

                var len = comparisonParam.idencode.length;
                for(var i=0;i<len;i++){
                    var indicator = comparisonParam.idencode[i];
                    if(!comparisonParam.iden_index){
                        comparisonParam.iden_index = [];
                    }
                    //指标所在序号
                    var iden_index = thematic.ThemanticUtil.getIndicatorindex(indicator);
                    if(iden_index > -1){
                        comparisonParam.iden_index.push(iden_index);

                        if(!comparisonParam.index){
                            comparisonParam.index = [];
                        }
                        //指标所在元素的序号
                        var index = thematic.ThemanticUtil.getDataIndex(iden_index,comparisonParam.time_index);
                        if(index > -1){
                            comparisonParam.index.push(index);
                        }
                    }
                }

                if(comparisonParam.iden_index
                    && comparisonParam.iden_index.length > 0
                    && comparisonParam.time_index != -1){
                    //等级符号专题图空间数据不走缓存
                    thematic.ThemanticUtil._queryRegion(function (_selFeatures) {
                        //存储点空间数据
                        thematic.setComparisonSelFeatures(_selFeatures);

                        var comparisonLayer = thematic.ThemanticUtil.ComparisonThematic.getComparisonLayer();
                        if(!comparisonLayer){
                            thematic.ThemanticUtil.ComparisonThematic
                                ._initComparisonLayer(function(isOk){
                                    if(isOk){
                                        goto();
                                    }else{
                                        SGIS.UI.alert("添加对比统计图专题图失败!","",false);
                                        return ;
                                    }
                                });
                        }else{
                            goto();
                        }

                        function goto(){
                            try {
                                thematic.ThemanticUtil.ComparisonThematic._comparisonThemantic();
                            } catch (e) {
                                //标记未创建饼状专题图
                                thematic.setIsCreateComparison(false);

                                //销毁对比统计专题图
                                thematic.destroyComparisonTheme();
                                SGIS.Log("消息提示：绘制对比统计专题图出错!");
                                return;
                            }

                            //创建统计专题图的时候销毁其他专题图
                            destoryOtherTheme();

                            //指标文本
                            var text = "对比统计专题图";
                            UI.listToolbar(thematic.THEME.COMPARISON, text);

                            seajs.use('component/legend.comparison',function(legend){
                                legend.setup({
                                    type:_comparisonParam.type,
                                    onClick:function(idens){
                                        //切换统计图类型
                                        if(idens){
                                            thematic.ThemanticUtil.ComparisonThematic.
                                                _changeComparisonType(idens.type);
                                        }
                                    }
                                });
                                thematic.ThemanticUtil.ComparisonThematic
                                    .getComparisonConfig(function(cfig){
                                        var config = {
                                            "bar":cfig.settingForBar.dataStyleByFields,
                                            "line":cfig.settingForLine.dataStyleByFields,
                                            "pie":cfig.settingForPie.dataStyleByFields
                                        };

                                        legend.init("",_comparisonParam,config).show();
                                    });
                            });
                        }

                        //销毁其他专题图
                        function destoryOtherTheme(){
                            var isCreateSegement = thematic.IsCreateSegement();
                            if(isCreateSegement){
                                //清除全局事件
                                /* var rankParam =  thematic.ThemanticUtil.Segement.getRankParam();
                                 appEvents.trigger("removeTheme",null,rankParam.time,
                                 null,null,thematic.THEME.SEGEMENT);*/

                                //销毁分段专题图
                                thematic.destroySegementTheme();
                            }
                            var isCreatePie = thematic.IsCreatePie();
                            if(isCreatePie){
                                //清除全局事件
                                var rankParam =  thematic.ThemanticUtil.Segement.getRankParam();
                                var resultData = thematic.getResultData();
                                /*appEvents.trigger("removeTheme",null,rankParam.time,
                                 null,resultData,thematic.THEME.PIE);*/

                                //销毁饼状专题图
                                thematic.destroyPieTheme();
                            }
                            var isCreateLabel = thematic.IsCreateLabel();
                            if(isCreateLabel){
                                //销毁标签专题图
                                thematic.destoryLabelTheme();
                            }
                            //最大化
                            top && top.$("#tool-macro-max").click();
                        }
                    },thematic.THEME.COMPARISON);
                }else{
                    SGIS.UI.alert("添加对比统计图专题图失败!","",false);
                }
            }else{
                SGIS.UI.alert("添加对比统计图专题图失败!!","",false);
            }//end if (pieParam.iden.indicator && pieParam.time) else
        };


        return {
            createThemantic:createThemantic,
            addSegmentThemantic:addSegmentThemantic,
            addPieThemantic:addPieThemantic,
            addLabelThemantic:addLabelThemantic,
            linkToRegion:linkToRegion,
            addCalcSegmentThemantic:addCalcSegmentThemantic,
            addCalcPieThemantic:addCalcPieThemantic,
            createNewThematic:createNewThematic,
            addComparisonThematic:addComparisonThematic
        };
    })();


    return{
        destroy: destroy,
        clearAll:clearAll,
        createThemantic:Interface.createThemantic,
        createNewThematic:Interface.createNewThematic,
        linkToRegion:Interface.linkToRegion
    };
});
