/**
 * Created by jinn on 2016/3/17.
 */

define(function (require, exports, module) {
    var compress = function (json) {
        json.UTF8Encoding = true;
        var features = json.features;
        features.forEach(function (feature) {
            var encodeOffsets = feature.geometry.encodeOffsets = [];
            var coordinates = feature.geometry.coordinates;

            if(!coordinates){
                preConvert(feature.geometry);
                coordinates = feature.geometry.coordinates;
            }

            if (feature.geometry.type === 'MultiPolygon') {
                coordinates.forEach(function (polygon, idx1) {
                    encodeOffsets[idx1] = [];
                    polygon.forEach(function (coordinate, idx2) {
                        coordinates[idx1][idx2] = encodePolygon(coordinate, encodeOffsets[idx1][idx2] = []);
                    });
                });
            }
            else {
                coordinates.forEach(function (coordinate, idx) {
                    coordinates[idx] = encodePolygon(coordinate, encodeOffsets[idx] = []);
                });
            }
        });

        return json;
    };

    function encodePolygon(coordinates, encodeOffsets) {
        var result = '';
        var prevX = quantize(coordinates[0][0]);
        var prevY = quantize(coordinates[0][1]);
        // Store the origin offset
        encodeOffsets[0] = prevX;
        encodeOffsets[1] = prevY;

        for (var i = 0; i < coordinates.length; i++) {
            var point = coordinates[i];
            result += encode(point[0], prevX);
            result += encode(point[1], prevY);

            prevX = quantize(point[0]);
            prevY = quantize(point[1]);
        }

        return result;
    }

    var quantize = function (val) {
        return Math.ceil(val * 1024);  //向上舍入
    }

    var encode = function (val, prev) {
        // Quantization
        val = quantize(val);
        // var tmp = val;
        // Delta
        var delta = val - prev;

        if (((delta << 1) ^ (delta >> 15)) + 64 === 8232) {
            //WTF, 8232 will get syntax error in js code
            delta--;
        }
        // ZigZag
        delta = (delta << 1) ^ (delta >> 15);
        // add offset and get unicode
        return String.fromCharCode(delta + 64);
        // var tmp = {'tmp' : str};
        // try{
        //     eval("(" + JSON.stringify(tmp) + ")");
        // }catch(e) {
        //     console.log(val + 64);
        // }
    };


    var preConvert = function (geometry) {
        var parts = geometry.parts;
        var coordinates = [];
        if (parts.length > 1) {
            geometry.type = "MultiPolygon";  //多块
        }else{
            geometry.type = "Polygon";  //多块
        }

        var points = geometry.points;
        var index = 0;
        for (var i = 0, len = parts.length; i < len; i++) {
            var p = parts[i];
            var pItem = [];
            var lastIndex = index;
            for (var j = index; j < p + lastIndex; j++) {
                var one = [points[j].x, points[j].y];
                pItem.push(one);
                index++;
            }

            coordinates.push(pItem);
        }

        if(parts.length>1){
            geometry.coordinates = [coordinates];
        }else{
            geometry.coordinates = coordinates;
        }

        delete geometry.parts;
        delete geometry.points;

    };

    function decode(json) {
        if (!json.UTF8Encoding) {
            return json;
        }
        var features = json.features;

        for (var f = 0; f < features.length; f++) {
            var feature = features[f];
            var geometry = feature.geometry;
            var coordinates = geometry.coordinates;
            var encodeOffsets = geometry.encodeOffsets;

            for (var c = 0; c < coordinates.length; c++) {
                var coordinate = coordinates[c];

                if (geometry.type === 'Polygon') {
                    coordinates[c] = decodePolygon(
                        coordinate,
                        encodeOffsets[c]
                    );
                }
                else if (geometry.type === 'MultiPolygon') {
                    for (var c2 = 0; c2 < coordinate.length; c2++) {
                        var polygon = coordinate[c2];
                        coordinate[c2] = decodePolygon(
                            polygon,
                            encodeOffsets[c][c2]
                        );
                    }
                }
            }
        }
        // Has been decoded
        json.UTF8Encoding = false;
        return json;
    }

    function decodePolygon(coordinate, encodeOffsets) {
        var result = [];
        var prevX = encodeOffsets[0];
        var prevY = encodeOffsets[1];

        for (var i = 0; i < coordinate.length; i += 2) {
            var x = coordinate.charCodeAt(i) - 64;
            var y = coordinate.charCodeAt(i + 1) - 64;
            // ZigZag decoding
            x = (x >> 1) ^ (-(x & 1));
            y = (y >> 1) ^ (-(y & 1));
            // Delta deocding
            x += prevX;
            y += prevY;

            prevX = x;
            prevY = y;
            // Dequantize
            result.push([x / 1024, y / 1024]);
        }
        return result;
    }


    var toSMjson = function (json,transform) {
        var features = json.features;
        features.forEach(function (feature){
            feature.geometry = geotoSMjson(feature.geometry,transform);
        });
        json.issm = true;
        return json;
    };


    var geotoSMjson = function (geometry,transform){
        if(geometry.encodeOffsets){
            delete geometry.encodeOffsets
        }
        var parts = [];
        var points = [];
        var coordinates = geometry.coordinates;
        for(var i = 0,len = coordinates.length;i<len;i++){
            var item = coordinates[i];

            if(item.length>0&&item[0].length>0&&item[0][0].length==2){
                for(var k = 0,klen = item.length;k<klen;k++){
                    var it = item[k];
                    parts.push(it.length);
                    for(var j = 0,jlen = it.length;j<jlen;j++){
                        var _x = it[j][0];
                        var _y = it[j][1];

                        var p;
                        if(transform){
                            var point = new SuperMap.Geometry.Point(_x, _y);
                            point = point.transform(new SuperMap.Projection("EPSG:4326"),new SuperMap.Projection("EPSG:900913"));

                             p = {y:point.y,x:point.x};
                        }else{
                             p = {y:_y,x:_x};
                        }


                        points.push(p);
                    }
                }
            }else{
                parts.push(item.length);
                for(var k = 0,klen = item.length;k<klen;k++){
                    var it = item[k];
                    var _x = it[0];
                    var _y = it[1];

                    var p;
                    if(transform){
                        var point = new SuperMap.Geometry.Point(_x,_y);
                        point = point.transform(new SuperMap.Projection("EPSG:4326"),new SuperMap.Projection("EPSG:900913"));
                        p = {y:point.y,x:point.x};
                    }else{
                        p = {y:_y,x:_x};
                    }

                    points.push(p);
                }
            }

        }
        geometry.type = "REGION";
        geometry.parts = parts;
        geometry.points = points;
        delete geometry.coordinates;

        return geometry;
    };



    return {
        compress:compress,
        decode:decode,
        toSMjson:toSMjson
    }

});





