package com.supermap.sgis.visual.service;

import com.supermap.sgis.visual.common.tree.DHTMLXTree;
import com.supermap.sgis.visual.common.tree.DHTMLXTreeFactory;
import com.supermap.sgis.visual.dao.MacroIdentDao;
import com.supermap.sgis.visual.entity.TMacroIdent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by zhangjunfeng on 14-4-1.
 */
@Service
public class MacroIdentService extends BaseService {

    @Autowired
    private MacroIdentDao macroIdentDao;

    public List<TMacroIdent> getAll() {
        return  macroIdentDao.findAll();
    }

    public TMacroIdent getOne(int gourpid) {
        return macroIdentDao.getOne(gourpid);
    }

    public TMacroIdent create(TMacroIdent macroIdent) {
        macroIdent.setStatus(1);
        return macroIdentDao.save(macroIdent);
    }

    public boolean one(int gourpid) {
        if (this.getOne(gourpid) != null)
            return true;
        else
            return false;
    }

    public void delete(int gourpid) {
        macroIdentDao.delete(gourpid);
    }

    public TMacroIdent update(int gourpid, TMacroIdent macroIdent) {
        TMacroIdent macroIdent1 = getOne(gourpid);
        if (macroIdent1 != null) {
            macroIdent1 = macroIdent;
            return macroIdentDao.save(macroIdent1);
        }
        return null;
    }

    /**
     * 获取所有分组 并创建树结构
     * @return
     */
    public String createGroupTree(){
        List<TMacroIdent> idents = macroIdentDao.findAllIdent();
        DHTMLXTree root = new DHTMLXTree("root","目录");
        for(TMacroIdent ident :idents){
            DHTMLXTree node = new DHTMLXTree(ident.getMaitid()+"",ident.getName());
            root.add(node);
        }
        return DHTMLXTreeFactory.toTree(root);
    }
}
