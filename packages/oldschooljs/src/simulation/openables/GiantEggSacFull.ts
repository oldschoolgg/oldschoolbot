import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const GiantEggSacFullTable = new LootTable().every("Red spiders' eggs", 100);

export default new SimpleOpenable({
	id: 23_517,
	name: 'Giant egg sac(full)',
	aliases: ['giant egg sac(full)', 'giant egg sac full'],
	table: GiantEggSacFullTable
});
