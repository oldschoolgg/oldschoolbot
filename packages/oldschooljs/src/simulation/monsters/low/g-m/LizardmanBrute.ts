import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { UncommonSeedDropTable } from '../../../subtables/index';

const LizardmanBruteTable = new LootTable()
	.every('Bones')

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 15)

	/* Other */
	.add('Lizardman fang', 1, 14)
	.add('Xerician fabric', 1, 8)
	.oneIn(125, "Xeric's talisman (inert)");

export default new SimpleMonster({
	id: 6918,
	name: 'Lizardman brute',
	table: LizardmanBruteTable,
	aliases: ['lizardman brute']
});
