const iconPaths = {
  home: '<path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path><path d="M9 21v-7h6v7"></path>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect>',
  search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path>',
  filter: '<path d="M4 5h16M7 12h10M10 19h4"></path>',
  file: '<path d="M6 2h8l4 4v16H6z"></path><path d="M14 2v5h5"></path><path d="M9 13h6M9 17h6"></path>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"></path><path d="M9 3v15M15 6v15"></path>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4M16 3v4M3 10h18"></path>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"></path><path d="M4 15v5h16v-5"></path>',
  paperclip: '<path d="m8 12 6.5-6.5a3 3 0 0 1 4.2 4.2L10 18.4a5 5 0 0 1-7-7l8.3-8.3"></path>',
  folder: '<path d="M3 6h7l2 2h9v11H3z"></path><path d="M3 10h18"></path>',
  shield: '<path d="M12 3 20 6v5c0 5-3 8-8 10-5-2-8-5-8-10V6z"></path><path d="m8 12 3 3 5-6"></path>',
  empty: '<path d="M5 7h14l2 5-3 7H6l-3-7z"></path><path d="M8 12h8"></path>',
  more: '<circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle>',
  back: '<path d="m15 18-6-6 6-6"></path>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path>',
  user: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21c1-5 4-7 8-7s7 2 8 7"></path>',
  copy: '<rect x="8" y="8" width="11" height="12" rx="2"></rect><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"></path>',
  locate: '<circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>',
  check: '<path d="m5 12 4 4L19 6"></path>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>',
  wifi: '<path d="M3 9a14 14 0 0 1 18 0M6 13a9 9 0 0 1 12 0M9 17a4 4 0 0 1 6 0"></path><circle cx="12" cy="20" r="1"></circle>',
  success: '<circle cx="12" cy="12" r="9"></circle><path d="m7 12 3 3 7-7"></path>',
  close: '<path d="m6 6 12 12M18 6 6 18"></path>',
  pen: '<path d="m4 16 10-10 4 4L8 20l-4 1z"></path><path d="m13 7 4 4"></path><path d="M4 21h5"></path>',
  chevron: '<path d="m9 18 6-6-6-6"></path>'
};

const icon = (name, className = '') => `<span class="${className}" aria-hidden="true"><svg viewBox="0 0 24 24">${iconPaths[name] || iconPaths.grid}</svg></span>`;

// 文件类型图标随当前案例目录一起交付，避免部署时依赖 FAQ 工作区中的其他项目。
const fileIconRoot = 'assets/file-icons';
const fileTypeIcons = Object.freeze({
  pdf: 'pdf.png', txt: 'txt.png', doc: 'doc.png', docx: 'docx.png',
  xls: 'excel.png', xlsx: 'excel.png', ppt: 'ppt.png', pptx: 'ppt.png',
  png: 'images.png', jpg: 'images.png', jpeg: 'images.png', gif: 'images.png', webp: 'images.png',
  mp3: 'audio.png', wav: 'audio.png', m4a: 'audio.png', mp4: 'video.png', mov: 'video.png', avi: 'video.png',
  zip: 'zip.png', rar: 'zip.png', '7z': 'zip.png'
});

function fileTypeIcon(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  return `${fileIconRoot}/${fileTypeIcons[extension] || 'other.png'}`;
}

const fixtures = Object.freeze({
  member: '示例成员',
  maskedPhone: '138****0000',
  project: '示例项目 A',
  projectAlt: '示例项目 B',
  record: 'DEMO-001',
  area: '区域一',
  location: '示例园区 · A 区',
  date: '2026-08-06',
  list: [
    { id: 1, name: '示例项目 A', code: 'DEMO-001', type: '计划', status: '进行中', update: '今天 09:30', desc: '用于展示列表摘要和当前处理状态。' },
    { id: 2, name: '示例项目 B', code: 'DEMO-002', type: '任务', status: '待处理', update: '昨天 16:20', desc: '用于展示待处理状态与信息层级。' },
    { id: 3, name: '示例项目 C', code: 'DEMO-003', type: '计划', status: '已完成', update: '07-28', desc: '用于展示已完成项目的视觉表达。' },
    { id: 4, name: '示例项目 D', code: 'DEMO-004', type: '任务', status: '进行中', update: '07-26', desc: '用于展示较长描述内容的截断方式。' },
    { id: 5, name: '通用操作规则', code: 'DEMO-RULE-001', type: '规则说明', status: '已完成', cardLabel: '规则说明', target: 'guidance', update: '07-25', desc: '点击查看规则属性、重点提示和分区措施。' }
  ],
  tree: [
    { id: 'project', label: '项目资料', children: [{ id: 'project-plan', label: '方案文档' }, { id: 'project-record', label: '项目记录' }] },
    { id: 'field', label: '现场记录', children: [{ id: 'field-photo', label: '现场照片' }, { id: 'field-check', label: '检查记录' }] },
    { id: 'acceptance', label: '验收材料', children: [{ id: 'acceptance-report', label: '验收报告' }, { id: 'acceptance-attachment', label: '补充附件' }] },
    { id: 'other', label: '其他资料' }
  ],
  files: [
    { name: '示例说明.pdf', meta: 'PDF · 2.4 MB', status: 'success' },
    { name: '演示图片.png', meta: 'PNG · 1.2 MB', status: 'success' },
    { name: '补充说明.txt', meta: 'TXT · 18 KB', status: 'success' }
  ],
  people: [
    { id: 'member-a', name: '示例成员甲', code: 'MEM-001', organization: '示例单位一' },
    { id: 'member-b', name: '示例成员乙', code: 'MEM-002', organization: '示例单位二' },
    { id: 'member-c', name: '示例成员丙', code: 'MEM-003', organization: '示例单位一' },
    { id: 'member-d', name: '示例成员丁', code: 'MEM-004', organization: '示例单位三' }
  ]
});

