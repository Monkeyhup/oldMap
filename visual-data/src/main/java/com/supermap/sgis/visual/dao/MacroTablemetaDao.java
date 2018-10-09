package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TMacroTablemeta;
import org.hibernate.tool.hbm2ddl.TableMetadata;
import org.omg.PortableServer.LIFESPAN_POLICY_ID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 综合对象元数据信息dao
 *
 * @author Created by zhangjunfeng on 14-3-31.
 */
public interface MacroTablemetaDao extends BaseDao<TMacroTablemeta, Integer> {

    /**
     * 查询指定父节点id和报告期类型的综合对象元数据信息列表
     *
     * @param parid
     * 		父节点id
     * @param reportType
     * 		报告期类型
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where t.parid=:parid and t.reportType=:reportType order by t.orderby ,t.matmid")
    List<TMacroTablemeta> findAllByParidAndreportType(@Param("parid") int parid, @Param("reportType") int reportType);

    /**
     * 查询指定父节点id、所属行政区划级别和报告期类型的综合对象元数据信息列表
     *
     * @param parid
     * 		父节点id
     * @param regionLevel
     * 		所属行政区划级别（2省、3市、4县、5镇、6村）
     * @param reportType
     * 		报告期类型
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where t.parid=:parid and t.regionLevel = :regionLevel and t.reportType=:reportType order by t.matmid, t.orderby")
    List<TMacroTablemeta> findAllByRegionlevelAndreportType(@Param("parid") int parid, @Param("regionLevel") int regionLevel, @Param("reportType") int reportType);

    /**
     * 查询指定报告期类型和指标名称的综合对象元数据信息列表
     *
     * @param reportType
     * 			报告期类型
     * @param idenName
     * 			指标名称
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where t.reportType=:reportType and t.idenName =:idenName ")
    List<TMacroTablemeta> findByTypeName(@Param("reportType") int reportType, @Param("idenName") String idenName);

    /**
     * 查询指定综合对象元数据信息(一个或者多个)id下匹配的综合对象元数据信息列表
     * @param matmids
     * 			综合对象元数据信息(一个或者多个)id
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta t where t.matmid in ?1")
    List<TMacroTablemeta> findAllByMatmids(int[] matmids);

    /**
     * 根据区划级别
     * @param level
     * @return
     */
    @Query("SELECT t FROM TMacroTablemeta t WHERE t.regionLevel = ?1 AND t.macmetaType != 3 AND t.status>0 and t.reportType is not null")
    List<TMacroTablemeta> findAllByLevel(int level);


    /**
     * 找到最大的指标代码
     * <p style="color:red;">
     * 说明：<br/>
     * 指标编码B为前缀的最大值（Bxxxxx）
     * </p>
     *
     * @return 最大的指标代码
     */
    @Query("select max(t.idenCode) from TMacroTablemeta t where t.idenCode like 'B%'")
    public String findMaxCode();

    /**
     * 获取指定父节点id下的最大的orderby
     *
     * @param parid
     *            父节点id
     * @return orderby的最大值
     */
    @Query("select max(t.orderby) from TMacroTablemeta t where t.parid=?1")
    public String findMaxOrderBy(int parid);

    /**
     * 获取指定父节点id和 <b>不包括</b> 指定综合对象元数据信息(一个或者多个)id的综合对象元数据信息列表
     *
     * @param parid
     * 			父节点id
     * @param matmids
     * 			<b>要排除</b>的综合对象元数据信息(一个或者多个)id
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where t.parid=?1 and t.matmid not in ?2")
    public List<TMacroTablemeta> findOthers(int parid, int[] matmids);

    /**
     * 获取综合对象元数据信息的<br/>
     * 所有表（macmetaType=2，代表‘表’）信息（status>0）
     *
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where  t.macmetaType=2 and t.status>0 order by t.reportType asc,t.regionLevel asc,t.matmid")
    public List<TMacroTablemeta> findAllTables();

    /**
     * 获取指定报告期类型下的综合对象元数据信息的<br/>
     * 表（macmetaType=2，代表‘表’）信息（status>0）
     *
     * @param reportType
     * 			报告期类型下
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where t.reportType =?1 and t.macmetaType=2 and t.status>0 order by t.regionLevel,t.matmid")
    public List<TMacroTablemeta> findTablesByReportType(int reportType);

    /**
     * 获取指定报告期类型和行政区划级别下的综合对象元数据信息的<br/>
     * 表（macmetaType=2，代表‘表’）信息（status>0）
     *
     * @param reportType
     * 			报告期类型下
     * @param level
     * 			行政区划级别
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where t.reportType =?1 and t.regionLevel=?2 and t.macmetaType=2 and t.status>0 order by t.matmid")
    public List<TMacroTablemeta> findTablesByLevel(int reportType, int level);

    /**
     * 获取指定父节点id下的综合对象元数据信息的<br/>
     * 表（macmetaType=2，代表‘表’）信息（status>0）
     * @param parid
     * 			父节点id
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where t.parid=?1 and t.macmetaType=2 and t.status>0 order by t.matmid")
    public List<TMacroTablemeta> findTablesByPar(int parid);

    /**
     * 获取指定父节点id下的综合对象元数据信息列表（status>0）
     *
     * @param parid
     * 			父节点id
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta  t where t.parid=?1 and t.status>0  order by t.matmid")
    public List<TMacroTablemeta> findSubs(int parid);

    /**
     * 检查指定综合调查对象父节点id下指标编码是否已经存在
     *
     * <p style="color:red;">
     * 说明：<br/>
     * 	可用用来判断指标编码的唯一性时使用
     * </p>
     *
     * @param parid 父节点id
     * @param code 指标编码
     * @return 综合对象元数据信息列表（size>0，代表存在）
     */
    @Query("select t from TMacroTablemeta t where t.parid =?1 and t.idenCode=?2")
    public  List<TMacroTablemeta> checkCodeExists(int parid, String code);

    /**
     * 查询指定指标codes下匹配的综合对象元数据信息列表
     * @param codes 指标编码
     * @return 综合对象元数据信息列表
     */
    @Query("select t from TMacroTablemeta t where t.idenCode in ?1")
    List<TMacroTablemeta> findAllByCodes(String[] codes);

    /**
     * 根据指标码和级别获取tablemeta
     * @param codes
     * @param level
     * @return
     */
    @Query("select t from TMacroTablemeta t where t.idenCode in ?1 and t.regionLevel = ?2 and t.status >0")
    List<TMacroTablemeta> findByCodesAndLevel(String[] codes,int level);


    @Query("select t from TMacroTablemeta t where t.parid=?1")
    List<TableMetadata> findByParid(int parid);
}
