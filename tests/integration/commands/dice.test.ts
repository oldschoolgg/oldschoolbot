import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { gambleCommand } from '../../../src/mahoji/commands/gamble';
import { createTestUser, mockClient, mockMathRandom } from '../util';

vi.mock('../../../src/lib/util', async () => {
	const actual: any = await vi.importActual('../../../src/lib/util');
	return {
		...actual,
		cryptoRand: (min: number, max: number) => randInt(min, max)
	};
});

describe('Dice Command', async () => {
	const client = await mockClient();
	const user = await createTestUser();

	beforeEach(async () => {
		await user.reset();
		await client.reset();
		await user.addItemsToBank({ items: new Bank().add('Coins', 100_000_000) });
	});

	test('Lose dice', async () => {
		await user.gpMatch(100_000_000);
		const unmock = mockMathRandom(0.1);
		const result = await user.runCommand(gambleCommand, { dice: { amount: '100m' } });
		expect(result).toEqual('Unknown rolled **11** on the percentile dice, and you lost -100m GP.');
		await user.gpMatch(0);
		await user.statsMatch('dice_losses', 1);
		await user.statsMatch('gp_dice', BigInt(-100_000_000));
		await client.expectValueMatch('gp_dice', BigInt(-100_000_000));
		unmock();
	});

	test('Won dice', async () => {
		const unmock = mockMathRandom(0.9);
		await user.gpMatch(100_000_000);
		const result = await user.runCommand(gambleCommand, { dice: { amount: '100m' } });
		expect(result).toEqual('Unknown rolled **91** on the percentile dice, and you won 100m GP.');
		await user.gpMatch(200_000_000);
		await user.statsMatch('dice_wins', 1);
		await user.statsMatch('gp_dice', BigInt(100_000_000));
		await client.expectValueMatch('gp_dice', BigInt(100_000_000));
		unmock();
	});
});
