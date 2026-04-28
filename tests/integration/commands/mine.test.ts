import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { mineCommand } from '@/mahoji/commands/mine.js';
import { mockClient } from '../util.js';

describe('Mine Command', async () => {
	const client = await mockClient();

	test('requires 78 Mining for Infernal shale', async () => {
		const user = await client.mockUser({
			levels: {
				mining: 77,
				prayer: 43
			}
		});

		const res = await user.runCommand(mineCommand, { name: 'infernal shale', quantity: 100 });
		expect(res).toEqual(`${user.minionName} needs 78 Mining to mine Infernal shale.`);
	});

	test('requires 43 Prayer for Infernal shale', async () => {
		const user = await client.mockUser({
			levels: {
				mining: 78,
				prayer: 42
			}
		});

		const res = await user.runCommand(mineCommand, { name: 'infernal shale', quantity: 100 });
		expect(res).toEqual(`${user.minionName} needs 43 Prayer to mine Infernal shale.`);
	});

	test('mines Infernal shale directly into crushed infernal shale', async () => {
		const user = await client.mockUser({
			levels: {
				mining: 78,
				prayer: 43
			}
		});

		const res = await user.runCmdAndTrip(mineCommand, { name: 'infernal shale', quantity: 100 });
		expect(res.commandResult).toContain('is now mining Infernal shale');
		expect(res.commandResult).toContain('100x Crushed infernal shale');
		expect(res.data?.message.content).toContain('finished mining 100 Crushed infernal shale');
		await user.bankAmountMatch('Infernal shale', 0);
		await user.bankAmountMatch('Crushed infernal shale', 100);
	});

	test('Infernal shale full trips are within the expected crushed shale rate', async () => {
		const user = await client.mockUser({
			levels: {
				mining: 78,
				prayer: 43
			},
			bank: new Bank()
		});

		const res = await user.runCmdAndTrip(mineCommand, { name: 'infernal shale' });
		await user.sync();
		const crushedShale = user.bank.amount('Crushed infernal shale');
		const crushedShalePerHour = crushedShale / (res.activityResult!.duration / Time.Hour);
		expect(crushedShalePerHour).toBeGreaterThanOrEqual(1900);
		expect(crushedShalePerHour).toBeLessThanOrEqual(2210);
		expect(user.bank.amount('Infernal shale')).toEqual(0);
	});
});
