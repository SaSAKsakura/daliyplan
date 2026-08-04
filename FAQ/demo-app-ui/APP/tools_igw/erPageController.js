/*
 * 依赖：android.js(igwJsBridge.js)
 */
(function () {
  "use strict";
  const PAGE_STACK_USER = "igwPageManager";
  const PAGE_STACK = "PAGE_STACK_CACHE_KEY";

  const pageManager = {
    pages: [],

    push(url, params = {}) {
      url = toAbsUrl(url);
      this.pages.push({
        url,
        params,
      });
      pushTo(url);
    },

    back() {
      this.pages.pop();
      if (this.pages.length > 0) {
        let page = this.pages[this.pages.length - 1];
        pushTo(page.url);
      }
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

    initialize(callback) {
      let tmpBlock = (data) => {
        if (data.resultFlag == -1 && Array.isArray(data.result)) {
          pageManager.pages = data.result;
        } else {
          pageManager.pages = [
            {
              url: window.location.pathname,
              params: {},
            },
          ];
        }
        if (callback) callback();
      };
      if (window.hasOwnProperty("erJsBridge")) {
        erJsBridge.getValue(PAGE_STACK_USER, PAGE_STACK, (data) => {
          tmpBlock(data);
        });
      } else {
        appGetValue(PAGE_STACK_USER, PAGE_STACK, (data) => {
          tmpBlock(data);
        });
      }
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
    if (window.hasOwnProperty("erJsBridge")) {
      erJsBridge.setValue(PAGE_STACK_USER, PAGE_STACK, pageManager.pages, 0, new Date(), (data) => {
        window.location.href = url + "?t=" + new Date().getTime();
      });
    } else {
      appSetValue(PAGE_STACK_USER, PAGE_STACK, JSON.stringify(pageManager.pages), 0, new Date(), (data) => {
        window.location.href = url + "?t=" + new Date().getTime();
      });
    }
  }

  function toAbsUrl(url) {
    let a = document.createElement("a");
    a.href = url;
    return a.href;
  }

  window.pageManager = pageManager;
})();
