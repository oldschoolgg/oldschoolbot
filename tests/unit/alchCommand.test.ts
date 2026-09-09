import { Bank, Items } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { canAlchItem, timePerAlch } from '@/mahoji/lib/abstracted_commands/alchCommand.js';
import { mockMUser } from './userutil.js';

describe('alch command helpers', () => {
	test('allows Rite of vile transference to be alched', () => {
		const rite = Items.getOrThrow('Rite of vile transference');

		expect(rite.tradeable).toBeUndefined();
		expect(rite.lowalch).toBe(16_000);
		expect(rite.highalch).toBe(24_000);
		expect(canAlchItem(rite)).toBe(true);
	});

	test('does not allow ordinary untradeable items to be alched', () => {
		expect(canAlchItem(Items.getOrThrow("Jim's wet cloth"))).toBe(false);
	});

	test('includes Rite of vile transference in favourite alch selection', () => {
		const user = mockMUser({
			bank: new Bank().add('Rite of vile transference'),
			favorite_alchables: [Items.getOrThrow('Rite of vile transference').id],
			id: 'rite-alch-test'
		});

		expect(user.favAlchs(timePerAlch).map(item => item.name)).toEqual(['Rite of vile transference']);
	});
});
