package com.supermap.sgis.visual.data;

/**
 * Created by jinn on 2016/1/27.
 */
public class ReData {
    private boolean statue = true;
    private int code = 0;
    private String msg = "";
    private String redirect;
    private Object data;

    public ReData() {
    }

    public ReData(boolean statue, int code, String msg, String redirect, Object data) {
        this.statue = statue;
        this.code = code;
        this.msg = msg;
        this.redirect = redirect;
        this.data = data;
    }

    public boolean isStatue() {
        return statue;
    }

    public void setStatue(boolean statue) {
        this.statue = statue;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getRedirect() {
        return redirect;
    }

    public void setRedirect(String redirect) {
        this.redirect = redirect;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    @Override
    public String toString(){

        return "";
    }
}
