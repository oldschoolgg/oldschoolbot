---
title: "Changelog"
sidebar:
  order: 3
---

# Update

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
