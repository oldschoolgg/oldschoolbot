import { mentionCommand } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { calculateCompCapeProgress } from '../../bso/calculateCompCapeProgress';
import { allMasterCapesBank } from '../../skilling/skillcapes';
import { isAtleastThisOld } from '../../util';
import { Buyable } from './buyables';
import { circusBuyables } from './circusBuyables';
import { fistOfGuthixBuyables } from './fistOfGuthixBuyables';
import { keyCrateBuyables } from './keyCrateBuyables';
import { stealingCreationBuyables } from './stealingCreationBuyables';
import { veteranCapeBuyables } from './veteranCapeBuyables';

const items = [
	['Castle wars cape (beginner)', 100],
	['Castle wars cape (intermediate)', 500],
	['Castle wars cape (advanced)', 1000],
	['Castle wars cape (expert)', 2500],
	['Castle wars cape (legend)', 5000]
] as const;

export const bsoBuyables: Buyable[] = [
	...items.map(i => ({
		name: i[0],
		outputItems: new Bank({
			[i[0]]: 1
		}),
		itemCost: new Bank({
			'Castle wars ticket': i[1]
		})
	})),
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
	...fistOfGuthixBuyables,
	...stealingCreationBuyables,
	...circusBuyables,
	...keyCrateBuyables,
	...veteranCapeBuyables,
	{
		name: 'Golden cape shard',
		outputItems: new Bank().add('Golden cape shard'),
		gpCost: 5_000_000_000,
		customReq: async user => {
			if (user.cl.has('Golden cape shard')) {
				return [false, 'You cannot buy a Golden cape shard if you already bought/received one.'];
			}
			const djsUser = await globalClient.fetchUser(user.id);
			if (!isAtleastThisOld(djsUser.createdAt, Number(Time.Year))) {
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
		itemCost: allMasterCapesBank,
		customReq: async user => {
			let { totalPercentUntrimmed } = await calculateCompCapeProgress(user);
			if (totalPercentUntrimmed < 100) {
				return [
					false,
					`You don't meet the requirements to buy an untrimmed Completionist cape. Refer to ${mentionCommand(
						globalClient,
						'completion',
						'check'
					)} to see what you are missing.`
				];
			}

			return [true];
		},
		globalAnnouncementOnFirstBuy: true
	}
];
