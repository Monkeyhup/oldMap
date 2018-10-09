/**
 * Created by zhangjunfeng on 14-6-4.
 */
define(function (require, exports, module) {
    var mustache = require("mustache");
    var ColorSelector = require("component/colorselector");
    var container = require("component/template/legend.tpl");

    var legend=require("component/legend");

    var legendhtml = '<div id="macro-legend-pie" class="legend-content-pie"><ul class="legend-items-pie"><li><canvas width="50" height="50"></canvas></li><li><ul><li></li><li></li></ul></li></ul></div>';

    var $legend_pie, colors, datas, radius;//radius为对象={radius.piexsMin，radius.piexsMax};
    var settings = {
        default: {
            margin_left: 18,
            bottom:18
        },
        //表示Canvas单击
        onClick: $.noop,
        onConfig: $.noop,
        onClose: $.noop
    }

    var colorselector;
    //饼图图例初始化
    var _ui = function () {
        if (!$legend_pie && $legend_pie.length == 0) return;
        //颜色框单击
        $("canvas", $legend_pie).on("click", function () {
            if (colorselector){
                colorselector.$container.show();
                return;
            }
            colorselector = new ColorSelector('body', colors, {
                onClick: function(colors){
                    settings.onClick(colors);
                    colorselector.$container.hide();
                },
                position: {
                    type: "absolute",
                    target: $(this),
                    zindex:2000
                }
            })
            //显示色段选择面板
            colorselector.init();
        });
        //关闭图例
        $("i.icon.unhide", $legend_pie).click(function () {
            //destroy();  //不销毁  将其隐藏
            hide();
            if (settings.onClose && $.isFunction(settings.onClose)) {
                settings.onClose();
            }
        });
        //单击下面点开设置（暂时弃用）
        $(".item-footer", $legend_pie).click(function () {
            settings.onConfig();
        });
        _drawCircle();
        $("ul", $legend_pie.find("li")).html("<li>" + datas[0].toFixed(0) + "</li><li>" + datas[1].toFixed(0) + "</li>");
    };
    //修改默认配置
    var setup = function (_settings) {
        settings = $.extend(settings, _settings || {});
    };
    //绘制圆
    var _drawCircle = function () {
        if ($legend_pie && $legend_pie.length > 0) {
            var $canvas = $("canvas", $legend_pie);
            if ($canvas.length > 0) {
                var canvas = $canvas[0];
                canvas.width = 2 * radius.piexMax;
                canvas.height = 2 * radius.piexMax;
                var context = $canvas[0].getContext("2d");
                context.lineWidth = 1;
                context.strokeStyle = colors[1] || '#FFFFFF';
                context.beginPath();
                context.arc(radius.piexMax, radius.piexMax, radius.piexMax, 0, 2 * Math.PI);
                context.closePath();
                context.fillStyle = colors[0];
                context.fill();
                context.stroke();
                context.beginPath();
                context.arc(radius.piexMax, radius.piexMax * 2 - radius.piexsMin, radius.piexsMin, 0, 2 * Math.PI);
                context.closePath();
                context.fill();
                context.stroke();
            }
        }
    };
    //radius为数组从大到小，datas与之对应
    var init = function (selector, idenInfo, _radius, _colors, _datas,temp) {
        if(idenInfo.unit==null){
            idenInfo.unit = "无";
        }

        if (!_radius && !_colors && !_datas)return;
        radius = _radius;
        colors = _colors;
        datas = _datas;
        var $legend_pie=adjustLocation(selector);

        var title = formatHeader(idenInfo);
        var subtit = title;
        if(subtit.length>10){
            subtit = subtit.substring(0,8)  + "...";
        }
        $legend_pie.find(".legend-header span").html(subtit);
        $legend_pie.find(".legend-header span").attr("title",title);


        $legend_pie.find(".legend-body").html(legendhtml).append('<label style="padding: 0;margin: 0;clear:both;display:block;text-align:right;"><strong>单位：</strong>' + idenInfo.unit || "" + '</label>');
        _ui();
        adjustLocation(selector,temp);
        return $legend_pie;
    };

    //重绘方法(为写起来方便，就任意变化一个都重绘，而不是只改变变化的)
    var reDraw = function (idenInfo, _radius, _colors, _datas) {
        if (!_radius && !_colors && !_datas)return;
        radius = _radius;
        colors = _colors;
        datas = _datas;
        _drawCircle();//绘制圆
        _ui();//饼图图例初始化

        var title = formatHeader(idenInfo);
        var subtit = title;
        if(subtit.length>10){
            subtit = subtit.substring(0,8)  + "...";
        }
        $legend_pie.find(".legend-header span").html(subtit);
        $legend_pie.find(".legend-header span").attr("title",title);


        $("ul", $legend_pie.find("li")).html("<li>" + datas[0].toFixed(0) + "</li><li>" + datas[1].toFixed(0) + "</li>");
        $legend_pie.find(".legend-body label").html('<strong>单位：</strong>' + idenInfo.unit || "");
    };
    var destroy = function () {
        if ($legend_pie && $legend_pie.length > 0)
            $legend_pie.remove();
        $legend_pie = null;
        colorselector && colorselector.destroy();
        colorselector = null;
    };
    /**
     * todo:提供位置调整：范围分段的宽度随着指标的切换会有所变化，专题图可能会覆盖范围分段右边部分区域。
     */
    var adjustLocation = function (selector,temp) {
        var _contet = selector || "body";
        var legendBody = $("#macro-legend-pie", _contet);
        if (legendBody.length > 0) {
            $legend_pie = legendBody.parents(".legend-container");
        }
        $legend_pie || ($legend_pie = $(container).appendTo(_contet));



        var legObj = $(".legend-container");
        var marLeft = 18;
        if(temp){
            marLeft = settings.default.margin_left + legend.getLengendWidth() + "px";
        }else{

        }


        $legend_pie.css({
            "margin-left": marLeft,
            "bottom": settings.default.bottom + "px"
        });
        return $legend_pie;
    }

    //获取指标图例标题
    var formatHeader=function(idenInfo){
        var headerInfo=idenInfo.idenname;
        var unitInfo = idenInfo.unit || "";
        if(headerInfo.indexOf(unitInfo)!=-1 && unitInfo!="") {
            headerInfo = headerInfo.replace("（"+unitInfo+"）", "");
            headerInfo = headerInfo.replace("("+unitInfo+")", "");
        }
        return headerInfo;
    }
    var getLengendWidth=function(){
        var _body = "" || "body";
        var legendBody = $("#macro-legend-pie", _body);
        if (legendBody.length > 0) {
            var $legend = legendBody.parents(".legend-container");
            return $legend.width();
        }else{
            return 200;
        }
    };

    var show = function () {
        if ($legend_pie && $legend_pie.length > 0){
            $legend_pie.removeClass("hide");
        }
    };

    var hide = function () {
        $legend_pie&&$legend_pie.addClass("hide");
    };

    var toggle = function () {
        if ($legend_pie && $legend_pie.length > 0){
            if($legend_pie.hasClass("hide")){
                $legend_pie.removeClass("hide");
            }else{
                $legend_pie.addClass("hide");
            }
        }
    }

    return{
        init: init,
        destroy: destroy,
        setup: setup,
        reDraw: reDraw,
        adjustLocation:adjustLocation,
        getLengendWidth:getLengendWidth,
        show:show,
        hide:hide,
        toggle:toggle
    };
});