package com.supermap.sgis.visual.common;


import com.supermap.sgis.visual.tool.AppConfig;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 *
 * @author Created by W.Qiong on 15-1-27.
 */
public class XxlsBig extends SAXExcelUtil {
    /** 文件名 */
    private String fileName;

    /**是否只取头部*/
    private boolean isHead = false;

    /**存储excel数据*/
    private List<List<Object>> dataList = new ArrayList<>();

    /**
     * 构造函数，初始化文件名
     *
     * @param fileName
     * 			excel文件名
     */
    public XxlsBig(String fileName) {
        this.fileName = fileName;
    }

    /**
     * 该方法自动被调用，每读一行调用一次，在方法中写自己的业务逻辑即可
     */
    @Override
    public void optRow(int sheetIndex, int curRow, List<String> rowList) {
        List<Object> newR = new ArrayList<>();
        for (String s : rowList) {
            Object o = s;
            newR.add(o);
        }
        if (isHead && curRow == 0) {
            dataList.add(newR);
            return;
        }
        if (!isHead) {
            dataList.add(newR);
        }
    }

    /**
     * 设置是否只读取表头
     *
     * @param isHead
     * 			是否只读取表头
     */
    private void setIsHead(boolean isHead) {
        this.isHead = isHead;
    }

    /**
     * 获取表头
     *
     * @param sheetIndx
     * 			工作簿序号
     * @return 表头列表
     * @throws Exception
     */
    public List<String> getHead(int sheetIndx) throws Exception {
        String path = AppConfig.Config.get("uploadFilePath") + "\\" + this.fileName;
        setIsHead(true);								//设置只取头部
        readOneSheet(path, sheetIndx);
        List<String> head = new ArrayList<>();
        for (Object o : this.dataList.get(0)) {
            head.add(null == o ? "" : o.toString());
        }
        return head;
    }

    /**
     * 读取所有数据 包括表头
     *
     * @param sheetIndx
     * 			工作簿序号
     * @return excel数据
     * @throws Exception
     */
    public List<List<Object>> readAllData(int sheetIndx) throws Exception {
        String path = AppConfig.Config.get("uploadFilePath") + "\\" + this.fileName;
        setIsHead(false);								//设置取所有数据
        readOneSheet(path, sheetIndx);
        return this.dataList;
    }

    /**
     * 获取表头外的数据（不包括表头）
     *
     * @param sheetIndx
     * 			工作簿序号
     * @return excel数据
     * @throws Exception
     */
    public List<List<Object>> getData(int sheetIndx) throws Exception {
        String path = AppConfig.Config.get("uploadFilePath") + "\\" + this.fileName;
        setIsHead(false);
        readOneSheet(path, sheetIndx);
        this.dataList.remove(0);
        return this.dataList;
    }

    public static void main(String[] args) {
        // 3w条6s
        // String path ="E:\\法人单位sheet1.xlsx";
        String path = "E:\\sheet1.xlsx";
        XxlsBig t = new XxlsBig(path);
        try {
            t.readOneSheet(path, 1);
            t.process(path);
        } catch (Exception e) {
            e.printStackTrace();
        }
        // 3w条8s
        // System.out.println("开始"+new Date().toString());
        // ExcelUtil.readExcel("sheet1.xls","Sheet1",-1);
        System.out.println("结束" + new Date().toString());
    }
}
