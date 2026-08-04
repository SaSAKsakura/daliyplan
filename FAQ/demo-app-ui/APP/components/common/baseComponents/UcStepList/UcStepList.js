var UcStepList = {
  name: "UcStepList",
  mixins: [commonMinxin],
  template: `
  <div class="step-container" :class="getDirecttion()">
    <div v-for="(stepItem,index) in itemList" class=" step-item">
      <div  class="step-icon-line" >
        <div style="flex:0 0 33.3%">
          <div
            v-if="index !== 0"
            class="step__line"
            style="display:block;flex:0 1 33.3%"
            :style="getStyle(stepItem,index, 'left')">
          </div>
        </div>
        <img style="width:20px; flex: 0 0 33.4%" :src="getIcon(stepItem,index)">
        <div
          v-if="index != itemList.length-1"
          class="step__line"
          style="display:block;flex:0 1 33.3%"
          :style="getStyle(stepItem,index, 'right')"
        >
        </div>
      </div>
      <div
        class="step-title"
        :style="getActiveColor(stepItem,index)"
        @click="handleClickStep(index)">
        {{stepItem[config.ControlProperty.DataTextField]}}
      </div>
    </div>
  </div>`,
  props: {
    config: Object,
    options: Object,
    disabled: Boolean,
    value: [Number, String],
    detailData: Object,
  },
  data: () => ({
    active: 0,
    itemList: [],
  }),
  computed: {
    direction() {
      return this.config.ControlProperty.direction ? this.config.ControlProperty.direction : "horizontal";
    },
    activeColor() {
      return this.config.ControlProperty.ActiveColor ? this.config.ControlProperty.ActiveColor : "#61b2ff";
    },
    inActiveColor() {
      return this.config.ControlProperty.InactiveColor ? this.config.ControlProperty.InactiveColor : "#1a1a1a";
    },
    currentColor() {
      return this.config.ControlProperty.CurrentColor ? this.config.ControlProperty.CurrentColor : this.activeColor;
    },
    valueField() {
      return this.config.ControlProperty.DataValueField;
    },
    IconPrefix() {
      let baseSrc = "../special/images/";
      return this.config.ControlProperty.IconPrefix ? baseSrc + this.config.ControlProperty.IconPrefix : baseSrc;
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
    getActiveColor(stepItem, index) {
      const isCurrent = index === this.active;
      return { 
        color: isCurrent ? this.currentColor : 
               (this.active >= index ? this.activeColor : this.inActiveColor) 
      };
    },
    getDirecttion() {
      return { "steps--horizontal": this.direction == "horizontal", "steps--vertical": this.direction == "vertical" };
    },

    getStyle(item, index, position) {
      if (position === "left") {
        return {
          // borderColor: this.active >= index ? this.activeColor : this.inActiveColor,
          borderBottom: "1px dashed #DCDFE6",
        };
      } else {
        return {
          // borderColor: this.active >= index ? this.activeColor : this.inActiveColor,
          borderBottom: "1px dashed #DCDFE6",
        };
      }
    },
    getIcon(item, index) {
      const isCurrent = index === this.active;
      if (isCurrent && this.config.ControlProperty.CurrentColor) {
        const currentIcon = this.IconPrefix + item[this.valueField] + "_current.png";
        return currentIcon;
      }
      
      return this.active >= index ? 
        this.IconPrefix + item[this.valueField] + "_active.png" : 
        this.IconPrefix + item[this.valueField] + ".png";
    },
    handleClickStep(step) {
      if (this.isHasEvent(this.config, "click")) {
        this.handleClientActionsWidthParams("click", this.config, { step: step });
      }
    },
    reset() {
      let initVal = typeof this.value == "undefined" ? this.options.DefaultValue : this.value;
      this.itemList = this.options.dataList;
      this.active = this.itemList.findIndex((item) => {
        return item[this.config.ControlProperty.DataValueField] == initVal;
        // return item[this.config.ControlProperty.DataValueField] == 2;
      });
      if (Array.isArray(this.itemList)) {
        this.itemList.forEach((item) => {
          item[this.config.ControlProperty.DataValueField] = item[this.config.ControlProperty.DataValueField] + "";
        });
      }
    },
  },
  created() {},
};
