package com.supermap.sgis.visual.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactoryBean;
import org.springframework.data.repository.core.RepositoryMetadata;
import org.springframework.data.repository.core.support.RepositoryFactorySupport;

import javax.persistence.EntityManager;
import java.io.Serializable;

/**
 * 此类采用注解的方式注入基本dao的实现
 *
 * @author Created by W.Qiong on 14-3-6.
 */
public class BaseDaoRepositoryFactoryBean<R extends JpaRepository<S, ID>, S, ID extends Serializable>
        extends JpaRepositoryFactoryBean<R, S, ID> {

    /**
     * 创建一个基本的dao工厂
     */
    @Override
    protected RepositoryFactorySupport createRepositoryFactory(
            EntityManager entityManager) {
        return new BaseDaoFactory(entityManager);
    }

    /**
     * DAO工厂基础类
     * @param <S>
     * @param <ID>
     */
    private static class BaseDaoFactory<S, ID extends Serializable> extends
            JpaRepositoryFactory {

        /**
         * 构造方法
         *
         * @param entityManager
         *            实体管理对象
         */
        public BaseDaoFactory(EntityManager entityManager) {
            super(entityManager);
        }

        /**
         * 取得Dao接口类实现类对象
         *
         * @param entityManager
         *            实体管理对象
         */
        @Override
        protected <T, ID extends Serializable> JpaRepository<?, ?> getTargetRepository(
                RepositoryMetadata metadata, EntityManager entityManager) {
            return new BaseDaoImpl<T, ID>((Class) metadata.getDomainType(),
                    entityManager);
        }

        @Override
        protected Class<?> getRepositoryBaseClass(RepositoryMetadata metadata) {
            return BaseDao.class;
        }
    }
}