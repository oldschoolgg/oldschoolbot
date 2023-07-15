import { LootTable } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from './util/getOSItem';

interface Crate {
	item: Item;
	key: Item;
	keyCostGP: number;
	table: LootTable;
}

export const keyCrates: Crate[] = [
	{
		item: getOSItem('Supply crate (s1)'),
		key: getOSItem('Supply crate key (s1)'),
		keyCostGP: 50_000_000,
		table: new LootTable()
			.add(new LootTable().add('OSB Jumper').add('BSO Jumper').add("Skipper's tie").add("Remy's chef hat"), 1, 2)
			.add('Paint box', 1, 7)
			.add('Archon headdress', 1, 5)
			.add('Archon tassets', 1, 5)
			.add('Archon crest', 1, 5)
			.add('Archon gloves', 1, 5)
			.add('Archon boots', 1, 5)
			.add('Coins', 100_000, 10)
			.add('Magic logs', [200, 300], 10)
			.add('Draconic visage', 1, 10)
			.add('Chocolate bar', 1, 10)
			.add('Baguette', 1, 10)
			.add('Kebab', 1, 10)
			.add('Spinach roll', 1, 6)
	},
	{
		item: getOSItem('Birthday crate (s2)'),
		key: getOSItem('Birthday crate key (s2)'),
		keyCostGP: 50_000_000,
		table: new LootTable()
			.oneIn(250, 'Golden cape shard')
			.add(
				new LootTable()
					.add('Cake partyhat')
					.add('Rubber flappy')
					.add('Shelldon shield')
					.add("Koschei's toothpick"),
				1,
				2
			)
			.add('Paint box', 1, 5)
			.add('Imperial helmet', 1, 5)
			.add('Imperial cuirass', 1, 5)
			.add('Imperial legs', 1, 5)
			.add('Imperial gloves', 1, 5)
			.add('Imperial sabatons', 1, 5)
			.add('Chocolate bomb', 1, 10)
			.add('Cake', 1, 11)
			.add('Chocolate cake', 1, 11)
			.add('Chocolate bar', 1, 10)
			.add('Peach', 1, 10)
			.add('Beer', 1, 10)
			.add('Birthday balloons', 1, 6)
	}
];
