# Enable Dependabot auto-merge

1. In repository **Settings > Code security**, enable Dependabot alerts and Dependabot security updates.
2. In **Settings > General > Pull Requests**, enable **Allow auto-merge** and squash merging.
3. Add a branch rule or ruleset for `main` that requires the `test` check from `PR Check` before merging.
4. Merge `.github/workflows/dependabot-automerge.yml` into `main`.
5. Open or update a Dependabot PR. Verify that `Dependabot auto-merge` waits for `PR Check` on the same head commit before enabling auto-merge.

The workflow accepts patch and minor updates, including grouped updates classified by `dependabot/fetch-metadata` v3.1.0. Major and unclassified updates need manual review. The existing monthly version-update schedule remains active, so both security fixes and regular patch and minor updates are eligible.

Failed, cancelled, skipped, missing, or timed-out PR checks block the merge step. The wait expires after about 15 minutes. After fixing CI or rerunning it successfully, rerun the auto-merge workflow if its previous run failed. The merge command checks the PR head SHA so an older run cannot merge a newer commit. Required checks and approvals still apply.

The privileged workflow reads metadata and enables merging without checking out or executing PR code. It uses the built-in `GITHUB_TOKEN`; no additional secret is required. Publishing to npm remains available through the existing `Manual Deploy to NPM` workflow.

For security fixes only, set `open-pull-requests-limit: 0` in the npm entry in `.github/dependabot.yml` and close existing regular update PRs before activating auto-merge.

See [GitHub's Dependabot automation guide](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/automate-dependabot-with-actions) for auto-merge and required-check configuration.
