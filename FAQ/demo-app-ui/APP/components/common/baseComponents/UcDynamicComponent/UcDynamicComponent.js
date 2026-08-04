var UcDynamicComponent = {
  name: "UcDynamicComponent",
  mixins: [commonMinxin],
  data: function () {
    return {};
  },
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
    isedit: {
      type: Boolean,
      default: false,
    },
    isingrid: {
      type: Boolean,
      default: false,
    },
    rindex: {
      type: Number,
      default: 0,
    },
    dycontroldata: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    currentDataList() {
      if (this.dycontroldata) {
        return this.dycontroldata[this.config.ID + "_" + this.rindex] || {};
      } else {
        return {};
      }
    },
    currentDefault() {
      if (this.dycontroldata) {
        return this.dycontroldata[this.config.ID + "_" + this.rindex] || "";
      } else {
        return "";
      }
    },
    getDisable(item) {
      return function (item) {
        if (!this.isEdit) {
          return true;
        }
        if (item.ControlProperty.hasOwnProperty("disabled")) {
          if (item.ControlProperty.disabled) {
            if (item.ControlProperty.disabled.toString().toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
          return false;
        }
        if (item.ControlProperty.hasOwnProperty("IsReadOnlyWhenInsert")) {
          if (item.ControlProperty.IsReadOnlyWhenInsert) {
            if (item.ControlProperty.IsReadOnlyWhenInsert.toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
        }
        if (this.config.pageMode == "ADD" && item.ControlProperty.hasOwnProperty("IsReadOnlyWhenAdd")) {
          if (item.ControlProperty.IsReadOnlyWhenAdd) {
            if (item.ControlProperty.IsReadOnlyWhenAdd.toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
          return false;
        }
        if (this.config.pageMode != "ADD" && item.ControlProperty.hasOwnProperty("IsReadOnlyWhenUpdate")) {
          if (item.ControlProperty.IsReadOnlyWhenUpdate) {
            if (item.ControlProperty.IsReadOnlyWhenUpdate.toLowerCase() == "true") {
              return true;
            } else {
              return false;
            }
          }
        } else {
          return false;
        }
      };
    },
    getRequired(item, rowData) {
      return function (item, rowData) {
        let requiredFiled = item.ControlProperty.DataField + "_required";
        if (this.hasProp(rowData, requiredFiled)) {
          return rowData[requiredFiled].toString();
        } else {
          let val = item.ControlProperty.hasOwnProperty("IsRequired")
            ? item.ControlProperty.IsRequired == "true" || item.ControlProperty.IsRequired == "True" || item.ControlProperty.IsRequired == true
              ? "required"
              : "norequired"
            : "norequired";
          return val;
        }
      };
    },

    childControls() {
      return this.config.ControlPropertys || this.config.ChildContainers;
    },
    currentControl() {
      let temp = "";
      if (this.containerdata[this.config.ControlProperty.TypeField]) {
        temp = this.childControls.find((item) => {
          return item.ControlProperty.ViewType == this.containerdata[this.config.ControlProperty.TypeField];
        });
      } else {
        temp = this.childControls.find((item) => {
          return item.ControlCode == "UcTextBox";
        });
      }

      return temp || {};
    },
    isEdit() {
      return this.config.pageMode == "VIEW" ? false : true;
    },
  },
  methods: {
    changeDate(val, num) {
      if (num == 1) {
        this.containerdata[this.currentControl.ControlProperty.DataField] = val;
      }
    },
    isMultiSelect(item) {
      if (erowConfig.hasProp(item.ControlProperty, "SelectedMulti")) {
        return item.ControlProperty.SelectedMulti.toString() == "true" ? true : false;
      } else {
        return false;
      }
    },
    changeSelect(val, num) {
      this.containerdata[this.currentControl.ControlProperty.DataField] = val.value;
      if (erowConfig.isHasEvent(this.config, "change")) {
        this.handleClientActionsWidthParams({}, this.config, this.containerdata, "", "change");
      }
    },
    changeCheckbox(val, field) {
      if (!this.setResult) {
        return;
      }
      this.setResult(val);
    },
    changeRadio(val, field) {
      if (!this.setResult) {
        return;
      }
      this.setResult(val);
    },
  },
  inject: {
    setResult: {
      default: function() {}
    },
    currentResult: {
      default: function() {}
    },
  },
  watch: {
    containerdata(val) {
      if (this.currentResult) { // 数据回显
        let current = this.currentResult();
        if (
          current &&
          this.currentControl &&
          this.currentControl.ControlProperty &&
          !erowConfig.hasProp(this.containerdata, this.currentControl.ControlProperty.DataField)
        ) {
          this.$set(this.containerdata, this.currentControl.ControlProperty.DataField, current);
        }
      }
    },
  },
  components: {
    "form-date": FormDate,
    "form-select": FormSelect,
    "form-multiple-select": FormMultipleSelect,
    "form-cascader": FormCasCader,
    "checkbox-list": CheckboxList,
    "radio-button-list": RadioButtonList,
    "uc-stepper": UcStepperField,
    "uc-rate": UcRateListField,
    "uc-step-list": UcStepList,
    "uc-progress-bar": ProgressBar,
    "uc-gps-range-list": UcGpsRangeList,
    "uc-week-calendar": UcWeekCalendar,
    "uc-timer": UcTimer,
    "file-upload": fileUpload,
  },
  template: `
<div class="component-outer" style="min-height: 32px">
  <template
    v-if="!isedit && isingrid && Object.keys(currentControl).length"
  >
    <span>{{
      containerdata[currentControl.ControlProperty.DataFieldWhenReadMode] ||
      containerdata[currentControl.ControlProperty.DataField]
    }}</span>
  </template>
  <template
    v-else-if="
      Object.keys(currentControl).length &&
      (isedit || (!isedit && !isingrid))
    "
  >
    <template v-if="currentControl.ControlCode == 'UcDropDownList'">
      <form-multiple-select
        v-if="isMultiSelect(currentControl)"
        :disabled="getDisabled(currentControl)"
        :reuquired="getRequired(currentControl)"
        :config="currentControl"
        :value="containerdata[currentControl.ControlProperty.DataField]"
        :label="getPlaceHolerByConfig(currentControl)"
        :placeholder="getPlaceHolerByConfig(currentControl)"
        :columns="currentDataList"
        @confirm="changeSelect"
        :isShowSearch="false"
        :isShowAll="true"
        popup_max_height="260px"
      ></form-multiple-select>

      <form-select
        v-else
        typeNumber="1"
        :disabled="getDisabled(currentControl)"
        :reuquired="getRequired(currentControl)"
        :config="currentControl"
        :options="currentDataList"
        :value="containerdata[currentControl.ControlProperty.DataField]"
        :placeholder="getPlaceHolerByConfig(currentControl)"
        @changeSelect="changeSelect"
      ></form-select>
    </template>

    <!-- 复选框列表-->
    <template
      v-if="
        currentControl.ControlCode == 'UcCheckBoxList' &&
        currentControl.ControlProperty.DataField
      "
    >
      <checkbox-list
        :disabled="getDisable(currentControl)"
        :config="currentControl"
        :options="currentDataList"
        :detailData="containerdata"
        v-model="containerdata[currentControl.ControlProperty.DataField]"
        v-on="handleClientActions()"
        @change="changeCheckbox"
      ></checkbox-list>
    </template>

    <template
      v-if="
        currentControl.ControlCode == 'UcRadioButtonList' &&
        currentControl.ControlProperty.DataField
      "
    >
      <radio-button-list
        :disabled="getDisable(currentControl)"
        :config="currentControl"
        :options="currentDataList"
        :detailData="containerdata"
        v-model="containerdata[currentControl.ControlProperty.DataField]"
        v-on="handleClientActions()"
        @change="changeRadio"
      ></radio-button-list>
    </template>

    <!-- 日期 -->
    <el-date-picker
      :default-value="defaultDate"
      :name="getRequired(currentControl)"
      :value-format="
        getDateFormat(
          containerdata[currentControl.ControlProperty.DataField],
          currentControl
        )
      "
      v-if="
        currentControl.ControlCode == 'UcDatePicker' &&
        !isDateTime(currentControl)
      "
      v-model="containerdata[currentControl.ControlProperty.DataField]"
      type="date"
      placeholder="选择日期"
      align="right"
      @focus="checkDate(currentControl)"
      @change="
        hasProp(currentControl.ControlProperty, 'AutoPostBackAction') &&
          selectChange($event, currentControl)
      "
      :disabled="getDisable(currentControl)"
      :picker-options="pickerOptions"
    ></el-date-picker>

    <form-date
      v-if="currentControl.ControlCode == 'UcDatePicker'"
      :titleName="currentControl.ControlProperty.RSValue"
      :disabled="getDisabled(currentControl)"
      :reuquired="getRequired(currentControl)"
      typeNumber="1"
      :value="containerdata[currentControl.ControlProperty.DataField]"
      :placeholder="getPlaceHolerByConfig(currentControl)"
      :config="currentControl"
      @changeDate="changeDate"
    ></form-date>

    <!-- 文本框 -->
    <el-input
      v-if="currentControl.ControlCode == 'UcTextBox'"
      type="text"
      :placeholder="
        currentControl.ControlProperty.PlaceHolderRSCode
          ? currentControl.ControlProperty.PlaceHolderRSCode
          : ''
      "
      v-model="containerdata[currentControl.ControlProperty.DataField]"
      :name="getRequired(currentControl)"
      :disabled="getDisable(currentControl)"
      :maxlength="currentControl.ControlProperty.MaxSize"
      :class="
        currentControl.ControlProperty.CssClass
          ? item.ControlProperty.CssClass
          : ''
      "
    ></el-input>

    <div
      class="input-text-box"
      :class="activeClass()"
      v-if="currentControl.ControlCode == 'UcTextBox'"
    >
      <van-field
        v-model="containerdata[currentControl.ControlProperty.DataField]"
        :disabled="getDisabled(currentControl)"
        :reuquired="getRequired(currentControl)"
        :rule="
          currentControl.ControlProperty.ruleType
            ? [
                erowConfig.validateRules[
                  currentControl.ControlProperty.ruleType
                ],
              ]
            : []
        "
        :rows="Number(currentControl.ControlProperty.Rows) || 1"
        autosize
        :type="
          currentControl.ControlProperty.type ||
          (Number(currentControl.ControlProperty.Rows) >= 1
            ? 'textarea'
            : 'text')
        "
        @keydown="handleEnterFun($event, currentControl)"
        :placeholder="getPlaceHolerByConfig(currentControl)"
        :maxlength="currentControl.ControlProperty.MaxSize"
        @input="
          isHasEvent(currentControl, 'change') &&
            handleSpecialFun($event, currentControl, containerdata)
        "
        @click.stop="
          getDisabled(currentControl) &&
            checkConfirm(currentControl, handleSpecialFun, [
              $event,
              currentControl,
              containerdata,
            ])
        "
        v-on="handleClientActions()"
      >
        <template slot="right-icon">
          <img
            class="input-text-box-icon"
            v-if="currentControl.ControlProperty.Icon"
            :src="
              '../assets/images/icon/' +
              currentControl.ControlProperty.Icon +
              '.png'
            "
            @click="
              runSpeicalFun(currentControl.ControlProperty.iconClickAction)
            "
          />
          <van-icon
            name="close"
            v-show="detailData[keyfield] && detailData[keyfield] !== ''"
            @click="detailData[keyfield] = ''"
          />
        </template>
      </van-field>
    </div>
  </template>
</div>`,};
