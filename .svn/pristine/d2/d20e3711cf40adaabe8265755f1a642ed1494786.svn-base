package com.supermap.sgis.visual.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by W.Hao on 14-2-25.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)//表示在源码、编译好的.class文件中保留信息，在执行的时候会把这一些信息加载到JVM中去的
public @interface Permission {
    Role[] value();
}
