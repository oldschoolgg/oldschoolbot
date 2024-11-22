import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const RockslugTable = new LootTable()
	/* Armour */
	.oneIn(512, 'Mystic gloves (light)')

	/* Runes */
	.add('Earth rune', 5, 30)
	.add('Earth rune', 42, 4)
	.add('Chaos rune', 2, 4)

	/* Ores and bars */
	.add('Iron ore', 1, 22)
	.add('Coal', 1, 13)
	.add('Tin ore', 1, 8)
	.add('Iron bar', 1, 3)
	.add('Copper ore', 1, 3)
	.add('Bronze bar', 1, 2)
	.add('Mithril ore', 1, 1)

	/* Other */
	.add('Dwarven stout', 1, 13)
	.add('Hammer', 4, 10)

	/* Gem drop table */
	.add(GemTable, 1, 6);

export default new SimpleMonster({
	id: 421,
	name: 'Rockslug',
	table: RockslugTable,
	aliases: ['rockslug']
});
