package com.supermap.sgis.visual.service;


import com.supermap.sgis.visual.common.RegionSupport;
import com.supermap.sgis.visual.cons.CMacroReportType;
import com.supermap.sgis.visual.dao.*;
import com.supermap.sgis.visual.entity.*;
import com.supermap.sgis.visual.json.MacroDataImport;
import com.supermap.sgis.visual.tool.ExcelUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by W.Qiong on 14-9-6.
 * 综合数据导入
 */
@Service
public class MacroDataImportService extends BaseService {
    @Autowired
    MacroTablemetaDao macroTablemetaDao;
    @Autowired
    MacroTableinfoDao macroTableinfoDao;
    @Autowired
    MacroIdenmetaDao macroIdenmetaDao;
    @Autowired
    RegionInfoDao regionInfoDao;
    @Autowired
    MacroPeriodDao macroPeriodDao ;
    @Autowired
    MacroIdenvlDao macroIdenvlDao ;

    public  String importStart(HttpServletRequest request,MacroDataImport dataImport){
        List<List<Object>> dataList = ExcelUtil.readExcel(dataImport.getFileName(), dataImport.getSheetName(), 0);
        int startRow = dataImport.getStartRow() ;
        int catalogId = dataImport.getCatalogId();
        int startCol = dataImport.getStartCol();
        int regionCol = dataImport.getRegionCol() ;
        String tableName = RegionSupport.getDataTableName(dataImport.getRegionLevel());
        List<Map<String,String>> indicators = dataImport.getIndicators() ;
        StringBuilder errorInfos = new StringBuilder();
        int successNum = 0 ;
        int errorNum = 0;
        //时段管理
        TMacroPeriod period = periodManage(dataImport);
        //tableInfo表的维护
        pushToTableInfo(dataImport.getMatmid(),period,indicators);

        //扁平处理所有指标 ，加入分组指标，顺序与excel一致
        List<String> allIndicators = flatIndicators(indicators) ;
        List<Integer> errorRows = new ArrayList<>() ;
        Map<String,List<String>> sqlMap = new HashMap<>();//按照行政区划组织
        List<String> sqlList = new ArrayList<>() ;
        List<String> delSqlList = new ArrayList<>() ;//用于删除旧数据的sql

        System.out.println("开始构建导入sql"+new Date().toString());
        Pattern p = Pattern.compile("[\u4e00-\u9fa5]"); //匹配行政区划名称
        for(int i = startRow ; i< dataList.size() ; i++){
            List<Object> row = dataList.get(i) ;
            if(row.size() <regionCol ||row.size() <startCol){
                errorRows.add(i);
                continue;
            }
            Object  code = row.get(regionCol) ;
            //区划为空
            if(null==code){
                errorRows.add(i);
                continue;
            }
            String regionCode =code.toString() ;
            //区域代码为空 跳过行
            if(null ==regionCode||regionCode.equals("")){
                errorRows.add(i);
                continue;
            }
            Matcher m = p.matcher(regionCode);
            //行政区划级别错误
            if(!m.find()&&RegionSupport.getRegionLevel(regionCode)!=dataImport.getRegionLevel()){
                errorRows.add(i);
                continue;
            }
            //行政区划名称转换为区划代码
            if(m.find()){
               List<TRegioninfo>  rList = this.regionInfoDao.findByFullName(catalogId,
                       dataImport.getRegionLevel(),regionCode) ;
               if(rList.size() >0){
                   regionCode = rList.get(0).getRegioncode() ;
               }else{
                   errorRows.add(i);
                   continue;
               }
            }
            if(!sqlMap.containsKey(regionCode)){
                sqlMap.put(regionCode,new ArrayList<String>()) ;
            }
            //分指标构建sql
            int colIndex = startCol ; //列号
            for(String idenCode :allIndicators){
                String idenVal = "";
                if(colIndex<row.size()){
                    idenVal = row.get(colIndex++).toString() ;
                    idenVal = idenVal.equals("null")?"":idenVal;
                    idenVal = idenVal.trim() ;//去除空格
                }
                String sql = createInsertSql(tableName, regionCode, idenCode, idenVal, period) ;
                sqlList.add(sql);
                delSqlList.add(createDelSql(tableName,regionCode,idenCode,period));
                sqlMap.get(regionCode).add(sql);
            }
        }
        System.out.println("结束构建导入sql"+new Date().toString());

        //根据区划代码 指标代码 时段 删除 不再导入的数据保持原有数据不被删除
        System.out.println("开始删除旧数据"+new Date().toString());
        //这种删除数据方法准确，支持列和行增量导入，但是效率较低
//        this.macroTablemetaDao.batchSqlExecute(delSqlList,1000) ;
        String idenCodes = "";
        for(String idenCode :allIndicators){
            idenCodes +="'"+idenCode+"'," ;
        }
        idenCodes = idenCodes.substring(0,idenCodes.length()-1) ;    //去除最后一个逗号

        //当前导入数据的行政区划code
        Object[] regioncodeObjs = sqlMap.keySet().toArray();
        String regioncodes = "(";
        for(int a=0;a<regioncodeObjs.length;a++){
            if(a==regioncodeObjs.length-1){
                regioncodes += regioncodeObjs[a].toString() + ")";
            }else{
                regioncodes += regioncodeObjs[a].toString() + ",";
            }
        }


        String delSql = "delete from "+tableName +"  where year="+period.getYear()+" and month="+period.getMonth()
                +" and iden_code in("+idenCodes+") ";


        //只删除当前导入的行政区划的数据
        if(regioncodes.endsWith(")") && regioncodeObjs.length<999){
              delSql = "delete from "+tableName +"  where year="+period.getYear()+" and month="+period.getMonth()
                    +" and iden_code in("+idenCodes+") and regioncode in  " + regioncodes;
        }


        this.macroTablemetaDao.executeBySql(delSql) ;
        System.out.println("结束删除旧数据"+new Date().toLocaleString());

        System.out.println("开始数据导入: "+new Date().toString());
        this.macroTablemetaDao.batchSqlExecute(sqlList,1000) ;
        System.out.println("结束数据导入"+new Date().toString());

//        System.out.println("开始去除重复"+new Date().toString());
//        delRepeat(tableName,period,allIndicators);
//        System.out.println("结束去除重复"+new Date().toString());

        System.out.println("开始去除无效行政区划代码"+new Date().toString());
        List<String> errorRegions = delInvalidRegioncode(tableName, dataImport.getRegionLevel(), period, allIndicators);
        System.out.println("结束去除无效行政区划代码"+new Date().toString());

        List errorData = new ArrayList() ;
        for(Integer in :errorRows){
            errorData.add(dataList.get(in));
        }
        //去除重复的错误行政区划代码
        Map<String,String> uniqueErrorRegion = new HashMap<>();
        List<String> newErrorRegions =new ArrayList<>() ;
        for(String errorCode :errorRegions){
            if(uniqueErrorRegion.containsKey(errorCode)){
                continue;
            }
            uniqueErrorRegion.put(errorCode,errorCode);
            newErrorRegions.add(errorCode);
        }
        //获取区划代码错误列 从数据行开始
        for( int rowIndex =startRow;rowIndex< dataList.size() ;rowIndex++){
            List row = dataList.get(rowIndex);
            if(row.size()==0||row.size()<=regionCol){ continue; } //存在中间空行的情况
            Object  code = row.get(regionCol) ;
            if(null==code||code.toString().equals("")){
                continue;
            }
            for(String errorCode :newErrorRegions){
                if( code.equals(errorCode)){
                    errorData.add(row);
                }
            }
        }
        if(errorData.size()>0){
            System.out.println("开始输出错误列表"+new Date().toString());
            //错误信息输出加上表头
            List<List<Object>> exportData =new ArrayList<>() ;
            for(int i=0 ,size=startRow;i<size ;i++){
                exportData.add(dataList.get(i));
            }
            exportData.addAll(errorData) ;
            exportError(request,new ArrayList(),exportData);
            System.out.println("结束输出错误列表" + new Date().toString());
        }

        errorNum = errorData.size() ;
        successNum = dataList.size() - startRow - errorNum ;
        if(successNum>0){
            TMacroTablemeta t = macroTablemetaDao.findOne(dataImport.getMatmid()) ;
            t.setStatus(2);//已导入数据
            macroTablemetaDao.save(t);
        }
        //导入成功与否 都记录住调整好的指标顺序
        modifyTablemetaOrderby(dataImport);

        return "成功导入"+successNum+"条数据;有"+errorNum+"条数据导入失败";
    }


