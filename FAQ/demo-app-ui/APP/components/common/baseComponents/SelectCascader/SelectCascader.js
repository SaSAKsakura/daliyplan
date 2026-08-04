var SelectCascader = {
  // UcCombotree
  template: `
  <div class="UcCombotree" :class="multiple ? 'UcCombotree-multiple' : ''">
    <div class="input-text-box">
      <van-field
        readonly
        clickable
        :reuquired="required"
        :value="showText"
        :disabled="disabled"
        :rules="rules"
        :placeholder="placeholder"
        @click="showPopu()"
        right-icon="arrow-down"
      />
    </div>

    <van-popup v-model="cascadershow" round position="bottom">
      <van-checkbox-group
        v-model="selections"
        ref="checkboxGroup"
      >
        <van-cascader
          v-model="cascaderValue"
          :title="label"
          :closeable="false"
          :options="datatree"
          @finish="onFinish"
          active-color="#1989fa"
          :field-names="fieldNames"
        >
          <template #title>
            <div>{{ label }}</div>
          </template>
          <template #option="item">
          <div class="cascader-item" @click="itemClick($event, item)">
              <!-- 可以多选 -->
              <div v-if="multiple" @click="checkClick($event, item)">
                <!-- 只允许子节点多选 -->
                <template v-if="!isAllowSelectParent">
                  <!-- 无子结点，可以选择 -->
                  <template v-if="!isHasChildren(item)">
                    <van-checkbox :name="item.option" shape="square">
                      {{ item.option[fieldNames.text] }}
                    </van-checkbox>
                  </template>

                  <!-- 有子节点，不可选择 -->
                  <template v-else>
                    <span style="margin-left: 28px;">{{ item.option[fieldNames.text] }}</span>
                  </template>
                </template>

                <!-- 都可选 -->
                <template v-else>
                  <van-checkbox @click="multiCheck(item)" :name="item.option[idKey]" shape="square">
                    {{ item.option[fieldNames.text] }}
                  </van-checkbox>
                </template>
              </div>

              <!-- 单选 -->
              <div v-else>
                <span>{{ item.option[fieldNames.text] }}</span>
              </div>

              <!-- 右侧图标 -->
              <div
                v-if="item.option.children && item.option.children.length > 0"
                class="cascader-has-children-icon"
              >
                <van-icon name="arrow" />
              </div>
            </div>
          </template>
        </van-cascader>
      </van-checkbox-group>

      <div v-if="multiple" class="hr"></div>

      <div v-if="multiple" class="combotree-select-foot">
        <van-button
          @click="onCancel"
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
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: true,
    },
    required: {
      type: String,
      default: true,
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
    rules: {
      // 规则
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  computed: {
    fieldNames() {
      // prop对应的字段
      let valueKey = this.valueKey;
      let textKey = this.textKey;
      return {
        text: textKey,
        value: valueKey,
        children: "children",
      };
    },
    valueKey() {
      return this.config.ControlProperty.DataValueField ? this.config.ControlProperty.DataValueField.toLowerCase() : this.idKey;
    },
    textKey() {
      let field = "name";
      let ControlProperty = this.config.ControlProperty;
      if (ControlProperty.NodeName) {
        field = ControlProperty.NodeName.toLowerCase();
      } else if (erowConfig.hasProp(ControlProperty, "TreeNodeField")) {
        field = ControlProperty.TreeNodeField ? ControlProperty.TreeNodeField.split(",")[2] : "name";
      }
      return field;
    },
    multiple() {
      // 是否是多选
      if (erowConfig.hasProp(this.config.ControlProperty, "SelectedMulti")) {
        let flag = this.config.ControlProperty.SelectedMulti.toLowerCase() == "true";
        return flag;
      } else {
        return false;
      }
    },
    isAllowSelectParent() {
      // 是否只允许子节点多选
      if (erowConfig.hasProp(this.config.ControlProperty, "IsAllowSelectParent")) {
        let flag = this.config.ControlProperty.IsAllowSelectParent.toLowerCase() == "true";
        return flag;
      } else {
        return true;
      }
    },
    showText() {
      // 界面展示出来的值
      console.log("showText");
      if (this.multiple) {
        // 多选
        if (this.config.pageMode === "VIEW") {
          return this.value;
        } else {
          let values = new Set(this.selections);
          let texts = [];
          if (this.datalist && values) {
            this.datalist.forEach((item) => {
              let key = item[this.fieldNames.value] + "";
              if (values.has(key)) {
                texts.push(item[this.fieldNames.text]);
              }
            });
            return texts.join("|");
          }
        }
      } else {
        // 单选
        if (this.config.pageMode === "VIEW") {
          return this.value;
        } else {
          if (this.datalist && this.value) {
            let currnt = this.datalist.filter((item) => {
              return item[this.fieldNames.value] === this.selections;
            })[0];
            return currnt[this.fieldNames.text];
          }
        }
      }
    },
    idKey() {
      // 节点id对应的的key，一般为id
      if (erowConfig.hasProp(this.config.ControlProperty, "IDKey")) {
        return this.config.ControlProperty.IDKey ? this.config.ControlProperty.IDKey.toLowerCase() : "id";
      } else if (erowConfig.hasProp(this.config.ControlProperty, "TreeNodeField")) {
        return this.config.ControlProperty.TreeNodeField ? this.config.ControlProperty.TreeNodeField.split(",")[0] : "id";
      } else {
        return "id";
      }
    },
    pidKey() {
      if (erowConfig.hasProp(this.config.ControlProperty, "PIDKey")) {
        return this.config.ControlProperty.PIDKey ? this.config.ControlProperty.PIDKey.toLowerCase() : "pid";
      } else if (erowConfig.hasProp(this.config.ControlProperty, "TreeNodeField")) {
        return this.config.ControlProperty.TreeNodeField ? this.config.ControlProperty.TreeNodeField.split(",")[1] : "pid";
      } else {
        return "pid";
      }
    },
    datalist() {
      if (erowConfig.hasProp(this.config.ControlProperty, "initData")) {
        return this.config.ControlProperty.initData;
      } else if (this.$attrs.initdata) {
        return this.$attrs.initdata;
      } else {
        return [];
      }
    },
    datatree() {
      if (erowConfig.hasProp(this.config.ControlProperty, "dataArr")) {
        return this.config.ControlProperty.dataArr;
      } else if (this.$attrs.options) {
        return this.$attrs.options;
      } else {
        return [];
      }
    },
  },
  data() {
    return {
      cascadershow: false,
      selections: [],
      cascaderValue: "",
    };
  },
  created() {
    this.syncValue(this.value);
  },
  methods: {
    syncValue(val) {
      if (this.multiple) {
        if (Array.isArray(val)) {
          this.selections = erowConfig.deepClone(val);
        }
        if (typeof val == "number") {
          let temp = val + "";
          this.selections = temp.split("|");
        }
        if (typeof val == "string") {
          this.selections = val.split("|");
        }
      } else {
        this.selections = val;
      }
    },
    isLeafNode(item) {
      // 判断是否为叶子节点
      if (!item.option.children || item.option.children.length === 0) {
        return true;
      }
      return false;
    },
    onFinish(args) {
      console.log("onfinish", args.selectedOptions);
      // 单选点击叶子节点即完成
      if (this.multiple) {
      } else {
        let select = args.selectedOptions;

        select = select[select.length - 1];
        this.$emit("changeCascader", {
          value: select[this.fieldNames.value],
          text: select[this.fieldNames.text],
        });
        this.cascadershow = false;
      }
    },
    showPopu() {
      // 点击打开popup
      this.cascadershow = true;
    },
    itemClick(e, item) {
      // 多选是，点击无子节点的项，选中该选项
      if (!this.multiple) {
        return;
      }
      if (this.isLeafNode(item)) {
        // 无子结点
        let hasNode = this.selections.findIndex((id) => id == item.option[this.idKey]);
        if (hasNode > -1) {
          this.selections.splice(hasNode, 1);
          setTimeout(() => {
            this.cancelCheckAllParent(item.option[this.pidKey]);
          }, 100);
        } else {
          this.selections.push(item.option[this.idKey]);
          setTimeout(() => {
            this.checkAllParent(item.option[this.pidKey]);
          }, 100);
        }
      }
    },
    multiCheck(item) {
      // checkbox勾选
      setTimeout(() => {
        let hasNode = this.selections.findIndex((id) => id == item.option[this.idKey]);
        if (hasNode > -1) {
          this.checkAllParent(item.option[this.pidKey]);
        } else {
          this.cancelCheckAllParent(item.option[this.pidKey]);
        }
        if (!this.isLeafNode(item)) {
          this.checkAllChildren(item.option.children, hasNode === -1);
        }
      }, 100);
    },
    checkAllChildren(children, ischeck) {
      // 批量勾选/取消勾选所有子节点
      for (let item of children) {
        let hasNode = this.selections.findIndex((id) => id == item[this.idKey]);
        if (hasNode === -1 && !ischeck) {
          this.selections.push(item[this.idKey]);
        }
        if (hasNode > -1 && ischeck) {
          this.selections.splice(hasNode, 1);
        }
        if (item.children) {
          this.checkAllChildren(item.children, ischeck);
        }
      }
    },
    cancelCheckAllParent(parent_id) {
      let selections = new Set(this.selections);
      let len1 = 0,
        len2 = 0;
      for (let item of this.datalist) {
        if (item[this.pidKey] === parent_id) {
          len1++;
          if (!selections.has(item[this.idKey])) {
            len2++;
          }
        }
      }
      if (len1 === len2) {
        for (let i = 0; i < this.datalist.length; i++) {
          if (this.datalist[i][this.idKey] === parent_id) {
            this.selections.splice(
              this.selections.findIndex((item) => item === this.datalist[i][this.idKey]),
              1
            );
            this.cancelCheckAllParent(this.datalist[i][this.pidKey]);
            break;
          }
        }
      }
    },
    checkAllParent(parent_id) {
      let selections = new Set(this.selections);
      let len1 = 0,
        len2 = 0;
      for (let item of this.datalist) {
        if (item[this.pidKey] === parent_id) {
          len1++;
          if (selections.has(item[this.idKey])) {
            len2++;
          }
        }
      }
      if (len1 === len2) {
        this.selections.push(parent_id);
        let temp = this.datalist.filter((item) => item[this.idKey] === parent_id)[0];
        if (temp) this.checkAllParent(temp[this.pidKey]);
      }
    },
    checkClick(e, item) {
      e.stopPropagation();
    },
    onCancel() {
      this.cascadershow = false;
      // 还原
      this.selections = [];
    },
    onConfirm() {
      // 多选数据回填
      let values = [];
      let texts = [];

      let func = (data) => {
        for (let item of data) {
          if (!item.children || item.children.length === 0) {
            if (this.selections.includes(item[this.idKey])) {
              values.push(item[this.fieldNames.value]);
              texts.push(item[this.fieldNames.value]);
            }
          } else {
            func(item.children);
          }
        }
      };
      func(this.datatree);

      this.$emit("changeCascader", {
        value: values.join("|"),
        text: texts.join("|"),
      });
      this.cascadershow = false;
    },
  },
  watch: {
    datalist: {
      // 编辑状态下数据回填给弹窗，默认勾选已选项
      handler(val) {
        if (this.config.pageMode === "EDIT") {
          let values = new Set(this.value.split("|"));
          this.selections = [];
          val.forEach((item) => {
            if (values.has(item[this.fieldNames.value] + "")) {
              this.selections.push(item[this.idKey]);
              this.checkAllParent(item[this.pidKey]);
            }
          });
        }
      },
    },
    value: {
      handler(val) {
        this.syncValue(val);
      },
    },
  },
};
