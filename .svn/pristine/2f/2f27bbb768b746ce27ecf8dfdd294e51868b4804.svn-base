package com.supermap.sgis.visual.api;

import com.supermap.sgis.visual.entity.TFeedBack;
import com.supermap.sgis.visual.service.FeedBackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Created by jinn on 2015/12/16.
 */
@Controller
@RequestMapping(value = {"/tool/","/service/tool/"})
public class Tools extends BaseController {
     @Autowired
     FeedBackService feedBackService;

     @RequestMapping(value = "down/js/{filename}",method = RequestMethod.POST)
     public void downJsFile(HttpServletRequest request, HttpServletResponse response, @PathVariable String filename, String body){
         body = "var " + filename + "=" + body;
         try {
             OutputStream out = response.getOutputStream();
             byte[] bytes = body.getBytes();
             out.write(bytes);

             response.setHeader("Content-Disposition", "attachment;filename="
                     +new String(filename.getBytes("utf-8"),"ISO-8859-1")+".js");
             response.setContentType("application/octet-stream");

             out.flush();
             out.close();
         } catch (IOException e) {
             e.printStackTrace();
         }
     }


    @RequestMapping(value = "feed" ,method = RequestMethod.POST)
    public Boolean feed(@RequestBody TFeedBack entity){
//        String theme = "fa";
//        String content = "asdf";
//        String phone = "110";
//        String email = "asdf";

//        TFeedBack entity = new TFeedBack();
//        entity.setTheme(theme);
//        entity.setContent(content);
//        entity.setPhone(phone);
//        entity.setEmail(email);
        feedBackService.save(entity);
        return true;
    }

    @RequestMapping(value = "feed" ,method = RequestMethod.GET)
    @ResponseBody
    public Boolean feed2(HttpServletRequest request, String theme,String content,String phone,String email){

        String ip =  request.getRemoteAddr();

        TFeedBack entity = new TFeedBack();
        entity.setTheme(theme);
        entity.setContent(content);
        entity.setPhone(phone);
        entity.setEmail(email);
        entity.setIp(ip);


        feedBackService.save(entity);
        return true;
    }




}
