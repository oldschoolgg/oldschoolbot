import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const VampyreJuvinateTable: LootTable = new LootTable()
	/* Weapons */
	.add('Mithril scimitar', 1, 17)
	.add('Mithril longsword', 1, 10)
	.add('Adamant axe', 1, 10)
	.add('Adamant mace', 1, 9)
	.add('Black spear', 1, 5)
	.add('Black battleaxe', 1, 4)
	.add('Black 2h sword', 1, 4)
	.add('Mithril battleaxe', 1, 3)
	.add('Mithril 2h sword', 1, 3)
	.add('Mithril warhammer', 1, 3)
	.add('Adamant sword', 1, 3)
	.add('Staff of fire', 1, 2)
	.add('Staff of water', 1, 2)
	.add('Adamant scimitar', 1, 2)
	.add('Staff of air', 1, 1)
	.add('Staff of earth', 1, 1)

	/* Armour */
	.add('Mithril platelegs', 1, 22)
	.add('Steel plateskirt', 1, 16)
	.add('Black sq shield', 1, 15)
	.add('Black full helm', 1, 14)
	.add('Black kiteshield', 1, 9)
	.add('Black chainbody', 1, 8)
	.add('Mithril full helm', 1, 8)
	.add('Mithril sq shield', 1, 7)
	.add('Steel platebody', 1, 3)
	.add('Black platelegs', 1, 3)
	.add('Black plateskirt', 1, 3)
	.add('Mithril chainbody', 1, 3)
	.add('Mithril kiteshield', 1, 3)
	.add('Adamant med helm', 1, 3)

	/* Other */
	.add('Willow logs', 5, 16)
	.add('Nature rune', 10, 12)
	.add('Yew logs', 5, 10)
	.add('Ruby ring', 1, 9)
	.add('Death rune', 10, 8)
	.add('Amulet of magic', 1, 3)
	.add('Clue scroll (medium)', 1, 2);

export const VampyreJuvinate: SimpleMonster = new SimpleMonster({
	id: 3694,
	name: 'Vampyre Juvinate',
	table: VampyreJuvinateTable,
	aliases: ['vampyre juvinate']
});
