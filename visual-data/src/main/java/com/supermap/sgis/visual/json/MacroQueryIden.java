package com.supermap.sgis.visual.json;

/**
 * 检索综合数据指标（及对应表、目录）信息对象
 *
 * @author Created by RRP on 2014/7/15.
 *
 */
public class MacroQueryIden {
    /** 指标ID */
    private int matmid;

    /** 指标全名 */
    private String idenName;

    /** 指标编码 */
    private String idenCode;

    /** 元数据类型（指标）,默认"3" */
    private String macmetaType = "3";

    /** 表ID */
    private int tableId;

    /** 表全名 */
    private String tableName;

    /** 目录ID */
    private int dirId;

    /** 目录全名 */
    private String dirName;

    /** 目录父ID */
    private int dirParid;

    /** 报告期类型 */
    private int reportType;

    /** 行政级别 */
    private int regionLevel;

    /**
     * 构造函数，初始化数据
     *
     * @param matmid
     *            指标ID
     * @param idenName
     *            、 指标全名
     * @param idenCode
     *            指标编码
     * @param tableId
     *            表ID
     * @param tableName
     *            表全名
     * @param dirId
     *            目录ID
     * @param dirName
     *            目录全名
     * @param dirParid
     *            目录父ID
     * @param reportType
     *            报告期类型
     * @param regionLevel
     *            行政级别
     */
    public MacroQueryIden(int matmid, String idenName, String idenCode,
                          int tableId, String tableName, int dirId, String dirName,
                          int dirParid, int reportType, int regionLevel) {
        this.matmid = matmid;
        this.idenName = idenName;
        this.idenCode = idenCode;
        this.tableId = tableId;
        this.tableName = tableName;
        this.dirId = dirId;
        this.dirName = dirName;
        this.dirParid = dirParid;
        this.reportType = reportType;
        this.regionLevel = regionLevel;
    }

    /**
     * 取得行政级别
     *
     * @return 行政级别
     */
    public int getRegionLevel() {
        return regionLevel;
    }

    /**
     * 设置行政级别
     *
     * @param regionLevel
     *            行政级别
     */
    public void setRegionLevel(int regionLevel) {
        this.regionLevel = regionLevel;
    }

    /**
     * 取得报告期类型
     *
     * @return 报告期类型
     */
    public int getReportType() {
        return reportType;
    }

    /**
     * 设置报告期类型
     *
     * @param reportType
     *            报告期类型
     */
    public void setReportType(int reportType) {
        this.reportType = reportType;
    }

    /**
     * 取得指标ID
     *
     * @return 指标ID
     */
    public int getMatmid() {
        return matmid;
    }

    /**
     * 设置指标ID
     *
     * @param matmid
     *            指标ID
     */
    public void setMatmid(int matmid) {
        this.matmid = matmid;
    }

    /**
     * 取得指标全名
     *
     * @return 指标全名
     */
    public String getIdenName() {
        return idenName;
    }

    /**
     * 设置指标全名
     *
     * @param idenName
     *            指标全名
     */
    public void setIdenName(String idenName) {
        this.idenName = idenName;
    }

    /**
     * 取得指标编码
     *
     * @return 指标编码
     */
    public String getIdenCode() {
        return idenCode;
    }

    /**
     * 设置指标编码
     *
     * @param idenCode
     *            指标编码
     */
    public void setIdenCode(String idenCode) {
        this.idenCode = idenCode;
    }

    /**
     * 取得元数据类型（指标）
     *
     * @return 元数据类型（指标）
     */
    public String getMacmetaType() {
        return macmetaType;
    }

    /**
     * 设置元数据类型（指标）
     *
     * @param macmetaType
     *            元数据类型（指标）
     */
    public void setMacmetaType(String macmetaType) {
        this.macmetaType = macmetaType;
    }

    /**
     * 取得表ID
     *
     * @return 表ID
     */
    public int getTableId() {
        return tableId;
    }

    /**
     * 设置表ID
     *
     * @param tableId
     *            表ID
     */
    public void setTableId(int tableId) {
        this.tableId = tableId;
    }

    /**
     * 取得表全名
     *
     * @return 表全名
     */
    public String getTableName() {
        return tableName;
    }

    /**
     * 设置表全名
     *
     * @param tableName
     *            表全名
     */
    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    /**
     * 取得目录ID
     *
     * @return 目录ID
     */
    public int getDirId() {
        return dirId;
    }

    /**
     * 设置目录ID
     *
     * @param dirId
     *            目录ID
     */
    public void setDirId(int dirId) {
        this.dirId = dirId;
    }

    /**
     * 取得目录全名
     *
     * @return 目录全名
     */
    public String getDirName() {
        return dirName;
    }

    /**
     * 设置目录全名
     *
     * @param dirName
     *            目录全名
     */
    public void setDirName(String dirName) {
        this.dirName = dirName;
    }

    /**
     * 取得目录父ID
     *
     * @return 目录父ID
     */
    public int getDirParid() {
        return dirParid;
    }

    /**
     * 设置目录父ID
     *
     * @param dirParid
     *            目录父ID
     */
    public void setDirParid(int dirParid) {
        this.dirParid = dirParid;
    }
}
