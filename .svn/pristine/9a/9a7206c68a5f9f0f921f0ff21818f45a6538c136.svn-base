package com.supermap.sgis.visual.common;


import com.supermap.sgis.visual.json.Region;

/**
 * 行政区划编码的统一处理方法
 *
 * @author Created by zhangjunfeng on 14-3-19.
 * @author Updated by ruanrp on 14-12-1
 * @author Modify by Linhao on 14-2-4
 */
public class RegionSupport {
    /**
     * 直辖市的前2位编码
     * <p>
     * &nbsp;&nbsp;说明：（四个直辖市的前两位编码）<br/>
     * &nbsp;&nbsp;北京：11<br/>
     * &nbsp;&nbsp;天津：12<br/>
     * &nbsp;&nbsp;上海：31<br/>
     * &nbsp;&nbsp;重庆：50<br/>
     * </p>
     */
    private static String[] municipalRegions = new String[] { "11", "12", "31",
            "50" };

    /**
     * 判别左侧有效字符编码（除去右侧0）
     *
     * <p>
     * &nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;从右边开始算起，除去右侧所有的等于c参数字符的字符知道出现不等于c字符为止<br/>
     * </p>
     * <p style="color:red;">
     * &nbsp;&nbsp;例如：<br/>
     * &nbsp;&nbsp;str=00011<b>00</b>，c=0,则返回00011<br/>
     * &nbsp;&nbsp;str=00011001，c=0,则返回00011001<br/>
     * </p>
     *
     * @param str
     *            字符串
     * @param c
     *            判断字符
     * @return 效字符编码
     */
    public static String trimRight(String str, char c) {
        if (str == null) {
            return "";
        }
        if (str.length() < 1) {
            return str;
        }
        int length = str.length();
        int index = 0;
        for (index = length - 1; index >= 0; index--) {
            if (str.charAt(index) != c) {
                break;
            }
        }

        return str.substring(0, index + 1);
    }

    /**
     * 判别左侧有效字符编码长度
     *
     * <p>
     * &nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;从右边开始算起，除去右侧所有的等于c参数字符的字符知道出现不等于c字符为止，<br/>
     * &nbsp;&nbsp;计算此时有效字符串的长度
     * </p>
     * <p style="color:red;">
     * &nbsp;&nbsp;例如：<br/>
     * &nbsp;&nbsp;str=00011<b>00</b>，c=0,则返回00011<br/>
     * &nbsp;&nbsp;str=00011001，c=0,则返回00011001<br/>
     * </p>
     *
     * @param str
     *            字符串
     * @param c
     *            判断字符
     * @return 有效字符编码
     */
    public static int trimRightLength(String str, char c) {
        if (str == null || str.length() < 1) {
            return 0;
        }
        int length = str.length();
        int index = 0;
        for (index = length - 1; index >= 0; index--) {
            if (str.charAt(index) != c) {
                break;
            }
        }
        return index + 1;
    }

    /**
     * 行政区划代码判别级别
     * <p>
     * &nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;编码的长度为12<=12<=29,其中>12返回8,其他返回0（全国）
     * </p>
     *
     * @param code
     *            行政区划编码
     * @return 判别级别
     */
    public static int getRegionLevel(String code) {
        int index = trimRightLength(code, '0');
        int length = code.length();
        if (length == 12) {
            if (index > 0 && index <= 2) {
                return 2;
            } else if (index > 2 && index <= 4) {
                return 3;
            } else if (index > 4 && index <= 6) {
                return 4;
            } else if (index > 6 && index <= 9) {
                return 5;
            } else if (index > 9 && index <= 12) {
                return 6;
            } else {
                return 1;
            }
        } else if (length > 12 && length <= 29) {
            return 8;
        }
        // else if (length == 10) {
        // return 9;//特色区
        // }
        else {
            return 0;
        }
    }

