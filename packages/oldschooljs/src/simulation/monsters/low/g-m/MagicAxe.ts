import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const MagicAxeTable = new LootTable().every('Iron battleaxe').tertiary(256, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 2844,
	name: 'Magic axe',
	table: MagicAxeTable,
	aliases: ['magic axe']
});
