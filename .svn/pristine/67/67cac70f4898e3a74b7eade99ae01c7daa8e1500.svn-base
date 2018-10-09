package com.supermap.sgis.visual.service;

import com.supermap.sgis.visual.dao.FeedBackDao;
import com.supermap.sgis.visual.entity.TFeedBack;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by jinn on 2016/3/4.
 */
@Service
public class FeedBackService extends BaseService {
    @Autowired
    FeedBackDao feedBackDao;


    public TFeedBack save(TFeedBack entity){
        long time = System.currentTimeMillis();
        entity.setTime(time);
        return  feedBackDao.save(entity);
    }
}

