import type { Item } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { calculatePayouts, generateUniqueRolls } from '@/mahoji/lib/abstracted_commands/highRollerCommand.js';

const dummyItem = { id: 1, name: 'Dummy item' } as Item;

describe('calculatePayouts', () => {
	it('distributes pot to a single winner when using winner takes all', () => {
		expect(calculatePayouts({ pot: 100_000_000, participantCount: 5, mode: 'winner_takes_all' })).toStrictEqual([
			100_000_000
		]);
	});

	it('splits the pot among the top 3 with the 60/30/10 ratio', () => {
		expect(calculatePayouts({ pot: 100, participantCount: 3, mode: 'top_three' })).toStrictEqual([60, 30, 10]);
	});

	it('normalises payouts when fewer than three players join', () => {
		expect(calculatePayouts({ pot: 90, participantCount: 2, mode: 'top_three' })).toStrictEqual([60, 30]);
	});

	it('awards any rounding remainder to the winner', () => {
		expect(calculatePayouts({ pot: 101, participantCount: 3, mode: 'top_three' })).toStrictEqual([61, 30, 10]);
	});
});

describe('generateUniqueRolls', () => {
	it('rerolls duplicate values until every entry is unique', () => {
		const responses = [
			{ item: dummyItem, value: 5 },
			{ item: dummyItem, value: 5 },
			{ item: dummyItem, value: 10 },
			{ item: dummyItem, value: 11 },
			{ item: dummyItem, value: 12 }
		];
		let idx = 0;
		const results = generateUniqueRolls({
			count: 3,
			rollFn: () => {
				if (idx >= responses.length) {
					throw new Error('test roll queue exhausted');
				}
				return responses[idx++]!;
			}
		});
		expect(results).toHaveLength(3);
		const values = results.map(result => result.value);
		expect(new Set(values).size).toBe(3);
		expect(values.sort((a, b) => a - b)).toStrictEqual([10, 11, 12]);
	});
});
