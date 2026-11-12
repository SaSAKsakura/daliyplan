from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as ET
from copy import copy
import posixpath, hashlib, json

root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v13'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
def resolve(rel,owner):
 t=rel.get('Target');return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(owner),t))
def xml(node):return ET.tostring(node,encoding='utf-8',xml_declaration=True)
def digest(data):return hashlib.sha256(data).hexdigest()
def text(node):return ''.join(t.text or '' for t in node.findall('.//{'+A+'}t'))

with ZipFile(root/'output/AI新能源设施建设场景方案v12.pptx') as src,ZipFile(build/'edited-export.pptx') as ed:
 pres=ET.fromstring(src.read('ppt/presentation.xml'))
 rels=ET.fromstring(src.read('ppt/_rels/presentation.xml.rels'))
 mapping={r.get('Id'):resolve(r,'ppt/presentation.xml') for r in rels}
 ordered=[mapping[s.get('{'+R+'}id')] for s in pres.find('{'+P+'}sldIdLst')]
 assert len(ordered)==18
 media={digest(src.read(n)):n for n in src.namelist() if n.startswith('ppt/media/')}
 facepart='ppt/media/rollcall-anonymized-v11.png'
 oldhash=digest(src.read(facepart))
 newface=(root/'output/素材/站班会识别示例_头像打码.png').read_bytes()
 updates={facepart:newface}
 for page in range(10,18):
  owner=f'ppt/slides/slide{page}.xml';target=ordered[page-1]
  node=ET.fromstring(ed.read(owner));assert node.find('{'+P+'}timing') is None
  erels=ET.fromstring(ed.read(f'ppt/slides/_rels/slide{page}.xml.rels'))
  newrels=ET.Element('{'+PKG+'}Relationships')
  count=0
  for rel in erels:
   ty=rel.get('Type')
   if ty==R+'/slideLayout':dest='../slideLayouts/slideLayout1.xml'
   elif ty==R+'/image':
    data=ed.read(resolve(rel,owner));count+=1
    if page==10:
     assert digest(data)==digest(newface);part=facepart
    else:
     assert digest(data) in media,(page,resolve(rel,owner));part=media[digest(data)]
    dest=posixpath.relpath(part,posixpath.dirname(target))
   elif ty==R+'/notesSlide':continue
   else:raise AssertionError((page,ty))
   ET.SubElement(newrels,'{'+PKG+'}Relationship',{'Id':rel.get('Id'),'Type':ty,'Target':dest})
  assert count==(1 if page in [10,11,13,15,16,17] else 0),(page,count)
  updates[target]=xml(node)
  ET.register_namespace('',PKG)
  updates[posixpath.dirname(target)+'/_rels/'+posixpath.basename(target)+'.rels']=xml(newrels)
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
  assert not updates

with ZipFile(root/'output/AI新能源设施建设场景方案v12.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 assert digest(out.read(facepart))==digest(newface)
 assert all(digest(out.read(n))!=oldhash for n in out.namelist() if n.startswith('ppt/media/'))
 changed=set(ordered[9:17])|{posixpath.dirname(p)+'/_rels/'+posixpath.basename(p)+'.rels' for p in ordered[9:17]}|{facepart}
 for name in src.namelist():
  if name not in changed:assert src.read(name)==out.read(name),name
 for spec in json.loads((build/'alignment-spec.json').read_text(encoding='utf-8'))['headers']:
  node=ET.fromstring(out.read(ordered[spec['page']-1]))
  title=[s for s in node.findall('.//{'+P+'}sp') if text(s)==spec['title']]
  assert len(title)==1,(spec['page'],spec['title'])
  shape=title[0];xfrm=shape.find('{'+P+'}spPr/{'+A+'}xfrm')
  off=xfrm.find('{'+A+'}off');ext=xfrm.find('{'+A+'}ext')
  assert [int(off.get(k)) for k in ['x','y']]==[571500,1028700]
  assert [int(ext.get(k)) for k in ['cx','cy']]==[7239000,419100]
  assert {r.get('sz') for r in shape.findall('.//{'+A+'}rPr')}=={'2700'}
 for page in [10,11,12,13,14,15,16]:
  assert ET.fromstring(out.read(ordered[page-1])).find('{'+P+'}timing') is None
 print('Verified 18 pages, uniform headings, unchanged unrelated parts, static interfaces, and removal of the original unpixelated face bitmap.')
