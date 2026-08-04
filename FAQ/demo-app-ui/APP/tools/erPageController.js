/*
 * 依赖：android.js
 */
(function () {
  "use strict";
  const PAGE_STACK_USER = "pageManagerAJ";
  const PAGE_STACK = "PAGE_STACK_CACHE_KEY";
  let isReady = false;
  let readyCallback = null;

  const pageManager = {
    pages: [],
    pageManagerReady(callback) {
      // 因为是存在app沙盒里，在取出数据前不应进行任何操作
      // 在pageManger未获取到本地数据前可调用该函数
      if (isReady) {
        if (callback) callback();
      } else {
        readyCallback = callback;
      }
    },
    updateParams(index, newParams) {
      if (this.pages[index]) {
        Object.keys(newParams).forEach((key) => {
          this.pages[index].params[key] = newParams[key];
        });
      }
      if (window.hasOwnProperty("erJsBridge")) {
        erJsBridge.setValue(PAGE_STACK_USER, PAGE_STACK, pageManager.pages, 0, new Date(), (data) => {
          console.log("update params");
        });
      } else {
        appSetValue(PAGE_STACK_USER, PAGE_STACK, JSON.stringify(pageManager.pages), 0, new Date(), (data) => {
          console.log("update params");
        });
      }
    },
    push(url, params = {}) {
      url = toAbsUrl(url);
      this.pages.push({
        url,
        params,
        lastBaseConfigKey: localStorage.getItem("currentConfigKey"),
      });
      pushTo(url);
    },

    back() {
      let params = this.getPageParams();
      let lastPage = this.pages.pop();
      if (lastPage.lastBaseConfigKey !== localStorage.getItem("currentConfigKey")) {
        localStorage.setItem("currentConfigKey", lastPage.lastBaseConfigKey);
      }
      if (params.fromOther && params.fromOther === -1) {
        erJsBridge.pageReturn((data) => {});
      } else {
        if (this.pages.length > 0) {
          let page = this.pages[this.pages.length - 1];
          pushTo(page.url);
        }
      }
      // this.pages.pop();
      // if (this.pages.length > 0) {
      //   let page = this.pages[this.pages.length - 1];
      //   pushTo(page.url);
      // }
    },

    go(index) {
      let position = this.pages.length + index;
      if (position < 1) position = 1;
      this.pages.splice(position);
      let page = this.pages[this.pages.length - 1];
      pushTo(page.url);
    },

    replace(url, params, index = 0) {
      let position = this.pages.length + index - 1;
      if (position < 0) position = 0;
      this.pages.splice(position);
      this.push(url, params);
    },

    reset(pages, callback) {
      this.pages = pages;
      pages.forEach((page) => {
        if (!page.hasOwnProperty("params")) {
          page.params = {};
        }
      });
      if (window.hasOwnProperty("erJsBridge")) {
        erJsBridge.setValue(PAGE_STACK_USER, PAGE_STACK, this.pages, 0, new Date(), callback);
      } else {
        appSetValue(PAGE_STACK_USER, PAGE_STACK, JSON.stringify(this.pages), 0, new Date(), callback);
      }
    },

    getPageParams() {
      let page = this.pages[this.pages.length - 1];
      return page.params || {};
    },
    resetCurrentPage() {
      //重置当前page的Url,
      if (this.pages.length) {
        let lastPage = this.pages[this.pages.length - 1];
        let isEntrance = lastPage.url.indexOf("template/Entrance.html") != -1;
        let isPageList = window.location.pathname.indexOf("template/pageList.html") != -1;
        let isDetail = window.location.pathname.indexOf("template/detail.html") != -1;
        if (isEntrance && (isPageList || isDetail)) {
          lastPage.url = window.location.href;
          this.pages.splice(this.pages.length - 1, 1, lastPage);
          if (window.hasOwnProperty("erJsBridge")) {
            erJsBridge.setValue(PAGE_STACK_USER, PAGE_STACK, pageManager.pages, 0, new Date(), (data) => {});
          } else {
            appSetValue(PAGE_STACK_USER, PAGE_STACK, JSON.stringify(pageManager.pages), 0, new Date(), (data) => {});
          }
        }
      }
    },
  };

  function pushTo(url) {
    if (window.location.href.indexOf("pageList") !== -1 && url.indexOf("detail") !== -1) {
      window.pageListToDetail = true;
      setTimeout(() => {
        window.pageListToDetail = false;
      }, 1000);
    }
    if (window.hasOwnProperty("erJsBridge")) {
      erJsBridge.setValue(PAGE_STACK_USER, PAGE_STACK, pageManager.pages, 0, new Date(), (data) => {
        if (url.indexOf("?") == -1) {
            window.location.href = url + "?t=" + new Date().getTime();
          } else {
            window.location.href = url;
          }
      });
    } else {
      appSetValue(PAGE_STACK_USER, PAGE_STACK, JSON.stringify(pageManager.pages), 0, new Date(), (data) => {
        if (url.indexOf("?") == -1) {
            window.location.href = url + "?t=" + new Date().getTime();
          } else {
            window.location.href = url;
          }
      });
    }
  }

  function toAbsUrl(url) {
    let a = document.createElement("a");
    a.href = url;
    return a.href;
  }

  (function () {
    let defaultPages = () => {
      if (window.location.pathname.indexOf("/template/Default.html") == -1) {
        pageManager.pages = [
          {
            url: window.location.pathname.substring(0, window.location.pathname.indexOf("/Html/") + 5) + "/template/Default.html",
            params: {},
          },
          {
            url: window.location.pathname,
            params: {},
          },
        ];
      } else {
        pageManager.pages = [
          {
            url: window.location.pathname,
            params: {},
          },
        ];
      }
    };
    let tmpBlock = (data) => {
      if (data.resultFlag == -1 && Array.isArray(data.result)) {
        pageManager.pages = data.result;
      } else if (data.resultFlag == -1 && typeof data.result === "string" && data.result.length > 0) {
        try {
          pageManager.pages = JSON.parse(decodeURIComponent(data.result));
        } catch (error) {
          defaultPages();
        }
      } else {
        defaultPages();
      }
      isReady = true;
      if (readyCallback) {
        readyCallback();
        readyCallback = null;
      }
    };
    if (window.hasOwnProperty("erJsBridge")) {
      erJsBridge.getValue(PAGE_STACK_USER, PAGE_STACK, (data) => {
        tmpBlock(data);
      });
    } else {
      if (!androidReturnValue) {
        initAndroidReturnValue();
      }
      appGetValue(PAGE_STACK_USER, PAGE_STACK, (data) => {
        tmpBlock(data);
      });
    }
  })();

  window.pageManager = pageManager;
})();
