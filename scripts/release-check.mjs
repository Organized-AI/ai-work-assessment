#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("../", import.meta.url).pathname);
const contract = await json(`${root}/assessment-contract.json`);
const pkg = await json(`${root}/package.json`);
const prompt = await text(`${root}/prompt.md`);
const sample = await json(`${root}/fixtures/profile-v9.sample.json`);
const changelog = await text(`${root}/CHANGELOG.md`);
const readme = await text(`${root}/README.md`);

check(pkg.version === contract.helperVersion, "package and helper versions match");
check(Number(pkg.version.split(".")[0]) === contract.assessmentPromptVersion, "helper major matches assessment prompt");
check(prompt.includes(`# Organized AI Work Assessment v${contract.assessmentPromptVersion}`), "prompt heading is current");
check(prompt.includes(`profile schema ${contract.profileSchemaVersion} and prompt version ${contract.assessmentPromptVersion}`), "prompt contract is current");
check(sample.prompt_version === contract.assessmentPromptVersion && sample.schema_version === contract.profileSchemaVersion, "sample fixture is current");
check(changelog.includes(`Assessment v${contract.assessmentPromptVersion}`) && changelog.includes(`v${contract.helperVersion}`), "changelog records the release");
check(readme.includes(`Assessment v${contract.assessmentPromptVersion}`) && readme.includes(`helper release is **v${contract.helperVersion}**`), "README records the release");

execFileSync(process.execPath, [`${root}/scripts/distribution-patches.mjs`, "--check"], {stdio:"inherit"});
check(prompt.includes(`github:Organized-AI/ai-work-assessment#v${pkg.version}-organized.1`), "prompt pins the distribution release");
check(!prompt.includes("The server calculates compatible\ncohort comparisons"), "prompt does not promise unavailable hosted comparisons");

console.log(`Open-source release is ready: prompt v${contract.assessmentPromptVersion}, schema v${contract.profileSchemaVersion}, helper v${contract.helperVersion}.`);

function check(condition, label) {
  if (!condition) throw new Error(`Release check failed: ${label}.`);
  console.log(`✓ ${label}`);
}

async function text(path) {
  return readFile(path, "utf8");
}

async function json(path) {
  return JSON.parse(await text(path));
}
