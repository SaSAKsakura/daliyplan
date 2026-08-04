var FormDate = {
  mixins: [commonMinxin],
  template: `
    <div>
      <div class="input-text-box" :class="activeClass(config)">
        <van-field
          readonly
          clickable
          name="picker"
          :reuquired="reuquired"
          :value="newValue"
          :disabled="disabled"
          :rules="rules"
          :right-icon=" newValue !==''? 'close':'clock-o'"
          :placeholder="placeholder"
          @click-input="handleFieldClick"
          @click-right-icon="clickToClear"
        />
      </div>
      <van-calendar
        get-container="body"
        :default-date="defaultDate"
        :min-date="minDate"
        :max-date="maxDate"
        :title="'请选择' + titleName"
        v-model="calendarShow"
        @confirm="onCalendarConfirm"
      />

      <van-popup v-model="datetimeShow" position="bottom" round  :get-container="'#app'">
        <van-datetime-picker
          v-model="chooseDate"
          :type="datePickerType"
          :title="'请选择' + titleName"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onConfirm"
          @cancel="onCancel"
        />
      </van-popup>
    </div>
  `,
  props: {
    config: Object,
    placeholder: String, //提示
    titleName: String, //标题
    rules: Array, //规则
    value: String, //值
    reuquired: String,
    disabled: Boolean,
    listIndex: Number,
    typeNumber: [String, Number], //父组件显示回显值顺序数字
  },
  data() {
    return {
      newValue: "",
      chooseDate: "",
      defaultDate: new Date(),
      datetimeShow: false,
      calendarShow: false,
      onload: false,
    };
  },
  computed: {
    minDate() {
      const date = new Date();
      if (this.config && this.config.ControlProperty && this.config.ControlProperty.StartRangeDate) {
        const StartRangeDate = this.config.ControlProperty.StartRangeDate;
        this.setBeforeDate(date, StartRangeDate);
      } else if (this.config && this.config.ControlProperty && this.config.ControlProperty.StartRangeDateField) {
        // 动态获取StartRangeDate
        let dateStr = this.config._formPrimaryData[this.config.ControlProperty.StartRangeDateField];
        if (dateStr) {
          this.setBeforeDate(date, dateStr);
        }
      } else {
        date.setYear(date.getFullYear() - 2);
      }
      return date;
    },
    maxDate() {
      const date = new Date();
      if (this.config && this.config.ControlProperty && this.config.ControlProperty.EndRangeDate) {
        const EndRangeDate = this.config.ControlProperty.EndRangeDate;
        this.setAfterDate(date, EndRangeDate);
      } else if (this.config && this.config.ControlProperty && this.config.ControlProperty.EndRangeDateField) {
        // 动态获取EndRangeDate
        let dataStr = this.config._formPrimaryData[this.config.ControlProperty.EndRangeDateField];
        if (dataStr) {
          this.setAfterDate(date, dataStr);
        }
      } else {
        date.setYear(date.getFullYear() + 2);
      }
      return date;
    },
    dateType() {
      // 默认为calendar，可选值：time | date | dateTime | calendar
      return this.config.ControlProperty.DateType ? this.config.ControlProperty.DateType : "calendar";
    },
    datePickerType() {
      // van-datetime-picker组件的type： date年月日 time小时和分钟 datetime完整时间 datehour年月日和小时、分钟 year-month年份和月份 month-day月日
      let map = {
        time: "time",
        date: "date",
        dateTime: "datetime",
        calendar: "calendar",
      };
      return map[this.dateType];
    },
    dateFormat() {
      if (this.config.ControlProperty.DateFormat) {
        return this.config.ControlProperty.DateFormat;
      }
      if (this.dateType) {
        if (this.dateType == "calendar" || this.dateType == "date") {
          return "yyyy/MM/dd";
        } else if (this.dateType == "dateTime") {
          return "yyyy-MM-dd HH:mm";
        } else if (this.dateType == "time") {
          return "HH:mm";
        }
      } else if (this.value) {
        if (this.value.indexOf("/") != -1) {
          return this.value.indexOf(" ") != -1 ? "yyyy/MM/dd HH:mm" : "yyyy/MM/dd";
        } else {
          return this.value.indexOf(" ") != -1 ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd";
        }
      } else {
        return "yyyy/MM/dd";
      }
    },
  },
  watch: {
    value: {
      handler(val) {
        console.log(val);
        if (val) {
          if (new Date(val).valueOf()) {
            this.newValue = this.formatDate(new Date(val));
          } else if (this.config.ControlProperty.DateFormat === "yyyyMMdd") {
            this.newValue = this.formatDate(new Date(`${val.slice(0, 4)}/${val.slice(4, 6)}/${val.slice(6, 8)}`));
          } else {
            this.newValue = val;
          }
          // if (this.config._isLoadedData && !this.onload) {
          //   this.$emit("changeDate", this.newVal, this.typeNumber, "onload"); //传递父级
          //   this.onload = true;
          // }
        } else {
          this.newValue = "";
        }
      },
      immediate: true,
    },
  },
  methods: {
    setBeforeDate(date, dataStr) {
      let [year, month, day, hour, minute] = dataStr.split(".");
      if (this.dateType == "date" || this.dateType == "calendar" || this.dateType == "dateTime") {
        date.setFullYear(date.getFullYear() - (Number(year) || 0));
        date.setMonth(date.getMonth() - (Number(month) || 0));
        date.setDate(date.getDate() - (Number(day) || 0));
      }
      if (this.dateType == "dateTime" || this.dateType == "time") {
        date.setHours(date.getHours() - (Number(hour) || 0), date.getMinutes() - (Number(minute) || 0));
      }
    },
    setAfterDate(date, dataStr) {
      let [year, month, day, hour, minute] = dataStr.split(".");
      if (this.dateType == "date" || this.dateType == "calendar" || this.dateType == "dateTime") {
        date.setFullYear(date.getFullYear() + (Number(year) || 0));
        date.setMonth(date.getMonth() + (Number(month) || 0));
        date.setDate(date.getDate() + (Number(day) || 0));
      }
      if (this.dateType == "dateTime" || this.dateType == "time") {
        date.setHours(date.getHours() + (Number(hour) || 0), date.getMinutes() - (Number(minute) || 0));
      }
    },
    handleFieldClick() {
      // 点击打开选择界面
      if (this.disabled) {
        return;
      }
      if (this.dateType == "calendar") {
        this.calendarShow = true;
        // 设置初始时间/已选择时间
        if (this.newValue) {
          if (this.config.ControlProperty.DateFormat === "yyyyMMdd") {
            let year = this.newValue.slice(0, 4);
            let month = this.newValue.slice(4, 6);
            let day = this.newValue.slice(6, 8);
            this.defaultDate = new Date(year + "/" + month + "/" + day);
          } else {
            this.defaultDate = new Date(this.newValue);
          }
        } else {
          this.defaultDate = new Date();
        }
      } else if (this.dateType == "time") {
        this.datetimeShow = true;
        this.chooseDate = this.value;
      } else {
        this.datetimeShow = true;
        // 设置初始时间/已选择时间
        if (this.value) {
          if (this.dateFormat === "yyyyMMdd") {
            let year = this.dateFormat.slice(0, 4);
            let month = this.dateFormat.slice(4, 6);
            let day = this.dateFormat.slice(6, 8);
            this.chooseDate = new Date(year + "/" + month + "/" + day);
          } else {
            this.chooseDate = new Date(this.value);
          }
        } else {
          this.chooseDate = new Date();
        }
      }
    },
    clickToClear() {
      if (this.newValue !== "") {
        this.newValue = "";
        this.onload = true;
        this.$emit("changeDate", this.newValue, this.typeNumber); //传递父级
      }
    },
    onCancel() {
      this.datetimeShow = false;
    },
    onConfirm(date) {
      this.datetimeShow = false;
      this.newValue = this.dateType == "time" ? date : this.formatDate(date);
      this.onload = true; // 用户主动选择，阻止 watch.value 重复触发 changeDate
      this.$emit("changeDate", this.newValue, this.typeNumber); //传递父级
    },
    onCalendarConfirm(date) {
      this.calendarShow = false;
      this.newValue = this.formatDate(date);
      this.onload = true; // 用户主动选择，阻止 watch.value 重复触发 changeDate
      this.$emit("changeDate", this.newValue, this.typeNumber); //传递父级
    },
    formatDate(date) {
      // 格式化日期
      const Y = date.getFullYear();
      const M = String(date.getMonth() + 1);
      const D = String(date.getDate());
      const h = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      const m = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      let format = this.dateFormat || "yyyy/MM/dd";
      format = format.replaceAll("yyyy", Y);
      format = format.replaceAll("MM", M.padStart(2, 0));
      format = format.replaceAll("dd", D.padStart(2, 0));
      format = format.replaceAll("mm", m);
      format = format.replaceAll("hh", h);
      return format;
    },
    handleClientActions(flag) {
      // ClientActions
      let actions = {};
      let params = {
        configItem: this.config,
        data: {
          newValue: this.newValue,
          typeNumber: this.typeNumber,
        },
      };
      if (this.config.ControlProperty.ClientActions) {
        actions = JSON.parse(this.config.ControlProperty.ClientActions);
        Object.entries(actions).reduce((events, [eventName, callbakName]) => {
          console.log(eventName);
          if (!flag || flag == eventName) {
            if (erowConfig.hasProp(baseSpecial, callbakName)) {
              baseSpecial[callbakName](params, this);
            } else if (erowSpecial.hasOwnProperty(callbakName)) {
              erowSpecial[callbakName](params, this);
            }
          }
        }, {});
      }
    },
  },
  mounted() {
    this.handleClientActions("onload");
  },
  created() {},
};
