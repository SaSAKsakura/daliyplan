var FilePreviewContainer = {
  template: `
    <van-image-preview @close='closeLayer' class="images-in-fileContainer" :start-position="currentIndex" v-model="showPic" :images="imageList"></van-image-preview>
    `,
  mixins: [commonMinxin],
  data() {
    return {
      showPic: true,
      currentIndex: 0,
    };
  },
  props: {
    config: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    imageList() {
      let fileList = this.config.params.fileList;
      let temp = [];
      fileList.forEach((file) => {
        let params = {
          fnCode: file.fnCode || this.config.fnCode,
          fileGuid: file.file_guid,
          instanceGuid: file.instance_guid,
        };
        temp.push(this.getDownLoadUrl(params, this));
      });
      return temp;
    },
  },
  methods: {
    closeLayer() {
      pageContext.root.removeLayer(this.config);
    },
  },
};
