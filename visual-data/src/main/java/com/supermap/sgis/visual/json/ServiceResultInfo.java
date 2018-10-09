package com.supermap.sgis.visual.json;

import java.util.ArrayList;
import java.util.List;

/**
 * service层结果集 包括操作状态 操详细信息 操作对象（用于权限控制）
 *
 * @author Created by W.Qiong on 14-11-28.
 *
 * @author Modified by Linhao on 15-02-09
 */
public class ServiceResultInfo {
    /** 返回的详细结果信息的级别,1级(简单只输出成功与否) */
    public static final int RESULT_INFO_LEVEL_ONE = 1;

    /** 返回的详细结果信息的级别,2级(输出错误详细信息) */
    public static final int RESULT_INFO_LEVEL_TWO = 2;

    /** 返回的详细结果信息的级别,3级(输出完整信息包括成功多少失败多少) */
    public static final int RESULT_INFO_LEVEL_THREE = 3;

    /** 返回的结果状态，默认为false */
    public boolean status = false;

    /** 成功的个数，默认为0 */
    public int success = 0;

    /** 失败的个数，默认为0 */
    public int error = 0;

    /** 操作失败信息列表 */
    public List<String> errorInfos = new ArrayList<>();

    /** 操作成功结果列表 */
    public List<Object> successObjs = new ArrayList<>();

    /** 其他信息列表 */
    public List<Object> otherObjs = new ArrayList<>();

    /**
     * 是否操作成功
     *
     * @return 是否操作成功
     */
    public boolean isStatus() {
        return status;
    }

    /**
     * 设置是否操作成功
     *
     * @param status
     *            是否操作成功
     */
    public void setStatus(boolean status) {
        this.status = status;
    }

    /**
     * 取得成功的个数
     *
     * @return 成功的个数
     */
    public int getSuccess() {
        return success;
    }

    /**
     * 设置成功的个数
     *
     * @param success
     *            成功的个数
     */
    public void setSuccess(int success) {
        this.success = success;
    }

    /**
     * 取得失败的个数
     *
     * @return 失败的个数
     */
    public int getError() {
        return error;
    }

    /**
     * 设置失败的个数
     *
     * @param error
     *            失败的个数
     */
    public void setError(int error) {
        this.error = error;
    }

    /**
     * 取得操作失败信息列表
     *
     * @return 操作失败信息列表
     */
    public List<String> getErrorInfos() {
        return errorInfos;
    }

    /**
     * 设置操作失败信息列表
     *
     * @param errorInfos
     *            操作失败信息列表
     */
    public void setErrorInfos(List<String> errorInfos) {
        this.errorInfos = errorInfos;
    }

    /**
     * 取得操作成功结果列表
     *
     * @return 操作成功结果列表
     */
    public List<Object> getSuccessObjs() {
        return successObjs;
    }

    /**
     * 设置操作成功结果列表
     *
     * @param successObjs
     *            操作成功结果列表
     */
    public void setSuccessObjs(List<Object> successObjs) {
        this.successObjs = successObjs;
    }

    /**
     * 取得其他信息列表
     *
     * @return 其他信息列表
     */
    public List<Object> getOtherObjs() {
        return otherObjs;
    }

    /**
     * 设置其他信息列表
     *
     * @param otherObjs
     *            其他信息列表
     */
    public void setOtherObjs(List<Object> otherObjs) {
        this.otherObjs = otherObjs;
    }

    /**
     * 增加操作错误（失败）信息
     *
     * @param errorinfo
     *            操作错误（失败）信息
     */
    public void addErrorInfo(String errorinfo) {
        if (null == this.errorInfos) {
            this.errorInfos = new ArrayList<>();
        }
        this.errorInfos.add(errorinfo);
    }

    /**
     * 成功个数+1
     */
    public void success() {
        this.success++;
    }

    /**
     * 错误个数+1
     */
    public void error() {
        this.error++;
    }

    /**
     * 增加操作成功过对象
     *
     * @param o
     *            操作成功过对象
     */
    public void addObj(Object o) {
        if (null == this.successObjs) {
            this.successObjs = new ArrayList<>();
        }
        this.successObjs.add(o);
    }

    /**
     * 增加其他信息列表信息对象
     *
     * @param o
     *            其他信息列表信息对象
     */
    public void addOtherObj(Object o) {
        if (null == this.otherObjs) {
            this.otherObjs = new ArrayList<>();
        }
        this.otherObjs.add(o);
    }

    /**
     * 取得当前对象的详细信息
     * <p>
     *  说明：<br/>
     *  1:返回的详细结果信息的级别,1级(简单只输出成功与否)<br/>
     *  2:返回的详细结果信息的级别,2级(输出错误详细信息) <br/>
     *  3:返回的详细结果信息的级别,3级(输出完整信息包括成功多少失败多少)<br/>
     * </p>
     * @param level
     *            详细结果级别
     * @return 结果详细信息
     */
    public String getReInfos(int level) {
        switch (level) {
            case RESULT_INFO_LEVEL_ONE:
                return status ? "操作成功" : "操作失败";
            case RESULT_INFO_LEVEL_TWO:
                return status && errorInfos.size() > 0 ? "操作失败:"
                        + errorInfos.toString() : "操作成功";
            case RESULT_INFO_LEVEL_THREE:
                return "操作成功" + success + "条,操作失败" + error + "条;错误信息:"
                        + errorInfos.toString();
            default:
                return "";
        }
    }
}
