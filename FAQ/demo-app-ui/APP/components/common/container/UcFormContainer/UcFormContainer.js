window.addEventListener("DOMContentLoaded", () => {
  UcFormContainer.components = {
    "view-comment": ViewComment,
    "edit-component": EditComponent,
    "uc-ascx": UcAscx,
    "uc-banner-container": UcBannerContainer,
    "uc-dynamic-component": UcDynamicComponent,
    "uc-button-container": UcButtonContainer,
    "uc-file-container": UcFileContainer,
  };
});

var UcFormContainer = {
  props: {
    dataFromGrid: {},
    result: {},
    deletable: {
      type: Boolean,
      default: false,
    },
    deleteOverlayVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      childContainers: {},
    };
  },
  template: `<div
    class="UcFormContainer"
    style="overflow: auto;"
    :class="[getFormClass(), { 'card--delete-active': deleteOverlayVisible, 'card--deletable': gridRowDeletable }]"
    v-longpress="longPressOptions"
    @click="onFormContainerClick"
  >
  <div v-if="deleteOverlayVisible" class="card-delete-pop" @click.stop>
    <img
      class="card-delete-pop__icon"
      :src="deleteIconUrl"
      alt="删除"
      @click.stop="onDeleteIconClick"
    />
  </div>
  <table class="FormViewTable">
    <colgroup>
      <col :width="item" v-for="(item, i) in colsWidth" :key="i" />
    </colgroup>
    <tbody>
      <tr v-for="key in Object.keys(childContainers)" :key="key" :class="getTrClass(childContainers[key])" v-if="visibleTr(childContainers[key])">
        <template v-for="configItem in childContainers[key]">
          <td
            v-if="visibleToDataField(configItem)"
            :key="configItem.ControlGUID"
            :style="hideCols(configItem,initData)"
            :colspan="getColSpan(configItem)"
            :rowspan="getRowSpan(configItem)"
            class="td"
            :class="activeClass(configItem,initData,'td')"
          >
            <template class="viod" v-if="isRender() && getVisible(configItem)">
              <uc-banner-container
                v-if="configItem.ControlCode == 'UcBannerContainer'"
                :config="configItem"
                :containerdata="cardFormData"
                :controldata="controldata"
                :class="activeClass(configItem)"
                :detailData='detailData'
                :keyfield="configItem.ControlProperty.ID">
              </uc-banner-container>

              <uc-dynamic-component
                v-if="configItem.ControlCode == 'UcDynamicComponent'"
                :config="configItem"
                :containerdata="cardFormData"
                :isedit="true"
                :isingrid="false"
                :rindex="0"
                :dycontroldata="dycontroldata[configItem.ID]"
                :result="result"
                :fieldMap='fieldMap'
              >
              </uc-dynamic-component>
               <uc-file-container
                v-else-if="configItem.ControlCode == 'UcFileContainer'"
                :config="configItem"
                :data="detailData"
                :rowGuid="cardFormData['row_guid']"
                :isincard="false"
                :isedit="true"
              />

              <edit-component
                v-else-if="!['UcData', 'UcHiddenField', 'UcButton','UcDynamicComponent'].includes(configItem.ControlCode)"
                :config="configItem"
                :containerdata="cardFormData"
                :controldata="controldata"
                :dialogConfig='dialogConfig'
                :class="activeClass(configItem)"
                :detailData='detailData'
                :keyfield="configItem.ControlProperty.ID"
                :fieldMap='fieldMap'
                :idMap="idMap"
              />

              <edit-component
                v-else-if="configItem.ControlCode == 'UcButton'"
                :config="configItem"
                :containerdata="cardFormData"
                :controldata="controldata"
                :class="activeClass(configItem)"
                :detailData='detailData'
                :keyfield="configItem.ControlProperty.DataField"
                :isCloseAllDetail='isCloseAllDetail'
                @changeStatusCode="hanldeChangeStatusCode"
                :fieldMap='fieldMap'
                :dialogConfig='dialogConfig'
              />

            </template>
            <template v-if="configItem.hasOwnProperty('children')">
              <template v-for="(child, index) in configItem.children">
                <edit-component
                  :key="index"
                  :config="child"
                  :containerdata="cardFormData"
                  :controldata="controldata"
                  :dialogConfig='dialogConfig'
                  :class="activeClass(child)"
                  :detailData='detailData'
                  :keyfield="child.ControlProperty.ID"
                  :fieldMap='fieldMap'
                  :idMap="idMap"
                >
                </edit-component>
              </template>
            </template>
            <uc-ascx
              v-if="configItem.ControlCode == 'UcAscx'"
              :config="configItem"
              :params="containerData"
            ></uc-ascx>
             <uc-button-container
                v-if="configItem.ControlCode == 'UcButtonContainer'"
                :ref="configItem.ControlProperty.ID"
                :config="configItem"
                :initData="initData"
                :key="configItem.ControlGUID"
                :containerdata="cardFormData"
              >
              </uc-button-container>
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</div>
  `,
  mixins: [commonMinxin, dynamicMixin, formMinxin, longPressMixin],
  methods: {
    clearDeleteOverlayTimer() {
      if (this._deleteOverlayTimer) {
        clearTimeout(this._deleteOverlayTimer);
        this._deleteOverlayTimer = null;
      }
    },
    onFormContainerClick(e) {
      if (this.deleteOverlayVisible) {
        e.stopPropagation();
        this.$emit("delete-overlay-close");
      }
    },
    onDeleteIconClick() {
      this.$emit("delete", {
        containerdata: this.dataFromGrid || this.containerdata,
        indexList: this.$attrs.indexList,
        rindex: this.$attrs.rindex,
        keyValue: this.keyValue,
      });
    },
    getFormClass() {
      let temp = [this.activeClass()];
      if (this.config.pageMode != "VIEW") {
        temp.push("editer-form");
      }
      let hideFieldArr = ["UcData", "UcHiddenField", "UcJsGridHiddenField"];
      let hideControls = this.config.ChildContainers.filter((item) => {
        return hideFieldArr.includes(item.ControlCode);
      });
      if (hideControls.length == this.config.ChildContainers.length) {
        temp.push("display-none");
      }
      return temp.join(" ");
    },
    getTrClass(children) {
      let classList = [];
      // const firstChildren = children[0];
      const firstChildren = children.find((item) => !["UcData", "UcHiddenField"].includes(item.ControlCode));
      if (firstChildren) {
        let temp = this.activeClass(firstChildren, this.initData, "tr");
        classList = temp ? temp.split(" ") : [];
        if (
          (this.config.pageMode == "VIEW" && firstChildren.ControlProperty.IsHideUnderline) ||
          (this.config.pageMode == "EDIT" && firstChildren.ControlProperty.IsHideUnderlineWhenEDIT) ||
          (this.config.pageMode == "ADD" && firstChildren.ControlProperty.IsHideUnderlineWhenADD)
        ) {
          classList.push("hidden-tr-line");
        }
      }
      return classList.join(" ");
    },
    visibleTr(arr) {
      const hideFieldArr = ["UcData", "UcHiddenField", "UcJsGridHiddenField"];
      const res = arr.filter((item) => {
        if (hideFieldArr.includes(item.ControlCode)) {
          return false;
        }
        return this.visibleToDataField(item);
      });
      return res.length > 0;
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
  beforeDestroy() {
    this.clearDeleteOverlayTimer();
  },
  computed: {
    gridRowDeletable() {
      return this.deletable && !!this.dataFromGrid;
    },
    deleteIconUrl() {
      // return this.getImgFileUrl({ parentFilePath: "common", filename: "delete", fileType: "png" });
      return "../assets/images/common/cardDelete.png";
    },
    longPressOptions() {
      return {
        enabled: this.gridRowDeletable,
        delay: 500,
        handler: () => this.$emit("delete-overlay-open"),
        respectChildStop: true,
      };
    },
    keyValue() {
      if (this.config.ControlProperty.DialogKeyDataField && this.dataFromGrid) {
        return this.dataFromGrid[this.config.ControlProperty.DialogKeyDataField];
      }
      if (this.$attrs.keyName && this.dataFromGrid) {
        return this.dataFromGrid[this.$attrs.keyName];
      }
      return this.config.keyValue;
    },
    cardFormData() {
      return this.containerdata || this.realFieldData || this.initData;
    },
    dialogConfig() {
      return this.initData.dialogConfig || {};
    },
  },
};
