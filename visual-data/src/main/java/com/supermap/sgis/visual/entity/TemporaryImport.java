package com.supermap.sgis.visual.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * TemporaryImport导入数据临时存放关联查询 entity. @author RRP
 */
@Entity
@Table(name = "TEMPORARY_IMPORT")
public class TemporaryImport implements java.io.Serializable {

    // Fields
    private String id ;// 主键
    private String regioncode;//区划编码
    private String rcid;//地图类型编码
    private String name;//区划名称
    private String parcode;//父REGIONCODE
    private String subcode;//是否子节点（1有，0无）
    private String regionlevel;//级别（1-6）

    /** default constructor */
    public TemporaryImport() {
    }

    /** full constructor */
    public TemporaryImport(String regioncode, String rcid, String name, String parcode, String subcode, String regionlevel) {
        this.regioncode = regioncode;
        this.rcid = rcid;
        this.name = name;
        this.parcode = parcode;
        this.subcode = subcode;
        this.regionlevel = regionlevel;

    }


//    @GeneratedValue(generator = "generator")
    @GenericGenerator(name = "generator", strategy = "native")
    @Id
    @Column(name = "ID",nullable = false, length = 36)
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }



    @Column(name = "REGIONCODE",nullable = false, length = 12)
    public String getRegioncode() { return regioncode; }
    public void setRegioncode(String regioncode) { this.regioncode = regioncode; }

    @Column(name = "RCID", length = 10)
    public String getRcid() { return rcid; }
    public void setRcid(String rcid) { this.rcid = rcid; }

    @Column(name = "NAME", length = 100)
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @Column(name = "PARCODE", length = 12)
    public String getParcode() { return parcode; }
    public void setParcode(String parcode) { this.parcode = parcode; }

    @Column(name = "SUBCODE", length = 12)
    public String getSubcode() { return subcode; }
    public void setSubcode(String subcode) { this.subcode = subcode; }

    @Column(name = "REGIONLEVEL", length = 4)
    public String getRegionlevel() { return regionlevel; }
    public void setRegionlevel(String regionlevel) { this.regionlevel = regionlevel; }
}