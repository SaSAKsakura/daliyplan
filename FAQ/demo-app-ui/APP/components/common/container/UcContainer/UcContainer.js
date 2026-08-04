window.addEventListener("DOMContentLoaded", () => {
  UcContainer.components = {
    "page-title-container": PageTitleContainer,
    "page-tab-group": PageTabGroup,
    "page-list-content-container": PageListContentContainer,
    "uc-scope-container": UcScopeContainer,
    "uc-form-container": UcFormContainer,
    "uc-js-grid-container": UcJsGridContainer,
    "card-item-container": UcCardContainer,
    "uc-workflow": UcWorkflow,
    "uc-button-container": UcButtonContainer,
    "uc-file-container": UcFileContainer,
    "uc-charts-container": UcChartContainer,
    "uc-msg-container": UcMsgContainer,
    "uc-banner-container": UcBannerContainer,
    "uc-menu-container": UcMenuContainer,
    "uc-bottom-bar": UcBottomBar,
    "uc-container": UcContainer,
    "uc-ascx": UcAscx,
    "uc-grid-container": UcGridContainer,
    "uc-map-container": UcMapContainer,
    "uc-table-container": UcTableContainer,
    "side-menu-container": SideMenuContainer,
    "uc-data-list-container": UcDataListContainer,
    "uc-tree-node-container": UcTreeNodeContainer,
    "uc-html-template-container": UcHtmlTemplateContainer,
    "uc-evaluation": UcEvaluation,
    "uc-card-file-container": UcCardFileContainer,
  };
});

