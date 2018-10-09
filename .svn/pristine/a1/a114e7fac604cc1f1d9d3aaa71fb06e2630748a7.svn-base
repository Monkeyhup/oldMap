package com.supermap.sgis.visual.api;


import com.supermap.sgis.visual.annotation.Permission;
import com.supermap.sgis.visual.annotation.Role;
import com.supermap.sgis.visual.common.tree.DHTMLXTree;
import com.supermap.sgis.visual.common.tree.DHTMLXTreeFactory;
import com.supermap.sgis.visual.cons.CMacroMetaType;
import com.supermap.sgis.visual.data.OpStatus;
import com.supermap.sgis.visual.entity.*;
import com.supermap.sgis.visual.json.*;
import com.supermap.sgis.visual.service.*;
import com.supermap.sgis.visual.tool.ExcelUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping(value = {"/macro","/service/macro"})
public class MacroTablemetaController extends BaseController {

    @Autowired
    private MacroTablemetaService macroTablemetaService;
    @Autowired
    private MacroTableinfoService macroTableinfoService;
    @Autowired
    private MacroIdentService macroIdentService;
    @Autowired
    private MacroIdenvlService macroIdenvlService;
    @Autowired
    private MacroPeriodService macroPeriodService;

    @Autowired
    private MacroIdentInfoService macroIdentInfoService;


