package com.supermap.sgis.visual.service;

import com.sun.org.apache.xpath.internal.operations.Bool;
import com.supermap.sgis.visual.common.PeriodSupport;
import com.supermap.sgis.visual.common.RegionSupport;
import com.supermap.sgis.visual.common.tree.DHTMLXTree;
import com.supermap.sgis.visual.cons.CMacroMetaType;
import com.supermap.sgis.visual.dao.MacroIdenmetaDao;
import com.supermap.sgis.visual.dao.MacroTableinfoDao;
import com.supermap.sgis.visual.dao.MacroTablemetaDao;
import com.supermap.sgis.visual.dao.RegionInfoDao;
import com.supermap.sgis.visual.data.PageInfo;
import com.supermap.sgis.visual.entity.*;
import com.supermap.sgis.visual.json.*;
import com.supermap.sgis.visual.tool.ExcelUtil;
import com.supermap.sgis.visual.tool.MessagePrint;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.hibernate.tool.hbm2ddl.TableMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by zhangjunfeng on 14-3-31.
 */
@Service
public class MacroTablemetaService extends BaseService {
    @Autowired
    MacroTablemetaDao macroTablemetaDao;
    @Autowired
    MacroTableinfoDao macroTableinfoDao;
    @Autowired
    MacroIdenmetaDao macroIdenmetaDao;
    @Autowired
    RegionInfoDao regionInfoDao;

    public boolean one(int mtmid) {
        return macroTablemetaDao.exists(mtmid);
    }

    public TMacroTablemeta getOne(int mtmid) {
        return macroTablemetaDao.getOne(mtmid);
    }

    public MacroTablemeta findOne(int mtmid){
        TMacroTablemeta tablemeta = macroTablemetaDao.getOne(mtmid);
        List<TMacroIdenmeta> idenmetas = macroIdenmetaDao.findByTablemeta(mtmid);
        MacroTablemeta re = (MacroTablemeta)convertBeanTOBean(tablemeta,new MacroTablemeta());
        if(null!=idenmetas&&idenmetas.size()>0){
            re.setIdenPrecision(idenmetas.get(0).getIdenPrecision());
        }
        return re ;
    }


    public List<TMacroTablemeta> findByCodesAndLevel(int level,String[] codes){
        return macroTablemetaDao.findByCodesAndLevel(codes,level);
    }

    public TMacroTablemeta create(TMacroTablemeta macroTablemeta,TMacroIdenmeta idenmeta) {

        int macmetaType = macroTablemeta.getMacmetaType();
        String idenCode = macroTablemeta.getIdenCode();
        String idenName = macroTablemeta.getIdenName();
        macroTablemeta.setOrderby(0);//分类和表orderby都为1，没什么作用
        macroTablemeta.setHasChild(0);
        macroTablemeta.setStatus(1);
        int parid = macroTablemeta.getParid() ;
        TMacroTablemeta parItem = macroTablemetaDao.findOne(macroTablemeta.getParid());
        //从父节点拷贝基础信息
        if(null!=parItem){
            macroTablemeta.setRegionLevel(parItem.getRegionLevel());
            macroTablemeta.setReportType(parItem.getReportType());
            macroTablemeta.setReportTypeName(parItem.getReportTypeName());
            macroTablemeta.setMacdataType(parItem.getMacdataType());
        }
        if(macmetaType== CMacroMetaType.INDICATORITEM_TEYPE && idenCode==null ){ //创建的是指标
            int maxOrder = getMaxOrderby(macroTablemeta.getParid());
            idenCode = generateCodeByName(idenName);
            macroTablemeta.setIdenCode(idenCode);
            macroTablemeta.setOrderby(maxOrder+1);//二次导入数据很有用 省去了重新调整顺序的麻烦
        }

        TMacroTablemeta macroTablemeta1 = macroTablemetaDao.save(macroTablemeta);

        //指标元数据的维护
        if(macmetaType==CMacroMetaType.INDICATORITEM_TEYPE){
            idenmeta.setTMacroTablemeta(macroTablemeta1);
            idenmeta.setIdenCode(macroTablemeta1.getIdenCode());
            idenmeta.setMemo(macroTablemeta1.getMemo());
            idenmeta.setStatus(1);
            this.macroIdenmetaDao.save(idenmeta);
        }
        //父节点haschild字段维护
        setParHasChild(macroTablemeta1.getParid(),1);

        return macroTablemeta1;
    }

    /**
     * 复制分类、表、指标等
     * @param itemId
     * @param matmids
     * @return 表结构结点 用于权限设置
     */
    public  ServiceResultInfo copy(int reportType,int regionLevel,int itemId , int[] matmids){
        TMacroTablemeta par = macroTablemetaDao.findOne(itemId) ;//复制的根节点
        List<TMacroTablemeta> selItems = macroTablemetaDao.findAllByMatmids(matmids) ;//选择的节点
//        List<TMacroTablemeta> re = new ArrayList<>() ;//添加的新表 用于设置权限
        //复制分类下的所有结构 包括分类、表、指标
        if(null== par ||par.getMacmetaType() == CMacroMetaType.CATALOG_TYPE){
            return  copyCatalogAndTable(reportType, regionLevel, par, selItems);
        }
        //仅复制指标
        else if(par.getMacmetaType() == CMacroMetaType.TABLE_TYPE){
            return  copyIndicators(par,selItems) ;
        }
        return  null ;
    }


    /**
     *  复制分类或者表节点及以下所有跟节点
     * @param par 复制到的节点 可能为空 标识复制到根节点
     * @param selItems
     * @return
     */
    private ServiceResultInfo copyCatalogAndTable(
            int reportType,int regionLevel,
            TMacroTablemeta par ,List<TMacroTablemeta> selItems){

        ServiceResultInfo re = new ServiceResultInfo() ;
        int itemId = null==par?0: par.getMatmid() ;//根节点
//        if(null==par){ return  re; }
        List<TMacroTablemeta> addedItems = new ArrayList<>() ;//新添加的所有节点
        int[] newMatmids = new int[selItems.size()] ;//新的节点id
        Map<Integer,Integer> relaMap = new HashMap<>() ;//父节点的对应关系
        int i =0 ;
        for(TMacroTablemeta item :selItems){
            int metaType = item.getMacmetaType() ;
            TMacroTablemeta newInd = new TMacroTablemeta();
            String[] exclude = {"matmid"} ;
            newInd = (TMacroTablemeta)convertBeanTOBean(item,newInd,exclude);
            newInd.setReportType(null == par ? reportType : par.getReportType());
            newInd.setReportTypeName(null == par ? "" : par.getReportTypeName());
            newInd.setRegionLevel(null == par ? regionLevel : par.getRegionLevel());

            //保存后的新节点
            TMacroTablemeta savedNew = macroTablemetaDao.save(newInd) ;
            re.addObj(savedNew); //结果集
            addedItems.add(savedNew);
            newMatmids[i++] = savedNew.getMatmid() ;
            if(metaType == CMacroMetaType.CATALOG_TYPE){
                relaMap.put(item.getMatmid(),savedNew.getMatmid()) ;
            }
            else if(metaType == CMacroMetaType.TABLE_TYPE){
                re.addOtherObj(savedNew); //只有表节点作为结果输出
                relaMap.put(item.getMatmid(),savedNew.getMatmid()) ;
            }
            else if(metaType == CMacroMetaType.INDICATORITEM_TEYPE){
                addIdenmeta(item,savedNew) ;
            }
        }
        //修改刚添加节点的所有父节点
        for(TMacroTablemeta o:addedItems){
            //父节点为根节点 要修改为当前复制到的节点
            if(o.getParid() == 0){
                o.setParid(itemId);
            }else{
                //找不到对应关系的，应该就是根节点了
                o.setParid(relaMap.containsKey(o.getParid())?relaMap.get(o.getParid()):itemId);
            }
            macroTablemetaDao.save(o) ;
        }
        //修改has_child字段
        for(TMacroTablemeta o:addedItems){
            List<TMacroTablemeta> subs = macroTablemetaDao.findSubs(o.getMatmid()) ;
            if(null!=subs&&subs.size()>0){
                o.setHasChild(1);
            }else{
                o.setHasChild(0);
            }
            macroTablemetaDao.save(o) ;
        }
        //修改根节点的has_child字段
        if(null!=par&&addedItems.size()>0){
            setParHasChild(par.getMatmid(),1) ;
        }
        return re ;
    }

