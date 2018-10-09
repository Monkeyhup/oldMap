package com.supermap.sgis.visual.common;

import java.io.File;

/**
 * Created by RRP on 2015/4/2.
 * File工具类
 */
public class FileUtil {

    /**
     * 判断文件路径并创建
     *
     * @param filePath 文件路径
     * @return 文件对象
     */
    public static File buildFilePath(String filePath) {
        File dir = new File(filePath);
        if(!dir.getParentFile().exists()){
            dir.getParentFile().mkdir();//文件目录不存在创建
        }
        if(!dir.exists()){
            dir.mkdirs();//创建多级全部文件夹
        }
        return dir;
    }

}
