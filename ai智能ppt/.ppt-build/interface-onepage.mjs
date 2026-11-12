import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {constants} from 'node:fs';
import {Presentation,PresentationFile,FileBlob} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
import {finalizePresentation} from 'file:///C:/Users/MateBook%2014/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/artifact_tool_utils.mjs';
const require=createRequire('C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const sharp=require('sharp');
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const build=path.join(root,'.ppt-build/interface-onepage');
const out=path.join(root,'output');
const skill='C:/Users/MateBook 14/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations';
await fs.mkdir(build,{recursive:true});
const source=path.join(root,'output/AI新能源设施建设场景方案v10.pptx');
const files=[
 'codex-clipboard-748fd6a9-a202-442b-8e8d-0e2348c7eae6.png',
 'codex-clipboard-4165660c-82d3-4506-82f8-65ede9dc1d8d.png',
 'codex-clipboard-adb06d99-93e5-4898-bb72-d763b0ae9275.png',
 'codex-clipboard-5179d54a-097a-47d3-8e28-63529b069460.png',
 'codex-clipboard-fba67017-eff8-4f51-a063-8b0fc3232805.jpg',
 'codex-clipboard-f5295703-55dd-407e-8852-7b270d56686c.png',
 'codex-clipboard-28f77623-edab-44c4-99f0-4d18f22dd9a7.png',
 'codex-clipboard-b269c284-5358-45a2-bd7d-133c50e88fb4.png',
].map(x=>path.join('C:/Users/MateBook 14/AppData/Local/Temp',x));
const p=Presentation.create({slideSize:{width:1280,height:720}}),s=p.slides.add();
s.background.fill='#FFFFFF';
function text(name,value,x,y,w,h,size=18,color='#1C2A38',bold=false){
 const sh=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=value;sh.text.style={typeface:'微软雅黑',fontSize:size,color,bold,insets:0,verticalAlignment:'top',lineSpacing:1.22,wrap:'square',autoFit:'none'};return sh;
}
const crops=[];
async function crop(sourceIndex,rect,name,x,y,w){
 const data=await sharp(files[sourceIndex]).extract({left:rect[0],top:rect[1],width:rect[2],height:rect[3]}).png().toBuffer();
 await fs.writeFile(path.join(build,name+'.png'),data);
 const h=w*rect[3]/rect[2];
 s.images.add({blob:new Uint8Array(data),contentType:'image/png',name,alt:name+'，用户原始界面裁剪',position:{left:x,top:y,width:w,height:h},fit:'contain'});
 crops.push({name,source:files[sourceIndex],rect,position:{x,y,w,h}});
}
text('页眉','系统界面展示',60,28,1160,23,14,'#6C8198');
text('主标题','标准任务贯通计划、日志与检查',60,64,1160,50,36,'#1C2A38',true);
text('副标题','沿用同一套分部分项，让后台标准、每日安排与现场执行衔接',60,125,1160,30,19,'#627A92');
const xs=[60,360,660,960];
const titles=['01  标准分部分项','02  计划编排','03  施工日志','04  检查整改'];
const subs=['专业与工序逐级组织','周计划分解到每日','任务信息带到现场','检查状态关联整改'];
for(let i=0;i<4;i++){
 text('环节'+(i+1),titles[i],xs[i],188,260,32,23,'#0C4168',true);
 text('说明'+(i+1),subs[i],xs[i],226,260,25,16,'#627A92');
}
await crop(0,[432,218,295,390],'标准库_专业与工序',60,269,260);
await crop(1,[188,844,240,94],'周计划_分部分项',360,269,260);
await crop(2,[628,366,320,251],'每日安排_单据日期',360,391,260);
await crop(3,[24,151,571,514],'移动日志_任务卡片',660,269,260);
await crop(4,[84,938,1110,316],'移动日志_工序内容',660,523,260);
await crop(5,[35,1410,1250,650],'施工中_检查与质量取照',960,269,260);
await crop(6,[15,322,580,247],'质量验收_整改关联',960,419,260);
await crop(7,[17,477,585,178],'工艺标准_整改要求与期限',960,548,260);
text('智能体衔接标签','智能体衔接',60,656,120,25,18,'#D59128',true);
text('智能体衔接内容','按标准生成任务，辅助排期与日志归集，提示检查缺项及整改期限',195,658,1025,25,17,'#0C4168');
s.speakerNotes.text='展示定义：使用用户提供的8张现有系统截图，裁剪为专业工序、周计划分项、每日日期、任务卡片、工序内容、施工中检查、验收整改关联和工艺标准整改信息，按01标准分部分项、02计划编排、03施工日志、04安全质量检查顺序组织。\n对应主方案：AI新能源设施建设场景方案v10，第6至9页。底部文字为方案中的智能体衔接方向，不将截图当作AI功能已实现的证明。\n原图脱敏、空值及完成状态均保持。所选截图来自不同业务样例，表达功能之间的关系，不作为同一项目的数据追溯链。完整截图保留于用户原附件。';
await fs.writeFile(path.join(build,'crop-manifest.json'),JSON.stringify(crops,null,2));
await fs.writeFile(path.join(build,'before-finalize.png'),new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
const link=fs.link.bind(fs);fs.link=async(a,b)=>{try{return await link(a,b)}catch(e){if(!['EPERM','ENOTSUP'].includes(e.code))throw e;await fs.copyFile(a,b,constants.COPYFILE_EXCL)}};
const finalPath=path.join(out,'系统界面展示_单页样稿v1.pptx');
await finalizePresentation({workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,pythonExecutable:'C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:1,fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')});
const finalP=await PresentationFile.importPptx(await FileBlob.load(finalPath));
await fs.writeFile(path.join(out,'系统界面展示_单页样稿v1.png'),new Uint8Array(await (await finalP.export({slide:finalP.slides.items[0],format:'png',scale:2})).arrayBuffer()));
console.log('Finalized one-page sample:',finalPath);
