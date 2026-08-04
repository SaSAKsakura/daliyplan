var UcAnswerField = {
  name: "UcAnswerField",
  mixins: [commonMinxin],
  template: `
	  <div class="UcAnswerField">
      <div class="UcAnswerField-tool">
        <div class="UcAnswerField-RSValue">
          <span>{{ RSValue }}</span>
          <span class="UcAnswerField-ans" v-if="isShowAns">
            {{ hiddenInfo }}
          </span>
        </div>
        <div class="UcAnswerField-right">
          <span  class="UcAnswerField-timer" v-if="!isShowEye">{{ leftTime }}</span>
          <img
            class="UcAnswerField-eye"
            :src="eyeImg"
            v-else
            alt=""
            @click.stop="eyeClick"
          />
        </div>
      </div>
      <!-- <div class="UcAnswerField-ans" v-if="isShowAns">
        {{ hiddenInfo }}
      </div> -->
    </div>
	`,
  props: {
    config: Object,
    disabled: Boolean,
    value: String,
    controldata: Object,
    detailData: Object,
    containerdata: Object,
  },
  data() {
    return {
      delayTime: 5,
      timer: null,
      leftTime: 5,
      isShowEye: false,
      isShowAns: false,
    };
  },
  computed: {
    RSValue() {
      return this.config.ControlProperty.RSValue;
    },
    eyeImg() {
      if (this.isShowAns) {
        // return "../assets/images/public/blue-eye.png";
        return this.getImgFileUrl({ parentFilePath: "public", filename: "blue-eye", fileType: "png" });
      } else {
        // return "../assets/images/public/hui-eye.png";
        return this.getImgFileUrl({ parentFilePath: "public", filename: "hui-eye", fileType: "png" });
      }
    },
    hiddenInfo() {
      let DataField = this.config.ControlProperty.DataField;
      return this.containerdata[DataField] || this._formPrimaryData[DataField];
    },
    currentItem() {
      // inject
      if (!this.current) return 0;
      return this.current();
    },
  },
  inject: {
    current: {
      default: "",
    },
  },
  watch: {
    currentItem(val) {
      this.startTimer();
    },
  },
  methods: {
    eyeClick() {
      this.isShowAns = !this.isShowAns;
    },
    startTimer() {
      if (this.timer) {
        window.clearInterval(this.timer);
      }
      this.leftTime = this.delayTime;
      this.isShowEye = false;
      this.isShowAns = false;
      this.timer = setInterval(() => {
        this.leftTime--;
        if (this.leftTime <= 0) {
          window.clearInterval(this.timer);
          this.timer = null;
          this.isShowEye = true;
        }
      }, 1000);
    },
  },
  created() {
    this.delayTime = Number(this.config.ControlProperty.DelayTime || "5") || 5;
  },
  mounted() {
    this.startTimer();
  },
};
