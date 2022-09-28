import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import BeardedBandit from 'oldschooljs/dist/simulation/monsters/low/a-f/BeardedBandit';
import CaveGoblin from 'oldschooljs/dist/simulation/monsters/low/a-f/CaveGoblin';
import DesertBandit from 'oldschooljs/dist/simulation/monsters/low/a-f/DesertBandit';
import Farmer from 'oldschooljs/dist/simulation/monsters/low/a-f/Farmer';
import FemaleHamMember from 'oldschooljs/dist/simulation/monsters/low/a-f/FemaleHamMember';
import FremennikCitizen from 'oldschooljs/dist/simulation/monsters/low/a-f/FremennikCitizen';
import Gnome from 'oldschooljs/dist/simulation/monsters/low/g-m/Gnome';
import Guard from 'oldschooljs/dist/simulation/monsters/low/g-m/Guard';
import Hero from 'oldschooljs/dist/simulation/monsters/low/g-m/Hero';
import KnightOfArdougne from 'oldschooljs/dist/simulation/monsters/low/g-m/KnightOfArdougne';
import MaleHamMember from 'oldschooljs/dist/simulation/monsters/low/g-m/MaleHamMember';
import MasterFarmer from 'oldschooljs/dist/simulation/monsters/low/g-m/MasterFarmer';
import MenaphiteThug from 'oldschooljs/dist/simulation/monsters/low/g-m/MenaphiteThug';
import Paladin from 'oldschooljs/dist/simulation/monsters/low/n-s/Paladin';
import PollnivnianBandit from 'oldschooljs/dist/simulation/monsters/low/n-s/PollnivnianBandit';
import PrifddinasElf from 'oldschooljs/dist/simulation/monsters/low/n-s/PrifddinasElf';
import Rogue from 'oldschooljs/dist/simulation/monsters/low/n-s/Rogue';
import TzHaarHur from 'oldschooljs/dist/simulation/monsters/low/t-z/TzHaarHur';
import Vyre from 'oldschooljs/dist/simulation/monsters/low/t-z/Vyre';
import WarriorWoman from 'oldschooljs/dist/simulation/monsters/low/t-z/WarriorWoman';
import YanilleWatchman from 'oldschooljs/dist/simulation/monsters/low/t-z/YanilleWatchman';
import LootTable from 'oldschooljs/dist/structures/LootTable';

export interface Stealable {
	name: string;
	type: 'pickpockable' | 'stall';
	aliases?: string[];
	level: number;
	xp: number;
	qpRequired?: number;
	fireCapeRequired?: boolean;
	table: LootTable;
	id: number;
	petChance: number;
	// Stall properties
	respawnTime?: number;
	lootPercent?: number;
	// Pickpocket properties
	stunTime?: number;
	stunDamage?: number;
	slope?: number;
	intercept?: number;
	customTickRate?: number;
}

