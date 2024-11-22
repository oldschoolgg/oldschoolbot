import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const HarpieBugSwarmTable = new LootTable()
	/* Weapons and armour */
	.add('Steel axe', 1, 4)
	.add('Steel full helm', 1, 4)
	.add('Staff of fire', 1, 3)
	.add('Mithril chainbody', 1, 2)
	.add('Adamant med helm', 1, 1)
	.add('Steel boots', 1, 1)

	/* Runes */
	.add('Fire rune', 30, 20)
	.add('Fire rune', 60, 8)
	.add('Chaos rune', 15, 5)
	.add('Death rune', 3, 3)

	/* Coins */
	.add('Coins', 40, 25)
	.add('Coins', 160, 20)
	.add('Coins', 230, 10)
	.add('Coins', 30, 7)
	.add('Coins', 490, 2)

	/* Other */
	.add('Gold ore', 1, 8)
	.add('Jug of wine', 1, 2)

	/* Gem drop table */
	.add(GemTable, 1, 3)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 464,
	name: 'Harpie Bug Swarm',
	table: HarpieBugSwarmTable,
	aliases: ['harpie bug swarm']
});
