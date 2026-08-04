var PageTitleContainer = {
  name: "PageTitleContainer",
  mixins: [commonMinxin],
  components: {
    "view-comment": ViewComment,
    "uc-button-container": UcButtonContainer,
  },
  template: `
  <div class="head-nav-container" :class='activeClass()'>
  
    <div class="head-left">
      <template v-for="item in leftChildContainer">
        <view-comment
          :config="item"
          :dataValue="item.RsValue"
          :key="item.ControlGUID"
        ></view-comment>
      </template>
      <template v-if="leftChildContainer.length == 0">
        <img
          v-if="isshowleft"
          src="../assets/images/common/back-white.png"
          class="leftIcon back-image-unset"
          @click="close"
        />
      </template>
      <slot name="left"></slot>
    </div>
    <span v-if="showBackHome()&&config.ControlProperty.IsTop=='true'" class="return-home" onclick="returnHome()"><van-icon name="wap-home-o" ></van-icon>首页</span>
    <span class="head-title">{{ pageTitle }}</span>

    <div class="head-right">
      <template v-for="item in rightChildContainer">
        <uc-button-container
        v-if="item.ControlCode == 'UcButtonContainer'"
        :ref="item.ControlProperty.ID"
        :config="item"
        :key="item.ControlGUID"
         class="head-right-button-container"
        >
        </uc-button-container>
        <view-comment
          v-if="isRenderRightEl&&item.ControlCode != 'UcButtonContainer'"
          :config="item"
          :dataValue="item.RsValue"
          :key="item.ControlGUID"
          :containerdata="relativeDetailData"
          :position="getPosition(item)"
        ></view-comment>
      </template>
      <slot name="right"></slot>
    </div>

  </div>`,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
    isshowleft: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    relativeDetailData: {},
  }),
  computed: {
    relativeContainer() {
      return this.config.ControlProperty && this.config.ControlProperty.RelativeContainer ? this.config.ControlProperty.RelativeContainer : "";
    },
    isRenderRightEl() {
      if (this.relativeContainer) {
        return Object.keys(this.relativeContainer).length ? true : false;
      } else {
        return true;
      }
    },
    pageTitle() {
      return (
        (this.config.ControlProperty.TitleByDataField &&
          this.config._formPrimaryData &&
          this.config._formPrimaryData[this.config.ControlProperty.TitleByDataField]) ||
        this.config.TitleRSValue ||
        this.config.ControlProperty.TitleRSValue
      );
    },
    leftChildContainer() {
      return this.config.ChildContainers.filter((item) => {
        return item.ControlProperty.Position == "left";
      });
    },
    rightChildContainer() {
      return this.config.ChildContainers.filter((item) => {
        return item.ControlProperty.Position == "right" || item.ControlCode == "UcButtonContainer";
      });
    },
  },
  methods: {
    showBackHome() {
      return window.pageConfig.showBackHome;
    },
    getPosition(itemConfig) {
      return itemConfig.ControlProperty.IsTop !== "false" ? "topTitleRight" : "";
    },
    close() {
      if (currentPageVideoList && currentPageVideoList.length) {
        erJsBridge.appStopMultiVideo(function (data) {});
        currentPageVideoList = [];
      }
      this.$emit("offsearch");
      let lastPageIndex = pageManager.getPageParams().lastPageIndex;
      const { backAction } = this.config.ControlProperty;
      if (backAction) {
        if (erowConfig.hasProp(baseSpecial, backAction)) {
          baseSpecial[backAction](this);
        } else {
          erowSpecial[backAction](this);
        }
      } else if (!pageContext.root.removeLayer(this.config)) {
        if (lastPageIndex) {
          let currentIndex = pageManager.pages.length - 1;
          pageManager.go(lastPageIndex - currentIndex);
        } else {
          localStorage.removeItem(this.config.pValueSet);
          pageContext["root"].closeForm();
        }
      }
    },
  },
  created() {
    if (pageContext[this.relativeContainer]) {
      this.relativeDetailData = pageContext[this.relativeContainer].initData;
    }
    eventEmitter.on("afterGetFormData", (res) => {
      if (res.controlID == this.relativeContainer || res.ctnrUID == this.relativeContainer) {
        this.relativeDetailData = res.initData ? res.initData : {};
      }
    });
  },
};