    /**
     *  纯复制指标
     * @param par
     * @param inds
     * @return
     */
    private ServiceResultInfo  copyIndicators(TMacroTablemeta par ,List<TMacroTablemeta> inds){
        ServiceResultInfo re = new ServiceResultInfo() ;
        int itemId = par.getMatmid() ;
        if(null==par){ return  re; }
        int count =0 ;
        int maxOrder = getMaxOrderby(par.getMatmid());
        for(TMacroTablemeta ind :inds){
            TMacroTablemeta newInd = new TMacroTablemeta();
            if(ind.getMacmetaType() != CMacroMetaType.INDICATORITEM_TEYPE){
                continue;
            }
            List<TMacroTablemeta> hasList = macroTablemetaDao.checkCodeExists(itemId,ind.getIdenCode());
            if(null!=hasList&&hasList.size()>0){
                //已经存在了 避免重复复制
                continue;
            }
            String[] exclude = {"matmid"} ;
            newInd = (TMacroTablemeta)convertBeanTOBean(ind,newInd,exclude);
            newInd.setOrderby(maxOrder+count+1);
            newInd.setParid(itemId);
            newInd.setReportType(par.getReportType());
            newInd.setReportTypeName(par.getReportTypeName());
            newInd.setRegionLevel(par.getRegionLevel());
            newInd.setHasChild(0);
            newInd.setStatus(1);
            TMacroTablemeta newInd1 = this.macroTablemetaDao.save(newInd);
            if(null!=newInd1){
                re.addObj(newInd1);
            }
            //指标元数据的维护
            addIdenmeta(ind,newInd1) ;
            count++;
        }
        if(count >0){
            //父节点haschild字段维护
            setParHasChild(itemId,1);
        }
        return re ;
    }

    /**
     * 父节点has_child字段维护
     * @param parid
     * @param hasChild
     * @return
     */
    private boolean setParHasChild(int parid,int hasChild){
        if(parid !=0){
            TMacroTablemeta parItem =  macroTablemetaDao.findOne(parid);
            parItem.setHasChild(hasChild);
            macroTablemetaDao.save(parItem);
        }
        return true ;
    }

    /**
     * 复制指标时，元数据维护
     * @param oldInd 被复制的指标
     * @param newInd 新的指标
     * @return
     */
    private boolean addIdenmeta(TMacroTablemeta oldInd,TMacroTablemeta newInd){
        List<TMacroIdenmeta> idenList = macroIdenmetaDao.findByTablemeta(oldInd.getMatmid());
        if(null != idenList&&idenList.size()>0){
            TMacroIdenmeta tempIdenmeta = idenList.get(0);
            TMacroIdenmeta idenmeta = new TMacroIdenmeta();
            idenmeta = (TMacroIdenmeta)convertBeanTOBean(newInd,idenmeta,null);
            idenmeta.setTMacroTablemeta(newInd);
            idenmeta.setIdenLength(tempIdenmeta.getIdenLength());
            idenmeta.setIdenPrecision(tempIdenmeta.getIdenPrecision());
            idenmeta.setStatus(1);
            return  null!=this.macroIdenmetaDao.save(idenmeta);
        }
        return  false ;
    }

    /**
     * 获取某个分类下的全部综合表
     * @param parid
     * @return
     */
    public  List<TMacroTablemeta> getMacroTablesByCatalog(int parid){
        List<TMacroTablemeta> re = new ArrayList<>();
        TMacroTablemeta par = macroTablemetaDao.findOne(parid);
        if(null!=par&&par.getMacmetaType() == CMacroMetaType.TABLE_TYPE){
            re.add(par);//如果是表的节点 则返回自己
        }else {
            List<TMacroTablemeta> subs = macroTablemetaDao.findSubs(parid);
            for(TMacroTablemeta o :subs){
                if(o.getMacmetaType() == CMacroMetaType.CATALOG_TYPE){
                    //目录
                    getMacroTablesByCatalog(o.getMatmid());
                }
                else  if(o.getMacmetaType() == CMacroMetaType.TABLE_TYPE){
                    re.add(o);
                }
            }
        }
        return  re ;
    }

    /**
     * 导入分类 表 指标
     * @param parid
     * @param metaType
     * @param rows
     * @return
     */
    public ServiceResultInfo importItems(int parid,int metaType,int reportType,int regionLevel,List<List<Object>> rows){
        TMacroTablemeta par = macroTablemetaDao.findOne(parid) ;
        ServiceResultInfo re = new ServiceResultInfo();
        if(null == par&&parid!=0 ){
            re.setStatus(false);
            return  re;
        }
        int index = 0;
        for(List r :rows){
            index++;
            TMacroTablemeta meta = new TMacroTablemeta() ;
            TMacroIdenmeta idenmeta = new TMacroIdenmeta() ;
            meta.setMacmetaType(metaType);
            meta.setRegionLevel(regionLevel);
            meta.setReportType(reportType);
            meta.setParid(parid);
            if(metaType == CMacroMetaType.CATALOG_TYPE
                    ||metaType == CMacroMetaType.TABLE_TYPE ){
                String name = r.size()>0?r.get(0).toString():"";
                String memo = r.size()>1?r.get(1).toString():"";
                meta.setIdenName(name);
                meta.setMemo(memo);
                if("".equals(name)){
                    re.addErrorInfo("第" + index + "条名称不能为空;");
                    continue;
                }
            }
            else if(metaType == CMacroMetaType.INDICATORITEM_TEYPE){
                String name = r.size()>0?r.get(0).toString():"";
                String unit = r.size()>1?r.get(1).toString():"";
                String precision = r.size()>2?r.get(2).toString():"0";
                String memo = r.size()>3?r.get(3).toString():"";
                if("".equals(name)){
                    re.addErrorInfo("第"+index+"条名称或单位不能为空;");
                    continue;
                }
                meta.setIdenName(name);
                meta.setIdenUnit(unit);
                meta.setMemo(memo);
                idenmeta.setIdenUnit(unit);
                idenmeta.setIdenPrecision(Integer.parseInt(
                        precision.equals("")?"0":precision));
                idenmeta.setIdenName(name);
                idenmeta.setMemo(memo);
            }
            TMacroTablemeta newObj = create(meta,idenmeta) ;
            if(null!=newObj){
                re.addObj(newObj);
                re.success(); //成功记录数+1
            }
        }
        //修改更节点的has_child字段
        if(null!=par&&re.getSuccessObjs().size()>0){
            setParHasChild(par.getMatmid(),1) ;
        }
        return re ;
    }

    public HSSFWorkbook downloadTemplate(int metaType){
        HSSFWorkbook wk = new HSSFWorkbook() ;
        String sheetName ="";
        String[] head = null ;
        if(metaType ==  CMacroMetaType.CATALOG_TYPE){
            head = new String[2];
            head[0] ="分类名称";
            head[1] ="备注";
            sheetName ="综合分类模板";
        }
        else if(metaType == CMacroMetaType.TABLE_TYPE){
            head = new String[2];
            head[0] ="表名称";
            head[1] ="备注";
            sheetName ="综合表模板";
        }
        else if(metaType == CMacroMetaType.INDICATORITEM_TEYPE){
            head = new String[4];
            head[0] ="指标名称";
            head[1] ="单位";
            head[2] ="精度";
            head[3] ="备注";
            sheetName ="综合指标模板";
        }
        wk = ExcelUtil.dataToWorkbook(sheetName, head, new String[0][]) ;
        return wk ;
    }

