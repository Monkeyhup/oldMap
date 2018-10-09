package com.supermap.sgis.visual.service;

import com.supermap.sgis.visual.dao.*;
import com.supermap.sgis.visual.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by duanxiaofei on 2014/9/5.
 */
@Service
public class MacroIdentInfoService extends BaseService{
    @Autowired
    private MacroIdentInfoDao macroIdenInfoDao;
    @Autowired
    private MacroIdenmetaDao macroIdenmetaDao;
    @Autowired
    private MacroTablemetaDao macroTablemetaDao;
    @Autowired
    private MacroIdentDao macroIdentDao ;
    @Autowired
    private MacroIdenvlDao macroIdenvlDao ;
    @Autowired
    private MacroTableinfoDao macroTableinfoDao;

    public List<TMacroIdentinfo> getByMatmid(int matmid) {
        return macroIdenInfoDao.findByMatmid(matmid);
    }

    public boolean delByMatmid(List<Integer> maiiids){
        boolean re=true;
        List<TMacroIdentinfo> entitis=new ArrayList();
        for(Integer maiiid:maiiids){
            TMacroIdentinfo info=new TMacroIdentinfo();
            info.setMaiiid(maiiid);
            entitis.add(info);
        }
        try {
            macroIdenInfoDao.deleteInBatch(entitis);
        }catch(Exception e) {
            re = false;
        }
        return re;
    }

    /**
     * 设置指标分组 多维分组！
     * @param matmid 指标id
     * @param maitid 枚举分组id
     * @return
     */
    public boolean setEnum(int matmid,int maitid){
        List<TMacroIdentinfo> identinfos = this.macroIdenInfoDao.findByMatmidAndMaitid(matmid,maitid);
        if(null!=identinfos&&identinfos.size()>0){
            //删除原来的设置 主要考虑枚举值修改 二次设置的情况
            delIdenmetaEnum(matmid,maitid);
            boolean re = createIdenmeta(maitid, matmid);
            return  re;
        }
        TMacroIdent ident = this.macroIdentDao.findOne(maitid);
        TMacroTablemeta tablemeta = this.macroTablemetaDao.findOne(matmid);
        if(null==ident||null==tablemeta){
            return  false ;
        }
        TMacroIdentinfo identinfo = new TMacroIdentinfo();
        identinfo.setTMacroTablemeta(tablemeta);
        identinfo.setTMacroIdent(ident);
        identinfo.setName(ident.getName());
        if(null!=this.macroIdenInfoDao.save(identinfo)){
            boolean re =  createIdenmeta(maitid,matmid);
            return  re ;
        }
        return  false;
    }

    public  boolean createIdenmeta(int maitid,int matmid){
        List<TMacroIdenmeta> idenmetas = this.macroIdenmetaDao.findByTablemeta(matmid);
        if(null == idenmetas||idenmetas.size() ==0){
            return  false ;
        }
        TMacroIdenmeta idenmeta = idenmetas.get(0);
        List<TMacroIdenvl> idenvls = macroIdenvlDao.findByGourp(maitid);
        if(null==idenvls){
            return  false ;
        }
        for(TMacroIdenvl idenvl :idenvls){
            TMacroIdenmeta one = new TMacroIdenmeta();
            String idenName = idenmeta.getIdenName()+"_"+idenvl.getName()+"_"+idenmeta.getIdenUnit();
            TMacroTablemeta tablemeta = new TMacroTablemeta();
            tablemeta.setMatmid(matmid);
            one.setTMacroTablemeta(tablemeta);
            one.setTMacroIdenvl(idenvl);
            one.setIdenName(idenName);
            one.setIdenCode(generateCode());
            one.setIdenLength(idenmeta.getIdenLength());
            one.setIdenType(idenmeta.getIdenType());
            one.setIdenUnit(idenmeta.getIdenUnit());
            one.setIdenPrecision(idenmeta.getIdenPrecision());
            one.setMemo(idenName);
            this.macroIdenmetaDao.save(one);
        }
        return  true ;

    }

    public boolean deleteEnum(int matmid,int maitid){
        //分组
        List<TMacroIdentinfo> identinfos = this.macroIdenInfoDao.findByMatmidAndMaitid(matmid,maitid);

        List<TMacroIdenmeta> idenmetas = this.macroIdenmetaDao.findByEnum(matmid,maitid);
        String[] idenCodes = new String[idenmetas.size()];
        for(int i=0; i< idenmetas.size();i++){
            idenCodes[i] = idenmetas.get(i).getIdenCode();
        }
        List<TMacroTableinfo> tableinfos = new ArrayList<>();
        if(idenCodes.length>0){
            tableinfos =  this.macroTableinfoDao.findByIdenCode(idenCodes);
        }

        //如果已经导入过数据 不允许删除
        if(null!=tableinfos&&tableinfos.size()>0){
            return  false;
        }
        //删除分组指标元数据信息
        if(idenmetas!=null){
            macroIdenmetaDao.deleteInBatch(idenmetas);
        }
        //删除分组
        if(null!=identinfos&&identinfos.size()>0){
            macroIdenInfoDao.deleteInBatch(identinfos);
        }
        return  true ;
    }

    private boolean delIdenmetaEnum(int matmid,int maitid){
        List<TMacroIdenmeta> idenmetas = this.macroIdenmetaDao.findByEnum(matmid,maitid);
        if(idenmetas!=null){
             macroIdenmetaDao.deleteInBatch(idenmetas);
            return true;
        }
        return  false ;
    }

    private String generateCode() {

        String re = "B000000001";
        String maxCode0 = macroTablemetaDao.findMaxCode();
        String maxCode1 = macroIdenmetaDao.findMaxCode();
        if(maxCode0==null&&maxCode1 ==null){
            re = "B000000001" ;
        }else{
            maxCode0 = null !=maxCode0?maxCode0:"B000000001";
            maxCode1 = null !=maxCode1?maxCode1:"B000000001";
            re = maxCode0 ;
            if(Integer.parseInt(maxCode1.substring(1))>Integer.parseInt(re.substring(1))){
                re = maxCode1 ;
            }
        }
        int number = Integer.parseInt(re.substring(1));
        return "B" + String.format("%09d", number + 1);
    }

}