    /**
     * 导出错误信息 暂放session里
     * @param request
     * @param head
     * @param errorList
     * @param errorList
     */
    private void exportError(HttpServletRequest request,
                             List<Object> head,List<List<Object>> errorList){
        String[] h = new String[head.size()];
        int i =0 ;
        for(Object o:head){
            h[i] = null==o?"":o.toString() ;
        }
        HSSFWorkbook wk = ExcelUtil.dataToWorkbook("excel数据错误列表",h,errorList);
        request.getSession().setAttribute("wk",wk);
        request.getSession().setAttribute("fileName","excel数据错误列表");
        return;
    }

    /**
     * 扁平化分组指标，指标顺序与excel数据一致
     * @param indicators
     * @return
     */
    private List<String> flatIndicators(List<Map<String ,String>> indicators){
        List<String> allIndicators = new ArrayList<>() ;
        for(Map<String,String> map :indicators){
            String idenCode = map.get("idenCode");
            int groupId =  Integer.parseInt(map.get("groupId"));//分组id
            int matmid = Integer.parseInt(map.get("matmid"));
            List<String> subIdeCodes = getSubIdenCodes(groupId,"0",matmid);
            allIndicators.add(idenCode);
            for(String sunIdeCode:subIdeCodes){
                allIndicators.add(sunIdeCode);
            }
        }
        return  allIndicators ;
    }

