import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const VampyreJuvinateTable = new LootTable()
	/* Weapons */
	.add('Black battleaxe', 1, 2)
	.add('Mithril battleaxe', 1, 2)
	.add('Mithril scimitar', 1, 2)
	.add('Mithril longsword', 1, 2)
	.add('Adamant axe', 1, 2)
	.add('Staff of air', 1, 1)
	.add('Staff of fire', 1, 1)
	.add('Black spear', 1, 1)
	.add('Black 2h sword', 1, 1)
	.add('Mithril 2h sword', 1, 1)
	.add('Mithril warhammer', 1, 1)
	.add('Adamant sword', 1, 1)
	.add('Adamant mace', 1, 1)
	.add('Adamant scimitar', 1, 1)

	/* Armour */
	.add('Steel plateskirt', 1, 4)
	.add('Steel platebody', 1, 4)
	.add('Black full helm', 1, 2)
	.add('Black kiteshield', 1, 2)
	.add('Black sq shield', 1, 2)
	.add('Mithril full helm', 1, 2)
	.add('Mithril chainbody', 1, 2)
	.add('Black chainbody', 1, 1)
	.add('Black platelegs', 1, 1)
	.add('Mithril platelegs', 1, 1)
	.add('Mithril sq shield', 1, 1)
	.add('Adamant med helm', 1, 1)

	/* Runes */
	.add('Nature rune', 10, 1)
	.add('Death rune', 10, 1)

	/* Materials */
	.add('Willow logs', 5, 2)
	.add('Yew logs', 5, 2)
	.add('Ruby ring', 1, 2)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 3694,
	name: 'Vampyre Juvinate',
	table: VampyreJuvinateTable,
	aliases: ['vampyre juvinate']
});
