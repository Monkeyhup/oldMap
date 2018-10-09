/**
 * Created by chenpeng on 15/12/10.
 */
define(function (require, exports, module){
    var userOperate = $("#user-operate");

    var init = function () {
        $("#user-operate").Drag();

    };

    (function () {
        init();
    })();


    $(function () {
        $("#register").click(function(){
            userOperate.removeClass("hide");
            $("#log-form").addClass("hide");
            $("#opr-title").text("用户注册");
            userOperate.find(".item.close").click(function () {
                userOperate.addClass("hide");
                $("#log-form").removeClass("hide");
            });
        });

        $("#login").click(function(){
            userOperate.removeClass("hide");
            $("#reg-form").addClass("hide");
            $("#opr-title").text("用户登录");
            userOperate.find(".item.close").click(function () {
                userOperate.addClass("hide");
                $("#reg-form").removeClass("hide");
            });
        });

        $("#manager").click(function(){
            window.location.href=SGIS.Util.getBaseUrl()+"/visual/manager.html";
        });

        $("#logout").click(function(){
            var url = "logout";
            SGIS.API.get(url).json(function (re) {
                $("#manager").hide();
                $("#register").show();
                $("#login").show();
                $("#btn-down").hide();
                alert(re.msg);
            });
        });

        $("#btn-reg").click(function () {
            register();
        })

        $("#btn-log").click(function () {
            login();
        })
    });


    var register = function () {
        var username = $("#reg-user").val();
        var password = $("#reg-pwd").val();
        var url = "register/username/"+username+"/password/"+password;

        SGIS.API.get(url).json(function (re) {
            if(re.status){
                userOperate.addClass("hide");
                $("#log-form").removeClass("hide");
                alert(re.msg);
                $("#manager").show();
                $("#register").hide();
                $("#login").hide();
                $("#btn-down").show();
                $("#reg-user").val("");
                $("#reg-pwd").val("");
            }else{
                $("#reg-user").val("");
                $("#reg-pwd").val("");
                alert(re.msg);
            }
        });
    }

    var login = function(){
        var username = $("#log-user").val();
        var password = $("#log-pwd").val();
        var url = "login/username/"+username+"/password/"+password;
        SGIS.API.get(url).json(function (re) {
            if(re.status){
                userOperate.addClass("hide");
                $("#reg-form").removeClass("hide");
                alert(re.msg);
                $("#manager").show();
                $("#register").hide();
                $("#login").hide();
                $("#btn-down").show();
                $("#log-user").val("");
                $("#log-pwd").val("");
            }else{
                $("#log-user").val("");
                $("#log-pwd").val("");
                alert(re.msg);
            }
        });
    }

    return{
        init:init
    }


});