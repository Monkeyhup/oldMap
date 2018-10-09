package com.supermap.sgis.visual.common;


import com.supermap.sgis.visual.cons.CMacroReportType;
import com.supermap.sgis.visual.entity.TMacroPeriod;
import com.supermap.sgis.visual.json.Period;
import com.supermap.sgis.visual.json.TimeRank;

import java.util.ArrayList;
import java.util.List;

/**
 * 行政区划编码的统一处理方法
 *
 * @author Created by zhangjunfeng on 14-3-19.
 * @author Updated by ruanrp on 14-12-1
 * @author Modify by Linhao on 14-2-4
 */
public class PeriodSupport {

    //判断是否年报
    public static boolean isYearType(int reportType){
        if(reportType == CMacroReportType.YEAR_TYPE ||
                reportType == CMacroReportType.ANNALES_TYPE||
                reportType == CMacroReportType.POPULATION_TYPE ||
                reportType == CMacroReportType.ECONOMICCENSUS_TYPE ||
                reportType == CMacroReportType.AGRICULTURE_TYPE){
            return true;
        }
        return false;
    }

    public static boolean hasData(List<TMacroPeriod> hasDataPeriods,int year ,int month){

        for(TMacroPeriod p:hasDataPeriods){
            int y = p.getYear();
            int m = p.getMonth();
            if(year == y && m == month){
                return true;
            }
        }

        return false;
    }

    //根据timeRank构建出时段信息
    public static List<TMacroPeriod> createPeriodByTimeRankAndCheck(int reportType,TimeRank timeRank,List<TMacroPeriod> hasDataPeriods){
        List<TMacroPeriod> periods = new ArrayList<>();
        if(timeRank==null){
            System.out.println("报告期null");
            return periods;
        }
        String yearStr ="";
        for (int i = timeRank.getFromYear(); i <= timeRank.getToYear(); i++) {
            if (i == timeRank.getToYear()) {
                yearStr += i;
            } else{
                yearStr += i + ",";
            }
        }
        String [] yearArr = yearStr.split(",");
        //年度、年鉴（包括人口、经济）
        if (isYearType(reportType)) {
            for(String y:yearArr){
                String str = reportType == CMacroReportType.AGRICULTURE_TYPE?"年鉴":"年报";
                int year = Integer.parseInt(y);                         //年 int
                TMacroPeriod p = new TMacroPeriod();
                p.setYear(year);
                p.setMonth(0);
                p.setReportType(reportType);
                p.setName(y + "年");
                p.setReportTypeName(y + "年"+str);

                String hasData = "false";
                hasData = hasData(hasDataPeriods,year,0)?"true":"false";
                p.setFlagA(hasData);                                    //将是否有数据写入

                periods.add(p);
            }
            //月报
        } else if (reportType == CMacroReportType.MONTH_TYPE) {
            for(String y:yearArr){
                int year = Integer.parseInt(y);
                int startM = 1;
                int endM = 12 ;
                startM = year == timeRank.getFromYear()?timeRank.getFromMonth():startM;
                endM  = year == timeRank.getToYear()?timeRank.getToMonth():endM;
                for(int mindex =startM ; mindex<= endM ;mindex++){
                    TMacroPeriod p = new TMacroPeriod();
                    p.setYear(year);
                    p.setMonth(mindex);
                    p.setReportType(reportType);
                    p.setName(y+"年"+mindex+"月");
                    p.setReportTypeName(y + "年月报");

                    String hasData = "false";
                    hasData = hasData(hasDataPeriods,year,mindex)?"true":"false";
                    p.setFlagA(hasData);

                    periods.add(p);
                }
            }
            //季报
        } else if (reportType == CMacroReportType.SESSION_TYPE) {
            for(String y:yearArr){
                int year = Integer.parseInt(y);
                int startM = 13;
                int endM = 16 ;
                startM = year == timeRank.getFromYear()?timeRank.getFromMonth():startM;
                endM  = year == timeRank.getFromYear()?timeRank.getToMonth():endM;
                for(int mindex =startM ; mindex<= endM ;mindex++){
                    TMacroPeriod p = new TMacroPeriod();
                    p.setYear(year);
                    p.setMonth(mindex);
                    p.setReportType(reportType);
                    p.setName(y+"年"+(mindex-12)+"季度");
                    p.setReportTypeName(y + "年季报");

                    String hasData = "false";
                    hasData = hasData(hasDataPeriods,year,mindex)?"true":"false";
                    p.setFlagA(hasData);

                    periods.add(p);
                }
            }
            //半年报
        }else if (reportType == CMacroReportType.HALFYEAR_TYPE) {
            for(String y:yearArr){
                int year = Integer.parseInt(y);
                int startM = 0;
                int endM = 1 ;
                startM = year == timeRank.getFromYear()?timeRank.getFromMonth():startM;
                endM  = year == timeRank.getFromYear()?timeRank.getToMonth():endM;
                for(int mindex =startM ; mindex<= endM ;mindex++){
                    String str = mindex==0?"上":"下";
                    TMacroPeriod p = new TMacroPeriod();
                    p.setYear(year);
                    p.setMonth(mindex);
                    p.setReportType(reportType);
                    p.setName(y+"年"+str+"半年报");
                    p.setReportTypeName(y + "年半年报");

                    String hasData = "false";
                    hasData = hasData(hasDataPeriods,year,mindex)?"true":"false";
                    p.setFlagA(hasData);

                    periods.add(p);
                }
            }
        }
        return  periods;
    }

