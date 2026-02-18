---
title: "Double Loot"
---

Double Loot is a global timed buff. If active, qualifying loot rolls are doubled.

## How it is activated

- Using [[Double loot token]] adds a **random 6–36 minutes**.
- Patreon tier rewards can add time.
- Staff/tester tooling can add time.

## Where it applies

- Most monster/minion trips when trip duration is long enough.
- Several BSO custom activities directly apply Double Loot internally.

## Global trip doubler rules

The generic trip doubler runs only when:

- Trip has loot.
- Trip duration is at least **20 minutes**.
- Activity type is not in the exclusion list.

Exclusion list in the generic handler:

- GroupMonsterKilling
- KingGoldemar
- Ignecarus
- Inferno
- Alching
- Agility

When it procs, it gives 2x trip loot and an extra mystery box roll.

## Example

If your trip loot is `100x Rune ore` and the doubler procs, you receive another `100x Rune ore` plus extra mystery-box loot.
