package com.supermap.sgis.visual.common;

import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.model.SharedStringsTable;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;
import org.xml.sax.helpers.XMLReaderFactory;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * 读取excel2007 大数据
 *
 * @author Created by W.Qiong on 15-1-22.
 */
public abstract class SAXExcelUtil extends DefaultHandler {
    /**SharedStringsTable对象*/
    private SharedStringsTable sst;
    /**存储最后一个内容值*/
    private String lastContents;
    /**是否下一个字符串*/
    private boolean nextIsString;

    /**工作簿序号*/
    private int sheetIndex = -1;

    /** 当前行号 */
    private int curRow = 0;

    /** 当前列号 */
    private int curCol = 0;

    /**当前行中的的数据集合（即某行中的数据）*/
    private List<String> rowlist = new ArrayList<String>();

    /**
     * 读取第一个工作簿的入口方法
     *
     * @param path
     *            excel文件路径（包含文件名）
     * @param sheetId
     *            工作簿序号
     * @throws Exception
     */
    public void readOneSheet(String path, int sheetId) throws Exception {
        OPCPackage pkg = OPCPackage.open(path);
        XSSFReader r = new XSSFReader(pkg);
        SharedStringsTable sst = r.getSharedStringsTable();

        XMLReader parser = fetchSheetParser(sst);

        InputStream sheet = r.getSheet("rId" + sheetId);

        InputSource sheetSource = new InputSource(sheet);
        parser.parse(sheetSource);
        sheet.close();
    }

    /**
     * 读取所有工作簿的入口方法
     *
     * @param path
     *            excel文件路径（包含文件名）
     * @throws Exception
     */
    public void process(String path) throws Exception {
        OPCPackage pkg = OPCPackage.open(path);
        XSSFReader r = new XSSFReader(pkg);
        SharedStringsTable sst = r.getSharedStringsTable();

        XMLReader parser = fetchSheetParser(sst);

        Iterator<InputStream> sheets = r.getSheetsData();

        while (sheets.hasNext()) {
            curRow = 0;
            sheetIndex++;
            InputStream sheet = sheets.next();
            InputSource sheetSource = new InputSource(sheet);
            parser.parse(sheetSource);
            sheet.close();
        }
    }

    /**
     * 该方法自动被调用，每读一行调用一次，在方法中写自己的业务逻辑即可
     *
     * @param sheetIndex
     *            工作簿序号
     * @param curRow
     *            处理到第几行
     * @param rowList
     *            当前数据行的数据集合
     */
    public abstract void optRow(int sheetIndex, int curRow, List<String> rowList);

    /**
     * 取得XMLReader对象
     *
     * @param sst
     * 			SharedStringsTable对象
     * @return	XMLReader对象
     *
     * @throws SAXException
     */
    public XMLReader fetchSheetParser(SharedStringsTable sst)
            throws SAXException {
        // 在classpath中加入xercesImpl.jar ,
        // calsspath里没找到这个包会报classnotfound错
        // XMLReader parser = XMLReaderFactory
        // .createXMLReader("org.apache.xerces.parsers.SAXParser");
        XMLReader parser = XMLReaderFactory.createXMLReader();
        this.sst = sst;
        parser.setContentHandler(this);
        return parser;
    }

    /**
     * 起始元素
     */
    public void startElement(String uri, String localName, String name,
                             Attributes attributes) throws SAXException {
        // c => 单元格
        if (name.equals("c")) {
            // 如果下一个元素是 SST 的索引，则将nextIsString标记为true
            String cellType = attributes.getValue("t");
            if (cellType != null && cellType.equals("s")) {
                nextIsString = true;
            } else {
                nextIsString = false;
            }
        }
        // 置空
        lastContents = "";
    }

    /**
     * 截止元素
     */
    public void endElement(String uri, String localName, String name)
            throws SAXException {
        // 根据SST的索引值的到单元格的真正要存储的字符串
        // 这时characters()方法可能会被调用多次
        if (nextIsString) {
            try {
                int idx = Integer.parseInt(lastContents);
                lastContents = new XSSFRichTextString(sst.getEntryAt(idx))
                        .toString();
            } catch (Exception e) {

            }
        }

        // v => 单元格的值，如果单元格是字符串则v标签的值为该字符串在SST中的索引
        // 将单元格内容加入rowlist中，在这之前先去掉字符串前后的空白符
        if (name.equals("v")) {
            String value = lastContents.trim();
            value = value.equals("") ? " " : value;
            rowlist.add(curCol, value);
            curCol++;
        } else {
            // 如果标签名称为 row ，这说明已到行尾，调用 optRows() 方法
            if (name.equals("row")) {
                optRow(sheetIndex, curRow, rowlist);
                rowlist.clear();
                curRow++;
                curCol = 0;
            }
        }
    }

    /**
     * 字符串
     */
    public void characters(char[] ch, int start, int length)
            throws SAXException {
        // 得到单元格内容的值
        lastContents += new String(ch, start, length);
    }

}
