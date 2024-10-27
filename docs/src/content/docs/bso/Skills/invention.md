---
title: "Invention"
---

Invention is a skill where you disassemble items to get materials, and then use those materials to make inventions. Inventions are items which give you boosts and perks, at the cost of materials. You need level 90 Crafting to train Invention.

All aspects of the Invention skill are accessed using `/invention`

Invention has a minigame, [Tinkering Workshop](../../minigames/tinkering-workshop.md).

## Disassembling

- Using `/invention disassemble` , select the item you want to disassemble.
- You will disassemble those items into materials. The materials you get are dependent on the _group_ the item is in. For example, items in the _Food_ group will give _Organic_ materials at a 100% ratio. However, some items are obviously more valuable, like a Shark vs a Trout. Check out `/invention tools command:Material Groups for a full list of items you can disassemble.`
- Use `/invention materials` to see what materials you own. Note: They are not tradeable, and cannot be transferred to other players.
- The difference between items (e.g. Shark vs Trout) is their _level_, a Shark has a higher level - and the level determines the _Junk Chance_ of the item, so a Shark is much less likely to become junk. Everything has a chance (high or small) of becoming junk.
- The amount of XP you get from disassembly is dependent on the level of the item and your invention level.

## Research

- Now you have materials!
- Use `/invention research` to research with a particular material type, effectively sending your minion to use this material and try to research and discover things it can make with it.
- If successful, you will discover a _blueprint_ which uses the material that you are researching with. For example, if a particular invention uses _sharp_ materials, and you're researching with _sharp_ materials, you have a chance to unlock the blueprint for it.
- Blueprints only need to be unlocked once, and they grant you the ability to create that invention.

## Inventing

- Now you have materials, and the blueprint for the Invention you want!
- Use `/invention invent` to create the particular invention you want.
- Inventions cost _materials_ to make, and some inventions cost items to make. These are one-time costs.
- Once you have made an invention, if its one that works from the bank, its ready to go! If it's one that needs to be equipped (like Silverhawk boosts), then you'll need to equip them.
- Inventions cost a small amount of _materials_ each time you use them.
- You can use `/config user toggle_invention invention:name` to temporarily toggle a invention off, if you don't want to use it.
- That's it! Your inventions will never break or need to be created again. You cannot trade inventions.

## Inventions

<table><thead><tr><th width="259.77486910994764">Invention (level)</th><th>Effect</th><th>Materials [Weight]</th></tr></thead><tbody><tr><td>Superior Bonecrusher (70)</td><td>25% bonus xp over Gorajan Bonecrusher</td><td>Pious[5] Sharp[1] Magic[4]</td></tr><tr><td>Dwarven Toolkit (80)</td><td>35% speed boost to disassembly</td><td>Dwarven[8] Metallic[2]</td></tr><tr><td>Superior Inferno Adze (80)</td><td>Automatically burns logs chopped and smelts ores mined. Costs nothing to use.</td><td>Sharp[3] Base[3] Metallic[1] Magic[3]</td></tr><tr><td>Superior Dwarf Multicannon (80)</td><td>37%-65% speed boost to pvm when cannoning</td><td>Strong[4] Heavy[2] Metallic[4]</td></tr><tr><td>Mecha Rod (85)</td><td>45% speed boost to fishing</td><td>Flexible[5] Organic[3] Strong[2]</td></tr><tr><td>Master Hammer and Chisel (90)</td><td>45% speed boost to crafting</td><td>Simple[3] Sharp[2] Metallic[2] Swift[3]</td></tr><tr><td>Quick Trap (90)</td><td>25% speed boost to box-trap hunting</td><td>Precious[1] Magic[6] Organic[3]</td></tr><tr><td>Silverhawk Boots (90)</td><td>1.9x speed boost to agility, up to 36k agility xp/hr <em>fully</em> passive (Must be equipped)</td><td>Swift[5] Protective[1] Dextrous[4]<br></td></tr><tr><td>Mecha Mortar (95)</td><td>45% speed boost to herblore</td><td>Organic[8] Metallic[2]</td></tr><tr><td>Portable Tanner (95)</td><td>Tans hides you get from PvM</td><td>Metallic[2] Plated[3] Organic[5]</td></tr><tr><td>Chincannon (100)</td><td>60% speed boost to raids at cost of raid loot.</td><td>Explosive (10)</td></tr><tr><td>Wisp-buster (100)</td><td>30% xp boost to Divination</td><td>Pious[4] Powerful[1] Magic[4] Heavy[1]</td></tr><tr><td>Divine Hand (100)</td><td>30% boost to energy yield in Divination</td><td>Pious[2] Magic[7] Strong[1]</td></tr><tr><td>Drygore axe (100)</td><td>10x success multiplier to woodcutting (Compared to 8x for Dwarven)</td><td>Drygore[7] Sharp[3]</td></tr><tr><td>Moonlight Mutator (100)</td><td>Converts random seeds into zyogmite spores</td><td>Organic[5] Magic[5]</td></tr><tr><td>Webshooter (100)</td><td>20% speed boost to all hunting and 30% boost to passive implings</td><td>Strong[4] Flexible[4] Organic[2]</td></tr><tr><td>Drygore Saw (105)</td><td>40% speed boost to construction</td><td>Drygore[7] Sharp[3]</td></tr><tr><td>Arcane Harvester (110)</td><td>Increases farming yield by 100%</td><td>Organic[5] Magic[5]</td></tr><tr><td>Clue Upgrader (110)</td><td>Chance to upgrade Beginner-Elite clues to next tier when received as loot in PvM.</td><td>Treasured[8] Metallic[2]</td></tr><tr><td>Abyssal Amulet (120)</td><td>Boosts runecrafting by varying amounts depending on the rune</td><td>Magic[4] Metallic[2] Treasured[2]</td></tr><tr><td>RoboFlappy (120)</td><td>Provides double loot from minigames, replicates the effect of the discontinued pet <a href="../../custom-items/pets.md#discontinued-pets">Flappy</a> but with material costs</td><td>Magic[4] Organic[2] Metallic[4]</td></tr></tbody></table>

