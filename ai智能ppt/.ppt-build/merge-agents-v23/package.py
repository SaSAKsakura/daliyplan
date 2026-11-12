from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,re,json,hashlib
root=Path('.ppt-build/merge-agents-v23');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def rp(n):return posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'
def resolve(o,t):return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(o),t))
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
def text(n):return ''.join(t.text or '' for t in n.findall('.//{'+A+'}t'))
def settext(sh,new):
 ts=sh.findall('.//{'+A+'}t');ts[0].text=new
 for t in ts[1:]:t.text=''
with ZipFile('output/AI新能源设施建设场景方案v22_标题调整版.pptx') as src,ZipFile(root/'merged.pptx') as au:
 data={n:src.read(n) for n in src.namelist()};pages=order(src);assert len(pages)==18
 ap=order(au)[0];dst=pages[5];data[dst]=au.read(ap);ars=E.fromstring(au.read(rp(ap)));oldrs=E.fromstring(src.read(rp(dst)))
 for rel in list(ars):
  kind=rel.get('Type');old=next((r for r in oldrs if r.get('Type')==kind),None)
  if old is None:
   assert kind.endswith('/notesSlide');ars.remove(rel);continue
  if kind.endswith('/notesSlide'):data[resolve(dst,old.get('Target'))]=au.read(resolve(ap,rel.get('Target')))
  rel.set('Target',old.get('Target'))
 data[rp(dst)]=xml(ars)
 oldsequence=[1,2,3,4,5,6,8,9,10,11,13,12,15,16,17,18]
 agentmap={6:'01',8:'01',9:'02',10:'02',11:'03',12:'04',13:'04',15:'05',16:'05'}
 pres=E.fromstring(data['ppt/presentation.xml']);ids=pres.find('{'+P+'}sldIdLst');oldids=list(ids);dropids={oldids[i-1].get('{'+R+'}id') for i in [7,14]};ids[:]=[oldids[i-1] for i in oldsequence];data['ppt/presentation.xml']=xml(pres)
 rs=E.fromstring(data['ppt/_rels/presentation.xml.rels'])
 for rel in list(rs):
  if rel.get('Id') in dropids:rs.remove(rel)
 data['ppt/_rels/presentation.xml.rels']=xml(rs)
 ct=E.fromstring(data['[Content_Types].xml'])
 for i in [7,14]:
  part=pages[i-1];data.pop(part);data.pop(rp(part),None)
  for el in list(ct):
   if el.get('PartName')=='/'+part:ct.remove(el)
 data['[Content_Types].xml']=xml(ct)
 for newpage,oldpage in enumerate(oldsequence,1):
  part=pages[oldpage-1];s=E.fromstring(data[part])
  for sh in s.findall('.//{'+P+'}sp'):
   t=text(sh);new=t
   if re.fullmatch(r'\s*\d+\s*／\s*\d+\s*',t):new=f'{newpage:02d} ／ 16'
   elif oldpage in agentmap:
    new=re.sub(r'场景智能体\s*·\s*\d{2}',f'场景智能体 · {agentmap[oldpage]}',new)
    new=re.sub(r'智能体\s+\d{2}\s*·',f'智能体 {agentmap[oldpage]} ·',new)
   if oldpage==1:new=new.replace('六类智能体','五类智能体')
   if oldpage==11:
    new=new.replace('专项扩展：站班会识别、施工变更呈现等子智能体','专项扩展：施工变更呈现等子智能体').replace('站班会核验到岗与资格，变更呈现核查实测走线与施工图差异。','变更呈现核查实测走线与施工图差异，辅助安全质量检查。')
   if oldpage==12 and t.startswith('AI 站班会识别'):new='AI 站班会识别'
   if oldpage==13:new=new.replace('新能源点位分散，一个班组同时跑三四个点，靠电话对表迟早出错。','站班会对照人员台账核验到岗与资格，识别异常后由业务人员复核。')
   if new!=t:settext(sh,new)
  data[part]=xml(s)
 if 'docProps/app.xml' in data:
  app=E.fromstring(data['docProps/app.xml']);n=app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides')
  if n is not None:n.text='16'
  data['docProps/app.xml']=xml(app)
 # Remove unreferenced notes left behind by the two deleted slides.
 usednotes=set()
 for oldpage in oldsequence:
  relpath=rp(pages[oldpage-1])
  if relpath not in data:continue
  for rel in E.fromstring(data[relpath]):
   if rel.get('Type')==R+'/notesSlide':usednotes.add(resolve(pages[oldpage-1],rel.get('Target')))
 for name in list(data):
  if name.startswith('ppt/notesSlides/notesSlide') and name.endswith('.xml') and name not in usednotes:
   data.pop(name);data.pop(rp(name),None)
   for el in list(ct):
    if el.get('PartName')=='/'+name:ct.remove(el)
 data['[Content_Types].xml']=xml(ct)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 # The six-stage mainline is unchanged except the footer.
 def stripfooter(b):
  n=E.fromstring(b)
  for sh in n.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\d+ ／ \d+',text(sh)):settext(sh,'PAGE')
  return E.tostring(n)
 assert stripfooter(data[pages[4]])==stripfooter(src.read(pages[4]))
 assert oldsequence.index(12)==oldsequence.index(13)+1
 assert all(src.read(n)==data[n] for n in src.namelist() if n.startswith('ppt/media/'))
 (root/'checks.json').write_text(json.dumps({'totalSlides':16,'agentCount':5,'originalPageOrder':oldsequence,'mainlineSixStagesUnchanged':True,'mergedOriginalPages':[6,7],'qualificationPageRemoved':14,'stationMeetingFollowsTeamIntro':True,'screenshotAssetsUnchanged':True},ensure_ascii=False,indent=2),'utf8')
 print('Saved 16-slide candidate with five agents; six-stage mainline unchanged; station meeting replaces qualification page.')

