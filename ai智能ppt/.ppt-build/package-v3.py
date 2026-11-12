from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as ET
from copy import copy
from io import BytesIO
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v3'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('p',P)
ET.register_namespace('r',R)
def xml_bytes(node):return ET.tostring(node,encoding='utf-8',xml_declaration=True)
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v2.pptx').read_bytes())) as src, ZipFile(build/'edited-export.pptx') as ed:
    updates={'ppt/slides/slide10.xml':ed.read('ppt/slides/slide10.xml')}
    node=ET.fromstring(updates['ppt/slides/slide10.xml'])
    assert not any(k.startswith('{'+R+'}') for e in node.iter() for k in e.attrib)
    assert len(node.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}tbl'))==1
    notes=['ppt/notesSlides/notesSlide10.xml','ppt/notesSlides/_rels/notesSlide10.xml.rels']
    assert all(n not in src.namelist() for n in notes)
    updates.update({n:ed.read(n) for n in notes})
    relpath='ppt/slides/_rels/slide10.xml.rels'
    rel=ET.fromstring(src.read(relpath))
    ET.SubElement(rel,'{'+PKG+'}Relationship',{'Id':'rIdTeamProfileNotes','Type':R+'/notesSlide','Target':'../notesSlides/notesSlide10.xml'})
    updates[relpath]=xml_bytes(rel)
    # The source already declares notesMaster1. Retain its original master,
    # theme and presentation relationships; the new note points to that master.
    assert 'ppt/notesMasters/notesMaster1.xml' in src.namelist()
    ct=ET.fromstring(src.read('[Content_Types].xml'))
    exported_ct=ET.fromstring(ed.read('[Content_Types].xml'))
    for n in notes:
        if n.endswith('.rels'):continue
        item=next(x for x in exported_ct if x.get('PartName')=='/'+n)
        ct.append(copy(item))
    ET.register_namespace('',CT)
    updates['[Content_Types].xml']=xml_bytes(ct)
    with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
        for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
        for n,data in updates.items():out.writestr(n,data)
with ZipFile(root/'output/AI新能源设施建设场景方案v2.pptx') as src,ZipFile(build/'candidate.pptx') as out:
    for i in range(1,14):
        if i!=10:assert src.read(f'ppt/slides/slide{i}.xml')==out.read(f'ppt/slides/slide{i}.xml')
    assert src.read('ppt/slides/slide6.xml')==out.read('ppt/slides/slide6.xml')
    print('Preserved all 12 other slides; packaged editable table and source/logic notes.')
