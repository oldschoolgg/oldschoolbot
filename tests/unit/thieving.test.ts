import { describe, expect, test } from 'vitest';

import { stealables } from '@/lib/skilling/skills/thieving/stealables.js';
import { calcLootXPPickpocketing } from '@/tasks/minions/pickpocketActivity.js';

describe('Thieving', () => {
	test('All stealables should have a table', () => {
		for (const entity of stealables) {
			if (!entity.table) {
				throw new Error(`No table for ${entity.name}.`);
			}
		}
	});

	test('Dodgy necklace prevents pickpocket stun and damage while consuming charges', () => {
		const man = stealables.find(entity => entity.name === 'Man')!;
		const [, damageTaken, , , dodgyChargesUsed] = calcLootXPPickpocketing(
			1,
			man,
			10,
			false,
			false,
			{ percentChance: percent => percent === 25 },
			10
		);

		expect(damageTaken).toBe(0);
		expect(dodgyChargesUsed).toBe(10);
	});

	test('Dodgy necklace only prevents failures while it has charges', () => {
		const man = stealables.find(entity => entity.name === 'Man')!;
		const [, damageTaken, , , dodgyChargesUsed] = calcLootXPPickpocketing(
			1,
			man,
			10,
			false,
			false,
			{ percentChance: percent => percent === 25 },
			3
		);

		expect(dodgyChargesUsed).toBe(3);
		expect(damageTaken).toBe(2);
	});

	test('blackjacking pickpocketables are marked to ignore Dodgy necklace', () => {
		expect(stealables.find(entity => entity.name === 'Menaphite Thug')?.blackjacking).toBe(true);
		expect(stealables.find(entity => entity.name === 'Bearded Pollnivnian Bandit')?.blackjacking).toBe(true);
	});
});
