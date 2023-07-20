import { Monsters } from 'oldschooljs';

import { Requirements } from '../structures/Requirements';
import { isCertainMonsterTrip } from './caUtils';
import { type CombatAchievement } from './combatAchievements';

export const masterCombatAchievements: CombatAchievement[] = [
	{
		id: 2000,
		name: 'Lightning Lure',
		desc: 'Kill the Alchemical Hydra without being hit by the lightning attack.',
		type: 'mechanical'
	},
	{
		id: 2001,
		name: 'Alchemical Speed-Chaser',
		desc: 'Kill the Alchemical Hydra in less than 1 minute 45 seconds.',
		type: 'speed'
	},
	{
		id: 2002,
		name: 'Alcleanical Hydra',
		desc: 'Kill the Alchemical Hydra without taking any damage.',
		type: 'perfection'
	},
	{
		id: 2003,
		name: 'Mixing Correctly',
		desc: 'Kill the Alchemical Hydra without empowering it.',
		type: 'mechanical'
	},
	{
		id: 2004,
		name: 'Unrequired Antipoisons',
		desc: 'Kill the Alchemical Hydra without being hit by the acid pool attack.',
		type: 'mechanical'
	},
	{
		id: 2005,
		name: 'Alchemical Master',
		desc: 'Kill the Alchemical Hydra 150 times.',
		type: 'kill_count',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.AlchemicalHydra.id]: 150
			}
		})
	},
	{
		id: 2006,
		name: 'Working Overtime',
		desc: 'Kill the Alchemical Hydra 15 times without leaving the room.',
		type: 'stamina'
	},
	{
		id: 2007,
		name: 'The Flame Skipper',
		desc: 'Kill the Alchemical Hydra without letting it spawn a flame wall attack.',
		type: 'mechanical'
	},
	{
		id: 2008,
		name: "Don't Flame Me",
		desc: 'Kill the Alchemical Hydra without being hit by the flame wall attack.',
		type: 'mechanical'
	},
	{
		id: 2009,
		name: 'Arooo No More',
		desc: 'Kill Cerberus without any of the Summoned Souls being spawned.',
		type: 'mechanical'
	},
	{
		id: 2010,
		name: 'Cerberus Master',
		desc: 'Kill Cerberus 150 times.',
		type: 'kill_count',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Cerberus.id]: 150
			}
		})
	},
	{
		id: 2011,
		name: 'Perfect Olm (Solo)',
		desc: 'Kill the Great Olm in a solo raid without taking damage from any of the following: Teleport portals, Fire Walls, Healing pools, Crystal Bombs, Crystal Burst or Prayer Orbs. You also cannot let his claws regenerate or take damage from the same acid pool back to back.',
		type: 'perfection'
	},
	{
		id: 2012,
		name: 'Chambers of Xeric (Solo) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric (Solo) in less than 21 minutes.',
		type: 'speed'
	},
	{
		id: 2013,
		name: 'Chambers of Xeric (5-Scale) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric (5-scale) in less than 15 minutes.',
		type: 'speed'
	},
	{
		id: 2014,
		name: 'Putting It Olm on the Line',
		desc: 'Complete a Chambers of Xeric solo raid with more than 40,000 points.',
		type: 'mechanical'
	},
	{
		id: 2015,
		name: 'Playing with Lasers',
		desc: 'Clear the Crystal Crabs room without wasting an orb after the first crystal has been activated.',
		type: 'perfection'
	},
	{
		id: 2016,
		name: 'Chambers of Xeric (Trio) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric (Trio) in less than 16 minutes and 30 seconds.',
		type: 'speed'
	},
	{
		id: 2017,
		name: 'No Time for Death',
		desc: 'Clear the Tightrope room without Killing any Deathly Mages or Deathly Rangers.',
		type: 'mechanical'
	},
	{
		id: 2018,
		name: 'Chambers of Xeric Master',
		desc: 'Complete the Chambers of Xeric 75 times.',
		type: 'kill_count',
		requirements: new Requirements().add({
			minigames: {
				raids: 75
			}
		})
	},
	{
		id: 2019,
		name: 'Perfect Olm (Trio)',
		desc: 'Kill the Great Olm in a trio raid without any team member taking damage from any of the following: Teleport portals, Fire Walls, Healing pools, Crystal Bombs, Crystal Burst or Prayer Orbs. You also cannot let his claws regenerate or take damage from the same acid pool back to back.',
		type: 'perfection'
	},
	{
		id: 2020,
		name: 'Anvil No More',
		desc: 'Kill Tekton before he returns to his anvil for a second time after the fight begins.',
		type: 'mechanical'
	},
	{
		id: 2021,
		name: 'Undying Raider',
		desc: 'Complete a Chambers of Xeric solo raid without dying.',
		type: 'perfection'
	},
	{
		id: 2022,
		name: 'Stop Drop and Roll',
		desc: 'Kill Vasa Nistirio before he performs his teleport attack for the second time.',
		type: 'mechanical'
	},
	{
		id: 2023,
		name: 'A Not So Special Lizard',
		desc: 'Kill the Great Olm in a solo raid without letting him use any of the following special attacks in his second to last phase: Crystal Burst, Lightning Walls, Teleportation Portals or left-hand autohealing.',
		type: 'mechanical'
	},
	{
		id: 2024,
		name: 'Blind Spot',
		desc: 'Kill Tekton without taking any damage.',
		type: 'perfection'
	},
	{
		id: 2025,
		name: 'Immortal Raider',
		desc: 'Complete a Chambers of Xeric Challenge mode (Solo) raid without dying.',
		type: 'perfection'
	},
	{
		id: 2026,
		name: 'Chambers of Xeric: CM (5-Scale) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric: Challenge Mode (5-scale) in less than 30 minutes.',
		type: 'speed'
	},
	{
		id: 2027,
		name: 'Chambers of Xeric: CM (Solo) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric: Challenge Mode (Solo) in less than 45 minutes.',
		type: 'speed'
	},
	{
		id: 2028,
		name: 'Immortal Raid Team',
		desc: 'Complete a Chambers of Xeric: Challenge mode raid without anyone dying.',
		type: 'perfection'
	},
	{
		id: 2029,
		name: 'Chambers of Xeric: CM Master',
		desc: 'Complete the Chambers of Xeric: Challenge Mode 10 times.',
		type: 'kill_count',
		requirements: new Requirements().add({
			minigames: {
				raids_challenge_mode: 10
			}
		})
	},
	{
		id: 2030,
		name: 'Chambers of Xeric: CM (Trio) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric: Challenge Mode (Trio) in less than 35 minutes.',
		type: 'speed'
	},
	{
		id: 2031,
		name: 'Moving Collateral',
		desc: 'Kill Commander Zilyana in a private instance without attacking her directly.',
		type: 'restriction'
	},
	{
		id: 2032,
		name: 'Corporeal Beast Master',
		desc: 'Kill the Corporeal Beast 50 times.',
		type: 'kill_count',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.CorporealBeast.id]: 50
			}
		})
	},
	{
		id: 2033,
		name: 'Corrupted Gauntlet Master',
		desc: 'Complete the Corrupted Gauntlet 10 times.',
		type: 'kill_count'
	},
	{
		id: 2034,
		name: 'Corrupted Warrior',
		desc: 'Kill the Corrupted Hunllef with a full set of perfected corrupted armour equipped.',
		type: 'restriction'
	},
	{
		id: 2035,
		name: "Defence Doesn't Matter II",
		desc: 'Kill the Corrupted Hunllef without making any armour within the Corrupted Gauntlet.',
		type: 'restriction'
	},
	{
		id: 2036,
		name: 'Perfect Corrupted Hunllef',
		desc: 'Kill the Corrupted Hunllef without taking damage from: Tornadoes, Damaging Floor or Stomp Attacks. Also, do not take damage off prayer and do not attack the Corrupted Hunllef with the wrong weapon.',
		type: 'perfection'
	},
	{
		id: 2037,
		name: 'Corrupted Gauntlet Speed-Chaser',
		desc: 'Complete a Corrupted Gauntlet in less than 7 minutes and 30 seconds.',
		type: 'speed'
	},
	{
		id: 2038,
		name: 'Gauntlet Master',
		desc: 'Complete the Gauntlet 20 times.',
		type: 'kill_count'
	},
	{
		id: 2039,
		name: 'Perfect Crystalline Hunllef',
		desc: 'Kill the Crystalline Hunllef without taking damage from: Tornadoes, Damaging Floor or Stomp Attacks. Also, do not take damage off prayer and do not attack the Crystalline Hunllef with the wrong weapon.',
		type: 'perfection'
	},
	{
		id: 2040,
		name: 'Gauntlet Speed-Chaser',
		desc: 'Complete the Gauntlet in less than 5 minutes.',
		type: 'speed'
	},
	{
		id: 2041,
		name: "Defence Doesn't Matter",
		desc: 'Kill the Crystalline Hunllef without making any armour within the Gauntlet.',
		type: 'restriction'
	},
	{
		id: 2042,
		name: 'Perfect Grotesque Guardians II',
		desc: 'Kill the Grotesque Guardians 5 times in a row without leaving the instance, whilst completing the Perfect Grotesque Guardians task every time.',
		type: 'perfection'
	},
	{
		id: 2043,
		name: 'Grotesque Guardians Speed-Chaser',
		desc: 'Kill the Grotesque Guardians in less than 1:40 minutes.',
		type: 'speed'
	},
	{
		id: 2044,
		name: "... 'til Dawn",
		desc: 'Kill the Grotesque Guardians 20 times without leaving the instance.',
		type: 'stamina'
	},
	{
		id: 2045,
		name: 'Hespori Speed-Chaser',
		desc: 'Kill the Hespori in less than 36 seconds.',
		type: 'speed'
	},
	{
		id: 2046,
		name: 'One Hundred Tentacles',
		desc: 'Kill the Kraken 100 times in a private instance without leaving the room.',
		type: 'stamina'
	},
	{
		id: 2047,
		name: 'Swoop No More',
		desc: "Kill Kree'arra in a private instance without taking any melee damage from the boss or his bodyguards.",
		type: 'perfection'
	},
	{
		id: 2048,
		name: 'Collateral Damage',
		desc: "Kill Kree'arra in a private instance without ever attacking him directly.",
		type: 'mechanical'
	},
	{
		id: 2049,
		name: 'Contain this!',
		desc: 'Kill Nex without anyone taking damage from any Ice special attack.',
		type: 'mechanical'
	},
	{
		id: 2050,
		name: 'Nex Master',
		desc: 'Kill Nex 25 times.',
		type: 'kill_count'
	},
	{
		id: 2051,
		name: 'Shadows Move...',
		desc: 'Kill Nex without anyone being hit by the Shadow Smash attack.',
		type: 'mechanical'
	},
	{
		id: 2052,
		name: 'Nex Trio',
		desc: 'Kill Nex with three or less players at the start of the fight.',
		type: 'restriction'
	},
	{
		id: 2053,
		name: 'There is no escape!',
		desc: 'Kill Nex without anyone being hit by the Smoke Dash special attack.',
		type: 'mechanical'
	},
	{
		id: 2054,
		name: 'A siphon will solve this',
		desc: 'Kill Nex without letting her heal from her Blood Siphon special attack.',
		type: 'mechanical'
	},
	{
		id: 2055,
		name: 'Walk Straight Pray True',
		desc: 'Kill the Phantom Muspah without taking any avoidable damage.',
		type: 'perfection'
	},
	{
		id: 2056,
		name: 'More than just a ranged weapon',
		desc: 'Kill the Phantom Muspah by only dealing damage to it with a salamander.',
		type: 'restriction'
	},
	{
		id: 2057,
		name: 'Space is Tight',
		desc: 'Kill the Phantom Muspah whilst it is surrounded by spikes.',
		type: 'mechanical'
	},
	{
		id: 2058,
		name: 'Phantom Muspah Speed-Chaser',
		desc: 'Kill the Phantom Muspah in less than 2 minutes without a slayer task.',
		type: 'speed'
	},
	{
		id: 2059,
		name: 'Essence Farmer',
		desc: 'Kill the Phantom Muspah 10 times in one trip.',
		type: 'stamina'
	},
	{
		id: 2060,
		name: 'Phantom Muspah Master',
		desc: 'Kill the Phantom Muspah 50 times.',
		type: 'kill_count'
	},
	{
		id: 2061,
		name: "Phosani's Speedchaser",
		desc: "Defeat Phosani's Nightmare within 9 minutes.",
		type: 'speed'
	},
	{
		id: 2062,
		name: "Phosani's Master",
		desc: "Kill Phosani's Nightmare 5 times.",
		type: 'kill_count'
	},
	{
		id: 2063,
		name: 'I Would Simply React',
		desc: "Kill Phosani's Nightmare without allowing your prayer to be disabled.",
		type: 'mechanical'
	},
	{
		id: 2064,
		name: 'Crush Hour',
		desc: "Kill Phosani's Nightmare while killing every parasite and husk in one hit.",
		type: 'mechanical'
	},
	{
		id: 2065,
		name: 'Dreamland Express',
		desc: "Kill Phosani's Nightmare without a sleepwalker reaching her during her desperation phase.",
		type: 'mechanical'
	},
	{
		id: 2066,
		name: 'Precise Positioning',
		desc: 'Kill Skotizo with the final source of damage being a Chinchompa explosion.',
		type: 'restriction'
	},
	{
		id: 2067,
		name: 'Perfect Nightmare',
		desc: "Kill the Nightmare without any player taking damage from the following attacks: Nightmare rifts, an un-cured parasite explosion, Corpse flowers or the Nightmare's Surge. Also, no player can take damage off prayer or have their attacks slowed by the Nightmare spores.",
		type: 'perfection'
	},
	{
		id: 2068,
		name: 'Nightmare (5-Scale) Speed-Chaser',
		desc: 'Defeat the Nightmare (5-scale) in less than 4 minutes.',
		type: 'speed'
	},
	{
		id: 2069,
		name: 'Nightmare Master',
		desc: 'Kill The Nightmare 50 times.',
		type: 'kill_count'
	},
	{
		id: 2070,
		name: 'Nightmare (Solo) Speed-Chaser',
		desc: 'Defeat the Nightmare (Solo) in less than 19 minutes.',
		type: 'speed'
	},
	{
		id: 2071,
		name: 'Perfect Xarpus',
		desc: "Kill Xarpus without anyone in the team taking any damage from Xarpus' attacks and without letting an exhumed heal Xarpus more than twice.",
		type: 'perfection'
	},
	{
		id: 2072,
		name: 'Theatre (5-Scale) Speed-Chaser',
		desc: 'Complete the Theatre of Blood (5-scale) in less than 16 minutes.',
		type: 'speed'
	},
	{
		id: 2073,
		name: 'Perfect Verzik',
		desc: "Defeat Verzik Vitur without anyone in the team taking damage from Verzik Vitur's attacks other than her spider form's correctly prayed against regular magical and ranged attacks.",
		type: 'perfection'
	},
	{
		id: 2074,
		name: 'Theatre (4-Scale) Speed-Chaser',
		desc: 'Complete the Theatre of Blood (4-scale) in less than 17 minutes.',
		type: 'speed'
	},
	{
		id: 2075,
		name: 'A Timely Snack',
		desc: 'Kill Sotetseg after surviving at least 3 ball attacks without sharing the damage and without anyone dying throughout the fight.',
		type: 'mechanical'
	},
	{
		id: 2076,
		name: 'Back in My Day...',
		desc: 'Complete the Theatre of Blood without any member of the team equipping a Scythe of Vitur.',
		type: 'restriction'
	},
	{
		id: 2077,
		name: 'Perfect Sotesteg',
		desc: "Kill Sotetseg without anyone in the team stepping on the wrong tile in the maze, without getting hit by the tornado and without taking any damage from Sotetseg's attacks whilst off prayer.",
		type: 'perfection'
	},
	{
		id: 2078,
		name: "Can't Drain This",
		desc: 'Kill The Maiden of Sugadinti without anyone in the team losing any prayer points.',
		type: 'restriction'
	},
	{
		id: 2079,
		name: 'Can You Dance?',
		desc: 'Kill Xarpus without anyone in the team using a ranged or magic weapon.',
		type: 'restriction'
	},
	{
		id: 2080,
		name: 'Pop It',
		desc: 'Kill Verzik without any Nylocas being frozen and without anyone taking damage from the Nylocas.',
		type: 'mechanical'
	},
	{
		id: 2081,
		name: 'Theatre (Trio) Speed-Chaser',
		desc: 'Complete the Theatre of Blood (Trio) in less than 20 minutes.',
		type: 'speed'
	},
	{
		id: 2082,
		name: 'Two-Down',
		desc: 'Kill the Pestilent Bloat before he shuts down for the third time.',
		type: 'mechanical'
	},
	{
		id: 2083,
		name: 'Perfect Maiden',
		desc: 'Kill The Maiden of Sugadinti without anyone in the team taking damage from the following sources: Blood Spawn projectiles and Blood Spawn trails. Also, without taking damage off prayer and without letting any of the Nylocas Matomenos heal The Maiden.',
		type: 'perfection'
	},
	{
		id: 2084,
		name: 'Perfect Bloat',
		desc: 'Kill the Pestilent Bloat without anyone in the team taking damage from the following sources: Pestilent flies, Falling body parts or The Pestilent Bloats stomp attack.',
		type: 'perfection'
	},
	{
		id: 2085,
		name: 'Theatre of Blood Master',
		desc: 'Complete the Theatre of Blood 75 times.',
		type: 'kill_count'
	},
	{
		id: 2086,
		name: 'Perfect Nylocas',
		desc: 'Kill the Nylocas Vasilias without anyone in the team attacking any Nylocas with the wrong attack style, without letting a pillar collapse and without getting hit by any of the Nylocas Vasilias attacks whilst off prayer.',
		type: 'perfection'
	},
	{
		id: 2087,
		name: 'Theatre of Blood: SM Speed-Chaser',
		desc: 'Complete the Theatre of Blood: Entry Mode in less than 17 minutes.',
		type: 'speed'
	},
	{
		id: 2088,
		name: 'Hard Mode? Completed It',
		desc: 'Complete the Theatre of Blood: Hard Mode within the challenge time.',
		type: 'speed'
	},
	{
		id: 2089,
		name: "Better get movin'",
		desc: "Defeat Elidinis' Warden in phase three of the Wardens fight with 'Aerial Assault', 'Stay vigilant' and 'Insanity' invocations activated and without dying yourself.",
		type: 'mechanical'
	},
	{
		id: 2090,
		name: 'Tomb Raider',
		desc: 'Complete the Tombs of Amascut 50 times.',
		type: 'kill_count'
	},
	{
		id: 2091,
		name: 'Chompington',
		desc: 'Defeat Zebak using only melee attacks and without dying yourself.',
		type: 'mechanical'
	},
	{
		id: 2092,
		name: 'Tombs Speed Runner',
		desc: 'Complete the Tombs of Amascut (normal) within 18 mins at any group size.',
		type: 'speed'
	},
	{
		id: 2093,
		name: 'Tomb Looter',
		desc: 'Complete the Tombs of Amascut 25 times.',
		type: 'kill_count'
	},
	{
		id: 2094,
		name: 'Perfect Akkha',
		desc: "Complete Akkha in a group of two or more, without anyone taking any damage from the following: Akkha's attacks off-prayer, Akkha's special attacks (orbs, memory, detonate), exploding shadow timers, orbs in the enrage phase or attacking Akkha with the wrong style. You must have all Akkha invocations activated.",
		type: 'perfection'
	},
	{
		id: 2095,
		name: 'Perfect Scabaras',
		desc: 'Complete the Scabaras room in less than a minute without anyone taking any damage from puzzles.',
		type: 'perfection'
	},
	{
		id: 2096,
		name: 'Perfect Kephri',
		desc: "Defeat Kephri in a group of two or more, without anyone taking any damage from the following: egg explosions, Kephri's attacks, Exploding Scarabs, Bodyguards, dung attacks. No eggs may hatch throughout the fight.",
		type: 'perfection'
	},
	{
		id: 2097,
		name: 'Perfect Zebak',
		desc: "Defeat Zebak without anyone taking any damage from: poison, Zebak's basic attacks off-prayer, blood spawns and waves. You also must not push more than two jugs on the roar attack during the fight (you may destroy stationary ones). You must have all Zebak invocations activated.",
		type: 'perfection'
	},
	{
		id: 2098,
		name: 'You are not prepared',
		desc: 'Complete a full Tombs of Amascut raid only using supplies given inside the tomb and without anyone dying.',
		type: 'restriction'
	},
	{
		id: 2099,
		name: 'Perfect Ba-Ba',
		desc: "Defeat Ba-Ba in a group of two or more, without anyone taking any damage from the following: Ba-Ba's Attacks off-prayer, Ba-Ba's slam, rolling boulders, rubble attack or falling rocks. No sarcophagi may be opened. You must have all Ba-Ba invocations activated.",
		type: 'perfection'
	},
	{
		id: 2100,
		name: 'Perfect Wardens',
		desc: 'Defeat The Wardens in a group of two or more, without anyone taking avoidable damage from the following: Warden attacks, obelisk attacks, lightning attacks in phase three, skull attack in phase three, Demi god attacks in phase three. You must have all Wardens invocations activated.',
		type: 'perfection'
	},
	{
		id: 2101,
		name: 'Ba-Bananza',
		desc: 'Defeat Ba-Ba with all Ba-Ba invocations activated and the path levelled up to at least four, without dying yourself.',
		type: 'mechanical'
	},
	{
		id: 2102,
		name: "Doesn't bug me",
		desc: 'Defeat Kephri with all Kephri invocations activated and the path levelled up to at least four, without dying yourself.',
		type: 'mechanical'
	},
	{
		id: 2103,
		name: 'But... Damage',
		desc: 'Complete the Tombs of Amascut without anyone in your party wearing or holding any equipment at tier 75 or above.',
		type: 'restriction'
	},
	{
		id: 2104,
		name: "Warden't you believe it",
		desc: 'Defeat the Wardens with all Wardens invocations activated, at expert level and without dying yourself.',
		type: 'mechanical'
	},
	{
		id: 2105,
		name: 'Fancy feet',
		desc: "Complete phase three of The Wardens in a group of two or more, using only melee attacks and without dying yourself. The 'Insanity' invocation must be activated.",
		type: 'restriction'
	},
	{
		id: 2106,
		name: 'Something of an expert myself',
		desc: 'Complete the Tombs of Amascut raid at level 350 or above without anyone dying.',
		type: 'mechanical'
	},
	{
		id: 2107,
		name: 'Expert Tomb Looter',
		desc: 'Complete the Tombs of Amascut (Expert mode) 25 times.',
		type: 'kill_count'
	},
	{
		id: 2108,
		name: 'All out of medics',
		desc: "Defeat Kephri without letting her heal above 25% after the first down. The 'Medic' invocation must be activated. You must do this without dying yourself.",
		type: 'mechanical'
	},
	{
		id: 2109,
		name: 'Resourceful Raider',
		desc: 'Complete the Tombs of Amascut with the "On a diet" and "Dehydration" invocations activated and without anyone dying.',
		type: 'restriction'
	},
	{
		id: 2110,
		name: "Rockin' around the croc",
		desc: 'Defeat Zebak with all Zebak invocations activated and the path levelled up to at least four, without dying yourself.',
		type: 'mechanical'
	},
	{
		id: 2111,
		name: 'The IV Jad Challenge',
		desc: "Complete TzHaar-Ket-Rak's fourth challenge.",
		type: 'kill_count'
	},
	{
		id: 2112,
		name: 'Multi-Style Specialist',
		desc: "Complete TzHaar-Ket-Rak's third challenge while using a different attack style for each JalTok-Jad.",
		type: 'mechanical'
	},
	{
		id: 2113,
		name: "TzHaar-Ket-Rak's Speed-Chaser",
		desc: "Complete TzHaar-Ket-Rak's third challenge in less than 3 minutes.",
		type: 'speed'
	},
	{
		id: 2114,
		name: 'Facing Jad Head-on IV',
		desc: "Complete TzHaar-Ket-Rak's fourth challenge with only melee.",
		type: 'restriction'
	},
	{
		id: 2115,
		name: "Supplies? Who Needs 'em?",
		desc: "Complete TzHaar-Ket-Rak's third challenge without having anything in your inventory.",
		type: 'perfection'
	},
	{
		id: 2116,
		name: 'Nibblers, Begone!',
		desc: 'Kill Tzkal-Zuk without letting a pillar fall before wave 67.',
		type: 'perfection'
	},
	{
		id: 2117,
		name: "You Didn't Say Anything About a Bat",
		desc: 'Complete the Fight Caves without being attacked by a Tz-Kih.',
		type: 'mechanical'
	},
	{
		id: 2118,
		name: 'Denying the Healers',
		desc: 'Complete the Fight caves without letting any of the Yt-MejKot heal.',
		type: 'mechanical'
	},
	{
		id: 2119,
		name: 'Fight Caves Master',
		desc: 'Complete the Fight Caves 5 times.',
		type: 'kill_count'
	},
	{
		id: 2120,
		name: 'Fight Caves Speed-Chaser',
		desc: 'Complete the Fight Caves in less than 30 minutes.',
		type: 'speed'
	},
	{
		id: 2121,
		name: 'The Walk',
		desc: 'Hit Vorkath 12 times during the acid special without getting hit by his rapid fire or the acid pools.',
		type: 'mechanical'
	},
	{
		id: 2122,
		name: 'Extended Encounter',
		desc: 'Kill Vorkath 10 times without leaving his area.',
		type: 'stamina'
	},
	{
		id: 2123,
		name: 'Dodging the Dragon',
		desc: 'Kill Vorkath 5 times without taking any damage from his special attacks and without leaving his area.',
		type: 'perfection'
	},
	{
		id: 2124,
		name: 'Vorkath Speed-Chaser',
		desc: 'Kill Vorkath in less than 1 minute and 15 seconds.',
		type: 'speed'
	},
	{
		id: 2125,
		name: 'Vorkath Master',
		desc: 'Kill Vorkath 100 times.',
		type: 'kill_count'
	},
	{
		id: 2126,
		name: 'Perfect Zulrah',
		desc: "Kill Zulrah whilst taking no damage from the following: Snakelings, Venom Clouds, Zulrah's Green or Crimson phase.",
		type: 'perfection'
	},
	{
		id: 2127,
		name: 'Zulrah Master',
		desc: 'Kill Zulrah 150 times.',
		type: 'kill_count'
	},
	{
		id: 2128,
		name: 'Zulrah Speed-Chaser',
		desc: 'Kill Zulrah in less than 1 minute, without a slayer task.',
		type: 'speed'
	}
];
