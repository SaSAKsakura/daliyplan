(function () {
  "use strict";
  if (localStorage.hasOwnProperty("currentConfigKey")) {
    let currentConfigKey = localStorage.getItem("currentConfigKey");
    let BASE_CONFIG = JSON.parse(localStorage.getItem(currentConfigKey + "BASE_CONFIG"));
    window.ROOT_PATH = window.location.pathname.substring(0, window.location.pathname.indexOf(BASE_CONFIG.rootDir));
    window.HTML_PATH = `${window.location.pathname.substring(0, window.location.pathname.indexOf(BASE_CONFIG.rootDir) + BASE_CONFIG.rootDir.length)}`;
    // 批量挂载配置项
    for (const configKey in BASE_CONFIG) {
      window[configKey] = BASE_CONFIG[configKey];
    }

    //加载项目自定义文件
    let isCOnfigHtml = window.location.pathname.indexOf("APP/template") != -1; //是否是配置页面，即在app/template
    if (BASE_CONFIG.hasSpecialCss && isCOnfigHtml) {
      let linkEle = document.createElement("link");
      linkEle.rel = "stylesheet";
      linkEle.href = `${window.ROOT_PATH}${BASE_CONFIG.projectPath}/specialCss/entranceCss.css`;
      document.head.appendChild(linkEle);
    }
    if (BASE_CONFIG.hasSpecialJs && isCOnfigHtml) {
      let JSEle = document.createElement("script");
      JSEle.type = "text/javascript";
      JSEle.src = `${window.ROOT_PATH}${BASE_CONFIG.projectPath}/specialJS/index.js`;
      document.head.appendChild(JSEle);
    }
  }
})();

const pdfCMapUrl = "https://unpkg.com/pdfjs-dist@2.10.377/cmaps/";
// 地图相关
window.MAP_CONFIG = {
  // baiduMapUrl: "https://uat71dd78f2d50b.erow.cn:30003/map",
  baiduMapUrl: "./map",
  ak: "reoWDQXVSoUqRm3ZFuvFVVMSVB4QoEkP",
  baidu: {
    appName: "com.baidu.BaiduMap",
    appNameIOS: "baidumap://",
    baseUrl: "baidumap://map/direction",
    navigationSuffix: "mode=driving&coord_type=bd09ll",
  },
  gaode: {
    appName: "com.autonavi.minimap",
    appNameIOS: "iosamap://",
    baseUrl: "amapuri://route/plan/",
    navigationSuffix: "dev=0&t=0",
  },
  tencent: {
    appName: "com.tencent.map",
    appNameIOS: "qqmap://",
    baseUrl: "qqmap://map/routeplan",
    navigationSuffix: "type=drive&to=目的地&fromcoord=CurrentLocation",
  },
  ios: {
    baseUrl: "http://maps.apple.com/",
  },
};

let devAppConfig = {
  PGUID: "34df6d7d-ba8f-11ee-854a-0242c0b40002",
  PCODE: "goto_page_test",
};

 // 有自定义的js中 使用到 日期格式化函数
   Date.prototype.Format = function (fmt) {
        fmt = "yyyy/MM/dd"
        //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            S: this.getMilliseconds(), //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                (this.getFullYear() + "").substr(4 - RegExp.$1.length)
            );
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
                );
        return fmt;
    };
