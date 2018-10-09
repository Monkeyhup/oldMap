package com.supermap.sgis.visual.service;


import com.supermap.sgis.visual.common.RegionSupport;
import com.supermap.sgis.visual.common.tree.DHTMLXTree;
import com.supermap.sgis.visual.common.tree.DHTMLXTreeFactory;
import com.supermap.sgis.visual.dao.RegionCatalogsDao;
import com.supermap.sgis.visual.dao.RegionInfoDao;
import com.supermap.sgis.visual.entity.TRegioncatalog;
import com.supermap.sgis.visual.entity.TRegioninfo;
import com.supermap.sgis.visual.entity.TemporaryImport;
import com.supermap.sgis.visual.json.ImportRegionResult;
import com.supermap.sgis.visual.json.Region;
import com.supermap.sgis.visual.tool.ExcelUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;

/**
 * 行政区划编码server
 *
 * @author Created by Administrator on 14-3-3.
 *
 * @author Modify by Linhao on 15-01-28
 *
 */
@Service
public class RegionInfoService extends BaseService {

    /** 行政区划编码 server */
    @Autowired
    RegionInfoDao regionInfoDao;

    /** 行政区划类型dao */
    @Autowired
    RegionCatalogsDao regionCatalogsDao;

    /**
     * 添加指定行政区划类型下的行政区划编码
     *
     * @param tregioninfo
     *            要创建的行政区划编码
     * @return 创建状态结果,true代表成功，否则失败
     */
    public boolean add(TRegioninfo tregioninfo) {
        if (regionInfoDao.save(tregioninfo) != null) {
            return true;
        } else
            return false;
    }

    /**
     * 删除行政区划编码
     *
     * @param id
     *            指定要行政区划编码rgid
     *
     * @return 删除状态结果,true代表成功，否则失败
     */
    public boolean delete(int id) {
        if (regionInfoDao.getOne(id) != null) {
            regionInfoDao.delete(id);
            return true;
        } else
            return false;
    }

    /**
     * 更新行政区划编码
     *
     * @param id
     *            指定要更新的行政区划编码
     * @param tregioninfo
     *            更新后信息
     *
     * @return 更新状态结果,true代表成功，否则失败
     */
    public boolean update(int id, TRegioninfo tregioninfo) {
        if (regionInfoDao.getOne(id) != null) {
            if (regionInfoDao.save(tregioninfo) != null) {
                return true;
            } else
                return false;
        } else
            return false;
    }

    /**
     * 通过指定编码获取行政区划编码信息
     * <p style="color:red;">
     * &nbsp;&nbsp;&nbsp;&nbsp;注意：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;由于不同catalogid下可能存在code，可能会存在多条 ；<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;若有多条，只返回第一条；<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;若未找到，返回null；
     * </p>
     *
     * @param code
     *            行政区划编码
     *
     * @return 行政区划编码信息
     */
    public TRegioninfo getOneByCode(String code) {
        List<TRegioninfo> infos = regionInfoDao.findByCode(code);
        if (null == infos || infos.size() == 0) {
            return null;
        }
        return infos.get(0);
    }

