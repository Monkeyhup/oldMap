package com.supermap.sgis.visual.service;


import com.supermap.sgis.visual.dao.HotRegionDao;
import com.supermap.sgis.visual.dao.RegionInfoDao;
import com.supermap.sgis.visual.entity.THotword;
import com.supermap.sgis.visual.entity.TRegioninfo;
import com.supermap.sgis.visual.json.Region;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by yangxinyong on 2015/12/2.
 */
@Service
public class HotRegionService {

    @Autowired
    HotRegionDao hotDao;
    @Autowired
    RegionInfoDao regionInfoDao;

    /**
     *更新数据库  地区、处理过的树地区
     * @param area
     */
    public void areaUpdate(String area){

        int hot;
        THotword tHotword = hotDao.getHotareaExit(area);
        if (tHotword == null ){
            tHotword = new THotword();
            //添加
            tHotword.setAreacode(area);
            tHotword.setHot(1);
            hotDao.save(tHotword);
        }else {
            //修改
            hot = tHotword.getHot();
            hot += 1;
            tHotword.setHot(hot);
            hotDao.save(tHotword);
        }
    }

    /**
     * 查询热度先前5的热度地图
     */
    public List<Region> areaQuery() {
        List result = new ArrayList();
        List<Region> regions = new ArrayList<Region>();

        Region region ;

        String sql = "select AREACODE,HOTID,HOT   from   (select   *   from   T_HOTWORD t   order   by   t.\"HOT\"   desc) ";
        result = hotDao.query(sql);
        if (result != null && result.size() > 0) {
            for (Object aResult : result) {
                region = new Region();
                Object[] objs = (Object[]) aResult;
                region.setRegionCode(objs[0].toString());
                List<TRegioninfo> tRegioninfoList = regionInfoDao.findByCode(objs[0].toString());
                for (TRegioninfo aRegion : tRegioninfoList) {
                    region.setRegionName(aRegion.getName());

                    if(regions.size()>5){
                        break;
                    }
                    regions.add(region);
                }
            }
        }

        return regions;

    }
}
