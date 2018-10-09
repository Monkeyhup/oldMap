package com.supermap.sgis.visual.api;


import com.supermap.sgis.visual.annotation.Permission;
import com.supermap.sgis.visual.annotation.Role;
import com.supermap.sgis.visual.common.RegionSupport;
import com.supermap.sgis.visual.data.OpStatus;
import com.supermap.sgis.visual.data.PageInfo;
import com.supermap.sgis.visual.entity.TRegioncatalog;
import com.supermap.sgis.visual.entity.TRegioninfo;
import com.supermap.sgis.visual.entity.TemporaryImport;
import com.supermap.sgis.visual.json.ImportRegionResult;
import com.supermap.sgis.visual.json.Region;
import com.supermap.sgis.visual.service.RegionCatalogsService;
import com.supermap.sgis.visual.service.RegionInfoService;
import com.supermap.sgis.visual.service.TemporaryImportService;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


/**
 * 地图类型操作API
 *
 * @author Created by Administrator on 14-3-3.
 */
@Controller
@RequestMapping(value = {"/regionCatalogs","/service/regionCatalogs"})
public class RegionCatalogsController extends BaseController {

    /**行政区划类型server*/
    @Autowired
    private RegionCatalogsService regionCatalogsService;

    /**行政区划编码 server*/
    @Autowired
    private RegionInfoService regionInfoService;

    /**行政区划导入临时记录 server*/
    @Autowired
    private TemporaryImportService temporaryImportService;

    /**
     * 添加地图分类（按照年份添加）
     * @param regioncatalog
     * 				要创建的地图记录
     * @return	创建状态结果
     */
    @RequestMapping(value = "", method = RequestMethod.POST)
    @ResponseBody
    public OpStatus create(@RequestBody TRegioncatalog regioncatalog) {
        //刚开始创建，还没有导入相应行政区划的时候状态有标注
        if (regionCatalogsService.add(regioncatalog)) {
            return getOpStatus(true);
        } else
            return getOpStatus(false);
    }

    /**
     * 删除（应删除）地图分类
     *
     * @param id
     * 			指定要删除的
     *
     * @return 删除状态结果
     */
    @Permission(Role.ADMIN)
    @RequestMapping(value = "/{catalogid}", method = RequestMethod.DELETE)
    @ResponseBody
    public OpStatus remove(@PathVariable("catalogid") int id) {
        //同时删除行政区划树中的信息，级联完成
        if (regionCatalogsService.delete(id)) {
            return getOpStatus(true);
        } else return getOpStatus(false);
    }

    /**
     * 更新地图分类
     *
     * @param catalogid
     * 			指定要更新的地图记录
     * @param regioncatalog
     * 			更新后信息
     * @return 更新状态结果
     */
    @Permission(Role.ADMIN)
    @RequestMapping(value = "/{catalogid}", method = RequestMethod.PUT)
    @ResponseBody
    public OpStatus modify(@PathVariable("catalogid") int catalogid,
                           @RequestBody TRegioncatalog regioncatalog) {

        //如果是修改年份，那就得查看该年份的分类是否已经有了，不能重复……
        if (regionCatalogsService.update(catalogid, regioncatalog)) {
            return getOpStatus(true);
        } else
            return getOpStatus(false);
    }

    /**
     * 根据指定的catalogid获取一条记录
     *
     * @param id
     * 			指定的catalogid
     *
     * @return	指定的
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}", method = RequestMethod.GET)
    @ResponseBody
    public TRegioncatalog find(@PathVariable("catalogid") int id) {
        return regionCatalogsService.get(id);
    }

    /**
     * 分页查找所有的地图类型
     *
     * @param pageInfo
     * 			分页参数
     * @return	指定分页数据
     */
    @Permission(Role.USER)
    @RequestMapping(value = "", method = RequestMethod.GET)
    @ResponseBody
    public Page<TRegioncatalog> findAll(PageInfo pageInfo) {
        return regionCatalogsService.getAll(getPageRequest(pageInfo));
    }

