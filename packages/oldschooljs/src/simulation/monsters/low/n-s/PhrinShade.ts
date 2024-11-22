import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const PhrinShadeTable = new LootTable().every('Phrin remains');

export default new SimpleMonster({
	id: 1280,
	name: 'Phrin Shade',
	table: PhrinShadeTable,
	aliases: ['phrin shade']
});
