---
title: "Tames"
sidebar:
  order: 7
---

A tame is a special form of pet that isn't in your bank or equipped. You can send the tame out on trips. Every tame has a combat level (Dragon) or a gatherer score (Monkey). Items that your tames get will not be added to your collection log.

**Currently the only tames that are in game are:**\
The Dragon tame which does combat, see [Igne Tame](igne-tame.md).\
The Monkey tame which does collect trips, see [Monkey Tame](monkey-tame.md).
The Eagle tame which completes clues, see [Eagle Tame](eagle-tame.md).

| Commands                                           | Description                       |
| -------------------------------------------------- | --------------------------------- |
| `/tames status`                                    | Shows current tame's status       |
| `/tames list`                                      | Shows a list of all tames         |
| `/tames view [name/id]`                            | Shows info about a tame           |
| `/tames select [name/id]`                          | Selects a tame                    |
| `/tames set_name [name]`                           | Sets the tame's name              |
| `/tames feed [items]`                              | Feeds your tame items             |
| `/tames kill [monster]`                            | Send tame on PvM trip             |
| `/tames collect [item]`                            | Send tame on collection trip      |
| `/tames cancel`                                    | Cancels your tame's trip          |
| `/tames equip [item]`                              | Equip a igne claw or armor item   |
| `/tames unequip [item]`                            | Unequip a igne claw or armor item |
| `/cl name:[boss] type:Tame (Tames Collection Log)` | View your tames collection log    |

## Hatching the Tame

In order to hatch the tame you must build a nursery with `/nursery build`.
You will need 105 Construction along with 200 elder planks, 10 marble blocks and 500 feathers to build the nursery.

Once the nursery is built you can then fuel the nursery with `/nursery fuel`
Fuelling the nursery will require 2,500 elder logs and 10,000 coal.

Finally, once you have satisfied these requirements you can add your egg to the nursery i.e. `/nursery add_egg item:Dragon egg`

Note: The ring of luck provides a 3% boost to the chance that on hatch the tame will be a shiny.

## Merging Tames

Tames can be merged using the following commands: `/tames select x` to select the tame you wish to keep, then `/tames merge y` to merge `y` into `x`, deleting `y` in the process. **There is no way to revert this.**

Both tames do not need to be adults.

When a tame is merged, all of the following will be kept:

- All items fed to either tame
- All items collected by either tame
- The stats of both tames will be merged, keeping the highest of both tames

To merge two Igne tames, you must have 110 Runecraft, 110 Magic, and 110 Herblore, and it will cost 100 Ignecarus scales, 6 zenyte, 10 onyx, 1 draconic visage, 2,500 soul runes, 600 astral runes, and 100 elder runes. There is a 10 million coin fee for merging tames.
To merge two Monkey tames, you must have 110 Runecraft, 110 Magic, and 110 Herblore, and it will cost 3000 bananas, 50 magic bananas, 1 chimpling jar, 2,500 soul runes, 600 astral runes, and 100 elder runes.
