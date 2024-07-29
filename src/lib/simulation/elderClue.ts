import { randArrItem, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import Clue from 'oldschooljs/dist/structures/Clue';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import resolveItems from '../util/resolveItems';
import { LampTable } from './grandmasterClue';

const boxTable = new LootTable()
	.add('Pet mystery box')
	.add('Holiday mystery box')
	.add('Equippable mystery box')
	.add('Clothing mystery box')
	.add('Tradeable mystery box', 2);

const table = new LootTable()
	.tertiary(
		3000,
		new LootTable()
			.add('2nd age range legs')
			.add('2nd age range top')
			.add('2nd age range coif')
			.add('2nd age bow')
			.add('2nd age mage top')
			.add('2nd age mage bottom')
			.add('2nd age mage mask')
			.add('2nd age staff')
	)
	.tertiary(47, LampTable)
	.tertiary(50_000, new LootTable().add('First age robe top').add('First age robe bottom'))
	.tertiary(30, boxTable, [1, 3])
	.oneIn(
		125,
		new LootTable()
			.add('Lord marshal boots')
			.add('Lord marshal gloves')
			.add('Lord marshal trousers')
			.add('Lord marshal top')
			.add('Lord marshal cap')
			.add('Akumu mask')
			.add('Commander boots')
			.add('Commander gloves')
			.add('Commander trousers')
			.add('Commander top')
			.add('Commander cap')
			.add('Apple parasol')
			.add('Watermelon parasol')
			.add('Lemon parasol')
			.add('Strawberry parasol')
			.add('Blueberry parasol')
			.add('Grape parasol')
			.add('Coconut parasol')
			.add('Detective hat')
			.add('Detective trenchcoat')
			.add('Detective pants')
	)
	.add('Athelas seed')
	.add('Uncut zenyte')
	.add('Dragon bones', 500)
	.add('Battlestaff', 400)
	.add('Runite ore', 700)
	.add('Uncut dragonstone', 350)
	.add('Coal', 5000)
	.add('Uncut onyx', 4)
	.add('Gold ore', 8000)
	.add('Royal dragonhide', 300)
	.add(
		new LootTable()
			.add('Runite stone spirit', 1000)
			.add('Adamantite stone spirit', 2000)
			.add('Mithril stone spirit', 3000)
			.add('Gold stone spirit', 4000)
	)
	.add('Coins', [20_500_000, 50_200_000]);

export class ElderClue extends Clue {
	open(quantity: number, user: MUser) {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const numberOfRolls = randInt(4, 7);

			for (let t = 0; t < numberOfRolls; t++) {
				loot.add(table.roll());
			}

			const untradeableUniques = resolveItems(['Clue bag', 'Inventors tools', 'Elder knowledge']);
			if (roll(100)) {
				const unowned = untradeableUniques.filter(id => !user.cl.has(id) && !loot.has(id));
				if (unowned.length > 0) {
					loot.add(randArrItem(unowned));
				} else {
					loot.add(randArrItem(untradeableUniques));
				}
			}
			if (roll(700)) {
				loot.add('Octo');
			}
		}

		return loot;
	}
}

export const ElderClueTable = new ElderClue({ table });
