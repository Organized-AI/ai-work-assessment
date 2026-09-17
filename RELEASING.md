# Releasing the Organized AI distribution

The Overflow distribution supplies the shared contract and rendering modules. The MIT license and upstream attribution remain unchanged. Organized AI owns the host-specific corrections declared in `DISTRIBUTION-PATCHES.json`.

## Compatibility

Assessment method 8 writes profile schema 9. Helper 8.0.1 fixes the existing optional-source contract: an omitted or unavailable comparison source produces `normalized_mix: null`, with no fabricated window or count. Known overlapping windows still require a real comparison. Existing valid profiles remain valid. The matched-window population must be consistent and explicitly labeled; automated outputs continue to count as work evidence.

## Distribution release

1. Add exact, reversible transforms to `DISTRIBUTION-PATCHES.json`. Never hand-edit generated files. The original hashes remain in `SYNC-MANIFEST.json`.
2. Run `npm run distribution:apply`. Each input must be either the pinned vendor file or that file with exactly the declared corrections.
3. Update the package and contract helper versions, README, changelog and prompt tag. Preserve the assessment/schema versions for compatible bug fixes.
4. Run `npm run release:check`. This verifies vendor provenance through reversible patches, the complete tests, version alignment and the exact distribution tag in the prompt.
5. Validate and render a private real assessment plus the fictional fixture. Inspect the report and optional-source cases. Never submit the personal profile automatically.
6. Commit and push the reviewed helper change and its exact tag. Publish the website only after its pinned dependency resolves to that commit.
7. Run the website integration and browser checks. Verify hosted assets, prompt, example, local review and job-seeker continuation after deployment.

## Refreshing the original vendor source

When the original Overflow website checkout is available, `scripts/sync-from-overflow.mjs --source <checkout>` can refresh the base files and manifest. Review that upstream diff separately, update distribution transforms as needed, and then apply them again. An upstream refresh must not silently remove Organized AI branding, consent behavior or compatibility fixes. The distribution check validates recorded provenance; it does not claim the upstream private website was tested here.
