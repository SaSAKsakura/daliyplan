var ProgressBar = {
  template: `
    <div class="ProgressBar">
      <van-circle 
        v-if="config.ControlProperty.type === 'circle'"
        :rate="value"
        :speed="100"
        :text="showText"
      />
      <van-progress
        v-else
        :show-pivot="isShowText"
        :pivot-text="showText"
        :color="color"
        :percentage="value"
      />
    </div>
	`,
  props: {
    config: Object,
    value: {
      validator(value) {
        return Number(value) || 0;
      },
    },
  },
  computed: {
    isShowText() {
      const { showText } = this.config.ControlProperty;
      return showText && showText !== "false";
    },
    showText() {
      const { showText } = this.config.ControlProperty;
      return showText === "true" ? `${value}%` : showText || "";
    },
    colorMap() {
      return Object.entries(JSON.parse(this.config.ControlProperty.ColorMap));
    },
    color() {
      const colorItem = this.colorMap.find(([_, [num1, num2]]) => this.value >= num1 && this.value <= num2);
      return colorItem ? colorItem[0] : "#888";
    },
  },
};
