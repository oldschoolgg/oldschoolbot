import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

// TODO: check back for wiki drop table update from another one in the repo
const GemTable = new LootTable()
	.add('Sapphire necklace', 1, 4)
	.add('Sapphire amulet', 1, 4)
	.add('Sapphire ring', 1, 4)
	.add('Emerald necklace', 1, 3)
	.add('Emerald amulet', 1, 3)
	.add('Emerald ring', 1, 3)
	.add('Ruby necklace', 1, 2)
	.add('Ruby amulet', 1, 2)
	.add('Ruby ring', 1, 2)
	.add('Gold necklace', 1, 2)
	.add('Gold amulet', 1, 2)
	.add('Gold ring', 1, 2)
	.add('Sapphire', 1, 2)
	.add('Emerald', 1, 2)
	.add('Ruby', 1, 2)
	.add('Diamond necklace', 1, 1)
	.add('Diamond amulet', 1, 1)
	.add('Diamond ring', 1, 1)
	.add('Diamond', 1, 1);

const HAMChestTable = new LootTable()
	.every('Coins', [0, 99])
	.add(GemTable, 1, 1)
	.add(GemTable, 2, 1)
	.add(GemTable, 3, 1)
	.add(GemTable, 4, 1)
	.add(GemTable, 5, 1);

export const BronzeHAMChest = new SimpleOpenable({
	id: 8867,
	name: 'Bronze HAM chest',
	aliases: ['Bronze', 'bronze ham chest', 'bronze chest'],
	table: HAMChestTable
});

export const IronHAMChest = new SimpleOpenable({
	id: 8869,
	name: 'Iron HAM chest',
	aliases: ['iron', 'iron ham chest', 'iron chest'],
	table: HAMChestTable
});

export const SilverHAMChest = new SimpleOpenable({
	id: 8868,
	name: 'Silver HAM chest',
	aliases: ['silver', 'silver ham chest', 'silver chest'],
	table: HAMChestTable
});

export const SteelHAMChest = new SimpleOpenable({
	id: 8866,
	name: 'Steel HAM chest',
	aliases: ['steel', 'steel ham chest', 'steel chest'],
	table: HAMChestTable
});
