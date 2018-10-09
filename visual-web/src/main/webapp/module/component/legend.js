/**
 * Created by zhangjunfeng on 14-6-4.
 */
define(function (require, exports, module) {
    var mustache = require("mustache");                         //mustache.js
    var css = require("component/plugin.css");                  //引用css
    var container = require("component/template/legend.tpl");   //综合图例html
    var ThematicUtil = require("ThematicUtil");
    var SegmentLayer = require("layer.segment");
    var $legend;
    var template = '<ul id="macro-legend-rank" class="legend-item-rank">{{#.}}<li style="display: block;padding: 0;margin: 0;">' +
                   '<span style="float: left;width: 1rem;height: 0.8rem;margin-right: 4px;border:1px solid #ffffff;background-color:{{color}};"></span>' +
                   '<span style="height: 0.5rem;line-height:50%;overflow: hidden;margin-left: 4px;border: 1px solid #ffffff;">{{data}}</span></li>{{/.}}</ul>' +
                   '<div id="SegdialogBox"></div>';

    //默认设置
    var settings = {
        default: {
            "margin_left": "18",
            "bottom": "18"
        },
        onClick: function () {

        },
        onConfig: function () {
        },
        onClose: function () {
        }
    };

    /**
     * 注册事件(第一次注册事件时候连同)
     */
    var _ui = function () {
        if ($legend && $legend.length > 0) {
            $(".legend-body span", $legend).hover(function () {
                $(this).css({
                    "border": "1px solid #a9a9a9",
                    "cursor": "pointer"
                });
            }, function () {
                $(this).css({
                    "border": "1px solid #ffffff",
                    "cursor": "default"
                });
            });
            $("li span:first-child", $legend).click(function () {
                settings.onClick();
            });
            //点击分段值事件
            $("li span:last-child", $legend).click(function () {
               // alert("弹出框：这里可设置分段制的大小！用户可针对指标，按年份设置分段值，并提供保存默认分段");
                    var range = $(this).html();
                    ThematicUtil.setRange(range);//rang随this变化  需要保存起来
                    //var ramp = ThematicUtil .getDataRamp();
                    $("#SegdialogBox").dialogBox({
                        hasClose: true,  //是否显示关闭按钮
                        title: '修改为您想要的区间',  //标题内容，如果不设置，则连同关闭按钮（不论设置显示与否）都不显示标题
                        hasBtn: true,  //是否显示操作按钮，如取消，确定
                        confirmValue: "确定",  //确定按钮文字内容
                        confirm:deal, //点击确定后回调函数
                        content: pop(range), //正文内容，可以为纯字符串，html标签字符串，以及URL地址，当content为URL地址时，将内嵌目标页面的iframe。
                    })
            });

            function pop(range){
                var html;
                if(range.indexOf('-') >= 0 ){
                    html = range+'<br><input class="left" type="text"> - <input class="right" type="text">';
                }else if(range.indexOf('&gt;=') >= 0){
                    html = range+'<br> >= <input class="left" type="text">';
                }else if(range.indexOf('&lt;') >= 0){
                    html = range+'<br> &lt; <input class="right" type="text">';

                }
                return html;
            }
            function deal(){
                var range = ThematicUtil.getRange();
                var ramp = ThematicUtil.getDataRamp();
                var temp = $(".dialog-box-content").html();
                var left = Number($(".left").val());
                var right = Number($(".right").val());
                if(temp.indexOf('-') >= 0 ){
                    var leftRight = range.split("-");
                    if(leftRight[0] == ramp[1] && leftRight[1] == ramp[2]){
                        if(left<0 || left>right || right>Number(ramp[3])){
                            alert("输入无效");
                            $(".left").val("");
                            $(".right").val("");
                            return ;
                        }
                        ramp[1] = $(".left").val();
                        ramp[2] = $(".right").val();
                    }else if(leftRight[0] == ramp[2] && leftRight[1] == ramp[3]){
                        if(left<Number(ramp[1]) || left>right || right>Number(ramp[4])){
                            alert("输入无效");
                            $(".left").val("");
                            $(".right").val("");
                            return ;
                        }
                        ramp[2] = $(".left").val();
                        ramp[3] = $(".right").val();
                    }else if(leftRight[0] == ramp[3] && leftRight[1] == ramp[4]){
                        if(left<Number(ramp[2]) ||left>right){
                            alert("输入无效");
                            $(".left").val("");
                            $(".right").val("");
                            return ;
                        }else{
                            ramp[3] = $(".left").val();
                            ramp[4] = $(".right").val();
                        }
                    }
                }else if(temp.indexOf('&gt;=') >= 0){
                    if(left<Number(ramp[3])){
                        alert("输入无效");
                        $(".left").val("");
                        return ;
                    }else{
                        ramp[4] = $(".left").val();
                    }
                }else if(temp.indexOf('&lt;') >= 0){
                    if(right<0 || right>Number(ramp[2])){
                        alert("输入无效");
                        $(".right").val("");
                        return ;
                    }else{
                        ramp[1] = $(".right").val();
                    }
                }
                ThematicUtil.setDataRamp(ramp);
                SegmentLayer.addSegment(ThematicUtil.getRankParamLaySeg());

            }


            /**隐藏分段图例按钮*/
            var $unhide = $legend.find("i.icon.unhide");
            $unhide.unbind("click");
            $unhide.css({"right":"2px"});
            $unhide.click(function () {
                //销毁图例
                //destroy();
                hide();
                if (settings.onClose && $.isFunction(settings.onClose)){
                    settings.onClose();
                }
            });
        } else {
            alert("注册事件失败");
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
     *
     * @param selector
     *              放置的容器id（指定放在该容器下，否则放在body中）
     * @param idenInfo
     *              指标信息
     * @param colors
     *              颜色数组
     * @param datas
     *              分段数据范围
     * @returns {*}
     */
    var init = function (selector, idenInfo, colors, datas) {
        if (!colors && !datas) {
            return;
        }
        var _contet = selector || "body";
        var legendBody = $("#macro-legend-rank", _contet);
        if (legendBody.length > 0) {
            $legend = legendBody.parents(".legend-container");
        }
        $legend || ($legend = $(container).appendTo(_contet));

        //显示图例内容

        showContentHtml(idenInfo, colors, datas);
        $legend.css({
            "margin-left": settings.default.margin_left + "px",
            "bottom": settings.default.bottom  + "px"
        });

        //注册事件
        _ui();

        return $legend;
    };

    /**
     * 添加无数据时候的图例
     * @param idenInfo
     *          指标信息
     * @private
     */
    var _addNoDataLegendUnit = function (idenInfo) {
        if(idenInfo.unit==null){
            idenInfo.unit = "无";
        }
        if ($legend) {
            $legend.find("ul").append('<li style="display: block;padding: 1px;margin: 3px;"><span style="float: left;width: 1rem;height: 1rem;margin-right: 4px;border: 1px solid #ffffff;"></span><span style="border: 1px solid rgb(255, 255, 255); cursor: default;">无数据</span></li>');
            $legend.find("li:last").find("span:first").css("background-image", "url(assets/image/nodata.png)");
            $legend.find(".legend-body").append('<label style="display: block;padding: 0;margin: 0;text-align: right;border: 1px solid rgb(255, 255, 255); cursor: default;"><strong>单位：</strong>' + idenInfo.unit || "" + '</label>');
        }
    };

    /**
     * 用来被动的修改图例（比如颜色修改了，分类方法修改了）
     *
     * @param idenInfo
     *              指标信息
     * @param colors
     *              颜色数组
     * @param datas
     *              分段数据范围
     */
    var switchLengend = function (idenInfo, colors, datas) {
        if (!$legend || !colors || !datas)
            return;

        //显示图例内容
        showContentHtml(idenInfo, colors, datas);

        //表示这次注册事件时候不需要注册功能模块
        _ui();  //注册事件
    };

    /**
     * 显示图例内容
     *
     * @param idenInfo
     *              指标信息
     * @param colors
     *              颜色数组
     * @param datas
     *              分段数据范围
     */
    var showContentHtml = function(idenInfo, colors, datas){

        var title = formatHeader(idenInfo);
        var subtit = title;
        if(subtit.length>10){
           subtit = subtit.substring(0,8)  + "...";
        }
        $legend.find(".legend-header span").html(subtit);
        $legend.find(".legend-header span").attr("title",title);


        $legend.find(".legend-body").html("");
        var dataRamp = [];
        for (var i = 0; i < datas.length - 1; i++) {
            dataRamp.push([datas[i], datas[i + 1]]);
        }

        var infos = [];
        //最大值（最后一个）大于0
        if(datas[datas.length - 1] > 0){
            for (var i = colors.length-1; i >=0; i--) {
                var left = dataRamp[i][0];
                if(typeof dataRamp[i][0] == "undefined"){
                    left = 0;
                }
                var right = dataRamp[i][1];
                if(typeof dataRamp[i][1] == "undefined"){
                    right = 0;
                }
                var info = {
                    color: colors[i],
                    data: i==colors.length-1?(">= "+left):(i ==0?("< "+right):(left + "-" + right))
                };

                //此间隔为（0-0）
                if(left == right && right == 0){
                    continue;
                }
                infos.push(info);
            }
        }else{
            //最大值（最后一个）不大于0，可能为全部都是0,只取第一段
            var left = dataRamp[0][0];
            if(typeof dataRamp[0][0] == "undefined"){
                left = 0;
            }
            var right = dataRamp[0][1];
            if(typeof dataRamp[0][1] == "undefined"){
                right = 0;
            }
            var info = {
                color: colors[0],
                data: left + "-" + right
            };
            infos.push(info);
        }//end if(datas[datas.length - 1] > 0)

        var rendered = mustache.render(template, infos);
        $legend.find(".legend-body").html(rendered).show();
        _addNoDataLegendUnit(idenInfo);
    };


    /**
     * 取得图例的宽度
     *
     * @returns {*}
     */
    var getLengendWidth=function(){
        var _body = "" || "body";
        var legendBody = $("#macro-legend-rank", _body);
        if (legendBody.length > 0) {
            var $legend = legendBody.parents(".legend-container");
            return $legend.width();
        }else{
            return 150;
        }
    }

    /**
     * 获取指标图例标题
     * @param idenInfo
     *          指标信息
     * @returns {}
     */
    var formatHeader=function(idenInfo){
        var headerInfo=idenInfo.idenname;
        var unitInfo = idenInfo.unit || "";
        if(headerInfo.indexOf(unitInfo)!=-1 && unitInfo!="") {
            headerInfo = headerInfo.replace("（"+unitInfo+"）", "");
            headerInfo = headerInfo.replace("("+unitInfo+")", "");
        }
        return headerInfo;
    };

    var show = function () {
        if ($legend && $.length > 0) {
            $legend.removeClass("hide");
        }
    };

    var hide = function () {
        $legend&&$legend.addClass("hide");
    };

    var toggle = function () {
        if ($legend && $legend.length > 0) {
            if($legend.hasClass("hide")){
                $legend.removeClass("hide");
            }else{
                $legend.addClass("hide");
            }
        }
    };

    return{
        init: init,
        setup: setup,
        switchLengend: switchLengend,
        destroy: destroy,
        getLengendWidth:getLengendWidth,
        formatHeader:formatHeader,
        show:show,
        hide:hide,
        toggle:toggle
    }
})
;