    /**
     * 创建指标（包括目录和表）
     * @param request
     * @param Type
     * @param macroTablemeta
     * @param idenmeta
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Items", method = RequestMethod.POST)
    @ResponseBody
    public OpStatus create(HttpServletRequest request ,@PathVariable("Type") int Type, TMacroTablemeta macroTablemeta,TMacroIdenmeta idenmeta) {
        TMacroTablemeta t = null;
        if (!macroTablemetaService.one(macroTablemeta.getMatmid())){
            macroTablemeta.setReportType(Type);
            t = macroTablemetaService.create(macroTablemeta,idenmeta);
        }
        boolean re = null!=t;
        //权限控制 综合权限到表
//        if(re&&t.getMacmetaType() == CMacroMetaType.TABLE_TYPE){
//            int[] dataIds = new int[1];
//            dataIds[0] = t.getMatmid();
//            userRolePowerService.addUserPowers(currUser,
//                    dataIds, CPowerDataType.MACRO);
//        }
        return getOpStatus(re);
    }

    /**
     * 删除指标 删除时要删除所有子节点
     * @param request
     * @param itemid 多个节点id逗号分隔
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/Type/Items/{itemid}", method = RequestMethod.DELETE)
    @ResponseBody
    public OpStatus delete(HttpServletRequest request,@PathVariable("itemid") String itemid) {
        List<TMacroTablemeta> t = new ArrayList<>() ;
        String[] ids = itemid.split(",");
        List<TMacroTablemeta> tables = new ArrayList<>();

        for(String id:ids){
            if(null == id||id.equals("")){
                continue;
            }
            int parid = Integer.parseInt(id);
            List<TMacroTablemeta> ts = macroTablemetaService.getMacroTablesByCatalog(parid);
            tables.addAll(ts);
            if (macroTablemetaService.one(parid)) {
                t.add( macroTablemetaService.delete(parid));
            }
        }

        //删除权限控制
        boolean re = null!=t&&t.size()>0;
//        if(re&&tables.size()>0){
//            int[] dataIds = new int[tables.size()];
//            int num =0;
//            for(TMacroTablemeta table:tables){
//                dataIds[num++] = table.getMatmid() ;
//            }
//            userRolePowerService.delUserPowers(currUser.getUserid(),
//                    dataIds, CPowerDataType.MACRO);
//        }
        return  getOpStatus(re);
    }

    /**
     * 更新指标
     * @param Catalog
     * @param itemid
     * @param macroTablemeta
     * @param idenmeta
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Items/{itemid}", method = RequestMethod.PUT)
    @ResponseBody
    public TMacroTablemeta update(@PathVariable("Type") int Catalog, @PathVariable("itemid") int itemid, TMacroTablemeta macroTablemeta,TMacroIdenmeta idenmeta) {
        if (macroTablemeta != null) {
            macroTablemeta.setReportType(Catalog);
            return macroTablemetaService.update(itemid, macroTablemeta,idenmeta);
        } else
            return null;
    }

    /**
     * 复制目录树 包括分类、表结构和指标
     * @param request
     * @param reportType
     * @param itemId
     * @param matmids
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/copy/{itemid}", method = RequestMethod.POST)
    @ResponseBody
    public OpStatus copyIndicators(HttpServletRequest request ,@PathVariable("Type") int reportType,
                                   int regionLevel, @PathVariable("itemid") int itemId,@RequestBody int[] matmids) {
        TUsers currUser = getSessionUser(request);
        ServiceResultInfo re = this.macroTablemetaService.copy(reportType, regionLevel, itemId, matmids);
        List<Object> added = re.getSuccessObjs() ;
        //综合权限到表
        List<Object> tables = re.getOtherObjs() ;
        if(tables.size()>0){
            int[] dataIds = new int[tables.size()];
            for(int i =0 ; i< tables.size() ;i++){
                TMacroTablemeta table = (TMacroTablemeta)tables.get(i) ;
                dataIds[i] = table.getMatmid() ;
            }
//            userRolePowerService.addUserPowers(currUser,
//                    dataIds, CPowerDataType.MACRO);
        }
        return new OpStatus(added.size()>0,added.size()>0?"成功复制"+added.size()+"条记录":"复制失败",null);
    }


    /**
     * 获取的时候也是，直接根据ID获取就可以了
     * @param itemid
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/Type/Items/{itemid}", method = RequestMethod.GET)
    @ResponseBody
    public MacroTablemeta getItem(@PathVariable("itemid") int itemid) {
        return macroTablemetaService.findOne(itemid);
    }


    /**
     * 根据指标码和级别获取tablemeta
     * @param level
     * @param idencodes
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "Items/level/{level}", method = RequestMethod.POST)
    @ResponseBody
    public  List<TMacroTablemeta>  getItemByCode(@PathVariable int level,@RequestBody  String[] idencodes) {
        if(idencodes.length<1 || level<1){
            return null;
        }
        return macroTablemetaService.findByCodesAndLevel(level, idencodes);
    }


    /**
     * 获取综合数据同类型、同级别的某目录下的子节点们
     * @param reportType
     * @param idenName
     * @param regionLevel
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Items/query", method = RequestMethod.GET)
    @ResponseBody
    public List<MacroQueryIden> queryListRoot(@PathVariable("Type") int reportType, String idenName, int regionLevel) {
        return macroTablemetaService.queryListRoot(idenName, regionLevel, reportType);
    }


    /**
     * 导入指标
     * @param request
     * @param reportType
     * @param parid
     * @param regionLevel
     * @param metaType
     * @param fileName
     * @param sheetName
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Items/{itemid}/import", method = RequestMethod.POST)
    @ResponseBody
    public OpStatus importMacroItems(HttpServletRequest request,
                                     @PathVariable("Type") int reportType,
                                     @PathVariable("itemid") int parid ,
                                     int regionLevel,int metaType,String fileName,String sheetName){
        List<List<Object>> rows = ExcelUtil.readExcel(fileName, sheetName, 1);
        ServiceResultInfo re = macroTablemetaService.importItems(parid, metaType, reportType, regionLevel, rows) ;
        TUsers currUser = getSessionUser(request);

        if(metaType == CMacroMetaType.TABLE_TYPE){
            int size = re.getSuccessObjs().size();
            //综合权限到表
            if(size>0){
                int[] dataIds = new int[size];
                for(int i =0; i<size; i++){
                    TMacroTablemeta t =(TMacroTablemeta) re.getSuccessObjs().get(i) ;
                    dataIds[i] = t.getMatmid();
                }
//              userRolePowerService.addUserPowers(currUser, dataIds, CPowerDataType.MACRO);
            }
        }
        return  new OpStatus(re.isStatus(),re.getReInfos(3) ,null );
    }

    /**
     * 模板下载
     * @param request
     * @param response
     * @param metaType
     * @throws Exception
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/Items/import/template/download", method = RequestMethod.GET)
    @ResponseBody
    public void dowloadTemplate(HttpServletRequest request,HttpServletResponse response ,int metaType) throws Exception{
        String name = "";
        switch (metaType){
            case CMacroMetaType.CATALOG_TYPE:
                name = "综合分类导入模板";
                break;
            case  CMacroMetaType.TABLE_TYPE:
                name ="综合表导入模板";
                break;
            case  CMacroMetaType.INDICATORITEM_TEYPE:
                name ="综合指标导入模板";
                break;
        }
        String filename = new String(name.getBytes(),"iso8859-1");
        response.reset();
        response.setContentType("APPLICATION/vnd.ms-excel");
        //注意，如果去掉下面一行代码中的attachment; 那么也会使IE自动打开文件。
        response.setHeader("Content-Disposition", "attachment;filename="+filename+".xls");
        HSSFWorkbook wk = macroTablemetaService.downloadTemplate(metaType);
        OutputStream out  =response.getOutputStream() ;
        wk.write(out);
        out.flush();
        out.close();
    }


    /**
     * 获取用户在某个级别下的表和目录
     * @param request
     * @param level
     * @return
     */
    @RequestMapping(value = "level/{level}/items",method = RequestMethod.GET)
    @ResponseBody
    public List<Integer> getUserTable(HttpServletRequest request ,@PathVariable int level){
        TUsers user = getSessionUser(request);
        List<TMacroTablemeta> tablemetas = macroTablemetaService.getByLevel(level);
        List<Integer> re = new ArrayList<>();
//        Map<Integer,String> powers = userRolePowerService.getPowerMapByDataType(user.getUserid(),CPowerDataType.MACRO);

        for(TMacroTablemeta tablemeta:tablemetas){
            int metaType = tablemeta.getMacmetaType() ;

            boolean flag = false ;
            if(metaType == CMacroMetaType.TABLE_TYPE){      //表
                //如有有权限
//                if(powers.containsKey(tablemeta.getMatmid())){
                    flag = true ;
//                }
            }

            else  if(metaType == CMacroMetaType.CATALOG_TYPE){   //分类
                List<TMacroTablemeta> subTables = macroTablemetaService.getMacroTablesByCatalog(tablemeta.getMatmid());
                //空分类也给显示出来
                if(null == subTables||subTables.size()==0){
                    flag = true ;
                }else{
                    for(TMacroTablemeta t:subTables){
//                        if(!powers.containsKey(t.getMatmid())){
//                            continue;
//                        }
                        flag = true ;
                        break;
                    }
                }
            }

            if(flag){
                re.add(tablemeta.getMatmid());
            }
        }

        return  re ;
    }


