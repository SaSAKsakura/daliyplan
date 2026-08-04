var UcLayerContainer = {
  mixins: [commonMinxin],
  components: {
    "uc-scope-container": UcScopeContainer,
    "uc-container": UcContainer,
    "file-preview-container": FilePreviewContainer,
    "uc-html-template-container": UcHtmlTemplateContainer,
  },
  template: `
    <div class="van-overlay centerFlex" @click.self='closeLayer' :class="isFull ? 'full-page':''">
      <div :style="erowDialogStyle()" class="erow-dialog" :class="activeClass(config)">
        <template v-if="config.ControlCode=='UcScopeContainer'">
          <div v-if="isFull" class="head-nav-container">
            <div class="head-left">
            <span  class="leftIcon" @click="closeLayer()"></span>
            </div>
            <span class="head-title">{{ layerTitle }}</span>
          </div>

          <div v-else class="erow-dialog-title">
            {{ layerTitle }}
          </div>
        </template>
        <div v-else-if="!isFull && layerTitle" class="erow-dialog-title">
          {{ layerTitle }}
        </div>

        <div class="erow-dialog-main">
          <uc-scope-container ref="UcScopeContainer" :config="config" v-if="config.ControlCode=='UcScopeContainer'"></uc-scope-container>
          <uc-container ref="UcContainer" :config="config" v-if="config.ControlCode=='UcContainer'"></uc-container>
          <file-preview-container ref="FilePreviewContainer" :config="config" v-if="config.ControlCode=='FilePreviewContainer'"></file-preview-container>
          <uc-html-template-container ref="UcHTMLTemplate"  :config="config" v-if="config.ControlCode == 'UcHTMLTemplate'"></uc-html-template-container>
        </div>

        <div v-if="opArr.length > 0" class="erow-dialog-footer">
          <template v-for="opItem in opArr">
            <van-button class="two-btn" :activeClass='activeClass(opItem)' :plain="opItem.type=='CANCEL'" @click="handleOp(opItem)" type="info" :key="opItem.type" round size="small">
              {{ opItem.name }}
            </van-button>
          </template>
        </div>

        <img src='../assets/images/icon/close.png' v-if="!isFull&&isRenderCloseBtn" class='erow-dialog-close' @click.stop="closeLayer()" />

      </div>
    </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      show: true,
    };
  },
  computed: {
    isRenderCloseBtn() {
      return this.config.flag == "hide-close-btn" ? false : true;
    },
    isFull() {
      if (erowConfig.hasProp(this.config.ControlProperty, "CssClass") && this.config.ControlProperty.CssClass.indexOf("page") !== -1) {
        $(".erow-dialog-main").addClass(this.config.ControlProperty.CssClass);
        return true;
      } else {
        return false;
      }
    },
    opArr() {
      if (this.config.ControlCode == "UcScopeContainer") {
        return [
          { type: "CANCEL", name: "清空" },
          { type: "SEARCH", name: "查找" },
        ];
      } else {
        return [];
      }
    },
    layerTitle() {
      return this.config.TitleRSCode || this.config.ControlProperty.TitleRSCode;
    },
  },
  methods: {
    handleOp(opItem) {
      // console.log(opItem);
      let map = {
        SEARCH: this.handleSearch,
        CANCEL: this.resetForm,
      };
      if (map[opItem.type]) map[opItem.type]();
    },
    handleSearch() {
      // localStorage.setItem(this.config.pValueSet+'_'+this.$refs["UcScopeContainer"].config.ControlProperty.ID, JSON.stringify(this.$refs["UcScopeContainer"].detailData));
      if (this.$refs["UcScopeContainer"] && this.$refs["UcScopeContainer"].config.ControlProperty.isCache == "true") {
        const cacheData = {
          expirationTime: new Date().getTime() + UcScopeContainerCacheTime * 60 * 60 * 1000,
          data: this.$refs["UcScopeContainer"].detailData,
        };
        localStorage.setItem("searchKey" + this.config.ControlProperty.ID, JSON.stringify(cacheData));
      } else {
        sessionStorage.setItem("tempSearch" + this.config.ControlProperty.ID, JSON.stringify(this.$refs["UcScopeContainer"].detailData));
      }
      // localStorage.setItem(this.config.pValueSet, JSON.stringify(this.$refs["UcScopeContainer"].detailData));

      // 保存搜索条件
      erowConfig.searchParamsMap[this.config.ControlProperty.CtnrUID] = this.$refs["UcScopeContainer"].detailData;
      erowConfig.searchParamsRealFieldMap[this.config.ControlProperty.CtnrUID] = this.$refs["UcScopeContainer"].realFieldData;
      erowConfig.highParamsMap[this.config.ControlProperty.CtnrUID] = this.$refs["UcScopeContainer"].realFieldData;

      if (this.config.ControlProperty.BeforeSearch) {
        const funName = this.config.ControlProperty.BeforeSearch;
        if (erowConfig.hasProp(baseSpecial, funName) && baseSpecial[funName](this) === false) return;
        if (erowConfig.hasProp(erowSpecial, funName) && erowSpecial[funName](this) === false) return;
      }

      erRequest.post(
        `${erowplatformBackendUrl}/appBaseApi/sysSearch?t=${new Date().getTime()}`,
        {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID: this.config.ControlGUID,
          pageMode: "view",
          pValueSet: this.config.pValueSet,
          paramMap: this.$refs["UcScopeContainer"].detailData,
        },
        (res) => {
          if (res.code == "SUCCESS") {
            eventEmitter.emit("search", this.config.ControlGUID);
            // eventEmitter.emit("search", "");
            this.closeLayer();
          }
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        }
      );
    },
    closeLayer() {
      if (this.config.flag == "hide-close-btn") {
        return;
      }
      pageContext.root.removeLayer(this.config);
    },
    resetForm() {
      if (this.$refs["UcScopeContainer"] && this.$refs["UcScopeContainer"].config.ControlProperty.isCache == "true") {
        localStorage.removeItem(this.config.ControlProperty.ID);
      }
      this.$refs["UcScopeContainer"].resetData();
    },
    erowDialogStyle() {
      if (erowConfig.hasProp(this.config.ControlProperty, "CssClass")) {
        if (this.config.ControlProperty.CssClass.indexOf("page-") !== -1) {
          let index1Height = this.config.ControlProperty.CssClass.indexOf("page-");
          let index2Height = this.config.ControlProperty.CssClass.indexOf("per");
          let heightPer = this.config.ControlProperty.CssClass.slice(index1Height + 5, index2Height);
          return "width: 100%;height: " + heightPer + "%;position: absolute;bottom: 0;transition: all 1s ease-out;border-radius: 12px 12px 0 0;";
        } else if (this.config.ControlProperty.CssClass.indexOf("full-page") !== -1) {
          return "width: 100%;padding: 0;height: 100%;max-height: 100%;border-radius: 0;display: flex;flex-direction: column;";
        }
      }
      return "";
    },
  },
  mounted() {
    // 让页面不可滚动
    erowConfig.dialogCount++;
    document.documentElement.style.overflow = "hidden";
  },
};
