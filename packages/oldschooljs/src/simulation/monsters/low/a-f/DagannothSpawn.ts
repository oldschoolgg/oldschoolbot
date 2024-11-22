import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const DagannothSpawnTable = new LootTable()
	.every('Bones')

	/* Runes */
	.add('Water rune', 3, 10)

	/* Fish */
	.add('Raw tuna', 1, 10)
	.add('Raw sardine', 1, 10)
	.add('Raw herring', 1, 5)

	/* Coins */
	.add('Coins', 16, 10)
	.add('Coins', 25, 10)

	/* Other */
	.add('Feather', 2, 38)
	.add('Seaweed', 1, 10)
	.add('Fishing bait', 3, 10)
	.add('Water talisman', 1, 10)
	.add('Oyster pearl', 1, 4)

	/* Gem drop table */
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (easy)');

export default new SimpleMonster({
	id: 3184,
	name: 'Dagannoth spawn',
	table: DagannothSpawnTable,
	aliases: ['dagannoth spawn']
});