    /**
     * 获取某报告期类型、区划级别的某表下的子节点（目录、表、指标[不包括分组子指标]）
     * @param reportType 报告期类型
     * @param parid 单表ID
     * @param regionLevel 区划级别
     * @param matmids 多表ID组
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Items", method = RequestMethod.GET)
    @ResponseBody
    public List<TMacroTablemeta> getIndicators(HttpServletRequest request ,
                                               @PathVariable("Type") int reportType,
                                               String parid, int regionLevel,
                                               @RequestBody int[] matmids) {
        int _parid = 0;
        if(parid==null || parid.isEmpty()){
           _parid = 0;
        }else{
            _parid = Integer.parseInt(parid);
        }


        TUsers user = getSessionUser(request);
        List<TMacroTablemeta> tablemetas = new ArrayList<>();
        List<TMacroTablemeta> re = new ArrayList<>();
        if(matmids!=null && matmids.length>0){
            tablemetas = macroTablemetaService.getByMatmids(matmids);//跨表的指标ID组查询
        }else{
            tablemetas = macroTablemetaService.listRoot(_parid, regionLevel, reportType);//单表指标查询
        }
//        Map<Integer,String> powers = userRolePowerService.getPowerMapByDataType(user.getUserid(),CPowerDataType.MACRO);
        for(TMacroTablemeta tablemeta:tablemetas){
            int metaType = tablemeta.getMacmetaType() ;
            //如果是指标 不做权限控制
            if(metaType == CMacroMetaType.INDICATORITEM_TEYPE){
                re.add(tablemeta);//当前指标
                continue;
            }
            boolean flag = false ;
            if(metaType == CMacroMetaType.TABLE_TYPE){//表
                //如有有权限
//                if(powers.containsKey(tablemeta.getMatmid())){
                    flag = true ;
//                }

            }else  if(metaType == CMacroMetaType.CATALOG_TYPE){//目录
                List<TMacroTablemeta> subTables = macroTablemetaService.getMacroTablesByCatalog(tablemeta.getMatmid());
                //空分类也给显示出来
                if(null == subTables||subTables.size()==0){
                    flag = true ;
                }else{
                    for(TMacroTablemeta t:subTables){
//                        if(!powers.containsKey(t.getMatmid())){
//                            continue;
//                        }
                        flag = true ;
                        break;
                    }
                }
            }
            if(flag){
                re.add(tablemeta);
            }
        }
        return  re ;
    }

    /**
     * 获取综合数据同类型、同级别的某目录下的全部指标（包括分组子指标）
     * @param reportType
     * @param parid
     * @param regionLevel
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/allInds", method = RequestMethod.GET)
    @ResponseBody
    public List<MacroReIndicator> getALLIndicators(HttpServletRequest request ,@PathVariable("Type") int reportType, int parid, int regionLevel,
                                               @RequestBody int[] matmids) {
        //TUsers user = getSessionUser(request);
        List<TMacroTablemeta> tablemetas = new ArrayList<>();
        List<MacroReIndicator> re = new ArrayList<>();
        if(matmids!=null && matmids.length>0){
            tablemetas = macroTablemetaService.getByMatmids(matmids);//跨表的指标ID组查询
        }else{
            tablemetas = macroTablemetaService.listRoot(parid, regionLevel, reportType);//当表指标查询
        }
        //Map<Integer,String> powers = userRolePowerService.getPowerMapByDataType(user.getUserid(),CPowerDataType.MACRO);
        for(TMacroTablemeta tablemeta:tablemetas){
            int metaType = tablemeta.getMacmetaType() ;
            //如果是指标 不做权限控制
            if(metaType == CMacroMetaType.INDICATORITEM_TEYPE){
                MacroReIndicator mri = macroTablemetaService.getSubIndicators(tablemeta);//解析分组子指标
                re.add(mri);//当前指标
            }
        }
        return re ;
    }

    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Items/item", method = RequestMethod.GET)
    @ResponseBody
    public List<TMacroTablemeta> getIndicatorsByName(@PathVariable("Type") int reportType, String idenName) {
        return macroTablemetaService.getByreportTypeAndName(reportType, idenName);
    }

    /**
     * 综合数据某一类型的根节点
     *
     * @param reportType  报告期
     * @param regionLevel 行政区划级别
     * @return 构建DhtmlTreeXML
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/rootItems", method = RequestMethod.GET)
    @ResponseBody
    public String getRootItems(@PathVariable("Type") int reportType, int regionLevel,boolean hasCheckbox) {
        boolean hasNoCheckbox = !hasCheckbox?true:false;
        ArrayList<TMacroTablemeta> macroTablemetas = (ArrayList<TMacroTablemeta>) macroTablemetaService.listRoot(0, regionLevel, reportType);
        List<DHTMLXTree> nodes = toTree(macroTablemetas, hasNoCheckbox) ;
        DHTMLXTree root = new DHTMLXTree("root","综合指标目录").open().noCheckbox();
        for(DHTMLXTree n:nodes){
            root.add(n);
        }
        return DHTMLXTreeFactory.toTree(root);
    }

    /**
     * 获取前台指标树某一级的子节点
     *
     * @param reportType
     * @param itemid
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/leafItems", method = RequestMethod.GET)
    @ResponseBody
    public String getLeafItems(@PathVariable("Type") int reportType, int itemid,boolean hasCheckbox) {
        boolean hasNoCheckbox = !hasCheckbox?true:false;
        TMacroTablemeta macroTablemeta = macroTablemetaService.getOne(itemid);
        if (macroTablemeta != null) {
            //不带checkbox只到表 带checkbox到指标
            int metaType = macroTablemeta.getMacmetaType() ;
            if ((hasNoCheckbox&& metaType == CMacroMetaType.CATALOG_TYPE)||
                    (!hasNoCheckbox&&metaType < CMacroMetaType.INDICATORITEM_TEYPE)) {
                int parid = macroTablemeta.getMatmid();
                ArrayList<TMacroTablemeta> macroTablemetaChild = (ArrayList<TMacroTablemeta>) macroTablemetaService.getByParidAndreportType(parid, reportType);
                DHTMLXTree root = DHTMLXTreeFactory.getNode(String.valueOf(parid), macroTablemeta.getIdenName());
                return toleafTree(macroTablemetaChild, root, hasNoCheckbox).toString();
            } else
                return fail().setMsg("节点下没有内容").toString();
        }
        return fail().setMsg("节点不存在").toString();
    }

    /**
     * 获取静态树
     * @param reportType
     * @param regionLevel
     * @param hasCheckbox
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/tree", method = RequestMethod.GET)
    @ResponseBody
    public String getStaticTree(@PathVariable("Type") int reportType, int regionLevel,boolean hasCheckbox) {
        boolean hasNoCheckbox = !hasCheckbox?true:false;
        List<DHTMLXTree> nodes = macroTablemetaService.getTree(reportType,regionLevel,0,hasNoCheckbox);//从根节点开始
        DHTMLXTree root = new DHTMLXTree("root","综合指标目录").open().noCheckbox();
        for(DHTMLXTree n:nodes){
            root.add(n);
        }
        return DHTMLXTreeFactory.toTree(root);
    }


    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Periods/{Period}/Items", method = RequestMethod.GET)
    @ResponseBody
    public List<TMacroTablemeta> getPeridAllItems(@PathVariable("Type") int Type, @PathVariable("Period") int Period) {
        return macroTablemetaService.getAllByReporttypePeriod(Type, Period);
    }

    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Periods/{Period}/Items/{item}", method = RequestMethod.GET)
    @ResponseBody
    public TMacroTablemeta getPeridItem(@PathVariable("Type") int Type, @PathVariable("Period") int Period, @PathVariable("item") int item) {
        return macroTablemetaService.getCatalogByMacmetaTypeAndReporttype(Type, Period, item);
    }

    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Periods/{Period}/Items/Import", method = RequestMethod.GET)
    @ResponseBody
    public OpStatus getPeridAllItemsImport() {
        return getOpStatus(true);
    }

    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Periods/{Period}/Items/Export", method = RequestMethod.GET)
    @ResponseBody
    public OpStatus getPeridItemExport() {
        return getOpStatus(true);
    }

    @Permission(Role.USER)
    @RequestMapping(value = "/Types/{Type}/Periods/{Period}/RootItems", method = RequestMethod.GET)
    @ResponseBody
    public String getAllPeridRootItems(@PathVariable("Type") int Type, @PathVariable("Period") int period) {
        ArrayList<TMacroTablemeta> macroTablemetas = (ArrayList<TMacroTablemeta>) macroTablemetaService.getByParidAndreportTypeInPeriod(0, Type, period);
        return DHTMLXTreeFactory.toTree(toTree(macroTablemetas, true));
    }

    @RequestMapping(value = "/Types/{Type}/Periods/{Period}/LeafItems", method = RequestMethod.GET)
    @ResponseBody
    public String getAllPeridLeafItems(int itemid, @PathVariable("Type") int Type, @PathVariable("Period") int period) {
        TMacroTablemeta macroTablemeta = macroTablemetaService.getOne(itemid);
        if (macroTablemeta != null) {
            if (macroTablemeta.getHasChild() == 1) {
                int parid = macroTablemeta.getMatmid();
                ArrayList<TMacroTablemeta> macroTablemetaChild = (ArrayList<TMacroTablemeta>) macroTablemetaService.getByParidAndreportTypeInPeriod(parid, Type, period);
                DHTMLXTree root = DHTMLXTreeFactory.getNode(String.valueOf(parid), macroTablemeta.getIdenName());
                root = root.setUserData("metaType",macroTablemeta.getMacmetaType()+"") ;
                return toleafTree(macroTablemetaChild, root, true).toString();
            } else
                return "";
        }
        return "";
    }

    //根据表ID查询最小报告期时间
    @Permission(Role.USER)
    @RequestMapping(value = "/Data/Query/Rank", method = RequestMethod.GET)
    @ResponseBody
    public TimeRank getTimeRank(int parid, int reportType) {
        List<TMacroPeriod> macroPeriods = macroTableinfoService.getPeriodByParid(parid);
        return macroTableinfoService.calculateTimeRank(macroPeriods, reportType);
    }

    //根据指标ID集，查询最小报告期时间
    @Permission(Role.USER)
    @RequestMapping(value = "/Data/Query/Ranks", method = RequestMethod.GET)
    @ResponseBody
    public TimeRank getTimeRanks(@RequestBody int[] matmids) {
        if(matmids.length<1) return null;
        TMacroTablemeta oneTMT = macroTablemetaService.getOne(matmids[0]);
        List<TMacroPeriod> macroPeriods = macroTableinfoService.getPeriodByMatmids(matmids);
        return macroTableinfoService.calculateTimeRank(macroPeriods, oneTMT.getReportType());
    }

    /**
     * 过滤两端无数据的报告期时间
     * @param macroQuery
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "Data/Query/hasRanks",method = RequestMethod.POST)
    @ResponseBody
    public TimeRank getTimeRanks(@RequestBody MacroQuery macroQuery) {
        String tableName = macroTablemetaService.recogniseTableName(macroQuery.getRegionLevel());
        //获取表下的指标
        Map<String, Object> map = this.filterIndicators(macroQuery);
        String indicatorStr = map.get("selIndCode").toString();//当前表下的全部（或选中）指标CODE
        List<TMacroPeriod> macroPeriods = macroTableinfoService.getPeriodByMatmids(macroQuery.getMatmids());
        TimeRank timeRank = macroTableinfoService.calculateTimeRank(macroPeriods, macroQuery.getReportType());

        timeRank = macroTableinfoService.trimTimeRank(timeRank,tableName,indicatorStr,macroQuery.getReportType());

        return timeRank;
    }

    //指标分组部分、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、

    /**
     * 创建分组
     * @param macroIdent
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups", method = RequestMethod.POST)
    @ResponseBody
    public OpStatus createenumGroup(TMacroIdent macroIdent) {
        TMacroIdent macroIdent1 = null;
        if (!macroTablemetaService.one(macroIdent.getMaitid())) {
            macroIdent1 = macroIdentService.create(macroIdent);
        }
        if (macroIdent1 != null) {
            return getOpStatus(true);
        } else
            return getOpStatus(false);
    }

    /**
     * 删除分组
     * @param gourpid
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{gourpid}", method = RequestMethod.DELETE)
    @ResponseBody
    public OpStatus deleteenumGroup(@PathVariable("gourpid") int gourpid) {
        if (macroIdentService.one(gourpid)) {
            macroIdentService.delete(gourpid);
            return getOpStatus(true);
        } else
            return getOpStatus(false);
    }

    /**
     * 更新分组
     * @param gourpid
     * @param macroIdent
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{gourpid}", method = RequestMethod.PUT)
    @ResponseBody
    public TMacroIdent updateenumGroup(@PathVariable("gourpid") int gourpid, TMacroIdent macroIdent) {
        return macroIdentService.update(gourpid, macroIdent);
    }

    /**
     * 获取分组
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups", method = RequestMethod.GET)
    @ResponseBody
    public List<TMacroIdent> getEnumGroups() {
        return macroIdentService.getAll();
    }


    /**
     * 获取分组树
     *
     * @return
     */
    @RequestMapping(value = "/enumGroups/tree",method = RequestMethod.GET)
    @ResponseBody
    public String getAllIdentTree(){
        return macroIdentService.createGroupTree();
    }

