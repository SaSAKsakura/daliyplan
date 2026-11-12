from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,re,json,hashlib,base64
root=Path('.ppt-build/remote-safety-v27');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def rp(n):return posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'
def resolve(o,t):return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(o),t))
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
def text(n):return ''.join(t.text or '' for t in n.findall('.//{'+A+'}t'))
# Reuse the notes-removal routine from the preceding revision.
source=Path('.ppt-build/wbs-v26/package.py').read_text('utf8');start=source.index('def stripnotes(');end=source.index("with ZipFile(root/'single-candidate.pptx')",start);exec(source[start:end])
with ZipFile(root/'single-candidate.pptx') as au:
 data=stripnotes({n:au.read(n) for n in au.namelist()})
 with ZipFile(root/'single-clean.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
with ZipFile('output/AI新能源设施建设场景方案v26_分部分项实现版.pptx') as src,ZipFile(root/'single-clean.pptx') as au:
 data={n:src.read(n) for n in src.namelist()};pages=order(src);assert len(pages)==18;matches=[(i,n) for i,n in enumerate(pages,1) if 'AI 安全检查工作台' in text(E.fromstring(data[n]))];assert len(matches)==1;page,dst=matches[0];ap=order(au)[0];s=E.fromstring(au.read(ap));oldrels=E.fromstring(data[rp(dst)]);rr=E.fromstring(au.read(rp(ap)))
 for rel in rr:
  kind=rel.get('Type')
  if kind==R+'/slideLayout':rel.set('Target',next(r.get('Target') for r in oldrels if r.get('Type')==kind))
  elif kind==R+'/image':
   ip=resolve(ap,rel.get('Target'));new='ppt/media/remote-safety-v27-workbench.png';data[new]=au.read(ip);rel.set('Target','../media/remote-safety-v27-workbench.png')
  else:raise ValueError(kind)
 for sh in s.findall('.//{'+P+'}sp'):
  if re.fullmatch(r'\d+ ／ \d+',text(sh)):
   ts=sh.findall('.//{'+A+'}t');ts[0].text=f'{page:02d} ／ 18'
   for t in ts[1:]:t.text=''
 data[dst]=xml(s);data[rp(dst)]=xml(rr);data=stripnotes(data)
 assert 'AI远程安全督查工作台' in text(E.fromstring(data[dst]))
 for n in pages:
  if n!=dst:assert data[n]==src.read(n)
 assert not any(n.startswith(('ppt/notesSlides/','ppt/notesMasters/')) for n in data)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 html=Path('output/远程安全督查_AI工作台.html').read_text('utf8');a=html.index('const sitePhotos=')+len('const sitePhotos=');photos,_=json.JSONDecoder().raw_decode(html[a:]);paths=[r'C:/Users/MATEBO~1/AppData/Local/Temp/codex-clipboard-6603ef21-cc4b-48d4-ac70-435e41673b5c.png',r'C:/Users/MATEBO~1/AppData/Local/Temp/codex-clipboard-dc694192-92dd-4442-b3f0-9ec1c8ee0207.png']
 for uri,path in zip(photos,paths):assert base64.b64decode(uri.split(',',1)[1])==Path(path).read_bytes()
 (root/'checks.json').write_text(json.dumps({'totalSlides':18,'updatedPage':page,'title':'AI远程安全督查工作台','suppliedPhotosPreservedByteForByte':True,'videoMode':'local file picker; no supplied video','speakerNotesRemoved':True,'otherSlidesUnchanged':True},ensure_ascii=False,indent=2),'utf8');print('Replaced safety workbench on page',page,'and verified original photos and notes removal.')

