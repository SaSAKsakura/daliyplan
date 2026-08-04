# 0.0.1

更新日期: 2024/05/31
更新内容：防抖逻辑更改、UcFileUpload 上传文件后
影响范围：UcButtonContainer、UcFileUpload
第三方依赖：无

# 0.0.2

更新日期: 2024/0603
更新内容：动态组件集成
影响范围：动态组件、UcForm
第三方依赖：无

# 0.0.3

- 更新日期: 2024/06/03
- 更新内容：
  - 新增`UcDataListContainer`组件
  - 添加渲染逻辑：`UcFormContainer` 内，当 `tr` 内的 `td` 都因为 `visibleToDataField` 隐藏时，该 `tr` 要隐藏。
  - 工作流组件里，向后兼容没有快速工作流功能的情况。
- 影响范围：
  - `UcContainer.js` 、`UcDataListContainer.js` 、 `UcFormContainer.js` 、 `UcWorkflow.js` 、 `default\install.js` 、`pageList\install.js`
- 第三方依赖：无

# 0.0.4

- 更新日期: 2024/06/03
- 更新内容:
  - 移动端一览表增加选中行的样式 `highlight-grid-row`
  - 卡片列表间距调整，默认卡片之间间隔 20px
  - 修复移动端 Tab 引用 `UcContainer` 时按钮未粘性布局在屏幕底部的 bug
- 影响范围: `UcGridContainer` 、 `UcContainerNoGroup` 、 `PageListContentContainer`
- 第三方依赖: 无

# 0.0.5

- 更新日期: 2024/06/04
- 更新内容:
  - 修复 pagelist 搜索后不调用接口的 bug
- 影响范围:
  - `PageListContentContainer` `UcButtonContainer` `UcWorkflow`
- 第三方依赖: 无

# 0.0.6

- 更新日期: 2024/06/05
- 更新内容:
  - 对工作流和 UcButton 里的按钮进行控制，保证在接口调用结束前不允许再次点击该按钮。同时给提交和保存添加界面加载提示。
  - 增加全局刷新函数 `globalUpdate` ，调用该函数可重新调用接口刷新页面数据，不需要原先的 reload。
- 影响范围:
  - `detail.html` `pageList.html` `erowConfig.js` `UcButtonContainer` `UcChartContainer` `UcFileContainer` `UcGridContainer` `UcJsGridContainer` `UcMapContainer` `UcMsgContainer` `UcWorkflow`
- 第三方依赖: 无

# 0.0.7

- 更新日期: 2024/06/05
- 更新内容:
  - UcStepList 现在可以居中展示
  - 修复 pageList 过滤失效和 tab 中数字不正确的问题
  - 修正了 UcContainer 中控制开启下拉刷新的配置项字段名称
- 影响范围: `UcContainer` 、 `UcStepList` 、 `PageListContentContainer`
- 第三方依赖: 无

# 0.0.8

- 更新日期: 2024/06/05
- 更新内容:
  - UcStepList 现在可以居中展示
  - 修复 pageList 过滤失效和 tab 中数字不正确的问题
  - 修正了 UcContainer 中控制开启下拉刷新的配置项字段名称
  - 修复 UcContainer 中按钮重复出现的问题
  - ForMultipleSelect 在 ios 中弹窗覆盖异常问题
- 影响范围: `UcContainer` 、 `UcStepList` 、 `PageListContentContainer`、`ForMultipleSelect`
- 第三方依赖: 无

# 0.0.9

- 更新日期: 2024/06/05
- 更新内容:
  - 修复了 UcWorkFlow 的提交按钮在低网速环境下多次点击造成多次触发审批的 BUG
- 影响范围: `UcWorkFlow`
- 第三方依赖: 无

# 0.0.10

- 更新日期: 2024/06/06
- 更新内容:
  - 脱敏控件在 UcForm 里解密不了的问题，以及编辑状态下不展示眼睛图标
- 影响范围: `commonMinxin.js` `EditComponent.js` `myVant.css`
- 第三方依赖: 无

# 0.0.11

- 更新日期: 2024/06/06
- 更新内容:
  - 修复了 UcForm 在编辑模式下字体大小调整
  - 多选列表选择但不全选后，全选图标样式添加
  - 一览表多选不生效问题
- 影响范围: `PageListContentContainer`
- 第三方依赖: 无

# 0.0.12

- 更新日期: 2024/06/07
- 更新内容:
  - 去除角色定义菜单 tab 中编辑和删除按钮
  - 单选框提交不带值问题
  - 下拉框模糊查询 bug
  - 修改表单缓存时间常量
- 影响范围: `UcRoleMenu.vue` , `UcFormDetailViewScope.vue` , `SelectCurrentProject.vue` , `UcLayerContainer.vue`
- 第三方依赖: 无

# 0.0.13

- 更新日期: 2024/06/11
- 更新内容:
  - UcBannerContainer 无数据添加暂无数据图片
  - formMinxin.js 纯展示卡片不需要请求数据优化
- 影响范围: `UcBannerContainer.vue` , `formMinxin.js`
- 第三方依赖: 无

# 0.0.14

- 更新日期: 2024/06/12
- 更新内容:
  - 编辑保存报错-测试模块-第三个 tab
  - 卡片动态跳转，返回空时，不跳转页面
- 影响范围: `UcButtonContainer.vue` , `UcCardContainer.vue`
- 第三方依赖: 无

# 0.0.15

- 更新日期: 2024/06/17
- 更新内容:
  - 新增了通用配置的设计，将配置中心与其他移动端项目的共用依赖抽出。
  - 因为 APP 目录下的所有文件与其他通过配置产出的移动端项目没有结构性差异。所以可以将配置中心移动端也抽象成一个
    “公共依赖库+配置中心自定义内容”的项目。本地调试方式与之前相同，维护公共依赖可以直接在 APP 内开发，如果需要开
    发影响范围仅在配置中心移动端的自定义 JS 和 CSS，则推荐在 SelfDefineProject 内修改。
- 影响范围: `./APP`
- 第三方依赖: 无

# 0.0.16

- 更新日期: 2024/06/17
- 更新内容:
  - 优化了 entrance.html 的接入方式，现在只需要在路径中拼接 DepPath 参数即可，减少配置和调试时的前置工作量(在 entrance.html 中给出了编码好的字符串模板)。
  - 将定义 ROOT_PATH 和 HTML_PATH 的步骤提前，保证在引用时该两个变量有值。
- 影响范围: `/APP/template/entrance.html`、`/APP/config/index.js`、 `/SelfDefineProject/entranceJS/index.js`
- 第三方依赖: 无

# 0.0.17

- 更新日期: 2024/06/18
- 更新内容:
  - 优化了项目根目录的获取方式和存储方式。
  - 移动端 UcFileContainer 预览时请求缩略图
- 影响范围: `Entrance.html`、`config/index.js`、`UcFileContainer`
- 第三方依赖: 无

# 0.0.18

