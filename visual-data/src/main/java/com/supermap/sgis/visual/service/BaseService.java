package com.supermap.sgis.visual.service;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.security.MessageDigest;

/**
 * Created by jinn on 2015/6/18.
 */
public class BaseService {
    /**
     * 从一个对象填充属性到另一个对象 可设置排除属性 兼容非同类型
     *
     * @param from
     * @param to
     * @param args
     * @return
     */
    public Object convertBeanTOBean(Object from, Object to, Object... args) {
        if(null == from || to == from){
            return to ;
        }
        try {
            //同一个类型对象
            if(from.getClass().equals(to.getClass())){
                BeanInfo beanInfo = Introspector.getBeanInfo(to.getClass());
                PropertyDescriptor[] ps = beanInfo.getPropertyDescriptors();
                for (PropertyDescriptor p : ps) {
                    Method getMethod = p.getReadMethod();
                    Method setMethod = p.getWriteMethod();
                    Class<?> retureType = getMethod.getReturnType();
                    String type = retureType.getSimpleName() ;
                    if(type.equalsIgnoreCase("Set")
                            ||type.equalsIgnoreCase("Class")){
                        continue;
                    }
                    String field = getMethod.getName().substring("get".length()).toLowerCase();
                    boolean flag = false;
                    if(null!=args){
                        for (int index = 0, size = args.length; index < size; index++) {
                            if (args[index].equals(field)) {
                                flag = true;
                                break;
                            }
                        }
                    }
                    if (flag||getMethod == null || setMethod == null) {
                        continue;
                    }
                    try {
                        Object result = getMethod.invoke(from);
                        if (result != null) {
                            setMethod.invoke(to, result);
                        }
                    } catch (Exception e) {
                        continue;
                    }
                }
            }else{
                //非同一类型 根据字段名称进行填充
                BeanInfo toBeanInfo = Introspector.getBeanInfo(to.getClass());
                PropertyDescriptor[] tops = toBeanInfo.getPropertyDescriptors();

                BeanInfo fromBeanInfo = Introspector.getBeanInfo(from.getClass());
                PropertyDescriptor[] fromps = fromBeanInfo.getPropertyDescriptors();

                for (PropertyDescriptor p : tops) {
                    Method getMethod = p.getReadMethod();
                    Method setMethod = p.getWriteMethod() ;
                    String field = getMethod.getName().substring("get".length()).toLowerCase();
                    boolean flag = false;
                    if(null!=args){
                        for (int index = 0, size = args.length; index < size; index++) {
                            if (args[index].equals(field)) {
                                flag = true;
                                break;
                            }
                        }
                    }
                    if (flag||null == getMethod) {
                        continue;
                    }
                    Object value = null;
                    for(PropertyDescriptor p1:fromps){
                        Method getMethod1 = p1.getReadMethod();
                        if(getMethod1.getName().equals(getMethod.getName())){
                            value = getMethod1.invoke(from);
                            break;
                        }
                    }
                    if(null == value){
                        continue;
                    }
                    try {
                        setMethod.invoke(to, value);
                    } catch (Exception e) {
                        continue;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return to;
    }

    /**
     * md5编码
     * @param str
     * @return
     */
    public String md5Encode(String str){
        MessageDigest md5 = null;
        try {
            md5 = MessageDigest.getInstance("MD5");
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
        char[] charArray = str.toCharArray();
        byte[] byteArray = new byte[charArray.length];

        for (int i = 0; i < charArray.length; i++)
            byteArray[i] = (byte) charArray[i];

        byte[] md5Bytes = md5.digest(byteArray);

        StringBuffer hexValue = new StringBuffer();

        for (int i = 0; i < md5Bytes.length; i++) {
            int val = ((int) md5Bytes[i]) & 0xff;
            if (val < 16)
                hexValue.append("0");
            hexValue.append(Integer.toHexString(val));
        }

        return hexValue.toString();
    }


}
