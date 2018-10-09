package com.supermap.sgis.visual.service;

import com.supermap.sgis.visual.dao.TemporaryImportDao;
import com.supermap.sgis.visual.entity.TemporaryImport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by RRP on 2014/7/26.
 * 行政区划匹配坐标导入
 */
@Service
public class TemporaryImportService extends BaseService {
    @Autowired
    TemporaryImportDao temporaryImportDao;

    /**
     * 保存行政区划对象到临时表
     * @param saveObj 对象组
     * */
    @Transactional
    public boolean saveDateToTemTable(List<TemporaryImport> saveObj){
        //long time = new Date().getTime();
        try {
            temporaryImportDao.deleteAll();//每次先删除会话缓冲
        }catch (Exception e){
            try {
                //正在使用临时表的进程
                String sessionSql = "select a.sid, c.serial#, c.username, a.type, a.lmode\n" +
                        "  from v$lock a, dba_objects b, v$session c\n" +
                        " where a.id1 = b.object_id \n" +
                        "   and a.type = 'TO' \n" +
                        "   and b.object_name = 'TEMPORARY_IMPORT'\n" +
                        "   and a.sid = c.sid" ;
                List<Object[]> sessions = temporaryImportDao.query(sessionSql);
                //杀死进程
                for(Object[] o : sessions){
                    String s = o[0]+","+o[1] ;
                    temporaryImportDao.executeBySql(" ALTER system kill session '"+s+"'") ;
                }
                //尝试添加id字段 修改主键 创建索引
                temporaryImportDao.executeBySql("alter table temporary_import add id varchar2(36)");
                temporaryImportDao.executeBySql("alter table TEMPORARY_IMPORT add constraint PK_T_TEMP_IMPORT primary key(ID)") ;
                temporaryImportDao.executeBySql("create  index TEMPORARY_IMPORT_CODE on TEMPORARY_IMPORT(REGIONCODE)") ;
                deleteAll();//重删除会话缓冲
            }catch (Exception e1){
                System.out.println("删除临时表失败");
            }
        }
        int length = 0;
        try {
//              length  = temporaryImportDao.save(saveObj).size() ;
            int len = saveObj.size();
            int limit = 1000;
            if(len<limit){
                limit = len;
            }
            length = temporaryImportDao.batchInsert(saveObj, limit).size();//批量提交（每次1000）
        }catch (Exception e){
            System.out.println("保存临时表数据异常");
            e.printStackTrace();
        }
        if(length>0){
            System.out.println("保存临时表失败数："+length);
            return false;
        }
        //System.out.println("保存临时数："+saveObj.size()+"用时："+(new Date().getTime()-time));
        return true;
    }

    /**
     * 清空临时表
     * */
    @Transactional
    public void deleteAll(){
        temporaryImportDao.deleteAll();//每次先清空临时表
    }

    /**
     * 查询临时表全部数据
     * */
    public List<TemporaryImport> findAll(){
        return temporaryImportDao.findAll();
    }

    /**
     * 查询临时表数据行数
     * */
    public int rows(){
        return temporaryImportDao.findAll().size();
    }
}