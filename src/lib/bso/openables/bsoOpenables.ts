import {
	ChimplingImpling,
	EternalImpling,
	InfernalImpling,
	MysteryImpling,
	ShrimplingImpling
} from '@/lib/bso/customImplings.js';
import { holidayOpenables } from '@/lib/bso/openables/holidayOpenables.js';
import { mysteryBoxOpenables } from '@/lib/bso/openables/mysteryBoxes.js';
import {
	BirthdayPackTable,
	BlacksmithCrateTable,
	DwarvenCrateTable,
	FestivePresentTable,
	GamblersBagTable,
	MonkeyCrateTable,
	magicCreateCrate,
	testerGiftTable
} from '@/lib/bso/openables/tables.js';

import { Bank, Items, itemID, LootTable } from 'oldschooljs';

import type { UnifiedOpenable } from '@/lib/openables.js';
import { keyCrates } from '../keyCrates.js';
import { PaintBoxTable } from '../paintColors.js';
import { divinationEnergies } from '../skills/divination.js';

const DivineEggTable = new LootTable().tertiary(100, 'Jar of memories');

for (const energy of divinationEnergies) {
	let weight = divinationEnergies.length + 1 - (divinationEnergies.indexOf(energy) + 1);
	weight *= weight;
	DivineEggTable.add(energy.item.id, weight, weight);
}

const VenatrixEggTable = new LootTable().tertiary(1000, 'Baby venatrix');

export const bsoOpenables: UnifiedOpenable[] = [
	...mysteryBoxOpenables,
	...holidayOpenables,
	{
		name: 'Tester Gift box',
		id: itemID('Tester gift box'),
		openedItem: Items.getOrThrow('Tester Gift box'),
		aliases: ['tester gift box', 'tgb'],
		output: testerGiftTable,
		allItems: testerGiftTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Dwarven crate',
		id: itemID('Dwarven crate'),
		openedItem: Items.getOrThrow('Dwarven crate'),
		aliases: ['dwarven crate', 'dc'],
		output: DwarvenCrateTable,
		allItems: DwarvenCrateTable.allItems
	},
	{
		name: 'Blacksmith crate',
		id: itemID('Blacksmith crate'),
		openedItem: Items.getOrThrow('Blacksmith crate'),
		aliases: ['blacksmith crate', 'bsc'],
		output: BlacksmithCrateTable,
		allItems: BlacksmithCrateTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Birthday pack',
		id: itemID('Birthday pack'),
		openedItem: Items.getOrThrow('Birthday pack'),
		aliases: ['bp', 'birthday pack'],
		output: BirthdayPackTable,
		allItems: BirthdayPackTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Gamblers bag',
		id: itemID('Gamblers bag'),
		openedItem: Items.getOrThrow('Gamblers bag'),
		aliases: ['gamblers bag', 'gb'],
		output: GamblersBagTable,
		allItems: GamblersBagTable.allItems,
		smokeyApplies: true,
		excludeFromOpenAll: true
	},

	{
		name: 'Magic crate',
		id: itemID('Magic crate'),
		openedItem: Items.getOrThrow('Magic crate'),
		aliases: ['magic crate'],
		output: magicCreateCrate,
		allItems: magicCreateCrate.allItems,
		smokeyApplies: true
	},
	{
		name: 'Monkey crate',
		id: itemID('Monkey crate'),
		openedItem: Items.getOrThrow('Monkey crate'),
		aliases: ['monkey crate'],
		output: MonkeyCrateTable,
		emoji: '<:Monkey_crate:885774318041202708>',
		allItems: MonkeyCrateTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Festive present',
		id: itemID('Festive present'),
		openedItem: Items.getOrThrow('Festive present'),
		aliases: ['festive present'],
		output: FestivePresentTable,
		allItems: FestivePresentTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Chimpling jar',
		id: itemID('Chimpling jar'),
		openedItem: Items.getOrThrow('Chimpling jar'),
		aliases: ChimplingImpling.aliases,
		output: ChimplingImpling.table,
		allItems: ChimplingImpling.table.allItems
	},
	{
		name: 'Mystery impling jar',
		id: itemID('Mystery impling jar'),
		openedItem: Items.getOrThrow('Mystery impling jar'),
		aliases: MysteryImpling.aliases,
		output: MysteryImpling.table,
		allItems: MysteryImpling.table.allItems
	},
	{
		name: 'Eternal impling jar',
		id: itemID('Eternal impling jar'),
		openedItem: Items.getOrThrow('Eternal impling jar'),
		aliases: EternalImpling.aliases,
		output: EternalImpling.table,
		allItems: EternalImpling.table.allItems
	},
	{
		name: 'Infernal impling jar',
		id: itemID('Infernal impling jar'),
		openedItem: Items.getOrThrow('Infernal impling jar'),
		aliases: InfernalImpling.aliases,
		output: InfernalImpling.table,
		allItems: InfernalImpling.table.allItems
	},
	{
		name: 'Shrimpling',
		id: itemID('Shrimpling'),
		openedItem: Items.getOrThrow('Shrimpling'),
		aliases: ShrimplingImpling.aliases,
		output: ShrimplingImpling.table,
		allItems: ShrimplingImpling.table.allItems
	},

	{
		name: 'Paint box',
		id: itemID('Paint box'),
		openedItem: Items.getOrThrow('Paint box'),
		aliases: ['paint box'],
		output: PaintBoxTable,
		allItems: PaintBoxTable.allItems,
		excludeFromOpenAll: true,
		smokeyApplies: false
	},
	{
		name: 'Divine egg',
		id: itemID('Divine egg'),
		openedItem: Items.getOrThrow('Divine egg'),
		aliases: ['divine egg'],
		output: DivineEggTable,
		allItems: DivineEggTable.allItems,
		smokeyApplies: true
	},
	{
		name: 'Venatrix eggs',
		id: itemID('Venatrix eggs'),
		openedItem: Items.getOrThrow('Venatrix eggs'),
		aliases: ['venatrix eggs'],
		output: VenatrixEggTable,
		allItems: VenatrixEggTable.allItems,
		smokeyApplies: false
	},
	{
		name: 'Large egg',
		id: itemID('Large egg'),
		openedItem: Items.getOrThrow('Large egg'),
		aliases: ['large egg'],
		output: new LootTable().tertiary(1620, 'Cluckers'),
		allItems: [],
		smokeyApplies: false
	}
];

for (const crate of keyCrates) {
	bsoOpenables.push({
		name: crate.item.name,
		id: crate.item.id,
		openedItem: crate.item,
		aliases: [crate.item.name],
		output: crate.table,
		allItems: crate.table.allItems,
		extraCostPerOpen: new Bank().add(crate.key.id),
		excludeFromOpenAll: true,
		smokeyApplies: false
	});
}
