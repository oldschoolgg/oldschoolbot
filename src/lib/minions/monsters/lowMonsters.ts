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

const lowMonsters: KillableMonster[] = [
	{
		id: Monsters.Man.id,
		name: Monsters.Man.name,
		aliases: Monsters.Man.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Man,
		emoji: '🧍‍♂️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: [],
		qpRequired: 0
	},
	{
		id: Monsters.Guard.id,
		name: Monsters.Guard.name,
		aliases: Monsters.Guard.aliases,
		timeToFinish: Time.Second * 7.4,
		table: Monsters.Guard,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: [],
		qpRequired: 0
	},
	{
		id: Monsters.Woman.id,
		name: Monsters.Woman.name,
		aliases: Monsters.Woman.aliases,
		timeToFinish: Time.Second * 4.69,
		table: Monsters.Woman,
		emoji: '🧍‍♀️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: [],
		qpRequired: 0
	},
	{
		id: Monsters.Goblin.id,
		name: Monsters.Goblin.name,
		aliases: Monsters.Goblin.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Goblin,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: ['Goblin champion scroll'],
		qpRequired: 0
	},

	{
		id: Monsters.Cow.id,
		name: Monsters.Cow.name,
		aliases: Monsters.Cow.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Cow,
		emoji: '🐮',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: [],
		qpRequired: 0
	},
	{
		id: Monsters.Skeleton.id,
		name: Monsters.Skeleton.name,
		aliases: Monsters.Skeleton.aliases,
		timeToFinish: Time.Second * 9,
		table: Monsters.Skeleton,
		emoji: '☠️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: ['Skeleton champion scroll'],
		qpRequired: 0
	},
	{
		id: Monsters.Zombie.id,
		name: Monsters.Zombie.name,
		aliases: Monsters.Zombie.aliases,
		timeToFinish: Time.Second * 9,
		table: Monsters.Zombie,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: ['Zombie champion scroll'],
		qpRequired: 0
	},
	{
		id: Monsters.Rat.id,
		name: Monsters.Rat.name,
		aliases: Monsters.Rat.aliases,
		timeToFinish: Time.Second * 1.5,
		table: Monsters.Rat,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: [],
		qpRequired: 0
	},
	{
		id: Monsters.FireGiant.id,
		name: Monsters.FireGiant.name,
		aliases: Monsters.FireGiant.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.FireGiant,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: ['Giant champion scroll'],
		qpRequired: 0
	},
	{
		id: Monsters.BlueDragon.id,
		name: Monsters.BlueDragon.name,
		aliases: Monsters.BlueDragon.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.BlueDragon,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: ['Anti-dragon shield'],
		notifyDrops: [],
		qpRequired: 0
	},
	{
		id: Monsters.Dwarf.id,
		name: Monsters.Dwarf.name,
		aliases: Monsters.Dwarf.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Dwarf,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: [],
		notifyDrops: [],
		qpRequired: 0
	}
].map(killableMonster => ({
	...killableMonster,
	itemsRequired: transformArrayOfResolvableItems(killableMonster.itemsRequired),
	notifyDrops: transformArrayOfResolvableItems(killableMonster.notifyDrops)
}));

export default lowMonsters;
