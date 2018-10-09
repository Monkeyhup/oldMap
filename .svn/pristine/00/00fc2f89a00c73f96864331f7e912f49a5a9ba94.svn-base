package com.supermap.sgis.visual.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * TMacroTablemeta entity. @author MyEclipse Persistence Tools
 * 综合数据：目录、表、指标（唯一）、模板信息
 */
@Entity
@Table(name = "T_MACRO_TABLEMETA")
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "tmacrotableinfos", "tmacroidenmetas",
        "tmacroidentinfos", "handler", "flagA", "flagB", "flagC"})
public class TMacroTablemeta implements java.io.Serializable {

    // Fields

    private int matmid;
    private String idenName;
    private String idenCode;
    private String idenUnit;
    private int parid;
    private int mactableType;
    private int macdataType;
    private int macmetaType;
    private int reportType;
    private String reportTypeName;
    private int hasChild;
    private int regionLevel;
    private String memo;
    private String module;
    private int status;
    private int permission;
    private int orderby;
    private String flagA;
    private String flagB;
    private String flagC;
    private Set<TMacroTableinfo> TMacrotableinfos = new HashSet<TMacroTableinfo>(0);
    private Set<TMacroIdenmeta> TMacroidenmetas = new HashSet<TMacroIdenmeta>(0);
    private Set<TMacroIdentinfo> TMacroidentinfos = new HashSet<TMacroIdentinfo>(0);

    // Constructors

    /**
     * default constructor
     */
    public TMacroTablemeta() {
    }

    /**
     * full constructor
     */
    public TMacroTablemeta(String idenName, String idenCode, String idenUnit, int parid, int mactableType,
                           int macdataType, int macmetaType, int reportType, String reportTypeName, int hasChild, int regionLevel,
                           String memo, String module, int status, int permission, int orderby, String flagA, String flagB,
                           String flagC, Set<TMacroTableinfo> TMacrotableinfos, Set<TMacroIdenmeta> TMacroidenmetas,
                           Set<TMacroIdentinfo> TMacroidentinfos) {
        this.idenName = idenName;
        this.idenCode = idenCode;
        this.idenUnit = idenUnit;
        this.parid = parid;
        this.mactableType = mactableType;
        this.macdataType = macdataType;
        this.macmetaType = macmetaType;
        this.reportType = reportType;
        this.reportTypeName = reportTypeName;
        this.hasChild = hasChild;
        this.regionLevel = regionLevel;
        this.memo = memo;
        this.module = module;
        this.status = status;
        this.permission = permission;
        this.orderby = orderby;
        this.flagA = flagA;
        this.flagB = flagB;
        this.flagC = flagC;
        this.TMacrotableinfos = TMacrotableinfos;
        this.TMacroidenmetas = TMacroidenmetas;
        this.TMacroidentinfos = TMacroidentinfos;
    }

    // Property accessors
    @GenericGenerator(name = "generator", strategy = "increment")
    @Id
    @GeneratedValue(generator = "generator")
    @Column(name = "MATMID", unique = true, nullable = false, precision = 10, scale = 0)
    public int getMatmid() {
        return this.matmid;
    }

    public void setMatmid(int matmid) {
        this.matmid = matmid;
    }

    @Column(name = "IDEN_NAME", length = 100)
    public String getIdenName() {
        return this.idenName;
    }

    public void setIdenName(String idenName) {
        this.idenName = idenName;
    }

    @Column(name = "IDEN_CODE", length = 20)
    public String getIdenCode() {
        return this.idenCode;
    }

    public void setIdenCode(String idenCode) {
        this.idenCode = idenCode;
    }

    @Column(name = "IDEN_UNIT", length = 50)
    public String getIdenUnit() {
        return this.idenUnit;
    }

    public void setIdenUnit(String idenUnit) {
        this.idenUnit = idenUnit;
    }

    @Column(name = "PARID", precision = 10, scale = 0)
    public int getParid() {
        return this.parid;
    }

