import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/MateBook%2014/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const d='D:/工作文档/每月文档/正常工作/ai智能ppt/.ppt-build/notes-v25';const p=await PresentationFile.importPptx(await FileBlob.load(d+'/single-candidate.pptx'));for(const s of p.slides.items)s.speakerNotes.text='';await(await PresentationFile.exportPptx(p)).save(d+'/review.pptx');console.log('Verified notes-free page imports and editable slide remains intact.');
