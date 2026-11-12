from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from copy import copy
from io import BytesIO
import hashlib,posixpath
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v6'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
def p(parent,tag,**attrs):return ET.SubElement(parent,'{'+P+'}'+tag,{k:str(v) for k,v in attrs.items()})
with ZipFile(BytesIO((root/'output/AI新能源设施建设场景方案v5.pptx').read_bytes())) as src,ZipFile(build/'edited-export.pptx') as ed:
 slide=ET.fromstring(ed.read('ppt/slides/slide11.xml'))
 rel=ET.fromstring(ed.read('ppt/slides/_rels/slide11.xml.rels'))
 newrel=ET.Element('{'+PKG+'}Relationships');updates={};pictures=slide.findall('.//{'+P+'}pic')
 assert len(pictures)==2
 stages=[]
 for i,picture in enumerate(pictures,1):
  nv=picture.find('{'+P+'}nvPicPr/{'+P+'}cNvPr');embed=picture.find('.//{'+A+'}blip').get('{'+R+'}embed')
  item=next(x for x in rel if x.get('Id')==embed);target=item.get('Target');path=target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join('ppt/slides',target))
  data=ed.read(path);assert hashlib.sha256(data).digest()==hashlib.sha256((build/f'example-{i}.png').read_bytes()).digest()
  media=f'ppt/media/archive-example-v6-{i}.png';assert media not in src.namelist();updates[media]=data
  ET.SubElement(newrel,'{'+PKG+'}Relationship',{'Id':embed,'Type':R+'/image','Target':f'../media/archive-example-v6-{i}.png'})
  title=next(x for x in slide.findall('.//{'+P+'}cNvPr') if x.get('name')==f'档案示例{i}标题')
  back=next(x for x in slide.findall('.//{'+P+'}cNvPr') if x.get('name')==f'档案示例{i}底板')
  stages.append([title.get('id'),back.get('id'),nv.get('id')])
 layout=next(x for x in rel if x.get('Type')==R+'/slideLayout')
 ET.SubElement(newrel,'{'+PKG+'}Relationship',{'Id':layout.get('Id'),'Type':R+'/slideLayout','Target':'../slideLayouts/slideLayout1.xml'})
 for old in slide.findall('{'+P+'}timing'):slide.remove(old)
 timing=ET.Element('{'+P+'}timing');tn=p(timing,'tnLst');par=p(tn,'par');ct=p(par,'cTn',id=1,dur='indefinite',restart='never',nodeType='tmRoot');cl=p(ct,'childTnLst');seq=p(cl,'seq',concurrent=1,nextAc='seek');sc=p(seq,'cTn',id=2,dur='indefinite',nodeType='mainSeq');scl=p(sc,'childTnLst');nid=3
 for stage in stages:
  click=p(scl,'par');cc=p(click,'cTn',id=nid,fill='hold');nid+=1;p(p(cc,'stCondLst'),'cond',delay='indefinite');ccl=p(cc,'childTnLst')
  group=p(ccl,'par');gc=p(group,'cTn',id=nid,fill='hold');nid+=1;p(p(gc,'stCondLst'),'cond',delay=0);gcl=p(gc,'childTnLst')
  for i,spid in enumerate(stage):
   ep=p(gcl,'par');ec=p(ep,'cTn',id=nid,presetID=10,presetClass='entr',presetSubtype=0,fill='hold',grpId=0,nodeType='clickEffect' if i==0 else 'withEffect');nid+=1;p(p(ec,'stCondLst'),'cond',delay=0);el=p(ec,'childTnLst')
   visibility=p(el,'set');b=p(visibility,'cBhvr');vc=p(b,'cTn',id=nid,dur=1,fill='hold');nid+=1;p(p(vc,'stCondLst'),'cond',delay=0);p(p(b,'tgtEl'),'spTgt',spid=spid);p(p(b,'attrNameLst'),'attrName').text='style.visibility';p(p(visibility,'to'),'strVal',val='visible')
   fade=p(el,'animEffect',transition='in',filter='fade');b=p(fade,'cBhvr');p(b,'cTn',id=nid,dur=600);nid+=1;p(p(b,'tgtEl'),'spTgt',spid=spid)
 for tag,event in [('prevCondLst','onPrev'),('nextCondLst','onNext')]:
  cond=p(p(seq,tag),'cond',evt=event,delay=0);p(p(cond,'tgtEl'),'sldTgt')
 builds=p(timing,'bldLst')
 for stage in stages:
  for spid in stage[:2]:p(builds,'bldP',spid=spid,grpId=0)
 ext=slide.find('{'+P+'}extLst')
 if ext is None:slide.append(timing)
 else:slide.insert(list(slide).index(ext),timing)
 updates['ppt/slides/slide11.xml']=ET.tostring(slide,encoding='utf-8',xml_declaration=True)
 ET.register_namespace('',PKG)
 updates['ppt/slides/_rels/slide11.xml.rels']=ET.tostring(newrel,encoding='utf-8',xml_declaration=True)
 assert len(timing.findall('.//{'+P+'}animEffect'))==6
 ids=[x.get('id') for x in timing.findall('.//{'+P+'}cTn')];assert len(ids)==len(set(ids))
 with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
  for item in src.infolist():out.writestr(copy(item),updates.pop(item.filename,src.read(item.filename)))
  for name,data in updates.items():out.writestr(name,data)
with ZipFile(root/'output/AI新能源设施建设场景方案v5.pptx') as src,ZipFile(build/'candidate.pptx') as out:
 for name in src.namelist():
  if name not in ['ppt/slides/slide11.xml','ppt/slides/_rels/slide11.xml.rels']:assert src.read(name)==out.read(name),name
 print('Both screenshots embedded unchanged. Slide 10 native animation and all other slides preserved byte-for-byte.')
