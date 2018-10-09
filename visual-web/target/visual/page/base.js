/**
 * Created by jinn on 2015/6/17.
 */

/**
 * 原生类扩展
 *
 */
;
(function () {

    /**
     * 数组遍历（兼容多维数组）
     * @param fn
     * @returns {Array}
     */
    Array.prototype.each = function (fn) {
        try {
            //1 目的： 遍历数组的每一项 //计数器 记录当前遍历的元素位置
            this.i || (this.i = 0);  //var i = 0 ;
            //2 严谨的判断什么时候去走each核心方法
            // 当数组的长度大于0的时候 && 传递的参数必须为函数
            if (this.length > 0 && fn.constructor == Function) {
                // 循环遍历数组的每一项
                while (this.i < this.length) {	//while循环的范围
                    //获取数组的每一项
                    var e = this[this.i];
                    //如果当前元素获取到了 并且当前元素是一个数组
                    if (e && e.constructor == Array) {
                        // 直接做递归操作
                        e.each(fn);
                    } else {
                        //如果不是数组 （那就是一个单个元素）
                        // 这的目的就是为了把数组的当前元素传递给fn函数 并让函数执行
                        //fn.apply(e,[e]);
                        fn.call(e, e);
                    }
                    this.i++;
                }
                this.i = null; // 释放内存 垃圾回收机制回收变量
            }

        } catch (ex) {
            // do something
        }
        return this;
    }

    /**
     * 数组去重
     * 利用的JavaScrip的Oject特性
     */
    Array.prototype.unique = function () {
        var arr = this;
        var obj = {};
        for (var i = 0, len = arr.length; i < len; i++) {
            var e = arr[i];
            obj.e = e;
        }

        arr.length = 0;
        for (var o in obj) {
            arr.push(o);
        }

        return arr;
    };

    /**
     * 判断数组中是否包含元素
     * @param e
     */
    Array.prototype.in_array = function (e) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === e || this[i] === "##" || this[i] === "") {
                return true;
            }
        }
        return false;
    }


    Array.prototype.remove = function(dx){
        if(isNaN(dx)||dx<0||dx>this.length-1){return};
        this.splice(dx,1);
    }


    /**
     * 返回数组最大值
     * @returns {*}
     */
    Array.prototype.max = function () {
        if(this.length==0){
            throw Error("数组长度为0");
        }
        var temp = this[0];
        for(var i = 1,len = this.length;i<len;i++){
            var one = this[i];
            if( !isNaN(one)  && one >temp){
               temp = this[i];
            }
        }
        return temp;
    };

    /**
     * 数字格式化显示
     * @returns {string}
     * 原数字123456789  运算后结果：123,456,789
     */
    Number.prototype.format = function () {
        var num = this.valueOf() + "";
        var numStr = "";
        var _len = num.length;
        var flag = 0;
        for (var i = _len - 1; i >= 0; i--) {
            var tempStr = num[i] + "";
            numStr = tempStr + numStr;
            if (i != 0 && (flag + 1) % 3 === 0) {
                numStr = "," + numStr;
            }
            flag++;
        }
        return numStr;
    };


    /**
     * 日期格式化
     * @param fmt
     * @returns {*}
     * @constructor
     */
    Date.prototype.Format = function(fmt){ //author: meizz
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    };



})();


/**
 * @fileOverview
 * 后台通用脚本
 * 聪明的孩纸们会不断优化重构代码 使其变得更加易用
 * 关于重构，请参考：http://blog.jobbole.com/19371/
 */

/**
 * 后台脚本库 主命名空间
 * @namespace
 * @type
 */
var SGIS = SGIS || {};

/**
 * 注册命名空间
 * @param {String}    nameSpace    命名空间,多层级的可以用"点"来分割
 */
SGIS.registerNamespace = function (nameSpace) {
    var d = window, c = nameSpace.split(".");
    for (var b = 0; b < c.length; b++) {
        var e = c[b], a = d[e];
        //注意,第一次是不执行的,所以第一次运行过后d的值为window['SGIS']={} 另外不是单纯的赋值,而是指向
        if (!a) {
            a = d[e] = {};
            a.__namespace = true;
            a.__typeName = c.slice(0, b + 1).join(".");
        }
        d = a;
    }
};
SGIS.Log = function (msg) {
    if (SGIS.Config.log && window.console) {
        console.log(msg);
    }
};
SGIS.Debug = function (msg, error) {
 
};
/**
 * 分页对象
 * @param pageNumber
 * @param pageSize
 * @constructor
 */
SGIS.PageInfo = function (pageNumber, pageSize) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
}
//函数字面量,prototype向对象添加属性和方法
SGIS.PageInfo.prototype = {
    getPageNumber: function () {
        return this.pageNumber;
    },
    getPageSize: function () {
        return this.pageSize;
    }
}


/**
 * 行政区划对象
 * @class SGIS.Region
 * @constructor SGIS.Region
 * @param {String} regionCode    行政区划编码(这里可以填写适用于SQL的代码形式，比如510101001___)
 * @param {String} regionName    行政区划名称(optional)
 * @param {String/Number} regionLevel    行政区划级别(optional)
 */
SGIS.Region = function (regionCode, regionName, regionLevel) {
    this.regionCode = regionCode || "";
    this.regionName = regionName ? regionName : "未命名";
    this.regionLevel = regionLevel ? regionLevel : SGIS.Region.recognitionLevel(this.regionCode);
};

SGIS.Region.prototype = {
    /**
     * 获取行政区划名称
     * @return {String}
     */
    getName: function () {
        return this.regionName;
    },
    /**
     * 获取行政区划代码
     * @return {String}
     */
    getCode: function () {
        return this.regionCode;
    },
    /**
     * 获取行政区划级别, 如果在初始化的时候未填写, 会被构造函数默认根据规则赋值
     * @return {String/Number}
     */
    getLevel: function () {
        if (this.regionLevel < 0) {
            //根据行政区划规则判断行政区划级别
            return SGIS.Region.recognitionLevel(this.getCode());
        }
        return this.regionLevel;
    },
    toString: function () {
        return this.getName() + "（" + this.getCode() + "#" + this.getLevel() + "）";
    }
};
/**
 * 判断是否为同一个级别的行政区划对象
 * @static
 * @param {SGIS.Region} region0
 * @param {SGIS.Region} region1
 * @return {Boolean}    是否是同一个级别的行政区划对象
 */
