from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,re,json
root=Path('.ppt-build/safety-v24');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PK='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def rp(n):return posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'
def resolve(o,t):return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(o),t))
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
def text(n):return ''.join(t.text or '' for t in n.findall('.//{'+A+'}t'))
with ZipFile('output/AI新能源设施建设场景方案v23_智能体合并调整版.pptx') as src,ZipFile(root/'single-candidate.pptx') as au:
 data={n:src.read(n) for n in src.namelist()};pages=order(src);assert len(pages)==16;assert '安全质量检查' in text(E.fromstring(data[pages[9]]))
 ap=order(au)[0];num=max(int(re.search(r'slide(\d+)\.xml$',n).group(1)) for n in data if re.fullmatch(r'ppt/slides/slide\d+\.xml',n))+1;dst=f'ppt/slides/slide{num}.xml';note_num=max([0]+[int(re.search(r'notesSlide(\d+)\.xml$',n).group(1)) for n in data if re.fullmatch(r'ppt/notesSlides/notesSlide\d+\.xml',n)])+1
 data[dst]=au.read(ap);rr=E.Element('{'+PK+'}Relationships',nsmap={None:PK});ct=E.fromstring(data['[Content_Types].xml'])
 for rel in E.fromstring(au.read(rp(ap))):
  r=deepcopy(rel);kind=r.get('Type')
  if kind==R+'/image':
   imagepart=resolve(ap,r.get('Target'));new='ppt/media/safety-v24-workbench.png';data[new]=au.read(imagepart);r.set('Target','../media/safety-v24-workbench.png')
  elif kind==R+'/slideLayout':r.set('Target','../slideLayouts/slideLayout1.xml')
  elif kind==R+'/notesSlide':
   np=f'ppt/notesSlides/notesSlide{note_num}.xml';data[np]=au.read(resolve(ap,r.get('Target')));r.set('Target',f'../notesSlides/notesSlide{note_num}.xml');nr=E.Element('{'+PK+'}Relationships',nsmap={None:PK});E.SubElement(nr,'{'+PK+'}Relationship',Id='rIdSlide',Type=R+'/slide',Target=f'../slides/slide{num}.xml');E.SubElement(nr,'{'+PK+'}Relationship',Id='rIdMaster',Type=R+'/notesMaster',Target='../notesMasters/notesMaster1.xml');data[rp(np)]=xml(nr);E.SubElement(ct,'{'+CT+'}Override',PartName='/'+np,ContentType='application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml')
  else:raise ValueError(kind)
  rr.append(r)
 data[rp(dst)]=xml(rr);E.SubElement(ct,'{'+CT+'}Override',PartName='/'+dst,ContentType='application/vnd.openxmlformats-officedocument.presentationml.slide+xml');data['[Content_Types].xml']=xml(ct)
 pres=E.fromstring(data['ppt/presentation.xml']);ids=pres.find('{'+P+'}sldIdLst');rid='rIdSafetyWorkbenchV24';ids.insert(10,E.Element('{'+P+'}sldId',id=str(max(int(x.get('id')) for x in ids)+1),attrib={'{'+R+'}id':rid}));rels=E.fromstring(data['ppt/_rels/presentation.xml.rels']);E.SubElement(rels,'{'+PK+'}Relationship',Id=rid,Type=R+'/slide',Target=f'slides/slide{num}.xml');data['ppt/presentation.xml']=xml(pres);data['ppt/_rels/presentation.xml.rels']=xml(rels)
 newpages=pages[:10]+[dst]+pages[10:]
 for i,part in enumerate(newpages,1):
  node=E.fromstring(data[part]);changed=False
  for sh in node.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\d+ ／ \d+',text(sh)):
    ts=sh.findall('.//{'+A+'}t');ts[0].text=f'{i:02d} ／ 17'
    for t in ts[1:]:t.text=''
    changed=True
  if changed:data[part]=xml(node)
 if 'docProps/app.xml' in data:
  app=E.fromstring(data['docProps/app.xml']);n=app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides')
  if n is not None:n.text='17'
  data['docProps/app.xml']=xml(app)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 def stripfooter(b):
  s=E.fromstring(b)
  for sh in s.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\d+ ／ \d+',text(sh)):
    ts=sh.findall('.//{'+A+'}t');ts[0].text='PAGE'
    for t in ts[1:]:t.text=''
  return E.tostring(s)
 for part in pages:assert stripfooter(data[part])==stripfooter(src.read(part))
 assert len(newpages)==17;assert 'AI 安全检查工作台' in text(E.fromstring(data[newpages[10]]));assert '分包队伍' in text(E.fromstring(data[newpages[11]]))
 (root/'package-checks.json').write_text(json.dumps({'slideCount':17,'newSlide':11,'agent':'03 安全质量检查','existingSlidesPreserved':True,'mainlinePreserved':True},ensure_ascii=False,indent=2),'utf8');print('Inserted safety implementation after introduction at page 11. Total 17 pages.')
