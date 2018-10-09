package com.supermap.sgis.visual.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * TUsers entity. @author MyEclipse Persistence Tools
 * 用户信息（基本信息、角色组、专业组、系统权限组、数据权限组）
 */
@Entity
@Table(name = "T_USERS")
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "tuserrolerelations", "tusermajorrelations","tdatauserpowers","tuserpowerrelations","password", "handler"})
public class TUsers implements java.io.Serializable {

	// Fields

	private int userid;
	private String userName;
	private String userCaption;
	private String userRegion;
	private String userPartment;
	private String password;
	private String memo;
	private int status;
	private String email;
	private String phone;
    private int sys_role;
	private String flagA;
	private String flagB;
	private String flagC;

	// Constructors

	/** default constructor */
	public TUsers() {
	}

	/** full constructor */
	public TUsers(String userName, String userCaption, String userRegion, String userPartment, String password,
				  String memo, int status, String email, String phone, int sys_role, String flagA, String flagB, String flagC
				  ) {
		this.userName = userName;
		this.userCaption = userCaption;
		this.userRegion = userRegion;
		this.userPartment = userPartment;
		this.password = password;
		this.memo = memo;
		this.status = status;
		this.email = email;
        this.sys_role= sys_role;
		this.phone = phone;
		this.flagA = flagA;
		this.flagB = flagB;
		this.flagC = flagC;
	}

	// Property accessors
	@GenericGenerator(name = "generator", strategy = "increment")
	@Id
	@GeneratedValue(generator = "generator")
	@Column(name = "USERID", unique = true, nullable = false, precision = 10, scale = 0)
	public int getUserid() {
		return this.userid;
	}

	public void setUserid(int userid) {
		this.userid = userid;
	}

	@Column(name = "USER_NAME", length = 50)
	public String getUserName() {
		return this.userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	@Column(name = "USER_CAPTION", length = 50)
	public String getUserCaption() {
		return this.userCaption;
	}

	public void setUserCaption(String userCaption) {
		this.userCaption = userCaption;
	}

	@Column(name = "USER_REGION", length = 12)
	public String getUserRegion() {
		return this.userRegion;
	}

	public void setUserRegion(String userRegion) {
		this.userRegion = userRegion;
	}

	@Column(name = "USER_PARTMENT", length = 50)
	public String getUserPartment() {
		return this.userPartment;
	}

	public void setUserPartment(String userPartment) {
		this.userPartment = userPartment;
	}

	@Column(name = "PASSWORD", length = 32)
	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
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

    @Column(name= "SYS_ROLE" ,precision = 4,scale = 0)
    public int getSys_role(){
        return this.sys_role;
    }
    public void setSys_role(int sys_role){
        this.sys_role = sys_role;
    }

	@Column(name = "EMAIL", length = 50)
	public String getEmail() {
		return this.email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	@Column(name = "PHONE", length = 20)
	public String getPhone() {
		return this.phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
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

}