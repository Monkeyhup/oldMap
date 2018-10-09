package com.supermap.sgis.visual.json;

/**
 *
 * 行政区划编码对象
 *
 * @author Created by W.Qiong on 14-3-22.
 */
public class Region {

    /** 行政区划编码 */
    private String regionCode;

    /** 行政区划名称 */
    private String regionName;

    /** 行政区划编码级别 */
    private int regionLevel;

    /** 无参构造函数 */
    public Region() {
    }

    /**
     * 构造函数，初始化参数
     *
     * @param regionCode
     *            行政区划编码
     * @param regionName
     *            行政区划名称
     * @param regionLevel
     *            行政区划编码级别
     */
    public Region(String regionCode, String regionName, int regionLevel) {
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.regionLevel = regionLevel;
    }

    /**
     * 取得行政区划级别
     *
     * @return 行政区划级别
     */
    public int getRegionLevel() {
        return regionLevel;
    }

    /**
     * 设置行政区划级别
     *
     * @param regionLevel
     *            行政区划级别
     */
    public void setRegionLevel(int regionLevel) {
        this.regionLevel = regionLevel;
    }

    /**
     * 取得行政区划编码
     *
     * @return 行政区划编码
     */
    public String getRegionCode() {
        return regionCode;
    }

    /**
     * 设置行政区划编码
     *
     * @param regionCode
     *            行政区划编码
     */
    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    /**
     * 取得行政区划名称
     *
     * @return 行政区划名称
     */
    public String getRegionName() {
        return regionName;
    }

    /**
     * 设置行政区划名称
     *
     * @param regionName
     *            行政区划名称
     */
    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }
}
