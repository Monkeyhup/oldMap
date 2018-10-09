package com.supermap.sgis.visual.tool;

import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.hssf.util.Region;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.xssf.usermodel.*;

import java.io.*;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by W.Qiong on 14-8-21. Excel操作类
 */
public class ExcelUtil {

    /** 默认Excel文件上传服务器路径（被解析时的路径） */
    private static String uploadFilePath = AppConfig.Config.get("uploadFilePath");

    static {
        if(!uploadFilePath.endsWith("\\")){
           uploadFilePath += "\\";
        }
    }


    /**
     * 取得文件扩展名
     *
     * @param filename
     *            文件名
     * @return 文件扩展名(不含.)
     */
    public static String getExtensionName(String filename) {
        if ((filename != null) && (filename.length() > 0)) {
            int dot = filename.lastIndexOf('.');
            if ((dot > -1) && (dot < (filename.length() - 1))) {
                return filename.substring(dot + 1);
            }
        }
        return filename;
    }

    /**
     * 读取已上传excel表单数据（支持两种格式：xls/xlsx），从指定行开始读
     *
     * @param path
     *            excel文件路径（包含了文件名）
     * @param sheetName
     *            表单名
     * @param headerRows
     *            指定行开始读
     * @return excel二维数据列表
     */
    public static List<List<Object>> readExcel(String path, String sheetName, int headerRows) {
        path = uploadFilePath + path;
        String extStr = getExtensionName(path);
        if (extStr.toLowerCase().equals("xls")) {
            return readHssfExcel(path, sheetName, headerRows);
        } else if (extStr.toLowerCase().equals("xlsx")) {
            return readXssfExcel(path, sheetName, headerRows);
        } else {
            return new ArrayList<List<Object>>();
        }
    }

    /**
     * 读取本地excel文件
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;xls格式类型的读取
     * </p>
     * @param path
     *            excel文件路径（包含了文件名）
     * @param sheetName
     *            表单名
     * @param containHeaderRows
     *            表头行数
     * */
    public static List<List<Object>> readHssfExcel(String path,
                                                   String sheetName, int containHeaderRows) {
        List<List<Object>> dataList = new ArrayList<List<Object>>();
        File file = new File(path);
        if (file.exists()) {
            HSSFWorkbook xwb = null;
            try {
                xwb = new HSSFWorkbook(new FileInputStream(file));
            } catch (IOException e) {
                e.printStackTrace();
            }
            int index = 0;
            if (sheetName != "") {
                index = xwb.getSheetIndex(sheetName);
            } else
                index = 0;
            if (index != -1) {
                HSSFSheet sheet = xwb.getSheetAt(index);
                HSSFRow row = null;
                HSSFCell cell = null;
                Object val = null;

                //DecimalFormat df = new DecimalFormat("0");			// 格式化数字
                //SimpleDateFormat sdf = new SimpleDateFormat(
                //		"yyyy-MM-dd HH:mm:ss");						// 格式化日期字符串

                // int i = sheet.getFirstRowNum();
                int i = 0;
                if (containHeaderRows > 0) {
                    i += containHeaderRows;							// 多维表头或者有空行,这样有问题吧？？？
                }
                for (; i < sheet.getLastRowNum() + 1; i++) {
                    row = sheet.getRow(i);
                    List<Object> objList = new ArrayList<Object>();
                    if (row == null) {
                        dataList.add(objList);
                        continue;
                    }
                    for (int j = 0; j < row.getLastCellNum(); j++) {
                        cell = row.getCell(j);
                        if (cell == null) {
                            val = ""; 								// 不用null值 不然取的时候还要做空值判断
                            objList.add(val);
                            continue;
                        }
                        switch (cell.getCellType()) {
                            case XSSFCell.CELL_TYPE_STRING:
                                val = cell.getStringCellValue();
                                break;
                            case XSSFCell.CELL_TYPE_NUMERIC:
                                val = cell.getNumericCellValue();
                                if (null == val) {
                                    break;
                                }
                                DecimalFormat t = new DecimalFormat(
                                        "####################.##");
                                val = t.format(val);

                                // 这块有问题？？先注掉？？
                                // if
                                // ("@".equals(cell.getCellStyle().getDataFormatString()))
                                // {
                                // val = df.format(cell.getNumericCellValue());
                                // } else if ("General".equals(cell.getCellStyle()
                                // .getDataFormatString())) {
                                // val = df.format(cell.getNumericCellValue());
                                // } else {
                                // val = sdf.format(HSSFDateUtil.getJavaDate(cell
                                // .getNumericCellValue()));
                                // }
                                break;
                            case XSSFCell.CELL_TYPE_BOOLEAN:
                                val = cell.getBooleanCellValue();
                                break;
                            case XSSFCell.CELL_TYPE_BLANK:
                                val = "";
                                break;
                            default:
                                val = cell.toString();
                                break;
                        }
                        objList.add(val);
                    }
                    dataList.add(objList);
                }
            }
        }
        return dataList;
    }

