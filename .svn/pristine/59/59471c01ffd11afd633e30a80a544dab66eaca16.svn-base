package com.supermap.sgis.visual.api;

import com.supermap.sgis.visual.common.MacroExcelDataUtil;
import com.supermap.sgis.visual.data.OpStatus;
import com.supermap.sgis.visual.json.MacroDataResult;
import com.supermap.sgis.visual.tool.ExcelUtil;
import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.SerializationConfig;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 在线制图的Excel文件上传相关操作
 * <p>
 *     上传的Excel文件放在个人目录下: macro-excel-data/
 * </p>
 * Created by Linhao on 2014/10/30.
 */
@Controller
@RequestMapping(value = {"/macroexceldata","/service/macroexceldata"})
public class MacroExcelDataController extends BaseController {

    /**上传的Excel文件放在个人目录下: macro-excel-data/*/
    private static final String UPLOAD_EXCEL_PATH = "macro-excel-data";

    /**
     * Excel文件上传
     *
     * @param request
     * @param response
     * @throws Exception
     */
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    @ResponseBody
    public void uploadExcelFile(HttpServletRequest request,
          HttpServletResponse response) throws Exception{
        response.setHeader("Content-type", "text/html;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        //上传文件处理器
        MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
        //文件对象
        CommonsMultipartFile file = (CommonsMultipartFile) multipartRequest.getFile("file");

        String realFileName = file.getOriginalFilename();

        String savePath = uploadFilePath;
        if(!savePath.endsWith(File.separator)){
            savePath += File.separator;
        }
        savePath += UPLOAD_EXCEL_PATH;

        File dir = new File(savePath);
        if(!dir.exists()){
            dir.mkdirs();
        }

        Date now = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        String dateStr = sdf.format(now);
        int loc = realFileName.lastIndexOf(".");
        String newFileName = realFileName.substring(0,loc)+"("+dateStr+")"+realFileName.substring(loc);

        File uploadFile = new File(dir,newFileName);
        if(uploadFile.exists()){
            uploadFile.delete();
        }

        FileCopyUtils.copy(file.getBytes(),uploadFile);
        Map<String, Object> reMap = getUploadResult(uploadFile.getName());
        ObjectMapper mapper  = new ObjectMapper() ;
        mapper.configure(SerializationConfig.Feature.INDENT_OUTPUT, Boolean.TRUE);
        PrintWriter out = response.getWriter();
        out.print(mapper.writeValueAsString(reMap));
        out.flush();
        out.close();
    }

    /**
     * 下载在线制图的Excel模板
     *
     * @param request
     * @param response
     * @throws Exception
     */
    @RequestMapping(value = "/template/download",method = RequestMethod.GET)
    @ResponseBody
    public void downloadTempalte(HttpServletRequest request,HttpServletResponse response)
            throws  Exception{
        String fileName = new String("综合在线制图模板".getBytes(),"iso8859-1");
        response.reset();
        response.setContentType("APPLICATION/vnd.ms-excel");
        //注意，如果去掉下面一行代码中的attachment; 那么也会使IE自动打开文件。
        response.setHeader("Content-Disposition", "attachment;filename="+fileName+".xls");
        HSSFWorkbook wk = downloadTemplate();   //在线制图的Excel模板
        OutputStream out  =response.getOutputStream() ;
        wk.write(out);
        out.flush();
        out.close();
    }


    /**
     * 上传的所有Excel文件列表
     *
     * @param request
     */
    @RequestMapping(value = "/alluploadinfo", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getAllUploadedFilesInfo(HttpServletRequest request){
        List<Map<String, Object>> re = new ArrayList<Map<String, Object>>();

        String savePath = uploadFilePath;
        if(!savePath.endsWith(File.separator)){
            savePath += File.separator;
        }
        savePath += UPLOAD_EXCEL_PATH;

        File dir = new File(savePath);
        if(dir.exists()){
            File[] files = dir.listFiles();
            if(files != null && files.length > 0){
                //按修改时间降序
                Arrays.sort(files, new Comparator<File>() {
                    @Override
                    public int compare(File o1, File o2) {
                        long t1 = o1.lastModified();
                        long t2 = o2.lastModified();
                        if (t1 > t2) {
                            return -1;
                        } else if (t1 < t2) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                });

                for (int i=0,len=files.length; i < len; i++) {
                    File f = files[i];
                    if(f != null && f.exists() && f.isFile()){
                        String fileName = f.getName();
                        if(!fileName.endsWith(".xls") && !fileName.endsWith(".xlsx"))
                            continue;
                        Map<String, Object> reMap = getUploadResult(fileName);
                        re.add(reMap);
                    }
                }
            }
        }
        return re;
    }

    /**
     * 获取指定文件名和sheetName的MacroDataResult数据
     *
     * @param request
     *
     * @param fileName
     *
     * @param sheetName
     *
     * @return
     */
    @RequestMapping(value = "/getuploadexceldata", method = RequestMethod.GET)
    @ResponseBody
    public MacroDataResult getMacroDataResultByExcelFileNameAndSheetName(HttpServletRequest request
            ,String fileName,String sheetName /*,MacroExcelDataUtil.Period period */){

        if(fileName == null || fileName.isEmpty())
            return new MacroDataResult();

        MacroExcelDataUtil.Period period = new MacroExcelDataUtil.Period();
        period.setReportType(MacroExcelDataUtil.Period.REPORT_TYPE_YEAR);
        period.setReportTypeName("年报"); //默认年报

        String excelPath = UPLOAD_EXCEL_PATH+File.separator+fileName;
        MacroDataResult re = MacroExcelDataUtil
                .transformMacroExcelDataToMacroDataResult(excelPath,sheetName,period);

        return re;
    }

    /**
     * 通过指定文件名删除指定的文件
     *
     * @param request
     *
     * @param fileName
     * @return
     */
    @RequestMapping(value = "/deleteexcelfile", method = RequestMethod.DELETE)
    @ResponseBody
    public OpStatus deleteExcelFileByFileName(HttpServletRequest request
            ,@RequestParam("fileName") String fileName){

        if(fileName == null || fileName.isEmpty())
            return new OpStatus(false,"删除失败！未指定要删除的文件！",null);

        String savePath = uploadFilePath;
        if(!savePath.endsWith(File.separator)){
            savePath += File.separator;
        }
        savePath += UPLOAD_EXCEL_PATH+File.separator+fileName;

        File file = new File(savePath);
        if(file.exists() && file.isFile()){
               boolean re = file.delete();
               return new OpStatus(re,re ? "删除成功！" : "删除失败！",null);
        }else{
            return new OpStatus(false,"删除失败！文件未找到！",null);
        }
    }

    /**
     * 获取指定文件名和sheetName的所有指标列表
     *
     * @param request
     *
     * @param fileName
     *
     * @param sheetName
     *
     * @return
     */
    @RequestMapping(value = "/getallindicatorlist", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String,Object>> getAllIndicatorList(HttpServletRequest request
            ,String fileName,String sheetName){
        List<Map<String,Object>> re = new ArrayList<Map<String,Object>>();

        if(fileName == null || fileName.isEmpty())
            return re;

        String excePath = UPLOAD_EXCEL_PATH+File.separator+fileName;
        List<String> list = MacroExcelDataUtil.getAllIndicatorList(excePath,sheetName);
        if(list != null && list.size() > 0){
            Map<String,Object> map = null;
            for (String s : list){
                if(s == null)
                    continue;
                map = new HashMap<String,Object>();
                map.put("idenCode",s);
                map.put("idenName",s);
                re.add(map);
            }
        }

        return re;
    }


    /**
     * 获取上传excel的信息
     *
     * @param fileName
     *          excel文件名
     * @return
     */
    private Map<String, Object> getUploadResult(String fileName) {

        Map<String, Object> re = new HashMap<String, Object>();

        List<Map<String, Object>> newSheets = new ArrayList<Map<String, Object>>();
        Map<String, Object> newSheet = null;

        String excePath = UPLOAD_EXCEL_PATH+File.separator+fileName;

        List<Map<String, String>> sheets = ExcelUtil.getSheets(excePath);
        for (Map<String, String> sheet : sheets) {
            if (sheet == null)
                continue;
            String sheetName = sheet.get("name");
            String index = sheet.get("index");
            Map<String, Integer> map = MacroExcelDataUtil
                    .getExcelDataRowAndColSize(excePath, sheetName);

            newSheet = new HashMap<String, Object>();
            newSheet.put("index", index);
            newSheet.put("name", sheetName);
            newSheet.put("rowSize", map.get("rowSize"));
            newSheet.put("colSize", map.get("colSize"));

            newSheets.add(newSheet);
        }

        re.put("sheets", newSheets);
        re.put("fileName", fileName);

        return re;
    }


    /**
     * 在线制图的Excel模板
     *
     * @return
     */
    private HSSFWorkbook downloadTemplate(){
        HSSFWorkbook hssfWorkbook = new HSSFWorkbook();

        try {
            HSSFFont font = hssfWorkbook.createFont();
            font.setFontHeightInPoints((short)10);
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
            sheet.setDefaultColumnWidth(30);    //设置默认的列宽
            HSSFRow head = sheet.createRow(0);

            HSSFCell codeCell = head.createCell(0);
            codeCell.setCellValue("行政区划代码");
            codeCell.setCellStyle(cellStyle);

            HSSFCell nameCell = head.createCell(1);
            nameCell.setCellValue("行政区划名称");
            nameCell.setCellStyle(cellStyle);

            HSSFCell oneCell = head.createCell(2);
            oneCell.setCellValue("综合指标一（亿元）");
            oneCell.setCellStyle(cellStyle);

            HSSFCell twoCell = head.createCell(3);
            twoCell.setCellValue("综合指标一（万元）");
            twoCell.setCellStyle(cellStyle);

        }catch (Exception e){
            e.printStackTrace();
        }

        return hssfWorkbook;
    }

}
