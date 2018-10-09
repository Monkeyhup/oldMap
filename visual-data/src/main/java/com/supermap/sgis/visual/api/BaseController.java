package com.supermap.sgis.visual.api;

import com.supermap.sgis.system.AuthManager;
import com.supermap.sgis.visual.data.OpStatus;
import com.supermap.sgis.visual.data.PageInfo;
import com.supermap.sgis.visual.entity.TUsers;
import com.supermap.sgis.visual.tool.AppConfig;
import org.springframework.data.domain.PageRequest;
import org.springframework.util.Assert;

import javax.servlet.http.HttpServletRequest;


/**
 * Controller基础类
 * <p>
 * 说明：此类存在公共的处理request/session/upload/OpStatus/等方法，<br/>
 * 继承此类的Controller都拥有这些方法
 * </p>
 *
 * @author Created by W.Hao on 14-2-11.
 *
 */
public class BaseController {

    public BaseController() {
//        AuthManager authManager = AuthManager.getInstance(null);
//        authManager.authValidate();
    }

    /** SGIS4.0上传文件本地磁盘上传统一路径 */
    public static String uploadFilePath = AppConfig.Config.get("uploadFilePath");
    public final String CURRENT_USER = "current_user";
     static {//静态代码块  JVM加载类时会执行这些静态的代码块

        uploadFilePath = AppConfig.Config.get("uploadFilePath"); //从配置文件获取

     }

    /**
     * session中获取当前登录的用户
     *
     * @return 当前请求的用户信息，未登录，则返回null
     */
    public TUsers getSessionUser(HttpServletRequest request) {
        return (TUsers) request.getSession().getAttribute(CURRENT_USER);
    }

    /**
     * 保存当前用户到session
     */
    public void setSessionUser(HttpServletRequest request, TUsers user) {
        request.getSession().setAttribute(CURRENT_USER, user);
    }

    /**
     * 删除session里的用户信息
     *
     */
    public void removeSessionUser(HttpServletRequest request) {
        request.getSession().removeAttribute(CURRENT_USER);
    }



    /**
     * 获取一个URL的绝对路径
     *
     * @param request
     *            http 请求
     * @param url
     *            url的子路径
     * @return URL的绝对路径
     */
    public final String getAbsoluteUrl(HttpServletRequest request, String url) {
        Assert.hasLength(url, "url不能为空");
        Assert.isTrue(url.startsWith("/"), "必须以/开头");
        return request.getContextPath() + url;
    }

    /**
     * 取得上传的文件的保存路劲
     *
     * @return 文件的保存路劲
     */
    public final String getUploadPath() {
        return uploadFilePath;
    }

    /**
     * 二元状态返回
     *
     * @param status
     *            true or false
     * @return 操作状态结果
     */
    public OpStatus getOpStatus(boolean status) {
        return status ? ok() : fail();
    }

    /**
     * 取得操作成功状态结果
     *
     * @return 操作成功状态结果
     */
    public OpStatus ok() {
        return new OpStatus();
    }

    /**
     * 取得操操作失败结果
     *
     * @return
     */
    public OpStatus fail() {
        return new OpStatus(false, "操作失败", null);
    }

    /**
     * 组装分页和排序
     *
     * @param page
     *            分页信息
     * @return 分页请求对象
     */
    public PageRequest getPageRequest(PageInfo page) {
        if (page == null) {
            page = new PageInfo();
        }
        return new PageRequest(page.getPageNumber(), page.getPageSize());
    }



    /**
     * 取得登录用户的id
     *
     * @param request
     *            http 请求
     * @return -1 代表获取失败
     */
    protected int getLoginUserId(HttpServletRequest request) {
        TUsers tUsers = getSessionUser(request);
        if (tUsers != null) {
            return tUsers.getUserid();
        }
        return -1;
    }

    /**
     * 取得当前用户的sessionid
     *
     * @param request
     *            http 请求
     * @return sessionid
     */
    protected String getSessionId(HttpServletRequest request) {

        return request.getSession().getId();
    }

    /**
     * 从session中获取当前用户所属的行政区划
     *
     * @param request
     *            http 请求
     * @return 当前用户行政区划编码，未登录，则返回""
     */
    public String getUserRegionCode(HttpServletRequest request) {
        TUsers user = getSessionUser(request);
        // 没有获取到用户信息
        if (null == user) {
            return "";
        }
        String region = user.getUserRegion();
        if (null == region || region.equals("")) {
            return "";
        }
        String code = region.split("@")[1];
        return code;
    }
}