var UcContainer = {
  name: "UcContainer",
  mixins: [commonMinxin, dataSourceMinxin],
  template: `
    <div class="ucContainer" :class="activeClass(config)">
      <side-menu-container v-if="sideMenuContainer && isTablet" :config="sideMenuContainer"/>
      <div class="pageContent" :style="contentGridStyle">
        <page-title-container
          v-if="ucPageTitleContainer && canLoadComp(ucPageTitleContainer)"
          :config="ucPageTitleContainer"
          :ref="ucPageTitleContainer.ControlProperty.ID">
          <template v-slot:left></template>
        </page-title-container>
        <van-pull-refresh v-model="pullRefreshLoading" :disabled="pullRefreshDisabled(config)" @refresh="pullRefresh()" class="van-pull-refresh__track">
          <div class="uc-content">
            <template v-for="(configItem, index) in childContainers">
              <uc-form-container
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                v-if="
                    configItem.ControlCode == 'UcFormDetailView' &&
                    (configItem.ControlProperty.ID ==
                      firstUcFormContainer.ControlProperty.ID ||
                      canLoadComp(configItem))
                  "
                :key="configItem.ControlGUID"></uc-form-container>

              <page-title-container
                v-if="
                  ucPageTitleContainer !== configItem &&
                  configItem.ControlCode == 'UcPageTitleContainer' &&
                  canLoadComp(configItem)
                "
                :key="configItem.ControlGUID"
                :config="configItem">
                <template v-slot:left></template>
              </page-title-container>

              <uc-msg-container
                :ref="configItem.ControlProperty.ID"
                :key="configItem.ControlGUID"
                v-if="
                  configItem.ControlCode == 'UcMsgContainer' &&
                  canLoadComp(configItem)
                "
                :config="configItem"></uc-msg-container>
              <uc-banner-container
                :ref="configItem.ControlProperty.ID"
                :key="configItem.ControlGUID"
                v-if="
                  configItem.ControlCode == 'UcBannerContainer' &&
                  canLoadComp(configItem)
                "
                :config="configItem"></uc-banner-container>

              <uc-menu-container
                :ref="configItem.ControlProperty.ID"
                :key="configItem.ControlGUID"
                v-if="configItem.ControlCode == 'UcMenuContainer'"
                :config="configItem"></uc-menu-container>

              <uc-scope-container
                :ref="configItem.ControlProperty.ID"
                v-if="
                  configItem.ControlCode == 'UcScopeContainer' &&
                  canLoadComp(configItem)
                "
                :config="configItem"
                :key="configItem.ControlGUID"></uc-scope-container>

              <page-tab-group
                :ref="configItem.ControlProperty.ID"
                v-if="
                  configItem.ControlCode == 'UcTabGroup' &&
                  canLoadComp(configItem)
                "
                :config="configItem"
                :key="configItem.ControlGUID"></page-tab-group>

              <page-list-content-container
                :ref="configItem.ControlProperty.ID"
                v-if="
                  configItem.ControlCode == 'UcPageListContainer' &&
                  canLoadComp(configItem)
                "
                :class="getPageListClass()"
                :config="configItem"
                :key="configItem.ControlGUID"></page-list-content-container>

              <uc-js-grid-container
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                v-if="
                  configItem.ControlCode == 'UcJsGridContainer' &&
                  canLoadComp(configItem)
                "
                :key="configItem.ControlGUID"></uc-js-grid-container>

              <card-item-container
                :key="configItem.ControlGUID"
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                v-if="
                  configItem.ControlCode == 'UcCardContainer' &&
                  (configItem.ControlProperty.ID ==
                    firstUcFormContainer.ControlProperty.ID ||
                    canLoadComp(configItem))
                "></card-item-container>

              <uc-file-container
                v-if="
                  configItem.ControlCode == 'UcFileContainer' &&
                  canLoadComp(configItem)
                "
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :key="configItem.ControlGUID"></uc-file-container>
              <uc-card-file-container v-if="
                  configItem.ControlCode == 'UcCardFileContainer' &&
                  canLoadComp(configItem)
                "
                :config="configItem"
                ></uc-card-file-container>
              <uc-map-container
                v-if="configItem.ControlCode == 'UcMapContainer'"
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :key="configItem.ControlGUID"></uc-map-container>
              <uc-workflow
                :key="configItem.ControlGUID"
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                v-if="
                  configItem.ControlCode == 'UcWorkflow' &&
                  canLoadComp(configItem)
                "></uc-workflow>


              <uc-charts-container
                v-if="
                  configItem.ControlCode == 'UcChartContainer' &&
                  canLoadComp(configItem)
                "
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :key="configItem.ControlGUID"></uc-charts-container>

              <UcContainer
                v-if="
                  configItem.ControlCode == 'UcContainer' &&
                  canLoadComp(configItem)
                "
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :key="configItem.ControlGUID"
                :isTopUcContainer="false"></UcContainer>

              <uc-ascx
                v-if="
                  configItem.ControlCode == 'UcASCX' && canLoadComp(configItem)
                "
                :config="configItem"
                :key="configItem.ControlGUID"
                :ref="configItem.ControlProperty.ID"></uc-ascx>

                <uc-html-template-container
                v-if="
                  configItem.ControlCode == 'UcHTMLTemplate' && canLoadComp(configItem)
                "
                :config="configItem"
                :key="configItem.ControlGUID"
                :ref="configItem.ControlProperty.ID"></uc-html-template-container>

                

              <uc-table-container
                v-if="
                  configItem.ControlCode == 'UcTableContainer' &&
                  canLoadComp(configItem)
                "
                :config="configItem"
                :key="configItem.ControlGUID"
                :ref="configItem.ControlProperty.ID"></uc-table-container>

              <uc-grid-container
                v-if="configItem.ControlCode == 'UcGridviewContainer'&&!isGridTree(configItem) "
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :key="configItem.ControlGUID" />

              <uc-data-list-container
                v-if="configItem.ControlCode == 'UcDataListContainer'&&canLoadComp(configItem)"
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :key="configItem.ControlGUID"
              >
              </uc-data-list-container>
              <uc-tree-node-container  
                v-if="configItem.ControlCode == 'UcTreeNodeContainer'&&canLoadComp(configItem)"
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :key="configItem.ControlGUID">
              </uc-tree-node-container>

               <uc-tree-node-container  
                v-if="configItem.ControlCode == 'UcGridviewContainer'&&isGridTree(configItem)&&canLoadComp(configItem)"
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :key="configItem.ControlGUID">
              </uc-tree-node-container>
               <uc-button-container
                  v-if="
                    configItem.ControlCode == 'UcButtonContainer' &&
                    canLoadComp(configItem) &&
                    index != childContainers.length - 1
                  "
                  :ref="configItem.ControlProperty.ID"
                  :config="configItem"
                  :key="configItem.ControlGUID"
                >
                </uc-button-container>

                <uc-evaluation
                  v-if="
                    configItem.ControlCode == 'UcEvaluation' &&
                    canLoadComp(configItem)
                  "
                  :ref="configItem.ControlProperty.ID"
                  :config="configItem"
                  :key="configItem.ControlGUID"
                >
                </uc-evaluation>
            </template>
          </div>
        </van-pull-refresh>
        <div class="uc-footer" v-if="footerUcButtonContainer && canLoadComp(footerUcButtonContainer)">
          <uc-button-container
            :ref="footerUcButtonContainer.ControlProperty.ID"
            :config="footerUcButtonContainer"
            :key="footerUcButtonContainer.ControlGUID"></uc-button-container>
        </div>
        <div class="uc-footer" v-if="ucBottomBar && canLoadComp(ucBottomBar)">
          <uc-bottom-bar
            :ref="ucBottomBar.ControlProperty.ID"
            :config="ucBottomBar"
            :key="ucBottomBar.ControlGUID"></uc-bottom-bar>
        </div>
      </div>
    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    // 标识UcContainer是否是循环嵌套的第一个；用于避免死循环。
    isTopUcContainer: {
      default: true,
      type: Boolean,
    },
  },
  data: () => ({
    isTablet: sessionStorage.getItem("isTablet") === "true",
    isLoadForm: false,
    isLoadMenu: false,
    currentMenu: {},
    firstFormData: {},
  }),
  methods: {
    getPageListClass() {
      if (this.isTopUcContainer) {
        let childCount = this.childContainers.length;
        this.childContainers.forEach((item) => {
          let code = ["UcFormDetailView", "UcCardContainer"];
          let hideFieldArr = ["UcData", "UcHiddenField", "UcJsGridHiddenField"];
          if (code.includes(item.ControlCode)) {
            let hideControls = item.ChildContainers.filter((item) => {
              return hideFieldArr.includes(item.ControlCode);
            });
            if (hideControls.length == item.ChildContainers.length) {
              childCount--;
            }
          }
        });
        if (childCount > 3) {
          return "flex-none";
        }
      }
      return "";
    },
    isGridTree(controlItem) {
      let UseTreeNode = controlItem.ControlProperty.UseTreeNode;
      let code = controlItem.ControlCode;
      let flag = UseTreeNode && UseTreeNode.toLowerCase() == "true" ? true : false;
      console.log(flag);
      return flag;
    },
    canLoadComp(controlItem) {
      let flag1 = this.childContainers && this.childContainers[0] && this.loadedForm && this.loadedMenu;
      let visibleToDataField = controlItem ? controlItem.ControlProperty.visibleToDataField : "";
      let falseArr = ["false", "0"];
      //没有第一个form或menuContainer或者已经加载第一个formhem和menuContainer
      if (visibleToDataField) {
        let tempVal = this.realFirstUcFormData ? this.realFirstUcFormData[visibleToDataField] + "" : "true";
        let flag2 = !falseArr.includes(tempVal);
        let flag = flag1 && flag2;
        return flag;
      } else {
        return flag1;
      }
    },
    getButtonVisible(item) {
      // 没有判断IsFooter为undefined的情况
      if (item.ControlProperty.IsFooter) {
        return item.ControlProperty.IsFooter !== true;
      }
      return true;
    },
    handlePageModeChange(newMode) {
      // 页面模式切换时触发采集
      if (typeof window.pageCollect !== "undefined" && window.pageCollect.isCollecting()) {
        const pageInfo = {
          menuRowGuid: this.config.menuRowGuid || this.currentMenu.menuRowGuid,
          menuName: this.config.menuName || this.currentMenu.menuName,
          pagePath: window.location.pathname,
          pageMode: newMode.toUpperCase(),
        };

        // 使用页面完整配置进行采集
        const collectConfig = {
          ControlCode: this.config.ControlCode,
          CtnrUID: this.config.CtnrUID,
          ControlProperty: this.config.ControlProperty,
          ChildContainers: this.childContainers,
        };

        window.pageCollect
          .collectPageData(collectConfig, pageInfo)
          .then(() => {
            console.log("[UcContainer] 模式切换已重新采集:", newMode);
          })
          .catch((err) => {
            console.error("[UcContainer] 模式切换采集失败:", err);
          });
      }
    },
    triggerPageCollect() {
      // 触发页面采集
      if (typeof window.pageCollect === "undefined" || !window.pageCollect.isCollecting()) {
        return;
      }

      // 设置当前页面信息（供弹层使用）
      const pageInfo = {
        menuRowGuid: this.config.menuRowGuid || this.currentMenu.menuRowGuid,
        menuName: this.config.menuName || this.currentMenu.menuName,
        pagePath: window.location.pathname,
        pageMode: (this.config.pageMode || "VIEW").toUpperCase(),
      };

      window.pageCollect.setCurrentPageCollectInfo(pageInfo);

      // 构建采集配置（包含所有子容器）
      const collectConfig = {
        ControlCode: this.config.ControlCode,
        CtnrUID: this.config.CtnrUID,
        ControlProperty: this.config.ControlProperty,
        ChildContainers: this.childContainers,
      };

      // 异步执行采集，不阻塞UI
      window.pageCollect.collectPageData(collectConfig, pageInfo).catch((err) => {
        console.error("[UcContainer] 页面采集失败:", err);
      });
    },
  },
  computed: {
    colsWidths() {
      if (this.config.ControlProperty.ColsWidth) {
        return this.config.ControlProperty.ColsWidth.split(",");
      }
      return null;
    },
    contentGridStyle() {
      if (this.colsWidths) {
        return {
          display: "grid",
          grid: `auto / ${this.colsWidths.split(" ")}`,
        };
      }
      return {};
    },
    loadedForm() {
      return !this.firstUcFormContainer || this.isLoadForm;
    },
    loadedMenu() {
      return !this.childContainers.find((item) => item.ControlCode == "UcMenuContainer") || this.isLoadMenu;
    },
    childContainers() {
      let childContainers = this.config.ChildContainers;
      if (!this.isTopUcContainer) {
        return childContainers;
      }
      if (window.location.href.includes("/Default.html") && this.isTablet) {
        childContainers = childContainers.filter((item) => item.TargetContainer.ControlProperty.IsShowInPad === "true");
      }
      return erowConfig.convertConfig(childContainers, {
        pValueSet: this.config.pValueSet || this.currentMenu.pValueSet,
        menuRowGuid: this.config.menuRowGuid || this.currentMenu.menuRowGuid,
        menuConfigKey: this.config.menuConfigKey || this.currentMenu.menuConfigKey,
        rootControlGuid: this.config.rootControlGuid,
        pageMode: this.config.pageMode,
        keyValue: this.config.keyValue,
        refreshFlag: this.config.refreshFlag,
        searchParams: this.config.searchParams,
        _IsCacheCtrolData: this.config.ControlProperty.IsCacheCtrolData,
        _IsCacheTempData: this.config.ControlProperty.IsCacheTempData,
        check_keyValues: this.config.check_keyValues,
        defaultValueObj: this.config.defaultValueObj,
      });
    },
    realFirstUcFormData() {
      //嵌套情况下直接从config 取
      return !this.isTopUcContainer ? this.config._formPrimaryData : this.firstFormData;
    },
    firstUcFormContainer() {
      //找到UcContainer中第一个UcForm和UcCard的容器
      return this.childContainers.find(
        (item) => ["UcFormDetailView", "UcCardContainer"].includes(item.ControlCode) && item.ControlProperty.IsRequestData != "false",
      );
    },
    ucPageTitleContainer() {
      return this.childContainers.find((item) => item.ControlCode == "UcPageTitleContainer" && item.ControlProperty.IsTop !== "false");
    },
    footerUcButtonContainer() {
      if (!Array.isArray(this.childContainers)) {
        return null;
      }
      const childContainers = this.childContainers.filter((item) => !["SideMenuContainer"].includes(item.ControlCode));
      const footerUcButtonContainer = childContainers[childContainers.length - 1];
      if (footerUcButtonContainer && footerUcButtonContainer.ControlCode == "UcButtonContainer") {
        footerUcButtonContainer.IsFooter = true;
        return footerUcButtonContainer;
      }
      return null;
    },
    ucBottomBar() {
      if (!Array.isArray(this.childContainers)) {
        return null;
      }
      const childContainers = this.childContainers.filter((item) => !["SideMenuContainer"].includes(item.ControlCode));
      const ucBottomBar = childContainers.find((item) => {
        return item.ControlCode == "UcBottomBar";
      });
      if (ucBottomBar) {
        ucBottomBar.IsFooter = true;
        return ucBottomBar;
      }
      return null;
    },

    sideMenuContainer() {
      return this.childContainers.find((item) => item.ControlCode == "SideMenuContainer");
    },
  },
  watch: {
    childContainers: {
      handler(newVal, oldVal) {
        if (oldVal !== newVal) {
          let UCcontentEL = document.querySelector(".uc-content");
          let hasTabGroup = newVal.find((el) => {
            return el.CtnrUID == "TabGroup" || el.CtnrUID == "PageList";
          });
          if (UCcontentEL.childElementCount === 1 && !hasTabGroup) {
            UCcontentEL.classList.add("uc-content-only-child");
          } else {
            UCcontentEL.classList.remove("uc-content-only-child");
          }
        }
      },
    },
    "config.pageMode": {
      handler(newMode, oldMode) {
        // 页面模式切换时重新采集
        if (newMode && oldMode && newMode !== oldMode) {
          this.handlePageModeChange(newMode);
        }
      },
    },
  },
  created() {
    let _this = this;
    this.removeTempCache(this.config); //清理临时缓存
    this.initDataSouce();
    eventEmitter.on("afterGetFormData", ({ controlID, primaryData, isOriginFormData = true }) => {
      if (!this.firstUcFormContainer) return true;
      if (controlID == this.firstUcFormContainer.ControlProperty.ID) {
        if (this.isTopUcContainer) {
          //最外层UcForm或UcCard 的值
          Object.keys(primaryData).forEach((key) => {
            _this.$set(_this.firstFormData, key, primaryData[key]);
          });
        }
        erowConfig.convertConfig(this.config.ChildContainers, {
          _formPrimaryData: primaryData,
          _isOriginFormData: isOriginFormData !== false,
        });
        this.isLoadForm = true;
      }
    });
    eventEmitter.on("afterGetMenuData", ({ controlID, currentMenu }) => {
      const menuConfig = this.childContainers.find((item) => item.ControlCode == "UcMenuContainer");
      if (menuConfig && controlID == menuConfig.ControlProperty.ID) {
        this.currentMenu = currentMenu;
        this.isLoadMenu = true;
        setTimeout(() => {
          if (this.$attrs.flag == "inhome") {
            this.triggerPageCollect();
          }
        }, 100);
      }
    });

    // 页面加载完成后触发采集（使用$nextTick确保DOM已渲染）
    this.$nextTick(() => {
      // 延迟一点确保所有子组件都加载完成
      setTimeout(() => {
        if (this.$attrs.flag != "inhome") {
          this.triggerPageCollect();
        }
      }, 100);
    });
  },
};