## Tips

- There are bank filters for every material to show all items in your bank which give a particular material. For example, if you want _sharp_ materials, you could do `/bank filter:sharp-material` to see all items you can disassemble to get some
- If your goal is just to train Invention, or to reach level 120, you can just disassemble cheap items! You don't have to disassemble expensive, valuable items.
- There's a collection log for Invention, showing all the Inventions, and the pet it comes with.

## Boosts

- Inventor's Outfit - 4% xp boost to disassemble

### Disassembly Boosts

#### Master capes Disassembly Boosts

Master capes give a 5% junk chance reduction for a group relating to their skill. For example, the Mining master cape reduces the junk chance of the Ores group by 5% - meaning that when you're disassembling items from the Ores group, you'll be getting effectively 5% more materials!

| Master cape              | Group That It Reduces |
| ------------------------ | --------------------- |
| Smithing master cape     | Metals                |
| Mining master cape       | Ores                  |
| Woodcutting master cape  | Logs                  |
| Firemaking master cape   | Ashes                 |
| Herblore master cape     | Potions               |
| Farming master cape      | Organic               |
| Cooking master cape      | Food                  |
| Fishing master cape      | Raw Food              |
| Construction master cape | Planks                |
| Fletching master cape    | Bows, Unstrung Bows   |
| Crafting master cape     | Jewelry               |
| Runecraft master cape    | Talisman, Runes       |
| Ranged master cape       | Projectiles           |
| Attack master cape       | Swords, Longswords    |
| Strength master cape     | Blunt Weapons, Maces  |
| Defence master cape      | Shield, Defender      |
| Magic master cape        | Magic                 |
| Prayer master cape       | Bones                 |

#### Other Disassembly boosts

| Name                        | Boost                  |
| --------------------------- | ---------------------- |
| Dwarven toolkit (Invention) | 35% faster disassembly |
| Invention master cape       | 5% faster disassembly  |
| Invention master cape       | 5% extra materials     |
| Inventor's outfit           | 4% xp boost            |

## Efficient Training

This guides purpose is to serve as a quick guide to reach level 99 Invention. It is not the absolute fastest way to level 99. Nor is it the most efficient for getting a variety of materials. I recommend you reach level 99/120 first using this guide and then figure out what inventions you want to aim for.

Consider getting the inventor's outfit from [Tinkering Workshop](../../minigames/tinkering-workshop.md) at some point, for 4% bonus XP.

- Level 1 - 11: 652 Potato seed
- Level 11 - 26: 933 Opal bolt tips
- Level 26 - 35: 553 Jade bolt tips
- Level 35 - 40: 367 Jug of wine
- Level 40 - 42: 201 Jug of wine
- Level 42 - 45: 298 Curry tree seed
- Level 45 - 50: 727 Curry tree seed
- Level 50 - 55: 887 Gold bar
- Level 55 - 60: 1,221 Zulrah's scales
- Level 60 - 65: 1,723 Yew logs
- Level 65 - 70: 2,457 Diamond bolt tips
- Level 70 - 75: 3,507 Black Chinchompa
- Level 75 - 80: 5,089 Magic logs
- At level 80 disassemble 5-8 Dwarven Bars, research Metallic material until you unlock the Dwarven Toolkit blueprint, and invent the Dwarven Toolkit.
- Level 80 - 85: 7,389 Shark
- Level 85 - 91: 13,762 Mithril bar
- Level 91 - 95: 13,137 Manta ray
- Level 95 - 99: 18,030 Adamantite bar
- Level 99 - 120: The best xp/hr for the rest of your invention career will be disassembling level 99 items. Those being: Rocktail, Raw Rocktail, Elder Bow, Runite Bar. However this will not get you the variety of materials you need to power all of the amazing inventions.
