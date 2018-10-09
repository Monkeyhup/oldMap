package com.supermap.sgis.system;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Formatter;
import java.util.List;
import java.util.Locale;

/**
 * 获取系统的一些信息 
 *
 * @author Linhao
 *
 */
public class SystemUtil {

    /**
     * 获取本机的IP地址
     * @return
     */
    public static String getLocalIP(){
        try{
            InetAddress address = InetAddress.getLocalHost();
            String sIP = address.getHostAddress();
            return sIP;
        }catch(Exception e){
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 获取本机的MAC地址
     * @return
     */
    public static String getLocalMac(){
        return getLocalMac("-");
    }

    /**
     * 获取本机的MAC地址
     * @param split
     * 			mac 地址连接符（默认为‘-’）
     * @return
     */
    public static String getLocalMac(String split){
        try{
            InetAddress address = InetAddress.getLocalHost();
            NetworkInterface ni = NetworkInterface.getByInetAddress(address);

            //ni.getInetAddresses().nextElement().getAddress();  
            byte[] mac = ni.getHardwareAddress();
            String sMAC = "";

            if(split == null){
                split = "-";
            }

            Formatter formatter = new Formatter();
            for (int i = 0; i < mac.length; i++) {
                sMAC = formatter.format(Locale.getDefault(), "%02X%s", mac[i], (i < mac.length - 1) ? split : "").toString();
            }
            return sMAC;
        }catch(Exception e){
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 获取本机的所有mac地址
     *  <p style="color:reb;">
     *      说明：通过命令行的方式获取所有的mac地址
     *  </p>
     * @return
     */
    public static String[] getAllMacAddressByCmd() {
        List<String> macList = new ArrayList<String>();

        String os = System.getProperty("os.name");

        if (os != null && os.startsWith("Windows")) {
            try {
                String command = "cmd.exe /c ipconfig /all";
                Process p = Runtime.getRuntime().exec(command);

                BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));

                String line = null;
                while ((line = br.readLine()) != null) {
//                    System.out.println(line);
                    line = line.trim();
                    if(line.length() == 0){
                        continue;
                    }
                    if (line.indexOf("Physical Address") > -1) {
                        int index = line.indexOf(":") + 2;

                        String mac = line.substring(index);
                        if(mac != null && !"".equals(mac.trim())){
                            macList.add(mac.trim());
                        }
                    }else if(line.indexOf("物理地址") > -1){
                        int index = line.indexOf(":") + 2;
                        String mac = line.substring(index);
                        if(mac != null && !"".equals(mac.trim())){
                            macList.add(mac.trim());
                        }
                    }
                }

                br.close();

            } catch (IOException e) {

            }
        }

        return macList.toArray(new String[0]);
    }

    /**
     * 判断字符串编码
     *
     * @param str
     * @return
     */
    private static String getEncoding(String str) {
        String[] encodes = {"GB2312","ISO-8859-1","UTF-8","GBK"};
        try {
            for(String encode : encodes){
                if (str.equals(new String(str.getBytes(encode), encode))) {
                    return encode;
                }
            }
        } catch (Exception exception) {
        }
        return encodes[0];
    }


//    public static void main(String[] args){
//    	
//    	String mac = getLocalMac();
//    	System.out.println("mac="+mac);
//    	
//    	String md5 = DigitalSignatureFactory.encodeWithMD5OrSHA(DigitalSignatureFactory.ALGORITHM_MD5, "admin123456");
//    	System.out.println("md5="+md5);
//
//    	String sha = DigitalSignatureFactory.encodeWithMD5OrSHA(DigitalSignatureFactory.ALGORITHM_SHA, mac);
//    	System.out.println("sha="+sha);
//
//    	System.out.println("\n");
//    	
//    	String key = "supermap_sgis_01";
//    	String aes = DigitalSignatureFactory.encodeWithKeyByAES(key, mac);
//    	System.out.println("aes="+aes+"--"+aes.length());
//    	
//    	String key1 = "supermap_sgis_01";
//    	String aesDe = DigitalSignatureFactory.decodeWithKeyByAES(key, aes);
//    	System.out.println("aesDe="+aesDe);
//    }

}