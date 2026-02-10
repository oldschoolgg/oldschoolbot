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


## XP and reward rates by level

The table below is generated from the in-game calculation logic (`calculateStealingArtefactsXpPerHour`) for every Thieving level from 49 to 99.

<!-- rates-table:start -->
| Level | XP/hr (No tele, Graceful + stamina) | XP/hr (Tele, Graceful + stamina) | XP/hr (Tele, Graceful only) | XP/hr (Tele, stamina only) | XP/hr (Tele, no Graceful/stamina) | Deliveries/hr (Tele, Graceful + stamina) | Coins/hr range (Tele, Graceful + stamina) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 49 | 130,080 | 150,000 | 143,878 | 143,878 | 89,621 | 55 | 27,500-55,000 |
| 50 | 132,000 | 152,166 | 146,300 | 146,300 | 91,090 | 55 | 27,500-55,000 |
| 51 | 133,920 | 154,333 | 148,722 | 148,722 | 92,560 | 55 | 27,500-55,000 |
| 52 | 135,840 | 156,500 | 151,144 | 151,144 | 94,029 | 55 | 27,500-55,000 |
| 53 | 137,760 | 158,666 | 153,566 | 153,566 | 95,498 | 55 | 27,500-55,000 |
| 54 | 139,680 | 160,833 | 155,988 | 155,988 | 96,967 | 55 | 27,500-55,000 |
| 55 | 141,600 | 163,000 | 158,410 | 158,410 | 98,436 | 55 | 27,500-55,000 |
| 56 | 143,520 | 165,200 | 160,832 | 160,832 | 99,905 | 55 | 27,500-55,000 |
| 57 | 145,440 | 167,400 | 163,254 | 163,254 | 101,374 | 55 | 27,500-55,000 |
| 58 | 147,360 | 169,600 | 165,676 | 165,676 | 102,843 | 55 | 27,500-55,000 |
| 59 | 149,280 | 171,800 | 168,098 | 168,098 | 104,312 | 55 | 27,500-55,000 |
| 60 | 151,200 | 174,000 | 170,520 | 170,520 | 105,781 | 55 | 27,500-55,000 |
| 61 | 153,120 | 176,400 | 172,942 | 172,942 | 107,250 | 55 | 27,500-55,000 |
| 62 | 155,040 | 178,800 | 175,364 | 175,364 | 108,719 | 55 | 27,500-55,000 |
| 63 | 156,960 | 181,200 | 177,786 | 177,786 | 110,188 | 55 | 27,500-55,000 |
| 64 | 158,880 | 183,600 | 180,208 | 180,208 | 111,657 | 55 | 27,500-55,000 |
| 65 | 160,800 | 186,000 | 182,630 | 182,630 | 113,126 | 55 | 27,500-55,000 |
| 66 | 162,720 | 188,200 | 185,052 | 185,052 | 114,595 | 55 | 27,500-55,000 |
| 67 | 164,640 | 190,400 | 187,474 | 187,474 | 116,064 | 55 | 27,500-55,000 |
| 68 | 166,560 | 192,600 | 189,896 | 189,896 | 117,533 | 55 | 27,500-55,000 |
| 69 | 168,480 | 194,800 | 192,318 | 192,318 | 119,002 | 55 | 27,500-55,000 |
| 70 | 170,400 | 197,000 | 194,740 | 194,740 | 120,471 | 55 | 27,500-55,000 |
| 71 | 172,320 | 199,200 | 197,162 | 197,162 | 121,940 | 55 | 27,500-55,000 |
| 72 | 174,240 | 201,400 | 199,584 | 199,584 | 123,409 | 55 | 27,500-55,000 |
| 73 | 176,160 | 203,600 | 202,006 | 202,006 | 124,878 | 55 | 27,500-55,000 |
| 74 | 178,080 | 205,800 | 204,428 | 204,428 | 126,347 | 55 | 27,500-55,000 |
| 75 | 180,000 | 208,000 | 206,850 | 206,850 | 127,816 | 55 | 27,500-55,000 |
| 76 | 181,920 | 210,200 | 209,272 | 209,272 | 129,285 | 55 | 27,500-55,000 |
| 77 | 183,840 | 212,400 | 211,694 | 211,694 | 130,754 | 55 | 27,500-55,000 |
| 78 | 185,760 | 214,600 | 214,116 | 214,116 | 132,223 | 55 | 27,500-55,000 |
| 79 | 187,680 | 216,800 | 216,538 | 216,538 | 133,692 | 55 | 27,500-55,000 |
| 80 | 189,600 | 219,000 | 218,960 | 218,960 | 135,161 | 55 | 27,500-55,000 |
| 81 | 191,520 | 221,200 | 221,200 | 221,200 | 136,630 | 55 | 27,500-55,000 |
| 82 | 193,440 | 223,400 | 223,400 | 223,400 | 138,099 | 55 | 27,500-55,000 |
| 83 | 195,360 | 225,600 | 225,600 | 225,600 | 139,568 | 55 | 27,500-55,000 |
| 84 | 197,280 | 227,800 | 227,800 | 227,800 | 141,037 | 55 | 27,500-55,000 |
| 85 | 199,200 | 230,000 | 230,000 | 230,000 | 142,506 | 55 | 27,500-55,000 |
| 86 | 201,120 | 232,200 | 232,200 | 232,200 | 143,975 | 55 | 27,500-55,000 |
| 87 | 203,040 | 234,400 | 234,400 | 234,400 | 145,444 | 55 | 27,500-55,000 |
| 88 | 204,960 | 236,600 | 236,600 | 236,600 | 146,913 | 55 | 27,500-55,000 |
| 89 | 206,880 | 238,800 | 238,800 | 238,800 | 148,382 | 55 | 27,500-55,000 |
| 90 | 208,800 | 241,000 | 241,000 | 241,000 | 149,851 | 55 | 27,500-55,000 |
| 91 | 210,720 | 243,200 | 243,200 | 243,200 | 151,320 | 55 | 27,500-55,000 |
| 92 | 212,640 | 245,400 | 245,400 | 245,400 | 152,789 | 55 | 27,500-55,000 |
| 93 | 214,560 | 247,600 | 247,600 | 247,600 | 154,258 | 55 | 27,500-55,000 |
| 94 | 216,480 | 249,800 | 249,800 | 249,800 | 155,727 | 55 | 27,500-55,000 |
| 95 | 218,400 | 252,000 | 252,000 | 252,000 | 157,196 | 55 | 27,500-55,000 |
| 96 | 220,320 | 254,250 | 254,250 | 254,250 | 158,665 | 55 | 27,500-55,000 |
| 97 | 222,240 | 256,500 | 256,500 | 256,500 | 160,134 | 55 | 27,500-55,000 |
| 98 | 224,160 | 258,750 | 258,750 | 258,750 | 161,603 | 55 | 27,500-55,000 |
| 99 | 226,080 | 261,000 | 261,000 | 261,000 | 163,072 | 55 | 27,500-55,000 |
<!-- rates-table:end -->
