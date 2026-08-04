var CheckboxList = {
  name: "CheckboxList",
  mixins: [commonMinxin],
  template: `
    <van-checkbox-group
      :style="style"
      :class="activeClass(config)"
      :disabled="disabled"
      v-model="checks"
      @change="handleChange"
    >
      <van-checkbox
        v-for="item in itemList"
        shape="square"
        :name="String(item[config.ControlProperty.DataValueField])"
        :key="item[config.ControlProperty.DataValueField]"
      >

        {{ item[config.ControlProperty.DataTextField] }}
      </van-checkbox>
    </van-checkbox-group>
	`,
  props: {
    config: Object,
    options: Object,
    disabled: Boolean,
    value: String,
    detailData: Object,
  },
  data: () => ({
    newValue: "",
    checkdDisabled: this.disabled,
    itemList: [],
    checks: [],
    callFlag: false,
    icon: {
      active: "../assets/images/icon/checked-true.png",
      normal: "../assets/images/icon/checked-false.png",
    },
  }),
  computed: {
    style() {
      return {
        grid: `auto / repeat(${this.config.ControlProperty.RepeatColumns}, 1fr)`,
      };
    },
    separator() {
      return (this.config && this.config.ControlProperty.Separator) || ",";
    },
  },
  watch: {
    value() {
      !this.callFlag && this.reset();
    },
    options: {
      handler() {
        this.reset();
      },
      immediate: true,
    },
  },
  methods: {
    handleChange(data) {
      this.callFlag = true;
      setTimeout(() => (this.callFlag = false), 0);

      this.$emit("input", this.checks.join(this.separator));

      if (this.config._isLoadedData && data.join(this.separator) !== this.value && !this.$attrs.isinselect) {
        this.$nextTick(() => {
          let params = {
            event: {},
            configItem: this.config,
            data: this.detailData,
          };
          let fun = erowConfig.getEventFun(this.config, "change");
          if (fun) {
            if (erowConfig.hasProp(baseSpecial, fun)) {
              baseSpecial[fun](params, this);
            } else {
              erowSpecial[fun](params, this);
            }
          }
        });
      }
    },
    reset() {
      if (typeof this.value === "undefined") {
        if (this.options.DefaultValue) {
          this.checks = this.options.DefaultValue.split(this.separator);
        }
      } else if (typeof this.value === "string") {
        this.checks = this.value.split(this.separator).filter((item) => item !== "");
      } else {
        this.checks = this.checks;
      }
      this.itemList = this.options.dataList;
    },
  },
  created() {},
};
