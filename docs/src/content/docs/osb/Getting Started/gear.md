---
title: "Gear"
---

Your minion has 8 gear setups (Melee, Mage, Range, Skilling, Misc, Wildy, Fashion and Other) in which you can equip your gear into depending on what activity you want to do on the bot. Below is a list of the commands that deal with equip and unequipping gear on your minion. Lets say you just finished questing and bought yourself a pair of barrows gloves and you want to equip those in your range setup, you would type `/gear equip gear_setup\:Range item\:Barrows gloves` . Now lets say you already had a pair of mithril gloves equipped in your range setup and you wanted to equip the barrows gloves instead now, you do not need to unequip the other gloves first, the equip command will take the other pair off for you and equip the new item. Further below we will talk about gearpresets, a way for you to save a setup you like for later for easy equipping (Please note that the some gear setups are locked to T3 Patron or higher).

## Commands

There are 4 options: `/gear equip`, `/gear unequip`, `/gear stats` and `/gear pet`. You can simply type `/gear` for all 4 of these options to appear.

### Gear Equip

The `/gear equip` command lets you equip and change gear. You will firstly select the gear setup you wish to edit. There are 4 options under it:

|             |                                                                  |                                                            |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| **Command** | **What it does**                                                 | **Example**                                                |
| Item        | Selects a single item you wish to equip.                         | `/gear equip gear_setup:Meleeitem:Barrows gloves`          |
| Preset      | Selects a previously made or default gear preset to equip.       | `/gear equip gear_setup:Skillingpreset:graceful`           |
| Quantity    | Selects a specific number of an item to equip (ammunition only). | `/gear equip gear_setup:Rangeitem:Rune arrowquantity:1000` |
| Auto        | Selects the BiS equipment for a specific attack style.           | `/gear equip gear_setup:Meleeauto:melee_strength`          |

### Gear Unequip

You can use this command to unequip items from any gear setup. There are 2 options: unequip all the items from a specific setup, or just 1 item at a time.

### Gear Stats

This is simply for simulation of equipping items and checking the stats of a particular setup. You do not need to own the items to perform this command, but you will need the items full name.

### Gear Pet

Use this command to simply equip or unequip a pet. You can equip and unequip a pet during a trip.

- `/gear petequip: ``[petName]`
- `/gear petunequip: ``true`

## Gear Presets

The `/gearpresets` command gives you the ability to save a particular gear setup for quick-equipping if you decide to switch between content. By default, you are restricted to having 3 gear presets. However, this can be increased if you are a patron or a github supporter.

- Tier 1 - 7 presets
- Tier 2 - 9 presets
- Tier 3+ - 11 presets

| **Command** | **What it does**                                                                                     | **Example**                                              |
| ----------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Create      | Allows you to create a gear preset. You can copy an existing setup or hand pick items to create one. | `/gearpresets createname: ``Examplecopy_setup: ``Melee`  |
| Edit        | Allows you to edit an existing gear preset.                                                          | `/gearpresets editpreset: ``Examplehands:Barrows gloves` |
| Delete      | Allows you to delete an existing gear preset.                                                        | `/gearpresets deletepreset: ``Example`                   |
| Equip       | Allows you to equip an existing gear preset.                                                         | `/gearpresets equipgear_setup: ``Meleepreset: ``Example` |
| View        | Allows you to view an existing gear preset.                                                          | `/gearpresets viewpreset: ``Example`                     |

### Global Gear Presets

Along with the ability to make your own presets there are some global presets available to you at the start such as the "Graceful" preset which will equip full graceful in the specified gear setup. These do not count towards the total numbers of presets that are available to you.

- Graceful
- Carpenter
- Rogue
- Clue_hunter
- Angler
- Spirit_angler
- Pyromancer
- Prospector
- Lumberjack
- Farmer
- Runecraft
- Smith

### Wildy Setup

The wilderness setup is currently used at the Wilderness Bosses, Revenants and doing Wilderness Hunter and Slayer. Items equipped in this setup can be **permanently lost** if you are killed while doing activities that use this setup (hunter activities ONLY risk shirt and pants item slots). Read more about death chance and mechanics on their respective pages.
