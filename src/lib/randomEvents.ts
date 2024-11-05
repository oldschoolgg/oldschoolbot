import { activity_type_enum } from '@prisma/client';
import { Time, randArrItem, roll } from 'e';
import { LRUCache } from 'lru-cache';
import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';
import {
	beekeeperOutfit,
	camoOutfit,
	lederhosenOutfit,
	mimeOutfit,
	zombieOutfit
} from 'oldschooljs/dist/data/itemConstants';

import { userStatsBankUpdate } from '../mahoji/mahojiSettings';
import { BitField } from './constants';

interface RandomEvent {
	id: number;
	name: string;
	outfit?: number[];
	uniqueMusic?: boolean;
	loot: LootTable;
}

const baguetteTable = new LootTable().add('Baguette', 1, 63).add('Stale baguette', 1, 1);

// Used by Mysterious Old man, Pillory, Rick Turpentine
const randomEventTable = new LootTable()
	.add('Uncut sapphire', 1, 32)
	.add('Uncut emerald', 1, 16)
	.add('Coins', 80, 10)
	.add('Coins', 160, 10)
	.add('Coins', 320, 10)
	.add('Coins', 480, 10)
	.add('Coins', 640, 10)
	.add('Uncut ruby', 1, 8)
	.add('Coins', 240, 6)
	.add('Cosmic talisman', 1, 4)
	.add('Uncut diamond', 2, 2)
	.add('Tooth half of key', 1, 1)
	.add('Tooth half of key', 1, 1);

// https://oldschool.runescape.wiki/w/Random_events#List_of_random_events
// Missing: Evil Bob, Jekyll and Hyde, Maze (uniqueMusic: true), Prison Pete (uniqueMusic: true)
export const RandomEvents: RandomEvent[] = [
	{
		id: 1,
		name: 'Bee keeper',
		outfit: beekeeperOutfit,
		uniqueMusic: true,
		loot: new LootTable().add('Coins', [16, 36]).add('Flax', [1, 27])
	},
	{
		id: 2,
		name: 'Drill Demon',
		outfit: camoOutfit,
		uniqueMusic: true,
		loot: new LootTable().every('Genie lamp')
	},
	{
		id: 3,
		name: 'Drunken Dwarf',
		loot: new LootTable().every('Beer').every('Kebab')
	},
	{
		id: 4,
		name: 'Freaky Forester',
		outfit: lederhosenOutfit,
		uniqueMusic: true,
		loot: new LootTable().every('Genie lamp')
	},
	{
		id: 5,
		name: 'Genie',
		loot: new LootTable().every('Genie lamp')
	},
	{
		id: 6,
		name: 'Gravedigger',
		outfit: zombieOutfit,
		loot: new LootTable().every('Genie lamp')
	},
	{
		id: 7,
		name: 'Kiss the frog',
		loot: new LootTable().every('Frog token')
	},
	{
		id: 8,
		name: 'Mime',
		outfit: mimeOutfit,
		uniqueMusic: true,
		loot: new LootTable().every('Genie lamp')
	},
	{
		id: 9,
		name: 'Quiz master',
		uniqueMusic: true,
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
		uniqueMusic: true,
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
	},
	{
		id: 14,
		name: 'Count Check',
		loot: new LootTable().every('Genie lamp')
	},
	{
		id: 15,
		name: 'Evil twin',
		uniqueMusic: true,
		loot: new LootTable()
			.add('Uncut sapphire', [2, 4])
			.add('Uncut emerald', [2, 4])
			.add('Uncut ruby', [2, 4])
			.add('Uncut diamond', [2, 4])
	},
	{
		id: 16,
		name: 'Mysterious Old Man',
		loot: randomEventTable.add('Kebab', 1, 16).add('Spinach roll', 1, 14)
	},
	{
		id: 17,
		name: 'Pillory',
		loot: randomEventTable
	},
	{
		id: 18,
		name: 'Pinball',
		uniqueMusic: true,
		loot: new LootTable().add('Sapphire', 5, 3).add('Emerald', 5, 3).add('Ruby', 5, 3).add('Diamond', 2, 1)
	},
	{
		id: 19,
		name: 'Rick Turpentine',
		loot: randomEventTable.add('Kebab', 1, 16).add('Spinach roll', 1, 14)
	},
	{
		id: 20,
		name: 'Strange plant',
		loot: new LootTable().every('Strange fruit')
	}
];

const cache = new LRUCache<string, number>({ max: 500 });

const doesntGetRandomEvent: activity_type_enum[] = [activity_type_enum.TombsOfAmascut];

export async function triggerRandomEvent(user: MUser, type: activity_type_enum, duration: number, messages: string[]) {
	if (doesntGetRandomEvent.includes(type)) return {};
	const minutes = Math.min(30, duration / Time.Minute);
	const randomEventChance = 60 - minutes;
	if (!roll(randomEventChance)) return {};
	if (user.bitfield.includes(BitField.DisabledRandomEvents)) {
		return {};
	}

	const prev = cache.get(user.id);

	// Max 1 event per 3h mins per user
	if (prev && Date.now() - prev < Time.Hour * 3) {
		return {};
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
	await userStatsBankUpdate(user, 'random_event_completions_bank', new Bank().add(event.id));
	messages.push(`Did ${event.name} random event and got ${loot}`);
	return {
		itemsToAddWithCL: loot
	};
}
