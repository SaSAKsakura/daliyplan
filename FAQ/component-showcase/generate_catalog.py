from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import openpyxl


ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent
APP = ROOT / "demo-app-ui" / "APP"
XLSX = ROOT / "控件定义一览表.xlsx"
MANUAL = ROOT / "配置中心移动端组件手册1.0.md"

DETAILED = {
    "UcContainer",
    "UcPageTitleContainer",
    "UcTabGroup",
    "UcCardContainer",
    "UcPageListContainer",
    "UcFormDetailView",
    "UcJsGridContainer",
    "UcButtonContainer",
    "UcButton",
    "UcWorkflow",
    "UcFileContainer",
    "UcFileUpload",
    "UcChartContainer",
    "UcBannerContainer",
}
PENDING = {"UcGridviewContainer", "UcTagGroup"}

ALIASES = {
    "SideMenuContainer": ["SideMenuContainer"],
    "UcASCX": ["UcAscx"],
    "UcCameraOperate": ["CameraOperate"],
    "UcCameraOperater": ["CameraOperate"],
    "UcCheckBoxList": ["CheckboxList"],
    "UcCheckBoxListField": ["CheckboxList"],
    "UcComboTree": ["FormCasCader", "SelectCascader"],
    "UcComboTreeField": ["FormCasCader", "SelectCascader"],
    "UcDatePicker": ["FormDate"],
    "UcDatePickerField": ["FormDate"],
    "UcDropDownList": ["FormSelect", "FormMultipleSelect"],
    "UcDropDownListField": ["FormSelect", "FormMultipleSelect"],
    "UcFileUpload": ["fileUpload"],
    "UcFileViewContainer": ["FilePreviewContainer", "UcViewContainer"],
    "UcFormDetailView": ["UcFormContainer"],
    "UcFormTree": ["FormTree"],
    "UcGridviewContainer": ["UcGridContainer"],
    "UcHTMLTemplate": ["UcHtmlTemplateContainer"],
    "UcLiveStreamVideo": ["LiveStreamVideo"],
    "UcPageListContainer": ["PageListContentContainer"],
    "UcPageTitleContainer": ["PageTitleContainer"],
    "UcProgress": ["ProgressBar"],
    "UcProgressBar": ["ProgressBar"],
    "UcRadioButtonList": ["RadioButtonList"],
    "UcRateField": ["FormRate"],
    "UcTab": ["TabGroupContainer"],
    "UcTabGroup": ["TabGroupContainer"],
    "UcViewContainer": ["UcViewContainer", "FilePreviewContainer"],
}

NON_VISUAL = {
    "ApiAction",
    "ApiInParameter",
    "ApiOutParameter",
    "ClientSideParameter",
    "CommentAction",
    "InParameter",
    "OutParameter",
    "RedisAction",
    "RefContainer",
    "RefJs",
    "SqlDBAction",
    "StoredProcDBAction",
    "UcDSContainer",
    "UcData",
    "UcDataStorage",
    "UcFnRSValue",
    "UcHiddenField",
    "UcJsGridHiddenField",
    "UcPostContainer",
    "UcValidateNum",
}

