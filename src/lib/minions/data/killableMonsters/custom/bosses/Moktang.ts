import { LootTable } from 'oldschooljs';

import { MysteryBoxes } from '../../../../../bsoOpenables';
import {
	ClueTable,
	FletchingTipsTable,
	lowRuneHighAdamantTable,
	runeWeaponTable,
	StoneSpiritTable
} from '../../../../../simulation/sharedTables';

export const MOKTANG_ID = 391_241;
const BarTable = new LootTable().add('Bronze bar', 10).add('Iron bar', 10).add('Steel bar', 10);

export const MoktangLootTable = new LootTable()
	.every(StoneSpiritTable, [3, 6])
	.tertiary(1536, 'Mini moktang')
	.tertiary(750, 'Volcanic dye')
	.tertiary(716, 'Igne gear frame')
	.tertiary(128, 'Volcanic shards')
	.tertiary(5, ClueTable)
	.tertiary(16, MysteryBoxes)
	.tertiary(5, new LootTable().add('Dragonstone upgrade kit'))
	.add(BarTable)
	.add(lowRuneHighAdamantTable)
	.add(FletchingTipsTable)
	.add(runeWeaponTable);
