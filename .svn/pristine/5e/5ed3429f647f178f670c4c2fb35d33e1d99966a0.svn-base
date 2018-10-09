package com.supermap.sgis.visual.common;


import com.supermap.sgis.visual.json.MacroDataResult;
import com.supermap.sgis.visual.tool.ExcelUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 综合Excel数据操作<br/>
 *
 * 将综合Excel数据转换成 展示三视图的MacroDataResult对象数据
 *
 * Created by Linhao on 2014/10/30.
 */
public class MacroExcelDataUtil {

    /**Excel 数量列的起始列，从第一列开始算*/
    private static int dataFromColNumber = 3;


    public static int getDataFromColNumber() {
        return dataFromColNumber;
    }

    /**
     * 设置Excel 数量列的起始列，从第一列开始算
     *
     * @param dataFromColNumber
     * 				必须大于0
     */
    public static void setDataFromColNumber(int dataFromColNumber) {
        if(dataFromColNumber > 0)
            MacroExcelDataUtil.dataFromColNumber = dataFromColNumber;
    }

    /**
     * 获取Excel的有效行或者列
     *
     * @param excelPath
     * 			excel文件
     * @param sheetName
     * 			sheetName工作簿名
     * @return
     */
    public static Map<String,Integer> getExcelDataRowAndColSize(String excelPath
            ,String sheetName){
        Map<String,Integer> re = new HashMap<String,Integer>();

        int rowSize = 0,colSize=0;

        List<List<Object>> rows = ExcelUtil.readExcel(excelPath, sheetName, 1);
        rowSize = rows.size();			//获取Excel行数
        if(rowSize > 0) {
            List<Object> col1 = rows.get(0);
            colSize = col1.size();        //获取Excel列数
        }

        re.put("rowSize",rowSize);
        re.put("colSize",colSize);

        return re;
    }

    /**
     * 取得指定excel和sheetname的指标名列表
     *
     * @param excelPath
     * 			excel文件
     * @param sheetName
     * 			sheetName工作簿名
     *
     * @return
     */
    public static List<String> getAllIndicatorList(String excelPath,String sheetName){
        List<String> re = new ArrayList<String>();

        String[] heads = ExcelUtil.readExcelHeader(excelPath, sheetName);
        for(int k = 0,len = heads.length;k<len;k++){
            String s = heads[k];
            if(k >= (getDataFromColNumber()-1)) {                    //从数据列开始取
                re.add(s);
            }
        }

        return re;
    }

    /**
     * 将Excel数据装换为MacroDataResult对象
     *
     * @param excelPath
     * 			excel文件
     * @param sheetName
     * 			sheetName工作簿名
     * @param period
     * 			period参数（报告类型参数）
     * @return
     */
    public static MacroDataResult transformMacroExcelDataToMacroDataResult(String excelPath
            ,String sheetName,Period period){
        MacroDataResult re = new MacroDataResult();

        //excel表头
        List head = new ArrayList<>();
        String[] heads = ExcelUtil.readExcelHeader(excelPath, sheetName);
        for(int k = 0,len = heads.length;k<len;k++){
            String s = heads[k];
            head.add((s != null) ? s : "");
        }
        re.setHead(head);				//放置表头信息

        //报告期：目前支持一个报告期
        List<Period> periodsList = new ArrayList<Period>();	//Periods信息
        periodsList.add(period);
        re.setPeriods(periodsList);		//放置periods信息

        List<Indicator> indicators = getIndicatorsByHeads(heads,periodsList);	//从head中读取出单位：注意单位必须放在"（）"中
        re.setIndicators(indicators);	//放置指标单位信息

        String[][] content = null;		//excel数据
        List<List<Object>> rows = ExcelUtil.readExcel(excelPath, sheetName, 1);
        int i = rows.size();			//获取Excel行数
        if(i > 0){
            List<Object> col1 = rows.get(0);
            int j = col1.size();		//获取Excel列数
            if(j > 0){
                re.setStatus(true);
                content = new String[i][j];
                for(int r = 0; r < i; r++){
                    List<Object> row = rows.get(r);	//当前（r+1）行
                    if(row == null)
                        continue;
                    for(int c = 0; c < j; c++){
                        Object col = row.get(c);	//当前（r+1）行,(c+1)列
                        if(col != null){
                            if((col instanceof Double)){
                                content[r][c] = ((Double) col).longValue()+"";
                            }else{
                                content[r][c] = col.toString();
                            }
                        }else{
                            content[r][c] = "";
                        }
                    }//end for(int c = 0; c < j; c++)
                }//end for(int r = 0; r < i; r++)
            }
        }

        re.setContent(content);		//放置内容
        re.setCount(i);				//放置总的条数


        return re;
    }

