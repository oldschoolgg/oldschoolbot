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
		key: getOSItem('Supply crate key'),
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
	}
];
