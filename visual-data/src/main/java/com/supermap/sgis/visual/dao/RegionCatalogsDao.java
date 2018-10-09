package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TRegioncatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.ArrayList;

/**
 * 行政区划类型(地图) dao
 *
 * @author Created by Administrator on 14-3-3.
 */
public interface RegionCatalogsDao extends JpaRepository<TRegioncatalog,Integer> {

    /**
     * 按年份降序获取所有的区划目录（不限状态）
     *
     * @return 行政区划类型列表
     */
    @Query("select  t from TRegioncatalog t order by year desc ")
    ArrayList<TRegioncatalog> getCatalogOrderByYear();

    /**
     * 按年份、主键降序获取有效（status=1）的区划目录
     *
     * @return 行政区划类型列表
     */
    @Query("select  t from TRegioncatalog t where status=1 order by year desc,rcid ")
    ArrayList<TRegioncatalog> getValidCatalog();
}

