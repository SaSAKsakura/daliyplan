var UcMsgContainer = {
  name: "UcMsgContainer",
  mixins: [commonMinxin],
  template: `
    <div class="tgContainer" :class='activeClass()'>
      <div class="tgMain" :style="getTop()">
        <div class="tgItem" v-for="(msgItem, index) in msgList" :key="msgItem.title" @click="handleSpecialFun($event, config, msgItem)">
          <template v-for="(configItem,index) in config.ChildContainers">
            <span v-if="configItem.ControlCode !== 'UcData'" :class="containerClass(configItem,index)" :key="configItem.ControlGUID">{{ msgItem[configItem.ControlProperty.DataField] }}</span>
          </template>
          <img style="width: 12px;margin:0 10px;" src="../assets/images/home/arrowRightGray.png" alt="">
        </div>
      </div>
    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    interval: {
      type: [Number, String],
      default: 3,
    },
    containerdata: {
      type: [Array, Object, String],
    },
  },
  data: () => ({
    currentIndex: 0,
    timer: 0,
    msgList: [],
  }),
  methods: {
    getData() {
      let params = {
        controlGUID: this.config.ControlProperty.DataSourceCtnrGuid,
        ctnrUID: this.config.ControlProperty.DataSourceCtnrUID,
        menuConfigKey: this.menuConfigKey || this.$root.menuConfigKey,
        opCode: "VIEW",
        pValueSet: this.pValueSet || this.$root.pValueSet,
        paramMap: {},
      };
      erRequest.post(
        erowplatformBackendUrl + "/appBaseApi/sysLoadPostData",
        params,
        (res) => {
          if (res.code == "SUCCESS") {
            this.msgList = res.data.dataList;
          }
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        }
      );
    },
    containerClass(configItem, index) {
      let temp = "";
      temp = this.activeClass(configItem, index);
      if (!temp) {
        temp = index == 0 ? "tgTitle" : "tgContent";
      }
      return temp;
    },
    getTop() {
      let y = -this.currentIndex * 35 + "px";
      return {
        transform: `translate(0,${y})`,
      };
    },
  },
  created() {
    this.getData();
    eventEmitter.on("refresh", () => {
      this.getData();
    });
  },
  mounted() {
    let _this = this;
    let tempInterval = this.interval * 1000;
    this.timer = setInterval(function () {
      if (_this.currentIndex < _this.msgList.length - 1) {
        _this.currentIndex++;
      } else {
        _this.currentIndex = 0;
      }
    }, tempInterval);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
