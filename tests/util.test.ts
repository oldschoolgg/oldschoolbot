import { resolveNameBank } from 'oldschooljs/dist/util';

import decantPotionFromBank from '../src/lib/minions/functions/decantPotionFromBank';
import { stripEmojis } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';
import itemID from '../src/lib/util/itemID';

describe('util', () => {
	test('stripEmojis', () => {
		expect(stripEmojis('b👏r👏u👏h')).toEqual('bruh');
	});

	test('getOSItem', () => {
		expect(getOSItem('Twisted bow').id).toEqual(20997);
		expect(getOSItem(20997).id).toEqual(20997);
		expect(getOSItem('20997').id).toEqual(20997);
		expect(getOSItem('3rd age platebody').id).toEqual(10348);

		expect(() => getOSItem('Non-existant item')).toThrowError('That item doesnt exist.');
	});

	test('decantPotionFromBank', () => {
		const userBank = resolveNameBank({
			'Magic potion (3)': 1000,
			'Defence potion (4)': 733,
			'Defence potion (3)': 233,
			'Defence potion (1)': 8,
			'Attack potion (2)': 1000,
			'Strength potion (1)': 1000
		});
		expect(decantPotionFromBank(userBank, 'magic potion', 4)).toMatchObject({
			potionsToAdd: { [itemID('Magic potion (4)')]: 750 },
			potionsToRemove: { [itemID('Magic potion (3)')]: 1000 },
			sumOfPots: 1000,
			potionName: 'Magic potion',
			finalUserBank: resolveNameBank({
				'Magic potion (4)': 750,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (1)': 1000
			})
		});
		expect(decantPotionFromBank(userBank, 'defence potion', 2)).toMatchObject({
			potionsToAdd: resolveNameBank({
				'Defence potion (2)': 1819,
				'Defence potion (1)': 1
			}),
			potionsToRemove: resolveNameBank({
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8
			}),
			sumOfPots: 974,
			potionName: 'Defence potion',
			finalUserBank: resolveNameBank({
				'Magic potion (3)': 1000,
				'Defence potion (2)': 1819,
				'Defence potion (1)': 1,
				'Attack potion (2)': 1000,
				'Strength potion (1)': 1000
			})
		});
		expect(() => decantPotionFromBank(userBank, 'attack potion', 2)).toThrowError(
			"You don't have any **Attack potion** to decant!"
		);
		expect(decantPotionFromBank(userBank, 'attack potion', 4)).toMatchObject({
			potionsToAdd: resolveNameBank({
				'Attack potion (4)': 500
			}),
			potionsToRemove: resolveNameBank({
				'Attack potion (2)': 1000
			}),
			sumOfPots: 1000,
			potionName: 'Attack potion',
			finalUserBank: resolveNameBank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (4)': 500,
				'Strength potion (1)': 1000
			})
		});
		expect(decantPotionFromBank(userBank, 'strength potion', 3)).toMatchObject({
			potionsToAdd: resolveNameBank({
				'Strength potion (3)': 333,
				'Strength potion (1)': 1
			}),
			potionsToRemove: resolveNameBank({
				'Strength potion (1)': 1000
			}),
			sumOfPots: 1000,
			potionName: 'Strength potion',
			finalUserBank: resolveNameBank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (3)': 333,
				'Strength potion (1)': 1
			})
		});
	});
});
