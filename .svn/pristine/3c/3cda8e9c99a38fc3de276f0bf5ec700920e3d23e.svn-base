package com.supermap.sgis.visual.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

/**
 * Created by yangxinyong on 2015/12/2.
 * 搜索热度（地区代码、热度）
 */

@Entity
@Table(name = "T_HOTWORD")
public class THotword implements java.io.Serializable{
    // Fields
    private int hotid;
    private String areacode;
    private int hot;

    // Constructors

    /** default constructor */
    public THotword() {
    }

    /** full constructor */
    public THotword(int hotid,String areacode, int hot) {
        this.areacode = areacode;
        this.hot = hot;
    }

    @GenericGenerator(name = "generator", strategy = "increment")
    @Id
    @GeneratedValue(generator = "generator")
    @Column(name = "HOTID", unique = true, nullable = false, precision = 10, scale = 0)
    public int getHotid() {
        return this.hotid;
    }
    public void setHotid(int hotid) {
        this.hotid = hotid;
    }

    @Column(name = "AREACODE", length = 12)
    public String getAreacode() {return this.areacode;}
    public void setAreacode(String areacode) {
        this.areacode = areacode;
    }

    @Column(name = "HOT", precision = 6, scale = 0)
    public int getHot(){return this.hot;}
    public void setHot(int hot){this.hot = hot;}


}
