package com.supermap.sgis.visual.api;

import com.supermap.sgis.visual.common.FileUtil;
import com.supermap.sgis.visual.common.XxlsBig;
import com.supermap.sgis.visual.tool.ExcelUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.*;

/**
 * Created by W.Qiong on 14-8-19.
 * 公共接口（API）
 */
@Controller
@RequestMapping(value = {"/common","/service/common"})
public class CommonController extends BaseController {

    /**浏览器文件上传，（目前只支持excel）上传文件属性解析并JSON回调*/
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public void uploadFile(HttpServletRequest request,HttpServletResponse response) throws Exception {
        response.setHeader("Content-type", "text/html;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        //上传文件处理器
        MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
        //上传文件对象
        CommonsMultipartFile file = (CommonsMultipartFile) multipartRequest.getFile("file");
        String realFileName = file.getOriginalFilename();//上传文件名

        String ctxPath = uploadFilePath;//默认设置上传本地路径
        FileUtil.buildFilePath(ctxPath);

        //创建上传文件
        UUID uuid = UUID.randomUUID();//随机ID
        String extendStr = realFileName.substring(realFileName.lastIndexOf(".")) ;
        String newFileName = uuid.toString()+extendStr;//重新生成上传文件名
        File uploadFile = new File(ctxPath + newFileName);
        if(uploadFile.exists()){
            uploadFile.delete();//清除已存在文件（上传路径下）
        }
        //Copy文件到上传路径
        FileCopyUtils.copy(file.getBytes(), uploadFile);

        double dsize = file.getBytes().length/1024.0/1024.0;
        int size= file.getBytes().length/1024/1024;
        if(dsize>0 && dsize <=1){
            size = 1;
        }


        //返回上传excel文件属性
        String result = "";
        if(extendStr.equalsIgnoreCase(".XLSX")||extendStr.equalsIgnoreCase(".XLS")){
            result = getExcelSheets(newFileName,size);//获取已上传excel表单属性JSON
        }
        //zip格式
        else if(extendStr.equalsIgnoreCase(".zip")||extendStr.equalsIgnoreCase(".rar")){
            result ="{\"fileName\":\""+newFileName+"\",\"originName\":\""+realFileName+"\"}";
        }
        PrintWriter out = response.getWriter();
        out.print(result);
        out.flush();
        out.close();
    }

    /**读取已上传excel表单的表头字段*/
    @RequestMapping(value = "/sheet/column", method = RequestMethod.GET, produces = "application/json")
    @ResponseBody
    public List<Map<String,String>> getSheetColumnList(HttpServletRequest request,String fileName,String sheetName) throws Exception{
        List<Map<String,String>> re = new ArrayList<>();
        String[] split = sheetName.split("&") ;
        int len = split.length ;
        String[] head = null;
        if(len>1 && split[0].equals("sax")){
            System.out.println("开始解析"+new Date().toString());
            //流方式读取，防止内存溢出
            XxlsBig b = new XxlsBig(fileName) ;
            List<List<Object>> allData = b.readAllData(Integer.parseInt(split[len-1])+1) ;
            System.out.println("结束解析"+new Date().toString());
            List<Object> h = allData.get(0)  ;
            head = new String[h.size()] ;
            int index =0;
            for(Object s:h){
                head[index++] = null==s?"": s.toString() ;
            }
            //将读出的excel数据放到session里，后续导入可以直接取数据，省去解析的时间
            request.getSession().setAttribute("saxData",allData);
        }else{
            head = ExcelUtil.readExcelHeader(fileName, sheetName);//读取已上传excel表单的表头字段(第一行)
        }
        for(int i=0,leng=head.length; i<leng; i++){
            Map<String ,String> map = new HashMap<>();
            map.put("colIndex", (i)+"");
            map.put("colName", head[i]);
            re.add(map);
        }
        return  re ;
    }

    /**读取已上传excel表单全部数据（包括表头）  应用需求 只读取前五十行*/
    @RequestMapping(value = "/sheet/data", method = RequestMethod.GET, produces = "application/json")
    @ResponseBody
    public List getSheetAllData(String fileName,String sheetName) {
        List re = ExcelUtil.readExcel(fileName, sheetName, 0);//从序号0行读
        List part = new ArrayList() ;
        int num = re.size()>50?50:re.size() ;
        for(int i =0 ;i<num; i++){
            part.add(re.get(i));
        }
        return part ;
    }

    /**
     * 表格数据下载【共用】
     * 支持（.xls/.xlsx格式）excel文件格式
     * 注：解决导出大数据表方法（分多个文件导出到服务器固定位置，再触发页面下载文件到客户端）
     * */
    @RequestMapping(value = "/download/excel", method = RequestMethod.GET, produces = "application/json")
    @ResponseBody
    public void downloadExcel(HttpServletRequest request,HttpServletResponse response) throws IOException{
        String fileName = (String) request.getSession().getAttribute("fileName");
        Object wk = request.getSession().getAttribute("wk");//.xls 或 .xlsx
        String extStr = "";
        if (wk != null && wk.getClass().equals(XSSFWorkbook.class)) {
            extStr = ".xlsx";
        } else if (wk != null && wk.getClass().equals(HSSFWorkbook.class)) {
            extStr = ".xls";
        } else {
            System.out.println("导出不是excel类型文件");
            return;
        }
        String filename = new String(fileName.getBytes(), "iso8859-1");//防止乱码
        response.reset();// 清空输出流
        if (extStr.equals(".xlsx")) {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.template");
        } else {
            response.setContentType("APPLICATION/vnd.ms-excel");
        }
        //注意，如果去掉下面一行代码中的attachment; 那么也会使IE自动打开文件。
        response.setHeader("Content-Disposition", "attachment;filename=" + filename + extStr);//保存xls或xlsx格式
        OutputStream out = response.getOutputStream();
        BufferedOutputStream bos = new BufferedOutputStream(out);
        if (extStr.equals(".xlsx")) {
            ((XSSFWorkbook) wk).write(bos);
        } else {
            ((HSSFWorkbook) wk).write(bos);
        }
        bos.flush();
        bos.close();
        out.flush();
        out.close();
    }

    /**根据excel文件名，获取上传路径下的excel表单属性JSON*/
    private String getExcelSheets(String fileName,int size) throws  Exception{
        StringBuilder re = new StringBuilder("[");
        String extendStr = ExcelUtil.getExtensionName(fileName) ;
        List<Map<String,String>> sheets = new ArrayList<>();
        String readType = "wk";
        //excel 2007 且大于10M只读取第一个
        if(extendStr.equalsIgnoreCase("XLSX")&&size>10){
            Map<String,String> m = new HashMap<>();
            m.put("index","0");
            m.put("name","第一个sheet");
            sheets.add(m);
            readType = "sax" ;
        }else {
             sheets = ExcelUtil.getSheets(fileName);//获取excel表单属性
        }
        boolean flag = false ;
        for (Map<String,String> map :sheets){
            if(flag){
                re.append(",");
            }
            re.append("{ \"index\": \""+map.get("index")+"\",");
            re.append("\"name\":\"" + map.get("name") + "\"}");
            flag = true;
        }
        re.append("]");
        //响应返回已上传excel文件属性（JSON对象）
        String result = "{\"sheets\":"+ re.toString()+", \"fileName\":\""+fileName+"\",readType:\""+readType+"\"}";
        return result;
    }

}