- 更新日期: 2024/06/20
- 更新内容: 实现考试界面的可配置
- 影响范围: `apis.js` `formMinxin.js` `dynamicMixin.js` `UcFormContainer.js` `UcDataListContainer.js` `UcDynamicComponent.js` `index.css`
- 第三方依赖: 无

# 0.0.19

- 更新日期: 2024/06/21
- 更新内容: 新增 `UcAnswerField` 组件
- 影响范围: `UcAnswerField.js` `index.css` `EditComponent.js` `ViewComment.js` `UcDataListContainer.js` `UcFormContainer.js` `install.js` `formMinxin.js`
- 第三方依赖: 无

# 0.0.20

- 更新日期: 2024/06/24
- 更新内容:
  - 修复计时器 bug
  - UcDataListContainer 组件缓存回显
- 影响范围: `UcTimer.js` `UcDynamicComponent.js` `UcDataListContainer.js` `formMinxin.js`
- 第三方依赖: 无

# 0.0.21

- 更新日期: 2024/07/04
- 更新内容:
  - 新增 icon 图标,修改文件图标为前端通过文件类型判断
  - iOS 端预览除图片外，均已第三方打开
- 影响范围: `UcFileContainer.js` `android.js` ,`assets/images/icon`

# 0.0.21

- 更新日期: 2024/07/05
- 更新内容:
  - 新增一览表展示标签组
  - iOS 端预览中逻辑有优化，后续 iOS 端发布更新后调整
- 影响范围: `UcGridViewContent.vue` `UcFileContainer.js` ,`index.scss`

# 0.0.22

- 更新日期：2024/07/07
- 更新内容：
  - UcMapContainer 控件初次进入执行一次搜索
  - 时间控件优化
  - 跳转第三方系统
- 影响范围： `/FormDate/FormDate.js`,`UcMapContainer`,`tools/android.js`,`tools/erPageController.js`

# 0.0.23

- 更新日期: 2024/07/08
- 更新内容:
  - iOS 端预览中逻辑优化，文件名先使用时间戳，后续 iOS 端发布更新后调整
- 影响范围: `UcFileContainer.js`

# 0.0.24

- 更新日期: 2024/07/10
- 更新内容:
  - UcBound 添加可配置操作是否一行展示，通过添加 IsOperateShowOneLine 属性实现
- 影响范围: `ViewComment.js`,`comment.css`

# 0.0.25

- 更新日期: 2024/07/12
- 更新内容:
  - 调整 exam.css 文件的位置
  - 优化 SelfDefine 目录下的配置项，修改生成路径时的拼接内容
- 影响范围: `ViewComment.js`,`comment.css`

# 0.0.26

- 更新日期：2024/7/15
- 更新内容：
  - EditComponent 中给搜索的输入框增加 id
  - 步进器修复配置步长、小数点位数不生效等问题
  - 修复列表 tab 中数量不正常显示的问题，增加可配置 AfterGetContainerData
  - 平板模式列表左列表右详情显示时，选择卡片增加可走自定义 js
  - 轮播图增加删除按钮
  - 表单可配置 AfterGetContainerConfig
  - 页面跳转 extendType 参数格式增加判断
- 影响范围：`EditComponent.js`、`UcStepperField.js`、`PageListContentContainer.js`、`UcBannerContainer.js`、`gridMinxin.js`

# 0.0.27

- 更新日期：2024/7/18
- 更新内容：
  - base-stack-bar 柱宽调整
  - 环形饼图说明文字位置调整为垂直居中
  - treeMap 图表, 增肌矩形格颜色差异化显示，数据显示配置调整（说明文字左上角显示，数据垂直水平居中显示）
- 影响范围：`UcChartContainer.js`

# 0.0.28

- 更新日期：2024/7/18
- 更新内容：
  - 添加配置缓存逻辑和临时数据缓存逻辑
- 影响范围：`CacheHelper.js,Api.js、UcPageList、UcForm、UcContainer、UcJsgrid、CommonMixin、gridMixin、formMixin`

# 0.0.28

- 更新日期：2024/7/18
- 更新内容：
  - 添加 UcPageList 和搜索框联动高亮的逻辑
- 影响范围：`UcPageList、erowConfig.js`

# 0.0.29

- 更新日期：2025/07/18
- 更新内容：
  card、form 控件 td 可以使用动态 class
- 影响范围：`UcCardContainer.js`、`commonMinxin.js`,`formMinxin.js`,`UcFormContainer.js`

# 0.0.30

- 更新日期：2024/7/22
- 更新内容：

  - 优化展开收起显示样式
  - 修复 MP4 不能播放 bug
  - 根据 ios 发布新版本更新，优化 ios 端预览

- 影响范围：`ViewComment.js`、`UcFileContainer.js`

# 0.0.30

- 更新日期：2025/07/23
- 更新内容：
  - tabGroup 增加 BeforeSwitchTab 和 AfterSwitchTab
- 影响范围：`TabGroupContainer.js`

# 0.0.31

- 更新日期：2025/07/23
- 更新内容：
  - 登录进系统，主动清理缓存一次，UcPageListContaienr 上拉刷新
- 影响范围：`Default.html,CacheHelper.js,PageListContainer.js,gridMixin.js`

# 0.0.32

- 更新日期：2025/07/26
- 更新内容：
  - UcButtonContainer 按钮不显示 bug 修复
  - bottomBar 优化
- 影响范围：`/assets/css/index.css`,`PageListContentContainer.js`,`UcBottomBar.js`,`UcButtonContainer.js`,`formMinxin.js`

# 0.0.33

- 更新日期：2025/07/29
- 更新内容：
  - 移动端：脱敏控件没内容时，优化为不显示眼睛图标
  - 移动端首页支持配置 Card，使用存储过程或者 WhereSqlText 取数据
  - 移动端 Gridview 支持 HideOps、IsHideADD、IsHideEDIT、IsHideDELETE 属性
- 影响范围：`UcCardContainer.js`、`commonMinxin.js`、`UcGridContainer.js`

# 0.0.34

- 更新日期：2025/07/30
- 更新内容：
  - UcChart.js sysLoadControlData 接口添加缓存
- 影响范围：`UcChart.js`

# 0.0.35

- 更新日期：2025/07/30
- 更新内容：
  - UcTabContainer 支持配置 jsgrid
  - jsgrid 支持配置 card 容器，添加空样式，配置 form 时 频繁请求容器接口优化
  - UcContainerNoGroup 支持配置 jsgrid
  - UcFileContainer bug 修复
  - UcScopeContainer.js td 表格样式
  - 保存时没有传 Tab 下面 jsGrid 的控件 controlGuid bug 修复
- 影响范围：`pageList/install.js`,`default/install.js`,`formMinxin.js`,`commonMinxin.js`,`UcScopeContainer.js`,`UcJsGridContainer.js`,`UcFileContainer.js`,`TabGroupContainer.js`,`UcContainerNoGroup.js`

# 0.0.36

- 更新日期：2024/08/15
- 更新内容：
  - pageTiTleContainer 支持配置 TitleByDataField，有 TitleByDataField 配置的话，在 form 详情中取该字段作为详情页标题，没有则取 TitleRSValue