const patterns = [
  { id: 'navigation', index: '01', title: '导航与入口', subtitle: '分组门户', icon: 'grid', summary: '成员信息、演示横幅与分组入口构成移动端门户导航。', scenario: '功能模块较多，需要按知识、项目、现场等业务主题组织入口的移动首页。', components: ['UcContainer', 'UcMenuContainer', 'UcCardContainer', 'UcButton'], points: ['顶部集中展示当前成员和账户操作。', '横幅只表达通用引导信息，不承载正式品牌内容。', '入口按业务主题分组，每行保持四个并提供点击反馈。'], states: ['默认门户', '账户菜单', '按压反馈', '入口跳转'], guide: '点击分组入口查看操作反馈，或打开右上角账户菜单' },
  { id: 'dashboard', index: '02', title: '数据看板', subtitle: '指标与趋势', icon: 'chart', summary: '核心指标、结构占比和趋势图支持快速判断。', scenario: '运营概览、项目进度与服务监控等快速识别变化的场景。', components: ['UcChartContainer', 'UcCardContainer', 'UcTabGroup', 'UcLabel'], points: ['首屏指标不超过 4 个并标明口径。', '颜色不能成为唯一信息编码。', '图表选中后显示准确值和维度。'], states: ['时间切换', '维度切换', '图表选中', '异常指标'], guide: '切换时间和统计维度，点击柱形查看准确值' },
  { id: 'filter', index: '03', title: '查找条件', subtitle: '表单查询', icon: 'filter', summary: '输入、下拉选择和日期范围组成完整的移动端查找表单。', scenario: '项目、单据和其他业务对象需要组合多个字段进行精确查找的页面。', components: ['UcFormDetailView', 'UcSelect', 'UcDatePicker', 'UcButtonContainer'], points: ['字段采用左侧标签、右侧值的统一行式布局。', '开始和结束日期作为普通查找条件并使用同一日历层。', '底部始终提供清空与查找操作。'], states: ['默认条件', '条件填写', '日期选择', '清空与查找'], guide: '填写条件、选择开始与结束日期，然后执行查找或清空' },
  { id: 'list', index: '04', title: '检索列表', subtitle: '状态与摘要', icon: 'search', summary: '状态 Tab、结果统计和摘要卡片帮助快速定位对象。', scenario: '项目、任务、单据等先按状态浏览，再按需进入查找条件页的工作流。', components: ['UcPageListContainer', 'UcTabGroup', 'UcCardContainer', 'UcLabel'], points: ['默认列表不展示查找条件，右上角保留查找入口。', '状态 Tab 使用文字、数量和底部指示线表达当前项。', '卡片首行突出名称和状态，点击后进入详情。'], states: ['全部列表', '处理中', '已完成', '卡片反馈'], guide: '切换状态 Tab、点击列表卡片，或使用右上角查找入口' },
  { id: 'detail', index: '05', title: '信息详情', subtitle: '业务处理型', icon: 'file', summary: '业务处理型详情通过键值信息、脱敏字段和固定操作支持后续办理。', scenario: '项目、任务和其他业务对象的查看、复制与后续处理页面。', components: ['UcFormDetailView', 'UcLabel', 'UcButtonContainer', 'UcCopy', 'UcFormTree', 'UcSignature', 'UcPeoplePicker'], points: ['首屏呈现状态和关键识别信息。', '敏感字段默认使用掩码。', '树形分类、签名和人员选择均在确认后回填。'], states: ['默认详情', 'FormTree展开', '签名确认', '单选/多选回填'], guide: '复制编号、打开资料分类树、签名或选择人员' },
  { id: 'guidance', index: '06', title: '规则与风险说明', subtitle: '规则阅读型', icon: 'shield', summary: '规则阅读型详情通过等级标签、重点提示和分区长文支持完整阅读。', scenario: '操作规范、风险提示、检查要点与其他需要完整阅读的结构化详情。', components: ['UcFormDetailView', 'UcCardContainer', 'UcLabel', 'UcTag', 'UcFormTree', 'UcSignature', 'UcPeoplePicker'], points: ['沿用信息详情页的标题栏与内容层级。', '基础属性使用键值信息展示，重点规则置于正文之前。', '规则阅读页也提供签名与单选/多选人员示例。'], states: ['默认详情', '等级标签', '签名确认', '人员选择回填'], guide: '浏览规则属性、资料分类、签名和人员选择等分区内容' },
  { id: 'map', index: '07', title: '地图与点位', subtitle: '空间分布', icon: 'map', summary: '虚构地图、图例与点位详情层表达空间信息。', scenario: '设备、门店、项目或任务的区域分布与就近查看。', components: ['UcMapContainer', 'UcLabel', 'UcPopup', 'UcButton'], points: ['演示地图不得连接真实瓦片或定位服务。', '点位颜色与文字图例同时编码。', '详情采用可关闭的底部层。'], states: ['图例切换', '点位选中', '模拟定位', '详情层'], guide: '切换图例、选择点位或使用模拟定位按钮' },
  { id: 'upload', index: '08', title: '文件上传', subtitle: '过程反馈', icon: 'upload', summary: '来源选择、上传过程和附件结果覆盖文件交互。', scenario: '业务附件、证明材料、图片和文档的移动端补充场景。', components: ['UcFileUpload', 'UcFileContainer', 'UcPopup', 'UcProgress'], points: ['上传前明确格式和大小限制。', '上传中必须显示进度和文件名。', '已有附件支持列表与缩略图两种展示方式。'], states: ['暂无文件', '来源选择', '上传中', '附件展示'], guide: '清空文件、打开来源层并切换附件展示方式' }
];

const state = {
  active: 'navigation', navActive: '首页', menuOpen: false, detailGroupOpen: true,
  dashboardRange: '本周', dashboardDimension: '类型', dashboardBar: 3,
  filterValues: { projectAccount: '', subprojectAccount: '', projectType: '', projectName: '', discipline: '', startDate: '', endDate: '', documentNo: '', status: '待处理' }, filterCalendarTarget: null, filterSelectTarget: null, filterSelectDraft: '', filterMultiDraft: new Set(),
  listFilter: '全部', detailRecordId: null, detailFromList: false, guidanceFromList: false,
  detailExtra: false, detailTreeOpen: false, detailTreeQuery: '', detailTreeExpanded: ['project'], detailTreeSelected: [], detailTreeConfirmed: [],
  signatureSheet: null, signatureTarget: null, signatureDrawing: false, signatureHasInk: false,
  signatureStatus: { construction: 'unsigned', undertaking: 'unsigned', operation: 'unsigned' },
  peoplePickerOpen: false, peoplePickerMode: 'single', peoplePickerQuery: '', peoplePickerSelected: [],
  peoplePickerConfirmed: { single: [], multiple: [] },
  mapLayer: '全部', mapPin: null, mapLocated: false,
  calendarMonth: 8, calendarSelected: 6,
  uploadSheet: null, uploadType: '文件通知', uploadMode: 'files', uploadProgress: 0, uploadView: 'list', uploadColumns: 2
};

const elements = {
  nav: document.querySelector('#patternNav'), gallery: document.querySelector('#patternGallery'), screen: document.querySelector('#deviceScreen'),
  index: document.querySelector('#patternIndex'), title: document.querySelector('#patternTitle'), summary: document.querySelector('#patternSummary'),
  scenario: document.querySelector('#patternScenario'), points: document.querySelector('#patternPoints'),
  states: document.querySelector('#patternStates'), guide: document.querySelector('#stateGuide'), toast: document.querySelector('#pageToast')
};

const statusBar = () => '<div class="phone-statusbar"><span>09:41</span><span class="status-symbols">▮▮▮ ))) ▰</span></div>';
const demoFlag = () => '<span class="demo-flag">演示数据</span>';
const topBar = (title, right = '') => `${statusBar()}<header class="phone-topbar"><button class="phone-icon" type="button" data-action="phone-back" aria-label="返回">${icon('back')}</button><span class="phone-topbar__title">${title}</span>${right || '<span></span>'}</header>`;
const badgeClass = (value) => value === '已完成' ? 'is-success' : value === '待处理' ? 'is-warning' : '';

function renderNavigation() {
  const groups = [
    { title: '知识中心', entries: [['知识检索','search'],['借阅管理','user'],['借阅明细','file'],['知识库列表','grid'],['我的收藏','shield']] },
    { title: '项目管理', entries: [['项目信息','folder'],['子项目信息','file']] },
    { title: '现场管理', entries: [['地图点位','map'],['日期计划','calendar'],['现场记录','chart'],['附件资料','upload']] }
  ];
  const entries = group => group.entries.map(([label,glyph]) => `<button class="portal-entry" type="button" data-action="nav-app" data-value="${label}"><span>${icon(glyph)}</span><strong>${label}</strong></button>`).join('');
  return `<div class="phone-page is-scrollable navigation-page">${statusBar()}<header class="portal-profile"><span class="portal-avatar">${icon('user')}</span><span><strong>${fixtures.member}</strong><small>通用演示平台</small></span><button class="portal-power" type="button" data-action="nav-menu" aria-label="打开账户操作" aria-expanded="${state.menuOpen}"><i></i></button></header><section class="portal-banner"><div><strong>笃志前行&nbsp;&nbsp;虽远必达</strong><span>打造高效工作流 <b>›</b></span></div><span class="portal-orbit" aria-hidden="true"><i></i><b></b></span>${demoFlag()}</section><main class="navigation-body">${groups.map(group => `<section class="portal-group"><h3>${group.title}</h3><div class="portal-grid">${entries(group)}</div></section>`).join('')}</main>${state.menuOpen ? `<div class="account-popover"><button type="button" data-action="nav-menu-item" data-value="切换账号">切换账号</button><button type="button" data-action="nav-menu-item" data-value="退出演示">退出演示</button><button type="button" data-action="nav-menu">关闭</button></div>` : ''}</div>`;
}