    public void setParid(int parid) {
        this.parid = parid;
    }

    @Column(name = "MACTABLE_TYPE", precision = 4, scale = 0)
    public int getMactableType() {
        return this.mactableType;
    }

    public void setMactableType(int mactableType) {
        this.mactableType = mactableType;
    }

    @Column(name = "MACDATA_TYPE", precision = 4, scale = 0)
    public int getMacdataType() {
        return this.macdataType;
    }

    public void setMacdataType(int macdataType) {
        this.macdataType = macdataType;
    }

    @Column(name = "MACMETA_TYPE", precision = 4, scale = 0)
    public int getMacmetaType() {
        return this.macmetaType;
    }

    public void setMacmetaType(int macmetaType) {
        this.macmetaType = macmetaType;
    }

    @Column(name = "REPORT_TYPE", precision = 4, scale = 0)
    public int getReportType() {
        return this.reportType;
    }

    public void setReportType(int reportType) {
        this.reportType = reportType;
    }

    @Column(name = "REPORT_TYPE_NAME", length = 20)
    public String getReportTypeName() {
        return this.reportTypeName;
    }

    public void setReportTypeName(String reportTypeName) {
        this.reportTypeName = reportTypeName;
    }

    @Column(name = "HAS_CHILD", precision = 4, scale = 0)
    public int getHasChild() {
        return this.hasChild;
    }

    public void setHasChild(int hasChild) {
        this.hasChild = hasChild;
    }

    @Column(name = "REGION_LEVEL", precision = 4, scale = 0)
    public int getRegionLevel() {
        return this.regionLevel;
    }

    public void setRegionLevel(int regionLevel) {
        this.regionLevel = regionLevel;
    }

    @Column(name = "MEMO", length = 200)
    public String getMemo() {
        return this.memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }

    @Column(name = "MODULE", length = 15)
    public String getModule() {
        return this.module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    @Column(name = "STATUS", precision = 4, scale = 0)
    public int getStatus() {
        return this.status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    @Column(name = "PERMISSION", precision = 4, scale = 0)
    public int getPermission() {
        return this.permission;
    }

    public void setPermission(int permission) {
        this.permission = permission;
    }

    @Column(name = "ORDERBY", precision = 10, scale = 0)
    public int getOrderby() {
        return this.orderby;
    }

    public void setOrderby(int orderby) {
        this.orderby = orderby;
    }

    @Column(name = "FLAG_A", length = 20)
    public String getFlagA() {
        return this.flagA;
    }

    public void setFlagA(String flagA) {
        this.flagA = flagA;
    }

    @Column(name = "FLAG_B", length = 20)
    public String getFlagB() {
        return this.flagB;
    }

    public void setFlagB(String flagB) {
        this.flagB = flagB;
    }

    @Column(name = "FLAG_C", length = 20)
    public String getFlagC() {
        return this.flagC;
    }

    public void setFlagC(String flagC) {
        this.flagC = flagC;
    }

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TMacroTablemeta")
    public Set<TMacroTableinfo> getTMacrotableinfos() {
        return TMacrotableinfos;
    }

    public void setTMacrotableinfos(Set<TMacroTableinfo> TMacrotableinfos) {
        this.TMacrotableinfos = TMacrotableinfos;
    }

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TMacroTablemeta")
    public Set<TMacroIdenmeta> getTMacroidenmetas() {
        return TMacroidenmetas;
    }

    public void setTMacroidenmetas(Set<TMacroIdenmeta> TMacroidenmetas) {
        this.TMacroidenmetas = TMacroidenmetas;
    }

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TMacroTablemeta")
    public Set<TMacroIdentinfo> getTMacroidentinfos() {
        return TMacroidentinfos;
    }

    public void setTMacroidentinfos(Set<TMacroIdentinfo> TMacroidentinfos) {
        this.TMacroidentinfos = TMacroidentinfos;
    }
}