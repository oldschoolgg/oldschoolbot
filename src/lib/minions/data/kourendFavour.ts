import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { Skills } from './../../types/index';

export interface UserKourendFavour {
	Arceuus: number;
	Hosidius: number;
	Lovakengj: number;
	Piscarilius: number;
	Shayzien: number;
}

export const baseUserKourendFavour: UserKourendFavour = {
	Arceuus: 0,
	Hosidius: 0,
	Lovakengj: 0,
	Piscarilius: 0,
	Shayzien: 0
};

export interface KourendFavour {
	name: string;
	alias: string[];
	duration: number;
	pointsGain: number;
	skillReqs?: Skills;
	xp?: number;
	itemCost?: Bank;
	itemsRecieved?: Bank;
	qpRequired?: number;
}

export const KourendFavours: KourendFavour[] = [
	{
		name: 'Arceuus',
		alias: ['arce', 'arceu', 'arceuu', 'arceuus'],
		duration: 30 * Time.Minute,
		pointsGain: 50,
		itemCost: new Bank({
			'Stamina potion(4)': 2
		}),
		itemsRecieved: new Bank({
			'Book of arcane knowledge': 13
		})
	},
	{
		name: 'Hosidius',
		alias: ['hosi', 'hosid', 'hosidi', 'hosidius'],
		duration: 20 * Time.Minute,
		pointsGain: 50,
		itemCost: new Bank({
			Compost: 475,
			Saltpetre: 475
		})
	},
	{
		name: 'Lovakengj',
		alias: ['lova', 'lovak', 'lovake', 'lovakengj'],
		duration: 2 * Time.Minute,
		pointsGain: 1,
		skillReqs: {
			mining: 65,
			smithing: 73
		},
		itemsRecieved: new Bank({
			Sulphur: 9
		})
	},
	{
		name: 'Piscarilius',
		alias: ['pisc', 'pisca', 'piscar', 'piscarilius'],
		duration: 30 * Time.Minute,
		pointsGain: 25,
		skillReqs: {
			crafting: 30,
			hunter: 15
		},
		itemCost: new Bank({
			Plank: 45,
			'Steel bar': 25
		})
	},
	{
		name: 'Shayzien',
		alias: ['shay', 'shayz', 'shayzi', 'shayzien'],
		duration: 30 * Time.Minute,
		pointsGain: 50,
		skillReqs: {
			attack: 50,
			strength: 50,
			defence: 50,
			hitpoints: 50,
			prayer: 43
		},
		itemCost: new Bank({
			'Stamina potion(4)': 2,
			'Prayer potion(4)': 2
		}),
		itemsRecieved: new Bank({
			'Training manual': 3
		})
	}
];