function renderDashboard() {
  const sets = { '本周': [36,52,44,72,61,83,66], '本月': [48,64,57,79,69,91,76] };
  const values = sets[state.dashboardRange];
  const labels = ['一','二','三','四','五','六','日'];
  return `<div class="phone-page is-scrollable">${topBar('数据看板', `<button class="phone-icon" type="button" data-action="dashboard-info" aria-label="看板说明">${icon('more')}</button>`)}<main class="phone-body dashboard-body"><div class="demo-row">${demoFlag()}<span>更新时间 09:30</span></div><section class="metric-grid">${[['154','本期新增'],['82%','完成率'],['12','待处理'],['3','异常项']].map(([value,label],i) => `<article class="metric-card ${i === 3 ? 'is-alert' : ''}"><strong>${value}</strong><span>${label}</span></article>`).join('')}</section><section class="phone-card"><div class="card-head"><strong>结构占比</strong><div class="segmented">${['类型','区域'].map(v => `<button class="${state.dashboardDimension === v ? 'is-active' : ''}" type="button" data-action="dashboard-dimension" data-value="${v}">${v}</button>`).join('')}</div></div><div class="donut-layout"><div class="donut"><span><strong>154</strong><small>总量</small></span></div><div class="legend-list"><span><i></i>计划 <b>48%</b></span><span><i></i>任务 <b>32%</b></span><span><i></i>其他 <b>20%</b></span></div></div></section><section class="phone-card"><div class="card-head"><strong>趋势变化</strong><div class="segmented">${Object.keys(sets).map(v => `<button class="${state.dashboardRange === v ? 'is-active' : ''}" type="button" data-action="dashboard-range" data-value="${v}">${v}</button>`).join('')}</div></div><p class="chart-caption">当前选中：周${labels[state.dashboardBar]} · ${values[state.dashboardBar]} 项</p><div class="bar-chart">${values.map((v,i) => `<button class="bar-item ${state.dashboardBar === i ? 'is-selected' : ''}" type="button" data-action="dashboard-bar" data-value="${i}" aria-label="周${labels[i]} ${v}项"><span class="bar-value">${v}</span><span class="bar" style="--h:${v}%"></span><span>${labels[i]}</span></button>`).join('')}</div></section></main></div>`;
}

function renderFilter() {
  const values = state.filterValues;
  const selectFields = {
    projectType: { label: '项目类型', placeholder: '请选择项目类型', options: ['计划项目','任务项目','其他类型'] },
    discipline: { label: '专业', placeholder: '请选择专业', multiple: true, options: ['类别一','类别二','类别三','类别四','类别五'] },
    status: { label: '单据状态', placeholder: '请选择单据状态', options: ['待处理','进行中','已完成'] }
  };
  const inputRow = (label,field,placeholder) => `<label class="search-condition-row"><strong>${label}</strong><input type="text" value="${escapeHtml(values[field])}" placeholder="${placeholder}" data-action="filter-input" data-field="${field}" /></label>`;
  const selectRow = (field) => { const item = selectFields[field]; return `<button class="search-condition-row condition-picker" type="button" data-action="filter-select-open" data-field="${field}" aria-haspopup="dialog"><strong>${item.label}</strong><span class="${values[field] ? '' : 'is-placeholder'}">${values[field] || item.placeholder}</span><i aria-hidden="true"></i></button>`; };
  const dateRow = (label,field,placeholder) => `<button class="search-condition-row condition-date" type="button" data-action="filter-date-open" data-field="${field}"><strong>${label}</strong><span class="${values[field] ? '' : 'is-placeholder'}">${values[field] || placeholder}</span>${icon('calendar')}</button>`;
  const activeSelect = state.filterSelectTarget ? selectFields[state.filterSelectTarget] : null;
  return `<div class="phone-page has-action-bar filter-page">${topBar('查找')}<main class="filter-form"><div class="filter-demo-row">${demoFlag()}<span>通用演示查找条件</span></div>${inputRow('项目账号','projectAccount','请输入项目账号')}${inputRow('子项目账号','subprojectAccount','请输入子项目账号')}${selectRow('projectType')}${inputRow('项目名称','projectName','请输入项目名称')}${selectRow('discipline')}${dateRow('操作时间','startDate','请选择开始日期')}${dateRow('到','endDate','请选择结束日期')}${inputRow('单据编号','documentNo','请输入演示单号')}${selectRow('status')}</main><div class="phone-action-bar filter-action-bar"><button class="phone-button" type="button" data-action="filter-clear">清空</button><button class="phone-button is-primary" type="button" data-action="filter-apply">查找</button></div>${state.filterCalendarTarget ? `<div class="phone-backdrop"><section class="calendar-sheet filter-calendar-sheet" role="dialog" aria-modal="true" aria-label="选择${state.filterCalendarTarget === 'startDate' ? '开始' : '结束'}日期"><div class="sheet-title"><strong>选择${state.filterCalendarTarget === 'startDate' ? '开始' : '结束'}日期</strong><button type="button" data-action="filter-date-cancel" aria-label="关闭">${icon('close')}</button></div><div class="month-switch"><button type="button" data-action="calendar-month" data-value="-1" aria-label="上个月">‹</button><strong>2026 年 ${state.calendarMonth} 月</strong><button type="button" data-action="calendar-month" data-value="1" aria-label="下个月">›</button></div><div class="weekday">${['日','一','二','三','四','五','六'].map(v => `<span>${v}</span>`).join('')}</div><div class="calendar-grid">${calendarDays()}</div><div class="sheet-actions"><button class="phone-button" type="button" data-action="filter-date-cancel">取消</button><button class="phone-button is-primary" type="button" data-action="filter-date-confirm">确认</button></div></section></div>` : ''}${activeSelect ? activeSelect.multiple ? `<div class="phone-backdrop"><section class="filter-multi-sheet" role="dialog" aria-modal="true" aria-label="多选${activeSelect.label}"><header><strong>请选择</strong><button type="button" data-action="filter-multi-all" aria-pressed="${state.filterMultiDraft.size === activeSelect.options.length}">全部勾选</button></header><div class="filter-multi-options" role="group" aria-label="${activeSelect.label}">${activeSelect.options.map(option => `<button type="button" data-action="filter-multi-option" data-value="${option}" aria-pressed="${state.filterMultiDraft.has(option)}"><span>${option}</span><i>${state.filterMultiDraft.has(option) ? '✓' : ''}</i></button>`).join('')}</div><footer><button class="phone-button" type="button" data-action="filter-select-cancel">取消</button><button class="phone-button is-primary" type="button" data-action="filter-multi-confirm">确认</button></footer></section></div>` : `<div class="phone-backdrop"><section class="filter-picker-sheet" role="dialog" aria-modal="true" aria-label="选择${activeSelect.label}"><header><button type="button" data-action="filter-select-cancel">取消</button><strong>${activeSelect.label}</strong><button type="button" data-action="filter-select-confirm">确认</button></header><div class="filter-picker-options" role="listbox" aria-label="${activeSelect.label}">${activeSelect.options.map(option => `<button class="${state.filterSelectDraft === option ? 'is-selected' : ''}" type="button" role="option" aria-selected="${state.filterSelectDraft === option}" data-action="filter-select-option" data-value="${option}">${option}</button>`).join('')}</div></section></div>` : ''}</div>`;
}

function filteredRows() {
  return fixtures.list.filter(row => state.listFilter === '全部' || (state.listFilter === '处理中' ? ['进行中','待处理'].includes(row.status) : row.status === state.listFilter));
}
function renderList() {
  const rows = filteredRows();
  const tabs = [
    { label: '全部', count: fixtures.list.length },
    { label: '处理中', count: fixtures.list.filter(row => ['进行中','待处理'].includes(row.status)).length },
    { label: '已完成', count: fixtures.list.filter(row => row.status === '已完成').length }
  ];
  return `<div class="phone-page is-scrollable list-page">${topBar('检索列表', `<button class="phone-icon" type="button" data-action="list-more" aria-label="打开查找条件">${icon('search')}</button>`)}<nav class="list-status-tabs" aria-label="列表状态">${tabs.map(tab => `<button class="${state.listFilter === tab.label ? 'is-active' : ''}" type="button" data-action="list-filter" data-value="${tab.label}" aria-current="${state.listFilter === tab.label ? 'page' : 'false'}"><span>${tab.label}</span><b>(${tab.count})</b></button>`).join('')}</nav><main class="phone-body list-body"><div class="demo-row">${demoFlag()}<span>通用业务对象</span></div><div class="result-line"><span>共 ${rows.length} 条</span></div>${rows.length ? `<div class="list-stack">${rows.map(row => `<button class="list-card" type="button" data-action="list-open" data-id="${row.id}" aria-label="查看${row.name}详情"><span class="list-avatar ${row.target === 'guidance' ? 'is-rule' : ''}">${row.target === 'guidance' ? icon('shield') : row.name.slice(-1)}</span><span class="list-copy"><span class="status-badge ${row.target === 'guidance' ? 'is-rule' : badgeClass(row.status)}">${row.cardLabel || row.status}</span><strong>${row.name}</strong><small>${row.code} · ${row.update}</small><p>${row.desc}</p></span>${icon('chevron','row-chevron')}</button>`).join('')}</div>` : `<div class="empty-state">${icon('empty','state-icon')}<strong>当前状态暂无内容</strong><p>可以切换其他状态，或使用右上角查找入口。</p><button class="phone-button is-primary" type="button" data-action="list-clear">查看全部</button></div>`}</main></div>`;
}

