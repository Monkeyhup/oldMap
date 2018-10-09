package com.supermap.sgis.visual.tool;

/**
 * Created by jinn on 2015/6/18.
 */


/**
 * 消息打印工具类
 */
public class MessagePrint {

    /**
     * 消息打印配置
     */
    private static String msgLevel = AppConfig.Config.get("printmsg");

    /**
     * 消息打印
     * @param msg 消息
     * @param type 消息类型
     */
    public static void print(String msg,String type){
        if(msgLevel!=null && !msgLevel.isEmpty() && !msgLevel.equals("0")){

            if(msgLevel.equals("1")){
                System.out.println("MessagePrint输出：" + msg);
            }else{
               String[] msgArr = msgLevel.split(",");
               for(int i =0,len = msgArr.length;i<len;i++){
                   String le = msgArr[i];
                   if(le.equals(type)){
                       System.out.println("MessagePrint输出：" + msg);
                       break;
                   }
               }
            }
        }
    }
}
