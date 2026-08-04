/**
 * 页面控件采集模块
 * 用于统计页面容器和控件数量，支持全局采集状态和提交到后端
 */

(function () {
  // 数据库配置
  const DB_CONFIG = {
    dbName: "pageCollect",
    storeName: "collectData",
    version: 1,
  };

  // 采集状态
  const collectState = {
    isCollecting: false,
    clientGuid: "",
    collectedMenus: [],
    startTime: null,
  };

  // 防重复采集记录
  const recentCollectRecord = new Map();
  const COLLECT_DEBOUNCE_TIME = 5000;

  // 提交锁
  let isSubmitting = false;

  // 全局变量存储当前页面信息（供弹层使用）
  let currentPageCollectInfo = null;

  /**
   * IndexedDB 封装类
   */
  class PageCollectDB {
    constructor() {
      this.db = null;
      this.fallbackStorage = new Map();
      this.useFallback = false;
    }

    async openDB() {
      if (!window.indexedDB) {
        console.warn("[PageCollectDB] 浏览器不支持IndexedDB，使用降级存储");
        this.useFallback = true;
        return null;
      }

      return new Promise((resolve) => {
        const request = indexedDB.open(DB_CONFIG.dbName, DB_CONFIG.version);

        request.onerror = () => {
          console.error("[PageCollectDB] 打开数据库失败:", request.error);
          this.useFallback = true;
          resolve(null);
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.useFallback = false;
          console.log("[PageCollectDB] 数据库已打开");
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(DB_CONFIG.storeName)) {
            const store = db.createObjectStore(DB_CONFIG.storeName, { keyPath: "id" });
            store.createIndex("menu_row_guid", "menu_row_guid", { unique: false });
            store.createIndex("page_mode", "page_mode", { unique: false });
            store.createIndex("element_type", "element_type", { unique: false });
          }
        };

        request.onblocked = () => {
          console.warn("[PageCollectDB] 数据库被阻塞");
          this.useFallback = true;
          resolve(null);
        };
      });
    }

    generateId(data) {
      return `${data.menu_row_guid}|${data.page_mode}|${data.page_path || ""}|${data.element_type}`;
    }

    async addOrUpdate(data) {
      try {
        if (!this.db && !this.useFallback) {
          await this.openDB();
        }

        const id = this.generateId(data);

        if (this.useFallback) {
          const existing = this.fallbackStorage.get(id);
          if (existing) {
            existing.element_count = (existing.element_count || 0) + (data.element_count || 1);
            existing.updateTime = new Date().toISOString();
          } else {
            data.id = id;
            data.createTime = new Date().toISOString();
            data.updateTime = data.createTime;
            this.fallbackStorage.set(id, { ...data });
          }
          return id;
        }

        const existing = await this.getById(id);

        if (existing) {
          existing.element_count = (existing.element_count || 0) + (data.element_count || 1);
          existing.updateTime = new Date().toISOString();
          return this.put(existing);
        } else {
          data.id = id;
          data.createTime = new Date().toISOString();
          data.updateTime = data.createTime;
          return this.put(data);
        }
      } catch (error) {
        console.error("[PageCollectDB] addOrUpdate失败:", error);
        this.useFallback = true;
        return this.addOrUpdate(data);
      }
    }

    async put(data) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([DB_CONFIG.storeName], "readwrite");
        const store = transaction.objectStore(DB_CONFIG.storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    async getById(id) {
      return new Promise((resolve) => {
        const transaction = this.db.transaction([DB_CONFIG.storeName], "readonly");
        const store = transaction.objectStore(DB_CONFIG.storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    }

    async getAll() {
      try {
        if (this.useFallback) {
          return Array.from(this.fallbackStorage.values());
        }

        if (!this.db) {
          await this.openDB();
          if (!this.db) {
            return Array.from(this.fallbackStorage.values());
          }
        }

        return new Promise((resolve) => {
          const transaction = this.db.transaction([DB_CONFIG.storeName], "readonly");
          const store = transaction.objectStore(DB_CONFIG.storeName);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve([]);
        });
      } catch (error) {
        console.error("[PageCollectDB] getAll异常:", error);
        return [];
      }
    }

    async clearAll() {
      try {
        this.fallbackStorage.clear();
        if (!this.db) return;

        return new Promise((resolve) => {
          const transaction = this.db.transaction([DB_CONFIG.storeName], "readwrite");
          const store = transaction.objectStore(DB_CONFIG.storeName);
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        });
      } catch (error) {
        console.error("[PageCollectDB] clearAll异常:", error);
      }
    }
  }

  const pageCollectDB = new PageCollectDB();

  /**
   * 生成GUID
   */
  function generateGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 隐藏控件列表
   */
  const HIDDEN_CONTROL_CODES = ["UcHiddenField", "UcData", "UcJsGridHiddenField", "UcHiddenContainer"];

  /**
   * 判断控件是否为隐藏控件
   */
  function isHiddenControl(configItem) {
    if (!configItem || !configItem.ControlCode) {
      return false;
    }

    if (HIDDEN_CONTROL_CODES.includes(configItem.ControlCode)) {
      return true;
    }

    const prop = configItem.ControlProperty || {};

    if (prop.IsVisible === "false" || prop.IsVisible === false) {
      return true;
    }

    const visibleAdd = prop.IsVisibleWhenAdd !== "false";
    const visibleEdit = prop.IsVisibleWhenEdit !== "false";
    const visibleView = prop.IsVisibleWhenView !== "false";

    if (!visibleAdd && !visibleEdit && !visibleView) {
      return true;
    }

    return false;
  }

  /**
   * 判断是否为容器
   */
  function isContainer(item) {
    if (!item) return false;
    if (item.ChildContainers && Array.isArray(item.ChildContainers) && item.ChildContainers.length > 0) {
      return true;
    }
    if (item.TargetContainer) {
      return true;
    }
    return false;
  }

  /**
   * 获取容器ID
   */
  function getContainerId(item) {
    if (!item) return "";
    return item.CtnrUID || item.ControlProperty?.ID || "unknown";
  }

  /**
   * 构建容器element_type
   */
  function buildContainerElementType(item) {
    const containerType = item.ControlCode || "UnknownContainer";
    //const containerId = getContainerId(item);
    return `${containerType}`;
  }

  /**
   * 构建子控件element_type
   */
  function buildControlElementType(containerInfo, controlItem) {
    const containerElementType = buildContainerElementType(containerInfo);
    const containerId =containerInfo.containerId
    const controlType = controlItem.ControlCode || "UnknownControl";
    return `${containerElementType}-${containerId}-${controlType}`;
  }

  /**
   * 递归统计控件数量
   */
  function traverseAndCount(config, elementCountMap, pageMode, parentContainerInfo) {
    if (!config) return;

    const configs = Array.isArray(config) ? config : [config];

    configs.forEach((item) => {
      if (!item || typeof item !== "object") return;
      if (isHiddenControl(item)) return;

      if (item.TargetContainer) {
        traverseAndCount(item.TargetContainer, elementCountMap, pageMode, parentContainerInfo);
        return;
      }

      const hasChildren = item.ChildContainers && Array.isArray(item.ChildContainers) && item.ChildContainers.length > 0;
      const isContainerType = isContainer(item);

      if (isContainerType && hasChildren) {
        const containerElementType = buildContainerElementType(item);
        elementCountMap[containerElementType] = (elementCountMap[containerElementType] || 0) + 1;

        const containerInfo = {
          ControlCode: item.ControlCode,
          containerId: getContainerId(item),
        };

        item.ChildContainers.forEach((child) => {
          if (!child || typeof child !== "object") return;
          if (isHiddenControl(child)) return;

          if (isContainer(child)) {
            traverseAndCount(child, elementCountMap, pageMode, parentContainerInfo);
          } else {
            const controlElementType = buildControlElementType(containerInfo, child);
            elementCountMap[controlElementType] = (elementCountMap[controlElementType] || 0) + 1;
          }
        });
      } else {
        if (item.ControlCode) {
          if (parentContainerInfo) {
            const controlElementType = buildControlElementType(parentContainerInfo, item);
            elementCountMap[controlElementType] = (elementCountMap[controlElementType] || 0) + 1;
          } else {
            const elementType = item.ControlCode;
            elementCountMap[elementType] = (elementCountMap[elementType] || 0) + 1;
          }
        }
      }
    });
  }

  /**
   * 检查是否短时间内已采集
   */
  function shouldSkipCollect(menuRowGuid,ControlGUID, pageMode) {
    const key = `${menuRowGuid}|${ControlGUID}|${pageMode}`;
    const lastTime = recentCollectRecord.get(key);
    const now = Date.now();

    if (lastTime && now - lastTime < COLLECT_DEBOUNCE_TIME) {
      console.log("[页面采集] 跳过重复采集:", key);
      return true;
    }

    recentCollectRecord.set(key, now);
    return false;
  }

  /**
   * 开始采集
   */
  function startCollecting() {
    collectState.isCollecting = true;
    collectState.clientGuid = generateGuid();
    collectState.collectedMenus = [];
    collectState.startTime = new Date().getTime();

    localStorage.setItem(
      "pageCollectState",
      JSON.stringify({
        isCollecting: true,
        clientGuid: collectState.clientGuid,
        startTime: collectState.startTime,
      }),
    );

    console.log("[页面采集] 开始采集，批次ID:", collectState.clientGuid);
    return collectState.clientGuid;
  }

  /**
   * 停止采集
   */
  function stopCollecting() {
    collectState.isCollecting = false;
    localStorage.removeItem("pageCollectState");
    console.log("[页面采集] 停止采集");
  }

  /**
   * 放弃采集
   * 清空本次采集结果并结束采集状态
   */
  async function cancelCollecting(callback) {
    if (!collectState.isCollecting) {
      console.warn("[页面采集] 当前未处于采集状态");
      if (callback) callback(new Error("当前未处于采集状态"));
      return;
    }

    try {
      await clearCollectData();
      stopCollecting();

      recentCollectRecord.clear();

      console.log("[页面采集] 已放弃采集，数据已清空");

      if (typeof vant !== "undefined" && vant.Toast) {
        vant.Toast.success("已放弃采集");
      }

      if (callback) callback(null, { success: true });
    } catch (error) {
      console.error("[页面采集] 放弃采集失败:", error);
      if (typeof vant !== "undefined" && vant.Toast) {
        vant.Toast.fail("放弃采集失败: " + error.message);
      }
      if (callback) callback(error, null);
    }
  }

  /**
   * 恢复采集状态
   */
  function restoreCollectState() {
    const saved = localStorage.getItem("pageCollectState");
    if (saved) {
      const state = JSON.parse(saved);
      collectState.isCollecting = state.isCollecting;
      collectState.clientGuid = state.clientGuid;
      collectState.startTime = state.startTime;
      console.log("[页面采集] 恢复采集状态，批次ID:", collectState.clientGuid);
    }
  }

  /**
   * 获取弹层pageMode
   */
  function getDialogPageMode(openType) {
    const modeMap = {
      add: "ADD",
      insert: "ADD",
      create: "ADD",
      edit: "EDIT",
      update: "EDIT",
      modify: "EDIT",
      view: "VIEW",
      detail: "VIEW",
      read: "VIEW",
    };
    return modeMap[openType?.toLowerCase()] || "VIEW";
  }

  /**
   * 设置当前页面采集信息
   */
  function setCurrentPageCollectInfo(pageInfo) {
    currentPageCollectInfo = pageInfo;
  }

  /**
   * 获取当前页面采集信息
   */
  function getCurrentPageCollectInfo() {
    return currentPageCollectInfo;
  }

  /**
   * 采集页面数据
   */
  async function collectPageData(config, pageInfo) {
    if (!collectState.isCollecting) {
      return null;
    }
    if (!pageInfo.menuRowGuid) {
      return null;
    }
    if (shouldSkipCollect(pageInfo.menuRowGuid,config.ControlGUID, pageInfo.pageMode)) {
      return null;
    }

    try {
      if (!pageCollectDB.db) {
        await pageCollectDB.openDB();
      }
      

      const elementCountMap = {};
      traverseAndCount(config, elementCountMap, pageInfo.pageMode, null);

      const collectItems = [];
      for (const elementType of Object.keys(elementCountMap)) {
        const item = {
          menu_row_guid: pageInfo.menuRowGuid || "",
          page_mode: pageInfo.pageMode || "VIEW",
          page_path: pageInfo.pagePath || "",
          element_type: elementType,
          element_count: elementCountMap[elementType],
        };

        await pageCollectDB.addOrUpdate(item);
        collectItems.push(item);
      }

      if (!collectState.collectedMenus.find((m) => m.menuRowGuid === pageInfo.menuRowGuid)) {
        collectState.collectedMenus.push({
          menuRowGuid: pageInfo.menuRowGuid,
          menuName: pageInfo.menuName,
          collectTime: new Date().toISOString(),
        });

        localStorage.setItem("pageCollectMenus", JSON.stringify(collectState.collectedMenus));

        if (typeof vant !== "undefined" && vant.Toast) {
         // vant.Toast.success(`已采集`);
        }
      }

      console.log(
        "[页面采集] 已采集:",
        "模式:",
        pageInfo.pageMode,
        "类型数:",
        collectItems.length,
        "总控件数:",
        collectItems.reduce((sum, item) => sum + item.element_count, 0),
      );

      return collectItems;
    } catch (error) {
      console.error("[页面采集] 采集失败:", error);
      if (typeof vant !== "undefined" && vant.Toast) {
        vant.Toast.fail("采集失败: " + error.message);
      }
      return null;
    }
  }

  /**
   * 采集弹层数据
   */
  async function collectDialogData(layerConfig, openType, parentInfo) {
    if (!collectState.isCollecting) {
      return;
    }

    try {
      const pageMode = getDialogPageMode(openType);
      const parentMenuInfo = parentInfo || getCurrentPageCollectInfo() || {};

      if (!parentMenuInfo.menuRowGuid) {
        console.warn("[页面采集] 弹层采集失败：无法获取菜单信息");
        return;
      }

      const pageInfo = {
        menuRowGuid: parentMenuInfo.menuRowGuid,
        menuName: parentMenuInfo.menuName,
        pagePath: `dialog:${layerConfig.ControlProperty?.ID || "unknown"}`,
        pageMode: pageMode,
      };

      await collectPageData(layerConfig, pageInfo);
      console.log("[页面采集] 弹层已采集:", pageInfo.pagePath, "模式:", pageMode);
    } catch (error) {
      console.error("[页面采集] 弹层采集失败:", error);
    }
  }

  /**
   * 获取所有采集数据
   */
  async function getAllCollectData() {
    const data = await pageCollectDB.getAll();

    const submitData = data.map((item) => ({
      menu_row_guid: item.menu_row_guid,
      page_mode: item.page_mode,
      page_path: item.page_path,
      element_type: item.element_type,
      element_count: item.element_count,
    }));

    return {
      client_guid: collectState.clientGuid,
      startTime: collectState.startTime,
      endTime: new Date().getTime(),
      data: submitData,
    };
  }

  /**
   * 提交采集数据
   */
  async function submitCollectData(callback) {
    if (isSubmitting) {
      console.warn("[页面采集] 正在提交中，请稍候...");
      if (typeof vant !== "undefined" && vant.Toast) {
        vant.Toast.loading("提交中...");
      }
      return;
    }

    if (!collectState.isCollecting) {
      console.warn("[页面采集] 当前未处于采集状态");
      return;
    }

    try {
      isSubmitting = true;

      if (typeof vant !== "undefined" && vant.Toast) {
        vant.Toast.loading({
          message: "提交中...",
          forbidClick: true,
          duration: 0,
        });
      }

      const submitData = await getAllCollectData();

      if (submitData.data.length === 0) {
        vant.Toast?.clear?.();
        vant.Toast?.fail?.("没有采集数据可提交");
        isSubmitting = false;
        return;
      }

      erRequest.post(
        erowplatformBackendUrl +'/dc/menuElementCollect',
        submitData,
        function (res) {
          vant.Toast?.clear?.();

          if (res.code === "SUCCESS") {
            console.log("[页面采集] 提交成功");
            vant.Toast?.success?.("提交成功");

            pageCollectDB.clearAll();
            stopCollecting();

            if (callback) callback(null, res);
          } else {
            console.error("[页面采集] 提交失败:", res.msg);
            vant.Toast?.fail?.("提交失败: " + res.msg);
            if (callback) callback(new Error(res.msg), null);
          }

          isSubmitting = false;
        },
        function (error) {
          vant.Toast?.clear?.();
          console.error("[页面采集] 提交错误:", error);
          vant.Toast?.fail?.("提交错误: " + (error.msg || "网络异常"));
          if (callback) callback(error, null);
          isSubmitting = false;
        },
      );
    } catch (error) {
      vant.Toast?.clear?.();
      console.error("[页面采集] 提交异常:", error);
      vant.Toast?.fail?.("提交异常: " + error.message);
      if (callback) callback(error, null);
      isSubmitting = false;
    }
  }

  /**
   * 清空采集数据
   */
  async function clearCollectData() {
    await pageCollectDB.clearAll();
    collectState.collectedMenus = [];
    localStorage.removeItem("pageCollectMenus");
    console.log("[页面采集] 已清空采集数据");
  }

  /**
   * 获取采集状态
   */
  function getCollectState() {
    return {
      isCollecting: collectState.isCollecting,
      clientGuid: collectState.clientGuid,
      collectedCount: collectState.collectedMenus.length,
      collectedMenus: collectState.collectedMenus,
    };
  }

  /**
   * 检查采集权限
   */
  function checkCollectPermission(menuList, callback) {
    const dcMenu = menuList.find((item) => window.dcMenuFnCode&&item.fn_code === window.dcMenuFnCode);
    let canAdd = false;
    if (dcMenu) {
      // 支持两种格式：1) fnCodeRight 是数组 2) fnCodeRight 直接包含 op_code
      const fnCodeRight = dcMenu.fnCodeRight || dcMenu.fn_code_right;
      if (Array.isArray(fnCodeRight)) {
        // 格式1: [{fn_code: 'dc_menu', op_code: ['ADD', 'EDIT']}, ...]
        const rightItem = fnCodeRight.find((item) => item.fn_code === window.dcMenuFnCode);
        if (rightItem?.op_code && Array.isArray(rightItem.op_code)) {
          canAdd = rightItem.op_code.includes("READ");
        }
      } else if (typeof fnCodeRight === "string") {
        // 格式2: 逗号分隔的权限字符串如 'ADD,EDIT,DELETE'
        canAdd = fnCodeRight
          .split(",")
          .map((s) => s.trim())
          .includes("READ");
      }

      // 备用：检查 menu 的 opList 或 op_list 字段
      if (!canAdd && dcMenu.opList) {
        canAdd = Array.isArray(dcMenu.opList)
          ? dcMenu.opList.includes("READ")
          : String(dcMenu.opList)
              .split(",")
              .map((s) => s.trim())
              .includes("READ");
      }
      if (callback) {
        callback(null, { canAdd });
      }
    }
  }

  // 页面加载时恢复采集状态
  restoreCollectState();

  // 导出公共API
  window.pageCollect = {
    startCollecting,
    stopCollecting,
    cancelCollecting,
    getCollectState,
    isCollecting: () => collectState.isCollecting,
    getClientGuid: () => collectState.clientGuid,
    collectPageData,
    collectDialogData,
    setCurrentPageCollectInfo,
    getCurrentPageCollectInfo,
    getAllCollectData,
    submitCollectData,
    clearCollectData,
    checkCollectPermission,
    isHiddenControl,
    buildContainerElementType,
    buildControlElementType,
    getDialogPageMode,
  };
})();
