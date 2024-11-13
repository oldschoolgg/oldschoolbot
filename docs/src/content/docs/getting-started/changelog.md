---
title: "Changelog"
sidebar:
  order: 3
---

## Update 13/11/2024 [[4fbfe429e9a1bdf817175cf497177e47fefc6be6...e03afd628fd7e1aa460acc417d822c2d697f9087]]

- Hacktoberfest has finished, and everyone has been sent out their custom merch and other prizes! Thank you to all who participated.
- OSB Bingo #3 has finished! Read the page for it for more information: [OSB Bingo #3](/osb/miscelleanous/bingo/#osb-bingo-3-finished)

### [[gc]]

- Lowered the food cost for araxytes
- The BiS amulet for nightmare is now the [[Amulet of rancour]]

### [[00justas]]

- Added Nid to the pets CL
- Allow buying genie lamps with frog tokens
- You can now create these items: [[Strange skull]] [[Skull sceptre]] [[Runed sceptre]] [[Skull sceptre(i)]]

### [[DayV-git]]

- Fix araxxor boss task requirements
- Allow buying genie lamps with frog tokens
- Fixed a bug with agility-alching sometimes picking the wrong item
- Improved the formatting of some messages
- Allow global gear presets equip command to use similar items
- The bot now shows loot as pictures when using implings in [[/clue]]
- Fixed wildy rev weapon boost
- Added total kc and kc/h to tempoross/wintertodt return message
- Added task and catacomb modifiers to [[/kill]] simulation command
- Added missing Graceful creates / reverts (Add Brimhaven and Dark graceful revert and individual item reverts for Brimhaven, Dark and Varlamore - same as every other graceful recolour)
- Solo nex drops now are spoilered if you get a purple
- Superiors now always drop brimstone keys on konar tasks

### [[Felris]]

