var UcSelect = {
  name: "UcSelect",
  mixins: [commonMinxin],
  template: `
  <div class="uc-select" :style="layoutStyle">
    <!-- checkboxList形式 -->
    <template v-if="ViewType === viewTypeEnum.checkboxList">
      <checkbox-list
       :config="config"
       :value="internalValue"
      :options="{dataList:optionData}"
      @input="handleChange"
      :isinselect="true"
      v-bind="mergedAttrs"
    ></checkbox-list>
    </template>

    <!-- radiolist 形式 -->
    <template v-else-if="ViewType === viewTypeEnum.radioList">
     <radio-button-list
      :config="config"
      :options="{dataList:optionData}"
      :value="internalValue"
      @change="changeSelect"
      :isinselect="true"
      v-bind="mergedAttrs"
    ></radio-button-list>
    </template>
    
    <!-- 级联下拉模式 -->
     <select-cascader
      v-else-if="ViewType === viewTypeEnum.cascader"
      :config="config"
       v-bind="mergedAttrs"
      :value="internalValue"
      :options="optionData"
      :initdata="controldata"
      @change="changeSelect"
    ></select-cascader>


    <!--树形下拉  -->
     <form-tree
      v-else-if="ViewType === viewTypeEnum.selectTree"
      :config="config"
       v-bind="mergedAttrs"
      :value="internalValue"
      :options="optionData"
      :initdata="controldata"
      @change="changeSelect"
    ></form-tree>

    <!-- 常规下拉模式 -->
    <template v-else>
      <form-multiple-select
         :config="config"
        v-if="isMultiSelect"
        v-bind="mergedAttrs"
        :value="internalValue"
        :label="getPlaceHolerByConfig(config)"
        :placeholder="getPlaceHolerByConfig(config)"
        :columns="optionData"
        @confirm="changeSelect"
        :isShowSearch="false"
        :isShowAll="true"
        popup_max_height="260px"
      ></form-multiple-select>

      <form-select
        v-else
        typeNumber="1"
        v-bind="mergedAttrs"
        :options="optionData"
        :value="internalValue"
        :config="config"
        :placeholder="getPlaceHolerByConfig(config)"
        @changeSelect="changeSelect"
      ></form-select>
    </template>
    
  </div>
    `,
  props: {
    // 核心属性
    value: [String, Number, Array, Object],
    config: {
      type: Object,
      default: () => {},
    },
    controldata: {
      type: [Object, Array],
      default: () => {},
    },
  },
  components: {
    "form-select": FormSelect,
    "form-multiple-select": FormMultipleSelect,
    "form-tree": FormTree,
    "select-cascader": SelectCascader,
    "checkbox-list": CheckboxList,
    "radio-button-list": RadioButtonList,
  },
  data() {
    return {
      DataField: "",
      DataTextField: "",
      DataValueField: "",
      ViewType: "",
      SelectedMulti: "",
      CssClass: "",
      AutoPostAction: "",

      // 兼容属性
      IsInsertItem: "", //select 专用是否允许为空
      AllowCreate: "", //select 允许创建
      isHorizontal: "", //radio 和checkbox 专用
      RadioType: "", //radioType 专用
      isCollapseTags: "true", //树形式专用
      TreeNodeField: "", //树结构的id和pid
      IsAllowSelectParent: "", //是否允许选父级
      // 状态控制
      IsRequired: "",
      IsReadOnlyWhenAdd: "",
      IsReadOnlyWhenUpdate: "",
      pageMode: "VIEW",

      //----------------------------

      loading: false,
      dropdownVisible: false,
      cachedData: null,
      internalValue: "",
      viewTypeEnum: Object.freeze({
        checkboxList: "checkboxList",
        radioList: "radioList",
        cascader: "cascader",
        selectTree: "selectTree",
        select: "select",
      }),
    };
  },
  created() {
    let temp = erowConfig.deepClone(this.config.ControlProperty);

    this.assignData(this, temp); //从config中取对应的值给属性赋值
    this.internalValue = erowConfig.deepClone(this.value);
  },
  computed: {
    placeholder() {
      return this.$attrs.disabled || this.pageMode == "VIEW" ? "" : "请选择";
    },
    mergedAttrs() {
      return {
        ...this.$attrs,
      };
    },
    eventObj() {
      debugger;
      let ClientActions = this.config?.ControlProperty?.ClientActions;
      let AutoPostBackAction = this.config?.ControlProperty?.AutoPostBackAction;
      let defautlFun = "selectChange";
      let result = {};
      if (AutoPostBackAction) {
        result["change"] = defautlFun;
      }
      if (ClientActions) {
        result = JSON.parse(ClientActions);
      }
      return result;
    },
    isMultiSelect() {
      return this.SelectedMulti && this.SelectedMulti.toLowerCase() == "true" ? true : false;
    },
    optionData() {
      let _this = this;
      if (this.controldata) {
        let dropListData = erowConfig.deepClone(this.controldata);
        let treeType = ["cascader", "selectTree"];
        if (treeType.includes(this.ViewType) && dropListData) {
          let [idKey, pidKey] = this.TreeNodeField.split(",");
          let result = this.handleTree(dropListData, idKey, pidKey);
          return result;
        } else {
          if (dropListData && dropListData.length > 100) {
            let tempArr = dropListData.slice(0, 100);
            let temp = dropListData.find((item) => {
              return item[_this.DataValueField] == _this.value;
            });
            if (temp) {
              let index = tempArr.findIndex((item) => {
                return item[_this.DataValueField] == temp[_this.DataValueField];
              });
              if (index == -1) {
                tempArr.push(temp);
              }
            }
            tempArr.forEach((item) => {
              item[_this.DataValueField] = String(item[_this.DataValueField]);
            });
            return tempArr;
          } else {
            dropListData &&
              dropListData.forEach((item) => {
                return (item[_this.DataValueField] = String(item[_this.DataValueField]));
              });
            return dropListData;
          }
        }
      } else {
        return [];
      }
    },

    treeProps() {
      let tempArr = this.TreeNodeField.split(",");
      return {
        label: tempArr.length > 2 ? tempArr[2] : "menu_name", // 显示文本字段
        value: tempArr[0], // 值字段
        children: "children", // 子节点字段
      };
    },

    layoutStyle() {
      return {
        display: this.isHorizontal ? "inline-flex" : "block",
        flexDirection: this.isHorizontal === true ? "row" : "column",
      };
    },
  },

  methods: {
    changeSelect(val, num, flag) {
      //控件ID跟field转化

      this.$emit("change", val, num, flag);
    },
    assignData(context, sourceObj) {
      Object.keys(sourceObj).forEach((key) => {
        if (context.$data.hasOwnProperty(key)) {
          context[key] = sourceObj[key];
        }
      });
    },
    getAllowCreate() {
      return this.AllowCreate.toLowerCase() == "true" ? true : false;
    },
    getSelctLayerClass() {
      let className = this.CssClass || this.config.ControlProperty?.ClientClass;
      return className ? className + "-select-layer-bg" : "";
    },
    getTitle(value) {
      if ((this.$attrs.disabled || this.pageMode == "VIEW") && value) {
        return value;
      }
    },
    getPropObj() {
      let getCheckkStrict = () => {
        return this.IsAllowSelectParent.toString().toLowerCase() == "true" ? true : false;
      };
      let value = this.DataValueField;
      let label = this.DataTextField;
      return {
        value,
        label,
        emitPath: false,
        checkStrictly: getCheckkStrict(),
        multiple: this.isMultiSelect,
      };
    },
    handleItemChange(val) {
      if (this.hasProp(this.eventObj, "item-change")) {
        this.$emit("item-change", val); //使用时传入的change 事件
      }
    },
    handleChange(params) {
      this.internalValue = params;
      this.$emit("input", this.internalValue); //v-model
      if (erowConfig.hasProp(this.eventObj, "change")) {
        this.$emit("change", this.internalValue); //使用时传入的change 事件
      }
    },
    formatText(item) {
      if (this.DataTextField && item) {
        return item[this.DataTextField];
      } else {
        console.log("检查配置");
        return "";
      }
    },
  },
  watch: {
    value: {
      handler(val) {
        this.internalValue = erowConfig.deepClone(this.value);
      },
      immediate: true,
    },
  },
};
