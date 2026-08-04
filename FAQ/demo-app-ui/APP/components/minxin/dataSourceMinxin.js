var dataSourceMinxin = {
  data: function () {
    return {
      dataSourceObj: {},
    };
  },
  methods: {
    async runAsyncTasks(tasks) {
      const results = [];
      for (const task of tasks) {
        const result = await task();
        results.push(result);
      }
      return results;
    },
    generateKey(urlInfo, after) {
      return [urlInfo.FnCode, urlInfo.FnParamter || "", urlInfo.CtnrUID].join(".");
    },
    getCacheData(key) {
      return new Promise((res, rej) => {
        erJsBridge.getValue(1, key, (result) => {
          res(result);
        });
      });
    },

    async getSimpleContainerData(urlInfo) {
      let _this = this;

      let handleAfterGetData = (dataList) => {
        _this.$set(_this.dataSourceObj, this.generateKey(urlInfo), dataList);
        // eventEmitter.emit(key, );
      };
      let cacheKey = this.generateKey(urlInfo);
      let cacheInfo = await this.getCacheData(cacheKey);
      let cacheData = cacheInfo.result;
      return new Promise((resolve, reject) => {
        if (cacheData) {
          handleAfterGetData(cacheData);
          resolve();
        } else {
          let params = {};
          if (urlInfo.RelativeContainer) {
            console.log(extraParams);
          }
          erRequest.post(
            urlInfo.DataSrc,
            params,
            (res) => {
              if (res.code == "SUCCESS") {
                if (urlInfo.EnableCache && urlInfo.EnableCache.toLowerCase() == "true") {
                  localStorage.setItem(
                    cacheKey,
                    JSON.stringify({
                      cacheTime: new Date().getTime(),
                      expireTime: Number(urlInfo.CacheExpired) * 1000,
                      data: res.data,
                    })
                  );
                }
                handleAfterGetData(res.data || res.msg);
                resolve(res.data);
              } else {
                reject(res);
              }
            },
            (error) => {
              console.log(error);
            }
          );
        }
      });
    },

    getAllDataSync(dataSourceUrls) {
      let _this = this;
      //   let requests = {
      //     Key: "",
      //     urlMap: {
      //       CtnrUID: {
      //         url: "",
      //         params: "",
      //         enableCache: "",
      //         cacheExpired: "",
      //       },
      //     },
      //     order: [""],
      //   };
      let allRequest = [];
      if (Array.isArray(dataSourceUrls)) {
        dataSourceUrls.forEach((item) => {
          let urlInfo = item;
          allRequest.push(() => _this.getSimpleContainerData(urlInfo));
        });
      }
      if (allRequest.length) {
        this.runAsyncTasks(allRequest).then((res) => {});
      }
    },
    initDataSouce() {
      this.getAllDataSync(this.dataSourceUrls);
      this.registerUpdateEvent(this.dataSourceUrls);
    },
    registerUpdateEvent(dataSourceUrls) {
      let _this = this;
      if (Array.isArray(dataSourceUrls)) {
        dataSourceUrls.forEach((item) => {
          let urlInfo = item;
          eventEmitter.on("update" + this.generateKey(urlInfo), _this.getSimpleContainerData);
        });
      }
    },
  },
  computed: {
    dataSourceUrls() {
      return this.config.dataSourceUrls || {};
    },
  },
};
