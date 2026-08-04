var UcTableContainer = {
  name: "UcTableContainer",
  template: `
    <div
      class='UcTableContainer'
      :class="activeClass(config)"
    >
      <slot class='card-slot'/>
      <table class="FormViewTable">
        <colgroup>
          <col :width="item" v-for="(item, i) in colsWidth" :key="i" />
        </colgroup>
        <tbody>
          <tr v-for="key in Object.keys(childContainers)" :key="key">
            <td
              v-for="configItem in childContainers[key]"
              :key="configItem.ControlGUID"
              :style="hideCols(configItem)"
              :colspan="getColSpan(configItem)"
              :rowspan="getRowSpan(configItem)"
            >
            <page-title-container
            v-if=" configItem.ControlCode=='UcPageTitleContainer'"
            :key="configItem.ControlGUID"
            :config="configItem"
            :isshowleft="false"
           >
            <template v-slot:left></template>
           </page-title-container>

           <uc-chart-container
           v-if="configItem.ControlCode == 'UcChartContainer'"
           :ref="configItem.ControlProperty.ID"
           :config="configItem"
           :key="configItem.ControlGUID"
           >
           </uc-chart-container>
            </td>
          </tr>
        </tbody>
      </table>
    </div>`,
  components: {
    "page-title-container": PageTitleContainer,
    "uc-chart-container": UcChartContainer,
  },
  mixins: [commonMinxin],
  methods: {
    getColSpan({ Colspan, ControlProperty = {} }) {
      return Colspan || ControlProperty.Colspan || 1;
    },
    getRowSpan({ Rowspan, ControlProperty = {} }) {
      return Rowspan || ControlProperty.Rowspan || 1;
    },
    hideCols(item) {
      if (erowConfig.hasProp(item.ControlProperty, "Colspan")) {
        if (item.ControlProperty.Colspan == "0") {
          return { display: "none" };
        } else {
          return {};
        }
      }
      if (item.ControlCode == "UcData" || item.ControlCode == "UcHiddenField") {
        return { display: "none" };
      }
    },
    generateChildContainers() {
      let _this = this;
      let temp = [];
      if (Array.isArray(_this.config.ChildContainers)) {
        _this.config.ChildContainers.forEach((item) => {
          let temp1 = item;
          temp1.ControlProperty["FnCode"] = _this.config.ControlProperty.FnCode;
          temp.push(temp1);
        });
      }
      if (Array.isArray(temp)) {
        //是否有合并项
        let isMerge = temp.reduce(function (pre, cur) {
          if (erowConfig.hasProp(cur.ControlProperty, "Offset")) {
            pre = true;
          }
          return pre;
        }, false);
        //构建子容器对象
        _this.childContainers = erowConfig.getNewLineArr(temp);
        if (isMerge) {
          _this.childContainers = erowConfig.getMergeArr(_this.childContainers);
        }
      }
    },
  },
  computed: {
    colsWidth() {
      if (this.config.ControlProperty && this.config.ControlProperty.ColsWidth) {
        return this.config.ControlProperty.ColsWidth.split(",");
      } else {
        return [];
      }
    },
  },
  data() {
    return {
      childContainers: {},
    };
  },
  created() {
    this.generateChildContainers();
  },
  props: {
    config: {
      type: Object,
      default: () => {},
    },
  },
};