    /**
     * 导入分组  TODO
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/import", method = RequestMethod.GET)
    @ResponseBody
    public OpStatus enumGroupsImport() {
        return getOpStatus(true);
    }

    /**
     * 导出分组 TODO
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/export", method = RequestMethod.GET)
    @ResponseBody
    public OpStatus enumGroupsExport() {
        return getOpStatus(true);
    }

    /**
     * 获取一个分组
     *
     * @param gourpid 分组id
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{gourpid}", method = RequestMethod.GET)
    @ResponseBody
    public TMacroIdent getEnumGroup(@PathVariable("gourpid") int gourpid) {
        return macroIdentService.getOne(gourpid);
    }


    ////////////分组值

    /**
     * 获取分组值
     * @param gourpid 分组id
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{gourpid}/enums", method = RequestMethod.GET)
    @ResponseBody
    public List<TMacroIdenvl> getEnumGroupEnums(@PathVariable("gourpid") int gourpid) {
        return macroIdenvlService.getByGroup(gourpid);
    }

    /**
     * 某一枚举分类下的某一枚举值
     *
     * @param gourpid 分组id
     * @param enumid  分组值id
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{gourpid}/enums/{enumid}", method = RequestMethod.GET)
    @ResponseBody
    public TMacroIdenvl getEnumGroupEnum(@PathVariable("gourpid") int gourpid, @PathVariable("enumid") int enumid) {
        return macroIdenvlService.getByGroupAndEnum(gourpid, enumid);
    }

    /**
     * 某一枚举分类下枚举值的导入 TODO
     *
     * @param gourpid
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{gourpid}/enums/import", method = RequestMethod.GET)
    @ResponseBody
    public List<TMacroTablemeta> getEnumGroupEnumsImport(@PathVariable("gourpid") int gourpid) {
        return null;
    }

    /**
     * 判断分组code是否存在
     * @param gourpid
     * @param code
     * @return
     */
    @RequestMapping(value = "/enumGroups/{gourpid}/enums/code/{code}", method = RequestMethod.GET)
    @ResponseBody
    public OpStatus checkIdenvlCodeExist(@PathVariable("gourpid") int gourpid,@PathVariable("code") String code){
        boolean re =  macroIdenvlService.checkIdenvlCodeExist(gourpid,-1,code);
        return  getOpStatus(re);
    }

