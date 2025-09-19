import type { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import type { MonsterKillOptions } from '@/structures/Monster.js';
import { roll, randInt } from './smallUtils.js';

type CustomKillLogic = (options: MonsterKillOptions, currentLoot: Bank) => void;

export function makeRevTable(table: RevTable): CustomKillLogic {
	return (options: MonsterKillOptions, currentLoot: Bank) => {
		const index = options.onSlayerTask ? 1 : 0;
		if (roll(table.uniqueTable[index])) {
			currentLoot.add(revsUniqueTable.roll());
			return;
		}

		if (roll(table.seeds[index])) {
			currentLoot.add('Yew seed', randInt(2, 7));
			return;
		}

		if (roll(table.seeds[index])) {
			currentLoot.add('Magic seed', randInt(2, 7));
			return;
		}

		for (const [key, itemName] of [
			['ancientEmblem', 'Ancient emblem'],
			['ancientTotem', 'Ancient totem'],
			['ancientCrystal', 'Ancient crystal'],
			['ancientStatuette', 'Ancient statuette'],
			['topThree', 'Ancient medallion'],
			['topThree', 'Ancient effigy'],
			['topThree', 'Ancient relic']
		] as const) {
			if (roll(table[key][index])) {
				currentLoot.add(itemName);
				return;
			}
		}
	};
}

export interface RevTable {
	uniqueTable: RevTableItem;
	ancientEmblem: RevTableItem;
	ancientTotem: RevTableItem;
	ancientCrystal: RevTableItem;
	ancientStatuette: RevTableItem;
	topThree: RevTableItem;
	seeds: RevTableItem;
}

type RevTableItem = [number, number];

export const revsUniqueTable = new LootTable()
	.add('Amulet of avarice', 1, 2)
	.add("Craw's bow (u)", 1, 1)
	.add("Thammaron's sceptre (u)", 1, 1)
	.add("Viggora's chainmace (u)", 1, 1);
