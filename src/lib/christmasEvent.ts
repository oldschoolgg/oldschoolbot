import { roll } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import resolveItems from './util/resolveItems';

export const christmasLootTable = new LootTable()
	.tertiary(18, 'Christmas box')
	.add(
		new LootTable()

			.add('Christmas dye')
			.add('Festive jumper (2022)', 1, 2)
			.add('Christmas cape', 1, 2)
			.add('Christmas socks', 1, 2)
			.add('Tinsel scarf', 1, 4)
			.add('Frosted wreath', 1, 4)
			.add('Edible yoyo', 1, 4)
			.add(
				new LootTable()
					.add('Pumpkinhead praline')
					.add('Takon truffle')
					.add('Seer sweet')
					.add('Cob cup')
					.add('Craig creme')
					.add('Moktang mint')
					.add('Festive treats')
					.add('Pork sausage')
					.add('Pork crackling')
					.add('Reinbeer'),
				1,
				5
			)
	)
	.add('Pavlova')
	.add('Prawns')
	.add('Roast potatoes')
	.add('Cake')
	.add('Chocolate cake')
	.add('Chocolate bar')
	.add('Bucket of milk')
	.add('Chocchip crunchies');

export function christmasEventReward(user: MUser, quantity: number) {
	const effectiveCL = user.cl.clone();
	const loot = new Bank();

	for (let i = 0; i < quantity; i++) {
		loot.add(christmasLootTable.roll());

		if (!effectiveCL.has('Snowman plushie') && roll(50)) {
			[loot, effectiveCL].map(b => b.add('Snowman plushie'));
		}

		// Roll for a snowman top hat and/or festive scarf, scaling to amount in CL
		for (const item of ['Snowman top hat', 'Festive scarf']) {
			let baseRate = 10;
			let dropRate = effectiveCL.has(item) ? effectiveCL.amount(item) * baseRate * 2.2 : baseRate;
			if (roll(dropRate)) {
				[loot, effectiveCL].map(b => b.add(item));
			}
		}
	}

	return loot;
}

export const allChristmasItems = resolveItems([
	'Christmas snowglobe',
	'Snowman plushie',
	'Snowman top hat',
	'Festive scarf',
	'Frosty',
	'Reinbeer',
	'Edible yoyo',
	'Frosted wreath',
	'Christmas socks',
	'Christmas dye',
	'Festive jumper (2022)',
	'Christmas box'
]);