    private  int getMaxOrderby(int parid){
        String maxOrder = this.macroTablemetaDao.findMaxOrderBy(parid) ;
        maxOrder = null == maxOrder?"0":maxOrder ;
        return Integer.parseInt(maxOrder)  ;
    }

    private String generateCodeByName(String idenName) {
            String re = "B000000001";
            String maxCode0 = macroTablemetaDao.findMaxCode();
            String maxCode1 = macroIdenmetaDao.findMaxCode();
            if(maxCode0==null&&maxCode1 ==null){
                re = "B000000001" ;
            }else{
                maxCode0 = null !=maxCode0?maxCode0:"B000000001";
                maxCode1 = null !=maxCode1?maxCode1:"B000000001";
                re = maxCode0 ;
                if(Integer.parseInt(maxCode1.substring(1))>Integer.parseInt(re.substring(1))){
                    re = maxCode1 ;
                }
            }
            int number = Integer.parseInt(re.substring(1));
            return "B" + String.format("%09d", number + 1);
    }


    public TMacroTablemeta delete(int matmid) {
        TMacroTablemeta oldItem = macroTablemetaDao.findOne(matmid);
        if(null == oldItem){ return null; }
        int parid = oldItem.getParid() ;

        //删除节点以及节点以下的所有节点
        deleteSub(matmid);

        if(parid == 0){
          return oldItem;
        }
        TMacroTablemeta parItem = macroTablemetaDao.findOne(parid);
        if(null == parItem ){ return  oldItem; }
        //检查父节点是否还有子节点 没有则修改has_child字段
        List<TMacroTablemeta> subItems = macroTablemetaDao.findAllByParidAndreportType(parid, parItem.getReportType());
        if(null == subItems || subItems.size() ==0 ){
            setParHasChild(parid,0);
        }
        return  oldItem ;

    }

    private void deleteSub(int matmid){
        //删除一个指标 要删除的信息不只这个吧？？删除一个分类要把底下的分类和指标全部删除
        TMacroTablemeta delItem = macroTablemetaDao.findOne(matmid);
        if(null == delItem){ return; }
        int parid = delItem.getParid();
        int reportType = delItem.getReportType() ;
        List<TMacroTablemeta> delItems = new ArrayList<>();
        delItems.add(delItem);
        //删除所有子节点
        List<TMacroTablemeta> subItems = this.macroTablemetaDao.findAllByParidAndreportType(matmid,reportType);
        if(null != subItems){
            for(TMacroTablemeta parItem:subItems){
                deleteSub(parItem.getMatmid());
                delItems.add(parItem);
            }
        }
        macroTablemetaDao.delete(delItems);
//        macroTablemetaDao.deleteInBatch();
    }

    public TMacroTablemeta update(int mtmid, TMacroTablemeta macroTablemeta,TMacroIdenmeta idenmeta) {
        TMacroTablemeta macroTablemeta0 = macroTablemetaDao.getOne(mtmid);
        if (macroTablemeta0 != null) {
            macroTablemeta0 = macroTablemeta;
            List<TMacroIdenmeta> idenmetas = macroIdenmetaDao.findByTablemeta(mtmid);
            //修改指标名称、精度等参数
            for(TMacroIdenmeta iden:idenmetas){
                iden.setIdenPrecision(idenmeta.getIdenPrecision());
                iden.setIdenName(idenmeta.getIdenName());
                iden.setIdenUnit(idenmeta.getIdenUnit());
                iden.setMemo(idenmeta.getMemo());
                macroIdenmetaDao.save(iden) ;
            }
            return macroTablemetaDao.save(macroTablemeta0);
        } else
            return null;
    }

    public List<TMacroTablemeta> getByParidAndreportType(int parid, int reportType) {
        return macroTablemetaDao.findAllByParidAndreportType(parid, reportType);
    }

    /**
     * 获取行政区划级别、报告期类型的parid下的目录/表/指标
     *
     * @param regionLevel
     * @param reportType
     * @param parid
     * @return
     */
    public List<TMacroTablemeta> listRoot(int parid, int regionLevel, int reportType) {
        if(regionLevel == -1){
            return  macroTablemetaDao.findAllByParidAndreportType(parid,reportType);
        }
        return macroTablemetaDao.findAllByRegionlevelAndreportType(parid, regionLevel, reportType);
    }

    /**
     * 检索行政区划级别、报告期类型下像idenName的目录/表/指标信息
     *
     * @param regionLevel
     * @param reportType
     * @param idenName
     * @return
     */
    public List<MacroQueryIden> queryListRoot(String idenName, int regionLevel, int reportType) {
        List result = new ArrayList<>();
        StringBuilder sqlBuilder = new StringBuilder();

//        sqlBuilder.append("select t.matmid,t.iden_name idenName,t.iden_code idenCode,t.parid tableId,nvl(a.iden_name,'null') tableName,");
//        sqlBuilder.append("nvl(a.parid,0) dirId,nvl(b.iden_name,'null') dirName,nvl(b.parid,0) dirParid ");
//        sqlBuilder.append("from t_macro_tablemeta t, (select * from t_macro_tablemeta where macmeta_type=2)a, ");
//        sqlBuilder.append("(select * from t_macro_tablemeta where macmeta_type=1)b ");
//        sqlBuilder.append("where t.macmeta_type=3 and t.parid=a.matmid(+) and a.parid=b.matmid(+) and ");
//        sqlBuilder.append("t.region_level="+regionLevel+" and t.iden_name like '%"+idenName+"%' and t.report_type="+reportType);
//        sqlBuilder.append(" order by b.iden_name,a.iden_name,t.iden_name");

        //sqlite不支持(+) 需要改写为标准左关联形式  sqll
        sqlBuilder.append("select c.matmid,c.iden_name idenName,c.iden_code idenCode,c.parid tableId,a.iden_name tableName,");
        sqlBuilder.append("a.parid dirId,b.iden_name dirName,b.parid dirParid from ");
        sqlBuilder.append(" (select *  from t_macro_tablemeta t where t.macmeta_type = 3  and t.region_level = "+regionLevel+" and t.iden_name like '%"+idenName+"%' and t.report_type = " +reportType + ") c"  );
        sqlBuilder.append(" left join (select * from t_macro_tablemeta where macmeta_type = 2) a  on c.parid = a.matmid");
        sqlBuilder.append(" left join (select * from t_macro_tablemeta where macmeta_type = 1) b  on a.parid = b.matmid");


        String sql = sqlBuilder.toString();
        MessagePrint.print("指标检索sql:" + sql ,"info");

        result = macroTablemetaDao.query(sql);

        List<MacroQueryIden> queryIden = new ArrayList<>();
        if (result != null && result.size() > 0) {
            for (Object aResult : result) {
                Object[] objs = (Object[]) aResult;
                int matmid=0,tableId=0,dirId=0,dirParid=0;
                String tableName="",dirName="";
                matmid = Integer.parseInt(objs[0].toString());
                if(objs.length>3) tableId = Integer.parseInt(objs[3].toString());

                if(objs[4]==null)objs[4] = "null";
                tableName = objs[4].toString();

                if(objs[5]==null)objs[5] = 0;
                dirId = Integer.parseInt(objs[5].toString());

                if(objs[6]==null)objs[6] = "null";
                dirName = objs[6].toString();

                if(objs[7]==null)objs[7] = 0 ;
                dirParid = Integer.parseInt(objs[7].toString());

                if(dirName.equals("null")) dirName="";
                if(tableName.equals("null")) tableName="";
                queryIden.add(new MacroQueryIden(matmid, objs[1].toString(), objs[2].toString(), tableId, tableName, dirId, dirName, dirParid, reportType, regionLevel));
            }
        }
        return queryIden;
    }

