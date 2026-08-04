var RadioButtonList = {
  name: "RadioButtonList",
  mixins: [commonMinxin],
  template: `
	  <van-radio-group
      :style="style"
      :class="activeClass(config)"
      :disabled="disabled"
      v-model="check"
      @change="handleChange"
       :direction="direction"
    >
      <van-radio
        v-for="item in itemList"
        :name="String(item[config.ControlProperty.DataValueField])"
        :key="String(item[config.ControlProperty.DataValueField])"
        @click="handleClick(item)"
        :data-set="String(item[config.ControlProperty.DataValueField])"
      >
        <span v-html="item[config.ControlProperty.DataTextField]"></span>
      </van-radio>
	  </van-radio-group>
	`,
  props: {
    config: Object,
    options: [Object, String],
    disabled: Boolean,
    value: [String, Number],
    controldata: Object,
    detailData: Object,
  },
  data: () => ({
    newValue: "",
    itemList: [],
    check: [],
    oldValue: "",
    checkRadioFlag: false,
  }),
  computed: {
    direction() {
      return this.config.ControlProperty.RepeatDirection ? this.config.ControlProperty.RepeatDirection.toLowerCase() : "";
    },
    style() {
      return {
        grid: `auto / repeat(${this.config.ControlProperty.RepeatColumns}, 1fr)`,
      };
    },
  },
  watch: {
    value() {
      this.reset();
    },
    options: {
      handler() {
        this.reset();
      },
      immediate: true,
    },
  },
  methods: {
    cancleSekect() {
      if (this.config.ControlProperty.canCanleSelect !== "true") return;
      if (this.oldValue === "") {
        this.oldValue = this.value;
        return;
      }
      if (this.oldValue === this.value) {
        this.oldValue = "";
        this.handleChange("");
      } else {
        this.oldValue = this.value;
      }
    },
    handleChange(data) {
      debugger;
      this.checkRadioFlag = false;
      this.$emit("input", data);
      this.$emit("change", data);
      this.$emit("changeSelect", {
        value: data
      })
      if (!this.$attrs.isinselect) {
        this.handleClientActionsWidthParams(
          "change",
          this.config,
          {
            data: data,
          },
          "",
          "change"
        );
      }
    },
    handleClick(item) {
      this.$emit("click", item[this.config.ControlProperty.DataValueField]);
      if (this.config.IsAllowToggle && this.config.IsAllowToggle.toLowerCase() == "true") {
        if (this.checkRadioFlag) {
          this.check = [];
        }
        this.checkRadioFlag = true;
      }
    },
    reset() {
      this.check = typeof this.value == "undefined" ? this.options.DefaultValue : this.value + "";
      this.itemList = this.options.dataList;
      if (Array.isArray(this.itemList)) {
        this.itemList.forEach((item) => {
          item[this.config.ControlProperty.DataValueField] = item[this.config.ControlProperty.DataValueField] + "";
        });
      }
    },
  },
  created() {},
};
