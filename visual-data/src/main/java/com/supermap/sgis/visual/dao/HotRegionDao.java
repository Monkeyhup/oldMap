package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.THotword;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;

/**
 * Created by yangxinyong on 2015/12/2.
 *
 * 搜索热度dao
 */
public interface HotRegionDao extends BaseDao<THotword, Integer> {
    /**
     * 查询地区是否已添加
     */
    @Query("select t from THotword t where t.areacode=:areacode")
    THotword getHotareaExit(@Param("areacode") String areacode);

}