    /**
     * 找到某一时段
     *
     * @param parid
     * @param catalog
     * @param period
     * @return
     */
    public List<TMacroTablemeta> getByParidAndreportTypeInPeriod(int parid, int catalog, int period) {
        return macroTableinfoDao.findPeriodItemByCatalogAndParid(parid, catalog, period);
    }

    public TMacroTablemeta getCatalogByMacmetaTypeAndReporttype(int catalog, int period, int item) {
        return macroTableinfoDao.findCatalogByMacmetTypeAndReporttype(catalog, period, item);
    }

    public List<TMacroTablemeta> getAllByReporttypePeriod(int catalog, int period) {
        return macroTableinfoDao.findPeriodItemsByCatalog(catalog, period);
    }

    public List<Object> queryIndicatorsData(String tableName, MacroQuery macroQuery, String indCodeStr) {
        if ((!"".equals(macroQuery.getParid())||(null!=macroQuery.getMatmids()&&macroQuery.getMatmids().length>0))
                && macroQuery.getRegions() != null
                && (macroQuery.getIndicatorCodes() == null || macroQuery.getIndicatorCodes().size() >= 0)) {
            StringBuilder sqlBuilder = new StringBuilder();
            String regioncode = macroQuery.getRegions()[0].getRegionCode();
            sqlBuilder.append("select p.year,p.month,p.iden_code,q.iden_name,p.iden_value from");
            sqlBuilder.append(" (select year, month, iden_code, iden_value from " + tableName + " where regioncode = '" + regioncode + "' and ");
            sqlBuilder.append(" " + PeriodSupport.getTimeRankSql(macroQuery.getTimeRank(), macroQuery.getReportType())
                    + " and  iden_code in(" + indCodeStr + ")"
                    + " ) p ");
            sqlBuilder.append(" inner join ");
            if(!"".equals(macroQuery.getParid())){
                sqlBuilder.append("(select * from t_macro_tablemeta where parid = " + macroQuery.getParid() + ") q ");
            }else{
                sqlBuilder.append("(select * from t_macro_tablemeta) q");
            }

            sqlBuilder.append(" on q.iden_code = p.iden_code ");
            sqlBuilder.append("order by p.iden_code, p.year, p.month asc");
            String sql = sqlBuilder.toString();
            System.out.println(sql);
            return macroTablemetaDao.query(sql);
        } else
            return null;
    }

    public List<Object> queryRegionData(String tableName, MacroQuery macroQuery) {
        if ((!"".equals(macroQuery.getParid())||(null!=macroQuery.getMatmids()&&macroQuery.getMatmids().length>0))
                && macroQuery.getRegions() != null && macroQuery.getIndicatorCodes().size() > 0) {

            String regionsStr = getRegionsStr(macroQuery.getRegions(), macroQuery.getCatalog());
            StringBuilder sqlBuilder = new StringBuilder();
            sqlBuilder.append("select p.year,p.month,p.regioncode,s.name,p.iden_value from");
            sqlBuilder.append(" (select regioncode,year, month, iden_value from " + tableName + " where  ");
            sqlBuilder.append(" " + PeriodSupport.getTimeRankSql(macroQuery.getTimeRank(), macroQuery.getReportType())
                    + " and iden_code  in("
                    + getIndCodeStr(macroQuery.getIndicatorCodes()) + ") ) p ");
            sqlBuilder.append(" inner join ");
            sqlBuilder.append("(select regioncode,name from t_regioninfo where rcid = " + macroQuery.getCatalog()
                    + " and regioncode in(" + regionsStr + ")) s ");
            sqlBuilder.append(" on p.regioncode = s.regioncode ");
            sqlBuilder.append("order by p.regioncode, p.year, p.month asc");
            String sql = sqlBuilder.toString();
            System.out.println(sql);
            return macroTablemetaDao.query(sql);
        } else
            return null;

    }

