package com.supermap.sgis.visual.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

/**
 * TRegioninfo entity. @author MyEclipse Persistence Tools
 */
@Entity
@Table(name = "T_REGIONINFO")
public class TRegioninfo implements java.io.Serializable {

	// Fields

	private int rgid;
	private TRegioncatalog TRegioncatalog;
	private String regioncode;// Constructors

	/** default constructor */
	public TRegioninfo() {
	}
	private String name;
	private String parcode;
	private String subcode;
	private int regionlevel;
	private double smx=0;
	private double smy=0;



	/** full constructor */
	public TRegioninfo(TRegioncatalog TRegioncatalog, String regioncode, String name, String parcode, String subcode,
			int regionlevel, int smx, int smy) {
		this.TRegioncatalog = TRegioncatalog;
		this.regioncode = regioncode;
		this.name = name;
		this.parcode = parcode;
		this.subcode = subcode;
		this.regionlevel = regionlevel;
		this.smx = smx;
		this.smy = smy;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "RGID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getRgid() {
		return this.rgid;
	}
	public void setRgid(int rgid) {
		this.rgid = rgid;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "RCID")
	public TRegioncatalog getTRegioncatalog() {
		return this.TRegioncatalog;
	}
	public void setTRegioncatalog(TRegioncatalog TRegioncatalog) {
		this.TRegioncatalog = TRegioncatalog;
	}

	@Column(name = "REGIONCODE", length = 12)
	public String getRegioncode() {
		return this.regioncode;
	}
	public void setRegioncode(String regioncode) {
		this.regioncode = regioncode;
	}

	@Column(name = "NAME", length = 100)
	public String getName() {
		return this.name;
	}
	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "PARCODE", length = 12)
	public String getParcode() {
		return this.parcode;
	}
	public void setParcode(String parcode) {
		this.parcode = parcode;
	}

	@Column(name = "SUBCODE", length = 12)
	public String getSubcode() {
		return this.subcode;
	}
	public void setSubcode(String subcode) {
		this.subcode = subcode;
	}

	@Column(name = "REGIONLEVEL", precision = 4, scale = 0)
	public int getRegionlevel() {
		return this.regionlevel;
	}
	public void setRegionlevel(int regionlevel) {
		this.regionlevel = regionlevel;
	}

	@Column(name = "SMX", precision = 38, scale = 16)
	public double getSmx() {
		return this.smx;
	}
	public void setSmx(double smx) {
		this.smx = smx;
	}

	@Column(name = "SMY", precision = 38, scale = 16)
	public double getSmy() {
		return this.smy;
	}
	public void setSmy(double smy) {
		this.smy = smy;
	}

}