- 影响范围：`pageTitleeContainer.js`

# 0.0.37

- 更新日期：2025/08/12
- 更新内容：
  - 新增 UcSwitchField 组件；
  - 组件 UcDataListContainer 新增左右滑动切换和自动轮播，配置项 ListMode 为 banner 时启用，默认不启用;
  - 组件 UcDataListContainer 新增底部标识;
  - 增加和更改了通用样式
  - 修复 UcTagGroup 没有配置 icon 时，配置报错
- 影响范围：`UcSwitchField.js`、`EditComponent.js`、`default/install.js`、`pageList/install.js`、`UcDataListContainer.js`、`index.css`、`common.css`、`home.css`、`root.css`、`ViewComment.js`

# 0.0.38

- 更新日期：2024/08/19
- 更新内容：
  - 新增 FormTree 组件；
- 影响范围：`formMinxin.js`、`FormTree.js`、`EditComponent.js`、`default/install.js`、`pageList/install.js`、`index.css`、`FormTree.css`、`element-ui.js`、`element-ui.css`、`detail.html`

# 0.0.39

- 更新日期：2024/08/20
- 更新内容：
  - FormTree 内容换行；
- 影响范围：`FormTree.css`

# 0.0.40

- 更新日期：2024/08/21
- 更新内容：
  - 表单增加字段展开/收起功能；
- 影响范围：`formMixin.js`、`、baseSpecial.js`、`EditComponent.js`、`ViewComment.js`、`UcCardContainer.js`、`UcFormContainer.js`、`UcScopeContainer.js`

# 0.0.41

- 更新日期：2024/08/22
- 更新内容：
  - FormTree 新增时，补充获取数据源逻辑；
- 影响范围：`FormTree.js`

# 0.0.42

- 更新日期：2024/08/23
- 更新内容：
  - 移动端控件联动
- 影响范围：`EditComponent.js`、`fileUpload.js`、`FormDate.js`、`FormSelect.js`、`FormSelect.js`、`erowConfig.js`、`commonMinxin.js`

# 0.0.43

- 更新日期：2024/08/23
- 更新内容：
  - xls 图标
  - jsGrid 无数据位置调整
  - 通用样式
- 影响范围：`common.css`、`index.css`、`UcDataListContainer.js`、`UcFileContainer.js`、`UcJsGridContainer.js`

# 0.0.45

- 更新日期：2024/09/13
- 更新内容：
  - 搜索添加标签组选择器
- 影响范围：`index.css`、`EditComponent.js`

# 0.0.46

- 更新日期：2024/09/14
- 更新内容：
  - 移动端树结构样式和图片
  - 带 pageMode 跳转
- 影响范围：`FormTree.css`、`FormTree.js`、`UcMenuContainer.js`

# 0.0.47

- 更新日期：2024/09/23
- 更新内容：
  - UcImageFidld 获取图片优化
  - 上传控件选择文件夹之后选择文件被遮盖 bug 修复
  - FormSelect 添加自定义事件
  - PageListContentContainer 单选不生效 bug 修复
  - 打开弹窗可以传默认查找条件
  -
- 影响范围：`utils/erowConfig.js`、`tools/android.js`、`tools/erRequest.js`、`gridMinxin.js`、`formMinxin.js`、`UcFormContainer.js`、`UcFileContainer.js`、`UcContainer.js`、`UcCardContainer.js`、`PageListContentContainer.js`、`FormSelect.js`、`fileUpload.js`、`EditComponent.js`

# 0.0.48

- 更新日期：2024/09/27
- 更新内容：
  - 移动端脱敏控件频繁点击修复
  - 树节点换行样式
  - UcCardContainer 行点击防止冒泡
  - UcFileContainer 暂无数据样式
- 影响范围：`UcCardContainer.js`、`UcContainer.js`、`UcFileContainer.js`、`UcTreeNodeContainer.js`、`default/install.js`
  、`commonMinxin.js`、`pageList/install.js`

# 0.0.49

- 更新日期：2024/10/11
- 更新内容：
  - 修复文件列表查找后再打开查找列表被清空问题
- 影响范围：`formMinxin.js`、`gridMinxin.js`

# 0.0.50

- 更新日期：2024/10/11
- 更新内容：
  - PageListContentContainer 总数展示
- 影响范围：`PageListContentContainer.js`

# 0.0.51

- 更新日期：2024/10/14
- 更新内容：
  - EditComponent 文本展开收起
- 影响范围：`EditComponent.js`
  --更新日期： 2024/10/16
- 更新内容：
  - UcMenuContainer 增加 MenuMode 支持'card'模式，非 card 模式目前默认为原样式，并于 tools/index 增加默认 card 模式默认图标配置 menuDefaultImageCard
- 影响范围：`UcCardContainer.js`、`tools/index.js`、`home.css`

# 0.0.52

- 更新日期：2024/10/16
- 更新内容：
    - UcDataListContainer 于 banner 模式下点击 pageTitleIcon 增加通用批量提交功能，函数于 utils\baseSpecial 的 dataListCleanCacheBannerMode，并增加提交后回调 AfterEditSaveCallBack，测试回调位于 special/js/detail.js 下
    - 修复 commonMinmix activeClass 下配置多类名导致 wrapper class 异常生成的 bug
    - 修复 formMinmix generateRule 函数 hiddenFieldMap 导致 fieldMap 自动填充异常问题
    --修复 index.css 中 head-title 定位导致标题布局中的问题

- 影响范围：`UcDataListContainer.js`、`utils/baseSpecial.js`、`special/js/detail.js`、`index.css`、`formMinmix.js`、`commonMinmix.js`

# 0.0.53

- 更新日期：2024/10/24
- 更新内容：
  --修复 UcFileContontainer 和 UcScopeContainer 再 theme 不为 border 的情况下样式问题
  --修复 ucchecklist 事件触发参数、表单组件中 form-date 控件的显示问题
- -修复 UcButtonContainer 未按照关联容器数据控件按钮显示的问题
  --修复 UcFileContainer 中缺少 content_type 字段引起的显示问题
  --调整首页配置项缓存策略，不在默认缓存配置

- 影响范围：`UcFileContontainer.js`、 `UcButtonContainer`,`assets/css/index.css`、`special/js/detail.js`、`template/Default.html`、`formMinmix.js`、`commonMinmix.js`

# 0.0.54

- 更新日常：2024/11/04
- 更新内容：
  - 新增控件 LiveStreamVideo 和 CameraOperate；
  - realVlaue 返回 null 是显示空；
  - UcTextBox 右侧图标显示条件修复；
  - 同步食堂电子秤中对通用功能的优化：EditComponent 增加 getTextAlign、UcBannerContainer 新增获取和删除图片之前走自定义 js 方法、UcMenuContainer 获取到的路径判断是否被加密成 base64、getPageListData 方法新增一个参数 vm、新增下拉刷新触发距离字段 transitionHeightLever；
  - 同步生产作业中对通用功能的优化：showTopNav 中根据 fn_code 去寻找目标对象，再根据目标对象的 menu_id 去获取子菜单；
