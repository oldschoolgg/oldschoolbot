import { Time } from 'e';
import { Bank, EQuest, type Item, Items } from 'oldschooljs';

import type { Skills } from '../../lib/types';

interface Collectable {
	item: Item;
	skillReqs?: Skills;
	itemCost?: Bank;
	quantity: number;
	duration: number;
	requiredQuests?: EQuest[];
}

export const collectables: Collectable[] = [
	{
		item: Items.getOrThrow('Blue dragon scale'),
		quantity: 26,
		itemCost: new Bank({
			'Water rune': 1,
			'Air rune': 3,
			'Law rune': 1
		}),
		skillReqs: {
			agility: 70,
			magic: 37
		},
		duration: Time.Minute * 2
	},
	{
		item: Items.getOrThrow('Mort myre fungus'),
		quantity: 100,
		itemCost: new Bank({
			'Prayer potion(4)': 1,
			'Ring of dueling(8)': 1
		}),
		skillReqs: {
			prayer: 50
		},
		duration: Time.Minute * 8.3,
		requiredQuests: [EQuest.NATURE_SPIRIT]
	},
	{
		item: Items.getOrThrow('Flax'),
		quantity: 28,
		duration: Time.Minute * 1.68
	},
	{
		item: Items.getOrThrow('Swamp toad'),
		quantity: 28,
		duration: Time.Minute * 1.68
	},
	{
		item: Items.getOrThrow("Red spiders' eggs"),
		quantity: 80,
		itemCost: new Bank({
			'Stamina potion(4)': 1
		}),
		duration: Time.Minute * 8.5
	},
	{
		item: Items.getOrThrow('Wine of zamorak'),
		quantity: 27,
		itemCost: new Bank({
			'Law rune': 27,
			'Air rune': 27
		}),
		skillReqs: {
			magic: 33
		},
		duration: Time.Minute * 3.12
	},
	{
		item: Items.getOrThrow('White berries'),
		quantity: 27,
		requiredQuests: [EQuest.REGICIDE],
		skillReqs: {
			ranged: 60,
			thieving: 50,
			agility: 56,
			crafting: 10,
			fletching: 5,
			cooking: 30
		},
		duration: Time.Minute * 4.05
	},
	{
		item: Items.getOrThrow('Snape grass'),
		quantity: 120,
		itemCost: new Bank({
			'Law rune': 12,
			'Astral rune': 12
		}),
		duration: Time.Minute * 6.5,
		requiredQuests: [EQuest.LUNAR_DIPLOMACY]
	},
	{
		item: Items.getOrThrow('Snake weed'),
		quantity: 150,
		itemCost: new Bank({
			'Ring of dueling(8)': 1
		}),
		duration: Time.Minute * 30,
		requiredQuests: [EQuest.JUNGLE_POTION]
	},
	{
		item: Items.getOrThrow('Bucket of sand'),
		quantity: 30,
		itemCost: new Bank({
			'Law rune': 1,
			Coins: 30 * 25
		}),
		duration: Time.Minute,
		requiredQuests: [EQuest.ENAKHRAS_LAMENT]
	},
	{
		item: Items.getOrThrow('Jangerberries'),
		quantity: 224,
		itemCost: new Bank({
			'Ring of dueling(8)': 1
		}),
		skillReqs: {
			agility: 10
		},
		duration: Time.Minute * 24
	},
	// Miniquest to get Tarn's diary for Salve amulet (e)/(ei)
	{
		item: Items.getOrThrow("Tarn's diary"),
		quantity: 1,
		itemCost: new Bank({
			'Prayer potion(4)': 2
		}),
		skillReqs: {
			slayer: 40,
			attack: 60,
			strength: 60,
			ranged: 60,
			defence: 60,
			magic: 60
		},
		duration: 10 * Time.Minute,
		requiredQuests: [EQuest.HAUNTED_MINE]
	}
];
