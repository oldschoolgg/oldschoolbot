import { time } from '@discordjs/builders';
import { Time } from 'e';
import { Bank, resolveItems } from 'oldschooljs';

import type { Buyable } from './buyables.js';

const veteranCapeSrc = [
	{
		items: resolveItems(['Veteran cape (1 year)', 'Veteran hood (1 year)']),
		years: 1
	},
	{
		items: resolveItems(['Veteran cape (2 year)', 'Veteran hood (2 year)']),
		years: 2
	},
	{
		items: resolveItems(['Veteran cape (3 year)', 'Veteran hood (3 year)']),
		years: 3
	},
	{
		items: resolveItems(['Veteran cape (4 year)', 'Veteran hood (4 year)']),
		years: 4
	},
	{
		items: resolveItems(['Veteran cape (5 year)', 'Veteran hood (5 year)', 'Veteran staff (5 year)']),
		years: 5
	}
];

export const veteranCapeBuyables: Buyable[] = [];

for (const a of veteranCapeSrc) {
	const outputItems = new Bank();
	for (const item of a.items) outputItems.add(item, 1);
	outputItems.freeze();
	veteranCapeBuyables.push({
		name: `${a.years} Year Veteran Items`,
		outputItems,
		gpCost: a.years * 1_000_000,
		customReq: async user => {
			const accountAge = user.accountAgeInDays();
			if (accountAge === null || user.user.minion_bought_date === null) {
				return [false, 'Your minion has no recorded creation date.'];
			}
			const daysNeeded = a.years * 365;
			if (accountAge < daysNeeded) {
				const dateIsElligible = new Date(user.user.minion_bought_date.getTime() + daysNeeded * Time.Day);
				return [
					false,
					`You need to have an account age of ${
						a.years
					} years (${daysNeeded} days) to buy this item. Your minion was created at ${time(
						user.user.minion_bought_date
					)} (${accountAge.toFixed(2)} days ago), and so you will be elligible in ${time(
						dateIsElligible,
						'R'
					)}.`
				];
			}
			return [true];
		}
	});
}
