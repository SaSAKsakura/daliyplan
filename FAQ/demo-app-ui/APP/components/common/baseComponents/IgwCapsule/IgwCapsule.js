var IgwCapsule = {
  template: `
          <div class="_igw_capsule_className app_capsule" v-if='igwMode'>
            <img style="width: 24px;" src="../assets/Images/common/point-igw.png" @click="handleBtn()">
            <div style="width: 1px;height: 18px;background-color: #CCCCCC;"></div>
            <img style="width: 24px;" src="../assets/Images/common/close-igw.png" @click="exitIGWAPP()">
          </div>
	`,
  data() {
    return { igwMode: igwMode };
  },
  methods: {
    handleBtn() {
      CAPSULE.show();
    },
    exitIGWAPP() {
      this.$dialog
        .confirm({
          title: "系统消息",
          message: "确定退出应用？",
        })
        .then(() => {
          wx.invoke("multiWindows_close", {}, function (res) {});
        });
    },
  },
  mounted() {},
};