function treeDescendants(node) {
  return [node, ...(node.children || []).flatMap(treeDescendants)];
}
function treeNodeById(id) {
  return fixtures.tree.flatMap(treeDescendants).find(node => node.id === id);
}
function treeSelectedState(node) {
  const ids = treeDescendants(node).map(item => item.id);
  const selected = ids.filter(id => state.detailTreeSelected.includes(id)).length;
  return selected === ids.length ? 'is-selected' : selected ? 'is-indeterminate' : '';
}
function treeFilteredNodes() {
  const query = state.detailTreeQuery.trim().toLowerCase();
  if (!query) return fixtures.tree;
  return fixtures.tree.map(node => {
    const children = (node.children || []).filter(child => child.label.toLowerCase().includes(query));
    return node.label.toLowerCase().includes(query) || children.length ? {...node, children} : null;
  }).filter(Boolean);
}
function renderTreeNodes(nodes, level = 0) {
  return nodes.map(node => {
    const hasChildren = Boolean(node.children?.length);
    const expanded = state.detailTreeExpanded.includes(node.id) || Boolean(state.detailTreeQuery.trim());
    const selectedState = treeSelectedState(node);
    return `<div class="form-tree-node ${selectedState}" data-level="${level}"><div class="form-tree-node-row"><button class="form-tree-expand ${hasChildren ? (expanded ? 'is-expanded' : '') : 'is-leaf'}" type="button" data-action="detail-tree-toggle" data-value="${node.id}" aria-label="${hasChildren ? (expanded ? '收起' : '展开') : '叶节点'}">${hasChildren ? '<span class="form-tree-expand-icon" aria-hidden="true"></span>' : ''}</button><button class="form-tree-check ${selectedState}" type="button" data-action="detail-tree-select" data-value="${node.id}" aria-pressed="${selectedState === 'is-selected'}"><i>${selectedState === 'is-selected' ? '✓' : selectedState === 'is-indeterminate' ? '−' : ''}</i><span>${node.label}</span></button></div>${hasChildren && expanded ? `<div class="form-tree-children">${renderTreeNodes(node.children, level + 1)}</div>` : ''}</div>`;
  }).join('');
}
function renderFormTree() {
  if (!state.detailTreeOpen) return '';
  const nodes = treeFilteredNodes();
  return `<div class="form-tree-overlay"><section class="form-tree-sheet" role="dialog" aria-modal="true" aria-label="资料分类"><header class="form-tree-topbar"><button class="phone-icon" type="button" data-action="detail-tree-close" aria-label="返回">${icon('back')}</button><strong>资料分类</strong><span></span></header><div class="form-tree-search"><input type="search" value="${escapeHtml(state.detailTreeQuery)}" data-action="detail-tree-search" placeholder="请输入分类" aria-label="搜索资料分类"><button type="button" data-action="detail-tree-search-submit">搜索</button></div><main class="form-tree-body">${nodes.length ? renderTreeNodes(nodes) : '<div class="form-tree-empty">暂无匹配分类</div>'}</main><footer class="form-tree-footer"><button class="phone-button" type="button" data-action="detail-tree-clear">清空</button><button class="phone-button is-primary" type="button" data-action="detail-tree-confirm">确定</button></footer></section></div>`;
}
function renderDetailTreeField() {
  const labels = state.detailTreeConfirmed.map(treeNodeById).filter(Boolean).map(node => node.label);
  const value = labels.length ? labels.join('、') : '请选择资料分类';
  return `<section class="phone-card detail-tree-field"><div class="card-head"><strong>资料分类</strong></div><button class="detail-tree-value" type="button" data-action="detail-tree-open" aria-label="选择资料分类"><span class="${labels.length ? '' : 'is-placeholder'}">${value}</span>${icon('chevron')}</button><small>支持层级展开、搜索、多选、清空和确认回填</small></section>`;
}

const signatureTargets = [
  ['construction', '签名方一'],
  ['undertaking', '签名方二'],
  ['operation', '签名方三']
];
function selectedPeople(mode) {
  return state.peoplePickerConfirmed[mode].map(id => fixtures.people.find(person => person.id === id)).filter(Boolean);
}
function renderSignatureSection() {
  return `<section class="phone-card signature-section"><div class="card-head"><strong>签字</strong></div>${signatureTargets.map(([id,label]) => `<div class="signature-row"><span>${label}${id === 'operation' ? '<em class="signature-required">*</em>' : ''}</span><span class="signature-result"><span class="signature-action-wrap"><button class="signature-action" type="button" data-action="signature-open" data-value="${id}" aria-label="${label}签名">${icon('pen')}</button><small>按钮可自定义</small></span><span class="signature-status ${state.signatureStatus[id] === 'signed' ? 'is-signed' : ''}">${state.signatureStatus[id] === 'signed' ? '<i>✓</i>已签字' : '未签字'}</span></span></div>`).join('')}</section>`;
}
function renderPeoplePickerFields() {
  const single = selectedPeople('single'); const multiple = selectedPeople('multiple');
  const text = people => people.length ? people.map(person => person.name).join('、') : '请选择人员';
  return `<section class="phone-card people-picker-section"><div class="card-head"><strong>人员选择</strong></div><button class="people-picker-field" type="button" data-action="people-picker-open" data-value="single"><span>单选人员</span><strong class="${single.length ? '' : 'is-placeholder'}">${text(single)}</strong>${icon('chevron')}</button><button class="people-picker-field" type="button" data-action="people-picker-open" data-value="multiple"><span>多选人员</span><strong class="${multiple.length ? '' : 'is-placeholder'}">${text(multiple)}</strong>${icon('chevron')}</button><small>单选和多选共用同一套人员搜索、确认与回填交互</small></section>`;
}
function renderSignatureOverlay() {
  if (!state.signatureSheet) return '';
  const label = signatureTargets.find(item => item[0] === state.signatureTarget)?.[1] || '单位';
  if (state.signatureSheet === 'action') return `<div class="phone-backdrop signature-overlay"><section class="signature-sheet signature-action-sheet" role="dialog" aria-modal="true" aria-label="${label}签名操作"><header class="sheet-title"><strong>${label}签名</strong><button type="button" data-action="signature-close" aria-label="关闭">${icon('close')}</button></header><button class="signature-sheet-option" type="button" data-action="signature-start">签名</button><button class="signature-sheet-option is-cancel" type="button" data-action="signature-close">取消</button></section></div>`;
  return `<div class="phone-backdrop signature-overlay"><section class="signature-sheet signature-canvas-sheet" role="dialog" aria-modal="true" aria-label="${label}签名"><header class="signature-sheet__header"><button class="phone-icon" type="button" data-action="signature-close" aria-label="返回">${icon('back')}</button><strong>${label}签名</strong><span></span></header><div class="signature-canvas-wrap"><p>请在下方区域完成手写签名</p><canvas class="signature-canvas" width="700" height="420" aria-label="手写签名区域"></canvas></div><footer class="signature-footer"><button class="phone-button" type="button" data-action="signature-cancel">取消</button><button class="phone-button" type="button" data-action="signature-clear">清除</button><button class="phone-button is-primary" type="button" data-action="signature-confirm">确定</button></footer></section></div>`;
}
function filteredPeople() {
  const query = state.peoplePickerQuery.trim().toLowerCase();
  return fixtures.people.filter(person => !query || [person.name, person.code, person.organization].some(value => value.toLowerCase().includes(query)));
}
function renderPeoplePicker() {
  if (!state.peoplePickerOpen) return '';
  const mode = state.peoplePickerMode; const selected = state.peoplePickerSelected; const people = filteredPeople();
  const all = people.length > 0 && people.every(person => selected.includes(person.id)); const partial = selected.length > 0 && !all;
  return `<div class="people-picker-overlay"><section class="people-picker-sheet" role="dialog" aria-modal="true" aria-label="${mode === 'single' ? '单选人员' : '多选人员'}"><header class="people-picker-topbar"><button class="phone-icon" type="button" data-action="people-picker-close" aria-label="返回">${icon('back')}</button><strong>${mode === 'single' ? '单选人员' : '多选人员'}</strong><span></span></header><div class="people-picker-search"><input type="search" value="${escapeHtml(state.peoplePickerQuery)}" data-action="people-picker-search" placeholder="请输入姓名/单位" aria-label="搜索人员"><button type="button" data-action="people-picker-search-submit">查找</button></div><div class="people-picker-selected"><div><strong>已选 ${selected.length} 人</strong>${mode === 'multiple' ? `<button type="button" class="people-picker-all ${all ? 'is-active' : ''}" data-action="people-picker-all">${all ? '取消全选' : partial ? '部分选中' : '全选'}</button>` : ''}</div><div class="people-picker-tags">${selected.map(id => { const p = fixtures.people.find(item => item.id === id); return p ? `<button type="button" data-action="people-picker-remove" data-value="${p.id}">${p.name} ×</button>` : ''; }).join('')}</div></div><main class="people-picker-list">${people.length ? people.map(person => { const checked = selected.includes(person.id); return `<button class="people-picker-card ${checked ? 'is-selected' : ''}" type="button" data-action="people-picker-select" data-value="${person.id}"><span class="people-picker-control ${mode === 'multiple' ? 'is-multiple' : ''} ${checked ? 'is-checked' : ''}">${checked ? '✓' : ''}</span><span><strong>${person.name}</strong><small>${person.code} · ${person.organization}</small></span>${icon('chevron')}</button>`; }).join('') : '<div class="people-picker-empty">暂无匹配人员</div>'}</main><footer class="people-picker-footer"><button class="phone-button is-primary" type="button" data-action="people-picker-confirm">确认</button></footer></section></div>`;
}
function setupSignatureCanvas() {
  const canvas = document.querySelector('.signature-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d'); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#172331';
  const point = event => { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; };
  canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); const p = point(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); state.signatureDrawing = true; state.signatureHasInk = true; });
  canvas.addEventListener('pointermove', event => { if (!state.signatureDrawing) return; const p = point(event); ctx.lineTo(p.x, p.y); ctx.stroke(); });
  ['pointerup','pointercancel','pointerleave'].forEach(type => canvas.addEventListener(type, () => { state.signatureDrawing = false; }));
}

