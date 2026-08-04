window.addEventListener("load", () => {
  UcContainerNoGroup.components = {
    "page-title-container": PageTitleContainer,
    "page-list-content-container": PageListContentContainer,
    "uc-scope-container": UcScopeContainer,
    "uc-form-container": UcFormContainer,
    "card-item-container": UcCardContainer,
    "uc-js-grid-container": UcJsGridContainer,
    "uc-workflow": UcWorkflow,
    "uc-button-container": UcButtonContainer,
    "uc-file-container": UcFileContainer,
    "uc-charts-container": UcChartContainer,
    "uc-bottom-bar": UcBottomBar,
    "uc-container": UcContainer,
    "uc-tab-group":PageTabGroup
  };
});

var UcContainerNoGroup = {
  name: "UcContainerNoGroup",
  template: `
    <div :class="activeClass()" class="UcContainerNoGroup" :style="contentGridStyle">
    <div class="UcContainerNoGroup-content">
      <template v-for="configItem in childContainers">
        <page-title-container
          v-if="configItem.ControlCode == 'UcPageTitleContainer'"
          :style="subContainerStyle(configItem)"
          :key="configItem.ControlGUID"
          :config="convertUcTabConfig(configItem)"
          :ref="configItem.ControlProperty.ID"
          :isloaddata="isloaddata"
          :containerdata="containerdata[configItem.ControlProperty.ID]">
          <template v-slot:left></template>
        </page-title-container>
        <uc-js-grid-container
          :ref="configItem.ControlProperty.ID"
          :config="convertUcTabConfig(configItem)"
          v-if="configItem.ControlCode == 'UcJsGridContainer'"
          :key="configItem.ControlGUID">
         </uc-js-grid-container>
        <uc-scope-container
          :ref="configItem.ControlProperty.ID"
          v-if="configItem.ControlCode == 'UcScopeContainer'"
          :style="subContainerStyle(configItem)"
          :config="convertUcTabConfig(configItem)"
          :key="configItem.ControlGUID">
        </uc-scope-container>

        <page-list-content-container
          :ref="configItem.ControlProperty.ID"
          v-if="configItem.ControlCode == 'UcPageListContainer'"
          :config="convertUcTabConfig(configItem)"
          :style="subContainerStyle(configItem)"
          :key="configItem.ControlGUID"
          :isloaddata="isloaddata"
          :containerdata="containerdata[configItem.ControlProperty.ID]"
          :loading="loading"
        >
        </page-list-content-container>

        <uc-form-container
          :ref="configItem.ControlProperty.ID"
          :style="subContainerStyle(configItem)"
          :config="convertUcTabConfig(configItem)"
          v-if="configItem.ControlCode == 'UcFormDetailView'"
          :isloaddata="isloaddata"
          :containerdata="containerdata[configItem.ControlProperty.ID]">
        </uc-form-container>

        <card-item-container
          :ref="configItem.ControlProperty.ID"
          :style="subContainerStyle(configItem)"
          :config="convertUcTabConfig(configItem)"
          v-if="configItem.ControlCode == 'UcCardContainer'">
        </card-item-container>

        <uc-file-container
            v-if="
              configItem.ControlCode == 'UcFileContainer'
            "
            :ref="configItem.ControlProperty.ID"
            :config="configItem"
            :key="configItem.ControlGUID">
          </uc-file-container>

        <uc-workflow
          :ref="configItem.ControlProperty.ID"
          :config="convertUcTabConfig(configItem)"
          :style="subContainerStyle(configItem)"
          v-if="configItem.ControlCode == 'UcWorkflow'">
        </uc-workflow>

        <uc-button-container
          v-if="configItem.ControlCode == 'UcButtonContainer' && !footerUcButtonContainer"
          :ref="configItem.ControlProperty.ID"
          :style="subContainerStyle(configItem)"
          :config="convertUcTabConfig(configItem)"
          :key="configItem.ControlGUID">
        </uc-button-container>

        <uc-container
          v-if="configItem.ControlCode == 'UcContainer'"
          :ref="configItem.ControlProperty.ID"
          :style="subContainerStyle(configItem)"
          :config="convertUcTabConfig(configItem)"
          :isTopUcContainer="false"
          :key="configItem.ControlGUID">
        </uc-container>

        <uc-charts-container
          v-if="configItem.ControlCode == 'UcChartContainer'"
          :ref="configItem.ControlProperty.ID"
          :style="subContainerStyle(configItem)"
          :config="configItem"
          :key="configItem.ControlGUID"
          :isloaddata="isloaddata"
          :containerdata="containerdata[configItem.ControlProperty.ID]"
        >
      </uc-charts-container>
      <uc-tab-group
        :ref="configItem.ControlProperty.ID"
        v-if="
          configItem.ControlCode == 'UcTabGroup'
        "
        :config="configItem"
        :key="configItem.ControlGUID"
      >
      </uc-tab-group>
      </template>
      </div>
      <div class="uc-footer" v-if="footerUcButtonContainer">
        <uc-button-container
          :ref="footerUcButtonContainer.ControlProperty.ID"
          :config="footerUcButtonContainer"
          :key="footerUcButtonContainer.ControlGUID"></uc-button-container>
      </div>
    </div>
  `,
  mixins: [commonMinxin],
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
    isloaddata: {
      type: Boolean,
      default: true,
    },
    loading: {
      // 父组件加载状态
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {};
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
          grid: `0fr / ${this.colsWidths.join(" ")}`,
        };
      }
      return {};
    },
    childContainers() {
      return this.config.ChildContainers;
      // return erowConfig.convertConfig(this.config.ChildContainers, {
      //   pValueSet: this.config.pValueSet,
      //   menuRowGuid: this.config.menuRowGuid,
      //   menuConfigKey: this.config.menuConfigKey,
      //   rootControlGuid: this.config.rootControlGuid,
      //   pageMode: this.config.pageMode,
      //   keyValue: this.config.keyValue,
      // });
    },
    footerUcButtonContainer() {
      if (!Array.isArray(this.childContainers)) {
        return null;
      }
      const childContainers = this.childContainers.filter((item) => !["SideMenuContainer"].includes(item.ControlCode));
      //先判断UcButtonContainer是否配置IsFooter属性
      let buttonContainer = childContainers.find(child=>child.ControlCode == "UcButtonContainer")
      if(buttonContainer){
        let IsFooter = false
        if(buttonContainer.ControlProperty.IsFooter !== undefined){
          IsFooter = String(buttonContainer.ControlProperty.IsFooter).toLowerCase() === 'true'
        }
        if(IsFooter){
          return buttonContainer
        }
      }
      //判断最后一个子控件是否为buttonContainer
      const footerUcButtonContainer = childContainers[childContainers.length - 1];
      if (footerUcButtonContainer && footerUcButtonContainer.ControlCode == "UcButtonContainer") {
        footerUcButtonContainer.IsFooter = true;
        return footerUcButtonContainer;
      }
      return null;
    },
  },
  methods: {
    subContainerStyle(configItem) {
      if (configItem.Colspan) {
        return {
          "grid-column": `span ${configItem.Colspan}`,
        };
      }
      return {};
    },
    convertUcTabConfig(config) {
      return (config = Object.assign(config, {
        UcTabGroupActive: this.config.UcTabGroupActive,
      }));
    },
  },
  created() {},
};
