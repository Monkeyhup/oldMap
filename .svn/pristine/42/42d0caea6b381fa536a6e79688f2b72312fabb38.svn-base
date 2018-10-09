/**
 * 提供面包屑样式的导航栏
 * Created by W.Hao on 2014/6/26.
 */
define(function (require, exports, module) {

    /**
     * 面包屑样式导航栏
     * 只负责样式和面包屑点击事件，其余数据应该在外部存储
     * @param $container 所属父元素
     * @param onClick 点击目录回调
     * @param homeId  最上层目录ID
     * @param options 操作配置项
     * @constructor
     */
    var Bread = function($container, onClick, homeId, options){
    	this.$bread = $container;
        this.click = onClick;
        this.homeid = homeId || "";
        this.options = $.extend({
            homeName: "首页",
            homeIcon: "home",
            maxNum: 4,
            defaultTpl: '<div class="divider"> / </div> <a class="section" data-value="{{id}}"><span>{{name}}</span></a>'
        }, options || {});

        this.tpl = SGIS.Util.template(this.options.defaultTpl);
        this._list = [];//存放当前目录ids
    }

    Bread.prototype.init = function(){
        this.reset();
        //代理事件
        var that = this;
        //目录项点击事件
        this.$bread.delegate("a", "click", function(){
        	var id = $(this).attr("data-value");//目录或表ID
            //切换选择目录项
            that.$bread.find("a").removeClass('active');
            $(this).addClass('active');
            $(this).nextAll('div,a').remove();
            var len = $.inArray(id, that._list);
            //处理home时，length = 1
            that._list.length = len > 0 ? len : 1;
            that.click(id);
        })
    }

    //追加一个层级目录
    Bread.prototype.push = function(id, name){
        //TODO 处理超过max个数的显示
        if ($.inArray(id, this._list) == -1){
            this._list.push(id);
            this.$bread.append(this.tpl({
                id: id,
                name: name
            }));
            this.$bread.find('a').removeClass('active').last().addClass('active');
        }
    }

    //返回上一级
    Bread.prototype.pop = function(){
        //home处理
        if (this._list.length == 1){
            return this.homeid;
        }
        this._list.pop();
        this.$bread.find("a:last,div:last").remove();
        var pop = this.$bread.find('a:last').addClass('active').attr("data-value");
        this.click(pop);
        return pop;
    }

    //重置为home显示 并且清空缓存
    Bread.prototype.reset = function(){
        this._list = [this.homeid];//设置首页ID
        //初始化首页
        this.$bread.empty().hide().append(this.tpl({
            id: this.homeid,
            name: this.options.homeName
        }));
        this.$bread.find('div').remove();
        this.$bread.find("a").prepend('<i class="icon"></i>');//前加
        this.$bread.find("i").addClass(this.options.homeIcon);
        this.$bread.show();
    }

    //返回主页，并触发homeclick事件
    Bread.prototype.home = function(){
    	this.reset();
        this.click(this.homeid);
        return this.homeid;
    }

    return Bread;
});