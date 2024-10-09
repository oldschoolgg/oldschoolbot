---
title: "Agility"
---

### Fastest route to 99:

[[/laps name\:Gnome Stronghold Agility Course quantity\:42]] until 14
[[/laps name\:Draynor Village Rooftop Course]] until 25
[[/laps name\:Al Kharid Rooftop Course]] until 30
[[/laps name\:Penguin Agility Course]] until 48
[[/laps name\:Ape Atoll Agility Course]] until 70
[[/laps name\:Pollnivneach Rooftop Course]] until 72
[[/minigames sepulchre start]] until 99

**Alternative routes:**
[[/minigames agility_arena start]] (for diary)
[[/minigames rogues_den start]] (gear for thieving)

**Additional information:**
For max efficiency spam quantity 1 trips when close to leveling up.

## Training Methods

Agility can be trained by using the command [[/laps name\:course quantity\: alch\:]]

Total lap counts can be checked with [[/data name\:Personal Agility Stats]]

### Rooftop Agility

Rooftop agility courses reward the player with marks of grace which can be used to buy pieces of the Graceful outfit (260 marks for full outfit). You can also purchase Amylase packs which will give you 100 amylase crystals per amylase pack, costing 10 marks of grace each.

To create full graceful in 1 command or buy pieces individually:

- [[/create item\:Graceful]]
- [[/create item\:Graceful (piece)]]

To buy Amylase crystals (1 quantity = 100 crystals): [[/buy name\: Amylase pack]]

### [Hallowed Sepulchre](hallowed-sepulchre.md)

From level 52 agility, the player may train agility using the command [[/minigames sepulchre start]], which also requires full Graceful equipped in your skilling setup. You will progressively get better at plundering the sepulchre as your agility level increases, peaking at 92 agility.

### [Brimhaven Agility Arena](brimhaven-agility-arena.md)

The Brimhaven Agility Arena rewards the player with Agility tickets which can be used to purchase cosmetic rewards or agility XP, using the command [[/minigames agility_arena start]]

### [Agility Pyramid](agility-pyramid.md)

Starting at 30 agility, you can train agility here while making some gp on the side. Each successful lap gives 10k gp, however, the fail rate is substantially higher below level 40 agility.

### [Underwater Agility](../thieving/underwater-training.md)

You can train your agility here starting at any level (will influence xp/hr though) and collect Mermaid tears to spend at the shop. Can be combined with thieving training for big xp/hr.

# Agility Alching

You can alch items while training Agility. You select items to be alched, and then set the **`alch:`** option to `True` in the `/laps` command.

1. Select all the items you want to be alched while training:
   - [[/config user favorite_alchs add\:Rune platebody]]
2. After selecting one, or lots, of "Favorite alchable items" (favalchs), simply start a laps trip with \*\*`alch:True`, for example:
   - [[/laps name\:Ardougne Rooftop Course alch\:True]]

It will pick the highest alch-value item from your list of favorites to alch.
