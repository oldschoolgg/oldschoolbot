import { LootTable } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import itemID from '../util/itemID';

interface Offerable {
	name: string;
	itemID: number;
	offerWhere: string;
	table: LootTable;
	economyCounter?: 'slayer_chewed_offered' | 'slayer_unsired_offered';
	aliases?: string[];
	uniques?: number[];
}

const UnsiredLootTable = new LootTable()
	.add('Abyssal head', 1, 10)
	.add('Abyssal orphan', 1, 5)
	.add('Abyssal dagger', 1, 26)
	.add('Abyssal whip', 1, 12)
	.add('Bludgeon claw', 1, 62)
	.add('Jar of miasma', 1, 13);

export const ChewedBonesLootTable = new LootTable()
	.oneIn(256, 'Dragon full helm')
	.add('Adamant knife', 20, 3)
	.add('Adamant dart(p)', 20, 3)
	.add('Mith grapple', 2, 3)
	.add('Diamond', 2, 4)
	.add('Runite bolts', 10, 3)
	.add('Rune arrow', 10, 3)
	.add('Silver bolts', 5, 3)
	.add('Blood rune', [4, 7], 5)
	.add('Death rune', [8, 15], 9)
	.add('Ranarr potion (unf)', 2, 4)
	.add('Anti-poison supermix(2)', 1, 2)
	.add('Antifire mix(1)', 1, 2)
	.add('Antifire mix(2)', 1, 2)
	.add('Fishing mix(2)', 1, 2)
	.add('Prayer mix(1)', 1, 2)
	.add('Prayer mix(2)', 1, 2)
	.add('Superattack mix(1)', 1, 2)
	.add('Superattack mix(2)', 1, 2)
	.add('Super str. mix(1)', 1, 2)
	.add('Super str. mix(2)', 1, 2)
	.add('Super def. mix(1)', 1, 2)
	.add('Super def. mix(2)', 1, 2);

export const Offerables: Offerable[] = [
	{
		name: 'Unsired',
		itemID: itemID('Unsired'),
		offerWhere: 'Font of consumption',
		table: UnsiredLootTable,
		economyCounter: 'slayer_unsired_offered',
		aliases: ['unsired', 'sired', 'sire'],
		uniques: resolveItems(['Abyssal orphan', 'Jar of miasma'])
	},
	{
		name: 'Chewed bones',
		itemID: itemID('Chewed bones'),
		offerWhere: 'barbarian spirit',
		economyCounter: 'slayer_chewed_offered',
		table: ChewedBonesLootTable,
		aliases: ['chewed bones', 'chewed'],
		uniques: resolveItems(['Dragon full helm'])
	}
];