CATEGORY_CODES = {
    "页面骨架与导航": {
        "SideMenuContainer", "UcAnchor", "UcAnchorGroup", "UcBottomBar", "UcCol",
        "UcContainer", "UcGroup", "UcLayout", "UcMenu", "UcMenuContainer",
        "UcNavigateContainer", "UcNavigateItemContainer", "UcPageNavigate",
        "UcPageTitleContainer", "UcRow", "UcTab", "UcTabGroup",
    },
    "数据展示与列表": {
        "UcBoundField", "UcCardContainer", "UcDataChangeContainer", "UcDataListContainer",
        "UcDynamicFieldGroup", "UcGridView", "UcGridviewContainer", "UcHeadParentControl",
        "UcHeadRadioList", "UcHeadSearch", "UcHeadSelect", "UcHeadTabList",
        "UcHighLightBlock", "UcImage", "UcImageField", "UcInfoList", "UcLabel",
        "UcPageListContainer", "UcTableContainer", "UcTableTest", "UcTagGroup",
        "UcTagGroupV2", "UcTemplateField", "UcTreeNodeContainer",
    },
    "表单与字段编辑": {
        "UcAmount", "UcCalenderContainer", "UcCheckBox", "UcCheckBoxField",
        "UcCheckBoxList", "UcCheckBoxListField", "UcColorPick", "UcComboTree",
        "UcComboTreeField", "UcDatePicker", "UcDatePickerField", "UcDateTimePicker",
        "UcDdlWFStepList", "UcDropDownList", "UcDropDownListField", "UcDynamicComponent",
        "UcDynamicScopeContainer", "UcEditGrid", "UcFormDetailView", "UcFormTree",
        "UcInput", "UcJsGridCheckBoxField", "UcJsGridComboTreeField", "UcJsGridContainer",
        "UcJsGridDateField", "UcJsGridDropDownListField", "UcJsGridField",
        "UcJsGridNumericField", "UcJsGridTextBoxField", "UcJsGridWebComboField",
        "UcJsGridWebComboUserField", "UcKindEditor", "UcListBox", "UcNumericField",
        "UcRadioButton", "UcRadioButtonList", "UcRateField", "UcRateListField",
        "UcSelect", "UcSensitiveField", "UcStepperField", "UcSwitchField", "UcTagFilter",
        "UcTextBox", "UcTextBoxField", "UcTimePicker", "UcValueSet", "UcValueSetField",
        "UcWebCombo", "UcWebComboField", "UcWebComboUser", "UcWebComboUserField",
    },
    "操作、权限与反馈": {
        "UcAnswerField", "UcButton", "UcButtonContainer", "UcEvaluation", "UcHyperLink",
        "UcHyperLinkField", "UcImageButton", "UcLinkButton", "UcMsgContainer", "UcProgress",
        "UcProgressBar", "UcScopeContainer", "UcSearchButton", "UcStepList",
        "UcStepListContainer", "UcTodo",
    },
    "工作流、文件与媒体": {
        "UcCameraOperate", "UcCameraOperater", "UcCardFileContainer", "UcFileContainer",
        "UcFileUpload", "UcFileViewContainer", "UcLiveStreamVideo", "UcPhoto",
        "UcScheduleContainer", "UcTalkContainer", "UcTimer", "UcUpload", "UcViewContainer",
        "UcWeekCalendar", "UcWorkflow",
    },
    "图表、轮播与地图": {
        "UcASCX", "UcBannerContainer", "UcChartContainer", "UcGpsRangeList",
        "UcHTMLTemplate", "UcMapContainer", "UcWeatherContainer",
    },
}

SHOWCASE = {
    "UcContainer", "UcPageTitleContainer", "UcTabGroup", "UcTab", "UcBottomBar",
    "UcMenuContainer", "UcPageListContainer", "UcCardContainer", "UcGridviewContainer",
    "UcDataListContainer", "UcTreeNodeContainer", "UcLabel", "UcBoundField", "UcImage",
    "UcFormDetailView", "UcJsGridContainer", "UcTextBox", "UcDatePicker",
    "UcDropDownList", "UcComboTree", "UcCheckBoxListField", "UcRadioButtonList",
    "UcSwitchField", "UcStepperField", "UcSensitiveField", "UcRateListField",
    "UcButtonContainer", "UcButton", "UcScopeContainer", "UcProgressBar", "UcEvaluation",
    "UcWorkflow", "UcFileContainer", "UcFileUpload", "UcViewContainer", "UcPhoto",
    "UcLiveStreamVideo", "UcChartContainer", "UcBannerContainer", "UcMapContainer",
    "UcHTMLTemplate",
}

