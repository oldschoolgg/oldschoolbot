import { Monsters } from 'oldschooljs';

import { NIGHTMARE_ID, demonBaneWeapons } from '../constants';
import { anglerOutfit } from '../data/CollectionsExport';
import { Requirements } from '../structures/Requirements';
import type { TOAOptions } from '../types/minions';
import { isCertainMonsterTrip } from './caUtils';
import type { CombatAchievement } from './combatAchievements';

export const hardCombatAchievements: CombatAchievement[] = [
	{
		id: 200,
		name: 'Abyssal Adept',
		type: 'kill_count',
		monster: 'Abyssal Sire',
		desc: 'Kill the Abyssal Sire 20 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.AbyssalSire.id]: 20
			}
		})
	},
	{
		id: 201,
		name: "Don't Whip Me",
		type: 'mechanical',
		monster: 'Abyssal Sire',
		desc: 'Kill the Abyssal Sire without being hit by any external tentacles.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.AbyssalSire.id)
		}
	},
	{
		id: 202,
		name: "Don't Stop Moving",
		type: 'perfection',
		monster: 'Abyssal Sire',
		desc: 'Kill the Abyssal Sire without taking damage from any miasma pools.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.AbyssalSire.id)
		}
	},
	{
		id: 203,
		name: 'They Grow Up Too Fast',
		type: 'mechanical',
		monster: 'Abyssal Sire',
		desc: 'Kill the Abyssal Sire without letting any Scion mature.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.AbyssalSire.id)
		}
	},
	{
		id: 204,
		name: 'Faithless Crypt Run',
		type: 'restriction',
		monster: 'Barrows',
		desc: 'Kill all six Barrows Brothers and loot the Barrows chest without ever having more than 0 prayer points.',
		rng: {
			chancePerKill: 2,
			hasChance: isCertainMonsterTrip(Monsters.Barrows.id)
		}
	},
	{
		id: 205,
		name: 'Just Like That',
		type: 'restriction',
		monster: 'Barrows',
		desc: 'Kill Karil using only damage dealt by special attacks.',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.Barrows.id)
		}
	},
	{
		id: 206,
		name: 'Callisto Adept',
		type: 'kill_count',
		monster: 'Callisto',
		desc: 'Kill Callisto 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Callisto.id]: 10
			}
		})
	},
	{
		id: 207,
		name: 'Chaos Elemental Adept',
		type: 'kill_count',
		monster: 'Chaos Elemental',
		desc: 'Kill the Chaos Elemental 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.ChaosElemental.id]: 10
			}
		})
	},
	{
		id: 208,
		name: 'The Flincher',
		type: 'perfection',
		monster: 'Chaos Elemental',
		desc: "Kill the Chaos Elemental without taking any damage from it's attacks.",
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.ChaosElemental.id)
		}
	},
	{
		id: 209,
		name: 'Hoarder',
		type: 'mechanical',
		monster: 'Chaos Elemental',
		desc: 'Kill the Chaos Elemental without it unequipping any of your items.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.ChaosElemental.id)
		}
	},
	{
		id: 210,
		name: 'Praying to the Gods',
		type: 'restriction',
		monster: 'Chaos Fanatic',
		desc: 'Kill the Chaos Fanatic 10 times without drinking any potion which restores prayer or leaving the Wilderness.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.ChaosFanatic.id)
		}
	},
	{
		id: 211,
		name: 'Chaos Fanatic Adept',
		type: 'kill_count',
		monster: 'Chaos Fanatic',
		desc: 'Kill the Chaos Fanatic 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.ChaosFanatic.id]: 25
			}
		})
	},
	{
		id: 212,
		name: 'Commander Showdown',
		type: 'mechanical',
		monster: 'Commander Zilyana',
		desc: 'Finish off Commander Zilyana while all of her bodyguards are dead.',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.CommanderZilyana.id)
		}
	},
	{
		id: 213,
		name: 'Commander Zilyana Adept',
		type: 'kill_count',
		monster: 'Commander Zilyana',
		desc: 'Kill Commander Zilyana 50 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.CommanderZilyana.id]: 50
			}
		})
	},
	{
		id: 214,
		name: 'Crazy Archaeologist Adept',
		type: 'kill_count',
		monster: 'Crazy Archaeologist',
		desc: 'Kill the Crazy Archaeologist 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.CrazyArchaeologist.id]: 25
			}
		})
	},
	{
		id: 215,
		name: 'Dagannoth Rex Adept',
		type: 'kill_count',
		monster: 'Dagannoth Rex',
		desc: 'Kill Dagannoth Rex 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DagannothRex.id]: 25
			}
		})
	},
	{
		id: 216,
		name: 'Dagannoth Supreme Adept',
		type: 'kill_count',
		monster: 'Dagannoth Supreme',
		desc: 'Kill Dagannoth Supreme 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DagannothSupreme.id]: 25
			}
		})
	},
	{
		id: 217,
		name: 'General Graardor Adept',
		type: 'kill_count',
		monster: 'General Graardor',
		desc: 'Kill General Graardor 50 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GeneralGraardor.id]: 50
			}
		})
	},
	{
		id: 218,
		name: 'General Showdown',
		type: 'mechanical',
		monster: 'General Graardor',
		desc: 'Finish off General Graardor whilst all of his bodyguards are dead.',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.GeneralGraardor.id)
		}
	},
	{
		id: 219,
		name: 'Ourg Freezer',
		type: 'mechanical',
		monster: 'General Graardor',
		desc: 'Kill General Graardor whilst he is immobilized.',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.GeneralGraardor.id)
		}
	},
	{
		id: 220,
		name: 'Why Are You Running?',
		type: 'mechanical',
		monster: 'Giant Mole',
		desc: 'Kill the Giant Mole without her burrowing more than 2 times.',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.GiantMole.id)
		}
	},
	{
		id: 221,
		name: 'Whack-a-Mole',
		type: 'mechanical',
		monster: 'Giant Mole',
		desc: 'Kill the Giant Mole within 10 seconds of her resurfacing.',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.GiantMole.id)
		}
	},
	{
		id: 222,
		name: 'Static Awareness',
		type: 'mechanical',
		monster: 'Grotesque Guardians',
		desc: 'Kill the Grotesque Guardians without being hit by any lightning attacks.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 223,
		name: 'Prison Break',
		type: 'mechanical',
		monster: 'Grotesque Guardians',
		desc: "Kill the Grotesque Guardians without taking damage from Dusk's prison attack.",
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 224,
		name: "Don't Look at the Eclipse",
		type: 'mechanical',
		monster: 'Grotesque Guardians',
		desc: "Kill the Grotesque Guardians without taking damage from Dusk's blinding attack.",
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 225,
		name: 'Granite Footwork',
		type: 'mechanical',
		monster: 'Grotesque Guardians',
		desc: "Kill the Grotesque Guardians without taking damage from Dawn's rockfall attack.",
		rng: {
			chancePerKill: 44,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 226,
		name: 'Heal No More',
		type: 'mechanical',
		monster: 'Grotesque Guardians',
		desc: 'Kill the Grotesque Guardians without letting Dawn receive any healing from her orbs.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.GrotesqueGuardians.id)
		}
	},
	{
		id: 227,
		name: 'Grotesque Guardians Adept',
		type: 'kill_count',
		monster: 'Grotesque Guardians',
		desc: 'Kill the Grotesque Guardians 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GrotesqueGuardians.id]: 25
			}
		})
	},
	{
		id: 228,
		name: 'Hespori Adept',
		type: 'kill_count',
		monster: 'Hespori',
		desc: 'Kill Hespori 5 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Hespori.id]: 5
			}
		})
	},
	{
		id: 229,
		name: "Hesporisn't",
		type: 'mechanical',
		monster: 'Hespori',
		desc: 'Finish off Hespori with a special attack.',
		rng: {
			chancePerKill: 2,
			hasChance: isCertainMonsterTrip(Monsters.Hespori.id)
		}
	},
	{
		id: 230,
		name: 'Weed Whacker',
		type: 'mechanical',
		monster: 'Hespori',
		desc: 'Kill all of Hesporis flowers within 5 seconds.',
		rng: {
			chancePerKill: 6,
			hasChance: isCertainMonsterTrip(Monsters.Hespori.id)
		}
	},
	{
		id: 231,
		name: 'Demonic Showdown',
		type: 'mechanical',
		monster: "K'ril Tsutsaroth",
		desc: "Finish off K'ril Tsutsaroth whilst all of his bodyguards are dead.",
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.KrilTsutsaroth.id)
		}
	},
	{
		id: 232,
		name: 'Demonbane Weaponry II',
		type: 'restriction',
		monster: "K'ril Tsutsaroth",
		desc: "Finish off K'ril Tsutsaroth with a demonbane weapon.",
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.KrilTsutsaroth.id)(data) && user.hasEquipped(demonBaneWeapons, false)
		}
	},
	{
		id: 233,
		name: "K'ril Tsutsaroth Adept",
		type: 'kill_count',
		monster: "K'ril Tsutsaroth",
		desc: "Kill K'ril Tsutsaroth 50 times.",
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KrilTsutsaroth.id]: 50
			}
		})
	},
	{
		id: 234,
		name: 'Yarr No More',
		type: 'mechanical',
		monster: "K'ril Tsutsaroth",
		desc: "Receive kill-credit for K'ril Tsutsaroth without him using his special attack.",
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.KrilTsutsaroth.id)
		}
	},
	{
		id: 235,
		name: 'Kalphite Queen Adept',
		type: 'kill_count',
		monster: 'Kalphite Queen',
		desc: 'Kill the Kalphite Queen 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KalphiteQueen.id]: 25
			}
		})
	},
	{
		id: 236,
		name: 'Chitin Penetrator',
		type: 'mechanical',
		monster: 'Kalphite Queen',
		desc: 'Kill the Kalphite Queen while her defence was last lowered by you.',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.KalphiteQueen.id)
		}
	},
	{
		id: 237,
		name: 'Who Is the King Now?',
		type: 'stamina',
		monster: 'King Black Dragon',
		desc: 'Kill The King Black Dragon 10 times in a private instance without leaving the instance.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KingBlackDragon.id]: 10
			}
		})
	},
	{
		id: 238,
		name: 'Unnecessary Optimization',
		type: 'mechanical',
		monster: 'Kraken',
		desc: 'Kill the Kraken after killing all four tentacles.',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.Kraken.id)
		}
	},
	{
		id: 239,
		name: "Krakan't Hurt Me",
		type: 'stamina',
		monster: 'Kraken',
		desc: 'Kill the Kraken 25 times in a private instance without leaving the room.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Kraken.id]: 25
			}
		})
	},
	{
		id: 240,
		name: 'Kraken Adept',
		type: 'kill_count',
		monster: 'Kraken',
		desc: 'Kill the Kraken 20 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Kraken.id]: 20
			}
		})
	},
	{
		id: 241,
		name: 'Airborne Showdown',
		type: 'mechanical',
		monster: "Kree'arra",
		desc: "Finish off Kree'arra whilst all of his bodyguards are dead.",
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Kreearra.id)
		}
	},
	{
		id: 242,
		name: "Kree'arra Adept",
		type: 'kill_count',
		monster: "Kree'arra",
		desc: "Kill Kree'arra 50 times.",
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Kreearra.id]: 50
			}
		})
	},
	{
		id: 243,
		name: 'Phantom Muspah Adept',
		type: 'kill_count',
		monster: 'Phantom Muspah',
		desc: 'Kill the Phantom Muspah.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.PhantomMuspah.id]: 1
			}
		})
	},
	{
		id: 244,
		name: 'Inspect Repellent',
		type: 'perfection',
		monster: 'Sarachnis',
		desc: 'Kill Sarachnis without her dealing damage to anyone.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Sarachnis.id)
		}
	},
	{
		id: 245,
		name: 'Ready to Pounce',
		type: 'mechanical',
		monster: 'Sarachnis',
		desc: 'Kill Sarachnis without her using her range attack twice in a row.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Sarachnis.id)
		}
	},
	{
		id: 246,
		name: 'Guardians No More',
		type: 'restriction',
		monster: 'Scorpia',
		desc: 'Kill Scorpia without killing her guardians.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Scorpia.id)
		}
	},
	{
		id: 247,
		name: "I Can't Reach That",
		type: 'perfection',
		monster: 'Scorpia',
		desc: 'Kill Scorpia without taking any damage from her.',
		rng: {
			chancePerKill: 30,
			hasChance: isCertainMonsterTrip(Monsters.Scorpia.id)
		}
	},
	{
		id: 248,
		name: 'Scorpia Adept',
		type: 'kill_count',
		monster: 'Scorpia',
		desc: 'Kill Scorpia 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Scorpia.id]: 10
			}
		})
	},
	{
		id: 249,
		name: 'Skotizo Adept',
		type: 'kill_count',
		monster: 'Skotizo',
		desc: 'Kill Skotizo 5 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Skotizo.id]: 5
			}
		})
	},
	{
		id: 250,
		name: 'Dress Like You Mean It',
		type: 'restriction',
		monster: 'Tempoross',
		desc: 'Subdue Tempoross while wearing any variation of the angler outfit.',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) => data.type === 'Tempoross' && user.hasEquipped(anglerOutfit, false)
		}
	},
	{
		id: 251,
		name: 'Why Cook?',
		type: 'mechanical',
		monster: 'Tempoross',
		desc: 'Subdue Tempoross, getting rewarded with 10 reward permits from a single Tempoross fight.',
		rng: {
			chancePerKill: 5,
			hasChance: data => data.type === 'Tempoross'
		}
	},
	{
		id: 252,
		name: 'Nightmare Adept',
		type: 'kill_count',
		monster: 'The Nightmare',
		desc: 'Kill The Nightmare once.',
		requirements: new Requirements().add({
			kcRequirement: {
				[NIGHTMARE_ID]: 1
			}
		})
	},
	{
		id: 253,
		name: 'Theatre of Blood: SM Adept',
		type: 'kill_count',
		monster: 'Theatre of Blood: Entry Mode',
		desc: 'Complete the Theatre of Blood: Entry Mode 1 time.',
		requirements: new Requirements().add({
			minigames: {
				tob: 1
			}
		})
	},
	{
		id: 254,
		name: 'Confident Raider',
		type: 'restriction',
		monster: 'Tombs of Amascut: Entry Mode',
		desc: 'Complete a Tombs of Amascut raid at level 100 or above.',
		requirements: new Requirements().add({
			minigames: {
				tombs_of_amascut: 1
			}
		})
	},
	{
		id: 255,
		name: 'Novice Tomb Explorer',
		type: 'kill_count',
		monster: 'Tombs of Amascut: Entry Mode',
		desc: 'Complete the Tombs of Amascut in Entry mode (or above) once.',
		requirements: new Requirements().add({
			minigames: {
				tombs_of_amascut: 1
			}
		})
	},
	{
		id: 256,
		name: "Movin' on up",
		type: 'restriction',
		monster: 'Tombs of Amascut',
		desc: 'Complete a Tombs of Amascut raid at level 50 or above.',
		rng: {
			chancePerKill: 1,
			hasChance: data => data.type === 'TombsOfAmascut' && (data as TOAOptions).raidLevel >= 50
		}
	},
	{
		id: 257,
		name: 'Novice Tomb Looter',
		type: 'kill_count',
		monster: 'Tombs of Amascut: Entry Mode',
		desc: 'Complete the Tombs of Amascut in Entry mode (or above) 25 times.',
		requirements: new Requirements().add({
			minigames: {
				tombs_of_amascut: 25
			}
		})
	},
	{
		id: 258,
		name: 'Venenatis Adept',
		type: 'kill_count',
		monster: 'Venenatis',
		desc: 'Kill Venenatis 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Venenatis.id]: 10
			}
		})
	},
	{
		id: 259,
		name: "Vet'ion Adept",
		type: 'kill_count',
		monster: "Vet'ion",
		desc: "Kill Vet'ion 10 times.",
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Vetion.id]: 10
			}
		})
	},
	{
		id: 260,
		name: 'Why Fletch?',
		type: 'stamina',
		monster: 'Wintertodt',
		desc: 'Subdue the Wintertodt after earning 3000 or more points.',
		rng: {
			chancePerKill: 30,
			hasChance: data => data.type === 'Wintertodt'
		}
	},
	{
		id: 261,
		name: 'Zulrah Adept',
		type: 'kill_count',
		monster: 'Zulrah',
		desc: 'Kill Zulrah 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Zulrah.id]: 25
			}
		})
	},
	{
		id: 262,
		name: 'Dagannoth Prime Adept',
		type: 'kill_count',
		monster: 'Dagannoth Prime',
		desc: 'Kill Dagannoth Prime 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DagannothPrime.id]: 25
			}
		})
	}
];
