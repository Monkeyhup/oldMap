package com.supermap.sgis.visual.data;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 操作状态（API返回的操作状态的统一结果）
 *
 * @author Created by W.Hao on 14-1-21.
 */
public class OpStatus {

    /**
     * 操作状态，默认为true
     */
    boolean status = true;

    /**
     * 操作信息，默认为“操作成功”
     */
    String msg = "操作成功";

    /**
     * 操作重定向url，默认为null
     */
    String redirect = null;

    /**
     * 无参构造函数
     */
    public OpStatus() {

    }

    /**
     * 构造函数
     * @param status
     * 			操作状态
     * @param msg
     * 			操作信息
     * @param redirect
     * 			操作重定向url
     */
    public OpStatus(boolean status, String msg, String redirect) {
        this.status = status;
        this.msg = msg;
        this.redirect = redirect;
    }

    /**
     * 取得操作状态
     * @return	操作状态
     */
    public boolean isStatus() {
        return status;
    }

    /**
     * 设置操作状态
     * @param status
     * 			操作状态
     * @return 当前操作对象
     */
    public OpStatus setStatus(boolean status) {
        this.status = status;
        return this;
    }

    /**
     * 获取操作信息
     *
     * @return 操作信息
     */
    public String getMsg() {
        return msg;
    }

    /**
     * 设置操作信息
     * @param msg
     * 			操作信息
     * @return 当前操作对象
     */
    public OpStatus setMsg(String msg) {
        this.msg = msg;
        return this;
    }

    /**
     * 取得重定向url
     * @return 重定向url
     */
    public String getRedirect() {
        return redirect;
    }

    /**
     * 设置重定向url
     * @param redirect
     * 			重定向url
     * @return 当前操作对象
     */
    public OpStatus setRedirect(String redirect) {
        this.redirect = redirect;
        return this;
    }

    /**
     * 处理为JSON对象
     *
     * @return json字符串，失败则返回null
     */
    @Override
    public String toString() {
        ObjectMapper mapper = new ObjectMapper();  //jackson框架内容
        String re = null;
        try {
            re = mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return re;
    }
}