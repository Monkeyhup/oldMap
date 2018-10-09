/**
 * Created by Augustine on 8/13/2014.
 */
define(function(require,exports,module){

    /**
     * 初始化一个空的模态对话框
     * @param id
     * @param title
     * @constructor
     */
    var Modal = function(id,title,settings){
        this.id = id;
        this.title = title;

        var  basic={
            "bodyClass":"mbody",
            "footClass":"mfooter",
            "fade":true,
            "size":"md"
        };
        this.settings = settings?$.extend(true,{},basic,settings):basic;


        this.init =function(){
            var that = this ;
            var settings = that.settings ;
            var structrue =                                  // fade
                "<div class='modal' id='{{id}}' tabindex='-1' role='dialog'  aria-hidden='true'>" +
                    "    <div class='modal-dialog'>  " +       // modal-lg  modal-sm
                    "        <div class='modal-content' tabindex='0'>  " +    // 加上tabindex 让其相应键盘事件
                    "            <div class='modal-header'>  " +
                    "                <button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button> " +
                    "                <h4 class='modal-title'>{{title}}</h4> " +
                    "            </div>" +
                    "            <div class='modal-body'>  " +
                    "            </div> " +
                    "            <div class='modal-footer'>  " +
                    "            </div>   " +
                    "        </div> " +
                    "    </div>  " +
                    "</div>";

            //统一配置是否关闭选项
            var openGroupMd = ' <div class="form-group">'+
                '<label class="col-sm-4 control-label"></label>'+
                '<div class="checkbox hodew col-sm-8" >'+
                '<label><input class="isopen"  type="checkbox"> 保持窗口打开</label></div></div>';

            var openGroupSm = ' <div class="form-group">'+
                '<label class="control-label"></label>'+
                '<div class="checkbox hodew" >'+
                '<label><input class="isopen"  type="checkbox"> 保持窗口打开</label></div></div>';

            var process = SGIS.Util.template(structrue);
            var obj = {id:that.id,title:that.title};

            var bodyHtml = $("#"+id+" ."+settings.bodyClass).html();
            var footHtml = $("#"+id+" ."+settings.footClass).html();

            $("#"+that.id).remove();
            $("body").append(process(obj));

            var mbody = $("#" + id + " .modal-body");
            var mfooter = $("#" + id + " .modal-footer");
            mbody.html(bodyHtml);
            mfooter.html(footHtml);
            //创建相关的窗口 提供 是否是否保留窗口打开
            if(id.toLowerCase().indexOf("new")!=-1
                ||id.toLowerCase().indexOf("add")!=-1
                ||id.toLowerCase().indexOf("create")!=-1){
                var isMutiRow =  $("#"+that.id).find("form").hasClass("form-two");
//                var size = that.settings.size ;
                if(!isMutiRow){
                    $(openGroupSm).appendTo(mbody.find("form"));
                }else{
                    $(openGroupMd).appendTo(mbody.find("form"));
                }
            }

            that.setting(settings.size,settings.fade);
        }
        this.init() ;

    };

    /**
     * 模态对话框实体部分
     */
    Modal.prototype.setMbody = function(arg){
        $("#"+this.id).find(".modal-body").append(arg);
    } ;

    /**
     * 模态框底部
     */
    Modal.prototype.setMfooter = function(arg){
        $("#"+this.id).find(".modal-footer").append(arg);
    };

    /**
     *
     * @param size  modal-lg  modal-sm sm  md  lg
     * @param fade  true  false
     */
    Modal.prototype.setting = function(size,fade){

        var modal = $("#"+this.id) ;
        if(fade){
            modal.addClass("fade");
        }

        if(size && size!=null){
            switch (size){
                case "sm":
                    modal.children().eq(0).addClass("modal-sm");
                    break;
                case "md":
                    break;
                case "lg":
                    modal.children().eq(0).addClass("modal-lg");
                    break;
            }
        }
    };

    /**
     * 将模态框绑定到按钮
     * id
     */
    Modal.prototype.active = function(btn){
        $("#"+btn).attr("data-toggle","modal");
        $("#"+btn).attr("data-target","#"+this.id);
    };

    Modal.prototype.show =function(){
        $("#"+this.id).modal("show");
    };

    Modal.prototype.hide =function(){
        var  checkbox = this.find("input.isopen[type=checkbox]") ;
        if(checkbox!=null&&checkbox.length>0&&checkbox[0].checked){
            return ;
        }
        $("#"+this.id).modal("hide");
    };

    //支持类选择器操作元素
    Modal.prototype.find = function(selector){
        return $("#"+this.id).find(selector);
    };

    Modal.prototype.dispose =function(){
        $("#"+this.id).remove();
    };

    Modal.prototype.setTitle =function(title){
        var $title = $("#"+this.id).find("h4") ;
        if($title!=null && $title.length>0){
            $title.text(title);
        }
    };

    return  Modal;

});