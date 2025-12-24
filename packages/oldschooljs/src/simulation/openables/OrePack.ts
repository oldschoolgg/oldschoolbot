import { randInt } from '@oldschoolgg/rng';

import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

// Giant's Foundry Ore pack
const GiantsFoundryOrePackTable: LootTable = new LootTable()
	.add('Coal', 1, 181)
	.add('Iron ore', 1, 25)
	.add('Mithril ore', 1, 17)
	.add('Adamantite ore', 1, 3)
	.add('Runite ore', 1, 1);

const GFOrePackTable: LootTable = new LootTable().every(GiantsFoundryOrePackTable, 30);

export const GiantsFoundryOrePack: SimpleOpenable = new SimpleOpenable({
	id: 27_019,
	name: "Ore pack (Giant's Foundry)",
	aliases: ["ore pack (giant's foundry)", 'giants', 'foundry', 'giants foundry'],
	table: GFOrePackTable
});

// Volcanic Mine Ore pack
const VolcanicMineMOrePackTable: LootTable = new LootTable()
	.add('Iron ore', 1, 50)
	.add('Coal', 1, 15)
	.add('Silver ore', 1, 13)
	.add('Gold ore', 1, 11)
	.add('Mithril ore', 1, 9)
	.add('Adamantite ore', 1, 4)
	.add('Runite ore', 1, 1);

const VMOrePackTable: LootTable = new LootTable()
	.oneIn(100, 'Dragon pickaxe (broken)')
	.every(VolcanicMineMOrePackTable, randInt(38, 50));

export const VolcanicMineOrePack: SimpleOpenable = new SimpleOpenable({
	id: 27_693,
	name: 'Ore pack (Volcanic Mine)',
	aliases: ['ore pack (volcanic mine)', 'volcanic', 'volcanic mine'],
	table: VMOrePackTable
});