    /**
     * 获取指标及指标分组下的所有指标，树结构一维化
     * @param groupId
     * @param parid
     * @param matmid
     * @return
     */
    private List<String> getSubIdenCodes(int groupId,String parid,int matmid){
        List<String> idenCodes = new ArrayList<>();
        List<TMacroIdenmeta> idenmetas =  this.macroIdenmetaDao.findGroupIndByParidAndMaitid(matmid, groupId, parid);
        for(TMacroIdenmeta idenmeta:idenmetas){
            idenCodes.add(idenmeta.getIdenCode());
            TMacroIdenvl idenvl = idenmeta.getTMacroIdenvl();
            if(null !=idenvl){
                idenCodes.addAll(getSubIdenCodes(groupId, idenvl.getCode(),matmid));
            }
        }
        return idenCodes ;
    }

    /**
     * 维护指标顺序 按照导入时的顺序做调整
     * @param dataImport
     * @return
     */
    private  boolean modifyTablemetaOrderby(MacroDataImport dataImport){
        int parid = dataImport.getMatmid();
        List<Map<String,String>> indicators = dataImport.getIndicators() ;
        int[] matmids = new int[indicators.size()];
        int size =0;
        for(Map<String,String> ind:indicators){
            String idenCode = ind.get("idenCode");
            int groupId =  Integer.parseInt(ind.get("groupId"));//分组id
            int matmid = Integer.parseInt(ind.get("matmid"));
            matmids[size++] = matmid ;
            TMacroTablemeta tablemeta = this.macroTablemetaDao.findOne(matmid);
            tablemeta.setOrderby(size);
            this.macroTablemetaDao.save(tablemeta);
        }

        List<TMacroTablemeta> others = this.macroTablemetaDao.findOthers(parid, matmids);
        if(null == others){ return  true ;}
        for(TMacroTablemeta tablemeta:others){
            tablemeta.setOrderby(++size);
            this.macroTablemetaDao.save(tablemeta);
        }
        return  true ;
    }

    /**
     * 时段管理
     * @param dataImport
     * @return
     */
    private  TMacroPeriod periodManage(MacroDataImport dataImport){
        int reportType = dataImport.getReportType() ;
        int year = dataImport.getYear();
        int month = dataImport.getMonth();
        int catalogId = dataImport.getCatalogId() ;
        TMacroPeriod period = this.macroPeriodDao.checkExist(reportType,year,month,catalogId);
        if(null == period){
            period = createPeroid(reportType,year,month,catalogId);
        }
        return  period ;
    }

