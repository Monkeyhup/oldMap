package com.supermap.sgis.visual.api;

import com.supermap.sgis.visual.common.FileUtil;
import com.supermap.sgis.visual.common.XxlsBig;
import com.supermap.sgis.visual.data.OpStatus;
import com.supermap.sgis.visual.json.Region;
import com.supermap.sgis.visual.tool.ExcelUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.supermap.sgis.visual.service.HotRegionService;

import java.util.List;

/**
 * Created by yangxinyong on 2015/12/2.
 */

@Controller
@RequestMapping(value = "hotRegion")
public class HotRegionControllor extends BaseController {

    @Autowired
    HotRegionService hotServ;

    @RequestMapping(value = "/treeUpdata", method = RequestMethod.POST)
    public void treeUpdate(@RequestBody String[] currCodes) throws Exception {

        for (int i = 0; i < currCodes.length; i++) {
            hotServ.areaUpdate(currCodes[i]);
        }
    }

    @RequestMapping(value = "/areaUpdata", method = RequestMethod.POST)
    @ResponseBody
    public OpStatus areaUpdate(@RequestBody String area) throws Exception {

        hotServ.areaUpdate(area);

        return new OpStatus(true,"操作成功了",null);
    }

    @RequestMapping(value = "/areaQuery", method = RequestMethod.POST)
    @ResponseBody
    public List<Region> areaQuery(){
        return hotServ.areaQuery();
    }

}