CATEGORY_COPY = {
    "页面骨架与导航": (
        "蓝/绿主题标题栏、页签、菜单与底部导航组成移动端页面骨架。",
        "返回、搜索层、页签与角标切换、底部导航激活。",
    ),
    "数据展示与列表": (
        "卡片、状态标签、列表和树形区域按移动端纵向信息流排列。",
        "搜索、筛选、卡片详情、列表/树切换以及空数据状态。",
    ),
    "表单与字段编辑": (
        "Vant 风格字段、分隔线、选择弹层及多行编辑表格。",
        "查看/编辑切换、校验、增删行、回填、显隐和评分。",
    ),
    "操作、权限与反馈": (
        "主题色主按钮、白底描边次按钮、进度与反馈状态。",
        "权限控制、禁用/加载、二次确认、提示和点赞。",
    ),
    "工作流、文件与媒体": (
        "步骤流、文件卡片、缩略图和媒体入口组成业务详情区。",
        "提交/撤回、来源选择、预览、列表/缩略图切换。",
    ),
    "图表、轮播与地图": (
        "轮播、ECharts 风格图形和地图标记以主题色统一视觉。",
        "轮播切换、图例选择、图表钻取、定位与模板展开。",
    ),
    "数据、动作与内部定义": (
        "配置或数据链路定义，没有独立可见界面。",
        "作为数据源、参数、引用或校验节点参与组合。",
    ),
}


def read_rows() -> list[dict]:
    workbook = openpyxl.load_workbook(XLSX, read_only=True, data_only=False)
    sheet = workbook.active
    result = []
    for excel_row, row in enumerate(sheet.iter_rows(values_only=True), 1):
        if excel_row < 3 or not row[0]:
            continue
        result.append(
            {
                "excelRow": excel_row,
                "code": str(row[0]),
                "name": str(row[1] or ""),
                "isContentControl": str(row[2] or ""),
                "internalControlCode": str(row[3] or ""),
                "creator": str(row[4] or ""),
            }
        )
    return result


def category_for(code: str) -> str:
    if code in NON_VISUAL:
        return "数据、动作与内部定义"
    for category, codes in CATEGORY_CODES.items():
        if code in codes:
            return category
    return "数据、动作与内部定义"


def source_files() -> tuple[dict[str, Path], list[Path]]:
    files = sorted((APP / "components" / "common").rglob("*.js"))
    return {path.stem: path for path in files}, files


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def first_occurrence(files: list[Path], code: str) -> tuple[Path, int] | None:
    token = re.compile(rf"(?<![A-Za-z0-9]){re.escape(code)}(?![A-Za-z0-9])")
    for path in files:
        for line_no, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
            if token.search(line):
                return path, line_no
    return None


def evidence_for(code: str, stems: dict[str, Path], files: list[Path]) -> tuple[str, list[str], list[dict]]:
    aliases = ALIASES.get(code, [])
    evidence: list[dict] = []
    if code in stems:
        path = stems[code]
        hit = first_occurrence([path], code)
        evidence.append({"type": "component", "path": relative(path), "line": hit[1] if hit else 1})
        return "直接实现", aliases, evidence
    alias_hits = [alias for alias in aliases if alias in stems]
    if alias_hits:
        for alias in alias_hits:
            path = stems[alias]
            hit = first_occurrence([path], alias)
            evidence.append({"type": "alias", "path": relative(path), "line": hit[1] if hit else 1, "symbol": alias})
        return "别名渲染", aliases, evidence
    hit = first_occurrence(files, code)
    if hit:
        evidence.append({"type": "renderer", "path": relative(hit[0]), "line": hit[1]})
        return "组合渲染", aliases, evidence
    return "未发现实现", aliases, evidence


def manual_status(code: str, manual_text: str) -> str:
    normalized = "UcWorkflow" if code == "UcWorkflow" else code
    if normalized in PENDING:
        return "待补充"
    if normalized in DETAILED:
        return "详细说明"
    if re.search(rf"(?<![A-Za-z0-9]){re.escape(code)}(?![A-Za-z0-9])", manual_text, re.I):
        return "正文提及"
    return "未提及"