- 影响范围：`common.css`、`home.css`、`index.css`、`/images/IOT/`、`CameraOperate.js`、`EditComponent.js`、`FormSelect.js`、`LiveStreamVideo.js`、`ViewComment.js`、`PageListContentContainer.js`、`PageTitleContainer.js`、`UcBannerContainer.js`、`UcCardContainer.js`、`UcJsGridContainer.js`、`UcMenuContainer.js`、`install.js`、`commonMinxin.js`、`gridMinxin.js`、`/SelfDefineProject/entranceJS/index.js`

# 0.0.55

- 更新日期：2024/11/5
- 更新内容：
  -- fileUpload.js 增加可配置固定的已有文件类型
  -- 表单 formMixin 中 keyValue 取值的优先级调整

- 影响范围：`fileUpload.js`、 `formMixin.js`

# 0.0.56

- 更新日期：2024/11/12
- 更新内容：
    - 菜单组件分组功能

- 影响范围：`UcMenuContainer.js`、`home.css`

# 0.0.57

- 更新日期：2024/11/13
- 更新内容：
    - 表单输入框默认占位
    - 文件列表图片不同宽高拉伸优化
    - 全局顶部下拉框拉到最大距离放开文字提示占位不消失
    - uccardcontainer 添加支持 ucbuttoncontainer
- 影响范围：`EditComponent.js`、`UcFileContainer.js`、`erowConfig.js`

# 0.0.58

- 更新日期：2024/11/18
- 更新内容：
    - UcFileContainer ofd 文件预览
    - formselect 不回显问题修复
    - pagelist 监听 search 根据关联的 scopeGuid 判断是否刷新
  - fileUpload 按钮点击会触发父级事件 bug 修复
- 影响范围：`FormSelect.js`、`FormTree.js`、`PageListContentContainer.js`、`UcLayerContainer.js`、`fileUpload.js`

# 0.0.59

- 更新日期：2024/11/20
- 更新内容：
    - 新增移动端进度图模板
- 影响范围：`index.css`、`template.css`、`flow-green.png`、`flow-icon.png`、`TemplateFlowDiagram.js`

# 0.0.60

- 更新日期：2024/11/22
- 更新内容：
    - 移动端 Formtree 支持配置自定义 js
  - 支持配置通用删除表单后返回上一级 js deleteFormAndBackList
- 影响范围：`FormTress.js`、`EditComponent.js`、`baseSpecial.js`

# 0.0.61

- 更新日期：2024/11/22
- 更新内容：
    - 移动端 ios 拍照先获取一下 gps
- 影响范围：`fileUpload.js`、`UcPhoto.js`、`UcFileContainer.js`

# 0.0.62

- 更新日期：2024/11/25
- 更新内容：
    - 移动端拍照先获取一下 gps,拍照是否横屏根据参数来
  - pdf 脚本注入修复
- 影响范围：`fileUpload.js`、`UcPhoto.js`、`UcFileContainer.js`、`pdf.js`、`pdf.worker.js`、`tools/android.js`

# 0.0.63

- 更新日期：2024/11/26
- 更新内容：
    - 移动端选择先获取一下 gps
- 影响范围：`fileUpload.js`、`UcPhoto.js`、`UcFileContainer.js`

# 0.0.64

- 更新日期：2024/12/10
- 更新内容：
    - 移动端提示条
- 影响范围：`index.css`、`EditComponent.js`、`ViewComment.js`、`commonMinxin.js`、`assets/images/icon`

# 0.0.65

- 更新日期：2024/11/23
- 更新内容：
    - pagelist 搜索监听优化，保证一个容器绑定的监听事件唯一
  - FormTree 前端报错修复
  - UcMenuContainer 样式优化
- 影响范围：`FormTree.js`、`PageListContentContainer.js`、`utils/eventEmiter.js`、`assets/css/index.css`

# 0.0.66

- 更新日期：2024/12/17
- 更新内容：
  - 新增统计菜单访问量功能
- 影响范围： `UcMenuContainer.js`,`entranceJS/index.js`

# 0.0.67

- 更新日期：2024/12/20
- 更新内容：
  - 移动端返回键/手势返回添加执行自定义事件功能
- 影响范围： `utils/erowConfig.js`,`pageList.html`,`detail.html`,`special/js/common.js`

# 0.0.68

- 更新日期：2024/12/20
- 更新内容：
  - 点赞组件
- 影响范围：`index.css`、`images/public/`、`UcEvaluation`、`UcContainer`、`default/install.js`、`pageList/install.js`

# 0.0.69

-更新日期：2024/12/27 -更新内容：

