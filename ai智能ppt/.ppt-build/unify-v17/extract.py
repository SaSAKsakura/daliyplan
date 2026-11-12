from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
import posixpath,json
root=Path('.ppt-build/unify-v17');P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
for n in [7,9,11,13,15,17,18]:
 with ZipFile(root/f'split-{n}.pptx') as z:
  pres=E.fromstring(z.read('ppt/presentation.xml'));rid=pres.find('{'+P+'}sldIdLst')[0].get('{'+R+'}id');pr=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));part='ppt/'+next(r.get('Target') for r in pr if r.get('Id')==rid);s=E.fromstring(z.read(part));pic=s.find('.//{'+P+'}pic');rid=pic.find('.//{'+A+'}blip').get('{'+R+'}embed');rels=E.fromstring(z.read(posixpath.dirname(part)+'/_rels/'+posixpath.basename(part)+'.rels'));tar=next(r.get('Target') for r in rels if r.get('Id')==rid);ip=posixpath.normpath(posixpath.join(posixpath.dirname(part),tar));(root/f'image-{n}.png').write_bytes(z.read(ip))
print('Extracted seven original screenshots')
