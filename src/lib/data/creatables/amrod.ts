import { Bank, EQuest } from 'oldschooljs';

import type { Createable } from '../createables';

export const amrodCreatables: Createable[] = [
	{
		name: 'Revert crystal weapon seed',
		inputItems: new Bank().add('Crystal weapon seed'),
		outputItems: new Bank().add('Crystal shard', 10),
		requiredQuests: [EQuest.SONG_OF_THE_ELVES],
		noCl: true
	},
	{
		name: 'Revert crystal tool seed',
		inputItems: new Bank().add('Crystal tool seed'),
		outputItems: new Bank().add('Crystal shard', 100),
		requiredQuests: [EQuest.SONG_OF_THE_ELVES],
		noCl: true
	},
	{
		name: 'Revert enhanced crystal teleport seed',
		inputItems: new Bank().add('Enhanced crystal teleport seed'),
		outputItems: new Bank().add('Crystal shard', 150),
		requiredQuests: [EQuest.SONG_OF_THE_ELVES],
		noCl: true
	},
	{
		name: 'Revert crystal armour seed',
		inputItems: new Bank().add('Crystal armour seed'),
		outputItems: new Bank().add('Crystal shard', 250),
		requiredQuests: [EQuest.SONG_OF_THE_ELVES],
		noCl: true
	},
	{
		name: 'Revert enhanced crystal weapon seed',
		inputItems: new Bank().add('Enhanced crystal weapon seed'),
		outputItems: new Bank().add('Crystal shard', 1500),
		requiredQuests: [EQuest.SONG_OF_THE_ELVES],
		noCl: true
	}
];
