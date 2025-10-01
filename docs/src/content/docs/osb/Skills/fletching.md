---
title: "Fletching"
---

You can train Fletching with the [[/fletch]] command. To see all the items you can fletch, check out the [Fletching Wiki Page](https://oldschool.runescape.wiki/w/Fletching) - most of the items found there are fletchable in the bot, having the exact same level and item requirements.

### Fastest route to 99:

1. [[/fletch name\:Bronze arrow]]
1. [[/fletch name\:Bronze dart]]
1. [[/fletch name\:Iron dart]]
1. [[/fletch name\:Steel dart]]
1. [[/fletch name\:Mithril dart]] until 67
1. [[/fletch name\:Adamant dart]] until 81
1. [[/fletch name\:Rune dart]] until 95
1. [[/fletch name\:Dragon dart]] until 99

### Zero-time Fletching

Configure zero-time fletching with [[/zero_time_activity set primary_type\:fletch primary_item\:"Rune dart"]], then run Agility laps or the Hallowed Sepulchre to craft ammunition in the background. The [Zero-time Activities guide](/osb/miscellaneous/zero-time-activities) lists every supported item, setup step, and hourly rate.

- Add a fallback alch with [[/zero_time_activity set primary_type\:fletch primary_item\:"Rune dart" fallback_type\:alch]] so the bot keeps working even when you run out of supplies.
- Leaving the `primary_item` blank on an alch setup keeps using your favourite alchs automatically.

