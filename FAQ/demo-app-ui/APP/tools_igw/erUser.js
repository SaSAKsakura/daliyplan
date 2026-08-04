/*
 * 依赖：android.js(igwJsBridge.js)
 */
(function () {
  const userInfo = {
    token: "",
    userId: "",
    userName: "",
    uniqueID: "",
    publicFlag: "",
    versionNumber: "",
    oldUserInfo: "",
  };

  const getUserInfos = function (callback) {
    Promise.all([
      new Promise((res) => {
        erJsBridge.getVersionNumber((data) => {
          userInfo.versionNumber = data.result.version_name;
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getUniqueID((data) => {
          userInfo.uniqueID = data.result.unique_id;
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getParameter("userID", (data) => {
          if (data.result.value) userInfo.userId = data.result.value;
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getParameter("userName", (data) => {
          if (data.result.value) userInfo.userName = data.result.value;
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getParameter("token", (data) => {
          if (data.result.value) userInfo.token = data.result.value;
          userInfo.token = "52fd3a8ba3eb46a1be2c43c342b95102";
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getParameter("oldUserInfo", (data) => {
          if (data.result.oldUserInfo) userInfo.oldUserInfo = data.result.value;
          res(data);
        });
      }),
    ]).then((ret) => {
      window.erUser = userInfo;
      callback(userInfo);
    });
  };

  window.getErUserInfo = getUserInfos;
})();
