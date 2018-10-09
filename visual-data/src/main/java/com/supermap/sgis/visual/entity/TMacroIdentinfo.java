package com.supermap.sgis.visual.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

/**
 * TMacroIdentinfo entity. @author MyEclipse Persistence Tools
 */
@Entity
@Table(name = "T_MACRO_IDENTINFO")
public class TMacroIdentinfo implements java.io.Serializable {

	// Fields

	private int maiiid;
	private TMacroTablemeta TMacroTablemeta;
	private TMacroIdent TMacroIdent;
	private String name;
	private String memo;
	private int status;

	// Constructors

	/** default constructor */
	public TMacroIdentinfo() {
	}

	/** full constructor */
	public TMacroIdentinfo(TMacroTablemeta TMacroTablemeta, TMacroIdent TMacroIdent, String name, String memo,
			int status) {
		this.TMacroTablemeta = TMacroTablemeta;
		this.TMacroIdent = TMacroIdent;
		this.name = name;
		this.memo = memo;
		this.status = status;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "MAIIID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getMaiiid() {
		return this.maiiid;
	}

	public void setMaiiid(int maiiid) {
		this.maiiid = maiiid;
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
	@JoinColumn(name = "MAITID")
	public TMacroIdent getTMacroIdent() {
		return this.TMacroIdent;
	}

	public void setTMacroIdent(TMacroIdent TMacroIdent) {
		this.TMacroIdent = TMacroIdent;
	}

	@Column(name = "NAME", length = 100)
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "MEMO", length = 100)
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