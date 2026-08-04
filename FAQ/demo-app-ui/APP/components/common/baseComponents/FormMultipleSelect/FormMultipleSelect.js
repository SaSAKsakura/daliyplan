var FormMultipleSelect = {
  template: `
  <div>
    <div class="input-text-box text-pr-32">
      <van-field
        :disabled="disabled"
        :reuquired="reuquired"
        :placeholder="placeholder"
        readonly
        clickable
        name="picker"
        right-icon="arrow-down"
        :value="showText"
        @click="showPopu()"
      />
    </div>

    <van-popup v-model="show" position="bottom" round get-container="body">
      <div class="multi-select-head">
        <div class="multi-select-head-left"></div>
        <div class="van-ellipsis van-picker__title multi-select-head-title">
          {{ label }}
          <span v-if="max">(最多选{{ max }}个)</span>
        </div>
        <div
          v-if="!max && isShowAll && columnsData.length > 0"
          @click="toggleAll"
          class="multi-select-head-right"
          :class="checkedAll ? 'chekced' : ''"
        ><span>{{ checkedAll ? '取消全选' : '全部勾选' }}</span></div>
      </div>
      <div class="checkbox-con multi-select-body">
        <van-field
          v-model="searchVal"
          placeholder="搜索"
          @input="search"
          v-if="isShowSearch"
          input-align="left"
        />

        <van-checkbox-group
          :max="max"
          v-model="checkboxValue"
          @change="change"
          ref="checkboxGroup"
          :style="{
            'max-height': popup_max_height,
            'overflow-y': 'auto'
          }"
        >
          <van-cell-group>
            <van-cell
              v-for="(item, index) in realOptions"
              clickable
              :key="item.value"
              :title="item.text"
              @click="toggle(index, item)"
            >
              <template #right-icon>
                <van-checkbox :name="item.value" shape="square" ref="checkboxes" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-checkbox-group>
      </div>

      <div class="multi-select-foot">
        <van-button
          @click="cancel"
          type="info"
          round
          size="small"
          class="white-button-erow"
        >取消</van-button>
        <van-button
          @click="onConfirm"
          type="info"
          round
          size="small"
        >确认</van-button>
      </div>
    </van-popup>
  </div>
  `,
  name: "FormMultipleSelect",
  props: {
    columns: {
      type: Array,
      default: function () {
        return [];
      },
    },
    isShowSearch: {
      // 是否显示搜索框
      type: Boolean,
      default: false,
    },
    isShowAll: {
      // 是否显示全选
      type: Boolean,
      default: true,
    },
    max: {
      // 最大可选
      type: [Number, String],
      default: 0,
    },
    popup_max_height: {
      // 弹窗框最大高度
      type: String,
      default: "300px",
    },
    disabled: {
      type: Boolean,
      default: true,
    },
    reuquired: {
      type: String,
      default: "",
    },
    config: {
      type: Object,
      default: () => {},
    },
    value: {
      type: [Number, String],
      default: "",
    },
    label: {
      type: String,
      default: "请选择",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      show: false,
      searchVal: "",
      columnsData: this.columns,
      checkboxValue: [],
      checkedAll: false,
      resultValue: [],
      showText: "",
      valueSeparator:
        this.config.Separator ||
        this.config.ControlProperty.Separator ||
        this.config.SelectedValueSeparator ||
        this.config.ControlProperty.SelectedValueSeparator ||
        ",",
      textSeparator:
        this.config.Separator ||
        this.config.ControlProperty.Separator ||
        this.config.SelectedTextSeparator ||
        this.config.ControlProperty.SelectedTextSeparator ||
        ",",
    };
  },
  computed: {
    DataTextField() {
      return this.config.ControlProperty.DataTextField || "text";
    },
    DataValueField() {
      return this.config.ControlProperty.DataValueField || "value";
    },
    realOptions() {
      const temp = [];
      if (this.config.ControlProperty.IsInsertItem && this.config.ControlProperty.IsInsertItem.toUpperCase() == "TRUE") {
       let obj={};
       obj[this.DataTextField]="";
       obj[this.DataValueField]=""
      temp.push(obj);
      }
      this.columnsData.forEach((item) => {
        temp.push({
          text: item[this.DataTextField],
          value: item[this.DataValueField],
        });
      });
      return temp;
    },
  },
  mounted() {
    let vsp = this.config.SelectedValueSeparator || this.config.ControlProperty.SelectedValueSeparator;
    let tsp = this.config.SelectedTextSeparator || this.config.ControlProperty.SelectedTextSeparator;
    if (vsp) {
      this.valueSeparator = vsp;
    }
    if (tsp) {
      this.textSeparator = tsp;
    }

    let sp = this.config.Separator || this.config.ControlProperty.Separator;
    if (sp) {
      this.valueSeparator = sp;
      this.textSeparator = sp;
    }
  },
  methods: {
    handleText(){
      let val=this.value;
        let ids;
          if (!val) {
            ids = [];
          } else {
            let type='string';
            if(this.columns.length){
              type=typeof(this.columns[0][this.DataValueField])
            }
            ids = (val + "").split(this.valueSeparator).map((item) => {
              console.log(isNaN(item));
              return type=='number'?(parseInt(item)||0):item
            });
          }
          let text = [];
          let idMap = new Set(ids);
          for (let item of this.columns) {
            if (idMap.has(item[this.DataValueField])) {
              text.push(item[this.DataTextField]);
            }
          }

          this.showText = text.join(this.textSeparator);
          this.checkboxValue = ids;
          this.resultValue = ids;
    },
    search(val) {
      if (val) {
        this.columnsData = this.columnsData.filter((item) => {
          return item.text.indexOf(val) > -1;
        });
      } else {
        this.columnsData = JSON.parse(JSON.stringify(this.columns));
      }
    },
    getData(val) {
      const res = this.columnsData.filter((item) => {
        return val.indexOf(item[this.DataValueField]) > -1;
      });
      return res;
    },
    onConfirm() {
      let idsMap = new Set(this.checkboxValue);
      let value = [];
      let text = [];
      for (let item of this.columnsData) {
        if (idsMap.has(item[this.DataValueField])) {
          value.push(item[this.DataValueField]);
          text.push(item[this.DataTextField]);
        }
      }

      this.show = !this.show;
      this.showText = text.join(this.textSeparator);
      this.$emit("confirm", {
        value: value.join(this.valueSeparator),
        text: text.join(this.textSeparator),
      });
    },
    change(val) {
      this.$emit("change", val);
    },
    cancel() {
      this.show = !this.show;
      this.$emit("cancel");
    },
    toggle(index, item) {
      this.$emit("clickItem", item);
      this.$refs.checkboxes[index].toggle();
    },
    toggleAll(all) {
      // 全选
      this.checkedAll = !this.checkedAll;
      this.$refs.checkboxGroup.toggleAll(this.checkedAll);
    },
    showPopu() {
      if (this.disabled) {
        return false;
      } else {
        this.columnsData = JSON.parse(JSON.stringify(this.columns));
        this.show = !this.show;
      }
    },
  },
  watch: {
    columns(val){
      this.handleText();
    },
    selectValue(newVal) {
      this.resultValue = newVal;
    },
    resultValue(val) {
      this.searchVal = "";
      this.columnsData = JSON.parse(JSON.stringify(this.columns));
      this.$emit("input", val);
    },
    checkboxValue: {
      handler(val) {
        if (val.length && val.length === this.realOptions.length) {
          this.checkedAll = true;
        } else {
          this.checkedAll = false;
        }
      },
      immediate: true,
    },
    value: {
      handler(val) {
        if (this.config.pageMode === "VIEW") {
          this.showText = val;
        } else {
          this.handleText();
        }
      },
      immediate: true,
    },
  },
};
