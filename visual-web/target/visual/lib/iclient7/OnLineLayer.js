/**
 * Created by jinn on 2015/6/8.
 */

/**
 * 通用在线地图服务类
 * Class: SuperMap.Layer.OnLineLayer
 * Inherits from: <SuperMap.Layer.CanvasLayer>
 */
SuperMap.Layer.OnLineLayer = SuperMap.Class(SuperMap.Layer.Grid, {

    DEFAULT_PARAMS: {
        service: "WMS",
        VERSION:"1.3.0",
        REQUEST: "GetMap",
        WIDTH:1245,
        HEIGHT:707,
        w:1245,
        h:707,
        width:1245,
        height:707,
        CRS:"EPSG:2422",
        styles: "",
        EXCEPTIONS:"application/vnd.ogc.se_xml",
        FORMAT: "image/png",
        TRANSPARENT:"TRUE"
    },
    reproject: false,
    isBaseLayer: true,
    encodeBBOX: false,
    noMagic: false,
    yx: {
        "EPSG:2422": true
    },

    //aa :  "VERSION=1.3.0" +
    //    "&REQUEST=GetMap" +
    //    "&CRS=EPSG:2422" +
    //    "&BBOX=304550.033381903,499304.084929167,305630.774746781,501204.54114283" +
    //    "&WIDTH=1245&HEIGHT=707" +
    //    "&LAYERS=0" +
    //    "&STYLES=" +
    //    "&EXCEPTIONS=application/vnd.ogc.se_xml" +
    //    "&FORMAT=image/png" +
    //    "&BGCOLOR=0xFFFFFF" +
    //    "&TRANSPARENT=TRUE HTTP/1.1",


    initialize: function(d, c, e, b) {
        var a = [];
        e = SuperMap.Util.upperCaseObject(e);
        if(parseFloat(e.VERSION) >= 1.3 && !e.EXCEPTIONS) {
            e.EXCEPTIONS = "INIMAGE"
        }
        a.push(d, c, e, b);

        SuperMap.Layer.Grid.prototype.initialize.apply(this, a);  //名字 url null option

        SuperMap.Util.applyDefaults(this.params, SuperMap.Util.upperCaseObject(this.DEFAULT_PARAMS));
        if(!this.noMagic && this.params.TRANSPARENT && this.params.TRANSPARENT.toString().toLowerCase() == "true") {
            if((b == null) || (!b.isBaseLayer)) {
                this.isBaseLayer = false
            }
            if(this.params.FORMAT == "image/jpeg") {
                this.params.FORMAT = SuperMap.Util.alphaHack() ? "image/gif" : "image/png"
            }
        }
    },


    destroy: function() {
        SuperMap.Layer.Grid.prototype.destroy.apply(this, arguments)
    },
    clone: function(a) {
        if(a == null) {
            a = new SuperMap.Layer.WMS(this.name, this.url, this.params, this.getOptions())
        }
        a = SuperMap.Layer.Grid.prototype.clone.apply(this, [a]);
        return a
    },
    reverseAxisOrder: function() {
        return(parseFloat(this.params.VERSION) >= 1.3 && !! this.yx[this.map.getProjectionObject().getCode()])
    },
    getURL: function(c) {
        c = this.adjustBounds(c);
        var d = this.getImageSize();
        var e = {};
        var b = this.reverseAxisOrder();
        e.BBOX = this.encodeBBOX ? c.toBBOX(null, b) : c.toArray(b);
        e.WIDTH = d.w;
        e.HEIGHT = d.h;
        var a = this.getFullRequestString(e);
        return a
    },
    mergeNewParams: function(c) {
        var b = SuperMap.Util.upperCaseObject(c);
        var a = [b];
        return SuperMap.Layer.Grid.prototype.mergeNewParams.apply(this, a)
    },
    getFullRequestString: function(e, c) {
        var b = this.map.getProjectionObject();
        var a = this.projection && this.projection.equals(b) ? this.projection.getCode() : b.getCode();
        var d = (a == "none") ? null : a;
        if(parseFloat(this.params.VERSION) >= 1.3) {
            this.params.CRS = d
        } else {
            this.params.SRS = d
        }
        if(typeof this.params.TRANSPARENT == "boolean") {
            e.TRANSPARENT = this.params.TRANSPARENT ? "TRUE" : "FALSE"
        }
        return SuperMap.Layer.Grid.prototype.getFullRequestString.apply(this, arguments)
    },

    getTileOrigin: function() {
        var b = this.tileOrigin;
        if(!b) {
            var c = this.getMaxExtent();
            if(!c){
                c = map.getMaxExtent();
            }

            var a = ({
                tl: ["left", "top"],
                tr: ["right", "top"],
                bl: ["left", "bottom"],
                br: ["right", "bottom"]
            })[this.tileOriginCorner];
            b = new SuperMap.LonLat(c[a[0]], c[a[1]])
        }
        return b
    },

    CLASS_NAME: "SuperMap.Layer.OnLineLayer"
});
