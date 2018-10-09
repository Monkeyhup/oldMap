package com.supermap.sgis.visual.annotation;

/**
 * 用户权限级别划分，系统内置权限系统
 * 用注解的方式控制REST API的访问
 */
public enum Role {
    /**
     * 系统超级管理员，做系统级别的配置和操作，最高权限
     */
    SUPER_ADMIN(5),
    /**
     * 系统管理员，管理区域下用户、数据、权限
     */
    ADMIN(4),
    /**
     * 操作员，管理区域下的数据
     */
    OPERATOR(3),
    /**
     * 用户，访问区域下的数据
     */
    USER(2),
    /**
     * 匿名用户，最低权限，仅完全公开部分的数据能被访问
     */
    ANONYMOUS(1);

    private int value;
    Role(int value) {
        this.value = value;
    }
    public int getRoleValue(){
        return this.value;
    }
}