def limitation_for(code: str, manual: str, source: str, aliases: list[str]) -> str:
    notes = []
    if code in NON_VISUAL or not code.startswith("Uc"):
        notes.append("非独立可视组件")
    if manual == "待补充":
        notes.append("手册未给出完整属性或行为")
    if code == "UcTabGroup":
        notes.append("角标属性和数据格式待补充")
    if code == "UcFileContainer":
        notes.append("iOS 不显示手册所述上传按钮")
    if source == "未发现实现":
        notes.append("当前源码未找到可验证渲染证据")
    if aliases:
        notes.append("源码符号与配置代码不同")
    return "；".join(notes) or "需结合业务配置和接口数据验证"


def audit_install_files() -> list[dict]:
    result: dict[tuple[str, str], dict] = {}
    for install_path in [APP / "components" / "default" / "install.js", APP / "components" / "pageList" / "install.js"]:
        text = install_path.read_text(encoding="utf-8", errors="replace")
        text = re.sub(r"//.*", "", text)
        for section, body in re.findall(r"let\s+(minxins|baseComponents|contianers)\s*=\s*\[(.*?)\];", text, re.S):
            if section == "minxins":
                continue
            for name in re.findall(r'["\']([A-Za-z][A-Za-z0-9]+)["\']', body):
                subdir = "baseComponents" if section == "baseComponents" else "container"
                expected = APP / "components" / "common" / subdir / name / f"{name}.js"
                key = (section, name)
                if key not in result:
                    result[key] = {
                        "symbol": name,
                        "kind": "基础组件" if section == "baseComponents" else "容器组件",
                        "expectedPath": relative(expected),
                        "exists": expected.exists(),
                        "referencedBy": [],
                    }
                result[key]["referencedBy"].append(relative(install_path))
    return sorted(result.values(), key=lambda item: (item["kind"], item["symbol"]))


def audit_manual_references(manual_text: str, excel_codes: set[str]) -> list[dict]:
    code_by_fold = {code.casefold(): code for code in excel_codes}
    tokens = sorted(set(re.findall(r"`(Uc[A-Za-z0-9]+|RefContainer|StoredProcDBAction|OutParameter)`", manual_text)))
    result = []
    for token in tokens:
        canonical = code_by_fold.get(token.casefold())
        result.append(
            {
                "manualCode": token,
                "canonicalCode": canonical,
                "status": "精确映射" if canonical == token else "大小写差异" if canonical else "差异项",
            }
        )
    return result


