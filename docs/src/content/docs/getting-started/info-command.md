---
title: "Info Command"
sidebar:
  order: 5
---

Use [[/info]] to view the bot’s current status and version information in one place.

It shows:

- How long the bot has been running (`Uptime`)
- When it last restarted (`Bot Started`)
- A short summary of the latest update (`Commit Message`)
- `Recent Commits` (latest update notes)

For more detail, use:

[[/info details\:true]]

That version also shows:

- `Commit Date` (when that update was created)
- The current live update identifier (`Commit`)
- `Code Difference` (a link comparing live code to latest branch)
- `Status` (whether live bot code is current)

## How players should read this

You do **not** need coding knowledge. Treat it like a "version and health" page for the bot.

If `Status` says:

- **Up to date** – Live bot is running the latest planned code.
- **Behind** – There are newer updates not live yet.
- **Ahead** – Live bot is running test or unreleased changes.
- **Diverged** – Live code and branch both have different changes.
- **Sync status unavailable** – Git sync check failed temporarily.

Most players only need to check whether the bot is **Up to date**.

## When to use /info

- You think the bot might have just updated.
- A feature seems different from what the wiki says.
- You want to include useful status context in a bug report.