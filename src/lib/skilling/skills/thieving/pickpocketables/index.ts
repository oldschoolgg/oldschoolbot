import { Monsters } from 'oldschooljs';
import CaveGoblin from 'oldschooljs/dist/simulation/monsters/low/CaveGoblin';
import DesertBandit from 'oldschooljs/dist/simulation/monsters/low/DesertBandit';
import Elf from 'oldschooljs/dist/simulation/monsters/low/Elf';
import Farmer from 'oldschooljs/dist/simulation/monsters/low/Farmer';
import FremennikCitizen from 'oldschooljs/dist/simulation/monsters/low/FremennikCitizen';
import Gnome from 'oldschooljs/dist/simulation/monsters/low/Gnome';
import Guard from 'oldschooljs/dist/simulation/monsters/low/Guard';
import HamMember from 'oldschooljs/dist/simulation/monsters/low/HamMember';
import Hero from 'oldschooljs/dist/simulation/monsters/low/Hero';
import KnightOfArdougne from 'oldschooljs/dist/simulation/monsters/low/KnightOfArdougne';
import MasterFarmer from 'oldschooljs/dist/simulation/monsters/low/MasterFarmer';
import MenaphiteThug from 'oldschooljs/dist/simulation/monsters/low/MenaphiteThug';
import Paladin from 'oldschooljs/dist/simulation/monsters/low/Paladin';
import PollnivnianBandit from 'oldschooljs/dist/simulation/monsters/low/PollnivnianBandit';
import Rogue from 'oldschooljs/dist/simulation/monsters/low/Rogue';
import TzHaarHur from 'oldschooljs/dist/simulation/monsters/low/TzHaarHur';
import Vyre from 'oldschooljs/dist/simulation/monsters/low/Vyre';
import WarriorWoman from 'oldschooljs/dist/simulation/monsters/low/WarriorWoman';
import YanilleWatchman from 'oldschooljs/dist/simulation/monsters/low/YanilleWatchman';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { ItemBank } from '../../../../types';

export interface Pickpocketable {
	name: string;
	level: number;
	xp: number;
	qpRequired?: number;
	itemsRequired?: ItemBank;
	table: LootTable;
	id: number;
}

const Pickpocketables: Pickpocketable[] = [
	{
		name: 'Man',
		level: 1,
		xp: 8,
		table: Monsters.Man.pickpocketTable!,
		id: Monsters.Man.id
	},
	{
		name: 'Woman',
		level: 1,
		xp: 8,
		table: Monsters.Woman.pickpocketTable!,
		id: Monsters.Woman.id
	},
	{
		name: 'Farmer',
		level: 10,
		xp: 14.5,
		table: Farmer.pickpocketTable!,
		id: Farmer.id
	},
	{
		name: 'Female H.A.M. member',
		level: 15,
		xp: 18.5,
		table: HamMember.pickpocketTable!,
		id: HamMember.id
	},
	{
		name: 'Male H.A.M. member',
		level: 20,
		xp: 22.5,
		table: HamMember.pickpocketTable!,
		id: HamMember.id
	},
	{
		name: 'Warrior woman',
		level: 25,
		xp: 26,
		table: WarriorWoman.pickpocketTable!,
		id: WarriorWoman.id
	},
	{
		name: 'Rogue',
		level: 32,
		xp: 35.5,
		table: Rogue.pickpocketTable!,
		id: Rogue.id
	},
	{
		name: 'Cave goblin',
		level: 36,
		xp: 40,
		table: CaveGoblin.pickpocketTable!,
		id: CaveGoblin.id
	},
	{
		name: 'Master Farmer',
		level: 38,
		xp: 43,
		table: MasterFarmer.pickpocketTable!,
		id: MasterFarmer.id
	},
	{
		name: 'Guard',
		level: 40,
		xp: 46.8,
		table: Guard.pickpocketTable!,
		id: Guard.id
	},
	{
		name: 'Fremennik Citizen',
		level: 45,
		xp: 65,
		table: FremennikCitizen.pickpocketTable!,
		id: FremennikCitizen.id
	},
	{
		name: 'Desert Bandit',
		level: 53,
		xp: 79.5,
		table: DesertBandit.pickpocketTable!,
		id: DesertBandit.id
	},
	{
		name: 'Knight of Ardougne',
		level: 55,
		xp: 84.3,
		table: KnightOfArdougne.pickpocketTable!,
		id: KnightOfArdougne.id
	},
	{
		name: 'Pollnivian Bandit',
		level: 55,
		xp: 84.3,
		table: PollnivnianBandit.pickpocketTable!,
		id: PollnivnianBandit.id
	},
	{
		name: 'Yanille Watchman',
		level: 65,
		xp: 137.5,
		table: YanilleWatchman.pickpocketTable!,
		id: YanilleWatchman.id
	},
	{
		name: 'Menaphite Thug',
		level: 65,
		xp: 137.5,
		table: MenaphiteThug.pickpocketTable!,
		id: MenaphiteThug.id
	},
	{
		name: 'Paladin',
		level: 70,
		xp: 151.7,
		table: Paladin.pickpocketTable!,
		id: Paladin.id
	},
	{
		name: 'Gnome',
		level: 75,
		xp: 198.5,
		table: Gnome.pickpocketTable!,
		id: Gnome.id
	},
	{
		name: 'Hero',
		level: 80,
		xp: 275,
		table: Hero.pickpocketTable!,
		id: Hero.id
	},
	{
		name: 'Vyre',
		level: 82,
		xp: 306.9,
		table: Vyre.pickpocketTable!,
		id: Vyre.id
	},
	{
		name: 'Elf',
		level: 85,
		xp: 353,
		table: Elf.pickpocketTable!,
		id: Elf.id
	},
	{
		name: 'TzHaar-Hur',
		level: 90,
		xp: 103.4,
		table: TzHaarHur.pickpocketTable!,
		id: TzHaarHur.id
	}
];

for (const npc of Pickpocketables) {
	if (!npc.table) {
		console.error(`Warning! No pickpocket table for ${npc.name}.`);
	}
}

export default Pickpocketables;
