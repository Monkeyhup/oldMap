package com.supermap.sgis.visual.json;

import java.util.List;

/**
 * 综合查询对象
 *
 * @author Created by zhangjunfeng on 14-4-22.
 * @author Updated by RRP on 14-7-17 & 14-11-25
 */
public class MacroQuery {

    /** 表ID */
    private String parid;

    /** 报告期类型（年/季/月/人口/经济普查） */
    private int reportType;

    /** 行政区域 */
    private Region[] regions;

    /** 最小报告期时间 */
    private TimeRank timeRank;

    /** 选中查询指标编码 */
    private List<String> indicatorCodes;

    /** 底图(行政区划类型)代号id */
    private int catalog;

    /** 选中查询指标ID */
    private int[] matmids;

    /** 当前指标对应（统计数据）区划级别 */
    private int regionLevel;

    /** 指标排名（1个），暂时后台未用到，目前前台排名 */
    private Sort sort;

    /** 无参构造函数 */
    public MacroQuery() {
    }

    /**
     * 构造函数，初始化数据
     *
     * @param parid
     *            表ID（父节点ID）
     * @param reportType
     *            报告期类型（年/季/月/人口/经济普查）
     * @param regions
     *            行政区域（查询条件）
     * @param timeRank
     *            取得有效（最小、最大）报告期时间
     * @param indicatorCode
     *            选中查询指标编码
     * @param catalog
     *            区划树类型id
     * @param matmids
     *            选中查询指标ID
     * @param regionLevel
     *            当前指标对应（统计数据）区划级别
     * @param sort
     *            指标排名（1个），暂时后台未用到，目前前台排名
     */
    public MacroQuery(String parid, int reportType, Region[] regions,
                      TimeRank timeRank, List<String> indicatorCode, int catalog,
                      int[] matmids, int regionLevel, Sort sort) {
        this.parid = parid;
        this.reportType = reportType;
        this.regions = regions;
        this.timeRank = timeRank;
        this.indicatorCodes = indicatorCode;
        this.catalog = catalog;
        this.matmids = matmids;
        this.regionLevel = regionLevel;
        this.sort = sort;
    }

    /**
     * 取得表ID
     *
     * @return 表ID
     */
    public String getParid() {
        return parid;
    }

    /**
     * 设置表ID（父节点ID）
     */
    public void setParid(String parid) {
        this.parid = parid;
    }

    /**
     * 取得报告期类型（年/季/月/人口/经济普查）
     */
    public int getReportType() {
        return reportType;
    }

    /**
     * 设置报告期类型（年/季/月/人口/经济普查）
     */
    public void setReportType(int reportType) {
        this.reportType = reportType;
    }

    /**
     * 取得
     *
     * @return
     */
    public Region[] getRegions() {
        return regions;
    }

    public void setRegions(Region[] regions) {
        this.regions = regions;
    }

    /**
     * 取得有效（最小、最大）报告期时间
     */
    public TimeRank getTimeRank() {
        return timeRank;
    }

    /**
     * 设置有效（最小、最大）报告期时间
     */
    public void setTimeRank(TimeRank timeRank) {
        this.timeRank = timeRank;
    }

    /**
     * 取得区划树类型id
     *
     */
    public int getCatalog() {
        return catalog;
    }

    /**
     * 设置区划树类型id
     */
    public void setCatalog(int catalog) {
        this.catalog = catalog;
    }

    /**
     * 取得选中查询指标编码
     */
    public List<String> getIndicatorCodes() {
        return indicatorCodes;
    }

    /**
     * 设置选中查询指标编码
     */
    public void setIndicatorCodes(List<String> indicatorCodes) {
        this.indicatorCodes = indicatorCodes;
    }

    /**
     * 取得选中查询指标ID
     */
    public int[] getMatmids() {
        return matmids;
    }

    /**
     * 设置选中查询指标ID
     */
    public void setMatmids(int[] matmids) {
        this.matmids = matmids;
    }

    /**
     * 取得当前指标对应（统计数据）区划级别
     */
    public int getRegionLevel() {
        return regionLevel;
    }

    /**
     * 设置当前指标对应（统计数据）区划级别
     */
    public void setRegionLevel(int regionLevel) {
        this.regionLevel = regionLevel;
    }

    /**
     * 取得指标排名（1个），暂时后台未用到，目前前台排名
     */
    public Sort getSort() {
        return this.sort;
    }

    /**
     * 设置指标排名（1个），暂时后台未用到，目前前台排名
     */
    public void setSort(Sort sort) {
        this.sort = sort;
    }
}
