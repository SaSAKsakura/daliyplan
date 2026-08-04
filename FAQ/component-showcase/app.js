(() => {
  "use strict";

  const payload = window.COMPONENT_CATALOG;
  if (!payload || !Array.isArray(payload.components)) {
    document.body.innerHTML = "<p>组件目录未生成，请先运行 generate_catalog.py。</p>";
    return;
  }

  const categories = [
    {
      id: "navigation",
      name: "页面骨架与导航",
      description: "标题、页签、菜单与底部导航组成移动端页面骨架；本示例复用源码的主题色、标题栏和纵向容器关系。",
      notes: [
        ["源码复原", "UcPageTitleContainer 默认提供返回入口，中间显示标题，右侧可挂载搜索等操作控件。"],
        ["源码复原", "UcTabGroup 负责切换业务容器；角标在源码可见，但手册尚未给出完整配置格式。"],
        ["交互建议", "底部导航保留清晰激活态；全屏搜索作为 UcScopeContainer 的 full-page 方案。"],
      ],
      render: renderNavigation,
    },
    {
      id: "data-list",
      name: "数据展示与列表",
      description: "卡片列表是移动端主要浏览模式；状态标签、筛选、空数据与树形视图共同覆盖常见列表状态。",
      notes: [
        ["源码复原", "UcPageListContainer 由 PageListContentContainer 实际渲染，并引用 UcCardContainer 作为卡片模板。"],
        ["源码复原", "UcBoundField 可通过动态 class 呈现红色、绿色等业务状态。"],
        ["交互建议", "同时展示有数据、空数据、选择和详情弹层，避免只验证理想状态。"],
      ],
      render: renderDataList,
    },
    {
      id: "form",
      name: "表单与字段编辑",
      description: "统一字段渲染器根据 ControlCode 呈现文本、日期、选择、开关、步进器和评分；多行编辑另行承载明细。",
      notes: [
        ["源码复原", "UcFormDetailView 映射到 UcFormContainer，字段由 EditComponent 或 UcDynamicComponent 组合渲染。"],
        ["源码复原", "编辑模式显示分隔与输入控件，查看模式收敛为只读文本。"],
        ["交互建议", "敏感字段显隐、校验错误和多行增删应与页面模式共同验收。"],
      ],
      render: renderForm,
    },
    {
      id: "actions",
      name: "操作、权限与反馈",
      description: "按钮由页面模式和权限共同决定可见性，并需要覆盖禁用、加载、二次确认、进度和用户反馈。",
      notes: [
        ["源码复原", "UcButtonContainer 在源码中承担页面底部操作条和标题栏右侧按钮两类位置。"],
        ["交互建议", "权限按钮按 RelativeContainer 和 RelateOpCode 过滤，自定义按钮只按页面模式控制。"],
        ["交互建议", "异步操作期间禁用重复点击，并保留明确完成提示。"],
      ],
      render: renderActions,
    },
    {
      id: "workflow-files",
      name: "工作流、文件与媒体",
      description: "流程步骤、文件列表、缩略图、上传来源和预览构成业务详情页的高频组合。",
      notes: [
        ["源码复原", "UcWorkflow 使用步骤、意见和操作按钮呈现流程状态，并可复用云端流程配置。"],
        ["源码复原", "UcFileContainer 支持列表/缩略图和图片预览；PDF 与原生第三方预览需真实终端验证。"],
        ["交互建议", "iOS 上传入口差异必须显式提示，避免把桌面浏览器效果当作跨端结论。"],
      ],
      render: renderWorkflowFiles,
    },
    {
      id: "visualization",
      name: "图表、轮播与地图",
      description: "轮播、图表和地图承载动态信息；静态夹具可验证视觉与点击状态，但不能证明接口数据格式正确。",
      notes: [
        ["源码复原", "UcBannerContainer 使用主题色轮播和指示点，可由静态或动态文件数据驱动。"],
        ["源码复原", "UcChartContainer 基于 ECharts 配置，支持图例变化、点击和跳转参数。"],
        ["交互建议", "图表钻取和地图定位用可回退的本地状态演示，不请求外部地图或业务接口。"],
      ],
      render: renderVisualization,
    },
  ];

  const state = {
    activeCategory: categories[0].id,
    navTab: 0,
    bottomNav: 0,
    navSearch: false,
    listMode: "cards",
    listQuery: "",
    selectedCard: null,
    treeOpen: true,
    formMode: "view",
    formData: { name: "东区设备巡检", date: "2026-07-30", type: "例行巡检", enabled: true, count: 2, secretVisible: false, rate: 4 },
    gridRows: [
      { item: "灭火器", count: 8 },
      { item: "应急灯", count: 4 },
    ],
    permission: "editor",
    actionProgress: 68,
    actionLoading: false,
    confirmAction: false,
    reaction: "",
    workflowStep: 1,
    workflowConfirm: false,
    fileView: "list",
    fileSource: false,
    filePreview: false,
    banner: 0,
    chartActive: 2,
    mapLocated: false,
    templateOpen: false,
    catalogQuery: "",
    sourceFilter: "全部",
  };

  const categoryNav = document.getElementById("categoryNav");
  const deviceScreen = document.getElementById("deviceScreen");
  const notes = document.getElementById("interactionNotes");
  const sourceFilters = document.getElementById("sourceFilters");
  const catalogBody = document.getElementById("catalogBody");
  const catalogResult = document.getElementById("catalogResult");
  const sourceOptions = ["全部", "直接实现", "别名渲染", "组合渲染", "未发现实现", "非可视定义"];
  let toastTimer;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function icon(name) {
    const icons = {
      back: "‹",
      search: "⌕",
      close: "×",
      home: "⌂",
      list: "☷",
      mine: "♙",
      folder: "▣",
      chart: "▥",
      workflow: "✓",
      grid: "▦",
      calendar: "◫",
      camera: "◉",
      image: "▧",
      document: "▤",
      video: "▶",
      location: "⌖",
    };
    return icons[name] || "•";
  }

  function componentCount(categoryName) {
    return payload.components.filter((item) => item.category === categoryName).length;
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function mobileHeader(title, right = "") {
    return `
      <header class="mobile-header">
        <button class="icon-button" type="button" data-action="back" aria-label="返回">${icon("back")}</button>
        <div class="mobile-header__title">${escapeHtml(title)}</div>
        ${right || "<span></span>"}
      </header>`;
  }

  function renderCategoryNav() {
    categoryNav.innerHTML = categories
      .map(
        (category) => `
          <button class="category-button" type="button" role="tab" data-category="${category.id}" aria-selected="${state.activeCategory === category.id}">
            ${category.name}
            <span>${componentCount(category.name)} 条定义</span>
          </button>`,
      )
      .join("");
  }

  function renderNotes(category) {
    notes.innerHTML = category.notes
      .map(
        ([label, copy]) => `
          <article class="note-card ${label === "交互建议" ? "note-card--idea" : ""}">
            <span class="note-card__label">${label}</span>
            <p>${copy}</p>
          </article>`,
      )
      .join("");
  }

  function renderStage() {
    const category = categories.find((item) => item.id === state.activeCategory) || categories[0];
    document.getElementById("stageTitle").textContent = category.name;
    document.getElementById("stageDescription").textContent = category.description;
    document.getElementById("stageCount").textContent = componentCount(category.name);
    deviceScreen.innerHTML = category.render();
    renderNotes(category);
    renderCategoryNav();
  }

  function renderNavigation() {
    const tabs = ["待处理", "已完成", "我发起"];
    const content = [
      ["待审批任务", "设备巡检申请等待处理", "3 项"],
      ["已完成任务", "本周已归档的申请", "12 项"],
      ["我的申请", "由当前用户发起", "5 项"],
    ][state.navTab];
    return `
      <div class="mobile-page">
        ${mobileHeader(
          "移动工作台",
          `<button class="icon-button" type="button" data-action="toggle-search" aria-label="打开搜索">${icon("search")}</button>`,
        )}
        <div class="mobile-tabs" role="tablist">
          ${tabs
            .map(
              (tab, index) => `<button class="mobile-tab" type="button" data-action="nav-tab" data-index="${index}" aria-selected="${state.navTab === index}">${tab}${index === 0 ? '<span class="badge">3</span>' : ""}</button>`,
            )
            .join("")}
        </div>
        <div class="mobile-scroll">
          <div class="mobile-card">
            <div class="card-title-row"><strong>${content[0]}</strong><span class="status-tag">${content[2]}</span></div>
            <p class="card-meta">${content[1]}。页签引用独立 UcContainer，并保留对应按钮组。</p>
          </div>
          <div class="menu-grid">
            <div class="menu-tile"><span class="menu-icon">${icon("workflow")}</span><span>流程审批</span></div>
            <div class="menu-tile"><span class="menu-icon">${icon("document")}</span><span>资料中心</span></div>
            <div class="menu-tile"><span class="menu-icon">${icon("chart")}</span><span>数据看板</span></div>
            <div class="menu-tile"><span class="menu-icon">${icon("location")}</span><span>地图巡检</span></div>
          </div>
          <div class="mobile-card" style="margin-top: 10px">
            <div class="card-title-row"><strong>简洁标题样式</strong><span class="status-tag">pithy-title-erow</span></div>
            <p class="card-meta">子区域标题采用左侧主题色短线，隐藏默认返回图标。</p>
          </div>
        </div>
        <nav class="mobile-bottom-bar" aria-label="底部导航">
          ${["首页", "任务", "我的"]
            .map(
              (label, index) => `<button type="button" class="bottom-item ${state.bottomNav === index ? "is-active" : ""}" data-action="bottom-nav" data-index="${index}"><strong>${icon(["home", "list", "mine"][index])}</strong>${label}</button>`,
            )
            .join("")}
        </nav>
        ${
          state.navSearch
            ? `<div class="overlay"><div class="overlay-panel"><div class="search-bar"><input id="fullSearch" value="" placeholder="输入标题、编号或申请人" autofocus /><button type="button" data-action="search-submit">查找</button><button class="mobile-button mobile-button--outline" type="button" data-action="toggle-search">关闭</button></div><p class="helper-text">UcScopeContainer / CssClass=full-page</p></div></div>`
            : ""
        }
      </div>`;
  }

  function renderDataList() {
    const cards = [
      { id: "EQ-20260730-01", title: "东区消防设备巡检", owner: "张工", status: "进行中", danger: false },
      { id: "EQ-20260730-02", title: "仓库温控异常复核", owner: "李工", status: "待整改", danger: true },
      { id: "EQ-20260730-03", title: "配电房月度检查", owner: "王工", status: "已完成", danger: false },
    ].filter((item) => `${item.id}${item.title}${item.owner}`.toLowerCase().includes(state.listQuery.toLowerCase()));
    let content = "";
    if (state.listMode === "empty" || cards.length === 0) {
      content = `<div class="empty-state"><div><div class="empty-illustration"></div><strong>暂无匹配数据</strong><p class="helper-text">保留清空筛选或重新加载入口</p></div></div>`;
    } else if (state.listMode === "tree") {
      content = `
        <div class="mobile-card">
          <div class="tree">
            <button type="button" data-action="toggle-tree"><span>${state.treeOpen ? "▾" : "▸"}</span><strong>生产区域</strong></button>
            ${
              state.treeOpen
                ? `<div class="tree-children"><button type="button" data-action="tree-select">东区设备 <span class="status-tag">12</span></button><button type="button" data-action="tree-select">西区设备 <span class="status-tag">8</span></button></div>`
                : ""
            }
            <button type="button" data-action="tree-select"><span>▸</span><strong>办公区域</strong></button>
          </div>
        </div>`;
    } else {
      content = cards
        .map(
          (card) => `
            <button type="button" class="mobile-card mobile-card--clickable ${state.selectedCard === card.id ? "mobile-card--selected" : ""}" data-action="open-card" data-id="${card.id}">
              <div class="card-title-row"><strong>${card.title}</strong><span class="status-tag ${card.danger ? "status-tag--danger" : ""}">${card.status}</span></div>
              <p class="card-meta">编号 ${card.id} · 负责人 ${card.owner}</p>
              <div class="detail-row"><span class="helper-text">计划完成 2026-08-02</span><span aria-hidden="true">›</span></div>
            </button>`,
        )
        .join("");
    }
    return `
      <div class="mobile-page">
        ${mobileHeader("巡检任务列表")}
        <div class="search-bar"><input id="listSearch" value="${escapeHtml(state.listQuery)}" placeholder="搜索编号、标题或负责人" /><button type="button" data-action="list-search">筛选</button></div>
        <div class="mode-switch" role="group" aria-label="列表状态">
          ${[
            ["cards", "卡片"],
            ["tree", "树形"],
            ["empty", "空状态"],
          ]
            .map(([mode, label]) => `<button type="button" data-action="list-mode" data-mode="${mode}" aria-pressed="${state.listMode === mode}">${label}</button>`)
            .join("")}
        </div>
        <div class="mobile-scroll">${content}</div>
        ${
          state.selectedCard
            ? `<div class="overlay"><div class="overlay-panel overlay-panel--center"><h3>任务详情</h3><p class="card-meta">${state.selectedCard}</p><p>卡片通过 DialogActionCtnrUID 打开详情，并用 DialogKeyDataField 传递主键。</p><div class="overlay-actions"><button class="mobile-button mobile-button--outline" type="button" data-action="close-card">关闭</button><button class="mobile-button" type="button" data-action="card-detail">进入详情</button></div></div></div>`
            : ""
        }
      </div>`;
  }

  function renderForm() {
    const edit = state.formMode === "edit";
    const rows = state.gridRows
      .map(
        (row, index) => `
          <tr>
            <td><input data-grid-field="item" data-index="${index}" value="${escapeHtml(row.item)}" ${edit ? "" : "readonly"} aria-label="明细名称 ${index + 1}" /></td>
            <td><input data-grid-field="count" data-index="${index}" value="${row.count}" ${edit ? "" : "readonly"} aria-label="数量 ${index + 1}" /></td>
            <td>${edit ? `<button class="icon-button" type="button" data-action="remove-row" data-index="${index}" aria-label="删除第 ${index + 1} 行">×</button>` : "—"}</td>
          </tr>`,
      )
      .join("");
    return `
      <div class="mobile-page">
        ${mobileHeader("巡检任务详情")}
        <div class="mode-switch" role="group" aria-label="页面模式">
          <button type="button" data-action="form-mode" data-mode="view" aria-pressed="${!edit}">查看模式</button>
          <button type="button" data-action="form-mode" data-mode="edit" aria-pressed="${edit}">编辑模式</button>
        </div>
        <div class="mobile-scroll">
          <div class="mobile-card" style="padding: 0; overflow: hidden">
            <div class="mobile-form">
              <div class="form-row"><label for="fieldName">任务名称</label><input id="fieldName" data-form-field="name" value="${escapeHtml(state.formData.name)}" ${edit ? "" : "readonly"} /></div>
              ${edit && !state.formData.name.trim() ? '<div class="form-row"><span></span><span class="field-error">任务名称不能为空</span></div>' : ""}
              <div class="form-row"><label for="fieldDate">计划日期</label><input id="fieldDate" type="date" data-form-field="date" value="${state.formData.date}" ${edit ? "" : "readonly"} /></div>
              <div class="form-row"><label for="fieldType">巡检类型</label><select id="fieldType" data-form-field="type" ${edit ? "" : "disabled"}><option>例行巡检</option><option ${state.formData.type === "专项检查" ? "selected" : ""}>专项检查</option></select></div>
              <div class="form-row"><label>立即启用</label><button class="switch" type="button" data-action="toggle-switch" aria-pressed="${state.formData.enabled}" ${edit ? "" : "disabled"} aria-label="立即启用"></button></div>
              <div class="form-row"><label>巡检组数</label><div class="stepper"><button type="button" data-action="stepper-minus" ${edit ? "" : "disabled"}>−</button><strong>${state.formData.count}</strong><button type="button" data-action="stepper-plus" ${edit ? "" : "disabled"}>+</button></div></div>
              <div class="form-row"><label>联系人</label><span>138****2486</span><button class="icon-button" type="button" data-action="toggle-secret" aria-label="显示或隐藏敏感信息">${state.formData.secretVisible ? "◉" : "◎"}</button></div>
              ${state.formData.secretVisible ? '<div class="form-row"><span></span><span>13812342486</span></div>' : ""}
              <div class="form-row"><label>风险评分</label><div class="stars" role="group" aria-label="风险评分">${[1, 2, 3, 4, 5].map((star) => `<button type="button" class="${star <= state.formData.rate ? "is-active" : ""}" data-action="rate" data-value="${star}" ${edit ? "" : "disabled"}>★</button>`).join("")}</div></div>
            </div>
          </div>
          <div class="mobile-card">
            <div class="card-title-row"><strong>检查明细</strong>${edit ? '<button class="mobile-button mobile-button--outline" type="button" data-action="add-row">新增行</button>' : ""}</div>
            <table class="grid-editor"><thead><tr><th>项目</th><th>数量</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table>
          </div>
        </div>
        <div class="action-row" style="padding: 10px 12px; background: #fff; border-top: 1px solid #e7edf1">
          ${edit ? '<button class="mobile-button mobile-button--outline" type="button" data-action="form-cancel">取消</button><button class="mobile-button" type="button" data-action="form-save">保存</button>' : '<button class="mobile-button" style="width: 100%" type="button" data-action="form-mode" data-mode="edit">编辑</button>'}
        </div>
      </div>`;
  }

  function renderActions() {
    const editor = state.permission === "editor";
    return `
      <div class="mobile-page">
        ${mobileHeader("操作与权限")}
        <div class="mobile-scroll">
          <div class="mobile-card">
            <div class="card-title-row"><strong>模拟当前权限</strong><span class="status-tag">${editor ? "编辑者" : "查看者"}</span></div>
            <div class="mode-switch" style="margin: 12px 0 0">
              <button type="button" data-action="permission" data-value="viewer" aria-pressed="${!editor}">查看者</button>
              <button type="button" data-action="permission" data-value="editor" aria-pressed="${editor}">编辑者</button>
            </div>
          </div>
          <div class="mobile-card">
            <h3>UcButtonContainer</h3>
            <div class="permission-grid">
              <button class="mobile-button" type="button" data-action="confirm-submit" ${editor && !state.actionLoading ? "" : "disabled"}>${state.actionLoading ? "提交中…" : "提交"}</button>
              <button class="mobile-button mobile-button--outline" type="button" data-action="custom-action">自定义操作</button>
              <button class="mobile-button mobile-button--danger" type="button" ${editor ? "" : "disabled"}>删除</button>
              <button class="mobile-button mobile-button--outline" type="button" disabled>接口处理中</button>
            </div>
            <p class="helper-text" style="margin-top: 10px">权限按钮匹配 RelateOpCode；自定义按钮不匹配操作权限。</p>
          </div>
          <div class="mobile-card">
            <div class="card-title-row"><strong>任务进度</strong><span>${state.actionProgress}%</span></div>
            <div class="progress-track" style="margin-top: 12px"><span style="width: ${state.actionProgress}%"></span></div>
            <div class="action-row" style="margin-top: 12px"><button class="mobile-button mobile-button--outline" type="button" data-action="progress-minus">−10</button><button class="mobile-button mobile-button--outline" type="button" data-action="progress-plus">+10</button></div>
          </div>
          <div class="mobile-card">
            <h3>反馈是否有帮助？</h3>
            <div class="reaction-row"><button type="button" data-action="reaction" data-value="up" class="${state.reaction === "up" ? "is-active" : ""}">赞同 ${state.reaction === "up" ? "1" : "0"}</button><button type="button" data-action="reaction" data-value="down" class="${state.reaction === "down" ? "is-active" : ""}">不赞同 ${state.reaction === "down" ? "1" : "0"}</button></div>
          </div>
        </div>
        ${state.confirmAction ? '<div class="overlay"><div class="overlay-panel overlay-panel--center"><h3>确认提交</h3><p>提交后任务将进入下一审批节点，操作期间按钮会被禁用。</p><div class="overlay-actions"><button class="mobile-button mobile-button--outline" type="button" data-action="cancel-submit">取消</button><button class="mobile-button" type="button" data-action="do-submit">确认提交</button></div></div></div>' : ""}
      </div>`;
  }

  function renderWorkflowFiles() {
    const steps = [
      ["发起申请", "张工 · 07-30 09:12"],
      ["部门审批", state.workflowStep > 1 ? "李经理 · 已通过" : "李经理 · 审批中"],
      ["归档完成", state.workflowStep > 2 ? "系统 · 已归档" : "等待上一节点"],
    ];
    const fileList = [
      ["PDF", "设备巡检记录.pdf", "2.4 MB"],
      ["JPG", "现场照片.jpg", "1.1 MB"],
      ["DOC", "整改说明.docx", "480 KB"],
    ];
    return `
      <div class="mobile-page">
        ${mobileHeader("流程与附件")}
        <div class="mobile-tabs" role="tablist">
          <button class="mobile-tab" type="button" aria-selected="true">审批流程</button>
          <button class="mobile-tab" type="button" aria-selected="false">附件 <span class="badge">3</span></button>
          <button class="mobile-tab" type="button" aria-selected="false">操作记录</button>
        </div>
        <div class="mobile-scroll">
          <div class="mobile-card">
            <div class="card-title-row"><strong>当前流程</strong><span class="status-tag">审批中</span></div>
            <div class="workflow" style="margin-top: 14px">
              ${steps
                .map(
                  ([title, meta], index) => `<div class="workflow-step ${index < state.workflowStep ? "is-done" : index === state.workflowStep ? "is-active" : ""}"><span class="step-dot">${index < state.workflowStep ? "✓" : index + 1}</span><div><strong>${title}</strong><p class="card-meta">${meta}</p></div></div>`,
                )
                .join("")}
            </div>
            <div class="action-row"><button class="mobile-button" type="button" data-action="workflow-next" ${state.workflowStep >= 2 ? "disabled" : ""}>提交下一步</button><button class="mobile-button mobile-button--outline" type="button" data-action="workflow-undo" ${state.workflowStep <= 1 ? "disabled" : ""}>撤回</button></div>
          </div>
          <div class="mobile-card">
            <div class="card-title-row"><strong>附件</strong><div class="action-row"><button class="mobile-button mobile-button--outline" type="button" data-action="file-view" data-view="${state.fileView === "list" ? "thumb" : "list"}">${state.fileView === "list" ? "缩略图" : "列表"}</button><button class="mobile-button" type="button" data-action="file-source">上传</button></div></div>
            <p class="helper-text">iOS：手册说明不显示 AddCommandRSCode 对应上传按钮</p>
            ${
              state.fileView === "list"
                ? fileList.map(([type, name, size]) => `<button type="button" class="file-row mobile-card--clickable" data-action="preview-file" style="padding: 9px 0; border: 0; border-bottom: 1px solid #edf1f4"><span class="file-icon">${type}</span><span class="file-copy"><strong>${name}</strong><span class="card-meta">${size}</span></span><span>›</span></button>`).join("")
                : `<div class="thumbnail-grid" style="margin-top: 12px"><button class="thumbnail" type="button" data-action="preview-file"><img src="../demo-app-ui/APP/assets/images/template/success.png" alt="巡检通过图片" /></button><button class="thumbnail" type="button" data-action="preview-file"><img src="../demo-app-ui/APP/assets/images/template/flow-green.png" alt="流程图片" /></button><button class="thumbnail" type="button" data-action="preview-file"><img src="../demo-app-ui/APP/assets/images/template/frnotes-red.png" alt="整改提示图片" /></button></div>`
            }
          </div>
        </div>
        ${state.workflowConfirm ? '<div class="overlay"><div class="overlay-panel overlay-panel--center"><h3>提交审批</h3><p>确认将流程推进到下一节点？</p><div class="overlay-actions"><button class="mobile-button mobile-button--outline" type="button" data-action="workflow-cancel">取消</button><button class="mobile-button" type="button" data-action="workflow-confirm">确认</button></div></div></div>' : ""}
        ${state.fileSource ? `<div class="overlay"><div class="overlay-panel overlay-panel--center"><h3>选择文件来源</h3><div class="source-sheet"><button class="source-option" type="button" data-action="source-picked">${icon("camera")}<br>拍照</button><button class="source-option" type="button" data-action="source-picked">${icon("image")}<br>图库</button><button class="source-option" type="button" data-action="source-picked">${icon("video")}<br>视频</button><button class="source-option" type="button" data-action="source-picked">${icon("document")}<br>文档</button></div><div class="overlay-actions"><button class="mobile-button mobile-button--outline" type="button" data-action="file-source">取消</button></div></div></div>` : ""}
        ${state.filePreview ? '<div class="overlay" style="background: rgba(8, 18, 25, .88); place-items: center"><div style="color: #fff; text-align: center"><img src="../demo-app-ui/APP/assets/images/template/success.png" style="width: 210px; max-height: 300px; object-fit: contain" alt="文件预览示意" /><p>图片 / PDF 预览容器</p><button class="mobile-button" type="button" data-action="preview-file">关闭预览</button></div></div>' : ""}
      </div>`;
  }

  function renderVisualization() {
    const slides = [
      ["安全生产月", "隐患上报与闭环治理"],
      ["本周巡检", "完成率 86%，待整改 7 项"],
      ["设备状态", "在线 128 台，离线 4 台"],
    ];
    const bars = [42, 70, 94, 58, 78];
    return `
      <div class="mobile-page">
        ${mobileHeader("数据看板")}
        <div class="mobile-scroll">
          <div class="banner">
            <div class="banner-slide"><span class="helper-text" style="color: rgba(255,255,255,.72)">UcBannerContainer</span><strong>${slides[state.banner][0]}</strong><span>${slides[state.banner][1]}</span></div>
            <div class="banner-dots">${slides.map((_, index) => `<button type="button" data-action="banner" data-index="${index}" class="${state.banner === index ? "is-active" : ""}" aria-label="切换到轮播图 ${index + 1}"></button>`).join("")}</div>
          </div>
          <div class="mobile-card" style="margin-top: 10px">
            <div class="card-title-row"><strong>区域完成率</strong><span class="status-tag">点击柱形钻取</span></div>
            <div class="chart" role="img" aria-label="五个区域完成率柱状图">
              ${bars.map((height, index) => `<button type="button" class="bar ${state.chartActive === index ? "is-active" : ""}" data-action="chart-bar" data-index="${index}" data-label="${["东区", "西区", "南区", "北区", "仓储"][index]}" style="height:${height}%" aria-label="${["东区", "西区", "南区", "北区", "仓储"][index]}完成率 ${height}%"></button>`).join("")}
            </div>
            <p class="helper-text" style="margin-top: 20px">当前选择：${["东区", "西区", "南区", "北区", "仓储"][state.chartActive]}，完成率 ${bars[state.chartActive]}%</p>
          </div>
          <div class="mobile-card">
            <div class="card-title-row"><strong>风险分布</strong><button class="mobile-button mobile-button--outline" type="button" data-action="locate">${state.mapLocated ? "已定位" : "我的位置"}</button></div>
            <div class="map" style="margin-top: 12px">
              <span class="map-pin" style="left: 74px; top: 58px"><span>1</span></span>
              <span class="map-pin" style="left: 174px; top: 94px"><span>2</span></span>
              ${state.mapLocated ? '<span class="map-pin" style="left: 128px; top: 37px; background: #ff5d5d"><span>我</span></span><span class="map-callout">距东区点位 380 m</span>' : '<span class="map-callout">点击“我的位置”显示距离</span>'}
            </div>
          </div>
          <div class="mobile-card">
            <button class="mobile-card--clickable" style="border:0; padding:0" type="button" data-action="template-toggle"><div class="card-title-row"><strong>UcHTMLTemplate</strong><span>${state.templateOpen ? "收起" : "展开"} ›</span></div></button>
            ${state.templateOpen ? '<div style="margin-top: 12px"><div class="skeleton" style="width: 92%"></div><div class="skeleton" style="width: 76%"></div><div class="skeleton" style="width: 61%"></div><p class="helper-text">模板内容由配置指定的自定义组件渲染。</p></div>' : ""}
          </div>
        </div>
      </div>`;
  }

  function renderSourceFilters() {
    sourceFilters.innerHTML = sourceOptions
      .map((value) => `<button class="filter-chip" type="button" data-source-filter="${value}" aria-pressed="${state.sourceFilter === value}">${value}</button>`)
      .join("");
  }

  function renderCatalog() {
    const query = state.catalogQuery.trim().toLowerCase();
    const filtered = payload.components.filter((item) => {
      const matchesSource = state.sourceFilter === "全部" || item.sourceStatus === state.sourceFilter;
      const haystack = `${item.code} ${item.name} ${item.category} ${item.manualStatus} ${item.sourceStatus}`.toLowerCase();
      return matchesSource && (!query || haystack.includes(query));
    });
    catalogResult.textContent = `显示 ${filtered.length} / ${payload.summary.total} 条定义`;
    catalogBody.innerHTML = filtered
      .map(
        (item) => `
          <tr>
            <td class="component-name"><code>${escapeHtml(item.code)}</code><span>${escapeHtml(item.name)}</span></td>
            <td>${escapeHtml(item.category)}</td>
            <td><span class="status-pill ${item.manualStatus === "待补充" ? "status-pill--pending" : ""}">${item.manualStatus}</span></td>
            <td><span class="status-pill ${["直接实现", "别名渲染", "组合渲染"].includes(item.sourceStatus) ? "status-pill--source" : ""}">${item.sourceStatus}</span></td>
            <td>${item.demoLevel}</td>
          </tr>`,
      )
      .join("");
    renderSourceFilters();
  }

  function updateFormValue(target) {
    const key = target.dataset.formField;
    if (!key) return;
    state.formData[key] = target.value;
  }

  function handleClick(event) {
    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      state.activeCategory = categoryButton.dataset.category;
      renderStage();
      return;
    }
    const filterButton = event.target.closest("[data-source-filter]");
    if (filterButton) {
      state.sourceFilter = filterButton.dataset.sourceFilter;
      renderCatalog();
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "back") showToast("返回事件：由页面管理器或自定义 backAction 处理");
    if (action === "toggle-search") state.navSearch = !state.navSearch;
    if (action === "search-submit") showToast("已按标题、编号和申请人执行查找");
    if (action === "nav-tab") state.navTab = Number(target.dataset.index);
    if (action === "bottom-nav") {
      state.bottomNav = Number(target.dataset.index);
      showToast(`底部导航切换到：${["首页", "任务", "我的"][state.bottomNav]}`);
    }
    if (action === "list-mode") state.listMode = target.dataset.mode;
    if (action === "list-search") state.listQuery = document.getElementById("listSearch")?.value || "";
    if (action === "open-card") state.selectedCard = target.dataset.id;
    if (action === "close-card") state.selectedCard = null;
    if (action === "card-detail") {
      showToast("已传递 KeyValue 并进入详情容器");
      state.selectedCard = null;
    }
    if (action === "toggle-tree") state.treeOpen = !state.treeOpen;
    if (action === "tree-select") showToast("树节点已选中，可联动右侧详情或筛选列表");
    if (action === "form-mode") state.formMode = target.dataset.mode;
    if (action === "toggle-switch") state.formData.enabled = !state.formData.enabled;
    if (action === "stepper-minus") state.formData.count = Math.max(0, state.formData.count - 1);
    if (action === "stepper-plus") state.formData.count += 1;
    if (action === "toggle-secret") state.formData.secretVisible = !state.formData.secretVisible;
    if (action === "rate") state.formData.rate = Number(target.dataset.value);
    if (action === "add-row") state.gridRows.push({ item: "新检查项", count: 1 });
    if (action === "remove-row") state.gridRows.splice(Number(target.dataset.index), 1);
    if (action === "form-cancel") state.formMode = "view";
    if (action === "form-save") {
      const nameInput = document.getElementById("fieldName");
      if (nameInput) state.formData.name = nameInput.value;
      if (!state.formData.name.trim()) {
        showToast("请填写任务名称");
      } else {
        state.formMode = "view";
        showToast("表单与多行明细已通过静态夹具保存");
      }
    }
    if (action === "permission") state.permission = target.dataset.value;
    if (action === "confirm-submit") state.confirmAction = true;
    if (action === "cancel-submit") state.confirmAction = false;
    if (action === "do-submit") {
      state.confirmAction = false;
      state.actionLoading = true;
      renderStage();
      setTimeout(() => {
        state.actionLoading = false;
        state.actionProgress = Math.min(100, state.actionProgress + 12);
        renderStage();
        showToast("提交完成；重复点击在处理期间已禁用");
      }, 650);
      return;
    }
    if (action === "custom-action") showToast("自定义按钮仅按页面模式控制，不匹配操作权限");
    if (action === "progress-minus") state.actionProgress = Math.max(0, state.actionProgress - 10);
    if (action === "progress-plus") state.actionProgress = Math.min(100, state.actionProgress + 10);
    if (action === "reaction") state.reaction = state.reaction === target.dataset.value ? "" : target.dataset.value;
    if (action === "workflow-next") state.workflowConfirm = true;
    if (action === "workflow-cancel") state.workflowConfirm = false;
    if (action === "workflow-confirm") {
      state.workflowConfirm = false;
      state.workflowStep = Math.min(2, state.workflowStep + 1);
      showToast("流程已推进到下一节点");
    }
    if (action === "workflow-undo") {
      state.workflowStep = Math.max(1, state.workflowStep - 1);
      showToast("已撤回到上一节点");
    }
    if (action === "file-view") state.fileView = target.dataset.view;
    if (action === "file-source") state.fileSource = !state.fileSource;
    if (action === "source-picked") {
      state.fileSource = false;
      showToast("已选择文件来源；真实上传需原生桥接和服务端");
    }
    if (action === "preview-file") state.filePreview = !state.filePreview;
    if (action === "banner") state.banner = Number(target.dataset.index);
    if (action === "chart-bar") {
      state.chartActive = Number(target.dataset.index);
      showToast("图表点击事件已返回当前数据项");
    }
    if (action === "locate") {
      state.mapLocated = !state.mapLocated;
      if (state.mapLocated) showToast("位置为静态夹具；真实定位需终端权限");
    }
    if (action === "template-toggle") state.templateOpen = !state.templateOpen;
    renderStage();
  }

  function handleInput(event) {
    if (event.target.id === "catalogSearch") {
      state.catalogQuery = event.target.value;
      renderCatalog();
      return;
    }
    updateFormValue(event.target);
    const gridField = event.target.dataset.gridField;
    if (gridField) state.gridRows[Number(event.target.dataset.index)][gridField] = event.target.value;
  }

  function initializeMetrics() {
    document.getElementById("metricTotal").textContent = payload.summary.total;
    document.getElementById("metricUc").textContent = payload.summary.ucCodes;
    document.getElementById("metricContent").textContent = payload.summary.contentControls;
    document.getElementById("metricDemo").textContent = payload.summary.demoLevel["重点交互演示"] || 0;
  }

  document.getElementById("themeToggle").addEventListener("click", () => {
    const enabled = document.documentElement.classList.toggle("topic-green");
    document.getElementById("themeToggle").setAttribute("aria-pressed", String(enabled));
    document.getElementById("themeLabel").textContent = enabled ? "切换蓝色主题" : "切换绿色主题";
  });
  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleInput);

  const queryParams = new URLSearchParams(window.location.search);
  const queryCategory = queryParams.get("category");
  if (categories.some((item) => item.id === queryCategory)) state.activeCategory = queryCategory;
  if (queryParams.get("capture") === "1") {
    document.body.classList.add("capture-mode");
    if (state.activeCategory === "form") state.formMode = "edit";
  }
  initializeMetrics();
  renderStage();
  renderCatalog();
})();
