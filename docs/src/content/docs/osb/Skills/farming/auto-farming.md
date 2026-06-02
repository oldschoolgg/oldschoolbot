---
title: "Auto Farming"
---

Auto farming collects ready patches into a single Farming activity so you can harvest and replant everything without running multiple commands.

## Overview

- [[/farming auto_farm]] checks every patch you have unlocked, harvests ready planted patches, and plants/replants according to your filter and preferences.
- The trip is planned as one continuous Farming activity whose duration equals the sum of each patch step (travel, harvest, replant). Your minion stays out for the full Farming trip length instead of returning after every patch.
- You can also trigger auto farming from the button that appears on [[/farming check_patches]] when something is ready.

## Filters

- **AllFarm** (default) - Plants the best seed you can use in each ready patch, prioritising higher-level crops.
- **Replant** - Only replants patches that already contained that crop and that you still have seeds for. Empty patches stay empty.
- Configure the behaviour with [[/farming auto_farm_filter auto_farm_filter_data:AllFarm]] or [[/farming auto_farm_filter auto_farm_filter_data:Replant]].
- Use [[/farming set_preferred]] for per-patch overrides:
  - `seed` to force a specific seed for that patch type
  - `highest_available` to always choose best available for that patch
  - `empty` to skip that patch type entirely
  - `reset_all` to clear all saved per-patch preferences
- `prefer_contract` prioritises your active farming contract crop when possible.
- When `prefer_contract` is enabled and a valid contract crop is available, that contract patch is scheduled first in the auto-farm trip.
- If the contract crop is already planted and ready, auto farm harvests it and then falls back to your saved patch preference for replanting (it does not force another contract replant in the same cycle).

## Trip Planning

- Auto farming respects your maximum Farming trip length (see [[/minion activities]]). Steps that would exceed the limit are skipped and reported in the chat response.
- Each step is timestamped, so the harvesting order in the summary matches the real execution order.
- If your minion is already busy the command will refuse to start.

## Messages

- The start response shows how many patch groups were scheduled, the return time, a **Patches:** list, and an **Items used:** section.
- **Items used:** is grouped into compost, seeds/spores, coins, and other items so you can see the total cost without adding each patch line manually.
- The completion response combines all completed steps into one summary with **XP gained:**, **Total loot:**, and **Patches farmed:**.
- Farming, Woodcutting, and Herblore XP gains include XP/hr when those skills gained XP during the trip.
- **Patches farmed:** lists the patch groups completed in execution order.

## Resource Handling

- Seeds, compost, farmer payments, and tree removal fees are checked up-front.
- Your [[/farming default_compost]] choice and [[/farming always_pay]] toggle are applied automatically.
- Coins for chopping trees without the required Woodcutting level are reserved (200 gp for most trees, 2,000 gp for redwoods).
- Seed/compost/protection costs are removed immediately before the trip starts.
- Tree-removal coin costs are deducted up-front as part of trip start, then partially refunded during execution if the estimate was higher than needed.
- If no step can be planned, auto farm returns the first failure reason (for example missing seeds/items or an unmet requirement).

## Boosts

- Equip full graceful and keep a [Ring of endurance](../agility/hallowed-sepulchre.md#ring-of-endurance) (equipped or in bank) to stack the 10% + 10% trip speed bonuses.
- Completing Ardougne hard and elite diaries grants additional 4% + 4% time reduction on auto farm trips.
- Farming outfit, magic secateurs, and the Farming cape apply the same XP and yield bonuses as manual planting.

## Tips

- Keep your seed, compost, and protection stocks topped up so auto farming can plan the maximum number of patches per trip.
- Use `Replant` when you want to maintain a static herb run and `AllFarm` when you prefer "always best available" crops.
- If you have more ready patches than the trip length allows, click **Repeat Trip** once the first trip finishes to do the remaining patches.
- If there are no farming actions available, auto farm can fall back to repeating your previous non-Farming trip when one is available.
- Review [Patch Unlocks](README.md#patch-unlocks) to make sure you have unlocked every patch that auto farming can use.
