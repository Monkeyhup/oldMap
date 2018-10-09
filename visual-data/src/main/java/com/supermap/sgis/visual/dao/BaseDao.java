package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.data.PageInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Created by jinn on 2015/6/24.
 */
@NoRepositoryBean
public interface BaseDao<T,ID extends Serializable> extends JpaRepository<T,ID> {

    /**
     * 根据语句执行包括更新和创建 删除等操作
     *
     * @param sql
     *            原生sql
     * @param args
     *            参数（？号对应的值）
     * @return 受影响的行数
     */
     int executeBySql(String sql, Object... args);

    /**
     * 获取总条目数
     *
     * @param hql
     *            hql语句
     * @return 总条目数
     */
     int findCountByHql(String hql, Object... args);

    /**
     * 事务提交
     */
     void commit();

    /**
     * 开始事务
     */
     void beginTransaction();

    /**
     * 批量插入
     *
     * @param list
     *            插入列表
     * @param batchSize
     *            批量插入大小
     */
     List<T> batchInsert(List<T> list, int batchSize);

    /**
     * 纯sql批量执行
     *
     * @param sqlList
     *            插入sql列表
     * @param batchSize
     *            批量插入大小
     * @return 结果
     */
     Map<String, Object> batchSqlExecute(List<String> sqlList,
                                         int batchSize);

    /**
     * 批量更新
     *
     * @param list
     *            更新列表
     * @param batchSize
     *            批量插入大小
     */
     List<T> batchUpdate(List<T> list, int batchSize);

    /**
     * 查询数据
     *
     * @param sql
     *            sql语句
     * @param args
     *            参数（？号对应的值）
     * @return 查询结果列表
     */
     List query(String sql, Object... args);

    /**
     * 获取实体表字段
     *
     * @param tableName
     *            数据库表名
     * @return 字段数组
     */
     String[] getTableFields(String tableName);

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
     List queryByPage(String sql, PageInfo pageInfo, Object... args);

    /**
     * 原生sql查询出总记录数
     *
     * @param sql
     *            sql语句
     * @param args
     *            参数（？号对应的值）
     * @return 总记录数
     */
     int findCountBySql(String sql, Object... args);

    /**
     * 原生sql 获取唯一数值型结果 包括count max等
     *
     * @param sql
     *            sql语句
     * @param args
     *            参数（？号对应的值）
     * @return 数值结果
     */
     int findIntResult(String sql, Object... args);

    /**
     * 支持自定义语句
     *
     * @param sql
     *            sql语句
     * @param args
     *            参数（？号对应的值）
     * @return 查询结果列表
     */
     List<T> queryEntity(String sql, Class<?> clazz, Object... args);



}
