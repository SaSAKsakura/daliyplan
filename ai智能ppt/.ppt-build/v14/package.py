from pathlib import Path
from copy import copy
from zipfile import ZipFile,ZIP_DEFLATED
import xml.etree.ElementTree as E,re,posixpath
root=Path.cwd();b=root/'.ppt-build/v14'
P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';PK='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
for prefix,uri in [('p',P),('a',A),('r',R)]:E.register_namespace(prefix,uri)
def xml(o):return E.tostring(o,encoding='utf-8',xml_declaration=True)
def resolve(owner,t):return t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(owner),t))
with ZipFile(root/'output/AI新能源设施建设场景方案v13.pptx') as src,ZipFile(b/'new-slide.pptx') as ui:
 updates={};node=E.fromstring(ui.read('ppt/slides/slide1.xml'));rels=E.fromstring(ui.read('ppt/slides/_rels/slide1.xml.rels'));newrels=E.Element('{'+PK+'}Relationships');newnotes='ppt/notesSlides/notesSlide19.xml'
 for r in rels:
  ty=r.get('Type');old=resolve('ppt/slides/slide1.xml',r.get('Target'))
  if ty==R+'/image':
   media='ppt/media/iot-anonymized-v14.png';updates[media]=ui.read(old);target='../media/iot-anonymized-v14.png'
  elif ty==R+'/slideLayout':target='../slideLayouts/slideLayout1.xml'
  elif ty==R+'/notesSlide':
   updates[newnotes]=ui.read(old);target='../notesSlides/notesSlide19.xml'
   nr=E.Element('{'+PK+'}Relationships');E.SubElement(nr,'{'+PK+'}Relationship',{'Id':'rId1','Type':R+'/slide','Target':'../slides/slide19.xml'});E.SubElement(nr,'{'+PK+'}Relationship',{'Id':'rId2','Type':R+'/notesMaster','Target':'../notesMasters/notesMaster1.xml'});updates['ppt/notesSlides/_rels/notesSlide19.xml.rels']=xml(nr)
  else:raise AssertionError(ty)
  E.SubElement(newrels,'{'+PK+'}Relationship',{'Id':r.get('Id'),'Type':ty,'Target':target})
 assert 'ppt/notesMasters/notesMaster1.xml' in src.namelist()
 updates['ppt/slides/slide19.xml']=xml(node);updates['ppt/slides/_rels/slide19.xml.rels']=xml(newrels)
 pres=E.fromstring(src.read('ppt/presentation.xml'));pr=E.fromstring(src.read('ppt/_rels/presentation.xml.rels'));ids=pres.find('{'+P+'}sldIdLst');assert len(ids)==18
 new=E.Element('{'+P+'}sldId',{'id':str(max(int(i.get('id')) for i in ids)+1),'{'+R+'}id':'rIdIotV14'});ids.insert(3,new);E.SubElement(pr,'{'+PK+'}Relationship',{'Id':'rIdIotV14','Type':R+'/slide','Target':'slides/slide19.xml'})
 mp={r.get('Id'):resolve('ppt/presentation.xml',r.get('Target')) for r in pr};ordered=[mp[i.get('{'+R+'}id')] for i in ids]
 for n,part in enumerate(ordered,1):
  o=E.fromstring(updates.get(part,src.read(part) if part in src.namelist() else b''));changed=False
  for sp in o.findall('.//{'+P+'}sp'):
   ts=sp.findall('.//{'+A+'}t');s=''.join(t.text or '' for t in ts)
   if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*(18|19)\s*',s):
    ts[0].text=f'{n:02d} ／ 19'
    for t in ts[1:]:t.text=''
    changed=True
  if changed:updates[part]=xml(o)
 updates['ppt/presentation.xml']=xml(pres);updates['ppt/_rels/presentation.xml.rels']=xml(pr)
 ct=E.fromstring(src.read('[Content_Types].xml'))
 for part,ty in [('ppt/slides/slide19.xml','slide'),(newnotes,'notesSlide')]:E.SubElement(ct,'{'+CT+'}Override',{'PartName':'/'+part,'ContentType':'application/vnd.openxmlformats-officedocument.presentationml.'+ty+'+xml'})
 E.register_namespace('',CT);updates['[Content_Types].xml']=xml(ct)
 app=E.fromstring(src.read('docProps/app.xml'));app.find('{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}Slides').text='19';updates['docProps/app.xml']=xml(app)
 with ZipFile(b/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
  for name,data in updates.items():out.writestr(name,data)
 # Verify every old slide differs only in its footer, and all original media are unchanged.
 with ZipFile(b/'candidate.pptx') as out:
  for part in [n for n in src.namelist() if re.fullmatch('ppt/slides/slide[0-9]+.xml',n)]:
   trees=[E.fromstring(z.read(part)) for z in [src,out]]
   for tree in trees:
    for sp in tree.findall('.//{'+P+'}sp'):
     ts=sp.findall('.//{'+A+'}t')
     if re.fullmatch(r'\s*\d{1,2}\s*[／/]\s*(18|19)\s*',''.join(t.text or '' for t in ts)):
      for t in ts:t.text=''
   assert E.tostring(trees[0])==E.tostring(trees[1]),part
  for part in src.namelist():
   if part.startswith('ppt/media/'):assert src.read(part)==out.read(part)
 print('19 slides; new page at position 4; existing slide content and original assets preserved.')



