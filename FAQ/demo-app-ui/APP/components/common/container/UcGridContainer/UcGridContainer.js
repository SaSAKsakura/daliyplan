var UcGridContainer = {
  name: "UcGridContainer",
  mixins: [commonMinxin, gridMinxin],
  components: {
    "form-date": FormDate,
    "form-select": FormSelect,
    "form-multiple-select": FormMultipleSelect,
    "form-cascader": FormCasCader,
    "checkbox-list": CheckboxList,
    "radio-button-list": RadioButtonList,
    "file-upload": fileUpload,
    "uc-tag-filter": UcTagFilter,
  },
  /* html */
  template: `
      <div class="UcGridContainer" :class="activeClass(config)">
        <div class="grid-list" :style="activeStyleProxy">
          <van-skeleton :row="6" v-if="childContainers.length === 0" />
          <uc-tag-filter v-if='tagControl' @filterData="tagQuery" :config="tagControl" :initDataList="initDataList" type="grid"></uc-tag-filter>
          <div class="vertical-table" v-if="!isHorizontalTable" >
            <div class="vertical-table-header-wrapper">
              <table class="grid-table">
                <thead class="grid-thead">
                  <tr>
                    <th v-if="multiSelect">
                    <van-checkbox v-model="allChecked" label-disabled shape="square" @change="toggleMutiSelect"></van-checkbox>
                    </th>
                    <template v-for="item in childContainers">
                      <th
                        :key="item.ControlGUID"
                        v-if="isShowCol(item)"
                        :class="activeClass(item)"
                        :style="{
                          textAlign: getTextAlign(item),
                          minWidth: getMinWidth(item)
                        }"
                      >
                        {{ item.ControlProperty.RSValue || item.RSValue }}
                      </th>
                    </template>
                    <th class="operate-col" style="min-width:80px" v-if="opListNoRead.length&&!isHideOp">
                    操作
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="vertical-table-body-wrapper" :style="verticalTableBodyStyle" @scroll.stop='handleScroll' ref='handleScroll'>
              <table class="grid-table" ref="UcGridContainer">
                <tbody class="grid-tbody">
                  <tr
                    v-for="(data, index) in listData"
                    :class="{'highlight-grid-row': chosenIdx[index]}"
                    :key="index+'grid'"
                    @click.stop="handleClick(data, index)">
                    <td v-if="multiSelect">
                      <van-checkbox v-model="data.checked" label-disabled shape="square"></van-checkbox>
                    </td>
                    <template v-for="(item, index2) in childContainers">
                      <td
                        :key="item.ControlGUID"
                        v-if="isShowCol(item)"
                        :class="activeClass(item)"
                        :style="{
                          textAlign: getTextAlign(item),
                          minWidth: getMinWidth(item)
                        }"
                      >
                        <template v-if="item.ControlCode == 'UcDatePickerField'">
                          <div v-if="!data.isEdit"  class="UcDatePickerField">
                            {{ data[item.ControlProperty.DataField] }}
                          </div>
                          <div v-else class="UcDatePickerField">
                            <form-date
                              :titleName="item.ControlProperty.RSValue"
                              :disabled="getDisabled(item)"
                              :reuquired="getRequired(item)"
                              typeNumber="1"
                              :value="listData[index][item.ControlProperty.DataField]"
                              :placeholder="getPlaceHolerByConfig(item)"
                              :config="item"
                              @changeDate="(val) => changeDate(listData[index], item.ControlProperty.DataField, val)"
                            ></form-date>
                          </div>
                        </template>

                        <template v-if="item.ControlCode == 'UcBoundField'">
                           <div class="UcBoundField" v-if="!isLink(item)" v-html="data[item.ControlProperty.DataField]"  ></div>
                          <div class="UcBoundField link" v-else-if="isLink(item)" @click="handleSpecialFun($event, item, data)">
                            {{ data[item.ControlProperty.DataField] }}
                          </div>
                        </template>

                        <template v-if="item.ControlCode == 'UcHyperLinkField'">
                          <div class="UcHyperLinkField" @click="handleSpecialFun($event, item, data)">
                            {{ data[item.ControlProperty.DataField] || data[item.ControlProperty.RSValue] }}
                          </div>
                        </template>

                        <template v-if="item.ControlCode == 'UcASCX'">
                          <UcASCX
                            :config="item"
                            :params="data"
                            :ref="item.ControlProperty.ID"
                          ></UcASCX>
                        </template>

                        <template v-if="item.ControlCode == 'UcTextBoxField'">
                          <div class="UcTextBoxField" v-if="!data.isEdit"  :title="data[item.ControlProperty.DataField]">{{ data[item.ControlProperty.DataField] }}</div>
                          <div
                            v-else
                            class="UcTextBoxField input-text-box"
                          >
                            <van-field
                              v-model="listData[index][item.ControlProperty.DataField]"
                              :disabled="getDisabled(item)"
                              :reuquired="getRequired(item)"
                              rows="1"
                              :maxlength="item.ControlProperty.MaxSize"
                              :placeholder="getPlaceHolerByConfig(item)"
                            >
                              <template slot='right-icon'>
                                <van-icon name="close" v-show="listData[index][item.ControlProperty.DataField] !== ''" @click="listData[index][item.ControlProperty.DataField] = ''" />
                              </template>
                            </van-field>
                          </div>
                        </template>

                        <template v-if="item.ControlCode == 'UcSensitiveField'">
                          <div class="UcSensitiveField" v-if="!data.isEdit" >{{ data[item.ControlProperty.DataField] }}</div>
                          <div class="UcSensitiveField" v-else >
                            <div class="input-text-box">
                              <van-field
                                v-model="listData[index][item.ControlProperty.DataField]"
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

                        <template v-if="item.ControlCode == 'UcComboTreeField'">
                          <div class="UcComboTreeField" v-if="!data.isEdit" >
                            {{ data[item.ControlProperty.DataFieldWhenReadMode] || data[item.ControlProperty.TextColumnDataField] }}
                          </div>
                          <div
                            v-else
                            class="UcComboTreeField"
                          >
                            <form-cascader
                              :config="item"
                              :disabled="getDisabled(item)"
                              :required="getRequired(item)"
                              :label="getPlaceHolerByConfig(item)"
                              :placeholder="getPlaceHolerByConfig(item)"
                              :value="listData[index][item.ControlProperty.field]"
                              @changeCascader="val => changeCascader(index, item, val)"
                            ></form-cascader>
                          </div>
                        </template>

                        <template v-if="item.ControlCode == 'UcDropDownListField'">
                          <div v-if="!data.isEdit" >{{ data[item.ControlProperty.DataFieldWhenReadMode] || data[item.ControlProperty.DataTextField] }}</div>
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
                              @confirm="val => changeSelect(index, item, val)"
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
                              @changeSelect="val => changeSelect(index, item, val)"
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

                        <template v-if="item.ControlCode == 'UcCheckBoxField'">
                          <van-checkbox
                            v-model="data[item.ControlProperty.field]"
                            shape="square"
                          ></van-checkbox>
                        </template>
                        <template   v-if="item.ControlCode == 'UcFileUpload'">
                        <file-upload :config="item" :containerdata="data" @update="getData">
                        </file-upload>
                        </template>

                      </td>
                    </template>
                    <td class="operate-col" v-if="opListNoRead.length&&!isHideOp">
                      <van-icon  v-for="opItem in  opListNoRead " :key="opItem.type"  :name="getOpName(opItem.type)"     @click.stop="opClickRow(opItem, data, index)" v-show="!hideOpArr.includes(opItem.type)" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-else class="horizontal-table" @scroll.stop='handleScroll' ref='handleScroll'>
             <div class="grid-row" v-for="rowdata in listData">
               <template v-for="(configItem, index2) in childContainers">
                  <div
                   :key="configItem.ControlGUID"
                   v-if="isShowCol(configItem)"
                   class="grid-horizontal-col"
                   :class="activeClass(configItem,rowdata)"
                   :style="{
                    textAlign: getTextAlign(configItem),
                    minWidth: getMinWidth(configItem)
                   }"
                  >
                  {{ rowdata[configItem.ControlProperty.DataField] }}
                  </div>
               </template>
             </div>
          </div>
        </div>

        <div v-show='isLoading && hasMore' class='list-loading'>
          <img :src='getImgFileUrl({ parentFilePath: "common", filename: "loading", fileType: "png" })' />
          {{hasMore ? '加载中...' : ''}}
        </div>

        <div class="jsGrid-footer" v-if="(config.ControlProperty.isShowTotal !== false || isHasAdd)&&!isHorizontalTable">
          <div class="jsGrid-total" v-if="config.ControlProperty.isShowTotal !== false" >
            共<span>{{ listSize }}</span>条
          </div>
          <van-icon v-if="isHasAdd" @click="beginAddGridRow(newItem)" name="add-o" style=""/>
        </div>

      </div>
    `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
    dataFormCard: {
      type: Object,
    },
  },
  data() {
    return {
      allChecked: false,
      dataArr: {},
      listData: [],
      oplist: [],
      containerConfig: {},
      rules: {},
      rulesById: {},
      clickMap: {},
      chosenIdx: {},
      page: 1,
      listSize: 100,
      isLoading: false,
      tagControl: null,
    };
  },
  watch: {
    dataFormCard: {
      handler(value) {
        this.dataArr = value;
        this.listData = this.dataArr.dataList;
        this.config._isLoadedData = true;
        erowConfig.convertConfig(this.config.ChildContainers, {
          _isLoadedData: true,
        });
      },
      deep: true,
    },
  },
  computed: {
    isHorizontalTable() {
      return this.activeClass(this.config).indexOf("horizontal-table") != -1 ? true : false;
    },
    mutiSelections() {
      return this.listData.filter((item) => {
        return item.checked;
      });
    },
    isHasAdd() {
      return this.oplist.find((item) => {
        return item == "ADD";
      });
    },
    isHideOp() {
      if (this.config.ControlProperty.hasOwnProperty("IsHideCommand")) {
        let temp = this.config.ControlProperty.IsHideCommand;
        return temp === "true" ? true : false;
      } else {
        return false;
      }
    },
    hideOpArr() {
      let result = [];
      if (this.config.ControlProperty.HideOps) {
        result = this.config.ControlProperty.HideOps.split(",");
      }
      if (this.config.ControlProperty.IsHideADD && !result.includes("ADD")) {
        result.push("ADD");
      }
      if (this.config.ControlProperty.IsHideDELETE && !result.includes("EDIT")) {
        result.push("EDIT");
      }
      if (this.config.ControlProperty.IsHideEDIT && !result.includes("DELETE")) {
        result.push("DELETE");
      }
      return result;
    },
    opListNoRead() {
      let result = [];
      this.oplist
        .filter((item) => {
          return ["EDIT", "DELETE"].includes(item);
        })
        .forEach((item) => {
          let map = {
            EDIT: 1,
            DELETE: 2,
          };
          result.push({ type: item, order: map[item] });
        });

      return result.sort((a, b) => a.order - b.order);
    },
    childContainers() {
      return this.config.ChildContainers.map((item) => {
        this.$set(item.ControlProperty, "FnCode", this.config.ControlProperty.FnCode);
        return item;
      });
    },
    multiSelect() {
      if (erowConfig.hasProp(this.config.ControlProperty, "SelectedMulti")) {
        return this.config.ControlProperty.SelectedMulti.toString() == "true" ? true : false;
      } else if (erowConfig.hasProp(this.config.ControlProperty, "IsAllowMultiSelect")) {
        return this.config.ControlProperty.IsAllowMultiSelect.toString() == "true" ? true : false;
      } else {
        return false;
      }
    },
    Height() {
      let Height = this.config && this.config.ControlProperty ? this.config.ControlProperty.Height || "0" : "0";
      const { isHorizontalTable } = this;
      if (Height && Height.indexOf("px") == -1) {
        Height = Height + "px";
      }

      const { listData } = this;
      if (!isHorizontalTable && listData && listData.length > 0 && !Height) {
        const defaultRowHeight = 35;
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
      const activeStyleObj = this.activeStyle();
      let res = {
        ...activeStyleObj,
      };
      return res;
    },
    verticalTableBodyStyle() {
      const { Height } = this;
      const res = {
        maxHeight: Height == "0px" ? "none" : Height,
        overflow: "auto",
      };

      return res;
    },
  },
  methods: {
    toggleMutiSelect(val) {
      this.listData.forEach((item, index) => {
        item.checked = val;
        this.listData.splice(index, 1, item);
      });
    },
    beginAddGridRow(item) {
      // if (this.config.AddNewDialogCtnrUID) {
      //   let [fnCode, fnParameter, containerId, pageMode] = this.config.AddNewDialogCtnrUID.split(".");
      //   let config = {
      //     fnCode,
      //     fnParameter,
      //     containerId,
      //     pageMode: pageMode || "VIEW",
      //     pValueSet: this.generateUUID(),
      //     class: this.getDialogStyle(this.config.DetailPageWidth, this.config.DetailPageHeight),
      //     setDefault: this.config.setDefault,
      //     rowkeyArr: this.rowkeyArr,
      //     menuRowGuid: this.getMenuRowGuid(this),
      //   };
      //   let commonPValueSet = this.dialogParams.pValueSet ? this.dialogParams.pValueSet : this.getPvalueSet;
      //   if (commonPValueSet) {
      //     config.commonPValueSet = commonPValueSet;
      //   }
      //   erowConfig.showLayerByConfig(config, this);
      //   return;
      // }
      let _this = this;
      //_this.changeUcFormPageMode("ADD");
      // if (_this.isDialog) {
      //   //需要弹出框新增
      //   if (this.config.parentUid == "pageList") {
      //     // 在主界面
      //     let flag = this.config.AddNewDialogType || this.dialogParams.AddNewDialogType;
      //     this.getShowLayer(this.config.formKey, "", "ADD", flag);
      //   } else {
      //     //在tabGroup 下新增时带入参数
      //     let temp = _this.$store.state.settings.layerDetailDataArr;
      //     let layerConfigArr = temp.filter((item) => {
      //       return item.ControlGUID == _this.config.layerMainControlGuid;
      //     });
      //     if (layerConfigArr.length > 0) {
      //       this.getShowLayer(this.config.formKey, layerConfigArr[0].detailData, "ADD");
      //     } else {
      //       //结束
      //       this.getShowLayer(this.config.formKey, "", "ADD");
      //     }
      //   }
      // } else {
      // _this.newItemClone = erowConfig.deepClone(item);
      // _this.newItem.isEdit = true;
      // _this.newItem.isAdd = true;
      // _this.$set(_this.newItem, "controls", _this.deepClone(_this.childContainers));
       let temp=this.createNewItem();
       temp.isEdit = true;
       temp.isAdd = true;
      _this.listData.push(temp);
      // _this.handleBeforeGridRowEdit(_this.newItem, _this.dataArr.dataList.length - 1);

      // }
    },
    getOpName(type) {
      let map = {
        EDIT: "edit",
        DELETE: "delete-o",
      };
      return map[type];
    },
    handleDelete(key) {
      let _this = this;
      this.$dialog
        .confirm({ title: "提示", message: "确定删除该条数据吗" })
        .then(() => {
          deleteRowData(_this.config.ControlGUID, key, _this.getPvalueSet).then((res) => {
            if (res.code == "SUCCESS") {
              this.messOnce.success({
                type: "success",
                message: "删除成功!",
              });
              _this.getConfig();
              _this.updateContainerData();
              _this.$refs.myTable.clearSelection();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    opClickRow(item, rowData, index) {
      console.log(item);
      let _this = this;
      let flag = this.config.ControlProperty.AddNewDialogType;
      if (item.type == "DELETE") {
        let keyVal = rowData[_this.dataArr.keyName];
        this.handleDelete(keyVal);
      }

      if (item.type == "EDIT") {
        let temp = this.dataArr.dataList.find((item) => {
          return item.isEdit;
        });
        if (temp) {
          _this.$toast.fail("请编辑完当前行后再编辑其它行数据");
          return;
        }
        if (rowData.hasOwnProperty("isEdit")) {
          _this.initData = _this.deepClone(rowData);
          if (_this.isDialog) {
            // this.getShowLayer(rowData[_this.dataArr.keyName], rowData, "EDIT", flag);
          } else {
            //点击编辑时初始化下拉框的相关连的下拉框
            let flag = true;
            // flag = this.handleBeforeGridRowEdit(rowData, index);
            if (flag) rowData.isEdit = true;
          }
        }
      }
    },
    // 设计文档里的设计
    isShowCol(item) {
      let flag = item.ControlProperty ? item.ControlProperty.isHideControl == true : false;
      return flag || this.hideFieldArr.includes(item.ControlCode) ? false : true;
    },
    handleClick(data, index) {
      if (this.chosenIdx.hasOwnProperty(index)) {
        this.$set(this.chosenIdx, index, !this.chosenIdx[index]);
      } else {
        this.$set(this.chosenIdx, index, true);
      }
      if (this.clickMap[index]) {
        if (this.config.ControlProperty.OnClientDblClick) {
          apis.runSpeicalFun({ vm: this, funName: this.config.ControlProperty.OnClientDblClick, params: data });
        }
        apis.runSpeicalFun({ vm: this, funName: "backDataToForm", params: data });
        this.clickMap[index] = false;
      } else {
        this.clickMap[index] = true;
        setTimeout(() => {
          this.clickMap[index] = false;
        }, 700);
      }
    },
    setHandler() {
      this.handleScroll = erowConfig.debounce(() => {
        const { isHorizontalTable } = this;
        const { scrollWidth, scrollLeft, clientWidth } = this.$refs.handleScroll;
        if (isHorizontalTable && scrollWidth - scrollLeft - clientWidth < 100 && !this.isLoading && this.hasMore) {
          this.page = this.page + 1;
          this.getPageData();
          return;
        }

        const { scrollHeight, scrollTop, clientHeight } = this.$refs.handleScroll;
        if (!isHorizontalTable && scrollHeight - scrollTop - clientHeight < 100 && !this.isLoading && this.hasMore && !this.disableGetData) {
          this.page = this.page + 1;
          this.getPageData();
          return;
        }
      }, 100);
    },
    handlerAfterGetConfig(data) {
      let _this = this;
      this.tagControl = _this.config.ChildContainers.find((item) => {
        return item.ControlCode == "UcTagFilter";
      });
      this.containerConfig = erowConfig.deepClone(data);
      if (_this.config.AfterGetContainerConfig || _this.containerConfig.AfterGetContainerConfig) {
        let funcName = _this.config.AfterGetContainerConfig || _this.containerConfig.AfterGetContainerConfig;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName](_this.config.ChildContainers, _this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName](_this.config.ChildContainers, _this);
        } else {
          var fnObj = _this.config.ControlProperty.FnCode;
          window[fnObj][funcName](_this.config.ChildContainers, _this);
        }
      }

      _this.getData();
      _this.generateRules();
    },
    tagQuery(val, flag) {
      this.listData = val;
      this.disableGetData = flag;
    },
    getConfig() {
      let _this = this;
      if (Array.isArray(this.config.ChildContainers) && this.config.ChildContainers.length) {
        this.handlerAfterGetConfig(this.config);
      } else {
        if (erowConfig.hasProp(this.config, "BeforeGetContainerConfig")) {
          let funcName = configItem.BeforeGetContainerConfig;
          if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
            baseSpecial[funcName](this);
          } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
            erowSpecial[funcName](this);
          } else {
            var fnObj = this.config.ControlProperty.FnCode;
            window[fnObj][funcName](this);
          }
        }
        let params = {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID: this.config.ControlGUID,
          pageMode: this.config.pageMode,
          pValueSet: this.config.pValueSet,
        };
        apis.sysLoadConfigData({
          vm: this,
          params: params,
          success: (res) => {
            if (res.code == "SUCCESS") {
              this.handlerAfterGetConfig(res.data);
            }
          },
          fail: (error) => {
            this.$toast.fail(error.msg);
          },
          error: (error) => {
            this.$toast.fail(error.msg);
          },
        });
      }
    },
    getPageData() {
      if (this.config.pageMode == "ADD") {
        this.getWidthObj();
        this.getOpData();
        return;
      }
      if (this.dataFormCard) {
        return; //grid 的数据来自卡片时，禁止请求数据
      }
      let _this = this;
      if (erowConfig.hasProp(this.config, "BeforeGetContainerData")) {
        let funcName = configItem.BeforeGetContainerData;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName](this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName](this);
        } else {
          var fnObj = this.config.ControlProperty.FnCode;
          window[fnObj][funcName](this);
        }
      }

      this.isLoading = true;
      let url = erowplatformBackendUrl + "/appBaseApi/sysLoadDBData";
      erRequest.post(
        url,
        {
          controlCode: this.config.ControlCode,
          pValueSet: this.config.pValueSet,
          controlGUID: this.config.ControlGUID,
          menuRowGuid: this.config.menuRowGuid,
          keyValue: this.config.keyValue || "",
          pageMode: this.config.pageMode,
          page: this.page,
          rows: this.PagingDefaultRows,
        },
        (res) => {
          if (res.code == "SUCCESS") {
            let data = res.data[_this.config.ControlProperty.ID];

            let temp = [];
            if (erowConfig.hasProp(_this.config, "AfterGetContainerData")) {
              let funcName = _this.config.AfterGetContainerData;
              if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
                temp = baseSpecial[funcName](data.dataList, _this);
              } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
                temp = erowSpecial[funcName](data.dataList, _this);
              } else {
                var fnObj = _this.config.ControlProperty.FnCode;
                temp = window[fnObj][funcName](data.dataList, _this);
              }
            } else {
              temp = data.dataList;
            }

            const { listData, dataArr = {} } = this;
            const { dataList: preDataList = [] } = dataArr;
            const { dataList: nextDataList = [] } = data;
            this.dataArr = {
              ...data,
              dataList: [...preDataList, ...nextDataList],
            };
            this.listData = [...listData, ...temp];
            this.listSize = data.listSize;

            this.listData.forEach((item) => {
              this.$set(item, "checked", false);
            });

            this.config._isLoadedData = true;
            erowConfig.convertConfig(this.config.ChildContainers, {
              _isLoadedData: true,
            });
            this.getWidthObj();
            this.getOpData();
            this.isLoading = false;
          }
        },
        (error) => {
          console.log(error);
          this.isLoading = false;
          this.$toast.fail(error.msg);
        }
      );
    },
    getData() {
      if (this.config.pageMode == "ADD") {
        this.getWidthObj();
        this.getOpData();
        return;
      }
      if (this.dataFormCard) {
        return; //grid 的数据来自卡片时，禁止请求数据
      }
      let _this = this;
      if (erowConfig.hasProp(this.config, "BeforeGetContainerData")) {
        let funcName = configItem.BeforeGetContainerData;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName](this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName](this);
        } else {
          var fnObj = this.config.ControlProperty.FnCode;
          window[fnObj][funcName](this);
        }
      }
      let url = erowplatformBackendUrl + "/appBaseApi/sysLoadDBData";
      erRequest.post(
        url,
        {
          controlCode: this.config.ControlCode,
          pValueSet: this.config.pValueSet,
          controlGUID: this.config.ControlGUID,
          menuRowGuid: this.config.menuRowGuid,
          keyValue: this.config.keyValue || "",
          pageMode: this.config.pageMode,
          page: 1,
          rows: this.PagingDefaultRows,
        },
        (res) => {
          if (res.code == "SUCCESS") {
            let data = res.data[_this.config.ControlProperty.ID];

            let temp = [];
            if (erowConfig.hasProp(_this.config, "AfterGetContainerData")) {
              let funcName = _this.config.AfterGetContainerData;
              if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
                temp = baseSpecial[funcName](data.dataList, _this);
              } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
                temp = erowSpecial[funcName](data.dataList, _this);
              } else {
                var fnObj = _this.config.ControlProperty.FnCode;
                temp = window[fnObj][funcName](data.dataList, _this);
              }
            } else {
              temp = data.dataList;
            }
            this.dataArr = data;
            this.listData = this.dataArr.dataList;
            this.listSize = data.listSize;
            this.initDataList = data.dataList;
            this.listData.forEach((item) => {
              this.$set(item, "checked", false);
            });

            this.config._isLoadedData = true;
            erowConfig.convertConfig(this.config.ChildContainers, {
              _isLoadedData: true,
            });
            this.getWidthObj();
            this.getOpData();
          }
        },
        (error) => {
          console.log(error);
          this.$toast.fail(error.msg);
        }
      );
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
            eventEmitter.emit("afterGetOpList", {
              opList: temp.join(","),
              controlID: this.config.ControlProperty.ID,
              ctnrUID: this.config.ControlProperty.CtnrUID,
            });

            _this.oplist = temp;
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
      this.listData = [];
    },
    deleteRow(index) {
      this.listData.splice(index, 1);
    },
    beforeAddRow() {
      if (this.config.pageMode === "VIEW") {
        return;
      }
      this.addRow();
    },
    addRow() {
      let temp=this.createNewItem();
      this.listData.push(temp);
    },
    createNewItem() {
      let data = {};
      for (let child of this.childContainers) {
        if (this.isShowCol(child)) {
          if (["UcComboTreeField", "UcDropDownListField", "UcRadioButtonList", "UcCheckBoxListField"].includes(child.controlCode)) {
            data[child.ControlProperty.DataField] = [];
          } else {
            data[child.ControlProperty.DataField] = "";
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
      return [item.ControlProperty.SelectedMulti, item.ControlProperty.IsAllowMultiSelect].includes("true");
    },
    getTextAlign(item) {
      return item.ControlProperty.TextAlign || "center";
    },
    getMinWidth(item) {
      return this.widthObj[item.ControlProperty.DataField || item.ControlProperty.DataField] + "px";
    },
    generateRules() {
      for (let child of this.containerConfig.ChildContainers) {
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
  },
  beforeDestroy() {
    eventEmitter.off("search", this.getConfig);
    eventEmitter.off("refresh", this.getConfig);
  },
  created() {
    if (this.dataFormCard) {
      this.dataArr = this.dataFormCard;
      this.listData = this.dataArr.dataList;
      this.config._isLoadedData = true;
      erowConfig.convertConfig(this.config.ChildContainers, {
        _isLoadedData: true,
      });
      this.getWidthObj();
      this.oplist = this.dataFormCard.PageRights;
      // this.getOpData();
    } else {
      this.getConfig();
    }
    this.setHandler();
    eventEmitter.on("search", this.getConfig);
    eventEmitter.on("refresh", this.getConfig);
  },
};
