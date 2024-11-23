import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const PorazdirTable = new LootTable().every("Demon's heart");

export default new SimpleMonster({
	id: 7860,
	name: 'Porazdir',
	table: PorazdirTable,
	aliases: ['porazdir']
});