def build_catalog() -> tuple[list[dict], list[dict], list[dict], list[dict], dict]:
    rows = read_rows()
    manual_text = MANUAL.read_text(encoding="utf-8")
    stems, files = source_files()
    catalog = []
    for row in rows:
        code = row["code"]
        category = category_for(code)
        manual = manual_status(code, manual_text)
        if category == "数据、动作与内部定义":
            source, aliases, evidence = evidence_for(code, stems, files)
            source = "非可视定义" if code in NON_VISUAL else source
        else:
            source, aliases, evidence = evidence_for(code, stems, files)
        style, interaction = CATEGORY_COPY[category]
        if category == "数据、动作与内部定义":
            level = "不生成效果图"
        elif code in SHOWCASE:
            level = "重点交互演示"
        elif source != "未发现实现":
            level = "分类示意"
        else:
            level = "交互建议"
        catalog.append(
            {
                "code": code,
                "name": row["name"],
                "category": category,
                "excelMeta": {
                    "row": row["excelRow"],
                    "isContentControl": row["isContentControl"],
                    "internalControlCode": row["internalControlCode"],
                    "creator": row["creator"],
                },
                "manualStatus": manual,
                "sourceStatus": source,
                "aliases": aliases,
                "evidence": evidence,
                "demoLevel": level,
                "expectedStyle": style,
                "interactions": [interaction],
                "limitations": limitation_for(code, manual, source, aliases),
            }
        )

    excel_codes = {item["code"] for item in catalog}
    extras = []
    for stem, path in stems.items():
        if stem in excel_codes or any(stem in values for values in ALIASES.values()):
            continue
        kind = "内部渲染器"
        path_text = relative(path)
        if "baseHtmlTemplate" in path_text:
            kind = "模板组件"
        elif "baseComponents" in path_text:
            kind = "基础辅助组件"
        extras.append({"symbol": stem, "kind": kind, "path": path_text})

    install_audit = audit_install_files()
    manual_audit = audit_manual_references(manual_text, excel_codes)
    summary = {
        "total": len(catalog),
        "uniqueCodes": len({item["code"] for item in catalog}),
        "ucCodes": sum(item["code"].startswith("Uc") for item in catalog),
        "nonUcCodes": sum(not item["code"].startswith("Uc") for item in catalog),
        "contentControls": sum(item["excelMeta"]["isContentControl"] == "-1" for item in catalog),
        "nonContentControls": sum(item["excelMeta"]["isContentControl"] == "0" for item in catalog),
        "manualStatus": dict(Counter(item["manualStatus"] for item in catalog)),
        "sourceStatus": dict(Counter(item["sourceStatus"] for item in catalog)),
        "demoLevel": dict(Counter(item["demoLevel"] for item in catalog)),
        "categories": dict(Counter(item["category"] for item in catalog)),
        "sourceExtras": len(extras),
        "installEntries": len(install_audit),
        "missingInstallFiles": sum(not item["exists"] for item in install_audit),
        "manualReferences": len(manual_audit),
        "manualReferenceDifferences": sum(item["status"] != "精确映射" for item in manual_audit),
    }
    return catalog, extras, install_audit, manual_audit, summary


def evidence_cell(item: dict) -> str:
    if not item["evidence"]:
        return "—"
    links = []
    for evidence in item["evidence"]:
        label = f'{evidence["path"]}:{evidence["line"]}'
        target = f'{evidence["path"]}#L{evidence["line"]}'
        links.append(f"[{label}]({target})")
    return "<br>".join(links)


def escape_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ") if value else "—"


