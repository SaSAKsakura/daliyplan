from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,json
root=Path('.ppt-build/refine-v19');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def rp(n):return posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'
def resolve(o,t):return posixpath.normpath(posixpath.join(posixpath.dirname(o),t)).lstrip('/')
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
def text(n):return ''.join(x.text or '' for x in n.findall('.//{'+A+'}t'))
with ZipFile('output/AI新能源设施建设场景方案v18_智能体调整版.pptx') as src:
 data={n:src.read(n) for n in src.namelist()};pages=order(src)
 for page,label in [(8,'plan'),(10,'log')]:
  dst=pages[page-1]
  with ZipFile(root/f'{label}.pptx') as au:
   part=order(au)[0];data[dst]=au.read(part)
   oldrel=E.fromstring(src.read(rp(dst)));newrel=E.fromstring(au.read(rp(part)))
   assert all(r.get('Type').rsplit('/',1)[-1] in ['slideLayout','notesSlide'] for r in newrel)
   for rel in list(newrel):
    kind=rel.get('Type');before=next((r for r in oldrel if r.get('Type')==kind),None)
    if before is None:
     assert kind.endswith('/notesSlide');newrel.remove(rel);continue
    if kind.endswith('/notesSlide'):data[resolve(dst,before.get('Target'))]=au.read(resolve(part,rel.get('Target')))
    rel.set('Target',before.get('Target'))
   data[rp(dst)]=xml(newrel)
 for page in [7,9,11,13,15,17,18]:
  dst=pages[page-1];node=E.fromstring(data[dst]);tree=node.find('.//{'+P+'}spTree')
  with ZipFile(root/f'scene-{page}.pptx') as au:
   authored=E.fromstring(au.read(order(au)[0]));badges={text(sh):sh for sh in authored.findall('.//{'+P+'}sp') if (sh.find('.//{'+P+'}cNvPr').get('name') or '').startswith('统一深色序号')}
   assert len(badges)==3
   count=0
   for sh in list(tree):
    if sh.tag!='{'+P+'}sp':continue
    t=text(sh);off=sh.find('.//{'+A+'}off')
    if t in ['01','02','03'] and off is not None and int(off.get('x'))>900*9525:
     badge=deepcopy(badges[t]);badge.find('.//{'+P+'}cNvPr').set('id',sh.find('.//{'+P+'}cNvPr').get('id'));tree.replace(sh,badge);count+=1
   assert count==3
  data[dst]=xml(node)
 # Explicitly preserve every other slide and all screenshot assets.
 changed={7,8,9,10,11,13,15,17,18}
 for i,n in enumerate(pages,1):
  if i not in changed:assert data[n]==src.read(n)
 for n in src.namelist():
  if n.startswith('ppt/media/'):assert data[n]==src.read(n)
 for page in [8,10]:assert '示例' not in text(E.fromstring(data[pages[page-1]]))
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 (root/'checks.json').write_text(json.dumps({'pages':21,'processPages':[8,10],'badgePages':[7,9,11,13,15,17,18],'badgeCount':21,'sourceScreenshotsUnchanged':True,'otherSlidesUnchanged':True},indent=2),'utf8')
 print('Saved candidate: two process pages, 21 consistent dark badges, original screenshots preserved.')

