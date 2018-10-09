package com.supermap.sgis.visual.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * TMacroIdenvl entity. @author MyEclipse Persistence Tools
 */
@Entity
@Table(name = "T_MACRO_IDENVL")
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "tmacroidenmetas","handler"})

public class TMacroIdenvl implements java.io.Serializable {

	// Fields

	private int maivid;
	private TMacroIdent TMacroIdent;
	private String code;
	private String name;
	private String memo;
	private int status;
	private String parid;
	private Set<TMacroIdenmeta> TMacroidenmetas = new HashSet<TMacroIdenmeta>(0);

	// Constructors

	/** default constructor */
	public TMacroIdenvl() {
	}

	/** full constructor */
	public TMacroIdenvl(TMacroIdent TMacroIdent, String code, String name, String memo, int status, String parid,
			Set<TMacroIdenmeta> TMacroidenmetas) {
		this.TMacroIdent = TMacroIdent;
		this.code = code;
		this.name = name;
		this.memo = memo;
		this.status = status;
		this.parid = parid;
		this.TMacroidenmetas = TMacroidenmetas;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "MAIVID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getMaivid() {
		return this.maivid;
	}

	public void setMaivid(int maivid) {
		this.maivid = maivid;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MAITID")
	public TMacroIdent getTMacroIdent() {
		return this.TMacroIdent;
	}

	public void setTMacroIdent(TMacroIdent TMacroIdent) {
		this.TMacroIdent = TMacroIdent;
	}

	@Column(name = "CODE", length = 10)
	public String getCode() {
		return this.code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	@Column(name = "NAME", length = 50)
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
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

	@Column(name = "PARID", length = 10)
	public String getParid() {
		return this.parid;
	}

	public void setParid(String parid) {
		this.parid = parid;
	}

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TMacroIdenvl")
	public Set<TMacroIdenmeta> getTMacroidenmetas() {
		return this.TMacroidenmetas;
	}

	public void setTMacroidenmetas(Set<TMacroIdenmeta> TMacroidenmetas) {
		this.TMacroidenmetas = TMacroidenmetas;
	}

}