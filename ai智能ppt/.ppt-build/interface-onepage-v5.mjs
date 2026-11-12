import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {constants} from 'node:fs';
import {createRequire} from 'node:module';
import {Presentation,PresentationFile,FileBlob} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
import {finalizePresentation} from 'file:///C:/Users/MateBook%2014/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/artifact_tool_utils.mjs';
const require=createRequire('C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json');
const sharp=require('sharp');
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const build=path.join(root,'.ppt-build/interface-onepage-v5');
const assets=path.join(root,'output/作业日志_脱敏裁剪素材v1');
const skill='C:/Users/MateBook 14/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations';
const source=path.join(root,'output/系统界面展示_单页样稿v4.pptx');
const tmp='C:/Users/MateBook 14/AppData/Local/Temp';
const input=[
 path.join(tmp,'codex-clipboard-92717a71-3473-407a-8e21-789581260829.png'),
 path.join(tmp,'codex-clipboard-3f93e96c-1c42-4cb5-9ec9-8b096580e894.png'),
 path.join(tmp,'codex-clipboard-d7b3b6ff-13a0-4547-ad05-7391abff47b0.png'),
];
await fs.mkdir(build,{recursive:true});await fs.mkdir(assets,{recursive:true});
// Render the source crop and neutral replacements into a NEW flattened image.
// The public deck never embeds an unredacted screenshot or removable privacy mask.
const cardRect={left:52,top:517,width:1215,height:1085};
const cardBytes=await sharp(input[0]).extract(cardRect).png().toBuffer();
const card=Presentation.create({slideSize:{width:1215,height:1085}}),cs=card.slides.add();
cs.background.fill='#FFFFFF';
cs.images.add({blob:new Uint8Array(cardBytes),contentType:'image/png',position:{left:0,top:0,width:1215,height:1085},fit:'contain'});
function replace(name,rect,content,tx,ty,size=48){
 const [x,y,w,h]=rect;
 cs.shapes.add({geometry:'rect',name:name+'_清除',position:{left:x-52,top:y-517,width:w,height:h},fill:'#FFFFFF',line:{fill:'none',width:0}});
 const sh=cs.shapes.add({geometry:'textbox',name,position:{left:tx-52,top:ty-517,width:x+w-tx,height:y+h-ty},fill:'none',line:{fill:'none',width:0}});
 sh.text=content;sh.text.style={typeface:'微软雅黑',fontSize:size,bold:true,color:'#1E1E1E',insets:0,verticalAlignment:'top',wrap:'square',lineSpacing:1,autoFit:'none'};
}
replace('示例日志编号',[429,531,580,77],'AR-DEMO-0001',440,547);
replace('示例项目账号',[429,615,790,78],'PRJ-DEMO-001',440,631);
replace('示例项目名称',[424,690,799,158],'【示例项目】新能源配套设施\n示范片区变电与电缆\n建设工程',440,702,46);
replace('示例负责人',[425,859,799,79],'示例负责人',440,878);
replace('示例单位',[425,943,799,83],'示例施工单位',440,962);
replace('示例地址',[425,1026,799,116],'示例片区配套设施施工区域\n某施工路段（展示示例）',440,1039,46);
replace('示例计划内容',[425,1229,550,74],'示例片区电缆施工…',440,1246,46);
const cardPath=path.join(assets,'01_作业日志任务卡片_脱敏.png');
await fs.writeFile(cardPath,new Uint8Array(await (await card.export({slide:cs,format:'png',scale:1})).arrayBuffer()));
const workPath=path.join(assets,'02_计划工作内容_裁剪.png');
await sharp(input[1]).extract({left:52,top:668,width:1215,height:663}).png().toFile(workPath);
const stagePath=path.join(assets,'03_施工中检查状态_裁剪.png');
await sharp(input[2]).extract({left:35,top:1410,width:1250,height:650}).png().toFile(stagePath);
const stagesPath=path.join(assets,'04_准备施工收工阶段_完整裁剪.png');
await sharp(input[2]).extract({left:35,top:877,width:1250,height:1890}).png().toFile(stagesPath);
const p=await PresentationFile.importPptx(await FileBlob.load(source)),s=p.slides.items[0];
const snap=await p.inspect({kind:'image,shape,textbox',maxChars:150000});
const records=snap.ndjson.split('\n').filter(Boolean).map(x=>JSON.parse(x));
const remove=records.filter(r=>r.id&&['shape','textbox'].includes(r.kind)&&(/^(移动日志_|移动检查_)/.test(r.name||''))).map(x=>x.id);
p.delete(remove);
async function image(file,name,x,y,w){
 const bytes=await fs.readFile(file),meta=await sharp(bytes).metadata();
 s.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt:name,position:{left:x,top:y,width:w,height:w*meta.height/meta.width},fit:'contain'});
}
await image(cardPath,'新截图：作业日志任务卡片，已永久替换身份字段',660,269,260);
await image(workPath,'新截图：计划工作内容，仅保留首条施工任务',666,513,248);
await image(stagePath,'新截图：施工中三措检查、施工内容、质量取照',960,269,260);
s.shapes.items.find(x=>x.name==='示例信息说明').text='界面截图已裁剪脱敏，项目、人员、单位及地址为展示示例';
s.speakerNotes.text='本页基于用户最新提供的三张作业日志截图替换施工日志和施工中检查区域。\n新附件1：裁剪首条作业日志卡片，日志编号、项目账号、项目名称、工作负责人、作业单位、项目地址及包含原地址的计划内容全部替换为中性示例。文字与白底一起渲染为新PNG，最终PPT仅嵌入脱敏图片，不含可撤销的身份遮挡。\n新附件2：仅裁剪第一条施工任务，去掉手机状态栏、重复任务和后续软件测试内容。\n新附件3：裁剪施工中检查状态，保留原始完成时间和未完成状态；另输出准备、施工和收工的完整阶段图片。\n其余标准库、计划编排和整改关联区域沿用当前单页，不把不同项目样例解释为同一项目的数据关联。\n底部智能体衔接文字为方案能力定义。';
await fs.writeFile(path.join(build,'preview.png'),new Uint8Array(await (await p.export({slide:s,format:'png',scale:2})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
const link=fs.link.bind(fs);fs.link=async(a,b)=>{try{return await link(a,b)}catch(e){if(!['EPERM','ENOTSUP'].includes(e.code))throw e;await fs.copyFile(a,b,constants.COPYFILE_EXCL)}};
const finalPath=path.join(root,'output/系统界面展示_单页样稿v5.pptx');
await finalizePresentation({workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,pythonExecutable:'C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:1,fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')});
const final=await PresentationFile.importPptx(await FileBlob.load(finalPath));
await fs.writeFile(path.join(root,'output/系统界面展示_单页样稿v5.png'),new Uint8Array(await (await final.export({slide:final.slides.items[0],format:'png',scale:2})).arrayBuffer()));
console.log('Updated presentation:',finalPath);console.log('Sanitized image assets:',assets);
