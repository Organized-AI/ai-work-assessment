import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateRawProfileV9, sanitizeProfile, validateProfileV9} from '../src/validate.js';
import {renderProfileDocument} from '../src/render.js';
const fixture=()=>JSON.parse(readFileSync(new URL('../fixtures/profile-v9.sample.json',import.meta.url),'utf8'));
function validate(p){validateRawProfileV9(p);sanitizeProfile(p);validateProfileV9(p);return p;}
function unavailable(p){p.profile_view.agent_footprint.normalized_mix=null;p.activity_analysis.coverage.shared_window_sessions=[];return p;}
for (const omitted of ['claude','codex']) {
 test(`an omitted ${omitted} source can produce a valid local report without invented comparison data`,()=>{
  const p=unavailable(fixture());
  p.activity_analysis.coverage.source_windows=p.activity_analysis.coverage.source_windows.filter(x=>x.source!==omitted);
  delete p.windows[omitted];
  validate(p);
  const html=renderProfileDocument(p);
  assert.match(html,/A source may be omitted, unavailable/);
  assert.doesNotMatch(html,/Upload compatible source history/);
  assert.equal(p.profile_view.agent_footprint.normalized_mix,null);
 });
}
test('other-agent-only history can render without Claude or Codex windows',()=>{
 const p=unavailable(fixture());
 p.activity_analysis.coverage.source_windows=[{source:'other',from:'2026-06-11',to:'2026-07-24',sessions:12,coverage_days:44,retention:'retention-limited',limitations:[]}];
 p.windows={other:[{tool:'Hermes',from:'2026-06-11',to:'2026-07-24',sessions:12,unknown_projects:0}]};
 assert.doesNotThrow(()=>validate(p));
});
test('unavailable mix cannot hide known overlapping windows or a populated ledger',()=>{
 assert.throws(()=>validate(unavailable(fixture())),/cannot be null/);
 const p=fixture();p.profile_view.agent_footprint.normalized_mix=null;p.activity_analysis.coverage.source_windows=p.activity_analysis.coverage.source_windows.filter(x=>x.source==='codex');
 assert.throws(()=>validate(p),/empty shared-window ledger/);
});
test('a numeric comparison still requires both observed source windows',()=>{
 const p=fixture();p.activity_analysis.coverage.source_windows=p.activity_analysis.coverage.source_windows.filter(x=>x.source==='codex');
 assert.throws(()=>validate(p),/observed source windows/);
});
