/**
 * 面板管理，统一管理页面中的浮动面板，提供以下功能：
 * 打开、关闭面板操作
 * 注入Esc关闭操作
 * 独占模式or多窗口模式
 *
 * 控件如果需要动画效果，需要在其上加上Class：ui hidden transition，默认隐藏
 */
define(function (require, exports, module) {

    var pannels = new SGIS.Util.Hashtable();

    var semanticHideClass = "hidden transition";
    var hideClass = "hide";

    //绑定外部检测事件，如果在Pannel外部click了，那么就关闭
    var eventOn = function(id){
        var pannel = pannels.items(id);
        $('body').on('click', function(e){
            if (!jQuery.contains(pannel.$container.get(0), e.target)){
                pannel.hide();//面板外点击隐藏
            }
        });
    }

    //关闭body上的click可能会造成一些影响，比如绑定在body上的其他事件
    var eventOff = function(id){
    	$('body').off('click');
    }

    /**
     * 使用jQuery对象初始化一个Pannel面板，这个面板是写在页面中的
     * @param container
     * @param options exclusive：是否独占(默认为TRUE)
     * @constructor
     */
    var Pannel = function(container, options){
    	this.id = container.get(0).id;
        this.$container = container;
        this.options = jQuery.extend({
            exclusive: true,
            animation: 'fade down',
            duration: '500ms',
            bodyclick:false,
            onHide: $.noop,
            onShow: $.noop
        }, options || {});

        this._showing = false;
        this._hideClass = container.hasClass(hideClass);
        this._sHideClass = container.hasClass(semanticHideClass);

        var that = this;
        //ESC
        //see http://unixpapa.com/js/key.html
        this.$container.keydown(function(e){
        	if (e.keyCode == 27){
                that.hide();
        	}
        });

        pannels.add(this.id, this);
    }

    Pannel.prototype.show = function(){
        var that = this;
        //独占窗口控制
        if (this.options.exclusive){
            pannels.each(function(o){
                o.id != that.id && o.hide();
            });

            if(that.options.bodyclick){

            } else{
                //由于部分的窗口show操作是由点击某按钮触发的，所以我们需要将第一个click事件给忽略过去
                setTimeout(function(){
                    eventOn(that.id);
                }, 100);
            }
        }
        if (this._hideClass)
            this.$container.removeClass(hideClass);
        else if (this._sHideClass && !this.$container.transition('is visible'))
            this.$container.transition(this.options.animation, this.options.duration);
//        else
//            this.$container.show();
        this._showing = true;
        this.options.onShow();
    }
    
    Pannel.prototype.hide = function(){
        if (this._hideClass)
            this.$container.addClass(hideClass);
        else if (this._sHideClass && this.$container.transition('is visible'))
            this.$container.transition(this.options.animation, this.options.duration);
//        else
//            this.$container.hide();
        this._showing = false;
        if (this.options.exclusive){
            eventOff(this.id);
        }
        this.options.onHide();
    };
    
    Pannel.prototype.toggle = function(){
        this._showing ? this.hide() : this.show();
    };

    //静态方法们

    /**
     * 隐藏全部面板
     */
    Pannel.hideAll = function(){
        pannels.each(function(o){
            o.hide();
        });
    }

    return Pannel;
});