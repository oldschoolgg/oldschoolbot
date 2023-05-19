import { calcPercentOfNum, randInt, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ITEM_SINK_TAX_PERCENT } from '../../../src/lib/itemSinkTax';
import { gambleCommand } from '../../../src/mahoji/commands/gamble';
import { createTestUser, mockClient } from '../util';

describe('Slots Command', async () => {
	const client = await mockClient();
	const user = await createTestUser();

	expect(randInt(1, 100)).not.equals(randInt(1, 100));

	beforeEach(async () => {
		await user.reset();
		await client.reset();
		await user.addItemsToBank({ items: new Bank().add('Coins', 100_000_000) });
	});

	test('Slots', async () => {
		await user.gpMatch(100_000_000);
		const result: any = await user.runCommand(gambleCommand, { slots: { amount: '100m' } });

		if (result.content === 'You won 200m!') {
			await user.gpMatch(0);
			await user.statsMatch('gp_slots', BigInt(100_000_000));
			await client.expectValueMatch('gp_slots', BigInt(reduceNumByPercent(100_000_000, ITEM_SINK_TAX_PERCENT)));
			await client.expectValueMatch('item_sink_slots_gp', 1);
		} else if (result.content === "Unlucky, you didn't win anything, and lost your bet!") {
			await user.gpMatch(0);
			await user.statsMatch('gp_slots', BigInt(-100_000_000));
			await client.expectValueMatch('gp_slots', BigInt(-reduceNumByPercent(100_000_000, ITEM_SINK_TAX_PERCENT)));
			await client.expectValueMatch(
				'item_sink_slots_gp',
				BigInt(calcPercentOfNum(ITEM_SINK_TAX_PERCENT, 100_000_000))
			);
		} else {
			throw new Error(`Unexpected result: ${result.content}`);
		}
	});
});
