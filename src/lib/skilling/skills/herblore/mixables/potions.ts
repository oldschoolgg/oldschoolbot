import { Bank } from 'oldschooljs';

import getOSItem from '../../../../util/getOSItem';
import type { Mixable } from '../../../types';

const Potions: Mixable[] = [
	{
		item: getOSItem('Attack potion (3)'),
		aliases: ['attack potion', 'attack', 'attack potion (3)'],
		level: 3,
		xp: 25,
		inputItems: new Bank({ 'guam potion (unf)': 1, 'Eye of newt': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Antipoison (3)'),
		aliases: ['antipoison (3)', 'antipoison'],
		level: 5,
		xp: 37.5,
		inputItems: new Bank({
			'Marrentill potion (unf)': 1,
			'Unicorn horn dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Strength potion (3)'),
		aliases: ['strength potion (3)', 'strength potion', 'strength'],
		level: 12,
		xp: 50,
		inputItems: new Bank({ 'Tarromin potion (unf)': 1, 'Limpwurt root': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Serum 207 (3)'),
		aliases: ['serum 207 (3)', 'serum 207'],
		level: 15,
		xp: 50,
		inputItems: new Bank({ 'Tarromin potion (unf)': 1, Ashes: 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Guthix rest (3)'),
		aliases: ['guthix rest (3)', 'guthix rest'],
		level: 18,
		xp: 59,
		inputItems: new Bank({
			'Cup of hot water': 1,
			'Guam leaf': 1,
			Harralander: 1,
			Marrentill: 1
		}),
		tickRate: 2,
		bankTimePerPotion: 1.5,
		zahur: false
	},
	{
		item: getOSItem('Compost potion (3)'),
		aliases: ['compost potion (3)', 'compost potion', 'compost'],
		level: 22,
		xp: 60,
		inputItems: new Bank({ 'Harralander potion (unf)': 1, 'Volcanic ash': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Restore potion (3)'),
		aliases: ['restore potion (3)', 'restore potion', 'restore'],
		level: 22,
		xp: 62.5,
		inputItems: new Bank({
			'Harralander potion (unf)': 1,
			"red spiders' eggs": 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Guthix balance (3)'),
		aliases: ['guthix balance (3)', 'guthix balance'],
		level: 22,
		xp: 50,
		inputItems: new Bank({
			'Restore potion (3)': 1,
			garlic: 1,
			'silver dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Energy potion (3)'),
		aliases: ['energy potion (3)', 'energy potion', 'energy'],
		level: 26,
		xp: 67.5,
		inputItems: new Bank({
			'Harralander potion (unf)': 1,
			'chocolate dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Defence potion (3)'),
		aliases: ['defence potion (3)', 'defence potion', 'defence'],
		level: 30,
		xp: 75,
		inputItems: new Bank({ 'Ranarr potion (unf)': 1, 'White berries': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Agility potion (3)'),
		aliases: ['agility potion (3)', 'agility potion', 'agility'],
		level: 34,
		xp: 80,
		inputItems: new Bank({ 'Toadflax potion (unf)': 1, "Toad's legs": 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Combat potion (3)'),
		aliases: ['combat potion (3)', 'combat potion', 'combat'],
		level: 36,
		xp: 84,
		inputItems: new Bank({
			'Harralander potion (unf)': 1,
			'goat horn dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Prayer potion (3)'),
		aliases: ['prayer potion', 'prayer', 'prayer potion (3)'],
		level: 38,
		xp: 87.5,
		inputItems: new Bank({ 'Ranarr potion (unf)': 1, 'Snape grass': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Super attack (3)'),
		aliases: ['super attack (3)', 'super attack'],
		level: 45,
		xp: 100,
		inputItems: new Bank({ 'Irit potion (unf)': 1, 'Eye of newt': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Superantipoison (3)'),
		aliases: ['superantipoison (3)', 'superantipoison'],
		level: 48,
		xp: 106.5,
		inputItems: new Bank({ 'Irit potion (unf)': 1, 'Unicorn horn dust': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Fishing potion (3)'),
		aliases: ['fishing potion (3)', 'fishing potion', 'fishing'],
		level: 50,
		xp: 112.5,
		inputItems: new Bank({ 'Avantoe potion (unf)': 1, 'Snape grass': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Super energy (3)'),
		aliases: ['super energy (3)', 'super energy'],
		level: 52,
		xp: 117.5,
		inputItems: new Bank({ 'Avantoe potion (unf)': 1, 'Mort myre fungus': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Hunter potion (3)'),
		aliases: ['hunter potion (3)', 'hunter potion', 'hunter'],
		level: 53,
		xp: 120,
		inputItems: new Bank({ 'Avantoe potion (unf)': 1, 'Kebbit teeth dust': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Super strength (3)'),
		aliases: ['super strength (3)', 'super strength'],
		level: 55,
		xp: 125,
		inputItems: new Bank({ 'Kwuarm potion (unf)': 1, 'Limpwurt root': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Weapon poison'),
		aliases: ['weapon poison(+)'],
		level: 60,
		xp: 137.5,
		inputItems: new Bank({ 'Kwuarm potion (unf)': 1, 'Dragon scale dust': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Super restore (3)'),
		aliases: ['super restore (3)', 'super restore'],
		level: 63,
		xp: 142.5,
		inputItems: new Bank({
			'Snapdragon potion (unf)': 1,
			"Red spiders' eggs": 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Super defence (3)'),
		aliases: ['super defence (3)', 'super defence'],
		level: 66,
		xp: 150,
		inputItems: new Bank({ 'Cadantine potion (unf)': 1, 'White berries': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Antidote+ (4)'),
		aliases: ['antidote+ (4)', 'antidote+'],
		level: 68,
		xp: 155,
		inputItems: new Bank({ 'Coconut milk': 1, Toadflax: 1, 'Yew roots': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.45
	},
	{
		item: getOSItem('Antifire potion (3)'),
		aliases: ['antifire potion (3)', 'antifire potion', 'antifire'],
		level: 69,
		xp: 157.5,
		inputItems: new Bank({
			'Lantadyme potion (unf)': 1,
			'Dragon scale dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Ranging potion (3)'),
		aliases: ['ranging potion (3)', 'ranging potion', 'ranging'],
		level: 72,
		xp: 162.5,
		inputItems: new Bank({
			'Dwarf weed potion (unf)': 1,
			'Wine of zamorak': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Weapon poison(+)'),
		aliases: ['weapon poison(+)'],
		level: 73,
		xp: 165,
		inputItems: new Bank({
			'Coconut milk': 1,
			'Cactus spine': 1,
			"Red spiders' eggs": 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Magic potion (3)'),
		aliases: ['magic potion (3)', 'magic potion', 'magic'],
		level: 76,
		xp: 172.5,
		inputItems: new Bank({ 'Lantadyme potion (unf)': 1, 'Potato cactus': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Stamina potion (4)'),
		aliases: ['stamina potion (4)', 'stamina potion', 'stamina'],
		level: 77,
		xp: 102,
		inputItems: new Bank({ 'Super energy (4)': 1, 'Amylase crystal': 4 }),
		tickRate: 2,
		bankTimePerPotion: 0.17
	},
	{
		item: getOSItem('Zamorak brew (3)'),
		aliases: ['zamorak brew (3)', 'zamorak brew'],
		level: 78,
		xp: 175,
		inputItems: new Bank({ 'Torstol potion (unf)': 1, Jangerberries: 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Antidote++ (4)'),
		aliases: ['antidote++ (4)', 'antidote++'],
		level: 79,
		xp: 177.5,
		inputItems: new Bank({
			'Coconut milk': 1,
			'Irit leaf': 1,
			'Magic roots': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.45
	},
	{
		item: getOSItem('Bastion potion (3)'),
		aliases: ['bastion potion (3)', 'bastion potion', 'bastion'],
		level: 80,
		xp: 155,
		inputItems: new Bank({
			'Cadantine blood potion (unf)': 1,
			'Wine of zamorak': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Battlemage potion (3)'),
		aliases: ['battlemage potion (3)', 'battlemage potion', 'battlemage'],
		level: 80,
		xp: 155,
		inputItems: new Bank({
			'Cadantine blood potion (unf)': 1,
			'Potato cactus': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Saradomin brew (3)'),
		aliases: ['saradomin brew (3)', 'saradomin brew', 'sara brew'],
		level: 81,
		xp: 180,
		inputItems: new Bank({
			'Toadflax potion (unf)': 1,
			'Crushed nest': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Weapon poison(++)'),
		aliases: ['weapon poison(++)'],
		level: 82,
		xp: 165,
		inputItems: new Bank({
			'Coconut milk': 1,
			'Cave nightshade': 1,
			'Poison ivy berries': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Extended antifire (4)'),
		aliases: ['extended antifire (4)', 'extended antifire'],
		level: 84,
		xp: 110,
		inputItems: new Bank({ 'Antifire potion(4)': 1, 'Lava scale shard': 4 }),
		tickRate: 2,
		bankTimePerPotion: 0.17
	},
	{
		item: getOSItem('Ancient brew (3)'),
		aliases: ['ancient brew (3)', 'ancient brew'],
		level: 85,
		xp: 190,
		inputItems: new Bank({ 'Dwarf weed potion (unf)': 1, 'Nihil dust': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.17
	},
	{
		item: getOSItem('Anti-venom (4)'),
		aliases: ['anti-venom (4)', 'anti-venom'],
		level: 87,
		xp: 120,
		inputItems: new Bank({ 'Antidote++ (4)': 1, "Zulrah's scales": 20 }),
		tickRate: 2,
		bankTimePerPotion: 0.17
	},
	{
		item: getOSItem('Menaphite remedy (3)'),
		aliases: ['menaphite', 'remedy'],
		level: 88,
		xp: 200,
		inputItems: new Bank({ 'Dwarf weed potion (unf)': 1, 'Lily of the sands': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Super combat potion (4)'),
		aliases: ['super combat potion (4)', 'super combat potion', 'super combat'],
		level: 90,
		xp: 150,
		inputItems: new Bank({
			'Super attack(4)': 1,
			'Super strength (4)': 1,
			'Super defence (4)': 1,
			Torstol: 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.5
	},
	{
		item: getOSItem('Forgotten brew (4)'),
		aliases: ['forgotten brew (4)', 'forgotten brew', 'forgotten'],
		level: 91,
		xp: 145,
		inputItems: new Bank({ 'Ancient brew (4)': 1, 'Ancient essence': 80 }),
		tickRate: 2,
		bankTimePerPotion: 0.17
	},
	{
		item: getOSItem('Super antifire potion (4)'),
		aliases: ['super antifire potion (4)', 'super antifire potion', 'super antifire'],
		level: 92,
		xp: 130,
		inputItems: new Bank({
			'Antifire potion(4)': 1,
			'Crushed superior dragon bones': 1
		}),
		tickRate: 2,
		qpRequired: 205,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Anti-venom+(4)'),
		aliases: ['Anti-venom+(4)', 'Anti-venom+'],
		level: 94,
		xp: 125,
		inputItems: new Bank({ 'Anti-venom (4)': 1, Torstol: 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Extended anti-venom+(4)'),
		aliases: ['Extended anti-venom+(4)', 'Extended anti-venom'],
		level: 94,
		xp: 80,
		inputItems: new Bank().add('Anti-venom+(4)').add('Araxyte venom sack', 4),
		tickRate: 3,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Extended super antifire (4)'),
		aliases: ['Extended super antifire (4)', 'Extended super antifire'],
		level: 98,
		xp: 160,
		inputItems: new Bank({
			'Super antifire potion(4)': 1,
			'Lava scale shard': 4
		}),
		tickRate: 2,
		qpRequired: 205,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Sanfew serum(4)'),
		aliases: ['sanfew', 'sanfew serum', 'sanfew serum(4)'],
		level: 65,
		xp: 192,
		inputItems: new Bank({
			'Super restore(4)': 1,
			'Unicorn horn dust': 1,
			'Snake weed': 1,
			'Nail beast nails': 1
		}),
		tickRate: 10,
		bankTimePerPotion: 0.5
	}
];

export default Potions;
