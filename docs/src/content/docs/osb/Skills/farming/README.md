---
title: "Farming"
---

Farming in the bot works like in-game: your minion is sent on planting/harvesting trips, and crops grow in the background. The number of available patches increases with your quest points and farming level.

When harvesting trees, either:

- Meet the woodcutting level (and receive logs), or
- Pay 200gp for a farmer to remove the tree (no logs)

Other farming activities:

- [Farming Contracts](farming-contracts.md)
- [Tithe Farm](tithe-farm.md)
- [Hespori](farmables.md#hespori)

---

## Farming Boosts

XP, speed, and harvest quantity can be boosted by the following:

- **Farmer's outfit**

  - Strawhat: +0.4% XP
  - Jacket/Shirt: +0.8% XP
  - Boro trousers: +0.6% XP
  - Boots: +0.2% XP
  - Full set: +2.5% XP **(works from bank)**

- **[Magic secateurs](../../Buyables/buyables.md#quest-items)** – 10% harvest quantity boost **(works from bank)**
- **Farming cape** – 5% harvest quantity boost **(works from bank)**
- **Full graceful outfit** – 10% trip speed **(must be equipped and charged)**
- **[Ring of endurance](../agility/hallowed-sepulchre.md#ring-of-endurance)** – 10% trip speed **(must be equipped in any setup and charged)**

---

## Commands

- [[/farming plant]] – Plant or harvest & replant
- [[/farming harvest]] – Harvest only
- [[/farming check_patches]] – View patch status
- [[/farming auto_farm]] – Auto-plant highest seed
- [[/farming auto_farm_filter]] – Set auto-farm filter
- [[/farming default_compost]] – Auto apply compost
- [[/farming always_pay]] – Auto apply protection

---

## Auto Farm

Auto farming automatically plants seeds based on your filter.

- **All Farm** – [[/farming auto_farm_filter auto_farm_filter_data\:AllFarm]]  
  Plants the highest seed in every patch

- **Replant** – [[/farming auto_farm_filter auto_farm_filter_data\:Replant]]  
  Replants the same seed in only the patches that had it  
  _(Empty other patches using [[/farming harvest]] for better control)_

---

## Compost

- **Compost** – Buy for 400gp: [[/buy name\:Compost]]
- **Supercompost** – Made via [[/farming compost_bin]] or dropped/bought
- **Ultracompost** – Use 2× Volcanic ash + 1× Supercompost:  
  [[/create item\:Ultracompost]]

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

## Farming Patches

| Patch Type | Base | Additional | Requirement Notes                                  |
| ---------- | ---- | ---------- | -------------------------------------------------- |
| Herb       | 4    | 6          | [[farming:65]], Children of the Sun, 1/10/15/31 QP |
| Tree       | 5    | 1          | [[farming:65]]                                     |
| Allotment  | 8    | 9          | [[farming:45]], Children of the Sun, 1/15/33 QP    |
| Fruit tree | 4    | 2          | [[farming:85]] and 22 QP                           |
| Seaweed    | 0    | 2          | 22 QP                                              |
| Flower     | 4    | 4          | [[farming:45]] and 1/33 QP                         |
| Hardwood   | 0    | 3          | 3 QP                                               |
| Vine       | 12   | 0          | -                                                  |
| Bush       | 3    | 2          | [[farming:45]] and 3 QP                            |
| Hops       | 4    | 0          | -                                                  |
| Mushroom   | 1    | 0          | -                                                  |
| Belladonna | 1    | 0          | -                                                  |
| Cactus     | 1    | 1          | [[farming:45]]                                     |
| Hespori    | 1    | 0          | -                                                  |
| Calquat    | 1    | 0          | -                                                  |
| Crystal    | 0    | 1          | 33 QP                                              |
| Spirit     | 1    | 4          | [[farming:91]] and [[farming:99]]                  |
| Celastrus  | 0    | 1          | [[farming:85]]                                     |
| Redwood    | 0    | 1          | [[farming:85]]                                     |
