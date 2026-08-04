/*
 * 依赖：android.js
 */
(function () {
  const userInfo = {
    token: "",
    userId: "",
    userName: "",
    uniqueID: "",
    publicFlag: "",
    versionNumber: "",
    teamName: "",
    currentDataMaster: "",
    userDataMasterList: "",
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
          //调试从localStorage 中取
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getParameter("teamName", (data) => {
          if (data.result.value) userInfo.teamName = data.result.value;
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getParameter("currentDataMaster", (data) => {
          if (data.result.value) userInfo.currentDataMaster = data.result.value;
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getParameter("userDataMasterList", (data) => {
          if (data.result.value) userInfo.userDataMasterList = data.result.value;
          res(data);
        });
      }),
      new Promise((res) => {
        erJsBridge.getParameter("oldUserInfo", (data) => {
          if (data.result.value) userInfo.oldUserInfo = data.result.value;
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
