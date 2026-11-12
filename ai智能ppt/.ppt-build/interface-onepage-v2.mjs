import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {constants} from 'node:fs';
import {PresentationFile,FileBlob} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
import {finalizePresentation} from 'file:///C:/Users/MateBook%2014/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const build=path.join(root,'.ppt-build/interface-onepage-v2');
const skill='C:/Users/MateBook 14/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations';
const source=path.join(root,'output/系统界面展示_单页样稿v1.pptx');
await fs.mkdir(build,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const s=p.slides.items[0];
// Native editable replacement labels conceal only already-redacted pixels.
// Coordinates are local to the existing screenshot crops, preserving all image assets.
function replace(name,frame,rect,label,tx,ty,size=24,color='#252A30'){
 const [ox,oy,scale]=frame,[x,y,w,h]=rect;
 const cover=s.shapes.add({geometry:'rect',name:name+'_底色',position:{left:ox+x*scale,top:oy+y*scale,width:w*scale,height:h*scale},fill:'#FFFFFF',line:{fill:'none',width:0}});
 const sh=s.shapes.add({geometry:'textbox',name,position:{left:ox+tx*scale,top:oy+ty*scale,width:(x+w-tx)*scale,height:(y+h-ty)*scale},fill:'none',line:{fill:'none',width:0}});
 sh.text=label;sh.text.style={typeface:'微软雅黑',fontSize:size*scale,color,bold:false,insets:0,verticalAlignment:'top',lineSpacing:1,wrap:'none',autoFit:'none'};
}
const log=[660,269,260/571];
replace('示例项目名称',log,[171,82,375,79],'示例新能源建设项目',179,108,24);
replace('示例工作负责人',log,[169,162,375,40],'示例负责人',177,171,24);
replace('示例作业单位',log,[169,202,375,38],'示例施工单位',177,210,24);
replace('示例项目地址',log,[169,239,375,59],'某新能源项目施工区域',177,254,24);
replace('示例计划工作内容',log,[169,333,269,37],'电缆线路及配套施工',177,342,23);
replace('示例整改负责人',[960,419,260/580],[170,62,245,43],'示例负责人',179,73,23);
replace('示例整改要求',[960,548,260/585],[171,64,405,48],'按工艺标准整改（示例）',183,79,23);
const note=s.shapes.add({geometry:'textbox',name:'示例信息说明',position:{left:60,top:695,width:1160,height:17},fill:'none',line:{fill:'none',width:0}});
note.text='界面信息已脱敏，名称及描述为展示示例';
note.text.style={typeface:'微软雅黑',fontSize:10,color:'#94A3B8',insets:0,verticalAlignment:'top',lineSpacing:1};
s.speakerNotes.text+='\n美化修订：仅在原已打码位置叠加可编辑白底及明确的示例文字，未恢复任何原始身份信息。项目、人员、单位、地址、计划内容及整改要求均为展示占位内容，不作为实际业务事实。原有截图、业务结构和日期保持。';
await fs.writeFile(path.join(build,'preview.png'),new Uint8Array(await (await p.export({slide:s,format:'png',scale:2})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
const link=fs.link.bind(fs);fs.link=async(a,b)=>{try{return await link(a,b)}catch(e){if(!['EPERM','ENOTSUP'].includes(e.code))throw e;await fs.copyFile(a,b,constants.COPYFILE_EXCL)}};
const finalPath=path.join(root,'output/系统界面展示_单页样稿v2.pptx');
await finalizePresentation({workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,pythonExecutable:'C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:1,fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')});
const final=await PresentationFile.importPptx(await FileBlob.load(finalPath));
await fs.writeFile(path.join(root,'output/系统界面展示_单页样稿v2.png'),new Uint8Array(await (await final.export({slide:final.slides.items[0],format:'png',scale:2})).arrayBuffer()));
console.log('Saved refined single-page presentation:',finalPath);
