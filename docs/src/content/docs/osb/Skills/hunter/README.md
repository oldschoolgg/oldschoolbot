---
title: "Hunter"
---

## Overview

From copper longtails to black chinchompas, use the hunter skill to track, trap, and catch a variety of critters. Though they're animals, they aren't stupid, and it will take some time to learn the most efficient ways to hunt them. For a full list of creatures, you can use the /`hunt --creatures` command.

To start any hunter trip, use `/hunt name:[creature]`

- `/hunt name:Black chinchompa`
- `/hunt name:Sabre-toothed kebbitquantity:50`
- `/hunt name:Red chinchompaquantity:100hunter_potion:True`

**Note:** \*\*`hunter_potion:True` allows the use of hunter potions on your trip. See Boosts for more info.

Each creature also has a leaderboard so you can see how you stack up against your fellow players. For example, to see the top black chinchompa hunters in OSB, you can `+lb creatures black chinchompa`.

## Boosts

These boosts apply to all hunter creatures, except birdhouses, herbiboar, and passive implings.

- 5% for full graceful equipped in _skilling setup_
- Up to 10% for creature hunting experience (1 hour of hunting = 1%)
  - Up to 20% if the creature is hunted via [Tracking techniques](https://oldschool.runescape.wiki/w/Tracking)
- Hunter potions provide a +2 level boost during your trip
  - This allows you to catch creatures above your current level and use an extra trap if the boost brings your level to the next 20-level threshold (20, 40, 60, 80).
  - They are created with 1 Avantoe potion (unf) & 1 Kebbit teeth dust.
  - The potions _must_ be 4-dose, so use `/activities decant potion_name:Hunter potion` before starting.

## Wilderness Hunting

A warning, black chin and black salamander hunting is dangerous! These wilderness creatures will put you in the path of virtual PKers, who may attack you, causing you to lose potions, catch chances, or even your minion's gear! Please read this entire section if you plan on hunting black chins or salamanders.

There are 3 options that can happen while wildy hunting, these being:

1. A normal trip. No PKers encountered
   - You will receive regular xp rates and creatures caught. No items lost.
2. You encounter a PKer but you're NOT Pked.
   - You will lose a random number of potions, 10% of the creatures, and 10% of the xp.
3. You encounter a PKer and you're Pked.
   - You will lose all potions, 50% of the creatures, and 20% of the xp.
   - You will also **lose the top and bottom** in your wildy gear setup.

**NOTE:** You **need** 10x Saradomin brew(4) and 5x Super restore(4) for wildy hunting.

**NOTE:** You **can** encounter PKers multiple times in 1 trip resulting in further losses to xp and creatures caught.

### Peak PK Times

Each day, there are low, medium, and high activity times for PKers. These determine the virtual PK activity while on your trip, while also influencing your chance to encounter a PKer. These times slots last for roughly 2 hours each but are in a random order. They also change every day.

### Wildy Gear Score

The top and bottom in your _wildy setup_ will give you a score which influences your minion chance of dying. All other gear in your wildy setup does NOT influence this score. This score is calculated against the theoretical maximum defence bonuses. I.e. Justiciar top and bottom is 100% gear score. Black d'hide top and bottom will give you a 29% gear score. However, in order to start wildy hunting, your top and bottom gear slots must add up to ALL the following minimum defensive stats. These are:

- 48 Defensive Stab
- 58 Defensive Slash
- 71 Defensive Crush
- 68 Defensive Mage
- 76 Defensive Ranged

### Chance Of Encountering A PKer

Every minute of your wildy hunting trip, your minion is rolled against the chance of encountering a PKer. This doesn't mean you automatically die, rather you just encounter the PKer with a chance to survive (hence the need for brews and restores). This chance in influenced by which creature you are hunting and which PK time is active (see above).

The base chance of encountering a PKer while wildy hunting is as follows:

- Black chinchompa: 1/100
- Black salamander: 1/200

This is further influenced by the PK activity at the time of your trip.

- Low activity time: 80
- Medium activity time: -20
- High activity time: -80

For example, if you hunt black chins at a high activity time, your chance of running into a PKer is:

- Black chin base chance (1/100) + high activity time (-80) = 1/20 chance every minute of your trip to encounter a PKer.

### Chance Of Death

If your minion is successful in encountering a PKer, you have a chance of death resulting in the loss of the top and bottom in your wildy setup. This chance is influenced by 3 things; the base chance of dying, your creature hunting experience, and your gear score.

- Base chance of death: 1/20
- Creature hunting experience: 1-200 (200 being 20k total of a specific creature caught)
- Gear score: 1-100

For example, if you encounter a PKer, while having over 20k total of a creature caught, and wearing black d'hide top and bottom, you death chance is as follows:

- Base death chance (1/20) + creature hunting experience (200) + gear score (29%) = 1/249 chance of dying if a PKer is encountered.

## Creatable Hunter Gear

You can create hunter gear with the `/create` command. This serves no purpose other than to fill skilling collection log slots and be used as warm clothing.

E.g. `/createitem:Polar camouflage gearquantity:1`

<table data-header-hidden><thead><tr><th width="202.7135875336512"></th><th></th></tr></thead><tbody><tr><td><strong>Set name</strong></td><td><strong>Required Materials</strong></td></tr><tr><td>Polar camouflage gear</td><td>4x Polar kebbit fur</td></tr><tr><td>Woodland camouflage gear</td><td>4x Common kebbit fur</td></tr><tr><td>Jungle camouflage gear</td><td>4x Feldip weasel fur</td></tr><tr><td>Desert camouflage gear</td><td>4x Desert devil fur</td></tr><tr><td>Larupia hunter gear</td><td>1x Larupia fur + 2x Tatty larupia fur</td></tr><tr><td>Graahk hunter gear</td><td>1x Graahk fur + 2x Tatty graahk fur</td></tr><tr><td>Kyatt hunter gear</td><td>1x Kyatt fur + 2x Tatty kyatt fur</td></tr><tr><td>Spotted cape</td><td>2x Spotted kebbit fur</td></tr><tr><td>Spottier cape</td><td>2x Dashing kebbit fur</td></tr><tr><td>Gloves of silence</td><td>2x Dark kebbit fur</td></tr></tbody></table>

## Rabbit Foot Necklace

This handy necklace slightly increases the chances of receiving bird eggs and seeds from woodcutting activities and birdhouses. You need 27 hunter to collect the materials and 37 crafting to make the necklace. Heres how to make one:

1. Hunt a ferret - `/huntname:Ferretquantity:1`
2. Hunt a rabbit - `/huntname:rabbitquantity:1`
3. Buy a ball of wool - `/buyname: ``Ball of woolquantity: ``1`
4. Craft the necklace - `/craftname: ``Strung rabbit foot`

_It's worth noting that the boost received from the necklace is extremely small, amounting to an increase in bird eggs and seeds by about 0.16% compared to normal rates._

## Other Hunter Activities

Among regular hunting methods, there are many other activities that can help level hunter or involve the hunter skill. These are:

- [Aerial fishing](https://wiki.oldschool.gg/skills/fishing/aerial-fishing)
  - Requires 35 hunter + 43 fishing
- [Drift net fishing](../fishing/drift-net-fishing.md)
  - Requires 44 hunter + 47 fishing
- [Herbiboar](https://wiki.oldschool.gg/skills/hunter/herbiboar)
  - Requires 80 hunter + 31 herblore
- [Birdhouses](https://wiki.oldschool.gg/skills/hunter/birdhouses)
  - Requires 5 hunter + 5 crafting + 3qp for the lowest level birdhouses
- [Passive Implings](https://wiki.oldschool.gg/skills/hunter/passive-implings)
  - Doesn't actually give xp, but is dependent on your current hunter level.
- [Puro Puro](puro-puro.md)
  - Requires 17 hunter + 36 woodcutting + 31 crafting + 3 quest points