    /**
     * 判断某个分组下的分组值的code是否存在
     * @param gourpid
     * @param enumid
     * @param code
     * @return
     */
    @RequestMapping(value = "/enumGroups/{gourpid}/enums/{enumid}/code/{code}", method = RequestMethod.GET)
    @ResponseBody
    public OpStatus checkIdenvlCodeExistByEdit(@PathVariable("gourpid") int gourpid,@PathVariable("enumid") int enumid,@PathVariable("code") String code){
        boolean re =  macroIdenvlService.checkIdenvlCodeExist(gourpid,enumid,code);
        return  getOpStatus(re);
    }

    /**
     * 创建分组值
     * @param gourpid
     * @param idenvl
     * @return
     */
    @RequestMapping(value = "/enumGroups/{gourpid}/enums", method = RequestMethod.POST)
    @ResponseBody
    public OpStatus createIdenvl(@PathVariable("gourpid") int gourpid,TMacroIdenvl idenvl){
        TMacroIdent tMacroIdent = macroIdentService.getOne(gourpid);
        boolean re = false;
        String info ="分组值创建成功";
        if(tMacroIdent != null){
            idenvl.setTMacroIdent(tMacroIdent);
            //检验是否存在
            boolean isExists = macroIdenvlService.checkIdenvlCodeExist(gourpid,-1,idenvl.getCode());
            if(!isExists){
                re = macroIdenvlService.create(idenvl);
            }else{
                info = "添加失败,该分组值代码已经存在！";
            }
        }
        return new OpStatus(re , info,null);
    }

