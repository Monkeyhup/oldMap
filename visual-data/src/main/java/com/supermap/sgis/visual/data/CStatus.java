package com.supermap.sgis.visual.data;

/**
 *
 * 数据状态类型(所有表通用)
 *
 * @author Linhao on 2015-01-27
 */
public class CStatus {

    /**状态:不可用*/
    public static final int DISABLED = 0;

    /**状态：可用*/
    public static final int READY = 1;

    /**状态：元数据已建立，但是对应的数据（表）尚不可用*/
    public static final int NOT_READY = 2;
}
