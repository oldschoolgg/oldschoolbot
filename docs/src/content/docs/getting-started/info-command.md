---
title: "Info Command"
sidebar:
  order: 5
---

Use `/info` subcommands to view bot status and version information.

## Available subcommands

- [[/info commit]]
  - Shows current full commit hash and commit message.
- [[/info recent_updates]]
  - Shows the latest 10 commits with short hashes and names.
- [[/info uptime]]
  - Shows current uptime and bot start time.
- [[/info overview]]
  - Shows uptime, current commit, and the latest 3 commits.

For extra commit diagnostics, use:

[[/info commit details\:true]]

That also shows:

- `Commit Date`
- `Code Difference`
- `Status`

## How players should read this

You do **not** need coding knowledge. Treat it like a "version and health" page for the bot.

If `Status` says:

- **Up to date** - Live bot is running the latest planned code.
- **Behind** - There are newer updates not live yet.
- **Ahead** - Live bot is running test or unreleased changes.
- **Diverged** - Live code and branch both have different changes.
- **Sync status unavailable** - Git sync check failed temporarily.

Most players only need to check whether the bot is **Up to date**.

## When to use /info

- You think the bot might have just updated.
- A feature seems different from what the wiki says.
- You want to include useful status context in a bug report.
