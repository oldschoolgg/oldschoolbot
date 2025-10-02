import { Bank, EMonster, type ItemBank } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { mockClient } from '../util.js';
import { BSOTestUtil } from './bsoTestUtil.js';

describe('Clue Uprader', async () => {
	const client = await mockClient();

	it(
		'should use clue upgrader in pickpocketing',
		async () => {
			const user = await client.mockUser({
				bank: new Bank().add('Clue upgrader', 1),
				maxed: true
			});
			await BSOTestUtil.giveMaterials(user);
			const previousMats = user.materialsOwned().clone();

			const result = await BSOTestUtil.pickpocket(user, EMonster.FEMALE_HAM_MEMBER);
			expect(result.commandResult).toContain('is now going to');
			const newMats = user.materialsOwned().clone();

			expect(user.bank.amount('Clue scroll (easy)')).toBeGreaterThan(0);

			// Some of the easy clues shouldve been upgraded to medium
			const mediumCluesReceived = user.bank.amount('Clue scroll (medium)');
			expect(mediumCluesReceived).toBeGreaterThan(0);

			expect(newMats.amount('metallic')).toBeLessThan(previousMats.amount('metallic'));
			expect(newMats.amount('treasured')).toBeLessThan(previousMats.amount('treasured'));
			const clueUpgraderStats = new Bank((await user.fetchStats()).clue_upgrader_bank as ItemBank);
			expect(clueUpgraderStats.length).toBe(1);

			await client.sync();
			const clientClueUpgraderLoot = new Bank(client.data.clue_upgrader_loot as ItemBank);
			expect(clientClueUpgraderLoot.equals(clueUpgraderStats)).toBeTruthy();

			// Stats tracked should match their bank
			for (const tier of ClueTiers) {
				if (!clueUpgraderStats.has(tier.scrollID)) continue;
				expect(user.bank.amount(tier.scrollID)).toEqual(user.cl.amount(tier.scrollID));
				expect(user.bank.amount(tier.scrollID)).toEqual(clueUpgraderStats.amount(tier.scrollID));
				expect(user.bank.amount(tier.scrollID)).toEqual(clientClueUpgraderLoot.amount(tier.scrollID));
				expect(user.bank.amount(tier.scrollID)).toEqual(clientClueUpgraderLoot.amount(tier.scrollID));
			}

			expect(mediumCluesReceived).toEqual(clueUpgraderStats.amount('Clue scroll (medium)'));
			expect(mediumCluesReceived).toEqual(user.bank.amount('Clue scroll (medium)'));
		},
		{
			retry: 1
		}
	);
});
