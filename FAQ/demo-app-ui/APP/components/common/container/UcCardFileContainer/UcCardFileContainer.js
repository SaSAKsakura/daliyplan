window.addEventListener("DOMContentLoaded", () => {
  UcCardFileContainer.components = {
    "uc-botton-container": UcButtonContainer,
    "uc-file-upload": fileUpload,
    "uc-file-container": UcFileContainer,
  };
});

var UcCardFileContainer = {
    name: "UcCardFileContainer",
    mixins: [commonMinxin],
    template: `
        <div class="UcCardFileContainer">
            <div class="cardList" :class="getRowClass()" v-show="dataArr.dataList.length">
                <template v-for="(item, index) in dataArr.dataList">
                    <div
                        :key="item.folder_id"
                        class="oneCard"
                        :class="activeClass(fileContainers[item.controlIndex], item)"
                        @click="showUploadLayer(item, fileContainers[item.controlIndex], config.pageMode, index)"
                    >
                        <div class="imgContent" :class="getCardRequired(item)?'required':''" v-show="!isLoading">
                            <div class="image-wrapper">
                                <!-- 封面图 -->
                                <img v-if="getImgSrc(fileContainers[item.controlIndex], item, index)" :src="getImgSrc(fileContainers[item.controlIndex], item, index)" class="cover-img" />
                                <div v-else class="default-placeholder">
                                    <i class="el-icon-folder-opened"></i> 
                                </div>

                                <div 
                                    class="file-count-badge" 
                                    v-if="folderCountList[index] != undefined"
                                    @click.stop="openPreviewPopup(item, index)"
                                >
                                    {{ folderCountList[index] }}
                                </div>
                            </div>
                            
                            <!-- 隐藏文件容器 只需要拿到组件实例，调用对应的方法即可-->
                            <div class="imgBox">
                                <div class="upload-container">
                                    <uc-file-container
                                        :is-in-layer="false"
                                        v-show="false"
                                        :ref="'uploadRef-'+index"
                                        :config="getFileContainerConfig(fileContainers[item.controlIndex], item)"
                                        :opList="opList"
                                        :keyName="dataArr.keyName"
                                        :folder-id="item.folder_id"
                                        :row-guid="config.keyValue"
                                        :containerConfig="config"
                                        :is-in-card-file="true"
                                        :card-file-index="index"
                                        :key="item.folder_id"
                                        @file-count-change="handleFileCountChange(index, $event)"
                                    >
                                    </uc-file-container>
                                </div>
                            </div>
                            
                            <div class="card-footer">
                                <div class="folder-name" :title="item.folder_name">{{ item.folder_name }}</div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <!-- 预览弹窗 -->
            <van-popup 
                v-model="previewPopupVisible" 
                position="bottom" 
                round 
                :style="{ height: '80%' }"
                closeable
            >
                <div class="preview-popup-content">
                    <div class="preview-header">{{ currentPreviewItem ? currentPreviewItem.folder_name : '文件预览' }}</div>
                    <div class="preview-body" v-if="currentPreviewItem && currentPreviewConfig">
                        <!-- 预览用的文件容器，传入当前点击项的配置和数据 -->
                        <uc-file-container
                            :is-in-layer="true"
                            :config="currentPreviewConfig"
                            :opList="opList"
                            :keyName="dataArr.keyName"
                            :row-guid="config.keyValue"
                            :folder-id="currentPreviewItem?.folder_id || currentPreviewItem?.folderId"
                            :containerConfig="config"
                            :is-in-card-file="true"
                            :card-file-index="currentIndex"
                            :key="currentPreviewItem?.folder_id || currentPreviewItem?.folderId"  
                            @file-count-change="handleFileCountChange(currentIndex, $event)"
                        >
                        </uc-file-container>
                    </div>
                </div>
            </van-popup>

            <div v-if="!dataArr.dataList?.length">
                <div class="empty">暂无数据</div>
            </div>
        </div>
    `,
    props:{
        config: {
            type: Object,
            default: () => {},
        },
        refreshCount: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            // childContainers: [],
            containerConfig: [],
            opList: [],
            defaultPageSizes: [5, 10, 15, 20, 30, 50, 100],
            dataArr: {
                dataList: [],
                keyName: "",
                currentPage: 1,
                rows: 10,
                listSize: 0,
            },
            fileContainers: [],
            isLoading: false,
            multiSelectList: [],
            imgSrcCache: {}, // 用于缓存图片源路径的对象
            previewPopupVisible: false, // 控制弹窗显示
            currentPreviewItem: null,   // 当前点击的 item 数据
            currentPreviewConfig: null,  // 当前点击项对应的配置信息
            currentIndex: -1,
            folderCountList: {},
            fileContainerConfigCache: {}, // 缓存每个卡片对应的 config
        };
    },
    methods:{
        openPreviewPopup(item, index) {
            this.currentPreviewItem = item;
            // 获取对应的配置信息
            // this.currentPreviewConfig = this.fileContainers[item.controlIndex];
            this.currentPreviewConfig = this.getFileContainerConfig(this.fileContainers[item.controlIndex], item);
            this.previewPopupVisible = true;
            this.currentIndex = index
        },
        activeClass(configItem, data) {
            const classList = [];
            if(!configItem){
                return ""
            }
            // CssClass指定类名
            if (configItem.ControlProperty && configItem.ControlProperty.CssClass) {
                classList.push(configItem.ControlProperty.CssClass);
            } else if (configItem.CssClass) {
                let temp = configItem.CssClass.toLowerCase();
                if (temp.indexOf("fun") != -1) {
                classList.push(fnObj[configItem.CssClass](configItem, data));
                }
                classList.push(configItem.CssClass);
            }
            // ClientClass指定类名
            if (configItem.ControlProperty && configItem.ControlProperty.ClientClass) {
                let temp = configItem.ControlProperty.ClientClass.toLowerCase();
                if (temp.indexOf("fun") != -1) {
                classList.push(fnObj[configItem.ControlProperty.ClientClass](configItem, data));
                }
                classList.push(configItem.ControlProperty.ClientClass);
            } else if (configItem.ClientClass) {
                let temp = configItem.ClientClass.toLowerCase();
                if (temp.indexOf("fun") != -1) {
                classList.push(fnObj[configItem.ClientClass](configItem, data));
                }
                classList.push(configItem.ClientClass);
            }
            // 动态获取类名
            if (configItem.ControlProperty && configItem.ControlProperty.CssClassField) {
                if (data[configItem.ControlProperty.CssClassField]) {
                classList.push(data[configItem.ControlProperty.CssClassField]);
                }
            }
            // 返回类名：动态获取类名 > ClientClass > CssClass
            return classList.join(" ");
        },
        getRowClass() {
            if (this.containerConfig.RepeatColumns) {
                return "Columns" + this.containerConfig.RepeatColumns;
            }
        },
        handleChildContainer() {
            let _this = this;
            let fileContainers = _this.childContainers.filter((child) => {
                return child && child.ControlCode == "UcFileContainer"
            });
            _this.fileContainers = erowConfig.deepClone(fileContainers)
            _this.fileContainerConfigCache = {}
        },
        getData(refresh) {
            let _this = this;
            if (erowConfig.hasProp(_this.containerConfig, "BeforeGetContainerData")) {
                let funcName = _this.containerConfig.BeforeGetContainerData
                if(erowSpecial[funcName]){
                    erowSpecial[funcName]("", _this)
                }else if(baseSpecial[funcName]){
                    baseSpecial[funcName]("", _this)
                }else{
                    console.log("方法未找到："+funcName)
                }
            }

            apis.sysLoadDBData({
                vm: _this,
                params: {
                    controlCode: _this.config.ControlCode,
                    pValueSet: _this.getPvalueSet, 
                    ctnrUID: _this.config.CtnrUID,
                    fnCode: _this.config.FnCode,
                    controlGUID: _this.config.ControlGUID,
                    menRowGuid: _this.config.menRowGuid,
                    keyValue: _this.keyValue || _this.config.keyValue || "",
                    pageMode: this.config.pageMode,
                    page: _this.dataArr.currentPage,
                    rows: _this.dataArr.rows,
                    paramMap: {}
                },
                success(res){
                    _this.$set(_this, "dataArr", res.data[_this.config.ControlProperty.ID])
                    // _this.dataArr = res.data[_this.config.ControlProperty.ID];
                    _this.handleAfterData()
                },
                error(err){
                    console.log(err)
                }
            })
        },
        handleAfterData() {
            let _this = this;
            _this.isLoading = false;
            this.dataArr.dataList.forEach((item, idx) => {
                let index = this.childContainers.findIndex((child) => {
                    let key = this.containerConfig.TypeField ? this.containerConfig.TypeField : "control_ctnr_uid";
                    return item[key] == child.CtnrUID;
                });
                if(index != -1){
                    _this.$set(item, "controlIndex", index);
                    _this.$set(_this.folderCountList, idx, item.fileCount || item.file_count || 0)
                }
            });
            if (erowConfig.hasProp(_this.config, "AfterGetContainerData")) {
                let funcName = _this.config.AfterGetContainerData
                if(erowSpecial[funcName]){
                    erowSpecial[funcName](_this.dataArr, _this)
                }else if(baseSpecial[funcName]){
                    baseSpecial[funcName](_this.dataArr, _this)
                }else{
                    console.log("方法未找到："+funcName)
                }
            }
            // this.init()
        },
        getImgSrc(control, data, index, flag) {
            let cover = data && data.cover
            if(!cover){
                return
            }
            let { file_type, file_guid, instance_guid, fn_code, file_name, amrStatus, IsTemp, file_path } = cover
            let token = erTool.sm2Encrypts(erUser.token, Public_KEY, 0);
            file_guid = erTool.encrypt(file_guid, token);
            let url =
                baseUrl +
                erowplatformBackendUrl +
                "/file/downloadfile?fileGuid=" +
                encodeURIComponent(file_guid) +
                "&pValueSet=" +
                encodeURIComponent(this.config.pValueSet) +
                "&json=" +
                encodeURIComponent(JSON.stringify({ [pageConfig.st || "token"]: token }));
            if (fn_code) {
                url += "&fnCode=" + fn_code;
            }
            if (instance_guid) {
                instance_guid = erTool.encrypt(instance_guid, token);
                url += "&instanceGuid=" + encodeURIComponent(instance_guid);
            }
            if (this.getControlGUID) {
                url += "&controlGuid=" + encodeURIComponent(this.getControlGUID);
            }
            if (flag == -1) {
                url += "&thumbnailFlag=-1";
            }
            // 图片当页展示, PDF重定向，其他格式调起第三方APP展示
            if (["png", "jpg", "jpeg"].includes(file_type)) {
                if (IsTemp) {
                return file_path;
                } else {
                return url;
                }
            } else {
                //pdf word 返回默认图片
                if (file_type == "pdf") {
                return "../assets/images/icon/pdf.png";
                } else if (["docx", "doc"].includes(file_type)) {
                return "../assets/images/icon/word.png";
                } else if (["xlsx", "xls"].includes(file_type)) {
                return "../assets/images/icon/excel.png";
                } else if (this.audioTypeList.includes(file_type)) {
                return this.audioMap[amrStatus];
                } else {
                return "../assets/images/ucCardFileContainer/upload.png";
                }
            }
        },
        //根据index打开对应上传控件的toStep2方法
        showUploadLayer(params, control, pageMode, index){
            if(this.config.pageMode == "VIEW"){
                this.openPreviewPopup(params, index)
                return
            }
            //不需要再请求folder_id,folder_name这些了，这些已经由当前数据传递了
            if(index !== undefined){
                this.$refs["uploadRef-"+index][0].$refs.uploadRef.toStep2()
            }
        },
        getUploaderConfig(configItem){
            if(configItem.ControlCode === "UcFileUpload"){
                if(!configItem.ControlProperty){
                    configItem.ControlProperty = {
                        FnCode: this.config.FnCode
                    }
                }else{
                    configItem.ControlProperty.FnCode = this.config.FnCode
                }
                return configItem
            }else if(configItem.ChildContainers){
                let target = configItem.ChildContainers.find(child=>child.ControlCode === "UcFileUpload")
                if(target){
                    if(!target.ControlProperty){
                        target.ControlProperty = {
                            FnCode: this.config.FnCode
                        }
                    }else{
                        target.ControlProperty.FnCode = this.config.FnCode
                    }
                }
                return target
            }
        },
        setCardFileCtnrUIDToWindow(){
            if (!window.cardFileCtnr) {
                window.cardFileCtnr = [];
            }
            let temp = window.cardFileCtnr.find((item) => {
                return item.CtnrUID == this.config.CtnrUID && item.rootControlGuid == this.config.rootControlGuid;
            });
            if(!temp){
                window.cardFileCtnr.push({ CtnrUID: this.config.CtnrUID, rootControlGuid: this.config.rootControlGuid })
            }
        },
        handleFileCountChange(index, {fileCount}){
            if (this.folderCountList[index] !== fileCount) {
                this.$set(this.folderCountList, index, fileCount);
            }
        },
        getCardRequired(item){
            let required = item.is_required || item.isRequired || item.IsRequired
            if(required){
                required = (required + "").toLowerCase() == "true" || false
            }else{
                required = false
            }
            return required
        },
        getFileContainerConfig(config = {}, item = {}){
            const cacheKey = item.folder_id ? `fc_${item.folder_id}` : `idx_${index}`;
    
            // 如果缓存已存在，直接返回缓存的引用，不重新创建对象
            if (this.fileContainerConfigCache[cacheKey]) {
                return this.fileContainerConfigCache[cacheKey];
            }
            
            config = erowConfig.deepClone(config);
            if (!config.ControlProperty) {
                config.ControlProperty = {};
            }
            config.ControlProperty = Object.assign(config.ControlProperty, item);
            
            this.$set(this.fileContainerConfigCache, cacheKey, config);
            return config;
        },
    },
    computed: {
        getPvalueSet() {
            return this.config.pValueSet;
        },
        realChildContainers() {
            return this.childContainers;
        },
        audioTypeList: function () {
            return ["amr", "wav", "mp3", "m4a"];
        },
        childContainers(){
            return this.config.ChildContainers
        },
        getShowUpload() {
            return (
                this.config.ControlProperty.isHideUpload !== "true" &&
                this.dataArr.currentPage == 1 &&
                this.config.pageMode !== "VIEW"
            );
        },
    },
    mounted(){
        // this.setCardFileCtnrUIDToWindow()
        this.handleChildContainer()
        this.getData()
    }
}