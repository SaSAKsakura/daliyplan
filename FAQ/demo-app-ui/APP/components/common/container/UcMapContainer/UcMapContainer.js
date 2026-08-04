var UcMapContainer = {
  name: "UcMapContainer",
  mixins: [commonMinxin],
  components: {
    "uc-button-container": UcButtonContainer,
  },
  /* html */
  template: `
  <div class="map-container"  :class="activeClass(config,markerArr)">
    <div class="map-legend" v-if="isShowMapLegend">
        <div class="one-legend" v-for="(legend,index) in maplegend" :key="index">
            <img :src="legend.url" alt="">
            <span>{{legend.name}}</span>
        </div>
    </div>
    <div class='mapCenter' @click="goMyLocation">
      <img :src="getImgFileUrl({parentFilePath: 'public', filename: 'location', fileType: 'png'})" />
    </div>
    <div id="map-content" ref="bmap" class="map-content" style='height:200px;'></div>
  </div>
  `,
  props: {
    config: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      map: null,
      markerArr: [],
      markers: [], //地图上的marker
      markerKey: "",
      myLocation: {
        lon: "",
        lat: "",
      },
      myMarker: null,
      // defaultMarkerIcon: "../assets/images/public/mylocation.png",
      defaultMarkerIcon: this.getImgFileUrl({ parentFilePath: "public", filename: "mylocation", fileType: "png" }),
      frondSearchPrams: [],
      searchControlData: {},
      initCenter: false,
      polyline: null,
    };
  },
  computed: {
    isShowMapLegend() {
      if (this.config.ControlProperty.MapLegend) {
        return true;
      }
      return false;
    },
    maplegend() {
      if (this.isShowMapLegend) {
        let MapLegend = JSON.parse(this.config.ControlProperty.MapLegend);
        let legendList = MapLegend.legendList;
        legendList.push({
          name: "我的位置",
          url: this.defaultMarkerIcon,
        });
        return legendList;
      }
      return [];
    },
    ScopeCtnrConfig() {
      if (this.config.ControlProperty.ScopeCtnrConfig) {
        return this.config.ControlProperty.ScopeCtnrConfig;
      }
      return "";
    },
  },
  methods: {
    async initMap() {
      const BMap = await this.getMapApi();
      this.$nextTick(() => {
        erJsBridge.getGPS((rData) => {
          if (rData.resultFlag == "-1") {
            let gps = rData.result;
            if (!gps.lat && !gps.lon) {
              this.$toast.fail("未获取到定位!请先检查是否打开了定位功能");
              return;
            }
            this.myLocation.lon = gps.lon;
            this.myLocation.lat = gps.lat;
            this.map = new BMap.Map(this.$refs.bmap);
            //121.480237, 31.236737 上海坐标
            var centerPoint = new BMap.Point(gps.lon ? gps.lon : "121.480237", gps.lat ? gps.lat : "31.236737");
            this.map.centerAndZoom(centerPoint, 12);
            this.map.enableScrollWheelZoom(true);
            var myIcon = new BMap.Icon(this.defaultMarkerIcon, new BMap.Size(60, 60), { imageOffset: new BMap.Size(15, 0) });
            this.myMarker = new BMap.Marker(centerPoint, { icon: myIcon });
            this.map.addOverlay(this.myMarker);
            let _this = this;
            this.myMarker.addEventListener("click", () => {
              _this.addPolylineOverlay({ gps_lat: this.myLocation.lat, gps_lon: this.myLocation.lon });
            });
            this.myMarker.setTop(true);
            this.searchFormAndGetData();
            // this.getData();
          } else {
            this.$dialog.alert({
              message: "获取坐标失败，请检查定位权限",
            });
          }
        });
      });
    },
    goMyLocation() {
      if (this.polyline) {
        this.map.removeOverlay(this.polyline);
      }
      if (this.initCenter) {
        this.initMapCenter(this.initCenter);
      } else {
        var centerPoint = new BMap.Point(
          this.myLocation.lon ? this.myLocation.lon : "121.480237",
          this.myLocation.lat ? this.myLocation.lat : "31.236737"
        );
        this.map.centerAndZoom(centerPoint, 12);
      }
    },
    searchFormAndGetData() {
      if (this.config.ControlProperty.ScopeCtnr) {
        let url = erowplatformBackendUrl + "/appBaseApi/sysLoadControlData";
        let params = {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID: this.config.ControlProperty.ScopeCtnrGuid,
          pValueSet: this.config.pValueSet,
          pageMode: this.config.pageMode || "view",
        };
        erRequest.post(
          url,
          params,
          (res) => {
            this.searchControlData = res.data;
            let defautSearchParams = {};
            Object.keys(res.data).forEach((key) => {
              let child = this.config.ControlProperty.ScopeCtnrConfig.ChildContainers.find((item) => {
                return item.ControlProperty.ID == key;
              });
              defautSearchParams[key] = res.data[key].DefaultValue;
            });
            let ScopeCtnrConfig = this.config.ControlProperty.ScopeCtnrConfig;
            if(this.config.searchParams) {
              defautSearchParams = {
                ...defautSearchParams,
                ...this.config.searchParams,
              };
            }
            pageManager.updateParams(pageManager.pages.length - 1, {
              isFromRemind: 0,
              extendType: "",
            });
            erRequest.post(
              `${erowplatformBackendUrl}/appBaseApi/sysSearch?t=${new Date().getTime()}`,
              {
                menuRowGuid: this.config.menuRowGuid,
                controlGUID: ScopeCtnrConfig.ControlGUID,
                pageMode: "view",
                pValueSet: this.config.pValueSet,
                paramMap: defautSearchParams,
              },
              (res2) => {
                this.getData();
              },
              (error) => {
                this.$message("error", error.msg);
              }
            );
          },
          (error) => {
            console.log(error);
            this.$message("error", error.msg);
          }
        );
      }
    },
    getData() {
      let _this = this;
      if (this.config.ControlProperty.MockData) {
        let data = JSON.parse(pageContext.UcMapContainer.config.ControlProperty.MockData);
        this.markerArr = data.dataList;
        this.markerKey = data.keyName;
        if (!this.markerArr || this.markerArr.length == 0) {
          this.$toast.fail("未获取到坐标");
        }
        if (this.config.ControlProperty.IsActiveMyLocation && Boolean(this.config.ControlProperty.IsActiveMyLocation)) {
          this.activeMyLoaction();
        }
        this.addMarkerOverlay();
      } else {
        apis.sysLoadDBData({
          vm: this,
          params: {
            controlCode: this.config.ControlCode,
            pValueSet: this.config.pValueSet,
            controlGUID: this.config.ControlGUID,
            menuRowGuid: this.config.menuRowGuid,
            keyValue: this.config.keyValue || "",
            pageMode: "VIEW",
          },
          success: (res) => {
            let data = res.data[this.config.ControlProperty.ID];
            if (_this.config.AfterGetContainerData || _this.config.ControlProperty.AfterGetContainerData) {
              let funcName = _this.config.AfterGetContainerData || _this.config.ControlProperty.AfterGetContainerData;
              if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
                baseSpecial[funcName](_this.config.ChildContainers, _this);
              } else if (erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
                erowSpecial[funcName](res.data, _this);
              } else {
                var fnObj = _this.config.ControlProperty.FnCode;
                window[fnObj][funcName](res.data, _this);
              }
            }
            this.markerArr = data.dataList;
            this.markerKey = data.keyName;
            if (data.dataList.length == 0) {
              this.$toast.fail("未获取到坐标");
            }

            if (this.config.ControlProperty.IsActiveMyLocation && Boolean(this.config.ControlProperty.IsActiveMyLocation)) {
              this.activeMyLoaction();
            }
            //判断有没有搜索框 有的话 看下有无前端搜索的条件（计算距离的）
            if (this.config.ControlProperty.ScopeCtnr) {
              this.handleFrondSearch();
              return;
            }

            if (data.dataList.length == 0) {
              this.$toast.fail("当前无点位坐标");
            }

            this.addMarkerOverlay();
            // this.config._isLoadedData = true;
          },
          fail: (error) => {
            console.log(error);
            this.$message("error", error.msg);
          },
          error: (error) => {
            this.$message("error", error.msg);
          },
        });
      }
    },
    handleFrondSearch() {
      let _this = this;
      // let url = erowplatformBackendUrl + "/appBaseApi/sysLoadControlData";
      // let params = {
      //   menuRowGuid: this.config.menuRowGuid,
      //   controlGUID: this.config.ControlProperty.ScopeCtnrGuid,
      //   pValueSet: this.config.pValueSet,
      //   pageMode: "view",
      // };
      // erRequest.post(
      //   url,
      //   params,
      //   (res) => {
      //     if (res.code == "SUCCESS") {
      // let searchControlData = res.data;
      let scopeParams = erowConfig.searchParamsMap[this.config.ControlProperty.ScopeCtnr];
      let frontFilterControl = _this.ScopeCtnrConfig.ChildContainers.find((item) => {
        return item.ControlCode == "UcGpsRangeList";
      });
      let frontFilterControlId = frontFilterControl ? frontFilterControl.ControlProperty.ID : "";
      this.frondSearchPrams = [];
      if (scopeParams && frontFilterControlId) {
        //获取查找条件的值
        let tempArr = scopeParams[frontFilterControlId].split("|");
        if (tempArr.length) {
          tempArr.forEach((one) => {
            if (one) {
              this.frondSearchPrams.push(one);
            }
          });
        }
      } else {
        //获取默认值
        if (frontFilterControlId && this.searchControlData[frontFilterControlId].DefaultValue) {
          let tempArr = this.searchControlData[frontFilterControlId].DefaultValue.split("|");
          if (tempArr.length) {
            tempArr.forEach((one) => {
              if (one) {
                this.frondSearchPrams.push(one);
              }
            });
          }
        }
      }
      //  console.log(searchControlData);
      if (this.frondSearchPrams.length) {
        let filterMarkerArr = [];
        let unit = frontFilterControlId && frontFilterControl.ControlProperty.DistanceUnit == "m" ? 1 : 1000;
        this.markerArr.forEach((onemk) => {
          let distance = parseInt(
            erTool.getPointDistance(this.myLocation, {
              lat: Number(onemk.gps_lat),
              lon: Number(onemk.gps_lon),
            })
          );
          let isExist = false;
          for (var oneSearch of this.frondSearchPrams) {
            let intervalArr = oneSearch.split(",");
            if (intervalArr[1] != "~") {
              if (intervalArr[0] * unit < distance && intervalArr[1] * unit > distance) {
                isExist = true;
                break;
              }
            } else {
              if (distance > intervalArr[0] * unit) {
                isExist = true;
                break;
              }
            }
          }
          if (isExist) {
            filterMarkerArr.push(onemk);
          }
        });
        this.markerArr = filterMarkerArr;
        erowConfig.searchParamsMap[this.config.ControlProperty.ScopeCtnr] = ""; //执行过一次后清空
      }
      this.addMarkerOverlay();
      // } else {
      // }
      //   },
      //   (error) => {
      //     console.log(error);
      //     this.$message("error", error.msg);
      //   }
      // );
    },
    getMarkerIcon(item) {
      //    MapLegend= {
      //         "typeField":"dj_type",
      //         "LegendList":[
      //             {"name":"一票","code":"yipiao","url":"../Images/yipiao.png"},
      //             {"name":"二票","code":"erpiao","url":"../Images/erpiao.png"}
      //         ]
      //    }
      if (this.isShowMapLegend) {
        let mapLegendObj = JSON.parse(this.config.ControlProperty.MapLegend);
        // let mapLegendObj = JSON.parse('{ "typeField" : "risk_level","centerType":"1006005", "legendList" :[ { "name" : "二级", "code" : "1006002", "url" : "../assets/images/map/tworisklevel.png" }, { "name" : "三级", "code" : "1006003", "url" : "../assets/images/map/threerisklevel.png" }, { "name" : "四级", "code" : "1006004", "url" : "../assets/images/map/fourrisklevel.png" }, { "name" : "五级", "code" : "1006005", "url" : "../assets/images/map/fiverisklevel.png" }]}');
        let legendField = mapLegendObj.typeField;
        let legendList = mapLegendObj.legendList;
        let centerType = mapLegendObj.centerType;
        let theLegendList = legendList.find((legend) => {
          return legend.code == item[legendField];
        });
        if (!this.initCenter && theLegendList && theLegendList.code == centerType) {
          this.initMapCenter(item);
        }
        return theLegendList ? theLegendList.url : this.defaultMarkerIcon;
      }
      return this.defaultMarkerIcon;
    },
    initMapCenter(item) {
      if (item.gps_lat && item.gps_lon) {
        var centerPoint = new BMap.Point(item.gps_lon, item.gps_lat);
        this.map.centerAndZoom(centerPoint, 12);
        this.initCenter = item;
      }
    },
    addMarkerOverlay() {
      let _this = this;
      this.markerArr.forEach((data) => {
        if (data.gps_lat && data.gps_lon) {
          var myIconUrl = this.getMarkerIcon(data);
          var point = new BMap.Point(data.gps_lon, data.gps_lat);
          var myIcon = new BMap.Icon(myIconUrl, new BMap.Size(60, 60), { imageOffset: new BMap.Size(15, 4) });
          var marker = new BMap.Marker(point, { icon: myIcon });

          _this.map.addOverlay(marker);
          _this.markers.push(marker);
          marker.addEventListener("click", () => {
            // 打开弹窗
            // map.openInfoWindow(infoWindow, point);
            _this.showMarkerDetail(data);
            _this.addPolylineOverlay(data);
          });
        }
      });
    },
    // 与中心点连线
    addPolylineOverlay(item) {
      if (this.initCenter && (item.gps_lat !== this.initCenter.gps_lat || item.gps_lon !== this.initCenter.gps_lon)) {
        // 连线
        if (this.polyline) {
          this.map.removeOverlay(this.polyline);
        }
        var pointCetner = new BMap.Point(this.initCenter.gps_lon, this.initCenter.gps_lat);
        var point = new BMap.Point(item.gps_lon, item.gps_lat);
        this.polyline = new BMap.Polyline([pointCetner, point], {
          strokeColor: "red",
          strokeWeight: 2,
          strokeOpacity: 0.8,
        });
        this.map.addOverlay(this.polyline);

        // 移动地图
        this.initMapCenter(this.initCenter);
        var options = {
          animation: 200,
        };
        var newPoint = new BMap.Point(this.initCenter.gps_lon, this.initCenter.gps_lat - 0.1);
        this.map.panTo(newPoint, options);
      }
    },
    showMarkerDetail(data) {
      // 弹窗
      let commonPValueSet = this.config.pValueSet || "";
      let [fnCode, fnParameter, ctnrUID, pageMode] = this.config.ControlProperty.DialogActionCtnrUID.split(".");
      if (this.config.ControlProperty.DialogActionCtnrUID[0] === ":") {
        [fnCode, fnParameter, ctnrUID, pageMode] = (data[this.config.ControlProperty.DialogActionCtnrUID.slice(1)] || "").split(".");
      }

      const keyValue = data[this.config.ControlProperty.DialogKeyDataField];
      let pValueSet = erowConfig.generateUUID();
      apis.sysLoadConfigData({
        vm: this,
        params: {
          menuRowGuid: this.config.menuRowGuid || "",
          controlGUID: this.config.ControlProperty.DialogActionCtnrGuid,
          CtnrUID: ctnrUID || "",
          pageMode: pageMode || "VIEW",
          fnCode: fnCode || "",
          fnParameter: fnParameter || "",
          pValueSet,
          commonPValueSet,
          keyValue,
        },
        success: (res) => {
          pageContext.root.addLayer(
            Object.assign(
              {
                keyValue: keyValue || "",
                menuConfigKey: this.config.menuConfigKey,
                pValueSet: this.config.pValueSet,
                menuRowGuid: this.config.menuRowGuid,
                pageMode: pageMode || "VIEW",
                rootControlGuid: this.config.ControlGUID,
              },
              res.data
            )
          );
        },
        fail: (error) => {
          console.log(error);
          this.$message("error", error.msg);
        },
        error: (error) => {
          console.log(error);
          this.$message("error", error.msg);
        },
      });
    },
    getMapApi() {
      return new Promise((resolve, reject) => {
        let baseMapUrl = "";
        const rawMapUrl =
          window.MAP_CONFIG && window.MAP_CONFIG.baiduMapUrl
            ? String(window.MAP_CONFIG.baiduMapUrl).trim()
            : "";
        if (rawMapUrl) {
          if (/^https?:\/\//i.test(rawMapUrl)) {
            baseMapUrl = rawMapUrl.replace(/\/+$/, "");
          } else {
            try {
              const origin = new URL(window.baseUrl).origin;
              baseMapUrl = new URL(rawMapUrl, origin + "/").href.replace(
                /\/+$/,
                ""
              );
            } catch (e) {
              baseMapUrl = window.baseUrl;
            }
          }
        } else {
          baseMapUrl = window.baseUrl;
        }
        window._BMapSecurityConfig = {
            // 代理服务器地址
            serviceHost: baseMapUrl + '/_BMapService/'   
            // serviceHost: 'http://10.103.174.44:8035/_BMapService/'    
        }
        let BMap_URL = baseMapUrl + "/_BMapService/api?v=3.0&callback=onBMapCallback";
        if (typeof BMap !== "undefined") {
          resolve(BMap);
          return true;
        }

        // 百度地图异步加载回调处理
        window.onBMapCallback = () => {
          console.log("百度地图脚本初始化成功...");
          resolve(window.BMap);

          // resolve(BMap);
        };

        // 插入script脚本
        const scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.src = BMap_URL;
        document.body.appendChild(scriptElement);
      });
    },
    getConfig() {
      let _this = this;
      if (Array.isArray(this.config.ChildContainers)) {
        this.handlerAfterGetConfig(this.config);
      } else {
        if (erowConfig.hasProp(this.config, "BeforeGetContainerConfig")) {
          let funcName = configItem.BeforeGetContainerConfig;
          if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
            baseSpecial[funcName](this);
          } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
            erowSpecial[funcName](this);
          } else {
            var fnObj = this.config.ControlProperty.FnCode;
            window[fnObj][funcName](this);
          }
        }
        let params = {
          menuRowGuid: this.config.menuRowGuid,
          controlGUID: this.config.ControlGUID,
          pageMode: this.config.pageMode,
          pValueSet: this.config.pValueSet,
        };
        apis.sysLoadConfigData({
          vm: this,
          params,
          success: (res) => {
            if (res.code == "SUCCESS") {
              this.handlerAfterGetConfig(res.data);
            }
          },
          fail: (error) => {
            this.$message("error", error.msg);
          },
          error: (error) => {
            this.$message("error", error.msg);
          },
        });
      }
    },
    handlerAfterGetConfig(data) {
      let _this = this;
      this.containerConfig = erowConfig.deepClone(data);
      if (_this.config.AfterGetContainerConfig || _this.containerConfig.AfterGetContainerConfig) {
        let funcName = _this.config.AfterGetContainerConfig || _this.containerConfig.AfterGetContainerConfig;
        if (baseSpecial && erowConfig.hasProp(baseSpecial, funcName)) {
          baseSpecial[funcName](_this.config.ChildContainers, _this);
        } else if (window.erowSpecial && erowConfig.hasProp(erowSpecial, funcName)) {
          erowSpecial[funcName](_this.config.ChildContainers, _this);
        } else {
          var fnObj = _this.config.ControlProperty.FnCode;
          window[fnObj][funcName](_this.config.ChildContainers, _this);
        }
      }
      _this.initMap();
      //  _this.getData();
    },
    clearAllMarkers() {
      for (var i = 0; i < this.markers.length; i++) {
        this.map.removeOverlay(this.markers[i]);
      }
      this.markers = []; // 清空数组
    },
    // 实时获取当前位置
    activeMyLoaction() {
      let gpsData = () => {
        return new Promise((resolve, reject) => {
          // 这里用setTimeout模拟异步操作
          erJsBridge.getGPS((rData) => {
            if (rData.resultFlag == "-1") {
              let gps = rData.result;
              resolve(gps);
            } else {
              reject("获取定位失败");
            }
          });
        });
      };
      let activeGPS = async () => {
        const response = await gpsData();
        this.myLocation.lon = response.lon;
        this.myLocation.lat = response.lat;
      };
      setInterval(() => {
        activeGPS();
      }, 1000 * 60);
    },
  },
  mounted() {
    this.getConfig();
    eventEmitter.on("search", () => {
      console.log("搜索回调。。。。");
      this.clearAllMarkers();
      this.getData();
    });
    eventEmitter.on("refresh", () => {
      console.log("搜索回调。。。。");
      this.clearAllMarkers();
      this.getData();
    });
  },
};
