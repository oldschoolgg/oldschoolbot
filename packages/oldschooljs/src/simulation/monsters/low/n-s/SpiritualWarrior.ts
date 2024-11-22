import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const SpiritualWarriorTable = new LootTable({ limit: 127 })

	/* Weapons */
	.add('Steel longsword', 1, 15)
	.add('Mithril spear(p)', 1, 9)
	.add('Iron scimitar', 1, 8)
	.add('Mithril axe', 1, 8)
	.add('Steel sword', 1, 7)
	.add('Mithril mace', 1, 7)
	.add('Black warhammer', 1, 5)
	.add('Iron sword', 1, 3)
	.add('Black dagger', 1, 2)
	.add('Adamant battleaxe', 1, 2)
	.add('Adamant 2h sword', 1, 1)
	.add('Rune longsword', 1, 1)
	.add('Rune halberd', 1, 1)

	/* Armor */
	.add('Steel chainbody', 1, 18)
	.add('Mithril platelegs', 1, 11)
	.add('Leather gloves', 1, 9)
	.add('Adamant full helm', 1, 8)
	.add('Iron plateskirt', 1, 4)
	.add('Black kiteshield', 1, 3)
	.add('Rune kiteshield', 1, 1)

	/* RDT */
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 2210,
	name: 'Spiritual Warrior',
	table: SpiritualWarriorTable,
	aliases: ['spiritual warrior']
});
