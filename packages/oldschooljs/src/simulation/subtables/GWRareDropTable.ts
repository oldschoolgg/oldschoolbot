import LootTable from '../../structures/LootTable';

const GWMegaRareTable = new LootTable()
	.add('Coins', [19_500, 20_000], 113)
	.add('Rune spear', 1, 8)
	.add('Shield left half', 1, 4)
	.add('Dragon spear', 1, 3);

export const ShardTable = new LootTable().add('Godsword shard 1').add('Godsword shard 2').add('Godsword shard 3');

export const GWGemTable = new LootTable()
	.add('Coins', [19_500, 20_000], 63)
	.add('Uncut sapphire', 1, 32)
	.add('Uncut emerald', 1, 16)
	.add('Uncut ruby', 1, 8)
	.add('Chaos talisman', 1, 3)
	.add('Uncut diamond', 1, 2)
	.add('Rune javelin', 5, 1)
	.add('Loop half of key')
	.add('Tooth half of key')
	.add(GWMegaRareTable);

const GWRareDropTable = new LootTable()
	/* Runes and ammunition */
	.add('Nature rune', [62, 67], 3)
	.add('Adamant javelin', [15, 20], 2)
	.add('Death rune', [40, 45], 2)
	.add('Law rune', [40, 45], 2)
	.add('Rune arrow', [38, 43], 2)
	.add('Steel arrow', [145, 150], 2)

	/* Weapons and armour */
	.add('Rune 2h sword', 1, 3)
	.add('Rune battleaxe', 1, 3)
	.add('Rune sq shield', 1, 2)
	.add('Dragon med helm', 1, 1)
	.add('Rune kiteshield', 1, 1)
	.add('Rune sword', 1, 5)

	/* Other */
	.add('Coins', [19_500, 20_000], 20)
	.add('Loop half of key', 1, 21)
	.add('Tooth half of key', 1, 20)
	.add('Dragonstone', 1, 2)
	.add('Silver ore', 100, 2)

	/* Subtables */
	.add(GWGemTable, 1, 20)
	.add(GWMegaRareTable, 1, 15);

export default GWRareDropTable;
