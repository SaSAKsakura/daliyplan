const UcDataListContainer = {
  components: {
    "uc-form-container": UcFormContainer,
    "page-title-container": PageTitleContainer,
    "uc-file-container": UcFileContainer,
    UcASCX: UcAscx,
    "uc-button-container": UcButtonContainer,
    "uc-js-grid-container": UcJsGridContainer,
    "uc-tree-node-container": UcTreeNodeContainer,
    // "uc-card-container": UcCardContainer
  },
  /* html */
  template: `<div class="UcDataListContainer" :class='activeClass()'>
     <van-empty v-show="total == 0" class="empty-image" :image="emptyListImage"
        description="暂无数据">
      </van-empty>
    <div class="udc-progress" v-if="ListMode!='pageTop'&&total>0" >
      <div class="udc-progress-info">
        <div style="font-size:15px;">{{current+1}}/{{total}}</div>
        <div class="progress-title">{{progressTitle}}</div>
      </div>
      <div class="udc-progress-bar" v-show="ListMode == 'paging'">
        <van-progress
          :show-pivot="false"
          :pivot-text="'showText'"
          color="#43baf7"
          :percentage="percent"
        />
      </div>
    </div>
     <div class="top-page" v-if="ListMode=='pageTop'&&total>0" >

       <img :src='getImgFileUrl({ parentFilePath: "common", filename: "to-left", fileType: "png" })'  @click="go2Prev" :class="current > 0 ? 'active icon' : 'icon'">
      <div class="udc-progress-info">
        <div class="progress-title">{{progressTitle}}</div>
      </div>
       <img :src='getImgFileUrl({ parentFilePath: "common", filename: "to-right", fileType: "png" })'  @click="go2Next" :class="current < total - 1 ? 'active icon' : 'icon'">
    </div>
    <div v-if="total>0" class="UcFormBox" @touchstart="handleTouchStart()" @touchend="handleTouchEnd()">
      <template
        v-for="config in currentControls"
      >
        <uc-form-container
          v-if="config.ControlCode == 'UcFormDetailView'"
          ref="form"
          :config="config"
          :key="config.ControlGUID"
          :containerdata="currentForm"
          :result="resultList[current % rows]"
          @change_detailData="change_detailData"
        ></uc-form-container>

         <uc-file-container
            v-if="
            config.ControlCode == 'UcFileContainer'"
            :ref="config.ControlProperty.ID"
            :config="config"
            :data='getCurrentFileContainerData(config.ControlProperty.ID)'
            :rowGuid = 'currentForm[keyName]'
            :keyValue='currentForm[keyName]'
            :key="config.ControlGUID">
          </uc-file-container>

          <uc-js-grid-container
           v-if="
            config.ControlCode == 'UcJsGridContainer'"
            :ref="config.ControlProperty.ID"
            :config="config"
            :containerdata='getCurrentFileContainerData(config.ControlProperty.ID)'
            :rindex='currentForm.rindex'
            :keyval='currentForm[keyName]'
            @syncdata="syncdata"
            :key="config.ControlGUID">
          >
          </uc-js-grid-container>

        <!-- <uc-card-container
          v-if="config.ControlCode == 'UcCardContainer'"
          :ref="config.ControlProperty.ID"
          :config="config"
          :key="config.ControlGUID"
          :containerdata="currentForm"
          @change_detailData="change_detailData"
        ></uc-card-container> -->
         <uc-tree-node-container
          v-if="config.ControlCode == 'UcTreeNodeContainer'"
          :ref="config.ControlProperty.ID"
          :config="config"
          :dataToTreeFromOutside='getCurrentFileContainerData(config.ControlProperty.ID)'
          :key="config.ControlGUID">
        </uc-tree-node-container>
        <UcASCX
          v-if="config.ControlCode == 'UcASCX'"
          :config="config"
          :params="currentForm"
          :ref="config.ControlProperty.ID"
          @change_detailData="change_detailData"
        ></UcASCX>
      </template>
      <div class="UcFormBoxIcon" v-show="ListMode == 'banner'">
        <span v-for="itemIndex in total" :key="itemIndex" :style="getBoxIconStyle(itemIndex)"></span>
      </div>
    </div>
    <div class="operatinButtons" v-show="ListMode == 'paging'">
      <div class="prevBtn" @click="go2Prev" :class="current > 0 ? 'active' : ''">{{PrevButtonText}}</div>
      <div @click="openNavigation" class="navBtn" v-html="navButtonText">
      </div>
      <div class="nextBtn" @click="go2Next" :class="current < total - 1 ? 'active' : ''">{{NextButtonText}}</div>
    </div>
    <van-popup v-model="showNavigation" position="bottom" :style="{ height: '100%' }" class="UcDataListPopup">
      <div class="UcDataListPopupBox">
        <div class="head-nav-container">
          <div class="head-left">
            <template>
              <img
                src="../assets/images/common/back-white.png"
                class="leftIcon back-image-unset"
                @click="closeNavigation"
              />
            </template>
            <slot name="left"></slot>
          </div>
          <span class="head-title">{{ navTitle }}</span>
          <div class="head-right"></div>
        </div>

        <div class="navButtonsBox">
          <div
            class="navButtons"
            v-for="index in total"
            :class="navButtonClass(index)"
            @click="navClick(index)"
          >
            {{index}}
          </div>
          <div
            class="navButtons"
            style="visibility: hidden;"
            v-for="index in leftButtons"
          >
          </div>
        </div>
        <uc-button-container
          v-if="buttoncontainer"
          ref="buttoncontainer"
          :config="buttoncontainer"
          class="navBottom"
        >
        </uc-button-container>
      </div>
    </van-popup>
  </div>`,
  props: {
    config: Object,
  },
  mixins: [commonMinxin],
  data() {
    return {
      showNavigation: false,
      navTitle: "导航",
      current: 0,
      total: 100,
      page: 1,
      rows: 100,
      keyName: "",
      formList: [], //数据集合
      formControls: [], //控件集合、每条数据对应的配置信息
      resultList: [],
      id: "UcDataListContainer" + this.config.ControlGUID + this.config.keyValue,
      loading: false,
      currentFormDetaildata: {},
      leftButtons: 5, // 多加几个不可见的按钮，保持最后一行左对齐

      // 左右滑动
      moveObj: {
        startX: 0,
        endX: 0,
      },
      cacheKey: "",
      emptyListImage: "../assets/images/common/page_empty.png",
    };
  },
  provide() {
    return {
      current: () => this.current, // 提供函数，后代组件可以获取实时数据
      setResult: this.setResult,
      currentResult: () => this.resultList[this.current],
      dispatchDataFromDataList: new Proxy(() => this.currentForm, {
        apply(target, thisArg, argArray) {
          const ID = argArray[0];
          const { dataList } = target()[ID];
          thisArg.handleAfterGetData(dataList);
        },
      }),
    };
  },
  methods: {
    syncdata(params) {
      let temp = this.formList[params.rindex];
      if (Array.isArray(params.value)) {
        temp[params.ID].dataList = params.value;
        temp[params.ID].listSize = params.value.length;
      }

      this.formList.splice(params.rindex, 1, temp);
    },
    handleTouchStart() {
      this.moveObj.startX = event.touches[0].clientX;
    },
    //滑动结束
    handleTouchEnd() {
      if (this.ListMode == "banner") {
        // 记录结束位置
        this.moveObj.endX = event.changedTouches[0].clientX;
        this.canDeleteId = "";
        // 左滑
        if (this.moveObj.endX < this.moveObj.startX && Math.abs(this.moveObj.startX) - Math.abs(this.moveObj.endX) > 50) {
          if (event.cancelable) event.preventDefault();
          // event.preventDefault();
          this.go2Next();
        }
        // 右滑
        else if (this.moveObj.endX > this.moveObj.startX && Math.abs(this.moveObj.endX) - Math.abs(this.moveObj.startX) > 10) {
          if (event.cancelable) event.preventDefault();
          // event.preventDefault();
          this.go2Prev();
        }
      }
    },
    getBoxIconStyle(index) {
      let widthNUm = (100 / this.total).toFixed(2) > 10 ? "15px" : (70 / this.total).toFixed(2) + "%";
      let width = "width: " + widthNUm + ";";
      let backgroundColor = "background-color:";
      if (this.current == index - 1) {
        backgroundColor += "var(--theme-color)";
      } else {
        backgroundColor += "#d7d7d7";
      }
      return width + backgroundColor;
    },
    setResult(val) {
      this.resultList[this.current] = val;
      this.setCache();
    },
    openNavigation() {
      let popupList = pageContext.root.popupList;
      this.popKey = "showNavigation";
      popupList.push(this);
      this.showNavigation = true;
    },
    closeNavigation() {
      let popupList = pageContext.root.popupList;
      popupList.splice(-1, 1);
      this.showNavigation = false;
    },
    navClick(index) {
      let type = true;
      if (this.config.ControlProperty.BeforeItemClick) {
        type = apis.runSpeicalFun({
          vm: this,
          funName: this.config.ControlProperty.BeforeItemClick,
          params: {
            currentIndex: index,
          },
        });
      }
      if (type) this.go2Index(index);
    },
    go2Index(index) {
      if (this.min > index - 1 || this.max < index - 1) {
        this.page = Math.ceil(index / this.rows);
        this.formList = [];
        this.getData();
      }
      // this.resultList[this.current] = this.currentFormDetaildata;
      this.current = index - 1;
      //   this.setCache();
      this.showNavigation = false;
    },
    go2Prev() {
      //保存数据
      Object.keys(this.$refs.form[0].realFieldData).forEach((key) => {
        this.currentForm[key] = this.$refs.form[0].realFieldData[key];
      });
      this.setCache(() => {
        let type = true;
        if (this.config.ControlProperty.BeforePrevClick) {
          type = apis.runSpeicalFun({
            vm: this,
            funName: this.config.ControlProperty.BeforePrevClick,
            params: {
              currentIndex: this.current,
            },
          });
        }
        if (type) this.change2Prev();
      });
    },
    change2Prev() {
      if (this.current == 0) {
        this.$toast.fail("已经是第一个!");
        return;
      }
      if (this.min >= this.current) {
        this.page--;
        this.formList = [];
        this.getData();
      }
      // this.resultList[this.current] = this.currentFormDetaildata;
      this.current--;
      // this.setCache();
    },
    go2Next() {
      Object.keys(this.$refs.form[0].realFieldData).forEach((key) => {
        this.currentForm[key] = this.$refs.form[0].realFieldData[key];
      });
      this.setCache(() => {
        let type = true;
        if (this.config.ControlProperty.BeforeNextClick) {
          type = apis.runSpeicalFun({
            vm: this,
            funName: this.config.ControlProperty.BeforeNextClick,
            params: {
              currentIndex: this.current,
            },
          });
        }
        if (type) this.change2Next();
      });
    },
    change2Next() {
      if (this.current >= this.total - 1) {
        this.$toast.fail("已经是最后一个!");
        return;
      }
      this.current++;
      // this.setCache();
    },
    getCurrentFileContainerData(id) {
      if (this.currentForm[id]) {
        let obj = {
          data: {},
        };
        obj.data[id] = erowConfig.deepClone(this.currentForm[id]);
        return obj;
      }
      return null;
    },
    getConfig() {},
    getData(success_callback, isHideLoading) {
      this.loading = true;
      if (!isHideLoading) {
        this.$toast.loading("加载中");
      }

      apis.sysLoadDBData({
        vm: this,
        params: {
          controlCode: this.config.ControlCode,
          pValueSet: this.config.pValueSet,
          controlGUID: this.config.ControlGUID,
          menuRowGuid: this.config.menuRowGuid,
          keyValue: this.config.keyValue || "",
          pageMode: this.config.pageMode,
          page: this.page,
          rows: this.rows,
          paramMap: {},
        },
        success: (res) => {
          let data = res.data[this.config.ControlProperty.ID];
          this.formList = data.dataList;
          this.formList.forEach((item, index) => {
            this.$set(item, "rindex", index);
          });
          this.total = data.listSize;
          this.config._isLoadedData = true;
          this.keyName = data.keyName;
          erowConfig.convertConfig(this.config.ChildContainers, {
            _isLoadedData: true,
          });

          success_callback && success_callback();
          this.loading = false;
          if (!isHideLoading) {
            this.$toast.clear();
          }
          if (this.ListMode == "banner") {
            let interVal = Number(this.config.ControlProperty.interVal);
            if (interVal > 0) {
              setInterval(() => {
                if (this.current >= this.total - 1) {
                  this.current = 0;
                } else {
                  this.current++;
                }
              }, interVal);
            }
          }
        },
        fail: this.errorFunc,
        error: this.errorFunc,
      });
    },
    errorFunc(error) {
      console.log(error);
      this.$toast.fail("error", error.msg);
      this.loading = false;
      this.$toast.clear();
    },
    setCache(callback) {
      if (this.config.ControlProperty.IsCacheContainerData == "true") {
        const cacheData = {
          expirationTime: new Date().getTime() + 24 * 60 * 60 * 1000,
          data: {
            currentIndex: this.current,
            resultList: this.resultList,
            formList: this.formList,
            keyName: this.keyName,
          },
        };
        erJsBridge.setParameter(this.cacheKey, encodeURIComponent(JSON.stringify(cacheData)), () => {
          if (callback) {
            callback();
            return;
          }
        });
      } else {
        if (callback) {
          callback();
          return;
        }
      }
    },
    initCache() {
      const cacheData = {
        expirationTime: new Date().getTime() + 24 * 60 * 60 * 1000,
        data: {
          currentIndex: 0,
          resultList: this.resultList,
          formList: this.formList,
          keyName: this.keyName,
        },
      };
      if (this.cacheKey) {
        erJsBridge.setParameter(this.cacheKey, encodeURIComponent(JSON.stringify(cacheData)), () => {});
      }
    },
    clearCache(callback) {
      erJsBridge.setParameter(this.cacheKey, "", () => {
        if (callback) callback();
      });
    },
    change_detailData(val) {
      this.currentFormDetaildata = val;
      this.$nextTick(() => {
        Object.keys(this.$refs.form[0].realFieldData).forEach((key) => {
          this.currentForm[key] = this.$refs.form[0].realFieldData[key];
        });
      });
    },
    navButtonClass(index) {
      let result = this.resultList[index - 1];
      if (result !== "") {
        return "active";
      }
      return "";
    },
    reset() {
      this.current = 0;
      this.page = 1;
      this.rows = 15;
      this.formList = [];
      this.resultList = new Array(this.resultList.length).fill("");
      this.clearCache(() => {
        this.getData(() => {
          this.showNavigation = false;
          this.$toast.success("重置成功！");
        });
      });
    },
  },
  computed: {
    isRenderProgress() {
      return true;
    },
    currentConfig() {
      return {};
    },
    currentControls() {
      return this.formControls[this.current % this.rows] || [];
    },
    buttoncontainer() {
      let UcButtonContainer = this.config.ChildContainers.filter((item) => item.ControlCode == "UcButtonContainer");
      return UcButtonContainer.length > 0 ? UcButtonContainer[0] : null;
    },
    percent() {
      if (this.total > 0) {
        return ((this.current + 1) / this.total) * 100;
      } else {
        return 0;
      }
    },
    min() {
      return (this.page - 1) * this.rows;
    },
    max() {
      return this.page * this.rows - 1;
    },
    currentForm() {
      return this.formList[this.current % this.rows] || {};
    },
    progressTitle() {
      if (this.config.ControlProperty && this.config.ControlProperty.TitleByDataField) {
        return this.currentForm[this.config.ControlProperty.TitleByDataField];
      }
      return "";
    },
    navButtonText() {
      if (this.config.ControlProperty.NavigationButtonText) {
        return this.config.ControlProperty.NavigationButtonText;
      }
      return "导航";
    },
    NextButtonText() {
      if (this.config.ControlProperty.NextButtonText) {
        return this.config.ControlProperty.NextButtonText;
      }
      return "下一页";
    },
    PrevButtonText() {
      if (this.config.ControlProperty.PrevButtonText) {
        return this.config.ControlProperty.PrevButtonText;
      }
      return "上一页";
    },
    ListMode() {
      if (this.config.ControlProperty.ListMode) {
        return this.config.ControlProperty.ListMode;
      }
      return "paging";
    },
  },
  watch: {
    formList: {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          this.formControls = [];
          this.formList.forEach((item) => {
            this.formControls.push(this.config.ChildContainers);
          });
        }
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    if (this.config.ControlProperty.IsCacheContainerData == "true") {
      //如果缓存数据
      this.cacheKey = apis.generateKey({
        controlGUID: this.config.ControlGUID,
        keyValue: this.config.keyValue,
        userId: erUser.userId,
      });
      let cache;
      erJsBridge.getParameter(this.cacheKey, (res) => {
        if (res.resultFlag == -1) {
          cache = res.result.value;
          if (!cache) {
            this.getData(() => {
              this.resultList = new Array(this.total).fill("");
              this.initCache();
            });
          } else {
            cache = JSON.parse(decodeURIComponent(cache));
            if (cache.expirationTime < new Date()) {
              // 过期
              this.getData(() => {
                this.resultList = new Array(this.total).fill("");
                this.initCache();
              });
            } else {
              // this.current = cache.data.currentIndex;
              this.resultList = cache.data.resultList;
              this.page = Math.ceil((cache.data.currentIndex + 1) / this.rows);
              this.formList = cache.data.formList;
              this.formList.forEach((item, index) => {
                this.$set(item, "rindex", index);
              });
              this.total = this.formList.length;
              this.keyName = cache.data.keyName;
              // this.getData();
            }
          }
        }
      });
    } else {
      this.getData(() => {
        this.resultList = new Array(this.total).fill("");
        this.initCache();
      });
    }

    eventEmitter.on("refresh", () => {
      this.getData();
    });
  },
  mounted() {
    window.addEventListener("beforeunload", (event) => {
      Object.keys(this.$refs.form[0].realFieldData).forEach((key) => {
        this.currentForm[key] = this.$refs.form[0].realFieldData[key];
      });
      this.setCache();
    });
  },
  beforeDestroy() {
    //保存当前表单数据
    Object.keys(this.$refs.form[0].realFieldData).forEach((key) => {
      this.currentForm[key] = this.$refs.form[0].realFieldData[key];
    });
    this.setCache();
    window.removeEventListener("beforeunload", () => {});
  },
};
