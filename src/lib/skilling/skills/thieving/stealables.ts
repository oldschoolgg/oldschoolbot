import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import CaveGoblin from 'oldschooljs/dist/simulation/monsters/low/CaveGoblin';
import DesertBandit from 'oldschooljs/dist/simulation/monsters/low/DesertBandit';
import Farmer from 'oldschooljs/dist/simulation/monsters/low/Farmer';
import FemaleHamMember from 'oldschooljs/dist/simulation/monsters/low/FemaleHamMember';
import FremennikCitizen from 'oldschooljs/dist/simulation/monsters/low/FremennikCitizen';
import Gnome from 'oldschooljs/dist/simulation/monsters/low/Gnome';
import Guard from 'oldschooljs/dist/simulation/monsters/low/Guard';
import Hero from 'oldschooljs/dist/simulation/monsters/low/Hero';
import KnightOfArdougne from 'oldschooljs/dist/simulation/monsters/low/KnightOfArdougne';
import MaleHamMember from 'oldschooljs/dist/simulation/monsters/low/MaleHamMember';
import MasterFarmer from 'oldschooljs/dist/simulation/monsters/low/MasterFarmer';
import MenaphiteThug from 'oldschooljs/dist/simulation/monsters/low/MenaphiteThug';
import Paladin from 'oldschooljs/dist/simulation/monsters/low/Paladin';
import PollnivnianBandit from 'oldschooljs/dist/simulation/monsters/low/PollnivnianBandit';
import PrifddinasElf from 'oldschooljs/dist/simulation/monsters/low/PrifddinasElf';
import Rogue from 'oldschooljs/dist/simulation/monsters/low/Rogue';
import TzHaarHur from 'oldschooljs/dist/simulation/monsters/low/TzHaarHur';
import Vyre from 'oldschooljs/dist/simulation/monsters/low/Vyre';
import WarriorWoman from 'oldschooljs/dist/simulation/monsters/low/WarriorWoman';
import YanilleWatchman from 'oldschooljs/dist/simulation/monsters/low/YanilleWatchman';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { ItemBank } from '../../../types';

export interface Stealable {
	name: string;
	level: number;
	xp: number;
	qpRequired?: number;
	itemsRequired?: ItemBank;
	table: LootTable;
	id: number;
}

export interface Stall extends Stealable {
	respawnTime: number;
}

export interface Pickpockable extends Stealable {
	stunTime: number;
	stunDamage: number;
	slope: number;
	intercept: number;
	customTickRate?: number;
	itemsRequired?: ItemBank;
}

