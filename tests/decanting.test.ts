import { Bank } from 'oldschooljs';

import decantPotionFromBank from '../src/lib/minions/functions/decantPotionFromBank';
import itemID from '../src/lib/util/itemID';

describe('decantPotionFromBank', () => {
	test('decantPotionFromBank', () => {
		const userBank = new Bank({
			'Magic potion (3)': 1000,
			'Defence potion (4)': 733,
			'Defence potion (3)': 233,
			'Defence potion (1)': 8,
			'Attack potion (2)': 1000,
			'Strength potion (1)': 1000
		});
		expect(decantPotionFromBank(userBank.bank, 'magic potion', 4)).toMatchObject({
			potionsToAdd: { [itemID('Magic potion (4)')]: 750 },
			potionsToRemove: { [itemID('Magic potion (3)')]: 1000 },
			sumOfPots: 1000,
			potionName: 'Magic potion',
			finalUserBank: new Bank({
				'Magic potion (4)': 750,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (1)': 1000
			}).bank
		});
		expect(decantPotionFromBank(userBank.bank, 'defence potion', 2)).toMatchObject({
			potionsToAdd: new Bank({
				'Defence potion (2)': 1819,
				'Defence potion (1)': 1
			}),
			potionsToRemove: new Bank({
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8
			}),
			sumOfPots: 974,
			potionName: 'Defence potion',
			finalUserBank: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (2)': 1819,
				'Defence potion (1)': 1,
				'Attack potion (2)': 1000,
				'Strength potion (1)': 1000
			}).bank
		});
		expect(() => decantPotionFromBank(userBank.bank, 'attack potion', 2)).toThrowError(
			"You don't have any **Attack potion** to decant!"
		);
		expect(decantPotionFromBank(userBank.bank, 'attack potion', 4)).toMatchObject({
			potionsToAdd: new Bank({
				'Attack potion (4)': 500
			}).bank,
			potionsToRemove: new Bank({
				'Attack potion (2)': 1000
			}).bank,
			sumOfPots: 1000,
			potionName: 'Attack potion',
			finalUserBank: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (4)': 500,
				'Strength potion (1)': 1000
			}).bank
		});
		expect(decantPotionFromBank(userBank.bank, 'strength potion', 3)).toMatchObject({
			potionsToAdd: new Bank({
				'Strength potion (3)': 333,
				'Strength potion (1)': 1
			}).bank,
			potionsToRemove: new Bank({
				'Strength potion (1)': 1000
			}).bank,
			sumOfPots: 1000,
			potionName: 'Strength potion',
			finalUserBank: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (3)': 333,
				'Strength potion (1)': 1
			}).bank
		});
	});
});
