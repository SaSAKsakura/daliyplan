from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,re,json
root=Path('.ppt-build/wbs-v26');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PK='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def rp(n):return posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'
def resolve(o,t):return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(o),t))
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
def text(n):return ''.join(t.text or '' for t in n.findall('.//{'+A+'}t'))
def stripnotes(data):
 for n in list(data):
  if n.startswith(('ppt/notesSlides/','ppt/notesMasters/')):data.pop(n)
 for n in list(data):
  if n.endswith('.rels'):
   rs=E.fromstring(data[n]);changed=False
   for r in list(rs):
    if r.get('Type') in [R+'/notesSlide',R+'/notesMaster']:rs.remove(r);changed=True
   if changed:data[n]=xml(rs)
 pr=E.fromstring(data['ppt/presentation.xml'])
 for n in list(pr):
  if n.tag=='{'+P+'}notesMasterIdLst':pr.remove(n)
 data['ppt/presentation.xml']=xml(pr);ct=E.fromstring(data['[Content_Types].xml'])
 for n in list(ct):
  if n.get('PartName','').startswith(('/ppt/notesSlides/','/ppt/notesMasters/')):ct.remove(n)
 data['[Content_Types].xml']=xml(ct)
 if 'docProps/app.xml' in data:
  app=E.fromstring(data['docProps/app.xml']);n=app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Notes')
  if n is not None:n.text='0'
  data['docProps/app.xml']=xml(app)
 return data
with ZipFile(root/'single-candidate.pptx') as single:
 data=stripnotes({n:single.read(n) for n in single.namelist()})
 with ZipFile(root/'single-clean.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
with ZipFile('output/AI新能源设施建设场景方案v25_无备注版.pptx') as src,ZipFile(root/'single-clean.pptx') as au:
 data={n:src.read(n) for n in src.namelist()};pages=order(src);assert len(pages)==17;assert '标准分部分项与计划编排' in text(E.fromstring(data[pages[5]]));assert 'AI 计划编排工作台' in text(E.fromstring(data[pages[6]]))
 ap=order(au)[0];num=max(int(re.search(r'slide(\d+)\.xml$',n).group(1)) for n in data if re.fullmatch(r'ppt/slides/slide\d+\.xml',n))+1;dst=f'ppt/slides/slide{num}.xml';data[dst]=au.read(ap);rr=E.Element('{'+PK+'}Relationships',nsmap={None:PK});ct=E.fromstring(data['[Content_Types].xml'])
 for rel in E.fromstring(au.read(rp(ap))):
  r=deepcopy(rel);kind=r.get('Type')
  if kind==R+'/image':
   new='ppt/media/wbs-v26-workbench.png';data[new]=au.read(resolve(ap,r.get('Target')));r.set('Target','../media/wbs-v26-workbench.png')
  elif kind==R+'/slideLayout':r.set('Target','../slideLayouts/slideLayout1.xml')
  else:raise ValueError(kind)
  rr.append(r)
 data[rp(dst)]=xml(rr);E.SubElement(ct,'{'+CT+'}Override',PartName='/'+dst,ContentType='application/vnd.openxmlformats-officedocument.presentationml.slide+xml');data['[Content_Types].xml']=xml(ct)
 pres=E.fromstring(data['ppt/presentation.xml']);ids=pres.find('{'+P+'}sldIdLst');rid='rIdWbsWorkbenchV26';ids.insert(6,E.Element('{'+P+'}sldId',id=str(max(int(x.get('id')) for x in ids)+1),attrib={'{'+R+'}id':rid}));rels=E.fromstring(data['ppt/_rels/presentation.xml.rels']);E.SubElement(rels,'{'+PK+'}Relationship',Id=rid,Type=R+'/slide',Target=f'slides/slide{num}.xml');data['ppt/presentation.xml']=xml(pres);data['ppt/_rels/presentation.xml.rels']=xml(rels)
 newpages=pages[:6]+[dst]+pages[6:]
 for i,part in enumerate(newpages,1):
  node=E.fromstring(data[part]);changed=False
  for sh in node.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\d+ ／ \d+',text(sh)):
    ts=sh.findall('.//{'+A+'}t');ts[0].text=f'{i:02d} ／ 18'
    for t in ts[1:]:t.text=''
    changed=True
  if changed:data[part]=xml(node)
 if 'docProps/app.xml' in data:
  app=E.fromstring(data['docProps/app.xml']);n=app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides')
  if n is not None:n.text='18'
  data['docProps/app.xml']=xml(app)
 data=stripnotes(data)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 def stripfooter(b):
  node=E.fromstring(b)
  for sh in node.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\d+ ／ \d+',text(sh)):
    ts=sh.findall('.//{'+A+'}t');ts[0].text='PAGE'
    for t in ts[1:]:t.text=''
  return E.tostring(node)
 for n in pages:assert stripfooter(data[n])==stripfooter(src.read(n))
 assert not any(n.startswith(('ppt/notesSlides/','ppt/notesMasters/')) for n in data)
 (root/'checks.json').write_text(json.dumps({'slideCount':18,'newSlide':7,'nextSlide':'AI 计划编排工作台','originalSlidesPreserved':True,'mainlinePreserved':True,'speakerNotesRemoved':True},ensure_ascii=False,indent=2),'utf8');print('Inserted WBS implementation at page 7; 18 slides; no speaker notes.')
