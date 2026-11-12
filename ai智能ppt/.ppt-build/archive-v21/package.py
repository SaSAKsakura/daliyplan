from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,re,json,hashlib
root=Path('.ppt-build/archive-v21');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PK='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def rp(n):return posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'
def resolve(o,t):return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(o),t))
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
def text(n):return ''.join(t.text or '' for t in n.findall('.//{'+A+'}t'))
with ZipFile('output/AI新能源设施建设场景方案v20_文案整理版.pptx') as src,ZipFile(root/'incoming-fixed.pptx') as incoming,ZipFile(root/'authored.pptx') as authored:
 data={n:src.read(n) for n in src.namelist()};pages=order(src);ip=order(incoming)[0];ap=order(authored)[0];dst=pages[16];removed=pages[17]
 assert '档案文件' in text(E.fromstring(data[dst]));assert '共用信息' in text(E.fromstring(data[removed]))
 node=E.fromstring(incoming.read(ip));tree=node.find('.//{'+P+'}spTree');an=E.fromstring(authored.read(ap));foot=next(deepcopy(sh) for sh in an.findall('.//{'+P+'}sp') if sh.find('.//{'+P+'}cNvPr').get('name')=='统一页码');foot.find('.//{'+P+'}cNvPr').set('id',str(max(int(x.get('id')) for x in node.findall('.//{'+P+'}cNvPr'))+1));tree.append(foot)
 for sh in node.findall('.//{'+P+'}sp'):
  if '03 ／ 场景智能体' in text(sh):
   ts=sh.findall('.//{'+A+'}t');ts[0].text='03 ／ 场景智能体 · 06 · 应用界面'
   for t in ts[1:]:t.text=''
 rels=E.Element('{'+PK+'}Relationships',nsmap={None:PK});ct=E.fromstring(data['[Content_Types].xml']);defaults={x.get('Extension') for x in ct if x.tag.endswith('Default')};mediahash={hashlib.sha256(b).hexdigest():n for n,b in data.items() if n.startswith('ppt/media/')}
 oldrels=E.fromstring(src.read(rp(dst)))
 for rel in E.fromstring(incoming.read(rp(ip))):
  r=deepcopy(rel);kind=r.get('Type')
  if kind==R+'/slideLayout':r.set('Target',next(x.get('Target') for x in oldrels if x.get('Type')==kind))
  elif kind==R+'/image':
   name=resolve(ip,r.get('Target'));b=incoming.read(name);digest=hashlib.sha256(b).hexdigest();ext=posixpath.splitext(name)[1];new=mediahash.get(digest,'ppt/media/v21-archive-'+posixpath.basename(name));data[new]=b;mediahash[digest]=new;r.set('Target','../media/'+posixpath.basename(new))
   if ext[1:] not in defaults:E.SubElement(ct,'{'+CT+'}Default',Extension=ext[1:],ContentType='image/'+('jpeg' if ext in ['.jpg','.jpeg'] else ext[1:]));defaults.add(ext[1:])
  else:raise ValueError(kind)
  rels.append(r)
 data[dst]=xml(node);data[rp(dst)]=xml(rels)
 pres=E.fromstring(data['ppt/presentation.xml']);ids=pres.find('{'+P+'}sldIdLst');dropped=ids[17];dropid=dropped.get('{'+R+'}id');ids.remove(dropped);pr=E.fromstring(data['ppt/_rels/presentation.xml.rels'])
 for r in list(pr):
  if r.get('Id')==dropid:pr.remove(r)
 data['ppt/presentation.xml']=xml(pres);data['ppt/_rels/presentation.xml.rels']=xml(pr)
 data.pop(removed);data.pop(rp(removed),None)
 for item in list(ct):
  if item.get('PartName')=='/'+removed:ct.remove(item)
 data['[Content_Types].xml']=xml(ct)
 newpages=pages[:17]+pages[18:]
 for i,part in enumerate(newpages,1):
  s=E.fromstring(data[part]);changed=False
  for sh in s.findall('.//{'+P+'}sp'):
   if re.fullmatch(r'\s*\d+\s*／\s*\d+\s*',text(sh)):
    ts=sh.findall('.//{'+A+'}t');ts[0].text=f'{i:02d} ／ 20'
    for t in ts[1:]:t.text=''
    changed=True
  if changed:data[part]=xml(s)
 if 'docProps/app.xml' in data:
  app=E.fromstring(data['docProps/app.xml']);n=app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides')
  if n is not None:n.text='20'
  data['docProps/app.xml']=xml(app)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 # Verify all other slides remain the same apart from page numbering.
 def strip(s):
  s=E.fromstring(s)
  for t in s.findall('.//{'+A+'}t'):
   if re.fullmatch(r'\d+ ／ (20|21)',t.text or ''):t.text='PAGE'
  return E.tostring(s)
 for part in newpages:
  if part!=dst:assert strip(data[part])==strip(src.read(part)),part
 assert len(newpages)==20;assert '智能体 06' in text(E.fromstring(data[newpages[15]]));assert 'AI 协同审查' in text(E.fromstring(data[newpages[16]]))
 (root/'checks.json').write_text(json.dumps({'totalSlides':20,'replacedAt':17,'removedOriginalPages':[17,18],'introRetainedAt':16,'sourceLayoutAndPicturesPreserved':True,'otherSlidesPreserved':True},ensure_ascii=False,indent=2),'utf8')
 print('Merged supplied page at page 17; removed the original two display pages; verified 20 slides.')
