from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from copy import copy,deepcopy
from io import BytesIO
import posixpath,re
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v9'
P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PKG='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
def xml(node):return ET.tostring(node,encoding='utf-8',xml_declaration=True)
def text(sp):return ''.join(x.text or '' for x in sp.findall('.//{'+A+'}t'))
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v8.pptx').read_bytes())) as src,ZipFile(build/'main-edited.pptx') as edited,ZipFile(build/'special-edited.pptx') as ref:
 updates={}
 # Keep original slide objects and all pre-existing animation timing; add only
 # the two new text objects on the safety/quality page.
 safety=ET.fromstring(src.read('ppt/slides/slide9.xml'));new=ET.fromstring(edited.read('ppt/slides/slide9.xml'));tree=safety.find('{'+P+'}cSld/{'+P+'}spTree')
 ids=[int(x.get('id')) for x in safety.findall('.//{'+P+'}cNvPr')];next_id=max(ids)+1
 for name in ['V9专项能力引入','V9专项能力作用']:
  shape=deepcopy(next(x for x in new.findall('.//{'+P+'}sp') if x.find('{'+P+'}nvSpPr/{'+P+'}cNvPr').get('name')==name));shape.find('{'+P+'}nvSpPr/{'+P+'}cNvPr').set('id',str(next_id));next_id+=1;tree.append(shape)
 updates['ppt/slides/slide9.xml']=xml(safety)
 # Update the displayed page number, not the agent numbering.
 for old_number in range(1,14):
  part=f'ppt/slides/slide{old_number}.xml';node=ET.fromstring(updates.get(part,src.read(part)));changed=False
  number=old_number if old_number<=9 else old_number+1
  for shape in node.findall('.//{'+P+'}sp'):
   content=text(shape)
   if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*13\s*',content):
    runs=shape.findall('.//{'+A+'}t');runs[0].text=f'{number:02d} ／ 14'
    for run in runs[1:]:run.text=''
    changed=True
  if changed or part in updates:updates[part]=xml(node)
 special=ET.fromstring(ref.read('ppt/slides/slide1.xml'));special_rels=ET.fromstring(ref.read('ppt/slides/_rels/slide1.xml.rels'));newrels=ET.Element('{'+PKG+'}Relationships');new_media=[]
 for rel in special_rels:
  ty=rel.get('Type')
  if ty==R+'/slideLayout':ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':'../slideLayouts/slideLayout1.xml'})
  elif ty==R+'/image':
   target=rel.get('Target');source_part=target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join('ppt/slides',target));ext=Path(source_part).suffix
   media=f'ppt/media/construction-change-v9-{len(new_media)+1}{ext}';assert media not in src.namelist();updates[media]=ref.read(source_part);new_media.append(media)
   ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':'../media/'+Path(media).name})
  elif ty==R+'/notesSlide':pass
  else:raise AssertionError(ty)
 updates['ppt/slides/slide14.xml']=xml(special)
 ET.register_namespace('',PKG);updates['ppt/slides/_rels/slide14.xml.rels']=xml(newrels)
 # Insert the physical slide14 immediately after current slide9 in show order.
 pres=ET.fromstring(src.read('ppt/presentation.xml'));slide_ids=pres.find('{'+P+'}sldIdLst');assert len(slide_ids)==13
 pres_rels=ET.fromstring(src.read('ppt/_rels/presentation.xml.rels'));rid='rIdConstructionChangeV9';assert all(x.get('Id')!=rid for x in pres_rels)
 ET.SubElement(pres_rels,'{'+PKG+'}Relationship',{'Id':rid,'Type':R+'/slide','Target':'slides/slide14.xml'})
 slide_ids.insert(9,ET.Element('{'+P+'}sldId',{'id':str(max(int(x.get('id')) for x in slide_ids)+1),'{'+R+'}id':rid}))
 updates['ppt/presentation.xml']=xml(pres);updates['ppt/_rels/presentation.xml.rels']=xml(pres_rels)
 # Register the new slide and any media content types not already present.
 ct=ET.fromstring(src.read('[Content_Types].xml'));ref_ct=ET.fromstring(ref.read('[Content_Types].xml'))
 ET.SubElement(ct,'{'+CT+'}Override',{'PartName':'/ppt/slides/slide14.xml','ContentType':'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'})
 for media in new_media:
  extension=Path(media).suffix.lstrip('.')
  if not any(x.get('Extension')==extension for x in ct):
   typ=next(x.get('ContentType') for x in ref_ct if x.get('Extension')==extension);ET.SubElement(ct,'{'+CT+'}Default',{'Extension':extension,'ContentType':typ})
 ET.register_namespace('',CT);updates['[Content_Types].xml']=xml(ct)
 app=ET.fromstring(src.read('docProps/app.xml'));slides=app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides')
 if slides is not None:slides.text='14';updates['docProps/app.xml']=xml(app)
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
  for name,data in updates.items():out.writestr(name,data)
with ZipFile(root/'output/AI新能源设施建设场景方案v8.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 for n in [10,11]:
  old=ET.fromstring(src.read(f'ppt/slides/slide{n}.xml'));new=ET.fromstring(out.read(f'ppt/slides/slide{n}.xml'))
  assert ET.tostring(old.find('{'+P+'}timing'))==ET.tostring(new.find('{'+P+'}timing'))
 for name in src.namelist():
  if name.startswith('ppt/media/'):assert src.read(name)==out.read(name)
 assert len(ET.fromstring(out.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst'))==14
 assert '智能体' not in text(ET.fromstring(out.read('ppt/slides/slide14.xml')))
 print('Inserted specialist capability as page 10 of 14. Added sub-agent callout, updated page numbers, and preserved all existing media and animation timelines.')