const stalls: Stealable[] = [
	{
		name: 'Vegetable stall',
		type: 'stall',
		aliases: ['veg stall', 'vegetable', 'veggi stall'],
		level: 2,
		xp: 10,
		id: 4706,
		table: new LootTable().add('Cabbage').add('Potato').add('Onion').add('Tomato').add('Garlic'),
		qpRequired: 3,
		respawnTime: Time.Second * 2,
		lootPercent: 20,
		petChance: 206_777
	},
	{
		name: "Baker's stall",
		type: 'stall',
		aliases: ['baker stall', 'baker', 'bakers stall'],
		level: 5,
		xp: 16,
		id: 4707,
		table: new LootTable().add('Cake').add('Bread').add('Chocolate slice'),
		respawnTime: Time.Second * 2,
		lootPercent: 20,
		petChance: 124_066
	},
	{
		name: 'Tea stall',
		type: 'stall',
		aliases: ['tea', 'tea stall'],
		level: 5,
		xp: 16,
		id: 4708,
		table: new LootTable().add('Cup of tea'),
		respawnTime: Time.Second * 7,
		lootPercent: 35,
		petChance: 68_926
	},
	{
		name: 'Silk stall',
		type: 'stall',
		aliases: ['silk'],
		level: 20,
		xp: 24,
		id: 4709,
		table: new LootTable().add('Silk'),
		respawnTime: Time.Second * 5,
		lootPercent: 30,
		petChance: 68_926
	},
	{
		name: 'Wine stall',
		type: 'stall',
		aliases: ['wine'],
		level: 22,
		xp: 27,
		id: 4710,
		table: new LootTable()
			.add('Bottle of wine')
			.add('Grapes')
			.add('Jug', 1, 3)
			.add('Jug of water')
			.add('Jug of wine'),
		respawnTime: Time.Second * 10,
		lootPercent: 38,
		petChance: 36_490
	},
	{
		name: 'Fruit stall',
		type: 'stall',
		aliases: ['fruit', 'fruits'],
		level: 25,
		xp: 28.5,
		id: 4711,
		table: new LootTable()
			.add('Cooking apple', 1, 40)
			.add('Banana', 1, 20)
			.add('Jangerberries', 1, 7)
			.add('Lemon', 1, 5)
			.add('Redberries', 1, 5)
			.add('Pineapple', 1, 5)
			.add('Lime', 1, 5)
			.add('Strawberry', 1, 5)
			.add('Strange fruit', 1, 5)
			.add('Golovanova fruit top', 1, 2)
			.add('Papaya fruit', 1, 1),
		respawnTime: Time.Second * 2.6,
		lootPercent: 25,
		petChance: 124_066
	},
	{
		name: 'Fur stall',
		type: 'stall',
		aliases: ['fur', 'furs'],
		level: 35,
		xp: 36,
		id: 4712,
		table: new LootTable().every('Grey wolf fur'),
		respawnTime: Time.Second * 10,
		lootPercent: 80,
		petChance: 36_490
	},
	{
		name: 'Fish stall',
		type: 'stall',
		aliases: ['fish', 'fishy'],
		level: 42,
		xp: 42,
		id: 4713,
		table: new LootTable().add('Raw salmon').add('Raw tuna').add('Raw lobster'),
		respawnTime: Time.Second * 10,
		lootPercent: 75,
		petChance: 36_490
	},
	{
		name: 'Silver stall',
		type: 'stall',
		aliases: ['silver'],
		level: 50,
		xp: 54,
		id: 4714,
		table: new LootTable().every('Silver ore'),
		respawnTime: Time.Second * 16,
		lootPercent: 80,
		petChance: 36_490
	},
	{
		name: 'Gem stall',
		type: 'stall',
		aliases: ['gem', 'gems'],
		level: 75,
		xp: 160,
		id: 4715,
		table: new LootTable()
			.add('Uncut sapphire', 1, 105)
			.add('Uncut emerald', 1, 17)
			.add('Uncut ruby', 1, 5)
			.add('Uncut diamond'),
		// World hopping rate
		respawnTime: Time.Second * 10,
		lootPercent: 100,
		petChance: 36_490
	},
	{
		name: 'Ore stall',
		type: 'stall',
		aliases: ['ore', 'ores'],
		level: 82,
		xp: 180,
		id: 4716,
		table: new LootTable()
			.add('Iron ore', 1, 37)
			.add('Silver ore', 1, 16)
			.add('Coal', 1, 22)
			.add('Gold ore', 1, 18)
			.add('Mithril ore', 1, 18)
			.add('Adamantite ore', 1, 15)
			.add('Runite ore', 1, 2),
		// World hopping rate
		respawnTime: Time.Second * 15,
		lootPercent: 100,
		fireCapeRequired: true,
		petChance: 36_490
	}
];

