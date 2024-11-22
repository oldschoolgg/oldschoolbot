import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

//const rareLootTable = new LootTable()
//.add("Blighted manta ray", 25, 1)
//.add("Blighted karambwan", 25, 1)
//.add("Blighted manta ray", 25, 1)
//.add("Blighted ancient ice sack", 25, 1)
//.add("Blighted anglerfish", 15, 1)
//.add("Blighted super restore(4)", 3, 1)
//.add("Larran's key", 1, 1)

const MuddyChestTable = new LootTable()
	.every('Uncut ruby')
	.every('Mithril bar', 2)
	.every('Law rune', 5)
	.every('Death rune', 5)
	.every('Chaos rune', 15);

//Add when rates are known
//.oneIn(10, rareLootTable);

export default new SimpleOpenable({
	id: 991,
	name: 'Muddy chest',
	aliases: ['muddy chest', 'muddy'],
	table: MuddyChestTable
});
