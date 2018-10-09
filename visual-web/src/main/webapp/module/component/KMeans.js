define(function(require, exports,module){
    /**
     *K-Means聚类算法
     * <p>
     *     说明：此算法返回的值可能不是唯一值
     * </p>
     *
     * @param data Array数据
     * @param num 分段数
     * @constructor
     */
    var KMeans =function(num,data){
        this.center= new Array();       //中心链表
        this.cluster =  new Array();    //归类
        this.Jc = new Array();          //误差平方和
        this.result = new Array();      //误差平方和

        var timeData = data;            //当前的数据
        var randoms = new Array();      //保存的随机数（0~data.length之间）
        var flag;

        num = parseInt(num);
        num = num+1;                    //num段数据需要num+1个数据，故+1

        //初始化鏃中心
        var tempNum = Math.floor(Math.random()*num) ;
        for(var i = 0; i < num; i ++){
            flag = true;
            while(flag){
                tempNum = Math.floor(Math.random()*timeData.length);

                var isExist = false;    //判断随机数是否存在
                for(var j = 0; j < i; j ++){
                    //如果当前生成的随机数已经存在，不添加
                    if(tempNum == randoms[j]){
                        isExist = true;
                        break;
                    }
                }
                if(!isExist){
                    flag = false;
                }
            }
            randoms[i] = tempNum;
            this.center[i] = timeData[randoms[i]];
        }

        //初始化鏃
        this.initCluster(num);

        var m = 0;
        while(true){
            this.clusterSet(num,timeData,this.center);  //生成簇集元素
            this.countRule();                           //计算误差平方和
            //判断退出迭代条件
            if(m != 0){
                if (this.Jc[m] - this.Jc[m-1] == 0) {
                    break;
                }
            }
            this.findNewCenter(num);                    //计算新的中心
            m++;
            this.cluster = this.initCluster(num);       //簇集初始化
        }

        var temp = new Array();
        for(var no=0;no<num;no++){
            temp.push(this.cluster[no][0]);
        }

        temp.sort(this.sortOnValueRang);                //降序

//        timeData.sort(this.sortOnValueRang);            //降序
//
//        var minData = timeData[timeData.length-1];
//        var isTempExistMindata = false;
//        //判断是否存在最小值
//        for(var j = temp.length;j>=0;j--){
//            if(temp[j] == minData){
//                isTempExistMindata = true;
//                break;
//            }
//        }
//        if(isTempExistMindata){
//            //已存在最小值，放入最大值
//            temp.push(timeData[0]);
//        }else{
//            //不存在最小值，放入最小值
//            temp.push(minData);
//        }

        this.result=temp;
        this.result.sort(function(a,b){
            return a-b ;
        }) ;

    };

    /**
     * 属相方法
     * @type {
     *      {
     *          initCluster: initCluster,
     *          clusterSet: clusterSet,
     *          distancetmp: distancetmp,
     *          countRule: countRule,
     *          errorSquare: errorSquare,
     *          minDistance: minDistance,
     *          findNewCenter: findNewCenter,
     *          sortOnValueRang: sortOnValueRang
     *    }
     *  }
     */
    KMeans.prototype = {
        //鏃初始化
        initCluster : function(num){
            var tmp = new Array();
            var clustertmp = new Array();
            for(var i = 0; i < num; i ++){
                clustertmp.push(tmp);
            }
            return clustertmp;
        },
        /**
         * 生产鏃元素
         * @param num
         *          段数
         * @param timeData
         *          原始数据集
         * @param center
         *          随机中心数
         */
        clusterSet:function(num,timeData,center){
            var clustertmp=new Array();

            var distance =  new Array(num);
            var clusterseat=new Array();
            for(var i = 0; i < timeData.length; i ++){
                //计算timeData[i]与各个中心点的距离
                for(var j = 0; j < num; j ++){
                    distance[j] = this.distancetmp(timeData[i], center[j]);
                }
                //最小值所在的位置
                var minLocation = this.minDistance(distance,num);
                clusterseat.push(minLocation,timeData[i]);
            }

            //初始化二维数组
            for(var ii = 0;ii<num;ii++){
                clustertmp.push([]);
            }
            //归一类
            for(var sum=0;sum<clusterseat.length;sum+=2){
                //填充数据
                clustertmp[clusterseat[sum]].push(clusterseat[sum+1]);
            }
            this.cluster = clustertmp;
        },
        /**
         * 计算两个数之间的距离
         *
         * @param element
         *          当前元素
         * @param center
         *          当前元素中心数
         * @returns {number}
         */
        distancetmp:function(element,center){
            var x = element - center;
            var z = x*x;
            return Math.sqrt(z);
        },

        /**
         * 计算误差平方和准则函数方法
         */
        countRule:function(){
            var JcF = 0;
            for(var i = 0; i < this.cluster.length; i ++){
                for(var j = 0; j < this.cluster[i].length; j ++){
                    JcF += this.errorSquare(this.cluster[i][j], this.center[i]);
                }
            }
            this.Jc.push(JcF);
        },

        /**
         * 求误差平方的方法(求两个数的距离的平方)
         * @param element
         * @param center
         * @returns {number}
         */
        errorSquare:function( element,  center){
            var x = element - center;
            var errorSquare = x*x ;
            return errorSquare;
        },

        /**
         * 求最小距离（位置/下表）方法
         * @param distance
         *          当前元素距离中心的最小值
         * @param num
         *          分段个数
         */
        minDistance:function(distance,num){

            var minDistance = distance[0];
            var minLocation = 0;
            for(var i = 1; i < distance.length; i ++){
                if(distance[i] < minDistance){
                    minDistance = distance[i];
                    minLocation = i;
                }else if(distance[i] == minDistance){ //如果和当前最短距离相等，则随机选取一个
                    if(Math.floor(Math.random()*num)< 5){
                        minLocation = i;
                    }
                }
            }
            return minLocation;
        },

        /**
         * 计算新的簇中心方法
         * <p>
         *     说明：每一簇的所有点的中心为新的处
         * </p>
         * @param num
         *          分段数
         */
        findNewCenter:function(num){
            for(var i = 0; i < num; i ++){
                var n = this.cluster[i].length;
                if(n != 0){
                    var newCenter = 0; //默认为0
                    for(var j = 0; j < n; j ++){
                        newCenter += this.cluster[i][j];
                    }
                    newCenter = parseFloat(newCenter / n);
                    this.center[i] = newCenter;
                }
            }
        },
        /**
         * 降序排列
         * @param a
         * @param b
         * @returns {number}
         */
        sortOnValueRang:function(a, b){
            var val1 = a;
            var val2 = b;

            if(val1 < val2) {
                return 1;
            } else if(val1 > val2) {
                return -1;
            } else{
                return 0;
            }
        }
    };


    return KMeans ;
});
