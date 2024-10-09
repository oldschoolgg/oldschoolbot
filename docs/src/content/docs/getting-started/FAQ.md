---
title: "FAQ"
sidebar:
  order: 2
---

### How do I see all the things I can do with my minion?

Almost everything from OSRS is coded into the bot. Read around on this wiki, and look through the command list.

### Where can I report bugs?

You can make a bug report on the bot's [github page](https://github.com/oldschoolgg/oldschoolbot/issues/new?assignees=&labels=&template=bug.md). Before making a bug report, you should consider asking about your issue in the #help-and-support channel of the bot's [support server](https://discord.com/invite/ob).

### Where can I make suggestions for the bot?

Suggestions can be made through the bot's [github page](https://github.com/oldschoolgg/oldschoolbot/issues/new?labels=feature+request&template=feature.md). Before making a suggestion, you should search the [repo](https://github.com/oldschoolgg/oldschoolbot/issues) to see if similar suggestions have already been made.

### How do I sell/buy items to someone?

You can sell/buy items using the grand exchange

[[/ge]]

### How do I equip gear on my minion?

There are 5 different setups; Melee, Range, Mage, Skilling, and Misc. As an example, here's how you can equip a BCP to your melee setup: `/gear equip melee Bandos Chestplate`. If you're doing a boss that needs Melee gear, the bot will check your Melee setup. It's done like this so you don't have to spend a long time equipping and unequipping stuff, you can just have your best stuff in each setup at all times.

The Skilling setup is where you equip skilling-related stuff, for example: Graceful or the Prospector outfit.

You also have a cosmetic pet slot, shared across all gear setups. It allows you to equip a pet, like its following your minion around. You can equip a pet using the `/gear equippet` command. For example, to equip the Commander Zilyana pet, you would use `/gear equippet pet zilyana`. You need to use the exact item name as it is ingame.

### Can I stop my minion from going on a trip I started by accident?

Yes. Using the `+cancel` command you can tell your minion to drop everything and return at once. However, it takes the command literally and you will not receive any loot or xp, nor will you get any items you would have expended during the trip returned. For example, if you accidentally sent your minion off to smith 10 bronze daggers, using the cancel command would return your minion to idle status, but you would not have returned any bronze daggers, any smithing xp, or any of the 10 bronze bars initially allocated to your minion's trip.

### How do I get money for a minion?

There are two options: `/daily`, `/dice`. If you're lucky, someone will gift you money.

### Why can't I use minion commands?

This could be one of 3 reasons: either your account looks like an alt, your account is too new, or you have been banned for breaking the rules. Your Discord account needs to be at least 30 days old.

### Is RWT or autotyping against the rules?

YES. You will be banned from the bot, it's not allowed. To date, there have been hundreds of users caught doing this and all have been wiped/banned.

### Can I create an alt account?

NO. You will be permanently banned from the bot on all accounts. However, you may create a single alt account as a permanent ironman, but you are not allowed to de-iron - ever, de-ironning the account for any reason will be considered as an alt and you will be banned. All other alt accounts are not permissible and you will be caught and banned. Creating an alt account is subject to the same restrictions regarding Discord account age as all other accounts.

### How do I get X item?

You get most items exactly the same as you get them in the real game, all monsters drop the same things as ingame.

If it is a quest reward or thing you usually buy from a shop, you can get it by using `+buy`. Graceful can be obtained with 260 marks of grace and using the `+create graceful` command. If the item, like the graceful outfit, requires other items to be obtained, it will most often be obtained using the `+create` command. For example, to create an odium ward you would use the command `+create odium ward` which would consume the three odium shards in your bank and return a fully formed odium ward.

Note that not all items are currently obtainable via either of these two methods.

### How do I create a godsword?

Example: `+create Bandos godsword` - note it requires you have the required Smithing level. You can pay another player to make it for you in the [support server.](https://www.discord.gg/ob), if you wish.

### How do I get Barrows gloves?

The various gloves require quest points and gp to buy. Barrows gloves require 175 quest points and 1m gp. The full list of gloves can be found on the [minions page.](https://www.oldschool.gg/oldschoolbot/minions?Buyable%20items)

### How do I get Runecrafting pouches?

There are 4 pouches, and the bot does it a bit differently to ingame. To obtain them, you first need the Crafting level required for each tier (1, 10, 20, 30), and then a little bit of leather, and simply `+create medium pouch`.

### Can I pay a fee to have the bot make my Dragonfire Ward/Shield or Spectral/Arcane/Elysian/Blessed Spirit Shield for me?

No. However, you can pay another player with the required levels to make it for you. You can look for someone to do it for you in the [support server.](https://www.discord.gg/ob)

### Can you stack clues on Old School Bot?

No, you can't. It works like ingame.

### Why is the bot not responding to any commands?

First, mention the bot (like this: `@Old School Bot`), and it will tell you what prefix it is set to use for your server. If it still doesn't respond, It could have to do with permissions the bot has. If you're not sure how to fix this, you can ask in the [support server](https://discord.gg/ob).

### How do I create a Barrows set, or deconstruct a Barrows set into the items?

Here's an example: `/create dharoks armour set` to turn items into a set, or `/unpack dharoks armour set` to turn the set back into the items.

The bot says it needs permission to ‘Manage messages’ in order to use a command. ### How do I do this?

Server settings > Roles > Old School Bot (The auto assigned one) > Turn `Manage Messages` on.