    /**
     * 获取有效状态（CStatus.READY）下的所有行政区划类型列表
     *
     * @return 行政区划类型列表
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/valid", method = RequestMethod.GET)
    @ResponseBody
    public List<TRegioncatalog> findAll() {
        return regionCatalogsService.getValidCatalog();
    }

    /**
     * 获取所有行政区划类型列表(不限制状态)
     *
     * @return 行政区划类型列表
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/all", method = RequestMethod.GET)
    @ResponseBody
    public List<TRegioncatalog> getAll() {
        return regionCatalogsService.getAll();
    }

    /**
     *  获取指定行政区划类型的最高行政区划级别（值越小，级别越高）
     * (多级别用户时，可以加上用户的编码过滤级别)
     * @param id
     *            指定行政区划类型（指定地图）id
     * @return	最高行政区划级别
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/maxlevel", method = RequestMethod.GET)
    @ResponseBody
    public int findMaxLevel(@PathVariable("catalogid") int id) {
        return regionInfoService.getMinLevel(id);
    }

    /**
     * 获取某区划下的最小级别 值越大，级别越小
     * @param id  区划类别唯一标识
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/minlevel", method = RequestMethod.GET)
    @ResponseBody
    public int findMinLevel(@PathVariable("catalogid") int id) {
        return regionInfoService.getMaxLevel(id);
    }

    /**
     *
     * 取得指定行政区划类型（指定地图）下的所有行政区划编码列表
     *
     * @param id
     *            指定行政区划类型（指定地图）id
     *
     * @return 行政区划编码列表
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/regions", method = RequestMethod.GET)
    @ResponseBody
    public List<TRegioninfo> getRegionsByRegioncatalog(@PathVariable("catalogid") int id) {
        return regionInfoService.getRegionsByCatalog(id);
    }

    /**
     * 获取指定行政区划类型（指定地图）catalogid和指定行政区划编码id的行政区划编码信息
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）id
     * @param regionid
     *            指定行政区划编码id
     * @return 行政区划编码信息
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/regions/{regionid}", method = RequestMethod.GET)
    @ResponseBody
    public TRegioninfo getRegion(@PathVariable("catalogid") int catalogid, @PathVariable("regionid") int regionid) {
        return regionInfoService.getRegionByCatalogAndRegionid(catalogid, regionid);
    }

    /**
     * 取得指定行政区划编码级别的行政区划编码列表
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param regionLevel
     *            区划级别
     *
     * @return 行政区划编码列表
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/regions", method = RequestMethod.POST)
    @ResponseBody
    public List<TRegioninfo> getRegionByLevel(@PathVariable("catalogid") int catalogid, int regionLevel) {
        return regionInfoService.getRegionByCatalogAndLevel(catalogid, "%%", regionLevel);
    }

    /**
     * 按关键字查询行政区划信息（最多返回15条记录）
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param key
     *            查询关键字（编码关键字或者名称关键字）
     *
     * @return 行政区划列表（最多返回15条记录）
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/regions/key", method = RequestMethod.POST)
    @ResponseBody
    public List<TRegioninfo> getRegionByKey(@PathVariable("catalogid") int catalogid, String key) {
        return regionInfoService.getRegionByCatalogAndKey(catalogid, key);
    }

    /**
     * 获取指定行政区划编码下的信息
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param codes
     *            行政区划编码（多个编码用“,”分隔）
     * @return 行政区划编码列表
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/regions/position", method = RequestMethod.POST)
    @ResponseBody
    public List<Object> getRegionsByCode(@PathVariable("catalogid") int catalogid, String codes) {
        return regionInfoService.getRegionsByCatalogAndRegioncodes(catalogid, codes);
    }


    /**
     * 根据行政区划根节点
     * @param catalogid
     * @param isNocheckbox
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/rootRegions", method = RequestMethod.GET)
    @ResponseBody
    public String getrootRegions(@PathVariable("catalogid") int catalogid, boolean isNocheckbox) {
        String code = "000000000000";
        int maxLevel =  regionInfoService.getMinLevel(catalogid); //最大行政区划级别
        List<TRegioninfo> regioninfos = regionInfoService.getRegionByCatalogAndLevel(catalogid,"",maxLevel);
        if(regioninfos.size()==1) {
            code = regioninfos.get(0).getRegioncode();
        }else if(regioninfos.size()>1){
            System.out.println("【警告】： 行政区划存在多个根节点！！！");
        }

        return regionInfoService.getRootRegions(catalogid, code, isNocheckbox);
    }

    /**
     * 获取当前用户（session获取）下的指定的行政区划上级用户类型catalogid的树根行政区划节点
     *
     * <p>
     *     说明：若当前用户行政区划级别在[2,6]之间是到时找到其上一级的行政区划编码
     * </p>
     *
     * @param request
     * 			http请求
     * @param catalogid
     * 			指定的行政区划类型catalogid
     * @param isNocheckbox
     * 			是否存在
     *
     * @return dhtmlTree的xml格式的行政区划编码树字符串
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/previousRootRegions", method = RequestMethod.GET)
    @ResponseBody
    public String getPreviousRootRegions(HttpServletRequest request ,@PathVariable("catalogid") int catalogid, boolean isNocheckbox) {
        //当前用户的行政区划编码
        String code = getUserRegionCode(request);

        int level = RegionSupport.getRegionLevel(code);
        //只在这些级别时取上一级
        if(level >= 2 && level <= 6){
            //取得上级编码
            String previousCode = RegionSupport.getPreviousLevelRegionCode(code);
            if(previousCode == null)
                previousCode = code;
            return regionInfoService.getRootRegions(catalogid, previousCode, isNocheckbox);
        }
        return regionInfoService.getRootRegions(catalogid, code, isNocheckbox);
    }


    /**
     * 指定的行政区划类型catalogid,行政编码的下级行政区划节点集<br/>
     * (dhtmlTree的xml格式的行政区划编码树字符串)
     *
     * <p style="color:red;font-size:14px;">
     * 		&nbsp;&nbsp;&nbsp;&nbsp;注意：<br/>
     * 		&nbsp;&nbsp;&nbsp;&nbsp;此接口返回的树包括"选择所有省，选择所有地级市"等节点
     * </p>
     * @param catalogid
     * 				行政树（地图）ID
     * @param qhcode
     * 			本级节点集(多个节点用逗号分开)
     * @param isNocheckbox
     * 			是否下级没有多选框
     * @param regionType
     * 			行政区划类型（是否是特色区域，不为空，并且不是A00004时为特色区域）
     *
     * @return dhtmlTree的xml格式的行政区划编码树字符串
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/leafRegions", method = RequestMethod.GET)
    @ResponseBody
    public String getleafRegions(@PathVariable("catalogid") int catalogid,
                                 String qhcode, boolean isNocheckbox, String regionType) {

        String[] codeArr = qhcode.split(",");
        return regionInfoService.getLeafRegions(catalogid, codeArr,
                isNocheckbox, regionType,true);
    }

    /**
     * 指定的行政区划类型catalogid,行政编码的下级行政区划节点集<br/>
     * (dhtmlTree的xml格式的行政区划编码树字符串)
     *
     * <p style="color:red;font-size:14px;">
     * 		&nbsp;&nbsp;&nbsp;&nbsp;注意：<br/>
     * 		&nbsp;&nbsp;&nbsp;&nbsp;此接口返回的树
     * 			<font color="#00f">不</font>
     * 			包括"选择所有省，选择所有地级市..."节点
     * </p>
     * @param catalogid
     * 				行政树（地图）ID
     * @param qhcode
     * 			本级节点集(多个节点用逗号分开)
     * @param isNocheckbox
     * 			是否下级没有多选框
     * @return dhtmlTree的xml格式的行政区划编码树字符串
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/leafRegions/sys", method = RequestMethod.GET)
    @ResponseBody
    public String getleafRegionsBySysManger(@PathVariable("catalogid") int catalogid,
                                            String qhcode, boolean isNocheckbox) {

        String[] codeArr = qhcode.split(",");
        return regionInfoService.getLeafRegions(catalogid, codeArr,
                isNocheckbox, null,false);
    }

    /**
     * 获取指定行政区的结构目录树（只显示其和其所有父节点）
     *
     * @param catalogid
     *          所属地图
     * @param regionid
     *          当前行政区id
     * @param isNocheckbox
     * @return
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/regions/{regionid}/structure", method = RequestMethod.GET)
    @ResponseBody
    public String getRegionStructureBycatalogIdAndregionId(@PathVariable("catalogid") int catalogid, @PathVariable("regionid") int regionid
            , boolean isNocheckbox){

        String re = regionInfoService.getRegionStructureBycatalogIdAndregionId(catalogid, regionid);
        if(re == null)
            re = fail().setMsg("节点不存在").toString();

        return re;
    }





    /**
     * 查询指定行政区划名的区划信息
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param regionname
     *            行政区划名（模糊查询）
     * @return 行政区划名的区划信息
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/query", method = RequestMethod.GET)
    @ResponseBody
    public List<TRegioninfo> fuzzyQuery(@PathVariable("catalogid") int catalogid, String regionname) {
        return regionInfoService.queryByName(catalogid, regionname);
    }

    /**
     * 获取所有XX 具体的行政区划
     * @param catalogid
     * @param regions
     * @return
     */
    /**
     * 获取所有指定行政区划（可能包含#） 具体的行政区划
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param level
     *            区划级别
     * @param regions
     *            指定行政区划
     *
     * @return 指定行政区划对应的行政区划编码信息
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/selregions", method = RequestMethod.GET)
    @ResponseBody
    public List<TRegioninfo> findSelRegions(@PathVariable("catalogid") int catalogid,int level ,@RequestBody Region[] regions){
        List<TRegioninfo> re = regionInfoService.findSelRegions2(catalogid,regions,level);
        if(re == null)
            re = new ArrayList<TRegioninfo>();

        return re;
    }

    /**
     * 行政区划导入模板 下载
     *
     * @param request
     * 			http请求
     * @param response
     * 			http响应
     * @throws Exception
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/import/regions/template",method = RequestMethod.GET)
    @ResponseBody
    public void downloadImpRTemp(HttpServletRequest request,HttpServletResponse response) throws  Exception{
        String name  = "导入行政区划模板";
        String filename = new String(name.getBytes(),"iso8859-1");
        response.reset();
        response.setContentType("APPLICATION/vnd.ms-excel");
        //注意，如果去掉下面一行代码中的attachment; 那么也会使IE自动打开文件。
        response.setHeader("Content-Disposition", "attachment;filename="+filename+".xls");
        HSSFWorkbook wk = regionInfoService.downloadTemplate() ;
        OutputStream out = response.getOutputStream() ;
        wk.write(out);
        out.flush();
        out.close();
    };

    /**
     * 统一导入excel行政区划，到行政区划树表T_REGIONINFO
     * @param catalogid 指定行政区划类型（指定地图）catalogid
     * @param datasource 地图数据源名（DB用户名）
     * @param fileName Excel文件名
     * @param sheetName 表单名
     * @return	导入结果
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/importregions", method = RequestMethod.GET)
    @ResponseBody
    public ImportRegionResult importRegions(HttpServletRequest request, @PathVariable("catalogid") int catalogid, String datasource, String fileName, String sheetName){

        // 0全行表单数据读
        ImportRegionResult result = regionInfoService.readAndResolveExcel(catalogid,fileName,sheetName,0);
        // Excel导入结果
        List<TemporaryImport> saveObj = result.getExcelObj();
        // 释放空间
        result.setExcelObj(null);
        if (result.getBeginLevel() < 1) {
            result.setStatus(false);
            result.setMsg("解析Excel数据失败为空");
            return result;
        }
        if(saveObj != null && saveObj.size() > 0){
            //保存到导入临时表，快捷关联查询X/Y坐标用
            boolean isSuccuss = temporaryImportService.saveDateToTemTable(saveObj);
            if (isSuccuss) {
                //临时表关联图层表X/Y查询，并将数据插入到区划树表
                //T_REGIONINFO，返回操作结果
                long time2 = new Date().getTime();
                result = regionInfoService.importDataToRegionInfo(catalogid, datasource, result);
                temporaryImportService.deleteAll();//导入完成后删除临时数据
                long time3 = new Date().getTime();
                if(result.isStatus())
                    System.out.println("关联成功插入："
                            + result.getInsertNum()
                            + " 用时：" + (time3 - time2)
                            + " ms ");
            } else {
                result.setStatus(false);
                result.setMsg("保存到临时表失败");
            }
        }else {
            result.setStatus(false);
            result.setMsg("解析Excel失败（数据为空）");
        }//end if(saveObj != null && saveObj.size() > 0)

        return result;
    }

    /**
     * 获取指定地图类型下的行政区划导入与匹配情况
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     *
     * @return 匹配情况
     */
    @Permission(Role.USER)
    @RequestMapping(value = "/{catalogid}/regionsituation", method = RequestMethod.GET)
    @ResponseBody
    public ImportRegionResult regionSituation(@PathVariable("catalogid") int catalogid){
        return regionInfoService.getRegionSituation(catalogid);
    }

