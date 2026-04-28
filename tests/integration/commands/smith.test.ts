import { Bank, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { smithCommand } from '@/mahoji/commands/smith.js';
import { createTestUser } from '../util.js';

describe('Smith Command', async () => {
	test('requires 83 Smithing for Yama smithables', async () => {
		const user = await createTestUser(undefined, {
			skills_smithing: convertLVLtoXP(82)
		});

		const res = await user.runCommand(smithCommand, { name: 'Infernal nugget', quantity: 1 });
		expect(res).toEqual(`${user.minionName} needs 83 Smithing to smith Infernal nuggets.`);
	});

	test('smiths Infernal nuggets from crushed shale and Oathplate shards', async () => {
		const user = await createTestUser(new Bank().add('Crushed infernal shale', 56).add('Oathplate shards', 10), {
			skills_smithing: convertLVLtoXP(83)
		});
		const beforeXP = user.skillsAsXP.smithing;

		const res = await user.runCmdAndTrip(smithCommand, { name: 'Infernal nugget', quantity: 2 });
		expect(res.commandResult).toContain('is now smithing 2x Infernal nugget');
		expect(res.activityResult?.duration).toEqual(6500);
		await user.bankAmountMatch('Infernal nugget', 2);
		await user.bankAmountMatch('Crushed infernal shale', 0);
		await user.bankAmountMatch('Oathplate shards', 0);
		expect(user.skillsAsXP.smithing - beforeXP).toEqual(23);
	});

	test('smiths Infernal chunks and plates', async () => {
		const user = await createTestUser(new Bank().add('Infernal nugget', 10).add('Infernal chunk', 1), {
			skills_smithing: convertLVLtoXP(83)
		});
		const beforeXP = user.skillsAsXP.smithing;

		const chunkRes = await user.runCmdAndTrip(smithCommand, { name: 'Infernal chunk', quantity: 1 });
		expect(chunkRes.activityResult?.duration).toEqual(3250);
		await user.bankAmountMatch('Infernal chunk', 2);
		await user.bankAmountMatch('Infernal nugget', 0);

		const plateRes = await user.runCmdAndTrip(smithCommand, { name: 'Infernal plate', quantity: 1 });
		expect(plateRes.activityResult?.duration).toEqual(242_650);
		await user.bankAmountMatch('Infernal plate', 1);
		await user.bankAmountMatch('Infernal chunk', 1);
		expect(user.skillsAsXP.smithing - beforeXP).toEqual(2000);
	});

	test('smiths Oathplate armour from Infernal plates', async () => {
		for (const armour of ['Oathplate helm', 'Oathplate chest', 'Oathplate legs']) {
			const user = await createTestUser(new Bank().add('Infernal plate', 9), {
				skills_smithing: convertLVLtoXP(83)
			});
			const beforeXP = user.skillsAsXP.smithing;

			const res = await user.runCmdAndTrip(smithCommand, { name: armour, quantity: 1 });
			expect(res.activityResult?.duration).toEqual(3250);
			await user.bankAmountMatch(armour, 1);
			await user.bankAmountMatch('Infernal plate', 0);
			expect(user.skillsAsXP.smithing - beforeXP).toEqual(2000);
		}
	});
});
