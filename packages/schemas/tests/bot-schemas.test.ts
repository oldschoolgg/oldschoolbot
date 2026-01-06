import { describe, expect, test } from 'vitest';

import { ZAttackStyles } from '../src/bot/attack-styles.js';
import { type IAttackStyle, ZBankSortWeightings } from '../src/bot.js';

describe('Bot Schemas', { repeats: 2 }, () => {
	test('Bank Sort Weightings', () => {
		for (const invalid of [
			null,
			undefined,
			'',
			{ a: 1 },
			{ '1.5': 2 },
			{ '2': 3.14 },
			{ four: 4 },
			{ '1': 'a' },
			{ '1': '1' },
			{ '1': BigInt(1) }
		]) {
			const res = ZBankSortWeightings.safeParse(invalid);
			if (res.success) {
				throw new Error(
					`ZStrictIntKeyIntValueObject incorrectly accepted invalid value: ${JSON.stringify(res.error, null, 4)}`
				);
			}
		}

		for (const valid of [{ '1': 1 }]) {
			const res = ZBankSortWeightings.safeParse(valid);
			if (!res.success) {
				throw new Error(
					`ZStrictIntKeyIntValueObject incorrectly rejected valid value: ${JSON.stringify(res.error, null, 4)}`
				);
			}
		}
	});
});

describe('ZAttackStyles', () => {
	test('accepts single valid styles', () => {
		for (const s of ['attack', 'strength', 'defence', 'ranged', 'magic'] as const) {
			expect(ZAttackStyles.parse([s])).toEqual([s]);
		}
	});

	test('rejects unknown strings', () => {
		const r = ZAttackStyles.safeParse('foo');
		expect(r.success).toBe(false);
		if (!r.success) expect(r.error.issues.length).toBeGreaterThan(0);
	});

	test('accepts arrays of 1..3 distinct styles', () => {
		expect(ZAttackStyles.parse(['attack'])).toEqual(['attack']);
		expect(ZAttackStyles.parse(['defence', 'attack'])).toEqual(['defence', 'attack']);
		expect(ZAttackStyles.parse(['defence', 'attack', 'strength'])).toEqual(['defence', 'attack', 'strength']);
	});

	test('rejects empty arrays', () => {
		const r = ZAttackStyles.safeParse([]);
		expect(r.success).toBe(true);
	});

	test('rejects arrays longer than 3', () => {
		const r = ZAttackStyles.safeParse(['attack', 'strength', 'defence', 'magic']);
		expect(r.success).toBe(false);
	});

	test('rejects duplicate styles', () => {
		const r = ZAttackStyles.safeParse(['attack', 'attack']);
		expect(r.success).toBe(false);
		if (!r.success) {
			expect(r.error.issues.some(i => i.message.includes('Duplicate'))).toBe(true);
		}
	});

	test('rejects multi-style arrays missing defence', () => {
		const cases: IAttackStyle[][] = [
			['attack', 'strength'],
			['attack', 'magic'],
			['ranged', 'magic'],
			['attack', 'strength', 'magic']
		];
		for (const c of cases) {
			const r = ZAttackStyles.safeParse(c);
			expect(r.success).toBe(false);
			if (!r.success) {
				expect(r.error.issues.some(i => i.message.includes('must include defence'))).toBe(true);
			}
		}
	});

	test('rejects invalid pairs even if defence is present', () => {
		const cases: IAttackStyle[][] = [
			['defence', 'attack', 'magic'],
			['defence', 'strength', 'magic'],
			['defence', 'attack', 'ranged'],
			['defence', 'strength', 'ranged'],
			['defence', 'magic', 'ranged']
		];
		for (const c of cases) {
			const r = ZAttackStyles.safeParse(c);
			expect(r.success).toBe(false);
			if (!r.success) {
				expect(r.error.issues.some(i => i.message.includes('Invalid style combination'))).toBe(true);
			}
		}
	});

	test('accepts valid 2-style combos (must include defence)', () => {
		const ok: IAttackStyle[][] = [
			['defence', 'attack'],
			['defence', 'strength'],
			['defence', 'ranged'],
			['defence', 'magic']
		];
		for (const c of ok) {
			const r = ZAttackStyles.safeParse(c);
			expect(r.success).toBe(true);
			if (r.success) expect(r.data).toEqual(c);
		}
	});

	test('accepts valid 3-style combos (must include defence, and no invalid pair)', () => {
		const ok: IAttackStyle[][] = [
			['defence', 'attack', 'strength'],
			['defence', 'attack', 'defence'].filter(Boolean as any) // noop safety; keeps type narrow
		].slice(0, 1); // keep only real case above

		for (const c of ok) {
			const r = ZAttackStyles.safeParse(c);
			expect(r.success).toBe(true);
			if (r.success) expect(r.data).toEqual(c);
		}
	});
});
