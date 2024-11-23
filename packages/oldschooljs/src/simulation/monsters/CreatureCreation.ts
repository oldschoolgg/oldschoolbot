import LootTable from '../../structures/LootTable';
import SimpleMonster from '../../structures/SimpleMonster';

const Newtroost = new SimpleMonster({
	id: 3605,
	name: 'Newtroost',
	table: new LootTable()
		.every('Bones')
		.every('Eye of newt', [4, 10])
		.add(new LootTable({ limit: 20 }).add('Rune satchel', 1, 3).add('Tea flask', 1)),
	aliases: ['newtroost']
});

const Unicow = new SimpleMonster({
	id: 3601,
	name: 'Unicow',
	table: new LootTable()
		.every('Bones')
		.every('Unicorn horn', [2, 4])
		.add(new LootTable({ limit: 20 }).add('Green satchel', 1, 3).add('Tea flask', 1)),
	aliases: ['unicow']
});

const Spidine = new SimpleMonster({
	id: 3602,
	name: 'Spidine',
	table: new LootTable()
		.every('Bones')
		.every("Red spiders' eggs", [3, 6])
		.add(new LootTable({ limit: 20 }).add('Red satchel', 1, 3).add('Tea flask', 1)),
	aliases: ['spidine']
});

const Swordchick = new SimpleMonster({
	id: 3603,
	name: 'Swordchick',
	table: new LootTable()
		.every('Bones')
		.every('Feather', [10, 40])
		.add(new LootTable({ limit: 20 }).add('Black satchel', 1, 3).add('Tea flask', 1)),
	aliases: ['swordchick']
});

const Jubster = new SimpleMonster({
	id: 3604,
	name: 'Jubster',
	table: new LootTable()
		.every('Bones')
		.every('Raw jubbly', [3, 7])
		.add(new LootTable({ limit: 20 }).add('Gold satchel', 1, 3).add('Tea flask', 1)),
	aliases: ['jubster']
});

const Frogeel = new SimpleMonster({
	id: 3600,
	name: 'Frogeel',
	table: new LootTable()
		.every('Bones')
		.every('Raw cave eel', [5, 10])
		.add(new LootTable({ limit: 20 }).add('Plain satchel', 1, 3).add('Tea flask')),
	aliases: ['frogeel']
});

export const CreatureCreation = { Frogeel, Newtroost, Spidine, Swordchick, Unicow, Jubster };
