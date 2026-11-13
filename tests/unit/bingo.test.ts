import { Bank, itemID } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { defaultBingoChallenges } from '@/lib/bingo/bingoChallenges.js';
import { evaluateBingoChallenge, isBingoEventInSeason } from '@/lib/bingo/bingoProgress.js';
import { bingoBoardSchema } from '@/lib/bingo/bingoTypes.js';

const empty = { quantity: 0, items: {} };
const event = (bank: Bank) => ({ items: bank.toJSON(), activity_type: 'Woodcutting', activity_completion: false });

describe('Seasonal bingo matching', () => {
	const challenges = defaultBingoChallenges();
	const challenge = (id: string) => challenges.find(c => c.id === id)!;
	it('validates 28 distinct configurable challenges', () => {
		expect(challenges).toHaveLength(28);
		expect(bingoBoardSchema.safeParse(challenges.slice(1)).success).toBe(false);
		expect(bingoBoardSchema.safeParse(challenges.map(() => challenges[0])).success).toBe(false);
	});
	it('matches any eligible sigil and caps credit at one point', () => {
		for (const item of ['Arcane sigil', 'Spectral sigil', 'Elysian sigil']) {
			const next = evaluateBingoChallenge(challenge('sigil'), empty, event(new Bank().add(item, 2)));
			expect(next.quantity).toBe(1);
			expect(next.credit).toBe(1);
			expect(evaluateBingoChallenge(challenge('sigil'), next, event(new Bank().add(item))).credit).toBe(0);
		}
	});
	it('ignores unrelated loot and accumulates quantities across trips', () => {
		const c = challenge('redwoods');
		expect(evaluateBingoChallenge(c, empty, event(new Bank().add('Logs', 10_000))).quantity).toBe(0);
		const first = evaluateBingoChallenge(c, empty, event(new Bank().add('Redwood logs', 1000)));
		expect(first.quantity).toBe(1000);
		expect(first.credit).toBe(0.2);
		const second = evaluateBingoChallenge(c, first, event(new Bank().add('Redwood logs', 5000)));
		expect(second.quantity).toBe(5000);
		expect(first.credit + second.credit).toBe(1);
	});
	it('collects complete sets from newly earned components', () => {
		const c = challenge('voidwaker');
		let state = evaluateBingoChallenge(c, empty, event(new Bank().add('Voidwaker blade')));
		expect(state.quantity).toBeCloseTo(1 / 3);
		state = evaluateBingoChallenge(c, state, event(new Bank().add('Voidwaker hilt')));
		state = evaluateBingoChallenge(c, state, event(new Bank().add('Voidwaker gem')));
		expect(state.quantity).toBe(1);
	});
	it('retains components of alternative sets even when the leading set does not change', () => {
		const c = challenge('barrows');
		const first = evaluateBingoChallenge(c, empty, event(new Bank().add("Ahrim's hood")));
		const alternative = evaluateBingoChallenge(c, first, event(new Bank().add("Dharok's helm")));
		expect(alternative.credit).toBe(0);
		expect(alternative.items[itemID("Dharok's helm")]).toBe(1);
	});
	it('requires an explicit successful activity signal', () => {
		const c = {
			...challenges[0],
			type: 'activity_completion' as const,
			activityID: 'Woodcutting' as const,
			requiredQuantity: 2
		};
		expect(evaluateBingoChallenge(c, empty, event(new Bank())).quantity).toBe(0);
		expect(evaluateBingoChallenge(c, empty, { ...event(new Bank()), activity_completion: true }).quantity).toBe(1);
		expect(
			evaluateBingoChallenge(c, empty, {
				...event(new Bank()),
				activity_type: 'Fishing',
				activity_completion: true
			}).quantity
		).toBe(0);
	});
	it('uses inclusive starts, exclusive ends and excludes trips started before the season', () => {
		const start_date = new Date('2026-12-01T00:00:00Z');
		const end_date = new Date('2027-01-01T00:00:00Z');
		const season = { start_date, end_date };
		expect(isBingoEventInSeason(season, { started_at: start_date, occurred_at: start_date })).toBe(true);
		expect(isBingoEventInSeason(season, { started_at: start_date, occurred_at: end_date })).toBe(false);
		expect(
			isBingoEventInSeason(season, { started_at: new Date(start_date.getTime() - 1), occurred_at: start_date })
		).toBe(false);
		expect(
			isBingoEventInSeason(season, { started_at: start_date, occurred_at: new Date(start_date.getTime() - 1) })
		).toBe(false);
	});
});
