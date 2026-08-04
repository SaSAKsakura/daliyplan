var TemplateTimeLine = {
  name: "TemplateTimeLine",
  /* html */
  template: `
  <div class="template-time-line">
    <div class="time-line-head">
      <div class="card-title-form">{{ navTitle}}</div>
      <div class="flex items-center" @click="datetimeShow=true">
        <img   src="../assets/images/public/date.png" style="width:16px"></img>
        <span style="margin-left:5px">{{newValue}}</span>
      </div>
    </div>
    <div class="h-center-flex w100">
      <div class="v-center-flex">
       <div class="legend-item" v-for="legendItem in legend">
          <div class="legend-item-block" :style="{backgroundColor:legendItem.style.backgroundColor}"></div>
          <div class="legend-item-txt">{{legendItem.name}} </div>
        </div>
       </div>
    </div>
   <div class="timeline-container" v-show="timeBlocks.length>0">
    <div class="timeline" :style="timeLineStyle">
      <!-- 时间轴主轴线 -->
      <div class="timeline-axis"></div>
      <!-- 时间节点 -->
      <div v-for="(point, index) in timePoints" :key="index" class="time-point" :style="{ top: getUniformPosition(index) + '%' }">
        <div class="point-dot"></div>
        <div class="point-time">{{ point.time }}</div>
        <div class="point-label" v-if="point.label">{{ point.label }}</div>
      </div>
      <!-- 时间块 -->
      <div
        v-for="(block, index) in timeBlocks"
        :key="'block-' + index"
        class="time-block"
        :style="{
          top: getBlockPosition(index) + '%',
          minHeight: calculateHeight(block.starttime, block.endtime) + '%',
          backgroundColor: getBlockBg(block.type),
        }"
      >
        <div class="font-14-black":style=" {color:getBlockColor(block.type)}"> {{block.label }}</div>
      </div>
      
    </div>
  </div>
  <div v-if="timeBlocks.length==0" class="list-empty">
          <img :src="emptyImage" />
          <p>{{emptyText}}</p>
  </div>
   <van-popup v-model="datetimeShow" position="bottom" round  :get-container="'#app'">
        <van-datetime-picker
          v-model="chooseDate"
          :type="datePickerType"
          :title="'请选择'"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onConfirm"
          @cancel="onCancel"
        />
   </van-popup>
   
  </div>`,
  mixins: [commonMinxin],
  props: {
    containerData: {
      type: [Object, Array],
      default: () => {},
    },
    config: {
      type: [Object, Array],
      default: () => {},
    },
  },
  data() {
    return {
      currentDate: "",
      datetimeShow: false,
      chooseDate: new Date(),
      newValue: "",
      blockData: [],
      dateFormat: "yyyy-MM-dd",
    };
  },
  computed: {
    timeLineStyle() {
      return { height: this.timePoints.length * 50 + "px" };
    },
    emptyImage() {
      return "../assets/images/common/emptyList.png";
    },
    emptyText() {
      return this.ExtraConfigObj.emptyText || "暂无内容";
    },
    timePoints() {
      let times = this.timeBlocks.reduce((res, cur) => {
        res.push({ time: cur.starttime });
        res.push({ time: cur.endtime });
        return res;
      }, []);
      return [{ time: this.timeRange.start }, ...times, { time: this.timeRange.end }];
    },
    // 时间块配置
    timeBlocks() {
      return this.blockData.sort((a, b) => {
        let aValue = this.timeToMinutes(a.starttime);
        let bValue = this.timeToMinutes(b.starttime);
        return aValue - bValue;
      });
    },
    // 总时间范围（默认0:00-24:00）
    timeRange() {
      if (this.ExtraConfigObj.timeRange) {
        return this.ExtraConfigObj.timeRange;
      } else {
        return {
          start: "0:00",
          end: "24:00",
        };
      }
    },
    minDate() {
      const date = new Date();
      if (this.config && this.config.ControlProperty && this.config.ControlProperty.StartRangeDate) {
        const StartRangeDate = this.config.ControlProperty.StartRangeDate;
        this.setBeforeDate(date, StartRangeDate);
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
      } else {
        date.setYear(date.getFullYear() + 2);
      }
      return date;
    },
    dateType() {
      // 默认为calendar，可选值：time | date | dateTime | calendar
      return this.config.ControlProperty.DateType ? this.config.ControlProperty.DateType : "date";
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
    menuConfigKey() {
      return this.config.menuConfigKey || this.$root.menuConfigKey;
    },
    menuRowGuid() {
      return this.config?.menuRowGuid;
    },
    configPValueSet() {
      const { config = {} } = this;
      const { pValueSet } = config;
      return pValueSet || this?.$root?.pValueSet || erowConfig.generateUUID();
    },
    UcDSContainerConfig() {
      return this.ControlProperty?.DataSourceConfig;
    },
    ControlProperty() {
      return this?.config?.ControlProperty || {};
    },
    ExtraConfig() {
      const { config = {} } = this;
      const { ExtraConfig = "", ControlProperty = {} } = config || {};
      const { ExtraConfig: otherExtraConfig = "" } = ControlProperty;
      return otherExtraConfig || ExtraConfig;
    },
    ExtraConfigObj() {
      const { ExtraConfig } = this;
      if (!ExtraConfig) {
        return null;
      }
      let ExtraConfigObj = null;
      try {
        ExtraConfigObj = JSON.parse(ExtraConfig);
      } catch (e) {
        return null;
      }
      return ExtraConfigObj || {};
    },
    legend() {
      return this.ExtraConfigObj.legend || [];
    },
    navTitle() {
      const { ExtraConfigObj } = this;
      return ExtraConfigObj?.title;
    },
  },
  async mounted() {
    this.newValue = this.formatDate(new Date());
    this.init();
  },
  methods: {
    async init() {
      this.getData();
    },
    getUniformPosition(index) {
      const totalPoints = this.timePoints.length;
      return (index / (totalPoints - 1)) * 100;
    },
    getBlockPosition(blockIndex) {
      const timePoints = this.timePoints.map((p) => p.time);
      const block = this.timeBlocks[blockIndex];
      // 找到对应的时间点索引
      const startIndex = timePoints.indexOf(block.starttime);
      if (startIndex !== -1) {
        // 基于时间点位置计算
        return this.getUniformPosition(startIndex);
      }
      // 如果没有精确匹配，就平均分布
      return (blockIndex + 1) * (100 / (this.timeBlocks.length + 1));
    },
    async getData() {
      const { ControlProperty, UcDSContainerConfig, configPValueSet, menuRowGuid } = this;
      const params = {
        controlCode: UcDSContainerConfig?.ControlCode,
        pValueSet: configPValueSet,
        controlGUID: ControlProperty?.DataSourceCtnrGuid,
        menuRowGuid,
        keyValue: this.config.keyValue,
        pageMode: "VIEW",
        paramMap: {
          RoomGuid: this.config._formPrimaryData.row_guid,
          Meeting_Date: this.newValue,
        },
      };
      const res = await new Promise((resolve, reject) => {
        apis.sysLoadDBData({
          vm: this,
          params,
          success: (res) => {
            resolve(res);
          },
          fail: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
            reject(error);
          },
          error: (error) => {
            console.log(error);
            this.$toast.fail(error.msg);
            reject(error);
          },
        });
      });
      const ID = UcDSContainerConfig.ControlProperty.ID;
      debugger;
      if (res.data && erowConfig.hasProp(res.data, ID)) {
        this.blockData = res.data[ID].dataList;
      }
    },
    timeToMinutes(timeStr) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + (minutes || 0);
    },
    getBlockBg(type) {
      let typeItem = this.legend.find((item) => item.code == type);
      return typeItem ? typeItem.style.backgroundColor : "gray";
    },
    getBlockColor(type) {
      let typeItem = this.legend.find((item) => item.code == type);
      return typeItem ? typeItem.style.color : "#61b2ff";
    },
    // 计算时间点在时间轴上的位置百分比
    calculatePosition(timeStr) {
      const startMinutes = this.timeToMinutes(this.timeRange.start);
      const endMinutes = this.timeToMinutes(this.timeRange.end);
      const currentMinutes = this.timeToMinutes(timeStr);
      let radio = ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
      return radio == 100 ? 98 : radio;
    },
    // 计算时间块的高度百分比
    calculateHeight(starttime, endtime) {
      // const startMinutes = this.timeToMinutes(starttime);
      // const endMinutes = this.timeToMinutes(endtime);
      const timePoints = this.timePoints.map((p) => p.time);
      // 找到对应的时间点索引
      const startIndex = timePoints.indexOf(starttime);
      let starRadio = 0;
      let endRadio = 0;
      if (startIndex !== -1) {
        // 基于时间点位置计算
        starRadio = this.getUniformPosition(startIndex);
      }
      const endIndex = timePoints.indexOf(endtime);
      if (endIndex !== -1) {
        // 基于时间点位置计算
        endRadio = this.getUniformPosition(endIndex);
      }
      debugger;
      const totalMinutes = endRadio - starRadio;
      return totalMinutes;
    },
    getTimeInterval(timeStr) {
      const [start, end] = timeStr.split("-");
      const [h1, m1] = start.split(":").map(Number);
      const [h2, m2] = end.split(":").map(Number);
      const diff = h2 * 60 + m2 - (h1 * 60 + m1);
      const hours = diff / 60;
      return hours;
    },
    onCancel() {
      this.datetimeShow = false;
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
    onConfirm(date) {
      this.datetimeShow = false;
      this.newValue = this.dateType == "time" ? date : this.formatDate(date);
      this.chooseDate = date;
      this.getData();
    },
  },
};
