import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { AbyssalDemonPreTable } from '../low/a-f/AbyssalDemon';

const GreaterAbyssalDemonTable = new LootTable()
	.every('Abyssal ashes')
	.every('Ensouled abyssal head')
	.every(AbyssalDemonPreTable, 3)
	.tertiary(13, 'Clue scroll (hard)')
	.tertiary(120, 'Clue scroll (elite)')
	.tertiary(6000, 'Abyssal head')

	/* Superior Slayer tertiary */
	.tertiary(99, 'Mist battlestaff')
	.tertiary(99, 'Dust battlestaff')
	.tertiary(346, 'Eternal gem')
	.tertiary(345, 'Imbued heart');

export default new SimpleMonster({
	id: 7410,
	name: 'Greater abyssal demon',
	table: GreaterAbyssalDemonTable,
	aliases: ['greater abyssal demon']
});
