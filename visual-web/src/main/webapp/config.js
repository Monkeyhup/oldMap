/**
 * Created by jinn on 2015/12/3.
 */

define({
    mapfile:"mapbg.jpg",                       //地图文件名 地图文件位于assets/map文件夹下
    mapbounds:[5000000,0, 17000000, 11000000]           ,//[5000000,0, 17000000, 11000000],  //地图范围 左、下、右、上
    datasource:[
        //{
        //    code:2,
        //    name:"人口普查",
        //    source:"local",
        //    hasdata:true,
        //    default:false,
        //    status:false
        //},
        //{
        //    code:3,
        //    name:"农业普查",
        //    source:"local",
        //    hasdata:true,
        //    default:false,
        //    status:false
        //},
        // {
        //     code:4,
        //     name:"年鉴",
        //     source:"local",
        //     hasdata:true,
        //     default:true,
        //     status:true
        // },
    
        {
            code:11,
            name:"年度数据",
            source:"api",
            hasdata:true,
            default:true,
            status:true
        },
        {
            code:12,
            name:"季度数据",
            source:"api",
            hasdata:true,
            default:false,
            status:true
        },
        {
            code:13,
            name:"月度数据",
            source:"api",
            hasdata:true,
            default:false,
            status:true
        },
        {
            code:1,                    //报告期code
            name:"经济普查",            //报告期名字
            source:"local",            //数据来源  local：本地库   api：api获取远程库(远程库的api地址配置在\visdata\WEB-INF\classes\app.properties文件里)
            hasdata:true,              //是否有数据
            default:false,              //默认激活
            status:true                //显示状态
        }
        // {
        //    code:14,
        //    name:"半年报",
        //    source:"local",
        //    hasdata:true,
        //    default:false,
        //    status:false
        //}
        
    ]


});
