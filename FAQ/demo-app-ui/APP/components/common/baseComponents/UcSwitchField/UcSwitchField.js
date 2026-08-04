var UcSwitchField = {
  name: "UcSwitchField",
  mixins: [commonMinxin],
  template: `
      <van-switch v-model="checked" :disabled="disabled" :size="size" :active-color="activeColor" inactive-color="#fff" 
      @click="handleClick"
      @change="handleChange"
      :active-value="-1"
      :inactive-value="0"
      />
      `,
  props: {
    config: Object,
    disabled: Boolean,
    value: [String, Number],
    controldata: Object,
    detailData: Object,
  },
  data: () => ({
    newValue: "",
    itemList: [],
    checked: -1,
    oldValue: "",
  }),
  computed: {
    size() {
      return this.config.ControlProperty.size ? this.config.ControlProperty.size : "16px";
    },
    activeColor() {
      return this.config.ControlProperty.ActiveColor ? this.config.ControlProperty.ActiveColor : "var(--theme-color)";
    },
  },
  watch: {
    value: {
      handler(val) {
        this.reset();
      },
      immediate: true,
    },
  },
  methods: {
    handleChange(data) {
      if (this.isHasEvent(this.config, "change")) {
        this.handleClientActionsWidthParams(
          "change",
          this.config,
          {
            data: data,
          },
          "",
          "change"
        );
      } else {
        let val = data ? -1 : 0;

        this.$emit("changeSwitch", val);
      }
    },
    handleClick() {
      if (this.isHasEvent(this.config, "click")) {
        this.handleClientActionsWidthParams("click", this.config);
      }
    },
    reset() {
      if (Number(this.value) == -1) {
        this.checked = -1;
      } else if (Number(this.value) == 0) {
        this.checked = 0;
      } else {
        this.checked = this.config.ControlProperty.DefaultValue == -1 ? -1 : 0;
      }
    },
  },
  created() {},
};
