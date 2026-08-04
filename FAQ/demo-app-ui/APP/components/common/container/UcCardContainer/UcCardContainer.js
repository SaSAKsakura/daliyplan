window.addEventListener("DOMContentLoaded", () => {
  UcCardContainer.components = {
    "view-comment": ViewComment,
    "edit-component": EditComponent,
    "file-upload": fileUpload,
    "uc-step-list": UcStepList,
    "uc-grid-container": UcGridContainer,
    "uc-file-container": UcFileContainer,
    "live-stream-video": LiveStreamVideo,
    "camera-operate": CameraOperate,
    "uc-button-container": UcButtonContainer,
  };
});

var UcCardContainer = {
  name: "UcCardContainer",
  mixins: [commonMinxin, formMinxin, dynamicMixin, longPressMixin],
  template: `
  <div
    :style="setCardBackImage()"
    class='card'
    :class="[activeClass(config, cardFormData), { 'card--delete-active': deleteOverlayVisible, 'card--deletable': deletable }]"
    v-longpress="longPressOptions"
    @click="onCardClick"
  >
    <div v-if="deleteOverlayVisible" class="card-delete-pop" @click.stop>
      <img
        class="card-delete-pop__icon"
        :src="deleteIconUrl"
        alt="删除"
        @click.stop="onDeleteIconClick"
      />
    </div>
    <slot class='card-slot'/>
    <table class="FormViewTable">
      <colgroup>
        <col :width="item" v-for="(item, i) in colsWidth" :key="i" />
      </colgroup>
      <tbody>
        <tr v-for="key in Object.keys(childContainers)" :key="key">
          <template v-for="configItem in childContainers[key]">
            <td
              v-if="visibleToDataField(configItem)"
              :key="configItem.ControlGUID"
              :style="hideCols(configItem,containerdata)"
              :colspan="getColSpan(configItem,containerdata)"
              :rowspan="getRowSpan(configItem)"
               class="td"
              :class="activeClassWidthWrap(configItem,containerdata,'td')"
            >
              <file-upload
                v-if="configItem.ControlCode == 'UcFileUpload'"
                :config="configItem"
                :containerdata="cardFormData"
                @update="updateData"
              >
              </file-upload>

              <uc-grid-container v-else-if="configItem.ControlCode=='UcGridviewContainer'&&cardFormData[configItem.ControlProperty.ID]" :dataFormCard="cardFormData[configItem.ControlProperty.ID]" :ref="configItem.ControlProperty.ID" :config="configItem" />
              <uc-button-container
                v-else-if="configItem.ControlCode == 'UcButtonContainer'"
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :initData="initData"
                :indexList="indexList"
                :key="configItem.ControlGUID"
                :containerdata="cardFormData"
                :cardedit="isEdit"
              >
              </uc-button-container>
              <uc-step-list
                v-else-if="configItem.ControlCode == 'UcStepList'"
                :config="configItem"
                :options="controldata[config.ControlProperty.ID]"
                :detailData="detailData"
                :value="detailData[config.ControlProperty.ID]"
              ></uc-step-list>

              <live-stream-video
                v-else-if="configItem.ControlCode == 'UcLiveStreamVideo'"
                :config="configItem"
                :options="controldata[config.ControlProperty.ID]"
                :detailData="detailData"
                :value="detailData[config.ControlProperty.ID]"
                :indexList="indexList"
              ></live-stream-video>

              <camera-operate
                v-else-if="configItem.ControlCode == 'UcCameraOperate'"
                :config="configItem"
                :options="controldata[config.ControlProperty.ID]"
                :detailData="detailData"
                :value="detailData[config.ControlProperty.ID]"
              >
              </camera-operate>

              <uc-file-container
                v-else-if="configItem.ControlCode == 'UcFileContainer'"
                :config="configItem"
                :data="initData"
                :rowGuid="initData['row_guid']"
                :isincard="true"
                :isedit="isEdit"
              />

              <view-comment
                v-else-if="!['UcData', 'UcHiddenField'].includes(configItem.ControlCode)&&!getEditable(configItem)"
                :config="configItem"
                :dataValue="cardFormData[configItem.ControlProperty.DataField]"
                :containerdata="cardFormData"
                :detailData='detailData'
                :keyValue='keyValue'
                :parentConfig='config'
                :isCloseAllDetail='isCloseAllDetail'
                @changeStatusCode="hanldeChangeStatusCode"
                 :fieldMap='fieldMap'
                :idMap="idMap"
              >
              </view-comment>

               <edit-component
                v-else-if="!['UcData', 'UcHiddenField'].includes(configItem.ControlCode)&&getEditable(configItem)"
                :config="configItem"
                :containerdata="cardFormData"
                :controldata="controldata"
                :class="activeClass(configItem)"
                :detailData='detailData'
                :keyfield="configItem.ControlProperty.ID"
                :fieldMap='fieldMap'
                :idMap="idMap"
                :isedit="isEdit"
                :isincard="true"
              >
              </edit-component>

              <template v-if="configItem.hasOwnProperty('children')">
                <template v-for="(child, index) in configItem.children">
                  <view-comment
                    :key="index"
                    :config="child"
                    :dataValue="cardFormData[child.ControlProperty.DataField]"
                    :containerdata="cardFormData"
                    :detailData='detailData'
                    :keyValue='keyValue'
                    :parentConfig='config'
                    :fieldMap='fieldMap'
                    :idMap="idMap"
                    @changeStatusCode="hanldeChangeStatusCode"
                  >
                  </view-comment>
                </template>
              </template>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>`,
  methods: {
    isChange(){
       let flag=false;
       Object.keys(this.idMap).forEach(key => {
        if(this.detailData[this.idMap[key]]!=this.initData[key]){
          flag=true;
          return;
        }
       })
       return flag;
    },
    getEditable(item) {
      let result = false;
      result = this.editCode.includes(item.ControlCode);
      return result;
    },
    getMapApi() {
      return new Promise((resolve, reject) => {
        window._BMapSecurityConfig = {
            // 代理服务器地址
            serviceHost: baseUrl + '/_BMapService/'   
            // serviceHost: 'http://10.103.174.44:8035/_BMapService/'    
        }
        let BMap_URL =baseUrl + "/_BMapService/api?v=3.0&callback=onBMapCallback";
        //let BMap_URL = MAP_CONFIG.baiduMapUrl + "&ak=" + MAP_CONFIG.ak + "&callback=onBMapCallback";
        if (typeof BMap !== "undefined") {
          resolve(BMap);
          return true;
        }

        // 百度地图异步加载回调处理
        window.onBMapCallback = () => {
          console.log("百度地图脚本初始化成功...");
          resolve(window.BMap);

          // resolve(BMap);
        };

        // 插入script脚本
        const scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.src = BMap_URL;
        document.body.appendChild(scriptElement);
      });
    },
    updateData() {
      eventEmitter.emit("afterUpload", {});
    },
    clearDeleteOverlayTimer() {
      if (this._deleteOverlayTimer) {
        clearTimeout(this._deleteOverlayTimer);
        this._deleteOverlayTimer = null;
      }
    },
    onCardClick(e) {
      if (this.deleteOverlayVisible) {
        e.stopPropagation();
        this.$emit("delete-overlay-close");
        return;
      }
      if (this.deletable && this.$el && this.$el.closest(".listPicker")) {
        return;
      }
      e.stopPropagation();
      this.opClick();
    },
    onDeleteIconClick() {
      this.$emit("delete", {
        containerdata: this.containerdata,
        indexList: this.indexList,
        rindex: this.$attrs.rindex,
        keyValue: this.keyValue,
      });
    },
    opClick() {
      if (this.isHasEvent(this.config, "click")) {
        this.handleClientActionsWidthParams("click", this.config, this.cardFormData);
        return;
      }
      if (this.cardFormData.RowRights) {
        if (this.cardFormData.RowRights.includes("READ")) {
          if (this.config.ControlProperty.DialogActionCtnrUID) {
            let [fnCode, fnParameter, ctnrUID, pageMode] = this.config.ControlProperty.DialogActionCtnrUID.split(".");
            if (this.config.ControlProperty.DialogActionCtnrUID[0] === ":" && this.containerdata) {
              [fnCode, fnParameter, ctnrUID, pageMode] = (this.containerdata[this.config.ControlProperty.DialogActionCtnrUID.slice(1)] || "").split(
                "."
              );
            }
            let controlGUID = this.config.ControlProperty.DialogActionCtnrGuid;
            if (this.containerdata && this.containerdata.dialogConfig && this.containerdata.dialogConfig[this.config.ControlProperty.ID]) {
              controlGUID = this.containerdata.dialogConfig[this.config.ControlProperty.ID].dialogControlGuid;
            }
            let pValueSet = erowConfig.generateUUID();
            let params = {
              menu_row_guid: this.config.menuRowGuid,
              menuConfigKey: this.config.menuConfigKey,
              controlGUID,
              CtnrUID: ctnrUID,
              pageMode: pageMode || "VIEW",
              fnParameter,
              fnCode,
              keyValue: this.keyValue,
              pValueSet: pValueSet,
              commonPValueSet: this.config.pValueSet,
            };
            if (this.config.ControlProperty.paramterDataField) {
              params.detailData = this.config.ControlProperty.paramterDataField.split("|").reduce((pre, cur) => {
                pre[cur] = this.cardFormData[cur];
                return pre;
              }, {});
            } else {
              params.detailData = this.cardFormData;
            }
            let currenPage = pageManager.pages[pageManager.pages.length - 1];

            const data = {
              menuRowGuid: params.menu_row_guid,
              controlGUID: params.controlGUID,
              pageMode: params.pageMode,
              pValueSet: pValueSet,
              commonPValueSet: this.config.pValueSet,
            };
            erRequest.post(
              `${erowplatformBackendUrl}/appBaseApi/sysLoadConfigData`,
              data,
              (res) => {
                if (res.code !== "SUCCESS") {
                  return this.$message("error", res.msg);
                }
                currenPage.params.active = this.config.UcTabGroupActive;
                // const cacheObj = {
                //   url:'./detaile.html',
                //   params,
                //   res
                // };
                // localStorage.setItem('detailPageCache',JSON.stringify(cacheObj))
                if (currentPageVideoList && currentPageVideoList.length) {
                  erJsBridge.appStopMultiVideo(function (data) {});
                  currentPageVideoList = [];
                }
                pageManager.push("./detail.html", params);
              },
              (error) => {
                return this.$message("error", error);
              }
            );
          }
        }
      }
    },
    setCardBackImage() {
      if (!this.config.ControlProperty.BackgroundImageNameField) return {};
      return {
        backgroundImage: "url(" + this.containerdata[this.config.ControlProperty.BackgroundImageNameField] + ")",
      };
    },
  },
  props: {
    keyName: {
      default: "",
    },
    indexList: {
      default: 0,
    },
    deletable: {
      type: Boolean,
      default: false,
    },
    deleteOverlayVisible: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    deleteOverlayVisible(val) {
      this.clearDeleteOverlayTimer();
      if (val) {
        const deleteOverlayAutoCloseMs = 5000;
        this._deleteOverlayTimer = setTimeout(() => {
          this._deleteOverlayTimer = null;
          this.$emit("delete-overlay-close");
        }, deleteOverlayAutoCloseMs);
      }
    },
  },
  computed: {
    deleteIconUrl() {
      // return this.getImgFileUrl({ parentFilePath: "common", filename: "delete", fileType: "png" });
      return "../assets/images/common/cardDelete.png";
    },
    longPressOptions() {
      return {
        enabled: this.deletable && !this.isEdit,
        delay: 500,
        handler: () => this.$emit("delete-overlay-open"),
        respectChildStop: true,
      };
    },
    isConfigSingleEdit() {
      //是否配置了单独编辑
      let flag = false;
      this.config.ChildContainers.forEach((item) => {
        if (item.ControlCode=="UcButtonContainer") {
           let temp=item.ChildContainers.find(citem=>citem.ControlProperty.OnClientClick=="beginEdit");
           if(temp){
            flag=true;
           }
        }
      });
      return flag;
    },
    isCanEdit() {
      let flag = false;
      this.config.ChildContainers.forEach((item) => {
        if (this.editCode.includes(item.ControlCode)) {
          flag = true;
        }
      });
      return flag;
    },
    cardFormData() {
      if (this.containerdata && Object.keys(this.containerdata).length != 0) {
        return this.containerdata;
      }
      return this.initData || {};
    },
    keyValue() {
      if (this.config.ControlProperty.DialogKeyDataField) return this.containerdata[this.config.ControlProperty.DialogKeyDataField];
      if (this.keyName) return this.containerdata[this.keyName];
      return this.config.keyValue;
    },
  },
  mounted() {
    if (this.config.ControlProperty.IsLoadMapLib) {
      this.getMapApi();
    }
  },
  beforeDestroy() {
    this.clearDeleteOverlayTimer();
  },
  data() {
    return {
      editCode: ["UcDropDownList", "UcComboTree", "UcCheckBox", "UcRadioButtonList", "UcCheckBoxList", "UcTextBox", "UcDatePicker"],
      isEdit: false,
    };
  },
};