SGIS.Region.isSameLevel = function (region0, region1) {
    return region0.getLevel() == region1.getLevel();
};

/**
 * 根据行政区划编码，识别级别
 * @static
 * @param {string|number} regionCode
 * @return {Number}
 */
SGIS.Region.recognitionLevel = function (regionCode) {
    if (!regionCode) return 0;
    var leng = regionCode.length;
    var regionlevel = 1;
    if (leng == 12) {
        if (regionCode.indexOf("00000000") == 0) {
            regionlevel = 1;
        } else if (regionCode.toString().substring(2, 12) == "0000000000") {
            regionlevel = 2;
            // 市
        } else if (regionCode.toString().substring(4, 12) == "00000000") {
            regionlevel = 3;
            // 区县
        } else if (regionCode.toString().substring(6, 12) == "000000") {
            regionlevel = 4;
            // 乡镇
        } else if (regionCode.toString().substring(9, 12) == "000") {
            regionlevel = 5;
        } else {
            //村（社区）
            regionlevel = 6;
        }
    } else if (leng <= 10) {
        //特色区
        regionlevel = 9;
    } else if (leng > 12 && leng <= 14) {
        //小区（园区）
        regionlevel = 7;
    } else if (leng > 14 && leng <= 29) {
        //建筑物
        regionlevel = 8;
    }
    //如果行政区划需要特殊判断的，后续在这里加入
    return regionlevel;
};
/**
 * 获取行政区划编码的前缀编码，即去0之后的，此方法可能对于特殊区域并不适用，比如北京的亦庄开发区，陕西的杨凌开发区等
 * @static
 * @param {String} regionCode    行政区划编码
 * @return {String}
 */
SGIS.Region.getPrefixCode = function (regionCode) {
    var re = "";
    var code = regionCode.toString();
    if (code.indexOf("#") != -1) {
        //#代表全部的意思
        return code.substring(0, code.indexOf("#"));
    } else {
        if (code.length == 12) {
            if (code.lastIndexOf("000000000000") == 0) {
                re = code.substring(0, 0); //国家,12个0
            } else if (code.lastIndexOf("0000000000") >= 2) {
                re = code.substring(0, 2); //省,10个0
            } else if (code.lastIndexOf("00000000") >= 4) {
                re = code.substring(0, 4); //市,8个0
            } else if (code.lastIndexOf("000000") >= 6) {
                re = code.substring(0, 6); //县,6个0
            } else if (code.lastIndexOf("000") >= 9) {
                re = code.substring(0, 9); //乡,3个0
            } else {
                //乡以下
                re = regionCode;
            }
        } else {
            re = code;
        }
    }
    return re;
};

/**
 * 判断是否reg2是否在reg1行政区划下
 * @param reg1 区划编码1
 * @param reg2 区划编码2
 * */
SGIS.Region.isSubRegion = function (reg1, reg2) {
    if (!reg1 || !reg2)
        return false;
    var prefix1 = SGIS.Region.getPrefixCode(reg1);
    var prefix2 = SGIS.Region.getPrefixCode(reg2);
    if (prefix2.indexOf(prefix1) != -1) {
        return true;//prefix1包含prefix2
    } else {
        return false;
    }
};

SGIS.Region.getLevelName = function (level) {
    switch (level) {
        case 2:
            return "省";
        case 3:
            return "地市";
        case 4:
            return "区县";
        case 5:
            return "乡镇街道";
        case 6:
            return "村居委会";
        case 7:
            return "小区（园区）";
        case 8:
            return "建筑物";
        case 9:
            return "特色区域";
        default:
            return "无";
    }
};

/**
 * 获取行政区划代码对应的行政区划级别名称
 * @param {String} regionCode    行政区划代码
 * @return {String} 全国、省、市、区县、街道乡镇、村居委会
 */
SGIS.Region.getRegionLevelName = function (regionCode) {
    regionCode = regionCode.replace(/_/g, "0");
    if (regionCode == "000000000000") {
        return "全国";
    }
    else {
        return SGIS.Region.getLevelName(SGIS.Region.recognitionLevel(regionCode));
    }
};
/**
 * 根据级别截取行政区划
 * @param regioncode
 * @param regionlevel
 * @returns {*}
 */
SGIS.Region.getSubCode = function (regioncode, regionlevel) {
    switch (regionlevel) {
        case 1:
            return "";
        case 2:
            return regioncode.substring(0, 2);
        case 3:
            return regioncode.substring(0, 4);
        case 4:
            return regioncode.substring(0, 6);
        case 5:
            return regioncode.substring(0, 9);
        case 6:
            return regioncode.substring(0, 12);
        case 7:
            return regioncode.substring(0, 14);
        case 8:
            return regioncode.substring(0, 29);
        case 9:
            return regioncode.substring(0, 10);
        default:
            return regioncode;
    }
};

SGIS.Region.getSub = function (regioncode) {
    var level = SGIS.Region.recognitionLevel(regioncode);
    return SGIS.Region.getSubCode(regioncode, level);
};

/**获取区划以下行政区划级别*/
SGIS.Region.getNextLevels = function (regioncode) {
    var level = SGIS.Region.recognitionLevel(regioncode);
    if (level == 1) { //省
        return [2, 3, 4, 5, 6];
    } else if (level == 2) { //省.直辖市
        if (SGIS.Region.isMunicipality(regioncode)) {//判断是否为直辖市
            return [4, 5, 6];
        } else {
            return [3, 4, 5, 6];
        }
    } else if (level == 3) {//市
        return [4, 5, 6];
    } else if (level == 4) {//县
        return [5, 6];
    } else if (level == 5) {//乡
        return [6];
    } else if (level == 6) {//村
        return [];
    }
    return [];
};

/**
 * 通过行政区划级别获取级别名称
 * @param level
 * @returns {string}
 */
