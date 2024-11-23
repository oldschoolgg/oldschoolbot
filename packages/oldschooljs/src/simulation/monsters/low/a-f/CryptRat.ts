import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const CryptRatTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1679,
	name: 'Crypt rat',
	table: CryptRatTable,
	aliases: ['crypt rat']
});
