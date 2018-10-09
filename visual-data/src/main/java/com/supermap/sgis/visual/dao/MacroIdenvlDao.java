package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TMacroIdenvl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MacroIdenvlDao extends JpaRepository<TMacroIdenvl, Integer> {
    @Query("select t from TMacroIdenvl t where t.TMacroIdent.maitid=:maitid order by t.maivid")
    List<TMacroIdenvl> findByGourp(@Param("maitid") int gourpid);

    @Query("select t from TMacroIdenvl t where t.TMacroIdent.maitid=:maitid and t.maivid=:maivid")
    TMacroIdenvl findByGourpAndEnum(@Param("maitid") int gourpid, @Param("maivid") int enumid);

    @Query("select t from TMacroIdenvl t where t.TMacroIdent.maitid=:maitid and t.parid=:parid")
    List<TMacroIdenvl> findByParidAndMaitid(@Param("parid") String parid, @Param("maitid") int maitid);


    @Query("select t from TMacroIdenvl t where t.TMacroIdent.maitid=:maitid and t.code=:code")
    List<TMacroIdenvl> findByCodeAndMaitid(@Param("code") String code, @Param("maitid") int maitid);

}
