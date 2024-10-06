---
title: "Gear"
description: This page goes over how your gear functions on the bot.
---

# Gear

## Overview

Your minion has 6 gear setups (Melee, Mage, Range, Skilling, Misc, and Wildy) in which you can equip your gear into depending on what activity you want to do on the bot. Below is a list of the commands that deal with equip and unequipping gear on your minion. Lets say you just finished questing and bought yourself a pair of barrows gloves and you would like to equip those in your range setup, you would type `+equip range barrows gloves`. Now lets say you already had a pair of mithril gloves equipped in your range setup and you wanted to equip the barrows gloves instead now, you do not need to unequip the other gloves first, the equip command will take the other pair off for you and equip the new item. Further below we will talk about `+gearpresets` a way for you to save a setup you like for later for easy equipping.\
\

### Commands

| Command           | What it does                                                                                                                                                      | Example                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| +autoequip/+aep   | Automatically equips the BIS gear you have in your bank, for a particular attack style, to one of your gear setups. (note will not pull from other equipped gear) | +autoequip melee attack crush +autoequip mage attack magic                        |
| +equip            | Equips an item to one of your gear setups.                                                                                                                        | +equip skilling graceful hood +equip melee bandos boots +equip mage staff of fire |
| +gear             | Shows your equipped gear.                                                                                                                                         | +gear melee +gear --all                                                           |
| +unequip          | Unequips items from one of your gear setups.                                                                                                                      | +unequip range Twisted bow +unequip melee Abyssal whip                            |
| +unequipall       | Unequips everything from one of your gear setups. (melee/range/range/skilling/misc)                                                                               | +unequipall melee                                                                 |
| +m equippet/ep    | Equips a pet, like dropping it on the floor ingame.                                                                                                               | +m equippet smolcano                                                              |
| +m unequippet/uep | Unequips your pet.                                                                                                                                                | +m unequippet                                                                     |

### Gear Presets

Now that you have equipped the gear you like you probably would like to save that setup for later before you equip something up in that setup. This can done through the `+gearpresets` commands listed before. Along with the ability to make your own presets there are some global presets available to you at the start such as the "Graceful" preset which will equip full graceful in the specified gear setup.\
\
By default, you are restricted to having 3 gear presets. However, this is increased to 7 if you are a patron or a github supporter.

| Command                             | What it does                                          | Example                       |
| ----------------------------------- | ----------------------------------------------------- | ----------------------------- |
| +gearpresets/+gps                   | Shows you your presets you have made.                 | +gearpresets                  |
| +gearpresets new \<name> \<setup>   | copy your \<setup> gear into a preset called \<name>. | +gearpresets new corp melee   |
| +gearpresets delete \<name>         | delete your setup called \<name>.                     | +gearpresets delete corp      |
| +gearpresets equip \<name> \<setup> | equip your \<name> setup to your \<setup> outfit.     | +gearpresets equip corp melee |

#### Global Gear Presets

- Graceful
- Pyro
- Carpenter
- Rogue
- Clue
- Angler
- Prospector

### BIS Gear

This gear is the best food reduction equipment in the game. This will save the highest amount of food possible at almost every boss, with notable exceptions being KQ and [Nightmare](https://wiki.oldschool.gg/bosses/nightmare-of-ashihama).

### Wildy Setup

The wilderness setup is currently only used at revenants. **All** of the items equipped in this setup can be **permanently lost** if you are killed while doing activities that use this setup.
