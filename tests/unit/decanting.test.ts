import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import decantPotionFromBank, {
	decantAllPotionsFromBank
} from '../../src/lib/minions/functions/decantPotionFromBank.js';

describe('decantPotionFromBank', () => {
	test('decantPotionFromBank', () => {
		const userBank = new Bank({
			'Magic potion (3)': 1000,
			'Defence potion (4)': 733,
			'Defence potion (3)': 233,
			'Defence potion (1)': 8,
			'Attack potion (2)': 1000,
			'Strength potion (1)': 1000,
			'Prayer mix (2)': 1000,
			'Extended antifire mix (1)': 667
		});
		expect(decantPotionFromBank(userBank, 'magic potion', 4)).toMatchObject({
			potionsToAdd: new Bank({ 'Magic potion (4)': 750 }),
			potionsToRemove: new Bank({ 'Magic potion (3)': 1000 }),
			sumOfPots: 1000,
			potionName: 'Magic potion',
			finalUserBank: new Bank({
				'Magic potion (4)': 750,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (1)': 1000,
				'Prayer mix (2)': 1000,
				'Extended antifire mix (1)': 667
			})
		});
		expect(decantPotionFromBank(userBank, 'defence potion', 2)).toMatchObject({
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
				'Strength potion (1)': 1000,
				'Prayer mix (2)': 1000,
				'Extended antifire mix (1)': 667
			})
		});
		expect(decantPotionFromBank(userBank, 'attack potion', 2)).toEqual({
			error: "You don't have any **Attack potion** to decant!"
		});
		expect(decantPotionFromBank(userBank, 'attack potion', 4)).toMatchObject({
			potionsToAdd: new Bank({
				'Attack potion (4)': 500
			}),
			potionsToRemove: new Bank({
				'Attack potion (2)': 1000
			}),
			sumOfPots: 1000,
			potionName: 'Attack potion',
			finalUserBank: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (4)': 500,
				'Strength potion (1)': 1000,
				'Prayer mix (2)': 1000,
				'Extended antifire mix (1)': 667
			})
		});
		expect(decantPotionFromBank(userBank, 'strength potion', 3)).toMatchObject({
			potionsToAdd: new Bank({
				'Strength potion (3)': 333,
				'Strength potion (1)': 1
			}),
			potionsToRemove: new Bank({
				'Strength potion (1)': 1000
			}),
			sumOfPots: 1000,
			potionName: 'Strength potion',
			finalUserBank: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (3)': 333,
				'Strength potion (1)': 1,
				'Prayer mix (2)': 1000,
				'Extended antifire mix (1)': 667
			})
		});
		expect(decantPotionFromBank(userBank, 'prayer mix', 1)).toMatchObject({
			potionsToAdd: new Bank({
				'Prayer mix (1)': 2000
			}),
			potionsToRemove: new Bank({
				'Prayer mix (2)': 1000
			}),
			sumOfPots: 1000,
			potionName: 'Prayer mix',
			finalUserBank: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (1)': 1000,
				'Prayer mix (1)': 2000,
				'Extended antifire mix (1)': 667
			})
		});
		expect(decantPotionFromBank(userBank, 'extended antifire mix', 2)).toMatchObject({
			potionsToAdd: new Bank({
				'Extended antifire mix (2)': 333,
				'Extended antifire mix (1)': 1
			}),
			potionsToRemove: new Bank({
				'Extended antifire mix (1)': 667
			}),
			sumOfPots: 667,
			potionName: 'Extended antifire mix',
			finalUserBank: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (1)': 1000,
				'Prayer mix (2)': 1000,
				'Extended antifire mix (2)': 333,
				'Extended antifire mix (1)': 1
			})
		});
	});

	test('decantAllPotionsFromBank', () => {
		const userBank = new Bank({
			'Magic potion (3)': 1000,
			'Defence potion (4)': 733,
			'Defence potion (3)': 233,
			'Defence potion (1)': 8,
			'Attack potion (2)': 1000,
			'Strength potion (1)': 1000,
			'Prayer mix (2)': 1000,
			'Extended antifire mix (1)': 667
		});

		expect(decantAllPotionsFromBank(userBank, 4)).toMatchObject({
			potionsToAdd: new Bank({
				'Magic potion (4)': 750,
				'Defence potion (4)': 176,
				'Defence potion (3)': 1,
				'Attack potion (4)': 500,
				'Strength potion (4)': 250
			}),
			potionsToRemove: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Attack potion (2)': 1000,
				'Strength potion (1)': 1000
			}),
			sumOfPots: 3241,
			potionNames: ['Attack potion', 'Strength potion', 'Defence potion', 'Magic potion'],
			finalUserBank: new Bank({
				'Magic potion (4)': 750,
				'Defence potion (4)': 909,
				'Defence potion (3)': 1,
				'Attack potion (4)': 500,
				'Strength potion (4)': 250,
				'Prayer mix (2)': 1000,
				'Extended antifire mix (1)': 667
			})
		});

		expect(decantAllPotionsFromBank(userBank, 2)).toMatchObject({
			potionsToAdd: new Bank({
				'Magic potion (2)': 1500,
				'Defence potion (2)': 1819,
				'Defence potion (1)': 1,
				'Strength potion (2)': 500,
				'Extended antifire mix (2)': 333,
				'Extended antifire mix (1)': 1
			}),
			potionsToRemove: new Bank({
				'Magic potion (3)': 1000,
				'Defence potion (4)': 733,
				'Defence potion (3)': 233,
				'Defence potion (1)': 8,
				'Strength potion (1)': 1000,
				'Extended antifire mix (1)': 667
			}),
			sumOfPots: 3641,
			potionNames: ['Strength potion', 'Defence potion', 'Magic potion', 'Extended antifire mix'],
			finalUserBank: new Bank({
				'Magic potion (2)': 1500,
				'Defence potion (2)': 1819,
				'Defence potion (1)': 1,
				'Attack potion (2)': 1000,
				'Strength potion (2)': 500,
				'Prayer mix (2)': 1000,
				'Extended antifire mix (2)': 333,
				'Extended antifire mix (1)': 1
			})
		});

		expect(decantAllPotionsFromBank(new Bank({ 'Prayer mix (1)': 10 }), 4)).toEqual({
			error: "You don't have any potions that can be decanted to 4-dose."
		});
	});
});
