/**
 * Created by jinn on 2015/11/4.
 */

/**
 * 公用工具
 */
define(function (require, exports, module) {

    /**
     * js文件加载工具 加载进html中,通过window直接访问是OK的
     * @type {{load}}
     */
    var loadTool = (function () {
        //顺序加载JS脚本数据（变量值）
        var loadOne = function (url) {
            var dtd = $.Deferred();                     //定义延迟对象
            var node = document.createElement('script');
            node.type = "text/javascript";          //读文件类型
            var onload = function () {
                dtd.resolve();                          //加载JS完成，清除
            };
            //文件读取完成事件
            $(node).load(onload).bind('readystatechange', function () {
                if (node.readyState == 'loaded') {
                    onload();
                }
            });
            document.getElementsByTagName('head')[0].appendChild(node);//加载到当前页面中
            node.src = url;                             //脚本文件路径
            return dtd.promise();                       //返回一个新的延迟对象
        };

        /**
         * 根据完整路径urls，加载多个文件
         * urls需要为数组,如果非数组,则需要转化为数组
         */
        var load = function (urls) {
            if (!$.isArray(urls)) { //非数组
                return load([urls]);
            }
            var ret = [];
            var leng = urls.length;
            for (var i = 0; i < leng; i++) {
                ret[i] = loadOne(urls[i]);//加载JS文件脚本，到当前页面
            }
            return $.when.apply($, ret);//加载JS应用开始
        };
        return {
            load: load
        }
    })();

    return{
       load:loadTool.load
    }
});
