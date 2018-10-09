/**
 * 对分段数据的一个取整优化算法
 *
 * Created by Linhao on 2015/3/20.
 */
define(function (require, exports, module) {

    /**
     * 构造函数（初始化）
     *
     * @param _dataRamp
     *           分段数据（从小到大的排序）
     * @constructor
     */
    var SegmentedDataOptimize = function(_dataRamp){
        this.dataRamp = _dataRamp;
        this.segNums = 0;               //分段数
        this.MAX_OPTIMIZE_LEN = 5;      //最大处理长度
        this.IS_ROUNDING = true;        //是否四舍五入
    };


    /**
     * 属性方法
     *
     * @type {{}}
     */
    SegmentedDataOptimize.prototype = {
        setDataRamp:function(_dataRamp){
            this.dataRamp = _dataRamp;
        },
        getDataRamp:function(){
            return this.dataRamp;
        },
        excute:function(){
            var that = this;
            var dataRamp = this.getDataRamp();
            if(!dataRamp || dataRamp.length < 1){
                alert("错误提示：请设置SegmentedDataOptimize中的分段数据！");
                return dataRamp;
            }

            //取得要分的段数
            that.segNums = dataRamp.length-1;

            var min = Math.min.apply(Math, dataRamp);
            //最小值的总长度
            var minLen = min.toFixed(0).length;

            //最小间距值
            var minDifference = 0;
            for(var i=0,len=dataRamp.length; i < len; i++){
                if(i == 0){
                    minDifference = dataRamp[i+1]-dataRamp[i];
                }else if(i <= dataRamp.length-2){
                    if((dataRamp[i+1]-dataRamp[i]) < minDifference){
                        minDifference =  dataRamp[i+1]-dataRamp[i];
                    }
                    if(i == dataRamp.length-2){
                        break;
                    }
                }
            }

            //如果最小间距只有一位，并且最小值也是一位，不做处理
            if(minDifference.toFixed(0).length == minLen && minLen == 1){
                //最小值，只有一位，不做处理
                return that.getDataRamp();
            }

            var isExFirst = true;    //是否处理第一位
            //保存当前的最小间距的位数作为最小长度
            minLen = minDifference.toFixed(0).length;
            if(minDifference > min){
                isExFirst = false;
            }

            //要处理的位数
            var exLen = minLen-1;

            //不能超过最大限制位数
            if(exLen > that.MAX_OPTIMIZE_LEN){
                exLen = that.MAX_OPTIMIZE_LEN;
            }

            //是否四舍五入
            var isRounding = that.IS_ROUNDING;
            var newDataRamp = [];
            var leng = dataRamp.length;
            for(var i=0; i < leng; i++){
                var data = dataRamp[i];
                var item;
                //第一个，不四舍五入
                if(i == 0){
                    if(isExFirst)
                        item = getRoundByOptimizeLen(data,exLen,false,false);
                    else{
                        var len = min.toFixed(0).length;
                        if(len > 1){
                            len = len-1;
                            item = getRoundByOptimizeLen(data,len,false,false);
                        }else{
                            //直接返回
                            item = {
                                data: data,   //取整数的部分
                                offset: 0     //偏移的部分
                            };
                        }
                    }
                }else if(i == leng-1){
                    //最后一个，向上取整
                    item = getRoundByOptimizeLen(data,exLen,isRounding,true);
                }else{
                    item = getRoundByOptimizeLen(data,exLen,isRounding,false);
                }
                newDataRamp.push(item.data);
            }
            dataRamp = newDataRamp;
            return dataRamp;
        }
    };

    /**
     * 按精度为取整数
     *
     * @param number
     *          精度的数字
     * @param exLen
     *          精确的位数
     * @param isRounding
     *          是否四舍五入
     * @param isLast
     *          是否最后一个
     * @returns {*}
     */
    var getRoundByOptimizeLen = function(number,exLen,isRounding,isLast){
        var re = {
            data:number,   //取整数的部分
            offset:0       //偏移的部分
        };

        var decimal = 0;
        var numberStr = number.toString();
        if(numberStr.indexOf(".") > -1){
            //小数部分
            decimal = parseFloat("0"+numberStr.substr(numberStr.indexOf(".")));
        }

        var num = number.toFixed(0).length - exLen;
        if(num > 0){
            var prefix = "";
            for(var i =0;i< exLen;i++){
                prefix += "0";
            }

            var integerStr = number.toFixed(0).substr(0,num)+prefix;
            var integer = parseInt(integerStr);
            re = {
                data:(integer+decimal),
                offset:(number-(integer+decimal))
            };

            if(isLast){
                //有偏移，项上取整
                if(re.offset > 0 || decimal > 0){
                    re = ceiling(re);
                }
            }else{
                if(isRounding){
                    re = rounding(re);
                }
            }

        }

        return re;
    };

    /**
     * 向上取整
     * @param _re
     * @returns {*}
     */
    var ceiling = function(_re){
        var re = _re;

        var offset = _re.offset;
        //10的n次方
        var integer = Math.pow(10,offset.toFixed(0).length);

        //直接向上偏移
        re.data = re.data+ integer;
        re.offset =  re.offset - integer;

        return re;
    };

    /**
     * 数据四舍五入
     * @param _re
     * @returns {*}
     */
    var rounding = function(_re){
        var re = _re;

        var offset = _re.offset;
        //10的n次方
        var integer = Math.pow(10,offset.toFixed(0).length);
        //offset>=5
        if((offset*2) >= integer) {
            re.data = re.data+ integer;
            re.offset =  re.offset - integer;
        }

        return re;
    };

    return SegmentedDataOptimize;
});