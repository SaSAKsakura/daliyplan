let UcTimer = {
  template: `<div class="UcTimer">
    <div class="UcTimer-inner">
      <div class="title">{{ TitleRSCode }}</div>
      <div class="time">{{ timeText }}</div>
    </div>
  </div>`,
  name: "UcTimer",
  props: {
    config: Object,
    OnEndFunc: Object
  },
  data() {
    return {
      time: 0,
      timer: null,
      pageStartTime: '',
      throttleTimer: null
    }
  },
  computed: {
    startTime() {
      const startTime = this.config.ControlProperty.StartTime;
      if (startTime) {
        return new Date(startTime);
      }
      return new Date();
    },
    endTime() {
      const endTime = this.config.ControlProperty.EndTime;
      if (endTime) {
        return new Date(endTime);
      }
      // 报错
      return new Date();
    },
    timeFormat() {
      return this.config.ControlProperty.TimeFormat || "HH:mm:ss";
    },
    TitleRSCode() {
      return this.config.ControlProperty.TitleRSCode || "";
    },
    timeText() {
      let timeFormat = this.timeFormat;

      if (this.time < 0) return "00:00:00";
      timestamp = this.time;
      let s = timestamp % 60; // 秒
      s = s < 10 ? '0' + s : s;
      timestamp = Math.floor(timestamp / 60);
      let m = timestamp % 60; // 分
      m = m < 10 ? '0' + m : m;
      let h = Math.floor(timestamp / 60);
      h = h < 10 ? '0' + h : h;

      let res = timeFormat.replaceAll('HH', h).replaceAll('ss', s).replaceAll('mm', m);
      return res;
    },
    onEndFunc() {
      return this.config.OnEndFunc || this.config.ControlProperty.OnEndFunc || this.OnEndFunc;
    },
    isCountDown() {
      return this.config.ControlProperty.IsCountDown === "true";
    },
    hasTimerCache() {
      return this.config.ControlProperty.HasTimerCache || false;
    }
  },
  methods: {
    initTime() {
      let _this = this;
      this.getCurTime((curdate) => {
        this.pageStartTime = curdate;

        if (this.isCountDown) { // 倒计时
          this.time = Math.floor((this.endTime.getTime() - curdate.getTime()) / 1000);
          this.countDown();
        } else { // 正计时
          if (this.hasTimerCache) {
            this.getTime();
          } else {
            this.time = 0;
          }
          this.count();
        }
      })
    },
    getTimeVal(date) {
      let time = date.split(":");
      return parseInt(time[0] || 0) * 3600 + parseInt(time[1] || 0) * 60 + parseInt(time[2] || 0);
    },
    getCurTime(callback) { // TODO
      let url = erowplatformBackendUrl + "/getSysCurrentTime"; // 接口未写
      let params = {};
      // erRequest.post(
      //   url,
      //   params,
      //   (res) => {
      //     if (res.code == "SUCCESS") {
            // let date = res.data;
            // if (callback) callback(new Date(date));
      //     } else {
            if (callback) callback(new Date());
      //     }
      //   },
      //   (error) => {
      //     if (callback) callback(new Date());
      //   }
      // );
    },
    // 正计时
    count() {
      // 清除上一次的计时器
      this.timer && clearTimeout(this.timer);
      // 下一秒执行
      this.timer = setTimeout(() => {
        this.time += 1;
        this.count();
      }, 1000);
    },
    // 倒计时
    countDown() {
      // 清除上一次的计时器
      this.timer && clearTimeout(this.timer);
      if (this.time < 0) {
        apis.runSpeicalFun({ vm: this, funName: this.onEndFunc || "timerEndFunc", params: {} });
        return;
      }
      // 下一秒执行
      this.timer = setTimeout(() => {
        this.time -= 1;
        this.countDown();
      }, 1000);
    },
    updateCurrentTime() {
      const _this = this;

      // console.log("visibilitychange", document.hidden);

      if (document.hidden) {  // 标签页隐藏
        // _this.timer && clearTimeout(_this.timer);
        this.cacheTime();
      } else {    // 切回标签页，重新计算计时

        if (_this.throttleTimer) { // 节流
          return;
        }

        _this.getCurTime((curdate) => { // 节流
          // this.timer && clearTimeout(this.timer);
          if (_this.isCountDown) {
            _this.time = Math.floor((_this.endTime.getTime() - curdate.getTime()) / 1000);
            _this.countDown();
          } else {
            if (this.hasTimerCache) { // 切换标签页后的计时不算，重新计算
              this.getTime();
            } else {
              _this.time = Math.floor((curdate.getTime() - _this.pageStartTime.getTime()) / 1000);
            }
            _this.count();
          }
        })

        _this.throttleTimer = setTimeout(() => {
          clearTimeout(_this.throttleTimer);
          _this.throttleTimer = null;
        }, 1000);

      }
    },
    cacheTime() {
      let _this = this;
      if (this.hasTimerCache) {
        erJsBridge.setValue(
          erUser.userId || "debug_user",
          "UcTimer_" + this.config.ControlProperty.ID,
          _this.time,
          1,
          new Date()
        )
      }
    },
    getTime() {
      let _this = this;
      erJsBridge.getValue(
        erUser.userId || "debug_user",
        "UcTimer_" + this.config.ControlProperty.ID,
        (res) => {
          _this.time = Number(res.result);
        }
      )
    }
  },
  created() {
    let _this = this;

    this.initTime();

    document.addEventListener(
      "visibilitychange",
      _this.updateCurrentTime
    );

    window.addEventListener('beforeunload', e => this.cacheTime(e))
  },
  mounted() {},
}
