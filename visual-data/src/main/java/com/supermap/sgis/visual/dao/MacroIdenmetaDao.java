package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TMacroIdenmeta;
import com.supermap.sgis.visual.entity.TMacroTablemeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface MacroIdenmetaDao extends JpaRepository<TMacroIdenmeta, Integer> {

    @Query("select max(t.idenCode) from TMacroIdenmeta t where t.idenCode like 'B%'")
    public String findMaxCode();

    @Query("select t from TMacroIdenmeta t where t.TMacroTablemeta.matmid=?1 and t.TMacroIdenvl.maivid is null")
    public List<TMacroIdenmeta> findByTablemeta(int matmid);

    @Query("select t from TMacroIdenmeta t where t.TMacroTablemeta.matmid=?1 and t.TMacroIdenvl.TMacroIdent.maitid=?2 order by t.maimid")
    public List<TMacroIdenmeta> findByEnum(int matmid, int maitid);

    //查询指标的枚举型子指标
    @Query("select t from TMacroIdenmeta t where t.TMacroTablemeta.matmid=?1 and t.TMacroIdenvl.maivid is not null order by t.maimid")
    public List<TMacroIdenmeta> findGroupInd(int matmid);

    //查询指标下一级枚举型子指标
    @Query("select t from TMacroIdenmeta t where t.TMacroTablemeta.matmid=?1 and t.TMacroIdenvl.parid=?2 and t.TMacroIdenvl.maivid is not null order by t.maimid")
    public List<TMacroIdenmeta> findGroupIndByParid(int matmid, String parid);

    @Query("select t from TMacroIdenmeta t where t.TMacroTablemeta.matmid=?1  and t.TMacroIdenvl.TMacroIdent.maitid=?2 and t.TMacroIdenvl.parid=?3 and t.TMacroIdenvl.maivid is not null order by t.maimid ")
    public List<TMacroIdenmeta> findGroupIndByParidAndMaitid(int matmid, int maitid, String parid);

    //根据指标code，查询指标元数据
    @Query("select distinct t.TMacroTablemeta from TMacroIdenmeta t where t.idenCode in ?1 and t.TMacroTablemeta.matmid in ?2")
    public List<TMacroTablemeta> findTablemetaByCode(String[] idenCode, int[] matmids);
}
