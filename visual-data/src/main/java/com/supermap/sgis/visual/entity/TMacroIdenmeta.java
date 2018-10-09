package com.supermap.sgis.visual.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

/**
 * TMacroIdenmeta entity. @author MyEclipse Persistence Tools
 * 综合指标信息
 */
@Entity
@Table(name = "T_MACRO_IDENMETA")
public class TMacroIdenmeta implements java.io.Serializable {

	// Fields

	private int maimid;
	private TMacroTablemeta TMacroTablemeta;
	private TMacroIdenvl TMacroIdenvl;
	private String idenCode;
	private String idenName;
	private String idenUnit;
	private int idenType;
	private int idenLength;
	private int idenPrecision;
	private String memo;
	private int status;

	// Constructors

	/** default constructor */
	public TMacroIdenmeta() {
	}

	/** full constructor */
	public TMacroIdenmeta(TMacroTablemeta TMacroTablemeta, TMacroIdenvl TMacroIdenvl, String idenCode, String idenName,
			String idenUnit, int idenType, int idenLength, int idenPrecision, String memo, int status) {
		this.TMacroTablemeta = TMacroTablemeta;
		this.TMacroIdenvl = TMacroIdenvl;
		this.idenCode = idenCode;
		this.idenName = idenName;
		this.idenUnit = idenUnit;
		this.idenType = idenType;
		this.idenLength = idenLength;
		this.idenPrecision = idenPrecision;
		this.memo = memo;
		this.status = status;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "MAIMID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getMaimid() {return this.maimid;}
	public void setMaimid(int maimid) {
		this.maimid = maimid;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MATMID")
	public TMacroTablemeta getTMacroTablemeta() {
		return this.TMacroTablemeta;
	}
	public void setTMacroTablemeta(TMacroTablemeta TMacroTablemeta) {
		this.TMacroTablemeta = TMacroTablemeta;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MAIVID")
	public TMacroIdenvl getTMacroIdenvl() {
		return this.TMacroIdenvl;
	}
	public void setTMacroIdenvl(TMacroIdenvl TMacroIdenvl) {
		this.TMacroIdenvl = TMacroIdenvl;
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

	@Column(name = "IDEN_UNIT", length = 20)
	public String getIdenUnit() {
		return this.idenUnit;
	}
	public void setIdenUnit(String idenUnit) {
		this.idenUnit = idenUnit;
	}

	@Column(name = "IDEN_TYPE", precision = 4, scale = 0)
	public int getIdenType() {
		return this.idenType;
	}
	public void setIdenType(int idenType) {
		this.idenType = idenType;
	}

	@Column(name = "IDEN_LENGTH", precision = 10, scale = 0)
	public int getIdenLength() {
		return this.idenLength;
	}
	public void setIdenLength(int idenLength) {
		this.idenLength = idenLength;
	}

	@Column(name = "IDEN_PRECISION", precision = 10, scale = 0)
	public int getIdenPrecision() {
		return this.idenPrecision;
	}
	public void setIdenPrecision(int idenPrecision) {
		this.idenPrecision = idenPrecision;
	}

	@Column(name = "MEMO", length = 50)
	public String getMemo() {
		return this.memo;
	}
	public void setMemo(String memo) {
		this.memo = memo;
	}

	@Column(name = "STATUS", precision = 4, scale = 0)
	public int getStatus() {
		return this.status;
	}
	public void setStatus(int status) {
		this.status = status;
	}

}