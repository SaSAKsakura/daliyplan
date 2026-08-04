let UcWeekCalendar = {
  name: 'UcWeekCalendar',
  props: {
    config: {
      type: Object,
      default:() => {}
    }
  },
  template: `
    <div class="weekly-calendar">
      <div class="controls" v-if="calendarMode">
          <button class="prev-btn" @click="prevWeek" v-if="weekRange[0] < 0 && weekPoint >= weekRange[0]">上一周</button>
          <h3>{{ showMonth }}</h3>
          <button class="next-btn" @click="nextWeek" v-if="weekRange[weekRange.length - 1] > 0 && weekPoint <= weekRange[weekRange.length - 1]">下一周</button>
      </div>
      <div class="tab-controls" v-else>
        <div
          class="prev-tab tab"
          v-if="weekRange[0] < 0 && weekPoint >= weekRange[0]"
          :class="{active: weekPoint < 0}"
          @click="tabClick('prev')"
        >
          上周
        </div>
        <div class="current-tab tab" :class="{active: weekPoint === 0}" @click="tabClick('cur')">本周</div>
        <div
          class="next-tab tab"
          v-if="weekRange[weekRange.length - 1] > 0 && weekPoint <= weekRange[weekRange.length - 1]"
          :class="{active: weekPoint > 0}"
          @click="tabClick('next')"
        >
          下周
        </div>
      </div>
      <div class="days transparentBackGround">
        <div class="day-labels">
              <div class="day-label">一</div>
              <div class="day-label">二</div>
              <div class="day-label">三</div>
              <div class="day-label">四</div>
              <div class="day-label">五</div>
              <div class="day-label">六</div>
              <div class="day-label">日</div>
          </div>
        <div class="day-cells">
              <div class="day-cell"
                   v-for="(day, index) in days"
                   :key="index"
                   :class="{ today: checkIndex == index, 'not-in-month': !isInMonth(day) }">
                  <div class="day-number" @click="clickDays(index, day)">{{ fmtDateForWeekCalendar(day, "dd") }}
                  </div>
              </div>
          </div>
      </div>
    </div>`,
  data() {
    return {
      currentWeek: {
        start: null,
        end: null
      },
      checkIndex: null,// 当前选中index
      showMonth: null, // 当前显示月份
      weekPoint: 0
    }
  },
  created() {
    this.setToday()
  },
  computed: {
    days() {
      const days = [];
      const weekStart = this.currentWeek.start;
      const weekEnd = this.currentWeek.end;
      const diff = (weekEnd.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000);
      for (let i = 0; i <= diff; i++) {
        const day = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
        days.push(day);
      }
      return days;
    },
    calendarMode() {
      return this.config.ControlProperty.CalendarMode === 'button'
    },
    weekRange() {
      return this.config.ControlProperty.Range.split(',')
    }
  },
  methods: {
    clickDays(index, day) {
      if ((!!this.checkIndex || this.checkIndex === 0) && this.checkIndex === index) {
        this.checkIndex = null
        if (this.config.ControlProperty.ClientActions) {
          this.handleWeekCalendarClick(this.days, this.config.ControlProperty.ClientActions)
        }
      } else {
        this.checkIndex = index
        if (this.config.ControlProperty.ClientActions) {
          this.handleWeekCalendarClick(day, this.config.ControlProperty.ClientActions)
        }
      }
      this.seShowMonth(day)
    },
    prevWeek() {
      const weekStart = this.currentWeek.start;
      const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      this.currentWeek.start = new Date(prevWeekStart);
      this.currentWeek.end = new Date(prevWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      const day = new Date(this.currentWeek.end.getTime() - 3 * 24 * 60 * 60 * 1000);
      this.seShowMonth(day)

      if (this.config.ControlProperty.ClientActions) {
        this.handleWeekCalendarClick(this.days, this.config.ControlProperty.ClientActions)
      }
    },
    nextWeek() {
      const weekEnd = this.currentWeek.end
      const nextWeekEnd = new Date(weekEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
      this.currentWeek.end = new Date(nextWeekEnd)
      this.currentWeek.start = new Date(
        nextWeekEnd.getTime() - 6 * 24 * 60 * 60 * 1000
      );
      const day = new Date(this.currentWeek.start.getTime() + 3 * 24 * 60 * 60 * 1000);
      this.seShowMonth(day)

      if (this.config.ControlProperty.ClientActions) {
        this.handleWeekCalendarClick(this.days, this.config.ControlProperty.ClientActions)
      }
    },
    isToday(date) {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    },
    isInMonth(date) {
      return erowConfig.formatDateReg(date,"yyyy-MM") === this.showMonth
    },
    seShowMonth(day) {
      this.showMonth = erowConfig.formatDateReg(day, "yyyy-MM")
    },
    setToday() {
      const today = new Date();
      let pastDays = today.getDay();
      if (pastDays === 0) {
        // 如果是周日则倒推6天
        pastDays = 6
      } else {
        pastDays -= 1
      }
      // this.checkIndex = pastDays
      const currentWeekStart = new Date(today.getTime() - (pastDays * 24 * 60 * 60 * 1000));
      const currentWeekEnd = new Date(currentWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
      this.currentWeek.start = currentWeekStart;
      this.currentWeek.end = currentWeekEnd;
      this.seShowMonth(this.currentWeek.start);
    },
    fmtDateForWeekCalendar(day,fmt) {
      // 插值语法不能直接调erowConfig的方法，额外声明一个过渡函数
      return erowConfig.formatDateReg(day, fmt)
    },
    handleWeekCalendarClick(day, eventMap) {
      eventMap = JSON.parse(eventMap)
      for (const eventMapKey in eventMap) {
        let callbakName=eventMap[eventMapKey];
        if (erowConfig.hasProp(baseSpecial, callbakName)) {
          baseSpecial[callbakName](this, day);
        } else if (erowSpecial.hasOwnProperty(callbakName)) {
          erowSpecial[callbakName](this, day);
        }
      }
    },
    tabClick(type) {
      this.checkIndex = null
      const range = this.config.ControlProperty.Range.split(',')
      if (type === 'prev' && this.weekPoint > range[0]) {
        this.weekPoint -= 1
        this.prevWeek();
        return
      } else if (type === 'next' && this.weekPoint < range[range.length - 1]) {
        this.weekPoint += 1
        this.nextWeek();
        return
      } else if (type === 'cur') {
        this.weekPoint = 0
        this.setToday()
      }
      if (this.config.ControlProperty.ClientActions) {
        this.handleWeekCalendarClick(this.days, this.config.ControlProperty.ClientActions)
      }
    },
  }
}