    /**
     * 综合查询 三个维度的指标数据：  全行政区划+全指标+全时段
     *
     * @param tableName
     * @param query
     * @return
     */
    public List<Object> queryAllData(String tableName, MacroQuery query, String indicatorCodes) {
        String sql = this.getSql(tableName,query,indicatorCodes);
        try {
            MessagePrint.print("综合查询：" + sql,"info");
            return macroTablemetaDao.query(sql);
        }catch (Exception e){
            System.out.println("综合查询异常："+sql);
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<Object> queryAllDataByPage(String tableName, MacroQuery query, String indicatorCodes, PageInfo pageInfo) {
        String sql=this.getSql(tableName, query, indicatorCodes);
        return macroTablemetaDao.queryByPage(sql, pageInfo);
    }

    public int findCountNumber(String tableName, MacroQuery query, String indicatorCodes, Object... args){
        String sql = this.getSql(tableName,query,indicatorCodes);
        int fromIndex = sql.indexOf("from");
        String from = sql.substring(fromIndex);
        return macroTablemetaDao.findCountBySql(from, args);
    }

    /**
     * 综合查询SQL组构
     * @param tableName 数据表名（分行政级别）
     * @param query 查询条件
     * @param indicatorCodes 查询指标编码组（逗号分隔，包括分组子指标）
     * */
    public String getSql(String tableName, MacroQuery query, String indicatorCodes){
        Region[] regions = query.getRegions();
        String regionSql = RegionSupport.regionsToSql(regions, query.getRegionLevel());//区域条件，指定（带#）区域级别
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("select p.year,p.month,p.regioncode,s.name,p.iden_code,p.iden_value from " + tableName + " p");
        sqlBuilder.append(" inner join t_regioninfo s on p.regioncode = s.regioncode");
        sqlBuilder.append(" where s.rcid = " + query.getCatalog());
        if(regionSql.length()>0) {
            sqlBuilder.append(" and " + regionSql);
        }
        String idenSql = " and p.iden_code in(" + indicatorCodes + ")";//指标条件
        if(indicatorCodes.indexOf(",")==-1){
            idenSql = " and p.iden_code = " + indicatorCodes;
        }
        String timeRankSql = PeriodSupport.getTimeRankSql(query.getTimeRank(), query.getReportType());//报告期条件
        sqlBuilder.append(" and " + timeRankSql + idenSql);
        sqlBuilder.append(" and p.regioncode is not null order by s.regioncode, p.year, p.month asc");
        return sqlBuilder.toString();
    }

    /**
     * 分段专题图数据
     */
    public List<Object> getThematicInfo(String tableName, MacroQuery macroQuery) {
        String regionsStr = getRegionsStr(macroQuery.getRegions(), macroQuery.getCatalog());
        String timeSql = PeriodSupport.getTimeRankSql(macroQuery.getTimeRank(), macroQuery.getReportType());
        StringBuilder stringBuilder = new StringBuilder();
        stringBuilder.append("select regioncode,year, month, p.iden_code,p.iden_value from ");
        stringBuilder.append(" (select regioncode, year, month, iden_code, iden_value from " + tableName + " where regioncode in(" + regionsStr + " ) and ");
        stringBuilder.append(" " + timeSql + " and " + getIndicatorsStr(macroQuery.getIndicatorCodes()) + ") p ");
        stringBuilder.append(" order by p.iden_code,p.iden_value asc ");
        String sql = stringBuilder.toString();
        System.out.println(sql);
        return macroTablemetaDao.query(sql);
    }

    private String getIndicatorsStr(List<String> indicatorCode) {
        String result = "";
        String codes = "";
        int num = indicatorCode.size();
        for (int i=0; i<num; i++) {
            String indicator = indicatorCode.get(i);
            if (indicator!=null && !"".equals(indicator)) {
                if (i == indicatorCode.size()-1)
                    codes += "'" + indicator + "'";
                else
                    codes += "'" + indicator + "',";
            }
        }
        if(codes.indexOf(",")==-1){
            result = " iden_code = "+codes;
        }else {
            result = " iden_code in ("+codes+")";
        }
        return result;
    }

    /**
     * 根据RegionInfo解析出regionStr
     * 之所以没有采用in方式是：in里面的长度不能大于1000
     *
     * @param region
     * @return
     */
    private String getRegionsStr(Region[] region, int catalog) {
        if (region.length == 1 && region[0].getRegionCode().contains("#")) {
            String regioncode = region[0].getRegionCode();
            int regionlevel = region[0].getRegionLevel();

            if (regioncode.startsWith("#")) {
                regioncode = "";
            } else {
                regioncode = regioncode.substring(0, regioncode.indexOf("#"));
                if (RegionSupport.isMunicipalRegion(regioncode) && regioncode.indexOf("00") != -1) {
                    regioncode = regioncode.substring(0, regioncode.indexOf("00"));//取直辖市的前两位
                }
            }
            return "select t.regioncode from t_regioninfo t where t.regionlevel="
                    + regionlevel + " and t.rcid=" + catalog
                    + " and t.regioncode like '" + regioncode + "%'";
        } else {
            String codes = "";
            for (Region r : region) {
                codes += "'" + r.getRegionCode() + "',";
            }
            if (codes != "") {
                codes = codes.substring(0, codes.length() - 1);
            }
            if(codes.indexOf(",")==-1){
                return "select t.regioncode from t_regioninfo t where t.regioncode = " + codes + " and t.rcid=" + catalog + "";
            }else {
                return "select t.regioncode from t_regioninfo t where t.regioncode in(" + codes + ") and t.rcid=" + catalog + "";
            }
        }

    }

    public String recogniseTableName(int regionLevel) {
        String tableName = "T_MACRO_WDDATA";
        switch (regionLevel) {
            case 1:
                tableName = "T_MACRO_WDDATA";
                break;
            case 2:
                tableName = "T_MACRO_SNDATA";
                break;
            case 3:
                tableName = "T_MACRO_SHDATA";
                break;
            case 4:
                tableName = "T_MACRO_XNDATA";
                break;
            case 5:
                tableName = "T_MACRO_XADATA";
                break;
            case 6:
                tableName = "T_MACRO_CNDATA";
                break;
            case 7:
                tableName = "T_MACRO_XQDATA";
                break;
            case 8:
                tableName = "T_MACRO_OTHERDATA";
                break;
            case 9:
                tableName = "T_TSMACRO_DATA";
                break;
            default:
                break;
        }
        return tableName;
    }

    /**
     * 转成以区域为纵坐标形式
     *
     * @param result
     * @param regioninfos
     * @param reportType
     * @param timeRank
     * @return
     */
    public MacroDataResult formatRegionEntity(List<Object> result, List<TRegioninfo> regioninfos, int reportType, TimeRank timeRank) {
        MacroDataResult macroDataResult = new MacroDataResult();
        macroDataResult.setStatus(true);
        macroDataResult.setTableName("综合数据查询结果");
        List<FieldInfo> mapHead = getHeader(reportType, timeRank, true);
        LinkedHashMap<String, String> mapIndicators = getRegions(regioninfos);
        String[][] content = new String[mapIndicators.size()][mapHead.size()];

        int col = mapHead.size();
        if (result != null && result.size() > 0) {
            Object[] pre = null;
            for (Object aResult : result) {
                Object[] objs = (Object[]) aResult;
                if (pre == null) {
                    pre = objs;
                }
                int rowIndex = -1, colIndex = -1;
                //计算行号和列号
                for (TRegioninfo t : regioninfos) {
                    rowIndex++;
                    if (t.getRegioncode().equals(objs[2].toString())) {
                        break;
                    }
                }
                for (FieldInfo t : mapHead) {
                    colIndex++;
                    if (t.getKey().equals(getCurrentTime(reportType, objs))) {
                        break;
                    }
                }
                if (rowIndex != -1 && colIndex != -1) {
                    if (content[rowIndex][0] == null) {
                        //增加行政区划代码
                        content[rowIndex][0]=objs[2].toString();
                        content[rowIndex][1] = objs[3].toString();
                    }
                    Object value = objs[4];//空值判断 没有导入数据的情况
//                    content[rowIndex][colIndex+1] = null!=value?value.toString():"";
                    content[rowIndex][colIndex] = null!=value?value.toString():"";
                }
            }
        }
        macroDataResult.setHead(mapHead);
        macroDataResult.setContent(MacroDataResult.removeNull(content));
        return macroDataResult;
    }

    /**
     * 转成以指标作为纵坐标形式
     *
     * @param result
     * @param indicators
     * @param reportType
     * @param timeRank
     * @return
     */
    public MacroDataResult formatIndicatorsEntity(List<Object> result, List<TMacroTablemeta> indicators, int reportType, TimeRank timeRank) {
        MacroDataResult macroDataResult = new MacroDataResult();
        macroDataResult.setStatus(true);
        macroDataResult.setTableName("综合数据查询结果");
        List<FieldInfo> mapHead = getHeader(reportType, timeRank, false);
        LinkedHashMap<String, String> mapIndicators = getIndicators(indicators);
        String[][] content = new String[mapIndicators.size()][mapHead.size()];

        int col = mapHead.size();
        if (result != null && result.size() > 0) {
            Object[] pre = null;
            int i = 0, j = 0;//用来记录行数,列数
            int size = result.size();
            for (int k=0; k<size; k++) {
                Object[] objs = (Object[]) result.get(k);
                if (pre == null) {
                    pre = objs;
                }
                //指标不变 则为同一行 ,换行记录上一行
                if(!objs[2].toString().equals(pre[2].toString())){
                    i++;
                    pre = objs;
                }
                if (content[i][0] == null) {//表示指标值为空
                    //获取处理后的指标名称 objs[3].toString()
                    String newName = mapIndicators.get(objs[2].toString()) ;
                    content[i][0] = null!=newName&&!newName.equals("")?newName:objs[3].toString() ;
                }
                int colIndex = getColIndex(mapHead,reportType,objs) ;
                if(colIndex !=-1){
                    content[i][colIndex] = objs[4].toString();
                }
            }
        }
        macroDataResult.setHead(mapHead);
        macroDataResult.setContent(MacroDataResult.removeNull(content));
        return macroDataResult;
    }

    /**
     * 计算数据所在列索引号
     * @param mapHead
     * @param reportType
     * @param objs
     * @return
     */
    private  int getColIndex(List<FieldInfo> mapHead,int reportType,Object[] objs){
        int index =0 ;
        for(FieldInfo f :mapHead){
            if(f.getKey().equals(getCurrentTime(reportType, objs))){
                return  index ;
            }
            index++ ;
        }
        return  -1 ;
    }

    /**
     * 指标枚举分组的树结构节点值（指标、报告期）填充（支持多层）
     * @param idenmeta
     * @return
     */
    private MacroReIndicator pushGroupIndicators(TMacroIdenmeta idenmeta){
        MacroReIndicator ind = new MacroReIndicator();
        ind = (MacroReIndicator) convertBeanTOBean(idenmeta,ind);//对象属性赋值
        TMacroIdenvl idenvl = idenmeta.getTMacroIdenvl() ;
        String parid = "0";
        if(null != idenvl){
            parid = idenvl.getCode();
            List<TMacroPeriod> periodList= macroTableinfoDao.findPeriodsByIdenCode(idenmeta.getIdenCode());
            //分组指标包含的时段
            List<Period> periods = new ArrayList<>();
            for(TMacroPeriod p :periodList){
                Period t = new Period();
                t = (Period)convertBeanTOBean(p,t);
                ind.getPeriods().add(t);
            }
        }
        List<TMacroIdenmeta> subInds = macroIdenmetaDao.findGroupIndByParid(idenmeta.getTMacroTablemeta().getMatmid()
                ,parid);//获取下一层子指标
        for(TMacroIdenmeta gInd:subInds){
            ind.getSubs().add(pushGroupIndicators(gInd));//嵌套生成
        }
        return  ind;
    }


    /**
     * 获取某个时段某个指标的表头部分
     * @param r
     * @return
     */
    private List getIndHead(Period p ,MacroReIndicator r){
        List<String> head = new ArrayList<>();
        String prefix = PeriodSupport.getPrefix(p);//获取报告期前缀
        List<Period> hasPeriods = r.getPeriods();//指标对应报告期
        int count = 0 ;
        for(Period period:hasPeriods){
            if(p.getReportType()==period.getReportType() && p.getYear()==period.getYear()
                    && p.getMonth()==period.getMonth()){
                count = 1;
                break;
            }
        }
        //如果该时段下有此指标
        if(count == 1){
            head.add(prefix+" "+fullfillIndName(r.getIdenName(),r.getIdenUnit()));
            List<MacroReIndicator> subs = r.getSubs();//子指标项（包括本级）
            for(MacroReIndicator sub:subs){
                head.addAll(getIndHead(p,sub));//解析嵌套子指标表头（支持多层表头）
            }
        }
        return  head ;
    }

    /**
     * 填充指标名称，将指标单位信息一并显示
     * @param name 指标名称
     * @param unit 指标单位
     * @return
     */
    public   String fullfillIndName(String name ,String unit){
        String regexCn = "（(.*?)）";  //中文括号
        String regexEn = "\\((.*?)\\)"; //英文括号
        //匹配中文括号
        Pattern p = Pattern.compile(regexCn);
        Matcher m = p.matcher(name);
        boolean isFind = false ;
        while (m.find()) {
            isFind = true ;
        }
        //匹配英文括号
        p = Pattern.compile(regexEn);
        m = p.matcher(name);
        while (m.find()) {
            isFind = true ;
        }
        if(!isFind&&(null!=unit&&!unit.equals(""))){
            return name+"（"+unit+"）";
        }
        return  name ;
    }

    //获取指标及子指标所有codes
    public List getIndCodes(MacroReIndicator r) {
        List<String> indCodes = new ArrayList<>();
        String code = r.getIdenCode();
        if(code!=null && !code.equals("") && !indCodes.contains(code)){
            indCodes.add(code);
        }
        List<MacroReIndicator> subs = r.getSubs();//子指标项（包括本级）
        for(MacroReIndicator sub:subs){
            indCodes.addAll(getIndCodes(sub));//嵌套子表头（支持多层表头）
        }
        return  indCodes;
    }


    /**
     * 多维表头（子指标项分组）扁平化封装
     *
     * @param p
     * @param r
     * @return
     */
    private List getIndCode(Period p ,MacroReIndicator r){
        List<String> head = new ArrayList<>();
        List<Period> hasPeriods = r.getPeriods();//原数据指标对应报告期
        int count =0 ;
        for(Period period:hasPeriods){
            count =0 ;
            if(p.getReportType() == period.getReportType() ){
                count++;
            }
            if(p.getYear() == period.getYear() ){
                count++;
            }
            if(p.getMonth() == period.getMonth()){
                count++;
            }
            if(count ==3){
                break;
            }
        }
        //如果该时段下有此指标
        if(count == 3){
            head.add(r.getIdenCode());//本层指标编码
            //存在【子指标】项
            List<MacroReIndicator> subs = r.getSubs();
            for(MacroReIndicator sub:subs){
                head.addAll(getIndCode(p,sub));//添加【子指标】项
            }
        }
        return  head ;
    }


    /**
     * 封装综合数据结果对象
     * @param data 查询数据（报告期+区划+指标+值）
     * @param periods 报告期
     * @param indicators 综合查询指定指标
     * @param regions 查询区划
     * @return
     */
    public MacroDataResult formatAllData(List<Object> data, List<TMacroPeriod> periods, List<TMacroTablemeta> indicators, Region[] regions) {
        MacroDataResult re = new MacroDataResult();//综合三视图数据结果对象
        re.setStatus(true);
        int colNum = periods.size() * indicators.size();//列：报告期长度*指标长度
        List peridList = new ArrayList();//报告期时段
        List<MacroReIndicator> indicatorList = new ArrayList();//指标集

        List head = new ArrayList();//表格标题
        head.add("行政区划代码");
        head.add("行政区划名称");

        //获取查询的时段 指标 表头等信息
        Map<String,Object> map = new HashMap<>();
        map = getHeadInfos(periods,indicators);
        peridList = (List)map.get("period");//报告期
        indicatorList = (List<MacroReIndicator>)map.get("indicator");//指标结果项
        head.addAll((List)map.get("head"));//列表头（报告期*指标项）

        //此方法排除某一行为null的情况
//        ArrayList<String[]> contentList = new ArrayList<String[]>();
//        //填充查询数据
//        for (int i=0,size=data.size(); i<size; i++) {
//            Object[] objs = (Object[]) data.get(i);
//
//            int year = Integer.parseInt(objs[0].toString());
//            int month = Integer.parseInt(objs[1].toString());
//            String regioncode = objs[2].toString();
//            String regionname = objs[3].toString();
//            String idencode = objs[4].toString();
//
//            int colIndex = getColIndex(year, month, idencode, peridList, indicatorList);//（报告期*指标）所在列序号
//            int rowIndex = getRowIndex(regioncode, regions);                            //（区域）所在行序号
//            if (colIndex != -1 && rowIndex != -1) {
//                String val = objs[5]!=null?objs[5].toString():"0";                      //没有数据为0，是否合理？？？
//                if(val.equals("") || val.equals("null") || val.equals(null)){
//                    val = "0";
//                }
//
//                String[] row = new String[head.size()];
//
//                row[0] = regioncode;
//                row[1] = regionname;
//                row[colIndex +2] = val;
//
//                contentList.add(row);
//            }
//        }
//
//        String[][] content = new String[contentList.size()][head.size()];
//        for (int i=0,size=contentList.size(); i<size; i++){
//            content[i] = contentList.get(i);
//        }

        ///////////////////////
        String[][] content = new String[regions.length][head.size()];
        //填充查询数据
        for (int i=0,size=data.size(); i<size; i++) {
            Object[] objs = (Object[]) data.get(i);
            int year = Integer.parseInt(objs[0].toString());
            int month = Integer.parseInt(objs[1].toString());

            String regioncode = objs[2].toString();
            String regionname = objs[3].toString();

            String idencode = objs[4].toString();
            int colIndex = getColIndex(year, month, idencode, peridList, indicatorList);//（报告期*指标）所在列序号
            int rowIndex = getRowIndex(regioncode, regions);//（区域）所在行序号
            if (colIndex != -1 && rowIndex != -1) {
                String val = objs[5] != null ? objs[5].toString() : "0";//没有数据为0，是否合理？？？
                if (val.equals("") || val.equals("null") || val.equals(null)) {
                    val = "0";
                }
                content[rowIndex][0] = regioncode;
                content[rowIndex][1] = regionname;
                content[rowIndex][colIndex + 2] = val;
            }
        }
        ///////////////////////

        re.setIndicators(indicatorList);//指标集
        re.setPeriods(peridList);//报告期时段集
        re.setHead(head);//表格列标题
        re.setContent(MacroDataResult.removeNull(content));//表格行数据
        return re;
    }

    /**
     * 根据指标精度将数据格式化，比如保留两位小数点
     * @param data
     * @param indicators
     * @param isOneIden
     * @return
     */
    public List<Object> formatPrecision(List<Object> data,List<TMacroTablemeta> indicators,boolean isOneIden){
        List<Object> newData = new ArrayList<>();
        Map<String,Integer> map = new HashMap<>() ;
        //找到各指标的精度 分组指标也在内
        for(TMacroTablemeta ind:indicators){
            List<TMacroIdenmeta> idenmetas = macroIdenmetaDao.findByTablemeta(ind.getMatmid());
            for(TMacroIdenmeta idenmeta:idenmetas){
                map.put(idenmeta.getIdenCode(),idenmeta.getIdenPrecision());//指标设置精度值
            }
        }
        for(Object o:data){
            Object[] objs = (Object[]) o;
            Object[] newR = new Object[objs.length] ;
            for(int i=0,len=objs.length; i<len; i++){
                //第五列为数值
                if(i == len-1){
                    String idenCode = isOneIden?indicators.get(0).getIdenCode():objs[4].toString();
                    Integer precision = map.get(idenCode);//指标设置精度值
                    if(null == precision){
                        precision = 2 ;//默认精度为2
                    }
                    DecimalFormat df = (DecimalFormat) NumberFormat.getInstance();
                    df.setMaximumFractionDigits(precision);
                    df.setMinimumFractionDigits(0);
                    df.setGroupingUsed(false);
                    newR[i] = df.format(null==objs[i] ? 0 : Float.parseFloat(objs[i].toString())) ;
                    continue;
                }
                newR[i] = objs[i] ;
            }
            newData.add(newR);
        }
        return  newData ;
    }

    /**
     * 获取包含分组指标在内的所有head长度
     * @param periods
     * @param indicators
     * @return
     */
    public int getIndSize(List<TMacroPeriod> periods,List<TMacroTablemeta> indicators){
        Map<String,Object> map = new HashMap<>();
        map = getHeadInfos(periods,indicators);
        return  ((List)map.get("head")).size();
    };

    /**
     * 获取（时段*指标）表头信息
     * @param periods 报告期
     * @param indicators 前台选择指标
     * @return
     */
    private Map<String,Object> getHeadInfos(List<TMacroPeriod> periods,List<TMacroTablemeta> indicators){
        List peridList = new ArrayList();//报告期时段
        //报告期项
        for (TMacroPeriod t : periods) {
            Period p = new Period();
            p = (Period) convertBeanTOBean(t,p);

            Boolean hasData = true;  //默认有数据
            String fa =  t.getFlagA();    //将前面 判断是否有数据的FlagA字段转化为布尔型的hasdata
            if(fa!=null){
                if(fa.equals("true")){
                    p.setHasdata(true);
                }else if(fa.equals("false")){
                    p.setHasdata(false);
                }
            }

            peridList.add(p);
        }
        //指标项
        List<MacroReIndicator> indicatorList = new ArrayList();//指标结果集
        for (TMacroTablemeta t : indicators) {
            MacroReIndicator ind = getSubIndicators(t);//指标与枚举分组（子指标）
            if(ind==null){
                continue;
            }
            ind.setPeriods(peridList);//报告期
            ind.setIdenName(fullfillIndName(ind.getIdenName(),ind.getIdenUnit()));
            indicatorList.add(ind);//指标
        }
        if(indicatorList.size()<1) {
            System.out.println("综合查询指标配置全null，请配置！");
        }
        //表头
        List head = new ArrayList();
        for (int pi=0,size=peridList.size(); pi<size; pi++) {
            Period p =(Period) peridList.get(pi);
            for(MacroReIndicator r:indicatorList){
                head.addAll(getIndHead(p, r)) ;//添加列表头项（支持多层子项）
            }
        }
        Map<String,Object> map = new HashMap<>();
        map.put("period",peridList);//报告期
        map.put("indicator",indicatorList);//指标结果项
        map.put("head",head);//报告期*指标项
        return  map;
    }

    /**解析分组子指标 树形结构*/
    public MacroReIndicator getSubIndicators(TMacroTablemeta tablemeta){
        int matmid = tablemeta.getMatmid();//指标ID
        if(matmid==0) {
            System.out.println("综合指标ID为null");
            return null;
        }
        List<TMacroIdenmeta> idenmetas = macroIdenmetaDao.findByTablemeta(matmid);//是否分组
        if(idenmetas.size()==0){
            System.out.println("综合指标ID（"+matmid+"）未配置T_MACRO_IDENMETA指标项");
            return null;
        }
        MacroReIndicator mri = pushGroupIndicators(idenmetas.get(0));//指标枚举分组（多层子指标）
        return mri;
    }

    /**
     * 前端传过来的 行政区划带##需要预处理下
     *
     * @param regions
     * @return
     */
    public Region[] preHandleRegion(int catalogid, Region[] regions, MacroQuery macroQuery) {
        List<Region> regionList = new ArrayList<>();
        int len = regions.length;
        for(int i=0; i<len; i++){
           Region r = regions[i];
           String code = r.getRegionCode();
           if(code.contains("#")) {
               if(code.equals("000000000000")){
                   code ="";
               }else{
                   code =code.substring(0,code.indexOf("#"));
               }
               int regionlevel=macroQuery.getRegionLevel();

               if (RegionSupport.isMunicipalRegion(code) && code.indexOf("00") != -1) {
                   code = code.substring(0, code.indexOf("00"));//取直辖市的前两位
               }
               List<TRegioninfo> regioninfoList = this.regionInfoDao.getLeafRegion(catalogid, regionlevel, code + "%");
               List fooList = new ArrayList<Region>();
               for (TRegioninfo t : regioninfoList) {
                   Region rr  = new Region(t.getRegioncode(), t.getName(), t.getRegionlevel());
                   fooList.add(rr);
               }
               regionList.addAll(fooList);
           }else{
               regionList.add(r);
           }
        }
        int size = regionList.size();
        Region[] reRegions = new Region[size];
        for(int i =0;i<size;i++){
           reRegions[i] = regionList.get(i);
        }

        return reRegions;
    }

    /**
     * 读取行索引值
     *
     * @param regioncode
     * @param regions
     * @return
     */
    private int getRowIndex(String regioncode, Region[] regions) {
        for (int i=0,len=regions.length; i<len; i++) {
            if (regions[i].getRegionCode() == regioncode ||
                    regions[i].getRegionCode().equals(regioncode)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 读取列（报告期*指标项）序号值（三维转二维数组）
     *
     * @param year
     * @param month
     * @param idencode 原指标
     * @param periods  指标报告期
     * @param indicators 解析后指标列表头项（含分组指标）
     * @return
     */
    private int getColIndex(int year, int month, String idencode, List<Period> periods, List<MacroReIndicator> indicators) {
        int index = -1 ;
        for (int i=0,size=periods.size(); i<size; i++) {
            Period p = periods.get(i);
            for (int j=0,size2=indicators.size(); j<size2; j++) {
                boolean isFind = false ;
                List<String> head = getIndCode(p, indicators.get(j));//报告期下的多维表头指标(含分组子指标)
                if(!(year==p.getYear() && month==p.getMonth())){
                    index += head.size();//指标项个数（含子指标）
                    continue;
                }
                for(String h:head){
                    index++;
                    if(h.equals(idencode)){//指标相同
                        isFind = true ;
                        break;
                    }
                }
                if(isFind){
                    break;
                }
            }
            if(year==p.getYear() && month==p.getMonth()){
                return index ;
            }
        }
        return -1;
    }

    private String getCurrentTime(int reportType, Object[] objs) {
        switch (reportType) {
            case 1:
            case 2:
            case 3:
            case 11:
                return objs[0].toString();//年报
            case 12:
                return  (objs[0] + "-" + objs[1]).toString();//季报
            case 13:
                return (objs[0] + "-" + objs[1]).toString();//月报
            default:
                return objs[0].toString();
        }
    }

    private boolean containHead(List<Object> result, String key, int reportType) {
        boolean isContain = false;
        Iterator iterator = result.iterator();
        while (iterator.hasNext()) {
            Object[] objects = (Object[]) iterator.next();
            switch (reportType) {
                case 1:
                case 2:
                case 3: //年鉴
                case 11:
                    if ((objects[0]).toString().equals(key)) {
                        isContain = true;
                    }
                case 12:
                case 13:
                    if ((objects[0] + "-" + objects[1]).toString().equals(key)) {
                        isContain = true;
                    }
                default:
                    if ((objects[0]).toString().equals(key)) {
                        isContain = true;
                    }
            }
        }
        return isContain;
    }

    /**
     * 过滤出指标
     *
     * @param indicators
     * @return
     */
    private LinkedHashMap<String, String> getIndicators(List<TMacroTablemeta> indicators) {
        LinkedHashMap<String, String> mapIndicators = new LinkedHashMap<>();
        Iterator iterator = indicators.iterator();
        while (iterator.hasNext()) {
            TMacroTablemeta macroTablemeta = (TMacroTablemeta) iterator.next();
            if (!mapIndicators.containsKey(macroTablemeta.getIdenCode()))
                mapIndicators.put(macroTablemeta.getIdenCode(), fullfillIndName(macroTablemeta.getIdenName()
                        ,macroTablemeta.getIdenUnit()));
        }
        return mapIndicators;
    }

    /**
     * 过滤出指标
     *
     * @param regioninfos
     * @return
     */
    private LinkedHashMap<String, String> getRegions(List<TRegioninfo> regioninfos) {
        LinkedHashMap<String, String> mapIndicators = new LinkedHashMap<>();
        Iterator iterator = regioninfos.iterator();
        while (iterator.hasNext()) {
            TRegioninfo regioninfo = (TRegioninfo) iterator.next();
            if (!mapIndicators.containsKey(regioninfo.getRegioncode()))
                mapIndicators.put(regioninfo.getRegioncode(), regioninfo.getName());
        }
        return mapIndicators;
    }

    /**
     * 根据时间计算出表头
     *
     * @param reportType
     * @param timeRank
     * @return
     */
    private List<FieldInfo> getHeader(int reportType, TimeRank timeRank, boolean isRegion) {
        List<FieldInfo> mapHead = new ArrayList<FieldInfo>();
        if (isRegion) {
            mapHead.add(new FieldInfo("code", "行政区划代码"));
            mapHead.add(new FieldInfo("region", "行政区划名称"));
        } else {
            mapHead.add(new FieldInfo("indicators", "指标"));
        }
        //年报
        if (reportType == 11 || reportType == 1 || reportType == 2 || reportType==3 || reportType==4) {
            for (int i = timeRank.getFromYear(); i <= timeRank.getToYear(); i++) {
                mapHead.add(new FieldInfo(String.valueOf(i), i + "年"));
            }
        } else if (reportType == 14) {//半年报
            for (int i = timeRank.getFromYear(); i <= timeRank.getToYear(); i++) {
                int start = 0 ;
                int end = 1 ;
                start = i == timeRank.getFromYear()?timeRank.getFromMonth():start;
                end = i == timeRank.getToYear()?timeRank.getToMonth():end ;
                for (int j = start; j <= end; j++) {
                    String str = j==0?"上":"下";
                    mapHead.add(new FieldInfo(i + "-" + j, i + "年" + str + "半年"));
                }
            }
        } else if (reportType == 12) {//季报
            for (int i = timeRank.getFromYear(); i <= timeRank.getToYear(); i++) {
                int start = 13 ;
                int end = 16 ;
                start = i == timeRank.getFromYear()?timeRank.getFromMonth():start;
                end = i == timeRank.getToYear()?timeRank.getToMonth():end ;
                for (int j = start; j <= end; j++) {
                    mapHead.add(new FieldInfo(i + "-" + j, i + "年" + (j-12) + "季度"));
                }
            }
        } else if (reportType == 13) {//月报
            for (int i = timeRank.getFromYear(); i <= timeRank.getToYear(); i++) {
                int start = 1 ;
                int end = 12 ;
                start = i == timeRank.getFromYear()?timeRank.getFromMonth():start;
                end = i == timeRank.getToYear()?timeRank.getToMonth():end ;
                for (int j = start; j <= end; j++) {
                    mapHead.add(new FieldInfo(i + "-" + j, i + "年" + j + "月"));
                }
            }
        }
        return mapHead;
    }

    /**
     * 获取选中指标字符串  in sql语句部分加单引号
     *
     * @param codes
     * @return
     */
    private String getIndCodeStr(List<String> codes) {
        String codesStr = "";
        for (String code : codes) {
            codesStr += "'" + code + "',";
        }
        if (!codesStr.equals("")) {
            codesStr = codesStr.substring(0, codesStr.length() - 1);
        }
        return codesStr;
    }

    public List<TMacroTablemeta> getByreportTypeAndName(int reportType, String idenName) {
        return macroTablemetaDao.findByTypeName(reportType, idenName);
    }

    public List<TMacroTablemeta> getByMatmids(int[] matmids) {
        return macroTablemetaDao.findAllByMatmids(matmids);
    }

    public List<TMacroTablemeta> getByIdenCodes(String[] codes) {
        return macroTablemetaDao.findAllByCodes(codes);
    }

    /**
     * 获取指标为枚举分组指标对象
     * @param tablemeta
     * @return
     */
    public List<TMacroIdenmeta> findAllGroupInd(TMacroTablemeta tablemeta){
        List<TMacroIdenmeta> re = this.macroIdenmetaDao.findGroupInd(tablemeta.getMatmid());
        return re ;
    }

    /**
     * 根据指标code，查询指标元数据
     */
    public List<TMacroTablemeta> findTablemetaByCode(String[] idenCodes, int[] matmids){
        List<TMacroTablemeta> re = this.macroIdenmetaDao.findTablemetaByCode(idenCodes, matmids);
        return re ;
    }

    /**
     * 静态综合目录树
     * @param reportType
     * @param regionLevel
     * @return
     */
    public List<DHTMLXTree> getTree(int reportType,int regionLevel,int parid,boolean hasNoCheckbox ){
        List<TMacroTablemeta> parItems = new ArrayList<>() ;
        parItems = this.macroTablemetaDao.findAllByRegionlevelAndreportType(parid,regionLevel,reportType) ;
        List<DHTMLXTree> nodes = new ArrayList<>() ;
        for(TMacroTablemeta o:parItems){
            DHTMLXTree n =  new DHTMLXTree(o.getMatmid()+"",o.getIdenName());
            if(hasNoCheckbox){
                n.noCheckbox() ;
            }
            //递归 寻找子节点
            List<DHTMLXTree> subs = getTree(reportType, regionLevel, o.getMatmid(),hasNoCheckbox);
            for(DHTMLXTree sub:subs){
                if(hasNoCheckbox){
                    n.noCheckbox() ;
                }
                n.add(sub) ;
            }
            nodes.add(n);
        }
        return  nodes ;
    }

    public List<TMacroTablemeta> getByLevel(int level) {
        return macroTablemetaDao.findAllByLevel(level);
    }

    /**
     *指标异步模糊查询
     */
    public List idenQuery(String input,int level){

        String sql = "SELECT IDEN_NAME FROM T_MACRO_TABLEMETA where IDEN_NAME LIKE '%"+ input +"%' and REGION_LEVEL = " + level;
        List result = macroTablemetaDao.query(sql);

        return result;
    }

    public List<TableMetadata> findByParid(int parid) {


        return macroTablemetaDao.findByParid(parid);
    }
}
