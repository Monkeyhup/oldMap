/**
 * Created by Administrator on 14-5-14.
 */
define(function (require, exports, module) {
    var mustache = require("mustache");
    var html = require("component/template/colorpicker.tpl");
    var colorTempl ='{{#.}}<ul data-name="{{name}}"style="float: left;margin-right: 3px;border: 1px solid lightgray;list-style-type: none;padding: 0px;">'
    +'{{#value}}<li style="background-color: #{{.}};width:16px;height:16px;margin-bottom:0px;"></li>'
    + '{{/value}}</ul>{{/.}}</div>';
    var staticValue = {
        num: 5,
        name: "Reds",
        type: "seq",
        data: []
    };
    var xml, $control;
    //默认设置
    var settings = {
        default: {
            position: "center"
        },
        onChange: function (colors) {
        }
    };
    var setup = function (_settings) {
        settings = $.extend(settings, _settings || {});
    };
    //加载配置，初始显示色带面板
    var init = function (_colors) {
        if (!$("#color-selection").length) {
            $.ajax({
                url: "data/color.xml",
                dataType: 'xml',
                type: 'GET',
                success: function (_xml) {
                    xml = _xml;
                    $(document.body).append($(html));
                    $("#template").hide();
                    $("#color-tab").css('margin-top', '-3px');
                    $("#color-tab a").css({"font-size":'0.75rem',"font-family":'宋体'});
                    //$("#info").css({'margin-left': '-3px','margin-right': '-3px','margin-bottom': '-3px','cursor': 'hand'});
                    $("#color-segment").dropdown({
                        onChange: function (value) {
                            switchSegment(value);
                        }
                    });
                    $("#color-segment").css({"padding-left":"8px","padding-right":"8px"});
                    $("#color-segment").parent().css({"width":"5rem","padding-right":"0px"});
                    $(".item", "#color-tab").click(function () {
                        $(this).addClass("active").siblings().removeClass("active");//切换选中
                        staticValue.type = $(this).attr("data-value");
                        switchType(staticValue.type);
                    });
                    $("i.remove").click(function () {
                        destroy();
                    });
                    render();
                    //初始化已有参数
                    var staticValue = $.extend(staticValue, _colors || {});
                    if (staticValue.num != 5) {
                        $("#info .column:first").find(".dropdown .text.default").html(staticValue.num);
                        switchSegment(staticValue.num);
                    }
                    //active
                    $(".item[data-value=" + staticValue.type + "]", "#color-tab").addClass("active").siblings().removeClass("active");
                    //高亮
                    //$("#info .column:last").find("ul[data-name=" + staticValue.name + "]").css({
                    //    "border": "1px solid #000000"
                    //});

                    var bdwidth = $("body").width();

                    $control = $("#color-selection");
                    var left = (bdwidth-$control.width())/2;
                    if(left<=0){
                        left = 5;
                    }

                    if (settings.default.position == "center") {
                        $control.css({
                            "max-width":(bdwidth-10)+"px",
                            "z-index":2000,
                            "width": "31rem",
                            "top": $(window).height() - $control.height() - 80,
                            //"left": $(window).width() / 2 - $control.width() / 2,
                            "left": left+"px",
                            "padding": "8px",
                            "margin-top": "0px"
                        }).show();
                    }

                    $control.Drag();
                }
            });
        } else {
            $("#color-selection").show();
        }
    };

    /**刷新色条面板*/
    var render = function () {
        if (xml) {
            var result = _getColor();
//            var rendered = mustache.render($("#template").html(), result.data);
            var rendered = mustache.render(colorTempl, result.data);
            $("#color-ramp").html(rendered);
            $("#color-ramp").css({"padding-right":"0px"});
            $("#color-ramp ul").hover(function () {
                $(this).css("border", "1px solid #000000");
            }, function () {
                $(this).css("border", "1px solid lightgray");
            });
            //切换专题色阶
            $("#color-ramp ul").unbind("click");
            $("#color-ramp ul").click(function () {
                staticValue = $.extend(staticValue, getColorInfo($(this)));
                settings.onChange(staticValue);
            });
        }
    };
    /**
     * 获取选中色条信息
     * @param data 色条all色阶颜色
     * @param type 当前面板类型
     * @param name 色条名称
     * @param num  当前色阶个数
     * */
    var getColorInfo = function ($this) {
        var colors = [];
        $this.find("li").each(function () {
            colors.push($(this).css("background-color"));//色条中色阶颜色
        });
        return{
            data: colors,
            type: staticValue.type,
            name: $this.attr("data-name"),
            num: staticValue.num
        };
    };
    /**获取当前类型和色阶下的色条html*/
    var _getColor = function () {
        var result = {
            type: staticValue.type,
            num: staticValue.num,
            data: []
        };
        if (xml) {
            $(xml).find("item").each(function () {
                if ($(this).attr("num") == staticValue.num && $(this).attr("type") == staticValue.type) {
                    var _colorRamp = {
                        name: $(this).attr("name"),
                        value: []
                    };
                    $(this).find("color").map(function () {
                        _colorRamp.value.push($(this).text()); //由$(this).html()改为$(this).text()
                    });
                    result.data.push(_colorRamp);
                }
            });
        }
        return result;
    };
    /**
     *
     * @param _segment
     */
    var switchSegment = function (_segment) {
        staticValue.num = _segment;
        render();
    };
    var getColor = function () {
        return colors;
    };
    /**切换颜色条*/
    var switchType = function (_type) {
        staticValue.type = _type;//颜色组
        render();//刷新显示
    };
    var show = function (x, y) {
        $control.show().css({
            "top": x + "px",
            "left": y + "px",
            "z-index": "1000"
        });
    };
    var hide = function(){
        if($control && $control.length > 0){
            destroy();  //销毁
        }
    };

    var destroy = function () {
        $control && $control.remove();
        $control = null;
        xml = null;
    };
    //判断是不是已经显示了
    var isShow = function () {
        if ($control && $control.length > 0) {
            return !!$control.is(":visible");
        } else
            return false;
    };
    return{
        init: init,
        setup: setup,
        isShow: isShow,
        getColor: getColor,
        show: show,
        hide:hide
    }
});