export const Stalls: Stall[] = [
	{
		name: 'Vegetable stall',
		level: 2,
		xp: 10,
		id: 4706,
		table: new LootTable()
			.add('Cabbage')
			.add('Potato')
			.add('Onion')
			.add('Tomato')
			.add('Garlic')
			.tertiary(206_777, 'Rocky'),
		qpRequired: 3,
		respawnTime: Time.Second * 2
	},
	{
		name: "Baker's stall",
		level: 5,
		xp: 16,
		id: 4707,
		table: new LootTable()
			.add('Cake')
			.add('Bread')
			.add('Chocolate slice')
			.tertiary(124_066, 'Rocky'),
		respawnTime: Time.Second * 2
	},
	{
		name: 'Tea stall',
		level: 5,
		xp: 16,
		id: 4708,
		table: new LootTable().add('Cup of tea').tertiary(68_926, 'Rocky'),
		respawnTime: Time.Second * 7
	},
	{
		name: 'Silk stall',
		level: 20,
		xp: 24,
		id: 4709,
		table: new LootTable().add('Silk').tertiary(68_926, 'Rocky'),
		respawnTime: Time.Second * 5
	},
	{
		name: 'Wine stall',
		level: 22,
		xp: 27,
		id: 4710,
		table: new LootTable()
			.add('Bottle of wine')
			.add('Grapes')
			.add('Jug', 1, 3)
			.add('Jug of water')
			.add('Jug of wine')
			.tertiary(36_490, 'Rocky'),
		respawnTime: Time.Second * 10
	},
	{
		name: 'Fruit stall',
		level: 25,
		xp: 28.2,
		id: 4711,
		table: new LootTable()
			.add('Cooking apple', 1, 40)
			.add('Banana', 1, 20)
			.add('Jangerberries', 1, 7)
			.add('Lemon', 1, 5)
			.add('Redberries', 1, 5)
			.add('Lime', 1, 5)
			.add('Strawberry', 1, 5)
			.add('Strange fruit', 1, 5)
			.add('Golovanova fruit top', 1, 2)
			.add('Papaya fruit', 1, 1)
			.tertiary(124_066, 'Rocky'),
		respawnTime: Time.Second * 2
	},
	{
		name: 'Ore stall',
		level: 82,
		xp: 180,
		id: 4712,
		table: new LootTable()
			.add('Iron ore', 1, 37)
			.add('Silver ore', 1, 16)
			.add('Coal', 1, 22)
			.add('Gold ore', 1, 18)
			.add('Mithril ore', 1, 18)
			.add('Adamantite ore', 1, 15)
			.add('Runite ore', 1, 2)
			.tertiary(36_490, 'Rocky'),
		respawnTime: Time.Second * 60
	}
];

