var EditComponent = {
  name: "EditComponent",
  mixins: [commonMinxin],
  components: {
    "form-date": FormDate,
    "form-select": FormSelect,
    "form-multiple-select": FormMultipleSelect,
    "form-tree": FormTree,
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
    "uc-answer-field": UcAnswerField,
    "uc-switch-field": UcSwitchField,
    "uc-select": UcSelect,
  },
  /* html */
  template: `
  <div :class="{ mergeUnit: isMergeCol }" ref="viewCommentRef" :style="{textAlign: getTextAlign(config)}">
    <uc-progress-bar :class="activeClass(config, containerdata)" v-if="config.ControlCode == 'UcProgressBar'" :config="config" :value="detailData[keyfield]"/>

    <img :class="activeClass(config, containerdata)" v-if="config.ControlCode=='UcImage'" class="icon rightIcon" :src="getImageSrc('thumbnail')" @click.stop="handleSpecialFun($event, config, detailData,'','',0,dialogConfig)" v-on="handleClientActions()" />

    <img :class="activeClass(config, containerdata)" v-if="config.ControlCode=='UcImageField'" @click.stop="handleSpecialFun($event, config, detailData,'','',0,dialogConfig)" class="icon rightIcon" v-on="handleClientActions()" :src="imageFieldSrc()" />

    <div class="inline-flex items-center" v-if="config.ControlCode == 'UcLabel'">
      <span class='editer-form-label' :class="activeClass(config)">{{config.ControlProperty.RSValue}}</span>
      <el-tooltip
        v-if="isShowItemTip()"
        class="header-corner"
        popper-class="max-width-355 font-13 back-color-dark-9"
        :visible-arrow="false"
        :placement="getTooltipPlacement(config)"
        :hide-after="0"
        v-model="tipVisible"
      >
        <div slot="content">
          <div v-html="getItemTooltipContent(config)"></div>
        </div>
        <span @click.stop="handleTipClick">
          <img v-if="isItemInfoTip()" src="../assets/images/icon/real-color-info.png" alt="" />
          <img v-if="isItemWarningTip()" src="../assets/images/icon/real-color-warning.png" alt=""/>
          <img v-if="isItemQuestionTip()" src="../assets/images/icon/real-color-question.png" alt=""/>
        </span>
      </el-tooltip>
    </div>

    <div :class="getBoundClass(config,componentData)"
      v-else-if="config.ControlCode=='UcBoundField'&&!isHtmlEncode(config)&& !config.ControlProperty.Separator" class="bound bound-no inline-flex items-center" style="line-height: 1;"
      @click.stop="checkConfirm(config, handleSpecialFun, [$event, config, containerdata])"
      v-on="handleClientActions()" ref="commentItemRef">
    {{ detailData[keyfield] }}
        <el-tooltip
          v-if="isShowItemTip()"
          class="header-corner"
          popper-class="max-width-355 font-13 back-color-dark-9"
          :visible-arrow="false"
          :placement="getTooltipPlacement(config)"
          :hide-after="0"
          v-model="tipVisible"
        >
          <div slot="content">
            <div v-html="getItemTooltipContent()"></div>
          </div>
          <span @click.stop="handleTipClick">
            <img v-if="isItemInfoTip()" src="../assets/images/icon/real-color-info.png" alt="" />
            <img v-if="isItemWarningTip()" src="../assets/images/icon/real-color-warning.png" alt=""/>
            <img v-if="isItemQuestionTip()" src="../assets/images/icon/real-color-question.png" alt=""/>
          </span>
        </el-tooltip>
     <div class="expandAndClose" @click.stop="changeExpand" ref="opBtnCloRef" v-if="config.ControlProperty.IsOperateShowOneLine" style="display:none">
        <span v-if="isExpand&&isShowExpand"> 收起 </span>
      </div>
    </div>
    <div :class="getBoundClass(config,componentData)"
      v-else-if="config.ControlCode=='UcBoundField'&&!isHtmlEncode(config)&&config.ControlProperty.Separator" class="bound bound-no items-center"
      ref="commentItemRef">
      <div
        v-for="(linkText, index) in detailData[keyfield].split(
          config.ControlProperty.Separator
        )"
        :key="linkText"
         @click.stop="checkConfirm(config, handleSpecialFun, [$event, config, containerdata,'','',index,dialogConfig])"
        v-on="handleClientActions()"
        class="theme-color"
        style="margin-right: 10px;"
      >{{linkText}}</div>
        <el-tooltip
          v-if="isShowItemTip()"
          class="header-corner"
          popper-class="max-width-355 font-13 back-color-dark-9"
          :visible-arrow="false"
          :placement="getTooltipPlacement(config)"
          :hide-after="0"
          v-model="tipVisible"
        >
          <div slot="content">
            <div v-html="getItemTooltipContent()"></div>
          </div>
          <span @click.stop="handleTipClick">
            <img v-if="isItemInfoTip()" src="../assets/images/icon/real-color-info.png" alt="" />
            <img v-if="isItemWarningTip()" src="../assets/images/icon/real-color-warning.png" alt=""/>
            <img v-if="isItemQuestionTip()" src="../assets/images/icon/real-color-question.png" alt=""/>
          </span>
        </el-tooltip>
     <div class="expandAndClose" @click.stop="changeExpand" ref="opBtnCloRef" v-if="config.ControlProperty.IsOperateShowOneLine" style="display:none">
        <span v-if="isExpand&&isShowExpand"> 收起 </span>
      </div>
    </div>
     <span :class="activeClass()"
      v-else-if="config.ControlCode=='UcBoundField'&&isHtmlEncode(config)" class="bound bound-html"
      @click.stop="checkConfirm(config, handleSpecialFun, [$event, config, containerdata])"
      v-on="handleClientActions()"
      ref="commentItemRef"
      >

        <div v-html=" detailData[keyfield] "></div>
        <el-tooltip
          v-if="isShowItemTip()"
          class="header-corner"
          popper-class="max-width-355 font-13 back-color-dark-9"
          :visible-arrow="false"
          :placement="getTooltipPlacement(config)"
          :hide-after="0"
          v-model="tipVisible"
        >
          <div slot="content">
            <div v-html="getItemTooltipContent()"></div>
          </div>
          <span @click.stop="handleTipClick">
            <img v-if="isItemInfoTip()" src="../assets/images/icon/real-color-info.png" alt="" />
            <img v-if="isItemWarningTip()" src="../assets/images/icon/real-color-warning.png" alt=""/>
            <img v-if="isItemQuestionTip()" src="../assets/images/icon/real-color-question.png" alt=""/>
          </span>
        </el-tooltip>
    </span>

    <van-search
      v-if="config.ControlCode == 'UcSearch'"
      v-model="detailData[keyfield]"
      show-action
      placeholder="请输入搜索关键词"
      @blur="onSearch(config)"
      @search="onSearch(config)"
    >
      <template #action>
        <div @click="onSearch(config)">搜索</div>
      </template>
    </van-search>

    <div
      class="input-text-box"
      :class="[activeClass(config,containerdata), {'text-pr-32': config.ControlProperty.Icon || !config.ControlProperty.Icon && detailData[keyfield] && detailData[keyfield] !== ''}]"
      v-if="config.ControlCode == 'UcTextBox'"
    >
      <van-field
        :id="config.ControlProperty.ID+ '_' + config.ControlProperty.FnCode"
        v-model="detailData[keyfield]"
        :disabled="getDisabled(config)"
        :reuquired="getRequired(config)"
        :rule="config.ControlProperty.ruleType ? [erowConfig.validateRules[config.ControlProperty.ruleType]] : []"
        :rows="getTextRows(config)"
        autosize
        :maxlength="config.ControlProperty.MaxSize"
        :type="config.ControlProperty.type || (Number(config.ControlProperty.Rows) >= 1 ? 'textarea' : 'text')"
        @keydown="handleEnterFun($event, config)"
        :placeholder="getPlaceHolerByConfig(config)"
        @input="isHasEvent(config, 'change') && handleSpecialFun($event, config, detailData)"
        @click.stop="getDisabled(config) && checkConfirm(config, handleSpecialFun, [$event, config, containerdata])"
        v-on="handleClientActions()"
        :border="false"
      >
        <template slot='right-icon'>
          <img
            class='input-text-box-icon'
            v-if="config.ControlProperty.Icon"
            :src="getImgFileUrl({parentFilePath: 'icon', filename: config.ControlProperty.Icon, fileType: 'png'})"
            @click='runSpeicalFun(config.ControlProperty.iconClickAction)'
          />
          <van-icon name="close" v-show="!config.ControlProperty.Icon && detailData[keyfield] && detailData[keyfield] !== ''" @click.stop="clearText(keyfield,config)" />
        </template>
      </van-field>
      <div class="quick-reply-wrapper" v-if="config.pageMode === 'EDIT' &&textButtonContent.length>0&&!getDisabled(config)">
        <button class="quick-reply-button" v-for="item in textButtonContent" @click="fillTextBox">
          {{ item }}
        </button>
      </div>
    </div>

    <div
      class="input-text-box"
      :class="activeClass(config,containerdata)"
      v-if="config.ControlCode == 'UcKindEditor'"
    >
      <van-field
        v-if="config.pageMode == 'EDIT' || config.pageMode == 'ADD'"
        :id="config.ControlProperty.ID+ '_' + config.ControlProperty.FnCode"
        v-model="detailData[keyfield]"
        :disabled="getDisabled(config)"
        :reuquired="getRequired(config)"
        type="textarea"
        :rows="4"
        autosize
        :placeholder="getPlaceHolerByConfig(config)"
        @input="onTextBoxInput($event, config)"
        v-on="handleClientActions()"
        :border="false"
      />
      <div v-else v-html="detailData[keyfield]" class="bound-html" style="padding: 10px; width: 100%; box-sizing: border-box;"></div>
    </div>

    <form-date
      v-if="config.ControlCode == 'UcDatePicker'"
      :titleName="config.ControlProperty.RSValue"
      :disabled="getDisabled(config)"
      :reuquired="getRequired(config)"
      typeNumber="1"
      :value="detailData[keyfield]"
      :placeholder="getPlaceHolerByConfig(config)"
      :config="config"
      @changeDate="changeDate"
    ></form-date>

    <template v-if="config.ControlCode == 'UcDropDownList'">
      <form-multiple-select
        v-if="isMultiSelect(config)"
        :disabled="getDisabled(config)"
        :reuquired="getRequired(config)"
        :config="config"
        :value="detailData[keyfield]"
        :label="getPlaceHolerByConfig(config)"
        :placeholder="getPlaceHolerByConfig(config)"
        :columns="muiltiSelectDataList"
        @confirm="changeSelect"
        :isShowSearch="false"
        :isShowAll="true"
        popup_max_height="260px"
      ></form-multiple-select>

      <form-select
        v-else
        typeNumber="1"
        :disabled="getDisabled(config)"
        :reuquired="getRequired(config)"
        :config="config"
        :options="dataList"
        :value="detailData[keyfield]"
        :placeholder="getPlaceHolerByConfig(config)"
        @changeSelect="changeSelect"
      ></form-select>
    </template>
     <template v-if="config.ControlCode == 'UcDdlWFStepList'">
      <form-select
        :disabled="getDisabled(config)"
        :reuquired="getRequired(config)"
        :config="config"
        :options="dataList"
        :value="detailData[keyfield]"
        :placeholder="getPlaceHolerByConfig(config)"
        @changeSelect="changeSelect"
      ></form-select>
    </template>
     <uc-select  
        ref="UcSelect"
         v-if="config.ControlCode == 'UcSelect'"
        :controldata="dataList"
        v-model="detailData[keyfield]"
        :config="config"
        v-on="getEventHandlers(config,detailData)"
        :required="getRequired(config)"
        :disabled="getDisabled(config)"
        :placeholder="getPlaceHolerByConfig(config)"
        :label="getPlaceHolerByConfig(config)"
        :title="config.ControlProperty.RSValue" >
     </uc-select>

    <form-cascader
      v-if="config.ControlCode == 'UcComboTree'"
      :config="config"
      :disabled="getDisabled(config)"
      :required="getRequired(config)"
      :label="getPlaceHolerByConfig(config)"
      :placeholder="getPlaceHolerByConfig(config)"
      :value="detailData[keyfield]"
      @changeCascader="changeCascader"
    ></form-cascader>

    <form-tree
      v-if="config.ControlCode == 'UcFormTree'"
      :config="config"
      :disabled="getDisabled(config)"
      :required="getRequired(config)"
      :label="getPlaceHolerByConfig(config)"
      :placeholder="getPlaceHolerByConfig(config)"
      :value="detailData[keyfield]"
      @change="handleChangeFormTree"
    ></form-tree>

    <van-checkbox
      v-if="config.ControlCode == 'UcCheckBox'"
      v-model="detailData[keyfield]"
      shape="square"
      :disabled="getDisabled(config)"
      icon-size="14px"
      @click="handleClientActionsWidthParams('onchange', config, detailData, '', 'onchange')"
    ></van-checkbox>

    <checkbox-list
      v-if="config.ControlCode == 'UcCheckBoxList'"
      :disabled="getDisabled(config)"
      :config="config"
      :options="controldata[config.ControlProperty.ID]"
      :detailData="detailData"
      v-model="detailData[keyfield]"
      v-on="handleClientActions()"
    ></checkbox-list>

    <uc-gps-range-list
      v-if="config.ControlCode == 'UcGpsRangeList'"
      :disabled="getDisabled(config)"
      :config="config"
      :options="controldata[config.ControlProperty.ID]"
      :detailData="detailData"
      :containerdata="containerdata"
      v-model="detailData[keyfield]"
      v-on="handleClientActions()"
    ></uc-gps-range-list>

    <radio-button-list
      v-if="config.ControlCode == 'UcRadioButtonList'"
      :disabled="getDisabled(config)"
      :config="config"
      :options="controldata[config.ControlProperty.ID]"
      v-model="detailData[keyfield]"
      :detailData="detailData"
      v-on="handleClientActions()"
      @changeSelect="changeSelect"
    ></radio-button-list>

     <template
      v-if="
        config.ControlCode == 'UcButton' &&
        isShowOp(config) &&
        config.ControlProperty.OnClientClick === 'switchOpenAndClose'
      "
    >
      <span
        v-if="isCloseAllDetail"
        :class="activeClass(config, detailData)"
        type="info"
        round
        size="small"
        class="linkbtn"
        @click="
          checkConfirm(config, handleSpecialFun, [$event, config, detailData])
        "
        >展开</span
      >
      <span
        v-else
        :class="activeClass(config, detailData)"
        type="info"
        round
        size="small"
         class="linkbtn"
        @click="
          checkConfirm(config, handleSpecialFun, [$event, config, detailData])
        "
        >收起</span
      >
    </template>
   <div class="expandAndClose" @click.stop="changeExpand" ref="opBtnExRef" v-if="config.ControlProperty.IsOperateShowOneLine" style="display:none">
        <div v-if="!isExpand&&isShowExpand"> 展开 </div>
      </div>
    <van-button
      :class='activeClass(config, detailData)'
      @click="checkConfirm(config, handleSpecialFun, [$event, config, detailData])"
      v-if="config.ControlCode == 'UcButton' && isShowOp(config) && config.ControlProperty.OnClientClick != 'switchOpenAndClose'"
      type="info"
      round
      size="small"
      v-show='getVisible()'
    >
      {{ config.ControlProperty.DataField?detailData[config.ControlProperty.DataField]: config.ControlProperty.RSValue }}
    </van-button>

    <span
      v-if="
        config.ControlCode == 'UcHyperLinkField && isShowOp(config)'
      "
      @click="handleSpecialFun($event, config, detailData)"
      class="link"
    >
      {{
        config.ControlProperty.RSValue
      }}
    </span>
    <span
      v-if="
        config.ControlCode == 'UcHyperLink' && isShowOp(config)
      "
      @click="showTargetLayer(config, detailData)"
      class="link"
    >
      {{
        config.ControlProperty.RSValue
      }}
    </span>
    <div class='UcSensitiveField'   v-if="config.ControlCode == 'UcSensitiveField'">
      <div class="input-text-box">
        <van-field
          v-model="detailData[keyfield]"
          :disabled="getDisabled(config)"
          :reuquired="getRequired(config)"
          :label="config.RsValue"
          :placeholder="getPlaceHolerByConfig(config)"
        />
      </div>
      <img
        :src="getEye(config,containerdata)"
        v-show="getSensitiveImgShow(config)"
        alt=""
        @click.stop="getSensitiveInfo(config, containerdata, 'editConponent')"
      />
    </div>

    <uc-stepper
      v-if="config.ControlCode == 'UcStepperField'"
      :value="detailData[keyfield]"
      :config="config"
      :disabled="getDisabled(config)"
      :detailData="detailData"
      :RangeField="getRangeField(config)"
      @changeDate="changeStepper"
    ></uc-stepper>

    <uc-step-list
    v-if="config.ControlCode == 'UcStepList'"
    :config="config"
    :options="controldata[config.ControlProperty.ID]"
    :detailData="detailData"
    :value="detailData[keyfield]"
    ></uc-step-list>

    <uc-rate
      v-if="config.ControlCode == 'UcRateListField'"
      :value="detailData[keyfield]"
      :config="config"
      :disabled="getDisabled(config)"
      :detailData="detailData"
      :containerdata="containerdata"
    ></uc-rate>

    <uc-timer
      v-if="config.ControlCode == 'UcTimer'"
      :config="config"
      :class="activeClass(config)"
    >
    </uc-timer>

    <uc-answer-field
      v-if="config.ControlCode == 'UcAnswerField'"
      :config="config"
      :class="activeClass(config)"
      :detailData="detailData"
      :containerdata="containerdata"
    ></uc-answer-field>

    <uc-switch-field
      v-if="config.ControlCode == 'UcSwitchField'"
      :value="detailData[keyfield]"
      :config="config"
      :disabled="getDisabled(config)"
      :class="activeClass(config)"
      :detailData="detailData"
      :containerdata="containerdata"
      @changeSwitch="changeSwitch"
    ></uc-switch-field>

    <uc-week-calendar v-if="config.ControlCode == 'UcWeekCalendar'" :config="config"></uc-week-calendar>

    <file-upload
      v-if="config.ControlCode == 'UcFileUpload'"
      :config="config"
      :containerdata="containerdata"
      @update="updateData"
    >
    </file-upload>
      <div class="tag-wrapper" v-if="config.ControlCode === 'UcTagGroup'">
       <van-collapse v-model="activeNames">
        <van-collapse-item  :name=index v-for='(item, index) in tagGroups.types' :key="index" class='tag-group'>
        <template #title>
          <div class='tag-group-title'>{{item}}</div>
        </template>
          <div class="tag-wrapper">
          <div v-for='tag in tagGroups.tagList[index]'
          :key='tag.value'
          class="uc-edit-tag"
          :class="tag.selected ? 'uc-edit-tag-selected' : ''"
          @click=selectTag(tag)>
            {{tag.name}}
          </div>
          </div>
        </van-collapse-item>
      </van-collapse>
        </div>


    <div v-if="config.ControlCode === 'UcAmount'">
      <input
        :class="activeClass()"
        class="van-field__control"
        :id="config.ControlProperty.ID+ '_' + config.ControlProperty.FnCode"
        :disabled="getDisabled(config)"
        :reuquired="getRequired(config)"
        :data-field="keyfield"
        type="number"
        v-num-format="','"
      ></input>
    </div>
  </div>
`,
  props: {
    config: {
      type: Object,
      default: () => { },
    },
    containerdata: {
      type: Object,
      default: () => { },
    },
    controldata: {
      type: Object,
      default: () => { },
    },
    detailData: {
      type: Object,
      default: () => { },
    },
    keyfield: {
      type: String,
      default: "",
    },
    isCloseAllDetail: {
      default: false,
      type: Boolean,
    },
    fieldMap: {
      type: Object,
      default: () => { },
    },
    idMap: {
      type: Object,
      default: () => { },
    },
    dialogConfig: {
      type: Object,
      default: () => { },
    },
    isedit: {
      type: Boolean,
      default: () => false,
    },
    isincard: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      filterKey: "",
      mainKey: "",
      baseDataList: [],
      activeNames: [],
      tagGroups: {
        types: [],
        tagList: [],
      },
      isExpand: false,
      isShowExpand: false,
    };
  },
  created() {
    if (this.controldata && this.controldata[this.config.ControlProperty.ID]) {
      this.baseDataList = this.controldata[this.config.ControlProperty.ID].dataList;
    }
    if (this.detailData && this.detailData[this.config.ControlProperty.ID]) {
      this.baseDataList = this.detailData[this.config.ControlProperty.ID].dataList;
    }
    this.initTipHideEvent();
    eventEmitter.once("afterGetFormData", (res) => {
      if (this.$parent.config.ControlProperty.ID == res.controlID) {
        this.$nextTick(() => {
          this.initActionDropDownData();
        });
      }
    });
  },
  computed: {
    componentData() {
      let result = {};
      if (erowConfig.isObject(this.detailData)) {
        Object.keys(this.detailData).forEach((key) => {
          if(this.fieldMap[key]) {
            result[this.fieldMap[key]] = this.detailData[key];
          }
        });
      }
      return result;
    },
    dataList() {
      let result = [];
      if (this.detailData && erowConfig.hasProp(this.detailData[this.config.ControlProperty.ID], "dataList")) {
        result = this.detailData[this.config.ControlProperty.ID].dataList;
      } else if (this.controldata && erowConfig.hasProp(this.controldata[this.config.ControlProperty.ID], "dataList")) {
        result = this.controldata[this.config.ControlProperty.ID].dataList;
      }
      if (this.filterKey) {
        if (Array.isArray(result)) return result.filter((item) => item[this.mainKey] === this.filterKey);
      }
      return result;
    },
    muiltiSelectDataList() {
      return this.dataList.map((item) => {
        let obj = {};
        if (this.config.ControlProperty.DataTextField) {
          obj[this.config.ControlProperty.DataTextField] = item[this.config.ControlProperty.DataTextField];
        } else {
          obj.text = item.text;
        }
        if (this.config.ControlProperty.DataValueField) {
          obj[this.config.ControlProperty.DataValueField] = item[this.config.ControlProperty.DataValueField];
        } else {
          obj.value = item.value;
        }
        return obj;
      });
    },
    getRows() {
      return (item) => {
        var obj = item.ControlProperty;
        if (erowConfig.hasProp(obj, "Rows")) {
          if (parseInt(item.ControlProperty.Rows) > 1) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      };
    },
    isMergeCol() {
      return Array.isArray(this.config.children) && this.config.children && this.config.children.length > 0;
    },
    textButtonContent() {
      return (this.config.ControlProperty.textButtonContent && this.config.ControlProperty.textButtonContent.split(",")) || [];
    },
    TipTypeField() {
      const { config = {} } = this;
      const { TipTypeField, ControlProperty = {} } = config;
      const { TipTypeField: TipTypeFieldProxy } = ControlProperty;
      return TipTypeFieldProxy || TipTypeField;
    },
    TipContentField() {
      const { config = {} } = this;
      const { TipContentField, ControlProperty = {} } = config;
      const { TipContentField: TipContentFieldProxy } = ControlProperty;
      return TipContentFieldProxy || TipContentField;
    },
    TipPosition() {
      const { config = {} } = this;
      const { TipPosition, ControlProperty = {} } = config;
      const { TipPosition: TipPositionProxy } = ControlProperty;
      return TipPositionProxy || TipPosition;
    },
  },
  mounted() {
    if (this.config.ControlCode == "UcTagGroup") {
      let types = [];
      let tagList = [];
      this.dataList.forEach((item) => {
        let index = types.indexOf(item.type);
        if (index == -1) {
          types.push(item.type);
          tagList.push([item]);
        } else {
          tagList[index].push(item);
        }
      });
      this.activeNames = [];
      types.forEach((item, index) => {
        this.activeNames.push(index);
      });
      this.tagGroups = {
        types,
        tagList,
      };
      // 回显
      let Separator = "|";
      if (erowConfig.hasProp(this.config.ControlProperty, "Separator")) {
        Separator = this.config.ControlProperty.Separator;
      }
      if (this.detailData[this.keyfield]) {
        let initSelectd = this.detailData[this.keyfield].split(Separator);
        this.dataList.forEach((tag) => {
          if (initSelectd.includes(String(tag.value))) {
            this.$set(tag, "selected", true);
            Object.assign(this.dataList, tag);
          }
        });
      }
    }
    this.config.ControlProperty.IsOperateShowOneLine && this.checkOverflow();
  },
  beforeDestroy() {
    this.destoryTipHideEvent();
  },
  methods: {
    getTextRows(config) {
      return config.pageMode == "VIEW" ? 1 : Number(config.ControlProperty.Rows) || 1;
    },
    //UctextBox清除文本
    clearText(keyfield, config) {
      this.detailData[keyfield] = "";
      if (config.ControlProperty.keyEnterAction) {
        this.runSpeicalFun(config.ControlProperty.keyEnterAction, this.detailData);
      }
    },
    initActionDropDownData() {
      let _this = this;
      if (
        ["UcValueSet", "UcDropDownList", "UcComboTree", "UcCheckBox", "UcRadioButtonList", "UcCheckBoxList", "UcTextBox"].includes(
          this.config.ControlCode,
        ) &&
        erowConfig.isHasEvent(this.config, "change")
      ) {
        this.handleClientActionsWidthParams("onload", this.config, this.containerdata, "", "change");
      }
    },
    getBoundClass(config, containerdata) {
      // return this.activeClass(config, containerdata);
      // 与form中的editComponent 冲突，暂不启用
      return "";
    },
    /**
     * 是否显示展开关闭按钮(一行显示操作)
     */
    checkOverflow() {
      const viewCommentRef = this.$refs.viewCommentRef;
      viewCommentRef.style["width"] = "100%";
      viewCommentRef.style["height"] = "100%";
      const commentItemRef = this.$refs.commentItemRef;
      const opBtnExRef = this.$refs.opBtnExRef;

      if (viewCommentRef && commentItemRef) {
        const computedStyle = window.getComputedStyle(commentItemRef);
        const height = commentItemRef.clientHeight;
        const lineHeight = parseInt(computedStyle.lineHeight, 10);
        if (height > lineHeight) {
          this.isShowExpand = true;
        }
        if (viewCommentRef.offsetWidth && viewCommentRef.offsetWidth <= commentItemRef.offsetWidth) {
          commentItemRef.style.overflow = "hidden";
          commentItemRef.style["text-overflow"] = "ellipsis";
          commentItemRef.style["white-space"] = "nowrap";
          commentItemRef.style["display"] = "inline-block";
          commentItemRef.style["width"] = "calc(100% - 35px)";
          opBtnExRef.style.display = "inline-block";
          opBtnExRef.style["width"] = "30px";
        }
      }
    },
    /**
     * 点击展开与关闭操作
     */
    changeExpand() {
      const commentItemRef = this.$refs.commentItemRef;
      const opBtnExRef = this.$refs.opBtnExRef;
      const opBtnCloRef = this.$refs.opBtnCloRef;
      this.isExpand = !this.isExpand;
      if (this.isExpand) {
        commentItemRef.style["white-space"] = "inherit";
        commentItemRef.style["display"] = "inline-block";
        commentItemRef.style["width"] = "calc(100% - 35px)";
        opBtnCloRef.style["display"] = "inline-block";
        opBtnExRef.style["display"] = "none";
        opBtnCloRef.style["width"] = "30px";
        opBtnExRef.style["width"] = "30px";
      } else {
        opBtnCloRef.style["display"] = "none";
        opBtnExRef.style["display"] = "inline-block";
        commentItemRef.style["white-space"] = "nowrap";
      }
    },
    imageFieldSrc() {
      // 获取 UcImageField 控件的图片地址
      if (this.config.ControlProperty.SourceType == "dynamic") {
        let DataImageUrlFormatString = this.config.ControlProperty.DataImageUrlFormatString
          ? JSON.parse(this.config.ControlProperty.DataImageUrlFormatString)
          : [];
        let params = {
          fnCode: this.config.fnCode,
          fileGuid: this.containerdata[DataImageUrlFormatString.fileGuidKey],
          instanceGuid: this.containerdata[DataImageUrlFormatString.instanceGuidKey],
        };
        return this.getDownLoadUrl(params, this);
      } else if (this.config.ControlProperty.DataField) {
        return this.containerdata[this.config.ControlProperty.DataField];
      }
      return this.config.ControlProperty.ImageUrl || this.config.ControlProperty.DefaultImageUrl;
    },
    getPlaceHolerByConfig(config) {
      if (!this.config._isLoadedData) return "";

      if ((config.pageMode == "EDIT" || config.pageMode == "ADD" || this.isedit) && !this.getDisabled(config)) {
        if (config.PlaceHodler || config.ControlProperty.PlaceHolderRSCode) {
          if (config.PlaceHodler == "white_space" || config.ControlProperty.PlaceHolderRSCode == "white_space") {
            //有值且为white_space
            return null;
          } else {
            //有值且不为white_space
            return config.PlaceHodler || config.ControlProperty.PlaceHolderRSCode;
          }
        } else if (this.getDisabled(config)) {
          return "";
        } else if (!this.getDisabled(config)) {
          //无值默认
          if (config.ControlCode == "UcTextBox") {
            return "请输入" + config.ControlProperty.RSValue;
          } else {
            return "请选择" + config.ControlProperty.RSValue;
          }
        }
      } //不是add或edit,直接null
      return null; // return config.pageMode == "EDIT" || config.pageMode == "ADD" ? config.PlaceHodler || config.ControlProperty.PlaceHolderRSCode : "";
    },
    changeDate(val, num, flag) {
      if (num == 1) {
        this.detailData[this.keyfield] = val;
      }
      //判断控件联动
      let AutoPostBackActionObj = this.getActionObj(this.config);
      if (erowConfig.hasProp(AutoPostBackActionObj, "ClientAction")) {
        erowConfig.runClientAtction(
          {
            clientAction: AutoPostBackActionObj.ClientAction,
            configItem: this.config,
            val,
            flag,
          },
          this.$parent,
        );
      }
      if (erowConfig.isHasEvent(this.config, "change")) {
        this.$nextTick(() => {
          this.handleClientActionsWidthParams(flag, this.config, this.containerdata, "", "change");
        });
      }
    },
    changeSwitch(val) {
      this.detailData[this.keyfield] = val;
    },
    changeStepper(val) {
      this.detailData[this.keyfield] = val;
    },
    changeSelect(val, num, flag) {
      //控件ID跟field转化
      console.log("changeSelect", val);
      if (this.keyfield.startsWith("C")) {
        let realField = this.fieldMap[this.keyfield];
        this.containerdata[realField] = val.value;
      } else this.containerdata[this.keyfield] = val.value;
      this.detailData[this.keyfield] = val.value;
      if (this.config.__sync_data) {
        this.detailData[this.config.__sync_data] = val.text;
      }

      //判断控件联动
      let AutoPostBackActionObj = this.getActionObj(this.config);
      if (erowConfig.hasProp(AutoPostBackActionObj, "ClientAction")) {
        erowConfig.runClientAtction(
          {
            clientAction: AutoPostBackActionObj.ClientAction,
            configItem: this.config,
            val: val.value,
            flag,
          },
          this.$parent,
        );
      }
      if (erowConfig.isHasEvent(this.config, "change")) {
        this.$nextTick(() => {
          this.handleClientActionsWidthParams(flag, this.config, this.containerdata, "", "change");
        });
      }
    },
    changeCascader(val) {
      this.containerdata[this.keyfield] = val.value;
      this.detailData[this.keyfield] = val.value;
      if (this.config.__sync_data) {
        this.detailData[this.config.__sync_data] = val.text;
      }
      if (erowConfig.isHasEvent(this.config, "change")) {
        this.handleSpecialFun({}, this.config, this.containerdata, "", "change");
      }
    },
    handleChangeFormTree(val) {
      this.containerdata[this.keyfield] = val.value;
      this.detailData[this.keyfield] = val.value;
      if (this.config.__sync_data) {
        this.detailData[this.config.__sync_data] = val.text;
      }
      if (erowConfig.isHasEvent(this.config, "change")) {
        //事件都配置在了clientactions
        this.handleClientActionsWidthParams("onchange", this.config, this.containerdata, "", "onchange");
        // this.handleSpecialFun({}, this.config, this.containerdata, "", "change");
      }
    },
    handleClick(event, params) {
      let fun = erowConfig.getEventFun(params, "click");
      erowSpecial[fun](params, this);
    },
    contaierClass(configItem, params) {
      let temp = this.activeClass(configItem, params);
      if (this.isMergeCol) {
        temp += " ";
        temp += "just-aroud-flex";
      }
      return temp;
    },
    onSearch(configItem) {
      if (this.isHasEvent(configItem, "click")) {
        let funName = this.getEventFun(configItem, "click");
        erowSpecial[funName](this.$parent.detailData[configItem.ControlProperty.ID], this);
      }
    },
    isMultiSelect(item) {
      if (erowConfig.hasProp(item.ControlProperty, "SelectedMulti")) {
        return item.ControlProperty.SelectedMulti.toString() == "true" ? true : false;
      } else {
        return false;
      }
    },
    getRangeField(config) {
      let rangeField = null;
      if (erowConfig.hasProp(config.ControlProperty, "RangeField")) {
        rangeField = this.containerdata[config.ControlProperty.RangeField];
      }
      return rangeField;
    },
    getTextAlign(item) {
      if (item.ControlProperty.TextAlign) {
        return item.ControlProperty.TextAlign;
      }
      let textAlign = "";
      if (erowConfig.hasProp(item.ControlProperty, "Position")) {
        textAlign = item.ControlProperty.Position;
      } else if (erowConfig.hasProp(item.ControlProperty, "TextAlign")) {
        textAlign = item.ControlProperty.TextAlign;
      }
      if (textAlign) textAlign = textAlign.toLocaleLowerCase();
      return textAlign;
    },
    fillTextBox(e) {
      let parentId = this.keyfield.substring(0, this.keyfield.indexOf("_"));
      pageContext[parentId].detailData[this.keyfield] = e.target.innerText;
    },
    updateData() {
      eventEmitter.emit("afterUpload", {});
    },
    selectTag(tag) {
      if (erowConfig.hasProp(tag, "selected")) {
        tag.selected = !tag.selected;
      } else {
        this.$set(tag, "selected", true);
      }
      Object.assign(this.dataList, tag);
      let Separator = "|";
      if (erowConfig.hasProp(this.config.ControlProperty, "Separator")) {
        Separator = this.config.ControlProperty.Separator;
      }
      this.detailData[this.keyfield] = this.dataList
        .filter((item) => item.selected)
        .map((item) => item.value)
        .join(Separator);
    },
  },
};
