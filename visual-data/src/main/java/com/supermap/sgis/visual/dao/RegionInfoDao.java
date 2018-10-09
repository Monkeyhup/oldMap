package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TRegioninfo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;
import java.util.List;


/**
 * 行政区划编码 dao
 *
 * @author Created by Administrator on 14-3-3.
 */
public interface RegionInfoDao extends BaseDao<TRegioninfo, Integer> {

    /**
     * 获取指定地图catalogid下的行政编码列表（按编码级别升序）
     *
     * @param id
     * 			指定地图catalogid
     * @return 行政编码列表
     */
    @Query("select t from TRegioninfo t where t.TRegioncatalog.rcid=:id order by t.regionlevel asc ")
    ArrayList<TRegioninfo> getRegionsByCatalog(@Param("id") int id);



    /**
     * 根据分类ID和区划ID查找行政区划编码
     *
     * @param catalogid
     * 			指定地图catalogid
     * @param regionid
     * 			指定编码id
     *
     * @return 行政编码信息
     */
    @Query("select t from TRegioninfo t where t.TRegioncatalog.rcid=:catalogid and t.rgid=:regionid")
    TRegioninfo getOneByCatalogAndid(@Param("catalogid") int catalogid, @Param("regionid") int regionid);

    /**
     * 获取指定地图catalogid和级别以及编码前缀下的编码列表
     *
     * @param catalogid
     * 			指定地图catalogid
     * @param level
     * 			指定行政区划级别
     * @param subStr
     * 			编码前缀下(模糊查询，后面带%)
     * @return 行政编码列表
     */
    @Query("select t from TRegioninfo t where t.TRegioncatalog.rcid=:catalogid and t.regioncode like :subStr and t.regionlevel=:level order by t.regioncode asc ")
    List<TRegioninfo> getLeafRegion(@Param("catalogid") int catalogid, @Param("level") int level, @Param("subStr") String subStr);

    /**
     * 根据分类id和区划代码找行政区划记录
     *
     * @param catalogid
     * 			指定地图catalogid
     * @param qhcode
     * 			行政区划编码
     * @return 行政编码信息
     */
    @Query("select t from TRegioninfo t where t.regioncode=:qhcode and t.TRegioncatalog.rcid=:catalogid")
    TRegioninfo findByCatalogAndQhcode(@Param("catalogid") int catalogid, @Param("qhcode") String qhcode);

    /**
     * 获取指定地图catalogid和行政区划编码(模糊查询，后面带%)下的编码列表
     *
     * @param catalogid
     * 			指定地图catalogid
     * @param qhcode
     * 			行政区划编码(模糊查询，后面带%)
     * @return 行政编码列表
     */
    @Query("select t from TRegioninfo t where t.regioncode like:qhcode and t.TRegioncatalog.rcid=:catalogid")
    List<TRegioninfo> findByCatalogAndQhcodeLike(@Param("catalogid") int catalogid, @Param("qhcode") String qhcode);

    /**
     * 获取指定地图catalogid和级别以及行政区划编码(模糊查询，后面带%)下的编码列表
     *
     * @param catalogid
     * 			指定地图catalogid
     * @param code
     * 			行政区划编码(模糊查询，后面带%)
     * @param regionlevel
     * 			指定行政区划级别
     * @return 行政编码列表
     */
    @Query("select t from TRegioninfo t where t.regionlevel=:regionlevel and t.regioncode like :code and t.TRegioncatalog.rcid=:catalogid order by t.regioncode")
    ArrayList<TRegioninfo> findByRegionlevel(@Param("catalogid") int catalogid, @Param("code") String code, @Param("regionlevel") int regionlevel);

    /**
     *
     * 获取指定地图catalogid和级别以及行政区划编码下的编码列表
     * @param catalogid
     * 			指定地图catalogid
     * @param code
     * 			行政区划编码
     * @param regionlevel
     * 			指定行政区划级别
     * @return 行政编码列表
     */
    @Query("select t from TRegioninfo t where t.regionlevel=:regionlevel and t.regioncode =:code and t.TRegioncatalog.rcid=:catalogid order by t.regioncode")
    ArrayList<TRegioninfo> findUnique(@Param("catalogid") int catalogid, @Param("code") String code, @Param("regionlevel") int regionlevel);

