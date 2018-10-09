package com.supermap.sgis.visual.json;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by jinn on 2015/10/19.
 */
public class MacroDataResult {
    /** 数据库表名 */
    private String tableName = "";

    /*** 数据内容，用一个二维数组表示的 */
    private String[][] content;

    /** 指标列表（包括解析后的分组指标） */
    private List indicators;

    /** 报告期（时段列表） */
    private List periods;

    /*** 表头【指标，事件……】 */
    private List<FieldInfo> head = new ArrayList<FieldInfo>();

    /** 返回结果状态码 */
    private boolean status = false;

    /** 数据总条数 */
    private int count = 0;

    /** 每页的条数，默认第页10条数据 */
    public int pageSize = 10;

    /** 页码，默认第一页 */
    public int pageNumber = 1;

    /**后台处理结果*/
    public String messages = "";


    /**
     * 取得数据总条数
     */
    public int getCount() {
        return count;
    }

    /**
     * 设置数据总条数
     */
    public void setCount(int count) {
        this.count = count;
    }

    /**
     * 取得每页的条数
     */
    public int getPageSize() {
        return pageSize;
    }

    /**
     * 设置每页的条数
     */
    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    /**
     * 取得页码
     */
    public int getPageNumber() {
        return pageNumber;
    }

    /**
     * 设置页码
     */
    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    /**
     * 取得表名
     */
    public String getTableName() {
        return tableName;
    }

    /**
     * 设置表名
     */
    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    /**
     * 取得表头
     */
    public List<FieldInfo> getHead() {
        return head;
    }

    /**
     * 设置表头
     */
    public void setHead(List<FieldInfo> head) {
        this.head = head;
    }

    /**
     * 取得数据内容，用一个二维数组表示的
     */
    public String[][] getContent() {
        return content;
    }

    /**
     * 设置数据内容，用一个二维数组表示的
     */
    public void setContent(String[][] content) {
        this.content = content;
    }

    /**
     * 取得指标列表
     */
    public List getIndicators() {
        return indicators;
    }

    /**
     * 设置指标列表
     */
    public void setIndicators(List indicators) {
        this.indicators = indicators;
    }

    /**
     * 取得时段列表
     */
    public List getPeriods() {
        return periods;
    }

    /**
     * 设置时段列表
     */
    public void setPeriods(List periods) {
        this.periods = periods;
    }

    /**
     * 结果状态码
     */
    public boolean isStatus() {
        return status;
    }

    /**
     * 设置结果状态码
     */
    public void setStatus(boolean status) {
        this.status = status;
    }

    /**
     * 取得结果提示
     */
    public String getMessages() {
        return messages;
    }

    /**
     * 设置结果提示
     */
    public void setMessages(String messages) {
        this.messages = messages;
    }

    //二维数组：去除编码空的行（分组编码值null），值空初始化


    /**
     * 此方法可以移除空行，包括行为null和[]两种类型
     *
     * @param data
     *          要处理的数据
     * @return 返回处理后的数据
     */
    public static String[][] removeNull(String[][] data) {
        if(data == null)
            return data;

        //移除的空行
        HashMap<String,Integer> removeIndex = new HashMap<>();

        int len = data.length;
        String[][] re = new String[len][];
        for (int rowIndex=0; rowIndex<len; rowIndex++) {
            String[] row = data[rowIndex];
            if(row == null){
                //记录空行
                removeIndex.put(rowIndex+"",rowIndex);
                continue;
            }

            int length = row.length;
            if (row[0] != null && !row[0].equals("")
                    && !row[0].equals("null") && !row[0].equals(null)) {//分组指标（区域、行业等）编码值非空
                re[rowIndex] = new String[length];
                re[rowIndex][0] = row[0];
                re[rowIndex][1] = row[1];
                for (int colIndex=2; colIndex<length; colIndex++) {//从第3列取值
                    String v = row[colIndex];
                    re[rowIndex][colIndex] = (v!=null && !v.equals("") && !v.equals("null") && !v.equals(null)) ? v : "0";
                }
            }else{
                //记录空行
                removeIndex.put(rowIndex + "", rowIndex);
            }
        }

        //取得空行的大小
        int removeSize = removeIndex.size();
        if(removeSize == 0)
            return re;

        String[][] result = new String[len-removeSize][];
        int index = 0;
        //移除空行
        for (int j=0,leng=re.length; j<leng; j++) {
            //不需要删除,则添加进去
            if(removeIndex.get(j+"") == null){
                result[index++] = re[j];
            }
        }

        return result;
    }
}
