import { Bank, EMonster, resolveItems } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { slayerCommand } from '@/mahoji/commands/slayer.js';
import { mockClient, mockUser } from '../util.js';

describe('Autoslay EHP', async () => {
	await mockClient();

	test('uses burst below 94 Magic', async () => {
		const user = await mockUser({
			bank: new Bank()
				.add('Blood rune', 1000)
				.add('Death rune', 1000)
				.add('Water rune', 10000)
				.add('Chaos rune', 1000)
				.add('Shark', 1000),
			mageLevel: 93,
			slayerLevel: 55,
			mageGear: resolveItems(['Ancient staff'])
		});
		await user.giveSlayerTask(EMonster.JELLY);

		const result = await user.runCmdAndTrip(slayerCommand, {
			autoslay: { mode: 'ehp' }
		});

		expect(result.commandResult).toContain('is now killing');
		expect(user.bank.amount('Blood rune')).toBe(1000);
		expect(user.bank.amount('Chaos rune')).toBeLessThan(1000);
	});

	test('uses barrage at 94 Magic', async () => {
		const user = await mockUser({
			bank: new Bank()
				.add('Blood rune', 1000)
				.add('Death rune', 1000)
				.add('Water rune', 10000)
				.add('Chaos rune', 1000)
				.add('Shark', 1000),
			mageLevel: 94,
			slayerLevel: 55,
			mageGear: resolveItems(['Ancient staff'])
		});
		await user.giveSlayerTask(EMonster.JELLY);

		const result = await user.runCmdAndTrip(slayerCommand, {
			autoslay: { mode: 'ehp' }
		});

		expect(result.commandResult).toContain('is now killing');
		expect(user.bank.amount('Blood rune')).toBeLessThan(1000);
		expect(user.bank.amount('Chaos rune')).toBe(1000);
	});
});
