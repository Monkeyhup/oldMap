/**
 * Created by jinn on 2015/11/9.
 */

define(function (require, exports, module) {
    var Event = require("component/events");
    var e = new Event();

    var on = function(events, callback, context){
        e.off(events, callback, context);
        e.on(events, callback, context);
        return this;
    };

    var off = function(events, callback, context){
        e.off(events, callback, context);
        return this;
    };

    var trigger = function(events){
        var rest = [];
        for (var i = 1, len = arguments.length; i < len; i++) {
            rest[i - 1] = arguments[i]
        }
        try {
            //后面的参数将会传给回调函数
            e.trigger.apply(e, [events].concat(rest));
        } catch (e) {

        }
    };


    return {
        on: on,
        off: off,
        trigger: trigger
    }
});