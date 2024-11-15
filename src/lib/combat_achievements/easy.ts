import { Monsters } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { demonBaneWeapons } from '../constants';
import { warmGear } from '../data/filterables';
import { SkillsEnum } from '../skilling/types';
import { Requirements } from '../structures/Requirements';
import getOSItem from '../util/getOSItem';
import { isCertainMonsterTrip } from './caUtils';
import type { CombatAchievement } from './combatAchievements';

export const easyCombatAchievements: CombatAchievement[] = [
	{
		id: 1,
		name: 'Noxious Foe',
		type: 'kill_count',
		monster: 'Aberrant Spectre',
		desc: 'Kill an Aberrant Spectre.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.AberrantSpectre.id]: 1
			}
		})
	},
	{
		id: 2,
		name: 'Barrows Novice',
		type: 'kill_count',
		monster: 'Barrows',
		desc: 'Open the Barrows chest 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Barrows.id]: 10
			}
		})
	},
	{
		id: 3,
		name: 'Defence? What Defence?',
		type: 'restriction',
		monster: 'Barrows',
		desc: 'Kill any Barrows Brother using only magical damage.',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Barrows.id)(data) && user.getAttackStyles().includes(SkillsEnum.Magic)
		}
	},
	{
		id: 4,
		name: 'Big, Black and Fiery',
		type: 'kill_count',
		monster: 'Black Dragon',
		desc: 'Kill a Black Dragon.',
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
		id: 5,
		name: 'The Demonic Punching Bag',
		type: 'kill_count',
		monster: 'Bloodveld',
		desc: 'Kill a Bloodveld.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Bloodveld.id]: 1
			}
		})
	},
	{
		id: 6,
		name: 'Preparation Is Key',
		type: 'perfection',
		monster: 'Bryophyta',
		desc: 'Kill Bryophyta without suffering any poison damage.',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.Bryophyta.id)
		}
	},
	{
		id: 7,
		name: 'Fighting as Intended II',
		type: 'restriction',
		monster: 'Bryophyta',
		desc: 'Kill Bryophyta on a free to play world.',
		rng: {
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Bryophyta.id)(data) &&
				user.gear[user.attackClass()].allItems(false).every(i => getOSItem(i).members !== true),
			chancePerKill: 1
		}
	},
	{
		id: 8,
		name: 'Bryophyta Novice',
		type: 'kill_count',
		monster: 'Bryophyta',
		desc: 'Kill Bryophyta once.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Bryophyta.id]: 1
			}
		})
	},
	{
		id: 9,
		name: 'A Slow Death',
		type: 'restriction',
		monster: 'Bryophyta',
		desc: 'Kill Bryophyta with either poison or venom being the final source of damage.',
		rng: {
			chancePerKill: 5,
			hasChance: isCertainMonsterTrip(Monsters.Bryophyta.id)
		}
	},
	{
		id: 10,
		name: 'Protection from Moss',
		type: 'mechanical',
		monster: 'Bryophyta',
		desc: 'Kill Bryophyta with the Protect from Magic prayer active.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Bryophyta.id]: 1
			}
		})
	},
	{
		id: 11,
		name: 'Deranged Archaeologist Novice',
		type: 'kill_count',
		monster: 'Deranged Archaeologist',
		desc: 'Kill the Deranged Archaeologist 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.DerangedArchaeologist.id]: 10
			}
		})
	},
	{
		id: 12,
		name: 'The Walking Volcano',
		type: 'kill_count',
		monster: 'Fire Giant',
		desc: 'Kill a Fire Giant.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.FireGiant.id]: 1
			}
		})
	},
	{
		id: 13,
		name: 'Giant Mole Novice',
		type: 'kill_count',
		monster: 'Giant Mole',
		desc: 'Kill the Giant Mole 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GiantMole.id]: 10
			}
		})
	},
	{
		id: 14,
		name: 'A Greater Foe',
		type: 'kill_count',
		monster: 'Greater Demon',
		desc: 'Kill a Greater Demon.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.GreaterDemon.id]: 1
			}
		})
	},
	{
		id: 15,
		name: 'Not So Great After All',
		type: 'restriction',
		monster: 'Greater Demon',
		desc: 'Finish off a Greater Demon with a demonbane weapon.',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.GreaterDemon.id)(data) && user.hasEquipped(demonBaneWeapons)
		}
	},
	{
		id: 16,
		name: "A Demon's Best Friend",
		type: 'kill_count',
		monster: 'Hellhound',
		desc: 'Kill a Hellhound.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Hellhound.id]: 1
			}
		})
	},
	{
		id: 17,
		name: 'King Black Dragon Novice',
		type: 'kill_count',
		monster: 'King Black Dragon',
		desc: 'Kill the King Black Dragon 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.KingBlackDragon.id]: 10
			}
		})
	},
	{
		id: 18,
		name: 'A Scaley Encounter',
		type: 'kill_count',
		monster: 'Lizardman Shaman',
		desc: 'Kill a Lizardman Shaman.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.LizardmanShaman.id]: 1
			}
		})
	},
	{
		id: 19,
		name: 'Shayzien Protector',
		type: 'perfection',
		monster: 'Lizardman Shaman',
		desc: 'Kill a Lizardman Shaman in Molch which has not dealt damage to anyone. (excluding its Spawns)',
		rng: {
			chancePerKill: 15,
			hasChance: isCertainMonsterTrip(Monsters.LizardmanShaman.id)
		}
	},
	{
		id: 20,
		name: 'Into the Den of Giants',
		type: 'kill_count',
		monster: 'Other',
		desc: 'Kill a Hill Giant, Moss Giant and Fire Giant in the Giant Cave within the Shayzien region.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.HillGiant.id]: 1,
				[Monsters.MossGiant.id]: 1,
				[Monsters.FireGiant.id]: 1
			}
		})
	},
	{
		id: 21,
		name: 'Obor Novice',
		type: 'kill_count',
		monster: 'Obor',
		desc: 'Kill Obor once.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Obor.id]: 1
			}
		})
	},
	{
		id: 22,
		name: 'Fighting as Intended',
		type: 'restriction',
		monster: 'Obor',
		desc: 'Kill Obor on a free to play world.',
		rng: {
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Obor.id)(data) &&
				user.gear[user.attackClass()].allItems(false).every(i => getOSItem(i).members !== true),
			chancePerKill: 1
		}
	},
	{
		id: 23,
		name: 'Sleeping Giant',
		type: 'mechanical',
		monster: 'Obor',
		desc: 'Kill Obor whilst he is immobilized.',
		rng: {
			chancePerKill: 10,
			hasChance: isCertainMonsterTrip(Monsters.Obor.id)
		}
	},
	{
		id: 24,
		name: 'Sarachnis Novice',
		type: 'kill_count',
		monster: 'Sarachnis',
		desc: 'Kill Sarachnis 10 times.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Sarachnis.id]: 10
			}
		})
	},
	{
		id: 25,
		name: 'Master of Buckets',
		type: 'mechanical',
		monster: 'Tempoross',
		desc: 'Extinguish at least 5 fires during a single Tempoross fight.',
		rng: {
			chancePerKill: 5,
			hasChance: 'Tempoross'
		}
	},
	{
		id: 26,
		name: 'Calm Before the Storm',
		type: 'mechanical',
		monster: 'Tempoross',
		desc: 'Repair either a mast or a totem pole.',
		rng: {
			chancePerKill: 3,
			hasChance: 'Tempoross'
		}
	},
	{
		id: 27,
		name: 'Fire in the Hole!',
		type: 'mechanical',
		monster: 'Tempoross',
		desc: 'Attack Tempoross from both sides by loading both cannons on both ships.',
		rng: {
			chancePerKill: 3,
			hasChance: 'Tempoross'
		}
	},
	{
		id: 28,
		name: 'Tempoross Novice',
		type: 'kill_count',
		monster: 'Tempoross',
		desc: 'Subdue Tempoross 5 times.',
		requirements: new Requirements().add({
			minigames: {
				tempoross: 5
			}
		})
	},
	{
		id: 29,
		name: 'Handyman',
		type: 'mechanical',
		monster: 'Wintertodt',
		desc: 'Repair a brazier which has been destroyed by the Wintertodt.',
		requirements: new Requirements().add({
			minigames: {
				wintertodt: 1
			}
		})
	},
	{
		id: 30,
		name: 'Cosy',
		type: 'restriction',
		monster: 'Wintertodt',
		desc: 'Subdue the Wintertodt with four pieces of warm equipment equipped.',
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
		id: 31,
		name: 'Mummy!',
		type: 'mechanical',
		monster: 'Wintertodt',
		desc: 'Heal a pyromancer after they have fallen.',
		rng: {
			chancePerKill: 15,
			hasChance: 'Wintertodt'
		}
	},
	{
		id: 32,
		name: 'Wintertodt Novice',
		type: 'kill_count',
		monster: 'Wintertodt',
		desc: 'Subdue the Wintertodt 5 times.',
		requirements: new Requirements().add({
			minigames: {
				wintertodt: 5
			}
		})
	},
	{
		id: 33,
		name: 'A Slithery Encounter',
		type: 'kill_count',
		monster: 'Wyrm',
		desc: 'Kill a Wyrm.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Wyrm.id]: 1
			}
		})
	},
	{
		id: 34,
		name: 'Sit Rat',
		type: 'restriction',
		monster: 'Scurrius',
		desc: 'Finish off Scurrius with a ratbane weapon.',
		rng: {
			chancePerKill: 1,
			hasChance: (data, user) =>
				isCertainMonsterTrip(Monsters.Scurrius.id)(data) &&
				[resolveItems(['Bone mace', 'Bone staff', 'Bone shortbow'])].some(i => user.hasEquipped(i))
		}
	},
	{
		id: 35,
		name: 'Scurrius Novice',
		type: 'kill_count',
		monster: 'Scurrius',
		desc: 'Kill Scurrius once.',
		requirements: new Requirements().add({
			kcRequirement: {
				[Monsters.Scurrius.id]: 1
			}
		})
	}
];
