import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const KalphiteWorkerTable = new LootTable()
	/* Weapons and armor */
	.add('Iron sword', 1, 3)
	.add('Steel dagger', 1, 3)
	.add('Hardleather body', 1, 2)
	.add('Iron javelin', 5, 1)
	.add('Steel longsword', 1, 1)

	/* Runes */
	.add('Law rune', 2, 3)
	.add('Body rune', 6, 2)
	.add('Chaos rune', 3, 2)
	.add('Fire rune', 7, 2)
	.add('Water rune', 2, 2)
	.add('Nature rune', 4, 2)
	.add('Cosmic rune', 2, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 7)

	/* Coins */
	.add('Coins', 15, 34)
	.add('Coins', 5, 12)
	.add('Coins', 28, 12)
	.add('Coins', 1, 8)
	.add('Coins', 62, 4)
	.add('Coins', 42, 3)

	/* Other */
	.add('Waterskin(4)', 1, 21)

	/* RDT */
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(250, 'Ensouled kalphite head');

export default new SimpleMonster({
	id: 955,
	name: 'Kalphite Worker',
	table: KalphiteWorkerTable,
	aliases: ['kalphite worker', 'kalphite']
});
