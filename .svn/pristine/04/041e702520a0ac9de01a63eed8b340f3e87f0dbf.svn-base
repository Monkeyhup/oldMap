package com.supermap.sgis.visual.common.tree;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * dhtmlxTree 节点描述
 * 默认是未打开 存在checkbox的最普通的节点
 * @author Windy
 *
 */
public class DHTMLXTree {

    ArrayList<DHTMLXTree> childs = null;
    Map<String, String> attrs = null;
    Map<String, String> userdata = null;
    String id;
    String text;
    String parid;
    boolean isOpen = false;
    boolean noCheckbox = false;
    boolean isLoading = false;
    boolean isChecked = false ;


    public DHTMLXTree() {
    }

    public DHTMLXTree(String id, String text) {
        super();
        this.id = id;
        this.text = text;
    }

    public DHTMLXTree(String id, String text,String parid) {
        super();
        this.id = id;
        this.text = text;
        this.parid=parid;
    }
    /**
     * 节点标记为打开
     * @return
     */
    public DHTMLXTree open(){
        this.isOpen = true;
        return this;
    }
    /**
     * 标记为没有checkbox
     * @return
     */
    public DHTMLXTree noCheckbox(){
        this.noCheckbox = true;
        return this;
    }
    public DHTMLXTree checked(){
        this.isChecked = true;
        return this;
    }
    /**
     * 添加子节点
     * @param node
     * @return
     */
    public DHTMLXTree add(DHTMLXTree node){
        if (this.childs == null){
            this.childs = new ArrayList<DHTMLXTree>();
        }
        this.childs.add(node);
        return this;
    }
    /**
     * 标记这个是loading节点 用于动态树
     * @return
     */
    public DHTMLXTree loading(){
        this.isLoading = true;
        return this;
    }
    /**
     * 给节点添加属性
     * @param key
     * @param value
     * @return
     */
    private DHTMLXTree attr(String key, String value){
        if (this.attrs == null){
            this.attrs = new HashMap<String, String>();
        }
        this.attrs.put(key, value);
        return this;
    }
    /**
     * 添加tooltip属性
     * @param msg
     * @return
     */
    public DHTMLXTree setTooltip(String msg){
        return this.attr("tooltip", msg);
    }
    /**
     * 添加颜色属性
     * @param color
     * @return
     */
    public DHTMLXTree setColor(String color) {
        return this.attr("aCol", color);
    }

    /**
     * 设置用户数据，所以，别再往ID里放那么多东西了=3=
     * @param key
     * @param value
     * @return
     */
    public DHTMLXTree setUserData(String key, String value){
        if (this.userdata == null){
            this.userdata = new HashMap<String, String>();
        }
        this.userdata.put(key, value);
        return this;
    }

    public String getId() {
        return id;
    }

    public DHTMLXTree setId(String id) {
        this.id = id;
        return this;
    }

    public String getText() {
        return text;
    }

    public DHTMLXTree setText(String text) {
        this.text = text;
        return this;
    }
    public boolean isChecked() {
        return isChecked;
    }

    public void setChecked(boolean isChecked) {
        this.isChecked = isChecked;
    }


    /**
     * 获取其下节点
     * @return
     */
    public ArrayList<DHTMLXTree> getChilds() {
        return childs;
    }

    /**
     * 获取其下一级节点个数
     * @return
     */
    public int size(){
        return this.childs != null ? this.childs.size() : 0;
    }


    public String getParid() {
        return parid;
    }

    public void setParid(String parid) {
        this.parid = parid;
    }

    /**
     * 字符串化
     */
    public String toString(){
        if (this.isLoading){
            return DHTMLXTreeHelper.loadingNode;
        }
        String re = "<item id=\""+this.id+"\" text=\""+this.text+"\" ";
        if (this.isOpen){re += DHTMLXTreeHelper.open;}
        if (this.noCheckbox){re += DHTMLXTreeHelper.nock;}
        if(this.isChecked){ re += DHTMLXTreeHelper.checked; }
        if (this.attrs != null){
            for (String key : this.attrs.keySet()) {
                re += " "+key+"=\""+this.attrs.get(key)+"\"";
            }
        }
        re += ">";
        if (this.userdata != null){
            for (String key : this.userdata.keySet()) {
                re += "<userdata name=\""+key+"\">"+this.userdata.get(key)+"</userdata>";
            }
        }
        if (this.childs != null){
            StringBuilder cre = new StringBuilder();
            for (DHTMLXTree node : this.childs) {
                cre.append(node.toString());
            }
            re += cre.toString();
        }
        //特殊字符&转义
        re = re.replaceAll("&","&amp;") ;
        return re+"</item>";
    }

}