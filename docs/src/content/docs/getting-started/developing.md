---
title: "Developing Guide"
sidebar:
  order: 9999
lastUpdated: 2024-10-01T03:41:00.552Z
---

### Important Tips

- I use [this link](https://github.com/oldschoolgg/oldschoolbot/pulls?q=is%3Aopen+is%3Apr+-label%3A%22Status%3A+Waiting+For+Changes%22+-label%3A%22Status%3A+Needs+Information%22++-label%3A%22Status%3A+WIP%22+) when reviewing PRs, if your PR has certain labels (like 'Waiting for changes', or 'Status:WP'), it will be excluded from my reviewing list, so update the labels of your PR as appropriate (or ask someone with contributor role to update labels).
- Run `pnpm dev` before pushing commits to a PR, it will do everything you need (linting, building, testing, etc).
- You need a test bot, and have it added to our testing server, and it's highly encouraged you do your testing there.
- If you have any question or need help, ask in `#developers`, and you're welcome to ping @magnaboy.

### Commands

`pnpm dev`: Run this before pushing/PRing, or just at any time if you want, it does almost everything you need: Update deps, generate prisma clients, build, update files, lint and test.

`pnpm start`: Starts/runs your bot, and restarts it when you make changes.

`pnpm lint`: Run this if you only want to lint your code, and nothing else (pnpm dev runs this).

`pnpm test`: Run this if you only want to test your code, and nothing else (pnpm dev runs this).

`pnpm monorepo:build`: Run this if you have made changes to either monorepo (oldschooljs or toolkit) to update the dependency in the bot.

`pnpm monorepo:test`: Run this if you want to test either monorepo (oldschooljs or toolkit).

### Spritesheet

The spritesheet is a big image file containing most icons the bot uses for items, not all items are in it, if the bot need any that aren't in it, it will download them on demand.

- To update the spritesheet, use `pnpm spritesheet`. This will only have an effect if something has actually changed.
- If new osrs items are being added, you first need to download [the new cache](https://github.com/runelite/static.runelite.net/archive/refs/heads/gh-pages.zip) and extract it so `/cache/item/icon` is in `tmp/icons` in the repo.
- Must only be run on the master (osb) branch.
- If new BSO items are added, the images should be put in the master branch in `src/lib/resources/images/bso_icons`, and the item names/ids in the `bso_items.json` file.

### OSRS Item Updates

Item updates usually touch `packages/oldschooljs/src/assets/item_data.json`, `packages/oldschooljs/src/EItem.ts`, `packages/oldschooljs/src/EGear.ts`, `scripts/spritesheet.ts`, and the item spritesheet files.

First check whether `osrsreboxed-db` has newer item data than the commit pinned in `packages/oldschooljs/scripts/fetchRawItems.ts`:

```sh
git ls-remote https://github.com/0xNeffarion/osrsreboxed-db.git HEAD
```

If the SHA has changed, update the pinned SHA in `fetchRawItems.ts`, then run:

```sh
pnpm --dir packages/oldschooljs generate
```

If the pinned source is already current but new OSRS items exist in MOID/the wiki, use the scraper instead:

```sh
cd packages/oldschooljs
pnpm exec tsx --tsconfig scripts/tsconfig.json scripts/item-scraper.ts
pnpm exec tsx --tsconfig scripts/tsconfig.json scripts/itemsPostProcess.ts
cd ../..
```

After scraping, review the diff carefully. It should normally add new entries without deleting existing items. If the scraper rewrites JSON with spaces, reformat `item_data.json` back to the repo's tab-indented style before committing.

For items that need bot icons or enum entries, add their IDs to `itemsMustBeInSpritesheet` in `scripts/spritesheet.ts`, then run:

```sh
pnpm --filter oldschooljs build
pnpm spritesheet
pnpm --dir packages/oldschooljs enum
pnpm --filter oldschooljs build
```

If `pnpm spritesheet` fails because `https://cdn.oldschool.gg/icons/items/` is missing new icons, download the missing IDs into `tmp/icons` from the fallback URL mentioned in `scripts/spritesheet.ts` (`https://chisel.weirdgloop.org/static/img/osrs-sprite/<item_id>.png`), then rerun `pnpm spritesheet`.

Before opening the PR, run at least:

```sh
pnpm --dir packages/oldschooljs test:unit
pnpm --dir packages/oldschooljs test:types
pnpm test:lint
pnpm test:types
```
