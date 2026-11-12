from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as ET
import json
import sys
from io import BytesIO
from copy import copy
root=Path(__file__).resolve().parent.parent
version=int(sys.argv[1]) if len(sys.argv)>1 else 1
source=root/'AI新能源设施建设场景方案v0.pptx' if version==1 else root/f'output/AI新能源设施建设场景方案v{version-1}.pptx'
build=root/'.ppt-build' if version==1 else root/f'.ppt-build/v{version}'
edited=build/'edited-export.pptx'
target=build/'candidate.pptx'
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
source_bytes=source.read_bytes()
with ZipFile(BytesIO(source_bytes)) as src, ZipFile(edited) as ed:
    slide=ed.read('ppt/slides/slide6.xml')
    # This slide contains text and shapes only. Keep the source package and its
    # layouts, themes, relationships, media and all other slides byte-for-byte.
    node=ET.fromstring(slide)
    assert not node.findall('.//p:pic',ns)
    relns='{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
    assert not any(k.startswith(relns) for e in node.iter() for k in e.attrib)
    with ZipFile(target,'w',ZIP_DEFLATED) as out:
        for item in src.infolist():
            out.writestr(copy(item),slide if item.filename=='ppt/slides/slide6.xml' else src.read(item.filename))
    original=ET.fromstring(src.read('ppt/presentation.xml'))
    size=original.find('p:sldSz',ns)
    print('SIZE',size.attrib)
with ZipFile(BytesIO(source_bytes)) as src, ZipFile(target) as out:
    changed=[n for n in src.namelist() if src.read(n)!=out.read(n)]
    assert changed==['ppt/slides/slide6.xml'],changed
    assert len([n for n in out.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')])==13
    print('Changed parts:',changed)
