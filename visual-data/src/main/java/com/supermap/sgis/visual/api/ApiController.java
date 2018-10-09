package com.supermap.sgis.visual.api;

import com.supermap.sgis.thirdparty.data.InvokeReq;
import com.supermap.sgis.visual.entity.TFeedBack;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by jinn on 2015/11/30.
 */
@Controller
@RequestMapping(value = {"/api/","/service/api/"})
public class ApiController extends BaseController {



    @RequestMapping(value = "{apitype}/json" ,method = RequestMethod.GET)
    @ResponseBody
    public String getJsonStr(String dbcode,String wdcode,String code,@PathVariable int apitype){
         String args = "\"dbcode\":\""+dbcode+"\",\"wdcode\":\""+wdcode+"\",\"code\":\""+code+"\"";
         InvokeReq invokeReq = new InvokeReq();
         return invokeReq.getJson(args,apitype);
    }

    @RequestMapping(value = "{apitype}/data" ,method = RequestMethod.GET)
    @ResponseBody
    public String getJsonData(String args,@PathVariable int apitype){
        InvokeReq invokeReq = new InvokeReq();
        return invokeReq.getJson(args,apitype);
    }





}
