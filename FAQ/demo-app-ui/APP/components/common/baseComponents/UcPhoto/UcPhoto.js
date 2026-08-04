function throttle(func, delay) {
  let lastCalledTime = 0;
  return function() {
    const now = Date.now();
    if (now - lastCalledTime >= delay) {
      func.apply(this, arguments);
      lastCalledTime = now;
    }
  };
}
let UcPhoto = {
  props: {
    config: {
      type: Object
    },
    parentFnCode: {
      type: String
    },
    option: {
      type: Object
    },
    idx: {
      type: Number
    }
  },
  template: `
    <div style="max-height: 3rem">
      <div class="uc-photo">
        <div
          class="uc-photo-upload-button"
          @click="showPhotoSheet = !showPhotoSheet"
          v-if="!imageUrl && config.pageMode === 'EDIT'">
          上传图片
        </div>
        <div class="uc-photo-preview-image" v-else>
          <van-icon name="close" @click="delFile" v-if="imageUrl && config.pageMode === 'EDIT'" style="position:absolute;right: -1px;top: -1px" />
          <img :src="imageUrl" @click="handleDialog('open')" style="width: 100%;" alt="">
        </div>
        <van-action-sheet
          v-model="showPhotoSheet"
          :actions="photoActions"
          cancel-text="取消"
          close-on-click-action
          @select="photoSheetSelect">
        </van-action-sheet>
        <dialog id="ucPhotoWrapper">
          <div id="imgBox" class="uc-photo-bigImage">
            <img :src="imageUrl" id="bigImage" @click="handleDialog('close')" alt="">
          </div>
        </dialog>
      </div>
    </div>
  `,
  mounted() {
    if (this.option.file_guid) {
      this.generateImgUrl()
    }
  },
  data() {
    return {
      uploaded: false,
      previewBase64: '',
      showPhotoSheet: false,
      tempKey: erTool.generateUUID(),
      photoActions: [
        {
          name: "拍照",
        }, {
          name: "相册",
        }
      ],
      imageUrl: '',
      dragstart: {
        x: '',
        y: ''
      }
    }
  },
  methods: {
    photoSheetSelect({name}) {
      let tempRowGuid
      if (name === '拍照') {
        this.takePhoto()
      } else {
        this.pickPhoto()
      }
    },
    takePhoto() {
      let tempKey = this.tempKey;
      let fileName = "文件" + new Date().getTime();
      let rowId = tempKey;
      let _this = this;
      let bizInfo = {
        ucSiteInspectionId: tempKey,
      };
      let {folderId} = JSON.parse(this.config.ControlProperty['UploadFileds'])

      // if(erJsBridge.osType == 'iOS'){
        erJsBridge.getGPS((rData) => {
          if (rData.resultFlag == "-1") {
            let gps = rData.result;
            if (!gps.lat && !gps.lon) {
              _this.$toast.fail("未获取到定位!请先检查是否打开了定位功能");
            }
            erJsBridge.takePhoto(erUser.userId, fileName, this.parentFnCode, rowId, folderId, "", bizInfo, (data) => {
              if (data.resultFlag == "-1") {
                _this.getFileListByFolder(folderId);
              } else {
                _this.$toast.fail(data.errMsg);
              }
            });
          } else {
            _this.$dialog.fail("获取坐标失败，请检查定位权限");
          }
        });
        // return;
      // }

      // erJsBridge.takePhoto(erUser.userId, fileName, this.parentFnCode, rowId, folderId, "", bizInfo, (data) => {
      //   if (data.resultFlag == "-1") {
      //     _this.getFileListByFolder(folderId);
      //   } else {
      //     _this.$toast.fail(data.errMsg);
      //   }
      // });
    },
    pickPhoto() {
      let tempKey = this.tempKey;
      let fileName = "文件" + new Date().getTime();
      let rowId = tempKey;
      let _this = this;
      let bizInfo = {
        ucSiteInspectionId: tempKey,
      };
      let {folderId} = JSON.parse(this.config.ControlProperty['UploadFileds'])
      erJsBridge.getGPS((rData) => {
        if (rData.resultFlag == "-1") {
          let gps = rData.result;
          if (!gps.lat && !gps.lon) {
            _this.$toast.fail("未获取到定位!请先检查是否打开了定位功能");
          }
          erJsBridge.pickPhoto(erUser.userId, fileName, this.parentFnCode, rowId, folderId, "", bizInfo, (data) => {
            if (data.resultFlag == "-1") {
              _this.getFileListByFolder(folderId);
            } else {
              _this.$toast.fail(data.errMsg);
            }
          });
        } else {
          _this.$dialog.fail("获取坐标失败，请检查定位权限");
        }
      });
    },
    getFileListByFolder(folder) {
      let key = this.tempKey;
      let _this = this;
      erJsBridge.getFileList(erUser.userId, this.parentFnCode, key, folder, (data) => {
        if (data.resultFlag == "-1") {
          let file = data.result[0];
          // 上传文件
          file.file_path =
            file.file_path.substring(0, file.file_path.lastIndexOf("/") + 1) + file.file_path.substring(file.file_path.lastIndexOf("/") + 1);
          file.file_name = file.file_path.substring(file.file_path.lastIndexOf("/") + 1);

          _this.imageUrl = file.file_path
          let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
          let tempRowGuid
          if (!this.option.row_guid) {
            tempRowGuid = erowConfig.generateUUID()
            this.$emit('setRowGuid', tempRowGuid, this.idx)
          }
          erJsBridge.erowUploadFile(
            // baseUrl + erowplatformBackendUrl + "/file/uploadFile?json=" + encodeURIComponent(JSON.stringify({ Token: token })),
            baseUrl + erowplatformBackendUrl + "/file/uploadFile?json=" + encodeURIComponent(JSON.stringify({ [window.pageConfig.st || 'token']: token })),
            {
              rowGuid: _this.option.row_guid ? _this.option.row_guid  : tempRowGuid,
              controlGUID: this.config.ControlProperty.ReferToControlGuid,
              pValueSet: this.config.pValueSet,
              action: "upload",
              fnCode: file.fn_code,
              instanceGuid: _this.option.row_guid ? _this.option.row_guid  : tempRowGuid,
              folderCode: file.folder_code || "",
              longitude: file.lon || "",
              latitude: file.lat || "",
              remark: file.remark || "",
              bizInfo: file.biz_info || "",
              fileCreateDate: file.create_time || "",
              fileName: file.file_name,
            },
            file.file_id,
            "file",
            file.file_name,
            file.file_path,
            file.file_type,
            (...args) => {
              _this.$toast.success("上传成功");
              if (!_this.uploaded) _this.uploaded = !_this.uploaded
            }
          );
        }
      });
    },
    handleDialog(type) {
      const dialogDom = document.getElementById('ucPhotoWrapper');
      const bigImage = document.getElementById('bigImage')

      if (type === 'open') {
        // bigImage.addEventListener('touchstart', throttle(this.handleTouchEvent, 50))
        dialogDom.showModal()
      } else {
        dialogDom.close()
        // bigImage.style.top = '0px'
        // bigImage.style.left = '0px'
      }
    },
    handleTouchEvent(e) {
      const imgBox = document.getElementById('imgBox')
      const bigImage = document.getElementById('bigImage')
      let left = bigImage.offsetLeft;
      let top = bigImage.offsetTop;
      let startX = e.clientX;
      let startY = e.clientY;
      imgBox.addEventListener('touchmove', (e) => {
        bigImage.style.left = e.clientX - startX + left + "px";
        bigImage.style.top = e.clientY - startY + top + "px";
      })
    },
    delFile() {
      let _this = this;
      this.$dialog
        .confirm({
          title: "系统消息",
          message: "确定删除该图片？",
        })
        .then(() => {
          let params = {
            fileGuid: this.option.file_guid,
            menuRowGuid: this.config.menuRowGuid,
            fnCode: this.parentFnCode,
            controlGuid: this.config.ControlProperty.ReferToControlGuid,
            pValueSet: this.config.pValueSet,
            // keyValue: this.option.file_guid,
            // pageMode: 'DELETE'
          }
          console.log(params)
          erRequest.post(
            erowplatformBackendUrl+ "/file/deleteFileNew",
            params,
            (res) => {
              if (res.code === "SUCCESS") {
                this.imageUrl = ''
              } else {
                console.log(res);
              }
            },
            (error) => {
              console.log(error);
            }
          );
        })
    },
    generateImgUrl() {
      let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
      let enyfile_guid = erTool.encrypt(this.option.file_guid, token);
      this.imageUrl = baseUrl +
        erowplatformBackendUrl +
        "/file/downloadfile?fileGuid=" +
        encodeURIComponent(enyfile_guid) +
        "&pValueSet=" +
        encodeURIComponent(this.config.pValueSet) +
        "&json=" +
        // encodeURIComponent(JSON.stringify({token}))
        encodeURIComponent(JSON.stringify({[window.pageConfig.st || 'token']: token}))

    },
  }
}
