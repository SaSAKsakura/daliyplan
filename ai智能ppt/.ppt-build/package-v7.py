from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from io import BytesIO
from copy import copy,deepcopy
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v7'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
changes={10:['看板展示标题'],11:['档案示例1标题','档案示例2标题']}
def named_shape(slide,name):
 return next(sp for sp in slide.findall('.//{'+P+'}sp') if sp.find('{'+P+'}nvSpPr/{'+P+'}cNvPr').get('name')==name)
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v6.pptx').read_bytes())) as src,ZipFile(build/'edited-export.pptx') as ed:
 updates={}
 for n,names in changes.items():
  part=f'ppt/slides/slide{n}.xml';slide=ET.fromstring(src.read(part));edited=ET.fromstring(ed.read(part))
  original_timing=ET.tostring(slide.find('{'+P+'}timing'))
  for name in names:
   sp=named_shape(slide,name);updated=named_shape(edited,name)
   oldbody=sp.find('{'+P+'}txBody');newbody=updated.find('{'+P+'}txBody')
   assert newbody is not None
   assert not ''.join(x.text or '' for x in newbody.findall('.//{'+A+'}t'))
   index=list(sp).index(oldbody);sp.remove(oldbody);sp.insert(index,deepcopy(newbody))
  assert ET.tostring(slide.find('{'+P+'}timing'))==original_timing
  updates[part]=ET.tostring(slide,encoding='utf-8',xml_declaration=True)
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
with ZipFile(root/'output/AI新能源设施建设场景方案v6.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 changed=[n for n in src.namelist() if src.read(n)!=out.read(n)]
 assert set(changed)=={'ppt/slides/slide10.xml','ppt/slides/slide11.xml'}
 for n,names in changes.items():
  before=ET.fromstring(src.read(f'ppt/slides/slide{n}.xml'));after=ET.fromstring(out.read(f'ppt/slides/slide{n}.xml'))
  assert ET.tostring(before.find('{'+P+'}timing'))==ET.tostring(after.find('{'+P+'}timing'))
  for sp in before.findall('.//{'+P+'}sp'):
   name=sp.find('{'+P+'}nvSpPr/{'+P+'}cNvPr').get('name')
   if name not in names:assert ET.tostring(sp)==ET.tostring(named_shape(after,name)),name
 print('Only three screenshot captions cleared; all screenshots, animation timelines and other content retained unchanged.')
