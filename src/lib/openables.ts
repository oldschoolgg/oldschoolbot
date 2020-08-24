import LootTable from 'oldschooljs/dist/structures/LootTable';

import MysteryBoxTable from 'oldschooljs/dist/simulation/Openables/MysteryBox';
import BirthdayPresentTable from './simulation/birthdayPresent';
import { Emoji } from './constants';
import CasketTable from './simulation/casket';
import CrystalChestTable from './simulation/crystalChest';

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
		name: 'Casket',
		itemID: 405,
		aliases: ['casket'],
		table: CasketTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Crystal chest',
		itemID: 989,
		aliases: ['crystal chest', 'crystal key'],
		table: CrystalChestTable,
		emoji: Emoji.Casket
	},
	{
		name: 'Mystery box',
		itemID: 6199,
		aliases: ['mystery', 'mystery box'],
		table: MysteryBoxTable,
		emoji: Emoji.MysteryBox
	}
];

export default Openables;
