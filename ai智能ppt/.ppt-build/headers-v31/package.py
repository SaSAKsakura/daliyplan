from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import posixpath,re,json,hashlib
root=Path('.ppt-build/headers-v31');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PK='http://schemas.openxmlformats.org/package/2006/relationships'
def xml(n):return E.tostring(n,xml_declaration=True,encoding='UTF-8',standalone=True)
def rp(n):return posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'
def resolve(o,t):return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(o),t))
def order(z):
 rs=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in rs};return [mp[s.get('{'+R+'}id')] for s in E.fromstring(z.read('ppt/presentation.xml')).find('{'+P+'}sldIdLst')]
def text(n):return ''.join(t.text or '' for t in n.findall('.//{'+A+'}t'))
def semantic(n):return (n.tag,tuple(sorted(n.attrib.items())),n.text,n.tail,tuple(semantic(c) for c in n))
def shapeid(n):return n.find('.//{'+P+'}cNvPr')
def pos(n):
 xf=n.find('.//{'+A+'}xfrm')
 if xf is None:return None
 off=xf.find('{'+A+'}off');ext=xf.find('{'+A+'}ext')
 if off is None or ext is None:return None
 return tuple(int(v)/9525 for v in [off.get('x'),off.get('y'),ext.get('cx'),ext.get('cy')])
with ZipFile('output/AI新能源设施建设场景方案v30.pptx') as src,ZipFile(root/'overlays.pptx') as overlay:
 data={n:src.read(n) for n in src.namelist()};pages=order(src);ops=order(overlay);assert len(pages)==len(ops)==19
 logo=Path(r'C:/Users/MATEBO~1/AppData/Local/Temp/codex-clipboard-be463bcc-1bcf-4439-93ee-5dd41a2c74c1.png').read_bytes();media='ppt/media/erowsoft-company-logo-v31.png';data[media]=logo;checks=[]
 for page,(part,op) in enumerate(zip(pages,ops),1):
  s=E.fromstring(data[part]);tree=s.find('.//{'+P+'}spTree');before=list(tree);source_keep=[];old={};body=page not in [1,19]
  for sh in list(tree):
   if sh.tag!='{'+P+'}sp':source_keep.append(deepcopy(sh));continue
   t=text(sh);b=pos(sh);kind=None
   if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*\d{1,2}\s*',t) and b and b[1]>650:kind='统一页码'
   elif body and b and b[1]<90 and re.match(r'^\d{2}\s*[／/]\s*',t):kind='统一页眉'
   elif body and b and abs(b[0]-60)<2 and 85<=b[1]<=90 and b[2]>1150 and b[3]<=2 and not t:kind='统一页眉分隔线'
   if kind:
    assert kind not in old,(page,kind);old[kind]=sh
   else:source_keep.append(deepcopy(sh))
  if body:assert '统一页眉' in old and '统一页眉分隔线' in old and '统一页码' in old,(page,list(old))
  maxid=max(int(x.get('id')) for x in s.findall('.//{'+P+'}cNvPr'));newel=[]
  for sh in E.fromstring(overlay.read(op)).find('.//{'+P+'}spTree'):
   if sh.tag not in ['{'+P+'}sp','{'+P+'}pic']:continue
   new=deepcopy(sh);name=shapeid(new).get('name')
   if new.tag=='{'+P+'}pic':
    maxid+=1;shapeid(new).set('id',str(maxid));shapeid(new).set('name','页脚公司Logo');new.find('.//{'+A+'}blip').set('{'+R+'}embed','rIdCompanyLogoV31');tree.append(new)
   elif name in old:
    shapeid(new).set('id',shapeid(old[name]).get('id'));tree.replace(old[name],new)
   else:
    maxid+=1;shapeid(new).set('id',str(maxid));tree.append(new)
   newel.append(new)
  rr=E.fromstring(data[rp(part)]);assert not any(r.get('Id')=='rIdCompanyLogoV31' for r in rr);E.SubElement(rr,'{'+PK+'}Relationship',Id='rIdCompanyLogoV31',Type=R+'/image',Target='../media/erowsoft-company-logo-v31.png');data[rp(part)]=xml(rr);data[part]=xml(s)
  # Compare every original content object outside the adjusted header/footer.
  retained=[ch for ch in tree if ch not in newel];assert len(retained)==len(source_keep)
  for a,b in zip(retained,source_keep):assert semantic(a)==semantic(b),(page,shapeid(a).get('name') if shapeid(a) is not None else a.tag)
  assert f'{page:02d} ／ 19' in text(s)
  checks.append({'page':page,'header':None if not body else next(text(x) for x in newel if shapeid(x).get('name')=='统一页眉'),'pageMarker':f'{page:02d} ／ 19','companyLogo':True,'contentObjectsUnchanged':True})
 # Preserve the no-speaker-notes convention even if the source contains empty note masters.
 for n in list(data):
  if n.startswith(('ppt/notesSlides/','ppt/notesMasters/')):data.pop(n)
 for n in list(data):
  if n.endswith('.rels'):
   rels=E.fromstring(data[n]);changed=False
   for r in list(rels):
    if r.get('Type') in [R+'/notesSlide',R+'/notesMaster']:rels.remove(r);changed=True
   if changed:data[n]=xml(rels)
 pres=E.fromstring(data['ppt/presentation.xml'])
 for el in list(pres):
  if el.tag=='{'+P+'}notesMasterIdLst':pres.remove(el)
 data['ppt/presentation.xml']=xml(pres)
 ct=E.fromstring(data['[Content_Types].xml']);CT='http://schemas.openxmlformats.org/package/2006/content-types'
 for el in list(ct):
  if el.get('PartName','').startswith(('/ppt/notesSlides/','/ppt/notesMasters/')):ct.remove(el)
 if not any(el.get('Extension')=='png' for el in ct):E.SubElement(ct,'{'+CT+'}Default',Extension='png',ContentType='image/png')
 data['[Content_Types].xml']=xml(ct)
 if 'docProps/app.xml' in data:
  app=E.fromstring(data['docProps/app.xml']);EP='http://schemas.openxmlformats.org/officeDocument/2006/extended-properties'
  for key,val in [('Slides','19'),('Notes','0')]:
   el=app.find('{'+EP+'}'+key)
   if el is not None:el.text=val
  data['docProps/app.xml']=xml(app)
 with ZipFile(root/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for n,b in data.items():out.writestr(n,b)
 assert data[media]==logo
 assert all(data[n]==src.read(n) for n in src.namelist() if n.startswith('ppt/media/'))
 (root/'checks.json').write_text(json.dumps({'slideCount':19,'logoPreservedByteForByte':True,'pages':checks,'sourceSha256':hashlib.sha256(Path('output/AI新能源设施建设场景方案v30.pptx').read_bytes()).hexdigest()},ensure_ascii=False,indent=2),'utf8');print('Updated all 19 page markers, 17 content headers and 19 footer logos; all body objects and source media preserved.')