    /**
     *
     * 从head中读取出单位：注意单位必须放在"（）"或者"()"中
     *
     * @return
     */
    private static List<Indicator> getIndicatorsByHeads(String[] heads,List<Period> periodsList){
        List<Indicator> list = new ArrayList<Indicator>();

        if(heads != null && heads.length > 0){
            for (int i = 0,len=heads.length; i < len; i++) {
                if(i >= (getDataFromColNumber()-1)){					//从数据列开始取
                    String head = heads[i];
                    if(head == null || head.isEmpty()){
                        list.add(new Indicator("","","",
                                periodsList,0,new ArrayList<Indicator>()));				//没有单位
                    }else{
                        String unit = getUnitByHead(head);
                        list.add(new Indicator((unit != null) ? unit : "",head,head
                                ,periodsList,0,new ArrayList<Indicator>()));
                    }
                }
            }//end for (int i = 0; i < heads.length; i++)
        }//end if(heads != null && heads.length > 0)

        return list;
    }

    /**
     * 从head中读取出单位：注意单位必须放在"（）"或者"()"中
     *
     * @param head
     * 			表头名字
     * @return
     */
    private static String getUnitByHead(String head){
        String unit = null;

        int left = head.lastIndexOf("("); 	//英文左括号
        int right = head.lastIndexOf(")");  //英文右括号

        if(left > -1 && right > -1 && left < right){
            unit = head.substring(left+1,right);
        }else{
            left = head.lastIndexOf("（");	//中文左括号
            right = head.lastIndexOf("）");	//中文右括号
            if(left > -1 && right > -1 && left < right){
                unit = head.substring(left+1,right);
            }
        }
        return unit;
    }


    /**
     * MacroExcelDataHandler内部Indicator(报告期)参数类
     * @author Linhao
     *
     */
    public static class Indicator{

        private String idenUnit;
        private String idenCode;
        private String idenName;
        public List<Period> periods;
        public int groupId ;            //分组枚举类
        public List<Indicator> subs;    //子报告期


        public Indicator(){}

        public Indicator(String idenUnit,String idenCode,String idenName,
                         List<Period> periods,int groupId,List<Indicator> subs){
            setIdenUnit(idenUnit);
            setIdenCode(idenCode);
            setIdenName(idenName);
            setPeriods(periods);
            setGroupId(groupId);
            setSubs(subs);
        }

        public String getIdenUnit() {
            return idenUnit;
        }
        public void setIdenUnit(String idenUnit) {
            this.idenUnit = idenUnit;
        }
        public String getIdenCode() {
            return idenCode;
        }
        public void setIdenCode(String idenCode) {
            this.idenCode = idenCode;
        }
        public String getIdenName() {
            return idenName;
        }
        public void setIdenName(String idenName) {
            this.idenName = idenName;
        }
        public void setPeriods(List<Period> periods){this.periods=periods;}
        public List<Period> getPeriods(){return this.periods;}
        public void setGroupId(int groupId){this.groupId=groupId;}
        public int getGroupId(){return this.groupId;}
        public void setSubs(List<Indicator> subs){this.subs=subs;}
        public List<Indicator> getSubs(){return this.subs;}
    }



    /**
     * MacroExcelDataHandler内部Periods参数类
     * @author Linhao
     *
     */
    public static class Period{

        /**报告类型：三经普*/
        public static final int REPORT_TYPE_THIRDGENERAL  = 1;

        /**报告类型：六人普*/
        public static final int REPORT_TYPE_SIXXEDGENERAL  = 2;

        /**报告类型：年报*/
        public static final int REPORT_TYPE_YEAR  = 11;

        /**报告类型：季报*/
        public static final int REPORT_TYPE_QUARTER  = 12;

        /**报告类型：月报*/
        public static final int REPORT_TYPE_MONTH  = 13;

        public Period(){}


        public Period(int year,int month,int reportType,String reportTypeName){
            setYear(year);
            setMonth(month);
            setReportType(reportType);
            setReportTypeName(reportTypeName);
        }

        private int year;
        private int month;
        private int reportType;
        private String reportTypeName;

        public int getYear() {
            return year;
        }
        public void setYear(int year) {
            this.year = year;
        }
        public int getMonth() {
            return month;
        }
        public void setMonth(int month) {
            this.month = month;
        }
        public int getReportType() {
            return reportType;
        }
        public void setReportType(int reportType) {
            this.reportType = reportType;
        }
        public String getReportTypeName() {
            return reportTypeName;
        }
        public void setReportTypeName(String reportTypeName) {
            this.reportTypeName = reportTypeName;
        }
    }
}