    private  TMacroPeriod createPeroid(int reportType,int year ,int month,int catalog){

        String reportTypeName ="";
        if(reportType == CMacroReportType.MONTH_TYPE){
            reportTypeName = year +"年" +month+"月";
        }else if(reportType == CMacroReportType.SESSION_TYPE){
            reportTypeName = year +"年第" +(month-12)+"季度";
        }else{
            reportTypeName = year+"年";
            if(reportType == CMacroReportType.ECONOMICCENSUS_TYPE){
                reportTypeName += "经济普查";

            }else if(reportType == CMacroReportType.POPULATION_TYPE){
                reportTypeName += "人口普查";

            }else if(reportType == CMacroReportType.ANNALES_TYPE){
                reportTypeName += "年鉴";

            }
        }
        TRegioncatalog r = new TRegioncatalog();
        r.setRcid(catalog);
        TMacroPeriod p = new TMacroPeriod() ;
        p.setName(reportTypeName);//年+月（季度）
        p.setReportType(reportType);
        p.setYear(year);
        p.setMonth(month);
        p.setAcid(0);
        p.setStatus(1);
        p.setReportTypeName(reportTypeName);
        p.setTRegioncatalog(r);
        return this.macroPeriodDao.save(p);
    }

    //维护tableinfo
    private void  pushToTableInfo(int parid ,TMacroPeriod period, List<Map<String,String>> indicators){

        //表节点 及指标 删除
        List<TMacroTableinfo> tableinfoList = this.macroTableinfoDao.findByLevelAndPerid(period.getMapid(), parid, parid);
        //如果已经存在，先删除
        if(null !=tableinfoList&&tableinfoList.size()>0){
            for(TMacroTableinfo table:tableinfoList){
                //分组指标也要删除
                int matmid = table.getTMacroTablemeta().getMatmid() ;
                List<TMacroTableinfo> gtableInfos = this.macroTableinfoDao.findByLevelAndPerid(period.getMapid(),
                        matmid,matmid);

                this.macroTableinfoDao.deleteInBatch(gtableInfos);
                this.macroTableinfoDao.delete(table);
            }
        }

        //表结点
        TMacroTablemeta tableItem = this.macroTablemetaDao.findOne(parid);
        TMacroTableinfo tableinfo = new TMacroTableinfo();
        //相同属性复制
        tableinfo =(TMacroTableinfo) convertBeanTOBean(tableItem,tableinfo);
        tableinfo.setTMacroTablemeta(tableItem);
        tableinfo.setParid(0);//表节点父节点为0
        tableinfo.setTMacroPeriod(period);
        tableinfo.setStatus(1);//默认值 数据库里可设置
        this.macroTableinfoDao.save(tableinfo);

        //指标结点 分组也要考虑进来？？
        for(Map<String,String>map : indicators){
            tableinfo = new TMacroTableinfo();
            int matmid = Integer.parseInt(map.get("matmid"));
            int groupId =  Integer.parseInt(map.get("groupId"));//分组id
            TMacroTablemeta meta = macroTablemetaDao.findOne(matmid);
            if(null == meta){
                continue;
            }
            tableinfo =(TMacroTableinfo) convertBeanTOBean(meta,tableinfo);
            tableinfo.setTMacroTablemeta(meta);
            tableinfo.setTMacroPeriod(period);
            tableinfo.setStatus(1);//默认值 数据库里可设置
            this.macroTableinfoDao.save(tableinfo);

            if(groupId == -1){
                continue;
            }
            //分组指标维护
            List<TMacroIdenmeta> idenmetas =  this.macroIdenmetaDao.findByEnum(matmid,groupId);
            for(TMacroIdenmeta idenmeta :idenmetas){
                TMacroTableinfo gIden = new TMacroTableinfo();
                gIden =(TMacroTableinfo) convertBeanTOBean(idenmeta,gIden);
                gIden.setParid(matmid);
                gIden.setTMacroTablemeta(meta);
                gIden.setTMacroPeriod(period);
                this.macroTableinfoDao.save(gIden);
            }
        }
    }

    /**
     * 构建导入sql
     * @param tableName
     * @param regionCode
     * @param idenCode
     * @param idenVal
     * @param p
     * @return
     */
    private String createInsertSql(String tableName,String regionCode ,String idenCode,String idenVal,TMacroPeriod p){
        String fields = "year,month,regioncode,iden_code,iden_value";
        int year = p.getYear() ;
        int month  = p.getMonth() ;
        String insertSql = "insert into "+tableName+"("+fields+") values("
                +"'" +year+"',"
                +"'" +month+"',"
                +"'" +regionCode+"',"
                +"'" +idenCode+"','"
                +(null==idenVal?"":idenVal)+"')";
        return  insertSql ;
    }

