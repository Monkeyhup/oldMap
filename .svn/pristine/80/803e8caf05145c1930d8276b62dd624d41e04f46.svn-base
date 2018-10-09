package com.supermap.sgis.visual.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

/**
 * TMacroTableinfo entity. @author MyEclipse Persistence Tools
 */
@Entity
@Table(name = "T_MACRO_TABLEINFO")
public class TMacroTableinfo implements java.io.Serializable {

	// Fields

	private int matiid;
	private TMacroPeriod TMacroPeriod;
	private TMacroTablemeta TMacroTablemeta;
	private int macmetaType;
	private int macdataType;
	private int mactableType;
	private int regionLevel;
	private String idenUnit;
	private String idenCode;
	private String idenName;
	private int hasChild;
	private int parid;
	private int status;
	private String flagC;
	private String flagA;
	private String flagB;

	// Constructors

	/** default constructor */
	public TMacroTableinfo() {
	}

	/** full constructor */
	public TMacroTableinfo(TMacroPeriod TMacroPeriod, TMacroTablemeta TMacroTablemeta, int macmetaType,
			int macdataType, int mactableType, int regionLevel, String idenUnit, String idenCode, String idenName,
			int hasChild, int parid, int status, String flagC, String flagA, String flagB) {
		this.TMacroPeriod = TMacroPeriod;
		this.TMacroTablemeta = TMacroTablemeta;
		this.macmetaType = macmetaType;
		this.macdataType = macdataType;
		this.mactableType = mactableType;
		this.regionLevel = regionLevel;
		this.idenUnit = idenUnit;
		this.idenCode = idenCode;
		this.idenName = idenName;
		this.hasChild = hasChild;
		this.parid = parid;
		this.status = status;
		this.flagC = flagC;
		this.flagA = flagA;
		this.flagB = flagB;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "MATIID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getMatiid() {
		return this.matiid;
	}

	public void setMatiid(int matiid) {
		this.matiid = matiid;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MAPID")
	public TMacroPeriod getTMacroPeriod() {
		return this.TMacroPeriod;
	}

	public void setTMacroPeriod(TMacroPeriod TMacroPeriod) {
		this.TMacroPeriod = TMacroPeriod;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MATMID")
	public TMacroTablemeta getTMacroTablemeta() {
		return this.TMacroTablemeta;
	}

	public void setTMacroTablemeta(TMacroTablemeta TMacroTablemeta) {
		this.TMacroTablemeta = TMacroTablemeta;
	}

	@Column(name = "MACMETA_TYPE", precision = 4, scale = 0)
	public int getMacmetaType() {
		return this.macmetaType;
	}

	public void setMacmetaType(int macmetaType) {
		this.macmetaType = macmetaType;
	}

	@Column(name = "MACDATA_TYPE", precision = 4, scale = 0)
	public int getMacdataType() {
		return this.macdataType;
	}

	public void setMacdataType(int macdataType) {
		this.macdataType = macdataType;
	}

	@Column(name = "MACTABLE_TYPE", precision = 4, scale = 0)
	public int getMactableType() {
		return this.mactableType;
	}

	public void setMactableType(int mactableType) {
		this.mactableType = mactableType;
	}

	@Column(name = "REGION_LEVEL", precision = 4, scale = 0)
	public int getRegionLevel() {
		return this.regionLevel;
	}

	public void setRegionLevel(int regionLevel) {
		this.regionLevel = regionLevel;
	}

	@Column(name = "IDEN_UNIT", length = 50)
	public String getIdenUnit() {
		return this.idenUnit;
	}

	public void setIdenUnit(String idenUnit) {
		this.idenUnit = idenUnit;
	}

	@Column(name = "IDEN_CODE", length = 20)
	public String getIdenCode() {
		return this.idenCode;
	}

	public void setIdenCode(String idenCode) {
		this.idenCode = idenCode;
	}

	@Column(name = "IDEN_NAME", length = 100)
	public String getIdenName() {
		return this.idenName;
	}

	public void setIdenName(String idenName) {
		this.idenName = idenName;
	}

	@Column(name = "HAS_CHILD", precision = 4, scale = 0)
	public int getHasChild() {
		return this.hasChild;
	}

	public void setHasChild(int hasChild) {
		this.hasChild = hasChild;
	}

	@Column(name = "PARID", precision = 10, scale = 0)
	public int getParid() {
		return this.parid;
	}

	public void setParid(int parid) {
		this.parid = parid;
	}

	@Column(name = "STATUS", precision = 4, scale = 0)
	public int getStatus() {
		return this.status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	@Column(name = "FLAG_C", length = 20)
	public String getFlagC() {
		return this.flagC;
	}

	public void setFlagC(String flagC) {
		this.flagC = flagC;
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

}