---
title: "Tame Breeding and Hybrids"
---

Tame breeding lets you combine two different adult tame species into a mutated hybrid tame. Hybrids can use the functionality of both parent species, so they can be sent on the activities, use the boosts, and equip the gear that applies to either species they were bred from.

## Breeding Requirements

To breed two tames:

- You must have a nursery built.
- Your nursery cannot currently be holding an egg.
- Your breeding centre cannot already be in use.
- Both parent tames must be adults.
- Both parent tames must be idle.
- Both parent tames must have all gear unequipped.
- The two tames must contain exactly two different species between them.

Start breeding with:

[[/nursery breed parent_one\:TameOne parent_two\:TameTwo]]

The breeding process takes **7 days**. Check the nursery with:

[[/nursery check]]

## Breeding Cooldown

After starting a breeding process, your breeding centre goes on a **30 day cooldown**.

You can override the cooldown with GP by using the `override_cooldown` option on [[/nursery breed]]. The cost scales down as the cooldown gets closer to ending, from up to **100,000,000,000 GP** at the start to **1,000,000,000 GP** near the end.

## Parent Exhaustion

When breeding finishes, each parent has a **75% chance** to die from exhaustion.

If a parent dies:

- The parent tame is deleted.
- Any activities tied to that parent are moved to the new hybrid tame.
- If the deleted parent was your selected tame, the new hybrid becomes selected.

If a parent survives, you keep both the parent and the new hybrid.

## What Hybrids Inherit

A hybrid inherits:

- All fed items from both parents.
- All total loot from both parents.
- All total cost tracked from both parents.
- The highest combat, gatherer, artisan, and support levels from either parent.

The hybrid starts as a **baby** with 0% growth.

## Hybrid Species Behaviour

Hybrids can use every species included in their parent species list.

| Hybrid       | Functionality                         |
| ------------ | ------------------------------------- |
| Igne/Monkey  | PvM, gathering, and monkey magic      |
| Eagle/Monkey | Clue scrolls, gathering, and monkey magic |
| Igne/Eagle   | PvM and clue scrolls                  |

Species-specific feed boosts and equipment also work if the hybrid includes that species. For example, an Igne/Monkey hybrid can use Igne tame gear and Monkey tame staff functionality.

## Primary Species and Shiny Chance

The first parent species is treated as the hybrid's primary species for its base variant and shiny chance.

Shiny breeding works like this:

- If both parents are shiny, the hybrid is guaranteed to be shiny.
- If one parent is shiny, the primary species shiny rate is halved.
- If neither parent is shiny, the primary species normal shiny rate is used.

The hybrid's visual variant is rolled from the primary species' variants, unless it rolls shiny.

## Hybrid Names and Appearance

Hybrids are automatically named after their parent species, for example `Igne-Monkey Hybrid`.

Hybrid appearances are shown in [[/tames list]]:

| Hybrid       | Sprite sheet    |
| ------------ | --------------- |
| Igne/Monkey  | `4_sprite.png`  |
| Eagle/Monkey | `5_sprite.png`  |
| Igne/Eagle   | `6_sprite.png`  |

These hybrid sprite sheets use the same layout as normal tame sprites: 4 variants across, 3 growth stages down, with 96x96 cells.
