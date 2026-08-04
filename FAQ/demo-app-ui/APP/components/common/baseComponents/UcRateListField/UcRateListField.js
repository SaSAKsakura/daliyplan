var UcRateListField = {
  template: `
        <div class="rate-field-list" :class="activeClass(config)">
          <div v-for="(rateItem,index) in newValue" :key="index" class="rate-field">
            <span>{{rateItem.label}}</span>
            <div style="margin-right: 10px;">
              <van-rate v-model="rateItem.value" :color="RateColor" :readonly="getRateReadOnly" :size="RateSize" :disabled="RateDisabled" :count="RateCount"  @change="onChange(rateItem, index)"/>
            </div>
            <div :style="RateDisabled ? '':'color:'+RateColor">{{getRateText(rateItem.value)}}</div>
          </div>
        </div>
      `,
  name: "UcRateListField",
  mixins: [commonMinxin],
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    value: {
      type: [String, Number],
      default: () => 0,
    },
    disabled: {
      type: Boolean,
      default: true
    },
    detailData: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      RateDisabled: false,
      newValue: "",
      RateColor: this.config.RateColor ? this.config.RateColor : '#ffb600',
      RateCount: this.config.RateCount ? this.config.RateCount : 4,
      RateSize: this.config.RateSize ? this.config.RateSize : 18,
      IsShowRateText: this.config.IsShowRateText ? Boolean(this.config.IsShowRateText) : true,
    }
  },
  computed: {
    RateTextList() {
      let defaultRateTextList = [{
        "rateRange": "0,1",
        "text": "很糟糕"
      }, {
        "rateRange": "1,2",
        "text": "较差"
      }, {
        "rateRange": "2,3",
        "text": "一般"
      }, {
        "rateRange": "3,4",
        "text": "满意"
      }, {
        "rateRange": "4,5",
        "text": "非常满意"
      }]
      if (this.config.ControlProperty.RateTextList) {
        let rateTextList = this.containerdata[this.config.ControlProperty.RateTextList]
        return rateTextList ? JSON.parse(rateTextList) : defaultRateTextList;
      }
      return defaultRateTextList
    },
    getRateReadOnly() {
      if (this.config.pageMode == "VIEW") {
        return true;
      }
      if (this.config.ControlProperty.hasOwnProperty("ReadOnly")) {
        if (this.config.ControlProperty.ReadOnly) {
          if (this.config.ControlProperty.ReadOnly.toLowerCase() == "true") {
            return true;
          } else {
            return false;
          }
        }
      }
      if (this.config.pageMode == "ADD" && this.config.ControlProperty.hasOwnProperty("IsReadOnlyWhenInsert")) {
        if (this.config.ControlProperty.IsReadOnlyWhenInsert) {
          if (this.config.ControlProperty.IsReadOnlyWhenInsert.toLowerCase() == "true") {
            return true;
          } else {
            return false;
          }
        }
      }
      if (this.config.pageMode != "ADD" && this.config.ControlProperty.hasOwnProperty("IsReadOnlyWhenUpdate")) {
        if (this.config.ControlProperty.IsReadOnlyWhenUpdate) {
          if (this.config.ControlProperty.IsReadOnlyWhenUpdate.toLowerCase() == "true") {
            return true;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    },
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.newValue = JSON.parse(newVal);
        }
      },
      immediate: true,
    },
  },
  methods: {
    getRateText(newValue) {
      let _this = this;
      if (_this.IsShowRateText && newValue) {
        let rateRangeMap = new Map();
        _this.RateTextList.map((el) => {
          rateRangeMap.set(el.rateRange, el.text)
        });
        let newValueRange = '' + (Number(newValue) - 1) + ',' + newValue;
        return rateRangeMap.get(newValueRange) ? rateRangeMap.get(newValueRange) : ''
      }
    },
    onChange(newVal, index) {
      if (this.config.ControlProperty.ClientActions) {
        this.handleClientActions();
      }
      this.$emit("changeDate", JSON.stringify(this.newVal));
    },
    getRateDisabled() {
      if (this.getRateReadOnly) return false;
      if (this.config.ControlProperty.hasOwnProperty("disabled")) {
        if (this.config.ControlProperty.disabled) {
          if (this.config.ControlProperty.disabled.toLowerCase() == "true") {
            this.RateDisabled = true;
          }
        }
      }
    },
  },
  created() {
    this.getRateDisabled();
    this.newValue = this.value ? this.value : this.config.DefaultValue ? this.config.DefaultValue : 5;
  },
};