    //根据timeRank构建出时段信息
    public static List<TMacroPeriod> createPeriodByTimeRank(int reportType,TimeRank timeRank){
        List<TMacroPeriod> periods = new ArrayList<>();
        if(timeRank==null){
            System.out.println("报告期null");
            return periods;
        }
        String yearStr ="";
        for (int i = timeRank.getFromYear(); i <= timeRank.getToYear(); i++) {
            if (i == timeRank.getToYear()) {
                yearStr += i;
            } else{
                yearStr += i + ",";
            }
        }
        String [] yearArr = yearStr.split(",");
        //年度、年鉴（包括人口、经济）
        if (isYearType(reportType)) {
            for(String y:yearArr){
                String str = reportType == CMacroReportType.AGRICULTURE_TYPE?"年鉴":"年报";
                int year = Integer.parseInt(y);                         //年 int
                TMacroPeriod p = new TMacroPeriod();
                p.setYear(year);
                p.setMonth(0);
                p.setReportType(reportType);
                p.setName(y + "年");
                p.setReportTypeName(y + "年"+str);
                periods.add(p);
            }
            //月报
        } else if (reportType == CMacroReportType.MONTH_TYPE) {
            for(String y:yearArr){
                int year = Integer.parseInt(y);
                int startM = 1;
                int endM = 12 ;
                startM = year == timeRank.getFromYear()?timeRank.getFromMonth():startM;
                endM  = year == timeRank.getToYear()?timeRank.getToMonth():endM;
                for(int mindex =startM ; mindex<= endM ;mindex++){
                    TMacroPeriod p = new TMacroPeriod();
                    p.setYear(year);
                    p.setMonth(mindex);
                    p.setReportType(reportType);
                    p.setName(y+"年"+mindex+"月");
                    p.setReportTypeName(y + "年月报");
                    periods.add(p);
                }
            }
            //季报
        } else if (reportType == CMacroReportType.SESSION_TYPE) {
            for(String y:yearArr){
                int year = Integer.parseInt(y);
                int startM = 13;
                int endM = 16 ;
                startM = year == timeRank.getFromYear()?timeRank.getFromMonth():startM;
                endM  = year == timeRank.getFromYear()?timeRank.getToMonth():endM;
                for(int mindex =startM ; mindex<= endM ;mindex++){
                    TMacroPeriod p = new TMacroPeriod();
                    p.setYear(year);
                    p.setMonth(mindex);
                    p.setReportType(reportType);
                    p.setName(y+"年"+(mindex-12)+"季度");
                    p.setReportTypeName(y + "年季报");
                    periods.add(p);
                }
            }
            //半年报
        }else if (reportType == CMacroReportType.HALFYEAR_TYPE) {
            for(String y:yearArr){
                int year = Integer.parseInt(y);
                int startM = 0;
                int endM = 1 ;
                startM = year == timeRank.getFromYear()?timeRank.getFromMonth():startM;
                endM  = year == timeRank.getFromYear()?timeRank.getToMonth():endM;
                for(int mindex =startM ; mindex<= endM ;mindex++){
                    String str = mindex==0?"上":"下";
                    TMacroPeriod p = new TMacroPeriod();
                    p.setYear(year);
                    p.setMonth(mindex);
                    p.setReportType(reportType);
                    p.setName(y+"年"+str+"半年报");
                    p.setReportTypeName(y + "年半年报");
                    periods.add(p);
                }
            }
        }
        return  periods;
    }

