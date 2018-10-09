
/**
 * @requires SuperMap/Util.js
 * @requires SuperMap/Layer/CanvasLayer.js
 */

/**
 * Class: SuperMap.Layer.MapABC
 *    此图层可以访问 MapABC 的地图服务。
 *
 * Inherits from:
 *  - <SuperMap.Layer.CanvasLayer>
 */
SuperMap.Layer.BjMap = SuperMap.Class(SuperMap.CanvasLayer, {


    name: "base:BjMap",

    url: "http://172.24.17.185:8399/arcgis/services/bjh_ch8q/MapServer/WMSServer?VERSION=1.3.0&REQUEST=GetMap&CRS=EPSG:2422&BBOX={{bbox}}&WIDTH=1245&HEIGHT=707&LAYERS=0&STYLES=&EXCEPTIONS=application/vnd.ogc.se_xml&FORMAT=image/png&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE",

    initialize: function(name) {
        this.name = name || "base:BjMap";
        //设置为墨卡托投影
        var options = {
            projection: "EPSG:2422"
//            numZoomLevels: 3
        };
        SuperMap.CanvasLayer.prototype.initialize.apply(this,[this.name,this.url,{},options] );
    },




    /**
     * Method: clone
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new SuperMap.Layer.BjMap(
                this.name);
        }
        obj = SuperMap.CanvasLayer.prototype.clone.apply(this, [obj]);
        return obj;
    },

    /**
     * APIMethod: destroy
     * 解构MapABC类，释放资源。
     */
    destroy: function () {
        var me = this;
        me.name = null;
        me.url = null;
        SuperMap.CanvasLayer.prototype.destroy.apply(me, arguments);
    },

    getTileUrl: function (bounds) {
        var me = this,  url;
        url = me.url;
//        url= SuperMap.String.format(url, {
//            minx: bounds.left + ",",
//            miny: bounds.bottom + ",",
//            maxx: bounds.top+ ",",
//            maxy: bounds.right
//        });
        var bdparam = bounds.left+ "," + bounds.bottom + "," + bounds.right + "," + bounds.top;
//        url = "http://localhost:8080/web/proxy/bjmap?bounds=" + bdparam;
        return this.url + bdparam;
    },

    getURL: function(c) {
        var b = this;
        c = b.adjustBounds(c);
        return b.getTileUrl(c);
    },

    getXYZ: function (b) {
        var f = this,
            h, g, e, c = f.map,
            d = c.getResolution(),
            a = f.getTileOrigin(),
            i = f.tileSize;
        h = Math.round((b.left - a.lon) / (d * i.w));
        g = Math.round((a.lat - b.top) / (d * i.h));
        e = c.getZoom();
        return {
            x: h,
            y: g,
            z: e
        }
    },


    CLASS_NAME: "SuperMap.Layer.BjMap"
});
