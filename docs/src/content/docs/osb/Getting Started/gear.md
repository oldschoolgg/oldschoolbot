---
title: "Gear"
---

Your minion has 8 gear setups: Melee, Mage, Range, Skilling, Misc, Wildy, Fashion, and Other. You can equip items in each setup depending on the activity you're doing.

For example, after questing, to equip Barrows gloves into your Range setup, use: [[/gear equip gear_setup\:Range item\:Barrows gloves]]

If you already had Mithril gloves equipped, they will be automatically unequipped.

You can also save entire setups with gearpresets for quick re-equipping. (Some gear setups are locked to Tier 3 Patron or higher.)

## Commands

There are 4 main commands:  
[[/gear equip]], [[/gear unequip]], [[/gear stats]], [[/gear pet]]

You can also type [[/gear]] to view them all.

### Gear Equip

The [[/gear equip]] command lets you equip and change gear. First, choose a gear setup. Options:

| **Command** | **What it does**                  | **Example**                                                       |
| ----------- | --------------------------------- | ----------------------------------------------------------------- |
| Item        | Equip one specific item           | [[/gear equip gear_setup\:Melee item\:Barrows gloves]]            |
| Preset      | Equip a saved/default gear preset | [[/gear equip gear_setup\:Skilling preset\:graceful]]             |
| Quantity    | Equip a set quantity (for ammo)   | [[/gear equip gear_setup\:Range item\:Rune arrow quantity\:1000]] |
| Auto        | Auto-equip BiS gear for a style   | [[/gear equip gear_setup\:Melee auto\:melee_strength]]            |

### Gear Unequip

Unequip items from a setup. You can unequip all items or just a specific item.

### Gear Stats

Simulate gear to see stats. You don't need to own the items — just use the full item names.

### Gear Pet

Equip or unequip a pet, even during trips:

- [[/gear pet equip\:[petName]]]
- [[/gear pet unequip\:true]]

## Gear Presets

[[/gearpresets]] lets you save a gear setup for quick use.

- Tier 0 (default): 3 presets
- Tier 1: 7 presets
- Tier 2: 9 presets
- Tier 3+: 11 presets

| **Command** | **What it does**                                          | **Example**                                                 |
| ----------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| Create      | Create a new preset (copy from setup or specify manually) | [[/gearpresets create name\:Example copy_setup\:Melee]]     |
| Edit        | Edit an existing preset                                   | [[/gearpresets edit preset\:Example hands\:Barrows gloves]] |
| Delete      | Delete a preset                                           | [[/gearpresets delete preset\:Example]]                     |
| Equip       | Equip a preset                                            | [[/gearpresets equip gear_setup\:Melee preset\:Example]]    |
| View        | View contents of a preset                                 | [[/gearpresets view preset\:Example]]                       |

### Global Gear Presets

These are built-in and don't count toward your preset limit:

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

The Wilderness setup is used for Wilderness Bosses, Revenants, Hunter, and Slayer.

**Warning:** Items in this setup can be permanently lost if killed during Wilderness activities. (Hunter only risks shirt and pants slots.)

See related pages for more info on death chance and mechanics.
