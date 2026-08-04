var FormRate = {
  name: "FormRate",
  template: `
    <div class="FormRate-container">
           
          </div>
        `,
  props: {
    config: Object,
    options: Object,
    disabled: Boolean,
    value: String,
    detailData: Object,
  },
  data: () => ({
    active: 0,
    itemList: [],
  }),
  computed: {},
  watch: {
    value() {
      this.reset();
    },
  },
  methods: {
    reset() {
      let initVal = typeof this.value == "undefined" ? this.options.DefaultValue : this.value;
      this.itemList = this.options.dataList;
      this.active = this.itemList.findIndex((item) => {
        return item[this.config.ControlProperty.DataValueField] == initVal;
      });
      if (Array.isArray(this.itemList)) {
        this.itemList.forEach((item) => {
          item[this.config.ControlProperty.DataValueField] = item[this.config.ControlProperty.DataValueField] + "";
        });
      }
    },
  },
  created() {},
};
