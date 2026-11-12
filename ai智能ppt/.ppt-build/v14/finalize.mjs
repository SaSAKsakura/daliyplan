import path from 'node:path';
import fs from 'node:fs/promises';
import {constants} from 'node:fs';
import { createHash } from 'node:crypto';
import {finalizePresentation} from 'file:///C:/Users/MateBook%2014/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='D:/工作文档/每月文档/正常工作/ai智能ppt';
const skill='C:/Users/MateBook 14/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations';
await fs.mkdir(`${root}/output`,{recursive:true});
const version=Number(process.argv[2]||1);
const build=version===1?`${root}/.ppt-build`:`${root}/.ppt-build/v${version}`;
const source=version===1?`${root}/AI新能源设施建设场景方案v0.pptx`:`${root}/output/AI新能源设施建设场景方案v${version-1}.pptx`;
// This Windows workspace rejects hard links. Preserve the finalizer's
// exclusive-create semantics while publishing the already validated bytes.
const link=fs.link.bind(fs);
fs.link=async(a,b)=>{try{return await link(a,b);}catch(e){if(e.code!=='EPERM'&&e.code!=='ENOTSUP')throw e;await fs.copyFile(a,b,constants.COPYFILE_EXCL);}};
const result=await finalizePresentation({
 workspaceDir:root,
 candidatePath:`${build}/candidate.pptx`,
 finalPath:`${root}/output/AI新能源设施建设场景方案v${version}.pptx`,
 pythonExecutable:'C:/Users/MateBook 14/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...(version===3?['--require-native-table-slide','10']:[])],
 explicitTotalSlideCount:19,
 requiredNativeTableOwnerSlides:[],
 ...(version===3?{requiredNativeTableOwnerSlides:[10]}:{}),
 fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},
 verifyArtifactToolImport:true,
 receiptPath:`${build}/v${version}.validation.json`,
});
console.log(JSON.stringify(result));


