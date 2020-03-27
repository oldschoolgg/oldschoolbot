import LootTable from 'oldschooljs/dist/structures/LootTable';

import BirthdayPresentTable from './simulation/birthdayPresent';
import { Emoji } from './constants';
import MysteryBoxTable from './simulation/mysteryBox';
import CasketTable from './simulation/casket';
import CrystalChestTable from './simulation/crystalChest';
import BirdNestTable from './simulation/birdsNest';

interface Openable {
	name: string;
	itemID: number;
	aliases: string[];
	table: LootTable;
	emoji: Emoji;
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
		name: 'Birds nest',
		itemID: 5073,
		aliases: ['birds nest', 'bird nest'],
		table: BirdNestTable,
		emoji: Emoji.BirdNest
	}
];

export default Openables;
