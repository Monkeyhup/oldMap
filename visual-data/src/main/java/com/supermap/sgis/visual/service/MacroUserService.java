package com.supermap.sgis.visual.service;

import com.supermap.sgis.visual.dao.MacroUserDao;
import com.supermap.sgis.visual.data.OpStatus;
import com.supermap.sgis.visual.entity.TUsers;
import org.apache.poi.hssf.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by chenpeng on 15/11/28.
 */
@Service
public class MacroUserService extends BaseService{
    @Autowired
    MacroUserDao macroUserDao;
    /**
     *  传入用户注册信息，然后判断该用户名是否被注册
     *
     * */
    public TUsers registerUser(String username,String password){
        TUsers user = macroUserDao.checkExist(username);
        if (user == null){
            //该用户名未被注册，写入数据库
            user = new TUsers(username,"null", "null", "null",password,"null", 0, "null", "null",0,"null","null", "null");
            macroUserDao.save(user);
            return user;
        }else {
            return null;
        }
    }

    /**
     *  传入用户登录信息，然后判断该用户名密码是否正确
     *
     * */
    public TUsers loginUser(String username,String password){
        TUsers user = macroUserDao.checkTure(username,password);
        if (user == null){
            //用户名或者密码错误
            return null;
        }else {
            return user;
        }
    }

    /**
     * Excel数据处理
     * */
    public HSSFWorkbook ExportService(String[] header,String[] data){

        HSSFWorkbook wb = new HSSFWorkbook();
        HSSFSheet sheet = wb.createSheet("测试");
        HSSFRow row = sheet.createRow((int)0);
        HSSFCellStyle style = wb.createCellStyle();
        style.setAlignment(HSSFCellStyle.ALIGN_CENTER);

        for (int i = 0; i < header.length;i++){
            HSSFCell cell = row.createCell(i);
            cell.setCellValue(header[i]);
            cell.setCellStyle(style);
            sheet.autoSizeColumn(i);
        }

        for (int i = 0; i < data.length/(header.length + 1); i++){
            row = sheet.createRow(i+1);
            for (int j = 1; j < header.length + 1;j++){
                row.createCell(j - 1).setCellValue(data[(header.length + 1) * i + j]);
            }
        }

        return wb;
    }

}