    /**
     * 添加行政区划编码信息
     *
     * <p style="color:red;font-size:15px;">
     * 		&nbsp;&nbsp;&nbsp;&nbsp;注意：
     * 		&nbsp;&nbsp;&nbsp;&nbsp;此接口创建的是TRegioninfo记录
     * </p>
     *
     * @param tregioninfo
     * 			要添加的行政区划编码信息
     * @return 添加结果
     */
    @RequestMapping(value = "/region", method = RequestMethod.POST)
    @ResponseBody
    public OpStatus create(@RequestBody TRegioninfo tregioninfo) {
        //刚开始创建，还没有导入相应行政区划的时候状态有标注
        if (regionInfoService.add(tregioninfo)) {
            return getOpStatus(true);
        } else
            return getOpStatus(false);
    }

    /**
     *
     * 删除（硬删除）指定行政区划行政区划类型（指定地图）catalogid下的一条行政区划编码信息
     *
     * <p style="color:red;font-size:15px;">
     * 		&nbsp;&nbsp;&nbsp;&nbsp;注意：
     * 		&nbsp;&nbsp;&nbsp;&nbsp;此接口删除的是TRegioninfo记录
     * </p>
     *
     * @param catalogid
     * 			行政区划类型（指定地图）catalogid
     * @param id
     * 			区划编码id
     * @return 删除结果
     */
    @Permission(Role.ADMIN)
    @RequestMapping(value = "/{catalogid}/region", method = RequestMethod.DELETE)
    @ResponseBody
    public OpStatus delete(@PathVariable("catalogid") int catalogid, int id) {
        //同时删除行政区划树中的信息，级联完成
        if (regionInfoService.delete(id)) {
            return getOpStatus(true);
        } else return getOpStatus(false);
    }

