package com.supermap.sgis.visual.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * TMacroPeriod entity. @author MyEclipse Persistence Tools
 * 综合数据报告期
 */
@Entity
@Table(name = "T_MACRO_PERIOD")
public class TMacroPeriod implements java.io.Serializable {

	// Fields

	private int mapid;
	private TRegioncatalog TRegioncatalog;
	private String name;
	private int acid;
	private int year;
	private int month;
	private int reportType;
	private String reportTypeName;
	private int status;
	private String flagC;
	private String flagA;
	private String flagB;
	private Set<TMacroTableinfo> TMacroTableinfos = new HashSet<TMacroTableinfo>(0);

	// Constructors

	/** default constructor */
	public TMacroPeriod() {
	}

	/** full constructor */
	public TMacroPeriod(TRegioncatalog TRegioncatalog, String name, int acid, int year, int month, int reportType,
			String reportTypeName, int status, String flagC, String flagA, String flagB,
			Set<TMacroTableinfo> TMacroTableinfos) {
		this.TRegioncatalog = TRegioncatalog;
		this.name = name;
		this.acid = acid;
		this.year = year;
		this.month = month;
		this.reportType = reportType;
		this.reportTypeName = reportTypeName;
		this.status = status;
		this.flagC = flagC;
		this.flagA = flagA;
		this.flagB = flagB;
		this.TMacroTableinfos = TMacroTableinfos;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "MAPID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getMapid() {
		return this.mapid;
	}

	public void setMapid(int mapid) {
		this.mapid = mapid;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "RCID")
	public TRegioncatalog getTRegioncatalog() {
		return this.TRegioncatalog;
	}

	public void setTRegioncatalog(TRegioncatalog TRegioncatalog) {
		this.TRegioncatalog = TRegioncatalog;
	}

	@Column(name = "NAME", length = 20)
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "ACID", precision = 10, scale = 0)
	public int getAcid() {
		return this.acid;
	}

	public void setAcid(int acid) {
		this.acid = acid;
	}

	@Column(name = "YEAR", precision = 4, scale = 0)
	public int getYear() {
		return this.year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	@Column(name = "MONTH", precision = 4, scale = 0)
	public int getMonth() {
		return this.month;
	}

	public void setMonth(int month) {
		this.month = month;
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

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TMacroPeriod")
	public Set<TMacroTableinfo> getTMacroTableinfos() {
		return this.TMacroTableinfos;
	}

	public void setTMacroTableinfos(Set<TMacroTableinfo> TMacroTableinfos) {
		this.TMacroTableinfos = TMacroTableinfos;
	}

}