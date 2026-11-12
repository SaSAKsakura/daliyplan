from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from copy import copy
from io import BytesIO
import re,posixpath,hashlib
root=Path(__file__).resolve().parent.parent;build=root/'.ppt-build/v12'
P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PKG='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
def xml(node):return ET.tostring(node,encoding='utf-8',xml_declaration=True)
def content(node):return ''.join(x.text or '' for x in node.findall('.//{'+A+'}t'))
def resolve(rel,owner):
 t=rel.get('Target');return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(owner),t))
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v11.pptx').read_bytes())) as src,ZipFile(build/'main-edited.pptx') as ed,ZipFile(build/'interface-pages.pptx') as ui:
 updates={'ppt/slides/slide10.xml':ed.read('ppt/slides/slide12.xml')}
 team=ET.fromstring(updates['ppt/slides/slide10.xml']);assert not team.findall('.//{'+P+'}pic');assert team.find('{'+P+'}timing') is None
 assert not any(k.startswith('{'+R+'}') for el in team.iter() for k in el.attrib)
 assets=[root/'output/企业画像页面_脱敏版v2.png',root/'.ppt-build/v6/example-1.png',root/'.ppt-build/v6/example-2.png']
 for logical,physical in enumerate([16,17,18],1):
  owner=f'ppt/slides/slide{logical}.xml';node=ET.fromstring(ui.read(owner));relations=ET.fromstring(ui.read(f'ppt/slides/_rels/slide{logical}.xml.rels'));newrels=ET.Element('{'+PKG+'}Relationships');image_count=0
  for rel in relations:
   ty=rel.get('Type')
   if ty==R+'/image':
    image_count+=1;data=ui.read(resolve(rel,owner));assert hashlib.sha256(data).digest()==hashlib.sha256(assets[logical-1].read_bytes()).digest()
    media=f'ppt/media/system-interface-v12-{logical}.png';assert media not in src.namelist();updates[media]=data
    ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':'../media/'+Path(media).name})
   elif ty==R+'/slideLayout':ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':'../slideLayouts/slideLayout1.xml'})
   elif ty!=R+'/notesSlide':raise AssertionError(ty)
  assert image_count==1;assert node.find('{'+P+'}timing') is None
  updates[f'ppt/slides/slide{physical}.xml']=xml(node);ET.register_namespace('',PKG);updates[f'ppt/slides/_rels/slide{physical}.xml.rels']=xml(newrels)
 pres=ET.fromstring(src.read('ppt/presentation.xml'));ids=pres.find('{'+P+'}sldIdLst');assert len(ids)==15
 rels=ET.fromstring(src.read('ppt/_rels/presentation.xml.rels'));old_map={r.get('Id'):resolve(r,'ppt/presentation.xml') for r in rels if r.get('Type')==R+'/slide'}
 next_id=max(int(x.get('id')) for x in ids)+1;insertions={}
 for i,physical in enumerate([16,17,18]):
  rid=f'rIdInterfaceV12_{i+1}';assert all(r.get('Id')!=rid for r in rels)
  ET.SubElement(rels,'{'+PKG+'}Relationship',{'Id':rid,'Type':R+'/slide','Target':f'slides/slide{physical}.xml'})
  insertions[physical]=ET.Element('{'+P+'}sldId',{'id':str(next_id+i),'{'+R+'}id':rid})
 ordered=[]
 for sid in list(ids):
  ordered.append(sid);owner=old_map[sid.get('{'+R+'}id')]
  if owner=='ppt/slides/slide10.xml':ordered.append(insertions[16])
  if owner=='ppt/slides/slide11.xml':ordered.extend([insertions[17],insertions[18]])
 ids[:]=ordered;assert len(ids)==18
 updates['ppt/presentation.xml']=xml(pres);updates['ppt/_rels/presentation.xml.rels']=xml(rels)
 relation_map={r.get('Id'):resolve(r,'ppt/presentation.xml') for r in rels if r.get('Type')==R+'/slide'}
 for page,sid in enumerate(ids,1):
  part=relation_map[sid.get('{'+R+'}id')];node=ET.fromstring(updates.get(part,src.read(part) if part in src.namelist() else b''));changed=False
  for sp in node.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*(15|18)\s*',content(sp)):
    runs=sp.findall('.//{'+A+'}t');runs[0].text=f'{page:02d} ／ 18'
    for run in runs[1:]:run.text=''
    changed=True
  if changed or part in updates:updates[part]=xml(node)
 ct=ET.fromstring(src.read('[Content_Types].xml'))
 for physical in [16,17,18]:ET.SubElement(ct,'{'+CT+'}Override',{'PartName':f'/ppt/slides/slide{physical}.xml','ContentType':'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'})
 ET.register_namespace('',CT);updates['[Content_Types].xml']=xml(ct)
 app=ET.fromstring(src.read('docProps/app.xml'));app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides').text='18';updates['docProps/app.xml']=xml(app)
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
  for name,data in updates.items():out.writestr(name,data)
with ZipFile(root/'output/AI新能源设施建设场景方案v11.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 for n in [10,11,16,17,18]:assert ET.fromstring(out.read(f'ppt/slides/slide{n}.xml')).find('{'+P+'}timing') is None
 for name in src.namelist():
  if name.startswith('ppt/media/'):assert src.read(name)==out.read(name)
 # Every existing page except the optimized agent 05 is unchanged apart from its footer.
 for n in list(range(1,10))+list(range(11,16)):
  name=f'ppt/slides/slide{n}.xml';old=ET.fromstring(src.read(name));new=ET.fromstring(out.read(name))
  for tree,total in [(old,15),(new,18)]:
   for sp in tree.findall('.//{'+P+'}sp'):
    if re.fullmatch(r'\d{2} ／ '+str(total),content(sp)):
     runs=sp.findall('.//{'+A+'}t');runs[0].text='FOOTER'
     for run in runs[1:]:run.text=''
  assert ET.tostring(old)==ET.tostring(new),name
 print('18-page deck assembled in the requested order; static pages and original screenshot bytes verified.')
