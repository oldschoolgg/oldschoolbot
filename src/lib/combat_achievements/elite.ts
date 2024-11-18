import { Monsters } from 'oldschooljs';

import { Time } from 'e';
import {
	MIMIC_MONSTER_ID,
	NEX_ID,
	NIGHTMARE_ID,
	PHOSANI_NIGHTMARE_ID,
	ZALCANO_ID,
	demonBaneWeapons
} from '../constants';
import { SkillsEnum } from '../skilling/types';
import { Requirements } from '../structures/Requirements';
import type {
	ActivityTaskData,
	GauntletOptions,
	MonsterActivityTaskOptions,
	NightmareActivityTaskOptions,
	TOAOptions
} from '../types/minions';
import { anyoneDiedInTOARaid } from '../util';
import { resolveItems } from '../util';
import { crossbows } from '../util/minionUtils';
import { isCertainMonsterTrip } from './caUtils';
import type { CombatAchievement } from './combatAchievements';

export const eliteCombatAchievements: CombatAchievement[] = [
	{
		id: 1000,
		name: 'Perfect Sire',
		type: 'perfection',
		monster: 'Abyssal Sire',
		desc: 'Kill the Abyssal Sire without taking damage from the external tentacles, miasma pools, explosion or damage from the Abyssal Sire without praying the appropriate protection prayer.',
		rng: {
			chancePerKill: 55,
			hasChance: isCertainMonsterTrip(Monsters.AbyssalSire.id)
		}
	},
	{
		id: 1001,
		name: 'Abyssal Veteran',
		type: 'kill_count',
		monster: 'Abyssal Sire',
		desc: 'Kill the Abyssal Sire 50 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.AbyssalSire.id]: 50
			}
		})
	},
	{
		id: 1002,
		name: 'Demonic Rebound',
		type: 'mechanical',
		monster: 'Abyssal Sire',
		desc: "Use the Vengeance spell to reflect the damage from the Abyssal Sire's explosion back to him.",
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.AbyssalSire.id)
		}
	},
	{
		id: 1003,
		name: 'Respiratory Runner',
		type: 'mechanical',
		monster: 'Abyssal Sire',
		desc: 'Kill the Abyssal Sire after only stunning him once.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.AbyssalSire.id)
		}
	},
	{
		id: 1004,
		name: 'Alchemical Veteran',
		type: 'kill_count',
		monster: 'Alchemical Hydra',
		desc: 'Kill the Alchemical Hydra 75 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.AlchemicalHydra.id]: 75
			}
		})
	},
	{
		id: 1005,
		name: 'Reflecting on This Encounter',
		type: 'kill_count',
		monster: 'Basilisk Knight',
		desc: 'Kill a Basilisk Knight.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.BasiliskKnight.id]: 1
			}
		})
	},
	{
		id: 1006,
		name: 'Callisto Veteran',
		type: 'kill_count',
		monster: 'Callisto',
		desc: 'Kill Callisto 20 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Callisto.id]: 20
			}
		})
	},
	{
		id: 1007,
		name: 'Ghost Buster',
		type: 'mechanical',
		monster: 'Cerberus',
		desc: 'Kill Cerberus after successfully negating 6 or more attacks from Summoned Souls.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Cerberus.id)
		}
	},
	{
		id: 1008,
		name: 'Unrequired Antifire',
		type: 'perfection',
		monster: 'Cerberus',
		desc: 'Kill Cerberus without taking damage from any lava pools.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Cerberus.id)
		}
	},
	{
		id: 1009,
		name: 'Cerberus Veteran',
		type: 'kill_count',
		monster: 'Cerberus',
		desc: 'Kill Cerberus 75 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Cerberus.id]: 75
			}
		})
	},
	{
		id: 1010,
		name: 'Anti-Bite Mechanics',
		type: 'perfection',
		monster: 'Cerberus',
		desc: 'Kill Cerberus without taking any melee damage.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Cerberus.id)
		}
	},
	{
		id: 1011,
		name: 'Redemption Enthusiast',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		desc: 'Kill the Abyssal Portal without forcing Vespula to land.',
		rng: {
			chancePerKill: 55,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1012,
		name: 'Perfectly Balanced',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		desc: 'Kill the Vanguards without them resetting their health.',
		rng: {
			chancePerKill: 45,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1013,
		name: 'Dancing with Statues',
		type: 'perfection',
		monster: 'Chambers of Xeric',
		desc: 'Receive kill-credit for a Stone Guardian without taking damage from falling rocks.',
		rng: {
			chancePerKill: 33,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1014,
		name: 'Shayzien Specialist',
		type: 'perfection',
		monster: 'Chambers of Xeric',
		desc: 'Receive kill-credit for a Lizardman Shaman without taking damage from any shamans in the room.',
		rng: {
			chancePerKill: 20,
			hasChance: 'Raids'
		}
	},
	{
		id: 1015,
		name: 'Cryo No More',
		type: 'perfection',
		monster: 'Chambers of Xeric',
		desc: 'Receive kill-credit for the Ice Demon without taking any damage.',
		rng: {
			chancePerKill: 15,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1016,
		name: 'Chambers of Xeric Veteran',
		type: 'kill_count',
		monster: 'Chambers of Xeric',
		desc: 'Complete the Chambers of Xeric 25 times.',
		requirements: new Requirements().add({
			minigames: {
				raids: 25
			}
		})
	},
	{
		id: 1017,
		name: 'Mutta-diet',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		desc: 'Kill the Muttadile without letting her or her baby recover hitpoints from the meat tree.',
		rng: {
			chancePerKill: 55,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1018,
		name: 'Blizzard Dodger',
		type: 'restriction',
		monster: 'Chambers of Xeric',
		desc: 'Receive kill-credit for the Ice Demon without activating the Protect from Range prayer.',
		rng: {
			chancePerKill: 55,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1019,
		name: 'Undying Raid Team',
		type: 'perfection',
		monster: 'Chambers of Xeric',
		desc: 'Complete a Chambers of Xeric raid without anyone dying.',
		rng: {
			chancePerKill: 33,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1020,
		name: 'Kill It with Fire',
		type: 'restriction',
		monster: 'Chambers of Xeric',
		desc: 'Finish off the Ice Demon with a fire spell.',
		rng: {
			chancePerKill: 15,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1021,
		name: "Together We'll Fall",
		desc: 'Kill the Vanguards within 10 seconds of the first one dying.',
		type: 'mechanical',
		monster: 'Chambers of Xeric',
		rng: {
			chancePerKill: 5,
			hasChance: data => data.type === 'Raids'
		}
	},
	{
		id: 1022,
		name: 'Dust Seeker',
		desc: 'Complete a Chambers of Xeric Challenge mode raid in the target time.',
		type: 'speed',
		monster: 'Chambers of Xeric: Challenge Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'Raids'
		}
	},
	{
		id: 1023,
		name: 'Chaos Elemental Veteran',
		desc: 'Kill the Chaos Elemental 25 times.',
		type: 'kill_count',
		monster: 'Chaos Elemental',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.ChaosElemental.id]: 25
			}
		})
	},
	{
		id: 1024,
		name: 'Commander Zilyana Veteran',
		desc: 'Kill Commander Zilyana 100 times.',
		type: 'kill_count',
		monster: 'Commander Zilyana',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.CommanderZilyana.id]: 100
			}
		})
	},
	{
		id: 1025,
		name: 'Reminisce',
		desc: 'Kill Commander Zilyana in a private instance with melee only.',
		type: 'restriction',
		monster: 'Commander Zilyana',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) => {
				const styles = user.getAttackStyles();
				return (
					isCertainMonsterTrip(Monsters.CommanderZilyana.id)(data) &&
					([SkillsEnum.Ranged, SkillsEnum.Magic] as const).every(styl => !styles.includes(styl))
				);
			}
		}
	},
	{
		id: 1026,
		name: 'Chicken Killer',
		desc: 'Kill the Corporeal Beast solo.',
		type: 'restriction',
		monster: 'Corporeal Beast',
		rng: {
			chancePerKill: 1,
			hasChance: isCertainMonsterTrip(Monsters.CorporealBeast.id)
		}
	},
	{
		id: 1027,
		name: 'Hot on Your Feet',
		desc: 'Kill the Corporeal Beast without anyone killing the dark core or taking damage from the dark core.',
		type: 'perfection',
		monster: 'Corporeal Beast',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.CorporealBeast.id)
		}
	},
	{
		id: 1028,
		name: 'Corporeal Beast Veteran',
		desc: 'Kill the Corporeal Beast 25 times.',
		type: 'kill_count',
		monster: 'Corporeal Beast',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.CorporealBeast.id]: 25
			}
		})
	},
	{
		id: 1029,
		name: 'Finding the Weak Spot',
		desc: 'Finish off the Corporeal Beast with a Crystal Halberd special attack.',
		type: 'restriction',
		monster: 'Corporeal Beast',
		rng: {
			chancePerKill: 5,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.CorporealBeast.id)(data) && user.hasEquipped('Crystal halberd')
		}
	},
	{
		id: 1030,
		name: '3, 2, 1 - Mage',
		desc: 'Kill the Corrupted Hunllef without taking damage off prayer.',
		type: 'perfection',
		monster: 'Corrupted Hunllef',
		rng: {
			chancePerKill: 44,
			hasChance: data => data.type === 'Gauntlet' && (data as GauntletOptions).corrupted
		}
	},
	{
		id: 1031,
		name: 'Corrupted Gauntlet Veteran',
		desc: 'Complete the Corrupted Gauntlet 5 times.',
		type: 'kill_count',
		monster: 'Corrupted Hunllef',
		requirements: new Requirements().add({
			minigames: {
				corrupted_gauntlet: 5
			}
		})
	},
	{
		id: 1032,
		name: 'Gauntlet Veteran',
		desc: 'Complete the Gauntlet 5 times.',
		type: 'kill_count',
		monster: 'Crystalline Hunllef',
		requirements: new Requirements().add({
			minigames: {
				gauntlet: 5
			}
		})
	},
	{
		id: 1033,
		name: 'Wolf Puncher',
		desc: 'Kill the Crystalline Hunllef without making more than one attuned weapon.',
		type: 'restriction',
		monster: 'Crystalline Hunllef',
		rng: {
			chancePerKill: 15,
			hasChance: data => data.type === 'Gauntlet' && !(data as GauntletOptions).corrupted
		}
	},
	{
		id: 1034,
		name: '3, 2, 1 - Range',
		desc: 'Kill the Crystalline Hunllef without taking damage off prayer.',
		type: 'perfection',
		monster: 'Crystalline Hunllef',
		rng: {
			chancePerKill: 15,
			hasChance: data => data.type === 'Gauntlet' && !(data as GauntletOptions).corrupted
		}
	},
	{
		id: 1035,
		name: 'Crystalline Warrior',
		desc: 'Kill the Crystalline Hunllef with a full set of perfected armour equipped.',
		type: 'restriction',
		monster: 'Crystalline Hunllef',
		rng: {
			chancePerKill: 22,
			hasChance: data => data.type === 'Gauntlet' && !(data as GauntletOptions).corrupted
		}
	},
	{
		id: 1036,
		name: 'Egniol Diet',
		desc: 'Kill the Crystalline Hunllef without making an egniol potion within the Gauntlet.',
		type: 'restriction',
		monster: 'Crystalline Hunllef',
		rng: {
			chancePerKill: 5,
			hasChance: data => data.type === 'Gauntlet' && !(data as GauntletOptions).corrupted
		}
	},
	{
		id: 1037,
		name: 'From One King to Another',
		desc: 'Kill Prime using a Rune Thrownaxe special attack, bounced off Dagannoth Rex.',
		type: 'mechanical',
		monster: 'Dagannoth Prime',
		rng: {
			chancePerKill: 5,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.DagannothPrime.id)(data) && user.hasEquipped('Rune thrownaxe')
		}
	},
	{
		id: 1038,
		name: 'Death to the Seer King',
		desc: 'Kill Dagannoth Prime whilst under attack by Dagannoth Supreme and Dagannoth Rex.',
		type: 'mechanical',
		monster: 'Dagannoth Prime',
		rng: {
			chancePerKill: 44,
			hasChance: isCertainMonsterTrip(Monsters.DagannothPrime.id)
		}
	},
	{
		id: 1039,
		name: 'Death to the Warrior King',
		desc: 'Kill Dagannoth Rex whilst under attack by Dagannoth Supreme and Dagannoth Prime.',
		type: 'mechanical',
		monster: 'Dagannoth Rex',
		rng: {
			chancePerKill: 33,
			hasChance: isCertainMonsterTrip(Monsters.DagannothRex.id)
		}
	},
	{
		id: 1040,
		name: 'Toppling the Diarchy',
		desc: 'Kill Dagannoth Rex and one other Dagannoth king at the exact same time.',
		type: 'mechanical',
		monster: 'Dagannoth Rex',
		rng: {
			chancePerKill: 33,
			hasChance: isCertainMonsterTrip(Monsters.DagannothRex.id)
		}
	},
	{
		id: 1041,
		name: 'Death to the Archer King',
		desc: 'Kill Dagannoth Supreme whilst under attack by Dagannoth Prime and Dagannoth Rex.',
		type: 'mechanical',
		monster: 'Dagannoth Supreme',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.DagannothSupreme.id)
		}
	},
	{
		id: 1042,
		name: 'Rapid Succession',
		desc: 'Kill all three Dagannoth Kings within 9 seconds of the first one.',
		type: 'mechanical',
		monster: 'Dagannoth Supreme',
		rng: {
			chancePerKill: 30,
			hasChance: data =>
				isCertainMonsterTrip(Monsters.DagannothPrime.id)(data) ||
				isCertainMonsterTrip(Monsters.DagannothRex.id)(data) ||
				isCertainMonsterTrip(Monsters.DagannothSupreme.id)(data)
		}
	},
	{
		id: 1043,
		name: 'If Gorillas Could Fly',
		desc: 'Kill a Demonic Gorilla.',
		type: 'kill_count',
		monster: 'Demonic Gorilla',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DemonicGorilla.id]: 1
			}
		})
	},
	{
		id: 1044,
		name: 'Hitting Them Where It Hurts',
		desc: 'Finish off a Demonic Gorilla with a demonbane weapon.',
		type: 'restriction',
		monster: 'Demonic Gorilla',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.DemonicGorilla.id)(data) && user.hasEquipped(demonBaneWeapons)
		}
	},
	// {
	// 	id: 1045,
	// 	name: 'Fragment of Seren Speed-Trialist',
	// 	desc: 'Kill The Fragment of Seren in less than 4 minutes.',
	// 	type: 'speed',
	// 	monster: 'Fragment of Seren',
	// 	notPossible: true
	// },
	// {
	// 	id: 1046,
	// 	name: 'Galvek Speed-Trialist',
	// 	desc: 'Kill Galvek in less than 3 minutes.',
	// 	type: 'speed',
	// 	monster: 'Galvek',
	// 	notPossible: true
	// },
	{
		id: 1047,
		name: 'Ourg Freezer II',
		desc: 'Kill General Graardor without him attacking any players.',
		type: 'mechanical',
		monster: 'General Graardor',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.GeneralGraardor.id)
		}
	},
	{
		id: 1048,
		name: 'General Graardor Veteran',
		desc: 'Kill General Graardor 100 times.',
		type: 'kill_count',
		monster: 'General Graardor',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GeneralGraardor.id]: 100
			}
		})
	},
	{
		id: 1049,
		name: 'Hard Hitter',
		desc: 'Kill the Giant Mole with 4 or fewer instances of damage.',
		type: 'mechanical',
		monster: 'Giant Mole',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.GiantMole.id)
		}
	},
	// {
	// 	id: 1050,
	// 	name: 'Glough Speed-Trialist',
	// 	desc: 'Kill Glough in less than 2 minutes and 30 seconds.',
	// 	type: 'speed',
	// 	monster: 'Glough',
	// 	notPossible: true
	// },
	{
		id: 1051,
		name: 'Grotesque Guardians Veteran',
		desc: 'Kill the Grotesque Guardians 50 times.',
		type: 'kill_count',
		monster: 'Grotesque Guardians',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GrotesqueGuardians.id]: 50
			}
		})
	},
	{
		id: 1052,
		name: 'From Dusk...',
		desc: 'Kill the Grotesque Guardians 10 times without leaving the instance.',
		type: 'stamina',
		monster: 'Grotesque Guardians',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GrotesqueGuardians.id]: 10
			}
		})
	},
	{
		id: 1053,
		name: 'Grotesque Guardians Speed-Trialist',
		desc: 'Kill the Grotesque Guardians in less than 2 minutes.',
		type: 'speed',
		monster: 'Grotesque Guardians',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 1054,
		name: 'Done before Dusk',
		desc: 'Kill the Grotesque Guardians before Dusk uses his prison attack for a second time.',
		type: 'mechanical',
		monster: 'Grotesque Guardians',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 1055,
		name: 'Perfect Grotesque Guardians',
		desc: "Kill the Grotesque Guardians whilst completing the 'Don't look at the eclipse', 'Prison Break', 'Granite Footwork', 'Heal no more', 'Static Awareness' and 'Done before dusk' tasks.",
		type: 'perfection',
		monster: 'Grotesque Guardians',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 1056,
		name: 'Plant-Based Diet',
		desc: 'Kill Hespori without losing any prayer points.',
		type: 'restriction',
		monster: 'Hespori',
		rng: {
			chancePerKill: 4,
			hasChance: isCertainMonsterTrip(Monsters.Hespori.id)
		}
	},
	{
		id: 1057,
		name: 'Hespori Speed-Trialist',
		desc: 'Kill the Hespori in less than 48 seconds.',
		type: 'speed',
		monster: 'Hespori',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.Hespori.id)
		}
	},
	{
		id: 1058,
		name: 'The Bane of Demons',
		desc: "Defeat K'ril Tsutsaroth in a private instance using only demonbane spells.",
		type: 'mechanical',
		monster: "K'ril Tsutsaroth",
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.KrilTsutsaroth.id)(data) && user.attackClass() === 'mage'
		}
	},
	{
		id: 1059,
		name: "K'ril Tsutsaroth Veteran",
		desc: "Kill K'ril Tsutsaroth 100 times.",
		type: 'kill_count',
		monster: "K'ril Tsutsaroth",
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KrilTsutsaroth.id]: 100
			}
		})
	},
	{
		id: 1060,
		name: 'Demonic Defence',
		desc: "Kill K'ril Tsutsaroth in a private instance without taking any of his melee hits.",
		type: 'perfection',
		monster: "K'ril Tsutsaroth",
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.KrilTsutsaroth.id)
		}
	},
	{
		id: 1061,
		name: 'Kalphite Queen Veteran',
		desc: 'Kill the Kalphite Queen 50 times.',
		type: 'kill_count',
		monster: 'Kalphite Queen',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KalphiteQueen.id]: 50
			}
		})
	},
	{
		id: 1062,
		name: 'Insect Deflection',
		desc: 'Kill the Kalphite Queen by using the Vengeance spell as the finishing blow.',
		type: 'mechanical',
		monster: 'Kalphite Queen',
		rng: {
			chancePerKill: 4,
			hasChance: isCertainMonsterTrip(Monsters.KalphiteQueen.id)
		}
	},
	{
		id: 1063,
		name: 'Prayer Smasher',
		desc: "Kill the Kalphite Queen using only the Verac's Flail as a weapon.",
		type: 'restriction',
		monster: 'Kalphite Queen',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.KalphiteQueen.id)(data) &&
				user.attackClass() === 'melee' &&
				user.hasEquipped("Verac's flail")
		}
	},
	{
		id: 1064,
		name: 'Ten-tacles',
		desc: 'Kill the Kraken 50 times in a private instance without leaving the room.',
		type: 'stamina',
		monster: 'Kraken',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Kraken.id]: 50
			}
		})
	},
	{
		id: 1065,
		name: "Kree'arra Veteran",
		desc: "Kill Kree'arra 100 times.",
		type: 'kill_count',
		monster: "Kree'arra",
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Kreearra.id]: 100
			}
		})
	},
	{
		id: 1066,
		name: 'Nex Survivors',
		desc: 'Kill Nex without anyone dying.',
		type: 'restriction',
		monster: 'Nex',
		rng: {
			chancePerKill: 12,
			hasChance: 'Nex'
		}
	},
	{
		id: 1067,
		name: 'Nex Veteran',
		desc: 'Kill Nex once.',
		type: 'kill_count',
		monster: 'Nex',
		requirements: new Requirements().add({
			kcRequirement: {
				[NEX_ID]: 1
			}
		})
	},
	{
		id: 1068,
		name: 'Phantom Muspah Veteran',
		desc: 'Kill the Phantom Muspah 25 times.',
		type: 'kill_count',
		monster: 'Phantom Muspah',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.PhantomMuspah.id]: 25
			}
		})
	},
	{
		id: 1069,
		name: 'Phantom Muspah Speed-Trialist',
		desc: 'Kill the Phantom Muspah in less than 3 minutes without a slayer task.',
		type: 'speed',
		monster: 'Phantom Muspah',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.PhantomMuspah.id)
		}
	},
	{
		id: 1070,
		name: 'Versatile Drainer',
		desc: "Drain the Phantom Muspah's Prayer with three different sources in one kill.",
		type: 'mechanical',
		monster: 'Phantom Muspah',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.PhantomMuspah.id)
		}
	},
	{
		id: 1071,
		name: "Can't Escape",
		desc: 'Kill the Phantom Muspah without running.',
		type: 'restriction',
		monster: 'Phantom Muspah',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.PhantomMuspah.id]: 1
			}
		})
	},
	{
		id: 1072,
		name: "Phosani's Veteran",
		desc: "Kill Phosani's Nightmare once.",
		type: 'kill_count',
		monster: "Phosani's Nightmare",
		requirements: new Requirements().add({
			kcRequirement: {
				[PHOSANI_NIGHTMARE_ID]: 1
			}
		})
	},
	{
		id: 1073,
		name: 'Scorpia Veteran',
		desc: 'Kill Scorpia 25 times.',
		type: 'kill_count',
		monster: 'Scorpia',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Scorpia.id]: 25
			}
		})
	},
	{
		id: 1074,
		name: 'Demon Evasion',
		desc: 'Kill Skotizo without taking any damage.',
		type: 'perfection',
		monster: 'Skotizo',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Skotizo.id)
		}
	},
	{
		id: 1075,
		name: 'Up for the Challenge',
		desc: 'Kill Skotizo without equipping a demonbane weapon.',
		type: 'restriction',
		monster: 'Skotizo',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Skotizo.id)(data) && !user.hasEquipped(demonBaneWeapons, false)
		}
	},
	{
		id: 1076,
		name: 'Mimic Veteran',
		desc: 'Kill the Mimic once.',
		type: 'kill_count',
		monster: 'The Mimic',
		requirements: new Requirements().add({
			kcRequirement: {
				[MIMIC_MONSTER_ID]: 1
			}
		})
	},
	{
		id: 1077,
		name: 'Nightmare Veteran',
		desc: 'Kill The Nightmare 25 times.',
		type: 'kill_count',
		monster: 'The Nightmare',
		requirements: new Requirements().add({
			kcRequirement: {
				[NIGHTMARE_ID]: 25
			}
		})
	},
	{
		id: 1078,
		name: 'Explosion!',
		desc: 'Kill two Husks at the same time.',
		type: 'mechanical',
		monster: 'The Nightmare',
		rng: {
			chancePerKill: 25,
			hasChance: data => data.type === 'Nightmare' && !(data as NightmareActivityTaskOptions).isPhosani
		}
	},
	{
		id: 1079,
		name: 'Nightmare (5-Scale) Speed-Trialist',
		desc: 'Defeat the Nightmare (5-scale) in less than 5 minutes.',
		type: 'speed',
		monster: 'The Nightmare',
		rng: {
			chancePerKill: 45,
			hasChance: data => data.type === 'Nightmare' && !(data as NightmareActivityTaskOptions).isPhosani
		}
	},
	{
		id: 1080,
		name: 'Nightmare (Solo) Speed-Trialist',
		desc: 'Defeat the Nightmare (Solo) in less than 23 minutes. (Party size required)',
		type: 'speed',
		monster: 'The Nightmare',
		rng: {
			chancePerKill: 10,
			hasChance: data =>
				data.type === 'Nightmare' &&
				(data as NightmareActivityTaskOptions).method === 'solo' &&
				!(data as NightmareActivityTaskOptions).isPhosani
		}
	},
	{
		id: 1081,
		name: 'Sleep Tight',
		desc: 'Kill the Nightmare solo. (Party size required)',
		type: 'restriction',
		monster: 'The Nightmare',
		rng: {
			chancePerKill: 1,
			hasChance: data =>
				data.type === 'Nightmare' &&
				(data as NightmareActivityTaskOptions).method === 'solo' &&
				!(data as NightmareActivityTaskOptions).isPhosani
		}
	},
	{
		id: 1082,
		name: 'Theatre of Blood Veteran',
		desc: 'Complete the Theatre of Blood 25 times.',
		type: 'kill_count',
		monster: 'Theatre of Blood',
		requirements: new Requirements().add({
			minigames: {
				tob: 25
			}
		})
	},
	{
		id: 1083,
		name: 'Chally Time',
		desc: 'Defeat the Pestilent Bloat in the Theatre of Blood: Entry Mode by using a crystal halberd special attack as your final attack.',
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 2,
			hasChance: (data, user) => {
				return data.type === 'TheatreOfBlood' && user.hasEquipped(['Crystal halberd']);
			}
		}
	},
	{
		id: 1084,
		name: 'Nylocas, On the Rocks',
		desc: 'In the Theatre of Blood: Entry Mode, freeze any 4 Nylocas with a single Ice Barrage spell.',
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 15,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 1085,
		name: "They Won't Expect This",
		desc: 'In the Theatre of Blood: Entry Mode, enter the Pestilent Bloat room from the opposite side.',
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 3,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 1086,
		name: 'Appropriate Tools',
		desc: 'Defeat the Pestilent Bloat in the Theatre of Blood: Entry Mode with everyone having a salve amulet equipped.',
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 2,
			hasChance: (data, user) => {
				return data.type === 'TheatreOfBlood' && user.hasEquipped(['Salve amulet']);
			}
		}
	},
	{
		id: 1087,
		name: 'Anticoagulants',
		desc: 'Defeat the Maiden of Sugadinti in the Theatre of Blood: Entry Mode without letting any bloodspawn live for longer than 10 seconds.',
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 13,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 1088,
		name: 'Just To Be Safe',
		desc: 'Defeat Sotetseg in the Theatre of Blood: Entry Mode after having split the big ball with your entire team. This must be done with a group size of at least 2.',
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 13,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 1089,
		name: 'Attack, Step, Wait',
		desc: "Survive Verzik Vitur's second phase in the Theatre of Blood: Entry Mode without anyone getting bounced by Verzik.",
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 13,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 1090,
		name: 'No-Pillar',
		desc: "Survive Verzik Vitur's pillar phase in the Theatre of Blood: Entry Mode without losing a single pillar.",
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 13,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 1091,
		name: 'Pass It On',
		desc: 'In the Theatre of Blood: Entry Mode, successfully pass on the green ball to a team mate.',
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 13,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 1092,
		name: "Don't Look at Me!",
		desc: 'Kill Xarpus in the Theatre of Blood: Entry Mode without him reflecting any damage to anyone.',
		type: 'mechanical',
		monster: 'Theatre of Blood: Entry Mode',
		rng: {
			chancePerKill: 22,
			hasChance: 'TheatreOfBlood'
		}
	},
	{
		id: 1093,
		name: 'Hazard Prevention',
		desc: 'Kill the Thermonuclear Smoke Devil without it hitting anyone.',
		type: 'perfection',
		monster: 'Thermonuclear Smoke Devil',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.ThermonuclearSmokeDevil.id)
		}
	},
	{
		id: 1094,
		name: 'Thermonuclear Veteran',
		desc: 'Kill the Thermonuclear Smoke Devil 20 times.',
		type: 'kill_count',
		monster: 'Thermonuclear Smoke Devil',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.ThermonuclearSmokeDevil.id]: 20
			}
		})
	},
	{
		id: 1095,
		name: "Spec'd Out",
		desc: 'Kill the Thermonuclear Smoke Devil using only special attacks.',
		type: 'restriction',
		monster: 'Thermonuclear Smoke Devil',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.ThermonuclearSmokeDevil.id)
		}
	},
	{
		id: 1096,
		name: 'Tomb Explorer',
		desc: 'Complete the Tombs of Amascut once.',
		type: 'kill_count',
		monster: 'Tombs of Amascut',
		requirements: new Requirements().add({
			minigames: {
				tombs_of_amascut: 1
			}
		})
	},
	{
		id: 1097,
		name: "I'm in a rush",
		desc: 'Defeat Ba-Ba after destroying four or fewer rolling boulders in total without dying yourself.',
		type: 'mechanical',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 10,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 1098,
		name: 'Dropped the ball',
		desc: 'Defeat Akkha without dropping any materialising orbs and without dying yourself.',
		type: 'mechanical',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 10,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 1099,
		name: 'Helpful spirit who?',
		desc: 'Complete the Tombs of Amascut without using any supplies from the Helpful Spirit and without anyone dying. Honey locusts are included in this restriction.',
		type: 'restriction',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 10,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 1100,
		name: 'Down Do Specs',
		desc: 'Defeat the Wardens after staggering the boss a maximum of twice during phase two, without dying yourself.',
		type: 'mechanical',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 10,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 1101,
		name: 'Perfect Crondis',
		desc: 'Complete the Crondis room without letting a crocodile get to the tree, without anyone losing water from their container and in under one minute.',
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 10,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 1102,
		name: 'No skipping allowed',
		desc: 'Defeat Ba-Ba after only attacking the non-weakened boulders in the rolling boulder phase, without dying yourself. The Boulderdash invocation must be activated.',
		type: 'mechanical',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 10,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 1103,
		name: 'Hardcore Tombs',
		desc: 'Complete the Tombs of Amascut solo without dying. (Party size required)',
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 1,
			hasChance: data =>
				data.type === 'TombsOfAmascut' &&
				(data as TOAOptions).users.length === 1 &&
				!anyoneDiedInTOARaid(data as TOAOptions)
		}
	},
	{
		id: 1104,
		name: 'Hardcore Raiders',
		desc: 'Complete the Tombs of Amascut in a group of two or more without anyone dying. (Party size required)',
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 1,
			hasChance: data =>
				data.type === 'TombsOfAmascut' &&
				(data as TOAOptions).users.length >= 2 &&
				!anyoneDiedInTOARaid(data as TOAOptions)
		}
	},
	{
		id: 1105,
		name: 'Perfect Het',
		desc: 'Complete the Het room without taking any damage from the light beam and orbs. You must destroy the core after one exposure.',
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 15,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 1106,
		name: 'Perfect Apmeken',
		desc: 'Complete the Apmeken room in a group of two or more, without anyone allowing any dangers to trigger, standing in venom or being hit by a volatile baboon. You must complete this room in less than three minutes.',
		type: 'perfection',
		monster: 'Tombs of Amascut',
		rng: {
			chancePerKill: 10,
			hasChance: 'TombsOfAmascut'
		}
	},
	{
		id: 1107,
		name: 'Novice Tomb Raider',
		desc: 'Complete the Tombs of Amascut in Entry mode (or above) 50 times.',
		type: 'kill_count',
		monster: 'Tombs of Amascut: Entry Mode',
		requirements: new Requirements().add({
			name: 'Complete the Tombs of Amascut Entry mode (or above) 50 times.',
			has: ({ stats }) => {
				return stats.getToaKCs().totalKC >= 50;
			}
		})
	},
	{
		id: 1108,
		name: 'Expert Tomb Explorer',
		desc: 'Complete the Tombs of Amascut (Expert mode) once.',
		type: 'kill_count',
		monster: 'Tombs of Amascut: Expert Mode',
		requirements: new Requirements().add({
			name: 'Complete the Tombs of Amascut (Expert mode) once.',
			has: ({ stats }) => {
				return stats.getToaKCs().expertKC >= 1;
			}
		})
	},
	// {
	// 	id: 1109,
	// 	name: "TzHaar-Ket-Rak's Speed-Trialist",
	// 	desc: "Complete TzHaar-Ket-Rak's first challenge in less than 45 seconds.",
	// 	type: 'speed',
	// 	monster: "TzHaar-Ket-Rak's Challenges",
	// 	notPossible: true
	// },
	// {
	// 	id: 1110,
	// 	name: 'Facing Jad Head-on III',
	// 	desc: "Complete TzHaar-Ket-Rak's second challenge with only melee.",
	// 	type: 'restriction',
	// 	monster: "TzHaar-Ket-Rak's Challenges",
	// 	notPossible: true
	// },
	// {
	// 	id: 1111,
	// 	name: 'The II Jad Challenge',
	// 	desc: "Complete TzHaar-Ket-Rak's second challenge.",
	// 	type: 'kill_count',
	// 	monster: "TzHaar-Ket-Rak's Challenges",
	// 	notPossible: true
	// },
	{
		id: 1112,
		name: 'Half-Way There',
		desc: 'Kill a Jal-Zek within the Inferno.',
		type: 'kill_count',
		monster: 'TzKal-Zuk',
		requirements: new Requirements().add({
			minigames: {
				inferno: 1
			}
		})
	},
	{
		id: 1113,
		name: 'Fight Caves Veteran',
		desc: 'Complete the Fight Caves once.',
		type: 'kill_count',
		monster: 'TzTok-Jad',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.TzTokJad.id]: 1
			}
		})
	},
	{
		id: 1114,
		name: 'A Near Miss!',
		desc: 'Complete the Fight Caves after surviving a hit from TzTok-Jad without praying.',
		type: 'mechanical',
		monster: 'TzTok-Jad',
		rng: {
			chancePerKill: 3,
			hasChance: 'FightCaves'
		}
	},
	{
		id: 1115,
		name: 'Facing Jad Head-on',
		desc: 'Complete the Fight Caves with only melee.',
		type: 'restriction',
		monster: 'TzTok-Jad',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) => data.type === 'FightCaves' && user.attackClass() === 'melee'
		}
	},
	{
		id: 1116,
		name: 'Venenatis Veteran',
		desc: 'Kill Venenatis 20 times.',
		type: 'kill_count',
		monster: 'Venenatis',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Venenatis.id]: 20
			}
		})
	},
	{
		id: 1117,
		name: "Vet'eran",
		desc: "Kill Vet'ion 20 times.",
		type: 'kill_count',
		monster: "Vet'ion",
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Vetion.id]: 20
			}
		})
	},
	{
		id: 1118,
		name: 'Vorkath Veteran',
		desc: 'Kill Vorkath 50 times.',
		type: 'kill_count',
		monster: 'Vorkath',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Vorkath.id]: 50
			}
		})
	},
	{
		id: 1119,
		name: "Stick 'em With the Pointy End",
		desc: 'Kill Vorkath using melee weapons only.',
		type: 'restriction',
		monster: 'Vorkath',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) => {
				return isCertainMonsterTrip(Monsters.Vorkath.id)(data) && user.attackClass() === 'melee';
			}
		}
	},
	{
		id: 1120,
		name: 'Zombie Destroyer',
		desc: "Kill Vorkath's zombified spawn without using crumble undead.",
		type: 'restriction',
		monster: 'Vorkath',
		rng: {
			chancePerKill: 2,
			hasChance: isCertainMonsterTrip(Monsters.Vorkath.id)
		}
	},
	{
		id: 1121,
		name: 'Team Player',
		desc: 'Receive imbued tephra from a golem.',
		type: 'mechanical',
		monster: 'Zalcano',
		rng: {
			chancePerKill: 1,
			hasChance: 'Zalcano'
		}
	},
	{
		id: 1122,
		name: 'The Spurned Hero',
		desc: 'Kill Zalcano as the player who has dealt the most damage to her.',
		type: 'mechanical',
		monster: 'Zalcano',
		rng: {
			chancePerKill: 10,
			hasChance: 'Zalcano'
		}
	},
	{
		id: 1123,
		name: 'Zalcano Veteran',
		desc: 'Kill Zalcano 25 times.',
		type: 'kill_count',
		monster: 'Zalcano',
		requirements: new Requirements().add({
			kcRequirement: {
				[ZALCANO_ID]: 25
			}
		})
	},
	{
		id: 1124,
		name: 'Perfect Zalcano',
		desc: 'Kill Zalcano 5 times in a row without leaving or getting hit by the following: Falling rocks, rock explosions, Zalcano powering up, or standing in a red symbol.',
		type: 'perfection',
		monster: 'Zalcano',
		rng: {
			chancePerKill: 20,
			hasChance: 'Zalcano'
		}
	},
	{
		id: 1125,
		name: 'Snake. Snake!? Snaaaaaake!',
		desc: 'Kill 3 Snakelings simultaneously.',
		type: 'mechanical',
		monster: 'Zulrah',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.Zulrah.id)
		}
	},
	{
		id: 1126,
		name: 'Snake Rebound',
		desc: 'Kill Zulrah by using the Vengeance spell as the finishing blow.',
		type: 'mechanical',
		monster: 'Zulrah',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.Zulrah.id)
		}
	},
	{
		id: 1127,
		name: 'Zulrah Speed-Trialist',
		desc: 'Kill Zulrah in less than 1 minute 20 seconds, without a slayer task.',
		type: 'speed',
		monster: 'Zulrah',
		rng: {
			chancePerKill: 50,
			hasChance: data => isCertainMonsterTrip(Monsters.Zulrah.id)(data)
		}
	},
	{
		id: 1128,
		name: 'Zulrah Veteran',
		desc: 'Kill Zulrah 75 times.',
		type: 'kill_count',
		monster: 'Zulrah',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Zulrah.id]: 75
			}
		})
	},
	{
		id: 1129,
		name: 'I was here first!',
		desc: 'Kill a Jaguar Warrior using a Claw-type weapon special attack.',
		type: 'mechanical',
		monster: 'Colosseum',
		rng: {
			chancePerKill: 5,
			hasChance: 'Colosseum'
		}
	},
	{
		id: 1130,
		name: 'Denied',
		desc: 'Complete Wave 7 without the Minotaur ever healing other enemies.',
		type: 'mechanical',
		monster: 'Colosseum',
		rng: {
			chancePerKill: 12,
			hasChance: (data: ActivityTaskData) =>
				data.type === 'Colosseum' && (!data.diedAt || (Boolean(data.diedAt) && data.diedAt > 7))
		}
	},
	{
		id: 1131,
		name: 'Furball',
		desc: 'Complete Wave 4 without taking avoidable damage from a Manticore.',
		type: 'perfection',
		monster: 'Colosseum',
		rng: {
			chancePerKill: 12,
			hasChance: (data: ActivityTaskData) =>
				data.type === 'Colosseum' && (!data.diedAt || (Boolean(data.diedAt) && data.diedAt > 4))
		}
	},
	{
		id: 1132,
		name: 'Araxxor Veteran',
		desc: 'Kill Araxxor 25 times.',
		type: 'kill_count',
		monster: 'Araxxor',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Araxxor.id]: 25
			}
		})
	},
	{
		id: 1133,
		name: 'Araxxor Speed-Trialist',
		desc: 'Kill Araxxor 4 times in 10:00.',
		type: 'speed',
		monster: 'Araxxor',
		rng: {
			chancePerKill: 1,
			hasChance: data => {
				const qty = (data as MonsterActivityTaskOptions).q;
				const timePerKill = data.duration / Time.Minute / qty;
				return isCertainMonsterTrip(Monsters.Araxxor.id)(data) && qty >= 4 && timePerKill <= 2.5;
			}
		}
	},
	{
		id: 1134,
		name: 'Relaxxor',
		desc: 'Kill Araxxor after destroying six eggs.',
		type: 'restriction',
		monster: 'Araxxor',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Araxxor.id)
		}
	},
	// id: 1135
	// This was a duplicate CA from Araxxor, don't use this id
	{
		id: 1136,
		name: 'Rapid Reload',
		desc: 'Hit three Tormented Demons within 3 seconds using a ballista or a crossbow.',
		type: 'mechanical',
		monster: 'Tormented Demon',
		rng: {
			chancePerKill: 5,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.TormentedDemon.id)(data) &&
				(user.hasEquipped(crossbows) ||
					resolveItems(['Light ballista', 'Heavy ballista']).some(i => user.hasEquipped(i)))
		}
	},
	{
		id: 1137,
		name: 'Two Times the Torment',
		desc: 'Kill two Tormented Demons within 2 seconds.',
		type: 'restriction',
		monster: 'Tormented Demon',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.TormentedDemon.id)
		}
	},
	{
		id: 1138,
		name: 'Through Fire and Flames',
		desc: 'Kill a Tormented Demon whilst their shield is inactive.',
		type: 'restriction',
		monster: 'Tormented Demon',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.TormentedDemon.id)
		}
	},
	{
		id: 1139,
		name: 'Unending Torment',
		desc: 'Kill a Tormented Demon.',
		type: 'kill_count',
		monster: 'Tormented Demon',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.TormentedDemon.id]: 1
			}
		})
	},
	{
		id: 1140,
		name: 'Leviathan Adept',
		desc: 'Kill the Leviathan once.',
		type: 'kill_count',
		monster: 'The Leviathan',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.TheLeviathan.id]: 1
			}
		})
	},
	{
		id: 1141,
		name: 'Leviathan Speed-Trialist',
		desc: 'Kill the Leviathan in less than 1:50 without a slayer task.',
		type: 'speed',
		monster: 'The Leviathan',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.TheLeviathan.id)
		}
	},
	{
		id: 1142,
		name: 'Whisperer Speed-Trialist',
		desc: 'Kill the Whisperer in less than 3:00 without a slayer task.',
		type: 'speed',
		monster: 'The Whisperer',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.TheWhisperer.id)
		}
	},
	{
		id: 1143,
		name: 'Tentacular',
		desc: 'Kill the Whisperer whilst only being on the Arceuus spellbook.',
		type: 'restriction',
		monster: 'The Whisperer',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.TheWhisperer.id)
		}
	},
	{
		id: 1144,
		name: 'Whisperer Adept',
		desc: 'Kill the Whisperer once.',
		type: 'kill_count',
		monster: 'The Whisperer',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.TheWhisperer.id]: 1
			}
		})
	},
	{
		id: 1145,
		name: 'Vardorvis Speed-Trialist',
		desc: 'Kill Vardorvis in less than 1:15 minutes without a slayer task.',
		type: 'speed',
		monster: 'Vardorvis',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.Vardorvis.id)
		}
	},
	{
		id: 1146,
		name: 'Vardorvis Adept',
		desc: 'Kill Vardorvis once.',
		type: 'kill_count',
		monster: 'Vardorvis',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Vardorvis.id]: 1
			}
		})
	},
	{
		id: 1147,
		name: 'Duke Sucellus Speed-Trialist',
		desc: 'Kill Duke Sucellus in less than 1:45 minutes without a slayer task.',
		type: 'speed',
		monster: 'Duke Sucellus',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.DukeSucellus.id)
		}
	},
	{
		id: 1148,
		name: 'Duke Sucellus Adept',
		desc: 'Kill Duke Sucellus once.',
		type: 'kill_count',
		monster: 'Duke Sucellus',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DukeSucellus.id]: 1
			}
		})
	}
];
