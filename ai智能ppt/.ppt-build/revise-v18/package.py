from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,re,json,hashlib
root=Path('.ppt-build/revise-v18');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PK='http://schemas.openxmlformats.org/package/2006/relationships'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def rp(n):return posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'
def resolve(o,t):return posixpath.normpath(posixpath.join(posixpath.dirname(o),t)).lstrip('/')
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
with ZipFile('output/AI新能源设施建设场景方案v17_风格统一版.pptx') as prev,ZipFile('output/AI新能源设施建设场景方案v16.pptx') as orig:
 data={n:prev.read(n) for n in prev.namelist()};pages=order(prev);old=order(orig)
 for page in [6,12,14,16]:
  dst=pages[page-1];part=old[page-1];data[dst]=orig.read(part);data[rp(dst)]=orig.read(rp(part))
  for rel in E.fromstring(orig.read(rp(part))):
   if rel.get('Type')==R+'/notesSlide':
    np=resolve(part,rel.get('Target'));data[np]=orig.read(np)
 for page,name in [(8,'plan'),(10,'log')]:
  with ZipFile(root/f'{name}.pptx') as au:
   part=order(au)[0];dst=pages[page-1];data[dst]=au.read(part);rels=E.Element('{'+PK+'}Relationships',nsmap={None:PK});oldrs=E.fromstring(orig.read(rp(old[page-1])));ars=E.fromstring(au.read(rp(part)))
   lay=next(deepcopy(r) for r in oldrs if r.get('Type')==R+'/slideLayout');lay.set('Id','rIdLayout');rels.append(lay)
   note=next((deepcopy(r) for r in oldrs if r.get('Type')==R+'/notesSlide'),None)
   if note is not None:
    note.set('Id','rIdNotes');rels.append(note);an=next((r for r in ars if r.get('Type')==R+'/notesSlide'),None)
    if an is not None:data[resolve(dst,note.get('Target'))]=au.read(resolve(part,an.get('Target')))
   assert not any(r.get('Type')==R+'/image' for r in ars)
   data[rp(dst)]=xml(rels)
 # Sync scheduling copy in the overview and its retained screenshot page.
 revisions={5:{'按工序生成草稿，推演风险后审批':'按标准工序自动倒排，变化滚动重排'},9:{'按目标排期，变动可推演，调整有依据':'按目标自动编排，变化后滚动重排','按标准生成计划':'按标准自动编排','结合工序依赖与并网目标，\n生成排期草稿，工期待校核。':'结合工序依赖与并网目标，\n自动生成排期草稿并校核。','变动联动推演':'变动自动重排','推演材料晚到的工序影响，\n对比原计划并标出节点风险。':'材料晚到后自动重算排期，\n对比原计划并标出节点风险。'}}
 hits=[]
 for page in [5,6,8,9,10,12,14,16]:
  part=pages[page-1];s=E.fromstring(data[part])
  for sh in s.findall('.//{'+P+'}sp'):
   ts=sh.findall('.//{'+A+'}t');t=''.join(x.text or '' for x in ts);new=None
   if re.fullmatch(r'\s*\d+\s*／\s*\d+\s*',t):new=f'{page:02d} ／ 21'
   # In PPTX line breaks are paragraph nodes, so compare normalized strings too.
   for before,after in revisions.get(page,{}).items():
    if t.replace('\n','')==before.replace('\n',''):new=after.replace('\n','');hits.append([page,before])
   if new is not None and ts:
    ts[0].text=new
    for x in ts[1:]:x.text=''
  data[part]=xml(s)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 # Verify untouched scenario pages and retained screenshots are unchanged.
 for page in [7,11,13,15,17,18]:assert data[pages[page-1]]==prev.read(pages[page-1])
 for page in [6,12,14,16]:
  a=E.fromstring(data[pages[page-1]]);b=E.fromstring(orig.read(old[page-1]))
  def stripfooter(n):
   for t in n.findall('.//{'+A+'}t'):
    if re.fullmatch(r'\d+ ／ 21',t.text or ''):t.text='FOOTER'
   return E.tostring(n)
  assert stripfooter(a)==stripfooter(b)
 assert '示例' not in ''.join(E.fromstring(data[pages[9]]).itertext())
 (root/'checks.json').write_text(json.dumps({'slideCount':21,'restored':[6,12,14,16],'regenerated':8,'removedExample':10,'schedulingCopy':hits,'unchangedScenarioPages':[7,11,13,15,17,18]},ensure_ascii=False,indent=2),'utf8')
 print('Candidate saved; original pages restored; log example removed; scheduling copy synchronized.',hits)
