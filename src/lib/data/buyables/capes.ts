import { Bank } from 'oldschooljs';

import { MAX_QP } from '../../../mahoji/lib/abstracted_commands/questCommand';
import { diaries, userhasDiaryTier } from '../../diaries';
import { musicCapeRequirements } from '../../musicCape';
import { Buyable } from './buyables';

export const capeBuyables: Buyable[] = [
	{
		name: 'Achievement diary cape',
		outputItems: new Bank({
			'Achievement diary cape': 1,
			'Achievement diary cape(t)': 1,
			'Achievement diary hood': 1
		}),
		gpCost: 1_000_000,
		customReq: async user => {
			for (const diary of diaries.map(d => d.elite)) {
				const [has] = await userhasDiaryTier(user, diary);
				if (!has) {
					return [false, "You can't buy this because you haven't completed all the Elite diaries!"];
				}
			}
			return [true];
		}
	},
	{
		name: 'Max cape',
		outputItems: new Bank({
			'Max cape': 1,
			'Max hood': 1
		}),
		gpCost: 2_277_000,
		customReq: async user => {
			if (user.totalLevel < 2277) {
				return [false, "You can't buy this because you aren't maxed!"];
			}
			return [true];
		}
	},
	{
		name: 'Music cape',
		outputItems: new Bank({
			'Music cape': 1,
			'Music hood': 1
		}),
		gpCost: 99_000,
		customReq: async user => {
			const meetsReqs = await musicCapeRequirements.check(user);
			if (!meetsReqs.hasAll) {
				return [false, `You don't meet the requirements to buy this: \n${meetsReqs.rendered}`];
			}
			return [true];
		}
	},
	{
		name: 'Music cape(t)',
		outputItems: new Bank({
			'Music cape(t)': 1
		}),
		gpCost: 99_000,
		customReq: async user => {
			const meetsReqs = await musicCapeRequirements.check(user);
			if (!meetsReqs.hasAll) {
				return [false, `You don't meet the requirements to buy this: \n${meetsReqs.rendered}`];
			}
			if (user.QP < MAX_QP) {
				return [false, "You can't buy this because you haven't completed all the quests!"];
			}
			for (const diary of diaries.map(d => d.elite)) {
				const [has] = await userhasDiaryTier(user, diary);
				if (!has) {
					return [
						false,
						"You can't buy this because you haven't completed all the Elite Achievement diaries!"
					];
				}
			}
			return [true];
		}
	}
];
