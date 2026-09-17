#!/usr/bin/env node
// Apply and verify explicit Organized AI corrections over the pinned vendor manifest.
// Each patched file must round-trip to its original manifest hash.
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('SYNC-MANIFEST.json',root),'utf8'));
const patches = JSON.parse(readFileSync(new URL('DISTRIBUTION-PATCHES.json',root),'utf8'));
const check = process.argv.includes('--check');
const hash = text => createHash('sha256').update(text).digest('hex');
export function replaceExactly(text, before, after, file) {
  const occurrences = text.split(before).length - 1;
  if (occurrences !== 1) throw new Error(`${file}: patch expected one occurrence, found ${occurrences}`);
  return text.replace(before, after);
}
for (const file of manifest.files) {
  const path = new URL(file.target,root);
  const current = readFileSync(path,'utf8');
  const steps = patches.files[file.target] || [];
  if (!steps.length) {
    if (hash(current) !== file.sha256) throw new Error(`${file.target}: unpatched vendor content drifted`);
    continue;
  }
  if (hash(current) === file.sha256) {
    if (check) throw new Error(`${file.target}: distribution patches have not been applied`);
    const next = steps.reduce((text,p) => replaceExactly(text,p.find,p.replace,file.target),current);
    writeFileSync(path,next);
  } else {
    const original = [...steps].reverse().reduce((text,p) => replaceExactly(text,p.replace,p.find,file.target),current);
    if (hash(original) !== file.sha256) throw new Error(`${file.target}: content does not match the pinned vendor plus declared patches`);
  }
}
for (const target of Object.keys(patches.files)) {
  if (!manifest.files.some(f=>f.target===target)) throw new Error(`Patch target is absent from vendor manifest: ${target}`);
}
console.log(`${check?'Verified':'Applied'} declared distribution patches against ${manifest.files.length} pinned vendor files.`);