    /**
     * 读取本地excel文件
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;xlsx格式类型的读取
     * </p>
     * @param path
     *            excel文件路径（包含了文件名）
     * @param sheetName
     *            表单名
     * @param containHeaderRows
     *            表头行数
     * */
    public static List<List<Object>> readXssfExcel(String path,
                                                   String sheetName, int containHeaderRows) {
        List<List<Object>> dataList = new ArrayList<List<Object>>();
        try {
            File file = new File(path);
            if (file.exists()) {
                FileInputStream inputStream = new FileInputStream(file);
                XSSFWorkbook xwb = new XSSFWorkbook(inputStream);
                int index = 0;
                if (sheetName == "") {
                    index = 0;
                } else
                    index = xwb.getSheetIndex(sheetName);
                if (index != -1) {
                    XSSFSheet sheet = xwb.getSheetAt(index);
                    XSSFRow row = null;
                    XSSFCell cell = null;
                    Object val = null;
                    // int i = sheet.getFirstRowNum(); 				//空行会被滤过 导入数据时却需要保留
                    int i = 0;
                    if (containHeaderRows > 0) {
                        i += containHeaderRows;						// 跳过表头行
                    }

                    // for (; i < sheet.getPhysicalNumberOfRows(); i++) {
                    for (; i < sheet.getLastRowNum() + 1; i++) {
                        row = sheet.getRow(i);
                        List<Object> objList = new ArrayList<Object>();
                        if (row == null) {
                            dataList.add(objList);					// 空行占位
                            continue;
                        }
                        // row.getFirstCellNum() 为第一个非空值的单元格
                        // row.getPhysicalNumberOfCells() 为非空单元格数
                        for (int j = 0; j < row.getLastCellNum(); j++) {
                            cell = row.getCell(j);
                            if (cell == null) {
                                val = "";
                                objList.add(val);
                                continue;
                            }
                            cell.setCellType(XSSFCell.CELL_TYPE_STRING);
                            objList.add(cell.getStringCellValue());
                        }
                        dataList.add(objList);
                    }
                }
                inputStream.close();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return dataList;
    }

    /**
     * 读取excel文件表头
     * @param fileName
     *            excel文件名
     * @param sheetName
     *            表单名
     * @return 文件表头（可能返回null）
     */
    public static String[] readExcelHeader(String fileName, String sheetName) {
        String path = uploadFilePath + fileName;
        String extStr = getExtensionName(fileName);			// 扩展名
        if (extStr.toLowerCase().equals("xls")) {
            return readHssfExcelHeader(path, sheetName);
        } else if (extStr.toLowerCase().equals("xlsx")) {
            return readXssfExcelHeader(path, sheetName);
        } else {
            return null;
        }
    }

    /**
     * excel文件中表头的读取
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;xls格式类型的读取
     * </p>
     * @param path
     *        	导出的excel文件路径（包含了文件名）
     * @param sheetName
     *          导出的excel表单名
     * @return 表头
     */
    private static String[] readHssfExcelHeader(String path, String sheetName) {
        String[] header = new String[0];
        File file = new File(path);
        if (file.exists()) {
            HSSFWorkbook xwb = null;
            try {
                xwb = new HSSFWorkbook(new FileInputStream(file));
                int index = 0;
                if (sheetName != "") {
                    index = xwb.getSheetIndex(sheetName);// 表单序号
                } else {
                    index = 0;
                }
                if (index != -1) {
                    HSSFSheet sheet = xwb.getSheetAt(index);
                    HSSFRow row = sheet.getRow(0);// 表单第一行：表头（字段名）
                    int colNum = row.getPhysicalNumberOfCells();
                    header = new String[colNum];
                    for (int i = 0; i < colNum; i++) {
                        header[i] = row.getCell(i).getStringCellValue();
                    }
                }
            } catch (IOException e) {
                System.out.println("解析.xls表单表头出错");
                e.printStackTrace();
                return header;
            }
        }
        return header;
    }

    /**
     * excel文件中表头的读取
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;xlsx格式类型的读取
     * </p>
     * @param path
     *        	导出的excel文件路径（包含了文件名）
     * @param sheetName
     *          导出的excel表单名
     * @return 表头
     */
    private static String[] readXssfExcelHeader(String path, String sheetName) {
        String[] header = new String[0];
        File file = new File(path);
        if (file.exists()) {
            XSSFWorkbook xwb = null;
            try {
                xwb = new XSSFWorkbook(new FileInputStream(file));
                int index = 0;
                if (sheetName != "") {
                    index = xwb.getSheetIndex(sheetName);
                } else
                    index = 0;
                if (index != -1) {
                    XSSFSheet sheet = xwb.getSheetAt(index);
                    XSSFRow row = sheet.getRow(0);
                    int colNum = row.getPhysicalNumberOfCells();
                    header = new String[colNum];
                    for (int i = 0; i < colNum; i++) {
                        header[i] = row.getCell(i).getStringCellValue();
                    }
                }
            } catch (IOException e) {
                // e.printStackTrace();
                return header;
            }
        }
        return header;
    }

    /**
     * 将数据转换为HSSFWorkbook对象（.xls表数据）
     * @param sheetName 表单名
     * @param head 表头(只支持一维表头)
     * @param detalist Excel 数据部分
     * @return HSSFWorkbook对象
     */
    public static HSSFWorkbook dataToWorkbook(String sheetName, String[] head, List<List<Object>> detalist) {
        try {
            int Maxnum = 30000;//单个表单最大记录数
            int headnum = head.length;
            int rownum = detalist.size();
            HSSFWorkbook wk = new HSSFWorkbook();//.xls文件
            int sheetnum = 1;
            //2003(.xls)单个表单必须<65536条数
            if(rownum>Maxnum){
                sheetnum = rownum/Maxnum;
                if(rownum%Maxnum!=0){
                    sheetnum++;
                }
            }else if(rownum>0){
                sheetnum = 1;
            }else {
                System.out.println("导出基层表【"+sheetName+"】数据空");
//                return null;
            }
            for(int s=0; s<sheetnum; s++) {
                String endInd = sheetnum==1 ? "" : "_"+s;
                HSSFSheet sheet = wk.createSheet(sheetName+endInd);//表单
                System.out.println("导出："+sheetName+endInd);
                HSSFRow headrow = sheet.createRow(0);//第一行
                int index = 0;
                for (String h : head) {                                    // 表头写入
                    HSSFFont font = wk.createFont();                        // 设置字体
                    font.setFontHeightInPoints((short) 10);                // 字体高度
                    font.setFontName("黑体");                                // 字体
                    font.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);            // 宽度

                    // 设置单元格类型样式
                    HSSFCellStyle cellStyle = wk.createCellStyle();
                    cellStyle.setFont(font);
                    cellStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER);    // 水平布局：居中
                    cellStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);    // 带边框
                    cellStyle.setWrapText(true);
                    cellStyle.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);// 行底色
                    cellStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);

                    HSSFCell headcell = headrow.createCell(index++);
                    headcell.setCellStyle(cellStyle);
                    headcell.setCellValue(h);
                }
                rownum = headnum > 0 ? rownum + 1 : rownum;//如果有表头，默认是表头里含有这一列数据
                int start1 = s*Maxnum;
                int start = headnum>0 ? 1+start1 : start1;
                int end = (s+1)*Maxnum;
                end = headnum>0 ? 1+end : end;
                for (int i = start; i < end && i<detalist.size(); i++) {
                    List<Object> list = detalist.get(headnum > 0 ? i - 1 : i);
                    HSSFRow row = sheet.createRow(i-start1);//第i行
                    int leng = list.size();
                    for (int cindex = 0; cindex < leng; cindex++) {
                        HSSFCell cell = row.createCell(cindex);
                        cell.setCellValue(null == list.get(cindex) ? "" : list.get(cindex).toString());
                    }
                }
            }
            return wk;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    /**
     * 将数据转换为XSSFWorkbook对象（.xlsx表单数据）
     * @param sheetName 表单名
     * @param head 表头(只支持一维表头)
     * @param detalist Excel 数据部分
     * @return XSSFWorkbook对象
     */
    public static XSSFWorkbook dataToWorkbookXlsx(String sheetName, String[] head, List<List<Object>> detalist) {
        try {
            XSSFWorkbook wk = new XSSFWorkbook();
            XSSFSheet sheet = wk.createSheet(sheetName);//表单
            XSSFRow headrow = sheet.createRow(0);//第一行
            int index = 0;
            for (String h : head) { 									// 表头写入
                XSSFFont font = wk.createFont();						// 设置字体
                font.setFontHeightInPoints((short) 10); 				// 字体高度
                font.setFontName("黑体"); 								// 字体
                font.setBoldweight(XSSFFont.BOLDWEIGHT_BOLD); 			// 宽度

                // 设置单元格类型样式
                XSSFCellStyle cellStyle = wk.createCellStyle();
                cellStyle.setFont(font);
                cellStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER); 	// 水平布局：居中
                cellStyle.setBorderBottom(XSSFCellStyle.BORDER_THIN);	// 带边框
                cellStyle.setWrapText(true);
                cellStyle.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);// 行底色
                cellStyle.setFillPattern(XSSFCellStyle.SOLID_FOREGROUND);

                XSSFCell headcell = headrow.createCell(index++);
                headcell.setCellStyle(cellStyle);
                headcell.setCellValue(h);
            }
            int headnum = head.length;
            int rownum = detalist.size();
            rownum = headnum>0?rownum+1:rownum;//如果有表头，默认是表头里含有这一列数据
            for (int i = headnum>0?1:0; i < rownum ; i++) {
                List<Object> list = detalist.get(headnum>0?i-1:i);
                XSSFRow row = sheet.createRow(i);//第i行
                int leng = list.size();
                for (int cindex = 0; cindex < leng; cindex++) {
                    XSSFCell cell = row.createCell(cindex);
                    cell.setCellValue(null==list.get(cindex)?"":list.get(cindex).toString());
                }
            }
            return wk;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    /**
     * 将数据转换为HSSFWorkbook对象
     * @param sheetName 表单名
     * @param head 表头(只支持一维表头)
     * @param dataArr Excel 数据部分
     * @return HSSFWorkbook对象
     */
    public static HSSFWorkbook dataToWorkbook(String sheetName, String[] head, String[][] dataArr) {
        List<List<Object>> detalist = new ArrayList<>();
        for (int i=0,len=dataArr.length; i<len; i++) {
            String[] rData = dataArr[i];
            List<Object> row = new ArrayList<>();
            for (int j = 0,len2 = rData.length; j < len2; j++) {
                row.add(rData[j]);
            }
            detalist.add(row);
        }
        return dataToWorkbook(sheetName, head, detalist);
    }

    /**
     * 将数据转换为HSSFWorkbook对象
     * @param sheetName 表页签名
     * @param head  表头
     * @param dataList  数据
     * @return  HSSFWorkbook对象
     */
    public static HSSFWorkbook dataToWorkbooka(String sheetName,String[] head,List<Object[]> dataList){
        List<List<Object>> ldata=new ArrayList<>();
        for(Object[] item:dataList){
            List<Object> litem=new ArrayList<>();
            ldata.add(litem);
            for(Object o:item){
                litem.add(o);
            }
        }
        return dataToWorkbook(sheetName,head,ldata);
    }

    /**
     * 支持多维表头 汇总数据导出
     *
     * @param sheetName
     *            表单名
     * @param head
     *            表头(支持多维表头)
     * @param detalist
     *            Excel 数据部分
     *
     * @return HSSFWorkbook对象
     */
    public static HSSFWorkbook dataToWorkbook(String sheetName,
                                              List<List<String>> head, List<List<String>> detalist) {
        try {
            HSSFWorkbook wk = new HSSFWorkbook();
            HSSFSheet sheet = wk.createSheet(sheetName);
            // 设置字体
            HSSFFont font = wk.createFont();
            font.setFontHeightInPoints((short) 10); 							// 字体高度
            font.setFontName("黑体"); 											// 字体
            font.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD); 						// 宽度

            // 设置单元格类型样式
            HSSFCellStyle cellStyle = wk.createCellStyle();
            cellStyle.setFont(font);
            cellStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER); 				// 水平布局：居中
            cellStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
            cellStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);				// 带边框
            cellStyle.setWrapText(true);
            cellStyle.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);	// 行底色
            cellStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);

            // 表头写入
            int rowIndex = 0;
            for (List<String> r : head) {
                HSSFRow headrow = sheet.createRow(rowIndex++);
                int colIndex = 0;
                for (String c : r) {
                    HSSFCell headcell = headrow.createCell(colIndex++);
                    headcell.setCellStyle(cellStyle);
                    headcell.setCellValue(null != c
                            && (c.equals("#rspan") || c.equals("#cspan")) ? ""
                            : c);
                }
            }

            // 处理表头合并单元格
            rowIndex = 0;
            for (List<String> r : head) {
                int colIndex = 0;
                for (String c : r) {

                    if (colIndex < r.size() - 1) {
                        String right = r.get(colIndex + 1);							// 检测右边单元格是否为列合并
                        if (null != right && right.equals("#cspan")) {
                            int endColspan = colIndex + 1;
                            for (int ci = colIndex + 2; ci < r.size(); ci++) {
                                String s = r.get(ci);
                                if (null != s && s.equals("#cspan")) {
                                    endColspan = ci;
                                } else {
                                    break;
                                }
                            }
                            sheet.addMergedRegion(new Region(rowIndex,
                                    (short) colIndex, rowIndex,
                                    (short) endColspan));
                        }
                    }
                    if (rowIndex < head.size() - 1) {
                        String bottom = head.get(rowIndex + 1).get(colIndex);
                        if (null != bottom && bottom.equals("#rspan")) {
                            int endRowspan = rowIndex + 1;
                            for (int ri = rowIndex + 2; ri < head.size(); ri++) {
                                String s = head.get(ri).get(colIndex);
                                if (null != s && s.equals("#cspan")) {
                                    endRowspan = ri;
                                } else {
                                    break;
                                }
                            }
                            sheet.addMergedRegion(new Region(rowIndex,
                                    (short) colIndex, endRowspan,
                                    (short) colIndex));
                        }
                    }

                    colIndex++;
                }
                rowIndex++;
            }

            int rownum = detalist.size();
            for (int i = head.size(); i < rownum + head.size(); i++) {
                List<String> list = detalist.get(i - head.size());
                HSSFRow row = sheet.createRow(i);
                for (int cindex = 0; cindex < list.size(); cindex++) {
                    HSSFCell cell = row.createCell(cindex);
                    cell.setCellValue(list.get(cindex));
                }
            }
            return wk;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    /**
     * 导出列表数据带excel中
     *
     * @param path
     *        	导出的excel文件路径（包含了文件名）
     * @param sheetName
     *          导出的excel表单名
     * @param head
     * 			excel的表头
     * @param detalist
     * 			导出的具体数据
     * @return 导出结果
     */
    public static boolean exportExcel(String path, String sheetName,
                                      String[] head, List<List<String>> detalist) {
        String extStr = getExtensionName(path);
        if (extStr.toLowerCase().equals("xls")) {
            return exportExcelLowVersion(path, sheetName, head, detalist);
        } else if (extStr.toLowerCase().equals("xlsx")) {
            return exportExcelAdvanceVersion(path, sheetName, head, detalist);
        } else {
            return false;
        }
    }

    /**
     * 导出列表数据带excel中
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;xls格式类型的导出
     * </p>
     * @param path
     *        	导出的excel文件路径（包含了文件名）
     * @param sheetName
     *          导出的excel表单名
     * @param head
     * 			excel的表头
     * @param detalist
     * 			导出的具体数据
     * @return 导出结果
     */
    private static boolean exportExcelLowVersion(String path, String sheetName,
                                                 String[] head, List<List<String>> detalist) {
        try {
            HSSFWorkbook wk = new HSSFWorkbook();
            HSSFSheet sheet = wk.createSheet(sheetName);
            HSSFRow headrow = sheet.createRow(0);
            int index = 0;
            for (String h : head) { 							// 表头写入
                HSSFCell headcell = headrow.createCell(index++);
                headcell.setCellValue(h);
            }
            int rownum = detalist.size();
            for (int i = 1; i < rownum + 1; i++) {
                List<String> list = detalist.get(i - 1);
                HSSFRow row = sheet.createRow(i);
                for (int cindex = 0; cindex < list.size(); cindex++) {
                    HSSFCell cell = row.createCell(cindex);
                    cell.setCellValue(list.get(cindex));
                }
            }
            OutputStream out = null;
            out = new FileOutputStream(path);
            wk.write(out);
            out.close();
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
        return true;
    }

    /**
     * 导出xlsx表数据
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;xlsx格式类型的导出
     * </p>
     * @param path
     *        	导出的excel文件路径（包含了文件名）
     * @param sheetName
     *          导出的excel表单名
     * @param head
     * 			excel的表头
     * @param detalist
     * 			导出的具体数据
     * @return 导出结果
     */
    private static boolean exportExcelAdvanceVersion(String path,
                                                     String sheetName, String[] head, List<List<String>> detalist) {
        try {
            XSSFWorkbook wk = new XSSFWorkbook();
            XSSFSheet sheet = wk.createSheet(sheetName);
            XSSFRow headrow = sheet.createRow(0);
            int index = 0;
            for (String h : head) { // 表头写入
                XSSFCell headcell = headrow.createCell(index++);
                headcell.setCellValue(h);
            }
            int rownum = detalist.size();
            for (int i = 1; i < rownum + 1; i++) {
                List<String> list = detalist.get(i - 1);
                XSSFRow row = sheet.createRow(i);
                for (int cindex = 0; cindex < list.size(); cindex++) {
                    XSSFCell cell = row.createCell(cindex);
                    cell.setCellValue(list.get(cindex));
                }
            }
            OutputStream out = null;
            out = new FileOutputStream(path);
            wk.write(out);
            out.close();
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
        return true;
    }


    /**
     * 根据excel文件名，读取上传路径下的表单属性
     * @param path
     *        	excel文件路径（包含了文件名）
     * @return  sheetName信息
     */
    public static List<Map<String, String>> getSheets(String path) {
        path = uploadFilePath + path;
        String ext = getExtensionName(path);
        if (ext.equalsIgnoreCase("xls")) {
            return getHssfSheets(path);
        } else {
            return getXssfSheets(path);	// .xlsx
        }
    }

    /**
     * 根据excel文件名，读取上传路径下的表单属性
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;xls格式类型的解析
     * </p>
     * @param filePath
     *        	excel文件路径（包含了文件名）
     * @return  sheetName信息(index,name)
     */
    private static List<Map<String, String>> getHssfSheets(String filePath) {
        List<Map<String, String>> re = new ArrayList<>();
        try {
            InputStream in = new FileInputStream(filePath);
            POIFSFileSystem poi = new POIFSFileSystem(in);
            HSSFWorkbook wk = new HSSFWorkbook(poi);
            int num = wk.getNumberOfSheets();// 表单数
            for (int i = 0; i < num; i++) {
                Map<String, String> map = new HashMap<>();
                map.put("index", i + "");// 表单序号
                map.put("name", wk.getSheetName(i));// 表单名
                re.add(map);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return re;
    }

    /**
     * 根据excel文件名，读取上传路径下的表单属性
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;xlsx格式类型的解析
     * </p>
     * @param filePath
     *        	excel文件路径（包含了文件名）
     * @return  sheetName信息(index,name)
     */
    private static List<Map<String, String>> getXssfSheets(String filePath) {
        List<Map<String, String>> re = new ArrayList<>();
        try {
            InputStream in = new FileInputStream(filePath);
            XSSFWorkbook wk = new XSSFWorkbook(in);
            int num = wk.getNumberOfSheets();
            for (int i = 0; i < num; i++) {
                Map<String, String> map = new HashMap<>();
                map.put("index", i + "");
                map.put("name", wk.getSheetName(i));
                re.add(map);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return re;
    }
}