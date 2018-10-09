/**
 * 行政区划树
 *
 * Created by Linhao on 9/12/2014.
 */
define(function(require,exports,module){

    /**
     * 初始化一个行政规划书
     * @param id
     *          指定要显示树的容器id
     * @param mapid
     *          指定地图的id
     * @constructor
     */
    var REGORN_TREE = function(_id,_mapid){
        var id = _id;
        var mapId = _mapid;
        var treeActions = null;
        var tree = null;

        /**
         * 动态加载文件
         *
         * @param _obj
         * @param _id
         */
        var treeLazyLoad = function(_obj,_id){
            TREE_OPERA.openLeafTree(_obj,_id);
        };

        /**
         * 初始化数据
         * @param _treeActions
         *            设置树操作事件
         */
        this.init =function(_treeActions){
            treeActions = _treeActions ? _treeActions : {};
            tree && tree.destructor();
            $("#"+id).html("");

            // 查询数据
            SGIS.API.get("regionCatalogs/"+mapId+"/rootRegions").text(function (xml) {
                tree = SGIS.Tree.create(id,xml,treeActions,treeLazyLoad);
            });
        };

        /**
         * 返回树对象
         *
         * @returns {*}
         */
        this.getTree = function(){
            return tree;
        };

        /**
         * 子树操作
         */
        var TREE_OPERA  = (function(){
            /**
             * 是否是临时节点（存在loading节点）
             * @param obj
             * @param id
             */
            var isTempNode = function(obj,id){
                var tempnode = obj.getAllSubItems(id).indexOf("load");
                if (tempnode == 0) {
                    return true;//未加载
                }
                return false;
            };

            /**
             *  打开（加载）叶子节点
             *
             * @param _obj  当前要打开的对象
             * @param _id  当前要打开的对象的id
             */
            var openLeafTree = function(_obj,_id){
                if(isTempNode(_obj,_id)){
                    _obj.deleteChildItems(_id);//删除子节点
                    addTreeNode(_id);//查询并加载子节点
                }
            };

            /**
             * 加载子节点
             *
             * @param id
             */
            var addTreeNode = function(_id){
                SGIS.API.get("regionCatalogs/"+mapId+"/leafRegions/sys")
                    .data({qhcode:_id})
                    .text(function(xml){
                        tree && tree.loadXMLString(xml);
                    });
            };

            return {
                openLeafTree:openLeafTree
            };
        })();
    };

    return REGORN_TREE;

});