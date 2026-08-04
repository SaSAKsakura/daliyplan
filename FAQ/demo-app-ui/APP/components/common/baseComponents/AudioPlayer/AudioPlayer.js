var AudioPlayer = {
  name: "AudioPlayer",
  template: `
    <div 
      class="audio-player" 
      v-show="showPlayer"
      @click="onMaskClick"
    >
      <div class="player-content" @click.stop>
        <div class="audio-title">
          <span class="audio-title-dot"></span> <span>{{ fileName }}</span>
        </div>

        <div class="play-btn" @click="togglePlay">
          <img 
            style="width: 60px" 
            :src="getIcon(playerStatus)"
          />
        </div>
        <van-slider
          v-model="currentTime"
          :max="totalTime"
          @input="onSliderChange"
          bar-height="4"
          active-color="#1989fa"
        >
        <template #button>
          <div class="slider-btn"></div>
        </template>
        </van-slider>

        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(totalTime) }}</span>
        </div>

      </div>

       <div class="close-btn" @click="closePlayer">
          <img 
            style="width: 24px" 
            :src="getIcon('close')"
          />
        </div>
    </div>
  `,
  props: {
    file: {
      type: Object,
      required: true,
    },
    autoPlay: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      showPlayer: false,
      currentTime: 0,
      totalTime: 0,
      playerStatus: "ready", // 'ready'|'ended'|'playing'|'pause'|'error'
      timeUpdateInterval: null,
      curAmr: null, // 当前播放的amr实例
    };
  },
  computed: {
    fileName() {
      return this.file.file_name || "未知音频文件";
    },
    getPlayIconClass() {
      if (this.playerStatus === "playing") {
        return "playing";
      } else if (this.playerStatus === "ended") {
        return "replay";
      } else {
        return "pause";
      }
    },
  },
  methods: {
    openPlayer() {
      if (!this.file) {
        return;
      }
      this.showPlayer = true;
      this.initPlayer();
    },
    initPlayer() {
      this.currentTime = 0;
      this.totalTime = 0;
      this.playerStatus = "ready";

      let amr = this.file.amr;
      if (this.curAmr && this.curAmr !== amr) {
        this.curAmr.pause();
      }
      this.curAmr = amr;

      console.log(this.curAmr);

      if (!amr.isInit()) {
        // 初始化amr实例
        let audioUrl = this.getAudioUrl();

        // this.$toast.loading({
        //   duration: 0,
        //   message: "音频加载中",
        // });

        amr
          .initWithUrl(audioUrl)
          .then(() => {
            this.$toast.clear();
            this.totalTime = amr.getDuration();
            this.bindAmrEvents(amr);

            if (this.autoPlay) {
              amr.play();
            }
          })
          .catch((err) => {
            this.$toast.fail("音频加载异常");
            console.error("音频加载失败:", err);
            this.setStatus("error");
          });
      } else {
        // 已经初始化，直接绑定事件
        this.totalTime = amr.getDuration();
        this.bindAmrEvents(amr);

        if (this.autoPlay) {
          amr.playOrResume();
        }
      }
    },

    onSliderChange(value) {
      if (this.curAmr && this.curAmr.setPosition) {
        this.curAmr.setPosition(value);
        this.currentTime = value;

        if (this.playerStatus == "playing") {
          setTimeout(() => {
            if (this.curAmr && !this.curAmr.isPlaying()) {
              this.curAmr.playOrResume();
            }
          }, 100);
        }
      } else {
        this.currentTime = value;
      }
    },

    // 获取音频URL
    getAudioUrl() {
      if (this.file && this.file.IsTemp) {
        return this.file.file_path;
      }

      let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      this.file.file_guid = erTool.encrypt(this.file.file_guid, token);
      let url =
        baseUrl +
        erowplatformBackendUrl +
        "/file/downloadfile?fileGuid=" +
        encodeURIComponent(this.file.file_guid) +
        "&pValueSet=" +
        encodeURIComponent(this.config.pValueSet) +
        "&json=" +
        encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token }));

      if (this.file.fn_code) {
        url += "&fnCode=" + this.file.fn_code;
      }
      if (this.file.instance_guid) {
        this.file.instance_guid = erTool.encrypt(this.file.instance_guid, token);
        url += "&instanceGuid=" + encodeURIComponent(this.file.instance_guid);
      }
      if (this.getControlGUID) {
        url += "&controlGuid=" + encodeURIComponent(this.getControlGUID);
      }

      return url;
    },

    // 绑定amr事件
    bindAmrEvents(amr) {
      amr.onPlay(() => {
        this.setStatus("playing");
        this.startTimeUpdate(amr);
      });

      amr.onStop(() => {
        this.setStatus("ended");
        this.stopTimeUpdate();
        this.currentTime = 0;
      });

      amr.onPause(() => {
        this.setStatus("pause");
        this.stopTimeUpdate();
      });

      amr.onEnded(() => {
        this.setStatus("ended");
        this.currentTime = this.totalTime;
        this.stopTimeUpdate();
      });

      amr.onResume(() => {
        this.setStatus("playing");
        this.startTimeUpdate(amr);
      });
    },

    // 启动时间更新
    startTimeUpdate(amr) {
      this.stopTimeUpdate();
      this.timeUpdateInterval = setInterval(() => {
        this.currentTime = amr.getCurrentPosition();
        if (this.currentTime >= this.totalTime) {
          this.setStatus("ended");
          this.stopTimeUpdate();
        }
      }, 100);
    },

    // 停止时间更新
    stopTimeUpdate() {
      if (this.timeUpdateInterval) {
        clearInterval(this.timeUpdateInterval);
        this.timeUpdateInterval = null;
      }
    },

    // 播放/暂停切换
    togglePlay() {
      let amr = this.file.amr;

      if (amr.isPlaying()) {
        amr.pause();
      } else {
        amr.playOrResume();
      }
    },

    setStatus(status) {
      this.playerStatus = status;
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "00:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },

    closePlayer() {
      if (this.curAmr) {
        this.curAmr.stop();
        this.curAmr = null;
      }
      this.stopTimeUpdate();
      this.showPlayer = false;
      this.$emit("player-close");
    },

    getIcon(iconName) {
      if (iconName === "close") {
        return window.HTML_PATH + "/assets/images/icon/close-gray.png";
      } else if (iconName === "playing") {
        return window.HTML_PATH + "/assets/images/icon/audio-play2.png";
      } else {
        return window.HTML_PATH + "/assets/images/icon/audio-pause2.png";
      }
    },
    onMaskClick() {
      // 点击遮罩层时关闭弹窗
      this.closePlayer();
    },
  },
  mounted() {},
  beforeDestroy() {
    if (this.curAmr) {
      this.curAmr.stop();
      this.curAmr = null;
    }
    this.stopTimeUpdate();
  },
};
