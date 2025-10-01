---
title: "Zero-time Activities"
---

Zero-time activities let your minion cast High Alchemy or fletch stackable ammunition during trips without increasing the trip's duration. Configure them with [[/zero_time_activity]] before you start Agility laps, the Hallowed Sepulchre, or any other activity that supports zero-time actions.

## Configuring `/zero_time_activity`

1. Choose your background action with [[/zero_time_activity type\:alch]] or [[/zero_time_activity type\:fletch]].
2. If you select `fletch`, provide the exact item with [[/zero_time_activity type\:fletch item\:"Rune dart"]] (autocomplete suggests every supported choice).
3. For `alch`, leave the item blank to let the bot automatically pick from your favourite alchs each trip, or specify a particular item such as [[/zero_time_activity type\:alch item\:"Yew longbow"]].
4. Update your favourite alch list with [[/config user favorite_alchs add\:Rune platebody]] so automatic selection has options to choose from.
5. Use [[/zero_time_activity clear\:true]] to remove the configuration.

Only one zero-time activity can run per trip. Switching between alching and fletching requires re-running `/zero_time_activity`. The necessary runes or fletching materials are removed from your bank when the trip starts, and zero-time actions never extend the duration of the main activity.

## Zero-time Alching

- Requires level 55 Magic and the materials for High Alchemy (or the Rune Pouch setup you normally use).
- Leaving the item unset makes the bot choose from your favourite alchs at the start of **every** trip, so you always alch profitable or priority items.
- Casting rates depend on the host activity:
  - **Agility laps:** roughly 277 casts per hour.
  - **Hallowed Sepulchre:** roughly 1,000 casts per hour.
- All casts happen in the background, so you can keep running laps or floor rotations without interruption.

## Zero-time Fletching

- Works with darts, arrows, javelins, bolts, tipped bolts, tipped dragon bolts, broad ammunition, and any other stackable fletching product that appears in the autocomplete list.
- You must meet the item's Fletching level requirement and own any necessary Slayer unlocks before configuring it.
- Fletching speeds vary by content:
  - **Agility laps:** up to ~15,000 items per hour for darts, bolts, broad bolts, and similar stackables.
  - **Hallowed Sepulchre:** uses the item's zero-time rate (about 18,000 sets/hour for darts and bolts, ~10,000 sets/hour for arrows, javelins, and other ammunition).
- Materials (tips, feathers, unfinished ammunition, etc.) are removed when the trip begins, so ensure your bank holds enough supplies for the expected duration.

## Location Notes

- **Agility laps:** configure the background action before running [[/laps]]. You cannot alch on the Ape Atoll course because your minion must hold a greegree, but fletching still works there.
- **Hallowed Sepulchre:** configure the action before [[/minigames sepulchre start]]. Zero-time alching and fletching both operate floor by floor without slowing your runs.

Refer back to the [Agility guide](/osb/skills/agility) and [Hallowed Sepulchre guide](/osb/activities/hallowed-sepulchre) for activity-specific advice, boost information, and strategies.

