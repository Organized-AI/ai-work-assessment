import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
test('distribution patches reproduce pinned files and reject unrelated drift',()=>{
 const dir=mkdtempSync(join(tmpdir(),'awa-distribution-'));
 try {
  const manifest=JSON.parse(readFileSync(join(root,'SYNC-MANIFEST.json'),'utf8'));
  const patches=JSON.parse(readFileSync(join(root,'DISTRIBUTION-PATCHES.json'),'utf8'));
  for(const file of [...manifest.files.map(x=>x.target),'SYNC-MANIFEST.json','DISTRIBUTION-PATCHES.json','scripts/distribution-patches.mjs']){
   mkdirSync(dirname(join(dir,file)),{recursive:true});copyFileSync(join(root,file),join(dir,file));
  }
  const script=join(dir,'scripts/distribution-patches.mjs');
  const run=(args=[])=>execFileSync(process.execPath,[script,...args],{encoding:'utf8',stdio:'pipe'});
  assert.match(run(['--check']),/Verified/);
  for(const [file,steps] of Object.entries(patches.files)){
   let text=readFileSync(join(dir,file),'utf8');
   for(const step of [...steps].reverse())text=text.replace(step.replace,step.find);
   writeFileSync(join(dir,file),text);
  }
  assert.throws(()=>run(['--check']),/Command failed/);
  assert.match(run(),/Applied/);
  for(const file of Object.keys(patches.files))assert.equal(readFileSync(join(dir,file),'utf8'),readFileSync(join(root,file),'utf8'));
  writeFileSync(join(dir,'src/validate.js'),readFileSync(join(dir,'src/validate.js'),'utf8')+'\n// unintended drift\n');
  assert.throws(()=>run(['--check']),/Command failed/);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
