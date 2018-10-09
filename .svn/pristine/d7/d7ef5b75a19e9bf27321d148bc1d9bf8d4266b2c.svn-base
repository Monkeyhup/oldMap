package com.supermap.sgis.thirdparty.data;

import com.supermap.sgis.visual.service.BaseService;
import com.supermap.sgis.visual.tool.AppConfig;
import com.supermap.sgis.visual.tool.MessagePrint;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;


/**
 * Created by jinn on 2015/11/30.
 */


public class InvokeReq{

    private String reportUrl = AppConfig.Config.get("API.report");
    private String dimension = AppConfig.Config.get("API.dimension");
    private String idenUrl = AppConfig.Config.get("API.iden");
    private String regionUrl = AppConfig.Config.get("API.region");
    private String dataUrl = AppConfig.Config.get("API.data");


    public String getJsonData(String url,String args){
        url = url + "?" + args;

        MessagePrint.print("请求地址：" + url ,"info");

        return this.getData(url);
    }

    public String getJson(String args,int CApiType){
        String url = "";
        switch (CApiType){
            case 1:
//                url = this.reportUrl.replaceAll("args",args);
                url = this.reportUrl + args;
                break;
            case 2:
//                url = this.dimension.replaceAll("args",args);
                url = this.dimension + args;
                break;
            case 3:
                url = this.idenUrl + args;
//                url = this.idenUrl.replaceAll("args",args);
                break;
            case 4:
                url = this.regionUrl + args;
//              url = this.regionUrl.replaceAll("args",args);
                break;
            case 5:
                url = this.dataUrl + args;
//              url = this.dataUrl.replaceAll("args",args);
                break;
            default:
                System.out.println("api类型参数错误");
        }

        MessagePrint.print("请求地址：" + url ,"info");

        String dataStr = this.getData(url);


        return dataStr;
    }


    /**
     * 获取远程数据
     * @param url
     * @return
     */
    private String getData(String url){
        StringBuffer stringBuffer = new StringBuffer();
        try {
            URL Url = new URL(url);
            HttpURLConnection connection = (HttpURLConnection)Url.openConnection();
            InputStream in = connection.getInputStream();
            byte[] buffer = new byte[1024];
            int count = 0;
            while ((count = in.read(buffer)) > 0){
                String str = new String(buffer,0,count,"utf-8");
                stringBuffer.append(str);
            }
            in.close();
            connection.disconnect();
        }catch (IOException io){
            io.printStackTrace();
        }catch (Exception e){
            e.printStackTrace();
        }
        return stringBuffer.toString();
    }

}