- 人脸采集模板 -影响范围：`index.css`、`template.css`、`assets/images/template/`、`templateFacialRecognition.js`、`facialRecognition.html`、`android.js`
  `

# 0.0.70

-更新日期：2025/01/02 -更新内容：

- UcBottombar 中子容器的 pvalueset 跟父容器不一致 bug 修复
- UcCard 中嵌套 jsGrid 重复渲染 bug 修复
- UcScope 给子组件传 fieldMap
- fileUpload.js 中 folderCode 拼写错误更正
- UcFileContainer 不配置上传控件 bug 修复
- 从第三方跳转到 app ss.html 预处理 -影响范围：`UcBottomBar.js`、`UcCardContainer.js`、`UcScopeContainer.js`、`fileUpload.js`、`UcFileContainer.js`、`minxin/commonMinxin.js、tools/android.js、js/android.js（跟APP同级的js文件夹）Main/ss.html(跟APP同级的Main文件夹)  entranceJS/index.js`

# 0.0.71

-更新日期：2025/01/03 -更新内容：

- UcButton 图片 icon 优化
- 表单、卡片支持超链接 -影响范围：`EditComponent.js`、`ViewComponents.js`、`UcFormContainer.js`、`minxin/commonMinxin.js`、`UcButtonContainer.js`

# 0.0.72 -fqn

-更新日期：2025/01/15 -更新内容：

- 移动端 .PDF 文件不能预览处理

-影响范围：`UcFileContainer.js`

# 0.0.73 -xhh

-更新日期：2025/01/16 -更新内容：

- 禁用状态下占位文本逻辑调整

-影响范围：`表单类控件输入框`

# 0.0.74 - tl

-更新日期：2025/01/17 -更新内容：

- 新增 pagelist 跳 detail 返回用临时缓存功能
- 新增 UcTabGroup 切换临时缓存功能 -影响范围：`pagelist查询`、`pagelist跳detail`、`tagGroup切换tab` -更新文件：`PageListContentContainer.js`、`TabGroupContainer.js`、`UcLayerContainer.js`、`erPageController.js`

# 0.0.74 -ckw

- 更新日期：2025/01/17
- 更新内容：
  - UcDataListContainer 新增 Provide 选项，后代组件都可以通过该选项获取对应的数据
- 影响范围: `UcDataListContainer`、`UcTreeNodeContainer`

# 0.0.75 - typ

-更新日期： 2025/01/21 -更新内容：

- 人脸采集样式优化
- 影响范围：`common.css`、`root.css`、`template.css`、`templateFacialRecognition.js`、`facialRecognition.html`

# 0.0.76 - tl

-更新日期： 2025/02/13 -更新内容：

- UcFileContainer 上传以及删除权限控制调整
- 影响范围：`UcFileContainer.js`

# 0.0.77 - tl

-更新日期： 2025/02/13 -更新内容：

- 移动端支持统一配置文件下载上传以及预览的 token 前缀
- 影响范围：`fileUpload.js`，`UcPhoto.js`,`UcBannerContainer.js`,`UcFileContainer.js`,`UcViewContainer.js`,`commonMinxin.js`,`FileList.html`,`SelfDefineProject/entranceJS/index.js`

# 0.0.78 - lyt

-更新日期： 2025/02/14 -更新内容：

- 移动端首页功能点支持动态配置 homepageCode
- fileUpload 上传选项选择功能修复
- 文件预览功能
- 影响范围：`entranceJS/index.js`,`UcMenuContainer.js`,`UcViewContainer.js`,`ViewComment.js`

# 0.0.79 - lyt

-更新日期： 2025/02/20 -更新内容：

- UcJsGridContainer 滚动分页功能
- UcGridContainer 滚动分页分页功能
- 影响范围：`UcJsGridContainer.js`,`UcGridContainer.js`

# 0.0.80 - lyt

-更新日期： 2025/02/24 -更新内容：

- UcJsGridContainer 固定表头功能
- UcGridContainer 固定表头功能
- 影响范围：`UcJsGridContainer.js`,`UcGridContainer.js`,`erow.css`

# 0.0.81 -typ

- 更新日期：2025/02/24
- 更新内容：
  - 地图控件新增实时获取定位、中心点位设置、选中点位与中心点位连线
  - 地图控件支持 DialogActionCtnrUid 配置:字段名
- 影响范围：`UcMapContainer.js`

# 0.0.82 - ckw

- 更新日期: 2025/02/25
- 更新内容
- 优化 file Container 处理缓存数据和接口数据的逻辑，补充优化删除来自缓存数据文件的逻辑。
- 影响范围: 'UcFileContainer.js'

# 0.0.83 - lyt

-更新日期： 2025/02/27 -更新内容：

- UcJsGridContainer 默认高度调整为最大高度
- UcGridContainer 默认高度调整为最大高度
- UcMenuContainer 分组组类的最后一行元素补充逻辑修复
- 影响范围：`UcJsGridContainer.js`,`UcGridContainer.js`,`UcMenuContainer.js`

# 0.0.84 - fqn

-更新日期： 2025/03/04 -更新内容：

- 移动端上传控件添加图片宽高参数 picPxW，picPxH
- android.js 添加图片拍摄大小参数，更改图片 bizinfo 方法
- 影响范围：`android.js`,`UcFileContainer.js`

# 0.0.85 - fqn

-更新日期： 2025/03/07
更新内容：

- UcMenuContainer 可通过配置 MenuDepth 指定展示层级
- UcButton 可配置 DataField 指定文本字段
- 影响范围：`UcMenuContainer.js`,`ViewComment.js`,`EditComponent.js`

# 0.0.86 - fqn

-更新日期： 2025/03/14
更新内容：

- textarea 显示不全样式修复
- android.js 添加 getOtherToken
- 影响范围：`android.js`,`EditComponent.js`

# 0.0.87 - lyt

-更新日期： 2025/03/14
更新内容：

- UcMenuContainer 的 MenuDepth 判断逻辑优化
- 影响范围：`UcMenuContainer.js`

# 0.0.88 - lyt

-更新日期： 2025/03/19
更新内容：

- 全局请求的 loading
- 有导航栏时的拉刷新节点位置调整
- 模板组件-文件同步
- 影响范围：`erowConfig.js`、`index.css`、`template.css`、`images/common/`、`TemplateFileSync.js`、`tools/android.js`

# 0.0.89 - lyt

-更新日期： 2025/03/21
更新内容：

- UcFileContainer 的 downloadfile 接口增加参数 controlGuid
- 影响范围：`UcFileContainer.js`

# 0.0.90 - lyt

-更新日期： 2025/03/21
更新内容：

- 主题色
- 影响范围：全局
- 必要迁移文件（不论是否使用主题色）：`/APP/tools/erMain.js`、`/APP/utils/erowConfig.js`、`/APP/utils/main.js`、`/APP/assets/css/root.css`

# 0.0.91 - lly

-更新日期： 2025/03/21
更新内容：

- UcScopeContainer 支持 tooltip 提示
- 影响范围：`UcScopeContainer.js`

# 0.0.92 - lyt

-更新日期： 2025/03/25
更新内容：

- UcFileContainer 的本地文件列表增加 bizInfo.isShowInFileContainer 筛选（指定文件的 bizInfo.isShowInFileContainer 为 false 会被剔除）
- 影响范围：`UcFileContainer.js`

# 0.0.93 - typ

- 更新日期：2025/03/26
- 更新内容：
  - 分页加载动画优化
  - UcSwitchField 选中颜色改为主题色
- 影响范围: `common.css`、`UcSwitchField.js`、`PageListContentContainer.js`、`UcLayerContainer.js`、`erTool.js`

# 0.0.94 - lyt

- 更新日期： 2025/03/27
- 更新内容：
  - UcFileContainer 文件预览的点击横竖屏切换
  - 影响范围：`FileViewer.html`、`\default\install.js`、`\pageList\install.js`、`orientationMixin.js`、`UcFileContainer.js`、`UcViewContainer.js`、`index.css`、`\assets\images\common\orient.png`

# 0.0.95 - typ

- 更新日期：2025/03/28
- 更新内容：
  - 分页加载动画优化
  - 人脸采集 IOS 样式 bug 修复
- 影响范围: `PageListContentContainer.js`、`template.css`、`facialRecognition.html`

# 0.0.96 - lyt

- 更新日期：2025/04/03
- 更新内容：
  - UcFileContainer 获取数据机制修复
  - UcFileContainer 关联单据逻辑修复
  - UcFileContainer 上传报错修复
- 影响范围: `tools/android.js`、`UcFileContainer.js`、`fileUpload.js`、`index.css`

# 0.0.97 - tl

-更新日期： 2025/03/20
更新内容：

- UcStepList 组件，添加进行中节点相关配置
- 影响范围：`UcStepList.js`

# 0.0.98 - tl

- 更新日期： 2025/04/07
  更新内容
- SelfDefine 自定义 css 以及 js 导入异常问题修复
- UcFileContainer 上传文件支持在 view 模式下显示 fileUpload，并支持隐藏右下角的共 X 条计数，以及相关上传异常问题修复
- UcCardContainer 下使用 UcFileContainer 下的场景支持
- 影响范围：`UcFileContainer.js`,`UcCardContainer.js`，`FileUpload.js`,`config/index.js`,`components/pageList/install.js`,`components/minxin/formMinxin.js`,`UcButtonContainer.js`,`assets/css/index.css`,`assets/css/form.css`,`assets/css/myVant.css`

# 0.0.99 - lyt

- 更新日期：2025/04/08
- 更新内容：
  - apis.js 中 sysLoadConfigData、sysLoadDBData、sysLoadControlData 接口的请求参数去除 refreshFlag
- 影响范围: `apis.js`

# 0.0.100 - lly

- 更新日期：2025/04/10
- 更新内容：
  - 点赞容器优化
- 影响范围: `UcEvaluation.js`, `assets/css/index.css`

# 0.0.100 - xhh

- 更新日期：2025/04/17
- 更新内容：
  - 低版本安卓代码兼容
- 影响范围: `全局`

# 0.0.101 - fqn

- 更新日期：2025/04/17
- 更新内容：
  - app 系统返回键功能优化
- 影响范围: `baseComponents/FormTree/FormTree.js,UcDataListContainer/UcDataListContainer.js,template/detail.html,template/pageList.html,utils/erowConfig.js`

# 0.0.102 - lyt

- 更新日期：2025/04/22
- 更新内容：
  - fileUpload 的 photoSheetSelect 方法的 ControlGUID 取值报错兼容
- 影响范围: `fileUpload.js`

# 0.0.103 - fqn

- 更新日期：2025/04/29
- 更新内容：
  - UcForm 添加监听，可以通过 globalUpdate 刷新数据
  - UcTabGroup 配置 Pagelist 没有关联搜索容器时接口报错问题修复
- 影响范围: `UcEvaluation/UcEvaluation.js,commonMinxin.js，formMinxin.js,gridMinxin.js`

# 0.0.104 - fqn

- 更新日期：2025/05/16
- 更新内容：
  - 移动端地图参数放在配置文件
  - UcTabGroup 配置 Pagelist 没有关联搜索容器时接口报错问题修复
  - 菜单组件可以执行自定义 OnClientClick
- 影响范围: `ViewComment.js,UcMenuContainer.js，config/index.js,js/common.js`

# 0.0.105 - lly

- 更新日期：2025/05/21
- 更新内容：
  - 新增标签组查询组件，可引入 pagelist,ucGridContainer,UcJsGridContainer
- 影响范围: `myVant.css,UcTagFilter.js，PageListContentContainer.js,UcGridContainer.js`,`UCJsGridContainer.js`,`gridMinxin.js`,`install.js`

# 0.0.106 - lyt

- 更新日期：2025/05/22
- 更新内容
  - UcFileContainer-卡片模式，兼容一行 5 个
  - fileUpload 选择自定义类型逻辑修复
- 影响范围: `UcFileContainer.js`,`fileUpload.js`,`index.css`

# 0.0.107 - lly

- 更新日期：2025/05/28
- 更新内容：
  - EditComponent 获取配置属性 Align 改为 TextAlign
  - UcFileContainer 图片支持配置显示名字
  - 表单 form 支持通过在无数据时支持通过配置设置默认值
  - 影响范围: `UcFileContainer.js`,`EditComponent.js`,`formMinxin.js`

# 0.0.108 - typ

- 更新日期：2025/06/03
- 更新内容：

  - 修复：当没有关联查找容器的列表配置了分组 categoryFiled 时 getDataList,没有获取列表数据
  - 修复：优化配置在弹窗中的 UcTagFilter 样式
  - 新增：igw 标准弹窗组件 IgwCapsule 引入首页使用，引入相关 js、图片、css
  - 影响范围: `PageListContentContainer.js`、`myVant.css`、`/index.css`、`close-igw.png`、`point-igw.png`、`IgwCapsule.js`、`default/install.js`、`Default.html`、`/tools/index.js`、`tools_igw/capsuleUtils.js`、`erMain.js`

  # 0.0.109 fqn

- 更新日期：2025/06/13
- 更新内容：

  - 地图 url 等参数放在配置文件
  - pdf 预览部分内容有时候不显示问题修复
  - UcLayerMain 下面直接配置 scope 容器，参数未转换问题修复
  - 兼容鸿蒙
  - 影响范围: `UcCardContainer.js`,`UcViewContainer.js`,`formMinxin.js`，`config/index.js`，`special/js/common.js`,`/android.js`,`erTool.js`

# 0.0.110 fqn

- 更新日期：2025/06/20
- 更新内容：

  - form 表单配置 FormSelect 打开弹窗的选择事件新增方法 confirmCoverDropDownMutiSelectInForm，可以覆盖之前选择的数据
  - 兼容鸿蒙
  - 影响范围:`utils/baseSpecial.js`

# 0.0.111 fqn

-更新日期：2025/06/27 -更新内容：

- 配置了控件联动的下拉框等数据源控件，编辑状态下获取数据后自动执行一次控件联动获取数据
- form 配置 aftergetContainerdata 有时不生效 bug 修复
- 选择回填根据配置的 DialogBoundFieldValue 回填指定字段，不配置默认回填全部选择字段
- 影响文件：`EditComponent.js` ,`FormSelect.js`,`PageListContentContainer.js`,`UcButtonContainer.js`,`/minxin/formMinxin.js`
- 影响范围：
  - form 和 card 配置了获取数据后回调的场景
  - 配置了 select 下拉之后更改其他下拉数据源的场景
  - 选择弹窗按钮选择回填的通用 js

# 0.0.112 -typ

- 更新日期：2025/06/03
- 更新内容：
  - i 国网相关适配工作，新增 i 国网相关参数、新单点登录、文件去重、引入浮窗、兼容 i 国网深色模式
- 影响范围：全局样式；引入文件路径统一；i 国网环境的登录；

# 0.0.113 -lly

- 更新日期：2025/07/10
- 更新内容：
  - 表单增加展开收起按钮限制，当文字展示一行时不显示
- 影响范围：表单配置 IsOperateShowOneLine 属性的控件

# 0.0.113 -tl

- 更新日期：2025/07/07
- 更新内容：
  - 移动端 BoundField 提示信息异常修复
- 影响范围：移动端 BoundField 使用提示信息功能

# 0.0.114 -fqn

- 更新日期：2025/07/16
- 更新内容：
  - 移动端 pdf 查找定位功能
  - Ucgrid 未配 Height 时报错修复
  - 多选控件数据选中后未回显以及选择列表文本不显示问题修复
  - andriod.js 新增下载缓存相关的 js 方法
- 影响范围：pdf 文件预览，多选控件，UcGrid 一览表容器

# 0.0.115 -fqn

- 更新日期：2025/08/06
- 更新内容：
  - 移动端 pagelist 分组展示前端页面懒加载避免卡顿
  - 首页，入口页清楚搜索条件缓存
  - 移动端多选优化
  - 按钮打开弹窗支持配置传参
  - 文件列表空状态样式修复
  - 文件上传 foldercode 转为字符串
  - UcButtonContainer saveForm 添加回调
  - 下拉刷新可以配置是否刷新
  - fileContainer 可以配置上传文件操作类型
  - UcTextBox 配置 enter 事件时，清空自动触发
  - UcTab 监听 pagelist 的 search 优化
  - 按钮通用选择 js 可以触发回调
- 影响范围：移动端 pagelist 分组展示，搜索条件缓存，文件上传，弹窗多选
  - andriod.js 新增下载缓存相关的 js 方法
- 影响范围：pdf 文件预览，多选控件，UcGrid 一览表容器

# 0.0.115 -tl

- 更新日期：2025/07/23
- 更新内容：
  - 移动端 radioButtonList 支持 click 事件
- 影响范围：radioButtonList 控件事件绑定

# 0.0.116 -tl

- 更新日期：2025/09/12
- 更新内容：
  - 移动端 UcMenuContainer 支持跳转外部系统
- 影响范围：UcMenuContainer 菜单跳转

# 0.0.117 -tl

- 更新日期：2025/10/16
- 更新内容：
  - UcCheckbox 支持 change 事件
  - UcForm 支持引用 buttonContainer
  - UcForm 支持子控件只读模式下可编辑
  - UcPagelist 引用 Card 再引用 buttonContainer 相关支持
  - 工作流提交参数拼写调整
- 影响范围：UcCheckbox 勾选，UcForm 引用 buttonContainer，UcForm 禁用设置，工作流提交

# 0.0.118 -tl

- 更新日期：2025/10/23
- 更新内容：
  - UcChart 支持解析 chart 各数据自定义样式
  - UcBannerContainer 支持设置 banner 文本样式
  - jsgrid 引用 form 高度自动计算优化
- 影响范围：UcBannerContainer 样式，jsGird 引用 form 样式

# 0.0.119 -fqn

- 更新日期：2025/10/31
- 更新内容：
  - 按钮打开新页面支持配置原页面打开
- 影响范围：跳转新页面

- 更新日期：2025/11/19
- 更新内容

  - 文件上传遮罩层交互调整
  - boundField 支持设置溢出样式时，默认添加 tooltip 显示全部内容功能
  - 加密控件解密异步转同步无效问题处理
  - UcTreeNodeContainer 支持自定义样式

- 更新日期：2025/12/2
- 更新内容
  - UcButtonContainer 中按钮关联逻辑调整
  - 卡片支持单项编辑和新增卡片时带出默认值逻辑
  - 获取参数逻辑优化，排除掉已经隐藏的 form
  - 对隐藏的 form 的样式进行处理，不再占位
  - 执行 dbAction 后可刷新指定的容器
  - 新增上传文件
  - UcPageList 增加工作流样式逻辑
  - 编辑保存返回和新增保存返回


  - 更新日期：2025/12/8
  - 更新内容
  - UcButttonContainer 新增数据后刷新指定容器的数据
  - UcJsGrid删除样式调整和渲染逻辑调整
  - 新增模式下文件上传

# 0.0.119 -fqn

- 更新日期：2025/12/25
- 更新内容
  - UcPageTitleContainer 可以配置是否显示直接显示返回首页按钮
  - UcButtonContainer按钮防抖间隔调整
-更新文件：UcPageTitleContainer.js、UcButtonContainer.js、assets/css/common.css、tools/index.js、
SelfDefineProject/entranceJS/index.js

# 0.0.120 -fqn
- 更新日期：2026/01/09
- 更新内容
  - 新增单据上传文件逻辑优化
  - 文件预览查找框可以配置是否显示，样式优化
-更新文件：assets/css/index.css、UcButtonContainer.js、UcViewContainer.js、minxin/formMinxin.js、
SelfDefineProject/entranceJS/index.js、Elowcode/entranceJS/index.js
 
# 0.0.120 -dsf
  - 更新日期：2025/12/30
  - 更新内容
    UcFileContainer支持disabled属性，可以使UcFileContainer的状态不受pageMode完全控制  
  - 影响范围：UcFileContainer.js
# 0.0.120 -dsf 
  - 更新日期： 20260114
  - 更新内容
      UcBannerContainer图片获取逻辑调整
  - 更新文件：UcBannerContainer.js 

# 0.0.120 -dsf 
  - 更新日期： 20260119
  - 更新内容
      UcBannerContainer图片获取逻辑调整
      icon类型支持indexedDB缓存，并做了并发控制
      utils目录下新增indexedDBCache.js文件，default.html新增引入indexedDBCache.js脚本
      baseSpecail.js新增limiRequest方法
  - 更新文件：UcBannerContainer.js , baseSpecial.js，default.html，indexedDBCache.js

  # 0.0.121 -tl
  - 更新日期：2026/01/19
  - 更新内容
    - UcButton支持imgType配置
    - 移动端jsgrid支持隐藏总计页脚以及空信息提示
    - 移动端UcButtonContainer关联form取参调整
    - UcChartContainer的pvalueset取值缺失异常问题修复
    - viewContainer 预览url缺失问题修复
    - 底部buttonContainer支持动态设置显隐
    - jsgrid引用card关联信息取值修复
    - PlaceHolder禁用状态下默认不显示
    - JsGrid单行删除显隐权限逻辑异常修复
    - 输入控件禁用以及必填支持动态配置
    - buildDetailObj 假值问题处修复
    - fileupload文件上传时长度为0无返回问题问题处理
  - 影响范围：按钮配置，jsGrid，文件上传，文件预览，图标容器，输入控件


  - 更新日期：2026/1/21
  - 更新内容
    移动端选择器

# 0.0.122-dsfu
- 更新日期：2026/02/03
- 更新内容：
  - 移动端UcBannerContainer，UcMenuContainer图片缓存逻辑调整，indexedDB支持自动检测升级版本，并且indexedDB打开失败时不抛出异常，避免阻塞主线程
- 影响范围：UcBannerContainer.js，UcMenuContainer.js，indexedDBCache.

# 0.0.123-dsfu
- 更新日期：2026/03/06
- 更新内容：
  - 移动端首页banner图，菜单图标缓存逻辑调整，主要是同步之前云端的调整逻辑，固定indexedDB打开版本1，缓存异常时用resolve代替reject，避免阻塞主线程。
  - limitRequest方法调整，逻辑调整为与云端相同
- 影响范围：UcBannerContainer.js，UcMenuContainer.js，indexedDBCache.js，baseSpecil.js

# 0.0.124-xhh
- 更新日期：2026/03/06
- 更新内容：
  - jsgrid 内嵌套card的,card内再支持选择器的配置
  
- 影响范围：选择器

# 0.0.125-yjd
- 更新日期：2026/04/16
- 更新内容：
  - 解决 UcKindEditor 富文本内容在手机上无法显示和编辑的问题
  
- 影响范围：使用 UcKindEditor 配置的页面；富文本编辑器

# 0.0.126-yjd
- 更新日期：2026/04/16
- 更新内容：
  - 解决 UcFileContainer 在手机真机运行时上传按钮和附件列表完全不显示的问题
  
- 影响范围：UcFileContainer

# 0.0.127-dsf
- 更新日期：2026/05/06
- 更新内容：
  - commonMinxin在生成pageContext时，修复存入undefined的上下文问题
  - UcBottomBar在获取关联容器配置时，修复undefined问题
- 影响范围：commonMinxin.js，UcBottomBar.js

# 0.0.128-xhh
- 更新日期：2026/05/07
- 更新内容：
  - new_row_guid新增
  - 弹窗关闭时，清理绑定的seach监听,避免多个弹窗来回打开时，pagelist的搜索失效

  # 0.0.128-xhh
- 更新日期：2026/05/11
- 更新内容：
  - 前端参数化优化，支持配置部分配置为远程
  - 弹窗关闭时，清理绑定的seach监听,避免多个弹窗来回打开时，pagelist的搜索失效


# 0.0.128-dsf
- 更新日期：2026/05/14
- 更新内容：
 - 同步信息报送调整的pageListContainer的锚点功能
 - 同步信息报送调整的UcBottomBar切换加载配置逻辑
 - 同步信息报送调整的文件容器支持下载按钮/图标的功能，以及补充相应的下载逻辑
 - 同步信息报送调整的UcContainerNoGroup支持UcTabGroup功能
- 影响范围：pageListContentContainer.js，UcBottomBar.js，UcFileContainer.js，baseSpecial.js，android.js，index.css，UcContainerNoGroup.js

# 0.0.129-dsf
- 更新日期：2025/05/20
- 更新内容：
  - 同步工器具项目调整的文件容器支持预览模式切换，优化下载权限按钮的下载逻辑
  - 同步工器具项目调整的表单里的hyperLink支持预览pdf/图片文件，下载其他类型的文件。
  - 同步工器项目调整的UcContainerNoGroup支持UcFileContainer，UcButtonContainer支持固定在底部显示
  - formMinxin.js注释handlerAfterGetContainerData执行逻辑，相应逻辑已在apis.js的sysLoadDB方法里进行处理
  - UcViewContainer优化，只有是pdf/ofd文件类型时才对pdfUrl进行赋值
影响范围：myCant.css，UcContainer.css，EditComponent.js，UcContainerNoGroup.js，UcFileContainer.js，UcViewContainer.js，commonMincin.js，formMinxin.js，pageList.html，android.js，baseSpecial.js

# 0.0.129-tl

- 更新日期：2026/05/25
- 更新内容：
 - 系统间跳转支持传入fnCode以及fnParamter解析
- 影响范围：系统间跳转

#20260602_1515

- 更新日期：2026/06/02
- 更新内容：
 - 拍照Gps可以根据配置开启关闭
  - ios页面跳转不执行beforeunload功能优化
  - SS页面 跨系统跳转路径计算优化
  - 打开新页面获取dialogpvalueset优化
  - 提交按钮成功提示语可配置  
- 影响范围：移动端系统间跳转，打开新页面

# 20260603_1314-tl
- 更新日期：2026/06/03
- 更新内容：
  - char支持关联scope 搜索
- 影响范围：chart搜索

# 20260603_1435
- 更新日期：2026/06/03
- 更新内容：
 - fileContainer支持在线md预览以及显示上传进度
- 影响范围：fileContainer上传

# 20260603_1531
- 更新日期：2026/06/03
- 更新内容：
 - 表单的展开收起样式修复
 - 菜单容器的图标转移到各自项目存放
 - 卡片单项编辑的校验
- 影响范围：卡片单项编辑、菜单容器应用图标、


# 202606011_1039
- 更新日期：2026/06/03
- 更新内容：
 - UcGrid引用form支持配置表头form
 - UcLabel文本对齐配置兼容
 - 文件上传支持自定义选择类型
 - 签名支持
 - UcForm支持引入FileContainer
 - UcForm展开收起样式统一
 - 百度地图ak优化
- 影响范围：UcGrid引用form，UcLabel显示，文件上传，百度地图使用



# 20260611_1635
- 更新日期：2026/06/11
- 更新内容：
  - pageListContainer锚点定位逻辑优化：滚动smooth变为auto，避免滚动到目标锚点过程中又触发滚动监听事件，导致定位混乱问题
  - pageListContainer分组的CardItem补充datafromlist属性
  - 文件容器一览表预览模式下，文件上传控件显示逻辑调整为与缩略图显示逻辑一致
  - 文件容器支持UploadFields属性，并透传到文件上传控件，可以实现配置上传时所需的自定义参数
  - 新增状态下的文件上传逻辑优化：支持同一个跟组件挂载多个文件容器的统一上传
  - 控件显示隐藏逻辑优化：修复编辑状态下表单通过控件联动控制控件显隐失效的问题
- 影响范围：pageListContainer，文件容器，UcButtonContainer处理新增时的文件上传逻辑，commonMinxin.js里getVisible函数

# 20260618_16_59_tl
- 更新日期：2026/06/03
- 更新内容：
 - UcBoundField支持配置ConfirmMessage
 - 文件上传进度条鸿蒙异常问题修复
- 影响范围：文件上传

# 20260624_14_43_dsf
- 更新日期：2026/06/24
- 更新内容：
  - UcBottomBar优化，支持根据url的查询参数时间戳判断是否为首次进入，并结合菜单参数实现首次进入时激活跟菜单相关的tab，而不是缓存的tab
  - Entrance.html跳转地址后拼接时间戳查询参数
- 影响范围：UcBottomBar.js，Entrance.html

# 20260706_171430
- 更新日期：2026/07/06
- 更新内容：
  - jsGird中的form配置AfterGetContainerData不生效问题修复
- 影响范围：formMinxin.js

# 20260706_16_31_dsf
- 更新日期：2026/07/06
- 更新内容：
  - dataList支持treeNnode
- 影响范围：dataList

#20260708_094925
- 更新日期：2026/07/08
- 更新内容：
  - UcBottomBar默认进入tab错误修复
- 影响范围：UcBottomBar.js

# 20260720_1325
- 更新日期：2026/07/06
- 更新内容：
  - UcTab支持关联切换scope
- 影响范围：UcTab搜索
# 20260715_085900
- 更新日期：2026/07/15
- 更新内容：
  - 文件容器修复v-if导致的文件上传达到上限后refs.uploadRef为undefined的问题
  - UcBottomBar支持afterGetContainerConfig事件
- 影响范围：UcFileContainer.js，UcBottomBar.js


# 20260728_0918
- 更新日期：2026/07/28
- 更新内容：
  - 文件上传支持配置相关提示
  - jsGrid以及pageList引用card支持长按相关操作
- 影响范围：文件上传，card操作

# 20260728_1330
- 更新日期：2026/07/28
- 更新内容：
  - UcCardFileContainer组件新增
  - UcContainer支持引用UcCardFileContainer组件
  - UcFileContainer调整，UcCardFileContainer里的UcFileContainer在注册window.fileCtnr和pageContext时做特殊处理，在上传获取文件容器数据时，folder_id取值也做了特殊处理
  - UcButtonContainer的saveForm方法和uploadRelativeFile方法做调整，新增逻辑判断是否有cardFileContainer里的文件容器，在判断是否必传以及上传时做了区分，以及上传时做了并发控制。
影响范围：UcFileContainer.js,UcContainer.js,UcButtonContainer.js