    /**获取报告期SQL条件*/
    public static  String getTimeRankSql(TimeRank timeRank, int reportType) {
        if(timeRank==null){
            System.out.println("报告期null");
            return "";
        }
        String sqlResult = "";
        String yearRank = getYearRank(timeRank.getFromYear(), timeRank.getToYear());
        String monthRank = getMonthRank(reportType, timeRank);
        String yearSql = yearRank.indexOf(",")==-1 ? " year = "+yearRank : " year in (" + yearRank + ")";
        String monthSql = monthRank.indexOf(",")==-1 ? " and month = "+monthRank : " and month in (" + monthRank + ")";
        switch (reportType) {
            case 1: //经济普查
                sqlResult = yearSql;
                break;
            case 2: //人口普查
                sqlResult = yearSql;
                break;
            case 11: //年报
                sqlResult = yearSql + " and month = 0";
                break;
            case 12: //季报
                sqlResult = yearSql + monthSql;
                break;
            case 13: //月报
                sqlResult = yearSql + monthSql;
                break;
            //可扩展 其他数据类型 年鉴3
            default:
                sqlResult = yearSql + " and month = 0";
                break;
        }
        return sqlResult;
    }


    /**月季报条件*/
    public static  String getMonthRank(int reportType, TimeRank timeRank) {
        String result = "";
        int startY = timeRank.getFromYear() ;
        int endY = timeRank.getToYear() ;
        int startM = timeRank.getFromMonth() ;
        int endM = timeRank.getToMonth() ;
        if (startY == endY) {
            if (reportType == 12 || reportType == 13) {//季报 季报
                for (int i = startM; i <= endM; i++) {
                    if (i == endM) {
                        result += i;
                    } else
                        result += i + ",";
                }
            }
        } else //多年份的不是fromMonth-toMonth！！！！
        {
            int min = 1;
            int max =12 ;
            if (reportType == 12) {//季报
                min = 13 ;
                max = 16 ;
            } else if (reportType == 13) {//月报

            }
            for(int  i =min ;i <= max ;i++){
                result += (i==max?i:i+",");
            }
        }
        return result;
    }

    public static  String getYearRank(int fromYear, int toYear) {
        String result = "";
        for (int i = fromYear; i <= toYear; i++) {
            if (i == toYear) {
                result += i;
            } else
                result += i + ",";
        }
        return result;
    }

    /**
     *获取报告期（名称）前缀
     * @param p
     * @return
     */
    public static String getPrefix(Period p){
        String prefix = getPrefix(p.getReportType(), p.getYear(), p.getMonth());
        return  prefix;
    }

    /**
     *获取报告期前缀
     * @param reportType
     * @param year
     * @param month
     * @return
     */
    public static String getPrefix(int reportType, int year, int month){
        String prefix = "";
        switch (reportType) {
            case 11:
                prefix = year + "年";
                break;
            case 12:
                prefix = year + "年第" + (month>12?(month-12):month) + "季度";
                break;
            case 13:
                prefix = year + "年" + month + "月";
                break;
            case 14:
                int num = month>=17?(month-17):month;
                prefix = year + "年" + (num==0?"上":"下") + "半年";
                break;
            default: //经济普查人口普查
                prefix = year + "年";
                break;
        }
        return  prefix;
    }

    /**
     * 获取报告期类型的名称
     * @param reportType
     * @return
     */
    public static  String getReportTypeName(int reportType){
        String name = "";
        switch (reportType){
            case 11:
                name ="年报" ;
                break;
            case 12:
                name ="季报" ;
                break;
            case 13:
                name ="月报" ;
                break;
            case 14:
                name ="半年报" ;
                break;
            case 1:
                name ="年度经普" ;
                break;
            case 2:
                name ="年度人普" ;
                break;
            case 3:
                name ="年度农普" ;
                break;
            case 4:
                name ="年鉴" ;
                break;
            default:
                name ="年度" ;//经济普查人口普查
                break;
        }
        return name ;
    }
}
