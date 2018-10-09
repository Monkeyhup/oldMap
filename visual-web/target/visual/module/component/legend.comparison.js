/**
 * Created by Linhao on 2015/7/9.
 */
define(function (require, exports, module) {
    var mustache = require("mustache");                         //mustache.js
    var container = require("component/template/legend.tpl");   //综合图例html

    var legendhtml = '<div id="macro-legend-comparison" class="legend-content-comparison"><ul class="legend-items-comparison"><li>31232</li><li>dsads</li></ul></div>';

    var $legend;
    var dataStyleConfig = {
        "bar":[],
        "line":[],
        "pie":[]
    };

    var Types = ['bar','line','pie'];


    //默认设置
    var settings = {
        default: {
            "margin_left": "18",//160
            "bottom": "18"
        },
        onClick: function () {
        },
        onClose: function () {
        }
    };

    /**
     * 初始化位置和事件
     * @param _settings
     *          配置参数
     */
    var setup = function (_settings) {
        settings = $.extend(settings, _settings || {});
    };

    /**
     * 销毁图例显示
     */
    var destroy = function () {
        if ($legend && $.length > 0) {
            $legend.remove();
        }
        $legend = null;
    };


    /**
     * 初始化不带有show方法，但是返回legendJquery对象，可以调用show方法
     * @param selector
     *          放置的容器id（指定放在该容器下，否则放在body中）
     * @param idenInfo
     *             指标信息
     * @param _dataStyleConfig
     *             统计图颜色配置
     */
    var init = function(selector, idenInfo, _dataStyleConfig){
        if(!idenInfo){
            return ;
        }
        var _contet = selector || "body";
        var legendBody = $("#macro-legend-comparison", _contet);
        if (legendBody.length > 0) {
            $legend = legendBody.parents(".legend-container");
        }
        $legend || ($legend = $(container).appendTo(_contet));

        _showContentHtml(idenInfo, _dataStyleConfig);

        $legend.css({
            "margin-left": settings.default.margin_left + "px",
            "bottom": settings.default.bottom + "px"
        });

        //注册事件
        _ui();

        return $legend;
    };

    /**
     * ui时间绑定
     *
     */
    var _ui = function(){
        if($legend && $legend.length > 0){

            /**隐藏分段图例按钮*/
            var $unhide = $legend.find("i.icon.unhide");
            $unhide.css({"right":"2px"});
            $unhide.unbind("click");
            $unhide.click(function () {
                //销毁图例
                //destroy();
                hide();
                if (settings.onClose &&
                    $.isFunction(settings.onClose)){
                    settings.onClose();
                }
            });
        }else{
            alert("错误提示：注册事件失败！");
        }
    };

    /**
     * 显示内容
     * @param idenInfo
     *             指标信息
     * @param _dataStyleConfig
     *             统计图颜色配置
     */
    var _showContentHtml = function(idenInfo, _dataStyleConfig){
        $legend.find(".legend-header span").html(_formatHeader(idenInfo));
        //var bodyHtml = _formatTypeHtml()+_formatIdenInfoHtml(idenInfo,_dataStyleConfig);
        var bodyHtml = _formatIdenInfoHtml(idenInfo,_dataStyleConfig);
        $legend.find(".legend-body").html(bodyHtml);

        bindEvent(idenInfo);
    };

    /**
     * 获取指标图例标题
     * @param idenInfo
     *          指标信息
     * @param _dataStyleConfig
     *             统计图颜色配置
     * @returns {}
     */
    var _formatIdenInfoHtml = function(idenInfo,_dataStyleConfig){

        $.extend(dataStyleConfig,_dataStyleConfig || {});

        var idenInfos= idenInfo.idenname;
        var unitInfo = idenInfo.unit || "";

        var idenInfosHtml = [];
        idenInfosHtml.push("<ul id='macro-legend-comparison' class='macro-legend-comparison'>");
        //idenInfosHtml.push("<li><strong>当前对比指标：</strong></li>");
        //
        idenInfosHtml.push("<li>");
        idenInfosHtml.push("<ul class='macro-legend-comparison'>");

        if(!settings.type && settings.type == ""){
            settings.type = Types[0];
        }

        var style = null;
        for(var i=0;i< Types.length; i++){
            if(Types[i] == settings.type){
                style = dataStyleConfig[Types[i]];
                break;
            }
        }

        for(var i =0;i<idenInfos.length;i++){
            var idenInfo = idenInfos[i];
            if(!idenInfo){
                break;
            }
            var fullname = idenInfo;
            if(unitInfo && unitInfo != ""){
                idenInfo = idenInfo.replace("("+unitInfo+")","");
                idenInfo = idenInfo.replace("（"+unitInfo+"）","");
            }
            if(unitInfo.length>10){
                idenInfo = idenInfo.substring(0,10) + "...";
            }

            var styleHtml = _getStyleHtml(style[i]);
            //idenInfosHtml.push("<li>["+(i+1)+"]"+styleHtml+idenInfo+"</li>");
            idenInfosHtml.push("<li style='list-style-type:none;' title='"+fullname+"'>"+styleHtml+idenInfo+"</li>");
        }
        idenInfosHtml.push("</li>");
        idenInfosHtml.push("</ul>");

        //
        idenInfosHtml.push("<li>");
        idenInfosHtml.push("<div style='text-align:right;'>");
        idenInfosHtml.push("<strong>单位：</strong>");
        idenInfosHtml.push(unitInfo);
        idenInfosHtml.push("</div>");
        idenInfosHtml.push("</li>");

        //
        idenInfosHtml.push("</ul>");

        return idenInfosHtml.join("");
    };

    /**
     * 获取颜色图例
     * @param _style
     * @private
     */
    var _getStyleHtml = function(_style){
        var re = "";
        if(_style &&_style.fillColor){
            re = "<span class='icon' style='background-color: "
                +_style.fillColor+";padding:0px 7px;margin:5px;border:1;'></span>";
        }

        return re;
    };

    /**
     * 获取指标图例标题
     * @param idenInfo
     *          指标信息
     * @returns {}
     */
    var _formatHeader=function(idenInfo){
        return   "对比统计图";
        //return (idenInfo.unit &&　idenInfo.unit !="") ?
        //    "多指标对比统计图（"+idenInfo.unit+"）" : "多指标对比统计图";
    };


    /**
     * 图例按钮
     * @returns {string}
     * @private
     */
    var _formatTypeHtml = function(){
        var html = [];

        html.push("<div class='ui divided list comparison'>");
        html.push("<div class='content'>");
        html.push("<div class='header'>统计图类型</div>");
        html.push("</div>");


        html.push("<div class='ui items three comparison-type' style='width:300px;' >");
        if(!settings.type && settings.type == ""){
            settings.type = Types[0];
        }
        for(var i=0;i< Types.length; i++){

            html.push("<div class='item' style='min-height:65px;'>");
            html.push("<div class='image'>");
            html.push("<img src='assets/image/"+Types[i]+".jpg'>");
            html.push("<a class='like ui corner label ");
            if(Types[i] == settings.type){
                html.push(" teal ");
            }
            html.push("' data-type='"+Types[i]+"'>");

            html.push("<i class='checkmark icon'></i>");
            html.push("</a>");
            html.push("</div>");
            html.push("</div>");
        }
        html.push("</div>");

        return html.join("");
    };

    /**
     * 切换类型，图例也切换
     * @param idenInfo
     * @private
     */
    var _changeStyle = function(idenInfo){
        var $ul = $legend.find(".legend-body .macro-legend-comparison");
        if($ul && $ul.length > 0){
            $ul.remove();
            var idenHtml = _formatIdenInfoHtml(idenInfo);
            $legend.find(".legend-body").append(idenHtml);
        }
    };

    /**
     * 绑定事件
     *
     * @param idenInfo
     */
    var bindEvent = function(idenInfo){
        if($legend && $legend.length > 0){
            var $items = $legend.find(".legend-body")
                .find(".ui.divided.list.comparison >.comparison-type >.item");
            $items.click(function(){
                var $a = $(this).find("a");
                $items.find("a").removeClass("teal");
                $a.addClass("teal");

                var type = $a.attr("data-type");
                idenInfo.type = type;
                settings.type = type;

                _changeStyle(idenInfo);

                if(settings.onClick && $.isFunction(settings.onClick)){
                    settings.onClick(idenInfo);
                }
            });
        }
    };

    var show = function () {
        if($legend && $legend.length>0){
            $legend.removeClass("hide");
        }
    }
    var hide = function () {
        $legend&&$legend.addClass("hide");
    }
    var toggle = function () {
        if($legend && $legend.length>0){
            if($legend.hasClass("hide")){
               $legend.removeClass("hide");
            }else{
                $legend.addClass("hide");
            }
        }
    };



    return {
        setup:setup,
        init:init,
        destroy:destroy,
        toggle:toggle,
        hide:hide
    };
});
