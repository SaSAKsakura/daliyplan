var test1 = {
  template: `<div style="background:white; width: 100%;padding: 20px;
    white-space: break-spaces;
    word-wrap: break-word;" >
  <div>模板测试2</div>
  {{containerData}}
  <van-button @click="changeData()">更改时间
    </van-button>
    </div>`,
  name: "test1",
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    params: {
      type: Object,
      default: () => {},
    },
    isEdit: {
      type: Boolean,
      default: () => true,
    },
  },
  data() {
    return {
      currentContainer: "",
      currentConfig: {},
      loadInstance: "",
    };
  },
  created() {
    this.getOpData();
    console.log(this.$parent);
  },
  methods: {
    changeData() {
      eventEmitter.emit("update" + this.config.ControlProperty.DataSourceCtnrUID, pageContext.root.$refs.UcContainer.dataSourceUrls[1]);
    },
    getOpData() {
      let _this = this;
      let url = erowplatformBackendUrl + "/appBaseApi/sysLoadOpList";
      erRequest.post(
        url,
        {
          menuRowGuid: _this.config.menuRowGuid,
          controlGUID: _this.config.ControlGUID,
          pageMode: _this.config.pageMode,
          pValueSet: _this.config.pValueSet || _this.$root.pValueSet,
        },
        (res) => {
          // console.log(res);
        },
        (error) => {
          console.log(error);
          _this.$toast.fail(error.msg);
        }
      );
    },
  },
  computed: {
    containerData() {
      console.log(pageContext.root.$refs.UcContainer.dataSourceObj);
      return pageContext.root.$refs.UcContainer.dataSourceObj[this.config.ControlProperty.DataSourceCtnrUID];
    },
  },
};
