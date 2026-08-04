/**
 * 项目自定义页公共资源引导（Html/js/loadDeps.js）
 *
 * 适用：Html/{项目目录}/html/ 及子目录下的中转页、自定义页（同级项目均可引用，勿写死项目名）。
 * HTML 仅引本脚本：不引 Html/js/config.js、tools/index.js；由 loadDeps 引平台 config/index.js。
 *
 * 执行顺序：
 *   1. resolveEntranceJsPath → document.write entranceJS（写 BASE_CONFIG、window.gqjErowplatformBackendUrl）
 *   2. resolvePlatformBase(cfg) → document.write config/index.js（挂 window.debugMode 等 tools 依赖项）
 *   3. 拼 platformBase 注入 COMMON_CSS / tools 链 / COMMON_JS
 *   4. 页面内联业务（可用 window.resolvePlatformBase、window.gqjErowplatformBackendUrl）
 */
(function () {
  "use strict";

  /** i国网环境 tools 链（cfg.igwMode === true，路径均相对 platformBase） */
  var PLATFORM_TOOLS_IGW = [
    "/libs/js/crypto-js.js",
    "/libs/js/encrypt/sm2.js",
    "/libs/js/purify.js",
    "/libs/js/jquery-3.1.0.min.js",
    "/tools_igw/erMain.js",
    "/tools_igw/igwJsBridge.js",
    "/tools_igw/erPageController.js",
    "/tools_igw/erUser.js",
    "/tools_igw/erTool.js",
    "/tools/erRequest.js",
  ];

  /** 逸集控环境 tools 链（cfg.igwMode === false，路径均相对 platformBase） */
  var PLATFORM_TOOLS_DEFAULT = [
    "/libs/js/crypto-js.js",
    "/libs/js/encrypt/sm2.js",
    "/libs/js/purify.js",
    "/tools/android.js",
    "/tools/erPageController.js",
    "/tools/erUser.js",
    "/tools/erTool.js",
    "/tools/erMain.js",
    "/libs/js/jquery-3.1.0.min.js",
    "/tools/ajaxAppend.js",
    "/tools/erRequest.js",
  ];

  /**
   * 各项目自定义页共用 CSS（相对 platformBase）
   * 仅平台 Vant 皮肤；erow/index/common 由各项目 specialCss 在页面 head 引入，避免与 APP/assets 重复加载。
   * 不含 home.css / special/css/home.css（空壳中转页无首页 UI）
   */
  var COMMON_CSS = [
    "/libs/css/vant.css",
    "/assets/css/myVant.css",
  ];

  /**
   * 各项目自定义页共用 JS（tools 链之后加载，相对 platformBase）
   * 不含 main.js（仅挂 Vue 原型辅助）、apis.js（空壳页用 $toast 即可）
   */
  var COMMON_JS = [
    "/libs/js/Vue.js",
    "/libs/js/vant.min.js",
    "/utils/erowConfig.js",
  ];

  /**
   * 从 loadDeps.js 自身 URL 解析静态根目录段（固定位于 …/{根}/js/loadDeps.js）。
   * 例：/anjianapp/Html/js/loadDeps.js → "/Html/"（解析失败时兜底亦为 "/Html/"）
   */
  var LOAD_DEPS_SUFFIX = "/js/loadDeps.js";
  var HTML_BASE_DIR_FALLBACK = "/Html/";
  function resolveHtmlBaseDir() {
    var script = document.currentScript;
    if (!script || !script.src) return HTML_BASE_DIR_FALLBACK;
    try {
      var scriptPath = new URL(script.src, location.href).pathname;
      if (scriptPath.slice(-LOAD_DEPS_SUFFIX.length) !== LOAD_DEPS_SUFFIX) {
        return HTML_BASE_DIR_FALLBACK;
      }
      var rootPath = scriptPath.slice(0, -LOAD_DEPS_SUFFIX.length);
      var lastSlash = rootPath.lastIndexOf("/");
      if (lastSlash < 0) return HTML_BASE_DIR_FALLBACK;
      var segment = rootPath.slice(lastSlash + 1);
      return segment ? "/" + segment + "/" : HTML_BASE_DIR_FALLBACK;
    } catch (e) {
      return HTML_BASE_DIR_FALLBACK;
    }
  }
  var htmlBaseDir = resolveHtmlBaseDir();

  /**
   * 从当前页 URL 解析静态根下的一级项目目录名。
   * 例：/anjianapp/Html/ProjectGqj/html/initPage.html → "ProjectGqj"
   */
  function resolveProjectDirFromPath() {
    var pathname = location.pathname;
    // 迁移配置中心时注意修改pattern
    var htmlIdx = pathname.indexOf(htmlBaseDir);
    if (htmlIdx < 0) return "";
    var afterHtml = pathname.substring(htmlIdx + htmlBaseDir.length);
    var segment = afterHtml.split("/")[0];
    return segment || "";
  }

  /**
   * 根据 BASE_CONFIG 与当前 URL 解析路径前缀。
   *
   * @param {object} cfg localStorage.BASE_CONFIG
   * @returns {{
   *   htmlRoot: string,
   *   platformBase: string,
   *   projectPath: string,
   *   projectBase: string
   * }}
   *
   * 以 initPage 为例（pathname = /anjianapp/Html/ProjectGqj/html/initPage.html，
   * cfg.rootDir = "/CommonErowPlatform", cfg.projectPath = "/ProjectGqj"）：
   *
   * | 属性 | 示例值 | 用途 |
   * |------|--------|------|
   * | htmlRoot | /anjianapp/Html/ | 整个 Html 目录的 URL 锚点（含尾部 /，内部计算用） |
   * | platformBase | /anjianapp/Html/CommonErowPlatform | 平台静态资源根；loadDeps 拼 vant/erow/tools；业务跳 Entrance.html |
   * | projectPath | /ProjectGqj | 配置项：项目在 Html 下的目录名（带前导 /） |
   * | projectBase | /anjianapp/Html/ProjectGqj | 本项目静态资源根；entranceJS、specialCss、html 等 |
   */
  /** pathname 中 htmlBaseDir 之前含尾部斜杠，如 /anjianapp/Html/ */
  function resolveHtmlRoot(pathname) {
    var htmlIdx = pathname.indexOf(htmlBaseDir);
    if (htmlIdx < 0) return pathname;
    return pathname.substring(0, htmlIdx + htmlBaseDir.length);
  }

  function resolvePlatformBase(cfg) {
    var rootDir = cfg.rootDir || "/APP";
    var pathname = location.pathname;
    var htmlRoot = resolveHtmlRoot(pathname);
    var rootIdx = pathname.indexOf(rootDir);
    var platformBase;
    if (rootIdx >= 0) {
      // URL 已含 rootDir 段时直接截取
      platformBase = pathname.substring(0, rootIdx + rootDir.length);
    } else {
      // htmlRoot 已含尾部 /，再接 rootDir（去掉前导 /）
      platformBase = htmlRoot + rootDir.replace(/^\//, "");
    }
    var projectDir = resolveProjectDirFromPath();
    var projectPath =
      cfg.projectPath ||
      (projectDir ? "/" + projectDir : "");
    var projectBase = htmlRoot + projectPath.replace(/^\//, "");
    console.log("platformBase", platformBase);
    console.log("htmlRoot", htmlRoot);
    console.log("projectBase", projectBase);
    console.log("projectPath", projectPath);
    window._platFormParmater = { platformBase, htmlRoot, projectBase, projectPath }
    return { platformBase, htmlRoot, projectBase, projectPath };
  }

  /**
   * 解析当前项目 entranceJS 的绝对路径（须在 entranceJS 执行前调用）。
   * 规则：/{根}/{项目目录}/... → {htmlRoot}{项目目录}/entranceJS/index.js
   */
  function resolveEntranceJsPath() {
    var pathname = location.pathname;
    var htmlIdx = pathname.indexOf(htmlBaseDir);
    if (htmlIdx < 0) return "../entranceJS/index.js";
    var projectDir = resolveProjectDirFromPath();
    if (projectDir) {
      return (
        pathname.substring(0, htmlIdx + htmlBaseDir.length + projectDir.length) +
        "/entranceJS/index.js"
      );
    }
    return resolveHtmlRoot(pathname) + "entranceJS/index.js";
  }

  window.resolvePlatformBase = resolvePlatformBase;

  /**
   * 桥接模式：platform 走 APP/tools 链（含 android.js）；
   * legacy 跳过 APP/tools/android.js，由页面引 demo-app-ui/js/android.js。
   * 优先读 loadDeps 标签 data-bridge，默认 platform。
   */
  function resolveBridgeMode(cfg) {
    var script = document.currentScript;
    var fromScript = script && script.getAttribute("data-bridge");
    if (fromScript === "legacy" || fromScript === "platform") {
      return fromScript;
    }
    return "platform";
  }

  function filterToolsByBridge(urls, bridgeMode) {
    if (bridgeMode !== "legacy") {
      return urls;
    }
    return urls.filter(function (url) {
      return url !== "/tools/android.js";
    });
  }

  function writeCss(urls, platformBase) {
    for (var i = 0; i < urls.length; i++) {
      document.write(
        '<link rel="stylesheet" href="' + platformBase + urls[i] + '">'
      );
    }
  }

  function writeJs(urls, platformBase, cacheBust) {
    for (var i = 0; i < urls.length; i++) {
      var src = platformBase + urls[i];
      if (cacheBust && urls[i].indexOf("igwJsBridge") >= 0) {
        src += "?v=" + new Date().getTime();
      }
      document.write('<script src="' + src + '"><\/script>');
    }
  }

  document.write(
    '<script src="' + resolveEntranceJsPath() + '"><\/script>'
  );

  var cfg = {};
  function getBaseConfig(){
    let currentConfigKey = localStorage.getItem("currentConfigKey");
    cfg = JSON.parse(localStorage.getItem(currentConfigKey + "BASE_CONFIG") || "{}");
    if(!cfg){
      cfg = JSON.parse(localStorage.getItem("BASE_CONFIG") || "{}");
    }
    return cfg;
  }
  window.getBaseConfig = getBaseConfig;
  var cfg = getBaseConfig();

  var platformBase = resolvePlatformBase(cfg).platformBase;
  var igwMode = !!cfg.igwMode;

  document.write(
    '<script src="' + platformBase + '/config/index.js"><\/script>'
  );

  writeCss(COMMON_CSS, platformBase);
  var bridgeMode = resolveBridgeMode(cfg);
  var toolsList = filterToolsByBridge(
    igwMode ? PLATFORM_TOOLS_IGW : PLATFORM_TOOLS_DEFAULT,
    bridgeMode
  );
  writeJs(toolsList, platformBase, igwMode);
  writeJs(COMMON_JS, platformBase, false);
})();
