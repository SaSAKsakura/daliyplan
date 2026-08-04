var UcHtmlTemplateContainer = {
  template: `<div style="width: 100%;" class="UcHtmlTemplateContainer" :class="activeClass(config)">
         <div ref="child"></div>
  </div>`,
  name: "UcHtmlTemplateContainer",
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
    };
  },
  async created() {
    let _this = this;
    _this.setConfig(_this.config);
    eventEmitter.on(this.config.ControlProperty.DataSourceCtnrUID, (res) => {
      console.log("uchtmlContainer");
    });
    //移动端模板页放在此路径下
    await erowConfig.loadScrpit(`../components/common/baseHtmlTemplate/${this.currentContainer}/${this.currentContainer}.js`);
    let result = eval(this.currentContainer);
    result.props.params = this.params;
    result.props.config = this.config;
    result.propsData = result.props;
    let vueInstance = Vue.extend(result);
    new vueInstance({ el: this.$refs.child, ...result });
  },
  methods: {
    activeClass(config = this.config, data = this.initData, wrapper) {
      //加了wrapper 表明是子控件外部包裹元素样式类
      const classList = [];
      // CssClass指定类名
      if (config.ControlProperty && config.ControlProperty.CssClass) {
        classList.push(config.ControlProperty.CssClass);
      } else if (config.CssClass) {
        let temp = config.CssClass.toLowerCase();
        if (temp.indexOf("fun") != -1) {
          let funcName = config.CssClass;
          if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
            classList.push(baseSpecial[funcName](config, this));
          } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
            classList.push(erowSpecial[funcName](config, this));
          }
          //classList.push(erowSpecial[config.CssClass](config, data));
        }
        classList.push(config.CssClass);
      }
      // ClientClass指定类名
      if (config.ControlProperty && config.ControlProperty.ClientClass) {
        let temp = config.ControlProperty.ClientClass.toLowerCase();
        if (temp.indexOf("fun") != -1) {
          classList.push(erowSpecial[config.ControlProperty.ClientClass](config, data));
        }
        classList.push(config.ControlProperty.ClientClass);
      } else if (config.ClientClass) {
        let temp = config.ClientClass.toLowerCase();
        if (temp.indexOf("fun") != -1) {
          classList.push(erowSpecial[config.ClientClass](config, data));
        }
        classList.push(config.ClientClass);
      }

      // 动态获取类名
      if (config.ControlProperty && config.ControlProperty.CssClassField && data) {
        if (data[config.ControlProperty.CssClassField]) {
          classList.push(data[config.ControlProperty.CssClassField]);
        }
      }

      if (wrapper) {
        classList.forEach((oneclass, index) => {
          // classList[index] = wrapper + "_" + oneclass;
          classList[index] = oneclass
            .split(" ")
            .map((item) => wrapper + "_" + item)
            .join(" ");
        });
      }

      // 返回类名：动态获取类名 > ClientClass > CssClass
      return classList.join(" ");
    },
    setConfig(config) {
      let _this = this;
      if (erowConfig.hasProp(config.ControlProperty, "TemplateCode")) {
        let pathArr = config.ControlProperty.TemplateCode.split("/");
        if (pathArr.length > 0) {
          let pageName = pathArr[pathArr.length - 1].split(".")[0];
          _this.currentContainer = pageName;
          _this.currentConfig = config;
        }
      }
    },
  },
  watch: {
    config: {
      handler(val) {
        this.setConfig(val);
      },
    },
  },
  mounted() {
    let _this = this;
    _this.$emit("FormLoading", true);
  },
};
