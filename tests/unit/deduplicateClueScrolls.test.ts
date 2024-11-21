import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { deduplicateClueScrolls } from '../../src/lib/clues/clueUtils';

describe('deduplicateClueScrolls', () => {
	test('If getting 500 easy clues and have 1 in bank, loot should be reduced to 99', () => {
		const currentBank = new Bank().add('Clue scroll(easy)').add('Egg', 5);
		currentBank.add('Clue scroll(easy)', 500);
		deduplicateClueScrolls(currentBank);
		expect(currentBank.amount('Clue scroll(easy)')).toBe(100);
		expect(currentBank.amount('Egg')).toBe(5);
	});

	test('Loot amount should be reduced', () => {
		const currentBank = new Bank().add('Clue scroll(easy)', 50).add('Egg', 5);
		currentBank.add('Clue scroll(easy)', 500);
		deduplicateClueScrolls(currentBank);
		expect(currentBank.amount('Clue scroll(easy)')).toBe(100);
		expect(currentBank.amount('Egg')).toBe(5);
	});

	test('No clues in loot if already has 100 and incoming clue is low tier', () => {
		const currentBank = new Bank().add('Clue scroll(easy)', 50).add('Clue scroll(hard)', 50).add('Egg', 5);
		currentBank.add('Clue scroll(easy)', 5);
		deduplicateClueScrolls(currentBank);
		expect(currentBank.amount('Clue scroll(easy)')).toBe(50);
		expect(currentBank.amount('Clue scroll(hard)')).toBe(50);
		expect(currentBank.amount('Egg')).toBe(5);
	});

	test('Should replace lower tiers', () => {
		const currentBank = new Bank().add('Clue scroll(easy)', 20).add('Clue scroll(beginner)', 20).add('Egg', 5);
		currentBank.add('Clue scroll(hard)', 30).add('Clue scroll(elite)', 30).add('Clue scroll(master)', 30);
		deduplicateClueScrolls(currentBank);
		expect(currentBank.amount('Clue scroll(hard)')).toBe(30);
		expect(currentBank.amount('Clue scroll(elite)')).toBe(30);
		expect(currentBank.amount('Clue scroll(master)')).toBe(30);
		expect(currentBank.amount('Clue scroll(easy)')).toBe(10);
		expect(currentBank.amount('Egg')).toBe(5);
	});

	test('Should add 1 clue', () => {
		const currentBank = new Bank().add('Clue scroll(easy)').add('Egg', 5);
		deduplicateClueScrolls(currentBank);
		expect(currentBank.amount('Clue scroll(easy)')).toBe(1);
		expect(currentBank.amount('Egg')).toBe(5);
	});
});
