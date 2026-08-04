(function () {
  const initialize = (callback) => {
    const complete = () => {
      Promise.all([
        new Promise((res) => {
          window.getErUserInfo &&
            window.getErUserInfo((user) => {
              res(user);
            });
        }),
        new Promise((res) => {
          if (window.pageManager) {
            res(window.pageManager);
          }
        }),
        new Promise((res) => {
          const width = 375;
          const scale = window.innerWidth / width;
          let meta = document.querySelector("meta[name=viewport]");
          let content = `width=${width}, initial-scale=${scale}, user-scalable=no`;
          if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "viewport");
            document.head.appendChild(meta);
          }
          meta.setAttribute("content", content);
          res();
        }),
      ]).then((ret) => {
        if (callback) callback(ret[0], ret[1]);

        // 主题色初始化
        const erowConfig = window.erowConfig;
        if (erowConfig.initTopic && typeof erowConfig.initTopic == "function") {
          erowConfig.initTopic();
        }
      });
    };

    complete();
  };

  const erMain = {
    initialize,
  };

  window.erMain = erMain;
})();
