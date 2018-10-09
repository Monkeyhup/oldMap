package com.supermap.sgis.system;

import javax.servlet.ServletContext;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * 系统授权管理
 *
 * @author Linhao
 *
 */
public class AuthManager {
    /**密钥*/
    private static final String SECRET_KEY = "supermap_sgis_01";
    /**授权配置文件*/
    private static final String AUTH_CONFIG = "SUPERMAP_SGIS_DIGITAL_SIGNATURE.sgis";
    /**许可文件开始字符串*/
    private static final String CONFIG_START = "digitalSignature=";

    /**唯一授权管理器*/
    public static AuthManager authManager = null;

    /**是否已经授权**/
    private boolean isHasAuth = false;

    /**上下文接口*/
    private ServletContext context;

    /**授权码*/
    private String authCode;

    /**
     * 初始化授权管理器
     *
     * @return
     */
    public static AuthManager getInstance(ServletContext context){
        if(authManager == null){
            authManager = new AuthManager(context);
        }

        return authManager;
    }

    /**
     * 私有构造方法
     */
    private AuthManager(){
    }

    /**
     * 私有构造方法
     *
     * @param context
     */
    private AuthManager(ServletContext context){
        setContext(context);
        setAuthCode(null);
        setIsHasAuth(false);

        //设置授权码
        String authCode = getAuthCodeFromConfig();
        setAuthCode(authCode);
    }

    /**
     * 获取授权码
     *
     * @return
     */
    private String getAuthCodeFromConfig(){
        InputStream is = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream(AUTH_CONFIG);

        if(is == null){
            //未找到配置文件
            exitSystem("未找到指定的系统许可文件，系统即将退出！");
            return null;
        }

        BufferedReader br = null;
        String line = null;
        try {
            br = new BufferedReader(new InputStreamReader(is));

            while((line = br.readLine()) != null){
                line = line.trim();
                break;
            }
        } catch (IOException e) {
            e.printStackTrace();
            //未找到配置文件
            exitSystem("指定的系统许可非法，系统即将退出！");
            return null;
        }

        if(line == null || "".equals(line)){
            //未找到配置文件
            exitSystem("指定的系统许可非法，系统即将退出！");
            return null;
        }

        if(!line.startsWith(CONFIG_START)){
            //未找到配置文件
            exitSystem("指定的系统许可非法，系统即将退出！");
            return null;
        }

        String authCode = line.substring(CONFIG_START.length(),line.length());
        if(authCode == null || "".equals(authCode)){
            //未找到配置文件
            exitSystem("指定的系统许可非法，系统即将退出！");
            return null;
        }

        //保存许可
        setAuthCode(authCode);
        return getAuthCode();
    }

    /**
     * 授权校验
     *
     * @return
     */
    public boolean authValidate(){
        //已经验证通过
        if(isHasAuth()){
            return true;
        }

        String authCode = getAuthCode();

        /////////////////////////////,用第一种cmd方式获取mac/////////////////////////////////
        //获取所有的本机的所有mac地址，匹配其中一个即可
        String[] macs = SystemUtil.getAllMacAddressByCmd();
        if(macs != null && macs.length > 0){
            //解码授权码
            String aesMac = DigitalSignatureFactory.decodeWithKeyByAES(SECRET_KEY,authCode);
            if(aesMac != null){
                for (String m : macs){
                    if(m == null || aesMac.equals(m)){
                        setIsHasAuth(true);
                        printSystemMsg("【数据地图】系统已成功授权！");
                        return true;
                    }
                }
            }//end if(aesMac != null)
        }//end if(macs != null && macs.length > 0)

        ///////////////////////////cmd 无法获取mac,用第二种方式获取///////////////////////////////

        //获取本机mac
        String mac = SystemUtil.getLocalMac();
        if(mac == null || mac.isEmpty()){
            setIsHasAuth(false);
            exitSystem("无法获取本机的Mac地址，程序即将推出！");
            return false;
        }

        //开始生成签名
        String aes = DigitalSignatureFactory.encodeWithKeyByAES(SECRET_KEY, mac);
        if(aes == null || aes.isEmpty()){
            setIsHasAuth(false);
            exitSystem("无法获取本机的许可验证，程序即将推出！");
            return false;
        }

        //验证通过
        if(authCode.equals(aes)){
            setIsHasAuth(true);
            printSystemMsg("【图库/图集】系统已成功授权！");
            return true;
        }else{
            setIsHasAuth(false);
            exitSystem("系统的许可证校验失败，请联系管理员，程序即将推出！");
            return false;
        }
    }


    /**
     * 退出系统
     *
     * @param msg
     */
    private void exitSystem(String msg){
        if(msg == null || "".equals(msg)){
            msg = "系统未正确授权，请联系管理员，系统即将退出！";
        }

        ServletContext context = getContext();
        if(context != null){
            StringBuilder sb = new StringBuilder();
            sb.append("\n\n");
            sb.append("****************************************************");
            sb.append("\n");
            sb.append(msg);
            sb.append("\n");
            sb.append("****************************************************");
            context.log(sb.toString());
        }
        System.out.println("\n");
        System.out.println("****************************************************");
        System.out.println("系统错误："+msg);
        System.out.println("****************************************************");
        System.out.println("\n");

        //(5秒后)停止java 虚拟器
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        if(context != null){
            StringBuilder sb = new StringBuilder();
            sb.append("\n");
            sb.append("****************************************************");
            sb.append("\n");
            sb.append("系统服务退出！");
            sb.append("\n");
            sb.append("****************************************************");
            context.log(sb.toString());
        }
        System.out.println("");
        System.out.println("****************************************************");
        System.out.println("系统错误：系统服务退出！");
        System.out.println("****************************************************");
        System.out.println("\n");
        System.exit(0);
    }

    /**
     * 打印系统信息
     *
     * @param msg
     */
    public void printSystemMsg(String msg){
        if(msg == null || "".equals(msg)){
            msg = "系统消息！";
        }

        ServletContext context = getContext();
        if(context != null){
            StringBuilder sb = new StringBuilder();
            sb.append("\n");
            sb.append("*************************************");
            sb.append("\n");
            sb.append(msg);
            sb.append("\n");
            sb.append("*************************************");
            context.log(sb.toString());
        }
        System.out.println("");
        System.out.println("*************************************");
        System.out.println("系统消息:"+msg);
        System.out.println("*************************************");
        System.out.println("");
    }


    /**
     * 设置授权码
     *
     * @return
     */
    public String getAuthCode() {
        return authCode;
    }

    /**
     * 取得授权码
     *
     * @param authCode
     */
    private void setAuthCode(String authCode) {
        this.authCode = authCode;
    }

    /**
     * 取得上下文
     * @return
     */
    private ServletContext getContext() {
        return context;
    }

    /**
     * 设置上下文
     *
     * @param context
     */
    private void setContext(ServletContext context) {
        this.context = context;
    }

    /**
     * 判断是否已经授权
     *
     * @return
     */
    private boolean isHasAuth(){
        return isHasAuth;
    }

    /**
     * 设置是否授权
     * @param isHasAuth
     */
    private void setIsHasAuth(boolean isHasAuth){
        this.isHasAuth = isHasAuth;
    }
}
