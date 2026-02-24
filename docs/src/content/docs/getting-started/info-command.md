---
title: "Info Command"
sidebar:
  order: 5
---

Use [[/info]] to check basic bot status in one place.

It shows:

- How long the bot has been running (`Uptime`)
- When it last restarted (`Bot Started`)
- The current live update identifier (`Commit`)
- A short summary of the latest update (`Commit Message`)

For more detail, use:

[[/info details\:true]]

That version also shows:

- `Commit Date` (when that update was created)
- `Code Difference` (a link comparing live code to latest branch)
- `Status` (whether live bot code is current)
- `Recent Commits` (latest update notes)

## How players should read this

You do **not** need coding knowledge. Treat it like a "version and health" page for the bot.

- If `Status` says **Up to date**, the live bot is running the latest planned code.
- If it says **Behind**, there are newer updates not live yet.
- If it says **Ahead**, the live bot has code not yet on the normal branch.
- If it says **Diverged**, live code and branch both have different changes.
- If it says **Sync status unavailable**, the bot could not check git sync at that moment.

## When to use /info

- You think the bot might have just updated.
- A feature seems different from what the wiki says.
- You want to include useful status context in a bug report.

## Good bug-report habit

When reporting a bug, include the output from [[/info details\:true]].
This helps staff quickly confirm whether your server is seeing the latest live code.
