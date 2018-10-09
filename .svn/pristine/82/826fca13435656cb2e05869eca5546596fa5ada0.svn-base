package com.supermap.sgis.visual.dao;

import com.supermap.sgis.visual.entity.TUsers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 用户Dao
 *
 * Created by chenpeng on 15/11/28.
 */
public interface MacroUserDao extends JpaRepository<TUsers,Integer> {

    /**
     * @Param username
     *        根据username来判断该用户名是否被使用
     */
    @Query("select t from  TUsers t where t.userName=:username")
    TUsers checkExist(@Param("username") String username);

    /**
     * @Param username
     *        根据username来判断该用户名是否存在
     *
     * @Param password
     *        根据password来判断该密码是否正确
     */
    @Query("select t from  TUsers t where t.userName=:username and t.password=:password")
    TUsers checkTure(@Param("username") String username,@Param("password") String password);
}
