import LootTable from 'oldschooljs/dist/structures/LootTable';

const MuddyChestTable = new LootTable()
	.every('Uncut ruby')
	.every('Mithril bar')
	.every('Mithril dagger')
	.every('Anchovy pizza')
	.every('Law rune', 2)
	.every('Death rune', 2)
	.every('Chaos rune', 10);

export default MuddyChestTable;
