## What changed
<!-- One or two sentences. Link the Jira ticket, e.g. SCRUM-NN. -->

## How it was tested
<!-- Tests added/updated, manual steps, which game(s) you ran. -->

## Checklist
- [ ] `npm run verify` passes locally (the pre-push hook runs it for you)
- [ ] Added or updated tests for the behavior I changed
- [ ] If I added a game: it's in `workspaces`, `e2e/targets.ts` and the root `typecheck` script
- [ ] I did not delete or regenerate `package-lock.json`; only the root lockfile changed
