var CameraOperate = {
  name: "CameraOperate",
  template: `<div>
      <div class="toolbar">
        <div class="control1">
            <div class="playLeft" @click.stop='ptz(3);'></div>
            <div class="play"></div>
            <div class="playRight" @click.stop='ptz(4);'></div>
            <div class="playTop" @click.stop='ptz(1);'></div>
            <div class="playBottom" @click.stop='ptz(2);'></div>
        </div>
        <div class="control2">
            <div class="playJin" @click.stop='ptz(5);'></div>
            <div class="playYuan" @click.stop='ptz(6);'></div>
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
    iotToken: "",
    playType: "",
    onlineFlag: "",
    playUrl: "",
    deviceInfo: "",
    currentPageVideoList: [{
      videoUrl: "",
      accsessToken: "",
    }],
    pushInterval: null,
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
    ptz(direction) {
      var url = IOTServer.videoPTZControl;
      $.ajax({
        url: url,
        type: "POST",
        async: true,
        data: {
          deviceInfo: currentPageVideoList[0].deviceInfo,
          accsessToken: currentPageVideoList[0].accsessToken,
          direction: direction
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
  },
  created() {},
};
