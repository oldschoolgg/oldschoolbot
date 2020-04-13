import { Monsters } from 'oldschooljs';

import { Bank } from '../../types';
import { transformArrayOfResolvableItems } from '../../util/transformArrayOfResolvableItems';
import { Time } from 'oldschooljs/dist/constants';

export interface KillableMonster {
	id: number;
	name: string;
	aliases: string[];
	timeToFinish: number;
	table: {
		kill(quantity: number): Bank;
	};
	emoji: string;
	wildy: boolean;
	canBeKilled: boolean;
	difficultyRating: number;
	itemsRequired: (string | number)[];
	notifyDrops: (string | number)[];
	qpRequired: number;

	/**
	 * A object of ([key: itemID]: boostPercentage) boosts that apply to
	 * this monster.
	 */
	itemInBankBoosts?: Bank;
}

const gwdBosses: KillableMonster[] = [
	{
		id: Monsters.Cerberus.id,
		name: Monsters.Cerberus.name,
		aliases: Monsters.Cerberus.aliases,
		timeToFinish: Time.Minute * 2.65,
		table: Monsters.Cerberus,
		emoji: '<:Hellpuppy:324127376185491458>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: ['Bandos chestplate', 'Bandos tassets'],
		notifyDrops: ['Hellpuppy', 'Jar of souls'],
		qpRequired: 0
	}
].map(killableMonster => ({
	...killableMonster,
	itemsRequired: transformArrayOfResolvableItems(killableMonster.itemsRequired),
	notifyDrops: transformArrayOfResolvableItems(killableMonster.notifyDrops)
}));

export default gwdBosses;