function renderDetail() {
  const selected = fixtures.list.find(row => row.id === state.detailRecordId);
  const record = selected || { name: fixtures.project, code: fixtures.record, type: '示例类型', status: '进行中', update: '今天 09:30', desc: '用于展示通用业务详情的信息层级与交互反馈。' };
  const rows = [['记录编号',record.code,true],['对象名称',record.name],['当前状态',record.status],['对象类别',record.type],['更新时间',record.update],['负责人',fixtures.member],['联系方式',fixtures.maskedPhone],['所属区域',fixtures.area],['示例位置',fixtures.location]];
  return `<div class="phone-page has-action-bar detail-page">${topBar('信息详情', `<button class="phone-icon" type="button" data-action="detail-more" aria-label="更多操作">${icon('more')}</button>`)}<main class="phone-body detail-body"><div class="demo-row">${demoFlag()}${state.detailFromList ? '<span>由检索列表进入</span>' : ''}</div><section class="phone-card detail-summary"><div class="tag-row"><span class="filter-tag is-selected">${record.type}</span><span class="filter-tag">${record.status}</span></div><h3>${record.name}</h3><p>${record.desc}</p></section><section class="phone-card info-table">${rows.map(([label,value,copy]) => `<div class="info-row"><span>${label}</span><strong>${value}</strong>${copy ? `<button class="copy-button" type="button" data-action="detail-copy" data-value="${value}" aria-label="复制记录编号">${icon('copy')}</button>` : ''}</div>`).join('')}</section>${renderDetailTreeField()}${renderSignatureSection()}${renderPeoplePickerFields()}<section class="phone-card"><button class="collapse-head" type="button" data-action="detail-extra" aria-expanded="${state.detailExtra}"><strong>补充信息</strong><span>${state.detailExtra ? '收起' : '展开'} ›</span></button>${state.detailExtra ? '<div class="long-copy"><p>这里用于承载背景说明、处理要求和相关备注等较长内容。</p><p>重要信息按段落组织，避免连续键值列表降低阅读效率。</p></div>' : ''}</section></main><div class="phone-action-bar"><button class="phone-button" type="button" data-action="detail-secondary">次要操作</button><button class="phone-button is-primary" type="button" data-action="detail-primary">开始处理</button></div>${renderFormTree()}${renderSignatureOverlay()}${renderPeoplePicker()}</div>`;
}

function renderMap() {
  const pins = [
    {id:1,label:'点位 A',code:'DEMO-POINT-A',x:27,y:34,type:'正常',area:'区域一',location:'示例园区 · A 区',category:'服务点',update:'今天 09:30',summary:'当前点位运行正常，可查看基础信息和演示记录。'},
    {id:2,label:'点位 B',code:'DEMO-POINT-B',x:63,y:28,type:'关注',area:'区域一',location:'示例园区 · B 区',category:'监测点',update:'今天 08:45',summary:'当前点位存在演示关注项，建议查看补充说明。'},
    {id:3,label:'点位 C',code:'DEMO-POINT-C',x:47,y:66,type:'正常',area:'区域二',location:'示例园区 · C 区',category:'服务点',update:'昨天 17:20',summary:'当前点位信息完整，最近一次演示检查结果正常。'},
    {id:4,label:'点位 D',code:'DEMO-POINT-D',x:76,y:73,type:'关注',area:'区域二',location:'示例园区 · D 区',category:'监测点',update:'昨天 15:10',summary:'当前点位需要关注，详情中仅展示虚构演示数据。'}
  ];
  const shown = pins.filter(pin => state.mapLayer === '全部' || pin.type === state.mapLayer);
  const selected = pins.find(pin => pin.id === state.mapPin);
  return `<div class="phone-page map-page">${topBar('地图与点位', `<button class="phone-icon" type="button" data-action="map-search" aria-label="搜索点位">${icon('search')}</button>`)}<div class="map-legend">${['全部','正常','关注'].map(v => `<button class="${state.mapLayer === v ? 'is-active' : ''}" type="button" data-action="map-layer" data-value="${v}"><i></i>${v}</button>`).join('')} ${demoFlag()}</div><div class="fake-map" role="img" aria-label="纯 CSS 虚构地图示意"><svg viewBox="0 0 390 700" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 120C80 60 120 180 230 90S360 80 420 20M-10 310C90 250 120 370 230 280S350 300 420 230M-20 520C90 430 150 590 250 480S360 480 420 410"/><path d="M60 -20C90 130 25 220 120 350S100 560 160 720M260 -20C220 130 310 230 250 360S310 570 280 720"/></svg><span class="map-zone zone-a">区域一</span><span class="map-zone zone-b">区域二</span>${shown.map(pin => `<button class="map-pin ${pin.type === '关注' ? 'is-warning' : ''} ${state.mapPin === pin.id ? 'is-selected' : ''}" style="--x:${pin.x}%;--y:${pin.y}%" type="button" data-action="map-pin" data-id="${pin.id}" aria-label="${pin.label} ${pin.type}"><i></i><span>${pin.label}</span></button>`).join('')}<button class="locate-button ${state.mapLocated ? 'is-active' : ''}" type="button" data-action="map-locate" aria-label="模拟定位">${icon('locate')}</button>${state.mapLocated ? '<span class="location-pulse" aria-label="模拟当前位置"></span>' : ''}</div>${selected ? `<section class="phone-card map-detail-sheet"><button class="sheet-close" type="button" data-action="map-close" aria-label="关闭详情">${icon('close')}</button><div class="map-detail-heading"><span class="status-badge ${selected.type === '关注' ? 'is-warning' : 'is-success'}">${selected.type}</span><h3>${selected.label}</h3><p>${selected.summary}</p></div><div class="map-detail-data"><div><span>点位编号</span><strong>${selected.code}</strong></div><div><span>所属区域</span><strong>${selected.area}</strong></div><div><span>点位类型</span><strong>${selected.category}</strong></div><div><span>更新时间</span><strong>${selected.update}</strong></div><div><span>示例位置</span><strong>${selected.location}</strong></div></div><div class="sheet-actions"><button class="phone-button" type="button" data-action="map-close">稍后查看</button><button class="phone-button is-primary" type="button" data-action="map-detail">查看详情</button></div></section>` : ''}</div>`;
}

