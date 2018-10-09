/**
 * Created by W.Qiong on 14-8-25.
 * 文件上传控件
 */
define(function(require, exports ,module){

    /**
     * 初始化文件控件
     * @param container
     * @param targetIframe
     * @param onload
     * @param supportFormat
     * @constructor
     */
    var File = function(container,callback,supportFormat){
        this.file  = $("#"+container);
        this.onload = callback||null;//回调函数
        this.format = supportFormat||"xls,xlsx";

        this.iframe = "" ;
        this._uploadFileName = "";

        /**
         * 初始化 事件绑定等
         */
        this.init =function(){
            var that = this ;
            var form = that.file.parentsUntil("form").parent();
            that.iframe = form.attr("target");
            that.file.change(function(){
                if(!that.check()){
                    alert("文件格式错误,请选择"+supportFormat);
                    return ;
                }
                that.upload() ;
            });

        }
        this.init();
    };

    File.prototype ={

        /**
         * 上传文件
         */
        upload:function(){
            var that = this ;
            var form = that.file.parentsUntil("form").parent();
            /**调用文件上传，对上传文件属性解析并JSON回调*/
            form.attr("action",SGIS.API.getURL("common/upload"));
            SGIS.UI.addLoadingBar0("正在上传,请稍候...");
            form.submit();
            //没有清除掉
            var clear = function(){
                SGIS.UI.clearLoadingBar0();
            };
            //注册上传结束事件
            $("#"+that.iframe).one("load", function(){
                clear&&clear();
                var c = $(this).contents().find("body");//上传返回内容
                var re = $.trim(c.text());
                if (re){
                    re = eval("("+re+")");//转JSON对象
                    that._uploadFileName  = re.fileName;//上传文件名
                    that.onload&&that.onload(re);//回调函数
                }
                c.empty();
            });
        },
        /**
         * 检验文件格式是否正确
         */
        check:function(){
            var path = this.file.val();
            if(!path){
               return false ;
            }
            var info = getFileInfo(path);
            var extendName =info.extendName.toUpperCase();
            var split = this.format.split(",");
            for(var i = 0;  i < split.length ; i++){
                if(extendName == split[i].toUpperCase()){
                    return true ;
                }
            }

            function getFileInfo(path){
                if(!path){
                    return null ;
                }
                var extendName =path.substring( path.lastIndexOf(".")+1);
                var fileName = path.substring(path.lastIndexOf("\\")+1) ;
                var json ={
                    extendName:extendName,
                    fileName :fileName
                };
                return json ;
            };

        },
        /**
         * 获取上传后的文件名 用户后续的数据导入
         */
        getFileName:function(){
            return this._uploadFileName ;
        }
    };

    Object.defineProperty(File.prototype,"constructor",{
        enumerable:false,
        constructor:File
    });

    return File ;

})
