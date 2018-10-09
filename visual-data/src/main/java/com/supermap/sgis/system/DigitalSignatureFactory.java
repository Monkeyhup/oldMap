package com.supermap.sgis.system;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;


/**
 * 数字签名,加密解密操作类
 *
 * @author Linhao - 2014-01-20
 * @version 1.0
 */
public class DigitalSignatureFactory {
    /**
     * HmacSHA1签名算法
     */
    public static final String ALGORITHM_HMACSHA1 = "HmacSHA1";

    /**
     * AES算法
     */
    public static final String ALGORITHM_AES = "AES";

    /**
     * SHA算法
     */
    public static final String ALGORITHM_SHA = "SHA";

    /**
     * MD5算法
     */
    public static final String ALGORITHM_MD5 = "MD5";

    /**
     * 字符集编码（utf-8）
     */
    public static final String CHARSET_UTF8 = "UTF-8";

    /**
     * AES方式有密钥加密数据
     *
     * @param key
     *            密钥
     * @param msg
     *            带加密的明文
     * @return AES方式加密后的密文
     */
    public static String encodeWithKeyByAES(String key, String msg) {
        if (key == null || key.isEmpty() || msg == null || msg.isEmpty())
            return null;
        String code = null;
        byte[] keyBytes = null;
        byte[] msgBytes = null;
        try {
            keyBytes = key.getBytes(CHARSET_UTF8);
            msgBytes = msg.getBytes(CHARSET_UTF8);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        if (keyBytes != null && keyBytes.length > 0 && msgBytes != null
                && msgBytes.length > 0) {
            byte[] bytes = encodeWithKeyByAES(keyBytes, msgBytes);
            if (bytes != null){
//				flag 1：对应：flag 2			
//				code = bytesToHexString(bytes);
                code = bytesToBase64(bytes);
            }
        }// en if

        return code;
    }

    /**
     * 将字节转换为十六进制表示字符串
     *
     * @param bytes
     *            字节数组
     * @return 十六进制字符串
     */
    public static String bytesToHexString(byte[] bytes) {
        if (bytes == null || bytes.length <= 0)
            return null;
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < bytes.length; i++) {
            // 取字节中高 4 位的数字转换, >>> 为逻辑右移，将符号位一起右移
            String s = Integer.toHexString((int) bytes[i] >>> 4 & 0xF);
            sb.append(s);
            // 取字节中低 4 位的数字转换
            s = Integer.toHexString((int) (bytes[i] & 0xF));
            sb.append(s);
        }// end for
        return sb.toString();
    }

    /**
     * AES方式有密钥加密数据
     *
     * @param keyBytes
     *            密钥
     * @param msgBytes
     *            带加密的明文
     * @return AES方式加密后的密文
     */
    public static byte[] encodeWithKeyByAES(byte[] keyBytes, byte[] msgBytes) {
        byte[] bytes = null;

        if (keyBytes != null && keyBytes.length > 0 && msgBytes != null
                && msgBytes.length > 0) {
            SecretKeySpec sKeySpec = new SecretKeySpec(keyBytes, ALGORITHM_AES);
            // 创建密码器
            Cipher cipher = null;
            try {
                cipher = Cipher.getInstance(ALGORITHM_AES);
                cipher.init(Cipher.ENCRYPT_MODE, sKeySpec);
                bytes = cipher.doFinal(msgBytes);
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            } catch (NoSuchPaddingException e) {
                e.printStackTrace();
            } catch (InvalidKeyException e) {
                e.printStackTrace();
            } catch (IllegalBlockSizeException e) {
                e.printStackTrace();
            } catch (BadPaddingException e) {
                e.printStackTrace();
            }
        }// end if
        return bytes;
    }

