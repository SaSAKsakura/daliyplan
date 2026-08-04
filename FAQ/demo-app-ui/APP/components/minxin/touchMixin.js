let touchMixin = {
  data() {
    return {
      startX: 0, // 触摸起始点X坐标
      currentIndex: null, // 当前操作的卡片索引
    };
  },
  methods: {
    touchStart(e, index) {
      if(!this.isRenderDelete){
         return 
      }
      // 记录初始触摸位置和当前卡片索引
      this.startX = e.touches[0].clientX;
      this.currentIndex = index;
    },
    touchMove(e, index) {
      if(!this.isRenderDelete){
         return 
      }
      if (this.currentIndex !== index) {
        return;
      }
      const currentX = e.touches[0].clientX;
      const diffX = currentX - this.startX;

      // 限制滑动方向，只允许向左滑动（diffX为负值）
      if (diffX < 0) {
        // 阻止默认事件，避免页面滚动
        e.preventDefault();
        // 设置最大滑动距离，比如滑到删除按钮的宽度（例如80px）就不要再滑了
        const maxOffset = -80;
        this.listData[index].offsetX = diffX > maxOffset ? diffX : maxOffset;
      }
    },
    touchEnd(e, index) {
      console.log(index);
      if(!this.isRenderDelete){
         return 
      }
      if (this.currentIndex !== index) {
        return;
      }
      const currentX = e.changedTouches[0].clientX;
      const diffX = currentX - this.startX;
      // 如果滑动距离超过删除按钮的一半，则自动滑出删除按钮，否则回弹
      const threshold = -40;
      let temp = this.listData[index];
      if (diffX < threshold) {
        temp.offsetX = -80;
      } else {
        temp.offsetX = 0;
      }
      this.listData.splice(index, 1, temp);
      this.currentIndex = null;
    },
  },
};
