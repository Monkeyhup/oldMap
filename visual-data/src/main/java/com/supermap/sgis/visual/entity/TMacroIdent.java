package com.supermap.sgis.visual.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * TMacroIdent entity. @author MyEclipse Persistence Tools
 */
@Entity
@Table(name = "T_MACRO_IDENT")
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "tmacroidentinfos", "tmacroidenvls", "handler"})

public class TMacroIdent implements java.io.Serializable {

	// Fields

	private int maitid;
	private String name;
	private String memo;
	private int status;
	private Set<TMacroIdentinfo> TMacroidentinfos = new HashSet<TMacroIdentinfo>(0);
	private Set<TMacroIdenvl> TMacroidenvls = new HashSet<TMacroIdenvl>(0);

	// Constructors

	/** default constructor */
	public TMacroIdent() {
	}

	/** full constructor */
	public TMacroIdent(String name, String memo, int status, Set<TMacroIdentinfo> TMacroIdentinfos,
			Set<TMacroIdenvl> TMacroIdenvls) {
		this.name = name;
		this.memo = memo;
		this.status = status;
		this.TMacroidentinfos = TMacroIdentinfos;
		this.TMacroidenvls = TMacroIdenvls;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "MAITID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getMaitid() {
		return this.maitid;
	}

	public void setMaitid(int maitid) {
		this.maitid = maitid;
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

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TMacroIdent")
	public Set<TMacroIdentinfo> getTMacroidentinfos() {
		return this.TMacroidentinfos;
	}

	public void setTMacroidentinfos(Set<TMacroIdentinfo> TMacroidentinfos) {
		this.TMacroidentinfos = TMacroidentinfos;
	}

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TMacroIdent")
	public Set<TMacroIdenvl> getTMacroidenvls() {
		return this.TMacroidenvls;
	}

	public void setTMacroidenvls(Set<TMacroIdenvl> TMacroidenvls) {
		this.TMacroidenvls = TMacroidenvls;
	}

}