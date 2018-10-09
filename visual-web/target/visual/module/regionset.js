/**
 * Created by jinn on 2015/10/22.
 */
define(function (require, exports, module) {
    var events = require("component/app.events");
    var mustache = require("mustache");
    var SpatialQuery = require("spatial.query");
    var regPanel = $("#region-panel"); //区划设置弹出面板
    var defaultRegions = [],currRegions,selRegions = [], currLevel,catalogid;
    var useSelRegion = true; //使用自定义区域
    var config = null;  //配置信息


    /**
     * 获取配置信息
     * @param callback
     */
    var getConfig = function (callback) {
        if(config){
            //如果callback已经被定义且不为null, false, or 0,右边这个方法将被执行
            callback && callback(config);
            return
        }else{
            require.async("../config.regionset", function (re) {
                config = re;    //保存配置信息

                catalogid = config.catalogid;
                currRegions = config.defaultRegion;
                currLevel = currRegions[0].getLevel();

                //deep = true 保证temp中的值不被覆盖
                var temp = $.extend(true,{},re.defaultRegion);
                //将当前地区信息进行保存
                defaultRegions.length = 0;
                defaultRegions.push(temp[0]);

                //更新地区标签
                refreshRegionLabel(defaultRegions[0].getName(),defaultRegions[0].getCode());

                callback && callback(config);
            });
        }
    };

    var init = (function () {
        var _isInit = false;     //未初始面板

        /**
         * 注册地区双击（下钻）事件
         * 触发方式:trigger('event',arg);
         */
        events.on("region.dbclick", function (_region) {
            drillAction(_region);
            //refreshRegionBread(_region);
        });
        /**
         * 注册鼠标单击（选中）事件
         */
        events.on("region.click", function (_region) {

        });

        /**
         * 指标搜索autocomplete联想输入、自动补全  远程数据
         */
        //$$("#input-iden").focus().autocomplete("http://localhost:8080/visdata/macro/idenQuery" ,{
        //    //width: 320,
        //    max: 4,
        //    highlight: false,
        //    multiple: true,
        //    multipleSeparator: " ",
        //    scroll: true,
        //    scrollHeight: 300,
        //    dataType: "text",//指定返回值为纯文本字符串才能正确解析 \n
        //    extraParams:{currentLvl:getCurrLevel}//函数不能加括号
        //});


        //关闭区域面板
        $("#close-regpan").click(function () {
            hide();
        });

        //区划选择面板内区域点击事件
        regPanel.delegate("#regionset-go-list a,#hotRegionInit a", "click", function () {
            useSelRegion = true;
            var tempLevel = currLevel;
            var codeOriginal = $(this).attr("data-region-code");
            var regioncode = $(this).attr("data-region-code");
            var name = $(this).text();
            refreshRegionLabel(name,regioncode);

            currRegions.length = 0;//清空行政区划
            RegionTree.linkage();

            selRegions.length = 0;
            if($(this).attr("region-type") =="TS"){ //大标题
                $(this).nextAll().find("a").each(function (i, o) {

                    regioncode = $(this).attr("data-region-code"), name = $(this).text();
                    var _region = new SGIS.Region(regioncode, name);
                    selRegions.push(_region);
                });
                if(selRegions.length>1){
                    currLevel = selRegions[0].getLevel();
                }

            }else {
                //单个区域查询下一级别所有区域
                var level = SGIS.Region.recognitionLevel(regioncode);
                if(level<6){  //村级别就不往下走了
                    var isM =  SGIS.Region.isMunicipality(regioncode);
                    currLevel = SGIS.Region.getNextLevels(regioncode)[0];
                    regioncode = SGIS.Region.getPrefixCode(regioncode);

                    if(level == 2 && isM){
                        regioncode +="00##";
                    }else if(level==5){
                        regioncode += "###"
                    }else{
                        regioncode+="##";
                    }
                    regioncode = SGIS.Region.toStandardCode(regioncode);
                }
                selRegions.push(new SGIS.Region(regioncode,name));
            }

            if(currLevel!=tempLevel){
                events.trigger("level.switch",currLevel);  //触发级别改变事件
            }
            events.trigger("region.switch",selRegions); //触发行政区划改变事件

            RegionTree.location(); //定位
            //TODO 区域定位
            hide();//隐藏弹出面板
            //RegionTree.hotRegionUpdate(codeOriginal);
        });

        /**
         * 区域选择面板初始化
         */
        var refreshRegion = function (re) {
            var template = $("#regionset-go-list").html();
            var rendered = mustache.render(template, re); //根据html模板和配置数据解析html脚本
            $('#regionset-go-list').html(rendered);
        };

        /**
         * 热度区域初始化
         */
        var hotRegionInit = function (regions) {

            var obj = {"hotRegions":regions};

            var template = $("#hotRegionInit").html();
            var rendered = mustache.render(template, obj); //根据html模板和配置数据解析html脚本
            $('#hotRegionInit').html(rendered);
        };

        return function (cb) {
            if (_isInit) {
                return;
            }

            getConfig(function (re) {
                regPanel.Drag();
                RegionTree.init();
                //更改config中热度初始化信息，因为异步执行把refreshRegion作为回掉方法
                //RegionTree.hotRegionInit(re,refreshRegion);
                refreshRegion(re);

                //RegionTree.hotRegionInit(hotRegions);

                _isInit = true;
                RegionTree.location(null,cb);  //初始化完成 自动定位

            });
        }
    })();

    /**
     * 打开界面，默认是行政区划选择
     * @param tab
     */
    var show = function () {
        var width = $("body").width();



        if(width>400){
            regPanel.css({
               width:"350px"
            });
        }else{
            //regPanel.css({
            //    width:"300px"
            //});
        }
        var regWidth = regPanel.width();
        var left = (width-regWidth)/2 + "px";

        regPanel.css({
            "max-width":(width-10) + "px",
            top:"50px",
            left:left
        });

        regPanel.removeClass("hide");
        $("#region-tool i.up.icon").removeClass("hide");
        $("#region-tool i.down.icon").addClass("hide");
        init();
    };

    var hide = function () {
        regPanel.addClass("hide");
        $("#region-tool i.down.icon").removeClass("hide");
        $("#region-tool i.up.icon").addClass("hide");
        $("#alertBox").removeClass("hide");
        setTimeout(function () {
            $("#alertBox").addClass("hide");
        },2000);
    };

    var toggle = function () {
        if(regPanel.hasClass("hide")){
            show();
        }else{
            hide();
        }
    };


    /**
     * 地区钻取
     * @param _region
     */
    var drillAction = function (_region) {
        //_region为行政区划对象
        var code = _region.getCode();
        var name = _region.getName();
        var level = SGIS.Region.recognitionLevel(_region.getCode());
        if(level<6){  //村级别就不往下走了
            useSelRegion = true;
            selRegions.length = 0;

            var isM =  SGIS.Region.isMunicipality(code); //判断是否为直辖市,取区划码前两位来进行判断,返回boolean
            currLevel = SGIS.Region.getNextLevels(code)[0]; //返回一个数组,存放所点击区域之后的等级
            code = SGIS.Region.getPrefixCode(code);

            //此处的code是取过前缀之后的
            if(level == 2 && isM){ //直辖市 需要补充一个是省出来 code.length= 2;
                code +="00##";
            }else if(level==5){  //乡 code.length= 9;
                code += "###"
            }else{
                code+="##"; //国家,省,市,县  code.length= 0,2,4,6;
            }
            code = SGIS.Region.toStandardCode(code);
            selRegions.push(new SGIS.Region(code,name)); //返回一个行政区划对象 selRegions为数组

            events.trigger("region.switch",selRegions); //触发行政区划改变事件
            RegionTree.location(); //定位

            refreshRegionBread(_region);
        }

    };

    /**
     * 钻取时更新区域面包屑
     * @param _region
     */
    var refreshRegionBread = function (_region) {
        var name = _region.getName();
        var code = _region.getCode();

        var endOne = $("#region-tool .breadcrumb a:last");
        var endOne_code = endOne.attr("code");
        if(endOne_code){
           var l1 = SGIS.Region.recognitionLevel(code);
            var l2 = SGIS.Region.recognitionLevel(endOne_code);
            if(l1==l2 && endOne_code.indexOf("##")<0){
                return ;
            }
        }


        var item = "<i class='right chevron icon divider'></i><a class='section' code='"+code+"' name='"+name+"'>"+name+"</a>";
        $("#region-tool .breadcrumb").append(item);

        $("#region-tool .breadcrumb a").unbind("click");
        $("#region-tool .breadcrumb a").click(function () {
            var len = $("#region-tool .breadcrumb a").length;
            if($(this).get(0) == $("#region-tool .breadcrumb a").get(len-1) ){
                return;
            }

            var code = $(this).attr("code");
            var name = $(this).attr("name");
            var _rg = new SGIS.Region(code,name);
            drillAction(_rg);

            $(this).nextAll("i,a").remove();
        });
    }

    /**
     * 更新区域名字
     * @param _name
     */
    var refreshRegionLabel = function (_name,_code) {
        $("#region-tool .breadcrumb").empty();
        var a = "<a class='section' code='"+_code+"' name='"+_name+"'>" + _name +"</a>";
        $("#region-tool .breadcrumb").append(a);


        //移动版
        if(_name.indexOf(",")>1){
          _name = _name.substring(0,_name.indexOf(",")) + "等";
        }

        var ht = " <i class='location arrow icon'></i>" + _name;
        $(".item.loc").html(ht);
    };

    /**
     * 重置区域
     */
    var resetRegion = function () {
        var tempLevel = getRegionLevel();

        currRegions.length = 0;
        for(var i = 0,len = defaultRegions.length;i<len;i++){
            currRegions.push(defaultRegions[i]);
        }
        currLevel = currRegions[0].getLevel();
        refreshRegionLabel(currRegions[0].getName());

        if(tempLevel != currLevel){
            events.trigger("level.switch",currLevel);
        }

    };

    /**
     * 获取当前行政区划级别
     * @returns {number}
     */
    var getRegionLevel = function () {
        var tempR;
        if(useSelRegion){
           tempR = selRegions;
        }else{
            tempR = currRegions;
        }

       var level  = -1;
        for(var i = 0,len = tempR.length;i<len;i++){
            level  = tempR[i].getLevel();
        }
        return level;
    }
    
    //行政区划树子模块 以及其相关操作
    var RegionTree = (function () {
        /**枚举：判断当前显示的行政区划是哪一级别**/
        var REGION_TREE_TYPE = {
            SHALL: 1,        //本级
            PREVIOUS: 2      //上一级
        };

        var tree, _currentTreeID;
        /**记录当前的行政区划数的级别*/
        var _currentRegionTreeType = REGION_TREE_TYPE.SHALL;

        //绑定事件
        (function () {
            //清空，并使用默认值
            $("#regionset-btn-clear").click(function () {
                RegionTree.clear();
            });
            //对已选择的区域，进行‘定位’
            $("#regionset-btn-location").click(function () {
                RegionTree.location();

                //隐藏区域设置面板
                hide();
            });
        })();


        /**
         * 初始化行政区划树
         * @param catalogId
         *          行政区划id
         */
        var init = function () {
            getRootTree(catalogid);
        };


        /**
         * 获取行政区划树根节点
         * @param catalogId
         */
        var getRootTree = function (_catalogId) {
            //分层加载节点（根据父节点ID）
            SGIS.API.get("regionCatalogs/?/rootRegions", _catalogId)
                .data({
                    isNochecked: false
                }).json(function (re) {
                    clear();//清空选中项列表
                    //查询结果建行政区划树
                    tree && tree.destructor();
                    $("#regionset-tree").html("");//先清空（避免追加树）
                    var actions = {

                        onBeforeCheck: function (id, status) {
                            resetRegion();
                            currRegions.length = 0;
                        },

                        //选中表示1，没选中表示0
                        onCheck: function (id, status) {
                            var tempLevel = getRegionLevel();
                            useSelRegion = false;
                            selRegions.length = 0;
                            RUtil.doOnCheck(id, status);//控制节点勾选
                            listRegions();              //列表框显示选中
                            currLevel = getRegionLevel();

                            //需要判断行政区划个数 然后做出级别调整
                            if(currRegions.length==1){
                                var regioncode = currRegions[0].getCode();
                                if(regioncode.indexOf("##")<0){
                                    useSelRegion = true;
                                    tempLevel = getRegionLevel();
                                    selRegions.length = 0;
                                    var level = SGIS.Region.recognitionLevel(regioncode);
                                    if(level<6){  //村级别就不往下走了
                                        var isM =  SGIS.Region.isMunicipality(regioncode)
                                        currLevel = SGIS.Region.getNextLevels(regioncode)[0];
                                        regioncode = SGIS.Region.getPrefixCode(regioncode);

                                        if(level == 2 && isM){
                                            regioncode +="00##";
                                        }else if(level==5){
                                            regioncode += "###"
                                        }else{
                                            regioncode+="##";
                                        }
                                        regioncode = SGIS.Region.toStandardCode(regioncode);
                                    }
                                    selRegions.push(new SGIS.Region(regioncode,name));
                                }
                            }

                            if(tempLevel != currLevel){
                                events.trigger("level.switch",currLevel);
                            }


                            if(selRegions.length==0 && currRegions.length ==0){
                                useSelRegion = true;
                                resetRegion();
                            }

                            if(useSelRegion){
                                events.trigger("region.switch",selRegions);
                            }else{
                                events.trigger("region.switch",currRegions);
                            }



                        }
                    };
                    tree = SGIS.Tree.createCheckableTree("regionset-tree", re, actions, lazyLoad);
                    if (tree != null) {
                        tree.enableThreeStateCheckboxes(false);//取消联动选择，自定义
                    }
                });
        };

        /**打开加载子节点*/
        var lazyLoad = function (obj, id) {
            RUtil.onpenStartTree(obj, id);
        }

        /** 获取当前选择（或默认）行政区划 */
        var getRegions = function () {
            var tempR ;
            if(useSelRegion){
                if(selRegions.length==0){
                    selRegions = defaultRegions;
                }

                tempR = selRegions;
            }else{
                tempR = currRegions;
            }


            var re = [];
            for (var i = 0, size = tempR.length; i < size; i++) {
                var tempRegion = new SGIS.Region(tempR[i].getCode(), tempR[i].getName(), tempR[i].getLevel());
                if (tempRegion.getCode().indexOf("#") != -1) {
                    if (tempRegion.getCode().indexOf("*") != -1)
                        tempRegion.regionLevel = RUtil.getLevel(tempRegion.getCode());
                    if (tree) {
                        var name = tree.getItemText(tree.getParentId(tempRegion.getCode())) + tempRegion.getName().substring(2);
                        tempRegion.regionName = name;
                    }
                }
                re.push(tempRegion);
            }
            return re;
        };
        /**
         *
         * @param selregions 传入的是Region对象
         */
        var setRegions = function (selregions) {
            while (currRegions.length > 0) {
                if (tree) {
                    var code = currRegions[0].getCode();
                    tree.setCheck(code, false);//去掉选择相应行政区划树节点
                }
                currRegions.splice(0, 1);//删除数组元素
            }
            currRegions = selregions;//重新赋值
        };


        var clear_regions = function () {
            currRegions.length = 0;
        };

        /**
         * 区划重置，一般为最大行政区划级别显示
         */
        var reset = function () {
            init();
        };
        /**
         * 切换选中的行政区划中check状态
         * @param visiable
         */
        var linkage = function (visiable) {
            if (!tree)return;
            var idstr = tree.getAllChecked();//已选中
            if (idstr) {
                var ids = idstr.split(",");
                for (var i = 0, len = ids.length; i < len; i++) {
                    tree.setCheck(ids[i], false);//去掉选中
                }
                listRegions();
            }
            if (currRegions && tree) {
                for (var i = 0, size = currRegions.length; i < size; i++) {
                    tree.setCheck(currRegions[i].getCode(), visiable);
                }
            }
        };

        var RUtil = (function () {
            //区划编码获取级别
            var getLevel = function (code) {
                if (code == undefined || !code) {
                    return 0;
                }
                var index = code.lastIndexOf("*");
                if (index != -1) {
                    index += 1;
                    if (index > 0 && index <= 2) {
                        return 2;
                    } else if (index > 2 && index <= 4) {
                        return 3;
                    } else if (index > 4 && index <= 6) {
                        return 4;
                    } else if (index > 6 && index <= 9) {
                        return 5;
                    } else if (index > 9 && index <= 12) {
                        return 6;
                    } else {
                        return 6;
                    }
                }
                else {
                    return SGIS.Region.recognitionLevel(code);
                }
            };
            //获取有效编码
            var getPrefixCode = function (code) {
                //如果是直辖市，则需要将直辖市下面的区县区分对待
                // 11(北京),12（天津）,31（上海），50（重庆）
//                var preStr = code.substring(0, 2);
//                if (preStr == "11" || preStr == "12" || preStr == "31" || preStr == "50") {
//                    return preStr;
//                }
                if (code.indexOf("#") != -1) {
                    return code.substring(0, code.indexOf("#"));
                } else {
                    return SGIS.Region.getPrefixCode(code);
                }
            };

            /**
             * 判断是否还有load节点
             * @param obj
             * @param id
             * @returns {boolean}
             */
            var hasTempNode = function (obj, id) {
                var tempnode = obj.getAllSubItems(id).indexOf("load");
                if (tempnode == 0) {
                    return true;//未加载
                }
            };
            /**
             * 打开添加子节点
             * @param id
             */
            var addTreeNode = function (id) {
                SGIS.API.get("/regionCatalogs/?/leafRegions", catalogid)
                    .data({
                        qhcode: id,
                        isNochecked: false,
                        regionType: ""
                    }).json(function (param) {
                        if (param != null && param != "") {
                            tree.loadXMLString(param);
                            //这里将原本_regions里面有的，但是在Tree上面没有的添加进来。
                            var subItems = tree.getSubItems(id).split(",");//下一层所有子项
                            for (var j = 0, size2 = currRegions.length; j < size2; j++) {
                                for (var i = 0, size = subItems.length; i < size; i++) {
                                    if (subItems[i] == currRegions[j].getCode()) {
                                        tree.setCheck(subItems[i], true);
                                    }
                                }
                            }
                        }
                    });
            };

            /**自定义节点勾选*/
            var doOnCheck = function (id, status) {
                var code, name, level = -1;
                level = SGIS.Region.recognitionLevel(id);
                code = id;

                name = tree.getItemText(id);
                var displayName;
                if (id.indexOf("#") != -1) {
                    var pid = tree.getParentId(id);
                    var parName = tree.getItemText(pid);
                    displayName = parName + name.substring(2);
                } else {
                    displayName = name;
                }
                level = (code.indexOf("#") != -1) ? RUtil.getLevel(code) : level;
                var checkRegion = new SGIS.Region(code, displayName, level);
                //先将子节点都取消选中
                if (status == 1) {
                    var pre_current = "";
                    var pre_checked = RUtil.getPrefixCode(checkRegion.getCode());//区划编码有效前缀
                    if (SGIS.Region.isMunicipality(pre_checked)) {//直辖市（去除市级2位比较）
                        if (pre_checked.length > 4)
                            pre_checked = pre_checked.substr(0, 2) + pre_checked.substr(4, pre_checked.length);
                        else
                            pre_checked = pre_checked.substr(0, 2);
                    }
                    for (var i = 0, len = currRegions.length; i < len; i++) {
                        //判断下级节点中是否有冲突的，然后去掉
                        pre_current = RUtil.getPrefixCode(currRegions[i].getCode());
                        if (SGIS.Region.isMunicipality(pre_current)) {//直辖市（去除市级2位比较）
                            if (pre_current.length > 4)
                                pre_current = pre_current.substr(0, 2) + pre_current.substr(4, pre_current.length);
                            else
                                pre_current = pre_current.substr(0, 2);
                        }
                        if (currRegions[i].getLevel() > checkRegion.getLevel()) {
                            tree.setCheck(currRegions[i].getCode(), false);
                            currRegions.splice(i, 1);
                            i = i - 1;
                            //重新获取len长度
                            len = currRegions.length;
                        }
                        //判断上级节点中是否有冲突的，然后去掉
                        else if (currRegions[i].getLevel() < checkRegion.getLevel()) {
                            tree.setCheck(currRegions[i].getCode(), false);
                            currRegions.splice(i, 1);
                            i = i - 1;
                            //重新获取len长度
                            len = currRegions.length;
                        }
                        //判断平级节点中是否有冲突的，然后去掉
                        else if (currRegions[i].getLevel() == checkRegion.getLevel()) {
                            if (pre_checked.indexOf(pre_current) != -1 || pre_current.indexOf(pre_checked) != -1) {
                                if (checkRegion.getCode().indexOf("#") != -1 || currRegions[i].getCode().indexOf("#") != -1) {
                                    tree.setCheck(currRegions[i].getCode(), false);
                                    currRegions.splice(i, 1);
                                    i = i - 1;
                                    //重新获取len长度
                                    len = currRegions.length;
                                }
                            }
                        }
                    }
                    currRegions.push(checkRegion);
                } else if (status == 0) {
                    for (var i = 0, len = currRegions.length; i < len; i++) {
                        if (checkRegion.getCode() == currRegions[i].getCode()) {
                            currRegions.splice(i, 1);
                            //重新获取len长度
                            len = currRegions.length;
                        }
                    }
                }
            };
            //打开加载子节点
            var onpenStartTree = function (obj, id) {
                if (RUtil.hasTempNode(obj, id)) {//未加载过
                    obj.deleteChildItems(id);//删除子节点
                    RUtil.addTreeNode(id);//查询并加载子节点
                }
            };

            return {
                getLevel: getLevel,
                getPrefixCode: getPrefixCode,
                hasTempNode: hasTempNode,
                addTreeNode: addTreeNode,
                doOnCheck: doOnCheck,
                onpenStartTree: onpenStartTree
            }
        })();

        /**显示选中_regions在列表框*/
        var listRegions = function () {
            $("#regionset-list .hot").empty();
            var names = "";
            for (var i = 0, size = currRegions.length; i < size; i++) {
                var region = currRegions[i], parName = "", displayName;
                if (region.regionCode.indexOf("#") != -1) {
                    var parid = tree.getParentId(region.regionCode);
                    //alert(region.regionCode);
                    parName = tree.getItemText(parid);
                    //alert(parName);
                    displayName = parName + region.regionName.substring(2);
                } else {
                    displayName = region.regionName;
                }
                var one = "<a class='ui label'>" + displayName + "</a>";
                $("#regionset-list .hot").append(one);

                if(i==0){
                   names = displayName;
                }else if(i==1 || i==2){
                    names += "," + displayName;
                }else if(i==3){
                    names += "," + displayName + "等";
                }


            }

            if(names!=""){
                refreshRegionLabel(names);
            }
        };

        /**
         * 区域定位 添加边界图层
         * @param _regions 当前区域
         * @param callback 回调
         */
        var location = function (_regions, callback) {
            if (!_regions) {
                _regions = getRegions();
            }
            //alert(_regions +" "+ currRegions[0].regionCode);
            SpatialQuery.queryRegionFeature(_regions,1, function (feas) {
                if(feas && feas.length>0){
                    feas = SpatialQuery.filterFeatures(_regions,feas);
                    SpatialQuery.renderBoundary(feas,_regions);

                     //添加高亮外围边界
                    if(config.hlboundary){
                        SpatialQuery.queryRegionFeature(_regions,1, function (feas) {
                            if(feas && feas.length>0){
                                //注意此处,函数执行完成后,将会返回34个省市feature
                                feas = SpatialQuery.filterFeatures(_regions,feas);
                                SpatialQuery.renderBoundary(feas,_regions,true);
                            }else{
                                alert("无相关缓存数据");
                            }
                        },true);
                    }
                }else{
                    alert("无相关缓存数据");
                }

                callback&&callback(_regions);
            });

            //if($(".ui.tab.active").attr("data-tab") == "first"){
            //    hotRegionUpdate();
            //}else
            if($(".ui.tab.active").attr("data-tab") == "second"){
                //hotTreeUpdate();

            }
        };

        /**
         * 行政树地区热度修改
         *
         */
        function hotTreeUpdate(){
            var currCodes = new Array();
            currCodes.length = currRegions.length;
            for(var i = 0; i < currRegions.length; i++){
                currCodes[i] = currRegions[i].getCode();
            }

            SGIS.API.post("hotRegion/treeUpdata").data(JSON.stringify(currCodes)).json(function(){});
        }

        /**
         * 行政区域热度修改
         */
        function hotRegionUpdate(area){
            SGIS.API.post("hotRegion/areaUpdata").data(JSON.stringify(area)).json(function (re) {

            });
        }

        /**
         * 初始化获取热度信息
         */
        //function hotRegionInit(config,callback){
        //    SGIS.API.post("hotRegion/areaQuery").json(function(regions){
        //        //数组克隆
        //        config.regionList.slice(0,1)[0].regions = regions.slice();
        //        callback&&callback(config);
        //    });
        //
        //}
        function hotRegionInit(callback){
            SGIS.API.post("hotRegion/areaQuery").json(function(hotRegions){
                callback&&callback(hotRegions);
            }, function (_err) {
                //请求出错
                $('#hotRegionInit').empty();
            });
        }

        /**
         * 清除行政树选中项
         */
        var clear = function () {
            if (tree) {
                for (var i = 0, len = currRegions.length; i < len; i++) {
                    tree.setCheck(currRegions[i].regionCode, false);
                    currRegions.splice(i, 1);//去除
                    i = i - 1;
                    //重新取得长度
                    len = currRegions.length;
                }
                $("#regionset-list .hot").empty();//选中提示清空
                resetRegion();
            }
        };

        return {
            init: init,
            getRegions: getRegions,
            clear: clear,
            reset: reset,
            linkage: linkage,
            listRegions: listRegions,
            setRegions: setRegions,
            location: location,
            RUtil: RUtil,
            clear_regions: clear_regions,
            hotRegionUpdate:hotRegionUpdate,
            hotRegionInit:hotRegionInit
        };
    })();

    /**
     * 行政区划标签控制
     */
    var showLabel = function () {
        var region = RegionTree.getRegions();
        SpatialQuery.queryRegionFeature(region,2, function (feas) {
            //同样道理,执行完成结果为,各个地区的feature
            feas = SpatialQuery.filterFeatures(region,feas);
            SpatialQuery.renderLabelLayer(feas);
        });
    };

    var idenQuery = function(input,level){
        SGIS.API.post("/macro/idenQuery").data({
            input:input,
            level:level
        }).json(function(re){
            return re;
        });
    };

    function getCurrLevel() {
        return currLevel;
    };

    return {
        init: init,
        show: show,
        hide: hide,
        toggle: toggle,
        getRegions:RegionTree.getRegions,
        getRegionCatalogid: function () {
            return catalogid
        },
        getCurrLevel: getCurrLevel,
        getConfig:getConfig,
        showLabel:showLabel

    }
});
