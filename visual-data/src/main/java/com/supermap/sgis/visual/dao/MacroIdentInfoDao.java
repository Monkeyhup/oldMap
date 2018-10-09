package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TMacroIdentinfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Created by duanxiaofei on 2014/9/5.
 */
public interface MacroIdentInfoDao extends JpaRepository<TMacroIdentinfo,Integer>{

    @Query("select t from TMacroIdentinfo t where t.TMacroTablemeta.matmid=:matmid")
    public List<TMacroIdentinfo> findByMatmid(@Param("matmid") int matmid);

    @Query("select t from TMacroIdentinfo t where t.TMacroTablemeta.matmid=?1 and t.TMacroIdent.maitid=?2")
    public List<TMacroIdentinfo> findByMatmidAndMaitid(int matmid, int maitid);

}