- Added error message when trying to use twitcher gloves without having them equipped
- Added boost to zulrah for zul-andra teleports (uses 1 tele per 4 kills for a 10% boost)
- Added boost to cerberus for keymaster teleports (uses 1 tele per 10 kills for a 10% boost)
- Added boost to tormented demons for Guthixian temple teleports (uses 1 tele per 20 kills for a 10% boost)
- Added boost to revs for Guthixian temple teleports (uses 1 tele per 20 kills for a 5% boost)
- You can now create a Corrupted Youngllef from a Youngllef if you have atleast 1 CG kc
- Added [Armoured zombie](https://oldschool.runescape.wiki/w/Armoured_zombie) as a killable monster
  - Added Broken zombie axe to misc CL page
  - Added [[Zombie axe]] to [[/create]]

### [[nwjgit]]

- Updated the wyrm agility pet droprate
- Add the ability to create [[Forester's ration]]
- Fixed ash sanctifier not giving proper XP and removing ashes

### [[Lajnux]]

- Balanced the construction xp/hr rates (Some things are slower/faster now)
- Updated/fixed some mining code

### [[TastyPumPum]]

- Added the combat achievements for all 4 DT2 bosses

### [[DarkWorldsArtist]]

- Added [Crab](https://oldschool.runescape.wiki/w/Crab) killable monster
  - Added [[Fresh crab claw]] [[Fresh crab shell]] to misc CL
  - Added [[Diving apparatus]] [[Fishbowl helmet]] to [[/buy]]
  - Added [[Crab helmet]] [[Crab claw]] to [[/create]]

## Update 16/10/2024 [[68b130088f5e365ec2a341cae48bc5b353ccc2ff...4fbfe429e9a1bdf817175cf497177e47fefc6be6]]

Bingo! We are running the 3rd official OSB bingo. See the [Bingo Page](/getting-started/bingo) for information.

### [[gc]]

- Fixed gearpresets wiping the ammo slot when editing
- Added EHP autoslay for araxytes, so they are barraged/cannoned
- Fixed the [[/casket]] command
- Allow more items to create [[Amulet of rancour (s)]] (can now also use the imbued araxyte slayer helm and Nid)
- Fixed a bug where the bot sometimes failed to send confirmation messages.
- Fixed an issue with perk tiers not syncing properly
- Various "engine" changes/improvements
- Various wiki fixes/improvements
- Fixed several bugs that were causing errors/issues
- Made some changes to fix roles (they may not be fully fixed yet)

### [[Arodab]]

- [[Scurrius' spine]] can now be traded for Antique lamp (Historian Aldo) using the [[/create]] command, which can be used for combat xp
- [[Book of arcane knowledge]] was updated to give more xp

### [[TastyPumPum]]

- Fixed Nex 'fake' masses using extra ammo
- Fixed ToB repeat trips not remembering quantity
- Added the **Ourania Altar (ZMI)**
  - You can start a ZMI trip using: [[/runecraft rune\:Ourania Altar]]
  - You get a boost for Graceful OR for having 95 Magic for spellbook swap
  - You get a 2% boost for having a [[Ring of endurance]] equipped OR in your bank.
  - You are slower if your mage is less than 71 and your QP is less than 120, for the Ourania Teleport spell.
  - [[Daeyalt essence]] works

### [[nwjgit]]

- Fixed the droprate of tormented demons uniques (instead of a roll that gets you either a synapse/claw, you get a roll at both now)
- [[Bow of faerdhinen (c)]] no longer requires arrows
- Improved code relating to item rerolling (e.g. bludgeon pieces)
- Added the **Colossal Wyrm Agility Course**
  - Requires the [Children of the Sun](/osb/quests/#children-of-the-sun) quest to be completed and [[agility:50]]
  - Added the collection log
  - Added the following items to [[/buy]]: Amylase pack (Colossal Wyrm Agility) (Bought with 100x Termites), Colossal wyrm teleport scroll (Bought with 40x Termites), Graceful crafting kit (Bought with 650x Termites), Calcified acorn (900x Termites)
- Araxxor Changes
  - Adjusted the difficulty of combat achievements
  - Fixed the extended araxyte slayer unlock
  - Adjusted the noxious halberd dropping so it prioritizes dropping items, when you have all 3 already, that would soonest let you create a full halberd.

### [[00justas]]

- Updated agility xp/hr rates based on the osrs update (buffed)
- Added [[Clue scroll (elite)]] drop to Araxxor

## Update 9/10/2024 [[8de72b2de5a275497c67123904a280981415c553...68b130088f5e365ec2a341cae48bc5b353ccc2ff]]

### Hacktoberfest

I am running our own Hacktoberfest! Check out the [Hacktoberfest](/getting-started/hackertoberfest) page if you're interested.

### [[gc]]

- Fixed/updated lots of wiki pages, and added more features to the wiki
- Fixed an issue where 'degradeable item boosts' were not applying, for example using a Scythe at Araxxor.
- PVM trips now show your kills per hour.
- Fixed a formatting issue in trips where it says "Using" for no reason.
- If you try to kill something without owning any of the required consumables, it now shows the alternate ones you can use. (e.g. antivenoms at araxxor)
- Fixed an issue where extra consumables (like cannonballs) were being used when they shouldn't.

### [[DaughtersOfNyx]]

- Added the [While Guthix Sleeps](/osb/quests/#while-guthix-sleeps) quest, requiring Defender of Varrock and The Path of Glouphrie (alongside various skills).

  #### Tormented Demons

  Added Tormented Demons, as well as their combat achievements and their creatable items. Also added the While Guthix Sleeps quest to allow the killing of these mobs. The creatable demonbane items from TDs also have various boosts to demon mobs throughout the bot (mostly emberlight)

  - They are also an alternative option for Greater Demon tasks outside of the wilderness and Konaar.
  - They drop: [[Tormented Synapse]] [[Burning Claw]] [[Guthixian Temple Teleport]]
  - You can now [[/create]] these items: [[Emberlight]] [[Scorching bow]] [[Purging staff]] [[Burning Claws]]
  - The [[Emberlight]], [[Scorching bow]] and [[Purging staff]] weapons now act as demonbane weapons.
  - [[Emberlight]] boosts at all demon mobs, Scorching Bow, Purging Staff and Burning Claws only affect TDs (with the exception of Scorching Bow also being BIS at K'ril)

## Update 6/10/2024

We now have a new wiki at https://wiki.oldschool.gg/, and the BSO Wiki is now combined together with the OSB wiki. Many pages are out of date, I'm trying to update pages when I have time. Currently, the only way to contribute to the new wiki is by editing files in [this folder on github](https://github.com/oldschoolgg/oldschoolbot/tree/master/docs/src/content/docs).

### [[gc]]

- Added new quests: The Heart of Darkness, Death on the Isle, Meat and Greet, Ethically Acquired Antiquities. You can view information on them on the new [Quests](/osb/quests) page.
- Added Araxxor. For costs, requirements, boosts, etc, look here: [Araxxor](https://wiki.oldschool.gg/osb/monsters/#araxxor)

  - Added the combat achievements, they are listed in the [Combat Achivements](osb/combat-achievements) page and on the OSRS Wiki
  - Added the collection log
  - Added [[Noxious halberd]], which can be created using the pieces dropped by Araxxor, and gives a boost to Corp.
  - Added [[Amulet of rancour]], which can be created using [[Amulet of torture]] [[Araxyte fang]], you can create a [[Amulet of rancour (s)]] from it if you _own_ the following items: Amulet of rancour, Aranea boots, Araxyte slayer helmet, Noxious halberd, Rax
  - Added the 2 new slayer helmets: [[Araxyte slayer helmet]] [[Araxyte slayer helmet (i)]]
  - If you receive a [[Nid]] and [[Coagulated venom]], you can create a [[Rax]] (and also revert it back)
  - Added More Eyes Than Sense and EyeSeeYou slayer unlocks

- "Engine changes"
  - Improved speed of simulation code (e.g. opening clues, killing monsters, etc) to be 20x faster
  - Changed the library we use for images (E.g. bank images) due to a memory leak in the one we were using.

### [[nwjgit]]

- The Crystal pickaxe now can be used anywhere a dragon pickaxe is used.
- You can now open [[Amylase pack]]
- Removed Kourend Favor from music cape requirement
- Make Amascut's Remnant Grandmaster CA claimable with /ca claim based off your cl having Cursed phalanx.
- Added a Lamp and Openable bank filter
- Improved text in woodcutting trip message
- You can now cannon Jogres (for champion scrolls)
- Removed [[/activities champions_challenge]], the correct command is now: [[/activities other activity\:Champions Challenge]]
- Added [[Fancier boots]] to stronghold loot
- Added a way to reclaim boots if lost (by running the command again): [[/activities other\:Stronghold of Security]]
- Fixed [[/casket]]

#### Chambers of Xeric: Fake Massing

You can now do 'fake masses' of CoX, so you can mass CoX without needing other real players to join your party, which is what Nex/ToB also allow. It acts as a normal mass but checks your minion for kc and boosts. You can specify the number of fake users with the 'max_team_size' option (2 - 15).

The command to do this is: [[/raid cox start type\:fakemass]]

#### Chambers of Xeric: Balancing

- Updated various aspects of CoX to closer match ingame times and boosts.
- Updated CA speed tasks to use actual trip duration
- Updated bis melee, range, mage gear (this affects gearscore)
- Updated item boosts
- Added scythe boost + charge usage
- Added a new command [[/raid cox itemboosts]] to check your itemboosts for CoX
- Added ammo usage

#### Agility Arena

- Added [[Brimhaven voucher]]
- Added quantity to agility arena trips
- Removed old xp code and replace with static ticket value
- Removed recolor command, and added graceful to the shop command

### [[Arodab]]

- Nechryael tasks assigned by Krystilia are now being extended properly
- Buffed Crystal shard droprates to match OSRS update

### [[DaughtersOfNyx]]

- Improved appearance of tabs in the wiki sidebar
