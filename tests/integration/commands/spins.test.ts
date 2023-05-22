import { Canvas } from '@napi-rs/canvas';
import { calcPercentOfNum, sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util';
import { beforeEach, describe, expect, test } from 'vitest';

import { ITEM_SINK_TAX_PERCENT } from '../../../src/lib/itemSinkTax';
import { mahojiClientSettingsFetch } from '../../../src/lib/util/clientSettings';
import { Winwheel } from '../../../src/lib/winwheel';
import { gambleCommand } from '../../../src/mahoji/commands/gamble';
import { spinsGambleAmount, winnerTracker } from '../../../src/mahoji/lib/abstracted_commands/spinsCommand';
import { randomMock } from '../setup';
import { createTestUser, mockClient } from '../util';

describe('Spins Command', async () => {
	const client = await mockClient();
	const user = await createTestUser();

	beforeEach(async () => {
		await user.reset();
		await client.reset();
		await user.addItemsToBank({ items: new Bank().add('Coins', 100_000_000) });
	});

	const originalSpin = Winwheel.prototype.staticSpin;

	// test(
	// 	'1x Spins',
	// 	async () => {
	// 		Winwheel.prototype.staticSpin = async function () {
	// 			return {
	// 				winner: '1x',
	// 				winnerIndex: 1,
	// 				newCanvas: new Canvas(1, 1)
	// 			};
	// 		};
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
	// 		Winwheel.prototype.staticSpin = async function () {
	// 			return {
	// 				winner: '2x',
	// 				winnerIndex: 1,
	// 				newCanvas: new Canvas(1, 1)
	// 			};
	// 		};
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
			Winwheel.prototype.staticSpin = originalSpin;

			const firstUser = await createTestUser();
			const secondUser = await createTestUser();
			const thirdUser = await createTestUser();

			const ONE_BILLION = 2_000_000_000;

			await Promise.all([
				firstUser.addItemsToBank({ items: new Bank().add('Coins', ONE_BILLION) }),
				secondUser.addItemsToBank({ items: new Bank().add('Coins', ONE_BILLION) }),
				thirdUser.addItemsToBank({ items: new Bank().add('Coins', ONE_BILLION) })
			]);
			let samples = 100;
			for (let i = 0; i < samples; i++) {
				await Promise.all([
					firstUser.runCommand(gambleCommand, { spin: {} }),
					secondUser.runCommand(gambleCommand, { spin: {} }),
					thirdUser.runCommand(gambleCommand, { spin: {} })
				]);
			}
			for (const [key, val] of Object.entries(winnerTracker)) {
				console.log(`${key}: ${toKMB(val as number)}`);
			}

			const newGPValues = sumArr([firstUser.GP, secondUser.GP, thirdUser.GP]);
			const expected = ONE_BILLION * 3;
			const difference = newGPValues - expected;
			expect(newGPValues).toBeLessThan(expected);
			console.log(
				`House profited ${toKMB(difference)} GP after ${samples} spins. (Users now have ${toKMB(
					newGPValues
				)}, instead of ${toKMB(expected)})`
			);

			const clientSettings = await mahojiClientSettingsFetch({ gp_spins: true });
			const expectedTax = calcPercentOfNum(ITEM_SINK_TAX_PERCENT, Math.abs(difference));
			console.log(
				`Difference[${difference}] gp_spins[${clientSettings.gp_spins}] expectedTax[${expectedTax}] gpOwnedByUsers[${newGPValues}] ITEM_SINK_TAX_PERCENT[${ITEM_SINK_TAX_PERCENT}]`
			);
			expect(clientSettings.gp_spins).toEqual(BigInt(difference) - BigInt(expectedTax));
			expect(clientSettings.item_sink_tax_bank_total).toEqual(BigInt(expectedTax));
		},
		{
			timeout: Time.Minute * 3
		}
	);
});
