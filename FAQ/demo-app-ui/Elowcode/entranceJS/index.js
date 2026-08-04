(function () {
  "use strict";
  // 主题色，图片路径
  const imgUrlPrefixPathConstant = {
    blue: "../assets/topic/blue/images",
    green: "../assets/topic/green/images",
  };

  const topicCssClassConstant = {
    blue: "topic-blue",
    green: "topic-green",
  };

  const topicConstant = {
    blue: "blue",
    green: "green",
  };

  // 主题色，总控变量
  const topic = topicConstant.blue;
  const imgUrlPrefixPath = imgUrlPrefixPathConstant[topic];

  let BASE_CONFIG = {
    igwMode: false, //i国网还是自己app
    debugMode:
      false || ["localhost", "127.0.0.1"].includes(window.location.hostname), //本地调试
    //测试环境
    // baseUrl: "https://uat71dd78f2d50b.erow.cn:20000/testservice",
    // erowplatformBackendUrl: "/demo",
    // 开发环境
    baseUrl: "https://uat71dd78f2d50b.erow.cn:30003/testconfig/testservice",
    erowplatformBackendUrl: "/erowplatform",
    // 正式环境
    // baseUrl: "https://uat71dd78f2d50b.erow.cn:18902/e-lowcode/api",
    // erowplatformBackendUrl: "/app",
    // COOKIESECRETKEY: "EC67EC273FED11EE836F000C295CEF9F",
    // Public_KEY:
    //   "048d048d1a0769b738ba0caec58da5721a1b89ea1c6f4fc61dfdf0d6b3e827fc184794e96383829508370c3443cb076aa8c0ac18480ef03308d1594d652b0deb3e",
    // 数字化平台
    // baseUrl: "https://erp.erow.cn:18902/tygl/api",
    // erowplatformBackendUrl: "/erowplatform",
    COOKIESECRETKEY: "4y0l76e96bea11eebe0a0242ac111111",
    Public_KEY:
      "041cb089a8bc103e2f3e6d518aef3424887258b94f1e1500395e322529011889c5c46e7ed9c9eff247f1211db29ca93c8b802a8e7ea5155c7fcab27214a1916a10",
    limitIgwVersion: 27.94, //2.7.94,
    // 下拉刷新触发距离
    transitionHeightLever: 10,
    // 表单容器缓存时间（单位为小时）
    UcScopeContainerCacheTime: 24,

    // 标识该项目是否需要引入自定义CSS
    hasSpecialCss: true,
    // 标识该项目是否需要引入自定义JS
    hasSpecialJs: true,
    // 标识项目自定义内容的路径
    projectPath: "/Elowcode",
    // 标识加载自定义配置后需要跳转到的首页
    indexPath: "/Default",
    // 标识公用依赖的目录名称
    storeName: "erowplatform", //项目自定义存储名
    commonDepsDir: "",
    DepPath: "/SelfDefineProject",
    rootDir: "/APP",
    // 项目个性化配置，使用 APP\tools\index.js 中 window.PAGE_CONFIG 作为配置
    pageConfig: {
      useTabletMode: true,
      formTheme: "", //项目中文本框、下拉框下拉框等控件的样式风格设置,border为带border,不填或其他为不带
      // homeHeadSculpture: "../special/images/head-sculpture.png",
      homeHeadSculpture: imgUrlPrefixPath
        ? imgUrlPrefixPath + "/common/head-sculpture.png"
        : "../special/images/head-sculpture.png",
      // menuDefaultImage: "../assets/images/menu/members_board_pda.png",
      menuDefaultImage: imgUrlPrefixPath
        ? imgUrlPrefixPath + "/menu/members_board_pda.png"
        : "../assets/images/menu/members_board_pda.png",
      emptyListImage: "../assets/images/common/page_empty.png",
      IsCacheConfig: false, //是否缓存配置
      IsCacheCtrolData: false, //是否缓存控件数据
      isOpenSaveMenuViews: "close", // 是否开启统计菜单访问量, open开启，close关闭
      st: "st", // token相关字段配置
      showFileViewSearchBar: true, //是否显示文件视图搜索栏
    },
    IOTServer: {
      getIOTToken: "https://uat71dd78f2d50b.erow.cn:48920/erow-app/video/rsa", //项目自定义接口
      getvideoUrl: "https://pm.erow.cn/ErowIOT/API/IOT/GetPlayUrl.ashx",
      pushStream: "https://pm.erow.cn/ErowIOT/API/IOT/PushStream.ashx",
      getDeviceInfo: "https://pm.erow.cn/ErowIOT/API/IOT/GetDeviceInfo.ashx",
      videoPTZControl: "https://pm.erow.cn/ErowIOT/API/IOT/PTZControl.ashx",
    },
    currentPageVideoList: [],
    homepageCode: "def_homepage",
    // 主题色相关
    topic,
    topicConstant,
    topicCssClassConstant,
    imgUrlPrefixPathConstant,
    // i国网相关
    htmlVersion: "1.0.0",
    appCode: "ZHST",
    // 安交接口，不随项目变固定参数
    getWxCodeUrl: "https://igw.sgcc.com.cn/connect/oauth2/authorize?",
    getUserByIgwCodeUrl:
      "https://id.sgcc.com.cn:10443/igwmobile/proxy/getUserByIgwCode",
    wxappId: "ww4d11a39991ebffdc",
    IscAppId: "230bb112833a4db88078ccdc20efe1aa",
    connectIp: "aqjh.sh.sgcc.com.cn",
    connectPort: "10080",
    // 安交，项目参数
    AppId: "1002731",
    connectUser: "user",
    localPortIp: "188.188.4.193",
    localPort: "30436",
    appid: "zhst",
    showBackHome: false,
    connectData: {
      ip: "aqjh.sh.sgcc.com.cn", // connectIp
      port: "10080", // connectPort
      user: "user", // connectUser
      appid: "zhst", // appid
      iscpIP: "1002731", // AppId
    },
    getlocalportData: {
      ip: "188.188.4.193", // localPortIp
      port: "58124", // localPort
      iscpIP: "1002731", // AppId
    },
  };
  localStorage.setItem("currentConfigKey", BASE_CONFIG.projectPath);
  localStorage.setItem(
    BASE_CONFIG.projectPath + "BASE_CONFIG",
    JSON.stringify(BASE_CONFIG)
  );
  console.log("BASE_CONFIG", BASE_CONFIG);
  debugger
})();
