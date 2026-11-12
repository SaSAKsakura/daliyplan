from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from io import BytesIO
from copy import copy,deepcopy
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v8'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v7.pptx').read_bytes())) as src,ZipFile(build/'edited-export.pptx') as ed:
 updates={}
 for n in [10,11]:
  part=f'ppt/slides/slide{n}.xml';slide=ET.fromstring(src.read(part));edited=ET.fromstring(ed.read(part));timing=ET.tostring(slide.find('{'+P+'}timing'))
  originals=slide.findall('.//{'+P+'}pic');newpics=edited.findall('.//{'+P+'}pic');assert len(originals)==len(newpics)
  for sp,updated in zip(originals,newpics):
   old=sp.find('{'+P+'}spPr/{'+A+'}xfrm');new=updated.find('{'+P+'}spPr/{'+A+'}xfrm')
   assert ET.tostring(old.find('{'+A+'}ext'))==ET.tostring(new.find('{'+A+'}ext'))
   assert new.find('{'+A+'}off').get('y')==str(178*9525)
   parent=sp.find('{'+P+'}spPr');parent.remove(old);parent.insert(0,deepcopy(new))
  if n==10:
   def mask(s):return next(x for x in s.findall('.//{'+P+'}sp') if x.find('{'+P+'}nvSpPr/{'+P+'}cNvPr').get('name')=='看板展示标题')
   old=mask(slide).find('{'+P+'}spPr/{'+A+'}xfrm');new=mask(edited).find('{'+P+'}spPr/{'+A+'}xfrm');parent=mask(slide).find('{'+P+'}spPr');parent.remove(old);parent.insert(0,deepcopy(new))
  assert ET.tostring(slide.find('{'+P+'}timing'))==timing
  updates[part]=ET.tostring(slide,encoding='utf-8',xml_declaration=True)
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
with ZipFile(root/'output/AI新能源设施建设场景方案v7.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 assert {n for n in src.namelist() if src.read(n)!=out.read(n)}=={'ppt/slides/slide10.xml','ppt/slides/slide11.xml'}
 for n in [10,11]:
  old=ET.fromstring(src.read(f'ppt/slides/slide{n}.xml'));new=ET.fromstring(out.read(f'ppt/slides/slide{n}.xml'))
  assert ET.tostring(old.find('{'+P+'}timing'))==ET.tostring(new.find('{'+P+'}timing'))
  assert [x.text for x in old.findall('.//{'+A+'}t')]==[x.text for x in new.findall('.//{'+A+'}t')]
 print('Moved three images upward; all text, media bytes, original image dimensions and animation timelines preserved.')
