import LootTable from 'oldschooljs/dist/structures/LootTable';

import { ItemBank } from '../../../../types';

interface Pickpocketable {
	name: string;
	level: number;
	xp: number;
	qpRequired?: number;
	itemsRequired?: ItemBank;
	table?: LootTable;
}

const HamTable = new LootTable()
	.add('Bronze arrow', [1, 13], 3)
	.add('Bronze axe', 1, 3)
	.add('Bronze dagger', 1, 3)
	.add('Bronze pickaxe', 1, 3)
	.add('Iron axe', 1, 3)
	.add('Iron dagger', 1, 3)
	.add('Iron pickaxe', 1, 3)
	.add('Leather body', 1, 3)
	.add('Steel arrow', [1, 13], 2)
	.add('Steel axe', 1, 2)
	.add('Steel dagger', 1, 2)
	.add('Steel pickaxe', 1, 2)
	.add('Ham boots', 1, 1)
	.add('Ham cloak', 1, 1)
	.add('Ham gloves', 1, 1)
	.add('Ham hood', 1, 1)
	.add('Ham logo', 1, 1)
	.add('Ham robe', 1, 1)
	.add('Ham shirt', 1, 1);

const Pickpocketables: Pickpocketable[] = [
	{
		name: 'Man',
		level: 1,
		xp: 8,
		table: new LootTable().add('Coins', 3)
	},
	{
		name: 'Woman',
		level: 1,
		xp: 8,
		table: new LootTable().add('Coins', 3)
	},
	{
		name: 'Female H.A.M. member',
		level: 1,
		xp: 8,
		table: HamTable
	},
	{
		name: 'Male H.A.M. member',
		level: 1,
		xp: 8,
		table: HamTable
	},
	{
		name: 'Warrior woman',
		level: 1,
		xp: 8
	},
	{
		name: 'Al-Kharid warrior',
		level: 1,
		xp: 8
	},
	{
		name: 'Rogue',
		level: 1,
		xp: 8
	},
	{
		name: 'Cave goblin',
		level: 1,
		xp: 8
	},
	{
		name: 'Master Farmer',
		level: 1,
		xp: 8
	},
	{
		name: 'Guard',
		level: 1,
		xp: 8
	},
	{
		name: 'Fremennik Citizen',
		level: 1,
		xp: 8
	},
	{
		name: 'Bearded Pollnivnian Bandit',
		level: 1,
		xp: 8
	},
	{
		name: 'Desert Bandit',
		level: 1,
		xp: 8
	},
	{
		name: 'Knight of Ardougne',
		level: 1,
		xp: 8
	},
	{
		name: 'Pollnivian Bandit',
		level: 1,
		xp: 8
	},
	{
		name: 'Yanille Watchman',
		level: 1,
		xp: 8
	},
	{
		name: 'Menaphite Thug',
		level: 1,
		xp: 8
	},
	{
		name: 'Paladin',
		level: 1,
		xp: 8
	},
	{
		name: 'Gnome',
		level: 1,
		xp: 8
	},
	{
		name: 'Hero',
		level: 1,
		xp: 8
	},
	{
		name: 'Vyre',
		level: 1,
		xp: 8
	},
	{
		name: 'Elf',
		level: 1,
		xp: 8
	},
	{
		name: 'TzHaar-Hur',
		level: 1,
		xp: 8
	}
];

export default Pickpocketables;
