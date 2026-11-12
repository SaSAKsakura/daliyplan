from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from copy import copy
import posixpath,re,hashlib,json
root=Path(__file__).resolve().parent.parent;build=root/'.ppt-build/merge-20261105-1745'
P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PKG='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
def xml(node):return ET.tostring(node,encoding='utf-8',xml_declaration=True)
def text(node):return ''.join(x.text or '' for x in node.findall('.//{'+A+'}t'))
def resolve(rel,owner):
 t=rel.get('Target');return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(owner),t))
def digest(b):return hashlib.sha256(b).hexdigest()
with ZipFile(root/'output/AI新能源设施建设场景方案v13.pptx') as src:
 updates={};pres=ET.fromstring(src.read('ppt/presentation.xml'));ids=pres.find('{'+P+'}sldIdLst');rels=ET.fromstring(src.read('ppt/_rels/presentation.xml.rels'))
 assert len(ids)==18
 mapping={r.get('Id'):resolve(r,'ppt/presentation.xml') for r in rels};oldorder=[mapping[s.get('{'+R+'}id')] for s in ids]
 next_id=max(int(x.get('id')) for x in ids)+1;insertions={};style=ET.fromstring(src.read('ppt/tableStyles.xml'));style_ids={s.get('styleId') for s in style}
 for index,(label,physical) in enumerate([('advantages',19),('foundation',20)]):
  with ZipFile(build/f'{label}-edited.pptx') as ed:
   part=f'ppt/slides/slide{physical}.xml';node=ET.fromstring(ed.read('ppt/slides/slide1.xml'));assert node.find('{'+P+'}timing') is None
   updates[part]=xml(node);newrels=ET.Element('{'+PKG+'}Relationships')
   for rel in ET.fromstring(ed.read('ppt/slides/_rels/slide1.xml.rels')):
    ty=rel.get('Type')
    if ty==R+'/slideLayout':target='../slideLayouts/slideLayout1.xml'
    elif ty==R+'/image':
     oldmedia=resolve(rel,'ppt/slides/slide1.xml');media=f'ppt/media/v14-{label}-{posixpath.basename(oldmedia)}';updates[media]=ed.read(oldmedia);target='../media/'+posixpath.basename(media)
    elif ty==R+'/notesSlide':
     oldnote=resolve(rel,'ppt/slides/slide1.xml');notepart=f'ppt/notesSlides/notesSlide{physical}.xml'
     updates[notepart]=ed.read(oldnote)
     nrels=ET.Element('{'+PKG+'}Relationships')
     ET.SubElement(nrels,'{'+PKG+'}Relationship',{'Id':'rIdSlide','Type':R+'/slide','Target':f'../slides/slide{physical}.xml'})
     ET.SubElement(nrels,'{'+PKG+'}Relationship',{'Id':'rIdMaster','Type':R+'/notesMaster','Target':'../notesMasters/notesMaster1.xml'})
     updates[f'ppt/notesSlides/_rels/notesSlide{physical}.xml.rels']=xml(nrels)
     target=f'../notesSlides/notesSlide{physical}.xml'
    else:raise AssertionError(ty)
    ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':target})
   ET.register_namespace('',PKG);updates[f'ppt/slides/_rels/slide{physical}.xml.rels']=xml(newrels)
   for s in ET.fromstring(ed.read('ppt/tableStyles.xml')):
    if s.get('styleId') not in style_ids:style.append(s);style_ids.add(s.get('styleId'))
   rid=f'rIdMergedV14_{physical}';assert rid not in mapping
   ET.SubElement(rels,'{'+PKG+'}Relationship',{'Id':rid,'Type':R+'/slide','Target':f'slides/slide{physical}.xml'})
   insertions[physical]=ET.Element('{'+P+'}sldId',{'id':str(next_id+index),'{'+R+'}id':rid})
 ordered=[]
 for oldindex,sid in enumerate(ids,1):
  ordered.append(sid)
  if oldindex==3:ordered.append(insertions[19])
  if oldindex==9:ordered.append(insertions[20])
 ids[:]=ordered;assert len(ids)==20
 mapping={r.get('Id'):resolve(r,'ppt/presentation.xml') for r in rels};neworder=[mapping[s.get('{'+R+'}id')] for s in ids]
 for page,part in enumerate(neworder,1):
  node=ET.fromstring(updates[part] if part in updates else src.read(part));changed=False
  for shape in node.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*(18|20)\s*',text(shape)):
    runs=shape.findall('.//{'+A+'}t');runs[0].text=f'{page:02d} ／ 20'
    for run in runs[1:]:run.text=''
    changed=True
  if changed:updates[part]=xml(node)
 updates['ppt/presentation.xml']=xml(pres);updates['ppt/_rels/presentation.xml.rels']=xml(rels)
 if xml(style)!=xml(ET.fromstring(src.read('ppt/tableStyles.xml'))):updates['ppt/tableStyles.xml']=xml(style)
 ct=ET.fromstring(src.read('[Content_Types].xml'))
 for physical in [19,20]:ET.SubElement(ct,'{'+CT+'}Override',{'PartName':f'/ppt/slides/slide{physical}.xml','ContentType':'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'})
 for physical in [19,20]:ET.SubElement(ct,'{'+CT+'}Override',{'PartName':f'/ppt/notesSlides/notesSlide{physical}.xml','ContentType':'application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml'})
 ET.register_namespace('',CT);updates['[Content_Types].xml']=xml(ct)
 app=ET.fromstring(src.read('docProps/app.xml'));app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides').text='20';updates['docProps/app.xml']=xml(app)
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
  for n,d in updates.items():out.writestr(n,d)
with ZipFile(root/'output/AI新能源设施建设场景方案v13.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 for name in src.namelist():
  if name.startswith('ppt/media/'):assert src.read(name)==out.read(name)
 for name in oldorder:
  old=ET.fromstring(src.read(name));new=ET.fromstring(out.read(name))
  for node in [old,new]:
   for shape in node.findall('.//{'+P+'}sp'):
    if re.fullmatch(r'\d{2} ／ (18|20)',text(shape)):
     runs=shape.findall('.//{'+A+'}t');runs[0].text='FOOTER'
     for run in runs[1:]:run.text=''
  assert xml(old)==xml(new),name
 assert text(ET.fromstring(out.read(neworder[3]))).find('我们的优势')>=0
 assert text(ET.fromstring(out.read(neworder[10]))).find('标准任务贯通计划')>=0
 assert len(ET.fromstring(out.read(neworder[10])).findall('.//{'+A+'}tbl'))==2
 assert len(ET.fromstring(out.read(neworder[10])).findall('.//{'+P+'}pic'))==4
 assert '______' not in text(ET.fromstring(out.read(neworder[3])))
 titles=[]
 for page,part in enumerate(neworder,1):
  node=ET.fromstring(out.read(part));alltext=text(node)
  if page not in [1,20]:assert f'{page:02d} ／ 20' in alltext
  if page in range(11,19):assert node.find('{'+P+'}timing') is None
  titles.append({'page':page,'part':part,'text':alltext[:130]})
 (build/'slide-order.json').write_text(json.dumps(titles,ensure_ascii=False,indent=2),encoding='utf-8')
 print('Merged two pages into a 20-slide narrative; existing pages and images unchanged except numbered footers; four interface images and both native tables preserved.')