    /**
     *
     * 取得指定行政区划类型（指定地图）下的所有行政区划编码列表
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）id
     *
     * @return 行政区划编码列表
     */
    public List<TRegioninfo> getRegionsByCatalog(int catalogid) {

        return regionInfoDao.getRegionsByCatalog(catalogid);
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
    public TRegioninfo getRegionByCatalogAndRegionid(int catalogid, int regionid) {
        return regionInfoDao.getOneByCatalogAndid(catalogid, regionid);
    }

    /**
     * 获取指定行政区划编码和指定级别下的下一级编码列表
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）id
     * @param level
     *            行政区划编码级别
     * @param regioncode
     *            行政区划编码
     * @param isMunicipalities
     *            是否直辖市
     * @return
     */
    public List<TRegioninfo> getSubRegionInfo(int catalogid, int level,
                                              String regioncode, boolean isMunicipalities) {
        String queryStr = "";
        int l = isMunicipalities && level > 2 ? level - 1 : level;
        queryStr = RegionSupport.getSubstr(regioncode, l);

        int nl = isMunicipalities ? (level + 2) : (level + 1);
        return regionInfoDao.getLeafRegion(catalogid, nl, queryStr + "%");
    }

    /**
     * 获取指定行政区划类型（指定地图）catalogid<br/>
     * 和指定qhcode（可能是带通配符编码，通配符为#）的行政区划编码信息
     * <p style="color:red;">
     * &nbsp;&nbsp;&nbsp;&nbsp;注意：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;由于qhcode可能存在##（通配符），结果会存在多条 ；<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;若有多条，只返回第一条；<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;若未找到，返回null；
     * </p>
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param qhcode
     *            指定qhcode（可能是带通配符编码，通配符为#）
     * @return 行政区划编码信息
     */
    public TRegioninfo getRegionByCatalogAndQhcode(int catalogid, String qhcode) {
        if (qhcode.length() == 12 && qhcode.indexOf("#") == -1) {
            return regionInfoDao.findByCatalogAndQhcode(catalogid, qhcode);
        } else {
            // 去掉所有的##
            String subCode = subStrCode(qhcode);
            int level = RegionSupport.getLevelByLen(subCode.length());
            return regionInfoDao.findByRegionlevel(catalogid, subCode + "%",
                    level).get(0);
        }
    }

    /**
     * 获取指定行政区划类型（指定地图）catalogid和行政区划编码的<br/>
     * 最顶级行政编码列表
     *
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;该方法可用于userCode为当前用户所在的行政编码时，<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;此方法可以获取当前用户的指定catalogid的行政区划编码根列表；<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;其他情况使用类似.
     * </p>
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param userCode
     *            行政区划编码
     *
     * @return 行政区划编码根列表
     */
    public ArrayList<TRegioninfo> getRootRegionByCatalog(int catalogid,
                                                         String userCode) {
        int level = RegionSupport.getRegionLevel(userCode);
        int maxLevel = 0;
        try {
            maxLevel = regionInfoDao.findMaxRegionLevel(catalogid);
        } catch (Exception e) {
            System.out.println("rcid=" + catalogid
                    + "行政区划树t_regioninfo表数据空，请先加入数据！");
            e.printStackTrace();
        }
        String sub = RegionSupport.getSubstr(userCode);

        // 指定的编码级别高于指定行政区划类型(当前地图)的最大级别
        if (level < maxLevel) {
            level = maxLevel;
        }
        ArrayList<TRegioninfo> list = regionInfoDao.findByRegionlevel(
                catalogid, sub + "%", level);

        if (list != null && list.size() > 0) {
            return list;
        }

        return new ArrayList<TRegioninfo>();
    }

    /**
     * 读取Excel插入到数据库的行政区划表中
     *
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;注意：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;该方法返回的未成功插入的数据列表；
     * </p>
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param path
     *            excel 文件路劲
     * @param sheetName
     *            excel 工作簿名称
     * @param header_rows
     *            excel 表的表头的行数
     * @return 返回插入的行政区划列表
     *
     * @throws IOException
     */
    public List<TRegioninfo> insertIntoDababase(int catalogid, String path,
                                                String sheetName, int header_rows) throws IOException {
        List<List<Object>> obj = ExcelUtil.readExcel(path, sheetName,
                header_rows);
        String[] header = ExcelUtil.readExcelHeader(path, sheetName);
        if (header.length > 0) {
            // 将得到的信息转换为实体对象
            List<TRegioninfo> regioninfosPart = convertDetailToListinfo(obj);
            if (regioninfosPart.size() > 0) {

                TRegioncatalog regioncatalog = regionCatalogsDao
                        .findOne(catalogid);
                // 补全regioninfosPart的信息(先将信息补全，然后在插入到数据库中)
                calculateOtherInfo(regioninfosPart, regioncatalog);

                // 插入到数据库 每插入50条提交一次
                return regionInfoDao.batchInsert(regioninfosPart, 50);
            } else {
                return null;
            }
        } else
            return null;
    }

    /**
     * 读取Excel插入到数据库的行政区划表中
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param path
     *            excel 文件路劲
     * @param sheetName
     *            excel 工作簿名称
     * @param header_rows
     *            excel 表的表头的行数
     * @return 返回未成功插入的行政区划列表
     *
     * @throws IOException
     */
    public List<List<Object>> insertIntoDababase2(int catalogid, String path,
                                                  String sheetName, int header_rows) throws IOException {
        List<List<Object>> errorList = new ArrayList<List<Object>>();
        List<List<Object>> successList = new ArrayList<List<Object>>();

        List<List<Object>> obj = ExcelUtil.readExcel(path, sheetName,
                header_rows);
        String[] header = ExcelUtil.readExcelHeader(path, sheetName);
        if (header.length > 0) {
            // 将得到的信息转换为实体对象
            int i = 1;
            Iterator<List<Object>> iterator = obj.iterator();
            while (iterator.hasNext()) {
                List<Object> row = iterator.next();
                String sql = "insert into T_REGIONINFO (RGID,RCID,REGIONCODE,NAME) values(?,?,?,?)";
                String regionCode = row.get(0).toString();
                String regionName = row.get(1).toString();

                int result = regionInfoDao.executeBySql(sql, new Object[] {
                        i++, catalogid, regionCode, regionName });

                if (result == 0)
                    errorList.add(row);
                else
                    successList.add(row);
            }
        }
        // 以后补全信息可以建立任务，叫后台执行。
        updateOtherInfo(catalogid, successList);

        // 插入到数据库 每插入50条提交一次
        return errorList;
    }

    /**
     * 从数据库中导出指定行政区划列表为Excel
     *
     * @param path
     *            导出的excel文件路径（包含要导出的文件名）
     * @param header
     *            导出的excel表格的头部信息
     * @param regioninfos
     *            导出的excel行政区划数据
     * @return 导出结果，true代表成功，false代表失败
     */
    public boolean export(final String path, final String sheetName,
                          final String[] header, List<TRegioninfo> regioninfos) {
        final List<List<String>> details = this.getDetailByListinfo(
                regioninfos, header);
        return ExcelUtil.exportExcel(path, sheetName, header, details);
    }

    /**
     * 字符串截取（去掉最右边的指定字符，如果存在）
     *
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;例如：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;1：str = "abcdeefg";c='g'<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;返回结果"abcdeef" <br/>
     * <br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;2：str = "abcdeefg";c='f'<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;返回结果"abcdeefg"
     * </p>
     *
     * @param str
     *            字符串
     * @param c
     *            字符
     * @return 字符串
     */
    public String trimRight(String str, char c) {
        if (str == null) {
            return "";
        }
        if (str.length() < 1) {
            return str;
        }
        int length = str.length();
        int index = 0;
        for (index = length - 1; index >= 0; index--) {
            if (str.charAt(index) != c) {
                break;
            }
        }
        return str.substring(0, index + 1);
    }

    /**
     * 获取指定catalogid下的qhcode的最大级别
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     *
     * @param qhcode
     *            指定qhcode（可能是带通配符编码，通配符为#）
     * @return 最大级别数
     */
    public int getMaxLevel(int catalogid, String qhcode) {
        String subCode = "";
        if (qhcode.indexOf("#") == -1) {
            subCode = RegionSupport.getSubstr(qhcode,
                    RegionSupport.getRegionLevel(qhcode));
        } else {
            subCode = subStrCode(qhcode);
        }
        return regionInfoDao.findMaxRegionLevelByQhcode(catalogid, subCode
                + "%");
    }

    /**
     * 判断指定编码是否为根编码
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     *
     * @param qhcode
     *            指定qhcode（可能是带通配符编码，通配符为#）
     * @return
     */
    public boolean isRootRegion(int catalogid, String qhcode) {
        boolean result = false;
        TRegioninfo currentRegion = regionInfoDao.findByCatalogAndQhcode(
                catalogid, qhcode);
        if (currentRegion != null) {
            // 判断是否有父节点
            TRegioninfo parRegion = regionInfoDao.findByCatalogAndQhcode(
                    catalogid, currentRegion.getParcode());
            if (parRegion == null) {
                result = true;
            }
        }
        return result;
    }

    /**
     * 获取临时行政区划编码
     *
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;例如：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;parCode = "110000000000";itsLevel=3;targetLevel=4
     * <br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;返回结果"11##**000000"
     * </p>
     *
     * @param parCode
     *            父节点编码
     * @param itsLevel
     *            当前编码级别
     * @param targetLevel
     *            目标编码级别
     *
     * @return 临时编码字符串
     */
    public String getTempString(String parCode, int itsLevel, int targetLevel) {
        String strIts = RegionSupport.padRight(
                RegionSupport.getSubstr(parCode, itsLevel - 1),
                RegionSupport.getLengthByLevel(itsLevel), '#');
        String targetStr = RegionSupport.padRight(strIts,
                RegionSupport.getLengthByLevel(targetLevel), '*');
        return RegionSupport.padRight(targetStr, 12, '0');
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
    public List<Object> getRegionsByCatalogAndRegioncodes(int catalogid,
                                                          String codes) {
        String[] codeArr = codes.split(",");
        StringBuilder sql = new StringBuilder();
        if (codeArr != null) {
            for (int i = 0, len = codeArr.length; i < len; i++) {
                String code = codeArr[i];
                if (code == null || code.isEmpty())
                    continue;

                sql.append(" t.regioncode = '").append(code).append("' ");
                if (i < len - 1) {
                    sql.append(" or ");
                }
            }
        }

        String querySql = "select * from t_regioninfo t where ";
        if (sql.length() > 0)
            querySql += sql.toString() + " and t.rcid=" + catalogid + "";
        else
            querySql += " t.rcid=" + catalogid + "";

        return regionInfoDao.query(querySql);
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
    public List<TRegioninfo> queryByName(int catalogid, String regionname) {
        return regionInfoDao.findRegionsByName(catalogid, regionname);
    }

    /**
     * 取得指定行政区划编码（含通配符#）的行政区划编码列表
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param code
     *            行政区划编码（可能是带通配符编码，通配符为#）
     * @param regionLevel
     *            区划级别
     *
     * @return 行政区划编码列表
     */
    public List<TRegioninfo> getRegionByCatalogAndLevel(int catalogid,
                                                        String code, int regionLevel) {
        String regioncode = subStrCode(code) + "%";
        return regionInfoDao.findByRegionlevel(catalogid, regioncode,
                regionLevel);
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
    public List<TRegioninfo> getRegionByCatalogAndKey(int catalogid, String key) {
        if (key == null || key.trim().equals("")) {
            key = "";
        } else {
            Pattern pattern = Pattern.compile("[0-9]*");
            if (pattern.matcher(key).matches()) {// 带有数字
                key = " and t.regioncode like '%" + key + "%'";
            } else {
                key = " and t.name like '%" + key + "%'";
            }
        }

        StringBuilder sql = new StringBuilder("select ");
        sql.append(" t.rgid,t.rcid,t.regioncode,t.name,t.parcode,t.subcode,t.regionlevel,t.smx,t.smy");
        sql.append(" from t_regioninfo t where t.rcid=").append(catalogid);
        sql.append(key).append(" and rownum< 16 order by t.regioncode");

        String querySql = sql.toString();

        List datalist = regionInfoDao.query(querySql);
        List<TRegioninfo> regionList = new ArrayList<>();
        TRegioninfo regioninfo = null;

        for (int row = 0, len = datalist.size(); row < len; row++) {
            regioninfo = new TRegioninfo();

            Object[] record = (Object[]) datalist.get(row);

            regioninfo.setRgid(Integer.parseInt(record[0].toString()));

            TRegioncatalog tr = new TRegioncatalog();
            tr.setRcid(catalogid);
            regioninfo.setTRegioncatalog(tr);

            regioninfo.setRegioncode(record[2].toString());
            regioninfo.setName(record[3].toString());
            regioninfo.setParcode(record[4].toString());
            regioninfo.setSubcode(record[5].toString());
            regioninfo.setRegionlevel(Integer.parseInt(record[6].toString()));

            double x = 0, y = 0;
            Object xObj = record[7];
            if (xObj != null && xObj.toString().length() > 0)
                x = Double.parseDouble(xObj.toString());
            regioninfo.setSmx(x);

            Object yObj = record[8];
            if (yObj != null && yObj.toString().length() > 0)
                y = Double.parseDouble(yObj.toString());
            regioninfo.setSmy(y);

            regionList.add(regioninfo);
        }// end for (int row = 0, len = datalist.size(); row < len; row++)

        return regionList;
    }

    /**
     * 查找指定编码的信息
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param codes
     *            行政区划编码
     * @return 行政区划编码列表
     */
    public List<TRegioninfo> findByRegioncodes(int catalogid, String[] codes) {
        return regionInfoDao.findByReginCodes(catalogid, codes);
    }

    /**
     * 获取所有指定行政区划（可能包含#） 具体的行政区划
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param regions
     *            指定行政区划
     * @param level
     *            区划级别
     * @return 指定行政区划对应的行政区划编码信息，可能为null
     */
    public List<TRegioninfo> findSelRegions(int catalogid, Region[] regions,
                                            int level) {
        if (regions != null) {
            // 处理带#符号的编码
            if (regions.length == 1 && regions[0].getRegionCode().contains("#")) {
                boolean isMunicipal = false;
                Region r = regions[0];
                int regionlevel = r.getRegionLevel();
                String regioncode = r.getRegionCode();
                isMunicipal = RegionSupport.isMunicipalRegion(regioncode);
                if (regioncode.length() == 12) {
                    regioncode = subStrCode(regioncode);
                    List re = regionInfoDao.findSelRegions(catalogid,
                            regionlevel, regioncode + "%");
                    return re;
                } else {// 特色区域处理
                    regioncode = r.getRegionCode().replaceAll("#", "0");
                    regioncode = subStrCode(regioncode);
                    // 所选树节点上一级节点
                    int maxLevel = RegionSupport.getRegionLevel(regioncode);
                    int qlevel = -1;
                    if (isMunicipal && maxLevel >= 2) {
                        qlevel = maxLevel + 2;
                    } else {
                        qlevel = maxLevel + 1;
                    }
                    // 处理省级和特色经济区
                    regioncode = regioncode.substring(2);
                    return regionInfoDao.findSelRegions(catalogid, qlevel, "%"
                            + regioncode);
                }
            } else {
                int regionlevel = regions[0].getRegionLevel();
                int maxLevel = RegionSupport.getRegionLevel(regions[0]
                        .getRegionCode());
                if (level == regionlevel) {
                    String[] codes = new String[regions.length];
                    int index = 0;
                    for (Region r : regions) {
                        codes[index] = r.getRegionCode();
                        index++;
                    }
                    return regionInfoDao.findByReginCodes(catalogid, codes);
                } else if (regionlevel < level) {
                    List<TRegioninfo> re = new ArrayList<>();
                    for (Region r : regions) {
                        String regioncode = r.getRegionCode();
                        regioncode = RegionSupport.trimRight(regioncode, '0');
                        List<TRegioninfo> infoList = regionInfoDao
                                .findSelRegions(catalogid, level, regioncode
                                        + "%");
                        re.addAll(infoList);
                    }
                    return re;
                }
            }
        }
        return null;
    }


    /**
     * 获取选中区划下指定级别下的所有行政区划
     * @param catalogid
     * @param regions
     * @param level   获取的级别（要考虑该级别可能小于regions里的级别）
     * @return
     */
    public List<TRegioninfo>  findSelRegions2(int catalogid, Region[] regions,int level){
        if(regions==null){
            return null;
        }
        List<TRegioninfo> regioninfoList = new ArrayList<TRegioninfo>();
        for(int i =0,len=regions.length; i<len; i++){
            Region r = regions[i];
            if(r.getRegionCode().contains("#")){
                boolean isMunicipal = false;
                int regionlevel = r.getRegionLevel();
                String regioncode = r.getRegionCode();
                isMunicipal = RegionSupport.isMunicipalRegion(regioncode);
                if (regioncode.length() == 12) {
                    regioncode = subStrCode(regioncode);
                    List re = regionInfoDao.findSelRegions(catalogid,regionlevel, regioncode + "%");
                    regioninfoList.addAll(re);
                } else {// 特色区域处理
                    regioncode = r.getRegionCode().replaceAll("#", "0");
                    regioncode = subStrCode(regioncode);
                    // 所选树节点上一级节点
                    int maxLevel = RegionSupport.getRegionLevel(regioncode);
                    int qlevel = -1;
                    if (isMunicipal && maxLevel >= 2) {
                        qlevel = maxLevel + 2;
                    } else {
                        qlevel = maxLevel + 1;
                    }
                    // 处理省级和特色经济区
                    regioncode = regioncode.substring(2);
                    List re = regionInfoDao.findSelRegions(catalogid, qlevel, "%" + regioncode);
                    regioninfoList.addAll(re);
                }
            } else {
                int regionlevel = r.getRegionLevel();
                String regioncode = r.getRegionCode();
//              int maxLevel = RegionSupport.getRegionLevel(r.getRegionCode());
                if (level == regionlevel) {
                    String[] codes = new String[]{regioncode};
                    List re = regionInfoDao.findByReginCodes(catalogid, codes);
                    regioninfoList.addAll(re);
                } else if (regionlevel < level) {
                    regioncode = RegionSupport.trimRight(regioncode, '0');
                    List<TRegioninfo> infoList = regionInfoDao.findSelRegions(catalogid, level, regioncode + "%");
                    regioninfoList.addAll(infoList);
                }else if(regionlevel>level){
                    regioncode = RegionSupport.getSubstr(regioncode,level);
                    switch (level){
                        case 2:
                            regioncode += "0000000000";
                            break;
                        case 3:
                            regioncode+="00000000";
                            break;
                        case 4:
                            regioncode+="000000";
                            break;
                        case 5:
                            regioncode+="000";
                            break;
                    }

                    String[] codes = new String[]{regioncode};
                    List re = regionInfoDao.findByReginCodes(catalogid, codes);
                    regioninfoList.addAll(re);
                }
            }
        }



        return regioninfoList;
    }

    /**
     * 统一用来导入行政区划树，根据临时表关联区划图层表SMX/SMY坐标
     */
    // {"ST_R_WD","ST_R_SN","ST_R_SH","ST_R_XN","ST_R_XA","ST_R_CN"};//区划对应（面）图层名称
    public String[] regionLayerType = { "ST_P_WD", "ST_P_SN", "ST_P_SH",
            "ST_P_XN", "ST_P_XA", "ST_P_CN" };// 区划对应（标题点）图层名称

    /**
     * 导入数据源到行政区划信息
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param datasource
     *            导入的数据源
     * @param result
     *
     * @return 导入结果
     */
    public ImportRegionResult importDataToRegionInfo(int catalogid,
                                                     String datasource, ImportRegionResult result) {
        int beginLevel = result.getBeginLevel();
        int endLevel = result.getEndLevel();
        // 注：如果空间库的行政区划相关数据集表的HQ_CODE字段不一样，
        // 通过Supermap数据集字段配置表查找HQ_CODE另命名
        // 先删除地图下的已存在行政区划目录树，支持多次导入
        //去除重复
        String delRepeatSql = "DELETE FROM TEMPORARY_IMPORT T WHERE " +
                " T.RCID="+catalogid+
                " AND T.rowid !=" +
                "(SELECT MAX(R.ROWID) FROM TEMPORARY_IMPORT R WHERE R.REGIONCODE=T.REGIONCODE GROUP BY R.REGIONCODE)" ;
        int repeatNum = regionInfoDao.executeBySql(delRepeatSql) ;
        System.out.println(delRepeatSql);
        System.out.println("存在区划代码重复"+repeatNum+"条");
        //
        int delNum = regionInfoDao.executeBySql(
                        "DELETE T_REGIONINFO T WHERE T.RCID=? AND T.REGIONCODE IN(SELECT DISTINCT REGIONCODE FROM TEMPORARY_IMPORT)",
                        new Object[] { catalogid });  //in 能满足吗？
        System.out.println("删除地图ID（" + catalogid + "）已存在行政区划：" + delNum);
        //检测T_REGIONINFO_SEQUENCE序列存在，否则创建
        String seq_sql = "SELECT OBJECT_NAME FROM USER_OBJECTS WHERE OBJECT_TYPE IN ('TABLE','SEQUENCE') AND OBJECT_NAME='T_REGIONINFO_SEQUENCE'";
        List list = regionInfoDao.query(seq_sql);
        if(list.size()<=0) {//不存在，创建序列
            try {
                int max = 0 ;
                try{
                    max = regionInfoDao.executeBySql("select max(rgid) from T_REGIONINFO ") ;
                }catch (Exception e){
                    max = 0 ;
                }
                max +=1 ; //从下一个开始
                regionInfoDao.executeBySql("CREATE SEQUENCE T_REGIONINFO_SEQUENCE INCREMENT BY 1 START WITH "+max+" MAXVALUE 99999999999999999");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        int[][] levelnum = result.getLevelNum();
        // 通过DBA权限下的跨用户访问的关联查询HQ_CODE对应smx,smy
        for (int i = beginLevel; i > 0 && i <= endLevel; i++) {
            String layerName = regionLayerType[i - 1];
            String sql = "INSERT INTO T_REGIONINFO (SELECT T_REGIONINFO_SEQUENCE.NEXTVAL,I.RCID,I.REGIONCODE,I.NAME,I.PARCODE,I.SUBCODE,I.REGIONLEVEL,"
                    + "NVL(S.SMX,0),NVL(S.SMY,0) FROM " + datasource+ "."+ layerName
                    + " S, TEMPORARY_IMPORT I WHERE I.REGIONLEVEL=? AND I.REGIONCODE=S.QH_CODE(+))";
            try {
                    int insertNum = regionInfoDao.executeBySql(sql,
                        new Object[] { i });// 返回插入条数
                levelnum[i - 1][0] = insertNum ;
                System.out.println(insertNum>0?"级别"+i+":导入成功"+insertNum+"条":
                        "级别"+i+":导入0条，检查空间表"+layerName+"是否存在区划代码重复");
            } catch (Exception e) {
                //匹配不了坐标 直接导入
                System.out.println("关联空间X/Y坐标出错：" + sql + "  ?=" + i);
                sql = "INSERT INTO T_REGIONINFO (SELECT T_REGIONINFO_SEQUENCE.NEXTVAL,I.RCID,I.REGIONCODE,I.NAME,I.PARCODE,I.SUBCODE,I.REGIONLEVEL,'0','0' "
                        +"FROM TEMPORARY_IMPORT I WHERE I.REGIONLEVEL=? )";
                levelnum[i - 1][0] = regionInfoDao.executeBySql(sql,
                        new Object[] { i });// 返回插入条数

                result.setMsg("关联坐标失败！空间表“" + datasource + "." + layerName + "”不存在，请手动更新坐标");
            }
            System.out.println(layerName + "插入："
                    + levelnum[i - 1][0]);
        }

        // 查询成功匹配X/Y坐标的行政级别的个数
        String sql = "select r.regionlevel,count(*) num from T_REGIONINFO r where r.rcid=? group by r.regionlevel order by r.regionlevel";
        List datalist = regionInfoDao.query(sql, new Object[] { catalogid });// 返回插入条数
        for (int row = 0, len = datalist.size(); row < len; row++) {
            Object[] record = (Object[]) datalist.get(row);
            int level = Integer.parseInt(record[0].toString());
            int num = Integer.parseInt(record[1].toString());
            levelnum[level - 1][1] = num;
        }
        result.setLevelNum(levelnum);

        return result;
    }

    /**
     * 读取并解析EXCEL表单，初始化成List<TemporaryImport> Excel表单包含两个字段：区划编码、区划名称
     *
     * @param catalogid
     *            地图编码
     * @param path
     *            Excel文件路径
     * @param sheetName
     *            表单名
     * @param header_rows
     *            表单表头行数
     * @return 导入结果
     * */
    public ImportRegionResult readAndResolveExcel(int catalogid, String path,
                                                  String sheetName, int header_rows) {
        List<TemporaryImport> imports = new ArrayList<TemporaryImport>();

        // 数据条数巨大或重复记录，出现解析等到，建议限制并提示
        List<List<Object>> datalist = ExcelUtil.readExcel(path, sheetName,header_rows);
        String cataid = String.valueOf(catalogid);
        int beginLevel = 6; // 最大行政级别
        int endLevel = 0; // 最小行政级别
        String err = "";
        for (List l : datalist) {
            String regioncode = l.get(0).toString().trim(); // 行政区划编码（12位）
            if (regioncode.toUpperCase().equals("QH_CODE"))
                continue;
            if (regioncode.length() != 12) {
                err += regioncode + ",";
                continue;
            }
            int level = RegionSupport.getRegionLevel(regioncode);
            if (level <= 0) {
                continue;
            }
            int length = RegionSupport.getLengthByLevel(level - 1); // 父regioncode有效长度
            String parcode = "0"; // 国级父ID
            if (level > 1) // 非国级
                parcode = RegionSupport.padRight(
                        regioncode.substring(0, length), 12, '0'); // 父regioncode后补0（全国12个0）
            TemporaryImport importdata = new TemporaryImport(); // 临时表记录对象
            importdata.setId(UUID.randomUUID().toString());
            importdata.setRegioncode(regioncode); // 区划编码
            importdata.setRcid(cataid); // 地图ID
            importdata.setName(l.get(1).toString()); // 区划名称
            importdata.setParcode(parcode); // 父编码
            importdata.setSubcode(level < 6 ? "1" : "0"); // 是否有子区划
            importdata.setRegionlevel(String.valueOf(level)); // 当前区划级别
            imports.add(importdata);
//            System.out.println(id);
            if (level > endLevel){
                endLevel = level;
            }
            if (level < beginLevel){
                beginLevel = level;
            }
        }
        if (err.length() > 0)
            System.out.println("区划编码非12位：" + err);

        ImportRegionResult result = new ImportRegionResult();
        result.setExcelObj(imports);
        if (endLevel >= beginLevel) {
            result.setBeginLevel(beginLevel);
            result.setEndLevel(endLevel);
        }
        return result;
    }

    /**
     * 获取地图类型下的行政区划导入与匹配情况
     *
     * @param catalogid
     *            地图编码
     * @return 导入结果
     */
    public ImportRegionResult getRegionSituation(int catalogid) {
        String querySql = "select a.regionlevel,a.num1,nvl(b.num2,0),round(nvl(b.num2,0)/a.num1*100,1)percent "
                + "from(select r.regionlevel,count(*)num1 from t_regioninfo r where r.rcid="
                + catalogid
                + " group by r.regionlevel) a,"
                + "(select regionlevel,count(*)num2 from t_regioninfo where rcid="
                + catalogid
                + " and (smx<>0 or smy<>0) "
                + "group by regionlevel) b where a.regionlevel=b.regionlevel(+) order by a.regionlevel";

        System.out.println(querySql);
        List datalist = regionInfoDao.query(querySql);
        ImportRegionResult result = new ImportRegionResult();
        result.setExcelObj(null);
        int beginLevel = 6; // 最大行政级别
        int endLevel = 0; // 最小行政级别
        int[][] levelNum = { { 0, 0 }, { 0, 0 }, { 0, 0 }, { 0, 0 }, { 0, 0 },
                { 0, 0 } };

        for (int row = 0, size = datalist.size(); row < size; row++) {
            Object[] rd = (Object[]) datalist.get(row); // 行
            int level = Integer.parseInt(rd[0].toString());
            if (level > endLevel)
                endLevel = level;
            if (level < beginLevel)
                beginLevel = level;
            levelNum[level - 1][0] = Integer.parseInt(rd[1].toString()); // 导入行数
            levelNum[level - 1][1] = Integer.parseInt(rd[2].toString()); // 有效XY行数
        }
        if (endLevel > beginLevel) {
            result.setBeginLevel(beginLevel);
            result.setEndLevel(endLevel);
        }
        result.setLevelNum(levelNum);
        return result;
    }

    /**
     * 将未匹配的行政区划坐标，重新匹配空间坐标并更新
     *
     * @param catalogid
     *            地图编码
     * @param datasource
     *            数据源
     * @return 刷新后的结果
     */
    public ImportRegionResult refreshRegionXY(int catalogid, String datasource) {
        ImportRegionResult result = getRegionSituation(catalogid);// 更新前的情况
        int beginLevel = result.getBeginLevel();
        int endLevel = result.getEndLevel();
        int[][] levelnum = result.getLevelNum();
        String sql = "";
        int updateNum = 0;
        // 通过DBA权限下的跨用户访问的关联查询HQ_CODE对应smx,smy
        for (int i = beginLevel; i > 0 && i <= endLevel; i++) {
            if (levelnum[i - 1][0] <= 0)
                continue;// 此级别不存在数据
            String layerName = regionLayerType[i - 1];
            sql = "UPDATE T_REGIONINFO A SET A.SMX = (SELECT NVL(B.SMX,0) FROM "
                    + datasource
                    + "."
                    + layerName
                    + " B WHERE B.QH_CODE=A.REGIONCODE AND B.SMX>0)"
                    + ",A.SMY = (SELECT NVL(B.SMY,0) FROM "
                    + datasource
                    + "."
                    + layerName
                    + " B WHERE B.QH_CODE=A.REGIONCODE AND B.SMX>0) "
                    + "WHERE (A.SMX IS NULL OR A.SMX=0 OR A.SMY IS NULL OR A.SMY=0) AND A.RCID="
                    + catalogid + " AND A.REGIONLEVEL=?";
            try {
                levelnum[i - 1][1] = regionInfoDao.executeBySql(sql,
                        new Object[] { i });// 返回修改条数（新增XY坐标）

                updateNum += levelnum[i - 1][1];
            } catch (Exception e) {

                e.printStackTrace();
                result.setStatus(false);
                result.setMsg("更新坐标失败！空间库不存在“" + datasource + "." + layerName
                        + "”，或不具备DBA权限");
                result.setLevelNum(levelnum);
                return result;
            }
        }
        result.setLevelNum(levelnum);
        result.setMsg("更新成功！更新：" + updateNum + "个");
        return result;
    }

    /**
     * 获取指定行政区划类型的最高行政区划级别（值越小，级别越高）
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）id
     * @return 最高行政区划级别
     */
    public int getMinLevel(int catalogid) {
        return regionInfoDao.findMaxRegionLevel(catalogid);
    }

    /**
     * 获取指定区域类别下最小级别
     * @param catalogid
     * @return
     */
    public  int getMaxLevel(int catalogid){
        return  regionInfoDao.findMinRegionLevel(catalogid);
    }

    /**
     * 下载导入区划excel模板
     *
     * @return HSSFWorkbook的excel 对象
     */
    public HSSFWorkbook downloadTemplate() {
        String[] head = new String[2];
        head[0] = "QH_CODE";
        head[1] = "QH_NAME";
        String[][] dataArr = { { "110000000000", "北京市" } };
        return ExcelUtil.dataToWorkbook("导入行政区划模板", head, dataArr);
    }

    /**
     * 指定的行政区划类型catalogid,行政编码的树根行政区划节点集<br/>
     * (dhtmlTree的xml格式的行政区划编码树字符串)
     *
     * @param catalogid
     *            指定的行政区划类型catalogid
     * @param regionCode
     *            行政区划编码
     * @param isNocheckbox
     *            是否不存在checkbox
     *
     * @return dhtmlTree的xml格式的行政区划编码树字符串
     */
    public String getRootRegions(int catalogid, String regionCode,
                                 boolean isNocheckbox) {
        ArrayList<TRegioninfo> regioninfos = getRootRegionByCatalog(catalogid,
                regionCode);
        ArrayList<DHTMLXTree> nodes = toTree(regioninfos, isNocheckbox);
        return DHTMLXTreeFactory.toTree(nodes);
    }

    /**
     * 指定的行政区划类型catalogid,行政编码的下级行政区划节点集<br/>
     * (dhtmlTree的xml格式的行政区划编码树字符串)
     *
     * @param catalogid
     *            指定的行政区划类型catalogid
     * @param qhcodes
     *            当前行政编码集合
     * @param isNocheckbox
     *            是否不存在checkbox
     * @param regionType
     *            行政区划类型（是否是特色区域，不为空，并且不是A00004时为特色区域）
     * @param isIncludeAllItem
     *            是否包括"选择所有省，选择所有地级市"等节点（true代表包括，否则不包括）
     *
     * @return dhtmlTree的xml格式的行政区划编码树字符串
     */
    public String getLeafRegions(int catalogid, String[] qhcodes,
                                 boolean isNocheckbox, String regionType, boolean isIncludeAllItem) {
        StringBuilder treeXml = new StringBuilder();

        for (String qhcode : qhcodes) {
            TRegioninfo regioninfo = getRegionByCatalogAndQhcode(catalogid,
                    qhcode);
            if (regioninfo != null) {
                // 先判断他有没有子节点
                if (regioninfo.getSubcode().equals("1")) {
                    int regionLevel = regioninfo.getRegionlevel();
                    String regionCode = regioninfo.getRegioncode();

                    // 如果是直辖市，则需要将直辖市下面的区县区分对待
                    boolean isMunicipalities = false;
                    if (regionLevel == 2
                            && RegionSupport.isMunicipalRegion(regionCode)) {
                        // 11(北京),12（天津）,31（上海），50（重庆）
                        isMunicipalities = true;
                    }

                    DHTMLXTree root = DHTMLXTreeFactory.getNode(
                            regioninfo.getRegioncode(), regioninfo.getName());

                    // 找到下级节点
                    ArrayList<TRegioninfo> listRegioninfo = (ArrayList<TRegioninfo>) getSubRegionInfo(
                            catalogid, regionLevel, regionCode,
                            isMunicipalities);

                    // 是否包括"选择所有省，选择所有地级市"等节点
                    if (isIncludeAllItem) {
                        int maxLevel = getMaxLevel(catalogid, qhcode);
                        // 当前编码级别对应下的所有**的个数
                        int sizeNum = isMunicipalities ? (maxLevel
                                - regionLevel - 1) : (maxLevel - regionLevel);
                        // 是否特色区划
                        boolean isTSRegion = RegionSupport
                                .isTSRegion(regionType);

                        // 添加每节点下的各级全选
                        for (int i = 1; i <= sizeNum; i++) {
                            // 判断子目录中有多条记录
                            if (listRegioninfo.size() > 1) {
                                int level = isMunicipalities ? (regionLevel + i + 1)
                                        : (regionLevel + i);

                                String tempCode = getTempString(regionCode,
                                        isMunicipalities ? (regionLevel + 2)
                                                : (regionLevel + 1), level);

                                String text = "选择所有"
                                        + (isTSRegion ? "第" + level + "级"
                                        : RegionSupport
                                        .getStringByRegionLevel(level));
                                if(level>=5){continue;}
                                root.add(new DHTMLXTree(tempCode, text));
                            }
                        }
                    }// end if(isIncludeAllItem)

                    // 添加
                    DHTMLXTree leaf = toleafTree(listRegioninfo, root,
                            isNocheckbox);
                    treeXml.append(leaf.toString());
                }// end if (regioninfo.getSubcode().equals("1"))
            }// end if (regioninfo != null)
        }// end for (String qhcode : qhcodes)

        return treeXml.toString();
    }

    /**
     * 获取指定行政区的结构目录树（只显示其和其所有父节点）
     *
     * @param catalogid
     *            所属地图id
     * @param regionid
     *            当前行政区划编码id
     * @return dhtmlTree的xml格式的行政区划编码树字符串,可能返回null
     */
    public String getRegionStructureBycatalogIdAndregionId(int catalogid,
                                                           int regionid) {
        TRegioninfo tRegioninfo = getRegionByCatalogAndRegionid(catalogid,
                regionid);
        if (tRegioninfo != null) {
            // 用来存储当前节点所有父节点（倒序存放）
            List<TRegioninfo> descList = new ArrayList<TRegioninfo>();
            // 保存当前节点
            descList.add(tRegioninfo);

            // 取到根所在的级别
            int minLevel = getMinLevel(catalogid);

            // 递归获取所有的父节点
            getAllParentItemBycatalogidAndparcode(descList, catalogid,
                    tRegioninfo.getParcode(), minLevel);

            TRegioninfo tempTRegioninfo = null;
            // 所有节点数
            int totalSize = descList.size();
            if (totalSize > 0) {
                // 根节点
                tempTRegioninfo = descList.get(totalSize - 1);
                DHTMLXTree dhtmlxTree = new DHTMLXTree(
                        tempTRegioninfo.getRegioncode(),
                        tempTRegioninfo.getName());
                dhtmlxTree.setTooltip(tempTRegioninfo.getName());

                // 多级
                if (totalSize > 1) {
                    // 保存父节点
                    DHTMLXTree tempParentDHTMLXTree = dhtmlxTree;

                    // 有父节点，反向取列表（这样取到的是根到叶子的顺序）
                    for (int i = descList.size() - 2; i > 0; i--) {
                        tempTRegioninfo = descList.get(i);
                        DHTMLXTree tempDhtmlxTree = new DHTMLXTree(
                                tempTRegioninfo.getRegioncode(),
                                tempTRegioninfo.getName());
                        tempDhtmlxTree.setTooltip(tempTRegioninfo.getName());
                        tempParentDHTMLXTree.add(tempDhtmlxTree);

                        tempParentDHTMLXTree = tempDhtmlxTree;
                    }

                    // 叶子节点
                    TRegioninfo leaftRegioninfo = descList.get(0);
                    DHTMLXTree templeafDhtmlxTree = new DHTMLXTree(
                            leaftRegioninfo.getRegioncode(),
                            leaftRegioninfo.getName());
                    templeafDhtmlxTree.setColor("#666666");
                    templeafDhtmlxTree.setTooltip(leaftRegioninfo.getName());

                    // 叶子有子节点
                    String subCode = leaftRegioninfo.getSubcode();
                    if (subCode != null && subCode.equals("1")) {
                        templeafDhtmlxTree.add(DHTMLXTreeFactory.getLoading()); // 叶子有子节点
                    }
                    tempParentDHTMLXTree.add(templeafDhtmlxTree);
                } else {
                    // 没有父节点（该节点为根）
                    String subCode = tempTRegioninfo.getSubcode();
                    dhtmlxTree.setColor("#666666");
                    // 叶子有子节点
                    if (subCode != null && subCode.equals("1")) {
                        dhtmlxTree.add(DHTMLXTreeFactory.getLoading());
                    }
                }// end if(totalSize > 1) else

                return DHTMLXTreeFactory.toTree(dhtmlxTree);
            }
        }// end if(tRegioninfo != null)

        return null;
    }

    /**
     * 将行政区划编码列表转换为DHTMLTree对象列表
     *
     * @param regioninfos
     *            行政区划编码列表
     * @param isNocheckbox
     *            是否没有 checkbox
     * @return DHTMLTree对象列表
     */
    private ArrayList<DHTMLXTree> toTree(ArrayList<TRegioninfo> regioninfos,
                                         boolean isNocheckbox) {
        ArrayList<DHTMLXTree> trees = new ArrayList<DHTMLXTree>();

        Iterator iterator = regioninfos.iterator();
        while (iterator.hasNext()) {
            TRegioninfo regioninfo = (TRegioninfo) iterator.next();
            DHTMLXTree dhtmlxTree = DHTMLXTreeFactory.getNode(
                    regioninfo.getRegioncode(), regioninfo.getName());
            if (isNocheckbox) {
                dhtmlxTree.noCheckbox();
            }
            dhtmlxTree.open();
            dhtmlxTree.setTooltip(regioninfo.getName());
            if (regioninfo.getSubcode().equals("1")) {
                dhtmlxTree.add(DHTMLXTreeFactory.getLoading());
            }
            trees.add(dhtmlxTree);
        }

        return trees;
    }

    /**
     *
     * @param leafRegion
     *            子节点的行政区划编码列表信息
     * @param root
     *            根节点
     * @param isNocheckbox
     *            是否没有 checkbox
     * @return DHTMLXTree 对象
     */
    private DHTMLXTree toleafTree(ArrayList<TRegioninfo> leafRegion,
                                  DHTMLXTree root, boolean isNocheckbox) {
        Iterator iterator = leafRegion.iterator();
        while (iterator.hasNext()) {
            TRegioninfo regioninfo = (TRegioninfo) iterator.next();
            DHTMLXTree dhtmlxTree = new DHTMLXTree(regioninfo.getRegioncode(),
                    regioninfo.getName());
            if (isNocheckbox) {
                dhtmlxTree.noCheckbox();
            }
            dhtmlxTree.setTooltip(regioninfo.getName());
            if (regioninfo.getSubcode().equals("1")) {
                dhtmlxTree.add(DHTMLXTreeFactory.getLoading());
            }
            root.add(dhtmlxTree);
        }
        return root;
    }

    /**
     * 递归指定节点的所有父节点
     *
     * @param descList
     *
     * @param catalogid
     * @param parcode
     * @param minLevel
     */
    private void getAllParentItemBycatalogidAndparcode(
            List<TRegioninfo> descList, int catalogid, String parcode,
            int minLevel) {
        if (parcode != null && !parcode.isEmpty() && !parcode.equals("0")) {
            TRegioninfo tRegioninfo = getRegionByCatalogAndQhcode(catalogid,
                    parcode);
            if (tRegioninfo != null) {
                int currentLevel = tRegioninfo.getRegionlevel();
                descList.add(tRegioninfo);
                if (currentLevel > minLevel) // 还没找到根节点，继续
                    getAllParentItemBycatalogidAndparcode(descList, catalogid,
                            tRegioninfo.getParcode(), minLevel); // 递归获取所有节点
            }
        }
    }

    /**
     * 填充其他信息
     *
     * @param catalogid
     *            指定行政区划类型（指定地图）catalogid
     * @param successList
     */
    private void updateOtherInfo(int catalogid, List<List<Object>> successList) {
        List<TRegioninfo> regioninfos = regionInfoDao
                .getRegionsByCatalog(catalogid);
        TRegioncatalog regioncatalog = regionCatalogsDao.findOne(catalogid);

        // 补全regioninfos对象中除regionCode 和name之外的其他字段信息
        calculateOtherInfo(regioninfos, regioncatalog);
    }

    /**
     * 根据指定行政区划编码信息和excel表格头部信息转换为二维数据表
     *
     * @param regioninfos
     *            要导出的excel行政区划数据
     * @param header
     *            要导出的excel表格的头部信息（数据表对应字段名）
     *
     * @return 二维数据表
     */
    private List<List<String>> getDetailByListinfo(
            List<TRegioninfo> regioninfos, String[] header) {
        List<List<String>> details = new ArrayList<List<String>>();
        Iterator iterator = regioninfos.iterator();
        while (iterator.hasNext()) {
            TRegioninfo regioninfo = (TRegioninfo) iterator.next();
            if (regioninfo == null)
                continue;
            // 转换为map，提高速度
            Map<String, String> map = new HashMap<String, String>();
            map.put("rgid", String.valueOf(regioninfo.getRgid()));
            map.put("TRegioncatalog",
                    String.valueOf(regioninfo.getTRegioncatalog().getRcid()));
            map.put("regioncode", regioninfo.getRegioncode());
            map.put("name", regioninfo.getName());
            map.put("parcode", regioninfo.getParcode());
            map.put("subcode", regioninfo.getSubcode());
            map.put("regionlevel", String.valueOf(regioninfo.getRegionlevel()));
            map.put("smx", String.valueOf(regioninfo.getSmx()));
            map.put("smy", String.valueOf(regioninfo.getSmy()));
            // 获取数据
            List<String> row = new ArrayList<String>();
            for (int i = 0, len = header.length; i < len; i++) {
                String key = header[i];
                if (key == null || key.isEmpty())
                    continue;

                String s = map.get(key);
                if (s != null)
                    row.add(s);
            }
            details.add(row);
        }
        return details;
    }

    /**
     * 将二维表数据转换为行政区划编码列表
     *
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;注意：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;该方法返回的List<TRegioninfo>列表
     * 元素TRegioninfo中只有regionCode和name；
     * </p>
     *
     * @param objectList
     *            行政区划编码二维表数据
     * @return 行政区划编码列表（只含regionCode和name）
     */
    private List<TRegioninfo> convertDetailToListinfo(
            List<List<Object>> objectList) {
        List<TRegioninfo> regioninfos = new ArrayList<TRegioninfo>();
        TRegioninfo regioninfo = null;
        Iterator iterator = objectList.iterator();
        while (iterator.hasNext()) {
            List<Object> row = (List<Object>) iterator.next();
            regioninfo = new TRegioninfo();

            String regionCode = (String) row.get(0);
            String regionName = (String) row.get(1);
            regioninfo.setRegioncode(regionCode);
            regioninfo.setName(regionName);
            regioninfos.add(regioninfo);
        }
        return regioninfos;
    }

    /**
     * 补全TRegioninfo对象中除regionCode 和name之外的其他字段信息
     *
     * @param regioninfosPart
     *            需要补全的行政区划编码列表（列表元素只包含regionCode 和name）
     * @param regioncatalog
     *            当前行政区划编码所属行政区划类型（当前地图信息）
     */
    private void calculateOtherInfo(List<TRegioninfo> regioninfosPart,
                                    TRegioncatalog regioncatalog) {

        Iterator<TRegioninfo> iterator = regioninfosPart.iterator();
        while (iterator.hasNext()) {
            TRegioninfo regioninfo = iterator.next();
            regioninfo.setTRegioncatalog(regioncatalog);
            regioninfo.setRegionlevel(RegionSupport.getRegionLevel(regioninfo
                    .getRegioncode()));
            regioninfo.setParcode(getParcode(regioninfo.getRegioncode(),
                    regioninfo.getRegionlevel()));
            regioninfo.setSubcode(getSubcode(regioninfo, regioninfosPart));
            regioninfo.setSmx(0);
            regioninfo.setSmy(0);
        }
    }

    /**
     * 判断指定行政编码是否存在子节点
     *
     * <p style="color:red;font-size:14px;">
     * &nbsp;&nbsp;&nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;判断regionInfo在regioninfosPart中是否有子节点<br/>
     * &nbsp;&nbsp;&nbsp;&nbsp;若regioninfosPart中不存在，再判断数据库中是否存在子节点
     * </p>
     *
     * @param regionInfo
     *            要判断的行政区划编码
     * @param regioninfosPart
     *            判断的行政区划编码是否有子节点的依据
     * @return "0":没有子节点 或"1":存在子节点,
     */
    private String getSubcode(TRegioninfo regionInfo,
                              List<TRegioninfo> regioninfosPart) {
        String result = "0";
        String subStr = RegionSupport.getSubstr(regionInfo.getRegioncode(),
                regionInfo.getRegionlevel());
        if (subStr == "") {
            result = "1";
        }
        // 读入数据中判断
        Iterator<TRegioninfo> iterator = regioninfosPart.iterator();
        while (iterator.hasNext()) {
            TRegioninfo regioninfo = iterator.next();
            if (regioninfo.getRegioncode().startsWith(subStr)
                    && regioninfo != regionInfo) {
                result = "1";
                break;
            }
        }

        if (result.equals("0")) {
            // 数据库中判断
            if (regionInfoDao.findByCatalogAndQhcodeLike(
                    regionInfo.getTRegioncatalog().getRcid(), subStr + "%")
                    .size() > 0) {
                result = "1";
            }
        }

        return result;
    }

    /**
     * 获取指定行政编码regioncode的父节点的编码
     *
     * @param regioncode
     *            行政编码
     * @param regionlevel
     *            编码级别
     * @return
     */
    private String getParcode(String regioncode, int regionlevel) {
        switch (regionlevel) {
            case 2:
                return "000000000000";
            case 3:
                return RegionSupport.padRight(regioncode.substring(0, 2), 12, '0');
            case 4:
                return RegionSupport.padRight(regioncode.substring(0, 4), 12, '0');
            case 5:
                return RegionSupport.padRight(regioncode.substring(0, 6), 12, '0');
            case 6:
                return RegionSupport.padRight(regioncode.substring(0, 9), 12, '0');
            default:
                return "";
        }
    }

    /**
     * 统一用来截取 所有#之前的字符
     *
     * @param regioncode
     *            行政区划编码
     * @return 截取后的编码
     */
    private String subStrCode(String regioncode) {
        String subStr = regioncode;
        if (subStr.contains("#")) {// 下级所有
            subStr = subStr.substring(0, subStr.indexOf("#"));
            if (RegionSupport.isMunicipalRegion(subStr)
                    && subStr.indexOf("00") != -1) {
                subStr = subStr.substring(0, subStr.indexOf("00"));// 取直辖市的前两位
            }
        } else if (subStr.equals("00000000000")) {
            subStr = "";
        }
        return subStr;
    };
}
