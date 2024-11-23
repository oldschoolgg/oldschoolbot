import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { PyrefiendPreTable } from '../low/n-s/Pyrefiend';

const FlamingPyrelordTable = new LootTable()
	.every('Fiendish ashes')
	.every(PyrefiendPreTable, 3)

	/* Tertiary */
	.tertiary(13, 'Clue scroll (medium)')

	/* Superior Slayer tertiary */
	.tertiary(325, 'Mist battlestaff')
	.tertiary(325, 'Dust battlestaff')
	.tertiary(1138, 'Eternal gem')
	.tertiary(1138, 'Imbued heart');

export default new SimpleMonster({
	id: 7394,
	name: 'Flaming pyrelord',
	table: FlamingPyrelordTable,
	aliases: ['flaming pyrelord']
});
