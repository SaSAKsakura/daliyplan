from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import json,posixpath,re
root=Path('.ppt-build/wording-v20');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):r.get('Target').lstrip('/') if r.get('Target').startswith('/') else 'ppt/'+r.get('Target') for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
changes=json.loads((root/'changes.json').read_text('utf8'))
with ZipFile('output/AI新能源设施建设场景方案v19_版式完善版.pptx') as src:
 data={n:src.read(n) for n in src.namelist()};pages=order(src);hits=0
 for page,pairs in changes.items():
  dst=pages[int(page)-1];s=E.fromstring(data[dst])
  for sh in s.findall('.//{'+P+'}sp'):
   ts=sh.findall('.//{'+A+'}t');t=''.join(x.text or '' for x in ts)
   for old,new in pairs:
    if t==old:
     ts[0].text=new
     for x in ts[1:]:x.text=''
     hits+=1
  if page=='15':
   with ZipFile(root/'edit-15.pptx') as au:
    an=E.fromstring(au.read(order(au)[0]));cover=next(deepcopy(sh) for sh in an.findall('.//{'+P+'}sp') if sh.find('.//{'+P+'}cNvPr').get('name')=='界面标签清理');cover.find('.//{'+P+'}cNvPr').set('id',str(max(int(x.get('id')) for x in s.findall('.//{'+P+'}cNvPr'))+1));s.find('.//{'+P+'}spTree').append(cover)
  data[dst]=xml(s)
 assert hits==sum(len(x) for x in changes.values())
 for n,b in data.items():
  if n.startswith('ppt/') and n.endswith('.xml'):
   try:s=E.fromstring(b)
   except:continue
   alltext=''.join(t.text or '' for t in s.findall('.//{'+A+'}t'))
   assert not re.search('未来|拟实现|场景展示|场景示意|界面示意',alltext),(n,alltext)
 for n in src.namelist():
  if n.startswith('ppt/media/'):assert data[n]==src.read(n)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 print('Cleaned',hits,'text fields and one screenshot label; other slide objects preserved.')

