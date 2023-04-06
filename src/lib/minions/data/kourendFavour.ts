import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { stringMatches } from '../../util';
import { Skills } from './../../types/index';

export interface UserKourendFavour {
	Arceuus: number;
	Hosidius: number;
	Lovakengj: number;
	Piscarilius: number;
	Shayzien: number;
}

export const baseUserKourendFavour: UserKourendFavour = Object.freeze({
	Arceuus: 0,
	Hosidius: 0,
	Lovakengj: 0,
	Piscarilius: 0,
	Shayzien: 0
});

interface KourendFavour {
	name: string;
	alias: string[];
	duration: number;
	pointsGain: number;
	skillReqs?: Skills;
	xp?: number;
	itemCost?: Bank;
	itemsReceived: Bank | null;
	qpRequired?: number;
}

export enum Favours {
	Arceuus = 'arceuus',
	Hosidius = 'hosidius',
	Lovakengj = 'lovakengj',
	Piscarilius = 'piscarilius',
	Shayzien = 'shayzien'
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
		itemsReceived: new Bank({
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
		}),
		itemsReceived: null
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
		itemsReceived: new Bank({
			'Volcanic sulphur': 9
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
		}),
		itemsReceived: null
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
		itemsReceived: new Bank({
			'Training manual': 3
		})
	}
];

export function findFavour(favourName: string): KourendFavour | undefined {
	return KourendFavours.find(
		item =>
			stringMatches(favourName, item.name) ||
			(item.alias && item.alias.some(alias => stringMatches(alias, favourName)))
	);
}

export function gotFavour(user: MUser, favour: Favours | undefined, neededPoints: number): [boolean, number] {
	const currentUserFavour = user.kourendFavour;
	let gotEnoughPoints = false;
	if (!favour || !currentUserFavour) return [gotEnoughPoints, neededPoints];
	for (const [key, value] of Object.entries(currentUserFavour) as [keyof UserKourendFavour, number][]) {
		if (key.toLowerCase() === favour.toString().toLowerCase()) {
			if (value >= neededPoints) gotEnoughPoints = true;
			break;
		}
	}
	return [gotEnoughPoints, neededPoints];
}
