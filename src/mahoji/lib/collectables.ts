import { Time } from 'e';
import { Bank, type Item } from 'oldschooljs';

import type { Skills } from '../../lib/types';
import getOSItem from '../../lib/util/getOSItem';

interface Collectable {
	item: Item;
	skillReqs?: Skills;
	itemCost?: Bank;
	quantity: number;
	duration: number;
	qpRequired?: number;
}

export const collectables: Collectable[] = [
	{
		item: getOSItem('Blue dragon scale'),
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
		item: getOSItem('Mort myre fungus'),
		quantity: 100,
		itemCost: new Bank({
			'Prayer potion(4)': 1,
			'Ring of dueling(8)': 1
		}),
		skillReqs: {
			prayer: 50
		},
		duration: Time.Minute * 8.3,
		qpRequired: 32
	},
	{
		item: getOSItem('Flax'),
		quantity: 28,
		duration: Time.Minute * 1.68
	},
	{
		item: getOSItem('Swamp toad'),
		quantity: 28,
		duration: Time.Minute * 1.68
	},
	{
		item: getOSItem("Red spiders' eggs"),
		quantity: 80,
		itemCost: new Bank({
			'Stamina potion(4)': 1
		}),
		duration: Time.Minute * 8.5
	},
	{
		item: getOSItem('Wine of zamorak'),
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
		item: getOSItem('White berries'),
		quantity: 27,
		qpRequired: 22,
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
		item: getOSItem('Snape grass'),
		quantity: 120,
		itemCost: new Bank({
			'Law rune': 12,
			'Astral rune': 12
		}),
		duration: Time.Minute * 6.5,
		qpRequired: 72
	},
	{
		item: getOSItem('Snake weed'),
		quantity: 150,
		itemCost: new Bank({
			'Ring of dueling(8)': 1
		}),
		duration: Time.Minute * 30,
		qpRequired: 3
	},
	{
		item: getOSItem('Bucket of sand'),
		quantity: 30,
		itemCost: new Bank({
			'Law rune': 1,
			Coins: 30 * 25
		}),
		duration: Time.Minute,
		qpRequired: 30
	},
	{
		item: getOSItem('Jangerberries'),
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
		item: getOSItem("Tarn's diary"),
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
		qpRequired: 100
	}
];
