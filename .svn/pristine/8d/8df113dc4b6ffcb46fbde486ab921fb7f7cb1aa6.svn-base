package com.supermap.sgis.visual.tool;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Properties;
import java.util.Set;

/**
 * Created by jinn on 2015/6/18.
 */

/**
 * 系统配置信息
 */
public class AppConfig {
        public static final HashMap<String, String> Config ;
        static{
            Properties op = new Properties();
            try {
                InputStream in = AppConfig.class.getClassLoader().getResourceAsStream("app.properties");
                op = new Properties();
                op.load(in);
                if (in != null)
                    in.close();
            } catch (IOException e) {
                System.out.println("读取系统配置文件【app.properties】失败！");
            }
            Config = new HashMap<String, String>();
            Set set = op.keySet();
            Iterator iterator = set.iterator();
            while (iterator.hasNext()){
                String key =(String)iterator.next();
                String value = op.getProperty(key);
                Config.put(key,value);
            }
        }
}
