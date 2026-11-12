from pathlib import Path
from copy import copy
from zipfile import ZipFile,ZIP_DEFLATED
import xml.etree.ElementTree as E,re,posixpath,hashlib
root=Path.cwd();b=root/'.ppt-build/merge-iot-20261105'
P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PK='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
for prefix,uri in [('p',P),('a',A),('r',R)]:E.register_namespace(prefix,uri)
def xml(o):return E.tostring(o,encoding='utf-8',xml_declaration=True)
def text(o):return ''.join(t.text or '' for t in o.findall('.//{'+A+'}t'))
def resolve(owner,t):return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(owner),t))
source=root/'output/AI新能源设施建设场景方案v14_内容整合.pptx'
with ZipFile(source) as src,ZipFile(b/'source-edited.pptx') as ed,ZipFile(root/'output/AI新能源设施建设场景方案v14.pptx') as iot:
 updates={};owner='ppt/slides/slide4.xml';node=E.fromstring(ed.read(owner));assert '逸视角 · 智能物联运行管理' in text(node)
 newrels=E.Element('{'+PK+'}Relationships');imagecount=0
 for rel in E.fromstring(ed.read('ppt/slides/_rels/slide4.xml.rels')):
  ty=rel.get('Type');old=resolve(owner,rel.get('Target'))
  if ty==R+'/image':
   imagecount+=1;data=ed.read(old)
   assert hashlib.sha256(data).digest()==hashlib.sha256(iot.read('ppt/media/iot-anonymized-v14.png')).digest()
   media='ppt/media/iot-interface-v15.png';updates[media]=data;target='../media/iot-interface-v15.png'
  elif ty==R+'/slideLayout':target='../slideLayouts/slideLayout1.xml'
  elif ty==R+'/notesSlide':
   updates['ppt/notesSlides/notesSlide21.xml']=ed.read(old);target='../notesSlides/notesSlide21.xml'
   nr=E.Element('{'+PK+'}Relationships')
   E.SubElement(nr,'{'+PK+'}Relationship',{'Id':'rId1','Type':R+'/slide','Target':'../slides/slide21.xml'})
   E.SubElement(nr,'{'+PK+'}Relationship',{'Id':'rId2','Type':R+'/notesMaster','Target':'../notesMasters/notesMaster1.xml'})
   E.register_namespace('',PK);updates['ppt/notesSlides/_rels/notesSlide21.xml.rels']=xml(nr)
  else:raise AssertionError(ty)
  E.SubElement(newrels,'{'+PK+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':target})
 assert imagecount==1
 updates['ppt/slides/slide21.xml']=xml(node);E.register_namespace('',PK);updates['ppt/slides/_rels/slide21.xml.rels']=xml(newrels)
 pres=E.fromstring(src.read('ppt/presentation.xml'));pr=E.fromstring(src.read('ppt/_rels/presentation.xml.rels'));ids=pres.find('{'+P+'}sldIdLst');assert len(ids)==20
 mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in pr};oldorder=[mp[i.get('{'+R+'}id')] for i in ids]
 rid='rIdIotMergedV15';assert rid not in mp
 new=E.Element('{'+P+'}sldId',{'id':str(max(int(i.get('id')) for i in ids)+1),'{'+R+'}id':rid});ids.insert(3,new)
 E.SubElement(pr,'{'+PK+'}Relationship',{'Id':rid,'Type':R+'/slide','Target':'slides/slide21.xml'})
 mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in pr};ordered=[mp[i.get('{'+R+'}id')] for i in ids]
 for page,part in enumerate(ordered,1):
  o=E.fromstring(updates[part] if part in updates else src.read(part));changed=False
  for sh in o.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*(20|21)\s*',text(sh)):
    ts=sh.findall('.//{'+A+'}t');ts[0].text=f'{page:02d} ／ 21'
    for t in ts[1:]:t.text=''
    changed=True
  if changed:updates[part]=xml(o)
 updates['ppt/presentation.xml']=xml(pres);updates['ppt/_rels/presentation.xml.rels']=xml(pr)
 ct=E.fromstring(src.read('[Content_Types].xml'))
 for part,ty in [('ppt/slides/slide21.xml','slide'),('ppt/notesSlides/notesSlide21.xml','notesSlide')]:E.SubElement(ct,'{'+CT+'}Override',{'PartName':'/'+part,'ContentType':'application/vnd.openxmlformats-officedocument.presentationml.'+ty+'+xml'})
 E.register_namespace('',CT);updates['[Content_Types].xml']=xml(ct)
 app=E.fromstring(src.read('docProps/app.xml'));app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides').text='21';updates['docProps/app.xml']=xml(app)
 with ZipFile(b/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
  for n,d in updates.items():out.writestr(n,d)
 with ZipFile(b/'candidate.pptx') as out:
  for part in oldorder:
   trees=[E.fromstring(z.read(part)) for z in [src,out]]
   for tree in trees:
    for sh in tree.findall('.//{'+P+'}sp'):
     if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*(20|21)\s*',text(sh)):
      for t in sh.findall('.//{'+A+'}t'):t.text=''
   assert xml(trees[0])==xml(trees[1]),part
  for n in src.namelist():
   if n.startswith('ppt/media/') or n.startswith('ppt/notesSlides/'):assert src.read(n)==out.read(n),n
  assert '我们的优势' in text(E.fromstring(out.read(ordered[4])))
  assert '标准任务贯通计划' in text(E.fromstring(out.read(ordered[11])))
  assert E.fromstring(out.read(ordered[3])).find('{'+P+'}timing') is None
 print('21 slides, IoT interface at page 4, advantages at page 5, first-four-step summary at page 12; prior content and redacted assets preserved.')
