package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TMacroPeriod;
import com.supermap.sgis.visual.entity.TMacroTableinfo;
import com.supermap.sgis.visual.entity.TMacroTablemeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 综合定报时段信息dao
 *
 * @author Created by zhangjunfeng on 14-4-1.
 * @author Update by RRP on 14-7-17.
 */
public interface MacroTableinfoDao extends JpaRepository<TMacroTableinfo, Integer> {

    /**
     * 获取指定综合调查对象(TMacroTablemeta)id下的综合定报时段信息
     *
     * @param matmid
     *            综合调查对象(TMacroTablemeta)id
     * @return 综合定报时段信息
     */
    @Query("select t from  TMacroTableinfo t where t.TMacroTablemeta.matmid=:matmid")
    TMacroTableinfo findByMatmid(@Param("matmid") int matmid);

    /**
     * 获取综合数据报告期（TMacroPeriod.mapid）id、综合定报时段父节点id和<br/>
     * 行政区划级别下的综合定报时段信息列表
     *
     * @param mapid
     *            综合数据报告期（TMacroPeriod.mapid）id
     * @param parid
     *            综合定报时段信息父节点id
     * @param regionLevel
     *            指定行政区划级别
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where t.TMacroPeriod.mapid in ?1  and t.parid=?2 and t.regionLevel=?3 and (t.macmetaType =1 or t.macmetaType =2 )  order by t.regionLevel,t.parid,t.matiid")
    List<TMacroTableinfo> findCatalogs(int[] mapid, int parid, int regionLevel);

    /**
     * 获取综合数据报告期（TMacroPeriod.mapid）id、综合定报时段父节点id和<br/>
     * 综合调查对象(TMacroTablemeta)id下的综合定报时段信息列表
     *
     * @param mapid
     *            综合数据报告期（TMacroPeriod.mapid）id
     * @param parid
     *            综合定报时段信息父节点id
     * @param matmid
     *            综合调查对象(TMacroTablemeta)id
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where  t.TMacroPeriod.mapid=?1  and (t.parid=?2 or t.TMacroTablemeta.matmid=?3)")
    List<TMacroTableinfo> findByLevelAndPerid(int mapid, int parid, int matmid);

    /**
     * 获取综合定报时段信息父节点id下的综合定报时段信息列表
     *
     * @param parid
     *            综合定报时段信息父节点id
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where  t.parid=?1  order by t.regionLevel,t.parid,t.matiid")
    List<TMacroTableinfo> findSubs(int parid);

    /**
     * 获取指定综合数据报告期（TMacroPeriod.reportType）报告期类型的综合定报时段信息列表
     *
     * @param reportType
     *            综合数据报告期（TMacroPeriod.reportType）报告期类型
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where t.TMacroPeriod.reportType=?1 and t.macmetaType =2 order by t.TMacroPeriod.year asc,t.TMacroPeriod.month asc ,t.regionLevel asc")
    List<TMacroTableinfo> findTablesByReportType(int reportType);

    /**
     * 获取指定综合数据报告期（TMacroPeriod.mapid）id的综合定报时段信息列表
     *
     * @param mapid
     *            综合数据报告期（TMacroPeriod.mapid）id
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where t.TMacroPeriod.mapid=?1 and t.macmetaType =2 order by t.matiid")
    List<TMacroTableinfo> findTablesByPeriod(int mapid);

    /**
     * 根据综合数据报告期的年、月和报告期类型获取综合定报时段信息列表
     *
     * @param year
     *            综合数据报告期的（TMacroPeriod.year）年
     * @param month
     *            综合数据报告期的（TMacroPeriod.month）月
     * @param reportType
     *            综合数据报告期（TMacroPeriod.reportType）报告期类型
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where t.TMacroPeriod.year=?1 and  t.TMacroPeriod.month=?2 and t.TMacroPeriod.reportType=?3 and t.macmetaType =2 order by t.regionLevel asc")
    List<TMacroTableinfo> findTablesByYearMonth(int year, int month,
                                                int reportType);

    /**
     * 根据综合数据报告期（TMacroPeriod.mapid）id和行政区划级别获取综合定报时段信息列表
     *
     * @param mapid
     *            综合数据报告期（TMacroPeriod.mapid）id
     * @param level
     *            指定行政区划级别
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where t.TMacroPeriod.mapid=?1 and t.regionLevel=?2 and t.macmetaType =2 order by t.matiid")
    List<TMacroTableinfo> findTablesByLevelAndPeriod(int mapid, int level);

    /**
     * 根据综合数据报告期的年、月、报告期类型和指定行政区划级别获取综合定报时段信息列表
     *
     * @param year
     *            综合数据报告期的（TMacroPeriod.year）年
     * @param month
     *            综合数据报告期的（TMacroPeriod.month）月
     * @param reportType
     *            综合数据报告期（TMacroPeriod.reportType）报告期类型
     * @param level
     *            指定行政区划级别
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where t.TMacroPeriod.year=?1 and  t.TMacroPeriod.month=?2 and t.TMacroPeriod.reportType=?3 and t.regionLevel=?4 and t.macmetaType =2 order by t.matiid")
    List<TMacroTableinfo> findTablesByLevel(int year, int month,
                                            int reportType, int level);

    /**
     * 通过综合定报时段指标编码（一个或者多个）获取综合定报时段信息列表
     *
     * @param idenCode
     *            综合定报时段指标编码（一个或者多个）
     * @return 综合定报时段信息列表
     */
    @Query("select t from  TMacroTableinfo t where t.idenCode in ?1 order by  t.TMacroPeriod.year,t.TMacroPeriod.month")
    List<TMacroTableinfo> findByIdenCode(String[] idenCode);

