---
title: "Stealing artefacts"
---

Stealing artefacts is a thieving minigame that focuses on delivery runs for coins and solid Thieving experience. Start a trip with [[/minigames stealing_artefacts start]].

## Requirements

- [[thieving:49]]

## How it works

- Each delivery awards coins (500-1,000 per delivery).
- Your deliveries per hour depend on whether you have access to the teleport efficiency route and whether you bring stamina or wear Graceful.
- Not wearing Graceful applies a **-30%** penalty, and skipping stamina applies another **-30%** penalty.
- Teleport efficiency raises the base delivery rate (requires **Kharedst's memoirs** or **Book of the dead** in your bank/equipment).

### Starting a trip

- [[/minigames stealing_artefacts start]]
- [[/minigames stealing_artefacts start quantity:10]]
- [[/minigames stealing_artefacts start stamina:true teleport:true]]

## Glassblowing while stealing artefacts

You can glassblow while doing deliveries to gain Crafting XP without reducing your Thieving XP rates. The trip duration will be capped if you run out of Molten glass for the selected product.

Start glassblowing by adding the `glassblow_product` option:

- [[/minigames stealing_artefacts start glassblow_product:vial]]
- [[/minigames stealing_artefacts start quantity:20 glassblow_product:lantern_lens]]

Glassblowing consumes **1 Molten glass** per item and caps Crafting XP at 70,000 XP/hr.

### Available glassblowing products

| Product | Crafting level | Crafting XP | Command value |
| --- | --- | --- | --- |
| Beer glass | 1 | 17.5 | `beer_glass` |
| Empty candle lantern | 4 | 19 | `empty_candle_lantern` |
| Empty oil lamp | 12 | 25 | `empty_oil_lamp` |
| Vial | 33 | 35 | `vial` |
| Empty fishbowl | 42 | 42.5 | `empty_fishbowl` |
| Unpowered orb | 46 | 52.5 | `unpowered_orb` |
| Lantern lens | 49 | 55 | `lantern_lens` |
| Empty light orb | 87 | 70 | `empty_light_orb` |
