var LiveStreamVideo = {
  name: "LiveStreamVideo",
  template: `<div :id="'liveVideoWrap' + config.ControlProperty.ID +'_'+ indexList" class="W100" :style="returnVedioHeight">
        <div :id="'liveVideo' + config.ControlProperty.ID+'_'+ indexList"></div>
    </div>`,
  props: {
    config: Object,
    options: Object,
    disabled: Boolean,
    value: [Number, String],
    detailData: Object,
    indexList: [Number, String],
  },
  data: () => ({
    active: 0,
    itemList: [],
    iotToken: "",
    playType: "sub",
    onlineFlag: "",
    playUrl: "",
    accsessToken: "",
    deviceInfo: "",
    currentPageVideoList: [],
    pushInterval: null,
    returnVedioHeight: 'height: 30px;',
    videoTimes: 0,
  }),
  computed: {},
  watch: {
    value() {},
    options: {
      handler() {},
      immediate: true,
    },
  },
  methods: {
    getIOTToken() {
      this.videoTimes ++;
      let _this = this;
      $.ajax({
        url: IOTServer.getIOTToken,
        type: "POST",
        contentType: 'application/json',
        headers: { Authorization: erUser.token },
        data: { Token: erUser.token, text: "AJGK_37_" +this.detailData[this.config.ControlProperty.ID] },
        success: function (rData) {
          _this.iotToken = rData;
          _this.getPlayUrl()
        }
      })
    },
    getPlayUrl() {
      let _this = this;
      var url = IOTServer.getvideoUrl;
      $.ajax({
        url: url,
        type: "POST",
        data: {
          iotToken: _this.iotToken,
          playType: _this.playType
        },
        success: function (rData) {
          if (rData.type == -1) {
            _this.onlineFlag = rData.data.online_flag;
            let playUrl = rData.data.playUrl;
            let accsessToken = rData.data.accsessToken;
            let deviceInfo = rData.data.deviceInfo;
            _this.deviceInfo = rData.data.deviceInfo;
            

            let wrapId = '#liveVideoWrap' + _this.config.ControlProperty.ID + '_' + _this.indexList;
            let Id = '#liveVideo' + _this.config.ControlProperty.ID + '_' + _this.indexList;
            erJsBridge.appStopMultiVideo(function (data) {});
            let left = parseInt($(Id)[0].getBoundingClientRect().left);
            let top = parseInt($(Id)[0].getBoundingClientRect().top);
            let each = {
              deviceInfo: deviceInfo,
              accsessToken: accsessToken,
              playType: _this.playType,
              containerWidth: parseInt($(wrapId).innerWidth() + 10),
              containerHeight: parseInt(($(wrapId).innerWidth()) * 0.6),
              containerOffsetX: _this.indexList % 2 === 0 ? left:(left + 10),
              containerOffsetY:  _this.indexList < 2 ? top:(top + 10),
              videoUrl:playUrl?playUrl: "https://dash.akamaized.net/akamai/bbb_30fps/bbb-manifest-refresh.mpd"
            }
            currentPageVideoList.push(each);
            let length = currentPageVideoList.length;
            setTimeout(() => {
              if (length == currentPageVideoList.length) {
                erJsBridge.appShowMultiVideo(currentPageVideoList, function (data) {
                  currentPageVideoList.forEach(element => {
                    _this.pushStream(element);
                    setInterval(function () {
                      _this.pushStream(element);
                    }, 30000);
                  });
                });
              } else {
                erJsBridge.appStopMultiVideo(function (data) {});
              }
            }, 300);


          } else {}
        },
        error: function (rData) {
          return;
        }
      });
    },
    //推流
    pushStream(item) {
      let _this = this;
      var url = IOTServer.pushStream;
      $.ajax({
        url: url,
        type: "POST",
        async: true,
        data: {
          deviceInfo: item.deviceInfo,
          accsessToken: item.accsessToken,
          playType: item.playType
        },
        success: function (rData) {
          console.log(JSON.stringify(rData));
          return;
        },
        error: function (rData) {
          console.log(JSON.stringify(rData));
          return;
        }
      });
    },
    getDeviceInfo(item) {
      var url = IOTServer.GetDeviceInfo;
      $.ajax({
          url: url,
          type: "POST",
          async: true,
          data: { deviceInfo: item.deviceInfo, accsessToken: item.accsessToken },
          success: function (rData) {
          }
      })
    },
    offset(obj, direction) {
      //将top,left首字母大写,并拼接成offsetTop,offsetLeft
      var offsetDir = 'offset' + direction[0].toUpperCase() + direction.substring(1);

      var realNum = obj[offsetDir];
      var positionParent = obj.offsetParent; //获取上一级定位元素对象

      while (positionParent != null) {
        realNum += positionParent[offsetDir];
        positionParent = positionParent.offsetParent;
      }
      return realNum;
    },
  },
  created() {
    vm.$nextTick(() => {
      let wrapId = '#liveVideoWrap' + this.config.ControlProperty.ID + '_' + this.indexList;
      this.returnVedioHeight = 'height: ' + parseInt(($(wrapId).innerWidth()) * 0.6) + 'px;';
      if(this.config.ControlProperty.PlayType) {
        this.playType = this.config.ControlProperty.PlayType;
      }
      this.getIOTToken();
      // this.getPlayUrl();
    })
  },
  beforeDestroy() {
    erJsBridge.appStopMultiVideo(function (data) {

    });
  },
};
