package com.supermap.sgis.visual.json;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.supermap.sgis.visual.entity.TemporaryImport;

import java.util.List;

/**
 * 行政区划导入结果
 *
 * @author Created by RRP on 2014/8/15.
 */
public class ImportRegionResult {

    /** 结果状态，默认为true */
    boolean status = true;

    /** 结果信息，默认为‘操作成功’ */
    String msg = "操作成功";

    /** 最大行政级别 */
    int beginLevel = 0;

    /** 最小行政级别 */
    int endLevel = 0;

    /**
     * 每级(国、省、市、县、镇、村)成功解析excel并插入数、匹配X/Y坐标数的统计
     *
     * <p>
     * &nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;二维数组，分别存储每级（{ 0, 0 }）中的 <b>插入数</b>和<b>匹配X/Y的坐标数</b>
     * </p>
     *
     */
    int[][] levelNum = { { 0, 0 }, { 0, 0 }, { 0, 0 }, { 0, 0 }, { 0, 0 },
            { 0, 0 } };

    /** 行政区划编码Excel解析的结果列表 */
    List<TemporaryImport> excelObj;

    /** 无参构造函数 */
    public ImportRegionResult() {
    }

    /**
     * 构造函数
     *
     * @param status
     *            结果状态
     * @param msg
     *            结果信息
     * @param beginLevel
     *            最大行政级别
     * @param endLevel
     *            最小行政级别
     * @param levelNum
     *            每级(国、省、市、县、镇、村)成功解析excel并插入数、匹配X/Y坐标数的统计
     * @param excelObj
     *            行政区划编码Excel解析的结果列表
     */
    public ImportRegionResult(boolean status, String msg, int beginLevel,
                              int endLevel, int levelNum[][], List<TemporaryImport> excelObj) {
        this.status = status;
        this.msg = msg;
        this.beginLevel = beginLevel;
        this.endLevel = endLevel;
        this.levelNum = levelNum;
        this.excelObj = excelObj;
    }

    /**
     * 操作状态是否成功
     *
     * @return 操作状态是否成功
     */
    public boolean isStatus() {
        return status;
    }

    /**
     * 设置操作状态是否成功
     *
     * @param status
     *            操作状态是否成功
     */
    public void setStatus(boolean status) {
        this.status = status;
    }

    /**
     * 取得结果信息
     *
     * @return 结果信息
     */
    public String getMsg() {
        return msg;
    }

    /**
     * 设置结果信息
     *
     * @param msg
     *            结果信息
     */
    public void setMsg(String msg) {
        this.msg = msg;
    }

    /**
     * 取得最大行政级别
     *
     * @return 最大行政级别
     */
    public int getBeginLevel() {
        return beginLevel;
    }

    /**
     * 设置最大行政级别
     *
     * @param beginLevel
     *            最大行政级别
     */
    public void setBeginLevel(int beginLevel) {
        this.beginLevel = beginLevel;
    }

    /**
     * 取得最小行政级别
     *
     * @return 最小行政级别
     */
    public int getEndLevel() {
        return endLevel;
    }

    /**
     * 设置最小行政级别
     *
     * @param endLevel
     *            最小行政级别
     */
    public void setEndLevel(int endLevel) {
        this.endLevel = endLevel;
    }

    /**
     * 取得每级(国、省、市、县、镇、村)成功解析excel并插入数、匹配X/Y坐标数的统计
     *
     * @return 每级(国、省、市、县、镇、村)成功解析excel并插入数、匹配X/Y坐标数的统计
     */
    public int[][] getLevelNum() {
        return levelNum;
    }

    /**
     * 设置每级(国、省、市、县、镇、村)成功解析excel并插入数、匹配X/Y坐标数的统计
     *
     * @param levelNum
     *            每级(国、省、市、县、镇、村)成功解析excel并插入数、匹配X/Y坐标数的统计
     */
    public void setLevelNum(int[][] levelNum) {
        this.levelNum = levelNum;
    }

    /**
     * 取得行政区划编码Excel解析的结果列表
     *
     * @return 行政区划编码Excel解析的结果列表
     */
    public List<TemporaryImport> getExcelObj() {
        return excelObj;
    }

    /**
     * 设置行政区划编码Excel解析的结果列表
     *
     * @param excelObj
     *            行政区划编码Excel解析的结果列表
     */
    public void setExcelObj(List<TemporaryImport> excelObj) {
        this.excelObj = excelObj;
    }

    /**
     * 取得成功解析并插入条数
     * <p>
     * &nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;获取方式：从levelNum元素中的第一个值和累加所得
     * </p>
     *
     * @return 成功解析并插入条数
     */
    public int getInsertNum() {
        int totalNum = 0;
        for (int i = 0,len=levelNum.length; i < len; i++)
            totalNum += levelNum[i][0];
        return totalNum;
    }

    /**
     * 取得成功匹配X/Y条数
     * <p>
     * &nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;获取方式：从levelNum元素中的第二个值和累加所得
     * </p>
     *
     * @return 成功匹配X/Y条数
     */
    public int getSuccessNum() {
        int totalNum = 0;
        for (int i = 0,len=levelNum.length; i < len; i++)
            totalNum += levelNum[i][1];
        return totalNum;
    }

    /**
     * 处理为JSON对象
     *
     * @return json字符串
     */
    @Override
    public String toString() {
        ObjectMapper mapper = new ObjectMapper();
        String re = null;
        try {
            re = mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return re;
    }
}

