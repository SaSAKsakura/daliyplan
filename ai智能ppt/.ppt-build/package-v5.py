from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as ET
from io import BytesIO
from copy import copy
import sys,hashlib,posixpath
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v5'
native=len(sys.argv)>1 and sys.argv[1]=='native'
input_path=build/('native-animated.pptx' if native else 'edited-export.pptx')
output_path=build/('candidate.pptx' if native else 'pre-animation.pptx')
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v4.pptx').read_bytes())) as src,ZipFile(input_path) as ed:
    slide=ed.read('ppt/slides/slide10.xml')
    rel=ET.fromstring(ed.read('ppt/slides/_rels/slide10.xml.rels'))
    assert len([x for x in rel if x.get('Type')==R+'/image'])==1
    newrel=ET.Element('{'+PKG+'}Relationships')
    for item in rel:
        ty=item.get('Type')
        if ty==R+'/image':
            t=item.get('Target');part=t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join('ppt/slides',t))
            original=src.read('ppt/media/team-profile-dashboard-v4.png')
            assert hashlib.sha256(ed.read(part)).digest()==hashlib.sha256(original).digest()
            ET.SubElement(newrel,'{'+PKG+'}Relationship',{'Id':item.get('Id'),'Type':ty,'Target':'../media/team-profile-dashboard-v4.png'})
        elif ty==R+'/slideLayout':
            ET.SubElement(newrel,'{'+PKG+'}Relationship',{'Id':item.get('Id'),'Type':ty,'Target':'../slideLayouts/slideLayout1.xml'})
        elif ty==R+'/notesSlide':
            pass
        else:raise AssertionError(f'Unexpected relationship {ty}')
    ET.register_namespace('',PKG)
    updates={'ppt/slides/slide10.xml':slide,'ppt/slides/_rels/slide10.xml.rels':ET.tostring(newrel,encoding='utf-8',xml_declaration=True)}
    with ZipFile(output_path,'w',ZIP_DEFLATED) as out:
        for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
    if native:
        node=ET.fromstring(slide)
        timing=node.find('{'+P+'}timing')
        assert timing is not None
        effects=timing.findall('.//{'+P+'}animEffect')
        assert len(effects)==7
        assert [x.get('transition') for x in effects]==['out']*5+['in']*2
        assert all(x.get('filter')=='fade' for x in effects)
        shape_ids={x.get('id') for x in node.findall('.//{'+P+'}cNvPr')}
        assert all(x.get('spid') in shape_ids for x in timing.findall('.//{'+P+'}spTgt'))
        print('Verified seven coordinated native fade effects and valid animation targets.')
with ZipFile(root/'output/AI新能源设施建设场景方案v4.pptx') as src,ZipFile(output_path) as out:
    changed=[n for n in src.namelist() if src.read(n)!=out.read(n)]
    assert set(changed)=={'ppt/slides/slide10.xml','ppt/slides/_rels/slide10.xml.rels'}
    print('Preserved every package part outside slide 10 and its relationships.')
