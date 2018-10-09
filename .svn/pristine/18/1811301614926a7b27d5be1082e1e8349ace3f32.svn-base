package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.data.PageInfo;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 基础Dao接口类实现类
 *
 * @author Created by W.Qiong on 14-3-6.
 */
public class BaseDaoImpl<T, ID extends Serializable> extends  SimpleJpaRepository<T, ID> implements BaseDao<T, ID> {

    /** 实体管理 */
    private EntityManager entityManager;

    /**
     * 构造函数，初始化实体管理
     *
     * @param domainClass
     *            当前域类
     * @param em
     *            实体管理
     */
    public BaseDaoImpl(Class<T> domainClass, EntityManager em) {
        super(domainClass, em);
        this.entityManager = em;
    }

    /**
     * 根据语句执行包括更新和创建 删除等操作
     *
     * @param sql
     *            sql语句
     * @param args
     *            参数（？号对应的值）
     * @return 受影响的行数
     */
    public int executeBySql(String sql, Object... args) {
        Query query = entityManager.createNativeQuery(sql);
        int re = 0;
        for (int index = 1, size = args.length; index <= size; index++) {
            query.setParameter(index, args[index - 1]);
        }
        re = query.executeUpdate();
        return re;
    }

    /**
     * 获取总条目数
     *
     * @param hql
     *            hql语句
     * @return 总条目数
     */
    public int findCountByHql(String hql, Object... args) {
        Query query = entityManager.createQuery("select count(*) " + hql);
        int retVal = 0;
        for (int index = 1, size = args.length; index <= size; index++) {
            query.setParameter(index, args[index - 1]);
        }
        Object obj = query.getSingleResult();
        retVal = Integer.parseInt(String.valueOf(obj).trim());
        return retVal;
    }

    /**
     * 事务提交
     */
    public void commit() {
        entityManager.getTransaction().commit();
    }

    /**
     * 开始事务
     */
    public void beginTransaction() {
        entityManager.getTransaction().begin();
    }

    /**
     * 批量插入
     *
     * @param list
     *            插入列表
     * @param batchSize
     *            批量插入大小
     * @return 插入失败的列表
     */
    public List<T> batchInsert(List<T> list, int batchSize) {
        List<T> error = new ArrayList<T>();
        int i = 0;
        for (T t : list) {
            try {
                entityManager.persist(t);
            } catch (Exception ex) {
                error.add(t);
            }
            if (i % batchSize == 0) {
                entityManager.flush();
                entityManager.clear();
            }
            i++;
        }
        return error;
    }

    /**
     * 批量更新
     *
     * @param list
     *            更新列表
     * @param batchSize
     *            批量插入大小
     * @return 更新失败的列表
     */
    public List<T> batchUpdate(List<T> list, int batchSize) {
        List<T> error = new ArrayList<T>();
        int i = 0;
        for (T t : list) {
            try {
                entityManager.merge(t);
            } catch (Exception ex) {
                error.add(t);
            }
            if (i % batchSize == 0) {
                entityManager.flush();
                entityManager.clear();
            }
            i++;
        }
        return error;
    }

    /**
     * 纯sql批量执行
     *
     * @param sqlList
     *            插入sql列表
     * @param batchSize
     *            批量插入大小
     * @return 执行结果（key={success,error}）
     */
    public Map batchSqlExecute(List<String> sqlList, int batchSize) {
        int re = 0;
        Map<String, Object> reMap = new HashMap<String,Object>();
        List<Integer> errorList = new ArrayList<Integer>();
        int size = sqlList.size();
        for (int i = 0; i < size; i++) {
            String sql = sqlList.get(i);
            try {
                Query query = entityManager.createNativeQuery(sql);
                int n = query.executeUpdate();
                re += n > 0 ? n : 0;
                if (i % batchSize == 0) {
                    entityManager.flush();
                    entityManager.clear();
                }
            } catch (Exception e) {
                errorList.add(i + 1);
                System.out.println(sql);
            }
        }
        reMap.put("success", re); // 导入成功总数
        reMap.put("error", errorList); // 错误记录
        return reMap;
    }