    /**
     * 根据qhcode找到他下面的最大的区划级别(指的是数值上最大)
     *
     * @param catalogid
     * 			指定地图catalogid
     * @param qhcode
     * 			行政区划编码
     * @return 最大的区划级别(指的是数值上最大)
     */
    @Query("select max(t.regionlevel) from TRegioninfo t where t.TRegioncatalog.rcid=:catalogid and t.regioncode like :qhcode")
    int findMaxRegionLevelByQhcode(@Param("catalogid") int catalogid, @Param("qhcode") String qhcode);

    /**
     * 根据指定地图catalogid找到最小的区划级别（指的是数值上最小）
     *
     * @param catalogid
     * 			指定地图catalogid
     * @return 最小的区划级别（指的是数值上最小）
     */
    @Query("select min(t.regionlevel) from TRegioninfo t where t.TRegioncatalog.rcid=:catalogid")
    int findMaxRegionLevel(@Param("catalogid") int catalogid);

    /**
     * 根据指定地图catalogid找到最小的区划级别（指的是数值上最大）
     *
     * @param catalogid
     * 			指定地图catalogid
     * @return 最小的区划级别（指的是数值上最大）
     */
    @Query("select max(t.regionlevel) from TRegioninfo t where t.TRegioncatalog.rcid=:catalogid")
    int findMinRegionLevel(@Param("catalogid") int catalogid);

    /**
     * 按行政区划名模糊查询行政区划编码列表
     *
     * @param catalogid
     * 			指定地图catalogid
     * @param regionname
     * 			行政区划名称（模糊查询）
     * @return 行政区划编码列表
     */
    @Query("select t from TRegioninfo t where t.TRegioncatalog.rcid=:catalogid and t.name like :regionname")
    List<TRegioninfo> findRegionsByName(@Param("catalogid") int catalogid, @Param("regionname") String regionname);

    /**
     * 根据行政区划名称精确查询
     * @param catalogid  行政区划类别
     * @param regionlevel 级别
     * @param regionname  名称
     * @return
     */
    @Query("select t from TRegioninfo t where t.TRegioncatalog.rcid=?1 and t.regionlevel=?2 and t.name=?3")
    List<TRegioninfo> findByFullName(int catalogid, int regionlevel, String regionname);
    /**
     * 根据指定regioncodes编码范围（in方式）找到行政区划信息
     * @param catalogid
     * 			指定地图catalogid
     * @param regioncodes
     * 			一个或者多个行政区划编码（采用in参数）
     * @return 行政区划编码列表
     */
    @Query("select t from TRegioninfo t where t.TRegioncatalog.rcid=?1 and t.regioncode in ?2 order by t.regioncode")
    public  List<TRegioninfo> findByReginCodes(int catalogid, String[] regioncodes);

    /**
     * 获取前端选择的行政区划 主要是处理选择所有XX这种
     * @param catalogid
     * 			指定地图catalogid
     * @param regionlevel
     * 			行政区划级别
     * @param code
     * 			行政区划编码（模糊查询）
     * @return 行政区划编码列表
     */
    @Query("select t from TRegioninfo t where t.TRegioncatalog.rcid=?1 and t.regionlevel = ?2  and t.regioncode like ?3 order by t.regioncode")
    public  List<TRegioninfo> findSelRegions(int catalogid, int regionlevel, String code);

    /**
     * 根据行政区划代码查询行政区划编码列表（不指定catalogid）
     *
     * @param code
     * 			指定行政区划编码
     * @return 行政区划编码列表
     */
    @Query("select t from TRegioninfo t where t.regioncode = ?1 and t.smx >0 and t.smy >0 order by t.regioncode")
    public  List<TRegioninfo> findByCode(String code);

}
