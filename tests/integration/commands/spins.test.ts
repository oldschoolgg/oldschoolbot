import { calcPercentOfNum, randInt, Time } from 'e';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';
import { beforeEach, describe, expect, test } from 'vitest';

import { ONE_TRILLION } from '../../../src/lib/constants';
import { ITEM_SINK_TAX_PERCENT } from '../../../src/lib/itemSinkTax';
import { gambleCommand } from '../../../src/mahoji/commands/gamble';
import { spinsGambleAmount } from '../../../src/mahoji/lib/abstracted_commands/spinsCommand';
import { randomMock, restoreMathRandom } from '../setup';
import { createTestUser, mockClient } from '../util';

describe('Spins Command', async () => {
	const client = await mockClient();
	const user = await createTestUser();

	beforeEach(async () => {
		await user.reset();
		await client.reset();
		await user.addItemsToBank({ items: new Bank().add('Coins', 100_000_000) });
	});

	// test(
	// 	'1x Spins',
	// 	async () => {
	// 		randomMock(0.5);
	// 		await user.gpMatch(100_000_000);
	// 		const result: any = await user.runCommand(gambleCommand, { spin: {} });
	// 		expect(result.content).toEqual('You spun the wheel and won **1x**!');
	// 		await user.gpMatch(100_000_000);
	// 		await user.statsMatch('gp_spins', BigInt(0));
	// 		// We removed the tax from the initial gp bet, but then the user won and we paid back, now the 'bank' is in the negative by the amount taxed.
	// 		await client.expectValueMatch(
	// 			'gp_spins',
	// 			BigInt(calcPercentOfNum(ITEM_SINK_TAX_PERCENT, spinsGambleAmount))
	// 		);
	// 		await client.expectValueMatch(
	// 			'item_sink_spins_gp',
	// 			BigInt(calcPercentOfNum(ITEM_SINK_TAX_PERCENT, spinsGambleAmount))
	// 		);
	// 	},
	// 	{
	// 		repeats: 1
	// 	}
	// );

	// test(
	// 	'2x Spins',
	// 	async () => {
	// 		randomMock(0.8);
	// 		await user.gpMatch(100_000_000);
	// 		const result: any = await user.runCommand(gambleCommand, { spin: {} });
	// 		expect(result.content).toEqual('You spun the wheel and won **2x**!');
	// 		await user.gpMatch(100_000_000 + spinsGambleAmount);
	// 		await user.statsMatch('gp_spins', BigInt(spinsGambleAmount));
	// 		await client.expectValueMatch(
	// 			'gp_spins',
	// 			BigInt(spinsGambleAmount + calcPercentOfNum(ITEM_SINK_TAX_PERCENT, spinsGambleAmount))
	// 		);
	// 		await client.expectValueMatch(
	// 			'item_sink_spins_gp',
	// 			BigInt(calcPercentOfNum(ITEM_SINK_TAX_PERCENT, spinsGambleAmount))
	// 		);
	// 	},
	// 	{
	// 		repeats: 1
	// 	}
	// );

	test(
		'House should profit',
		async () => {
			restoreMathRandom();
			expect(randInt(1, 1000)).not.equals(randInt(1, 1000));
			await user.addItemsToBank({ items: new Bank().add('Coins', ONE_TRILLION) });
			let samples = 500;
			for (let i = 0; i < samples; i++) {
				await user.runCommand(gambleCommand, { spin: {} });
			}
			const difference = user.GP - ONE_TRILLION;
			expect(difference).toBeLessThan(0);
			console.log(
				`Spins user lost ${toKMB(difference)} GP after ${samples} spins, average loss of ${toKMB(
					difference / samples
				)} per.`
			);
			// await client.expectValueMatch(
			// 	'gp_spins',
			// 	BigInt(spinsGambleAmount + calcPercentOfNum(ITEM_SINK_TAX_PERCENT, spinsGambleAmount))
			// );
		},
		{
			timeout: Time.Minute * 2
		}
	);
});
