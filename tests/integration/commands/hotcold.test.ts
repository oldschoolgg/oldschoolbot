import { calcPercentOfNum, randInt, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ITEM_SINK_TAX_PERCENT } from '../../../src/lib/itemSinkTax';
import { gambleCommand } from '../../../src/mahoji/commands/gamble';
import { randomMock } from '../setup';
import { createTestUser, mockClient } from '../util';

vi.mock('../../../src/lib/util', async () => {
	const actual: any = await vi.importActual('../../../src/lib/util');
	return {
		...actual,
		cryptoRand: (min: number, max: number) => randInt(min, max)
	};
});

describe('Hot Cold Command', async () => {
	const client = await mockClient();
	const user = await createTestUser();

	beforeEach(async () => {
		await user.reset();
		await client.reset();
		await user.addItemsToBank({ items: new Bank().add('Coins', 100_000_000) });
	});

	test('Lose hot cold', async () => {
		randomMock();
		await user.gpMatch(100_000_000);
		const result: any = await user.runCommand(gambleCommand, { hot_cold: { amount: '100m', choice: 'cold' } });
		expect(result.embeds[0].data.description).toEqual('You lost 100m.');
		await user.gpMatch(0);
		await user.statsMatch('gp_hotcold', BigInt(-100_000_000));
		await client.expectValueMatch('gp_hotcold', BigInt(-reduceNumByPercent(100_000_000, ITEM_SINK_TAX_PERCENT)));
		await client.expectValueMatch(
			'item_sink_hotcold_gp',
			BigInt(calcPercentOfNum(ITEM_SINK_TAX_PERCENT, 100_000_000))
		);
	});

	test('Won hot cold', async () => {
		randomMock(0.5);
		await user.gpMatch(100_000_000);
		const result: any = await user.runCommand(gambleCommand, { hot_cold: { amount: '100m', choice: 'cold' } });
		expect(result.embeds[0].data.description).toMatchObject('You **won** 200m!');
		await user.gpMatch(200_000_000);
		await user.statsMatch('gp_hotcold', BigInt(100_000_000));
		await client.expectValueMatch('gp_hotcold', BigInt(100_000_000));
		await client.expectValueMatch('item_sink_hotcold_gp', BigInt(0));
	});
});
