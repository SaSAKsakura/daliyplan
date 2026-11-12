import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {constants} from 'node:fs';
import {PresentationFile,FileBlob} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
import {finalizePresentation} from 'file:///C:/Users/MateBook%2014/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const build=path.join(root,'.ppt-build/interface-onepage-v6');
const skill='C:/Users/MateBook 14/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations';
const source=path.join(root,'output/系统界面展示_单页样稿v5.pptx');
await fs.mkdir(build,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const s=p.slides.items[0];
const snap=await p.inspect({kind:'image',maxChars:50000});
const images=snap.ndjson.split('\n').filter(Boolean).map(x=>JSON.parse(x)).filter(r=>r.kind==='image');
p.delete(images.filter(r=>r.position.left>=350&&r.position.left<640).map(r=>r.id));
function txt(name,value,x,y,w,h,size=12,color='#263442',bold=false){
 const sh=s.shapes.add({geometry:'textbox',name,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sh.text=value;sh.text.style={typeface:'微软雅黑',fontSize:size,color,bold,insets:0,verticalAlignment:'top',lineSpacing:1.1,wrap:'none',autoFit:'none'};
}
function table(name,values,y,height,widths){
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:360,top:y,width:260,height,columnWidths:widths,values});
 t.styleOptions={headerRow:false,bandedRows:false};
 t.borders.assign({style:'solid',fill:'#E0EAF3',width:0.5});
 t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({margins:{left:6,right:4,top:3,bottom:3}});
 for(let r=0;r<values.length;r++){
  t.rows[r].height=height/values.length;
  for(let c=0;c<values[0].length;c++){
   const cell=t.getCell(r,c);
   cell.fill=r===0?'#EFF6FC':r%2===1?'#FFFFFF':'#F7FAFD';
   cell.text.style={typeface:'微软雅黑',fontSize:11,bold:r===0,color:r===0?'#4597D5':'#344659',alignment:c===0?'left':'center',verticalAlignment:'middle',insets:0,lineSpacing:1,wrap:'none',autoFit:'none'};
  }
 }
 return t;
}
txt('计划展示_周计划标题','周计划 · 任务范围',360,272,260,22,13.5,'#263442',true);
txt('计划展示_计划周期','2026/09/24—09/30',360,302,260,20,11.5,'#6C8198');
table('周计划范围',[
 ['分部分项','作业部位','数量'],
 ['土石方工程','通用','1'],
 ['杆塔组立工程','工井1#','1'],
],332,81,[108,104,48]);
txt('计划展示_每日标题','每日作业安排',360,443,260,22,13.5,'#263442',true);
const daily=[['日期','作业时段','状态']];
for(let i=0;i<7;i++)daily.push([`09/${24+i}`,'08:30–17:30',i===0?'未管控':'未开始']);
table('每日安排',daily,476,168,[62,124,74]);
s.speakerNotes.text+='\n计划编排展示修订：将两个缺少上下文的单列截图改为可编辑摘要表。周计划保留计划周期、两条分部分项、作业部位和分配数量；作业部位中的重复分类前缀【通用】省略。每日安排保留2026年9月24至30日全部七天、08:30至17:30时段、首日未管控与其余日期未开始状态。数据均按原用户截图读取，未增加人员排班或任务依赖关系。摘要表为展示重排，不代表新系统界面。';
s.shapes.items.find(x=>x.name==='示例信息说明').text='计划区域按原界面字段重排；截图已脱敏，项目、人员及单位名称为展示示例';
await fs.writeFile(path.join(build,'preview.png'),new Uint8Array(await (await p.export({slide:s,format:'png',scale:2})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
const link=fs.link.bind(fs);fs.link=async(a,b)=>{try{return await link(a,b)}catch(e){if(!['EPERM','ENOTSUP'].includes(e.code))throw e;await fs.copyFile(a,b,constants.COPYFILE_EXCL)}};
const finalPath=path.join(root,'output/系统界面展示_单页样稿v6.pptx');
await finalizePresentation({workspaceDir:root,candidatePath:path.join(build,'candidate.pptx'),finalPath,pythonExecutable:'C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--require-native-table-slide','1'],explicitTotalSlideCount:1,requiredNativeTableOwnerSlides:[1],fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(build,'validation.json')});
const final=await PresentationFile.importPptx(await FileBlob.load(finalPath));
await fs.writeFile(path.join(root,'output/系统界面展示_单页样稿v6.png'),new Uint8Array(await (await final.export({slide:final.slides.items[0],format:'png',scale:2})).arrayBuffer()));
console.log('Refined planning presentation:',finalPath);
