from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from io import BytesIO
from copy import copy
import re,posixpath
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v10'
P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
def static_slide(data,number):
 node=ET.fromstring(data)
 for tag in ['timing','transition']:
  for item in node.findall('{'+P+'}'+tag):node.remove(item)
 for shape in node.findall('.//{'+P+'}sp'):
  runs=shape.findall('.//{'+A+'}t');content=''.join(x.text or '' for x in runs)
  if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*(13|14)\s*',content):
   runs[0].text=f'{number:02d} ／ 14'
   for run in runs[1:]:run.text=''
 assert not node.findall('.//{'+P+'}pic')
 return ET.tostring(node,encoding='utf-8',xml_declaration=True)
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v9.pptx').read_bytes())) as src,ZipFile(root/'output/AI新能源设施建设场景方案v2.pptx') as original,ZipFile(build/'archive-edited.pptx') as edited:
 updates={
  'ppt/slides/slide10.xml':static_slide(original.read('ppt/slides/slide10.xml'),11),
  'ppt/slides/slide11.xml':static_slide(edited.read('ppt/slides/slide11.xml'),12),
  'ppt/slides/_rels/slide10.xml.rels':original.read('ppt/slides/_rels/slide10.xml.rels'),
  'ppt/slides/_rels/slide11.xml.rels':original.read('ppt/slides/_rels/slide11.xml.rels'),
 }
 # The reference layout is shared and stable; neither restored page has images.
 for n in [10,11]:
  assert not any(k.startswith('{'+R+'}') for el in ET.fromstring(updates[f'ppt/slides/slide{n}.xml']).iter() for k in el.attrib)
 remove={'ppt/media/team-profile-dashboard-v4.png','ppt/media/archive-example-v6-1.png','ppt/media/archive-example-v6-2.png'}
 for name in src.namelist():
  if not name.endswith('.rels'):continue
  node=ET.fromstring(updates.get(name,src.read(name)))
  for rel in node:
   target=rel.get('Target','')
   if any(Path(target).name==Path(media).name for media in remove):raise AssertionError(f'Still referenced: {target}')
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():
   if item.filename not in remove:out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
with ZipFile(root/'output/AI新能源设施建设场景方案v9.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 for name in out.namelist():
  if name not in {'ppt/slides/slide10.xml','ppt/slides/slide11.xml','ppt/slides/_rels/slide10.xml.rels','ppt/slides/_rels/slide11.xml.rels'}:assert src.read(name)==out.read(name)
 for n in [10,11]:
  node=ET.fromstring(out.read(f'ppt/slides/slide{n}.xml'));assert node.find('{'+P+'}timing') is None;assert not node.findall('.//{'+P+'}pic')
 print('Main presentation now has static agent 05 and 06 pages; separate interface images removed from the main file. All other slides unchanged.')
