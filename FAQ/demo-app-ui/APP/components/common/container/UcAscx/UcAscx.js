window.selfDefines = {};
var UcAscx = {
  template: `<div style="height: 100%; width: 100%;" class="UcAscxContainer">
    <component
      ref="UcAscxContainer"
      :is="currentContainer"
      :config="currentConfig"
      :params="params"
      :isEdit="isEdit"
    ></component>
  </div>`,
  name: "UcASCX",
  components: window.selfDefines,
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
    let _this = this;
    if (_this.config.ControlProperty.hasOwnProperty("pageName")) {
      _this.currentContainer = _this.config.pageName;
      _this.currentConfig = _this.config;
    }
    if (_this.config.ControlProperty.hasOwnProperty("UCPath")) {
      let pathArr = _this.config.ControlProperty.UCPath.split("/");
      if (pathArr.length > 0) {
        let pageName = pathArr[pathArr.length - 1].split(".")[0];
        _this.currentContainer = pageName;
        _this.currentConfig = _this.config;
      }
    }
  },
  watch: {
    config: {
      handler(val) {
        if (val.ControlProperty.hasOwnProperty("pageName")) {
          //pageName直接传页面名字,无需传后缀名
          _this.currentContainer = _this.config.pageName;
          _this.currentConfig = _this.config;
        }
        if (val.ControlProperty.hasOwnProperty("UCPath")) {
          // 传页面路径
          let pathArr = val.ControlProperty.UCPath.split("/");
          if (pathArr.length > 0) {
            let pageName = pathArr[pathArr.length - 1].split(".")[0];
            _this.currentContainer = pageName;
            _this.currentConfig = val;
          }
        }
      },
      // deep: true,
    },
  },
  mounted() {
    let _this = this;
    _this.$emit("FormLoading", true);
  },
};
