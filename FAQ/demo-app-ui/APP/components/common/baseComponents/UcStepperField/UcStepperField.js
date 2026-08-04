var UcStepperField = {
  template: `
      <div>
        <van-stepper
            v-if="IsShowStepperButtonWhenReadMode"
            v-model="newValue"
            :disabled = "disabled"
            :disable-plus = "plusDisabled"
            :disable-minus = "minusDisabled"
            :step="Step" 
            :min="stepperMin" 
            :max="stepperMax" 
            :decimal-length="DecimalLength"
            :theme="Stype" 
            :button-size="StepperButtonSize"
            :disable-input="IsDisabledInputBox"
            async-change
            @change="onChange" 
            @plus="onPlusMinusBlur('plus')"
            @minus="onPlusMinusBlur('minus')"
            @blur="onPlusMinusBlur('blur')"
        />
        <span v-else class="fs_14">{{newValue}}</span>
      </div>
    `,
  name: "UcStepperField",
  props: {
    config: Object,
    value: [Number,String],
    disabled: Boolean,
    detailData: Object,
    RangeField: String,
  },
  data() {
    return {
      newValue: "",
      defautValue: this.config.DefaultValue ? Number(this.config.DefaultValue) : 1,
      Step: this.config.ControlProperty.Step ? this.config.ControlProperty.Step : 1,
      Stype: this.config.ControlProperty.Stype ? this.config.ControlProperty.Stype : "round",
      IsDisabledInputBox: this.config.ControlProperty.IsDisabledInputBox ? this.config.ControlProperty.IsDisabledInputBox : false,
      DecimalLength: this.config.ControlProperty.DecimalLength ? this.config.ControlProperty.DecimalLength : 0,
      StepperButtonSize: this.config.ControlProperty.StepperButtonSize ? Number(this.config.ControlProperty.StepperButtonSize) : 16,
    };
  },
  computed: {
    stepperMin() {
      let min = this.config.ControlProperty.Range ? this.config.ControlProperty.Range.split(",")[0] : 0;
      if (this.RangeField) {
        min = this.RangeField.split(",")[0];
      }
      return Number(min);
    },
    stepperMax() {
      let max = this.config.ControlProperty.Range ? this.config.ControlProperty.Range.split(",")[1] : 5;
      if (this.RangeField) {
        max = this.RangeField.split(",")[1];
      }
      return Number(max);
    },
    plusDisabled() {
      if (this.newValue >= this.stepperMax) {
        return true;
      }
      return false;
    },
    minusDisabled() {
      if (this.stepperMin >= this.newValue) {
        return true;
      }
      return false;
    },
    IsShowStepperButtonWhenReadMode() {
      if(this.disabled) {
        if(this.config.ControlProperty.IsShowStepperButtonWhenReadMode && this.config.ControlProperty.IsShowStepperButtonWhenReadMode == 'true') {
          return true
        }
        return false
      }
      return true
    },
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        this.newValue = newVal;
      },
      immediate: true,
    },
  },
  methods: {
    onChange(newVal) {
      if (newVal >= this.stepperMin && newVal <= this.stepperMax) {
        this.newValue = Number(newVal);
        this.$emit("changeDate", Number(newVal));
      }
    },
    onPlusMinusBlur(onType) {
      let params = {
        newValue: this.newValue,
        onType: onType,
      };

      if (this.isHasEvent(this.config, "change")) {
        this.handleClientActionsWidthParams("change", this.config, params);
        // erowSpecial[this.config.OnClientClick](
        //   {
        //     configItem: this.config,
        //     data: params,
        //   },
        //   this
        // );
      } else {
        switch (onType) {
          case "plus":
            this.onPlus;
            break;
          case "minus":
            this.onMinus;
            break;
          case "blur":
            this.onBlur;
            break;
        }
      }
    },
    onPlus() {},
    onMinus() {},
    onBlur() {},
  },
  created() {},
};
