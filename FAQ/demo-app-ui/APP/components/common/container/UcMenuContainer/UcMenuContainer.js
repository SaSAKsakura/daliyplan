var UcMenuContainer = {
  name: "UcMenuContainer",
  mixins: [commonMinxin],
  template: `
    <div class="menuContent" :class='menuActiveClass()'>
      <div v-if="!isGroup" :class="['openMenuBanner','menuBanner',{isCard:config.ControlProperty.MenuMode=='card'}]">
        <div v-for="(item,index) in closeMenuList" :key="index" @click="goMenu(item)" :style="menuWidth(index, item)">
          <div class="oneMenu" v-if="config.ControlProperty.MenuMode!=='card'">
            <van-badge color="#ff4d4f">
              <template #default>
                <img :src="getImgSrc(item)" class="menuIcon" @error="setDefautImg">
              </template>
              <template #content v-if="item.count">
                {{item.count}}
              </template>
            </van-badge>
            <span class="menuText">
              {{item.menu_name}}
            </span>
          </div>
          <div :class="['oneMenuisCard']"   v-if="config.ControlProperty.MenuMode=='card'">
            <van-badge color="#ff4d4f" >
              <div class="uc-menu-container-cardType">
                <div style="width:100%;" >
                  <div style="margin-bottom:6px;font-size:16px; width:80px;">
                    {{item.menu_name}}
                  </div>
                  <div style="font-size:12px;height:17px;">
                    {{getDes(item)}}
                  </div>
                </div>
              </div>
              <template #content v-if="item.count">
                {{item.count}}
              </template>
            </van-badge>
          </div>
        </div>
        <div class="closeIcon" :class="closeMenu ? 'reverse' : ''" v-if="isShowCloseButton" @click="closeMenu = !closeMenu">
          <img style="width: 20px;" src="../assets/images/home/arrowTop.png" alt="">
        </div>
      </div>

      <!-- 分组 -->
      <div
        v-if="isGroup"
        :class="['openMenuBanner', 'menu-group-container', { isCard: config.ControlProperty.MenuMode == 'card' }]"
      >
        <div class="menu-group" v-for="(menuGroup, menuGroupIndex) in menuGroupList" :key="menuGroupIndex">
          <div v-show="menuGroup.groupLabel" class="group-title">
            <div class="group-title-icon"></div>
            {{ menuGroup.groupLabel}}
          </div>
          <div class="group-body">
            <div
              v-for="(menu, menuIndex) in menuGroup.groupList"
              :key="menuIndex"
              @click="goMenu(menu)"
              :style="menuWidth(menuIndex, menu)"
            >
              <!-- menu -->
              <div class="oneMenu" :class="menuDynamicClass(menuIndex, menuGroup.groupList)" v-if="config.ControlProperty.MenuMode !== 'card'">
                <van-badge color="#ff4d4f">
                  <template #default>
                    <img :src="getImgSrc(menu)" class="menuIcon" @error="setDefautImg" />
                  </template>
                  <template #content v-if="menu.count">
                    {{ menu.count }}
                  </template>
                </van-badge>
                <span class="menuText">
                  {{ menu.menu_name }}
                </span>
              </div>

              <div :class="['oneMenuisCard']" v-if="config.ControlProperty.MenuMode == 'card'">
                <van-badge color="#ff4d4f">
                  <div class="uc-menu-container-cardType">
                    <div style="width: 100%">
                      <div style="margin-bottom: 6px; font-size: 16px; width: 80px">
                        {{ menu.menu_name }}
                      </div>
                      <div style="font-size: 12px; height: 17px">
                        {{getDes(menu)}}
                      </div>
                    </div>
                  </div>
                  <template #content v-if="menu.count">
                    {{ menu.count }}
                  </template>
                </van-badge>
              </div>
            </div>
          </div>
        </div>

         <div
            class="closeIcon"
            :class="closeMenu ? 'reverse' : ''"
            v-if="isShowCloseButton"
            @click="closeMenu = !closeMenu"
          >
            <img style="width: 20px" src="../assets/images/home/arrowTop.png" alt="" />
          </div>
      </div>

    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: [Array, Object, String],
    },
  },
  data: () => ({
    menuPre: "../assets/images/menu/",
    closeMenu: true,
    menuList: [],
    rows: 0,
    defaultMenuCols: 4,
    indexedDB: null,
    initMenuData: [],
  }),
  computed: {
    visibleMenuList() {
      let depth = this.config.ControlProperty.MenuDepth ? Number(this.config.ControlProperty.MenuDepth) : 3;
      let visibleMenuList = this.menuList
        .filter((el) => {
          if (erowConfig.hasProp(el, "depth") && erowConfig.isNumber(depth)) {
            return el.visible_flag == -1 && el.depth === depth;
          }
          return el.visible_flag == -1;
        })
        .map((item) => {
          if (erTool.isBase64(item.page_url)) {
            item.page_url = erTool.base64ToStringOne(item.page_url);
          }
          const [pageUrl, params] = item.page_url.split("?");
          if (params) {
            params.split("&").forEach((kv) => {
              const [k, v] = kv.split("=");
              item[k] = v;
            });
          }
          if (!item.pageMode) {
            item.pageMode = "VIEW";
          }
          let menuParameter = item.menu_parameter;
          if (menuParameter && menuParameter.length > 0) {
            let pageMode = menuParameter.find((element) => {
              return element.field_code == "default_page_mode";
            });
            if (pageMode) item.pageMode = pageMode.value;
          }
          if (item.page_url.indexOf("Entrance.html") > -1) {
            item.pageUrl = item.page_url;
          } else {
            item.pageUrl = pageUrl;
          }
          return item;
        });
      if (this.isTablet) {
        visibleMenuList = visibleMenuList.filter((item) => item.hasOwnProperty("isTablet"));
        sessionStorage.setItem("tabletMenu", JSON.stringify(visibleMenuList));
      }

      // 最后一行补充补充格式
      if (!this.isGroup && visibleMenuList.length != 0) {
        const rest = visibleMenuList.length % this.menuCols;
        let supplyCount = this.menuCols - rest;
        while (supplyCount != 0) {
          visibleMenuList.push({});
          supplyCount = supplyCount - 1;
        }
      }

      return visibleMenuList;
    },
    closeMenuList() {
      if (this.rows === 0) return this.visibleMenuList;
      return this.closeMenu ? this.visibleMenuList.slice(0, this.menuCols * this.rows) : this.visibleMenuList;
    },
    isShowCloseButton() {
      return this.rows && this.rows * this.menuCols < this.visibleMenuList.length;
    },
    menuCols() {
      return this.config.ControlProperty.MenuCols || this.defaultMenuCols;
    },
    isGroup() {
      const { GroupField } = this;
      return !!GroupField;
    },
    menuGroupList() {
      const { closeMenuList = [], GroupField, GroupLabelField, GroupSortField, isGroupSort, menuCols } = this;
      const menuGroupMap = new Map();
      closeMenuList.forEach((menu) => {
        const groupKey = menu[GroupField];
        const groupLabel = menu[GroupLabelField];
        const groupSort = menu[GroupSortField] || 0;
        if (!menuGroupMap.has(groupKey)) {
          menuGroupMap.set(groupKey, {
            groupKey,
            groupLabel,
            groupSort,
            groupList: [],
          });
        }

        const menuGroup = menuGroupMap.get(groupKey);
        const { groupList = [] } = menuGroup;
        const menuProxy = erowConfig.deepClone(menu);
        groupList.push(menuProxy);
      });

      const menuGroupList = [];
      let unGroupedMenuGroup = null;
      for (let [key, menuGroup] of menuGroupMap) {
        // 每个组的最后一行补充
        const { groupKey, groupList = [] } = menuGroup;
        const rest = groupList.length % menuCols;
        if (groupList.length != 0 && rest != 0) {
          let supplyCount = menuCols - rest;
          while (supplyCount != 0) {
            groupList.push({});
            supplyCount = supplyCount - 1;
          }
        }

        // 未分组
        if (!groupKey) {
          unGroupedMenuGroup = menuGroup;
          continue;
        }

        menuGroupList.push(menuGroup);
      }

      let sortedMenuGroupList = [];
      if (isGroupSort) {
        sortedMenuGroupList = this.handleSortList(menuGroupList, "groupSort");
      }

      // 放置在末尾
      if (unGroupedMenuGroup) {
        sortedMenuGroupList.push(unGroupedMenuGroup);
      }

      return sortedMenuGroupList;
    },
    GroupField() {
      const { ControlProperty } = this;
      const { GroupField } = ControlProperty;
      return GroupField;
    },
    GroupLabelField() {
      const { ControlProperty } = this;
      const { GroupLabelField } = ControlProperty;
      return GroupLabelField;
    },
    isGroupSort() {
      const { GroupSortField } = this;
      return !!GroupSortField;
    },
    GroupSortField() {
      const { ControlProperty } = this;
      const { GroupSortField } = ControlProperty;
      return GroupSortField;
    },
    OnClientClick() {
      const { ControlProperty } = this;
      const { OnClientClick } = ControlProperty;
      return OnClientClick;
    },
    ControlProperty() {
      const { config = {} } = this;
      const { ControlProperty = {} } = config;
      return ControlProperty;
    },
  },
  watch: {
    containerdata: {
      handler(val, old) {
        this.menuList = val ? val : [];
      },
      immediate: true,
    },
    closeMenuList: {
      handler(val, old) {
        this.$nextTick(() => {
          this.getBgStyle();
        });
      },
      immediate: true,
    },
  },
  methods: {
    getDes(menu) {
      if (Array.isArray(menu.menu_parameter)) {
        let temp = menu.menu_parameter.find((item) => item.field_code == "description");
        return temp ? temp.value || "" : "";
      } else {
        return "";
      }
    },
    menuActiveClass() {
      let activeClass = this.activeClass();
      if (this.isGroup) {
        activeClass = activeClass + " p-0" + " bc-f8f8f8";
      }
      return activeClass;
    },
    getData() {
      erRequest.post(
        erowplatformBackendUrl + this.config.ControlProperty.DataSrc,
        {},
        async (res) => {
          if (res.code !== "SUCCESS") {
            this.$message("error", res.msg);
            return;
          }
          let initMenuData = erowConfig.deepClone(res.data);
          this.initMenuData = initMenuData;
          let menuData = res.data;
          if (window.location.pathname.indexOf("/template/Default.html") != -1 && window.isEnableMenuCollect) {
            vm.$root.checkCollectPermission(menuData);
          }
          let depth = this.config.ControlProperty.MenuDepth ? Number(this.config.ControlProperty.MenuDepth) : 3;
          menuData = res.data.filter((item) => item.depth == depth);
          if (!this.indexedDB) {
            this.indexedDB = new CacheManage();
          }
          const db = await this.indexedDB.openDB();
          const loadIconTasks = [];
          menuData = menuData
            .map((item) => {
              if (item.icon_guid && item.icon_hash) {
                loadIconTasks.push(async () => {
                  return await this.getMenuIcon(item, db);
                });
              }
              const { menu_pid } = item;
              const pMenu = menuData.find((m) => m.menu_id === menu_pid);
              if (pMenu) {
                if (!pMenu.childrenMenu) {
                  pMenu.childrenMenu = [item];
                } else {
                  pMenu.childrenMenu.push(item);
                }
                return;
              } else {
                return item;
              }
            })
            .filter((i) => i);
          if (loadIconTasks.length && db) {
            baseSpecial.limitRequest(loadIconTasks, 5).then(() => {
              this.indexedDB.closeDB();
            });
          }
          sessionStorage.setItem("menuPostUrl", erowplatformBackendUrl + this.config.ControlProperty.DataSrc);
          sessionStorage.setItem("menuPostData", JSON.stringify(res.data));
          let menuKey = "";
          const globalHomepageCode = homepageCode || "def_homepage";
          this.menuList = menuData.filter((el) => {
            if (el.fn_code === globalHomepageCode) {
              menuKey = el.menuConfigKey;
            }
            return el.visible_flag == -1;
          });
          let params = {
            ctnrUID: "GetSysToDoCount",
            menuConfigKey: menuKey,
            opCode: "VIEW",
            pValueSet: this.$root.pValueSet,
            paramMap: {},
          };
          erRequest.post(
            erowplatformBackendUrl + "/appBaseApi/sysLoadPostData",
            params,
            (res) => {
              if (res.code == "SUCCESS") {
                res.data.datalist.forEach((item) => {
                  this.menuList.forEach((each, index, array) => {
                    if (item.fn_code === each.fn_code && item.count > 0) {
                      array[index]["count"] = item.count;
                    }
                  });
                });
                this.$forceUpdate();
              } else {
                console.log(res);
              }
            },
            (error) => {
              console.log(error);
              this.$toast.fail(error.msg);
            },
          );

          let currentMenu = initMenuData.find((item) => {
            return item.fn_code == this.config.ControlProperty.FnCode && item.fn_paramter == this.config.ControlProperty.FnParamter;
          });
          eventEmitter.emit("afterGetMenuData", {
            currentMenu: {
              menuConfigKey: currentMenu.menuConfigKey,
              menuRowGuid: currentMenu.menu_row_guid,
              pValueSet: this.$root.pValueSet,
            },
            controlID: this.config.ControlProperty.ID,
          });
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        },
      );
    },
    async getMenuIcon(item, db) {
      if (!this.indexedDB) {
        return;
      }
      const row_guid = item.menu_row_guid;
      if (!row_guid) {
        return;
      }
      let isNeedGetIcon = true;
      let cacheIconInfo = null;
      if (db) {
        cacheIconInfo = await this.indexedDB.getDataByKey(row_guid);
      }
      if (cacheIconInfo) {
        const isExpired = this.indexedDB.isExpired(cacheIconInfo);
        isNeedGetIcon = (cacheIconInfo.icon_guid != item.icon_guid || cacheIconInfo.icon_hash != item.icon_hash) && isExpired;
      }
      if (isNeedGetIcon) {
        const iconInfo = await this.loadMenuIcon(item.icon_guid, item.icon_hash);
        if (iconInfo) {
          item.icon_url = iconInfo.icon_url;
          if (db) {
            const cacheData = {
              ...item,
              cacheTime: Date.now(),
              expireTime: 0.5 * 24 * 60 * 60 * 1000,
              blob: iconInfo.data,
            };
            this.indexedDB.addOrPutData(cacheData);
          }
        }
      } else {
        const url = window.URL.createObjectURL(cacheIconInfo.blob);
        item.icon_url = url;
      }
      return item;
    },
    async loadMenuIcon(icon_guid, icon_hash) {
      return new Promise((resolve) => {
        erRequest.request({
          url: baseUrl + erowplatformBackendUrl + "/file/downloadIconFile",
          data: JSON.stringify({ rowGuid: icon_guid, iconFileHash: icon_hash }),
          type: "POST",
          headers: {
            Authorization: window.hasOwnProperty("erUser") ? erUser.token : "",
            DataSign: erTool.generateUUID(),
          },
          contentType: "application/json",
          xhrFields: {
            responseType: "blob",
          },
          success(res) {
            if (res) {
              const blob = new Blob([res]);
              const url = window.URL.createObjectURL(blob);
              resolve({ icon_url: url, blobSize: blob.size, data: blob });
            }
            resolve(null);
          },
          error(err) {
            console.log(err);
            resolve(null);
          },
        });
      });
    },
    parseParams(str) {
      // 找到问号的位置
      const queryIndex = str.indexOf("?");
      if (queryIndex === -1) {
        return null; // 没有查询参数
      }
      // 提取查询字符串（去掉问号）
      const queryString = str.substring(queryIndex + 1);
      // URL解码
      const decoded = decodeURIComponent(queryString);
      try {
        // 解析JSON
        const params = JSON.parse(decoded);
        return params;
      } catch (e) {
        console.error("解析JSON失败:", e);
        return null;
      }
    },
    getProjectPath(item) {
     
      let targeProjectPath = "";
      if (item.menu_parameter && item.menu_parameter.length) {
        let menuParam = item.menu_parameter.find((param) => param.field_code == "urlParameter");
        menuParam = menuParam &&menuParam.value? menuParam.value : null;
        if (menuParam) {
          if (typeof menuParam == "object") {
            targeProjectPath = menuParam.DepPath;
          }
          if (typeof menuParam == "string") {
            targeProjectPath = JSON.parse(menuParam).DepPath;
          }
        }
      }
      let params =item.page_url?this.parseParams(item.page_url):{};
      if (params && params.DepPath) {
        targeProjectPath = params.DepPath;
      }
      return targeProjectPath ? `../..${targeProjectPath}/images/menu/` : "";
    },
    getImgSrc(item) {
      if (item.icon_url && (item.icon_url.startsWith("http") || item.icon_url.startsWith("blob") || item.icon_url.startsWith("base64"))) {
        return item.icon_url;
      }
      let temp = "";
      if (this.getProjectPath(item)) {
        temp = this.getProjectPath(item) + item.fn_code;
      } else {
        temp = this.menuPre + item.fn_code;
      }
      if (item.fn_parameter) {
        temp += "_";
        temp += item.fn_parameter;
      }
      return temp + ".png";
    },
    handlePageUrl(item, flag) {
      if (pageConfig.isOpenSaveMenuViews && pageConfig.isOpenSaveMenuViews == "open") {
        this.handleSaveMenu(item);
        let params = {
          ctnrUID: "",
          fnCode: item.fn_code,
          fnParameter: item.fn_parameter,
          nonce: Date.now(),
          pageMode: item.pageMode,
          menuRowGuid: item.menu_row_guid,
          opCode: "VIEW",
          pValueSet: this.$root.pValueSet,
        };
        erRequest.post(
          erowplatformBackendUrl + "/menu/saveMenuViews",
          params,
          (res) => {
            pageManager.push(item.pageUrl, item);
          },
          (error) => {
            pageManager.push(item.pageUrl, item);
          },
        );
      } else {
        pageManager.push(item.pageUrl, item);
      }
    },
    async goMenu(item) {
      const { OnClientClick } = this;
      if (item.menu_parameter && item.menu_parameter.length) {
        let specialClickObj = item.menu_parameter.find((one) => {
          return one.field_code == "OnClientClick";
        });
        if (specialClickObj && specialClickObj.value) {
          let funName = specialClickObj.value;
          if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funName)) {
            erowSpecial[funName](item, this);
          }
          return;
        }
      }
      if (window.erowSpecial && erowConfig.hasProp(erowSpecial, OnClientClick)) {
        await erowSpecial[OnClientClick](item, this);
      }
      let getMenuParam = (fieldCode) => {
        let menuParam = item.menu_parameter.find((param) => param.field_code == fieldCode);
        return menuParam ? menuParam.value : "";
      };
      let targetProjectGuid = getMenuParam("targetProjectGuid");
      let targetPageCode = getMenuParam("targetPageCode");
      let param = getMenuParam("targetParam") || {};
      if (targetPageCode && targetProjectGuid) {
        erJsBridge.toOtherPage(targetProjectGuid, targetPageCode, param, (res) => {
          if (res.resultFlag == "0") {
            this.$toast.fail(res.errMsg);
          }
        });
        return;
      }
      if (item.pageUrl) {
        let urlParameter = getMenuParam("urlParameter") || "";
        if (urlParameter) {
          // 如果item.pageUrl 中包含Entrance.html? 先去掉?和后面的参数
          // 因为Entrance.html中?后面跟的直接是一个json字符串，所以需要判断一下
          if (item.pageUrl.indexOf("Entrance.html") > -1) {
            item.pageUrl = item.pageUrl.replace(/\?.*$/, "");
            // 判断是不是对象
            if (typeof urlParameter === "object") {
              urlParameter = JSON.stringify(urlParameter);
            }

            item.pageUrl += "?" + encodeURIComponent(urlParameter);
          }
          // 如果是其他的页面，直接在后面添加参数
          else {
            item.pageUrl += item.pageUrl.indexOf("?") > -1 ? "&" : "?";
            // 判断是不是对象
            if (typeof urlParameter === "object") {
              Object.keys(urlParameter).forEach((key) => {
                item.pageUrl += `${key}=${encodeURIComponent(urlParameter[key])}&`;
              });
              // 去掉最后一个&
              item.pageUrl = item.pageUrl.slice(0, -1);
            } else item.pageUrl += encodeURIComponent(urlParameter);
          }
        }

        localStorage.removeItem("isRemoteConfig");
        //默认先取菜单节点本身配置的
        let apiItem = null;
        let nameItem = null;
        if (item.menu_parameter && item.menu_parameter.length) {
          apiItem = item.menu_parameter.find((param) => {
            return param.field_code == "frontend_config_api";
          });
          nameItem = item.menu_parameter.find((param) => {
            return param.field_code == "frontend_config_project_name";
          });
        }
        //若节点本身没配置frontend_config_api,则从父级菜单的menu_parameter中取
        if (!apiItem && item.menu_pid && this.initMenuData && this.initMenuData.length) {
          let parentMenu = this.initMenuData.find((m) => m.menu_id === item.menu_pid);
          if (parentMenu && parentMenu.menu_parameter && parentMenu.menu_parameter.length) {
            apiItem = parentMenu.menu_parameter.find((param) => {
              return param.field_code == "frontend_config_api";
            });
            nameItem = parentMenu.menu_parameter.find((param) => {
              return param.field_code == "frontend_config_project_name";
            });
          }
        }
        if (apiItem) {
          erRequest.post(
            apiItem.value,
            {
              serverName: nameItem ? nameItem.value : "",
            },
            (res) => {
              if (res.code !== "SUCCESS") {
                this.handlePageUrl(item);
              } else {
                if (res.data) {
                  let temp = JSON.parse(erTool.decryptsm2(res.data.random1, res.data.random2));
                  // 远程只下发部分配置项,存到独立key,Entrance.html加载完本地entranceJS后再合并覆盖
                  localStorage.setItem("REMOTE_PARTIAL_CONFIG", JSON.stringify(temp));
                  localStorage.setItem("isRemoteConfig", "-1");
                  this.handlePageUrl(item);
                }
              }
            },
            (error) => {
              this.handlePageUrl(item);
            },
          );
        } else {
          this.handlePageUrl(item);
        }
      }
    },
    menuWidth(index, menu = {}) {
      const marginRight = (index + 1) % this.menuCols == 0 ? "0px" : "5px";
      let visibility = "visible";
      if (!menu.menu_name) {
        visibility = "hidden";
      }
      return { width: `calc((100% - ${(this.menuCols - 1) * 15}px) / ${this.menuCols})`, marginRight: marginRight, "flex-grow": 1, visibility };
    },
    menuDynamicClass(index, groupList = []) {
      let oneMenuMb0 = false;
      let rest = groupList.length % this.menuCols;
      if (rest == 0) {
        rest = this.menuCols;
      }

      oneMenuMb0 = index >= groupList.length - rest;
      return {
        // "mb-0": oneMenuMb0
      };
    },
    getBgStyle() {
      if (this.config.ControlProperty.MenuMode !== "card") return;
      const containers = document.querySelectorAll(".oneMenuisCard");
      containers.forEach((container, index) => {
        this.checkImageExistence(this.getImgSrc(this.closeMenuList[index]), (exists, imgUrl) => {
          container.style.backgroundSize = "cover";
          container.style.backgroundPosition = "center";
          if (exists) {
            container.style.backgroundImage = `url(${imgUrl})`; // 动态设置背景图
          } else {
            container.style.backgroundImage = `url(${window.PAGE_CONFIG.menuDefaultImageCard})`; // 设置默认背景图
          }
          if (index >= containers.length - this.menuCols && !this.isShowCloseButton) {
            container.style.marginBottom = "0px";
          } else {
            container.style.marginBottom = "20px";
          }
        });
      });
    },
    checkImageExistence(imgUrl, callback) {
      const img = new Image();
      // 图片加载成功，回调设置为该图片
      img.onload = function () {
        callback(true, imgUrl);
      };

      // 图片加载失败，回调设置为默认图片
      img.onerror = function () {
        callback(false, null);
      };
      // 设置图片路径，触发加载
      img.src = imgUrl;
    },
    handleSortList(list = [], sortKey = "") {
      const resList = erowConfig.deepClone(list);
      if (!sortKey || resList.length == 0) {
        return resList;
      }

      resList.sort((a, b) => {
        const sortValueA = a[sortKey] || 0;
        const sortValueB = b[sortKey] || 0;
        return sortValueA - sortValueB;
      });

      return resList;
    },
  },
  created() {
    this.rows = Number(this.config.ControlProperty.Rows) || 0;
    this.getData();
    eventEmitter.on("refresh", (res) => {
      this.getData();
    });
  },
};
