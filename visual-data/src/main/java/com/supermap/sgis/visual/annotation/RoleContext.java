package com.supermap.sgis.visual.annotation;

/**
 * Created by W.Hao on 14-2-25.
 * 当前用户角色
 */
public enum RoleContext {
    INSTANCE;

    private ThreadLocal<Role> role = new ThreadLocal<Role>();

    public Role getCurrentRole() {
        return role.get();
    }

    public void setCurrentRole(Role role) {
        this.role.set(role);
    }
}
