from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
import json
root=Path('.ppt-build/notes-v25');P='http://schemas.openxmlformats.org/presentationml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';EP='http://schemas.openxmlformats.org/officeDocument/2006/extended-properties'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
reports=[]
for source,stem in [('output/AI新能源设施建设场景方案v24_安全检查实现版.pptx','full'),('output/安全检查_AI工作台_单页.pptx','single')]:
 with ZipFile(source) as src:
  data={n:src.read(n) for n in src.namelist()};removed=[n for n in data if n.startswith(('ppt/notesSlides/','ppt/notesMasters/'))]
  for n in removed:data.pop(n)
  for n in list(data):
   if n.endswith('.rels'):
    rels=E.fromstring(data[n]);changed=False
    for rel in list(rels):
     if rel.get('Type') in [R+'/notesSlide',R+'/notesMaster'] or 'notesSlides/' in rel.get('Target','') or 'notesMasters/' in rel.get('Target',''):rels.remove(rel);changed=True
    if changed:data[n]=xml(rels)
  pres=E.fromstring(data['ppt/presentation.xml']);count=len(pres.find('{'+P+'}sldIdLst'))
  for n in list(pres):
   if n.tag=='{'+P+'}notesMasterIdLst':pres.remove(n)
  data['ppt/presentation.xml']=xml(pres)
  ct=E.fromstring(data['[Content_Types].xml'])
  for n in list(ct):
   if n.get('PartName','').startswith(('/ppt/notesSlides/','/ppt/notesMasters/')):ct.remove(n)
  data['[Content_Types].xml']=xml(ct)
  if 'docProps/app.xml' in data:
   app=E.fromstring(data['docProps/app.xml']);notes=app.find('{'+EP+'}Notes')
   if notes is not None:notes.text='0'
   data['docProps/app.xml']=xml(app)
  for n in src.namelist():
   if n.startswith(('ppt/slides/slide','ppt/media/')) and not n.endswith('.rels'):assert data[n]==src.read(n),n
  assert not any('notesSlides/' in n or 'notesMasters/' in n for n in data)
  for n,b in data.items():
   if n.endswith('.rels'):assert not any(r.get('Type') in [R+'/notesSlide',R+'/notesMaster'] for r in E.fromstring(b))
  with ZipFile(root/f'{stem}-candidate.pptx','w',ZIP_DEFLATED) as out:
   for n,b in data.items():out.writestr(n,b)
  reports.append({'source':source,'stem':stem,'slideCount':count,'removedNotesParts':len(removed),'slideAndMediaBytesUnchanged':True})
(root/'checks.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2),'utf8');print('Removed all speaker notes; slide content and media unchanged.');print([(r['stem'],r['slideCount'],r['removedNotesParts']) for r in reports])
