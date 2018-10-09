
/*==============================================================*/
/* Table: T_MACRO_CNDATA                                        */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_CNDATA  (
   INFOID               NUMBER(10),
   REGIONCODE           VARCHAR2(12),
   IDEN_CODE            VARCHAR2(12),
   IDEN_VALUE           NUMBER(20,2)
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_CNDATA is
'普查区级成果';

comment on column SGIS_BUS.T_MACRO_CNDATA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_CNDATA.IDEN_VALUE is
'指标值';

/*==============================================================*/
/* Table: T_MACRO_IDENMETA                                      */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_IDENMETA  (
   MAIMID               NUMBER(10)                      not null,
   MATMID               NUMBER(10),
   MAIVID               NUMBER(10),
   IDEN_CODE            VARCHAR2(20),
   IDEN_NAME            VARCHAR2(100),
   IDEN_UNIT            VARCHAR2(20),
   IDEN_TYPE            NUMBER(4),
   IDEN_LENGTH          NUMBER(10),
   IDEN_PRECISION       NUMBER(10),
   MEMO                 VARCHAR2(50),
   STATUS               NUMBER(4),
   constraint PK_T_STA_IDEN primary key (MAIMID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 1024K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 6144K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_IDENMETA is
'定报指标
这里是指标+分组的展开项目
当MAIVID为0时为基本指标，其他枚举值时即为指标展开项，比如GDP_第一产业';

comment on column SGIS_BUS.T_MACRO_IDENMETA.MAIMID is
'指标ID';

comment on column SGIS_BUS.T_MACRO_IDENMETA.MATMID is
'内部分类ID';

comment on column SGIS_BUS.T_MACRO_IDENMETA.MAIVID is
'枚举值内码ID';

comment on column SGIS_BUS.T_MACRO_IDENMETA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_IDENMETA.IDEN_NAME is
'指标名称';

comment on column SGIS_BUS.T_MACRO_IDENMETA.IDEN_UNIT is
'单位';

comment on column SGIS_BUS.T_MACRO_IDENMETA.IDEN_TYPE is
'字段类型';

comment on column SGIS_BUS.T_MACRO_IDENMETA.IDEN_LENGTH is
'字段长度';

comment on column SGIS_BUS.T_MACRO_IDENMETA.IDEN_PRECISION is
'字段精度';

comment on column SGIS_BUS.T_MACRO_IDENMETA.MEMO is
'指标描述';

comment on column SGIS_BUS.T_MACRO_IDENMETA.STATUS is
'状态';

/*==============================================================*/
/* Index: "Reference_46_FK"                                     */
/*==============================================================*/
create index SGIS_BUS."Reference_46_FK" on SGIS_BUS.T_MACRO_IDENMETA (
   MATMID ASC
);

/*==============================================================*/
/* Index: "Reference_74_FK"                                     */
/*==============================================================*/
create index SGIS_BUS."Reference_74_FK" on SGIS_BUS.T_MACRO_IDENMETA (
   MAIVID ASC
);

/*==============================================================*/
/* Table: T_MACRO_IDENT                                         */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_IDENT  (
   MAITID               NUMBER(10)                      not null,
   NAME                 VARCHAR2(100),
   MEMO                 VARCHAR2(100),
   STATUS               NUMBER(4),
   constraint PK_T_BASEDOMAINTYPE primary key (MAITID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 1024K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_IDENT is
'枚举分组基础库表';

comment on column SGIS_BUS.T_MACRO_IDENT.MAITID is
'枚举类型内部ID';

comment on column SGIS_BUS.T_MACRO_IDENT.NAME is
'枚举类型名称';

comment on column SGIS_BUS.T_MACRO_IDENT.MEMO is
'备注';

comment on column SGIS_BUS.T_MACRO_IDENT.STATUS is
'状态';

/*==============================================================*/
/* Table: T_MACRO_IDENTINFO                                     */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_IDENTINFO  (
   MAIIID               NUMBER(10)                      not null,
   MAITID               NUMBER(10),
   MATMID               NUMBER(10),
   NAME                 VARCHAR2(100),
   MEMO                 VARCHAR2(100),
   STATUS               NUMBER(4),
   constraint PK_T_STA_IDENT primary key (MAIIID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 1024K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_IDENTINFO is
'定报指标枚举类型
一个基础指标可以对应多个分组，如GDP可以按照三产分组可以按照行业分组，多对多关系';

comment on column SGIS_BUS.T_MACRO_IDENTINFO.MAIIID is
'枚举类型内码';

comment on column SGIS_BUS.T_MACRO_IDENTINFO.MAITID is
'枚举类型内部ID';

comment on column SGIS_BUS.T_MACRO_IDENTINFO.MATMID is
'内部分类ID';

comment on column SGIS_BUS.T_MACRO_IDENTINFO.NAME is
'枚举类型名称';

comment on column SGIS_BUS.T_MACRO_IDENTINFO.MEMO is
'备注';

comment on column SGIS_BUS.T_MACRO_IDENTINFO.STATUS is
'状态';

/*==============================================================*/
/* Index: "Reference_47_FK"                                     */
/*==============================================================*/
create index SGIS_BUS."Reference_47_FK" on SGIS_BUS.T_MACRO_IDENTINFO (
   MATMID ASC
);

/*==============================================================*/
/* Index: "Reference_48_FK"                                     */
/*==============================================================*/
create index SGIS_BUS."Reference_48_FK" on SGIS_BUS.T_MACRO_IDENTINFO (
   MAITID ASC
);

/*==============================================================*/
/* Table: T_MACRO_IDENVL                                        */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_IDENVL  (
   MAIVID               NUMBER(10)                      not null,
   MAITID               NUMBER(10),
   CODE                 VARCHAR2(10),
   NAME                 VARCHAR2(50),
   MEMO                 VARCHAR2(50),
   STATUS               NUMBER(4),
   PARID                VARCHAR2(10),
   constraint PK_T_BASEDOMAINVALUE primary key (MAIVID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 1024K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_IDENVL is
'枚举值基础库表';

comment on column SGIS_BUS.T_MACRO_IDENVL.MAIVID is
'枚举值内码ID';

comment on column SGIS_BUS.T_MACRO_IDENVL.MAITID is
'枚举类型内部ID';

comment on column SGIS_BUS.T_MACRO_IDENVL.CODE is
'枚举值代码';

comment on column SGIS_BUS.T_MACRO_IDENVL.NAME is
'名称';

comment on column SGIS_BUS.T_MACRO_IDENVL.MEMO is
'枚举值解释';

comment on column SGIS_BUS.T_MACRO_IDENVL.STATUS is
'状态';

comment on column SGIS_BUS.T_MACRO_IDENVL.PARID is
'父节点';

/*==============================================================*/
/* Index: "Reference_50_FK"                                     */
/*==============================================================*/
create index SGIS_BUS."Reference_50_FK" on SGIS_BUS.T_MACRO_IDENVL (
   MAITID ASC
);

/*==============================================================*/
/* Table: T_MACRO_OTHERDATA                                     */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_OTHERDATA  (
   INFOID               NUMBER(10),
   REGIONCODE           VARCHAR2(12),
   IDEN_CODE            VARCHAR2(12),
   IDEN_VALUE           NUMBER(20,2)
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_OTHERDATA is
'其他级别的综合数据';

comment on column SGIS_BUS.T_MACRO_OTHERDATA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_OTHERDATA.IDEN_VALUE is
'指标值';

/*==============================================================*/
/* Table: T_MACRO_SHDATA                                        */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_SHDATA  (
   INFOID               NUMBER(10),
   REGIONCODE           VARCHAR2(12),
   IDEN_CODE            VARCHAR2(12),
   IDEN_VALUE           NUMBER(20,2)
)
pctfree 10
initrans 1
storage
(
    initial 34816K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_SHDATA is
'市级成果';

comment on column SGIS_BUS.T_MACRO_SHDATA.REGIONCODE is
'行政区划代码';

comment on column SGIS_BUS.T_MACRO_SHDATA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_SHDATA.IDEN_VALUE is
'指标值';

/*==============================================================*/
/* Table: T_MACRO_SNDATA                                        */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_SNDATA  (
   INFOID               NUMBER(10),
   REGIONCODE           VARCHAR2(12),
   IDEN_CODE            VARCHAR2(10),
   IDEN_VALUE           NUMBER(20,2)
)
pctfree 10
initrans 1
storage
(
    initial 33792K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_SNDATA is
'省级成果';

comment on column SGIS_BUS.T_MACRO_SNDATA.REGIONCODE is
'行政区划代码';

comment on column SGIS_BUS.T_MACRO_SNDATA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_SNDATA.IDEN_VALUE is
'指标值';

/*==============================================================*/
/* Table: T_MACRO_TABLEINFO                                     */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_TABLEINFO  (
   MATIID               NUMBER(10)                      not null,
   MATMID               NUMBER(10),
   NAME                 VARCHAR2(20),
   YEAR                 NUMBER(4),
   MONTH                NUMBER(4),
   REPORT_TYPE          NUMBER(4),
   REPORT_TYPE_NAME     VARCHAR2(20),
   STATUS               NUMBER(4),
   FLAG_A               VARCHAR2(20),
   FLAG_B               VARCHAR2(20),
   FLAG_C               VARCHAR2(20),
   constraint STA_CODE primary key (MATIID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 64K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_TABLEINFO is
'各类综合定报时段信息
由于和数据表是关联的，在实际开发中需要将关联去除';

comment on column SGIS_BUS.T_MACRO_TABLEINFO.MATIID is
'定报内码';

comment on column SGIS_BUS.T_MACRO_TABLEINFO.MATMID is
'内部分类ID';

comment on column SGIS_BUS.T_MACRO_TABLEINFO.NAME is
'定报名称';

comment on column SGIS_BUS.T_MACRO_TABLEINFO.REPORT_TYPE is
'报告期类型 年月季 经济普查 人口普查';

comment on column SGIS_BUS.T_MACRO_TABLEINFO.REPORT_TYPE_NAME is
'报告期类型名称（年月季度等）';

comment on column SGIS_BUS.T_MACRO_TABLEINFO.STATUS is
'状态';

/*==============================================================*/
/* Index: "Reference_28_FK"                                     */
/*==============================================================*/
create index SGIS_BUS."Reference_28_FK" on SGIS_BUS.T_MACRO_TABLEINFO (
   MATMID ASC
);

/*==============================================================*/
/* Table: T_MACRO_TABLEMETA                                     */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_TABLEMETA  (
   MATMID               NUMBER(10)                      not null,
   RCID                 NUMBER(10),
   ACID                 NUMBER(10),
   IDEN_NAME            VARCHAR2(100),
   IDEN_CODE            VARCHAR2(20),
   IDEN_UNIT            VARCHAR2(50),
   PARID                NUMBER(10),
   MACTABLE_TYPE        NUMBER(4),
   MACDATA_TYPE         NUMBER(4),
   MACMETA_TYPE         NUMBER(4),
   REPORT_TYPE          NUMBER(4),
   REPORT_TYPE_NAME     VARCHAR2(20),
   YEAR                 NUMBER(4),
   MONTH                NUMBER(4),
   HAS_CHILD            NUMBER(4),
   REGION_LEVEL         NUMBER(4),
   MEMO                 VARCHAR2(200),
   MODULE               VARCHAR2(15),
   STATUS               NUMBER(4),
   PERMISSION           NUMBER(4)                      default 1,
   ORDERBY              NUMBER(10),
   FLAG_A               VARCHAR2(20),
   FLAG_B               VARCHAR2(20),
   FLAG_C               VARCHAR2(20),
   constraint PK_T_STA_IDENCATALOG primary key (MATMID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 1024K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 4096K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_TABLEMETA is
'综合表目录
能够描述模板、目录、表、指标';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.MATMID is
'内部分类ID';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.ACID is
'与区域经济分组相关，默认为0';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.IDEN_NAME is
'分类名称';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.IDEN_UNIT is
'基本指标单位';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.PARID is
'父节点';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.MACTABLE_TYPE is
'数据表类型（实体表、视图、API获取等等）';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.MACDATA_TYPE is
'数据内容类型，默认是综合汇总数据（可以是特色汇总数据、特色自动汇总数据）';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.MACMETA_TYPE is
'元数据类型（顶层目录、模板、目录、表、指标项）';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.REPORT_TYPE is
'报告期类型 年月季 经济普查 人口普查';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.REPORT_TYPE_NAME is
'报告期类型名称（年月季度等）';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.HAS_CHILD is
'子节点';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.REGION_LEVEL is
'所属行政区划级别';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.MEMO is
'备注';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.STATUS is
'状态';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.PERMISSION is
'是否受权限控制，默认1为受控';

comment on column SGIS_BUS.T_MACRO_TABLEMETA.ORDERBY is
'排序字段';

/*==============================================================*/
/* Index: "Reference_57_FK"                                     */
/*==============================================================*/
create index SGIS_BUS."Reference_57_FK" on SGIS_BUS.T_MACRO_TABLEMETA (
   RCID ASC
);

/*==============================================================*/
/* Table: T_MACRO_WDDATA                                        */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_WDDATA  (
   INFOID               NUMBER(10),
   REGIONCODE           VARCHAR2(12),
   IDEN_CODE            VARCHAR2(10),
   IDEN_VALUE           NUMBER(20,2)
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_WDDATA is
'国家级级成果（可以存储世界级数据）';

comment on column SGIS_BUS.T_MACRO_WDDATA.REGIONCODE is
'行政区划代码';

comment on column SGIS_BUS.T_MACRO_WDDATA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_WDDATA.IDEN_VALUE is
'指标值';

/*==============================================================*/
/* Table: T_MACRO_XADATA                                        */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_XADATA  (
   INFOID               NUMBER(10),
   REGIONCODE           VARCHAR2(12),
   IDEN_CODE            VARCHAR2(10),
   IDEN_VALUE           NUMBER(20,2)
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_XADATA is
'乡镇成果';

comment on column SGIS_BUS.T_MACRO_XADATA.REGIONCODE is
'行政区划代码';

comment on column SGIS_BUS.T_MACRO_XADATA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_XADATA.IDEN_VALUE is
'指标值';

/*==============================================================*/
/* Table: T_MACRO_XNDATA                                        */
/*==============================================================*/
create table SGIS_BUS.T_MACRO_XNDATA  (
   INFOID               NUMBER(10),
   REGIONCODE           VARCHAR2(12),
   IDEN_CODE            VARCHAR2(12),
   IDEN_VALUE           NUMBER(20,2)
)
pctfree 10
initrans 1
storage
(
    initial 30720K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_MACRO_XNDATA is
'县级成果';

comment on column SGIS_BUS.T_MACRO_XNDATA.REGIONCODE is
'行政区划代码';

comment on column SGIS_BUS.T_MACRO_XNDATA.IDEN_CODE is
'指标代码';

comment on column SGIS_BUS.T_MACRO_XNDATA.IDEN_VALUE is
'指标值';


/*==============================================================*/
/* Table: T_REGIONCATALOG                                       */
/*==============================================================*/
create table SGIS_BUS.T_REGIONCATALOG  (
   RCID                 NUMBER(10)                      not null,
   NAME                 VARCHAR2(20),
   STATUS               NUMBER(4),
   YEAR                 NUMBER(4),
   DATA_SOURCE          VARCHAR2(20),
   DATA_SET             VARCHAR2(20),
   MEMO                 VARCHAR2(100),
   FLAG_A               VARCHAR2(20),
   FLAG_B               VARCHAR2(20),
   FLAG_C               VARCHAR2(20),
   constraint PK_T_UNITCATALOG primary key (RCID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 64K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 64K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_REGIONCATALOG is
'行政区划分类';

comment on column SGIS_BUS.T_REGIONCATALOG.STATUS is
'状态';

comment on column SGIS_BUS.T_REGIONCATALOG.DATA_SOURCE is
'数据源名称，用于更新行政区划树坐标';

comment on column SGIS_BUS.T_REGIONCATALOG.DATA_SET is
'对应数据集名称';

/*==============================================================*/
/* Table: T_REGIONINFO                                          */
/*==============================================================*/
create table SGIS_BUS.T_REGIONINFO  (
   RGID                 NUMBER(10)                      not null,
   RCID                 NUMBER(10),
   REGIONCODE           VARCHAR2(12),
   NAME                 VARCHAR2(100),
   PARCODE              VARCHAR2(12),
   SUBCODE              VARCHAR2(12),
   REGIONLEVEL          NUMBER(4),
   SMX                  NUMBER(38,16),
   SMY                  NUMBER(38,16),
   constraint PK_T_CENUNIT_TREE primary key (RGID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 17408K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 73728K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_REGIONINFO is
'行政区划树';

comment on column SGIS_BUS.T_REGIONINFO.RGID is
'区划ID';

comment on column SGIS_BUS.T_REGIONINFO.REGIONCODE is
'区划代码';

comment on column SGIS_BUS.T_REGIONINFO.NAME is
'普查区名称';

comment on column SGIS_BUS.T_REGIONINFO.PARCODE is
'父节点';

comment on column SGIS_BUS.T_REGIONINFO.SUBCODE is
'子节点';

comment on column SGIS_BUS.T_REGIONINFO.REGIONLEVEL is
'行政区划级别';

comment on column SGIS_BUS.T_REGIONINFO.SMX is
'X坐标';

comment on column SGIS_BUS.T_REGIONINFO.SMY is
'Y坐标';

/*==============================================================*/
/* Index: "Reference_52_FK"                                     */
/*==============================================================*/
create index SGIS_BUS."Reference_52_FK" on SGIS_BUS.T_REGIONINFO (
   RCID ASC
);




/*==============================================================*/
/* Table: T_USERS                                               */
/*==============================================================*/
create table SGIS_BUS.T_USERS  (
   USERID               NUMBER(10)                      not null,
   USER_NAME            VARCHAR2(50),
   USER_CAPTION         VARCHAR2(50),
   USER_REGION          VARCHAR2(12),
   USER_PARTMENT        VARCHAR2(50),
   PASSWORD             VARCHAR2(32),
   MEMO                 VARCHAR2(100),
   STATUS               NUMBER(4),
   EMAIL                VARCHAR2(50),
   PHONE                VARCHAR2(20),
   FLAG_A               VARCHAR2(20),
   FLAG_B               VARCHAR2(20),
   FLAG_C               VARCHAR2(20),
   constraint PK_T_USERS primary key (USERID)
         using index
       pctfree 10
       initrans 2
       storage
       (
           initial 1024K
           minextents 1
           maxextents unlimited
       )
       tablespace SGIS_BUS
        logging
)
pctfree 10
initrans 1
storage
(
    initial 1024K
    minextents 1
    maxextents unlimited
)
tablespace SGIS_BUS
logging
monitoring
 noparallel;

comment on table SGIS_BUS.T_USERS is
'用户表';

comment on column SGIS_BUS.T_USERS.USERID is
'用户ID';

comment on column SGIS_BUS.T_USERS.USER_NAME is
'登录名';

comment on column SGIS_BUS.T_USERS.USER_CAPTION is
'姓名';

comment on column SGIS_BUS.T_USERS.USER_REGION is
'用户所属行政区划';

comment on column SGIS_BUS.T_USERS.USER_PARTMENT is
'用户所在部门';

comment on column SGIS_BUS.T_USERS.PASSWORD is
'密码';

comment on column SGIS_BUS.T_USERS.MEMO is
'备注信息';

comment on column SGIS_BUS.T_USERS.STATUS is
'状态';

comment on column SGIS_BUS.T_USERS.EMAIL is
'Email地址';

comment on column SGIS_BUS.T_USERS.PHONE is
'联系电话';





alter table SGIS_BUS.T_MACRO_IDENMETA
   add constraint FK_T_MACRO__REFERENCE_T_MACRO3 foreign key (MATMID)
      references SGIS_BUS.T_MACRO_TABLEMETA (MATMID);

alter table SGIS_BUS.T_MACRO_IDENMETA
   add constraint FK_T_MACRO__REFERENCE_T_MACRO6 foreign key (MAIVID)
      references SGIS_BUS.T_MACRO_IDENVL (MAIVID);

alter table SGIS_BUS.T_MACRO_IDENTINFO
   add constraint FK_T_MACRO__REFERENCE_T_MACRO_ foreign key (MATMID)
      references SGIS_BUS.T_MACRO_TABLEMETA (MATMID);

alter table SGIS_BUS.T_MACRO_IDENTINFO
   add constraint FK_T_MACRO__REFERENCE_T_MACRO4 foreign key (MAITID)
      references SGIS_BUS.T_MACRO_IDENT (MAITID);

alter table SGIS_BUS.T_MACRO_IDENVL
   add constraint FK_T_MACRO__REFERENCE_T_MACRO2 foreign key (MAITID)
      references SGIS_BUS.T_MACRO_IDENT (MAITID);

alter table SGIS_BUS.T_MACRO_TABLEINFO
   add constraint FK_T_MACRO__REFERENCE_T_MACRO5 foreign key (MATMID)
      references SGIS_BUS.T_MACRO_TABLEMETA (MATMID);

alter table SGIS_BUS.T_MACRO_TABLEMETA
   add constraint FK_T_MACRO__REFERENCE_T_REGIO2 foreign key (RCID)
      references SGIS_BUS.T_REGIONCATALOG (RCID);

alter table SGIS_BUS.T_REGIONINFO
   add constraint FK_T_REGION_REFERENCE_T_REGION foreign key (RCID)
      references SGIS_BUS.T_REGIONCATALOG (RCID);






