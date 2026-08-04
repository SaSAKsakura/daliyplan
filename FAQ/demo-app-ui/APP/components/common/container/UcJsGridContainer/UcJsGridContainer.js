var UcJsGridContainer = {
  name: "UcJsGridContainer",
  mixins: [commonMinxin, gridMinxin],
  components: {
    "uc-form-container": UcFormContainer,
    "form-date": FormDate,
    "form-select": FormSelect,
    "form-multiple-select": FormMultipleSelect,
    "form-cascader": FormCasCader,
    "checkbox-list": CheckboxList,
    "radio-button-list": RadioButtonList,
    "uc-photo": UcPhoto,
    "card-item-container": UcCardContainer,
    UcASCX: UcAscx,
    "uc-stepper": UcStepperField,
    "uc-dynamic-component": UcDynamicComponent,
    "uc-tag-filter": UcTagFilter,
  },
  /* html */
  template: `<div class="UcJsGridContainer" :class="getContainerClass(config)" >
    <van-skeleton :row="6" v-if="childContainers.length === 0" />
    <template v-if="!isGroup">
      <div v-if="isShowTitle" class="js-title-container">
        <div class="title">{{ gridTitle }}</div>
        <img
          src="../assets/images/common/open-icon.png"
          v-if="isRenderOpenIcon"
          class="open-or-close"
          :style="openIconStyle"
          @click="toggleOpen"
        />
      </div>
      <uc-tag-filter v-if='tagControl' @filterData="tagQuery" :config="tagControl" :initDataList="initDataList" type="grid"></uc-tag-filter>
      <div class="jsGrid-list" :style="activeStyleProxy" v-show="isOpenList" >
        <div>
          <table class="jsgrid-table">
            <thead
              class="jsgrid-thead"
              v-if="
                config.ControlProperty.IsHideTitle !== 'true' &&
                viewType == 'grid'
              "
            >
              <tr>
                <th class="number" v-if="showLineNumber">序号</th>
                <template v-for="item in childContainers">
                  <th
                    :key="item.ControlGUID"
                    v-if="isShowCol(item)"
                    :class="activeClass(item)"
                    :style="{
                      textAlign: getTextAlign(item),
                      minWidth: getMinWidth(item),
                    }"
                  >
                    {{ item.ControlProperty.RSValue || item.RSValue }}
                  </th>
                </template>
                <th
                  class="operate-col"
                  v-if="
                    config.ControlProperty.IsHideADD !== 'true' &&
                    isEdit &&
                    oplist.indexOf('ADD') != -1
                  "
                >
                  <div class="add-icon" @click="beforeAddRow">
                    <van-icon name="add-o" size="16" />
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <div :style="tableBodyStyle" @scroll.stop='handleScroll' ref='handleScroll'>
          <table class="jsgrid-table" ref="jsGridTable">
            <tbody class="jsgrid-tbody">
              <tr
                v-for="(data, index) in listData"
                :key="data[rowDataKey]? data[rowDataKey]: data['tempGuid']"
                :class="getRowClassName(config, data)"
              >
                <td class="number" v-if="showLineNumber && viewType == 'grid'">
                  {{ index + 1 }}
                </td>
                <template v-for="(item, index2) in data.controls">
                  <td
                    :key="item.ControlGUID"
                    v-if="isShowCol(item)"
                    :class="activeClass(item)"
                    :style="{
                      textAlign: getTextAlign(item),
                      minWidth: getMinWidth(item),
                    }"
                  >
                    <template v-if="item.ControlCode == 'UcJsGridDateField'">
                      <div class="UcJsGridDateField">
                        <form-date
                          :titleName="item.ControlProperty.RSValue"
                          :disabled="getDisabled(item)"
                          :reuquired="getRequired(item)"
                          typeNumber="1"
                          :value="listData[index][item.ControlProperty.DataField]"
                          :placeholder="getPlaceHolerByConfig(item)"
                          :config="item"
                          :listIndex="index"
                          @changeDate="
                            (val) =>
                              changeDate(
                                listData[index],
                                item.ControlProperty.DataField,
                                val
                              )
                          "
                        ></form-date>
                      </div>
                    </template>

                    <template v-if="item.ControlCode == 'UcJsGridField'">
                      <div class="UcJsGridField" v-if="!isLink(item)">
                        {{ data[item.ControlProperty.DataField] }}
                      </div>
                      <div
                        class="UcJsGridField link"
                        v-else-if="isLink(item)"
                        @click="handleSpecialFun($event, item, data)"
                      >
                        {{ data[item.ControlProperty.DataField] }}
                      </div>
                    </template>

                    <template v-if="item.ControlCode == 'UcHyperLinkField'">
                      <div
                        class="UcHyperLinkField"
                        @click="handleSpecialFun($event, item, data)"
                      >
                        {{
                          data[item.ControlProperty.DataField] ||
                          data[item.ControlProperty.RSValue]
                        }}
                      </div>
                    </template>

                    <template v-if="item.ControlCode == 'UcASCX'">
                      <UcASCX
                        :config="item"
                        :params="data"
                        :ref="item.ControlProperty.ID"
                      ></UcASCX>
                    </template>

                    <template v-if="item.ControlCode == 'UcJsGridTextBoxField'">
                      <div
                        class="UcJsGridTextBoxField"
                        v-if="!isEdit"
                        :title="data[item.ControlProperty.DataField]"
                      >
                        {{ data[item.ControlProperty.DataField] }}
                      </div>
                      <div v-else class="UcJsGridTextBoxField input-text-box">
                        <van-field
                          v-model="
                            listData[index][item.ControlProperty.DataField]
                          "
                          :disabled="getDisabled(item)"
                          :reuquired="getRequired(item)"
                          rows="1"
                          :placeholder="getPlaceHolerByConfig(item)||'请输入'"
                        >
                          <template slot="right-icon">
                            <van-icon
                              name="close"
                              v-show="
                                listData[index][
                                  item.ControlProperty.DataField
                                ]
                              "
                              @click="
                                listData[index][item.ControlProperty.DataField] =
                                  ''
                              "
                            />
                          </template>
                        </van-field>
                      </div>
                    </template>

                    <template v-if="item.ControlCode == 'UcSensitiveField'">
                      <div class="UcSensitiveField" v-if="!isEdit">
                        {{ data[item.ControlProperty.DataField] }}
                      </div>
                      <div class="UcSensitiveField" v-else>
                        <div class="input-text-box">
                          <van-field
                            v-model="
                              listData[index][item.ControlProperty.DataField]
                            "
                            :disabled="getDisabled(item)"
                            :reuquired="getRequired(item)"
                            :placeholder="getPlaceHolerByConfig(item)"
                          />
                        </div>
                        <img
                          :src="getEye(item, data)"
                          v-show="getSensitiveImgShow(item)"
                          alt=""
                          @click.stop="getSensitiveInfo(item, data)"
                        />
                      </div>
                    </template>

                    <template v-if="item.ControlCode == 'UcJsGridNumericField'">
                      <div class="UcJsGridNumericField" v-if="!isEdit">
                        {{ data[item.ControlProperty.DataField] }}
                      </div>
                      <div v-else class="UcJsGridNumericField input-text-box">
                        <van-field
                          v-model="
                            listData[index][item.ControlProperty.DataField]
                          "
                          :disabled="getDisabled(item)"
                          :reuquired="getRequired(item)"
                          rows="1"
                          type="number"
                          @input="
                            vanFieldClientActions($event, item, listData[index])
                          "
                          :placeholder="getPlaceHolerByConfig(item)"
                        >
                          <template slot="right-icon">
                            <van-icon
                              name="close"
                              v-show="
                                listData[index][
                                  item.ControlProperty.DataField
                                ] !== ''
                              "
                              @click="
                                listData[index][item.ControlProperty.DataField] =
                                  ''
                              "
                            />
                          </template>
                        </van-field>
                      </div>
                    </template>

                    <template v-if="item.ControlCode == 'UcJsGridComboTreeField'">
                      <div class="UcJsGridComboTreeField" v-if="!isEdit">
                        {{
                          data[item.ControlProperty.DataFieldWhenReadMode] ||
                          data[item.ControlProperty.TextColumnDataField]
                        }}
                      </div>
                      <div v-else class="UcJsGridComboTreeField">
                        <form-cascader
                          :config="item"
                          :disabled="getDisabled(item)"
                          :required="getRequired(item)"
                          :label="getPlaceHolerByConfig(item)"
                          :placeholder="getPlaceHolerByConfig(item)"
                          :value="listData[index][item.ControlProperty.field]"
                          @changeCascader="
                            (val) => changeCascader(index, item, val)
                          "
                        ></form-cascader>
                      </div>
                    </template>

                    <template
                      v-if="item.ControlCode == 'UcJsGridDropDownListField'"
                    >
                      <div v-if="!isEdit">
                        {{
                          data[item.ControlProperty.DataFieldWhenReadMode] ||
                          data[item.ControlProperty.DataTextField]
                        }}
                      </div>
                      <div v-else class="input-text-box">
                        <form-multiple-select
                          v-if="isMultiSelect(item)"
                          :disabled="getDisabled(item)"
                          :reuquired="getRequired(item)"
                          :config="item"
                          :value="data[item.ControlProperty.field]"
                          :label="getPlaceHolerByConfig(item)"
                          :placeholder="getPlaceHolerByConfig(item)"
                          :columns="item.ControlProperty.dataArr"
                          @confirm="(val) => changeSelect(index, item, val)"
                          :isShowSearch="false"
                          :isShowAll="true"
                          popup_max_height="260px"
                        ></form-multiple-select>

                        <form-select
                          v-else
                          typeNumber="1"
                          :disabled="getDisabled(item)"
                          :reuquired="getRequired(item)"
                          :config="item"
                          :options="item.ControlProperty.dataArr"
                          :value="data[item.ControlProperty.field]"
                          :placeholder="getPlaceHolerByConfig(item)"
                          @changeSelect="(val) => changeSelect(index, item, val)"
                        ></form-select>
                      </div>
                    </template>

                    <template v-if="item.ControlCode == 'UcRadioButtonList'">
                      <radio-button-list
                        :disabled="getDisabled(item)"
                        :config="item"
                        :options="item.ControlProperty.radioButtonList"
                        v-model="data[item.ControlProperty.field]"
                        v-on="handleClientActions()"
                      ></radio-button-list>
                    </template>

                    <template v-if="item.ControlCode == 'UcCheckBoxListField'">
                      <checkbox-list
                        :disabled="getDisabled(item)"
                        :config="item"
                        :options="item.ControlProperty.radioButtonList"
                        :detailData="data"
                        v-model="data[item.ControlProperty.field]"
                        v-on="handleClientActions()"
                      ></checkbox-list>
                    </template>

                    <template v-if="item.ControlCode == 'UcJsGridCheckBoxField'">
                      <van-checkbox
                        v-model="data[item.ControlProperty.field]"
                        shape="square"
                      ></van-checkbox>
                    </template>
                    <div
                      v-if="isFormMode"
                      class="jsgrid-form-item"
                    >

                      <uc-form-container
                      v-if="item.ControlCode == 'UcFormDetailView'"
                      :dataFromGrid="listData[index]"
                      :config="item"
                      :ref="item.ControlProperty.ID"
                      @change_detailData="changeDetailData"
                      :rindex="index"
                      :formcontroldata="data.controlData"
                      :deletable="isRenderDelete"
                      :delete-overlay-visible="activeDeleteOverlayKey === getCardOverlayKey(listData[index], index)"
                      @delete-overlay-open="onCardDeleteOverlayOpen(getCardOverlayKey(listData[index], index))"
                      @delete-overlay-close="onCardDeleteOverlayClose"
                      @delete="onGridCardDelete"
                     />
                      <card-item-container
                      v-if="item.ControlCode == 'UcCardContainer'"
                      :ref="item.ControlProperty.ID"
                      :containerdata="listData[index]"
                      :keyName="rowDataKey"
                      :config="item"
                      :datafromlist="true"
                      :rindex="index"
                      :deletable="isRenderDelete"
                      :delete-overlay-visible="activeDeleteOverlayKey === getCardOverlayKey(listData[index], index)"
                      @delete-overlay-open="onCardDeleteOverlayOpen(getCardOverlayKey(listData[index], index))"
                      @delete-overlay-close="onCardDeleteOverlayClose"
                      @delete="onGridCardDelete"
                     >
                     </card-item-container>
                    </div>
                    <uc-photo
                      v-if="item.ControlCode === 'UcPhoto'"
                      :config="item"
                      :option="data"
                      :idx="index"
                      :parentFnCode="config.ControlProperty.FnCode"
                      @setRowGuid="setRowGuidByUcPhoto"
                    ></uc-photo>

                    <uc-stepper
                      v-if="item.ControlCode == 'UcStepperField'"
                      :value="data[item.ControlProperty.DataField]"
                      :config="item"
                      :disabled="getDisabled(item)"
                      :detailData="data"
                      :RangeField="getRangeField(item,data)"
                      @changeDate="changeStepper($event,data,index,item)"
                      ></uc-stepper>
                  </td>
                </template>
                 <td
                  class="operate-col"
                  v-if="
                    !isFormMode &&
                    config.ControlProperty.IsHideDELETE !== 'true' &&
                    isEdit &&
                    oplist.indexOf('DELETE') != -1
                  "
                >
                  <img src="../assets/images/common/cardDelete.png" @click="deleteRow(index)" style="width:16px" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-show='isLoading && hasMore' class='list-loading'>
          <img :src='getImgFileUrl({ parentFilePath: "common", filename: "loading", fileType: "png" })' />
          {{hasMore ? '加载中...' : ''}}
        </div>
        <div v-if="listData.length == 0 && !IsHiddenEmptyInfo" class="list-empty">
          <img :src="emptyImage" />
          <p>暂无数据</p>
        </div>
      </div>
      <div class="jsGrid-container-footer" v-if="viewType == 'grid'">
        <div class="jsGrid-total" v-if="!(config.ControlProperty.isShowTotal == 'false' || (IsHiddenEmptyInfo && listData.length == 0))">
          共
          <span>{{ listData.length }}</span>
          条
        </div>
        <div class="flex_r_vc">
        <div
          class="jsGrid-footer-deleteAll ml10"
          @click="checkConfirm(config, deleteAll)"
          type="info"
          round
          size="small"
          v-if="
            isEdit &&
            listData.length &&
            (config.ControlProperty.IsHideDELETE !== 'true' &&
              (config.ControlProperty.IsHideDeleteAllField
                ? config._formPrimaryData[
                    config.ControlProperty.IsHideDeleteAllField
                  ] !== 'true'
                : true))
          "
        >
          删除全部
        </div>
        </div>
        
      </div>
    </template>
    <template v-if="isGroup">
     <div v-if="listData.length == 0" class="list-empty">
          <img :src="emptyImage" />
          <p>暂无数据</p>
        </div>
      <div
        v-for="(category, cindex) in categorys"
        class="pageList-category"
        :class="
          category.isExpend
            ? 'categoryExpend'
            : config.ControlProperty.GroupField
            ? 'categoryHide'
            : ''
        "
        :key="category.id"
      >
        <div
          v-if="category.name"
          class="pageList-category-info js-category-title"
          @click.stop="$set(category, 'isExpend', !category.isExpend)"
        >
          {{ category.name }}

          <img
             class=" pageList-category-arrow open-or-close"
            src="../assets/images/common/open-icon.png"
          />
        </div>
        <div
          class="pageList-category-list"
          :class="activeClass()"
        >
         <uc-form-container
              v-if=" Object.keys(headerFormChildContainers).length > 0"
              :config="headerFormChildContainers"
              :ref="headerFormChildContainers.ControlProperty.ID"
            />
          <div
            v-for="(dataItem, index) in categoryData[category.id]"
            class="pageList-category-list-item"
            :class="getRowClassName(config, dataItem)"
            :key="index+category.id+''"
            :data-set="index+category.id+''"
          >
          
            <uc-form-container
              v-if="firstChildContainer(dataItem).ControlCode == 'UcFormDetailView'"
              :dataFromGrid="dataItem"
              :config="firstChildContainer(dataItem)"
              :ref="firstChildContainer(dataItem).ControlProperty.ID"
              @change_detailData="changeDetailData"
              :isgroup="true"
              :categoryid="category.id"
              :rindex="index"
              :formcontroldata="dataItem.controlData"
              :deletable="isRenderDelete"
              :delete-overlay-visible="activeDeleteOverlayKey === getCardOverlayKey(dataItem, index)"
              @delete-overlay-open="onCardDeleteOverlayOpen(getCardOverlayKey(dataItem, index))"
              @delete-overlay-close="onCardDeleteOverlayClose"
              @delete="onGridCardDelete"
            />
            <card-item-container
              v-if="firstChildContainer(dataItem).ControlCode == 'UcCardContainer'"
              :ref="firstChildContainer(dataItem).ControlProperty.ID"
              :containerdata="dataItem"
              :keyName="rowDataKey"
              :config="firstChildContainer(dataItem)"
              :datafromlist="true"
              :rindex="index"
              :deletable="isRenderDelete"
              :delete-overlay-visible="activeDeleteOverlayKey === getCardOverlayKey(dataItem, index)"
              @delete-overlay-open="onCardDeleteOverlayOpen(getCardOverlayKey(dataItem, index))"
              @delete-overlay-close="onCardDeleteOverlayClose"
              @delete="onGridCardDelete"
            >
            </card-item-container>
          </div>
        </div>
      </div>
    </template>
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
    rindex: {
      type: Number,
      default: () => 0,
    },
    keyval: {},
  },
  data() {
    return {
      listData: [],
      oplist: [],
      isEdit: false,
      containerConfig: {},
      rules: {},
      rulesById: {},
      deletedList: [], //删除的数据项
      rowDataKey: "", //行主键
      isOpenList: true,
      formControlData: {}, //jsgrid 内是UcForm 时,将form 的controlData 取出
      formAddControlData: {}, //新增行时 UcForm ADD 模式的默认值
      categorys: {},
      categoryData: {},
      page: 1,
      listSize: 100,
      isLoading: false,
      tagControl: null,
      activeDeleteOverlayKey: null,
    };
  },
  computed: {
    isRenderDelete(){
      return this.config.ControlProperty.IsHideDELETE !== 'true' &&
                    this.isEdit &&
                    this.oplist.indexOf('DELETE') != -1
    },
    isFormMode() {
      let temp = this.config.ChildContainers.find((item) => {
        return item.ControlCode == "UcCardContainer" || item.ControlCode == "UcFormDetailView";
      });
      return temp ? true : false;
    },
    realListData() {
      let temp = [];
      for (let index = 0; index < this.listData.length; index++) {
        const item = this.listData[index];
        let data = {};
        for (let child of this.config.ChildContainers) {
          let id = child.ControlProperty.DataField;
          let datafield = child.ControlProperty.DataField;
          if (datafield) {
            data[id] = item[datafield] || "";
          }
          if (child.ControlCode == "UcFormDetailView"&&this.$refs[child.ControlProperty.ID]) {
            data = {
              ...data,
              ...this.$refs[child.ControlProperty.ID][index].detailData,
            };
          } else if (child.ControlCode == "UcCardContainer"&&this.$refs[child.ControlProperty.ID]) {
            data = {
              ...data,
              ...this.$refs[child.ControlProperty.ID][index].detailData,
            };
          }
        }
        temp.push(data);
      }
      return temp;
    },
    firstChildContainer() {
      return function (dataItem) {
        let result = dataItem.controls.find((item) => {
          return (item.ControlCode == "UcFormDetailView" || item.ControlCode == "UcCardContainer") && item.ControlProperty.IsJsGridHeaderForm !== "true";
        });
        return result || {};
      };
    },
    headerFormChildContainers() {
      return this.config.ChildContainers.find((item) => {
        return (item.ControlCode == "UcFormDetailView" || item.ControlCode == "UcCardContainer") && item.ControlProperty.IsJsGridHeaderForm == "true";
      }) || {};
    },
    isGroup() {
      if (this.config.ControlProperty && this.config.ControlProperty.GroupByFields) {
        return true;
      } else {
        return false;
      }
    },
    viewType() {
      let result = "grid";
      let property = this.config.ControlProperty;
      if (property && property.ViewType) {
        result = property.ViewType;
      }
      return result;
    },
    gridTitle() {
      if (this.isShowTitle) {
        return this.config.ControlProperty.TitleRSValue || this.config.ControlProperty.TitleRSCode;
      }
      return "";
    },
    isShowTitle() {
      return this.config.ControlProperty && (this.config.ControlProperty.TitleRSCode || this.config.ControlProperty.TitleRSValue) ? true : false;
    },
    isRenderOpenIcon() {
      let property = this.config.ControlProperty;
      return property && property.IsRenderOpenOrCloseIcon && property.IsRenderOpenOrCloseIcon.toLowerCase() == "true" ? true : false;
    },
    emptyImage() {
      return this.config.ControlProperty.EmptyImage || window.PAGE_CONFIG.emptyListImage;
    },
    childContainers() {
      return this.config.ChildContainers;
    },
    detaildata() {
      let temp = [];
      for (let index = 0; index < this.listData.length; index++) {
        const item = this.listData[index];
        let data = {};
        if(item.new_row_guid){
          data["new_row_guid"] = item.new_row_guid;
        }
        for (let child of this.config.ChildContainers) {
          let id = child.ControlProperty.ID;
          let datafield = child.ControlProperty.DataField;
          if (datafield) {
            data[id] = item[datafield] || "";
          }
          if (["UcFormDetailView","UcCardContainer"].includes(child.ControlCode)) {
           child.ChildContainers.forEach((cardChild) => {
              let datafield = cardChild.ControlProperty.DataField;
              let id = cardChild.ControlProperty.ID;
              if (datafield&&erowConfig.hasProp(item,datafield)) {
                data[id] = item[datafield] || "";
              }
            });
          }
        }
        temp.push(data);
      }
      return temp;
    },
    deletedListWidthID() {
      let temp = [];
      for (let index = 0; index < this.deletedList.length; index++) {
        const item = this.deletedList[index];
        let data = {};
        for (let child of this.config.ChildContainers) {
          let id = child.ControlProperty.ID;
          let datafield = child.ControlProperty.DataField;
          if (datafield) {
            data[id] = item[datafield] || "";
          }
          if (child.ControlCode == "UcFormDetailView") {
            child.ChildContainers.forEach((formChild) => {
              let datafield = formChild.ControlProperty.DataField;
              let id = formChild.ControlProperty.ID;
              if (datafield) {
                data[id] = item[datafield] || "";
              }
            }) 
            } else if (child.ControlCode == "UcCardContainer") {
              child.ChildContainers.forEach((cardChild) => {
                let datafield = cardChild.ControlProperty.DataField;
                let id = cardChild.ControlProperty.ID;
                if (datafield) {
                  data[id] = item[datafield] || "";
                }
              })
            // if (this.$refs[child.ControlProperty.ID]) {
            //   let targetVm = this.$refs[child.ControlProperty.ID][index];
            //   if (targetVm) {
            //     data = {
            //       ...data,
            //       ...targetVm.detailData,
            //     };
            //   }
            // }
          }
        }
        temp.push(data);
      }
      return temp;
    },
    showLineNumber() {
      return this.config.ControlProperty.IsShowLineNumber ? this.config.ControlProperty.IsShowLineNumber === "true" : false;
    },
    range() {
      let Range = "";
      if (this.config.Range) {
        Range = this.config.Range.split(",").map((item) => parseInt(item));
      } else if (this.config.ControlProperty.Range) {
        Range = this.config.ControlProperty.Range.split(",").map((item) => parseInt(item));
      } else {
        return [0, Infinity];
      }

      if (Range.length > 2) {
        Range = Range.slice(Range.length - 2, Range.length);
      }
      if (Range[0] > Range[1]) {
        Range[0] = Range[1];
      }
      return Range;
    },
    openIconStyle() {
      return this.isOpenList
        ? {
            transform: "rotate(0deg)",
          }
        : {
            transform: "rotate(180deg)",
          };
    },
    Height() {
      let Height = this.config && this.config.ControlProperty ? this.config.ControlProperty.Height : "0";
      if (typeof Height == "string" && Height.indexOf("px") == -1) {
        Height = Height + "px";
      }
      const { listData } = this;
      if (listData && listData.length > 0 && !Height) {
        let defaultRowHeight = 50;
        let formConfig = this.config.ChildContainers.find((item) => {
          return item.ControlCode == "UcFormDetailView" || item.ControlCode == "UcCardContainer";
        });
        if (formConfig) {
          let newFormConfig = erowConfig.getNewLineArr(formConfig.ChildContainers);
          defaultRowHeight = Object.keys(newFormConfig).length * 60;
        }
        const listDataLength = listData.length;
        const defaultRowCount = listDataLength < 10 ? listDataLength : 10;
        Height = defaultRowCount * defaultRowHeight + "px";
      }
      return Height;
    },
    PagingDefaultRows() {
      return this.config && this.config.ControlProperty ? this.config.ControlProperty.PagingDefaultRows || 50 : 50;
    },
    hasMore() {
      const { listSize, listData = [] } = this;
      return listSize > listData.length;
    },
    activeStyleProxy() {
      const { Height } = this;
      const activeStyleObj = this.activeStyle();
      let res = {
        ...activeStyleObj,
      };
      // if (Height) {
      //   res = {
      //     ...res,
      //     height: Height,
      //   };
      // }
      return res;
    },
    tableBodyStyle() {
      const { Height } = this;
      let res = {};
      if (Height) {
        res = {
          ...res,
          maxHeight: Height,
          overflowY: "auto",
          overflowX: "hidden",
        };
      }
      return res;
    },
    IsHiddenEmptyInfo() {
      return this.config.ControlProperty.IsHiddenEmptyInfo ? this.config.ControlProperty.IsHiddenEmptyInfo == "true" : false;
    },
  },
  methods: {
    mutiDelete() {},
    getCardOverlayKey(dataItem, index) {
      if (this.rowDataKey && dataItem && dataItem[this.rowDataKey] != null) {
        return String(dataItem[this.rowDataKey]);
      }
      if (dataItem && dataItem.tempGuid) {
        return String(dataItem.tempGuid);
      }
      return `ridx-${index}`;
    },
    onCardDeleteOverlayOpen(key) {
      this.activeDeleteOverlayKey = key;
    },
    onCardDeleteOverlayClose() {
      this.activeDeleteOverlayKey = null;
    },
    onGridCardDelete(payload) {
      const dataItem = payload.containerdata;
      let rindex = payload.rindex != null ? payload.rindex : payload.indexList;
      if (dataItem) {
        if (this.rowDataKey && dataItem[this.rowDataKey] != null) {
          const found = this.listData.findIndex((item) => item[this.rowDataKey] === dataItem[this.rowDataKey]);
          if (found >= 0) {
            rindex = found;
          }
        } else if (dataItem.tempGuid) {
          const found = this.listData.findIndex((item) => item.tempGuid === dataItem.tempGuid);
          if (found >= 0) {
            rindex = found;
          }
        }
      }
      vant.Dialog.confirm({
        message: "请确认删除",
        cancelButtonText: "取消",
        confirmButtonText: "删除",
        cancelButtonColor: true,
        className: "checkConfirm",
      })
        .then(() => {
          this.deleteRow(rindex);
          this.onCardDeleteOverlayClose();
        })
        .catch(() => {});
    },
    getRangeField(config, rowData) {
      let rangeField = null;
      if (erowConfig.hasProp(config.ControlProperty, "RangeField")) {
        rangeField = rowData[config.ControlProperty.RangeField];
      }
      return rangeField;
    },
    changeStepper(val, rowData, rIndex, control) {
      rowData[control.ControlProperty.DataField] = val;
      this.listData.splice(rIndex, 1, rowData);
    },
    changeDetailData({ detailData, rindex, isgroup, categoryid }) {
      if (isgroup && categoryid) {
        let temp = this.categoryData[categoryid][rindex];
        Object.assign(temp, detailData);
        this.categoryData[categoryid].splice(rindex, 1, temp);
      } else {
        let temp = this.listData[rindex];
        Object.assign(temp, detailData);
        this.listData.splice(rindex, 1, temp);
      }
    },
    async initData() {
      let formConfig = this.config.ChildContainers.find((item) => {
        return item.ControlCode == "UcFormDetailView";
      });
      this.tagControl = this.config.ChildContainers.find((item) => {
        return item.ControlCode == "UcTagFilter";
      });
      if (formConfig) {
        await this.getFormCtnrData(formConfig);
        let formAddConfig = erowConfig.deepClone(formConfig);
        formAddConfig.pageMode = "ADD";
        await this.getFormCtnrData(formAddConfig, { assignKey: "formAddControlData" });
      }
      if (this.config.ControlProperty.ScopeCtnrGuid) {
        //配置了搜索容器执行sysSearch
        this.getDefaultValueAndSearchList([this.config], "", "", this.getData);
      } else {
        //未配置搜索容器直接请求
        this.getData();
      }
    },
    setHandler() {
      this.handleScroll = erowConfig.debounce(() => {
        if (this.activeDeleteOverlayKey) {
          this.onCardDeleteOverlayClose();
        }
        const { scrollHeight, scrollTop, clientHeight } = this.$refs.handleScroll;
        console.log("handleScroll");
        if (
          scrollHeight > 0 &&
          scrollTop > 0 &&
          scrollHeight - scrollTop - clientHeight < 100 &&
          !this.isLoading &&
          this.hasMore &&
          !this.disableGetData
        ) {
          this.page = this.page + 1;
          this.getPageData();
        }
      }, 100);
    },
    getFormCtnrData(config, options = {}) {
      const assignKey = options.assignKey || "formControlData";
      const {
        menuRowGuid,
        ControlGUID,
        pValueSet,
        ControlProperty: { SearchParamsInheritIds, ID },
      } = config;

      return new Promise((resolve, rej) => {
        apis.sysLoadControlData({
          vm: this,
          params: {
            menuRowGuid,
            controlGUID: ControlGUID,
            pValueSet,
            pageMode: config.pageMode || "view",
          },
          success: (res) => {
            if (res.code == "SUCCESS") {
              this[assignKey] = res.data;
              resolve(res.data);
            }
          },
          fail: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
            rej();
          },
          error: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
            rej();
          },
        });
      });
    },
    getContainerClass(configItem) {
      let result = this.activeClass(configItem);
      result = result ? result.split(" ") : [];
      if (this.viewType == "card") {
        result.push("jsgrid-card");
      }
      return result.join(" ");
    },
    toggleOpen() {
      this.isOpenList = !this.isOpenList;
    },
    setChangeData() {
      this.syncData = erowConfig.debounce(function (params) {
        this.$emit("syncdata", params);
      }, 1000);
    },
    isShowCol(item) {
      let flag = item.ControlProperty ? item.ControlProperty.isHideControl == true : false;
      return flag || this.hideFieldArr.includes(item.ControlCode) ? false : true;
    },
    handBeforeGetContainerData() {
      if (this.config.BeforeGetContainerConfig || this.config.ControlProperty.BeforeGetContainerConfig) {
        let funcName = this.config.BeforeGetContainerConfig || this.config.ControlProperty.BeforeGetContainerConfig;
        apis.runSpeicalFun({
          vm: this,
          funName: funcName,
        });
      }
    },
    handAfterGetContainerConfig() {
      let _this = this;
      if (_this.config.AfterGetContainerConfig || _this.config.ControlProperty.AfterGetContainerConfig) {
        let funcName = _this.config.AfterGetContainerConfig || _this.config.ControlProperty.AfterGetContainerConfig;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName](_this.config.ChildContainers, _this);
        } else if (erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName](_this.config.ChildContainers, _this);
        } else if (window[fnObj] && window[fnObj][funcName]) {
          var fnObj = _this.config.ControlProperty.FnCode;
          window[fnObj][funcName](_this.config.ChildContainers, _this);
        }

        apis.runSpeicalFun({
          vm: this,
          funName: this.config.ControlProperty.BeforeItemClick,
          params: {
            currentIndex: index,
          },
        });
      }
    },
    tagQuery(val, flag) {
      this.listData = val;
      this.disableGetData = flag;
    },
    getData(callback) {
      let _this = this;

      this.getWidthObj();
      if (this.config.pageMode == "ADD") {
        this.getOpData();
        return;
      }
      let handleGetData = (res) => {
        let data = res.data[this.config.ControlProperty.ID];
        if (_this.config.AfterGetContainerData || _this.config.ControlProperty.AfterGetContainerData) {
          let funcName = _this.config.AfterGetContainerData || _this.config.ControlProperty.AfterGetContainerData;
          apis.runSpeicalFun({ vm: this, funName: funcName, params: res.data });
        }

        this.listSize = data.listSize;
        this.listData = data.dataList;
        this.initDataList = data.dataList;
        this.listData.map((item) => {
          item["controls"] = erowConfig.deepClone(this.config.ChildContainers);
          item["controlData"] = erowConfig.deepClone(this.formControlData);
          return item;
        });
        this.rowDataKey = data.keyName;

        if (this.isGroup) {
          let dataList = this.listData;
          this.groupField = JSON.parse(this.config.ControlProperty.GroupByFields);

          let categoryFiled = this.groupField[0].keyField;
          let catogoryNameField = this.groupField[0].LabelField;
          const categoryTotals = {};
          dataList.forEach((item) => {
            if (!categoryTotals[item[categoryFiled]]) {
              categoryTotals[item[categoryFiled]] = {
                num: 0,
                name: item[catogoryNameField],
              };
            }
            categoryTotals[item[categoryFiled]].num++;
          });

          this.categorys = Object.entries(categoryTotals).map(([name, obj]) => ({
            name: obj.name === "undefined" ? undefined : obj.name,
            total: obj.num,
            isExpend: true,
            id: name,
          }));

          Object.keys(categoryTotals).forEach((key) => {
            let result = dataList.filter((item) => {
              return item[categoryFiled] == key;
            });
            this.$set(this.categoryData, key, result);
          });
        }

        this.getOpData();
        this.config._isLoadedData = true;
        erowConfig.convertConfig(this.config.ChildContainers, {
          _isLoadedData: true,
        });
      };
      if (this.containerdata) {
        handleGetData(this.containerdata);
      } else {
        apis.sysLoadDBData({
          vm: this,
          params: {
            controlCode: this.config.ControlCode,
            pValueSet: this.config.pValueSet,
            controlGUID: this.config.ControlGUID,
            menuRowGuid: this.config.menuRowGuid,
            keyValue: this.config.keyValue || "",
            pageMode: this.config.pageMode,
            page: 1,
            rows: this.PagingDefaultRows,
          },
          success: (res) => {
            if ((res.code = "SUCCESS")) {
              if (callback) {
                callback();
              }
              handleGetData(res);
            }
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
      }
    },
    getPageData(callback) {
      this.isLoading = true;
      let _this = this;

      this.getWidthObj();
      if (this.config.pageMode == "ADD") {
        this.getOpData();
        return;
      }
      let handleGetData = (res) => {
        let data = res.data[this.config.ControlProperty.ID];
        if (_this.config.AfterGetContainerData || _this.config.ControlProperty.AfterGetContainerData) {
          debugger;
          let funcName = _this.config.AfterGetContainerData || _this.config.ControlProperty.AfterGetContainerData;
          apis.runSpeicalFun({ vm: this, funName: funcName, params: res.data });
        }

        this.listSize = data.listSize;
        const { listData = [] } = this;
        this.listData = [...listData, ...data.dataList];
        this.listData.map((item) => {
          item["controls"] = erowConfig.deepClone(this.config.ChildContainers);
          item["controlData"] = erowConfig.deepClone(this.formControlData);
          return item;
        });
        this.rowDataKey = data.keyName;

        if (this.isGroup) {
          let dataList = this.listData;
          this.groupField = JSON.parse(this.config.ControlProperty.GroupByFields);

          let categoryFiled = this.groupField[0].keyField;
          let catogoryNameField = this.groupField[0].LabelField;
          const categoryTotals = {};
          dataList.forEach((item) => {
            if (!categoryTotals[item[categoryFiled]]) {
              categoryTotals[item[categoryFiled]] = {
                num: 0,
                name: item[catogoryNameField],
              };
            }
            categoryTotals[item[categoryFiled]].num++;
          });

          this.categorys = Object.entries(categoryTotals).map(([name, obj]) => ({
            name: obj.name === "undefined" ? undefined : obj.name,
            total: obj.num,
            isExpend: true,
            id: name,
          }));

          Object.keys(categoryTotals).forEach((key) => {
            let result = dataList.filter((item) => {
              return item[categoryFiled] == key;
            });
            this.$set(this.categoryData, key, result);
          });
        }

        this.getOpData();
        this.config._isLoadedData = true;
        erowConfig.convertConfig(this.config.ChildContainers, {
          _isLoadedData: true,
        });
      };
      if (this.containerdata) {
        handleGetData(this.containerdata);
      } else {
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
            rows: this.PagingDefaultRows,
          },
          success: (res) => {
            if ((res.code = "SUCCESS")) {
              if (callback) {
                callback();
              }
              handleGetData(res);
              this.isLoading = false;
            }
          },
          fail: (error) => {
            console.log(error);
            this.isLoading = false;
            this.$toast.fail(error.msg);
          },
          error: (error) => {
            console.log(error);
            this.isLoading = false;
            this.$toast.fail(error.msg);
          },
        });
      }
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
          if (res.code == "SUCCESS") {
            let temp = res.data[this.config.ControlProperty.ID];

            if (this.listData.length === 0 && ["EDIT", "ADD"].includes(this.config.pageMode) && temp.indexOf("ADD") != -1) {
              // 隐藏表头，没新增按钮时，代表是打开弹窗选择，不需要自动新增
              if (this.config.ControlProperty.IsHideTitle !== "true") {
                // 有控制最小行数
                if (this.range[0] > 0) {
                  for (let i = 0; i < this.range[0]; i++) {
                    this.addRow();
                  }
                } else {
                  this.addRow();
                }
                if (this.config.pageMode == "EDIT") {
                  this.renderCacheData(this.listData);
                }
              }
            }
            eventEmitter.emit("afterGetOpList", {
              opList: temp.join(","),
              controlID: this.config.ControlProperty.ID,
              ctnrUID: this.config.ControlProperty.CtnrUID,
            });
            _this.oplist = temp;
            if (_this.oplist.indexOf("EDIT") != -1 && ["EDIT", "ADD"].includes(this.config.pageMode)) {
              _this.isEdit = true;
            } else {
              _this.isEdit = false;
            }
          } else {
            console.log(res);
          }
        },
        (error) => {
          console.log(error);
          _this.$toast.fail(error.msg);
        }
      );
    },
    deleteAll() {
      if (this.listData.length <= this.range[0]) {
        // this.$toast.fail("数据至少为" + this.range[0] + "个");
        return;
      }
      this.deletedList = erowConfig.deepClone(this.initDataList);
      this.deletedList = this.deletedList.filter((item) => item[this.rowDataKey]);
      this.listData = [];
    },
    deleteRow(index) {
      if (this.listData.length <= this.range[0]) {
        // this.$toast.fail("数据至少为" + this.range[0] + "个");
        return;
      }
      if (this.listData[index] && this.listData[index][this.rowDataKey]) this.deletedList.push(this.listData[index]);
      this.listData.splice(index, 1);
      if (this.isGroup && this.groupField && this.groupField[0]) {
        const categoryFiled = this.groupField[0].keyField;
        Object.keys(this.categoryData).forEach((key) => {
          this.$set(
            this.categoryData,
            key,
            this.listData.filter((item) => item[categoryFiled] == key)
          );
        });
      }
    },
    beforeAddRow() {
      if (this.config.pageMode === "VIEW") {
        return;
      }
      if (this.listData.length >= this.range[1]) {
        // this.$toast.fail("数据至多为" + this.range[1] + "个");
        return;
      }
      this.addRow(1);
    },
    addRow(flag) {
      let IsAllowEmpty = this.config.IsAllowEmpty || this.config.ControlProperty.IsAllowEmpty;
      if (IsAllowEmpty && IsAllowEmpty.toLowerCase() == "true"&&flag!=1) {
        return;
      }
      let temp=this.createNewItem();
      this.listData.push(temp);
    },
    createNewItem() {
      let data = {
        RowRights: this.oplist,
        controls: erowConfig.deepClone(this.config.ChildContainers),
        controlData: erowConfig.deepClone(this.formControlData),
      };
      let formConfig = this.config.ChildContainers.find((item) => {
        return item.ControlCode == "UcFormDetailView" || item.ControlCode == "UcCardContainer";
      });
      if(!formConfig) {
        for (let child of this.childContainers) {
          if (this.isShowCol(child)) {
            if (["UcJsGridComboTreeField", "UcJsGridDropDownListField", "UcRadioButtonList", "UcCheckBoxListField"].includes(child.controlCode)) {
              data[child.ControlProperty.DataField] = child.ControlProperty.DefaultValue || [];
            } else {
              data[child.ControlProperty.DataField] = child.ControlProperty.DefaultValue || "";
            }
          }
        }
      } else  {
        let formAddControlData = this.formAddControlData || {};
        for (let child of formConfig.ChildContainers) {
            if (["UcJsGridComboTreeField", "UcJsGridDropDownListField", "UcRadioButtonList", "UcCheckBoxListField"].includes(child.controlCode)) {
              data[child.ControlProperty.DataField] = formAddControlData[child.ControlProperty.ID].DefaultValue || [];
            } else {
              if(child.ControlProperty.DataField && formAddControlData[child.ControlProperty.ID]){
                data[child.ControlProperty.DataField] = formAddControlData[child.ControlProperty.ID].DefaultValue || "";
              }
            }
        }
      }      
      this.setClientRowGuid(data)
      return data;
    },
    changeDate(item, key, val) {
      item[key] = val;
    },
    changeCascader(index, item, val) {
      this.listData[index][item.ControlProperty.field] = val.value;
      if (erowConfig.isHasEvent(item, "change")) {
        this.handleSpecialFun({}, item, this.listData[index], "", "change");
      }
    },
    changeSelect(index, item, val) {
      this.listData[index][item.ControlProperty.field] = val.value;
      if (erowConfig.isHasEvent(this.config, "change")) {
        this.handleSpecialFun({}, item, this.listData[index], "", "change");
      }
    },
    getPlaceHolerByConfig(config) {
      if (!this.config._isLoadedData) return "";
      return config.pageMode == "EDIT" || config.pageMode == "ADD" ? config.PlaceHodler || config.ControlProperty.PlaceHolderRSCode : "";
    },
    isMultiSelect(item) {
      if (erowConfig.hasProp(item.ControlProperty, "SelectedMulti")) {
        return item.ControlProperty.SelectedMulti.toString() == "true" ? true : false;
      } else {
        return false;
      }
    },
    getTextAlign(item) {
      return item.ControlProperty.TextAlign ? item.ControlProperty.TextAlign : "left";
    },
    getMinWidth(item) {
      return this.widthObj[item.ControlProperty.DataField || item.ControlProperty.DataField] + "px";
    },
    generateRules() {
      for (let child of this.config.ChildContainers) {
        if (!this.hideFieldArr.includes(child.ControlCode)) {
          let obj = {};
          if (erowConfig.hasProp(child.ControlProperty, "IsRequired")) {
            if (child.ControlProperty.isHideControl) {
              obj.IsRequired = false;
            } else {
              obj.IsRequired = child.ControlProperty.IsRequired;
            }
          }
          if (erowConfig.hasProp(child.ControlProperty, "FieldVerify")) {
            obj.FieldVerify = child.ControlProperty.FieldVerify;
          }
          obj.RSValue = child.ControlProperty.RSValue;
          this.$set(this.rulesById, child.ControlProperty.ID, obj);
          this.$set(this.rules, child.ControlProperty.field || child.ControlProperty.DataField, obj);
        }
      }
    },
    vanFieldClientActions(event, config, item) {
      let params = {
        configItem: config,
        data: {
          newValue: event,
          item: item,
        },
      };
      this.commomClientActions(params, config, this);
    },
    setRowGuidByUcPhoto(guid, idx) {
      this.listData[idx]["row_guid"] = guid;
    },
  },
  watch: {
    keyval() {
      this.initData();
    },
    listData: {
      handler(val) {
        if (Array.isArray(val)) {
          val.forEach((item, index) => {
            if (!item.hasOwnProperty("controls")) {
              item.controls = erowConfig.deepClone(this.config.ChildContainers);
            }
            if (!item.hasOwnProperty("controlData")) {
              item["controlData"] = erowConfig.deepClone(this.formControlData);
            }
          });

          this.syncData({
            value: val || [],
            rindex: this.rindex,
            ID: this.config.ControlProperty.ID,
          });
        }
      },
      deep: true,
    },
  },
  created() {
    // this.handBeforeGetContainerData();
    //this.handAfterGetContainerConfig();
    this.initData();
    this.setHandler();
    this.setChangeData();
    this.generateRules();
    eventEmitter.on("refresh", () => {
      this.initData();
    });
  },
};
