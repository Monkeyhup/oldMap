package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TMacroIdent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface MacroIdentDao extends JpaRepository<TMacroIdent, Integer> {

    @Query("select  t from TMacroIdent t where t.status = 1 order by t.maitid")
    public List<TMacroIdent> findAllIdent();
}
