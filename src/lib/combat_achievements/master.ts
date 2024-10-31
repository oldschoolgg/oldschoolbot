import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { NEX_ID, NIGHTMARE_ID, PHOSANI_NIGHTMARE_ID } from '../constants';
import { Requirements } from '../structures/Requirements';
import type {
	ActivityTaskData,
	GauntletOptions,
	MonsterActivityTaskOptions,
	NightmareActivityTaskOptions,
	RaidsOptions,
	TOAOptions,
	TheatreOfBloodTaskOptions
} from '../types/minions';
import { anyoneDiedInTOARaid } from '../util';
import { isCertainMonsterTrip } from './caUtils';
import type { CombatAchievement } from './combatAchievements';

export const masterCombatAchievements: CombatAchievement[] = [
	{
		id: 2000,
		name: 'Lightning Lure',
		desc: 'Kill the Alchemical Hydra without being hit by the lightning attack.',
		type: 'mechanical',
		monster: 'Alchemical Hydra',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.AlchemicalHydra.id)
		}
	},
	{
		id: 2001,
		name: 'Alchemical Speed-Chaser',
		desc: 'Kill the Alchemical Hydra in less than 1 minute 45 seconds.',
		type: 'speed',
		monster: 'Alchemical Hydra',
		rng: {
			chancePerKill: 22,
			hasChance: isCertainMonsterTrip(Monsters.AlchemicalHydra.id)
		}
	},
	{
		id: 2002,
		name: 'Alcleanical Hydra',
		desc: 'Kill the Alchemical Hydra without taking any damage.',
		type: 'perfection',
		monster: 'Alchemical Hydra',
		rng: {
			chancePerKill: 33,
			hasChance: isCertainMonsterTrip(Monsters.AlchemicalHydra.id)
		}
	},
	{
		id: 2003,
		name: 'Mixing Correctly',
		desc: 'Kill the Alchemical Hydra without empowering it.',
		type: 'mechanical',
		monster: 'Alchemical Hydra',
		rng: {
			chancePerKill: 22,
			hasChance: isCertainMonsterTrip(Monsters.AlchemicalHydra.id)
		}
	},
	{
		id: 2004,
		name: 'Unrequired Antipoisons',
		desc: 'Kill the Alchemical Hydra without being hit by the acid pool attack.',
		type: 'mechanical',
		monster: 'Alchemical Hydra',
		rng: {
			chancePerKill: 25,
			hasChance: isCertainMonsterTrip(Monsters.AlchemicalHydra.id)
		}
	},
	{
		id: 2005,
		name: 'Alchemical Master',
		desc: 'Kill the Alchemical Hydra 150 times.',
		type: 'kill_count',
		monster: 'Alchemical Hydra',
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
		type: 'stamina',
		monster: 'Alchemical Hydra',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.AlchemicalHydra.id]: 15
			}
		})
	},
	{
		id: 2007,
		name: 'The Flame Skipper',
		desc: 'Kill the Alchemical Hydra without letting it spawn a flame wall attack.',
		type: 'mechanical',
		monster: 'Alchemical Hydra',
		rng: {
			chancePerKill: 25,
			hasChance: isCertainMonsterTrip(Monsters.AlchemicalHydra.id)
		}
	},
	{
		id: 2008,
		name: "Don't Flame Me",
		desc: 'Kill the Alchemical Hydra without being hit by the flame wall attack.',
		type: 'mechanical',
		monster: 'Alchemical Hydra',
		rng: {
			chancePerKill: 25,
			hasChance: isCertainMonsterTrip(Monsters.AlchemicalHydra.id)
		}
	},
	{
		id: 2009,
		name: 'Arooo No More',
		desc: 'Kill Cerberus without any of the Summoned Souls being spawned.',
		type: 'mechanical',
		monster: 'Cerberus',
		rng: {
			chancePerKill: 25,
			hasChance: isCertainMonsterTrip(Monsters.Cerberus.id)
		}
	},
	{
		id: 2010,
		name: 'Cerberus Master',
		desc: 'Kill Cerberus 150 times.',
		type: 'kill_count',
		monster: 'Cerberus',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Cerberus.id]: 150
			}
		})
	},
	{
		id: 2011,
		name: 'Perfect Olm (Solo)',
		desc: 'Kill the Great Olm in a solo raid without taking damage from any of the following: Teleport portals, Fire Walls, Healing pools, Crystal Bombs, Crystal Burst or Prayer Orbs. You also cannot let his claws regenerate or take damage from the same acid pool back to back. (Party size required)',
		type: 'perfection',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 44,
			hasChance: data =>
				data.type === 'Raids' && (data as RaidsOptions).users.length === 1 && !(data as RaidsOptions).isFakeMass
		}
	},
	{
		id: 2012,
		name: 'Chambers of Xeric (Solo) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric (Solo) in less than 21 minutes. (Party size required)',
		type: 'speed',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 25,
			hasChance: data =>
				data.type === 'Raids' && (data as RaidsOptions).users.length === 1 && !(data as RaidsOptions).isFakeMass
		}
	},
	{
		id: 2013,
		name: 'Chambers of Xeric (5-Scale) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric (5-scale) in less than 15 minutes.',
		type: 'speed',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 33,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 2014,
		name: 'Putting It Olm on the Line',
		desc: 'Complete a Chambers of Xeric solo raid with more than 40,000 points. (Party size required)',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 22,
			hasChance: data =>
				data.type === 'Raids' && (data as RaidsOptions).users.length === 1 && !(data as RaidsOptions).isFakeMass
		}
	},
	{
		id: 2015,
		name: 'Playing with Lasers',
		desc: 'Clear the Crystal Crabs room without wasting an orb after the first crystal has been activated.',
		type: 'perfection',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 22,
			hasChance: 'Raids'
		}
	},
	{
		id: 2016,
		name: 'Chambers of Xeric (Trio) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric (Trio) in less than 16 minutes and 30 seconds.',
		type: 'speed',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 44,
			hasChance: 'Raids'
		}
	},
	{
		id: 2017,
		name: 'No Time for Death',
		desc: 'Clear the Tightrope room without Killing any Deathly Mages or Deathly Rangers.',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 25,
			hasChance: 'Raids'
		}
	},
	{
		id: 2018,
		name: 'Chambers of Xeric Master',
		desc: 'Complete the Chambers of Xeric 75 times.',
		type: 'kill_count',
		monster: 'Chambers of Xeric',
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
		type: 'perfection',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 35,
			hasChance: 'Raids'
		}
	},
	{
		id: 2020,
		name: 'Anvil No More',
		desc: 'Kill Tekton before he returns to his anvil for a second time after the fight begins.',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 22,
			hasChance: 'Raids'
		}
	},
	{
		id: 2021,
		name: 'Undying Raider',
		desc: 'Complete a Chambers of Xeric solo raid without dying. (Party size required)',
		type: 'perfection',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 1,
			hasChance: data =>
				data.type === 'Raids' && (data as RaidsOptions).users.length === 1 && !(data as RaidsOptions).isFakeMass
		}
	},
	{
		id: 2022,
		name: 'Stop Drop and Roll',
		desc: 'Kill Vasa Nistirio before he performs his teleport attack for the second time.',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 15,
			hasChance: 'Raids'
		}
	},
	{
		id: 2023,
		name: 'A Not So Special Lizard',
		desc: 'Kill the Great Olm in a solo raid without letting him use any of the following special attacks in his second to last phase: Crystal Burst, Lightning Walls, Teleportation Portals or left-hand autohealing. (Party size required)',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 33,
			hasChance: data =>
				data.type === 'Raids' && (data as RaidsOptions).users.length === 1 && !(data as RaidsOptions).isFakeMass
		}
	},
	{
		id: 2024,
		name: 'Blind Spot',
		desc: 'Kill Tekton without taking any damage.',
		type: 'perfection',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 45,
			hasChance: 'Raids'
		}
	},
	{
		id: 2025,
		name: 'Immortal Raider',
		desc: 'Complete a Chambers of Xeric Challenge mode (Solo) raid without dying. (Party size required)',
		type: 'perfection',
		monster: 'Chambers of Xeric: Challenge Mode',
		rng: {
			chancePerKill: 10,
			hasChance: data =>
				data.type === 'Raids' &&
				(data as RaidsOptions).challengeMode &&
				(data as RaidsOptions).users.length === 1 &&
				!(data as RaidsOptions).isFakeMass
		}
	},
	{
		id: 2026,
		name: 'Chambers of Xeric: CM (5-Scale) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric: Challenge Mode (5-scale) in less than 30 minutes.',
		type: 'speed',
		monster: 'Chambers of Xeric: Challenge Mode',
		rng: {
			chancePerKill: 15,
			hasChance: data => data.type === 'Raids' && (data as RaidsOptions).challengeMode
		}
	},
	{
		id: 2027,
		name: 'Chambers of Xeric: CM (Solo) Speed-Chaser',
		desc: 'Complete a Chambers of Xeric: Challenge Mode (Solo) in less than 45 minutes. (Party size required)',
		type: 'speed',
		monster: 'Chambers of Xeric: Challenge Mode',
		rng: {
			chancePerKill: 15,
			hasChance: data =>
				data.type === 'Raids' &&
				(data as RaidsOptions).challengeMode &&
				(data as RaidsOptions).users.length === 1 &&
				!(data as RaidsOptions).isFakeMass
		}
	},
	{
		id: 2028,
		name: 'Immortal Raid Team',
		desc: 'Complete a Chambers of Xeric: Challenge mode raid without anyone dying.',
		type: 'perfection',
		monster: 'Chambers of Xeric: Challenge Mode',
		rng: {
			chancePerKill: 15,
			hasChance: data => data.type === 'Raids' && (data as RaidsOptions).challengeMode
		}
	},
	{
		id: 2029,
		name: 'Chambers of Xeric: CM Master',
		desc: 'Complete the Chambers of Xeric: Challenge Mode 10 times.',
		type: 'kill_count',
		monster: 'Chambers of Xeric: Challenge Mode',
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
		type: 'speed',
		monster: 'Chambers of Xeric: Challenge Mode',
		rng: {
			chancePerKill: 23,
			hasChance: data => data.type === 'Raids' && (data as RaidsOptions).challengeMode
		}
	},
	{
		id: 2031,
		name: 'Moving Collateral',
		desc: 'Kill Commander Zilyana in a private instance without attacking her directly.',
		type: 'restriction',
		monster: 'Commander Zilyana',
		rng: {
			chancePerKill: 50,
			hasChance: isCertainMonsterTrip(Monsters.CommanderZilyana.id)
		}
	},
	{
		id: 2032,
		name: 'Corporeal Beast Master',
		desc: 'Kill the Corporeal Beast 50 times.',
		type: 'kill_count',
		monster: 'Corporeal Beast',
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
		type: 'kill_count',
		monster: 'Corrupted Hunllef',
		requirements: new Requirements().add({
			minigames: {
				corrupted_gauntlet: 10
			}
		})
	},
	{
		id: 2034,
		name: 'Corrupted Warrior',
		desc: 'Kill the Corrupted Hunllef with a full set of perfected corrupted armour equipped.',
		type: 'restriction',
		monster: 'Corrupted Hunllef',
		rng: {
			chancePerKill: 5,
			hasChance: data => data.type === 'Gauntlet' && (data as GauntletOptions).corrupted
		}
	},
	{
		id: 2035,
		name: "Defence Doesn't Matter II",
		desc: 'Kill the Corrupted Hunllef without making any armour within the Corrupted Gauntlet.',
		type: 'restriction',
		monster: 'Corrupted Hunllef',
		rng: {
			chancePerKill: 5,
			hasChance: data => data.type === 'Gauntlet' && (data as GauntletOptions).corrupted
		}
	},
	{
		id: 2036,
		name: 'Perfect Corrupted Hunllef',
		desc: 'Kill the Corrupted Hunllef without taking damage from: Tornadoes, Damaging Floor or Stomp Attacks. Also, do not take damage off prayer and do not attack the Corrupted Hunllef with the wrong weapon.',
		type: 'perfection',
		monster: 'Corrupted Hunllef',
		rng: {
			chancePerKill: 20,
			hasChance: data => data.type === 'Gauntlet' && (data as GauntletOptions).corrupted
		}
	},
	{
		id: 2037,
		name: 'Corrupted Gauntlet Speed-Chaser',
		desc: 'Complete a Corrupted Gauntlet in less than 7 minutes and 30 seconds.',
		type: 'speed',
		monster: 'Corrupted Hunllef',
		rng: {
			chancePerKill: 20,
			hasChance: data => data.type === 'Gauntlet' && (data as GauntletOptions).corrupted
		}
	},
	{
		id: 2038,
		name: 'Gauntlet Master',
		desc: 'Complete the Gauntlet 20 times.',
		type: 'kill_count',
		monster: 'Crystalline Hunllef',
		requirements: new Requirements().add({
			minigames: {
				gauntlet: 20
			}
		})
	},
	{
		id: 2039,
		name: 'Perfect Crystalline Hunllef',
		desc: 'Kill the Crystalline Hunllef without taking damage from: Tornadoes, Damaging Floor or Stomp Attacks. Also, do not take damage off prayer and do not attack the Crystalline Hunllef with the wrong weapon.',
		type: 'perfection',
		monster: 'Crystalline Hunllef',
		rng: {
			chancePerKill: 20,
			hasChance: 'Gauntlet'
		}
	},
	{
		id: 2040,
		name: 'Gauntlet Speed-Chaser',
		desc: 'Complete the Gauntlet in less than 5 minutes.',
		type: 'speed',
		monster: 'Crystalline Hunllef',
		rng: {
			chancePerKill: 25,
			hasChance: 'Gauntlet'
		}
	},
	{
		id: 2041,
		name: "Defence Doesn't Matter",
		desc: 'Kill the Crystalline Hunllef without making any armour within the Gauntlet.',
		type: 'restriction',
		monster: 'Crystalline Hunllef',
		rng: {
			chancePerKill: 25,
			hasChance: 'Gauntlet'
		}
	},
	{
		id: 2042,
		name: 'Perfect Grotesque Guardians II',
		desc: 'Kill the Grotesque Guardians 5 times in a row without leaving the instance, whilst completing the Perfect Grotesque Guardians task every time.',
		type: 'perfection',
		monster: 'Grotesque Guardians',
		rng: {
			chancePerKill: 35,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 2043,
		name: 'Grotesque Guardians Speed-Chaser',
		desc: 'Kill the Grotesque Guardians in less than 1:40 minutes.',
		type: 'speed',
		monster: 'Grotesque Guardians',
		rng: {
			chancePerKill: 25,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 2044,
		name: "... 'til Dawn",
		desc: 'Kill the Grotesque Guardians 20 times without leaving the instance.',
		type: 'stamina',
		monster: 'Grotesque Guardians',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GrotesqueGuardians.id]: 20
			}
		})
	},
	{
		id: 2045,
		name: 'Hespori Speed-Chaser',
		desc: 'Kill the Hespori in less than 36 seconds.',
		type: 'speed',
		monster: 'Hespori',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Hespori.id)
		}
	},
	{
		id: 2046,
		name: 'One Hundred Tentacles',
		desc: 'Kill the Kraken 100 times in a private instance without leaving the room.',
		type: 'stamina',
		monster: 'Kraken',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Kraken.id]: 100
			}
		})
	},
	{
		id: 2047,
		name: 'Swoop No More',
		desc: "Kill Kree'arra in a private instance without taking any melee damage from the boss or his bodyguards.",
		type: 'perfection',
		monster: "Kree'arra",
		rng: {
			chancePerKill: 11,
			hasChance: isCertainMonsterTrip(Monsters.Kreearra.id)
		}
	},
	{
		id: 2048,
		name: 'Collateral Damage',
		desc: "Kill Kree'arra in a private instance without ever attacking him directly.",
		type: 'mechanical',
		monster: "Kree'arra",
		rng: {
			chancePerKill: 11,
			hasChance: isCertainMonsterTrip(Monsters.Kreearra.id)
		}
	},
	{
		id: 2049,
		name: 'Contain this!',
		desc: 'Kill Nex without anyone taking damage from any Ice special attack.',
		type: 'mechanical',
		monster: 'Nex',
		rng: {
			chancePerKill: 5,
			hasChance: 'Nex'
		}
	},
	{
		id: 2050,
		name: 'Nex Master',
		desc: 'Kill Nex 25 times.',
		type: 'kill_count',
		monster: 'Nex',
		requirements: new Requirements().add({
			kcRequirement: {
				[NEX_ID]: 25
			}
		})
	},
	{
		id: 2051,
		name: 'Shadows Move...',
		desc: 'Kill Nex without anyone being hit by the Shadow Smash attack.',
		type: 'mechanical',
		monster: 'Nex',
		rng: {
			chancePerKill: 11,
			hasChance: 'Nex'
		}
	},
	{
		id: 2052,
		name: 'Nex Trio',
		desc: 'Kill Nex with three or less players at the start of the fight.',
		type: 'restriction',
		monster: 'Nex',
		rng: {
			chancePerKill: 11,
			hasChance: 'Nex'
		}
	},
	{
		id: 2053,
		name: 'There is no escape!',
		desc: 'Kill Nex without anyone being hit by the Smoke Dash special attack.',
		type: 'mechanical',
		monster: 'Nex',
		rng: {
			chancePerKill: 15,
			hasChance: 'Nex'
		}
	},
	{
		id: 2054,
		name: 'A siphon will solve this',
		desc: 'Kill Nex without letting her heal from her Blood Siphon special attack.',
		type: 'mechanical',
		monster: 'Nex',
		rng: {
			chancePerKill: 15,
			hasChance: 'Nex'
		}
	},
	{
		id: 2055,
		name: 'Walk Straight Pray True',
		desc: 'Kill the Phantom Muspah without taking any avoidable damage.',
		type: 'perfection',
		monster: 'Phantom Muspah',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.PhantomMuspah.id)
		}
	},
	{
		id: 2056,
		name: 'More than just a ranged weapon',
		desc: 'Kill the Phantom Muspah by only dealing damage to it with a salamander.',
		type: 'restriction',
		monster: 'Phantom Muspah',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.PhantomMuspah.id)(data) &&
				['Black salamander', 'Red salamander', 'Orange salamander'].some(sal => user.hasEquipped(sal))
		}
	},
	{
		id: 2057,
		name: 'Space is Tight',
		desc: 'Kill the Phantom Muspah whilst it is surrounded by spikes.',
		type: 'mechanical',
		monster: 'Phantom Muspah',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.PhantomMuspah.id)
		}
	},
	{
		id: 2058,
		name: 'Phantom Muspah Speed-Chaser',
		desc: 'Kill the Phantom Muspah in less than 2 minutes without a slayer task.',
		type: 'speed',
		monster: 'Phantom Muspah',
		rng: {
			chancePerKill: 33,
			hasChance: isCertainMonsterTrip(Monsters.PhantomMuspah.id)
		}
	},
	{
		id: 2059,
		name: 'Essence Farmer',
		desc: 'Kill the Phantom Muspah 10 times in one trip.',
		type: 'stamina',
		monster: 'Phantom Muspah',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.PhantomMuspah.id]: 10
			}
		})
	},
	{
		id: 2060,
		name: 'Phantom Muspah Master',
		desc: 'Kill the Phantom Muspah 50 times.',
		type: 'kill_count',
		monster: 'Phantom Muspah',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.PhantomMuspah.id]: 50
			}
		})
	},
	{
		id: 2061,
		name: "Phosani's Speedchaser",
		desc: "Defeat Phosani's Nightmare within 9 minutes.",
		type: 'speed',
		monster: "Phosani's Nightmare",
		rng: {
			chancePerKill: 22,
			hasChance: data => data.type === 'Nightmare' && Boolean((data as NightmareActivityTaskOptions).isPhosani)
		}
	},
	{
		id: 2062,
		name: "Phosani's Master",
		desc: "Kill Phosani's Nightmare 5 times.",
		type: 'kill_count',
		monster: "Phosani's Nightmare",
		requirements: new Requirements().add({
			kcRequirement: {
				[PHOSANI_NIGHTMARE_ID]: 5
			}
		})
	},
	{
		id: 2063,
		name: 'I Would Simply React',
		desc: "Kill Phosani's Nightmare without allowing your prayer to be disabled.",
		type: 'mechanical',
		monster: "Phosani's Nightmare",
		rng: {
			chancePerKill: 22,
			hasChance: data => data.type === 'Nightmare' && Boolean((data as NightmareActivityTaskOptions).isPhosani)
		}
	},
	{
		id: 2064,
		name: 'Crush Hour',
		desc: "Kill Phosani's Nightmare while killing every parasite and husk in one hit.",
		type: 'mechanical',
		monster: "Phosani's Nightmare",
		rng: {
			chancePerKill: 33,
			hasChance: data => data.type === 'Nightmare' && Boolean((data as NightmareActivityTaskOptions).isPhosani)
		}
	},
	{
		id: 2065,
		name: 'Dreamland Express',
		desc: "Kill Phosani's Nightmare without a sleepwalker reaching her during her desperation phase.",
		type: 'mechanical',
		monster: "Phosani's Nightmare",
		rng: {
			chancePerKill: 33,
			hasChance: data => data.type === 'Nightmare' && Boolean((data as NightmareActivityTaskOptions).isPhosani)
		}
	},
	{
		id: 2066,
		name: 'Precise Positioning',
		desc: 'Kill Skotizo with the final source of damage being a Chinchompa explosion.',
		type: 'restriction',
		monster: 'Skotizo',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Skotizo.id)(data) &&
				resolveItems(['Red chinchompa', 'Black chinchompa']).some(i => user.hasEquipped(i))
		}
	},
	{
		id: 2067,
		name: 'Perfect Nightmare',
		desc: "Kill the Nightmare without any player taking damage from the following attacks: Nightmare rifts, an un-cured parasite explosion, Corpse flowers or the Nightmare's Surge. Also, no player can take damage off prayer or have their attacks slowed by the Nightmare spores.",
		type: 'perfection',
		monster: 'The Nightmare',
		rng: {
			chancePerKill: 33,
			hasChance: data => data.type === 'Nightmare' && !(data as NightmareActivityTaskOptions).isPhosani
		}
	},
	{
		id: 2068,
		name: 'Nightmare (5-Scale) Speed-Chaser',
		desc: 'Defeat the Nightmare (5-scale) in less than 4 minutes.',
		type: 'speed',
		monster: 'The Nightmare',
		rng: {
			chancePerKill: 33,
			hasChance: data => data.type === 'Nightmare' && !(data as NightmareActivityTaskOptions).isPhosani
		}
	},
	{
		id: 2069,
		name: 'Nightmare Master',
		desc: 'Kill The Nightmare 50 times.',
		type: 'kill_count',
		monster: 'The Nightmare',
		requirements: new Requirements().add({
			kcRequirement: {
				[NIGHTMARE_ID]: 50
			}
		})
	},
	{
		id: 2070,
		name: 'Nightmare (Solo) Speed-Chaser',
		desc: 'Defeat the Nightmare (Solo) in less than 19 minutes. (Party size required)',
		type: 'speed',
		monster: 'The Nightmare',
		rng: {
			chancePerKill: 33,
			hasChance: data =>
				data.type === 'Nightmare' &&
				(data as NightmareActivityTaskOptions).method === 'solo' &&
				!(data as NightmareActivityTaskOptions).isPhosani
		}
	},
	{
		id: 2071,
		name: 'Perfect Xarpus',
		desc: "Kill Xarpus without anyone in the team taking any damage from Xarpus' attacks and without letting an exhumed heal Xarpus more than twice.",
		type: 'perfection',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 50,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2072,
		name: 'Theatre (5-Scale) Speed-Chaser',
		desc: 'Complete the Theatre of Blood (5-scale) in less than 16 minutes.',
		type: 'speed',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 40,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2073,
		name: 'Perfect Verzik',
		desc: "Defeat Verzik Vitur without anyone in the team taking damage from Verzik Vitur's attacks other than her spider form's correctly prayed against regular magical and ranged attacks.",
		type: 'perfection',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 50,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2074,
		name: 'Theatre (4-Scale) Speed-Chaser',
		desc: 'Complete the Theatre of Blood (4-scale) in less than 17 minutes.',
		type: 'speed',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2075,
		name: 'A Timely Snack',
		desc: 'Kill Sotetseg after surviving at least 3 ball attacks without sharing the damage and without anyone dying throughout the fight.',
		type: 'mechanical',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2076,
		name: 'Back in My Day...',
		desc: 'Complete the Theatre of Blood without any member of the team equipping a Scythe of Vitur.',
		type: 'restriction',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: (data, user) => data.type === 'TheatreOfBlood' && !user.hasEquipped('Scythe of vitur')
		}
	},
	{
		id: 2077,
		name: 'Perfect Sotesteg',
		desc: "Kill Sotetseg without anyone in the team stepping on the wrong tile in the maze, without getting hit by the tornado and without taking any damage from Sotetseg's attacks whilst off prayer.",
		type: 'perfection',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2078,
		name: "Can't Drain This",
		desc: 'Kill The Maiden of Sugadinti without anyone in the team losing any prayer points.',
		type: 'restriction',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2079,
		name: 'Can You Dance?',
		desc: 'Kill Xarpus without anyone in the team using a ranged or magic weapon.',
		type: 'restriction',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2080,
		name: 'Pop It',
		desc: 'Kill Verzik without any Nylocas being frozen and without anyone taking damage from the Nylocas.',
		type: 'mechanical',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2081,
		name: 'Theatre (Trio) Speed-Chaser',
		desc: 'Complete the Theatre of Blood (Trio) in less than 20 minutes.',
		type: 'speed',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2082,
		name: 'Two-Down',
		desc: 'Kill the Pestilent Bloat before he shuts down for the third time.',
		type: 'mechanical',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2083,
		name: 'Perfect Maiden',
		desc: 'Kill The Maiden of Sugadinti without anyone in the team taking damage from the following sources: Blood Spawn projectiles and Blood Spawn trails. Also, without taking damage off prayer and without letting any of the Nylocas Matomenos heal The Maiden.',
		type: 'perfection',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2084,
		name: 'Perfect Bloat',
		desc: 'Kill the Pestilent Bloat without anyone in the team taking damage from the following sources: Pestilent flies, Falling body parts or The Pestilent Bloats stomp attack.',
		type: 'perfection',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2085,
		name: 'Theatre of Blood Master',
		desc: 'Complete the Theatre of Blood 75 times.',
		type: 'kill_count',
		monster: 'Theatre of Blood',
		requirements: new Requirements().add({
			minigames: {
				tob: 75
			}
		})
	},
	{
		id: 2086,
		name: 'Perfect Nylocas',
		desc: 'Kill the Nylocas Vasilias without anyone in the team attacking any Nylocas with the wrong attack style, without letting a pillar collapse and without getting hit by any of the Nylocas Vasilias attacks whilst off prayer.',
		type: 'perfection',
		monster: 'Theatre of Blood',
		rng: {
			chancePerKill: 55,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2087,
		name: 'Theatre of Blood: SM Speed-Chaser',
		desc: 'Complete the Theatre of Blood: Entry Mode in less than 17 minutes.',
		type: 'speed',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 10,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 2088,
		name: 'Hard Mode? Completed It',
		desc: 'Complete the Theatre of Blood: Hard Mode within the challenge time.',
		type: 'speed',
		monster: 'Theatre of Blood: Hard Mode',
		rng: {
			chancePerKill: 55,
			hasChance: data => data.type === 'TheatreOfBlood' && (data as TheatreOfBloodTaskOptions).hardMode
		}
	},
	{
		id: 2089,
		name: "Better get movin'",
		desc: "Defeat Elidinis' Warden in phase three of the Wardens fight with 'Aerial Assault', 'Stay vigilant' and 'Insanity' invocations activated and without dying yourself.",
		type: 'mechanical',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 55,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2090,
		name: 'Tomb Raider',
		desc: 'Complete the Tombs of Amascut 50 times.',
		type: 'kill_count',
		monster: 'Tombs of Amascut',
		requirements: new Requirements().add({
			minigames: {
				tombs_of_amascut: 50
			}
		})
	},
	{
		id: 2091,
		name: 'Chompington',
		desc: 'Defeat Zebak using only melee attacks and without dying yourself.',
		type: 'mechanical',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 25,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2092,
		name: 'Tombs Speed Runner',
		desc: 'Complete the Tombs of Amascut (normal) within 18 mins at any group size.',
		type: 'speed',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 44,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2093,
		name: 'Tomb Looter',
		desc: 'Complete the Tombs of Amascut 25 times.',
		type: 'kill_count',
		monster: 'Tombs of Amascut',
		requirements: new Requirements().add({
			minigames: {
				tombs_of_amascut: 25
			}
		})
	},
	{
		id: 2094,
		name: 'Perfect Akkha',
		desc: "Complete Akkha in a group of two or more, without anyone taking any damage from the following: Akkha's attacks off-prayer, Akkha's special attacks (orbs, memory, detonate), exploding shadow timers, orbs in the enrage phase or attacking Akkha with the wrong style. You must have all Akkha invocations activated.",
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 30,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2095,
		name: 'Perfect Scabaras',
		desc: 'Complete the Scabaras room in less than a minute without anyone taking any damage from puzzles.',
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2096,
		name: 'Perfect Kephri',
		desc: "Defeat Kephri in a group of two or more, without anyone taking any damage from the following: egg explosions, Kephri's attacks, Exploding Scarabs, Bodyguards, dung attacks. No eggs may hatch throughout the fight.",
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 55,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2097,
		name: 'Perfect Zebak',
		desc: "Defeat Zebak without anyone taking any damage from: poison, Zebak's basic attacks off-prayer, blood spawns and waves. You also must not push more than two jugs on the roar attack during the fight (you may destroy stationary ones). You must have all Zebak invocations activated.",
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 35,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2098,
		name: 'You are not prepared',
		desc: 'Complete a full Tombs of Amascut raid only using supplies given inside the tomb and without anyone dying.',
		type: 'restriction',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2099,
		name: 'Perfect Ba-Ba',
		desc: "Defeat Ba-Ba in a group of two or more, without anyone taking any damage from the following: Ba-Ba's Attacks off-prayer, Ba-Ba's slam, rolling boulders, rubble attack or falling rocks. No sarcophagi may be opened. You must have all Ba-Ba invocations activated.",
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2100,
		name: 'Perfect Wardens',
		desc: 'Defeat The Wardens in a group of two or more, without anyone taking avoidable damage from the following: Warden attacks, obelisk attacks, lightning attacks in phase three, skull attack in phase three, Demi god attacks in phase three. You must have all Wardens invocations activated.',
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2101,
		name: 'Ba-Bananza',
		desc: 'Defeat Ba-Ba with all Ba-Ba invocations activated and the path levelled up to at least four, without dying yourself.',
		type: 'mechanical',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2102,
		name: "Doesn't bug me",
		desc: 'Defeat Kephri with all Kephri invocations activated and the path levelled up to at least four, without dying yourself.',
		type: 'mechanical',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2103,
		name: 'But... Damage',
		desc: 'Complete the Tombs of Amascut without anyone in your party wearing or holding any equipment at tier 75 or above.',
		type: 'restriction',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2104,
		name: "Warden't you believe it",
		desc: 'Defeat the Wardens with all Wardens invocations activated, at expert level and without dying yourself.',
		type: 'mechanical',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2105,
		name: 'Fancy feet',
		desc: "Complete phase three of The Wardens in a group of two or more, using only melee attacks and without dying yourself. The 'Insanity' invocation must be activated.",
		type: 'restriction',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2106,
		name: 'Something of an expert myself',
		desc: 'Complete the Tombs of Amascut raid at level 350 or above without anyone dying.',
		type: 'mechanical',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 1,
			hasChance: data =>
				data.type === 'TombsOfAmascut' &&
				(data as TOAOptions).raidLevel >= 350 &&
				!anyoneDiedInTOARaid(data as TOAOptions)
		}
	},
	{
		id: 2107,
		name: 'Expert Tomb Looter',
		desc: 'Complete the Tombs of Amascut (Expert mode) 25 times.',
		type: 'kill_count',
		monster: 'Tombs of Amascut: Expert Mode',
		requirements: new Requirements().add({
			name: 'Complete the Tombs of Amascut (Expert mode) 25 times.',
			has: ({ stats }) => {
				return stats.getToaKCs().expertKC >= 25;
			}
		})
	},
	{
		id: 2108,
		name: 'All out of medics',
		desc: "Defeat Kephri without letting her heal above 25% after the first down. The 'Medic' invocation must be activated. You must do this without dying yourself.",
		type: 'mechanical',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2109,
		name: 'Resourceful Raider',
		desc: 'Complete the Tombs of Amascut with the "On a diet" and "Dehydration" invocations activated and without anyone dying.',
		type: 'restriction',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 55,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 2110,
		name: "Rockin' around the croc",
		desc: 'Defeat Zebak with all Zebak invocations activated and the path levelled up to at least four, without dying yourself.',
		type: 'mechanical',
		monster: 'Tombs of Amascut: Expert Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'TombsOfAmascut'
		}
	},
	// {
	// 	id: 2111,
	// 	name: 'The IV Jad Challenge',
	// 	desc: "Complete TzHaar-Ket-Rak's fourth challenge.",
	// 	type: 'kill_count',
	// 	monster: "TzHaar-Ket-Rak's Challenges",
	// 	notPossible: true
	// },
	// {
	// 	id: 2112,
	// 	name: 'Multi-Style Specialist',
	// 	desc: "Complete TzHaar-Ket-Rak's third challenge while using a different attack style for each JalTok-Jad.",
	// 	type: 'mechanical',
	// 	monster: "TzHaar-Ket-Rak's Challenges",
	// 	notPossible: true
	// },
	// {
	// 	id: 2113,
	// 	name: "TzHaar-Ket-Rak's Speed-Chaser",
	// 	desc: "Complete TzHaar-Ket-Rak's third challenge in less than 3 minutes.",
	// 	type: 'speed',
	// 	monster: "TzHaar-Ket-Rak's Challenges",
	// 	notPossible: true
	// },
	// {
	// 	id: 2114,
	// 	name: 'Facing Jad Head-on IV',
	// 	desc: "Complete TzHaar-Ket-Rak's fourth challenge with only melee.",
	// 	type: 'restriction',
	// 	monster: "TzHaar-Ket-Rak's Challenges",
	// 	notPossible: true
	// },
	// {
	// 	id: 2115,
	// 	name: "Supplies? Who Needs 'em?",
	// 	desc: "Complete TzHaar-Ket-Rak's third challenge without having anything in your inventory.",
	// 	type: 'perfection',
	// 	monster: "TzHaar-Ket-Rak's Challenges",
	// 	notPossible: true
	// },
	{
		id: 2116,
		name: 'Nibblers, Begone!',
		desc: 'Kill Tzkal-Zuk without letting a pillar fall before wave 67.',
		type: 'perfection',
		monster: 'TzKal-Zuk',
		rng: {
			chancePerKill: 10,
			hasChance: data => data.type === 'Inferno' && !data.diedPreZuk && !data.diedZuk
		}
	},
	{
		id: 2117,
		name: "You Didn't Say Anything About a Bat",
		desc: 'Complete the Fight Caves without being attacked by a Tz-Kih.',
		type: 'mechanical',
		monster: 'TzTok-Jad',
		rng: {
			chancePerKill: 25,
			hasChance: 'FightCaves'
		}
	},
	{
		id: 2118,
		name: 'Denying the Healers',
		desc: 'Complete the Fight caves without letting any of the Yt-MejKot heal.',
		type: 'mechanical',
		monster: 'TzTok-Jad',
		rng: {
			chancePerKill: 25,
			hasChance: 'FightCaves'
		}
	},
	{
		id: 2119,
		name: 'Fight Caves Master',
		desc: 'Complete the Fight Caves 5 times.',
		type: 'kill_count',
		monster: 'TzTok-Jad',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.TzTokJad.id]: 5
			}
		})
	},
	{
		id: 2120,
		name: 'Fight Caves Speed-Chaser',
		desc: 'Complete the Fight Caves in less than 30 minutes.',
		type: 'speed',
		monster: 'TzTok-Jad',
		rng: {
			chancePerKill: 7,
			hasChance: 'FightCaves'
		}
	},
	{
		id: 2121,
		name: 'The Walk',
		desc: 'Hit Vorkath 12 times during the acid special without getting hit by his rapid fire or the acid pools.',
		type: 'mechanical',
		monster: 'Vorkath',
		rng: {
			chancePerKill: 33,
			hasChance: isCertainMonsterTrip(Monsters.Vorkath.id)
		}
	},
	{
		id: 2122,
		name: 'Extended Encounter',
		desc: 'Kill Vorkath 10 times without leaving his area.',
		type: 'stamina',
		monster: 'Vorkath',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Vorkath.id]: 10
			}
		})
	},
	{
		id: 2123,
		name: 'Dodging the Dragon',
		desc: 'Kill Vorkath 5 times without taking any damage from his special attacks and without leaving his area.',
		type: 'perfection',
		monster: 'Vorkath',
		rng: {
			chancePerKill: 33,
			hasChance: data =>
				isCertainMonsterTrip(Monsters.Vorkath.id)(data) && (data as MonsterActivityTaskOptions).q >= 5
		}
	},
	{
		id: 2124,
		name: 'Vorkath Speed-Chaser',
		desc: 'Kill Vorkath in less than 1 minute and 15 seconds.',
		type: 'speed',
		monster: 'Vorkath',
		rng: {
			chancePerKill: 33,
			hasChance: isCertainMonsterTrip(Monsters.Vorkath.id)
		}
	},
	{
		id: 2125,
		name: 'Vorkath Master',
		desc: 'Kill Vorkath 100 times.',
		type: 'kill_count',
		monster: 'Vorkath',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Vorkath.id]: 100
			}
		})
	},
	{
		id: 2126,
		name: 'Perfect Zulrah',
		desc: "Kill Zulrah whilst taking no damage from the following: Snakelings, Venom Clouds, Zulrah's Green or Crimson phase.",
		type: 'perfection',
		monster: 'Zulrah',
		rng: {
			chancePerKill: 55,
			hasChance: isCertainMonsterTrip(Monsters.Zulrah.id)
		}
	},
	{
		id: 2127,
		name: 'Zulrah Master',
		desc: 'Kill Zulrah 150 times.',
		type: 'kill_count',
		monster: 'Zulrah',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Zulrah.id]: 150
			}
		})
	},
	{
		id: 2128,
		name: 'Zulrah Speed-Chaser',
		desc: 'Kill Zulrah in less than 1 minute, without a slayer task.',
		type: 'speed',
		monster: 'Zulrah',
		rng: {
			chancePerKill: 75,
			hasChance: isCertainMonsterTrip(Monsters.Zulrah.id)
		}
	},
	{
		id: 2129,
		name: 'One-off',
		desc: "Complete Wave 11 with either 'Red Flag', 'Dynamic Duo', or 'Doom II' active.",
		type: 'mechanical',
		monster: 'Colosseum',
		rng: {
			chancePerKill: 15,
			hasChance: (data: ActivityTaskData) =>
				data.type === 'Colosseum' && (!data.diedAt || (Boolean(data.diedAt) && data.diedAt > 11))
		}
	},
	{
		id: 2130,
		name: 'Showboating',
		desc: 'Defeat Sol Heredit after using Fortis Salute to the north, east, south and west of the arena while he is below 10% hitpoints.',
		type: 'mechanical',
		monster: 'Colosseum',
		rng: {
			chancePerKill: 15,
			hasChance: (data: ActivityTaskData) => data.type === 'Colosseum' && !data.diedAt
		}
	},
	{
		id: 2131,
		name: 'I Brought Mine Too',
		desc: 'Defeat Sol Heredit using only a Spear, Hasta or Halberd.',
		type: 'restriction',
		monster: 'Colosseum',
		rng: {
			chancePerKill: 15,
			hasChance: (data: ActivityTaskData) => data.type === 'Colosseum' && !data.diedAt
		}
	},
	{
		id: 2132,
		name: 'Sportsmanship',
		desc: 'Defeat Sol Heredit once.',
		type: 'kill_count',
		monster: 'Colosseum',
		requirements: new Requirements().add({
			minigames: {
				colosseum: 1
			}
		})
	},
	{
		id: 2133,
		name: 'Colosseum Speed-Chaser',
		desc: 'Complete the Colosseum with a total time of 28:00 or less.',
		type: 'speed',
		monster: 'Colosseum',
		rng: {
			chancePerKill: 1,
			hasChance: (data: ActivityTaskData) =>
				data.type === 'Colosseum' && !data.diedAt && data.duration < Time.Minute * 28
		}
	},
	{
		id: 2134,
		name: 'Araxyte Betrayal',
		desc: 'Have an Araxyte kill three other Araxytes.',
		type: 'mechanical',
		monster: 'Araxxor',
		rng: {
			chancePerKill: 25,
			hasChance: isCertainMonsterTrip(Monsters.Araxxor.id)
		}
	},
	{
		id: 2135,
		name: 'Perfect Araxxor',
		desc: "Kill Araxxor perfectly, without taking damage from Araxxor's Mage & Range attacks, melee attack off prayer, araxyte minions damage, or damage from acid pools.",
		type: 'perfection',
		monster: 'Araxxor',
		rng: {
			chancePerKill: 50,
			hasChance: isCertainMonsterTrip(Monsters.Araxxor.id)
		}
	},
	{
		id: 2136,
		name: 'Let it seep in',
		desc: 'Kill Araxxor without ever having venom or poison immunity.',
		type: 'restriction',
		monster: 'Araxxor',
		rng: {
			chancePerKill: 40,
			hasChance: isCertainMonsterTrip(Monsters.Araxxor.id)
		}
	},
	{
		id: 2137,
		name: 'Arachnid Lover',
		desc: 'Kill Araxxor 10 times without leaving.',
		type: 'stamina',
		monster: 'Araxxor',
		rng: {
			chancePerKill: 1,
			hasChance: data => {
				const qty = (data as MonsterActivityTaskOptions).q;
				return isCertainMonsterTrip(Monsters.Araxxor.id)(data) && qty >= 10;
			}
		}
	},
	{
		id: 2138,
		name: 'Araxxor Speed-Chaser',
		desc: 'Kill Araxxor 5 times in 10:00.',
		type: 'speed',
		monster: 'Araxxor',
		rng: {
			chancePerKill: 1,
			hasChance: data => {
				const qty = (data as MonsterActivityTaskOptions).q;
				const timePerKill = data.duration / Time.Minute / qty;
				return isCertainMonsterTrip(Monsters.Araxxor.id)(data) && qty >= 5 && timePerKill <= 2;
			}
		}
	},
	{
		id: 2139,
		name: 'Araxxor Master',
		desc: '	Kill Araxxor 75 times.',
		type: 'kill_count',
		monster: 'Araxxor',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Araxxor.id]: 75
			}
		})
	},
	{
		id: 2140,
		name: 'Three Times the Thrashing',
		desc: 'Kill three Tormented Demons within 3 seconds.',
		type: 'restriction',
		monster: 'Tormented Demon',
		rng: {
			chancePerKill: 25,
			hasChance: isCertainMonsterTrip(Monsters.TormentedDemon.id)
		}
	},
	{
		id: 2141,
		name: 'Serpentine Solo',
		desc: 'Kill the Leviathan without stunning the boss more than once.',
		type: 'mechanical',
		monster: 'The Leviathan',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.TheLeviathan.id)
		}
	},
	{
		id: 2142,
		name: 'Leviathan Master',
		desc: 'Kill the Leviathan 50 times.',
		type: 'kill_count',
		monster: 'The Leviathan',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.TheLeviathan.id]: 50
			}
		})
	},
	{
		id: 2143,
		name: 'Leviathan Speed-Chaser',
		desc: 'Kill the Leviathan in less than 1:25 without a slayer task.',
		type: 'speed',
		monster: 'The Leviathan',
		rng: {
			chancePerKill: 40,
			hasChance: isCertainMonsterTrip(Monsters.TheLeviathan.id)
		}
	},
	{
		id: 2144,
		name: 'Perfect Leviathan',
		desc: 'Kill the Leviathan perfectly 5 times without leaving.',
		type: 'perfection',
		monster: 'The Leviathan',
		rng: {
			chancePerKill: 100,
			hasChance: isCertainMonsterTrip(Monsters.TheLeviathan.id)
		}
	},
	{
		id: 2145,
		name: 'Whisperer Master',
		desc: 'Kill the Whisperer 50 times.',
		type: 'kill_count',
		monster: 'The Whisperer',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.TheWhisperer.id]: 50
			}
		})
	},
	{
		id: 2146,
		name: 'Whisperer Speed-Chaser',
		desc: 'Kill the Whisperer in less than 2:25 without a slayer task.',
		type: 'speed',
		monster: 'The Whisperer',
		rng: {
			chancePerKill: 40,
			hasChance: isCertainMonsterTrip(Monsters.TheWhisperer.id)
		}
	},
	{
		id: 2147,
		name: 'Perfect Whisperer',
		desc: 'Kill the Whisperer without taking avoidable damage 5 times without leaving.',
		type: 'perfection',
		monster: 'The Whisperer',
		rng: {
			chancePerKill: 100,
			hasChance: isCertainMonsterTrip(Monsters.TheWhisperer.id)
		}
	},
	{
		id: 2148,
		name: 'Vardorvis Speed-Chaser',
		desc: 'Kill Vardorvis in less than 1:05 without a slayer task.',
		type: 'speed',
		monster: 'Vardorvis',
		rng: {
			chancePerKill: 40,
			hasChance: isCertainMonsterTrip(Monsters.Vardorvis.id)
		}
	},
	{
		id: 2149,
		name: 'Vardorvis Master',
		desc: 'Kill Vardorvis 50 times.',
		type: 'kill_count',
		monster: 'Vardorvis',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Vardorvis.id]: 50
			}
		})
	},
	{
		id: 2150,
		name: 'Budget Cutter',
		desc: 'Kill Vardorvis with gear worth 2m or less in total.',
		type: 'restriction',
		monster: 'Vardorvis',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.Vardorvis.id)
		}
	},
	{
		id: 2151,
		name: 'Perfect Vardorvis',
		desc: 'Kill Vardorvis perfectly 5 times without leaving.',
		type: 'perfection',
		monster: 'Vardorvis',
		rng: {
			chancePerKill: 100,
			hasChance: isCertainMonsterTrip(Monsters.Vardorvis.id)
		}
	},
	{
		id: 2152,
		name: 'Cold Feet',
		desc: 'Kill Duke Sucellus without taking any avoidable damage, whilst also never running.',
		type: 'restriction',
		monster: 'Duke Sucellus',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.DukeSucellus.id)
		}
	},
	{
		id: 2153,
		name: 'Duke Sucellus Speed-Chaser',
		desc: 'Kill Duke Sucellus in less than 1:35 minutes without a slayer task.',
		type: 'speed',
		monster: 'Duke Sucellus',
		rng: {
			chancePerKill: 40,
			hasChance: isCertainMonsterTrip(Monsters.DukeSucellus.id)
		}
	},
	{
		id: 2154,
		name: 'Perfect Duke Sucellus',
		desc: 'Kill Duke Sucellus without taking any avoidable damage 5 times without leaving.',
		type: 'perfection',
		monster: 'Duke Sucellus',
		rng: {
			chancePerKill: 100,
			hasChance: isCertainMonsterTrip(Monsters.DukeSucellus.id)
		}
	},
	{
		id: 2155,
		name: 'Duke Sucellus Master',
		desc: 'Kill Duke Sucellus 50 times.',
		type: 'kill_count',
		monster: 'Duke Sucellus',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DukeSucellus.id]: 50
			}
		})
	}
];