    /**
     * AES方式有密钥的解密
     *
     * @param key
     *            密钥
     * @param secretMsg
     *            密文
     * @return AES方式明文
     */
    public static String decodeWithKeyByAES(String key, String secretMsg) {
        if (key == null || key.isEmpty() || secretMsg == null
                || secretMsg.isEmpty())
            return null;
        String code = null;
        byte[] keyBytes = null;

        try {
            keyBytes = key.getBytes(CHARSET_UTF8);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        if (keyBytes != null && keyBytes.length > 0) {
//			flag 2：对应：flag 1		
//			byte[] secretMsgs = hexStringToBytes(secretMsg);

            byte[] secretMsgs = Base64Tobytes(secretMsg);
            byte[] bytes = decodeWithKeyByAES(keyBytes,secretMsgs);
            if (bytes != null) {
                try {
                    code = new String(bytes, CHARSET_UTF8);
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            }// end if(bytes != null)
        }// end if
        return code;
    }

    /**
     * AES方式有密钥的解密
     *
     * @param keyBytes
     *            密钥
     * @param secretMsg
     *            密文
     * @return AES方式明文
     */
    public static byte[] decodeWithKeyByAES(byte[] keyBytes, byte[] secretMsg) {
        byte[] bytes = null;
        if (keyBytes != null && keyBytes.length > 0 && secretMsg != null
                && secretMsg.length > 0) {

            SecretKeySpec sKeySpec = new SecretKeySpec(keyBytes, ALGORITHM_AES);
            // 创建密码器
            Cipher cipher = null;
            try {
                cipher = Cipher.getInstance(ALGORITHM_AES);
                cipher.init(Cipher.DECRYPT_MODE, sKeySpec);
                bytes = cipher.doFinal(secretMsg);
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            } catch (NoSuchPaddingException e) {
                e.printStackTrace();
            } catch (InvalidKeyException e) {
                e.printStackTrace();
            } catch (IllegalBlockSizeException e) {
                e.printStackTrace();
            } catch (BadPaddingException e) {
                e.printStackTrace();
            }
        }// end if
        return bytes;
    }

    /**
     * 十六进制字符串(长度必须为2的倍数)转换为字符数组
     *
     * @param hexString
     *            十六进制字符串
     * @return 字节数组
     */
    public static byte[] hexStringToBytes(String hexString) {
        if (hexString == null || hexString.length() <= 0)
            return null;
        byte[] bytes = null;
        int length = hexString.length();
        bytes = new byte[length / 2];

        int index = 0;
        // 将每个十六进制转为4位2进制，两个4位二进制转为一个字符（8位）
        for (int i = 0; i < length; i++) {
            if (i >= length - 1)
                break;
            char c1 = hexString.charAt(i);
            char c2 = hexString.charAt((i + 1));

            int i1 = StringToInt("" + c1, 16);
            int i2 = StringToInt("" + c2, 16);

            bytes[index++] = (byte) ((i1 << 4) & 0xF0 | (i2 & 0xF));
            i += 2; // 后移动两位
        }// end for

        return bytes;
    }

    /**
     * 将指定字符串按照指定进制换算为数字
     *
     * @param s
     *            字符串
     * @param radix
     *            进制
     * @return int
     */
    public static int StringToInt(String s, int radix) {
        int i = 0;
        try {
            i = Integer.parseInt(s, radix);
        } catch (NumberFormatException e) {
        }
        return i;
    }

    /**
     * （MD5或SHA）无密钥加密
     *
     * @param algorithmName
     *            加密方式名称（MD5或SHA）ALGORITHM_MD5或ALGORITHM_SHA
     * @param msg
     *            明文
     * @return 密文
     */
    public static String encodeWithMD5OrSHA(String algorithmName, String msg) {
        if (msg == null || msg.isEmpty())
            return null;
        String code = null;
        byte[] msgBytes = null;
        try {
            msgBytes = msg.getBytes(CHARSET_UTF8);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        if (msgBytes != null && msgBytes.length > 0) {
            byte[] bytes = encodeWithMD5OrSHA(algorithmName, msgBytes);
            if (bytes != null && bytes.length > 0)
                code = bytesToHexString(bytes);
        }// end if
        return code;
    }

    /**
     * （MD5或SHA）无密钥加密
     *
     * @param algorithmName
     *            加密方式名称（MD5或SHA）ALGORITHM_MD5或ALGORITHM_SHA
     * @param msgBytes
     *            明文
     * @return 密文
     */
    public static byte[] encodeWithMD5OrSHA(String algorithmName,
                                            byte[] msgBytes) {
        if (algorithmName == null || algorithmName.isEmpty())
            return null;
        if (!algorithmName.equals(ALGORITHM_MD5)
                && !algorithmName.equals(ALGORITHM_SHA))
            return null;
        byte[] bytes = null;
        if(msgBytes != null && msgBytes.length > 0){
            MessageDigest digest = null;
            try {
                digest = MessageDigest.getInstance(algorithmName);
            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            }
            if(digest != null){
                digest.update(msgBytes);
                bytes = digest.digest();
            }//end if(digest != null)
        }//end if
        return bytes;
    }

    /**
     * 获取HmacSHA1算法加密数据
     *
     * @param key
     * 			密钥
     * @param msg
     * 			明文
     * @return	HmacSHA1算法加密密文
     */
    public static byte[] getHmacSha1Signature(String key,byte[] msg) {
        byte[] bytes = null;

        SecretKeySpec sKeySpec = new SecretKeySpec(key.getBytes(),ALGORITHM_HMACSHA1);

        Mac mac = null;
        try {
            mac = Mac.getInstance(ALGORITHM_HMACSHA1);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        if(mac != null){
            try {
                mac.init(sKeySpec);
                bytes = mac.doFinal(msg);
            } catch (InvalidKeyException e) {
                e.printStackTrace();
            }
        }
        return bytes;
    }

    /**
     * BASE64编码
     *
     * @param bytes
     * 			字节数组
     * @return	BASE64编码字符串
     */
    public static String bytesToBase64(byte[] bytes){
        String code = null;
        if(bytes != null && bytes.length > 0){
            code = new BASE64Encoder().encode(bytes);
        }
        return code;
    }

    /**
     * BASE64编码
     *
     * @param s
     * 			字符串
     * @return	BASE64编码字符串
     */
    public static byte[] Base64Tobytes(String s){
        byte[] bytes = null;
        if(s != null && s.length() > 0){
            try {
                bytes = new BASE64Decoder().decodeBuffer(s);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return bytes;
    }

}