function calendarDays() {
  const total = state.calendarMonth === 8 ? 31 : 30;
  const offset = state.calendarMonth === 8 ? 6 : 2;
  return `${'<span></span>'.repeat(offset)}${Array.from({length:total},(_,i) => `<button class="${state.calendarSelected === i + 1 ? 'is-selected' : ''}" type="button" data-action="calendar-day" data-value="${i+1}">${i+1}</button>`).join('')}`;
}
function renderUpload() {
  const currentFiles = state.uploadMode === 'empty' ? [] : fixtures.files;
  const extra = state.uploadMode === 'uploading' ? {name:'新增材料.docx',meta:`上传中 · ${state.uploadProgress}%`,status:'uploading'} : null;
  const files = extra ? [...currentFiles,extra] : currentFiles;
  const imageCount = files.filter(file => /\.(png|jpg|jpeg)$/i.test(file.name)).length;
  const documentCount = files.length - imageCount;
  const filePreview = file => `<span class="attachment-thumb"><img src="${fileTypeIcon(file.name)}" alt="" /></span>`;
  const fileAction = '<button class="attachment-remove" type="button" data-action="upload-remove" aria-label="移除演示附件">×</button>';
  const listView = files.map(file => `<article class="attachment-item">${filePreview(file)}<span class="attachment-copy"><strong>${file.name}</strong><small>${file.meta}</small>${file.status === 'uploading' ? `<i class="progress"><b style="width:${state.uploadProgress}%"></b></i>` : ''}</span>${fileAction}</article>`).join('');
  const cardView = files.map(file => `<article class="attachment-card">${filePreview(file)}<span class="attachment-card-copy"><strong>${file.name}</strong><small>${file.meta}</small>${file.status === 'uploading' ? `<i class="progress"><b style="width:${state.uploadProgress}%"></b></i>` : ''}</span>${fileAction}</article>`).join('');
  return `<div class="phone-page is-scrollable">${topBar('附件上传')}<main class="upload-form">
    <div class="upload-context"><div>${demoFlag()}<strong>${fixtures.project}</strong></div><span>仅模拟前端状态</span></div>
    <section class="upload-section"><h3 class="mobile-section-title">补充说明</h3><div class="upload-note">请按附件类型上传演示材料，单文件不超过 20 MB。</div></section>
    <section class="upload-section upload-section--attachments"><div class="mobile-section-head"><h3 class="mobile-section-title">附件列表</h3><span>共 <b>${files.length}</b> 条</span></div>
      <div class="attachment-types">
        <button class="attachment-type is-required" type="button" data-action="upload-open" aria-label="上传资料附件"><span class="attachment-folder">${icon('folder')}</span><i>${documentCount}</i><strong><em>*</em> 资料附件</strong></button>
        <button class="attachment-type" type="button" data-action="upload-open" aria-label="上传图片附件"><span class="attachment-folder">${icon('folder')}</span><i>${imageCount}</i><strong>图片附件</strong></button>
      </div>
      <button class="upload-link-row" type="button" data-action="upload-open">${icon('paperclip')}<strong>上传附件</strong><span>共 <b>${files.length}</b> 条</span></button>
      <div class="attachment-view-bar"><strong>附件信息</strong><div role="group" aria-label="附件展示方式"><button class="${state.uploadView === 'list' ? 'is-active' : ''}" type="button" data-action="upload-view" data-value="list" aria-pressed="${state.uploadView === 'list'}">${icon('file')}列表</button><button class="${state.uploadView === 'card' ? 'is-active' : ''}" type="button" data-action="upload-view" data-value="card" aria-pressed="${state.uploadView === 'card'}">${icon('grid')}缩略图</button></div></div>
      ${state.uploadView === 'card' ? `<div class="attachment-column-config"><span>每行展示数量</span><div role="group" aria-label="缩略图每行展示数量">${[2,3].map(columns => `<button class="${state.uploadColumns === columns ? 'is-active' : ''}" type="button" data-action="upload-columns" data-value="${columns}" aria-pressed="${state.uploadColumns === columns}">${columns} 个</button>`).join('')}</div></div>` : ''}
      <div class="upload-state-demo"><span>状态演示</span><button type="button" data-action="upload-clear">空态</button></div>
      ${files.length ? `<div class="${state.uploadView === 'card' ? 'attachment-grid' : 'attachment-list'}"${state.uploadView === 'card' ? ` style="--attachment-columns:${state.uploadColumns}"` : ''}>${state.uploadView === 'card' ? cardView : listView}</div>` : `<div class="upload-empty">${icon('empty','state-icon')}<strong>暂无附件</strong><span>点击“上传附件”选择演示文件</span></div>`}
    </section>
  </main>
  ${state.uploadSheet === 'type' ? `<div class="phone-backdrop"><section class="file-type-sheet" role="dialog" aria-modal="true" aria-label="选择文件类型"><div class="file-type-row"><label for="uploadTypeSelect">文件类型：</label><span class="sheet-select"><select id="uploadTypeSelect" data-action="upload-type" aria-label="文件类型"><option ${state.uploadType === '文件通知' ? 'selected' : ''}>文件通知</option><option ${state.uploadType === '图片资料' ? 'selected' : ''}>图片资料</option><option ${state.uploadType === '音视频资料' ? 'selected' : ''}>音视频资料</option></select></span></div><button class="phone-button is-primary type-upload-button" type="button" data-action="upload-next">上传文件</button></section></div>` : ''}
  ${state.uploadSheet === 'source' ? `<div class="phone-backdrop"><section class="upload-action-sheet" role="dialog" aria-modal="true" aria-label="选择上传方式"><button type="button" data-action="upload-source" data-value="拍照">拍照</button><button type="button" data-action="upload-source" data-value="从图库选择">从图库选择</button><button type="button" data-action="upload-source" data-value="录音">录音</button><button type="button" data-action="upload-source" data-value="选录音">选录音</button><button type="button" data-action="upload-source" data-value="拍视频">拍视频</button><button type="button" data-action="upload-source" data-value="从图库选择视频">从图库选择视频</button><button class="action-sheet-cancel" type="button" data-action="upload-back-type">取消</button></section></div>` : ''}</div>`;
}

function renderGuidance() {
  const sections = [
    {title:'操作前检查',body:'确认当前对象、处理范围和相关前置条件；存在信息缺失时先补充材料。',items:['核对对象名称与演示编号。','确认所需信息和附件完整。']},
    {title:'过程控制',body:'按照既定步骤执行，关键节点保留反馈；出现异常时停止当前操作并选择明确的后续处理。',items:['明确操作目标和期望结果。','保留必要的过程反馈。']},
    {title:'完成后确认',body:'核对处理结果、记录状态和必要附件，确保后续参与者能够理解当前进度。',items:['检查结果与状态是否一致。','补充必要说明后再结束流程。']}
  ];
  const rows = [['详情类型','规则与风险说明'],['规则编号','DEMO-RULE-001'],['环境','演示环境'],['类别','常规操作'],['等级','重要'],['适用区域','区域一'],['当前状态','有效']];
  return `<div class="phone-page is-scrollable guidance-detail-page">${topBar('信息详情')}<main class="phone-body guidance-body"><div class="demo-row">${demoFlag()}<span>${state.guidanceFromList ? '由检索列表进入' : '详情页样式'}</span></div><section class="phone-card detail-summary guidance-summary"><div class="tag-row"><span class="filter-tag is-selected">规则说明</span><span class="level-badge">重要等级</span></div><h3>通用操作规则</h3><p>用于展示操作前、执行中和完成后的通用规则及风险控制要求。</p></section><section class="phone-card info-table guidance-info">${rows.map(([label,value]) => `<div class="info-row"><span>${label}</span><strong>${value}</strong></div>`).join('')}</section>${renderDetailTreeField()}${renderSignatureSection()}${renderPeoplePickerFields()}<div class="warning-callout"><strong>重点提示</strong><p>执行前应确认对象与范围；发生异常时优先保护当前数据和操作上下文。</p></div><div class="guidance-detail-sections">${sections.map((section,i) => `<section class="phone-card guidance-detail-section"><header><i>${i+1}</i><h3>${section.title}</h3></header><p>${section.body}</p><ul>${section.items.map(item => `<li>${item}</li>`).join('')}</ul></section>`).join('')}</div></main>${renderFormTree()}${renderSignatureOverlay()}${renderPeoplePicker()}</div>`;
}

