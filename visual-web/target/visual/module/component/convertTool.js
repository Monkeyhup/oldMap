/**
 * Created by jinn on 2015/10/28.
 */


/**
 * 转换工具
 * 1.坐标转换
 * 2.json转换
 */
define(function (require, exports, module) {

    /**
     * 转标转换类型
     * @type {{toLonlat: number, toMercator: number, none: number}}
     */
    var coordinateType = {
        "toLonlat":1,   //墨卡托转经纬
        "toMercator":2, //经纬转墨卡托
        "none":3        //不做转换
    }

    /**
     * 墨卡托转经纬
     * @param mercator
     */
    var toLonlat = function(mercator) {
        var lonlat = {
            x : 0,
            y : 0
        };
        var x = mercator.x / 20037508.34 * 180;
        var y = mercator.y / 20037508.34 * 180;
        y = 180 / Math.PI*(2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
        lonlat.x = x;
        lonlat.y = y;
        return lonlat;
    };

    /**
     * 经纬转墨卡托
     * @param lonlat
     */
    var toMercator = function (lonlat) {
        var  mercator = {
            x:0,
            y:0
        };
        var x = lonlat.x *20037508.34/180;
        var y = log(Math.tan((90+lonlat.y)* Math.PI/360))/(Math.PI/180);
        y = y *20037508.34/180;
        mercator.x = x;
        mercator.y = y;
        return mercator ;
    };


    /**
     * 超图json转GeoJson
     * @param json
     * @param coordinateType
     * @param callback
     * @constructor
     */
    var SMjsonToGeojson = function (json,coordinateType,callback) {
        var objectJson = {
            "type" : "FeatureCollection",
            "features" : []
        };

        var array = json.recordsets[0].features;
        for ( var i = 0, lens = array.length; i < lens; i++) {
            var features = {
                "type": "Feature",
                "properties": {
                    "id": null,
                    "name": null,
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[]]
                }
            };
            var geometry = array[i].geometry;
            features.properties.id = geometry.id;
            var lolatCenter = geometry.center;
            if (coordinateType == 1) {
                lolatCenter = toLonlat(geometry.center);
            }else if(coordinateType == 2){
                lolatCenter = toMercator(geometry.center);
            }


            features.properties.name = array[i].fieldValues[4];
            var point = geometry.points;
            var pointsLens = point.length;
            for (var number = 0; number < pointsLens; number++) {
                var data = [];
                var lonlat = point[number];
                if (coordinateType == 1) {
                    lolatCenter = toLonlat(geometry.center);
                }else if(coordinateType == 2){
                    lolatCenter = toMercator(geometry.center);
                }
                data.push(lonlat.x);
                data.push(lonlat.y);
                features.geometry.coordinates[0].push(data);
            }
            objectJson.features.push(features);
        }
        callback&&callback(objectJson);
    };

    /**
     * GeoJson转超图json
     * @param geojson
     * @param coordinateType
     * @param callback
     * @constructor
     */
    var GeoJsonToSMjson = function (geojson,coordinateType,callback) {
        var json = {
            "datasetName":"",
            "features":[]
        };

        var array = geojson.features;

        for(var i = 0,lens = array.length;i<lens;i++){
            var feature = {
                "fieldNames": ["id"],
                "ID": i,
                "fieldValues": [],
                "geometry": {
                    "id": i,
                    "center": {},
                    "style": null,
                    "parts": [],
                    "points":[],
                    "type": "REGION"
                }
            };

            var one = array[i];
            var geo = one.geometry;
            var coordinates = geo.coordinates[0];
            var fvalue = one.properties.id;
            var parts = coordinates.length;
            var points = [];
            for(var j = 0,l = coordinates.length;j<l;j++){
                var point = {
                    "x":coordinates[j][0],
                    "y":coordinates[j][1]
                };

                if(coordinateType == 1){
                    point = toLonlat(point);
                }else if(coordinateType == 2){
                    point = toMercator(point);
                }
                points.push(point);
            }
            feature.fieldValues.push(fvalue);
            feature.geometry.parts.push(parts);
            feature.geometry.points = points;

            json.features.push(feature);
        }

        callback&&callback(json);

    };


    var decSupport = function(e, t) {
        for (var i = [], n = t[0], a = t[1], o = 0; o < e.length; o += 2) {
            var r = e.charCodeAt(o) - 64, s = e.charCodeAt(o + 1) - 64;
            r = r >> 1 ^ -(1 & r), s = s >> 1 ^ -(1 & s), r += n, s += a, n = r, a = s, i.push([r / 1024, s / 1024])
        }
        return i
    };

    /**
     * 百度压缩GeoJson解码
     * @param e
     * @returns {*}
     */
    var decode = function (e) {
        if (!e.UTF8Encoding)return e;
        for (var t = e.features, n = 0; n < t.length; n++) {
            for (var a = t[n], o = a.geometry.coordinates, r = a.geometry.encodeOffsets, s = 0; s < o.length; s++) {
                var l = o[s];
                if ("Polygon" === a.geometry.type) {
                    o[s] = decSupport(l, r[s]);
                }else if ("MultiPolygon" === a.geometry.type) {
                    for (var h = 0; h < l.length; h++) {
                        var m = l[h];
                        l[h] = decSupport(m, r[s][h])
                    }
                }
            }
        }
        return e.UTF8Encoding = !1, e
    };





    return{
        toLonlat:toLonlat,
        toMercator:toMercator,
        SMjsonToGeojson:SMjsonToGeojson,
        GeoJsonToSMjson:GeoJsonToSMjson,
        decode:decode
    }

});