export const Pickpocketables: Pickpockable[] = [
	{
		name: 'Man',
		level: 1,
		xp: 8,
		table: Monsters.Man.pickpocketTable!,
		id: Monsters.Man.id,
		stunTime: 5,
		stunDamage: 1,
		slope: 0.23918,
		intercept: 70.46118
	},
	{
		name: 'Woman',
		level: 1,
		xp: 8,
		table: Monsters.Woman.pickpocketTable!,
		id: Monsters.Woman.id,
		stunTime: 5,
		stunDamage: 1,
		slope: 0.23918,
		intercept: 70.46118
	},
	{
		name: 'Farmer',
		level: 10,
		xp: 14.5,
		table: Farmer.pickpocketTable!,
		id: Farmer.id,
		stunTime: 5,
		stunDamage: 1,
		// No current data on slope/intercept
		slope: 0.23918,
		intercept: 70.46118
	},
	{
		name: 'Female H.A.M. member',
		level: 15,
		xp: 18.5,
		table: FemaleHamMember.pickpocketTable!,
		id: FemaleHamMember.id,
		stunTime: 4,
		stunDamage: 2,
		slope: 0.41847,
		intercept: 52.71147
	},
	{
		name: 'Male H.A.M. member',
		level: 20,
		xp: 22.5,
		table: MaleHamMember.pickpocketTable!,
		id: MaleHamMember.id,
		stunTime: 4,
		stunDamage: 2,
		slope: 0.49031,
		intercept: 45.59931
	},
	{
		name: 'Warrior woman',
		level: 25,
		xp: 26,
		table: WarriorWoman.pickpocketTable!,
		id: WarriorWoman.id,
		stunTime: 5,
		stunDamage: 2,
		// No current data on slope/intercept
		slope: 0.53031,
		intercept: 43.59931
	},
	{
		name: 'Rogue',
		level: 32,
		xp: 35.5,
		table: Rogue.pickpocketTable!,
		id: Rogue.id,
		stunTime: 5,
		stunDamage: 2,
		slope: 0.66879,
		intercept: 27.92979
	},
	{
		name: 'Cave goblin',
		level: 36,
		xp: 40,
		table: CaveGoblin.pickpocketTable!,
		id: CaveGoblin.id,
		stunTime: 5,
		stunDamage: 1,
		// No current data on slope/intercept
		slope: 0.66879,
		intercept: 27.92979
	},
	{
		name: 'Master Farmer',
		level: 38,
		xp: 43,
		table: MasterFarmer.pickpocketTable!,
		id: MasterFarmer.id,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.59786,
		intercept: 34.95186
	},
	{
		name: 'Guard',
		level: 40,
		xp: 46.8,
		table: Guard.pickpocketTable!,
		id: Guard.id,
		stunTime: 5,
		stunDamage: 2,
		slope: 0.76776,
		intercept: 18.13176
	},
	{
		name: 'Fremennik Citizen',
		level: 45,
		xp: 65,
		table: FremennikCitizen.pickpocketTable!,
		id: FremennikCitizen.id,
		stunTime: 5,
		stunDamage: 2,
		// No current data on slope/intercept
		slope: 0.76776,
		intercept: 18.13176
	},
	{
		name: 'Desert Bandit',
		level: 53,
		xp: 79.5,
		table: DesertBandit.pickpocketTable!,
		id: 33322,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.75735,
		intercept: 19.16235
	},
	{
		name: 'Knight of Ardougne',
		level: 55,
		xp: 84.3,
		table: KnightOfArdougne.pickpocketTable!,
		id: KnightOfArdougne.id,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.77209,
		intercept: 17.70309
	},
	{
		name: 'Pollnivian Bandit',
		level: 55,
		xp: 84.3,
		table: PollnivnianBandit.pickpocketTable!,
		id: PollnivnianBandit.id,
		stunTime: 5,
		stunDamage: 5,
		// No current data on slope/intercept
		slope: 0.77209,
		intercept: 17.70309,
		customTickRate: 2.4
	},
	{
		name: 'Yanille Watchman',
		level: 65,
		xp: 137.5,
		table: YanilleWatchman.pickpocketTable!,
		id: YanilleWatchman.id,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.58,
		intercept: 5.47
	},
	{
		name: 'Menaphite Thug',
		level: 65,
		xp: 137.5,
		table: MenaphiteThug.pickpocketTable!,
		id: MenaphiteThug.id,
		stunTime: 5,
		stunDamage: 5,
		slope: 0.65485,
		intercept: 29.30985,
		customTickRate: 2.4
	},
	{
		name: 'Paladin',
		level: 70,
		xp: 151.7,
		table: Paladin.pickpocketTable!,
		id: Paladin.id,
		stunTime: 5,
		stunDamage: 3,
		slope: 0.40429,
		intercept: 18.95529
	},
	{
		name: 'Gnome',
		level: 75,
		xp: 198.5,
		table: Gnome.pickpocketTable!,
		id: Gnome.id,
		stunTime: 5,
		stunDamage: 1,
		slope: 0.47565,
		intercept: 0.18065
	},
	{
		name: 'Hero',
		level: 80,
		xp: 275,
		table: Hero.pickpocketTable!,
		id: Hero.id,
		stunTime: 6,
		stunDamage: 4,
		slope: 0.39056,
		intercept: 0.78456
	},
	{
		name: 'Vyre',
		level: 82,
		xp: 306.9,
		table: Vyre.pickpocketTable!,
		id: Vyre.id,
		stunTime: 5,
		stunDamage: 5,
		slope: 0.48813,
		intercept: 2.06513
	},
	{
		name: 'Elf',
		level: 85,
		xp: 353,
		table: PrifddinasElf.pickpocketTable!,
		id: PrifddinasElf.id,
		stunTime: 6,
		stunDamage: 5,
		slope: 0.42077,
		intercept: -2.20623,
		qpRequired: 200
	},
	{
		name: 'TzHaar-Hur',
		level: 90,
		xp: 103.4,
		table: TzHaarHur.pickpocketTable!,
		id: TzHaarHur.id,
		stunTime: 5,
		stunDamage: 4,
		slope: 1.61125,
		intercept: -80.99375,
		itemsRequired: resolveNameBank({
			'Fire cape': 1
		})
	}
];

for (const entity of Pickpocketables) {
	if (!entity.table) {
		console.error(`Warning! No table for ${entity.name}.`);
	}
}
