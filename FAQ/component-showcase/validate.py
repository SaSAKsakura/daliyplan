from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SHOWCASE = Path(__file__).resolve().parent
CATALOG = SHOWCASE / "data" / "component-catalog.json"
REPORT = ROOT / "移动端组件统计与交互方案.md"
SCREENSHOTS = [
    "01-overview.png",
    "02-navigation.png",
    "03-data-list.png",
    "04-form.png",
    "05-actions.png",
    "06-workflow-files.png",
    "07-visualization.png",
]
REQUIRED_FIELDS = {
    "code",
    "name",
    "category",
    "excelMeta",
    "manualStatus",
    "sourceStatus",
    "aliases",
    "evidence",
    "demoLevel",
    "interactions",
    "limitations",
}


def main() -> None:
    payload = json.loads(CATALOG.read_text(encoding="utf-8"))
    components = payload["components"]
    assert len(components) == 151
    assert len({item["code"] for item in components}) == 151
    assert sum(item["code"].startswith("Uc") for item in components) == 138
    assert sum(not item["code"].startswith("Uc") for item in components) == 13
    assert sum(item["excelMeta"]["isContentControl"] == "-1" for item in components) == 55
    assert sum(item["excelMeta"]["isContentControl"] == "0" for item in components) == 96
    assert all(REQUIRED_FIELDS <= set(item) for item in components)

    for item in components:
        for evidence in item["evidence"]:
            path = ROOT / evidence["path"]
            assert path.exists(), (item["code"], path)
            line_count = len(path.read_text(encoding="utf-8", errors="replace").splitlines())
            assert 1 <= evidence["line"] <= line_count, (item["code"], evidence)

    assert all(item["canonicalCode"] for item in payload["manualReferenceAudit"])
    assert sum(not item["exists"] for item in payload["installAudit"]) == payload["summary"]["missingInstallFiles"]

    report = REPORT.read_text(encoding="utf-8")
    assert report.count("\n| ") > 151
    assert "component-showcase/index.html" in report
    for filename in SCREENSHOTS:
        path = SHOWCASE / "screenshots" / filename
        assert path.exists() and path.stat().st_size > 50_000, path
        with Image.open(path) as image:
            assert image.width >= 1000 and image.height >= 800, (path, image.size)
        assert f"component-showcase/screenshots/{filename}" in report

    print(
        json.dumps(
            {
                "status": "success",
                "components": len(components),
                "evidenceItems": sum(len(item["evidence"]) for item in components),
                "manualReferences": len(payload["manualReferenceAudit"]),
                "installEntries": len(payload["installAudit"]),
                "missingInstallFiles": payload["summary"]["missingInstallFiles"],
                "screenshots": len(SCREENSHOTS),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
