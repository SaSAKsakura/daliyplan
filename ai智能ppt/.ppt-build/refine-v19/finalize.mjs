process.env.RUNTIME_NODE_MODULES='C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
import fs from 'node:fs/promises';import {constants} from 'node:fs';import {createHash} from 'node:crypto';
import {finalizePresentation} from 'file:///C:/Users/MateBook%2014/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.12130/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt',dir=root+'/.ppt-build/refine-v19',skill='C:/Users/MateBook 14/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.12130/skills/presentations';
const link=fs.link.bind(fs);fs.link=async(a,b)=>{try{return await link(a,b);}catch(e){if(!['EPERM','ENOTSUP'].includes(e.code))throw e;await fs.copyFile(a,b,constants.COPYFILE_EXCL);}};
try{const r=await finalizePresentation({workspaceDir:root,candidatePath:dir+'/candidate.pptx',finalPath:root+'/output/AI新能源设施建设场景方案v19_版式完善版.pptx',pythonExecutable:'C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--validate-bullet-geometry'],explicitTotalSlideCount:21,fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:root+'/output/AI新能源设施建设场景方案v16.pptx',referenceSha256:createHash('sha256').update(await fs.readFile(root+'/output/AI新能源设施建设场景方案v16.pptx')).digest('hex')},verifyArtifactToolImport:false,receiptPath:dir+'/validation.json'});console.log(JSON.stringify(r));}catch(e){console.log(String(e));process.exitCode=1;}




