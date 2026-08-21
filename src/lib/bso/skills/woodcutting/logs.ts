import { BitField } from '@/lib/constants.js';
import type { Log } from '@/lib/skilling/types.js';

export const bsoLogs: Log[] = [
	{
		level: 80,
		xp: 550,
		id: 323_424,
		name: 'Ivy',
		findNewTreeTime: 7,
		bankingTime: 16,
		slope: 0.03,
		intercept: -0.49,
		depletionChance: 100 * (1 / 8),
		wcGuild: false,
		qpRequired: 0,
		customReq: user => {
			if (!user.bitfield.includes(BitField.HasPlantedIvy)) {
				return 'You have no Ivy planted in your PoH.';
			}
		},
		hasNoLoot: true
	},
	{
		level: 105,
		xp: 600,
		id: 50_017,
		name: 'Elder Logs',
		findNewTreeTime: 8.5,
		bankingTime: 25,
		slope: 0.057_05,
		intercept: -0.71,
		depletionChance: 100 * (1 / 11),
		petChance: 42_321,
		qpRequired: 0,
		clueScrollChance: 42_321,
		clueNestsOnly: true
	}
];
