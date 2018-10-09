package com.supermap.sgis.visual.common.tree;

/**
 * 构建各种dhtmlx tree所用的方法
 * @author Windy
 */
public class DHTMLXTreeHelper {

    public static String rootTree = "<?xml version=\"1.0\" encoding=\"utf-8\"?><tree id=\"tree0\">#body#</tree>";
    public static String errorTree = "<?xml version=\"1.0\" encoding=\"utf-8\"?><tree id=\"tree0\"><item nocheckbox=\"1\" id=\"-1\" text=\"#msg#\" /></tree>";
    public static String loadingNode = "<item id=\"load\" text=\"loading\" nocheckbox=\"1\"/>";
    public static String node = "<item id=\"#id#\" text=\"#t#\">";
    public static String open = " open=\"1\"";
    public static String nock = " nocheckbox=\"1\"";
    public static String checked = " checked=\"1\"";

    public static String getErrorTree(String msg){
        return errorTree.replace("#msg#", msg);
    }

    /**
     * Tree id 默认为0
     * @param body
     * @return
     */
    public static String wrapBody(String body){
        return rootTree.replace("#body#", body);
    }

}