    /**
     * 根据行政级别，获取有效编码长度
     *
     * @param regionLevel
     *            行政区划编码级别
     * @return 指定级别对应的有效编码长度
     */
    public static int getLengthByLevel(int regionLevel) {
        switch (regionLevel) {
            case 1:
                return 0;// 国
            case 2:
                return 2;// 省
            case 3:
                return 4;// 地市
            case 4:
                return 6;// 县
            case 5:
                return 9;// 乡
            case 6:
                return 12;// 村
            case 8:
                return 29;// 建筑物
            case 9:
                return 12;// 特色区（不用）
            default:
                return 0;
        }
    }

    /**
     * 通过编码获取有效的编码字符串（编码的前缀）
     * <p style="color:red;">
     * &nbsp;&nbsp;例如：<br/>
     * &nbsp;&nbsp;regioncode = 111000000000，返回1110
     * </p>
     *
     * @param regioncode
     *            行政区划编码
     * @return 编码字符串（编码的前缀）
     */
    public static String getSubstr(String regioncode) {
        int level = getRegionLevel(regioncode);
        // if(isMunicipalRegion(regioncode)&&level ==3){
        // level = level -1;
        // }
        int len = getLengthByLevel(level);
        return regioncode.substring(0, len);
    }

    /**
     * 通过编码和指定的级别获取有效的编码字符串（编码的前缀）
     * <p style="color:red;">
     * &nbsp;&nbsp;注意：<br/>
     * &nbsp;&nbsp;返回的编码的字符串长度与regionlevel参数有关
     * </p>
     * <p>
     * &nbsp;&nbsp;例如：<br/>
     * &nbsp;&nbsp;regioncode = 111000000000,regionlevel=3,返回1110<br/>
     * &nbsp;&nbsp;regioncode = 111000000000,regionlevel=5,返回111000000
     * </p>
     *
     * @param regioncode
     *            行政区划编码
     * @param regionlevel
     *            编码级别
     * @return 编码字符串（编码的前缀）
     */
    public static String getSubstr(String regioncode, int regionlevel) {
        switch (regionlevel) {
            case 1:
                return "";
            case 2:
                return regioncode.substring(0, 2);
            case 3:
                return regioncode.substring(0, 4);
            case 4:
                return regioncode.substring(0, 6);
            case 5:
                return regioncode.substring(0, 9);
            case 6:
                return regioncode.substring(0, 12);
            case 8:
                return regioncode.substring(0, 29);
            default:
                return regioncode;
        }
    }

    /**
     * 右侧父节点有效位数补c
     *
     * @param substring
     *            编码前缀（被补位的字符串）
     * @param length
     *            补位后的的编码长度
     * @param c
     *            补位的字符
     * @return 补位后的的编码字符串
     */
    public static String padRight(String substring, int length, char c) {
        if (length <= substring.length()) {
            return substring;
        }
        char[] chars = new char[length];
        for (int i = 0; i < length; i++) {
            chars[i] = c;
        }
        char[] strChars = substring.toCharArray();
        // 数组复制链接
        System.arraycopy(strChars, 0, chars, 0, strChars.length);
        return new String(chars);
    }

