from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,json,re,hashlib
root=Path('.ppt-build/unify-v17');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PK='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def relpart(n):return posixpath.join(posixpath.dirname(n),'_rels',posixpath.basename(n)+'.rels')
def resolve(owner,t):return posixpath.normpath(posixpath.join(posixpath.dirname(owner),t)).lstrip('/')
def order(z):
 pr=E.fromstring(z.read('ppt/presentation.xml'));rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in pr.find('{'+P+'}sldIdLst')]
def text(n):return ''.join(n.itertext())
changes={
'标准生任务、任务带资料、资料归档案——六个环节共用同一套分部分项标准，AI 沿着标准把活跑起来。 ':'六个环节共用分部分项标准，AI 辅助分析与协同，业务确认后执行。',
'按标准工序倒排到天，冲突先亮':'按工序生成草稿，推演风险后审批',
'说一段话成一条日志，单据自动入账':'语音补齐成稿，关联单据与办理回执',
'检查项随工序带出，隐患闭环销项':'检查项关联工序，异常复核后整改',
'按画像与负载派单，证件到期先知':'按作业核对资格，审核确认准入',
'资料随工序长出来，一次组卷交付':'按目录归集资料，补齐后审查归档',
'几十个点位在一块屏上跑，异常自动找人':'项目节点集中查看，异常确认后派单',
'手机上接活、报日志、传照片，不学新系统':'手机上接任务、报日志、传照片',
'把工法与验收规程拆成结构化标准包':'按工法与验收要求维护标准包'
}
with ZipFile('output/AI新能源设施建设场景方案v16.pptx') as src,ZipFile(root/'authored.pptx') as au:
 data={n:src.read(n) for n in src.namelist()};origorder=order(src);neworder=order(au);mapping=json.loads((root/'mapping.json').read_text());ct=E.fromstring(data['[Content_Types].xml']);types={x.get('Extension') for x in ct if x.tag.endswith('Default')}
 for j,page in enumerate(mapping):
  dest=origorder[page-1];ap=neworder[j];s=E.fromstring(au.read(ap));oldrels=E.fromstring(src.read(relpart(dest)));ar=E.fromstring(au.read(relpart(ap)));rr=E.Element('{'+PK+'}Relationships',nsmap={None:PK})
  for rel in ar:
   if rel.get('Type')==R+'/image':
    ip=resolve(ap,rel.get('Target'));ext=posixpath.splitext(ip)[1];name=next((n for n in src.namelist() if n.startswith('ppt/media/') and src.read(n)==au.read(ip)),f'ppt/media/v17-unified-{page}{ext}');data[name]=au.read(ip);r=deepcopy(rel);r.set('Target','../media/'+posixpath.basename(name));rr.append(r)
    if ext[1:] not in types:E.SubElement(ct,'{'+CT+'}Default',Extension=ext[1:],ContentType='image/'+('jpeg' if ext in ['.jpg','.jpeg'] else ext[1:]));types.add(ext[1:])
  layout=next(deepcopy(r) for r in oldrels if r.get('Type')==R+'/slideLayout');layout.set('Id','rIdUnifiedLayout');rr.append(layout)
  note=next((deepcopy(r) for r in oldrels if r.get('Type')==R+'/notesSlide'),None)
  if note is not None:
   note.set('Id','rIdUnifiedNotes');rr.append(note)
   an=next((r for r in ar if r.get('Type')==R+'/notesSlide'),None)
   if an is not None:data[resolve(dest,note.get('Target'))]=au.read(resolve(ap,an.get('Target')))
  data[dest]=xml(s);data[relpart(dest)]=xml(rr)
 # Correct page markers in the preserved pages and align the high-level narrative.
 for i,part in enumerate(origorder,1):
  s=E.fromstring(data[part])
  for sh in s.findall('.//{'+P+'}sp'):
   ts=sh.findall('.//{'+A+'}t');t=''.join(x.text or '' for x in ts)
   new=None
   if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*\d{1,2}\s*',t):new=f'{i:02d} ／ 21'
   elif i==5 and t in changes:new=changes[t]
   if new is not None and ts:
    ts[0].text=new
    for x in ts[1:]:x.text=''
  data[part]=xml(s)
 data['[Content_Types].xml']=xml(ct)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as o:
  for n,b in data.items():o.writestr(n,b)
 # Source images are retained byte-for-byte, including the original UI screenshots.
 for n in src.namelist():
  if n.startswith('ppt/media/'):assert src.read(n)==data[n]
 print('Created 21-page candidate; replaced 13 pages; aligned overview and page numbers; retained all original media.')
 (root/'package-check.json').write_text(json.dumps({'pages':21,'replaced':mapping,'sourceSha256':hashlib.sha256(Path('output/AI新能源设施建设场景方案v16.pptx').read_bytes()).hexdigest()},indent=2))