    /**
     * 更新行政区划编码信息
     *
     * <p style="color:red;font-size:15px;">
     * 		&nbsp;&nbsp;&nbsp;&nbsp;注意：
     * 		&nbsp;&nbsp;&nbsp;&nbsp;此接口更新的是TRegioninfo记录
     * </p>
     *
     * @param regionid
     * 			指定行政区划编码id
     * @param tregioninfo
     * 			修改后的行政区划编码信息
     * @return	更新结果
     */
    @Permission(Role.ADMIN)
    @RequestMapping(value = "/{regionid}/region", method = RequestMethod.PUT)
    @ResponseBody
    public OpStatus modify(@PathVariable("regionid") int regionid, @RequestBody TRegioninfo tregioninfo) {
        //如果是修改年份，那就得查看该年份的分类是否已经有了，不能重复……
        if (regionInfoService.update(regionid, tregioninfo)) {
            return getOpStatus(true);
        } else
            return getOpStatus(false);
    }

    /**
     * 刷新指定行政区划类型（指定地图）catalogid和数据源行政区划编码X/Y坐标
     *
     * @param catalogid
     * 			指定行政区划类型（指定地图）catalogid
     * @param datasource
     * 			数据源
     *
     * @return 刷新后的结果
     */
    @Permission(Role.ADMIN)
    @RequestMapping(value = "/{catalogid}/region/refresh", method = RequestMethod.GET)
    @ResponseBody
    public ImportRegionResult refresh(@PathVariable("catalogid") int catalogid, String datasource) {
        //如果是修改年份，那就得查看该年份的分类是否已经有了，不能重复……
        return regionInfoService.refreshRegionXY(catalogid, datasource);
    }
}

