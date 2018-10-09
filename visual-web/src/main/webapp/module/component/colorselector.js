/**
 * Created by zhangjunfeng on 14-6-5.
 */
define(function (require, exports, module) {
    var colorArrays = [
            ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e"],
            ["#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50"],
            ["#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6"],
            ["#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"]
        ];
    var settings = {
        //设置它是否绝对定位
        position: {
            //定位可以是绝对定位，可以是相对定位（需要有target），也可以是默认定位
            type: "none",
            top: 30,
            left: 30,
            //表示相对于目标的定位
            target: ""
        },
        //单击选择颜色结束是否关闭
        isClose: true,
        //表示颜色块单击(返回一个数组，表示选中的颜色和隐藏颜色)，外部实现
        onClick: $.noop,
        onClose: $.noop
    };

    var checkedMark = '<i style="opacity: 0.6;margin: auto;" class="small circular inverted checkmark icon"></i>';
    var hoverMark = '<i style="opacity: 0.3;margin: auto;" class="small circular inverted checkmark icon"></i>'

    var colorTable = "<div style='display: block;width: 250px;height: 100px;z-index:2000;'></div>"

    //获取16进制颜色(估计还有没考虑到的地方，还需要加强)
    var _getOXColor = function (color) {
        if (color.indexOf("#") != -1) {
            return color;
        }
        if (color.indexOf("rgb") != -1 || color.indexOf("RGB") != -1 && color.indexOf("rgba") != -1 || color.indexOf("RGBA") != -1) {
            var colors = color.replace(/(?:\(|\)|rgb|a)*/ig, "").split(",");
            var result = "", temp;
            for (var index in colors) {
                if (index > 2)break;
                temp = Number(colors[index]).toString(16);
                temp = temp.length == 1 ? ("0" + temp) : temp;
                result += temp;
            }
            return "#" + result;
        }
    };

    /**
     *
     * @param selector
     * @param _defaultColor
     * @param options
     * @constructor
     */
    var ColorSelector = function(selector, _defaultColor, options ){
        if ('[object Array]' == Object.prototype.toString.call(_defaultColor) && _defaultColor.length == 2)
            this.defaultC = _getOXColor(_defaultColor[0]);
        if (_defaultColor && (typeof(_defaultColor) === "string")) {
            this.defaultC = _getOXColor(_defaultColor);
        }
        this.setting = jQuery.extend(settings, options || {});
        this.$container = $(colorTable);
        this.$container.appendTo(selector || 'body');

        this._isOk = false;
    }

    ColorSelector.prototype.init = function(){
        if (this._isOk){
            this.$container.show();
            return;
        }
        var colorHtml = "";
        //组织10色块
        for (var i = 0; i < 4; i++) {
            if (i % 2 == 0) {
                colorHtml += "<ul style='clear:both;height: 50px;list-style-type: none;margin: 0;padding: 0;'>";
                for (var j = 0; j < 5; j++) {
                    colorHtml = colorHtml + '<li style="text-align:center;vertical-align:middle;line-height:50px;float:left;height:50px;width: 50px;background-color:' + colorArrays[i][j] + ';text-align:center;" value="' + colorArrays[i][j] + '"></li>';
                }
                colorHtml += "</ul>";
            }
        }
        this.$container.html(colorHtml);

        _ui(this.$container, this.defaultC, this.setting, this);
        this._isOk = true;
    }

    ColorSelector.prototype.destroy = function(){
        this.setting = null;
    	this.$container.empty();
        this.$container = null;
    }

    //设置单击事件，和默认的设置选中颜色
    var _ui = function ($colorpicker, defaultColor, settings, instance) {
        $("li", $colorpicker).hover(function () {
            $(this).css({
                "cursor": "pointer"
            });
            if ($(this).find("i").length == 0) {
                $(this).append(hoverMark)
            }
        }, function () {
            if ($(this).attr("value") != defaultColor) {
                $(this).find("i").remove();
            }
        }).click(function (e) {
            var $this = $(this);
            var index = $("li", $colorpicker).index($this);
            if (index != -1) {
                var colors = [];
                if (index > 4) {
                    index = index % 5;
                    defaultColor = colorArrays[2][index];
                    colors = [colorArrays[2][index], colorArrays[3][index]]
                } else {
                    defaultColor = colorArrays[0][index];
                    colors = [colorArrays[0][index], colorArrays[1][index]];
                }
                //处理标记
                $("li", $colorpicker).empty();
                $this.html(checkedMark);
                //由于外部panne组件会检测点击是否在元素内 所以这里取消冒泡
                e.stopPropagation();
                settings.onClick(colors);
            }
        })

        //显示选中 并且移除其他li上的checkmark
        if (defaultColor) {
            $("li", $colorpicker).each(function () {
                var $this = $(this);
                if ($this.attr("value") === defaultColor) {
                    $this.html(checkedMark);
                }
            })
        }
        //设置位置信息
        if (settings.position && settings.position.type) {
            switch (settings.position.type) {
                case "none":
                    $colorpicker.css({
                        "margin": "0 auto 0 auto"
                    })
                    break;
                case "absolute":
                    if (settings.position.top && settings.position.left) {
                        $colorpicker.css({
                            "position": "absolute",
                            "top": settings.position.top,
                            "left": settings.position.left
                        });
                    }
                    if (settings.position.zindex) {
                        $colorpicker.css({
                            "z-index": settings.position.zindex
                        });
                    }
                    if (settings.position.target) {
                        $colorpicker.css({
                            "position": "absolute"
                        });
                        //定位
                        var ttop = $(settings.position.target).offset().top;     //控件的定位点高
                        var tleft = $(settings.position.target).offset().left;    //控件的定位点宽
                        $colorpicker.css({
                            "top": (ttop - 15 - $colorpicker.height()) + "px",
                            "left": tleft + "px",
                            "z-index": settings.position.zindex + 50
                        })
                    }
                    break;
                default:
                    break;
            }
        }
    };

    return ColorSelector;
});