const pickpocketables: Stealable[] = [
	{
		name: 'Man',
		type: 'pickpockable',
		level: 1,
		xp: 8,
		table: Monsters.Man.pickpocketTable!,
		id: Monsters.Man.id,
		stunTime: 5,
		stunDamage: 1,
		slope: 0.239_18,
		intercept: 70.461_18,
		petChance: 257_211
	},
	{
		name: 'Woman',
		type: 'pickpockable',
		level: 1,
		xp: 8,
		table: Monsters.Woman.pickpocketTable!,
		id: Monsters.Woman.id,
		stunTime: 5,
		stunDamage: 1,
		slope: 0.239_18,
		intercept: 70.461_18,
		petChance: 257_211
	},
	{
		name: 'Farmer',
		type: 'pickpockable',
		level: 10,
		xp: 14.5,
		table: Farmer.pickpocketTable!,
		id: Farmer.id,
		stunTime: 5,
		stunDamage: 1,
		// No current data on slope/intercept
		slope: 0.239_18,
		intercept: 70.461_18,
		petChance: 257_211
	},
	{
		name: 'Female H.A.M. member',
		type: 'pickpockable',
		level: 15,
		xp: 18.5,
		aliases: ['female ham'],
		table: FemaleHamMember.pickpocketTable!,
		id: FemaleHamMember.id,
		stunTime: 4,
		stunDamage: 2,
		slope: 0.418_47,
		intercept: 52.711_47,
		petChance: 257_211
	},
	{
		name: 'Male H.A.M. member',
		type: 'pickpockable',
		level: 20,
		xp: 22.5,
		aliases: ['ham', 'male ham'],
		table: MaleHamMember.pickpocketTable!,
		id: MaleHamMember.id,
		stunTime: 4,
		stunDamage: 2,
		slope: 0.490_31,
		intercept: 45.599_31,
		petChance: 257_211
	},
	{
		name: 'Warrior woman',
		type: 'pickpockable',
		level: 25,
		xp: 26,
		table: WarriorWoman.pickpocketTable!,
		id: WarriorWoman.id,
		stunTime: 5,
		stunDamage: 2,
		// No current data on slope/intercept
		slope: 0.530_31,
		intercept: 43.599_31,
		petChance: 257_211
	},
	{
		name: 'Rogue',
		type: 'pickpockable',
		level: 32,
		xp: 35.5,
		table: Rogue.pickpocketTable!,
		id: Rogue.id,
		stunTime: 5,
		stunDamage: 2,
		slope: 0.668_79,
		intercept: 27.929_79,
		petChance: 257_211
	},
	{
		name: 'Cave goblin',
		type: 'pickpockable',
		level: 36,
		xp: 40,
		aliases: ['goblin'],
		table: CaveGoblin.pickpocketTable!,
		id: CaveGoblin.id,
		stunTime: 5,
		stunDamage: 1,
		// No current data on slope/intercept
		slope: 0.668_79,
		intercept: 27.929_79,
		petChance: 257_211
	},
	{
		name: 'Master Farmer',
		type: 'pickpockable',
		level: 38,
		xp: 43,
		aliases: ['mf', 'master'],
		table: MasterFarmer.pickpocketTable!,
		id: MasterFarmer.id,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.597_86,
		intercept: 34.951_86,
		petChance: 257_211
	},
	{
		name: 'Guard',
		type: 'pickpockable',
		level: 40,
		xp: 46.8,
		table: Guard.pickpocketTable!,
		id: Guard.id,
		stunTime: 5,
		stunDamage: 2,
		slope: 0.767_76,
		intercept: 18.131_76,
		petChance: 257_211
	},
	{
		name: 'Fremennik Citizen',
		type: 'pickpockable',
		level: 45,
		xp: 65,
		aliases: ['fremmy', 'fremennik'],
		table: FremennikCitizen.pickpocketTable!,
		id: FremennikCitizen.id,
		stunTime: 5,
		stunDamage: 2,
		// No current data on slope/intercept
		slope: 0.767_76,
		intercept: 18.131_76,
		petChance: 257_211
	},
	{
		name: 'Bearded Pollnivnian Bandit',
		type: 'pickpockable',
		level: 45,
		xp: 65,
		aliases: ['bearded bandit', 'beard', 'beard bandit'],
		table: BeardedBandit.pickpocketTable!,
		id: BeardedBandit.id,
		stunTime: 5,
		stunDamage: 3,
		// No current data on slope/intercept
		slope: 0.767_76,
		intercept: 18.131_76,
		customTickRate: 2.5,
		petChance: 257_211
	},
	{
		name: 'Desert Bandit',
		type: 'pickpockable',
		level: 53,
		xp: 79.5,
		aliases: ['desert'],
		table: DesertBandit.pickpocketTable!,
		id: 33_322,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.757_35,
		intercept: 19.162_35,
		petChance: 257_211
	},
	{
		name: 'Knight of Ardougne',
		type: 'pickpockable',
		level: 55,
		xp: 84.3,
		aliases: ['knight', 'ardy knight'],
		table: KnightOfArdougne.pickpocketTable!,
		id: KnightOfArdougne.id,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.772_09,
		intercept: 17.703_09,
		petChance: 257_211
	},
	{
		name: 'Pollnivnian Bandit',
		type: 'pickpockable',
		level: 55,
		xp: 84.3,
		table: PollnivnianBandit.pickpocketTable!,
		id: PollnivnianBandit.id,
		stunTime: 5,
		stunDamage: 5,
		// No current data on slope/intercept
		slope: 0.772_09,
		intercept: 17.703_09,
		customTickRate: 2.5,
		petChance: 257_211
	},
	{
		name: 'Yanille Watchman',
		type: 'pickpockable',
		level: 65,
		xp: 137.5,
		aliases: ['yanille'],
		table: YanilleWatchman.pickpocketTable!,
		id: YanilleWatchman.id,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.58,
		intercept: 5.47,
		petChance: 134_625
	},
	{
		name: 'Menaphite Thug',
		type: 'pickpockable',
		level: 65,
		xp: 137.5,
		aliases: ['thug'],
		table: MenaphiteThug.pickpocketTable!,
		id: MenaphiteThug.id,
		stunTime: 5,
		stunDamage: 5,
		slope: 0.654_85,
		intercept: 29.309_85,
		customTickRate: 2.5,
		petChance: 257_211
	},
	{
		name: 'Paladin',
		type: 'pickpockable',
		level: 70,
		xp: 151.7,
		table: Paladin.pickpocketTable!,
		id: Paladin.id,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.404_29,
		intercept: 18.955_29,
		petChance: 127_056
	},
	{
		name: 'Gnome',
		type: 'pickpockable',
		level: 75,
		xp: 198.5,
		table: Gnome.pickpocketTable!,
		id: Gnome.id,
		stunTime: 5,
		stunDamage: 1,
		slope: 0.475_65,
		intercept: 0.180_65,
		petChance: 108_718
	},
	{
		name: 'Hero',
		type: 'pickpockable',
		level: 80,
		xp: 275,
		table: Hero.pickpocketTable!,
		id: Hero.id,
		stunTime: 6,
		stunDamage: 4,
		slope: 0.390_56,
		intercept: 0.784_56,
		petChance: 99_175
	},
	{
		name: 'Vyre',
		type: 'pickpockable',
		level: 82,
		xp: 306.9,
		table: Vyre.pickpocketTable!,
		id: Vyre.id,
		stunTime: 5,
		stunDamage: 5,
		slope: 0.488_13,
		intercept: 2.065_13,
		petChance: 99_175
	},
	{
		name: 'Elf',
		type: 'pickpockable',
		level: 85,
		xp: 353,
		table: PrifddinasElf.pickpocketTable!,
		id: PrifddinasElf.id,
		stunTime: 6,
		stunDamage: 5,
		slope: 0.420_77,
		intercept: -2.206_23,
		qpRequired: 200,
		petChance: 99_175
	},
	{
		name: 'TzHaar-Hur',
		type: 'pickpockable',
		level: 90,
		xp: 103.4,
		aliases: ['tzhaar'],
		table: TzHaarHur.pickpocketTable!,
		id: TzHaarHur.id,
		stunTime: 5,
		stunDamage: 4,
		slope: 1.611_25,
		intercept: -80.993_75,
		fireCapeRequired: true,
		petChance: 176_743
	}
];

export const stealables: Stealable[] = [...stalls, ...pickpocketables];

for (const entity of stealables) {
	if (!entity.table) {
		console.error(`Warning! No table for ${entity.name}.`);
	}
}
