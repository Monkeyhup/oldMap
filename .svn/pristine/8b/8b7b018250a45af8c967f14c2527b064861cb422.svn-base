package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TMacroPeriod;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 综合数据报告期dao
 *
 * @author Created by zhangjunfeng on 14-4-26.
 */
public interface MacroPeriodDao extends BaseDao<TMacroPeriod, Integer> {
    /**
     * 查询所有的综合数据报告期
     *
     * @return 综合数据报告期列表
     */
    @Query("select  t from TMacroPeriod t order by  t.reportType asc ,t.year asc,t.TRegioncatalog.rcid asc")
    List<TMacroPeriod> findAllPeriod();

    /**
     * 判断指定条件下的综合数据报告期是否存在
     *
     * @param reportType
     * 			综合数据报告期类型
     * @param year
     * 			综合数据报告期年份
     * @param month
     * 			综合数据报告期月份
     * @param rcid
     * 			指定行政区划类型id
     * @return 条件下的综合数据报告期
     */
    @Query("select  t from TMacroPeriod t where t.reportType=:reportType and t.year=:year and t.month=:month and t.TRegioncatalog.rcid=:rcid  and t.status=1")
    TMacroPeriod checkExist(@Param("reportType") int reportType, @Param("year") int year, @Param("month") int month, @Param("rcid") int rcid);

    /**
     * 判断指定条件下的综合数据报告期是否存在
     *
     * @param year
     * 			综合数据报告期年份
     * @param month
     * 			综合数据报告期月份
     * @param reportType
     * 			综合数据报告期类型
     * @return 条件下的综合数据报告期
     */
    @Query("select  t from TMacroPeriod t where  t.year=:year and t.month=:month  and t.reportType=:reportType and  t.status=1")
    List<TMacroPeriod> findByYearMonth(@Param("year") int year, @Param("month") int month, @Param("reportType") int reportType);
}
