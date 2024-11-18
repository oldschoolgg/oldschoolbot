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
- [Magic secateurs](../../miscellaneous/buyables.md#quest-items) - 10% to harvest quantity (stacks with Farming cape)
- Farming cape - 5% to harvest quantity (stacks with Magic secateurs)
- Full graceful outfit - 10% to trip speed **(must be equipped in any setup)**
- [Ring of endurance](../agility/hallowed-sepulchre.md#ring-of-endurance) - 10% to trip speed **(works from bank but**\*\* \*\*\*\*must be charged)\*\*

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

<table data-header-hidden><thead><tr><th width="166">Patch type</th><th width="113" align="center">Base patches</th><th width="186" align="center">Number of possible additional patches</th><th align="center">Additional patch requirements</th></tr></thead><tbody><tr><td><strong>Patch type</strong></td><td align="center"><strong>Base patches</strong></td><td align="center"><strong>Number of possible additional patches</strong></td><td align="center"><strong>Additional patch requirements</strong></td></tr><tr><td>Herb</td><td align="center">4</td><td align="center">6</td><td align="center">65 Farming, completion of Children of the Sun quest, and 1, 10, 15, &#x26; 31 QP</td></tr><tr><td>Tree</td><td align="center">5</td><td align="center">1</td><td align="center">65 Farming</td></tr><tr><td>Allotment</td><td align="center">8</td><td align="center">9</td><td align="center">45 Farming, completion of Children of the Sun quest, and 1, 15, &#x26; 33 QP</td></tr><tr><td>Fruit tree</td><td align="center">4</td><td align="center">2</td><td align="center">85 Farming and 22 QP</td></tr><tr><td>Seaweed</td><td align="center">0</td><td align="center">2</td><td align="center">22 QP</td></tr><tr><td>Flower</td><td align="center">4</td><td align="center">4</td><td align="center">45 Farming and 1 &#x26; 33 QP</td></tr><tr><td>Hardwood</td><td align="center">0</td><td align="center">3</td><td align="center">3 QP</td></tr><tr><td>Vine</td><td align="center">12</td><td align="center">0</td><td align="center">-</td></tr><tr><td>Bush</td><td align="center">3</td><td align="center">2</td><td align="center">45 Farming and 3 QP</td></tr><tr><td>Hops</td><td align="center">4</td><td align="center">0</td><td align="center">-</td></tr><tr><td>Mushroom</td><td align="center">1</td><td align="center">0</td><td align="center">-</td></tr><tr><td>Belladonna</td><td align="center">1</td><td align="center">0</td><td align="center">-</td></tr><tr><td>Cactus</td><td align="center">1</td><td align="center">1</td><td align="center">45 Farming</td></tr><tr><td>Hespori</td><td align="center">1</td><td align="center">0</td><td align="center">-</td></tr><tr><td>Calquat</td><td align="center">1</td><td align="center">0</td><td align="center">-</td></tr><tr><td>Crystal</td><td align="center">0</td><td align="center">1</td><td align="center">33 QP</td></tr><tr><td>Spirit</td><td align="center">1</td><td align="center">4</td><td align="center">91 and 99 Farming</td></tr><tr><td>Celastrus</td><td align="center">0</td><td align="center">1</td><td align="center">85 Farming</td></tr><tr><td>Redwood</td><td align="center">0</td><td align="center">1</td><td align="center">85 Farming</td></tr></tbody></table>
