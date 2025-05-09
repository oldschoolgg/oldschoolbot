---
title: "Farming"
---

Farming in the bot works like farming ingame, where you will send your minion off on planting and/or harvesting trips, and your crops will grow in the background as you do other activities. The number of patches you have available will increase with the number of quest points you have and your farming level.

When harvesting trees, you will either need the woodcutting level necessary to chop down the tree (which will award logs), or if you lack the necessary woodcutting level, 200gp for a farmer to remove the tree for you (which will not award logs).

Other farming activities that can be utilised are:

- [Farming Contracts](farming-contracts.md)
- [Tithe Farm](tithe-farm.md)
- [Hespori](farmables.md#hespori)

---

## **Farming Boosts**

The speed of your farming trips and the xp you gain from farming activities can both be boosted, as well as the quantity of items harvested. The following items provide boosts to the farming skill:

- Farmers strawhat - 0.4% to XP
- Farmers jacket/shirt - 0.8% to XP
- Farmers boro trousers - 0.6% to XP
- Farmers boots - 0.2% to XP
- Full Farmers outfit - 2.5% to XP **(works from bank)**
- [Magic secateurs](../../miscellaneous/buyables.md#quest-items) - 10% to harvest quantity (stacks with Farming cape) **(works from bank)**
- Farming cape - 5% to harvest quantity (stacks with Magic secateurs) **(works from bank)**
- Full graceful outfit - 10% to trip speed **(must be equipped and charged for harvesting)**
- [Ring of endurance](../agility/hallowed-sepulchre.md#ring-of-endurance) - 10% to trip speed **(must be equipped in any setup and must be charged**)\*\*

---

## Commands

To plant your first crops, use: `/farming plant`

To harvest your crop without replanting, use: `/farming harvest`

To harvest your crop with replanting, use: `/farming plant`

To view your patches status and the time remaining, use: `/farming check_patches`

To automatically plant the highest level seed in each patch, use: `/farming auto_farm`

To set your [auto farm](./#auto-farm) filter, use: `/farming auto_farm_filter`

To automatically [apply compost](./#compost) to your patches, use: `/farming default_compost`

To automatically [protect your crops](./#farming-payment-creatables) with payment, use: `/farming always_pay`

---

## Auto Farm

Auto farming allows your minion to automatically plant seeds in each of your available patches. The default setting is set to All Farm, where it will plant the highest seed available. There are two filters you can set when doing auto farming. These are:

- All Farm - `/farming auto_farm_filterauto_farm_filter_data:AllFarm`
  - This filter will automatically plant the highest seed available for all your available patches. You cannot choose to skip certain patches, it will always plant for all available.
- Replant - `/farming auto_farm_filterauto_farm_filter_data:Replant`
  - This filter will automatically plant the same seed in specific patches. You should empty your other patches with `/farming harvest` to make this filter more effective. For example, if you only want to auto farm snapdragon seeds, all your other patches should be empty and auto farm will simply continue to plant snapdragons and nothing else.

---

## Compost

Regular compost is buyable from the bot (400gp ea) by using: `/buyname: ``Compost`

Supercompost can be made from a variety of materials by using:`/farming compost_bin`\
It can also be dropped by [wilderness bosses](../../bosses/boosts-and-requirements.md#callisto-vetion-venenatis-inc.-singles-versions) or bought through [Tithe Farm minigame](tithe-farm.md).

Ultracompost can be made with 2 Volcanic ash + 1 Supercompost and then by using: \
`/createitem:Ultracompost`

---

## **Farming Payment Creatables**

Crops can be protected by using the pay option on farming commands. Protection costs can be found on the [Farming training](https://oldschool.runescape.wiki/w/Farming_training) page of the OSRS Wiki. Protecting your crops will prevent them from dying at all, and most crops can be both protected and composted, if you wish to stack their properties. These payment bundles can be created using the `/create` command and works for most common crops such as potatoes, tomatoes, strawberries, bananas, oranges, etc, and are often taken in groups of 5 or 10.

| **Item name**   | **Input items** |
| --------------- | :-------------: |
| Tomatoes(5)     |    5 Tomato     |
| Tomato          |   Tomatoes(5)   |
| Apples(5)       | 5 Cooking Apple |
| Cooking Apple   |    Apples(5)    |
| Bananas(5)      |    5 Banana     |
| Banana          |   Bananas(5)    |
| Strawberries(5) |  5 Strawberry   |
| Strawberry      | Strawberries(5) |
| Oranges(5)      |    5 Orange     |
| Orange          |   Oranges(5)    |
| Potatoes(10)    |    10 Potato    |
| Potato          |  Potatoes(10)   |
| Onions(10)      |    10 Onion     |
| Onion           |   Onions(10)    |
| Cabbages(10)    |   10 Cabbage    |
| Cabbage         |  Cabbages(10)   |

---

## **Farming Patches**

| Patch type | Base patches | Additional patches | Additional patch requirements                             |
| ---------- | ------------ | ------------------ | --------------------------------------------------------- |
| Herb       | 4            | 6                  | 65 Farming, Children of the Sun quest, 1, 10, 15, & 31 QP |
| Tree       | 5            | 1                  | 65 Farming                                                |
| Allotment  | 8            | 9                  | 45 Farming, Children of the Sun quest, 1, 15, & 33 QP     |
| Fruit tree | 4            | 2                  | 85 Farming and 22 QP                                      |
| Seaweed    | 0            | 2                  | 22 QP                                                     |
| Flower     | 4            | 4                  | 45 Farming and 1 & 33 QP                                  |
| Hardwood   | 0            | 3                  | 3 QP                                                      |
| Vine       | 12           | 0                  | -                                                         |
| Bush       | 3            | 2                  | 45 Farming and 3 QP                                       |
| Hops       | 4            | 0                  | -                                                         |
| Mushroom   | 1            | 0                  | -                                                         |
| Belladonna | 1            | 0                  | -                                                         |
| Cactus     | 1            | 1                  | 45 Farming                                                |
| Hespori    | 1            | 0                  | -                                                         |
| Calquat    | 1            | 0                  | -                                                         |
| Crystal    | 0            | 1                  | 33 QP                                                     |
| Spirit     | 1            | 4                  | 91 and 99 Farming                                         |
| Celastrus  | 0            | 1                  | 85 Farming                                                |
| Redwood    | 0            | 1                  | 85 Farming                                                |
