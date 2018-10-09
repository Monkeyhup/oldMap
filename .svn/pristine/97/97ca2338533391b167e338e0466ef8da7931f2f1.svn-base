package com.supermap.sgis.visual.entity;



import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Created by jinn on 2016/3/4.
 */
@Entity
@Table(name = "T_FEEDBACK")
public class TFeedBack implements Serializable {

    private Integer fdid;
    private String theme;
    private String content;
    private String phone;
    private String email;
    private String memo;
    private String flagA;
    private String flagB;
    private long time;
    private String ip;

    public TFeedBack() {
    }

    public TFeedBack(String theme, String content, String phone, String email, String memo, String flagA, String flagB, long time, String ip) {
        this.fdid = fdid;
        this.theme = theme;
        this.content = content;
        this.phone = phone;
        this.email = email;
        this.memo = memo;
        this.flagA = flagA;
        this.flagB = flagB;
        this.time = time;
        this.ip = ip;
    }

    @GenericGenerator(name = "generator", strategy = "increment")
    @Id
    @GeneratedValue(generator = "generator")
    @Column(name = "FDID", unique = true, nullable = false, precision = 10, scale = 0)
    public Integer getFdid() {
        return fdid;
    }
    public void setFdid(Integer fdid) {
        this.fdid = fdid;
    }


    @Column(name = "THEME", length = 20)
    public String getTheme() {
        return theme;
    }
    public void setTheme(String theme) {
        this.theme = theme;
    }


    @Column(name = "CONTENT", length = 300)
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }



    @Column(name = "PHONE", length = 20)
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }



    @Column(name = "EMAIL", length = 50)
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }



    @Column(name = "MEMO", length = 30)
    public String getMemo() {
        return memo;
    }
    public void setMemo(String memo) {
        this.memo = memo;
    }


    @Column(name = "FLAGA", length = 30)
    public String getFlagA() {
        return flagA;
    }
    public void setFlagA(String flagA) {
        this.flagA = flagA;
    }



    @Column(name = "FLAGB", length = 30)
    public String getFlagB() {
        return flagB;
    }
    public void setFlagB(String flagB) {
        this.flagB = flagB;
    }



    @Column(name = "TIME", precision = 30, scale = 0)
    public long getTime() {
        return time;
    }
    public void setTime(long time) {
        this.time = time;
    }



    @Column(name = "IP",  length = 20)
    public String getIp() {
        return ip;
    }
    public void setIp(String ip) {
        this.ip = ip;
    }
}