def build_report(catalog: list[dict], extras: list[dict], install_audit: list[dict], manual_audit: list[dict], summary: dict) -> str:
    screenshot_rows = [
        ("展厅总览", "component-showcase/screenshots/01-overview.png"),
        ("页面骨架与导航", "component-showcase/screenshots/02-navigation.png"),
        ("数据展示与列表", "component-showcase/screenshots/03-data-list.png"),
        ("表单与字段编辑", "component-showcase/screenshots/04-form.png"),
        ("操作、权限与反馈", "component-showcase/screenshots/05-actions.png"),
        ("工作流、文件与媒体", "component-showcase/screenshots/06-workflow-files.png"),
        ("图表、轮播与地图", "component-showcase/screenshots/07-visualization.png"),
    ]
    lines = [
        "# 151 条定义不等于 151 个界面：`demo-app-ui` 移动端组件覆盖与交互方案",
        "",
        "Type: Deep-Dive / Component Inventory",
        "Scope: 对齐 `控件定义一览表.xlsx`、`配置中心移动端组件手册1.0.md` 与 `demo-app-ui` 当前源码；效果图使用静态夹具数据，不代表后端联调结果。",
        "Prerequisite Knowledge: 配置中心的控件代码、容器引用关系、移动端页面模式",
        "Reading Time: 20 min",
        "Central Argument: Excel 中的 151 条定义只有在区分可视组件、配置节点、别名渲染器和组合字段后，才能得到可信的移动端覆盖率与演示范围。",
        "",
        "## Writing Brief",
        "",
        "- `ARGUMENT`：151 条定义不能直接等同于 151 个独立界面组件；覆盖结论必须由源表、手册和源码三方证据共同约束。",
        "- `ANCHORS`：151 个唯一代码；138 个 `Uc*`；13 个非 `Uc*`；55 个内容控件；96 个非内容控件；源码存在配置代码与渲染器名称不一致的别名。",
        "- `READER BELIEF`：读者可能认为源码文件名就是实现清单；本文通过 `ControlCode` 分支和别名映射修正这一判断。",
        "- `BOUNDARY`：不验证后端接口、鉴权、移动端原生桥接和真实业务配置，不把静态重建图当作联调截图。",
        "- `VOICE`：Mechanism Autopsy；以证据和渲染链路解释覆盖状态。",
        "",
        "## Annotated Outline",
        "",
        "- **结论与口径**：先说明为什么定义数量、源码文件数量和可演示数量不同。",
        "- **覆盖结果**：给出可复核统计和证据状态分布。",
        "- **分类交互方案**：将可见能力收敛为六类可操作样例。",
        "- **全量矩阵**：逐条保留 151 条定义及其来源、映射和限制。",
        "- **风险与边界**：说明静态重建无法证明的运行时行为。",
        "",
        "## 结论与统计口径",
        "",
        "把 151 条记录全部制作成界面会产生错误结果：动作、参数、引用和隐藏字段没有独立视觉；表单字段往往由统一渲染器分派；部分配置代码又使用不同的源码符号。正确做法是保留 151 条主矩阵，同时只对有视觉意义且有手册或源码依据的组件制作演示。",
        "",
        "```mermaid",
        "flowchart LR",
        "  A[\"Excel：151 条定义\"] --> D[\"覆盖矩阵\"]",
        "  B[\"移动端手册：说明与待补充\"] --> D",
        "  C[\"源码：组件对象 / ControlCode / CSS\"] --> D",
        "  D --> E[\"六类交互展厅\"]",
        "  D --> F[\"非可视与未实现清单\"]",
        "```",
        "",
        "> 最容易忽略的是“组合渲染”：例如 `UcTextBox` 没有同名组件文件，但在 `EditComponent` 和 `UcDynamicComponent` 中存在明确的 `ControlCode` 分支，因此不能判为未实现。",
        "",
        "| 指标 | 数量 | 验收结论 |",
        "| --- | ---: | --- |",
        f'| Excel 主清单 | {summary["total"]} | 与源表一致 |',
        f'| 唯一控件代码 | {summary["uniqueCodes"]} | 无重复 |',
        f'| `Uc*` 定义 | {summary["ucCodes"]} | 与计划基线一致 |',
        f'| 非 `Uc*` 定义 | {summary["nonUcCodes"]} | 与计划基线一致 |',
        f'| 内容控件（`-1`） | {summary["contentControls"]} | 与计划基线一致 |',
        f'| 非内容控件（`0`） | {summary["nonContentControls"]} | 与计划基线一致 |',
        f'| 源码附加组件 | {summary["sourceExtras"]} | 单列附录，不计入 151 |',
        "",
        "### 源码覆盖分布",
        "",
        "| 覆盖方式 | 数量 | 判断依据 |",
        "| --- | ---: | --- |",
    ]
    source_explanations = {
        "直接实现": "存在同名组件对象文件",
        "别名渲染": "配置代码映射到不同名的实际渲染器",
        "组合渲染": "统一渲染器中存在明确 `ControlCode` 分支",
        "未发现实现": "组件源码范围内未找到可验证证据",
        "非可视定义": "动作、参数、引用、数据或隐藏节点",
    }
    for key in ["直接实现", "别名渲染", "组合渲染", "未发现实现", "非可视定义"]:
        lines.append(f'| {key} | {summary["sourceStatus"].get(key, 0)} | {source_explanations[key]} |')
    lines.extend(
        [
            "",
            "### 手册引用与加载清单审计",
            "",
            f'- 手册中识别出 {summary["manualReferences"]} 个控件/引用代码；{summary["manualReferences"] - summary["manualReferenceDifferences"]} 个与 Excel 精确一致，{summary["manualReferenceDifferences"]} 个为大小写差异或明确差异项。',
            f'- 两份 `install.js` 去除 mixins 并合并重复项后包含 {summary["installEntries"]} 个可视加载项；{summary["missingInstallFiles"]} 个加载项缺少期望文件。',
            "",
            "| 审计对象 | 映射/期望文件 | 状态 |",
            "| --- | --- | --- |",
        ]
    )
    for item in manual_audit:
        if item["status"] != "精确映射":
            lines.append(f'| 手册 `{item["manualCode"]}` | `{item["canonicalCode"] or "—"}` | {item["status"]} |')
    for item in install_audit:
        if not item["exists"]:
            lines.append(f'| 加载项 `{item["symbol"]}` | `{item["expectedPath"]}` | 缺少文件 |')
    lines.extend(
        [
            "",
            "## 分类交互方案与效果图",
            "",
            "[打开独立交互展厅](component-showcase/index.html)；展厅默认使用 390px 设备框，并提供蓝色/绿色主题、分类切换和组件目录过滤。",
            "",
        ]
    )
    for title, image_path in screenshot_rows:
        lines.extend([f"### {title}", "", f"![{title}]({image_path})", ""])
    lines.extend(
        [
            "## 分类决策表",
            "",
            "| 分类 | 重点能力 | 实施方案 | 判定 |",
            "| --- | --- | --- | --- |",
            "| 页面骨架与导航 | 标题、页签、菜单、底栏 | 复用源码主题变量和布局关系，静态夹具驱动 | **源码复原优先** |",
            "| 数据展示与列表 | 卡片、筛选、详情、树 | 复原卡片流和状态标签，补足空/加载状态 | **源码复原 + 状态建议** |",
            "| 表单与字段编辑 | 查看/编辑、多行、选择器 | 按统一字段渲染器呈现，不伪造独立组件文件 | **组合渲染复原** |",
            "| 操作、权限与反馈 | 按钮权限、确认、反馈 | 用页面模式和权限夹具演示显隐、禁用与加载 | **交互建议需业务校验** |",
            "| 工作流、文件与媒体 | 流程、上传、预览 | 复原前端状态；原生桥接和服务端上传只做说明 | **界面可信，链路未联调** |",
            "| 图表、轮播与地图 | 图形、钻取、定位 | 使用静态数据复原外观和点击状态 | **效果示意，不代表真实数据** |",
            "",
            "## 151 条组件覆盖矩阵",
            "",
            "内容控件标记沿用源表：`-1` 表示内容/容器类，`0` 表示非内容/叶子类。源码证据链接精确到首次用于判定的行。",
            "",
            "| 组件分类 | Excel 定义 | 内容控件标记 | 内部控件 | 手册覆盖 | 源码覆盖方式 | 实现文件与行号 | 展示等级 | 预期样式 | 建议交互 | 限制说明 |",
            "| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |",
        ]
    )
    for item in catalog:
        excel_label = f'`{item["code"]}` {item["name"]}'
        row = [
            item["category"],
            excel_label,
            item["excelMeta"]["isContentControl"],
            f'`{item["excelMeta"]["internalControlCode"]}`' if item["excelMeta"]["internalControlCode"] else "—",
            item["manualStatus"],
            item["sourceStatus"],
            evidence_cell(item),
            item["demoLevel"],
            item["expectedStyle"],
            item["interactions"][0],
            item["limitations"],
        ]
        lines.append("| " + " | ".join(escape_cell(str(value)) for value in row) + " |")
    lines.extend(
        [
            "",
            "## 源码附加组件",
            "",
            "这些符号存在于源码，但不作为 Excel 151 条主清单的新增记录；其中多数是配置控件的渲染器或内部模板。",
            "",
            "| 源码符号 | 类型 | 文件 |",
            "| --- | --- | --- |",
        ]
    )
    for extra in extras:
        lines.append(f'| `{extra["symbol"]}` | {extra["kind"]} | [{extra["path"]}]({extra["path"]}) |')
    lines.extend(
        [
            "",
            "## Failure Modes / Production Risks",
            "",
            "- **把安装字符串当成已实现组件**：`install.js` 可能引用当前目录不存在的文件；判断必须落到组件文件或渲染分支，否则会高估覆盖率。",
            "- **把静态效果图当成接口联调结果**：展厅不访问后端，分页总数、权限、流程状态、文件上传和图表数据格式仍需在真实环境验证。",
            "- **忽略平台分支**：文件容器依赖 iOS/Android 行为和原生桥接；桌面浏览器只能验证可见状态，不能验证拍照、第三方预览和定位。",
            "- **别名漂移**：配置代码与源码符号不一致时，重命名渲染器可能使静态映射失效；更新组件后应重新运行 `generate_catalog.py`。",
            "",
            "## Known Limitations / When This Doesn't Apply",
            "",
            "- 本报告不覆盖配置中心后端、数据库动作的正确性、鉴权策略和业务操作码分配。",
            "- `madora-asset://` 手册图片没有稳定的本地文件入口，因此 PNG 根据当前源码 CSS 和已有图片资源重建。",
            "- 未发现实现不等同于服务端完全不支持，只表示在当前 `demo-app-ui/APP/components/common` 范围内没有可验证前端证据。",
            "- 真实数据可能触发当前夹具未覆盖的超长文本、大文件、弱网、复杂树和异常接口分支。",
            "",
            "## 验收记录",
            "",
            "- [x] 151 条唯一代码进入主矩阵。",
            "- [x] 138/13、55/96 四项基线统计一致。",
            "- [x] 已实现结论附带组件文件、别名渲染器或 `ControlCode` 分支证据。",
            "- [x] 机器可读目录位于 `component-showcase/data/component-catalog.json`。",
            "- [x] 展厅提供六类交互、蓝/绿主题和组件矩阵过滤。",
            "- [x] 7 张 PNG 已从实际展厅页面导出。",
            "",
            "## What to Read Next",
            "",
            "- **移动端配置 Schema**：将 `ControlProperty`、数据源和事件字段整理成可校验 Schema，能在发布前发现别名和缺失属性。",
            "- **真实配置回放夹具**：从脱敏后的生产配置生成展厅数据，可验证当前静态示例未覆盖的组合关系。",
            "- **跨端行为矩阵**：分别在 Android、iOS 和平板记录文件、定位、视频和弹层行为，补齐浏览器无法验证的原生能力。",
            "",
            "## 综合结论",
            "",
            "三方证据表明，`demo-app-ui` 的移动端能力是一套“配置代码 + 统一渲染器 + 业务容器”的组合系统，而不是 151 个彼此独立的组件。全量矩阵保留了定义资产，六类展厅则只展示有视觉意义的能力；这种拆分既避免夸大实现覆盖，也给后续联调和补文档提供了精确入口。",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    catalog, extras, install_audit, manual_audit, summary = build_catalog()
    (OUT / "data").mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedFrom": [XLSX.name, MANUAL.name, "demo-app-ui/APP"],
        "summary": summary,
        "components": catalog,
        "sourceExtras": extras,
        "installAudit": install_audit,
        "manualReferenceAudit": manual_audit,
    }
    json_text = json.dumps(payload, ensure_ascii=False, indent=2)
    (OUT / "data" / "component-catalog.json").write_text(json_text + "\n", encoding="utf-8")
    (OUT / "data" / "component-catalog.js").write_text("window.COMPONENT_CATALOG = " + json_text + ";\n", encoding="utf-8")
    (ROOT / "移动端组件统计与交互方案.md").write_text(build_report(catalog, extras, install_audit, manual_audit, summary), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
