package com.supermap.sgis.visual.service;

import com.supermap.sgis.visual.common.PeriodSupport;
import com.supermap.sgis.visual.dao.MacroTableinfoDao;
import com.supermap.sgis.visual.dao.MacroTablemetaDao;
import com.supermap.sgis.visual.entity.TMacroPeriod;
import com.supermap.sgis.visual.json.TimeRank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by zhangjunfeng on 14-4-1.
 */
@Service
public class MacroTableinfoService {
    @Autowired
    MacroTableinfoDao macroTableinfoDao;
    @Autowired
    MacroTablemetaDao macroTablemetaDao;

    //根据指标父节点(表)ID查询报告
    public List<TMacroPeriod> getPeriodByParid(int parid) {
        return macroTableinfoDao.findPeriodByParid(parid);
    }

    //根据指标ID组查询报告
    public List<TMacroPeriod> getPeriodByMatmids(int[] matmids) {
        return macroTableinfoDao.findPeriodByMatmids(matmids);
    }

    //根据查询报告期数据，生成报告期时段
    public TimeRank calculateTimeRank(List<TMacroPeriod> macroPeriods, int reportType) {
//        Calendar cal = Calendar.getInstance();
//        int year = cal.get(Calendar.YEAR);
//        int month = cal.get(Calendar.MONTH) + 1;
        int size = macroPeriods.size() ;
        if(size == 0){
            return  new TimeRank(-1,-1,-1,-1);//无效报告期 不存在
        }
        int endY = macroPeriods.get(macroPeriods.size()-1).getYear() ;//按年份月份排好序，取最后一条为最大年份
        int startY = macroPeriods.get(0).getYear() ;
        int startM = 0, endM = 0;
        //非年报类型
        if(!PeriodSupport.isYearType(reportType)){
            startM = macroPeriods.get(0).getMonth();
            endM = macroPeriods.get(macroPeriods.size()-1).getMonth();
        }

//        Iterator iterator = macroPeriods.iterator();
//        while (iterator.hasNext()) {
//            TMacroPeriod p = (TMacroPeriod) iterator.next();//报告期
//            //年报、经济、人口的报告期timeRank一致，都按年份
//        }
        TimeRank timeRank = new TimeRank(startY, endY, startM, endM);//最大报告期默认当前
        return timeRank;
    }

    /**
     * 报告期 trim  左右去空 季报month = 13,114,15,16
     * @param timeRank
     * @param tableName
     * @param indicatorStr
     * @return
     */
    public TimeRank trimTimeRank(TimeRank timeRank,String tableName,String indicatorStr,int reportType){
        int startYear = timeRank.getFromYear();
        int endYear = timeRank.getToYear();
        int startMonth = timeRank.getFromMonth();
        int endMonth = timeRank.getToMonth();

        List<Integer> years = new ArrayList<>();   //所有年份
        List<Integer> months = new ArrayList<>();  //所有月份

        int temp = startYear;
        while (temp<=endYear){
            years.add(temp);
            temp ++;
        }
        temp = startMonth;
        while (temp<=endMonth){
            months.add(temp);
            temp++;
        }

        //年
        int yearSize = years.size();
        for(int i =0;i<yearSize;i++){   //年份左去空
            int year = years.get(i);
            Boolean foo =  this.hasPeroidData(tableName,indicatorStr,year,reportType);
            if(foo){
                startYear = year;
                break;
            }
        }
        for(int i =yearSize-1;i>=0;i--){  //年份右去空
            int year = years.get(i);
            Boolean foo =  this.hasPeroidData(tableName,indicatorStr,year,reportType);
            if(foo){
                endYear = year;
                break;
            }
        }

        //月
        if(reportType!=1&&reportType!=2&&reportType!=3&&reportType!=4&&reportType!=11){  //普查 年报不过滤月份
            int monthSize = months.size();
            for(int i =0;i<monthSize;i++){  //月份左去空
                int month = months.get(i);
                Boolean foo =  this.hasPeroidData(tableName,indicatorStr,month,reportType);
                if(foo){
                    startMonth = month;
                    break;
                }
            }
            for(int i =monthSize-1;i>=0;i--){  //月份右去空
                int month = months.get(i);
                Boolean foo =  this.hasPeroidData(tableName,indicatorStr,month,reportType);
                if(foo){
                    endMonth = month;
                    break;
                }
            }
        }
        return new TimeRank(startYear,endYear,startMonth,endMonth);
    }

    /**
     * 是否存在此时间数据
     * @param tableName
     * @param timeStr
     * @return
     */
    public Boolean hasPeroidData(String tableName,String indicatorStr,int timeStr,int reportType){
        Boolean has = false;
        String timeSQL = " t.year = "+timeStr;
        if(reportType==12 || reportType==13){   //季报 和 月报
           timeSQL = "  t.month = '"+timeStr+"'";
        }
        String sql = "select t.* from "+tableName+" t WHERE t.iden_code in ("+indicatorStr+") and  " + timeSQL;   //地区暂不考虑了
//        System.out.println("查询是否存在是时间的数据的ＳＱＬ：" + sql);
        List datas = macroTablemetaDao.query(sql);
        if(datas.size()>0){
            has = true;
        }
        return has;
    }
}
