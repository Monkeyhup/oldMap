package com.supermap.sgis.visual.common;

import java.util.ArrayList;
import java.util.Collection;

/**
 * 还是Javascript的Array用起来顺手
 * @author Windy
 *
 */
public class JArray {

    private ArrayList<String> arr = new ArrayList<String>();

    public JArray(String... strings) {
        for (String str : strings) {
            this.arr.add(str);
        }
    }

    public JArray() {
    }

    public JArray(Collection collection){
        for (Object object : collection) {
            this.arr.add(object.toString());
        }
    }

    public String join(String split) {
        StringBuffer re = new StringBuffer();
        for (String str : this.arr) {
            re.append(str).append(split);
        }
        if (this.arr.size() > 0){
            re.setLength(re.length() - split.length());
        }
        return re.toString();
    }

    public JArray push(String el) {
        this.arr.add(el);
        return this;
    }

}