    /**
     * 判断是否是直辖市
     * <p style="color:red;">
     * &nbsp;&nbsp;说明：<br/>
     * &nbsp;&nbsp;通过判断编码的前两位的编码来判断是否是直辖市
     * </p>
     *
     * @param regionCode
     *            编码前缀（被补位的字符串）
     * @return true代表是直辖市，false代表不是直辖市
     */
    public static boolean isMunicipalRegion(String regionCode) {
        int len = regionCode.length();
        if (len < 2) {
            return false;
        }
        regionCode = regionCode.substring(0, 2);
        for (int i = 0, _size = municipalRegions.length; i < _size; i++) {
            if (regionCode.equals(municipalRegions[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 通过指定有效长度获取编码级别
     *
     * @param len
     *            指定长度
     * @return 编码级别
     */
    public static int getLevelByLen(int len) {
        switch (len) {
            case 0:
                return 0;
            case 1:
                return 2;
            case 2:
                return 2;
            case 3:
                return 3;
            case 4:
                return 3;
            case 5:
                return 4;
            case 6:
                return 4;
            case 7:
                return 5;
            case 8:
                return 5;
            case 9:
                return 5;
            case 10:
                return 6;
            case 11:
                return 6;
            case 12:
                return 6;
            case 14:
                return 7;
            case 29:
                return 8;
            default:
                return 1;
        }
    }

    /**
     * 通过指定编码级别获取其中文含义（注意和中文的级别名称的区别）
     *
     * @param level
     *            编码级别
     * @return 中文含义（注意和中文的级别名称的区别）
     */
    public static String getStringByRegionLevel(int level) {
        switch (level) {
            case 1:
                return "全国";
            case 2:
                return "省";
            case 3:
                return "地级市";
            case 4:
                return "区县";
            case 5:
                return "乡镇";
            case 6:
                return "村(居委会)";
            case 8:
                return "建筑物";
            default:
                return "";
        }
    }

    /**
     * 通过指定编码级别获取其中文的级别名称
     *
     * @param level
     *            编码级别
     * @return 中文的级别名称
     */
    public static String getLevelName(int level) {
        switch (level) {
            case 1:
                return "全国";
            case 2:
                return "省级";
            case 3:
                return "地市级";
            case 4:
                return "区县级";
            case 5:
                return "乡镇级";
            case 6:
                return "村(居委会)";
            case 8:
                return "建筑物";
            default:
                return "";
        }
    }

    /**
     * 去掉直辖市统计
     *
     * @param logical
     *            运算符(当为not时 返回结果出现（not like）)
     * @param isOkIds
     *            已存在regionIds筛选条件
     */
    public static String getMunicipalSql(String logical, String isOkIds) {
        StringBuilder sb = new StringBuilder(" and (");
        int in = 0;
        for (int i = 0, _size = municipalRegions.length; i < _size; i++) {
            if (isSame(isOkIds, "'" + municipalRegions[i] + "'"))
                continue; // 去掉重复和矛盾的条件
            if (in == 0) {
                if (logical.indexOf("not") != -1) {
                    sb.append("A00004 not ");
                } else {
                    sb.append("A00004 ");
                }
            } else {
                if (logical.indexOf("not") != -1) {
                    sb.append(" and A00004 not ");
                } else {
                    sb.append(" or A00004 ");
                }
            }
            sb.append("like '" + municipalRegions[i] + "%'");
            in++;
        }
        return sb.append(")").toString();
    }

    /**
     * 判断ID是否存在IDS中
     *
     * @param isOkIds
     *            判断参考的值，多个值使用逗号","隔开
     * @param id
     *            要判断的值
     * @return true代表存在，false代表不存在
     */
    public static boolean isSame(String isOkIds, String id) {
        String ids[] = isOkIds.split(",");
        for (int i = 0, size = ids.length; i < size; i++) {
            if (ids[i].equals(id))
                return true;
        }
        return false;
    }

    /**
     * 根据行政级别，获取综合数据表名
     *
     * @param regionLevel
     *            行政级别
     * @return 综合数据表名
     */
    public static String getDataTableName(int regionLevel) {
        String tableName = "T_MACRO_WDDATA"; // 国家综合数据表
        switch (regionLevel) {
            case 1:
                tableName = "T_MACRO_WDDATA"; // 国家综合数据表
                break;
            case 2:
                tableName = "T_MACRO_SNDATA"; // 省综合数据表
                break;
            case 3:
                tableName = "T_MACRO_SHDATA"; // 市
                break;
            case 4:
                tableName = "T_MACRO_XNDATA"; // 县
                break;
            case 5:
                tableName = "T_MACRO_XADATA"; // 乡镇
                break;
            case 6:
                tableName = "T_MACRO_CNDATA"; // 村街道
                break;
            case 7:
                tableName = "T_MACRO_XQDATA"; // 小区园区
                break;
            case 8:
                tableName = "T_MACRO_OTHERDATA"; // 其他（建筑物等）
                break;
            case 9:
                tableName = "T_TSMACRO_DATA"; // 单位(不用)
                break;
            default:
                break;
        }
        return tableName;
    }

    /**
     * 判断是否为区域字段（行政区划A00004/特色区域'ST...'）
     *
     * @param TS_type
     *            特色区域类型（字段名）
     * @param field
     *            当前判断字段（例如：A00004）
     * @return true代表是区域字段
     */
    public static boolean isRegion(String TS_type, String field) {
        // 行政区划
        if (field.contains("A00004")) {
            return true;
            // 特色区域
        } else if (TS_type != null && !TS_type.equals("")
                && TS_type.contains(field)) {
            return true;
        }
        return false;
    }

    /**
     * 当前查询区域字段（行政区划A00004，特色区域'TS...'）
     *
     * @param regionType
     * 			行政区划类型
     * @return 区划字段名
     */
    public static String currentRegionField(String regionType) {
        return isTSRegion(regionType) ? regionType : "A00004";
    }

    /**
     * 判断是否为特色区域
     * @param regionType
     * 			行政区划类型
     * @return true代表特色区域
     */
    public static boolean isTSRegion(String regionType) {
        return regionType != null && !regionType.equals("")
                && !regionType.equals("A00004");
    }

    /**
     * 解析【综合、已三维度汇总】行政区划数组条件
     * 返回sql字符串
     * @param regions 区域条件
     * @return
     */
    public static String parseRegions(Region[] regions){
        return regionsToSql(regions,-1);
    }

    /**
     * 解析【综合、已三维度汇总】行政区划数组条件
     * 返回sql字符串
     * @param regions 区域条件
     * @param level 指定区域级别（针对下级全部#）
     * @return
     */
    public static String regionsToSql(Region[] regions, int level){
        if(regions==null){
            return "";
        }
        String regionSql = "";
        String mutiStr = "";
        String simStr = "";
        String regionlevel = "";
        int len = regions.length;
        for(int i=0; i<len; i++){
            Region r = regions[i];
            int regionLeval = r.getRegionLevel();          //同时传过来的region都是统一level 的
            regionlevel = regionLeval+"";
            String code = r.getRegionCode();
            if(code.contains("#")){
                code = code.substring(0, code.indexOf("#"));
                if (RegionSupport.isMunicipalRegion(code) && code.indexOf("00") != -1) {
                    code = code.substring(0, code.indexOf("00"));//取直辖市的前两位
                }
                if(mutiStr.isEmpty()){
                    mutiStr = " s.regioncode like '" +  code + "%'" ;
                }else if(mutiStr.contains("%")){                  //s.regioncode like '" + regioncode + "%' and s.regionlevel =" + regionlevel
                    mutiStr += " or s.regioncode like '" +  code + "%'";
                }

            }else{
                simStr += "'" + code + "',";
            }
        }
        Boolean flag = false;
        if(!mutiStr.isEmpty()){
            mutiStr += " and s.regionlevel =" + (level==-1?regionlevel:level);
            regionSql = mutiStr;
            flag = true;
        }
        if(!simStr.isEmpty()){
            simStr = simStr.substring(0, simStr.length() - 1);
            if(simStr.indexOf(",")==-1){
                simStr = " s.regioncode = " + simStr;
            }else {
                simStr = " s.regioncode in (" + simStr + ")";
            }
            if(flag) {
                regionSql += " or " + simStr;
            }else{
                regionSql = simStr;
            }
        }
        return regionSql;
    }

    /**
     * 取得指定行政区划编码下的上一级编码
     *
     * @param regionCode
     *          行政区划编码
     *
     * @return 若失败，则返回null
     */
    public static String getPreviousLevelRegionCode(String regionCode){
        String previousCode = null;

        if(regionCode == null || "".equals(regionCode)){
            return null;
        }

        int level = getRegionLevel(regionCode);
        //当前全国用户
        if(level < 2){
            return null;
        }

        //是否是直辖市
        boolean isMuni = isMunicipalRegion(regionCode);

        String s = null;
        if(isMuni){
            s = getSubstr(regionCode,level-2);
        }else{
            s = getSubstr(regionCode,level-1);
        }

        //右侧位补位0
        previousCode = padRight(s,regionCode.length(),'0');

        return previousCode;
    }
}
