from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
from copy import copy
root=Path(__file__).resolve().parent.parent
build=root/'.ppt-build/v5'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
ET.register_namespace('p',P);ET.register_namespace('a',A);ET.register_namespace('r',R)
def p(parent,tag,**attrs):return ET.SubElement(parent,'{'+P+'}'+tag,{k:str(v) for k,v in attrs.items()})
with ZipFile(build/'pre-animation.pptx') as src:
    slide=ET.fromstring(src.read('ppt/slides/slide10.xml'))
    title=next(x for x in slide.findall('.//{'+P+'}cNvPr') if x.get('name')=='看板展示标题')
    picture=slide.find('.//{'+P+'}pic/{'+P+'}nvPicPr/{'+P+'}cNvPr')
    targets=[title.get('id'),picture.get('id')]
    for t in slide.findall('{'+P+'}timing'):slide.remove(t)
    timing=ET.Element('{'+P+'}timing')
    tn=p(timing,'tnLst');par=p(tn,'par');ct=p(par,'cTn',id=1,dur='indefinite',restart='never',nodeType='tmRoot');cl=p(ct,'childTnLst')
    seq=p(cl,'seq',concurrent=1,nextAc='seek');seqct=p(seq,'cTn',id=2,dur='indefinite',nodeType='mainSeq');seqcl=p(seqct,'childTnLst')
    click=p(seqcl,'par');clickct=p(click,'cTn',id=3,fill='hold');p(p(clickct,'stCondLst'),'cond',delay='indefinite');clickcl=p(clickct,'childTnLst')
    group=p(clickcl,'par');groupct=p(group,'cTn',id=4,fill='hold');p(p(groupct,'stCondLst'),'cond',delay=0);groupcl=p(groupct,'childTnLst')
    nid=5
    for i,spid in enumerate(targets):
        ep=p(groupcl,'par');ec=p(ep,'cTn',id=nid,presetID=10,presetClass='entr',presetSubtype=0,fill='hold',grpId=0,nodeType='clickEffect' if i==0 else 'withEffect');nid+=1
        p(p(ec,'stCondLst'),'cond',delay=0);el=p(ec,'childTnLst')
        visibility=p(el,'set');behavior=p(visibility,'cBhvr');vc=p(behavior,'cTn',id=nid,dur=1,fill='hold');nid+=1
        p(p(vc,'stCondLst'),'cond',delay=0);p(p(behavior,'tgtEl'),'spTgt',spid=spid)
        p(p(behavior,'attrNameLst'),'attrName').text='style.visibility';p(p(visibility,'to'),'strVal',val='visible')
        fade=p(el,'animEffect',transition='in',filter='fade');behavior=p(fade,'cBhvr');p(behavior,'cTn',id=nid,dur=600);nid+=1
        p(p(behavior,'tgtEl'),'spTgt',spid=spid)
    for tag,event in [('prevCondLst','onPrev'),('nextCondLst','onNext')]:
        cond=p(p(seq,tag),'cond',evt=event,delay=0);p(p(cond,'tgtEl'),'sldTgt')
    p(p(timing,'bldLst'),'bldP',spid=targets[0],grpId=0)
    # Timing comes after transition/color mapping and before extensions.
    ext=slide.find('{'+P+'}extLst')
    if ext is None:slide.append(timing)
    else:slide.insert(list(slide).index(ext),timing)
    ids=[x.get('id') for x in timing.findall('.//{'+P+'}cTn')]
    assert len(ids)==len(set(ids))
    assert len(timing.findall('.//{'+P+'}animEffect'))==2
    with ZipFile(build/'candidate.pptx','w',ZIP_DEFLATED) as out:
        for item in src.infolist():out.writestr(copy(item),ET.tostring(slide,encoding='utf-8',xml_declaration=True) if item.filename=='ppt/slides/slide10.xml' else src.read(item.filename))
print('Created coordinated on-click/with-previous native fade entrances; original descriptions remain under the opaque dashboard.')
