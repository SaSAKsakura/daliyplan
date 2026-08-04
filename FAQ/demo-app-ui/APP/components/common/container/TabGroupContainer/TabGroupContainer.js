var PageTabGroup = {
  name: "PageTabGroup",
  mixins: [commonMinxin, gridMinxin],
  components: {
    "page-list-content-container": PageListContentContainer,
    "uc-form-container": UcFormContainer,
    "card-item-container": UcCardContainer,
    "uc-container-no-group": UcContainerNoGroup,
    "uc-grid-container": UcGridContainer,
    "uc-js-grid-container": UcJsGridContainer,
    "uc-scope-container": UcScopeContainer,
  },
  template: `
    <div class="PageTabGroup" :class="selfActiveClass" :style="activeStyle()">
      <uc-scope-container v-if="ucScopeContainer" :config="ucScopeContainer" />
      <van-tabs v-model="active" :color="'#61b2ff'" :swipeable="isNeedSwip" @change="changeTabAfter(active)" :before-change="beforeChange">
        <van-tab v-for="(configItem, index) in childContainers" :key="index + configItem.ControlGUID" :title="getTabTitle(configItem)"  >
          <van-pull-refresh v-model="pullRefreshLoading" :disabled="pullRefreshDisabled(configItem)" @refresh="pullRefresh" class="pageListView">
            <page-list-content-container
              v-if="configItem.ControlCode == 'UcPageListContainer'"
              :ref="configItem.ControlProperty.ID"
              :containerdata="containerDataObj[configItem.ControlProperty.ID]"
              :isloaddata="!isSameDataSource"
              :config="convertUcTabConfig(configItem)"
              :loading="isLoading" />
            <uc-container-no-group
              v-if="configItem.ControlCode == 'UcContainer'"
              :ref="configItem.ControlProperty.ID"
              :config="convertUcTabConfig(configItem)"
              :containerdata="containerDataObj"
              :isloaddata="!isSameDataSource"
              :loading="isLoading" />
            <uc-form-container
              v-if="configItem.ControlCode == 'UcFormDetailView'"
              :ref="configItem.ControlProperty.ID"
              :config="convertUcTabConfig(configItem)" />
            <uc-grid-container
              v-if="configItem.ControlCode == 'UcGridviewContainer'"
              :ref="configItem.ControlProperty.ID"
              :config="convertUcTabConfig(configItem)" />
            <uc-js-grid-container
            v-if="configItem.ControlCode == 'UcJsGridContainer'"
            :ref="configItem.ControlProperty.ID"
            :config="convertUcTabConfig(configItem)"
          >
          </uc-js-grid-container>
            <card-item-container
              v-if="configItem.ControlCode == 'UcCardContainer'"
              :ref="configItem.ControlProperty.ID"
              :config="convertUcTabConfig(configItem)"
              :containerdata="containerDataObj[configItem.ControlProperty.ID]"
              :isloaddata="!isSameDataSource" />
          </van-pull-refresh>
        </van-tab>
      </van-tabs>
    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    active: 0,
    isSameDataSource: false,
    tabContainers: [],
    markSourceIDs: {},
    page: 1, // 用于获取容器内容总条数
    rows: 1, // 用于获取容器内容总条数
    isLoading: false,
  }),
  computed: {
    containerCtnrUID() {
      let FnCode = this.config.FnCode;
      let FnParameter = this.config.FnParameter || ".";
      let CtnrUID = this.config.CtnrUID;
      return [FnCode, FnParameter, CtnrUID].join(".");
    },
    isNeedSwip() {
      return this.config.ControlProperty.IsNeedSwip && this.config.ControlProperty.IsNeedSwip === "false" ? false : true;
    },
    realFirstUcFormData() {
      //嵌套情况下直接从config 取
      return this.config._formPrimaryData;
    },
    ucScopeContainer() {
      return this.config.ChildContainers.find((item) => item._TargetControlCode === "RefContainer.UcScopeContainer");
    },
    childContainers() {
      let childContainers = this.config.ChildContainers;
      if (this.realFirstUcFormData) {
        childContainers = childContainers.filter((controlItem) => {
          let visibleToDataField = controlItem.ControlProperty.visibleToDataField;
          return !visibleToDataField || (visibleToDataField && this.realFirstUcFormData && this.realFirstUcFormData[visibleToDataField] == "true");
        });
      }
      return childContainers.filter((item) => item._TargetControlCode !== "RefContainer.UcScopeContainer");
    },
    selfActiveClass() {
      let selfActiveClass = this.activeClass();
      if (this.config.ControlProperty.ViewType) {
        selfActiveClass += " tabGroup_" + this.config.ControlProperty.ViewType;
      }
      return selfActiveClass;
    },
    scopeCtnrMap() {
      const map = {};
      const containers = this.childContainers || [];
      containers.forEach((item) => {
        if (erowConfig.hasProp(item, "ScopeCtnr")) {
          map[item.ScopeCtnr] = {
            ScopeCtnr: item.ScopeCtnr,
            ScopeCtnrGuid: item.ScopeCtnrGuid,
            ScopeCtnrConfig: item.ScopeCtnrConfig,
          };
        }
      });
      return map;
    },
    activeScopeCtnr() {
      const containers = this.childContainers;
      if (!containers || !containers.length) {
        return null;
      }
      const activeTab = containers[this.active];
      if (!activeTab || !erowConfig.hasProp(activeTab, "ScopeCtnr")) {
        return null;
      }
      return this.scopeCtnrMap[activeTab.ScopeCtnr] || null;
    },
  },
  methods: {
    convertUcTabConfig(config) {
      return (config = Object.assign(config, {
        UcTabGroupActive: this.active,
      }));
    },
    getTabTitle(configItem) {
      if (this.containerDataObj[configItem.ControlProperty.ID] && this.containerDataObj[configItem.ControlProperty.ID].listSize >= 0) {
        return `${configItem.parentControlProperty.RSValue}(${this.containerDataObj[configItem.ControlProperty.ID].listSize})`;
      } else {
        if (erowConfig.hasProp(configItem, "parentControlProperty")) {
          if (configItem.parentControlProperty.MarkSourceID) {
            return configItem.parentControlProperty.RSValue + "(" + this.markSourceIDs[configItem.parentControlProperty.MarkSourceID] + ")";
          }
          return configItem.parentControlProperty.RSValue;
        }
      }
    },
    initMarkSourceIDs() {
      let tempObj = {};
      this.config.ChildContainers.forEach((one) => {
        if (erowConfig.hasProp(one, "parentControlProperty")) {
          if (one.parentControlProperty.MarkSourceID) {
            tempObj[one.parentControlProperty.MarkSourceID] = "0";
          }
        }
      });
      this.markSourceIDs = tempObj;
    },
    handleAfterGetOGridData(dataInfo) {
      Object.keys(dataInfo.gridData).forEach((key) => {
        if (erowConfig.hasProp(this.markSourceIDs, key)) {
          this.markSourceIDs[key] = dataInfo.gridData[key].listSize;
        }
      });
    },
    setPagelistContainers() {
      this.childContainers.forEach((item) => {
        // 遍历树
        const loop = (data) => {
          if (data.ControlCode == "UcPageListContainer") {
            this.pageListContainers.push(data);
          } else if (erowConfig.hasProp(data, "ChildContainers")) {
            data.ChildContainers.forEach((child) => {
              loop(child);
            });
          }
        };
        loop(item);
      });
    },
    beforeChange(index) {
      if (erowConfig.hasProp(this.config.ControlProperty, "BeforeSwitchTab")) {
        let params = {
          configItem: this.config,
          toActive: index,
        };
        let funcName = this.config.ControlProperty.BeforeSwitchTab;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          temp = baseSpecial[funcName](params, this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          temp = erowSpecial[funcName](params, this);
        } else {
          var fnObj = this.config.ControlProperty.FnCode;
          temp = window[fnObj][funcName](params, this);
        }
        return temp;
      } else {
        return true;
      }
    },
    changeTabAfter() {
      // sessionStorage.setItem("tempSearch" + this.config.ControlProperty.ID, JSON.stringify({ active: this.active }));
      this.setActiveCache();
      if (erowConfig.hasProp(this.config.ControlProperty, "AfterSwitchTab")) {
        let params = {
          configItem: this.config,
          active: this.active,
        };
        let funcName = this.config.ControlProperty.AfterSwitchTab;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          temp = baseSpecial[funcName](params, this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          temp = erowSpecial[funcName](params, this);
        } else {
          var fnObj = this.config.ControlProperty.FnCode;
          temp = window[fnObj][funcName](params, this);
        }
      }
      this.cssCompatibility();

      // Tab切换后触发页面采集
      this.$nextTick(() => {
        this.triggerTabPageCollect();
      });
    },
    triggerTabPageCollect() {
      // Tab切换时触发页面采集
      if (typeof window.pageCollect === 'undefined' || !window.pageCollect.isCollecting()) {
        return;
      }

      const activeTab = this.childContainers[this.active];
      if (!activeTab) return;

      // 获取当前页面的采集信息
      const parentPageInfo = window.pageCollect.getCurrentPageCollectInfo();
      if (!parentPageInfo || !parentPageInfo.menuRowGuid) {
        console.warn('[TabGroupContainer] 无法获取父页面采集信息');
        return;
      }

      const pageInfo = {
        menuRowGuid: parentPageInfo.menuRowGuid,
        menuName: parentPageInfo.menuName,
        pagePath: `${window.location.pathname}#tab-${this.active}`,
        pageMode: (this.config.pageMode || parentPageInfo.pageMode || 'VIEW').toUpperCase()
      };

      // 异步执行采集，不阻塞UI
      window.pageCollect.collectPageData(activeTab, pageInfo)
        .catch(err => {
          console.error('[TabGroupContainer] Tab切换采集失败:', err);
        });
    },
    cssCompatibility() {
      document.querySelectorAll(".PageTabGroup .van-tabs .van-tab__pane").forEach((dom) => {
        const targetDOM = dom.querySelectorAll(".tab-no-padding");
        // console.log({targetDOM})
        let count = targetDOM.length;
        if (count > 0) {
          // console.log({ count, targetDOM });
          dom.classList.add("tab-no-padding"); // 添加类名
        }
      });
    },
    setActiveCache() {
      let _this = this;
      let info = {
        active: _this.active,
        ctnrUID: _this.containerCtnrUID,
      };
      let pageParams = pageManager.getPageParams();
      if (pageParams.tabPosition) {
        let index = pageParams.tabPosition.findIndex((item) => item.ctnrUID == info.ctnrUID);
        if (index == -1) {
          pageParams.tabPosition.push(info);
        } else {
          pageParams.tabPosition.splice(index, 1, info);
        }
      } else {
        pageParams.tabPosition = [info];
      }
      pageManager.updateParams(pageManager.pages.length - 1, { tabPosition: pageParams.tabPosition });
    },
    getActiveCache() {
      let pageParams = pageManager.getPageParams();
      if (pageParams.tabPosition) {
        let index = pageParams.tabPosition.findIndex((item) => item.ctnrUID == this.containerCtnrUID);
        if (index == -1) {
          return 0;
        } else {
          return pageParams.tabPosition[index].active;
        }
      } else {
        return 0;
      }
    },
  },
  watch: {
    activeScopeCtnr: {
      handler(scopeCtnr) {
        window.activeTabScopeCtnr = scopeCtnr;
      },
      immediate: true,
    },
  },
  created() {
    if (this.config.ControlProperty && this.config.ControlProperty.SelectedTabID) {
      const selectedTabID = erowConfig.getConfigFieldValue(this.config.ControlProperty.SelectedTabID);
      this.active = Math.max(
        this.config.ChildContainers.findIndex((item) => item.parentControlProperty.ID == selectedTabID || item.ControlProperty.ID == selectedTabID),
        0
      );
    }
    const cachedActive = this.getActiveCache();
    if (cachedActive) {
      this.active = cachedActive;
    }
    this.active = pageManager.getPageParams().active ? pageManager.getPageParams().active : this.active;
    this.initMarkSourceIDs(); //初始化tab项数量,默认0
    this.setPagelistContainers(); //递归得到所有的pageListContaienr

    this.config.ChildContainers.forEach((item) => {
      this.$set(this.containerDataObj, item.ControlProperty.ID, {});
    });
    this.pageListContainers.forEach((item) => {
      if (this.childContainers[this.active].ControlProperty.ID !== item.ControlProperty.ID) {
        setTimeout(() => {
          this.getDefaultValueAndSearchList([item], "", "tab");
        }, 100 + Math.floor(Math.random() * (100 - 1)) + 1);
      }
    });
    eventEmitter.on("search", (val) => {
      this.pageListContainers.forEach((item) => {
        if (this.childContainers[this.active].ControlProperty.ID !== item.ControlProperty.ID) {
          setTimeout(() => {
            if (item.ControlProperty.ScopeCtnrGuid == val) {
              this.getDefaultValueAndSearchList([item], "", "tab");
            }
          }, 100 + Math.floor(Math.random() * (100 - 1)) + 1);
        }
      });
    });
    // }
    if (this.markSourceIDs) {
      eventEmitter.on("afterGetGridData", this.handleAfterGetOGridData);
    }
  },
  mounted() {
    this.cssCompatibility();
  },
};
