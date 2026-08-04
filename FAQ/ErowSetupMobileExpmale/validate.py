from __future__ import annotations

import re
from pathlib import Path


LIBRARY = Path(__file__).resolve().parent
INDEX = LIBRARY / "index.html"
APP = LIBRARY / "app.js"
STYLES = LIBRARY / "styles.css"
README = LIBRARY / "README.md"
MANUAL = LIBRARY / "移动端页面案例库功能说明.md"
ICON_DIR = LIBRARY / "assets" / "file-icons"
SCREENSHOT_DIR = LIBRARY / "screenshots"

PATTERN_IDS = {
    "navigation",
    "dashboard",
    "filter",
    "list",
    "detail",
    "guidance",
    "map",
    "upload",
}

REQUIRED_ICONS = {
    "pdf.png",
    "txt.png",
    "doc.png",
    "docx.png",
    "excel.png",
    "ppt.png",
    "images.png",
    "audio.png",
    "video.png",
    "zip.png",
    "other.png",
}

REQUIRED_SCREENSHOTS = {
    "common-screen-patterns-overview.png",
    "common-screen-patterns-gallery.png",
    "pattern-navigation.png",
    "pattern-dashboard.png",
    "pattern-filter.png",
    "pattern-list.png",
    "pattern-detail.png",
    "pattern-guidance.png",
    "pattern-map.png",
    "pattern-upload.png",
    "filter-single-select.png",
    "filter-multi-select.png",
    "filter-date-picker.png",
    "detail-form-tree.png",
    "detail-signature-canvas.png",
    "detail-people-single.png",
    "detail-people-multiple.png",
    "map-point-detail.png",
    "upload-file-type.png",
    "upload-source-sheet.png",
    "upload-thumbnail-config.png",
    "upload-progress.png",
}


def main() -> None:
    required_files = (INDEX, APP, STYLES, README, MANUAL)
    assert all(path.is_file() for path in required_files), required_files
    assert ICON_DIR.is_dir(), ICON_DIR
    assert all((ICON_DIR / name).is_file() for name in REQUIRED_ICONS)

    index = INDEX.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")
    styles = STYLES.read_text(encoding="utf-8")
    readme = README.read_text(encoding="utf-8")
    manual = MANUAL.read_text(encoding="utf-8")

    assert 'href="styles.css' not in index
    assert 'src="app.js' not in index
    assert "<style>" in index and "<script>" in index
    assert "data:image/png;base64," in index
    assert "assets/file-icons" in app
    assert "../demo-app-ui" not in app
    assert "http://" not in app and "https://" not in app
    assert "prefers-reduced-motion" in styles
    assert "?pattern=<id>" in readme
    assert "移动端页面案例库功能说明.md" in readme

    declared_ids = set(re.findall(r"\bid:\s*'([a-z]+)'\s*,\s*index:", app))
    renderer_match = re.search(r"const renderers = \{([^}]+)\}", app)
    assert renderer_match, "renderers"
    renderer_ids = set(re.findall(r"([a-z]+): render[A-Z]", renderer_match.group(1)))
    assert declared_ids == PATTERN_IDS, (declared_ids, PATTERN_IDS)
    assert PATTERN_IDS <= renderer_ids, renderer_ids
    assert all(f"`{pattern_id}`" in manual for pattern_id in PATTERN_IDS)

    assert SCREENSHOT_DIR.is_dir(), SCREENSHOT_DIR
    for name in REQUIRED_SCREENSHOTS:
        screenshot = SCREENSHOT_DIR / name
        assert screenshot.is_file() and screenshot.stat().st_size > 10_000, screenshot
        assert f"screenshots/{name}" in manual, name

    assert "8 类" in manual and "390 × 844" in manual
    assert "10 类" not in manual and "十类" not in manual
    for removed_section in ("推荐组件组合", "页面状态", "方案落地基线"):
        assert removed_section not in manual, removed_section

    assert "patternComponents" not in index and "patternComponents" not in app
    assert ".component-chips" not in styles and "elements.components" not in app
    assert "renderFormTree" in app and "renderSignatureSection" in app
    assert "renderPeoplePicker" in app and "renderMap" in app and "renderUpload" in app

    surface = "\n".join((index, app, readme, manual))
    assert not re.search(r"(?<!\d)1[3-9]\d{9}(?!\d)", surface), "full mobile number"
    assert not re.search(r"(?<!\d)\d{12,}(?!\d)", surface), "12+ digit sequence"
    assert not re.search(
        r"(?:api|tiles?)\.(?:baidu|amap|google|mapbox)", surface, re.I
    ), "external map resource"

    print(
        {
            "status": "success",
            "patterns": len(PATTERN_IDS),
            "icons": len(REQUIRED_ICONS),
            "screenshots": len(REQUIRED_SCREENSHOTS),
            "external_runtime_dependencies": 0,
        }
    )


if __name__ == "__main__":
    main()
