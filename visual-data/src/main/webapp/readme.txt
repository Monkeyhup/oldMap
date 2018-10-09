【一】部署：
	1、新建数据库表空间、用户名、密码并授权
	2、导入数据库文件
	3、部署系统，修改数据库连接配置：文件路径：%home%\visdata\WEB-INF\classes\META-INF\persistence.xml
	4、启动服务
	5、访问系统：展示页面：localhost:8080/visual   后台管理页面：localhost:8080/visual/manager.html


【二】个性化配置
	1、行政区划面板快捷区域选择配置：%home%\visual\module\config\config.regionset.js
	2、地图以及模块配置：%home%\visual\config.js

	如果对背景地图不满意，自己有更好的地图，可以替换图片。注意 图片边界范围必须严格对应，如果清楚，请联系作者 Mr Tang

【三】数据库
    /*创建表空间、用户*/
    create tablespace VISUAL datafile 'D:\ORACLE\ORADATA\visual\VISUAL.DBF' size 1000m autoextend on next 200M maxsize unlimited extent management local segment space management auto;
    CREATE USER visual IDENTIFIED BY visual DEFAULT TABLESPACE VISUAL TEMPORARY TABLESPACE TEMP;
    GRANT CONNECT ,RESOURCE ,CREATE SESSION ,CREATE TABLE TO visual;
    GRANT DBA TO visual WITH ADMIN OPTION;

    /*可以用执行crebas.sql位文件初始化数据库表*/


    /* 导入数据*/
    Imp visual/visual@orcl file=D:\visual.dmp full=y;

    /*导出数据*/
    Exp visual/visual@local file = D:\visual.dmp


    /*如果导入的dmp里有样例数据 请清空数据*/
    delete temporary_import;
    delete t_macro_identinfo;
    delete t_macro_period;
    delete t_macro_tableinfo;
    delete t_macro_idenmeta;
    delete t_macro_tablemeta;
    delete t_macro_idenvl;
    delete t_macro_ident;
    delete t_macro_sndata;
    delete t_macro_shdata;
    delete t_macro_xndata;
    delete t_macro_xadata;
