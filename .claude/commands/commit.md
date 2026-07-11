---
description: Create clean, logically-grouped git commits for the current changes
---

Review the working tree and commit the current changes.

1. Run `git status`, `git diff`, and `git diff --stat` to see what changed (staged, unstaged, and untracked).
2. Identify distinct logical concerns in the diff (e.g. a feature addition vs. an unrelated refactor vs. dependency bumps vs. generated/build artifacts). If everything is one coherent change, one commit is fine — don't split for the sake of splitting.
3. If there are multiple unrelated concerns, split them into separate commits by staging specific files with `git add <files>` (not `git add -A`/`git add .`) so each commit tells one story. Keep each commit buildable — if two files are tightly coupled (e.g. a component and the parent that passes it new props), commit them together even if their diffs mix concerns.
4. Before staging, check for signs of in-progress, unrelated work that just happens to be sitting in the tree (e.g. files still actively changing between checks, a half-applied refactor). Leave that out of the commit and flag it rather than sweeping it in.
5. Exclude noisy generated/build artifacts (e.g. `tsconfig.tsbuildinfo`) from commits unless the user asks for them explicitly.
6. Write commit messages that focus on *why*, matching this repo's existing style. Do not mention Claude, Anthropic, or AI assistance anywhere in the commit message. Do not add a `Co-Authored-By` trailer.
7. Never use `git commit -a`, `--no-verify`, or `--amend` unless explicitly asked.
8. After each commit, run `git status` to confirm a clean result, and report a short summary of what was committed (and what, if anything, was deliberately left out and why).