    /**
     * 创建删除语句 避免与旧数据重复
     * @param tableName
     * @param regionCode
     * @param idenCode
     * @param p
     * @return
     */
    private  String createDelSql(String tableName, String regionCode,String idenCode,TMacroPeriod p){
        int year = p.getYear() ;
        int month  = p.getMonth() ;
        String delSql = "delete from "+tableName +"  where year="+year+" and month="+month
                +" and iden_code='"+idenCode+"' and regioncode='"+regionCode+"' ";
        return  delSql ;
    }

    private boolean importOne(String tableName,String regionCode ,String idenCode,String idenVal,TMacroPeriod p){

        String fields = "year,month,regioncode,iden_code,iden_value";
        int year = p.getYear() ;
        int month  = p.getMonth() ;
//        String  delSql = "delete from "+tableName+" where year="+year
//                +" and month ="+month
//                +" and regioncode ='"+regionCode+"'"
//                +" and iden_code ='"+idenCode+"'";
//        //先做删除操作 避免重复
//        this.macroTablemetaDao.executeBySql(delSql);
        String insertSql = "insert into "+tableName+"("+fields+") values("
                +"'" +year+"',"
                +"'" +month+"',"
                +"'" +regionCode+"',"
                +"'" +idenCode+"','"
                +idenVal+"')";
        int re =0 ;
        try {
            re  = this.macroTablemetaDao.executeBySql(insertSql);
        }catch (Exception e){
            re = 0;
        }
        return  re>0?true:false ;
    }

    /**
     * 去重重复数据
     * @param p
     * @param allIndicators
     */
    private boolean delRepeat(String tableName, TMacroPeriod p ,List<String> allIndicators){
        int year = p.getYear() ;
        int month =  p.getMonth() ;
        StringBuilder idenCodes = new StringBuilder();
        int i =0 ,size = allIndicators.size();
        for(String ind :allIndicators){
            idenCodes.append("'"+ind+"'") ;
            i++;
            if(i<size){
                idenCodes.append(",");
            }
        }
        String  delSql = "delete from "+tableName+" t where year="+year
                +" and month ="+month
                +" and iden_code in("+idenCodes+") and " +
                "t.rowid !=(select max(t1.rowid) from "+tableName+" t1 where t1.year = t.year " +
                "and t1.month =t.month and t1.regioncode=t.regioncode and t1.iden_code=t.iden_code) ";

        int re =0 ;
        try {
            re  = this.macroTablemetaDao.executeBySql(delSql);
        }catch (Exception e){
            System.out.println("去除综合数据表"+tableName+"重复s错误:"+delSql);
            re = 0;
        }
        return  re >0?true:false ;
    }

    /**
     * 无效行政区划数据 删除
     */
    private  List<String> delInvalidRegioncode(String tableName, int regionLevel ,TMacroPeriod p ,List<String> allIndicators){
        int year = p.getYear() ;
        int month =  p.getMonth() ;
        int rcid = p.getTRegioncatalog().getRcid() ;
        StringBuilder idenCodes = new StringBuilder();
        int i =0 ,size = allIndicators.size();
        for(String ind :allIndicators){
            idenCodes.append("'"+ind+"'") ;
            i++;
            if(i<size){
                idenCodes.append(",");
            }
        }
        List<String> errorRegions = new ArrayList<>() ;
        String from ="from "+tableName+" t where " +
                " t.year="+year
                +" and t.month ="+month
                +" and t.iden_code in("+idenCodes+") and not exists(select * from "
                +tableName+" t1,t_regioninfo r where t1.regioncode = r.regioncode and r.regionlevel=" +regionLevel
               +" and r.rcid ="+rcid+" and iden_code in("+idenCodes+") and t1.rowid= t.rowid) ";
        String selSql = "select * "+from ;
        String  delSql =  "delete "+from ;
        List errors = new ArrayList()  ;
        try {
            errors = this.macroTablemetaDao.query(selSql) ;
        }catch (Exception e){
            errors = new ArrayList()  ;
        }
        for(int r =0 ; r<errors.size() ;r++){
            Object[] oneRecord =(Object[]) errors.get(r);
            if(oneRecord.length>2){
                errorRegions.add(oneRecord[2].toString());
            }
        }
        if(errors.size()>0){
            try {
                int re  = this.macroTablemetaDao.executeBySql(delSql);
            }catch (Exception e){
                System.out.println("去除综合数据表"+tableName+"重复错误:"+delSql);
            }
        }
        return  errorRegions ;
    }

}