const renderers = { navigation: renderNavigation, dashboard: renderDashboard, filter: renderFilter, list: renderList, detail: renderDetail, map: renderMap, upload: renderUpload, guidance: renderGuidance };

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function showToast(message) { elements.toast.textContent = message; elements.toast.classList.add('is-visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => elements.toast.classList.remove('is-visible'), 1800); }
function patternButton(pattern, child = false) {
  return `<button class="pattern-button ${child ? 'pattern-button--child' : ''} ${state.active === pattern.id ? 'is-active' : ''}" type="button" data-pattern="${pattern.id}" aria-pressed="${state.active === pattern.id}"><span class="pattern-button__icon">${icon(pattern.icon)}</span><span><strong>${pattern.title}</strong><small>${pattern.subtitle}</small></span><b>›</b></button>`;
}
function renderNav() {
  const detailIds = new Set(['detail','guidance']);
  const detailPatterns = patterns.filter(pattern => detailIds.has(pattern.id));
  const detailGroup = `<div class="pattern-group ${detailIds.has(state.active) ? 'has-active' : ''}"><button class="pattern-group__toggle" type="button" data-action="detail-group-toggle" aria-expanded="${state.detailGroupOpen}" aria-controls="detailPatternGroup"><span>${icon('file')}</span><span><strong>详情页类型</strong><small>两种详情风格</small></span><b aria-hidden="true">⌄</b></button><div class="pattern-group__children" id="detailPatternGroup" ${state.detailGroupOpen ? '' : 'hidden'}>${detailPatterns.map(pattern => patternButton(pattern,true)).join('')}</div></div>`;
  elements.nav.innerHTML = patterns.map(pattern => pattern.id === 'detail' ? detailGroup : detailIds.has(pattern.id) ? '' : patternButton(pattern)).join('');
}
function renderGallery() { elements.gallery.innerHTML = patterns.map(pattern => `<button class="gallery-card ${state.active === pattern.id ? 'is-active' : ''}" type="button" data-pattern="${pattern.id}"><span class="gallery-preview gallery-preview--${pattern.id}"><i></i><i></i><i></i></span><span><small>${pattern.index}</small><strong>${pattern.title}</strong><em>${pattern.subtitle}</em></span><b>›</b></button>`).join(''); }
function renderPattern() {
  const pattern = patterns.find(item => item.id === state.active) || patterns[0];
  elements.index.textContent = pattern.index; elements.title.textContent = pattern.title; elements.summary.textContent = pattern.summary;
  elements.scenario.textContent = pattern.scenario;
  elements.points.innerHTML = pattern.points.map(value => `<li>${value}</li>`).join(''); elements.states.innerHTML = pattern.states.map(value => `<span>${value}</span>`).join('');
  elements.guide.innerHTML = `<span class="status-dot"></span>${pattern.guide}`; elements.screen.innerHTML = renderers[pattern.id](); renderNav(); renderGallery();
}
function restorePeoplePickerPosition() {
  requestAnimationFrame(() => {
    const target = elements.screen.querySelector('.people-picker-section');
    const scroller = target?.closest('.phone-page.is-scrollable');
    if (target && scroller) scroller.scrollTop = Math.max(0, target.offsetTop - 120);
  });
}
function setPattern(id, scroll = false) { state.active = patterns.some(item => item.id === id) ? id : 'navigation'; if (['detail','guidance'].includes(state.active)) state.detailGroupOpen = true; renderPattern(); const url = new URL(window.location.href); url.searchParams.set('pattern', state.active); window.history.replaceState({}, '', url); if (scroll) document.querySelector('#previewStage').scrollIntoView({behavior:'smooth',block:'start'}); }

document.addEventListener('click', event => {
  const patternButton = event.target.closest('[data-pattern]'); if (patternButton) { if (patternButton.dataset.pattern === 'detail') { state.detailRecordId = null; state.detailFromList = false; state.detailExtra = false; } if (patternButton.dataset.pattern === 'guidance') state.guidanceFromList = false; setPattern(patternButton.dataset.pattern, patternButton.classList.contains('gallery-card')); return; }
  const button = event.target.closest('[data-action]'); if (!button) return;
  const action = button.dataset.action; const value = button.dataset.value;
  if (action === 'phone-back' && state.active === 'detail' && state.detailFromList) { state.detailRecordId = null; state.detailFromList = false; state.detailExtra = false; setPattern('list'); }
  else if (action === 'phone-back' && state.active === 'guidance' && state.guidanceFromList) { state.guidanceFromList = false; setPattern('list'); }
  else if (action === 'phone-back') showToast('返回操作仅作样式演示');
  else if (action === 'detail-group-toggle') { state.detailGroupOpen = !state.detailGroupOpen; renderNav(); }
  else if (action === 'nav-menu') { state.menuOpen = !state.menuOpen; renderPattern(); }
  else if (action === 'nav-menu-item') { state.menuOpen = false; renderPattern(); showToast(`${value}：仅作交互演示`); }
  else if (action === 'nav-app') showToast(`${value}：入口点击反馈`);
  else if (action === 'nav-bottom') { state.navActive = value; renderPattern(); }
  else if (action === 'dashboard-range') { state.dashboardRange = value; renderPattern(); }
  else if (action === 'dashboard-dimension') { state.dashboardDimension = value; renderPattern(); }
  else if (action === 'dashboard-bar') { state.dashboardBar = Number(value); renderPattern(); }
  else if (action === 'dashboard-info') showToast('口径：仅使用虚构演示数据');
  else if (action === 'filter-clear') { state.filterValues = { projectAccount: '', subprojectAccount: '', projectType: '', projectName: '', discipline: '', startDate: '', endDate: '', documentNo: '', status: '' }; renderPattern(); showToast('查找条件已清空'); }
  else if (action === 'filter-apply') { const count = Object.values(state.filterValues).filter(Boolean).length; showToast(`已按 ${count} 项演示条件查找`); }
  else if (action === 'filter-select-open') { const field = button.dataset.field; state.filterSelectTarget = field; state.filterSelectDraft = state.filterValues[field] || ''; state.filterMultiDraft = new Set(state.filterValues[field] ? state.filterValues[field].split('、') : []); renderPattern(); }
  else if (action === 'filter-select-option') { state.filterSelectDraft = value; renderPattern(); }
  else if (action === 'filter-select-cancel') { state.filterSelectTarget = null; state.filterSelectDraft = ''; state.filterMultiDraft.clear(); renderPattern(); }
  else if (action === 'filter-select-confirm') { const field = state.filterSelectTarget; if (field) state.filterValues[field] = state.filterSelectDraft; state.filterSelectTarget = null; state.filterSelectDraft = ''; renderPattern(); showToast('选择条件已回填'); }
  else if (action === 'filter-multi-option') { state.filterMultiDraft.has(value) ? state.filterMultiDraft.delete(value) : state.filterMultiDraft.add(value); renderPattern(); }
  else if (action === 'filter-multi-all') { const options = ['类别一','类别二','类别三','类别四','类别五']; state.filterMultiDraft.size === options.length ? state.filterMultiDraft.clear() : state.filterMultiDraft = new Set(options); renderPattern(); }
  else if (action === 'filter-multi-confirm') { const field = state.filterSelectTarget; if (field) state.filterValues[field] = [...state.filterMultiDraft].join('、'); state.filterSelectTarget = null; state.filterMultiDraft.clear(); renderPattern(); showToast('多选条件已回填'); }
  else if (action === 'filter-date-open') { state.filterCalendarTarget = button.dataset.field; renderPattern(); }
  else if (action === 'filter-date-cancel') { state.filterCalendarTarget = null; renderPattern(); }
  else if (action === 'filter-date-confirm') { const field = state.filterCalendarTarget; if (field) state.filterValues[field] = `2026-${String(state.calendarMonth).padStart(2,'0')}-${String(state.calendarSelected).padStart(2,'0')}`; state.filterCalendarTarget = null; renderPattern(); showToast('日期条件已回填'); }
  else if (action === 'list-filter') { state.listFilter = value; renderPattern(); }
  else if (action === 'list-open') { const row = fixtures.list.find(item => item.id === Number(button.dataset.id)); if (row?.target === 'guidance') { state.guidanceFromList = true; setPattern('guidance'); } else { state.detailRecordId = row?.id || null; state.detailFromList = true; state.detailExtra = false; setPattern('detail'); } }
  else if (action === 'list-clear') { state.listFilter = '全部'; renderPattern(); }
  else if (action === 'list-more') setPattern('filter');
  else if (action === 'detail-copy') showToast(`已复制演示编号 ${value}`);
  else if (action === 'detail-extra') { state.detailExtra = !state.detailExtra; renderPattern(); }
  else if (action === 'detail-tree-open') { state.detailTreeOpen = true; state.detailTreeQuery = ''; state.detailTreeSelected = [...state.detailTreeConfirmed]; renderPattern(); }
  else if (action === 'detail-tree-close') { state.detailTreeOpen = false; state.detailTreeQuery = ''; state.detailTreeSelected = []; renderPattern(); }
  else if (action === 'detail-tree-search-submit') { renderPattern(); }
  else if (action === 'detail-tree-toggle') { state.detailTreeExpanded = state.detailTreeExpanded.includes(value) ? state.detailTreeExpanded.filter(id => id !== value) : [...state.detailTreeExpanded, value]; renderPattern(); }
  else if (action === 'detail-tree-select') { const node = treeNodeById(value); const ids = treeDescendants(node).map(item => item.id); const allSelected = ids.every(id => state.detailTreeSelected.includes(id)); state.detailTreeSelected = allSelected ? state.detailTreeSelected.filter(id => !ids.includes(id)) : [...new Set([...state.detailTreeSelected, ...ids])]; renderPattern(); }
  else if (action === 'detail-tree-clear') { state.detailTreeSelected = []; renderPattern(); }
  else if (action === 'detail-tree-confirm') { state.detailTreeConfirmed = [...state.detailTreeSelected]; state.detailTreeOpen = false; state.detailTreeQuery = ''; renderPattern(); showToast(`已选择 ${state.detailTreeConfirmed.length} 个资料分类`); }
  else if (action === 'signature-open') { state.signatureTarget = value; state.signatureSheet = 'action'; state.signatureHasInk = false; renderPattern(); }
  else if (action === 'signature-start') { state.signatureSheet = 'canvas'; state.signatureHasInk = false; renderPattern(); requestAnimationFrame(setupSignatureCanvas); }
  else if (action === 'signature-close' || action === 'signature-cancel') { state.signatureSheet = null; state.signatureDrawing = false; state.signatureHasInk = false; renderPattern(); }
  else if (action === 'signature-clear') { state.signatureHasInk = false; const canvas = document.querySelector('.signature-canvas'); if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); }
  else if (action === 'signature-confirm') { if (!state.signatureHasInk) { showToast('请先完成签名'); return; } state.signatureStatus[state.signatureTarget] = 'signed'; const label = signatureTargets.find(item => item[0] === state.signatureTarget)?.[1] || '单位'; state.signatureSheet = null; state.signatureHasInk = false; renderPattern(); showToast(`${label}已完成签名`); }
  else if (action === 'people-picker-open') { state.peoplePickerMode = value; state.peoplePickerOpen = true; state.peoplePickerQuery = ''; state.peoplePickerSelected = [...state.peoplePickerConfirmed[value]]; renderPattern(); }
  else if (action === 'people-picker-close') { state.peoplePickerOpen = false; state.peoplePickerQuery = ''; state.peoplePickerSelected = []; renderPattern(); restorePeoplePickerPosition(); }
  else if (action === 'people-picker-search-submit') { renderPattern(); }
  else if (action === 'people-picker-select') { if (state.peoplePickerMode === 'single') state.peoplePickerSelected = [value]; else state.peoplePickerSelected = state.peoplePickerSelected.includes(value) ? state.peoplePickerSelected.filter(id => id !== value) : [...state.peoplePickerSelected, value]; renderPattern(); }
  else if (action === 'people-picker-remove') { state.peoplePickerSelected = state.peoplePickerSelected.filter(id => id !== value); renderPattern(); }
  else if (action === 'people-picker-all') { const ids = filteredPeople().map(person => person.id); const all = ids.length > 0 && ids.every(id => state.peoplePickerSelected.includes(id)); state.peoplePickerSelected = all ? state.peoplePickerSelected.filter(id => !ids.includes(id)) : [...new Set([...state.peoplePickerSelected, ...ids])]; renderPattern(); }
  else if (action === 'people-picker-confirm') { const mode = state.peoplePickerMode; state.peoplePickerConfirmed[mode] = [...state.peoplePickerSelected]; state.peoplePickerOpen = false; state.peoplePickerQuery = ''; const count = state.peoplePickerSelected.length; state.peoplePickerSelected = []; renderPattern(); restorePeoplePickerPosition(); showToast(`已选择 ${count} 名${mode === 'single' ? '责任' : '协同'}人员`); }
  else if (action.startsWith('detail-')) showToast('操作已记录为演示反馈');
  else if (action === 'map-layer') { state.mapLayer = value; state.mapPin = null; renderPattern(); }
  else if (action === 'map-pin') { state.mapPin = Number(button.dataset.id); renderPattern(); }
  else if (action === 'map-close') { state.mapPin = null; renderPattern(); }
  else if (action === 'map-locate') { state.mapLocated = !state.mapLocated; renderPattern(); }
  else if (action === 'map-detail') showToast('点位详情仅作交互演示');
  else if (action === 'map-search') showToast('搜索入口仅作样式演示');
  else if (action === 'calendar-month') { state.calendarMonth = Math.min(9,Math.max(7,state.calendarMonth + Number(value))); state.calendarSelected = 1; renderPattern(); }
  else if (action === 'calendar-day') { state.calendarSelected = Number(value); renderPattern(); }
  else if (action === 'upload-open') { state.uploadSheet = 'type'; renderPattern(); }
  else if (action === 'upload-close') { state.uploadSheet = null; renderPattern(); }
  else if (action === 'upload-next') { state.uploadSheet = 'source'; renderPattern(); }
  else if (action === 'upload-back-type') { state.uploadSheet = 'type'; renderPattern(); }
  else if (action === 'upload-source') { state.uploadSheet = null; state.uploadMode = 'uploading'; state.uploadProgress = 68; renderPattern(); showToast(`${value}：进入模拟上传`); }
  else if (action === 'upload-view') { state.uploadView = value; renderPattern(); }
  else if (action === 'upload-columns') { state.uploadColumns = Number(value); renderPattern(); }
  else if (action === 'upload-clear') { state.uploadMode = 'empty'; renderPattern(); }
  else if (action === 'upload-remove') { state.uploadMode = 'empty'; renderPattern(); showToast('已移除演示附件'); }
});

document.addEventListener('input', event => {
  const action = event.target.dataset.action;
  if (action === 'filter-input') state.filterValues[event.target.dataset.field] = event.target.value;
  if (action === 'detail-tree-search') state.detailTreeQuery = event.target.value;
  if (action === 'people-picker-search') state.peoplePickerQuery = event.target.value;
});

document.addEventListener('change', event => {
  if (event.target.dataset.action === 'upload-type') state.uploadType = event.target.value;
});

const params = new URLSearchParams(window.location.search);
if (params.get('capture') === '1') document.body.classList.add('capture-mode');
state.active = patterns.some(item => item.id === params.get('pattern')) ? params.get('pattern') : 'navigation';
renderPattern();

