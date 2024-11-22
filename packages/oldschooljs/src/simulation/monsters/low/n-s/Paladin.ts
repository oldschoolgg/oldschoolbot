import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const PaladinTable = new LootTable().every('Coins', 80).every('Chaos rune', 2).tertiary(127_056, 'Rocky');

export default new SimpleMonster({
	id: 1144,
	name: 'Paladin',
	pickpocketTable: PaladinTable,
	aliases: ['paladin']
});
