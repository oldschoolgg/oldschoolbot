import LootTable from 'oldschooljs/dist/structures/LootTable';

import BirthdayPresentTable from './simulation/birthdayPresent';
import { Emoji } from './constants';
import MysteryBoxTable from './simulation/mysteryBox';

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
	}
];

export default Openables;
