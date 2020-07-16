import LootTable from 'oldschooljs/dist/structures/LootTable';
import BirthdayPresentTable from './simulation/birthdayPresent';
import { Emoji } from './constants';
import { LevelRequirements } from './skilling/types';

interface Openable {
	name: string;
	itemID: number;
	aliases: string[];
	table: LootTable;
	emoji: Emoji;
	levelRequirements?: LevelRequirements;
	qpRequired?: number;
}

const Openables: Openable[] = [
	{
		name: 'Birthday present',
		itemID: 11918,
		aliases: ['present', 'birthday present'],
		table: BirthdayPresentTable,
		emoji: Emoji.BirthdayPresent
	}
];

export default Openables;
