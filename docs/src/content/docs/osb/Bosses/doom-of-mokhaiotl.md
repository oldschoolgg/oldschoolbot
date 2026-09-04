---
title: "Doom of Mokhaiotl"
---

The Doom of Mokhaiotl is fought through the Delves command. It is not started with `/k`.

To start a trip, use [[/delves doom target_delve\:1]]. You can choose any target delve from 1 to 30. Drop rates improve up to delve 9, then remain capped, while death chance continues to increase at higher delves.

By default, the trip stops early when a unique is received. To keep going until the target delve, use [[/delves doom target_delve\:8 stop_on_unique\:false]].

## Requirements

- Completion of The Final Dawn
- [[attack:85]] [[strength:85]] [[defence:70]] [[ranged:90]] [[hitpoints:90]] [[prayer:74]]
- [[Dexterous prayer scroll]] used, unlocking Rigour
- A [[Twisted bow]] or [[Scorching bow]] equipped in the range setup, with arrows equipped
- A demonbane weapon: [[Darklight]], [[Arclight]], or [[Emberlight]]
- A mage weapon, or a charged [[Eye of ayak]]
- A melee punish weapon: [[Noxious halberd]], [[Crystal halberd]], or [[Dual macuahuitl]]. [[Crystal halberd]] also needs [[Crystal shard]]s equal to the target delve.
- Enough doses of Anti-venom, Anti-venom+, or Extended anti-venom+ to cover the trip duration. Anti-venom covers 54 seconds per dose, Anti-venom+ covers around 3.6 minutes per dose, and Extended anti-venom+ covers around 6.3 minutes per dose.
- Appropriate range gear, including head, body, legs, neck, cape, feet, and hands slots

## Rewards and Progress

Doom can drop [[Mokhaiotl cloth]], [[Eye of ayak (uncharged)]], [[Avernic treads]], and [[Dom]]. It also awards [[Demon tear]], including guaranteed tears from delve 3 onwards. [[Mokhaiotl waystone]] can also be received and consumed for a small speed boost on a later Doom trip.

The bot tracks Doom progress as:

- Deepest Delve
- Deep Delves, for delve 8+ completions
- Total Delves, for each cleared delve

Deaths lose all loot from the run. Some unused supplies can be refunded if the death happens before the target delve.

XP is weighted heavily towards Ranged. A full completion gives around 105k Ranged XP/hr, up to 10k Magic XP/hr, and around 5k total melee XP/hr.

## Death Chance

Delves 1-7 become safe after successful clears of that specific delve. Delve 1 needs 1 clear, delve 2 needs 2 clears, continuing up to delve 7 needing 7 clears.

Delve 8+ never becomes fully safe. Repeated clears reduce the death chance towards these minimums:

- Delve 8: 3%
- Delve 9: 5%
- Delve 10: 7%
- Delve 11: 9%
- Delve 12: 11%
- Delve 13: 13%
- Delve 14: 15%
- Delve 15: 17%
- Delve 16+: 20%

## Boosts and Gear

- 10% speed boost for [[Twisted bow]]
- 17% speed penalty for [[Scorching bow]]
- 8% speed boost for [[Noxious halberd]]
- 3% speed boost for full fortified Masori armour
- 2% speed boost for [[Zaryte vambraces]]
- 5% speed boost for Elite Void
- 10% speed boost for [[Zaryte crossbow]] with enough [[Ruby bolts (e)]] or [[Ruby dragon bolts (e)]]
- 3% speed boost for [[Crystal halberd]] if you do not have a [[Zaryte crossbow]]
- 3% speed boost for [[Rite of vile transference]], requiring Death Charge casts and runes
- 2% speed boost for [[Mokhaiotl waystone]], consuming one per trip
- 2% speed boost for [[Lightbearer]]
- Up to 10% speed boost for KC
- Up to 15% speed boost for combat stats
- Arrow modifiers: [[Dragon arrow]] is 8% faster, [[Amethyst arrow]] is 4% faster, [[Rune arrow]] is 5% slower, and lower arrows are 12% slower.

Full fortified Masori armour with [[Zaryte vambraces]] matches Elite Void's 5% total speed boost. If [[Avernic treads (max)]] are equipped in any Melee, Mage, or Range setup, they count for Doom's range feet slot check.

[[Eye of ayak]] can replace rune costs for mage grubs when charged. Completing Doom with a charged Eye of Ayak also adds more Eye of Ayak charges.

## Combat Achievements

Doom CAs are rolled from successful Doom trips. Doom Chaser uses the trip duration shown by the bot and needs delve 8 under 10:00. Doom Racer also uses the shown duration and needs delve 8 under 7:15, which is reachable with max speed boosts, max KC speed reduction, high combat stats, and a fast duration roll.

Doom Crawler keeps the in-game 30-second challenge wording, but is represented in the bot as a 1/20 chance from successful Doom trips that complete at least delve 1.

## Related Items

- [[Avernic treads]] variants and reverts are made with [[/create]].
- [[Confliction gauntlets]] are made with [[/create item\:Confliction gauntlets]].
- [[Demon tear]] can also be gained from [[/chop name\:Infected Roots]].