SGIS.Region.getNameByLevel = function (level) {
    switch (level) {
        case 1:
            return "全国";
        case 2:
            return "省";
        case 3:
            return "市";
        case 4:
            return "区县";
        case 5:
            return "街道";
        case 6:
            return "村";
        case 7:
            return "小区";
        case 8:
            return "建筑物";
        case 9:
            return "特色区";
        default:
            return "无";
    }
};
/**
 * 获取级别对应的截取长度
 * @param level
 */
SGIS.Region.getLenByLevel = function (level) {
    var len = 0;
    switch (level) {
        case 1:
            len = 0;  //国家
            break;
        case 2:
            len = 2;  //省级
            break;
        case 3:
            len = 4;  //地市
            break;
        case 4:
            len = 6;  //区县
            break;
        case 5:
            len = 9;  //乡镇
            break;
        case 6:
            len = 12;  //村
            break;
        case 7:
            len = 14;  //小区
            break;
        case 8:
            len = 29;  //建筑物
            break;
        case 9:
            len = 10;  //特色区
            break;
    }
    return len;
}

/**
 * 直辖市区划代码前两位
 * @type Array<String>
 */
SGIS.Region.MunicipalRegions = ["11", "12", "31", "50"];
/**
 * 判断该行政区划代码是否属于直辖市
 * @param {String} regioncode
 */
SGIS.Region.isMunicipality = function (regioncode) {
    var m = SGIS.Region.MunicipalRegions;
    var prefix = regioncode.substring(0, 2);
    var re = false;
    for (var i = 0, _size = m.length; i < _size; i++) {
        if (prefix == m[i]) {
            re = true;
            break;
        }
    }
    return re;
};

/**
 * 根据用户可查询区域过滤选择的区域
 * @param {Array<SGIS.Region>} regions    选择的区域
 * @param {Array} area    可查询的区域（权限）
 */
SGIS.Region.filterRegions = function (regions, area) {
    if (SGIS.Config.Macro.escapeRegionControl) {
        return regions;
    }
    var re = [];
    if (regions.length == 0) {
        alert("请选择查询区域！");
        return re;
    }
    var _area = area || uPower.getUserarea();
    var areaCodess = _area.codes;
    //比如普查小区或者未满12位的建筑物 就直接通过过滤
    if (areaCodess.length == 0 || regions[0].length < 12) {
        return regions;
    }
    for (var i = 0; i < areaCodess.length; i++) {
        var codeLength = areaCodess[i].length;
        for (var j = 0; j < regions.length; j++) {
            if (regions[j].getCode().substr(0, codeLength) == areaCodess[i]) {
                re.push(regions[j]);
            }
        }
    }
    if (re.length == 0) {
        alert("您没有查询该区域数据的权限！\n您只能查询" + _area.names.join("、") + "的数据！");
    }
    return re;
};

/**
 * 构建标准12位的行政区划代码，对prefix补零
 * @param {String|Number} prefix
 */
SGIS.Region.toStandardCode = function (prefix) {
    while (prefix.length < 12) {
        prefix = prefix + "0";
    }
    return prefix;
};
/**
 *右侧补位
 */
SGIS.Region.padRight = function (prexCode, len, c) {
    if (len < prexCode.length) {
        return prexCode;
    }
    var a = [];
    for (var i = 0, size = len - prexCode.length; i < size; i++) {
        a.push(c);
    }
    return prexCode + a.join("");
};
/**
 * 根据父节点构造 所有xx区划代码（所有省、所有地市）
 * @param parcode
 * @param itsLevel
 * @param targetLevel
 * @returns {*}
 */
SGIS.Region.createXXRegion = function (parcode, itsLevel, targetLevel) {
    var strIts = SGIS.Region.padRight(
        SGIS.Region.getSubCode(parcode, itsLevel),
        SGIS.Region.getLenByLevel(itsLevel + 1), '#');
    var targetStr = SGIS.Region.padRight(strIts,
        SGIS.Region.getLenByLevel(targetLevel), '*');
    var newcode = SGIS.Region.padRight(targetStr, 12, '0');
    return new SGIS.Region(newcode, "所有" + SGIS.Region.getNameByLevel(targetLevel), targetLevel);
};


/**
 * 工具包
 */
