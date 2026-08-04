const apis = {
  runSpeicalFun({ vm, funName, params, configItem }) {
    if (baseSpecial && erowConfig.hasProp(baseSpecial, funName)) {
      return baseSpecial[funName](params, vm);
    } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funName)) {
      return erowSpecial[funName](params, vm);
    } else {
      var fnObj = vm.config.ControlProperty.FnCode;
      return window[fnObj] && window[fnObj][funName] && window[fnObj][funName](params, vm, configItem);
    }
  },
  getDataSouceContainers(totalArr, result) {
    totalArr.forEach((item) => {
      // 遍历树
      const loop = (data) => {
        if (data.ControlCode == "UcDSContainer") {
          result.push(data);
        } else if (erowConfig.hasProp(data, "ChildContainers")) {
          data.ChildContainers.forEach((child) => {
            loop(child);
          });
        }
      };
      loop(item);
    });
    return result;
  },
  getAllDataSource(obj) {
    let copyData = erowConfig.deepClone(obj);
    let result = erowConfig.convertConfig(copyData.ChildContainers, {});
    return this.getDataSouceContainers(result, []);
  },
  generateDataSourceUrl(obj) {
    let dataSouces = this.getAllDataSource(obj); //获取得到所有的DataSource
    console.log(dataSouces, 11);
    let result = dataSouces.reduce((pre, cur) => {
      let temp = {};
      temp = cur.ControlProperty;
      pre.push(temp);
      return pre;
    }, []);
    return result.sort((a, b) => {
      if (a.RequestOrder && b.RequestOrder) {
        return a.RequestOrder - b.RequestOrder;
      } else {
        return true;
      }
    });
  },
  generateKey(obj) {
    let result = Object.keys(obj).reduce((pre, cur) => {
      if (obj[cur] && cur != "after") {
        pre.push(obj[cur]);
      }
      return pre;
    }, []);
    result.push(window.DepPath);
    result.push(obj.after);
    return result.join("_");
  },
  //通过内容删除key
  removeTargetKeyByConent(content) {
    //遍历本地存储localStorage
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i); //获取本地存储的Key
      let item = localStorage.getItem(key);
      if (item == content) {
        localStorage.removeItem(key);
      }
    }
  },

  sysLoadConfigData({ vm, params, success, fail, error }) {
    let _this = this;
    if (vm && vm.config && vm.config.ControlProperty.BeforeGetContainerConfig) {
      this.runSpeicalFun({ vm, funName: vm.config.ControlProperty.BeforeGetContainerConfig });
    }
    let pageParams = pageManager.getPageParams() || { keyValue: "" };

    let cacheKey = this.generateKey({
      userId: erUser.userId,
      controlGUID: params.controlGUID,
      menuRowGuid: params.menuRowGuid,
      pageMode: params.pageMode,
      after: "config",
      keyValue: pageParams.keyValue,
    });

    let realKey = localStorage.getItem(cacheKey);

    //本地获取配置后处理
    let handleLocalAfterGetConfig = (res) => {
      let currentTime = new Date().getTime();
      //过期则重新获取
      if (currentTime - res.cacheTime > res.expireTime) {
        app.db.delete(realKey, function () {
          console.log("删除成功");
        });
        getRemoteConfig();
      } else {
        let versionKey = this.generateKey({
          userId: erUser.userId,
          after: "versionlist",
        });
        let runSucc = async (data) => {
          let refJs = data && data.ControlProperty ? data.ControlProperty.RefJs : "";
          if (refJs) {
            await erowConfig.loadScrpit(refJs);
          }
          success && success({ data: data, pValueSet: res.pValueSet, code: "SUCCESS" });
          vm.$nextTick(() => {
            const ID = data.ControlProperty ? data.ControlProperty.ID : "";
            if (!ID) return;
            const tagetVm = pageContext[ID];
            if (!tagetVm) return;
            if (tagetVm.config.ControlProperty.AfterGetContainerConfig) {
              this.runSpeicalFun({
                vm: tagetVm,
                funName: tagetVm.config.ControlProperty.AfterGetContainerConfig,
                params: { data: data, pValueSet: res.pValueSet },
              });
            }
          });
        };
        //未过期把本地配置版本与最新的版本比对，不同则重新获取
        app.db.get(versionKey, (versionResult) => {
          let cacheConfig = JSON.parse(res.value);
          if (versionResult) {
            let versionList = JSON.parse(versionResult.value);
            let isSameVersion = false;
            //默认版本不一致，需比对版本一致后才使用
            let configVersion = cacheConfig ? cacheConfig.configVersion : null;
            let count = 0;
            configVersion &&
              Object.keys(configVersion).forEach((key) => {
                if (configVersion[key] && versionList[key] && configVersion[key] === versionList[key]) {
                  count++;
                }
              });
            isSameVersion = count == Object.keys(configVersion).length ? true : false;
            if (!isSameVersion) {
              getRemoteConfig();
            } else {
              runSucc(cacheConfig);
            }
          } else {
            getRemoteConfig();
          }
        });
      }
    };
    //获取远程配置
    let getRemoteConfig = () => {
      const paramsProxy = erowConfig.deepClone(params);
      delete paramsProxy.refreshFlag;
      erRequest.post(
        `${erowplatformBackendUrl}/appBaseApi/sysLoadConfigData`,
        paramsProxy,
        (res) => {
          if (res.code == "SUCCESS") {
            let succAction = async () => {
              let clone = erowConfig.deepClone(res);
              let dataSourceUrls = _this.generateDataSourceUrl(clone.data);
              let refJs = clone.data && clone.data.ControlProperty ? clone.data.ControlProperty.RefJs : "";
              if (refJs) {
                await erowConfig.loadScrpit(refJs);
              }
              if (res.data) {
                Object.assign(res.data, { dataSourceUrls: dataSourceUrls });
              }
              success && success(res);
              if (!vm) return;
              vm.$nextTick(() => {
                const ID = res.data && res.data.ControlProperty ? res.data.ControlProperty.ID : "";
                const IsCacheConfig = res.data && res.data.ControlProperty ? res.data.ControlProperty.IsCacheConfig : "";
                if (IsCacheConfig != "false" && pageConfig.IsCacheConfig) {
                  let realKey = _this.generateKey({
                    userId: erUser.userId,
                    containerId: ID,
                    pageMode: params.pageMode,
                    after: "config",
                    keyValue: pageParams.keyValue,
                  });

                  app.db.save(
                    {
                      name: realKey,
                      value: JSON.stringify(clone.data),
                      pValueSet: params.pValueSet,
                      cacheTime: new Date().getTime(),
                      expireTime: 8 * 60 * 60 * 1000,
                    },
                    function () {
                      _this.removeTargetKeyByConent(realKey);
                      localStorage.setItem(cacheKey, realKey);
                      console.log("insert succ");
                    }
                  );
                }

                if (!ID) return;
                const tagetVm = vm;
                // if (!tagetVm) return;
                if (res.data.ControlProperty && res.data.ControlProperty.AfterGetContainerConfig) {
                  this.runSpeicalFun({ vm: tagetVm, funName: res.data.ControlProperty.AfterGetContainerConfig, params: res });
                }
              });
            };
            succAction();
          } else {
            fail && fail(res);
          }
        },
        (msg) => {
          error && error(msg);
        }
      );
    };
    if (params.refreshFlag != "refresh" && realKey && realKey != "undefined"&&pageConfig.IsCacheConfig) {
      //indexed db name
      //查询
      app.db.get(realKey, function (res) {
        if (res && res.value && res.value != "{}" && res.value != "undefined") {
          handleLocalAfterGetConfig(res);
        } else {
          getRemoteConfig();
        }
      });
    } else {
      getRemoteConfig();
    }
  },
  sysLoadDBData({ vm, params, success, fail, error }) {
    let _this = this;
    vm &&
      vm.config &&
      vm.config.ControlProperty.BeforeGetContainerData &&
      this.runSpeicalFun({ vm, funName: vm.config.ControlProperty.BeforeGetContainerData });
    let cacheKey = this.generateKey({
      userId: erUser.userId,
      controlGUID: params.controlGUID,
      menuRowGuid: params.menuRowGuid,
      pageMode: params.pageMode,
      keyValue: vm.config.keyValue,
      after: "data",
      page: params.page,
      rows: params.rows,
    });

    let realKey = localStorage.getItem(cacheKey);
    let getRemoteData = () => {
      const paramsProxy = erowConfig.deepClone(params);
      delete paramsProxy.refreshFlag;
      erRequest.post(
        `${erowplatformBackendUrl}/appBaseApi/sysLoadDBData`,
        paramsProxy,
        (res) => {
          if (res.code == "SUCCESS") {
            success && success(res);
            vm &&
              vm.config &&
              vm.config.ControlProperty.AfterGetContainerData &&
              this.runSpeicalFun({ vm, funName: vm.config.ControlProperty.AfterGetContainerData, params: res });
            if (!vm) return;
            vm.$nextTick(() => {
              if (vm.config.ControlProperty.IsCacheContainerData == "true") {
                const ID = vm.config.ControlProperty ? vm.config.ControlProperty.ID : "";
                let realKey = _this.generateKey({
                  userId: erUser.userId,
                  containerId: ID,
                  pageMode: params.pageMode,
                  keyValue: vm.config.keyValue,
                  after: "data",
                  page: params.page,
                  rows: params.rows,
                });
                app.db.save(
                  {
                    name: realKey,
                    value: JSON.stringify(res.data),
                    pValueSet: params.pValueSet,
                    cacheTime: new Date().getTime(),
                    expireTime: 2 * 60 * 60 * 1000,
                  },
                  function () {
                    _this.removeTargetKeyByConent(realKey);
                    localStorage.setItem(cacheKey, realKey);
                    console.log("insert succ");
                  }
                );
              }
            });
          } else {
            fail && fail(res);
          }
        },
        (msg) => {
          error && error(msg.responseJSON);
        }
      );
    };
    let handleLocalAfterGetData = (res) => {
      let currentTime = new Date().getTime();
      // Unable to add key to index 'name': at least one key does not satisfy the uniqueness requirements.
      //过期则重新获取
      if (currentTime - res.cacheTime > res.expireTime) {
        app.db.delete(realKey, function () {
          console.log("删除成功");
        });
        getRemoteData();
      } else {
        let data = JSON.parse(res.value);
        success && success({ data: data, pValueSet: res.pValueSet, code: "SUCCESS" });
        vm &&
          vm.config &&
          vm.config.ControlProperty.AfterGetContainerData &&
          this.runSpeicalFun({ vm, funName: vm.config.ControlProperty.AfterGetContainerData, params: { data: data } });
      }
    };

    if (params.refreshFlag != "refresh" && vm.config && vm.config.refreshFlag != "refresh") {
      if (realKey && realKey != "undefined") {
        //查询
        app.db.get(realKey, function (res) {
          if (res) {
            handleLocalAfterGetData(res);
          } else {
            getRemoteData();
          }
        });
      } else {
        getRemoteData();
      }
    } else {
      getRemoteData();
    }
  },
  sysLoadControlData({ vm, params, success, fail, error }) {
    let _this = this;
    let cacheKey = this.generateKey({
      userId: erUser.userId,
      controlGUID: params.controlGUID,
      menuRowGuid: params.menuRowGuid,
      pageMode: params.pageMode,
      keyValue: vm.config.keyValue,
      after: "control",
    });

    let realKey = localStorage.getItem(cacheKey);

    let getRemoteControl = () => {
      const paramsProxy = erowConfig.deepClone(params);
      delete paramsProxy.refreshFlag;
      erRequest.post(
        `${erowplatformBackendUrl}/appBaseApi/sysLoadControlData`,
        paramsProxy,
        (res) => {
          if (res.code == "SUCCESS") {
            success && success(res);
            if (!vm) return;
            vm.$nextTick(() => {
              const ID = vm.config.ControlProperty ? vm.config.ControlProperty.ID : "";
              let IsCacheCtrolData = vm.config._IsCacheCtrolData;
              //配置了IsCacheCtrolData  才会缓存，
              if (IsCacheCtrolData != "false" && pageConfig.IsCacheCtrolData) {
                let realKey = _this.generateKey({
                  userId: erUser.userId,
                  containerId: ID,
                  pageMode: params.pageMode,
                  keyValue: vm.config.keyValue,
                  after: "control",
                });
                app.db.save(
                  {
                    name: realKey,
                    value: JSON.stringify(res.data),
                    pValueSet: params.pValueSet,
                    cacheTime: new Date().getTime(),
                    expireTime: 8 * 60 * 60 * 1000,
                  },
                  function () {
                    _this.removeTargetKeyByConent(realKey);
                    localStorage.setItem(cacheKey, realKey);
                    console.log("insert succ");
                  }
                );
              }
            });
          } else {
            fail && fail(res);
          }
        },
        (msg) => {
          error && error(msg);
        }
      );
    };
    let handleLocalAfterGetControl = (res) => {
      let currentTime = new Date().getTime();
      //
      //过期则重新获取
      if (currentTime - res.cacheTime > res.expireTime) {
        app.db.delete(realKey, function () {
          console.log("删除成功");
        });
        getRemoteControl();
      } else {
        let data = JSON.parse(res.value);
        success && success({ data: data, pValueSet: res.pValueSet, code: "SUCCESS" });
      }
    };

    if (vm.config && vm.config.refreshFlag != "refresh" && realKey && realKey != "undefined") {
      //查询
      app.db.get(realKey, function (res) {
        if (res) {
          handleLocalAfterGetControl(res);
        } else {
          getRemoteControl();
        }
      });
    } else {
      getRemoteControl();
    }
  },
  getAppMenuData({ vm, params, success, fail, error, noLastMenucallback }) {
    let getRemoteMenuData = () => {
      erRequest.post(
        `${erowplatformBackendUrl}/appBaseApi/getAppMenuData`,
        params,
        (res) => {
          if (res.code == "SUCCESS") {
            let lastmenu = JSON.parse(localStorage.getItem("lastMenu"));
            if (lastmenu) {
              let temp = res.data.find((item) => {
                return item.menu_row_guid == lastmenu.menu_row_guid;
              });
              if (temp) {
                for (let i = pageManager.pages.length - 1; i >= 0; i--) {
                  let tempPage = pageManager.pages[i];
                  if (tempPage && tempPage.params.menu_row_guid == temp.menu_row_guid)
                    pageManager.updateParams(pageManager.pages.length - 1, {
                      menuHandleKey: temp.menuHandleKey,
                      menuConfigKey: temp.menuConfigKey,
                    });
                }
              }
              vm.pageParams = pageManager.getPageParams();
              localStorage.removeItem("lastMenu");
            }

            success && success(res);
            if (!vm) return;
          } else {
            fail && fail(res);
          }
        },
        (msg) => {
          error && error(msg);
        }
      );
    };

    if (localStorage.getItem("lastMenu")) {
      getRemoteMenuData();
    } else {
      noLastMenucallback && noLastMenucallback();
    }
  },
  //处理页面  获取配置错误
  handleGetConfigError(code, msg) {
    //A0001，用户端错误
    // A0120，密码校验失败
    // A0122，密码强度不够
    // A0200，用户登录异常
    // A0201，用户账户不存在
    // A0210，用户密码错误
    // A0212，用户密码已过期
    // A0220，用户身份校验失败
    // A0223
    // A0230，用户登录已过期
    // A0240，用户验证码错误
    // A0242，用户验证码已过期
    // A0300，访问权限异常
    // A0312，无权限使用 API
    // A0400，用户请求参数错误
    // A0410，请求必填参数为空
    // A0421，参数格式不匹配
    // A0600，匹配到多个用户
    let tokenErrorCode = ["A0200", "A0201", "A0210", "A0212", "A0220", "A0223", "A0230", "A0300", "FORBIDDEN", "LOGIN_AGAIN"];
    let flag1 = msg && msg.indexOf("登录") != -1 && msg.indexOf("过期") != -1;
    let flag2 = msg && msg.indexOf("登陆") != -1 && msg.indexOf("过期") != -1;
    let flag3 = msg && msg.indexOf("令牌") != -1 && msg.indexOf("存在") != -1;
    //不是token 里面的错误码和不是token里面报的错误信息，因为其他原因导致的获取配置失败，跳转上一级
    if (!tokenErrorCode.includes(code) && !(flag1 || flag2 || flag3)) {
      this.$message("error", msg);
      setTimeout(() => {
        pageManager.go(-1);
      }, 3000);
    }
  },
  //获取版本号
  getConfigVersionList({ vm, params, success, fail, error }) {
    let cacheKey = this.generateKey({
      userId: erUser.userId,
      after: "versionlist",
    });
    //本地获取版本后处理
    let handleAfterGetLocalVersion = (res) => {
      let currentTime = new Date().getTime();
      //过期则重新获取
      if (currentTime - res.cacheTime > res.expireTime) {
        app.db.delete(cacheKey, function () {
          console.log("删除成功");
        });
        getRemoteVersion();
      }
    };
    //获取远程版本配置
    let getRemoteVersion = () => {
      erRequest.post(
        `${erowplatformBackendUrl}/appBaseApi/getConfigVersionList`,
        {},
        (res) => {
          let data = res.data ? res.data.configVersion : "";

          if (res.code == "SUCCESS" && data) {
            let decryData = erTool.decrypt(data, erUser.token, 16);
            app.db.save(
              {
                name: cacheKey,
                value: decryData,
                cacheTime: new Date().getTime(),
                expireTime: 60 * 1000, //缓存1分钟，一分钟后失效重取获取
              },
              function () {
                console.log("insert succ");
              }
            );
          } else {
            fail && fail(res);
          }
        },
        (msg) => {
          error && error(msg);
        }
      );
    };
    //查询
    app.db.get(cacheKey, function (res) {
      if (res && res.value && res.value != "{}" && res.value != "undefined") {
        handleAfterGetLocalVersion(res);
      } else {
        getRemoteVersion();
      }
    });
  },
};
