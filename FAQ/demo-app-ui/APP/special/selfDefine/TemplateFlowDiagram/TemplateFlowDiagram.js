var TemplateFlowDiagram = {
  template: `<div class="template-flow-diagram">
    <div v-show="currentMode == 'grid'">
      <UcGridviewContainer
        v-if="isloading"
        :config="gridconfig"
        ref="tableList"
        class="flex-grid"
      >
      </UcGridviewContainer>
    </div>
    <div v-show="currentMode == 'flow'" class="flow-wrap">
      <div
        v-for="(item, index) in flowList"
        :key="index"
        :style="returnFlowStyle(item, index)"
        :class="returnFlowClass(item)"
      >
        <div style="position: relative">
          <div class="flow-min-icon"></div>
          <div v-if="index < flowList.length - 1" class="flow-line"></div>
        </div>
        <div class="folw-item" :id="'flow-item-' + index">
          <div class="flow-status">
          <div class="centerFlex">
            {{ item.flow_name }}<img
              src="../assets/images/template/flow-icon.png"
              class="special-icon"
              v-show="item.special_mark && item.special_mark.toString() == '-1'"
            />
            </div>
            <div
              class="red-label"
              v-show="item.wstermark && item.wstermark !== ''"
              >{{ item.wstermark }}</div
            >
          </div>
          <div class="centerFlex flow-info">
            <div style="margin-top: 6px;margin-bottom: 5px">
              <div v-for="item1 in item.markList" :key="item1.index">
                {{ item1 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  props: {
    /*格式
    {
        flow_name: "发布批准",
        flow_order: 6,
        down_flow: -1, // -1已完成，0未完成
        plan_time_flow_remark: "计划时间: 2032/2/9",
        ppan_time_flow_remark: "计划时间: 2032/2/9",
        wstermark: '',
        special_mark: -1
    },
     */
    containerData: {
      type: [Object, Array],
      default: () => {},
    },
    config: {
      type: [Object, Array],
      default: () => {},
    },
  },
  data() {
    return {
      currentMode: "flow",
      viewTypes: [{
          viewType: "grid",
          viewTypeLabel: "列表模式"
        },
        {
          viewType: "flow",
          viewTypeLabel: "进度图"
        },
      ],
      isloading: true,
      gridconfig: this.config,
      flowList: [],
      originData: [],
    };
  },
  components: {
    UcGridviewContainer: () =>
      import("@/common/layout/components/UcGridviewContainer"),
  },
  methods: {
    // 获取数据
    getData() {
        let UcDSContainerConfig = this.config.ControlProperty.DataSourceConfig
        let params = {
          controlGUID: UcDSContainerConfig.ControlProperty.DataSourceCtnrGuid,
          ctnrUID: UcDSContainerConfig.ControlProperty.DataSourceCtnrUID,
          menuConfigKey: this.menuConfigKey || this.$root.menuConfigKey,
          opCode: "VIEW",
          pValueSet: this.pValueSet || this.$root.pValueSet,
          project_id: this.config.keyValue,
        };
        let _this = this;
        erRequest.post(
          '/erow-project-manage'+UcDSContainerConfig.ControlProperty.DataSrc,
          params,
          (res) => {
            if (res.code == "SUCCESS") {
              _this.originData = res.data;
              _this.InitFlowDiagramData(_this.originData);
            } else {}
          },
          (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
          }
        );
    },
    InitFlowDiagramData(tempList) {
      if (tempList.length == 0) {
        return
      }
      let resultTemp = tempList.sort((a, b) => {
        return a.flow_order - b.flow_order;
      });
      let resultList = [];
      for (let index = 0; index < resultTemp.length; index++) {
        const element = resultTemp[index];
        if (index > 0) {
          let befEle = resultList[index - 1];
          if (
            befEle.down_flow.toString() == "-1" &&
            element.down_flow.toString() == "0"
          ) {
            element.down_flow = "1";
          } else if (
            befEle.down_flow.toString() == "0" ||
            befEle.down_flow.toString() == "1"
          ) {
            element.down_flow = "0";
          }
        }
        let statusMap = {
          1: "进行中",
          0: "未开始",
          "-1": "已完成",
        };
        let flow_status = statusMap[element.down_flow.toString()];
        this.$set(element, "flow_status", flow_status);

        let markList = [];
        Object.keys(element).forEach((key) => {
          if (key.indexOf("_remark") !== -1) {
            markList.push(element[key]);
          }
        });
        this.$set(element, "markList", markList);
        resultList.push(element);
      }
      this.flowList = resultList;
    },
    handleModeChange(val) {},
    returnFlowStyle(item, index) {
      return "display: flex;flex-basis: 50%;position: relative;margin-bottom: 5px";
    },
    returnFlowClass(item) {
      if (item.down_flow == 1) {
        return "flow-ing";
      } else if (item.down_flow == 0) {
        return "flow-wait";
      } else {
        return "flow-down";
      }
    },
  },
  mounted() {
    this.getData();
  },
}
