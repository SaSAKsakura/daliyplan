var UcBottomBar = {
  name: "UcBottomBar",
  mixins: [commonMinxin],
  data() {
    return {
      activeIndex: 0,
    };
  },
  props: {
    config: {
      type: Object,
      default: () => {},
    },
  },
  template: `
    <div class="uc-bottom-bar" :class='activeClass()'>
        <div class="bottom-bar" :class='activeIndex==index?"active":""' v-for="(bar,index) in childContainer" @click="changeConfig(bar,index)">
            <template v-if="bar.ControlCode=='UcButton'">
                <span v-if='bar.ControlProperty.ImageUrl'> 
                    <img :src='getImageSrc(bar,index)' />
                </span>
                <span>
                {{bar.ControlProperty.RSCode}}
                </span>
            </template>
        </div>
    </div>
    `,
  computed: {
    childContainer() {
      if (this.config.ChildContainers) {
        return this.config.ChildContainers;
      }
      return [];
    },
  },
  created() {},
  mounted() {
    if (this.childContainer.length) {
      let cacheIndex = Number(localStorage.getItem(this.config.CtnrUID + "-activeIndex"));
      let cacheTabPageMode = localStorage.getItem(this.config.CtnrUID + "-bottomBar");

      //优先使用缓存的索引
      this.activeIndex = cacheIndex !== undefined? cacheIndex: Number(this.config.ControlProperty.DefaultTabIndex)
        ? Number(this.config.ControlProperty.DefaultTabIndex)
        : 0;
      this.$nextTick(() => {
        this.getConfig(this.activeIndex, cacheTabPageMode);
        // relativeContainer.config.ChildContainers.push(this.childContainer[defaultActiveIndex].ControlProperty.ReferToConfig)
      });
    }
  },
  methods: {
    getImageSrc(configItem, index) {
      let temp = configItem.ControlProperty.ImageUrl;
      if (index == this.activeIndex) {
        let nameEndIndex = temp.lastIndexOf(".");
        temp = temp.slice(0, nameEndIndex) + "_hover" + temp.slice(nameEndIndex);
        return temp;
      }
      return temp;
    },
    changeConfig(configItem, index) {
      this.activeIndex = index;
      localStorage.setItem(this.config.CtnrUID + "-activeIndex", index)
      // 配置了OnClientClick属性，自定义按钮逻辑
      if (erowConfig.hasProp(configItem.ControlProperty, "OnClientClick")) {
        let funcName = configItem.ControlProperty.OnClientClick;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName](configItem, this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName](configItem, this);
        } else {
          var fnObj = this.config.ControlProperty.FnCode;
          window[fnObj][funcName](configItem, this, configItem); //eval(fnObj)
        }
        return;
      } else {
        if (configItem.ReferConfig) {
          let relativeContainer = pageContext[this.config.ControlProperty.RelativeContainer];
          if(!relativeContainer) return
          relativeContainer.config = Object.assign(relativeContainer.config, configItem.ReferConfig)
          // relativeContainer.config.ChildContainers = [];
          // relativeContainer.config.ChildContainers.push(erowConfig.deepClone(configItem.ReferConfig));
        } else {
          this.getConfig(index);
        }
      }
    },
    getConfig(defaultActiveIndex, pageMode) {
      let mode = pageMode || this.config.pageMode || "VIEW";
      this.$root.config.pageMode = mode;
      apis.sysLoadConfigData({
        vm: this,
        params: {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID: this.childContainer[defaultActiveIndex].ControlProperty.ReferToControlGuid,
          pageMode: mode,
          pValueSet: this.config.pValueSet,
          // commonPValueSet: this.config.pValueSet,
        },
        success: (res) => {
          if (res.data.ChildContainers) {
            res.data.ChildContainers = erowConfig.convertConfig(res.data.ChildContainers, {
              pValueSet: this.config.pValueSet,
              menuRowGuid: this.config.menuRowGuid || this.currentMenu.menuRowGuid,
              menuConfigKey: this.config.menuConfigKey || this.currentMenu.menuConfigKey,
              rootControlGuid: this.config.rootControlGuid,
              pageMode: mode,
              keyValue: this.config.keyValue,
            });
          }
          if(this.childContainer[defaultActiveIndex].ControlProperty.dialogPValueSet){
            res.data.pValueSet = this.childContainer[defaultActiveIndex].ControlProperty.dialogPValueSet
          }
          this.childContainer[defaultActiveIndex].ReferConfig = res.data;
          let relativeContainer = pageContext[this.config.ControlProperty.RelativeContainer];
          if(!relativeContainer) return
          relativeContainer.config = Object.assign(relativeContainer.config, res.data)
          if(this.config.AfterGetContainerConfig || this.config.ControlProperty.AfterGetContainerConfig){
            let funName = this.config.AfterGetContainerConfig || this.config.ControlProperty.AfterGetContainerConfig
            if (baseSpecial && erowConfig.hasProp(baseSpecial, funName)) {
              baseSpecial[funName](res.data, this);
            } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funName)) {
              erowSpecial[funName](res.data, this);
            }
          }
          // relativeContainer.config.ChildContainers = [];
          // relativeContainer.config.ChildContainers.push(erowConfig.deepClone(res.data));
        },
        fail: (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        },
        error: (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        },
      });
    },
  },
};
