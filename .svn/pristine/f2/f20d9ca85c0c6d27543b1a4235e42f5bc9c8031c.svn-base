/**
 * Created by jinn on 2016/3/4.
 */

$(function () {
    //提交
    $("#btn-submit").click(function () {
        var theme = $("#fm input[name='theme']").val();
        var content = $("#fm textarea[name='content']").val();
        var phone = $("#fm input[name='phone']").val();
        var email = $("#fm input[name='email']").val();

        var ck = checkForm(theme,content,phone,email);

        if(ck&&ck.length>0){
            alert(ck);
            return ;
        }


        var url = getBaseUrl() + "/visdata/" + "tool/feed?theme=" + theme + "&content=" + content+ "&phone=" + phone + "&email=" + email;


        $.get(url, function (re) {
            alert("感谢您的意见");

            $("#fm input[name='theme']").val("");
            $("#fm textarea[name='content']").val("");
        });

        //
        //var data = {
        //    theme:theme,
        //    content:content,
        //    phone:phone,
        //    email:email
        //};
        //$.ajax({
        //    url:url,
        //    method:"post",
        //    data:JSON.stringify(data),
        //    contentType:"application/json"
        //}).done(function (re) {
        //    alert("感谢您的意见");
        //});

    });
});


var checkForm = function (theme,content,phone,email) {
    if(content==""){
        return "请填写内容";
    }

    if(phone=="" && email == ""){
        return "请填写一个您的联系方式";
    }

    var ckphone = /^\d+$/;
    var ckemail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    if(phone!=""){

       if(!ckphone.test(phone)){
          return "请填写正确的电话号码";
       }


    }

    if(email!=""){
        if(!ckemail.test(email)){
            return "请填写正确的邮箱";
        }

    }

    return "";

};


var  getBaseUrl =  function () {
    var loc = window.location;
    if (loc.origin) {
        return loc.origin;
    }
    return loc.protocol + "//" + loc.host;
};