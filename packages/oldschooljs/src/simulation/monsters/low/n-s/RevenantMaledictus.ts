import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';
import { makeRevTable } from '@/util/revs.js';
import { RevenantDragonTable } from './RevenantDragon.js';

const RevenantMaledictusGuaranteedTable = new LootTable().add('Ancient emblem').add('Ancient totem');
const revenantDragonExtraLoot = makeRevTable({
	seeds: [1100, 1100],
	uniqueTable: [2933, 587],
	ancientEmblem: [4400, 4400],
	ancientTotem: [1100, 1100],
	ancientCrystal: [1467, 1467],
	ancientStatuette: [2000, 2000],
	topThree: [4400, 4400]
});

export const RevenantMaledictusTable: LootTable = new LootTable()
	.every(RevenantMaledictusGuaranteedTable)
	.every(RevenantDragonTable, 2);

export const RevenantMaledictus: SimpleMonster = new SimpleMonster({
	id: 11_246,
	name: 'Revenant maledictus',
	table: RevenantMaledictusTable,
	aliases: ['revenant maledictus', 'maledictus', 'rev boss'],
	customKillLogic: (options, loot) => {
		revenantDragonExtraLoot(options, loot);
		revenantDragonExtraLoot(options, loot);
	}
});
