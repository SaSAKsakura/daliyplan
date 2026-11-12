from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
import posixpath
root=Path('.ppt-build/unify-v17');P='http://schemas.openxmlformats.org/presentationml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
with ZipFile('.ppt-build/unify-v17/candidate.pptx') as z:
 pres=E.fromstring(z.read('ppt/presentation.xml'));ids=pres.find('{'+P+'}sldIdLst');rels=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'));mp={r.get('Id'):r.get('Target') for r in rels}
 for i,sid in enumerate(ids,1):
  pr=E.fromstring(z.read('ppt/presentation.xml'));lst=pr.find('{'+P+'}sldIdLst');lst[:]=[sid]
  rr=E.fromstring(z.read('ppt/_rels/presentation.xml.rels'))
  for r in list(rr):
   if r.get('Type')==R+'/slide' and r.get('Id')!=sid.get('{'+R+'}id'):rr.remove(r)
  # Only retain reachable parts, removing unused source assets.
  data={'ppt/presentation.xml':E.tostring(pr),'ppt/_rels/presentation.xml.rels':E.tostring(rr)}
  seen=set()
  def visit(n):
   if n in seen:return
   seen.add(n)
   if n not in z.namelist():return
   if n not in data:data[n]=z.read(n)
   rp=posixpath.join(posixpath.dirname(n),'_rels',posixpath.basename(n)+'.rels')
   if rp in z.namelist():
    if rp not in data:data[rp]=z.read(rp)
    for r in E.fromstring(data[rp]):
     if r.get('TargetMode')!='External':visit(posixpath.normpath(posixpath.join(posixpath.dirname(n),r.get('Target'))).lstrip('/'))
  visit('ppt/presentation.xml');visit('_rels/.rels')
  data['_rels/.rels']=z.read('_rels/.rels')
  for rel in E.fromstring(data['_rels/.rels']):
   if rel.get('TargetMode')!='External':visit(rel.get('Target').lstrip('/'))
  data['[Content_Types].xml']=z.read('[Content_Types].xml')
  ct=E.fromstring(data['[Content_Types].xml'])
  for el in list(ct):
   if el.get('PartName') and el.get('PartName').lstrip('/') not in data:ct.remove(el)
  data['[Content_Types].xml']=E.tostring(ct)
  with ZipFile(root/f'finalsplit-{i}.pptx','w',ZIP_DEFLATED) as o:
   for n,b in data.items():o.writestr(n,b)
print('split 21')