    /**
     * 查询数据(查询实体表)
     *
     * @param sql
     *            sql语句
     * @param args
     *            参数（？号对应的值）
     * @return 查询结果列表
     */
    public List query(String sql, Object... args) {
        Query query = entityManager.createNativeQuery(sql);
        for (int index=1,size=args.length; index<=size; index++) {
            query.setParameter(index, args[index - 1]);
        }
        return query.getResultList();
    }

    /**
     * 分页查询
     *
     * @param sql
     *            sql语句
     * @param pageInfo
     *            分页对象
     * @param args
     *            参数（？号对应的值）
     * @return
     */
    public List queryByPage(String sql, PageInfo pageInfo, Object... args) {
        Query query = entityManager.createNativeQuery(sql);
        for (int index = 1, size = args.length; index <= size; index++) {
            query.setParameter(index, args[index - 1]); // SQL条件参数
        }
        query.setFirstResult((pageInfo.getPageNumber() - 1)
                * pageInfo.getPageSize());              // 从0开始
        query.setMaxResults(pageInfo.getPageSize());    // 返回最大条数
        List re = new ArrayList();
        try {
            re = query.getResultList();                 // 执行
        } catch (Exception e) {
            e.printStackTrace();
        }
        return re;
    }

    /**
     * 获取实体表字段
     *
     * @param tableName
     *            数据库表名
     * @return 字段数组
     */
    public String[] getTableFields(String tableName) {
        String sql = "select t.COLUMN_NAME  from   user_tab_columns t "
                + "where  table_name =upper('" + tableName + "')"
                + " order by t.COLUMN_ID";
        Query query = entityManager.createNativeQuery(sql);
        List fieldList = query.getResultList();
        String[] fields = new String[fieldList.size()];
        for (int i = 0, size = fieldList.size(); i < size; i++) {
            fields[i] = fieldList.get(i).toString();
        }
        return fields;
    }

    /**
     * 原生sql查询出总记录数
     *
     * @param sql
     *            sql语句(不需要"select count(*) ")
     * @param args
     *            参数（？号对应的值）
     * @return 总记录数
     */
    public int findCountBySql(String sql, Object... args) {
        sql = "select count(*) " + sql;
        Query query = null;
        try {
            query = entityManager.createNativeQuery(sql);
        } catch (Exception e) {
            e.printStackTrace();
        }
        int retVal = 0;
        for (int index = 1, size = args.length; index <= size; index++) {
            query.setParameter(index, args[index - 1]);
        }
        Object obj = query.getSingleResult();
        retVal = Integer.parseInt(String.valueOf(obj).trim());
        return retVal;
    }

    /**
     * 原生sql 获取唯一数值型结果 包括count max等
     *
     * @param sql
     *            sql语句
     * @param args
     *            参数（？号对应的值）
     * @return 数值结果
     */
    public int findIntResult(String sql, Object... args) {
        Query query = entityManager.createNativeQuery(sql);
        int retVal = 0;
        for (int index = 1, size = args.length; index <= size; index++) {
            query.setParameter(index, args[index - 1]);
        }
        Object obj = query.getSingleResult();
        if (null == obj) {
            return retVal;
        }
        retVal = Integer.parseInt(String.valueOf(obj).trim());
        return retVal;
    }

    /**
     * ?参数查询实体表数据（支持自定义语句）
     *
     * @param sql
     *            sql语句
     * @param args
     *            参数（？号对应的值）
     * @return 查询结果列表
     */
    public List<T> queryEntity(String sql, Class<?> clazz, Object... args) {
        Query query = entityManager.createQuery(sql, clazz);
        for (int index = 1, size = args.length; index <= size; index++) {
            query.setParameter(index, args[index - 1]);
        }
        return query.getResultList();
    }


}