    /**
     * 更新分组值
     * @param groupid
     * @param enumid
     * @param idenvl
     * @return
     */
    @RequestMapping(value = "/enumGroups/{groupid}/enums/{enumid}",method = RequestMethod.PUT)
    @ResponseBody
    public OpStatus updateOneIdentvl(@PathVariable int groupid,@PathVariable int enumid,@RequestBody TMacroIdenvl idenvl){
        boolean isExists =  macroIdenvlService.checkIdenvlCodeExist(groupid,-1,idenvl.getCode());
        if(isExists){
            return  new OpStatus(false,"该分组值已经存在!",null);
        }
        boolean re =macroIdenvlService.update(enumid, idenvl);
        return getOpStatus(re);
    }

    /**
     * 删除分组值
     * @param groupid
     * @param enumids
     * @return
     */
    @RequestMapping(value = "/enumGroups/{groupid}/enums/{enumid}",method = RequestMethod.DELETE)
    @ResponseBody
    public OpStatus deleteOneIdentvl(@PathVariable int groupid,@RequestBody int[] enumids){
        boolean re = false;
        int count = 0;
        for(int i=0,size=enumids.length; i<size; i++){
            int enumid = enumids[i];
            TMacroIdenvl tMacroIdenvl = macroIdenvlService.getByGroupAndEnum(groupid,enumid);
            if(tMacroIdenvl != null){
                //
                //删除某个节点时，将下级节点的父节点更新为删除节点的父节点
                //
                String currentParid = tMacroIdenvl.getParid();  //获取要删除的节点的父节点
                List<TMacroIdenvl> childList = macroIdenvlService.listRoot(tMacroIdenvl.getCode(),groupid); //获取下级子节点
                if(childList != null && childList.size() > 0){
                    for (TMacroIdenvl tMacroIdenvl1 : childList){
                        tMacroIdenvl1.setParid(currentParid);           //修改下级节点的父节点 为删除的父节点
                        macroIdenvlService.update(tMacroIdenvl1.getMaivid(),tMacroIdenvl1);
                    }
                }

                re =macroIdenvlService.delete(enumid);
                count++;
            }
        }
        re = count>0;
        return  getOpStatus(re);
    }

    /**
     * 下载导入分组值的模板
     *
     * @param request
     * @param response
     * @throws Exception
     */
    @RequestMapping(value = "/enumGroups/enums/import/template/download",method = RequestMethod.GET)
    @ResponseBody
    public void downloadTempalte(HttpServletRequest request,HttpServletResponse response)
            throws  Exception{
        String filename = new String("综合枚举值导入模板".getBytes(),"iso8859-1");
        response.reset();
        response.setContentType("APPLICATION/vnd.ms-excel");
        //注意，如果去掉下面一行代码中的attachment; 那么也会使IE自动打开文件。
        response.setHeader("Content-Disposition", "attachment;filename="+filename+".xls");
        HSSFWorkbook wk = macroIdenvlService.downloadTemplate();
        OutputStream out  =response.getOutputStream() ;
        wk.write(out);
        out.flush();
        out.close();
    }

    /**
     * 导入分组值数据
     *
     * @param request
     * @param groupid
     * @param path
     * @param sheetName
     * @return
     */
    @RequestMapping(value = "/enumGroups/{groupid}/enums/import",method = RequestMethod.POST)
    @ResponseBody
    public OpStatus importIdenvl(HttpServletRequest request,@PathVariable int groupid,@Param("path") String path,
                             @Param("sheetName") String sheetName){
        String re= "";
        TMacroIdent ident = macroIdentService.getOne(groupid);
        if(ident != null) {
            re = macroIdenvlService.importIdenvl(ident,path,sheetName,0);//从序号0行读
        }

        return  new OpStatus(true,re,null);
    }




    /**
     * 某一分组的所有节点
     *
     * @param maitid  所属分组
     *
     * @return 构建DhtmlTreeXML
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{groupid}/enums/allItems", method = RequestMethod.GET)
    @ResponseBody
    public String getMacroidenvlAllItems(@PathVariable("groupid") int maitid) {
        ArrayList<TMacroIdenvl> tMacroIdenvls = (ArrayList<TMacroIdenvl>) macroIdenvlService.listRoot("root", maitid);
        DHTMLXTree root = new DHTMLXTree("root","根节点");
        root.setUserData("code","root");
        root.setTooltip("根节点");
        root =  macroIdenvlListToAllTree(tMacroIdenvls,root,maitid,true);

        return DHTMLXTreeFactory.toTree(root);
    }

    /**
     * 某一分组值的根节点(第一级)
     *
     * @param maitid  所属分组
     *
     * @return 构建DhtmlTreeXML
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{groupid}/enums/rootItems", method = RequestMethod.GET)
    @ResponseBody
    public String getMacroidenvlRootItems(@PathVariable("groupid") int maitid) {
        ArrayList<TMacroIdenvl> macroTablemetas = (ArrayList<TMacroIdenvl>) macroIdenvlService.listRoot("root", maitid);
        return macroIdenvlListToRootTree(macroTablemetas, maitid, true);
    }


    /**
     * 某一分组值的子节点
     *
     * @param maitid  所属分组
     *
     * @return 构建DhtmlTreeXML
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/enumGroups/{groupid}/enums/{enumid}/rootItems", method = RequestMethod.GET)
    @ResponseBody
    public String getMacroidenvlChildItems(@PathVariable("groupid") int maitid,@PathVariable("enumid") int maivid) {
        TMacroIdenvl tMacroIdenvl = macroIdenvlService.getByGroupAndEnum(maitid,maivid);
        if(tMacroIdenvl != null){
            DHTMLXTree root = DHTMLXTreeFactory.getNode(String.valueOf(maivid),tMacroIdenvl.getName());
            root.setTooltip(tMacroIdenvl.getName());
            root.setUserData("code",tMacroIdenvl.getCode());
            ArrayList<TMacroIdenvl> macroTablemetas = (ArrayList<TMacroIdenvl>) macroIdenvlService.listRoot(tMacroIdenvl.getCode(), maitid);
            return macroIdenvlListToChildTree(macroTablemetas,root,maitid, true);
        }
        return fail().setMsg("节点不存在").toString();
    }


    /**
     * 判断指定分组值是否有子节点
     *
     * @param maivid
     *             分组值id
     * @param code
     *             分组值code
     * @return
     */
    private boolean hasChildItemBygroupIdAndCode(int maivid,String code){
        return macroIdenvlService.hasChildItemBygroupIdAndCode(maivid, code);
    }


