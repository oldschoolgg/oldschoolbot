import LootTable from 'oldschooljs/dist/structures/LootTable';
import BirthdayPresentTable from './simulation/birthdayPresent';
import { Emoji } from './constants';
import MysteryBoxTable from './simulation/mysteryBox';
import CasketTable from './simulation/casket';
import ElvenCrystalChestTable from './simulation/elvenCrystalChest';
import CrystalChestTable from './simulation/crystalChest';
import MuddyChestTable from './simulation/muddyChest';
import SinisterChestTable from './simulation/sinisterChest';
import GrubbyChestTable from './simulation/grubbyChest';
import OgreCoffinTable from './simulation/ogreCoffin';
import BrimstoneChestTable from './simulation/brimstoneChest';
import LarransBigChestTable from './simulation/larransBigChest';
import LarransSmallChestTable from './simulation/larransSmallChest'; 
import BronzeHAMChestTable from './simulation/bronzeHAMChest';
import SteelHAMChestTable from './simulation/steelHAMChest';
import SilverHAMChestTable from './simulation/silverHAMChest';
import IronHAMChestTable from './simulation/ironHAMChest';
import SeedPackTable from './simulation/seedPack';

import {
	BonusOpenables,
	BrimstoneChestBonus,
	LarransSmallChestBonus,
	LarransBigChestBonus
} from './simulation/BonusOpenables';
import { LevelRequirements } from './skilling/types';

interface Openable {
	name: string;
	itemID: number;
	aliases: string[];
	table: LootTable;
	emoji: Emoji;
	levelRequirements?: LevelRequirements;
	qpRequired?: number;
	bonuses?: BonusOpenables[];
}

const Openables: Openable[] = [
	{
		name: 'Birthday present',
		itemID: 11918,
		aliases: ['present', 'birthday present'],
		table: BirthdayPresentTable,
		emoji: Emoji.BirthdayPresent
	},
	{
		name: 'Mystery box',
		itemID: 6199,
		aliases: ['mystery box', 'mystery'],
		table: MysteryBoxTable,
		emoji: Emoji.MysteryBox
	},
	{
		name: 'Casket',
		itemID: 405,
		aliases: ['casket'],
		table: CasketTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Crystal chest',
		itemID: 989,
		aliases: ['crystal chest'],
		table: CrystalChestTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Elven crystal chest',
		itemID: 23951,
		aliases: ['elven chest', 'enhanced', 'enhanced crystal chest', 'enhanced crystal chest', 'elven chest', 'elven'],
		table: ElvenCrystalChestTable,
		emoji: Emoji.Casket,
		qpRequired: 205
	},
	{
		name: 'Muddy chest',
		itemID: 991,
		aliases: ['muddy chest', 'muddy'],
		table: MuddyChestTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Sinister chest',
		itemID: 993,
		aliases: ['sinister chest','sinister'],
		table: SinisterChestTable,
		emoji: Emoji.Casket,
		levelRequirements: {
			agility: 49
		}
	},
	{
		name: 'Grubby chest',
		itemID: 23499,
		aliases: ['grubby chest','grubby'],
		table: GrubbyChestTable,
		emoji: Emoji.Casket
		/*
		,
		levelRequirements: {
			thieving: 57
		}
		*/
	},
	{
		name: 'Ogre coffin',
		itemID: 4850,
		aliases: ['ogre coffin','ogre chest','ogre coffin chest'],
		table: OgreCoffinTable,
		emoji: Emoji.Casket,
		qpRequired: 5
	},
	{
		name: 'Brimstone chest',
		itemID: 23083,
		aliases: ['brimstone chest','brimstone'],
		table: BrimstoneChestTable,
		emoji: Emoji.Casket,
		bonuses: BrimstoneChestBonus
		/*
		,
		levelRequirements: {
			slayer: 75
		}
		*/
	},
	{
		name: "Larran's big chest",
		itemID: 23490,
		aliases: ['larran big chest','larrans big chest',"larran's big chest"],
		table: LarransBigChestTable,
		emoji: Emoji.Casket,
		bonuses: LarransBigChestBonus
    },
	{
		name: "Larran's small chest",
		itemID: 23490,
		aliases: ['larran small chest','larrans small chest',"larran's small chest"],
		table: LarransSmallChestTable,
		emoji: Emoji.Casket,
		bonuses: LarransSmallChestBonus
	},
	{
		name: "Bronze HAM chest",
		itemID: 8867,
		aliases: ['Bronze','bronze ham chest',"bronze chest"],
		table: BronzeHAMChestTable,
		emoji: Emoji.Casket
	},
	{
		name: "Iron HAM chest",
		itemID: 8869,
		aliases: ['iron','iron ham chest',"iron chest"],
		table: IronHAMChestTable,
		emoji: Emoji.Casket
	},
	{
		name: "Silver HAM chest",
		itemID: 8868,
		aliases: ['silver','silver ham chest',"silver chest"],
		table: SilverHAMChestTable,
		emoji: Emoji.Casket
	},
	{
		name: "Steel HAM chest",
		itemID: 8866,
		aliases: ['steel','steel ham chest',"steel chest"],
		table: SteelHAMChestTable,
		emoji: Emoji.Casket
	},
	{
		name: "Seed pack",
		itemID: 22993,
		aliases: ['seed pack'],
		table: SeedPackTable,
		emoji: Emoji.Casket
	}
];
export default Openables;