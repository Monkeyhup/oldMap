<div class="segment ui" style="opacity:0.9; width:36rem;position: absolute;top: 0px;left:0px;display: none;" id="color-selection">
    <i class="remove small icon" style="position: absolute ;top: 8px;right: 10px;cursor: pointer;"></i>

    <div class="ui top attached tabular menu move" id="color-tab">
        <a class="active item" data-value="seq">持续过渡色</a>
        <a class="item" data-value="div">发散颜色</a>
        <a class="item" data-value="qual">单值颜色</a>
    </div>
    <div id="info" class="attacshed">
        <div class="ui grid display" style="margin:5px;">
            <div class="row">
                <div class="four wide column">
                    <div class="ui fluid selection dropdown" id="color-segment">
                        <input type="hidden" name="segment">
                        <div class="default text">5</div>
                        <i class="dropdown icon"></i>
                        <div class="menu">
                            <div class="item" data-value="3">3</div>
                            <div class="item" data-value="4">4</div>
                            <div class="item" data-value="5">5</div>
                        </div>
                    </div>
                </div>

                <div class="twelve wide column" id="color-ramp" style="width:26rem;box-shadow:0px 0px 0px 0px #dfdfdf"></div>
                <div id="template">
                    {{#.}}
                    <ul data-name="{{name}}"
                        style="float: left;margin-right: 3px;border: 1px solid lightgray;list-style-type: none;padding: 0px;">
                        {{#value}}
                        <li style="background-color: #{{.}};width:16px;height:16px;margin-bottom:0px;"></li>
                        {{/value}}
                    </ul>
                    {{/.}}
                </div>
            </div>
        </div>
    </div>
</div>