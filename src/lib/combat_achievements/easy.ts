import { Monsters } from 'oldschooljs';

import { warmGear } from '../data/filterables';
import { Requirements } from '../structures/Requirements';
import getOSItem from '../util/getOSItem';
import { isCertainMonsterTrip } from './caUtils';
import { type CombatAchievement } from './combatAchievements';

export const easyCombatAchievements: CombatAchievement[] = [
	{
		name: 'Noxious Foe',
		type: 'kill_count',
		desc: 'Kill an Aberrant Spectre.',
		id: 1,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.AberrantSpectre.id]: 1
			}
		})
	},
	{
		name: 'Barrows Novice',
		type: 'kill_count',
		desc: 'Open the Barrows chest 10 times.',
		id: 2,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Barrows.id]: 10
			}
		})
	},
	{
		name: 'Defence? What Defence?',
		type: 'restriction',
		desc: 'Kill any Barrows Brother using only magical damage.',
		id: 3,
		rng: {
			chancePerKill: 4,
			hasChance: isCertainMonsterTrip(Monsters.Barrows.id)
		}
	},
	{
		name: 'Big, Black and Fiery',
		type: 'kill_count',
		desc: 'Kill a Black Dragon.',
		id: 4,
		requirements: new Requirements().add({
			OR: [
				{
					kcRequirement: {
						[Monsters.KingBlackDragon.id]: 1
					}
				},
				{
					kcRequirement: {
						[Monsters.BlackDragon.id]: 1
					}
				}
			]
		})
	},
	{
		name: 'The Demonic Punching Bag',
		type: 'kill_count',
		desc: 'Kill a Bloodveld.',
		id: 5,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Bloodveld.id]: 1
			}
		})
	},
	{
		name: 'Preparation Is Key',
		type: 'perfection',
		desc: 'Kill Bryophyta without suffering any poison damage.',
		id: 6,
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.Bryophyta.id)
		}
	},
	{
		name: 'Fighting as Intended II',
		type: 'restriction',
		desc: 'Kill Bryophyta on a free to play world.',
		id: 7,
		rng: {
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Bryophyta.id)(data) &&
				user.gear[user.attackClass()].allItems(false).every(i => getOSItem(i).members !== true),
			chancePerKill: 1
		}
	},
	{
		name: 'Bryophyta Novice',
		type: 'kill_count',
		desc: 'Kill Bryophyta once.',
		id: 8,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Bryophyta.id]: 1
			}
		})
	},
	{
		name: 'A Slow Death',
		type: 'restriction',
		desc: 'Kill Bryophyta with either poison or venom being the final source of damage.',
		id: 9,
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.Bryophyta.id)
		}
	},
	{
		name: 'Protection from Moss',
		type: 'mechanical',
		desc: 'Kill Bryophyta with the Protect from Magic prayer active.',
		id: 10,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Bryophyta.id]: 1
			}
		})
	},
	{
		name: 'Deranged Archaeologist Novice',
		type: 'kill_count',
		desc: 'Kill the Deranged Archaeologist 10 times.',
		id: 11,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DerangedArchaeologist.id]: 10
			}
		})
	},
	{
		name: 'The Walking Volcano',
		type: 'kill_count',
		desc: 'Kill a Fire Giant.',
		id: 12,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.FireGiant.id]: 1
			}
		})
	},
	{
		name: 'Giant Mole Novice',
		type: 'kill_count',
		desc: 'Kill the Giant Mole 10 times.',
		id: 13,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GiantMole.id]: 10
			}
		})
	},
	{
		name: 'A Greater Foe',
		type: 'kill_count',
		desc: 'Kill a Greater Demon.',
		id: 14,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GreaterDemon.id]: 1
			}
		})
	},
	{
		name: 'Not So Great After All',
		type: 'restriction',
		desc: 'Finish off a Greater Demon with a demonbane weapon.',
		id: 15,
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.GreaterDemon.id)(data) &&
				user.hasEquipped(['Silverlight', 'Darklight', 'Arclight'], false)
		}
	},
	{
		name: "A Demon's Best Friend",
		type: 'kill_count',
		desc: 'Kill a Hellhound.',
		id: 16,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Hellhound.id]: 1
			}
		})
	},
	{
		name: 'King Black Dragon Novice',
		type: 'kill_count',
		desc: 'Kill the King Black Dragon 10 times.',
		id: 17,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KingBlackDragon.id]: 10
			}
		})
	},
	{
		name: 'A Scaley Encounter',
		type: 'kill_count',
		desc: 'Kill a Lizardman Shaman.',
		id: 18,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.LizardmanShaman.id]: 1
			}
		})
	},
	{
		name: 'Shayzien Protector',
		type: 'perfection',
		desc: 'Kill a Lizardman Shaman in Molch which has not dealt damage to anyone. (excluding its Spawns)',
		id: 19,
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.LizardmanShaman.id)
		}
	},
	{
		name: 'Into the Den of Giants',
		type: 'kill_count',
		desc: 'Kill a Hill Giant, Moss Giant and Fire Giant in the Giant Cave within the Shayzien region.',
		id: 20,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.HillGiant.id]: 1,
				[Monsters.MossGiant.id]: 1,
				[Monsters.FireGiant.id]: 1
			}
		})
	},
	{
		name: 'Obor Novice',
		type: 'kill_count',
		desc: 'Kill Obor once.',
		id: 21,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Obor.id]: 1
			}
		})
	},
	{
		name: 'Fighting as Intended',
		type: 'restriction',
		desc: 'Kill Obor on a free to play world.',
		id: 22,
		rng: {
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Obor.id)(data) &&
				user.gear[user.attackClass()].allItems(false).every(i => getOSItem(i).members !== true),
			chancePerKill: 1
		}
	},
	{
		name: 'Sleeping Giant',
		type: 'mechanical',
		desc: 'Kill Obor whilst he is immobilized.',
		id: 23,
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Obor.id)
		}
	},
	{
		name: 'Sarachnis Novice',
		type: 'kill_count',
		desc: 'Kill Sarachnis 10 times.',
		id: 24,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Sarachnis.id]: 10
			}
		})
	},
	{
		name: 'Master of Buckets',
		type: 'mechanical',
		desc: 'Extinguish at least 5 fires during a single Tempoross fight.',
		id: 25,
		rng: {
			chancePerKill: 22,
			hasChance: 'Tempoross'
		}
	},
	{
		name: 'Calm Before the Storm',
		type: 'mechanical',
		desc: 'Repair either a mast or a totem pole.',
		id: 26,
		rng: {
			chancePerKill: 3,
			hasChance: 'Tempoross'
		}
	},
	{
		name: 'Fire in the Hole!',
		type: 'mechanical',
		desc: 'Attack Tempoross from both sides by loading both cannons on both ships.',
		id: 27,
		rng: {
			chancePerKill: 3,
			hasChance: 'Tempoross'
		}
	},
	{
		name: 'Tempoross Novice',
		type: 'kill_count',
		desc: 'Subdue Tempoross 5 times.',
		id: 28,
		requirements: new Requirements().add({
			minigames: {
				tempoross: 5
			}
		})
	},
	{
		name: 'Handyman',
		type: 'mechanical',
		desc: 'Repair a brazier which has been destroyed by the Wintertodt.',
		id: 29,
		requirements: new Requirements().add({
			minigames: {
				wintertodt: 1
			}
		})
	},
	{
		name: 'Cosy',
		type: 'restriction',
		desc: 'Subdue the Wintertodt with four pieces of warm equipment equipped.',
		id: 30,
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				data.type === 'Wintertodt' &&
				user
					.allEquippedGearBank()
					.items()
					.filter(item => warmGear.includes(item[0].id)).length >= 4
		}
	},
	{
		name: 'Mummy!',
		type: 'mechanical',
		desc: 'Heal a pyromancer after they have fallen.',
		id: 31,
		rng: {
			chancePerKill: 15,
			hasChance: 'Wintertodt'
		}
	},
	{
		name: 'Wintertodt Novice',
		type: 'kill_count',
		desc: 'Subdue the Wintertodt 5 times.',
		id: 32,
		requirements: new Requirements().add({
			minigames: {
				wintertodt: 5
			}
		})
	},
	{
		name: 'A Slithery Encounter',
		type: 'kill_count',
		desc: 'Kill a Wyrm.',
		id: 33,
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Wyrm.id]: 1
			}
		})
	}
];
