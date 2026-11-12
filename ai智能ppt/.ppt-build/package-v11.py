from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from copy import copy,deepcopy
from io import BytesIO
import hashlib,re,posixpath
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v11'
P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PKG='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
def xml(node):return ET.tostring(node,encoding='utf-8',xml_declaration=True)
def shape_text(node):return ''.join(x.text or '' for x in node.findall('.//{'+A+'}t'))
def part_target(rel,owner):
 t=rel.get('Target');return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(owner),t))
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v10.pptx').read_bytes())) as src,ZipFile(build/'main-edited.pptx') as ed,ZipFile(build/'rollcall-edited.pptx') as roll:
 updates={}
 safety=ET.fromstring(src.read('ppt/slides/slide9.xml'));edited=ET.fromstring(ed.read('ppt/slides/slide9.xml'))
 for name in ['V9专项能力引入','V9专项能力作用']:
  def named(tree):return next(s for s in tree.findall('.//{'+P+'}sp') if s.find('{'+P+'}nvSpPr/{'+P+'}cNvPr').get('name')==name)
  old=named(safety);new=named(edited);tx=old.find('{'+P+'}txBody');idx=list(old).index(tx);old.remove(tx);old.insert(idx,deepcopy(new.find('{'+P+'}txBody')))
 updates['ppt/slides/slide9.xml']=xml(safety)
 # The construction page is logical page 10 in v10, physical slide14.
 change=ET.fromstring(ed.read('ppt/slides/slide10.xml'));change_rels=ET.fromstring(ed.read('ppt/slides/_rels/slide10.xml.rels'));old_rels=ET.fromstring(src.read('ppt/slides/_rels/slide14.xml.rels'))
 original_picture=next(r for r in old_rels if r.get('Type')==R+'/image');old_media=part_target(original_picture,'ppt/slides/slide14.xml')
 newrels=ET.Element('{'+PKG+'}Relationships')
 for rel in change_rels:
  ty=rel.get('Type')
  if ty==R+'/image':
   new_media=part_target(rel,'ppt/slides/slide10.xml');assert hashlib.sha256(ed.read(new_media)).digest()==hashlib.sha256(src.read(old_media)).digest()
   ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':'../media/'+Path(old_media).name})
  elif ty==R+'/slideLayout':ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':'../slideLayouts/slideLayout1.xml'})
  elif ty!=R+'/notesSlide':raise AssertionError(ty)
 updates['ppt/slides/slide14.xml']=xml(change);ET.register_namespace('',PKG);updates['ppt/slides/_rels/slide14.xml.rels']=xml(newrels)
 # New roll-call page uses only the anonymized asset, never the source slide image.
 station=ET.fromstring(roll.read('ppt/slides/slide1.xml'));station_rels=ET.fromstring(roll.read('ppt/slides/_rels/slide1.xml.rels'));newrels=ET.Element('{'+PKG+'}Relationships')
 for rel in station_rels:
  ty=rel.get('Type')
  if ty==R+'/image':
   data=roll.read(part_target(rel,'ppt/slides/slide1.xml'));assert hashlib.sha256(data).digest()==hashlib.sha256((root/'output/素材/站班会识别示例_人员匿名.png').read_bytes()).digest()
   media='ppt/media/rollcall-anonymized-v11.png';assert media not in src.namelist();updates[media]=data
   ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':'../media/rollcall-anonymized-v11.png'})
  elif ty==R+'/slideLayout':ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':'../slideLayouts/slideLayout1.xml'})
  elif ty!=R+'/notesSlide':raise AssertionError(ty)
 updates['ppt/slides/slide15.xml']=xml(station);updates['ppt/slides/_rels/slide15.xml.rels']=xml(newrels)
 pres=ET.fromstring(src.read('ppt/presentation.xml'));ids=pres.find('{'+P+'}sldIdLst');pres_rels=ET.fromstring(src.read('ppt/_rels/presentation.xml.rels'));rid='rIdRollcallV11'
 assert len(ids)==14;assert all(r.get('Id')!=rid for r in pres_rels)
 ET.SubElement(pres_rels,'{'+PKG+'}Relationship',{'Id':rid,'Type':R+'/slide','Target':'slides/slide15.xml'})
 ids.insert(9,ET.Element('{'+P+'}sldId',{'id':str(max(int(x.get('id')) for x in ids)+1),'{'+R+'}id':rid}))
 updates['ppt/presentation.xml']=xml(pres);updates['ppt/_rels/presentation.xml.rels']=xml(pres_rels)
 # Follow actual presentation order for every visible footer.
 relation_map={r.get('Id'):part_target(r,'ppt/presentation.xml') for r in pres_rels if r.get('Type')==R+'/slide'}
 for page,sid in enumerate(ids,1):
  part=relation_map[sid.get('{'+R+'}id')];node=ET.fromstring(updates.get(part,src.read(part) if part in src.namelist() else b''));changed=False
  for shape in node.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*(14|15)\s*',shape_text(shape)):
    runs=shape.findall('.//{'+A+'}t');runs[0].text=f'{page:02d} ／ 15'
    for run in runs[1:]:run.text=''
    changed=True
  if changed or part in updates:updates[part]=xml(node)
 ct=ET.fromstring(src.read('[Content_Types].xml'));ET.SubElement(ct,'{'+CT+'}Override',{'PartName':'/ppt/slides/slide15.xml','ContentType':'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'})
 ET.register_namespace('',CT);updates['[Content_Types].xml']=xml(ct)
 app=ET.fromstring(src.read('docProps/app.xml'));count=app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides');count.text='15';updates['docProps/app.xml']=xml(app)
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
  for name,data in updates.items():out.writestr(name,data)
with ZipFile(root/'output/AI新能源设施建设场景方案v10.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 for n in [10,11]:
  old=ET.fromstring(src.read(f'ppt/slides/slide{n}.xml'));new=ET.fromstring(out.read(f'ppt/slides/slide{n}.xml'))
  assert new.find('{'+P+'}timing') is None
  for node in new.findall('.//{'+P+'}sp'):
   txt=shape_text(node)
   if re.fullmatch(r'\d{2} ／ 15',txt):
    # Ignore footer text when proving static page bodies stayed the same.
    runs=node.findall('.//{'+A+'}t');runs[0].text='FOOTER'
  for node in old.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\d{2} ／ 14',shape_text(node)):node.findall('.//{'+A+'}t')[0].text='FOOTER'
  assert ET.tostring(old)==ET.tostring(new)
 for media in [n for n in src.namelist() if n.startswith('ppt/media/')]:assert src.read(media)==out.read(media)
 print('15-page main deck prepared; original diagram bytes preserved; only anonymous roll-call screenshot embedded; agent 05 and 06 remain static.')
