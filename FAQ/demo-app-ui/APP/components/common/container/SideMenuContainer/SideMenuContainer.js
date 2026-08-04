var SideMenuContainer = {
  name: "SideMenuContainer",
  mixins: [commonMinxin],
  template: `
    <div class="SideMenuContainer" :class="activeClass()">
      <div class="side-back" @click="gotoBack">
        <img src="../assets/images/icon/back.png" />
        <p>返回</p>
      </div>
      <div class="side-item" v-for="item in menuList" @click="goMenu(item)" :class="{active: item.menu_row_guid === config.menuRowGuid}">
        <img :src="getImgSrc(item)" @error="setDefautImg" />
        <span>{{item.menu_name}}</span>
      </div>
    </div>
	`,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
    containerdata: {
      type: [Array, Object, String],
    },
  },
  data: () => ({
    menuPre: "../assets/images/menu/",
    menuList: [],
  }),
  computed: {},
  watch: {},
  methods: {
    getImgSrc(item) {
      let temp = `${this.menuPre}${item.fn_code}`;
      if (item.fn_parameter) {
        temp += `_${item.fn_parameter}`;
      }
      if (item.menu_row_guid === this.config.menuRowGuid) {
        temp += "_active";
      }
      return `${temp}.png`;
    },
    goMenu(item) {
      if (item.pageUrl) {
        pageManager.push(item.pageUrl, item);
      }
    },
    gotoBack() {
      if (!pageContext.root.removeLayer(this.config)) {
        localStorage.removeItem(this.config.pValueSet);
        pageContext["root"].closeForm();
      }
    },
  },
  created() {
    const tabletMenu = sessionStorage.getItem("tabletMenu");
    if (tabletMenu) {
      this.menuList = JSON.parse(tabletMenu);
    }
  },
};
