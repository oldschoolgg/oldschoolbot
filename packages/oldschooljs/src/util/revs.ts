import { randInt, roll } from '@oldschoolgg/rng';

import type { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';
import type { CustomKillLogic, MonsterKillOptions } from '@/structures/Monster.js';

type RevTableKey =
	| 'uniqueTable'
	| 'ancientEmblem'
	| 'ancientTotem'
	| 'ancientCrystal'
	| 'ancientStatuette'
	| 'topThree'
	| 'seeds';

const pairs: [RevTableKey, string][] = [
	['ancientEmblem', 'Ancient emblem'],
	['ancientTotem', 'Ancient totem'],
	['ancientCrystal', 'Ancient crystal'],
	['ancientStatuette', 'Ancient statuette'],
	['topThree', 'Ancient medallion'],
	['topThree', 'Ancient effigy'],
	['topThree', 'Ancient relic']
];

type RevTableItem = readonly [number, number];
export type RevTable = Record<RevTableKey, RevTableItem>;

export function makeRevTable(table: RevTable): CustomKillLogic {
	const cb: CustomKillLogic = (options: MonsterKillOptions, currentLoot: Bank): void => {
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

		for (const [key, itemName] of pairs) {
			if (roll(table[key][index])) {
				currentLoot.add(itemName);
				return;
			}
		}
	};
	return cb;
}

export const revsUniqueTable: LootTable = new LootTable()
	.add('Amulet of avarice', 1, 2)
	.add("Craw's bow (u)", 1, 1)
	.add("Thammaron's sceptre (u)", 1, 1)
	.add("Viggora's chainmace (u)", 1, 1);
