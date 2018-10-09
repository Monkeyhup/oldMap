package com.supermap.sgis.visual.api;

import com.supermap.sgis.visual.data.OpStatus;
import com.supermap.sgis.visual.entity.TUsers;
import com.supermap.sgis.visual.service.MacroUserService;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
//import java.util.Base64;
import java.util.Date;

/**
 * Created by chenpeng on 15/11/28.
 */
@Controller
public class MacroUserController extends BaseController {

    @Autowired
    MacroUserService macroUserService;

    /**
     * url="http://localhost:8080/visdata/register/"
     * 用户注册功能
     * */
    @RequestMapping(value = "/register/username/{username}/password/{password}",method = RequestMethod.GET)
    @ResponseBody
    public OpStatus UserRegister(HttpServletRequest request,@PathVariable String username,@PathVariable String password){
        HttpSession session  = request.getSession();
        OpStatus result = null;
        TUsers user = macroUserService.registerUser(username, password);
        if (user != null){
            setSessionUser(request,user);
            result =new OpStatus(true,"注册成功","null");
        }else{
            result =new OpStatus(false,"The user name has been registered","null");
        }
        return result;

    }

    /**
     * 用户登录功能
     * */
    @RequestMapping(value = "/login/username/{username}/password/{password}",method = RequestMethod.GET)
    @ResponseBody
    public OpStatus UserLogin(HttpServletRequest request, @PathVariable String username,@PathVariable String password){
        HttpSession session  = request.getSession();
        OpStatus result = null;
        TUsers user = macroUserService.loginUser(username,password);
        if (user != null){
            setSessionUser(request,user);
            result =new OpStatus(true,"登录成功","null");
        }else{
            result =new OpStatus(false,"User name or password error","null");
        }
        return result;
    }

    /**
     * 判断是否登录
     * */
    @RequestMapping(value = "/check",method = RequestMethod.GET)
    @ResponseBody
    public OpStatus CheckLogin(HttpServletRequest request){
        OpStatus result = null;
        if (getSessionUser(request)!=null){
            result=new OpStatus(true,"已经登录","null");
        }else{
            result=new OpStatus(false,"没登录","null");
        }
        return result;
    }

    /**
     * 用户注销
     * */
    @RequestMapping(value = "/logout",method = RequestMethod.GET)
    @ResponseBody
    public OpStatus logout(HttpServletRequest request){
        OpStatus result = null;
        removeSessionUser(request);
        result=new OpStatus(false,"注销完成","null");
        return result;
    }

    /**
     * 下载Excel文件
     * */
    @RequestMapping(value = "/excel/export",method = RequestMethod.POST)
    @ResponseBody
    public OpStatus Export(@RequestBody String content,HttpServletResponse response) throws  Exception{
        response.setCharacterEncoding("UTF-8");
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        HSSFWorkbook wb = macroUserService.ExportService(java.net.URLDecoder.decode(content,"UTF-8").split("=")[1].split(";")[0].split(","),java.net.URLDecoder.decode(content,"UTF-8").split("=")[1].split(";")[1].split(","));
        response.setContentType("application/vnd.ms-excel");
        response.setHeader("Content-disposition", "attachment;filename="+dateFormat.format(new Date())+".xls");
        OutputStream outputStream = response.getOutputStream();
        wb.write(outputStream);
        outputStream.flush();
        outputStream.close();
        return new OpStatus(true,"下载完成",null);
    }
}
