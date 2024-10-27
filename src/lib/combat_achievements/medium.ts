import { Monsters } from 'oldschooljs';

import { demonBaneWeapons } from '../constants';
import { SkillsEnum } from '../skilling/types';
import { Requirements } from '../structures/Requirements';
import { isCertainMonsterTrip } from './caUtils';
import type { CombatAchievement } from './combatAchievements';

export const mediumCombatAchievements: CombatAchievement[] = [
	{
		id: 100,
		name: 'Pray for Success',
		type: 'perfection',
		monster: 'Barrows',
		desc: 'Kill all six Barrows Brothers and loot the Barrows chest without taking any damage from any of the brothers.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Barrows.id)
		}
	},
	{
		id: 101,
		name: 'Barrows Champion',
		type: 'kill_count',
		monster: 'Barrows',
		desc: 'Open the Barrows chest 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Barrows.id]: 25
			}
		})
	},
	{
		id: 102,
		name: "Can't Touch Me",
		type: 'mechanical',
		monster: 'Barrows',
		desc: 'Kill Dharok, Verac, Torag and Guthan without letting them attack you with melee.',
		rng: {
			chancePerKill: 50,
			hasChance: isCertainMonsterTrip(Monsters.Barrows.id)
		}
	},
	{
		id: 103,
		name: 'Brutal, Big, Black and Firey',
		type: 'kill_count',
		monster: 'Brutal Black Dragon',
		desc: 'Kill a Brutal Black Dragon.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.BrutalBlackDragon.id]: 1
			}
		})
	},
	{
		id: 104,
		name: 'Bryophyta Champion',
		type: 'kill_count',
		monster: 'Bryophyta',
		desc: 'Kill Bryophyta 5 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Bryophyta.id]: 5
			}
		})
	},
	{
		id: 105,
		name: 'Quick Cutter',
		type: 'mechanical',
		monster: 'Bryophyta',
		desc: "Kill all 3 of Bryophyta's growthlings within 3 seconds of the first one dying.",
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.Bryophyta.id)
		}
	},
	{
		id: 106,
		name: 'Chaos Fanatic Champion',
		type: 'kill_count',
		monster: 'Chaos Fanatic',
		desc: 'Kill the Chaos Fanatic 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.ChaosFanatic.id]: 10
			}
		})
	},
	{
		id: 107,
		name: 'Sorry, What Was That?',
		type: 'perfection',
		monster: 'Chaos Fanatic',
		desc: 'Kill the Chaos Fanatic without anyone being hit by his explosion attack.',
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.ChaosFanatic.id)
		}
	},
	{
		id: 108,
		name: "I'd Rather Not Learn",
		type: 'perfection',
		monster: 'Crazy Archaeologist',
		desc: "Kill the Crazy Archaeologist without anyone being hit by his 'Rain of Knowledge' attack.",
		rng: {
			chancePerKill: 20,
			hasChance: isCertainMonsterTrip(Monsters.CrazyArchaeologist.id)
		}
	},
	{
		id: 109,
		name: 'Crazy Archaeologist Champion',
		type: 'kill_count',
		monster: 'Crazy Archaeologist',
		desc: 'Kill the Crazy Archaeologist 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.CrazyArchaeologist.id]: 10
			}
		})
	},
	{
		id: 110,
		name: 'Mage of the Ruins',
		type: 'mechanical',
		monster: 'Crazy Archaeologist',
		desc: 'Kill the Crazy Archaeologist with only magical attacks.',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.CrazyArchaeologist.id)(data) &&
				user.getAttackStyles().includes(SkillsEnum.Magic)
		}
	},
	{
		id: 111,
		name: 'Dagannoth Prime Champion',
		type: 'kill_count',
		monster: 'Dagannoth Prime',
		desc: 'Kill Dagannoth Prime 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DagannothPrime.id]: 10
			}
		})
	},
	{
		id: 112,
		name: 'Dagannoth Rex Champion',
		type: 'kill_count',
		monster: 'Dagannoth Rex',
		desc: 'Kill Dagannoth Rex 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DagannothRex.id]: 10
			}
		})
	},
	{
		id: 113,
		name: 'A Frozen King',
		type: 'mechanical',
		monster: 'Dagannoth Rex',
		desc: 'Kill Dagannoth Rex whilst he is immobilized.',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.DagannothRex.id)
		}
	},
	{
		id: 114,
		name: 'Dagannoth Supreme Champion',
		type: 'kill_count',
		monster: 'Dagannoth Supreme',
		desc: 'Kill Dagannoth Supreme 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DagannothSupreme.id]: 10
			}
		})
	},
	{
		id: 115,
		name: "I'd Rather Be Illiterate",
		type: 'perfection',
		monster: 'Deranged Archaeologist',
		desc: "Kill the Deranged Archaeologist without anyone being hit by his 'Learn to Read' attack.",
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.DerangedArchaeologist.id)
		}
	},
	{
		id: 116,
		name: 'Mage of the Swamp',
		type: 'mechanical',
		monster: 'Deranged Archaeologist',
		desc: 'Kill the Deranged Archaeologist with only magical attacks.',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.DerangedArchaeologist.id)(data) &&
				user.getAttackStyles().includes(SkillsEnum.Magic)
		}
	},
	{
		id: 117,
		name: 'Deranged Archaeologist Champion',
		type: 'kill_count',
		monster: 'Deranged Archaeologist',
		desc: 'Kill the Deranged Archaeologist 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DerangedArchaeologist.id]: 25
			}
		})
	},
	{
		id: 118,
		name: 'A Smashing Time',
		type: 'kill_count',
		monster: 'Gargoyle',
		desc: 'Kill a Gargoyle.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Gargoyle.id]: 1
			}
		})
	},
	{
		id: 119,
		name: 'Giant Mole Champion',
		type: 'kill_count',
		monster: 'Giant Mole',
		desc: 'Kill the Giant mole 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GiantMole.id]: 1
			}
		})
	},
	{
		id: 120,
		name: 'Avoiding Those Little Arms',
		type: 'perfection',
		monster: 'Giant Mole',
		desc: 'Kill the Giant Mole without her damaging anyone.',
		rng: {
			chancePerKill: 35,
			hasChance: isCertainMonsterTrip(Monsters.GiantMole.id)
		}
	},
	{
		id: 121,
		name: 'King Black Dragon Champion',
		type: 'kill_count',
		monster: 'King Black Dragon',
		desc: 'Kill the King Black Dragon 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KingBlackDragon.id]: 25
			}
		})
	},
	{
		id: 122,
		name: 'Claw Clipper',
		type: 'mechanical',
		monster: 'King Black Dragon',
		desc: 'Kill the King Black Dragon with the Protect from Melee prayer activated.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KingBlackDragon.id]: 1
			}
		})
	},
	{
		id: 123,
		name: 'Antifire Protection',
		type: 'restriction',
		monster: 'King Black Dragon',
		desc: 'Kill the King Black Dragon with an antifire potion active and an antidragon shield equipped.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KingBlackDragon.id]: 1
			}
		})
	},
	{
		id: 124,
		name: 'Hide Penetration',
		type: 'restriction',
		monster: 'King Black Dragon',
		desc: 'Kill the King Black Dragon with a stab weapon.',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) => {
				const wep = user.gear.melee.equippedWeapon();
				return (
					isCertainMonsterTrip(Monsters.KingBlackDragon.id)(data) &&
					!user.getAttackStyles().includes(SkillsEnum.Magic) &&
					!user.getAttackStyles().includes(SkillsEnum.Ranged) &&
					wep !== null &&
					Boolean(wep.equipment) &&
					Boolean(wep.equipment?.attack_stab ?? -1 > 0)
				);
			}
		}
	},
	{
		id: 125,
		name: 'Master of Broad Weaponry',
		type: 'kill_count',
		monster: 'Kurask',
		desc: 'Kill a Kurask.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Kurask.id]: 1
			}
		})
	},
	// {
	// 	id: 126,
	// 	name: 'Sit Back and Relax',
	// 	type: 'mechanical',
	// 	monster: 'Other',
	// 	desc: 'Deal 100 damage to creatures using undead thralls.',
	// 	notPossible: true
	// },
	{
		id: 127,
		name: 'Back to the Wall',
		type: 'mechanical',
		monster: 'Obor',
		desc: 'Kill Obor without being pushed back more than one square by his knockback attack.',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.Obor.id)
		}
	},
	{
		id: 128,
		name: 'Squashing the Giant',
		type: 'perfection',
		monster: 'Obor',
		desc: 'Kill Obor without taking any damage off prayer.',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.Obor.id)
		}
	},
	{
		id: 129,
		name: 'Obor Champion',
		type: 'kill_count',
		monster: 'Obor',
		desc: 'Kill Obor 5 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Obor.id]: 5
			}
		})
	},
	{
		id: 130,
		name: 'Newspaper Enthusiast',
		type: 'restriction',
		monster: 'Sarachnis',
		desc: 'Kill Sarachnis with a crush weapon.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Sarachnis.id]: 1
			}
		})
	},
	{
		id: 131,
		name: 'Sarachnis Champion',
		type: 'kill_count',
		monster: 'Sarachnis',
		desc: 'Kill Sarachnis 25 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Sarachnis.id]: 25
			}
		})
	},
	{
		id: 132,
		name: 'A Frozen Foe from the Past',
		type: 'kill_count',
		monster: 'Skeletal Wyvern',
		desc: 'Kill a Skeletal Wyvern.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.SkeletalWyvern.id]: 1
			}
		})
	},
	{
		id: 133,
		name: 'Demonbane Weaponry',
		type: 'restriction',
		monster: 'Skotizo',
		desc: 'Kill Skotizo with a demonbane weapon equipped.',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Skotizo.id)(data) && user.hasEquipped(demonBaneWeapons)
		}
	},
	{
		id: 134,
		name: 'Skotizo Champion',
		type: 'kill_count',
		monster: 'Skotizo',
		desc: 'Kill Skotizo once.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Skotizo.id]: 1
			}
		})
	},
	{
		id: 135,
		name: 'Demonic Weakening',
		type: 'mechanical',
		monster: 'Skotizo',
		desc: 'Kill Skotizo with no altars active.',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.Skotizo.id)
		}
	},
	{
		id: 136,
		name: 'Tempoross Champion',
		type: 'kill_count',
		monster: 'Tempoross',
		desc: 'Subdue Tempoross 10 times.',
		requirements: new Requirements().add({
			minigames: {
				tempoross: 10
			}
		})
	},
	{
		id: 137,
		name: 'The Lone Angler',
		type: 'perfection',
		monster: 'Tempoross',
		desc: 'Subdue Tempoross alone without getting hit by any fires, torrents or waves.',
		rng: {
			chancePerKill: 25,
			hasChance: data => data.type === 'Tempoross'
		}
	},
	{
		id: 138,
		name: 'Leaving No One Behind',
		type: 'restriction',
		monster: 'Wintertodt',
		desc: 'Subdue the Wintertodt without any of the Pyromancers falling.',
		rng: {
			chancePerKill: 50,
			hasChance: 'Wintertodt'
		}
	},
	{
		id: 139,
		name: 'Can We Fix It?',
		type: 'perfection',
		monster: 'Wintertodt',
		desc: 'Subdue the Wintertodt without allowing all 4 braziers to be broken at the same time.',
		rng: {
			chancePerKill: 6,
			hasChance: data => data.type === 'Wintertodt'
		}
	},
	{
		id: 140,
		name: 'Wintertodt Champion',
		type: 'kill_count',
		monster: 'Wintertodt',
		desc: 'Subdue the Wintertodt 10 times.',
		requirements: new Requirements().add({
			minigames: {
				wintertodt: 10
			}
		})
	},
	{
		id: 141,
		name: 'Scurrius Champion',
		type: 'kill_count',
		monster: 'Scurrius',
		desc: 'Kill Scurrius 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Scurrius.id]: 10
			}
		})
	},
	{
		id: 142,
		name: 'Perfect Scurrius',
		type: 'perfection',
		monster: 'Scurrius',
		desc: 'Kill Scurrius in a private instance without taking damage from the following attacks: Tail Swipe and Falling Bricks. Pray correctly against the following attacks: Flying Fur and Bolts of Electricity.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Scurrius.id)
		}
	},
	{
		id: 143,
		name: 'Efficient Pest Control',
		type: 'mechanical',
		monster: 'Scurrius',
		desc: "Kill 6 Giant Rats within Scurrius' lair in 3 seconds.",
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Scurrius.id)
		}
	}
];
