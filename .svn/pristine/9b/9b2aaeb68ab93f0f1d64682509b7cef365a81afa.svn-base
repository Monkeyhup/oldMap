package com.supermap.sgis.visual.api;

import com.supermap.sgis.visual.annotation.Permission;
import com.supermap.sgis.visual.annotation.Role;
import com.supermap.sgis.visual.common.PeriodSupport;
import com.supermap.sgis.visual.data.OpStatus;
import com.supermap.sgis.visual.data.PageInfo;
import com.supermap.sgis.visual.entity.*;
import com.supermap.sgis.visual.json.*;
import com.supermap.sgis.visual.service.*;
import com.supermap.sgis.visual.tool.ExcelUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Controller
@RequestMapping(value = {"/macro","/service/macro"})
public class MacroDataController extends BaseController {

    @Autowired
    private MacroTablemetaService macroTablemetaService;
    @Autowired
    private RegionInfoService regionInfoService;
    @Autowired
    private MacroTableinfoService macroTableinfoService;
    @Autowired
    MacroDataImportService macroDataImportService ;

    /**
     * 综合数据条件查询 获取三视图数据【统一入口】
     *
     * @param macroQuery 综合查询对象
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/data/queryext", method = RequestMethod.GET)
    @ResponseBody
    public MacroDataResult queryAll(@RequestBody MacroQuery macroQuery) {
        //查询数据表名（分级存储）
        String tableName = macroTablemetaService.recogniseTableName(macroQuery.getRegionLevel());
        //构建报告期时段
        int reportType = macroQuery.getReportType();
        if(macroQuery.getMatmids() != null && macroQuery.getMatmids().length>0){
            //根据指标ID查询所属报告期类型
            TMacroTablemeta oneTMT = macroTablemetaService.getOne(macroQuery.getMatmids()[0]);
            reportType = oneTMT.getReportType();
            macroQuery.setReportType(reportType);
        }

        List<TMacroPeriod> hasDataPerids = macroTableinfoService.getPeriodByMatmids(macroQuery.getMatmids()); //有数据的时段信息

        List<TMacroPeriod> perids = PeriodSupport.createPeriodByTimeRankAndCheck(reportType, macroQuery.getTimeRank(),hasDataPerids);
        List result = new ArrayList<>();
        //获取表下的指标
        Map<String,Object> map = this.filterIndicators(macroQuery);
        List<TMacroTablemeta> selIndicators = (List) map.get("selInd");//指定指标（含子指标）的元数据
        String indicatorStr = map.get("selIndCode").toString();//当前表下的全部（或选中）指标CODE
        if(indicatorStr.equals("")) {
            System.out.println("表节点"+macroQuery.getParid()+"/报告期类型"+macroQuery.getReportType()+"下设置指标空！");
            return null;
        }
        //查询综合指标数据
        result = macroTablemetaService.queryAllData(tableName, macroQuery, indicatorStr);//获取全部指标数据
        //根据指标精度将数据格式化 会导致比重数据整数化
//        result = macroTablemetaService.formatPrecision(result,selIndicators,false);
        //预处理区域##
        Region[] regions = macroTablemetaService.preHandleRegion(macroQuery.getCatalog(), macroQuery.getRegions(), macroQuery);
        //封装综合数据结果对象
        MacroDataResult re = macroTablemetaService.formatAllData(result, perids, selIndicators, regions);
        return re;
    }

    /**
     * 切换三维条件，综合数据查询入口
     *
     * @param macroQuery 参数
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Data/Query", method = RequestMethod.GET)
    @ResponseBody
    public MacroDataResult query(@RequestBody MacroQuery macroQuery,PageInfo pageInfo ) {
        List result = new ArrayList<>();
        Region[] region = macroQuery.getRegions();
        List<TMacroTablemeta> indicators = null;

        //根据传过来的参数 处理查询的结果
        if (region != null && region.length > 0) {
            int catalogid = macroQuery.getCatalog();
            //src:region[0].getRegionLevel
            String tableName = macroTablemetaService.recogniseTableName(macroQuery.getRegionLevel());//综合数据表
            if(macroQuery.getMatmids().length>0) {
                indicators = macroTablemetaService.getByMatmids(macroQuery.getMatmids());//表下全部指标
            }else if(macroQuery.getParid() != null && macroQuery.getParid().length()>0) {
                //查询父节点id和报告期类型的对象元数据列表
                indicators = macroTablemetaService.getByParidAndreportType(Integer.parseInt(macroQuery.getParid()), macroQuery.getReportType());
            }

            Map<String,Object> map = this.filterIndicators(macroQuery);
            List<TMacroTablemeta> selIndicators = (List) map.get("selInd");//指定指标（含子指标）的元数据
            String indicatorStr = map.get("selIndCode").toString();//指定指标（含子指标）对应全部指标（含子指标）编码toString

            //单时段 （多指标 多区域）
            if (checkTimeRankIsSingle(macroQuery.getTimeRank())) {
                List<TMacroPeriod> periods = new ArrayList<>();
                periods = PeriodSupport.createPeriodByTimeRank(macroQuery.getReportType(),macroQuery.getTimeRank());//获取报告期
                macroQuery.setRegions(macroQuery.getRegions());
                int count = macroTablemetaService.findCountNumber(tableName, macroQuery, indicatorStr);//结果长度
                Region[] regions = macroTablemetaService.preHandleRegion(macroQuery.getCatalog(), macroQuery.getRegions(),macroQuery);
                int size = macroTablemetaService.getIndSize(periods,indicators);//所有指标（含子指标）的head长度
                int pageSize = pageInfo.getPageSize() ;
                pageInfo.setPageSize(size*pageSize);
                result = macroTablemetaService.queryAllDataByPage(tableName, macroQuery, indicatorStr, pageInfo);//查询数据
                result = macroTablemetaService.formatPrecision(result,selIndicators,false);//处理指定指标值精度
                MacroDataResult re = macroTablemetaService.formatAllData(result, periods, selIndicators, regions);
                int c = count==0?count:regions.length;
                re.setCount(c);
                re.setPageSize(pageSize);
                re.setPageNumber(pageInfo.getPageNumber());
                return re;
            }

            //多区域 （多时段 指标为变量）
            if (region.length == 1 && region[0].getRegionCode().contains("#")) {
                Region r = region[0];
                List<TRegioninfo> regioninfos = regionInfoService.getRegionByCatalogAndLevel(catalogid, r.getRegionCode(), r.getRegionLevel());
                //如果参数中没有传递指标，则默认为第一条指标查询
                List<String> inIndicatorList = macroQuery.getIndicatorCodes();
                if (inIndicatorList == null || inIndicatorList.size() == 0 || inIndicatorList.get(0).equals("")) {
                    List<String> indicatorList = new ArrayList<>();
                    indicatorList.add(indicators.get(0).getIdenCode());
                    macroQuery.setIndicatorCodes(indicatorList);
                }
                result = macroTablemetaService.queryRegionData(tableName, macroQuery);
                if (result != null) {
                    result = macroTablemetaService.formatPrecision(result,selIndicators,false) ;
                    return macroTablemetaService.formatRegionEntity(result, regioninfos, macroQuery.getReportType(), macroQuery.getTimeRank());
                }
            } else if (region.length > 1) {
            //指定多区域
                List<TRegioninfo> regioninfos = new ArrayList<>();
                String[] codes = new String[region.length];
                int index = 0;
                for (Region r : region) {
                    codes[index++] = r.getRegionCode();
                }
                regioninfos = regionInfoService.findByRegioncodes(catalogid, codes);
                //如果参数中没有传递指标，则默认为第一条指标查询
                List<String> inIndicatorList = macroQuery.getIndicatorCodes();
                if (inIndicatorList == null || inIndicatorList.size() == 0 || inIndicatorList.get(0).equals("")) {
                    List<String> indicatorList = new ArrayList<>();
                    indicatorList.add(indicators.get(0).getIdenCode());
                    macroQuery.setIndicatorCodes(indicatorList);
                }
                result = macroTablemetaService.queryRegionData(tableName, macroQuery);
                if (result != null) {
                    result = macroTablemetaService.formatPrecision(result,selIndicators,false) ;
                    return macroTablemetaService.formatRegionEntity(result, regioninfos, macroQuery.getReportType(), macroQuery.getTimeRank());
                }
            } else if (region.length == 1) {
                //以行政区划为变量
                result = macroTablemetaService.queryIndicatorsData(tableName, macroQuery,indicatorStr);
                result = macroTablemetaService.formatPrecision(result,selIndicators,true) ;
              return macroTablemetaService.formatIndicatorsEntity(result, selIndicators, macroQuery.getReportType(), macroQuery.getTimeRank());
            }
        }
        return new MacroDataResult();
    }

    /**
     * 下载数据
     */
    @RequestMapping(value="/download/{type}",method=RequestMethod.POST)
    @ResponseBody
    public OpStatus download(HttpServletRequest request ,HttpServletResponse response,@PathVariable("type") String type,@RequestBody MacroQuery macroQuery,PageInfo pageInfo){
        MacroDataResult res=null;
        boolean status=false;
        if(type.equalsIgnoreCase("all")){
            res=queryAll(macroQuery);
        }else if(type.equalsIgnoreCase("page")){
            res=query(macroQuery,pageInfo);
        }
        if(res!=null) {
            List<FieldInfo> heads=res.getHead();
            List<String> headList=new ArrayList<String>();
            Object[] objs=res.getHead().toArray();
            for(int i=0,size=objs.length; i<size; i++){
                String value=null;
                if(objs[i] instanceof  FieldInfo){
                    value=((FieldInfo)objs[i]).getValue();
                }else{
                    value=objs[i].toString();
                }
                headList.add(value);
            }
            HSSFWorkbook wk = ExcelUtil.dataToWorkbook("T_MACRO", headList.toArray(new String[0]), res.getContent());
            request.getSession().setAttribute("fileName", "综合数据表导出");
            request.getSession().setAttribute("wk", wk);
            status=true;
        }
        return  getOpStatus(status);
    }

