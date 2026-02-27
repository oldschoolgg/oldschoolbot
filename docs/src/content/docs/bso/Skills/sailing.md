---
title: "Sailing"
---

### Status

Sailing is in active development. This page reflects what is currently implemented and is expected to change.

### Commands

- `/sail` - Start a Sailing activity. Supports `activity`, `variant`, and `quantity`.
- `/ship` - View and upgrade your ship, install facilities.

### Core Systems

- Facilities unlock specific activities.

### Activities

Activities currently implemented:

- Sea charting
- Port tasks (courier, bounty)
- Shipwreck salvaging
- Barracuda Trials (Tempor Tantrum, Jubbly Jive, Gwenith Glide)
- Deep sea trawling

### Ocean Encounters

Ocean encounters are random events that can occur while Sailing. Implemented encounters:

- Clue turtles (Easy/Medium/Hard/Elite by level range; 50 Sailing XP)
- Castaways (15x Sailing level XP)
- Lost caskets (beginner through master; adds the casket item, roll not yet implemented)
- Lost shipments (wooden through ironwood crates; adds the crate item, roll not yet implemented)
- Mysterious glow (chain XP by level and a gem reward)
- Ocean Man (cocktail drop)
- Giant clam (pearls based on item value; adds pearl + XP, requires feeding)

Not yet implemented due to missing detail:

- Strong winds (needs XP/behavior details)

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
- Racing sails (Barracuda Trials)
- Inoculation station (higher-tier Barracuda Trials)
- Crystal extractor (periodic Sailing XP during trips; requires 73 Sailing and 67 Construction, built with Heart of Ithell, Ironwood planks, Cupronickel bars, and Magic stones)

### Not Yet Implemented

- First-completion bonuses and tier unlocks for Barracuda Trials
- Scoreboard tracking and fastest completion times
- One-time Barracuda Trials rewards (keys, fabrics, facilities)
- Skiff-only restriction for Barracuda Trials
- Wind/gale mote and catcher usage
