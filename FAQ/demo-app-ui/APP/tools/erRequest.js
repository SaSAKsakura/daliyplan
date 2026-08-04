/*
 * 依赖：jQuery.js
 */
(function () {
  const erowRequest = {
    requestMap: [],

    unifiedRequest(url, ctnrUID, menuConfigKey, params, opCode, success, fail) {
      let headers = {
        Authorization: window.hasOwnProperty("erUser") ? erUser.token : _Token,
      };
      let data = {
        ctnrUID,
        menuConfigKey,
        paramMap: params,
        opCode,
      };
      this.request({
        url,
        type: "POST",
        headers,
        data: JSON.stringify(data),
        dataType: "JSON",
        contentType: "application/json",
        success,
        error: fail,
      });
    },

    get(url, params, success, fail, contentType) {
      let options = {
        url,
        type: "GET",
        headers: {
          Authorization: window.hasOwnProperty("erUser") ? erUser.token : "",
        },
        data: params,
        dataType: "JSON",
        success,
        error: fail,
      };
      if (contentType) options.contentType = contentType;
      this.request(options);
    },

    post(url, params, success, fail, contentType) {
      let tempUrl = url.indexOf("http") != -1 ? url : baseUrl + url;
      let options = {
        url: tempUrl,
        type: "POST",
        headers: {
          Authorization: window.hasOwnProperty("erUser") ? erUser.token : "",
          DataSign: erTool.generateUUID(),
        },
        contentType: contentType === undefined ? "application/json" : contentType,
        dataType: "JSON",
        success,
        error: fail,
      };
      if (params && options.contentType == "application/json") {
        options.data = JSON.stringify(params);
      } else {
        options.data = params;
      }

      if (contentType) options.contentType = contentType;
      this.request(options);
    },

    postForm(url, params, success, error, hasFile = false) {
      let formdata = new FormData();
      Object.keys(params).forEach((key) => {
        formdata.append(key, params[key]);
      });
      let options = {
        url,
        type: "POST",
        headers: {
          Authorization: window.hasOwnProperty("erUser") ? erUser.token : "",
        },
        data: formdata,
        dataType: "JSON",
        processData: false,
        success,
        error,
      };
      if (hasFile) {
        options.contentType = false;
        // options.processData = false;
      }
      this.request(options);
    },

    getRequestCallback(callback, baseUrl) {
      return (res) => {
        this.requestMap[baseUrl].shift();
        this.requestMap[baseUrl][0] && $.ajax(this.requestMap[baseUrl][0]);
        callback && callback(res);
      };
    },

    //url, type, headers, data, dataType, contentType, asy, timeout, success, error……
    request(options) {
      if (typeof options.data == "string" && options.data) {
        const GUID = JSON.parse(options.data).controlGUID;
        const baseUrl = options.url.split("?")[0] + GUID;
        options.success = this.getRequestCallback(options.success, baseUrl);
        options.error = this.getRequestCallback(options.error, baseUrl);
        if (!this.requestMap[baseUrl]) this.requestMap[baseUrl] = [];
        this.requestMap[baseUrl].push(erowConfig.deepClone(options));
        if (this.requestMap[baseUrl].length > 1) return;
        $.ajax(options);
      } else {
        $.ajax(options);
      }
    },
  };

  window.erRequest = erowRequest;
})();
