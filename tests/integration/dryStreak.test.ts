import { Items, resolveItems } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { dryStreakEntities } from '../../src/mahoji/commands/tools.js';

describe('Drystreak', async () => {
	test('Nightmare includes all normal collection log items', () => {
		const nightmare = dryStreakEntities.find(entity => entity.name === 'Nightmare');

		expect(nightmare?.items).toEqual(expect.arrayContaining(resolveItems(['Little nightmare', 'Jar of dreams'])));
	});

	test("Phosani's Nightmare includes its exclusive collection log items", () => {
		const phosanisNightmare = dryStreakEntities.find(entity => entity.name === "Phosani's Nightmare");

		expect(phosanisNightmare?.items).toEqual(
			expect.arrayContaining(resolveItems(['Slepey tablet', 'Parasitic egg']))
		);
	});

	test('Data points', async () => {
		const promises = [];
		for (const a of dryStreakEntities) {
			try {
				promises.push(a.run({ item: Items.getOrThrow(a.items[0]), ironmanOnly: false }));
				promises.push(a.run({ item: Items.getOrThrow(a.items[0]), ironmanOnly: true }));
			} catch (err) {
				throw new Error(`Error running ${a.name}: ${err}`);
			}
		}
		await Promise.all(promises);
	});
});
