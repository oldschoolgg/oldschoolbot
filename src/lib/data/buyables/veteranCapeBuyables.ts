import { time } from '@discordjs/builders';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import getOSItem from '../../util/getOSItem';
import type { Buyable } from './buyables';

const veteranCapeSrc = [
	{
		cape: getOSItem('Veteran cape (1 year)'),
		hood: getOSItem('Veteran hood (1 year)'),
		years: 1
	},
	{
		cape: getOSItem('Veteran cape (2 year)'),
		hood: getOSItem('Veteran hood (2 year)'),
		years: 2
	},
	{
		cape: getOSItem('Veteran cape (3 year)'),
		hood: getOSItem('Veteran hood (3 year)'),
		years: 3
	},
	{
		cape: getOSItem('Veteran cape (4 year)'),
		hood: getOSItem('Veteran hood (4 year)'),
		years: 4
	}
];

export const veteranCapeBuyables: Buyable[] = [];

for (const a of veteranCapeSrc) {
	veteranCapeBuyables.push({
		name: a.cape.name,
		outputItems: new Bank().add(a.cape.id, 1).add(a.hood.id, 1),
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