    /**
     * 将分组值列表数据转换为所有树数据（递归所有的数据）
     *
     * @param tMacroIdenvls
     * @param root
     * @param maitid
     * @param isNoCheckbox
     *
     * @return
     */
    private DHTMLXTree macroIdenvlListToAllTree(ArrayList<TMacroIdenvl> tMacroIdenvls,DHTMLXTree root,int maitid,boolean isNoCheckbox){

        if(tMacroIdenvls != null){
            for (TMacroIdenvl tMacroIdenvl : tMacroIdenvls){
                DHTMLXTree node =  DHTMLXTreeFactory.getNode(String.valueOf(tMacroIdenvl.getMaivid()),tMacroIdenvl.getName());
                node.setUserData("code",tMacroIdenvl.getCode());
                node.setTooltip(tMacroIdenvl.getName());
                if(isNoCheckbox){
                    node.noCheckbox();
                }
                if(hasChildItemBygroupIdAndCode(maitid,tMacroIdenvl.getCode())){
                    ArrayList<TMacroIdenvl> childTMacroIdenvls = (ArrayList<TMacroIdenvl>)
                            macroIdenvlService.listRoot(tMacroIdenvl.getCode(), maitid);
                    //递归
                    node = macroIdenvlListToAllTree(childTMacroIdenvls,node,maitid,isNoCheckbox);
                }
                root.add(node);
            }
        }
        return root;
    }



    /**
     * 将分组值列表数据转换为子树数据
     *
     * @param tMacroIdenvls
     * @param isNoCheckbox
     * @param maitid
     *
     * @return
     */
    private String macroIdenvlListToChildTree(ArrayList<TMacroIdenvl> tMacroIdenvls,DHTMLXTree root,int maitid,boolean isNoCheckbox){
        for (TMacroIdenvl tMacroIdenvl : tMacroIdenvls){
            DHTMLXTree node =  DHTMLXTreeFactory.getNode(String.valueOf(tMacroIdenvl.getMaivid()),tMacroIdenvl.getName());
            node.setUserData("code",tMacroIdenvl.getCode());
            node.setTooltip(tMacroIdenvl.getName());
            if(isNoCheckbox){
                node.noCheckbox();
            }
            if(hasChildItemBygroupIdAndCode(maitid,tMacroIdenvl.getCode()))
                node.add(DHTMLXTreeFactory.getLoading());
            root.add(node);
        }
        return root.toString();
    }

    /**
     * 将分组值列表数据转换为树数据
     *
     * @param tMacroIdenvls
     * @param isNoCheckbox
     * @param maitid
     *
     * @return
     */
    private String macroIdenvlListToRootTree(ArrayList<TMacroIdenvl> tMacroIdenvls,int maitid,boolean isNoCheckbox){
        DHTMLXTree root = new DHTMLXTree("root","根节点");
        root.setUserData("code","root");
        root.setTooltip("根节点");
        for (TMacroIdenvl tMacroIdenvl : tMacroIdenvls){
            DHTMLXTree node =  DHTMLXTreeFactory.getNode(String.valueOf(tMacroIdenvl.getMaivid()),tMacroIdenvl.getName());
            node.setUserData("code",tMacroIdenvl.getCode());
            node.setTooltip(tMacroIdenvl.getName());
            if(isNoCheckbox){
                node.noCheckbox();
            }
            if(hasChildItemBygroupIdAndCode(maitid,tMacroIdenvl.getCode()))
                node.add(DHTMLXTreeFactory.getLoading());
            root.add(node);
        }
        return DHTMLXTreeFactory.toTree(root);
    }

    private ArrayList<DHTMLXTree> toTree(ArrayList<TMacroTablemeta> macroTablemetas, boolean isNocheckbox) {
        ArrayList<DHTMLXTree> nodes = new ArrayList<DHTMLXTree>();
        for (TMacroTablemeta macroTablemeta : macroTablemetas) {
            DHTMLXTree node = DHTMLXTreeFactory.getNode(String.valueOf(macroTablemeta.getMatmid()), macroTablemeta.getIdenName());
            node = node.setUserData("metaType",macroTablemeta.getMacmetaType()+"") ;
            if (isNocheckbox) {
                node.noCheckbox();
            }
            int metaType = macroTablemeta.getMacmetaType() ;
            node.setTooltip(macroTablemeta.getIdenName());
            //分类
            if (macroTablemeta.getHasChild() == 1&&metaType == CMacroMetaType.CATALOG_TYPE) {
                node.add(DHTMLXTreeFactory.getLoading());
            }
            nodes.add(node);
        }
        return nodes;
    }

