---
title: "Sailing"
---

### Status

Sailing is in active development. This page reflects what is currently implemented and is expected to change.

### Commands

- `/sail` - Start a Sailing activity. Supports `activity`, `region`, `difficulty`, `variant`, and `quantity`.
- `/ship` - View and upgrade your ship, install facilities, and see unlocked regions.

### Core Systems

- Regions are unlocked using charts. The first time you sail a locked region, charts are consumed to unlock it.
- Difficulty tiers affect time, XP, loot, and risk.
- Hazards can cause failures and reduce XP/loot.
- Facilities unlock specific activities.

### Activities

Standard activities include sea charting, port tasks, shipwreck salvaging, survey, deep sea trawling, mineral dredging, sea monster hunting, and coral farming.

### Barracuda Trials

Three trials are implemented as separate activities:

- The Tempor Tantrum (level 30)
- The Jubbly Jive (level 55)
- The Gwenith Glide (level 72)

Each trial supports three tiers via variants:

- Swordfish
- Shark
- Marlin

Clearing Gwenith Glide on Shark rank within 3:42 awards a Heart of Ithell (reclaimable by repeating the clear if lost).

### Facilities

Facilities are installed on your ship to unlock content. Examples include:

- Captain's log (sea charting)
- Salvaging hook (shipwreck salvaging)
- Fishing station (deep sea trawling)
- Enchanted metal detector (survey)
- Weighted dredging net (mineral dredging)
- Harpoon mount (sea monster hunting)
- Coral pens (coral farming)
- Racing sails (Barracuda Trials)
- Inoculation station (higher-tier Barracuda Trials)
- Crystal extractor (periodic Sailing XP during trips; requires 73 Sailing and 67 Construction, built with Heart of Ithell, Ironwood planks, Cupronickel bars, and Magic stones)

### Not Yet Implemented

- First-completion bonuses and tier unlocks for Barracuda Trials
- Scoreboard tracking and fastest completion times
- One-time Barracuda Trials rewards (keys, fabrics, facilities)
- Skiff-only restriction for Barracuda Trials
- Wind/gale mote and catcher usage
