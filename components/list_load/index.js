Component({
  externalClasses: ['wr-class', 'wr-class--no-more'],

  options: { multipleSlots: true },

  properties: {
    status: {
      type: Number,
      value: 0,
    }
  },

  methods: {
    /** 点击处理 */
    tapHandle() {
      // 失败重试
      if (this.data.status === 3) {
        this.triggerEvent('retry');
      }
    },
  },
});