    private DHTMLXTree toleafTree(ArrayList<TMacroTablemeta> leafRegion, DHTMLXTree root, boolean isNocheckbox) {
        for (TMacroTablemeta macroTablemeta : leafRegion) {
            DHTMLXTree node = new DHTMLXTree(String.valueOf(macroTablemeta.getMatmid()), macroTablemeta.getIdenName());
            node = node.setUserData("metaType",macroTablemeta.getMacmetaType()+"") ;
            if (isNocheckbox) {
                node.noCheckbox();
            }
            int metaType = macroTablemeta.getMacmetaType() ;
            node.setTooltip(macroTablemeta.getIdenName());
            if(isNocheckbox){
                if (macroTablemeta.getHasChild() == 1&&metaType <CMacroMetaType.TABLE_TYPE) {
                    node.add(DHTMLXTreeFactory.getLoading());
                }
            }else{
                //如果是带checkbox可以到指标一级
                if (macroTablemeta.getHasChild() == 1&&metaType <CMacroMetaType.INDICATORITEM_TEYPE) {
                    node.add(DHTMLXTreeFactory.getLoading());
                }
            }

            root.add(node);
        }
        return root;
    }


    /**
     * 根据指标ID查询所属的枚举分类
     */
    @RequestMapping(value = "/enum/info/{matmid}",method = RequestMethod.GET)
    @ResponseBody
    public List<TMacroIdentinfo> getByMatmid(@PathVariable int matmid){
        List<TMacroIdentinfo> infos=macroIdentInfoService.getByMatmid(matmid);
        return infos ;
    }

    /**
     * 设置指标分组
     * @param matmid 指标id
     * @param maitid 枚举分组id
     * @return
     */
    @RequestMapping(value = "/enum/info/{matmid}",method = RequestMethod.POST)
    @ResponseBody
    public OpStatus setEnum(@PathVariable int matmid,int maitid){
        return  getOpStatus(this.macroIdentInfoService.setEnum(matmid, maitid));
    }

    @RequestMapping(value = "/enum/info/{matmid}",method = RequestMethod.DELETE)
    @ResponseBody
    public OpStatus delEnumGroup(@PathVariable int matmid,int maitid){
        return  getOpStatus(this.macroIdentInfoService.deleteEnum(matmid, maitid));
    }
    /**
     * delete 删除分组
     * @return
     */
    @RequestMapping(value = "/del/enum/info/{maiiids}",method = RequestMethod.DELETE)
    @ResponseBody
    public OpStatus delByMaiiid(@PathVariable String maiiids){
        String[] ids=maiiids.split(",");
        List<Integer> list=new ArrayList();
        for(String id:ids){
            list.add(Integer.valueOf(id));
        }
        boolean re =macroIdentInfoService.delByMatmid(list);
        return getOpStatus(re);
    }


    //过滤选中的指标
    private Map<String,Object> filterIndicators(MacroQuery macroQuery){
        List<TMacroTablemeta> selIndicators = new ArrayList<TMacroTablemeta>();//指定查询指标数组
        String indicatorStr = "";//指定查询指标字符串
        List<TMacroTablemeta> allIndicators = null;
        //查询父表ID 或 所选指标ID集下全部指标
        if(macroQuery.getMatmids() == null || macroQuery.getMatmids().length<1) {
            allIndicators = macroTablemetaService.getByParidAndreportType(Integer.parseInt(macroQuery.getParid()), macroQuery.getReportType());
        }else{
            allIndicators = macroTablemetaService.getByMatmids(macroQuery.getMatmids());
        }

        List<String> indicatorCodes = macroQuery.getIndicatorCodes();//指定查询指标CODE
        if (!indicatorCodes.equals(null) && indicatorCodes.size() > 0) {
            for (int i=0,size=indicatorCodes.size(); i<size; i++) {
                indicatorStr += "'" + indicatorCodes.get(i) + "',";
                for (TMacroTablemeta t : allIndicators) {
                    if (t.getIdenCode().equals(indicatorCodes.get(i))) {
                        selIndicators.add(t);
                        break;
                    }
                }
            }
        } else {
            selIndicators = allIndicators;
            for (TMacroTablemeta t : allIndicators) {
                indicatorStr += "'" + t.getIdenCode() + "',";
            }
        }
        //枚举分组指标 也要纳入其中
        for(TMacroTablemeta selInd:selIndicators){
            List<TMacroIdenmeta> groupInds = macroTablemetaService.findAllGroupInd(selInd);
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
        Map<String,Object> reMap = new HashMap<>();
        reMap.put("selInd",selIndicators);
        reMap.put("selIndCode",indicatorStr);
        return reMap;
    }

    /**
     * 指标异步模糊查询
     */
    @RequestMapping(value = "idenQuery",method = RequestMethod.GET)
    @ResponseBody
    public String idenQuery( String q,String currentLvl){

        List result = macroTablemetaService.idenQuery(q,Integer.parseInt(currentLvl));
        String resultlast = "";
        for (Object o :result){
            String temp = o.toString();
            temp = temp+"\n";
            resultlast = resultlast+temp;
        }
        if (resultlast.length() >= 2){
            resultlast = resultlast.substring(0, resultlast.length()-1);
        }
        //String resultlast = "{text:'LinkA', url:'/page1'} \n {text:'Link B', url: '/page2'} ";
        return resultlast;
    }
}
