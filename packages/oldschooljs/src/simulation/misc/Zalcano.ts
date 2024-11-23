import { calcPercentOfNum } from 'e';

import type { LootBank } from '../../meta/types';
import Bank from '../../structures/Bank';
import LootTable from '../../structures/LootTable';
import SimpleTable from '../../structures/SimpleTable';
import { resolveNameBank } from '../../util/bank';

export interface TeamMember {
	id: string;
	/**
	 * How well they performed as a percentage. 100% would indicate they did quite well, but not necessarily MVP or a solo kill.
	 */
	performancePercentage: number;
	isMVP: boolean;
}

export interface ZalcanoOptions {
	/**
	 * The members of the team killing the Zalcano.
	 */
	team: TeamMember[];
}

const data: Record<string, [number[], number]> = {
	// [name, [quantity_range, weighting]]

	// Runes and ammunition
	'Blood rune': [[95, 480], 1],
	'Cosmic rune': [[304, 926], 1],
	'Death rune': [[201, 830], 1],
	'Law rune': [[177, 770], 1],
	'Soul rune': [[57, 388], 1],
	'Nature rune': [[1, 842], 1],

	// Materials
	'Silver ore': [[102, 800], 3],
	'Gold ore': [[129, 721], 3],
	'Steel bar': [[78, 534], 3],
	'Mithril bar': [[56, 459], 3],
	'Mithril ore': [[56, 387], 2],
	'Adamantite ore': [[63, 289], 2],
	'Runite ore': [[3, 26], 2],
	'Adamantite bar': [[17, 103], 2],
	'Runite bar': [[3, 24], 2],
	'Uncut diamond': [[2, 19], 2],
	'Uncut dragonstone': [[1, 11], 2],
	'Onyx bolt tips': [[4, 38], 2],
	Coal: [[169, 815], 1],
	'Pure essence': [[784, 4422], 1]
};
const nonUniqueItemRanges = resolveNameBank(data);

const NonUniqueTable = new SimpleTable<number>();
for (const [id, data] of Object.entries(nonUniqueItemRanges)) {
	NonUniqueTable.add(Number.parseInt(id), data[1]);
}

const toolSeedTable = new LootTable().tertiary(40, 'Uncut onyx').every('Crystal tool seed');

const tertiaryTable = new LootTable()
	.tertiary(2250, 'Smolcano')
	.tertiary(200, toolSeedTable)
	.tertiary(1125, 'Zalcano shard');

class ZalcanoClass {
	allItems: number[] = [...tertiaryTable.allItems, ...NonUniqueTable.table.map(i => i.item)];

	public rollNonUniqueLoot(perfPercent: number, isMVP: boolean): [number, number] {
		const item = NonUniqueTable.roll();

		const [range] = nonUniqueItemRanges[item];
		// If the quantity range of the item is 50-100, we
		// give you 50 qty to start, then increase it.
		let quantity = range[0];
		quantity += calcPercentOfNum(perfPercent, range[1]) - range[0];

		if (isMVP) quantity *= 1.1;

		quantity = Math.floor(Math.max(quantity, range[0]));

		return [item, quantity];
	}

	public kill({ team }: Readonly<ZalcanoOptions>): LootBank {
		const lootResult: LootBank = {};

		for (const teamMember of team) {
			const loot = new Bank();
			loot.add(...this.rollNonUniqueLoot(teamMember.performancePercentage, teamMember.isMVP));
			if (teamMember.isMVP) {
				loot.add('Infernal ashes');
				loot.add('Crystal shard', 3);
			} else {
				loot.add('Crystal shard', 2);
			}
			loot.add(tertiaryTable.roll());
			lootResult[teamMember.id] = loot;
		}

		return lootResult;
	}
}

const Zalcano = new ZalcanoClass();

export default Zalcano;
