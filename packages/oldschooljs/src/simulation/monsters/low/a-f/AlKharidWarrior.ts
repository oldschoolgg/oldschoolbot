import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export default new SimpleMonster({
	id: 3292,
	name: 'Al-Kharid warrior',
	pickpocketTable: new LootTable().add('Coins', 18).tertiary(257_211, 'Rocky'),
	aliases: ['al-kharid warrior', 'alkharid warrior']
});
