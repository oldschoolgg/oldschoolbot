import { activity_type_enum } from '@prisma/client';
import { randArrItem, roll, Time } from 'e';
import LRUCache from 'lru-cache';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { userStatsBankUpdate } from '../mahoji/mahojiSettings';
import { BitField } from './constants';
import resolveItems from './util/resolveItems';

export interface RandomEvent {
	id: number;
	name: string;
	outfit?: number[];
	loot: LootTable;
}

const baguetteTable = new LootTable().add('Baguette', 1, 63).add('Stale baguette', 1, 1);

export const beekeeperOutfit = resolveItems([
	"Beekeeper's hat",
	"Beekeeper's top",
	"Beekeeper's legs",
	"Beekeeper's gloves",
	"Beekeeper's boots"
]);

export const camoOutfit = resolveItems(['Camo helmet', 'Camo top', 'Camo bottoms']);

export const lederhosenOutfit = resolveItems(['Lederhosen hat', 'Lederhosen top', 'Lederhosen shorts']);

export const zombieOutfit = resolveItems([
	'Zombie mask',
	'Zombie shirt',
	'Zombie trousers',
	'Zombie gloves',
	'Zombie boots'
]);

export const mimeOutfit = resolveItems(['Mime mask', 'Mime top', 'Mime legs', 'Mime gloves', 'Mime boots']);

export const RandomEvents: RandomEvent[] = [
	{
		id: 1,
		name: 'Bee keeper',
		outfit: beekeeperOutfit,
		loot: new LootTable().add('Coins', [20, 60]).add('Flax', [1, 27])
	},
	{
		id: 2,
		name: 'Drill Demon',
		outfit: camoOutfit,
		loot: new LootTable().every('Coins', 500)
	},
	{
		id: 3,
		name: 'Drunken Dwarf',
		loot: new LootTable().every('Beer').every('Kebab')
	},
	{
		id: 4,
		name: 'Freaky Forester',
		loot: new LootTable().every('Coins', 500),
		outfit: lederhosenOutfit
	},
	{
		id: 5,
		name: 'Genie',
		loot: new LootTable().every('Genie lamp')
	},
	{
		id: 6,
		name: 'Gravedigger',
		loot: new LootTable().every('Coins', 500),
		outfit: zombieOutfit
	},
	{
		id: 7,
		name: 'Kiss the frog',
		loot: new LootTable().every('Frog token')
	},
	{
		id: 8,
		name: 'Mime',
		loot: new LootTable().every('Coins', 500),
		outfit: mimeOutfit
	},
	{
		id: 9,
		name: 'Quiz master',
		loot: new LootTable().every('Mystery box')
	},
	{
		id: 10,
		name: 'Sandwich lady',
		loot: new LootTable()
			.add(baguetteTable)
			.add('Triangle sandwich')
			.add('Square sandwich')
			.add('Chocolate bar')
			.add('Kebab')
			.add('Roll')
			.add('Meat pie')
	},
	{
		id: 11,
		name: 'Surprise Exam',
		loot: new LootTable().every('Book of knowledge')
	},
	{
		id: 12,
		name: "Capt' Arnav's Chest",
		loot: new LootTable()
			.add('Gold ring')
			.add('Gold necklace')
			.add('Gold bar')
			.add('Gold ore')
			.add('Coins', [20, 100])
	},
	{
		id: 13,
		name: 'Certers',
		loot: new LootTable()
			.add('Coins', [20, 100])
			.add('Uncut ruby')
			.add('Emerald')
			.add('Cosmic talisman')
			.add('Nature talisman')
			.add('Spinach roll')
			.add('Tooth half of key')
			.add('Loop half of key')
	}
];

const cache = new LRUCache<string, number>({ max: 500 });

const doesntGetRandomEvent: activity_type_enum[] = [activity_type_enum.TombsOfAmascut];

export async function triggerRandomEvent(user: MUser, type: activity_type_enum, duration: number, messages: string[]) {
	if (doesntGetRandomEvent.includes(type)) return;
	const minutes = Math.min(30, duration / Time.Minute);
	const randomEventChance = 60 - minutes;
	if (!roll(randomEventChance)) return;
	if (user.bitfield.includes(BitField.DisabledRandomEvents)) {
		return;
	}

	const prev = cache.get(user.id);

	// Max 1 event per 3h mins per user
	if (prev && Date.now() - prev < Time.Hour * 3) {
		return;
	}
	cache.set(user.id, Date.now());

	const event = randArrItem(RandomEvents);
	const loot = new Bank();
	if (event.outfit) {
		for (const piece of event.outfit) {
			if (!user.hasEquippedOrInBank(piece)) {
				loot.add(piece);
				break;
			}
		}
	}
	loot.add(event.loot.roll());
	await transactItems({ userID: user.id, itemsToAdd: loot, collectionLog: true });
	await userStatsBankUpdate(user.id, 'random_event_completions_bank', new Bank().add(event.id));
	messages.push(`Did ${event.name} random event and got ${loot}`);
}
