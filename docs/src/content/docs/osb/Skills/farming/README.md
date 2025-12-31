---
title: "Farming"
---

Farming in the bot works like in-game: your minion is sent on planting or harvesting trips, and crops grow in the background. Patch access scales with your quest points, Farming level, and major quest unlocks such as *Children of the Sun*.

When harvesting trees, either:

- Meet the Woodcutting level (and receive logs), or
- Pay 200gp for a farmer to remove the tree (no logs)

Other farming activities:

- [Farming Contracts](farming-contracts)
- [Tithe Farm](tithe-farm)
- [Hespori](farmables#hespori)

---

## Farming Boosts

XP, speed, and harvest quantity can be boosted by the following:

- **Farmer's outfit**
  - Strawhat: +0.4% XP
  - Jacket/Shirt: +0.8% XP
  - Boro trousers: +0.6% XP
  - Boots: +0.2% XP
  - Full set: +2.5% XP **(works from bank)**
- **[Magic secateurs](../../Buyables/buyables.md#quest-items)** - 10% harvest quantity boost **(works from bank)**
- **Farming cape** - 5% harvest quantity boost **(works from bank)**
- **Full graceful outfit** - 10% trip speed **(must be equipped and charged)**
- **[Ring of endurance](../agility/hallowed-sepulchre.md#ring-of-endurance)** - 10% trip speed **(must be equipped in any setup and charged)**
- **Ardougne elite diary** - 4% trip speed when completed

---

## Commands

- [[/farming plant]] - Plant or harvest and replant
- [[/farming harvest]] - Harvest without replanting
- [[/farming check_patches]] - View patch status (includes an Auto Farm shortcut button when anything is ready)
- [[/farming auto_farm]] - Execute an auto farming trip
- [[/farming auto_farm_filter]] - Choose your auto farm filter
- [[/farming default_compost]] - Set the compost tier to auto apply
- [[/farming always_pay]] - Toggle automatic farmer payments

---

## Auto Farming

Use [[/farming auto_farm]] to harvest and replant every ready patch your current filter allows in a single trip. The command now:

- Builds a combined plan that spends the entire Farming trip length, chaining each patch back-to-back.
- Respects [[/farming auto_farm_filter]] choices (`AllFarm` to use your best seeds everywhere, `Replant` to stick to what was already growing).
- Applies your [[/farming default_compost]] choice and [[/farming always_pay]] setting automatically.
- Skips patches that would push the trip beyond the max duration or when you lack the required seeds, compost, or protection items.

See [Auto Farming](auto-farming.md) for a full breakdown, including resource handling and troubleshooting tips.

---

## Compost

- **Compost** - Buy for 400gp: [[/buy name:Compost]]
- **Supercompost** - Made via [[/farming compost_bin]] or dropped/bought
- **Ultracompost** - Use 2x Volcanic ash + 1x Supercompost: [[/create item:Ultracompost]]

---

## Farming Payment Creatables

Use [[/create]] to make crop protection bundles:

| **Item name**   | **Input items** |
| --------------- | --------------- |
| Tomatoes(5)     | 5 Tomato        |
| Tomato          | Tomatoes(5)     |
| Apples(5)       | 5 Cooking Apple |
| Cooking Apple   | Apples(5)       |
| Bananas(5)      | 5 Banana        |
| Banana          | Bananas(5)      |
| Strawberries(5) | 5 Strawberry    |
| Strawberry      | Strawberries(5) |
| Oranges(5)      | 5 Orange        |
| Orange          | Oranges(5)      |
| Potatoes(10)    | 10 Potato       |
| Potato          | Potatoes(10)    |
| Onions(10)      | 10 Onion        |
| Onion           | Onions(10)      |
| Cabbages(10)    | 10 Cabbage      |
| Cabbage         | Cabbages(10)    |

---

## Patch Unlocks

Patch counts depend on your quest points, Farming level, and quest progression. Unlocks are cumulative unless noted.

| Patch Type | Base patches | Unlocks |
| ---------- | ------------ | ------- |
| Herb | 4 | +1 @ 1 QP (Canifis), +1 @ 10 QP (Troll Stronghold), +1 @ 15 QP (Harmony), +1 @ 31 QP (Weiss), +1 @ 65 Farming (Farming Guild medium), +1 after *Children of the Sun* |
| Tree | 5 | +1 @ 65 Farming (Farming Guild medium), +1 after *Children of the Sun* |
| Allotment | 6 | +2 @ 1 QP (Canifis), +1 @ 15 QP (Harmony), +2 @ 33 QP (Prifddinas), +2 @ 45 Farming (Farming Guild low), +2 after *Children of the Sun* |
| Fruit tree | 4 | +1 @ 22 QP (Lletya), +1 @ 85 Farming (Farming Guild high), +1 after *Children of the Sun* |
| Seaweed | 0 | +2 @ 3 QP (Fossil Island submarine) |
| Flower | 4 | +1 once you unlock Canifis or Prifddinas flower patches, +1 @ 45 Farming (Farming Guild), +1 after *Children of the Sun* |
| Hardwood | 0 | +3 @ 3 QP (Fossil Island), +1 after *Children of the Sun* |
| Vine | 12 | Always available in the Hosidius vinery |
| Bush | 3 | +1 @ 3 QP (Etceteria), +1 @ 45 Farming (Farming Guild low) |
| Hops | 4 | No additional unlocks |
| Mushroom | 0 | +1 @ 1 QP (Canifis) |
| Belladonna | 1 | +1 after *Children of the Sun* |
| Cactus | 1 | +1 @ 45 Farming (Farming Guild low) |
| Hespori | 0 | +1 @ 65 Farming (Farming Guild medium) |
| Calquat | 1 | +1 after *Children of the Sun* |
| Crystal | 0 | +1 @ 33 QP (Prifddinas) |
| Spirit | 1 | +1 @ 91 Farming (Farming Guild high), +3 @ 99 Farming |
| Celastrus | 0 | +1 @ 85 Farming (Farming Guild high) |
| Redwood | 0 | +1 @ 85 Farming (Farming Guild high) |
