---
title: "Vale Totems"
---

Vale Totems is a [[fletching]] minigame where you build 8 totems per lap to earn Vale offerings, then rummage those offerings for loot and **Vale Research points**.

## Requirements

- [[fletching:20]]
- Completion of the **Children of the Sun** quest [[/activities quest name\:Children of the Sun]].
- 40 logs per lap (most options) or 72 logs per lap (shields).
- 32x [[Bow string]] per lap only if stringing complete bows.

## Quick Start

1. Start laps with [[/minigames vale_totems start]] and choose an item to fletch.
2. Complete laps to get Vale offerings.
3. Rummage offerings with [[/minigames vale_totems rummage]] (`100 offerings = 1 rummage roll = 1 research point`).
4. Spend points with [[/minigames vale_totems buy]].

## Auto-rummage

Auto-rummage can convert Vale offerings into loot/research points automatically at trip finish.

- Toggle button appears after Vale Totems trips: `Vale Offerings - Toggle Auto Rummage`
- You can also toggle it in config:
  [[/config user toggle name\:Auto Rummage Vale Offerings]]

## How Rewards Work

1. Every 100 offerings rummaged gives 1 loot roll and 1 Vale Research point.
2. Each loot roll has a **1% chance** to roll the unique table (`Bow string spool`, `Fletching knife`, `Greenman mask`).
3. The other **99%** rolls come from regular loot tables:
   resources/roots (`294/399`), seeds (`55/399`), nests (`50/399`).
4. Nest rolls give `1` nest below 80 Fletching, and `2` nests at 80+ Fletching.
5. Clue nests are tertiary on the resources/roots table with provisional rates:
   beginner `1/256`, easy `1/512`, medium `1/1024`, hard `1/2048`, elite `1/4096`.
   These are approximations until official numeric rates are known.

## Collection Log Item Rarity (Per 100 Offerings)

These rates are for OSB's rummage system (`100 offerings = 1 roll`).

Vale offerings is effectively guaranteed quickly (you earn offerings just by doing laps).  
For rummage uniques:

| Item | Chance per 100 offerings | Approx. average offerings |
| --- | --- | --- |
| [[Bow string spool]] | 1/200 (0.50%) | ~20,000 |
| [[Fletching knife]] | 1/333 (0.30%) | ~33,300 |
| [[Greenman mask]] | 1/500 (0.20%) | ~50,000 |
| [[Ent branch]] | ~1/6.2 (16.14%) | ~620 |

## Clue Nests

Clue nests are enabled in Vale Offerings.

- Beginner clue nest: rarest common tier (`~1/256`)
- Easy clue nest: very rare (`~1/512`)
- Medium clue nest: very rare (`~1/1024`)
- Hard clue nest: very rare (`~1/2048`)
- Elite clue nest: very rare (`~1/4096`)

These clue rates are currently documented as provisional in code until official rates are confirmed.

## Guaranteed CL Method (No RNG Needed)

You can buy all Vale Totems CL uniques directly from the exchange:

- [[Bow string spool]]: 250 points
- [[Fletching knife]]: 350 points
- [[Greenman mask]]: 500 points
- [[Ent branch]]: 20 points

Total for all four items: **1,120 points**.

## Decorations

| **Item**     | **Oak** | **Willow** | **Maple** | **Yew** | **Magic** | **Redwood** |
| ------------ | ------- | ---------- | --------- | ------- | --------- | ----------- |
| Shortbow (u) |   [x]   |     [x]    |    [x]    |   [x]   |    [x]    |     [ ]     |
| Shortbow     |   [x]   |     [x]    |    [x]    |   [x]   |    [x]    |     [ ]     |
| Longbow (u)  |   [x]   |     [x]    |    [x]    |   [x]   |    [x]    |     [ ]     |
| Longbow      |   [x]   |     [x]    |    [x]    |   [x]   |    [x]    |     [ ]     |
| Shield       |   [x]   |     [x]    |    [x]    |   [x]   |    [x]    |     [x]     |
| Stock        |   [x]   |     [x]    |    [x]    |   [x]   |    [x]    |     [ ]     |
| Hiking staff |   [ ]   |     [ ]    |    [ ]    |   [ ]   |    [ ]    |     [x]     |

## Offerings Per Lap

| Logs | Offerings/lap |
| --- | --- |
| Oak | 160 |
| Willow | 240 |
| Maple | 320 |
| Yew | 520 |
| Magic | 720 |
| Redwood | 840 |

## Time, Boosts, And Penalties

- [[agility:25]]: bank shortcut bonus (when not using [[Log basket]]/[[Forestry basket]])
- [[agility:45]]: log balance shortcut bonus
- [[agility:70]]: no stamina slowdown (and chosen stamina dose is not consumed)
- [[Fletching knife]]: faster laps
- [[Bow string spool]]: faster stringing laps
- Full Graceful: faster laps
- Shields use 72 logs and add extra lap time
- Up to +10% offerings from Vale Totems score progression

## Best Methods

### Best For CL / Points

- Use the highest logs you can sustain (Redwood > Magic > Yew > Maple... for offerings/hr).
- Prefer non-shield options for better points efficiency.
- Hit the key breakpoints: 45 Agility, then 70 Agility.
- Keep [[Fletching knife]] and full Graceful equipped/in-bank.
- Only care about [[Bow string spool]] if you are stringing complete bows.

### Best For Fletching XP

- Shields are usually better XP per lap, but slower and more expensive.
- If your goal is CL/points, shields are generally worse value than non-shield laps.

## Reference Offerings/Hour (Base Lap Speeds)

These are baseline values before personal boosts/penalties:

- Oak: ~2,504 offerings/hr
- Willow: ~3,757 offerings/hr
- Maple: ~5,009 offerings/hr
- Yew: ~7,641 offerings/hr
- Magic: ~8,938 offerings/hr
- Redwood hiking staff: ~9,164 offerings/hr
- Redwood shield: ~8,400 offerings/hr

## Vale Research Exchange

The following items can be purchased with **Vale research points** using the [[/minigames vale_totems buy]] command.

| **Item**             | **Sold at** | **Bought at** |
| ---------------------| :---------: | ------------- |
| [[Bow string spool]] |     250     |      125      |
| [[Fletching knife]]  |     350     |      175      |
| [[Greenman mask]]    |     500     |      125      |
| [[Ent branch]]       |     20      |      N/A      |

To sell an item, use the [[/minigames vale_totems sell]] command.
Only Ironman accounts can sell [[Greenman mask]].