    /**
     * 获取指定报告期类型、报告期月份和综合调查对象下的综合对象元数据信息
     *
     * @param catalog
     *            综合数据报告期（TMacroPeriod.reportType）报告期类型
     * @param period
     *            综合数据报告期（TMacroPeriod.month）月份
     * @param item
     *            综合调查对象(TMacroTablemeta)id
     *
     * @return 综合对象元数据信息
     */
    @Query("select t.TMacroTablemeta from  TMacroTableinfo t where t.TMacroPeriod.reportType=:catalog and t.TMacroPeriod.month=:period and t.TMacroTablemeta.matmid=:item")
    TMacroTablemeta findCatalogByMacmetTypeAndReporttype(
            @Param("catalog") int catalog, @Param("period") int period,
            @Param("item") int item);

    /**
     * 获取指定报告期类型和报告期id下的综合对象元数据信息列表
     *
     * @param catalog
     *            综合数据报告期（TMacroPeriod.reportType）报告期类型
     * @param period
     *            综合数据报告期（TMacroPeriod.mapid）id
     * @return 综合对象元数据信息列表
     */
    @Query("select t.TMacroTablemeta from  TMacroTableinfo t where t.TMacroPeriod.reportType=:catalog and t.TMacroPeriod.mapid=:period")
    List<TMacroTablemeta> findPeriodItemsByCatalog(
            @Param("catalog") int catalog, @Param("period") int period);

    /**
     * 获取指定综合调查对象父节点id、报告期类型和报告期id下的综合对象元数据信息列表
     *
     * @param parid
     *            综合调查对象(TMacroTablemeta.parid)父节点id
     * @param catalog
     *            综合数据报告期（TMacroPeriod.reportType）报告期类型
     * @param period
     *            综合数据报告期（TMacroPeriod.mapid）id
     * @return 综合对象元数据信息列表
     */
    @Query("select t.TMacroTablemeta from  TMacroTableinfo t where t.TMacroPeriod.reportType=:catalog and t.TMacroPeriod.mapid=:period and t.TMacroTablemeta.parid=:parid")
    List<TMacroTablemeta> findPeriodItemByCatalogAndParid(
            @Param("parid") int parid, @Param("catalog") int catalog,
            @Param("period") int period);

    /**
     * 根据综合调查对象(TMacroTablemeta.matmid)id查询报告期列表
     *
     * @param parid
     *            综合调查对象(TMacroTablemeta.matmid)id
     * @return 综合数据报告期列表
     */
    @Query("select t.TMacroPeriod from  TMacroTableinfo t where t.TMacroTablemeta.matmid=:parid order by  t.TMacroPeriod.year,t.TMacroPeriod.month")
    List<TMacroPeriod> findPeriodByParid(@Param("parid") int parid);

    /**
     * 根据综合调查对象(TMacroTablemeta.matmid)(一个或者多个)id查询报告期列表
     *
     * @param matmids
     *            综合调查对象(TMacroTablemeta.matmid)(一个或者多个)id
     * @return 综合数据报告期列表
     */
    @Query("select  t.TMacroPeriod from  TMacroTableinfo t where t.TMacroTablemeta.matmid in ?1 order by  t.TMacroPeriod.year,t.TMacroPeriod.month")
    List<TMacroPeriod> findPeriodByMatmids(int[] matmids);

    /**
     * 根据综合定报时段指标编码获取报告期列表
     *
     * @param idenCode
     *            综合定报时段指标编码
     * @return 综合数据报告期列表
     */
    @Query("select t.TMacroPeriod from  TMacroTableinfo t where t.idenCode=?1 order by  t.TMacroPeriod.year,t.TMacroPeriod.month")
    List<TMacroPeriod> findPeriodsByIdenCode(String idenCode);

    /**
     * 根据综合数据报告期（TMacroPeriod.mapid）id和的行政区划级别列表(去掉重复值)
     *
     * @param mapid
     *            综合数据报告期（TMacroPeriod.mapid）id
     * @param parid
     *            综合定报时段信息父节点id
     * @return 行政区划级别列表(去掉重复值)
     */
    @Query("select distinct t.regionLevel from  TMacroTableinfo t where t.TMacroPeriod.mapid=?1  and t.parid=?2  and t.macmetaType =1  order by t.regionLevel")
    List<Integer> findCatalogLevels(int mapid, int parid);

    /**
     * 根据指定的综合数据报告期类型（TMacroPeriod.reportType）获取行政区划级别列表(去掉重复值)
     *
     * @param reportType
     *            综合数据报告期类型（TMacroPeriod.reportType）
     *
     * @return 行政区划级别列表(去掉重复值)
     */
    @Query("select distinct t.regionLevel from  TMacroTableinfo t where t.TMacroPeriod.reportType=?1 order by t.regionLevel")
    List<Integer> findReportTypeLevels(int reportType);

    /**
     * 获取指定综合数据报告期的年、月和综合定报时段信息父节点id的划级别列表(去掉重复值)
     *
     * @param year
     *            综合数据报告期的（TMacroPeriod.year）年
     * @param month
     *            综合数据报告期的（TMacroPeriod.month）月
     * @param parid
     * @return 划级别列表(去掉重复值)
     */
    @Query("select distinct t.regionLevel from  TMacroTableinfo t where t.TMacroPeriod.year=?1  and t.TMacroPeriod.month=?2 and t.parid=?3   order by t.regionLevel")
    List<Integer> findLevelsByYearMonth(int year, int month, int parid);

}
