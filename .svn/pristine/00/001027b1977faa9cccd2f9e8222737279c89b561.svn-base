package com.supermap.sgis.visual.json;

/**
 * 综合查询结果时段项
 *
 * @author Created by W.Qiong on 14-11-11.
 */
public class Period {

    /**综合查询年份*/
    private int year;

    /**综合查询月份*/
    private int month;

    /**综合查询报告期类型*/
    private int reportType;

    /**综合查询类型名称*/
    private String reportTypeName;

    private Boolean hasdata; //是否有此报告期数据

    /**
     * 取得综合查询报告期类型
     * @return 综合查询报告期类型
     */
    public int getReportType() {
        return reportType;
    }

    /**
     * 设置综合查询报告期类型
     * @param reportType
     * 			综合查询报告期类型
     */
    public void setReportType(int reportType) {
        this.reportType = reportType;
    }

    /**
     * 取得综合查询年份
     * @return 综合查询年份
     */
    public int getYear() {
        return year;
    }

    /**
     * 设置综合查询年份
     * @param year
     * 			综合查询年份
     */
    public void setYear(int year) {
        this.year = year;
    }

    /**
     * 取得综合查询的月份
     *
     * @return 综合查询月份
     */
    public int getMonth() {
        return month;
    }

    /**
     * 设置综合查询月份
     * @param month
     * 			综合查询月份
     */
    public void setMonth(int month) {
        this.month = month;
    }

    /**
     * 取得综合查询类型名称
     * @return 综合查询类型名称
     */
    public String getReportTypeName() {
        return reportTypeName;
    }


    public Boolean getHasdata() {
        return hasdata;
    }

    public void setHasdata(Boolean hasdata) {
        this.hasdata = hasdata;
    }

    /**
     * 设置综合查询类型名称
     *
     * @param reportTypeName
     * 				综合查询类型名称
     */
    public void setReportTypeName(String reportTypeName) {
        this.reportTypeName = reportTypeName;
    }

    //获取一个Period查询条件sql
    public String getSql(){
        String sql = "";
        switch (reportType) {
            case 1: //经济普查
                sql = "year = "+year;
                break;
            case 2: //人口普查
                sql = "year = "+year;
                break;
            case 3: //农业普查
                sql = "year = "+year;
                break;
            case 4: //年鉴
                sql = "year = "+year;
                break;
            case 11: //年报
                sql = "year = "+year;
                break;
            case 12: //季报
                sql = "year = "+year+" and month = "+month;
                break;
            case 13: //月报
                sql = "year = "+year+" and month = "+month;
                break;
            case 14: //半年
                sql = "year = "+year+" and month = "+month;
                break;
            //可扩展 其他数据类型
            default:
                sql = "year = "+year+" and month = 0";
                break;
        }
        return sql;
    }
}
