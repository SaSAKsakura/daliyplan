var orientationMixin = {
  data() {
    const orientationConstants = {
      vertical: "PORTRAIT",
      horizontal: "LANDSCAPE",
    };
    return {
      orientationConstants,
      currentPreviewOrientation: orientationConstants.vertical,
    };
  },
  beforeDestroy() {
    if (!debugMode) {
      this.setOrientationToVertical();
    }
  },
  methods: {
    // 横竖屏
    async setOrientationToVertical() {
      const { orientationConstants } = this;
      await this.initOrientation(orientationConstants.vertical);
    },
    async handleToggleOrientation() {
      const { orientationConstants, currentPreviewOrientation } = this;
      if (orientationConstants.vertical == currentPreviewOrientation) {
        await this.initOrientation(orientationConstants.horizontal);
        return;
      }
      if (orientationConstants.horizontal == currentPreviewOrientation) {
        await this.initOrientation(orientationConstants.vertical);
        return;
      }
    },
    async initOrientation(orientation) {
      await new Promise((resolve, reject) => {
        erJsBridge.setWindowOrientation(orientation, (res) => {
          if (res && res.resultFlag) {
            resolve(res);
            return;
          }

          reject(res);
        });
      });

      this.currentPreviewOrientation = orientation;
    },
  },
};