    /**
     * 综合数据导入
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/data/import", method = RequestMethod.POST)
    @ResponseBody
    public String dataImport(HttpServletRequest request,@RequestBody MacroDataImport dataImport) {
        return   macroDataImportService.importStart(request,dataImport);
    }

    @Permission(Role.USER)
    @RequestMapping(value = "/data/export", method = RequestMethod.GET)
    @ResponseBody
    public OpStatus dataExport() {
        return getOpStatus(true);
    }

    private boolean checkTimeRankIsSingle(TimeRank timeRank) {
        int num = 0;
        if (timeRank != null) {
            if (timeRank.getFromYear() == timeRank.getToYear()) {
                num++;
            }
            if (timeRank.getFromMonth() == timeRank.getToMonth()) {
                num++;
            }
        }
        return num == 2 ? true : false;
    }

    //过滤选中的指标
    private Map<String,Object> filterIndicators(MacroQuery macroQuery){
        List<TMacroTablemeta> selIndicators = new ArrayList<TMacroTablemeta>();//指定查询指标数组
        String indicatorStr = "";//指定指标(含子指标)编码字符串
        List<TMacroTablemeta> allIndicators = null;
        //查询多表IDs 或 所选父ID下全部指标
        if(macroQuery.getMatmids() == null || macroQuery.getMatmids().length<1) {
            allIndicators = macroTablemetaService.getByParidAndreportType(Integer.parseInt(macroQuery.getParid()), macroQuery.getReportType());
        }else{
            allIndicators = macroTablemetaService.getByMatmids(macroQuery.getMatmids());//查询多表
        }

        List<String> indicatorCodes = macroQuery.getIndicatorCodes();//指定指标CODE（含下一级分组子指标）
        if (!indicatorCodes.equals(null) && indicatorCodes.size() > 0) {
            final int size = indicatorCodes.size();
            String[] idenCodes = (String[])indicatorCodes.toArray(new String[size]);
            selIndicators = macroTablemetaService.findTablemetaByCode(idenCodes, macroQuery.getMatmids());//查询指定指标的元指标
        } else {
            selIndicators = allIndicators;
        }
        for (TMacroTablemeta t : selIndicators) {
            indicatorStr += "'" + t.getIdenCode() + "',";
        }
        //指定指标的枚举分组子指标 也要纳入其中
        for(TMacroTablemeta selInd : selIndicators){
            List<TMacroIdenmeta> groupInds = macroTablemetaService.findAllGroupInd(selInd);//指标元数据下一级子指标
            if(null == groupInds||groupInds.size()==0){
                continue;
            }
            for(TMacroIdenmeta groupInd: groupInds){
                indicatorStr  += "'" + groupInd.getIdenCode() + "',";
            }
        }

        if (indicatorStr != "") {
            indicatorStr = indicatorStr.substring(0, indicatorStr.length() - 1);
        }

        //这句加上会自动更新到库里 hibernate默认<property name="hibernate.format_sql" value="true"/>
//        for(TMacroTablemeta t:selIndicators){
//            t.setIdenName(macroTablemetaService.fullfillIndName(t.getIdenName(),t.getIdenUnit()));
//        }
        Map<String,Object> reMap = new HashMap<>();
        reMap.put("selInd",selIndicators);//指定指标（含子指标）对应元数据指标
        reMap.put("selIndCode",indicatorStr);//指定指标（含子指标）编码串
        return reMap;
    }


}
