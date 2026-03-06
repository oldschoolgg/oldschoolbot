---
title: "Use command"
---

`[/use]` lets you use one item, or combine two items.

## Syntax

- `[/use item:<item>]`
- `[/use item:<item> secondary_item:<item>]`

## How matching works

- The command checks your bank for the provided item(s).
- It then searches exact registered use-actions for:
  - one-item uses, or
  - two-item combinations.
- Item order for 2-item combos does not matter.

## Common edge cases

- Invalid item name → `That's not a valid item.`
- Missing items in bank → ownership error.
- Valid items but no registered use combo → `That's not a usable item/combination.`
- One-time unlock items (scrolls/tablets/boons) cannot be reused once the related bitfield is unlocked.

## Examples

- `[/use item:Arcane prayer scroll]`
- `[/use item:Banana secondary_item:Monkey]`
- `[/use item:Double loot token]`
