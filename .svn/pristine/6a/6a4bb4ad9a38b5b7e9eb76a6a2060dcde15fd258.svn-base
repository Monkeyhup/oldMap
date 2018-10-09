package com.supermap.sgis.visual.common.tree;

import java.util.ArrayList;
import java.util.List;

public class DHTMLXTreeFactory {

    /**
     * 获取一个loading节点
     * @return DHTMLXTree
     */
    public static DHTMLXTree getLoading(){
        return new DHTMLXTree().loading();
    }
    /**
     * 获取一个普通节点
     * @param id
     * @param text
     * @return DHTMLXTree
     */
    public static DHTMLXTree getNode(String id, String text){
        return new DHTMLXTree(id, text);
    }
    /**
     * 获取一个普通节点, 其下包含一个loading节点
     * @param id
     * @param text
     * @return DHTMLXTree
     */
    public static DHTMLXTree getNodeWithLoading (String id, String text){
        return new DHTMLXTree(id, text).add(new DHTMLXTree().loading());
    }
    /**
     * 对一个节点进行树化
     * @param root
     * @return
     */
    public static String toTree(DHTMLXTree root){
        return DHTMLXTreeHelper.wrapBody(root.toString());
    }
    /**
     * 对一堆节点进行树化
     * @param nodes
     * @return
     */
    public static String toTree(ArrayList<DHTMLXTree> nodes){
        StringBuilder re = new StringBuilder();
        for (DHTMLXTree tree : nodes) {
            re.append(tree.toString());
        }
        return DHTMLXTreeHelper.wrapBody(re.toString());
    }

    /**
     * 对一堆节点进行树化，nodes是一组记录
     * @param nodes
     * @return
     */
    public static String makeTree(List<DHTMLXTree> nodes){
        DHTMLXTree root = new DHTMLXTree("root", "目录");
        for (DHTMLXTree node1 : nodes) {
            boolean mark = false;
            for (DHTMLXTree node2 : nodes) {
                if (node1.getParid() != null && node1.getParid().equals(node2.getId())) {
                    mark = true;
                    node2.add(node1);
                    break;
                }
            }
            if (!mark) {
                root.add(node1);
            }
        }
        return DHTMLXTreeFactory.toTree(root);
    }

}
