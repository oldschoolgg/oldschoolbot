import { compCapeCreatableBank } from '@/lib/bso/bsoConstants.js';
import { circusBuyables } from '@/lib/bso/buyables/circusBuyables.js';
import { fistOfGuthixBuyables } from '@/lib/bso/buyables/fistOfGuthixBuyables.js';
import { keyCrateBuyables } from '@/lib/bso/buyables/keyCrateBuyables.js';
import { monkeyRumbleBuyables } from '@/lib/bso/buyables/monkeyRumbleBuyables.js';
import { oceanicShroudsBuyables } from '@/lib/bso/buyables/oceanic.js';
import { stealingCreationBuyables } from '@/lib/bso/buyables/stealingCreationBuyables.js';
import { veteranCapeBuyables } from '@/lib/bso/buyables/veteranCapeBuyables.js';
import { expertCapesSource } from '@/lib/bso/expertCapes.js';

import { isAtleastThisOld, Time } from '@oldschoolgg/toolkit';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { Bank } from 'oldschooljs';

import type { Buyable } from '@/lib/data/buyables/buyables.js';
import { capeBuyables } from '@/lib/data/buyables/capes.js';

const bsoCastleWarsBuyables: Buyable[] = (
	[
		['Castle wars cape (beginner)', 100],
		['Castle wars cape (intermediate)', 500],
		['Castle wars cape (advanced)', 1000],
		['Castle wars cape (expert)', 2500],
		['Castle wars cape (legend)', 5000]
	] as const
).map(i => ({
	name: i[0],
	outputItems: new Bank({
		[i[0]]: 1
	}),
	itemCost: new Bank({
		'Castle wars ticket': i[1]
	})
}));

export const bsoBuyables: Buyable[] = [
	{
		name: 'Fishbowl helmet',
		outputItems: new Bank({
			'Fishbowl helmet': 1
		}),
		qpRequired: 85,
		gpCost: 500_000
	},
	{
		name: 'Diving apparatus',
		outputItems: new Bank({
			'Diving apparatus': 1
		}),
		qpRequired: 85,
		gpCost: 500_000
	},
	{
		name: "Beginner's tackle box",
		outputItems: new Bank({
			"Beginner's tackle box": 1
		}),
		gpCost: 500_000,
		skillsNeeded: {
			fishing: 50
		}
	},
	{
		name: 'Contest rod',
		outputItems: new Bank({
			'Contest rod': 1
		}),
		gpCost: 500_000,
		skillsNeeded: {
			fishing: 50
		}
	},
	{
		name: 'Rainbow cape',
		outputItems: new Bank({
			'Rainbow cape': 1
		}),
		gpCost: 1_000_000
	},

	{
		name: 'Golden cape shard',
		outputItems: new Bank().add('Golden cape shard'),
		gpCost: 5_000_000_000,
		customReq: async user => {
			if (user.cl.has('Golden cape shard')) {
				return [false, 'You cannot buy a Golden cape shard if you already bought/received one.'];
			}
			const createdAt = DiscordSnowflake.timestampFrom(user.id);
			if (!isAtleastThisOld(createdAt, Number(Time.Year))) {
				return [false, 'Your account must be atleast 1 year old to buy this.'];
			}

			const daysOld = user.accountAgeInDays();
			if (!daysOld) return [true];

			if (daysOld < 31) {
				return [false, 'Your minion must be atleast 1 month old to buy this.'];
			}

			return [true];
		}
	},
	{
		name: 'Completionist cape',
		outputItems: new Bank().add('Completionist cape').add('Completionist hood'),
		itemCost: compCapeCreatableBank,
		customReq: async user => {
			const { totalPercentUntrimmed } = await user.calculateCompCapeProgress();
			if (totalPercentUntrimmed < 100) {
				return [
					false,
					`You don't meet the requirements to buy an untrimmed Completionist cape. Refer to ${globalClient.mentionCommand(
						'completion',
						'check'
					)} to see what you are missing.`
				];
			}

			return [true];
		},
		globalAnnouncementOnFirstBuy: true
	},
	{
		name: 'Completionist cape (t)',
		outputItems: new Bank().add('Completionist cape (t)').add('Completionist hood (t)'),
		itemCost: new Bank().add('Completionist cape').add('Completionist hood'),
		customReq: async user => {
			const { totalPercentTrimmed } = await user.calculateCompCapeProgress();
			if (totalPercentTrimmed < 100) {
				return [
					false,
					`You don't meet the requirements to buy a trimmed Completionist cape. Refer to ${globalClient.mentionCommand(
						'completion',
						'check'
					)} to see what you are missing.`
				];
			}

			return [true];
		},
		globalAnnouncementOnFirstBuy: true
	},
	{
		name: 'Wooden spoon',
		gpCost: 2000,
		outputItems: new Bank().add('Wooden spoon')
	},
	{
		name: 'Pumpkin seed',
		gpCost: 500,
		outputItems: new Bank().add('Pumpkin seed'),
		ironmanPrice: 500,
		maxQuantity: 500
	},
	{
		name: 'Festive present',
		gpCost: 100_000_000,
		itemCost: new Bank().add('Festive wrapping paper', 10)
	},
	{
		name: 'Master quest cape',
		outputItems: new Bank({
			'Master quest cape': 1
		}),
		gpCost: 1_000_000_000,
		qpRequired: 5000
	},
	...monkeyRumbleBuyables,
	...oceanicShroudsBuyables,
	...bsoCastleWarsBuyables,
	...fistOfGuthixBuyables,
	...stealingCreationBuyables,
	...circusBuyables,
	...keyCrateBuyables,
	...veteranCapeBuyables
];

for (const { cape, requiredItems, skills } of expertCapesSource) {
	const itemCost = new Bank();
	for (const i of requiredItems) itemCost.add(i);
	const capeBank = new Bank().add(cape.id).freeze();

	capeBuyables.push({
		name: cape.name,
		itemCost,
		outputItems: capeBank,
		customReq: async user => {
			for (const skill of skills) {
				if (user.skillsAsXP[skill] < 500_000_000) {
					return [false, `You don't have 500m ${skill}.`];
				}
			}
			return [true];
		}
	});
}
