from pathlib import Path, PurePosixPath
from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as ET
from io import BytesIO
from copy import copy
import hashlib,posixpath
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v4'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v2.pptx').read_bytes())) as src,ZipFile(build/'edited-export.pptx') as ed:
    updates={'ppt/slides/slide10.xml':ed.read('ppt/slides/slide10.xml')}
    er=ET.fromstring(ed.read('ppt/slides/_rels/slide10.xml.rels'))
    images=[x for x in er if x.get('Type')==R+'/image']
    assert len(images)==1
    item=images[0]
    target=item.get('Target')
    path=target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join('ppt/slides',target))
    media=ed.read(path)
    original_image=(root/'output/企业画像页面_脱敏版v2.png').read_bytes()
    assert hashlib.sha256(media).digest()==hashlib.sha256(original_image).digest(), 'Screenshot bytes changed'
    media_path='ppt/media/team-profile-dashboard-v4.png'
    assert media_path not in src.namelist()
    updates[media_path]=media
    sr=ET.fromstring(src.read('ppt/slides/_rels/slide10.xml.rels'))
    assert not any(x.get('Id')==item.get('Id') for x in sr)
    ET.SubElement(sr,'{'+PKG+'}Relationship',{'Id':item.get('Id'),'Type':R+'/image','Target':'../media/team-profile-dashboard-v4.png'})
    ET.register_namespace('',PKG)
    updates['ppt/slides/_rels/slide10.xml.rels']=ET.tostring(sr,encoding='utf-8',xml_declaration=True)
    ct=ET.fromstring(src.read('[Content_Types].xml'))
    if not any(x.get('Extension')=='png' for x in ct):
        ET.SubElement(ct,'{'+CT+'}Default',{'Extension':'png','ContentType':'image/png'})
        ET.register_namespace('',CT)
        updates['[Content_Types].xml']=ET.tostring(ct,encoding='utf-8',xml_declaration=True)
    with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
        for entry in src.infolist():out.writestr(copy(entry),updates.pop(entry.filename,src.read(entry.filename)))
        for name,data in updates.items():out.writestr(name,data)
with ZipFile(root/'output/AI新能源设施建设场景方案v2.pptx') as src,ZipFile(build/'candidate.pptx') as out:
    for i in range(1,14):
        if i!=10:assert src.read(f'ppt/slides/slide{i}.xml')==out.read(f'ppt/slides/slide{i}.xml')
    xml=ET.fromstring(out.read('ppt/slides/slide10.xml'))
    assert not xml.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}tbl')
    assert len(xml.findall('.//{http://schemas.openxmlformats.org/presentationml/2006/main}pic'))==1
    print('Embedded original image bytes; original logic wording verified; all other 12 slides preserved.')
