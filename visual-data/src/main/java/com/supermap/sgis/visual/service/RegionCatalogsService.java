package com.supermap.sgis.visual.service;

import com.supermap.sgis.visual.dao.RegionCatalogsDao;
import com.supermap.sgis.visual.data.CStatus;
import com.supermap.sgis.visual.entity.TRegioncatalog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 行政区划类型server
 *
 * @author Created by Administrator on 14-3-3.
 */
@Service
public class RegionCatalogsService extends BaseService {
    /**行政区划类型 dao*/
    @Autowired
    RegionCatalogsDao regionCatalogsDao;

    /**
     * 添加地图分类（按照年份添加）
     *
     * @param regioncatalog
     * 				要创建的地图记录
     * @return	创建状态结果,true代表成功，否则失败
     */
    public boolean add(TRegioncatalog regioncatalog) {
        if (regionCatalogsDao.save(regioncatalog) != null) {
            return true;
        } else
            return false;
    }

    /**
     * 删除地图分类（软删除，将状态设置为CStatus.DISABLED=0）
     *
     * @param id
     * 		指定要删除的地图catalogid
     *
     * @return 删除状态结果,true代表成功，否则失败
     */
    public boolean delete(int id) {
        boolean re = true;
        TRegioncatalog regioncatalog = null;
        try {
            if ((regioncatalog = regionCatalogsDao.getOne(id)) != null) {
                //硬删除
                //regionCatalogsDao.delete(id);

                //软删除
                regioncatalog.setStatus(CStatus.DISABLED);
                regionCatalogsDao.save(regioncatalog);
            }
        } catch (Exception e) {
            re = false;
        }
        return re;
    }

    /**
     * 更新地图分类
     *
     * @param id
     * 			指定要更新的地图记录
     * @param regioncatalog
     * 			更新后信息
     *
     * @return 更新状态结果,true代表成功，否则失败
     */
    public boolean update(int id, TRegioncatalog regioncatalog) {
        if (regionCatalogsDao.getOne(id) != null) {
            regioncatalog.setRcid(id);
            if (regionCatalogsDao.save(regioncatalog) != null) {
                return true;
            } else return false;
        } else
            return false;
    }

    /**
     * 获取指定id下的行政区划类型
     *
     * @param id
     * 			行政区划类型
     * @return	若不为null代表获取成功，否则为获取到
     */
    public TRegioncatalog get(int id) {
        return regionCatalogsDao.getOne(id);
    }

    /**
     * 分页查询所有的数据
     *
     * @param pageRequest
     * 			分页请求
     * @return
     */
    public Page<TRegioncatalog> getAll(PageRequest pageRequest) {
        return regionCatalogsDao.findAll(pageRequest);
    }

    /**
     * 获取有效状态（CStatus.READY）下的所有行政区划类型列表
     *
     * @return	行政区划类型列表
     */
    public List<TRegioncatalog> getValidCatalog() {
        try {
            return regionCatalogsDao.getValidCatalog();
        }catch (Exception e){
            System.out.println("获取有效区划树目录失败，可能表字段出错");
            e.printStackTrace();
        }
        return null ;
    }

    /**
     * 获取所有行政区划类型列表(不限制状态)
     *
     * @return 行政区划类型列表
     */
    public List<TRegioncatalog> getAll() {
        return regionCatalogsDao.findAll();
    }
}
