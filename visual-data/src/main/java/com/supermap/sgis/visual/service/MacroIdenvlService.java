package com.supermap.sgis.visual.service;

import com.supermap.sgis.visual.dao.MacroIdenvlDao;
import com.supermap.sgis.visual.entity.TMacroIdent;
import com.supermap.sgis.visual.entity.TMacroIdenvl;
import com.supermap.sgis.visual.tool.ExcelUtil;
import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by zhangjunfeng on 14-4-1.
 *
 *  Modify by Linhao on 2014-09-03
 *
 */
@Service
public class MacroIdenvlService extends BaseService {
    @Autowired
    MacroIdenvlDao macroIdenvlDao;

    public List<TMacroIdenvl> getByGroup(int gourpid) {
        return macroIdenvlDao.findByGourp(gourpid);
    }

    public TMacroIdenvl getByGroupAndEnum(int gourpid, int enumid) {
        return macroIdenvlDao.findByGourpAndEnum(gourpid, enumid);
    }

    public boolean create(TMacroIdenvl entity){
        if(entity != null){
            entity.setStatus(1);
            macroIdenvlDao.save(entity);
            return true;
        }
        return false;
    }

    public boolean update(int id, TMacroIdenvl entity) {
        if (macroIdenvlDao.exists(entity.getMaivid())) {
            macroIdenvlDao.save(entity);
            return true;
        }
        return false;
    }

    public boolean delete(int id){
        TMacroIdenvl idenvl = macroIdenvlDao.findOne(id);
        if(idenvl != null){
            macroIdenvlDao.delete(idenvl);
            return true;
        }

        return false;
    }

    /**
     * 分组值模板
     *
     * @return
     */
    public HSSFWorkbook downloadTemplate(){
        HSSFWorkbook hssfWorkbook = new HSSFWorkbook();

        try{
            HSSFFont font  = hssfWorkbook.createFont();
            font.setFontHeightInPoints((short)10);
            //font.setColor(HSSFFont.COLOR_RED); //字体颜色
            font.setFontName("黑体"); //字体
            font.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD); //宽度

            //font.setItalic(true); //是否使用斜体
            //font.setStrikeout(true); //是否使用划线

            // 设置单元格类型样式
            HSSFCellStyle cellStyle = hssfWorkbook.createCellStyle();
            cellStyle.setFont(font);
            cellStyle.setAlignment(HSSFCellStyle.ALIGN_CENTER); //水平布局：居中
            cellStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);//带边框
            cellStyle.setWrapText(true);
            cellStyle.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);//行底色
            cellStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);

            HSSFSheet sheet = hssfWorkbook.createSheet();
            HSSFRow head = sheet.createRow(0);
            HSSFCell nameCell = head.createCell(0);
            nameCell.setCellValue("名称");
            nameCell.setCellStyle(cellStyle);

            HSSFCell codeCell = head.createCell(1);
            codeCell.setCellValue("代码");
            codeCell.setCellStyle(cellStyle);

            HSSFCell paridCell = head.createCell(2);
            paridCell.setCellValue("父节点");
            paridCell.setCellStyle(cellStyle);

        }catch (Exception e){
            e.printStackTrace();
        }
        return hssfWorkbook;
    }

    /**
     * 将Excel数据导出数据库
     *
     * @param ident
     * @param path
     * @param sheetName
     * @param header_rows 去除表头行数
     * @return
     */
    public String  importIdenvl(TMacroIdent ident,String path,String sheetName,int header_rows){

        List<List<Object>> dataList = ExcelUtil.readExcel(path, sheetName, header_rows);
        List<String> errors = new ArrayList<>();
        int num = 0;
        if(dataList != null){
            int index = 0 ;
            for (List<Object> l : dataList){
                index++;
                //从excel取值 不能直接用get(i),空值会影响数组长度
                TMacroIdenvl idenvl = new TMacroIdenvl();
                String name = l.size()>0?l.get(0).toString():"";
                String code = l.size()>1?l.get(1).toString():"";
                String parid = l.size()>2?l.get(2).toString():"";
                if("".equals(code)||"".equals(name)){
                    errors.add("第"+index+"条代码或者名称为空;");
                    continue;
                }
                boolean isExists = checkIdenvlCodeExist(ident.getMaitid(),-1,code);
                if(isExists){
                    errors.add("第"+index+"条代码已经存在;");
                    continue;
                }
                idenvl.setName(name);
                idenvl.setCode(code);
                idenvl.setParid(parid);
                idenvl.setTMacroIdent(ident);
                macroIdenvlDao.save(idenvl);
                num++;
            }
        }

        return  num>0||errors.size()>0?"导入成功"+num+"条;导入失败"+errors+"条,"+errors.toString():"导入失败";
    }

    /**
     * 获取指定父节点下的一级子节点
     *
     * @param parid
     *          父节点
     * @param maitid
     *          指定分组
     * @return
     */
    public List<TMacroIdenvl> listRoot(String parid,int maitid){
        return macroIdenvlDao.findByParidAndMaitid(parid,maitid);
    }

    /**
     * 判断指定分组值是否有子节点
     *
     * @param maitid
     * @param code
     * @return
     */
    public boolean hasChildItemBygroupIdAndCode(int maitid,String code){
        //将当前节点作为父节点，检索是否存在记录
        List<TMacroIdenvl> list = macroIdenvlDao.findByParidAndMaitid(code,maitid);
        if(list != null && list.size() > 0)
            return true;
        return false;
    }

    /**
     * 判断是否存在code
     *
     * @param gourpid
     *
     * @param enumsid
     *             不为-1时，排除记录
     * @param code
     * @return
     *          false 代表不存在,true 代表存在
     */
    public boolean checkIdenvlCodeExist(int gourpid,int enumsid,String code){
        List<TMacroIdenvl> list = macroIdenvlDao.findByCodeAndMaitid(code,gourpid);
        if(list == null || list.size() <= 0)
            return false;

        if(enumsid == -1)
            return true;

        for (TMacroIdenvl idenvl : list){
            if(idenvl.getMaivid() != enumsid)
                return true;
        }
        return false;
    }

}
