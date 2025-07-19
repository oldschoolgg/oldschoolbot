import { Bank } from 'oldschooljs';

import { Quests } from 'oldschooljs';
import { diaries, userhasDiaryTier } from '../../diaries';
import { musicCapeRequirements } from '../../musicCape';
import { Requirements } from '../../structures/Requirements';
import type { Buyable } from './buyables';

const MAX_QP = Quests.reduce((acc, q) => acc + (q.qp ?? 0), 0);

export const capeBuyables: Buyable[] = [
	{
		name: 'Quest point cape',
		outputItems: new Bank({
			'Quest point cape': 1,
			'Quest point hood': 1
		}),
		aliases: ['quest cape'],
		gpCost: 99_000,
		customReq: async user => {
			if (user.QP !== MAX_QP) {
				return [false, `You need ${MAX_QP} QP to buy this cape, you have ${user.QP}.`];
			}
			return [true];
		}
	},
	{
		name: 'Quest point cape(t)',
		outputItems: new Bank({
			'Quest point cape (t)': 1
		}),
		aliases: ['quest cape(t)'],
		gpCost: 99_000,
		customReq: async user => {
			for (const diary of diaries.map(d => d.elite)) {
				const [has] = await userhasDiaryTier(user, diary);
				if (!has) {
					return [false, "You can't buy this because you haven't completed all the Elite diaries!"];
				}
			}
			if (user.QP !== MAX_QP) {
				return [false, `You need ${MAX_QP} QP to buy this cape, you have ${user.QP}.`];
			}
			return [true];
		}
	},
	{
		name: 'Achievement diary cape',
		outputItems: new Bank({
			'Achievement diary cape': 1,
			'Achievement diary hood': 1
		}),
		aliases: ['achievement cape'],
		gpCost: 99_000,
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
		name: 'Achievement diary cape(t)',
		outputItems: new Bank({
			'Achievement diary cape(t)': 1
		}),
		aliases: ['achievement cape(t)'],
		gpCost: 99_000,
		customReq: async user => {
			for (const diary of diaries.map(d => d.elite)) {
				const [has] = await userhasDiaryTier(user, diary);
				if (!has) {
					return [false, "You can't buy this because you haven't completed all the Elite diaries!"];
				}
			}
			const MAX_QP = Quests.reduce((acc, q) => acc + (q.qp ?? 0), 0);
			if (user.QP !== MAX_QP) {
				return [false, `You need ${MAX_QP} QP to buy this cape, you have ${user.QP}.`];
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
			const meetsReqs = await musicCapeRequirements.check(await Requirements.fetchRequiredData(user));
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
			if (!user.hasCompletedAllQuests) {
				return [false, "You can't buy this because you haven't completed all the quests!"];
			}
			if (!user.cl.has('Music cape')) {
				return [false, 'You need to own the regular Music cape first.'];
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
	}
];
