import { Monsters } from 'oldschooljs';
import AlKharidWarrior from 'oldschooljs/dist/simulation/monsters/low/AlKharidWarrior';
import CaveGoblin from 'oldschooljs/dist/simulation/monsters/low/CaveGoblin';
import DesertBandit from 'oldschooljs/dist/simulation/monsters/low/DesertBandit';
import Elf from 'oldschooljs/dist/simulation/monsters/low/Elf';
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
	ticksPerPick: number;
	id: number;
}

const Pickpocketables: Pickpocketable[] = [
	{
		name: 'Man',
		level: 1,
		xp: 8,
		table: Monsters.Man.pickpocketTable!,
		ticksPerPick: 1,
		id: Monsters.Man.id
	},
	{
		name: 'Woman',
		level: 1,
		xp: 8,
		table: Monsters.Woman.pickpocketTable!,
		ticksPerPick: 1,
		id: Monsters.Woman.id
	},
	{
		name: 'Female H.A.M. member',
		level: 1,
		xp: 8,
		table: HamMember.pickpocketTable!,
		ticksPerPick: 1,
		id: HamMember.id
	},
	{
		name: 'Male H.A.M. member',
		level: 1,
		xp: 8,
		table: HamMember.pickpocketTable!,
		ticksPerPick: 1,
		id: HamMember.id
	},
	{
		name: 'Warrior woman',
		level: 1,
		xp: 8,
		table: WarriorWoman.pickpocketTable!,
		ticksPerPick: 1,
		id: WarriorWoman.id
	},
	{
		name: 'Al-Kharid warrior',
		level: 1,
		xp: 8,
		table: AlKharidWarrior.pickpocketTable!,
		ticksPerPick: 1,
		id: AlKharidWarrior.id
	},
	{
		name: 'Rogue',
		level: 1,
		xp: 8,
		table: Rogue.pickpocketTable!,
		ticksPerPick: 1,
		id: Rogue.id
	},
	{
		name: 'Cave goblin',
		level: 1,
		xp: 8,
		table: CaveGoblin.pickpocketTable!,
		ticksPerPick: 1,
		id: CaveGoblin.id
	},
	{
		name: 'Master Farmer',
		level: 1,
		xp: 8,
		table: MasterFarmer.pickpocketTable!,
		ticksPerPick: 1,
		id: MasterFarmer.id
	},
	{
		name: 'Guard',
		level: 1,
		xp: 8,
		table: Guard.pickpocketTable!,
		ticksPerPick: 1,
		id: Guard.id
	},
	{
		name: 'Fremennik Citizen',
		level: 1,
		xp: 8,
		table: FremennikCitizen.pickpocketTable!,
		ticksPerPick: 1,
		id: FremennikCitizen.id
	},
	{
		name: 'Desert Bandit',
		level: 1,
		xp: 8,
		table: DesertBandit.pickpocketTable!,
		ticksPerPick: 1,
		id: DesertBandit.id
	},
	{
		name: 'Knight of Ardougne',
		level: 1,
		xp: 8,
		table: KnightOfArdougne.pickpocketTable!,
		ticksPerPick: 1,
		id: KnightOfArdougne.id
	},
	{
		name: 'Pollnivian Bandit',
		level: 1,
		xp: 8,
		table: PollnivnianBandit.pickpocketTable!,
		ticksPerPick: 1,
		id: PollnivnianBandit.id
	},
	{
		name: 'Yanille Watchman',
		level: 1,
		xp: 8,
		table: YanilleWatchman.pickpocketTable!,
		ticksPerPick: 1,
		id: YanilleWatchman.id
	},
	{
		name: 'Menaphite Thug',
		level: 1,
		xp: 8,
		table: MenaphiteThug.pickpocketTable!,
		ticksPerPick: 1,
		id: MenaphiteThug.id
	},
	{
		name: 'Paladin',
		level: 1,
		xp: 8,
		table: Paladin.pickpocketTable!,
		ticksPerPick: 1,
		id: Paladin.id
	},
	{
		name: 'Gnome',
		level: 1,
		xp: 8,
		table: Gnome.pickpocketTable!,
		ticksPerPick: 1,
		id: Gnome.id
	},
	{
		name: 'Hero',
		level: 1,
		xp: 8,
		table: Hero.pickpocketTable!,
		ticksPerPick: 1,
		id: Hero.id
	},
	{
		name: 'Vyre',
		level: 1,
		xp: 8,
		table: Vyre.pickpocketTable!,
		ticksPerPick: 1,
		id: Vyre.id
	},
	{
		name: 'Elf',
		level: 1,
		xp: 8,
		table: Elf.pickpocketTable!,
		ticksPerPick: 1,
		id: Elf.id
	},
	{
		name: 'TzHaar-Hur',
		level: 1,
		xp: 8,
		table: TzHaarHur.pickpocketTable!,
		ticksPerPick: 1,
		id: TzHaarHur.id
	}
];

for (const npc of Pickpocketables) {
	if (!npc.table) {
		console.error(`Warning! No pickpocket table for ${npc.name}.`);
	}
}

export default Pickpocketables;
