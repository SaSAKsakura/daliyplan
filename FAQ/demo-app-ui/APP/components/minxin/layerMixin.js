let layerMixin = {
  data() {
    return {
      layerConfigArr: [],
      layerShowObj: {},
      layerParent: {},
    };
  },
  methods: {
    addLayer(config) {
      let index = this.layerConfigArr.findIndex((item) => {
        return item.ControlGUID === config.ControlGUID;
      });
      if (index == -1) {
        this.layerConfigArr.push(config);
      } else {
        this.layerConfigArr.splice(index, 1, config);
      }
      // 触发弹层采集
      if (typeof window.pageCollect !== "undefined" && window.pageCollect.isCollecting()) {
        const layerConfig = config;
        const parentInfo = window.pageCollect.getCurrentPageCollectInfo();
        window.pageCollect.collectDialogData(layerConfig, config.pageMode, parentInfo);
      }
      this.$set(this.layerShowObj, config.ControlGUID, true);
    },
    offSearch(configItem) {
      let remove = (containerConfig) => {
        if (containerConfig.ControlCode == "UcContainer") {
          let ChildContainers = containerConfig.ChildContainers || [];
          let pageListConfigs = ChildContainers.filter((item) => item.TargetContainer && item.TargetContainer.ControlCode == "UcPageListContainer");
          pageListConfigs.forEach((item) => {
            let CtnrUID = item.ControlProperty ? item.ControlProperty.CtnrUID : "";
            let pageListVm = pageContext[CtnrUID];
            if (pageListVm) {
              eventEmitter.off("search", pageListVm.handlerAfterSearch, { ctnrUID: pageListVm.config.CtnrUID });
              console.log("offSearch", pageListVm.config.CtnrUID);
            }
          });
        }
      };
      if (configItem.ControlCode == "UcHTMLTemplate" && configItem.parentConfig) {
        let parentConfig = configItem.parentConfig;
        remove(parentConfig);
      }
       if (configItem.ControlCode == "UcContainer" ) {
        remove(configItem);
      }
    },
    removeLayer(config) {
      // 控制页面内容滚动
      erowConfig.dialogCount--;
      if (erowConfig.dialogCount == 0) {
        document.documentElement.style.overflow = "auto";
      }
      let index = this.layerConfigArr.findIndex((item) => {
        return item.rootControlGuid && item.rootControlGuid == config.rootControlGuid;
      });
      if (index != -1) {
        let configItem = this.layerConfigArr[index];
        //关闭弹窗前自动解绑search
        this.offSearch(configItem);
        if (configItem.AfterLayerClose && typeof configItem.AfterLayerClose == "function") {
          configItem.AfterLayerClose();
        }
        this.layerConfigArr.splice(index, 1);
        return true;
      }
      return false;
    },
  },
};