SGIS.Util = {
    /**
     * http://localhost:8080
     * @returns {*}
     */
    getBaseUrl: function () {
        var loc = window.location;
        if (loc.origin) {           //origin是什么功能？
            return loc.origin;
        }
        return loc.protocol + "//" + loc.host;
    },

    /**
     * 获取ContextPath，工程的起始URL
     * @example
     * http://172.13.12.204:7080/bsm/page/index.jsp
     * 获取到
     * http://172.13.12.204:7080/bsm/
     * @return {String}
     */
    getLocalPath: function () {
        var location = document.location.toString();
        var contextPath = "";
        if (location.indexOf("://") != -1) {
            contextPath += location.substring(0, location.indexOf("//") + 2);
            location = location.substring(location.indexOf("//") + 2, location.length);
        }
        var index = location.indexOf("/");
        contextPath += location.substring(0, index + 1);
        location = location.substring(index + 1);
        index = location.indexOf("/");
        contextPath += location.substring(0, index + 1);
        return contextPath;
    },

    /**
     * 获取当前页面的起始地址
     * @example
     * http://172.13.12.204:7080/bsm/page/index.jsp
     * 获取到
     * http://172.13.12.204:7080/bsm/page/
     * @return {String}
     */
    getLocalhref: function () {
        var _lochref = location.href;
        var indexlast = 0;
        var rhraf = "";
        if (_lochref) {
            indexlast = _lochref.lastIndexOf("/");
            if (indexlast != 0) {
                rhraf = _lochref.substring(0, indexlast + 1);
            }
        }
        return rhraf;
    },
    /**
     * 从URL里获取参数对象
     * @param {String} url （optional）
     * @return {SGIS.Util.Hashtable}
     */
    getParamFromURL: function (url) {
        var s = url || location.href, re = new SGIS.Util.Hashtable();
        var kvs = s.split("?")[1] ? s.split("?")[1].split("&") : [];
        for (var i = 0, _sizei = kvs.length; i < _sizei; i++) {
            var o = kvs[i].split("=");
            re.add(o[0], decodeURIComponent(o[1]));
        }
        return re;
    },

    /**
     * 数据下载
     * @param id  $selectorID标识，iframe（需要在主页面中有iframe元素）
     * @param src 完整后台下载服务url
     */
    downloadData: function (id, src) {
        var ifrdownload = top.$("#" + id);
        ifrdownload.css("display", "block");
        ifrdownload.attr("src", src);
        ifrdownload.css("display", "none");//加载完关闭
    },

    formatString: function (source, opts) {
        source = String(source);
        var data = Array.prototype.slice.call(arguments, 1), toString = Object.prototype.toString;
        if (data.length) {
            data = data.length == 1 ?
                /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data)
                : data;
            return source.replace(/\{\{(.+?)\}\}/g, function (match, key) {
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if ('[object Function]' == toString.call(replacer)) {
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    }
};


/**
 * 哈希表
 * @class SGIS.Util.Hashtable 哈希表
 * @constructor SGIS.Util.Hashtable
 */
SGIS.Util.Hashtable = function () {
    this._hash = {};
};
SGIS.Util.Hashtable.prototype = {
    add: function (key, value) {
        if (typeof(key) != "undefined") {
            if (this.contains(key) == false) {
                //因为使用typeof对数据进行的判断,所以只需要使用==即可
                this._hash[key] = typeof(value) == "undefined" ? null : value;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },

    /**
     * 有则更新，无则添加  不同于add
     * @param key
     * @param value
     * @returns {boolean}
     */
    update: function (key, value) {
        if (typeof key != "undefined") {
            //相对于add仅仅不需要判断key是否存在
            this._hash[key] = typeof(value) == "undefined" ? null : value;
            return true;
        } else {
            return false;
        }
    },
    /**
     * 移除key对应的对象
     * @param {String} key
     * @returns {*}
     */
    remove: function (key) {
        //此处未判断key是否存在
        var re = this._hash[key];
        delete this._hash[key];
        return re;
    },
    /**
     * 获取内容个数，由于内部每次使用此方法都会进行一次遍历，所以建议在外部常用时保存临时长度变量
     * @return {Number}
     */
    count: function () {
        var i = 0;
        for (var k in this._hash) {
            i++;
        }
        return i;
    },
    /**
     * 获取key值对应的对象
     * @param {String} key
     * @return {Object}
     */
    items: function (key) {
        return this._hash[key];
    },
    /**
     * 是否包含key
     * @param {String} key
     * @return {Boolean}
     */
    contains: function (key) {
        return typeof(this._hash[key]) != "undefined";
    },
    /**
     * 清空
     */
    clear: function () {
        for (var k in this._hash) {
            delete this._hash[k];
        }
    },
    /**
     * 获取所有的key
     * @return {Array<String>}
     * for/in循环在对象中使用比较多
     */
    keys: function () {
        var re = [];
        for (var k in this._hash) {
            re.push(k);
        }
        return re;
    },
    /**
     * 对每一个元素做处理
     * @param {function(obj, key)} handler
     */
    each: function (handler) {
        if (!jQuery.isFunction(handler)) {
            return;
        }
        for (var k in this._hash) {
            handler(this._hash[k], k);
        }
    },
    /**
     * 将元素放入一个Array并返回，不保证元素顺序
     * @return {Array}
     */
    toArray: function () {
        var re = [];
        for (var k in this._hash) {
            re.push(this._hash[k]);
        }
        return re;
    },
    /**
     * 批量添加项目，使用each进行遍历处理，each(obj)需要返回一个长度为2的hash数组：[key, obj]
     * @param arr
     * @param each
     */
    addAll: function (arr, each) {
        for (var i = 0; i < arr.length; i++) {
            var item = each.call(this, arr[i]);
            item && this.add(item[0], item[1]);
        }
    }
};
/**
 * 根据Objects的键值对来构建hashtable
 * （仅是对象的第一层键值对）
 * @param {Object} obj
 * @return {SGIS.Util.Hashtable}
 */
SGIS.Util.Hashtable.fromObject = function (obj) {
    var re = new SGIS.Util.Hashtable();
    re._hash = obj
    return re;
};

SGIS.Util.Set = function () {
    this._hash = new SGIS.Util.Hashtable();
};
SGIS.Util.Set.prototype = {
    add: function (key) {
        this._hash.add(key, true);
    },
    remove: function (key) {
        this._hash.remove(key);
    },
    count: function () {
        return this._hash.count();
    },
    clear: function () {
        this._hash.clear();
    },
    each: function (handler) {
        for (var k in this._hash._hash) {
            handler(k);
        }
    }
};

/**
 * 提供两个函数节流方法，摘自underscore
 * http://www.css88.com/archives/4728
 * http://www.cnblogs.com/gumutianqi/archive/2011/09/28/2194513.html
 */
(function () {
    var _now = function () {
        return Date.now || function () {
                return new Date().getTime();
            };
    };

    /**
     * 多用于Resize事件。
     * 用户在拖动时，每两次查询的间隔不少于500毫秒，如果用户拖动了1秒钟，这可能会触发200次onscroll事件，但我们最多只进行2次查询。
     * @param func
     * @param wait
     * @param options
     * @returns {Function}
     */
    SGIS.Util.throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        options || (options = {});
        var later = function () {
            previous = options.leading === false ? 0 : new Date().getTime();
            timeout = null;
            result = func.apply(context, args);
            context = args = null;
        };
        return function () {
            var now = _now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    /**
     * 多用于输入框自动提示
     * 用户会暂时停止输入，于是我们决定在用户暂停输入200毫秒后再进行查询（如果用户在不断地输入内容，那么我们认为他可能很明确自己想要的关键字，所以等一等再提示他）
     * @param func
     * @param wait
     * @param immediate
     * @returns {Function}
     */
    SGIS.Util.debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function () {
            var last = _now() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null;
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = _now();
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };
})();

/**
 * 公用API请求方法
 */
;
(function () {
    var SERVICE_NAME = "/visdata/"; //后台数据服务名
    var WEB_NAME = "/visual/";
    // http://localhost:8080/data
    var BASE = (function () {
        var loc = window.location;
        if (loc.origin) {
            return loc.origin;
        }
        return loc.protocol + "//" + loc.host;
    })();
    /**
     * 请求类
     * @param api
     * @constructor
     */
    var Req = function (api) {
        this.api = api;
        this.method = "GET";
        this.dataType = "json";
        this._data = null;
        this._stringify = null;
        this.contentType = null;
        this._debug = false;
        this.serverName = SERVICE_NAME; //数据服务名
    };
    Req.prototype = {
        _method: function (method) {
            this.method = method;
            return this;
        },
        data: function (data) {
            if ($.type(data) == "string") {
                //接受JSON.stringify后的数据
                this.contentType = "application/json";
                this._stringify = data;
            } else {
                this._data = data;
            }

            return this;
        },
        json: function (callback,error) {
            _go(this, callback,error);
        },
        xml: function (callback) {
            this.dataType = "xml";
            _go(this, callback);
        },
        text: function (callback) {
            this.dataType = "text";
            _go(this, callback);
        },
        debug: function () {
            this._debug = true;
            return this;
        }
    };

    var _go = function (req, callback,error) {
        var ajax = {
            url: BASE + SGIS.API.serverName + req.api + "?_method=" + req.method,
            type: "POST",
            data: req._data,
            dataType: req.dataType,
            success: function (re) {
                if (req.api.indexOf("oAuth") < 0) {
                    if (re && re.power && re.power == "overdue") {
                        if (confirm(re.info + " 请重新登陆！")) {
//                            SGIS.Util.goToLogin();
                            LoginMod.init();
                            LoginMod.show();
                        } else {
                            SGIS.Util.goToLogin();
                            return;
                        }
                    }
                }
                callback && callback(re);
            },
            error: function (re) {
                SGIS.Debug("API请求出错");
                error&&error(re);
            }
        };
        if (req.contentType) {
            ajax.contentType = req.contentType;
            ajax.url += req._data ? ("&" + $.param(req._data)) : "";//兼容JSON参数
            ajax.data = req._stringify;//string参数
        }
        if (req._debug) {
            alert(ajax.url + " " + ajax.type);
        }
        $.ajax(ajax);
    };

    var createReq = function (args) {
        var url = args[0].replace(/\./g, "/");
        var data = Array.prototype.slice.call(args, 1);
        if (data.length) {
            var i = 0;
            url = url.replace(/\?/g, function () {
                return data[i++];
            });
        }
        return new Req(url);
    };

    /**
     * 将Rest请求包装了下，不用关心路径、字符串拼装、调试参数等
     * @type {{get: get, post: post, del: del, put: put}}
     */
    SGIS.API = {
        serverName:SERVICE_NAME,
        get: function (url) {
            return createReq(arguments)._method("GET");
        },
        post: function (url) {
            return createReq(arguments)._method("POST");
        },
        del: function (url) {
            return createReq(arguments)._method("DELETE");
        },
        put: function (url) {
            return createReq(arguments)._method("PUT");
        },
        getURL: function (url) {
            return BASE + SERVICE_NAME + createReq(arguments).api;  //后台数据服务完整URL
        },
        setServerName: function (_name) { //设置数据服务名
           this.serverName =  "/" +  _name + "/";
        }
    };

    SGIS.URL = {
        /**
         * 获取基于当前页面的URL地址
         * @example
         * 以lib/module开头
         * @param url
         * @returns {string}
         */
        get: function (url) {
            return BASE + WEB_NAME + url;
        },
        //seajs所用的基础路径
        SEAJS_BASE: BASE + WEB_NAME + "lib/module"
    };

})();



;(function(){
    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    var templateSettings = {
        evaluate: /\{%([\s\S]+?)%\}/g,
        interpolate: /\{\{(.+?)\}\}/g,
        escape: /\{\{-([\s\S]+?)\}\}/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    //恒为null
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',//行分隔符
        '\u2029': 'u2029'//段落分隔符
    };

    //
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    
    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore 强调 templating 模版 handles 处理 arbitrary 任意 delimiters 定界符, preserves whitespace,
    // and correctly escapes quotes within interpolated 内嵌 code.
    /**
     * 是一个闭包函数
     * @param text
     * @param data
     * @param settings
     * @returns {*}
     */
    SGIS.Util.template = function(text, data, settings) {
        var render;
        settings = $.extend({}, settings, templateSettings);

        // Combine delimiters into one regular expression via alternation.
        /**
         * matcher = /\{\{-([\s\S]+?)\}\}|\{\{(.+?)\}\}|\{\{-([\s\S]+?)\}\}|$/g
         */
        var matcher = new RegExp([
                (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        /**
         * replace()第二个参数为函数时,函数参数与matcher.exec(text)执行结果一样.
         */
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            /**
             *  这里做了做了字符串转义处理,简单理解,repacement为//+escapes[match]  ==> 字符串中具有\n会被换成\\n 
             *  注意,只会做一次转义,\\n ==> \n
             */
            source += text.slice(index, offset)
                .replace(escaper, function(match) {
                    return '\\' + escapes[match];
                });

            /**
             * source+
             * ((__t=(escape(param)))==null?'':_.escape(__t))+
             * '
             */
            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            /**
             * 后面多一个__p+='
             */
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            //第一步处理后,index会后移
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified(指定), place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";

        //将解析结果封装到一个函数中
        try {
            /**
             *  render = new function(obj){source}
             */
            render = new Function(settings.variable || 'obj', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data);
        var template = function(data) {
            return render.call(this, data);
        };

        /**
         * 一步步封装,到了此时
         * template.source = function(obj){source};
         */
        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        /**
         * function(data) {return render.call(this, data);};
         */
        return template;
    };
})();



;(function () {
    //默认的临时树节点标记
    var DEFAULT_TEMP = "load";
    /**
     * 构建树
     * @param container
     * @param actions
     * @param lazyCall
     * @returns {dhtmlXTreeObject}
     */
    var create = function (container, actions, lazyCall) {
        actions = actions || {};
        var tree = new dhtmlXTreeObject(container, "100%", "100%", "tree0");
        tree.enableDragAndDrop("temporary_disabled");
        tree.setImagePath(SGIS.Config.DhtmlxImagePath+"imgs/csh_vista/");
        tree.setOnDblClickHandler(actions.onDbClick || $.noop);
        tree.setOnCheckHandler(actions.onCheck || $.noop);
        tree.attachEvent("onClick", typeof(actions) == "function" ? actions : (actions.onClick || $.noop));
        if (lazyCall) {
            tree.__lazyCall = lazyCall;
            tree.setOnOpenEndHandler(function (id) {
                var _req = tree.__lazyCall.call(tree, tree, id);
                _openEnd.apply(tree, [_req, id, tree]);
            });
        }
        return tree;
    };
    var loadXml = function (dhxO, xml) {
        try {
            dhxO.loadXMLString(xml);
        } catch (e) {
            SGIS.Log(e);
        }
    };
    //打开Node时调用方法，如果该节点未被加载，则去请求子节点，请求子节点结束后会触发onLoadEnd事件
    var _openEnd = function (req, id, _tree) {
        var isLoaded = _tree.getSubItems(id).indexOf(DEFAULT_TEMP) < 0;
        var hasMoreChild = _tree.hasChildren(id) > 1;
        // 如当前节点已展开过，则终止
        if (hasMoreChild || isLoaded) {
            return;
        } else {
            _tree.loadXML(req);
            // 保证当前节点前+号（可展开），展开时删除默认的Loading子节点。
            _tree.deleteChildItems(id);
        }
    }


    /**
     * 快速构建树
     * @type
     */
    SGIS.Tree = {
        /**
         * 构建树
         * @param {String} container
         * @param {String} xml
         * @param {Object|Function} actions    事件map，或者可以直接给定onClick事件
         * @param {Function} lazyCall 动态加载树所需的请求构造函数(tree, id)
         * @return {dhtmlXTreeObject}
         *
         */
        create: function (container, xml, actions, lazyCall) {
            var tree = create(container, actions, lazyCall);
            loadXml(tree, xml);
            return tree;
        },
        /**
         * 构建一个checkbox树
         * @param {String} container 所属元素
         * @param {String} xml 树节点数据
         * @param {Object} actions 动作事件
         * @param {Function} lazyCall 动态加载树所需的请求构造函数(tree, id)
         * @return {dhtmlXTreeObject}
         */
        createCheckableTree: function (container, xml, actions, lazyCall) {
            var tree = create(container, actions, lazyCall);
            tree.enableCheckBoxes(1);
            tree.enableThreeStateCheckboxes(true);
            loadXml(tree, xml);
            return tree;
        }
    };

})();


;(function () {
    SGIS.Grid = {
        /**
         * 构建表格，返回一个未初始化的表格
         * @param {String} container
         * @return {dhtmlXGridObject}
         */
        create: function (container) {
            var grid = new dhtmlXGridObject(container);
            grid.setImagePath(SGIS.Config.DhtmlxImagePath + "imgs/");//图片路径
            grid.setSkin("dhx_skyblue");//皮肤样式
            grid.setEditable(false);
            return grid;
        }
    };
})();


/**
 * 界面操作
 * @type
 */
SGIS.UI = {
    windowResize : function(){

    },
    /**
     * 打开模态窗口
     * @param {String} pageUrl
     * @param {Number} width
     * @param {Number} height
     * @param {Object} args（optional）
     */
    openWindow : function(pageUrl, width, height, args){
        var url = pageUrl, sFeatures = 'dialogWidth={{width}}px;dialogHeight={{height}}px;scroll=no;status=no;resizable=no;';
        url += args ? "?"+$.param(args) : "";
        window.showModalDialog(url, self, SGIS.Util.formatString(sFeatures, {height : height, width : width}));
    }
};

/**
 * jQuery hover的改进版，允许用户在鼠标离开目标后的delay毫秒内不触发leave方法，以此达到良好的体验效果
 * @param {jQuery|String} el	目标
 * @param {Function} enter	鼠标enter触发事件
 * @param {Function} leave	鼠标leave触发事件
 * @param {Number} delay	（optional）默认500
 * @return {jQuery}
 */
SGIS.UI.delayHover = function (el, enter, leave, delay){
    var o = typeof el === "string" ? $("#"+o) : el;
    var isOver,isShow,timeid;
    return o.hover(function (){
        isOver = true;
        clearTimeout(timeid);
        if (isShow){
            return;
        }else{
            isShow = true;
            enter.call(this);
        }
    }, function (){
        timeid = setTimeout(function(){
            isOver = isShow = false;
            leave.call(this);
        }, delay || 500);
    });
};

//构建界面里的Option（或者Semantic里的Dropdown）
(function(){
    var Op = function(value, text){
        this.value = value;
        this.text = text;
    };
    var create = function(values, texts){
        var re = [];
        for (var i = 0, _sizei = values.length; i < _sizei; i++) {
            re.push("<option value='"+values[i]+"'>"+texts[i]+"</option>");
        }
        return re.join("");
    };
    /**
     * 提供界面中常用的option初始化
     * @type
     */
    SGIS.UI.Option = {
        /**
         * 构建月份选择
         * @return {String}
         */
        createMonth : function(){
            var v = [], t = [];
            //empty for
            for(var i = 0;i < 12; i++,v.push(i),t.push(i+"月"));
            return create(v, t);
        },
        /**
         * 构建季度选择
         * @return {String}
         */
        createSeason : function(){
            return create("1,2,3,4".split(","), "一季度,二季度,三季度,四季度".split(","));
        },
        /**
         * 构建年份选择
         * @param {Number} start（optional）
         * @param {Number} end（optional）
         * @return {String}
         */
        createYear : function(start, end){
            var currentYear = new Date().getFullYear(), v = [], t = [];
            for (var i = 0; i < 10; i++) {
                v.push(currentYear - i);
                t.push((currentYear - i)+"年");
            }
            return create(v, t);
        },
        /**
         * 可以是数组也可以是以逗号分割的字符串
         * @param values
         * @param names
         */
        create : function(values, names){

        }
    };
})();


SGIS.registerNamespace("SGIS.AutoForm");

(function(){
    var Validator = {
        notnull : function(v, args){
            return v != "";
        },
        number : function(v, args){
            return !isNaN(v);
        },
        len : function(v, args){

        },
        min : function(v, args){
            return v.length > args;
        },
        max : function(v, args){
            return v.length < args && v.length > 0;
        },
        regx : function(v, args){
            return new RegExp(args).test(v);
        }
    };
    var Msg = {
        notnull : "不能为空",
        number : function(v, args){
            return !isNaN(v);
        },
        len : function(v, args){

        },
        min : function(v, args){
            return v.length > args;
        },
        max : function(v, args){
            return v.length < args && v.length > 0;
        },
        regx : function(v, args){
            return new RegExp(args).test(v);
        }
    }
    var testV = function(){
        var $this = $(this), vs = $this.attr("data-validation").split(";"), result = true;
        for (var i = 0, _sizei = vs.length; i < _sizei; i++) {
            var keys = vs[i].split(",");
            result = Validator[keys[0]] ? Validator[keys[0]].call(this, $this.val(), keys[1]) : true;
            if (!result) {
                SGIS.UI.alert("不允许为空","alert",null,1500);
                $this.focus();
                break;
            }
        }

        $this.parentsUntil(".form-group").parent().toggleClass("has-error", !result);
        return result;
    };
    /**
     * 表单
     * 提供填充数据的方法
     * 提供提交表单的方法
     * @param {Element} content
     * @param {Object} options
     */
    SGIS.AutoForm = function(content, options) {
        this.options = options
        this.$element = $(content)
        this.$element.delegate(":input[data-validation]", "blur", testV)
        //		.delegate('[data-dismiss="modal"]', 'click.form.submit', $.proxy(this.submit, this))
    };
    SGIS.AutoForm.prototype = {
        /**
         * 验证表单
         * @return Boolean
         */
        validation : function(){
            var re = true;
            this.$element.find("input[data-validation]").each(function(){
                if (!testV.call(this)){
                    re = false;
                }
            });
            return re;
        },
        /**
         * 提交表单
         * @param {String} url
         * @param {Function} callback
         */
        submit : function(url ,callback){
            if (this.validation()){
                var ps = this.$element.serializeArray(), o = {};
                for (var i = 0, _sizei = ps.length; i < _sizei; i++) {
                    o[ps[i].name] = ps[i].value;
                }
                $.post(url, o, function (re){
                    callback && callback.call(this, re);
                }, this.options.type || "text");
            }
        },
        reset : function(){
            this.$element[0].reset();
            //统一处理默认状态标识码为1
            this.$element.find("input[name=status]").val("1");
        },
        setInitValue : function(data,settings){
            var a = this.$element.serializeArray();
            for(var i=0 ,_size = a.length ; i<_size;i++){
                var val = "";
                var key = a[i].name ; //页面元素名称
                var b = key.split("."); //点号分割解析
                var t = data ;          //json数据
                var f = false ;
                for(var j =0 ;j < b.length ; j++){
                    //数值型的0需要进行填充，用布尔类型判断不准确
                    if(t[b[j]]!=null&&t[b[j]]!=undefined){
                        f = true ;
                        t = t[b[j]] ;
                    }
                }
                f&&(val = t) ;
                if(settings&&settings[key]){
                    var c = settings[key].split(".") ;//解决类主外键关系的情况
                    var o = data ;
                    var g = false ;
                    for(var k=0 ; k < c.length ;k++){
                        if(o[c[k]]){
                            g = true ;
                            o =o[c[k]];
                        }
                    }
                    (g&&o)&&(val=o);
//                    data[settings[key]]&&(val =  data[settings[key]]);
                }
                this.$element.find("[name='"+key+"']").val(val);
            }
        },
        serializeObject : function() {
            var o = {};
            var a = this.$element.serializeArray();
            $.each(a, function() {
                var n = this.name.split(".") ;//考虑层级为2的情况
                if(n.length ==1){
                    if (o[this.name]) {
                        if (!o[this.name].push) {
                            o[this.name] = [ o[this.name] ];
                        }
                        o[this.name].push(this.value || '');
                    } else {
                        o[this.name] = this.value || '';
                    }
                }else if(n.length ==2){
                    o[n[0]] ={};
                    o[n[0]][n[1]] =this.value || '';
                }
            });
            return o;
        },
        find :function(selector){
            return this.$element.find(selector);
        }
    };

    SGIS.AutoForm.getDoc = function(frame) {
        var doc = null;
        // IE8 cascading access check
        try {
            if (frame.contentWindow) {
                doc = frame.contentWindow.document;
            }
        } catch(err) {
            // IE8 access denied under ssl & missing protocol
            SGIS.Log('cannot get iframe.contentWindow document: ' + err);
        }

        if (doc) { // successful getting content
            return doc;
        }

        try { // simply checking may throw in ie8 under ssl or mismatched protocol
            doc = frame.contentDocument ? frame.contentDocument : frame.document;
        } catch(err) {
            // last attempt
            SGIS.Log('cannot get iframe.contentDocument: ' + err);
            doc = frame.document;
        }
        return doc;
    };

    //扩展FileUploadForm
    SGIS.AutoForm.UploadAction = function(formid, iframeid, fileType, onSuccess){
        var reg = /xls/g, form = $("#"+id), iframe = $("#"+iframeid);
        iframe.one("load", function(){

        });
    };
    Array.prototype.remove = function(dx){
        if(isNaN(dx)||dx<0||dx>this.length-1){return};
        this.splice(dx,1);
    }
})();


//正在加载
(function(){
    var loading = '<div class="ui active inverted dimmer"> <div class="ui text loader">正在加载…</div> </div >';

    var _getNode = function(msg, selector){
        var _context = selector ||"body";
        var $loading = $(".ui.inverted.dimmer", _context);
        $loading.length || ($loading = $(loading).appendTo(_context));
        msg && $loading.find('.text').text(msg);
        return $loading;
    };

    /**
     * 向目标窗口添加加载条
     * @param msg （optional）默认为”正在加载…“
     * @param selector （optional）默认为本窗口
     */
    SGIS.UI.addLoadingBar = function(msg, selector){
        _getNode(msg, selector).addClass('active');
    };

    /**
     * 清除目标窗口内的加载条
     * @param selector
     */
    SGIS.UI.clearLoadingBar = function(selector){
        _getNode(null, selector).removeClass('active');
    }
})();


//正在加载 bootstrap
(function(){
    var $backdrop;
    var $loading;
    var loading ="<div class='loading dimmer' style='cursor: wait;z-index:1999;'>" +
        "<span class='text alert alert-info'>{{text}}</span></div>";

    var _getNode = function(text, selector){
        var _context = selector ||"body";
        var $loading = $(".loading", _context);
        if($loading.length>0){
            $loading.find("span").html(text||"正在加载...")
        }
        $loading.length || ($loading = $(loading.replace("{{text}}",!text?"正在加载...":text))
            .appendTo(_context));
        return $loading;
    };

    SGIS.UI.addLoadingBar0 = function(text,selector){
        _getNode(text, selector).addClass('active');
    };
    SGIS.UI.clearLoadingBar0 = function(selector){
        _getNode(null, selector).removeClass('active');
    }

})();

//正在加载 bootstrap
(function(){
    var $backdrop;
    var $loading;
    var loading ="<div style='cursor: wait;z-index:1999;position: relative;top: 20px;bottom: 20px;width: 100%'>" +
        "<span class='text alert alert-info'>{{text}}</span></div>";

    var _getNode = function(text, selector){
        var _context = selector ||"body";
        var $loading = $(".loading", _context);
        if($loading.length>0){
            $loading.find("span").html(text||"正在加载...")
        }
        $loading.length || ($loading = $(loading.replace("{{text}}",!text?"正在加载...":text))
            .appendTo(_context));
        return $loading;
    };

    SGIS.UI.addLoadingBar1 = function(text,selector){
        _getNode(text, selector).addClass('active');
    };
    SGIS.UI.clearLoadingBar1 = function(selector){
        _getNode(null, selector).removeClass('active');
    };

})();

//bootstrap 警告框
(function(){
    var $backdrop;
    var $loading;
    var alert = '<div class="alert alert-warning fade in" role="alert">{{info}}</div>';
    //带关闭按钮
    var alertWithClose = '<div class="alert alert-warning alert-dismissible" role="alert">'
        +'<button type="button" class="close" data-dismiss="alert">'
        +'<span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
        +'{{info}}</div>'
    /**
     * 获取警告框实例
     * @param info
     * @param type
     * @param selector
     * @returns {*|jQuery|HTMLElement}
     * @private
     */
    var _getNode = function(info,type, selector,withclose){
        var _context = selector ||"body";
        var $_refer = $(_context) ;
        if($(_context).hasClass("modal")){
            $_refer = $(_context).find(".modal-content") ;
        }
        var offset= $_refer.offset();
        var h = $_refer.height();
        var w = $_refer.width();
        var top = offset.top+h/2-50;
        var left = offset.left+w/2 -50;
        var className = "alert-warning";
        if(type == "success"){
            className = "alert-success";
        }
        if(type == "dange"){
            className = "alert-dange";
        }
        if(type == "warn"){
            className = "alert-warning";
        }
        if(type == "info"){
            className = "alert-info";
        }

        var $alert = $("."+className, _context);
        $alert.remove();
        var str = !withclose?alert:alertWithClose ;
        $alert = $(str.replace("{{info}}",!info?"":info))
            .addClass(className)
            .css({
                position:"absolute",
                top:top+"px",
                left:left+"px",
                "z-index":"99999999999999999999"
            }).appendTo(_context);
        return $alert;
    };

    //不带关闭按钮 指定时间后(默认)自动关闭
    SGIS.UI.alert = function(info,type,selector,time,withclose){
        var alertObj = _getNode(info,type, selector,withclose) ;
        alertObj.alert();
        if(!withclose){
            setTimeout(function(){
                alertObj.alert("close");
            },time||3000);
        }
    };

    //带关闭按钮
    SGIS.UI.alert0 = function(info,type,selector){
        var alertObj = _getNode(info,type, selector,true) ;
        alertObj.alert();
    }

})();


//可拖动面板
(function () {
    if (!$.fn.Drag)
        $.fn.Drag = function () {
            var M = false;
            var Rx, Ry;
            var t = $(this);
            var head = t.find(".move");  //只让头部可拖动
            head.mousedown(function (event) {
                Rx = event.pageX - (parseInt(t.css("left")) || 0);
                Ry = event.pageY - (parseInt(t.css("top")) || 0);

                $("div.drag").css("z-index",1999);
                t.css("z-index", 2000);

                t.css("position", "absolute").fadeTo(20, 1);
                t.find(".move").css('cursor', 'move');
                M = true;
            }).mouseup(function (event) {
                M = false;
                t.fadeTo(20, 1);
            });
            $(document).mousemove(function (event) {
                if (M) {
                    t.css({ top: event.pageY - Ry, left: event.pageX - Rx });

                    //去掉分段图的tip
                    var $tooltip = $("#map-container >#thematic-tooltip");
                    if ($tooltip.length > 0) {
                        $tooltip.remove();
                    }
                }
            });
        }
})();



/**
 * 初始化一些属性
 */
;(function () {
    SGIS.BASE_URL = SGIS.Util.getLocalPath();
})();


SGIS.Config = {
    DhtmlxImagePath :SGIS.BASE_URL +"lib/dhtmlx/"  ,
    log : true
};


/**
 * 浏览器判断
 * @returns {*}
 */
var checkAgent = function () {
    var agent = navigator.userAgent.toLowerCase();
    var ind = agent.indexOf("android");
    var indip = agent.indexOf("iphone");
    var indipad = agent.indexOf("ipad");
    if(ind>0 || indip>0 ||indipad>0){
        SGIS.agent = "client";
    }else{
        SGIS.agent = "pc";
    }
}
checkAgent();
