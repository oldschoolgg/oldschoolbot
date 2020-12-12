import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji } from './constants';
import BirthdayPresentTable from './simulation/birthdayPresent';
import CasketTable from './simulation/casket';
import CrystalChestTable from './simulation/crystalChest';

interface Openable {
	name: string;
	itemID: number;
	aliases: string[];
	table: LootTable;
	emoji: Emoji;
}

export const NestBoxes = new LootTable()
	.add('Nest box (seeds)', 1, 12)
	.add('Nest box (ring)', 1, 5)
	.add('Nest box (empty)', 1, 3);

export function getRandomNestBox() {
	return NestBoxes.roll()[0].item;
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
		aliases: ['crystal chest'],
		table: CrystalChestTable,
		emoji: Emoji.Casket
	}
];

export default Openables;
