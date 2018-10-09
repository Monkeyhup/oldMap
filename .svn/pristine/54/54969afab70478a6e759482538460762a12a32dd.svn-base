package com.supermap.sgis.visual.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * TRegioncatalog entity. @author MyEclipse Persistence Tools
 * 行政区划类型
 */
@Entity
@Table(name = "T_REGIONCATALOG")
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "tregioninfos","tmacroperiods", "handler"})
public class TRegioncatalog implements java.io.Serializable {



	private int rcid;
	private String name;
	private int status;//状态（0不可用，1可用，2默认显示）
	private int year;
    private String memo;
	private Set<TRegioninfo> TRegioninfos = new HashSet<TRegioninfo>(0);//关联行政区划
	private Set<TMacroPeriod> TMacroperiods = new HashSet<TMacroPeriod>(0);//关联综合数据报告期

	// Constructors

	/** default constructor */
	public TRegioncatalog() {
	}

	/** full constructor */
	public TRegioncatalog(String name, int status, int year,String memo,
						  Set<TRegioninfo> TRegioninfos,Set<TMacroPeriod> TMacroperiods) {
		this.name = name;
		this.status = status;
		this.year = year;
		this.memo = memo;
		this.TRegioninfos = TRegioninfos;
		this.TMacroperiods = TMacroperiods;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "RCID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getRcid() {
		return this.rcid;
	}
	public void setRcid(int rcid) {
		this.rcid = rcid;
	}

	@Column(name = "NAME", length = 20)
	public String getName() {
		return this.name;
	}
	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "STATUS", precision = 4, scale = 0)
	public int getStatus() {
		return this.status;
	}
	public void setStatus(int status) {
		this.status = status;
	}

	@Column(name = "YEAR", precision = 4, scale = 0)
	public int getYear() {
		return this.year;
	}
	public void setYear(int year) {
		this.year = year;
	}

    @Column(name = "MEMO", length = 200)
    public String getMemo() { return memo;}
    public void setMemo(String memo) { this.memo = memo;}

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TRegioncatalog")
	public Set<TRegioninfo> getTRegioninfos() {
		return this.TRegioninfos;
	}
	public void setTRegioninfos(Set<TRegioninfo> TRegioninfos) {
		this.TRegioninfos = TRegioninfos;
	}

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TRegioncatalog")
	public Set<TMacroPeriod> getTMacroperiods() {
		return this.TMacroperiods;
	}
	public void setTMacroperiods(Set<TMacroPeriod> TMacroperiods) {
		this.TMacroperiods = TMacroperiods;
	}

}