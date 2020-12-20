import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const Potions: Mixable[] = [
	{
		name: 'Attack potion (3)',
		aliases: ['Attack potion', 'Attack', 'Attack potion (3)'],
		id: itemID('Attack potion (3)'),
		level: 1,
		xp: 25,
		inputItems: resolveNameBank({ 'guam potion (unf)': 1, 'Eye of newt': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Antipoison (3)',
		aliases: ['Antipoison (3)', 'Antipoison'],
		id: itemID('Antipoison (3)'),
		level: 5,
		xp: 37.5,
		inputItems: resolveNameBank({
			'Marrentill potion (unf)': 1,
			'Unicorn horn dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Strength potion (3)',
		aliases: ['Strength potion (3)', 'Strength potion', 'Strength'],
		id: itemID('Strength potion (3)'),
		level: 12,
		xp: 50,
		inputItems: resolveNameBank({ 'Tarromin potion (unf)': 1, 'Limpwurt root': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Serum 207 (3)',
		aliases: ['Serum 207 (3)', 'Serum 207'],
		id: itemID('Serum 207 (3)'),
		level: 15,
		xp: 50,
		inputItems: resolveNameBank({ 'Tarromin potion (unf)': 1, Ashes: 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Compost potion (3)',
		aliases: ['Compost potion (3)', 'Compost potion', 'Compost'],
		id: itemID('Compost potion (3)'),
		level: 22,
		xp: 60,
		inputItems: resolveNameBank({ 'Harralander potion (unf)': 1, 'Volcanic ash': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Restore potion (3)',
		aliases: ['Restore potion (3)', 'Restore potion', 'Restore'],
		id: itemID('restore potion (3)'),
		level: 22,
		xp: 62.5,
		inputItems: resolveNameBank({
			'Harralander potion (unf)': 1,
			"red spiders' eggs": 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Guthix balance (3)',
		aliases: ['Guthix balance (3)', 'guthix balance'],
		id: itemID('Guthix balance (3)'),
		level: 22,
		xp: 50,
		inputItems: resolveNameBank({
			'Restore potion (3)': 1,
			garlic: 1,
			'silver dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Energy potion (3)',
		aliases: ['Energy potion (3)', 'Energy potion', 'Energy'],
		id: itemID('Energy potion (3)'),
		level: 26,
		xp: 67.5,
		inputItems: resolveNameBank({
			'Harralander potion (unf)': 1,
			'chocolate dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Defence potion (3)',
		aliases: ['Defence potion (3)', 'Defence potion', 'Defence'],
		id: itemID('Defence potion (3)'),
		level: 30,
		xp: 75,
		inputItems: resolveNameBank({ 'Ranarr potion (unf)': 1, 'White berries': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Agility potion (3)',
		aliases: ['Agility potion (3)', 'Agility potion', 'Agility'],
		id: itemID('Agility potion (3)'),
		level: 34,
		xp: 80,
		inputItems: resolveNameBank({ 'Toadflax potion (unf)': 1, "Toad's legs": 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Combat potion (3)',
		aliases: ['Combat potion (3)', 'Combat potion', 'Combat'],
		id: itemID('Combat potion (3)'),
		level: 36,
		xp: 84,
		inputItems: resolveNameBank({
			'Harralander potion (unf)': 1,
			'goat horn dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Prayer potion (3)',
		aliases: ['prayer potion', 'prayer', 'prayer potion (3)'],
		id: itemID('Prayer potion (3)'),
		level: 38,
		xp: 87.5,
		inputItems: resolveNameBank({ 'Ranarr potion (unf)': 1, 'Snape grass': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Super attack (3)',
		aliases: ['Super attack (3)', 'Super attack'],
		id: itemID('Super attack (3)'),
		level: 45,
		xp: 100,
		inputItems: resolveNameBank({ 'Irit potion (unf)': 1, 'Eye of newt': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Superantipoison (3)',
		aliases: ['Superantipoison (3)', 'Superantipoison'],
		id: itemID('Superantipoison (3)'),
		level: 48,
		xp: 106.5,
		inputItems: resolveNameBank({ 'Irit potion (unf)': 1, 'Unicorn horn dust': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Fishing potion (3)',
		aliases: ['Fishing potion (3)', 'Fishing potion', 'Fishing'],
		id: itemID('Fishing potion (3)'),
		level: 50,
		xp: 112.5,
		inputItems: resolveNameBank({ 'Avantoe potion (unf)': 1, 'Snape grass': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Super energy (3)',
		aliases: ['Super energy (3)', 'Super energy'],
		id: itemID('Super energy (3)'),
		level: 52,
		xp: 117.5,
		inputItems: resolveNameBank({ 'Avantoe potion (unf)': 1, 'Mort myre fungus': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Hunter potion (3)',
		aliases: ['Hunter potion (3)', 'Hunter potion', 'Hunter'],
		id: itemID('Hunter potion (3)'),
		level: 53,
		xp: 120,
		inputItems: resolveNameBank({ 'Avantoe potion (unf)': 1, 'Kebbit teeth dust': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Super strength (3)',
		aliases: ['Super strength (3)', 'Super strength'],
		id: itemID('Super strength (3)'),
		level: 55,
		xp: 125,
		inputItems: resolveNameBank({ 'Kwuarm potion (unf)': 1, 'Limpwurt root': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Weapon poison',
		aliases: ['Weapon poison'],
		id: itemID('Weapon poison'),
		level: 60,
		xp: 137.5,
		inputItems: resolveNameBank({ 'Kwuarm potion (unf)': 1, 'Dragon scale dust': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Super restore (3)',
		aliases: ['Super restore (3)', 'Super restore'],
		id: itemID('Super restore (3)'),
		level: 63,
		xp: 142.5,
		inputItems: resolveNameBank({
			'Snapdragon potion (unf)': 1,
			"Red spiders' eggs": 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Super defence (3)',
		aliases: ['Super defence (3)', 'Super defence'],
		id: itemID('Super defence (3)'),
		level: 66,
		xp: 150,
		inputItems: resolveNameBank({ 'Cadantine potion (unf)': 1, 'White berries': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Antidote+ (4)',
		aliases: ['Antidote+ (4)', 'Antidote+'],
		id: itemID('Antidote+ (4)'),
		level: 68,
		xp: 155,
		inputItems: resolveNameBank({ 'Coconut milk': 1, Toadflax: 1, 'Yew roots': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.45
	},
	{
		name: 'Antifire potion (3)',
		aliases: ['Antifire potion (3)', 'Antifire potion', 'Antifire'],
		id: itemID('Antifire potion (3)'),
		level: 69,
		xp: 157.5,
		inputItems: resolveNameBank({
			'Lantadyme potion (unf)': 1,
			'Dragon scale dust': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Ranging potion (3)',
		aliases: ['Ranging potion (3)', 'Ranging potion', 'Ranging'],
		id: itemID('Ranging potion (3)'),
		level: 72,
		xp: 162.5,
		inputItems: resolveNameBank({
			'Dwarf weed potion (unf)': 1,
			'Wine of zamorak': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Weapon poison(+)',
		aliases: ['Weapon poison(+)'],
		id: itemID('Weapon poison(+)'),
		level: 73,
		xp: 165,
		inputItems: resolveNameBank({
			'Coconut milk': 1,
			'Cactus spine': 1,
			"Red spiders' eggs": 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Magic potion (3)',
		aliases: ['Magic potion (3)', 'Magic potion', 'Magic'],
		id: itemID('Magic potion (3)'),
		level: 76,
		xp: 172.5,
		inputItems: resolveNameBank({ 'Lantadyme potion (unf)': 1, 'Potato cactus': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Stamina potion (4)',
		aliases: ['Stamina potion (4)', 'Stamina potion', 'Stamina'],
		id: itemID('Stamina potion (4)'),
		level: 77,
		xp: 102,
		inputItems: resolveNameBank({ 'Super energy (4)': 1, 'Amylase crystal': 4 }),
		tickRate: 2,
		bankTimePerPotion: 0.17
	},
	{
		name: 'Zamorak brew (3)',
		aliases: ['Zamorak brew (3)', 'Zamorak brew'],
		id: itemID('Zamorak brew (3)'),
		level: 78,
		xp: 175,
		inputItems: resolveNameBank({ 'Torstol potion (unf)': 1, Jangerberries: 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Antidote++ (4)',
		aliases: ['Antidote++ (4)', 'Antidote++'],
		id: itemID('Antidote++ (4)'),
		level: 79,
		xp: 177.5,
		inputItems: resolveNameBank({
			'Coconut milk': 1,
			'Irit leaf': 1,
			'Magic roots': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.45
	},
	{
		name: 'Bastion potion (3)',
		aliases: ['Bastion potion (3)', 'Bastion potion', 'Bastion'],
		id: itemID('Bastion potion (3)'),
		level: 80,
		xp: 155,
		inputItems: resolveNameBank({
			'Cadantine blood potion (unf)': 1,
			'Wine of zamorak': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Battlemage potion (3)',
		aliases: ['Battlemage potion (3)', 'Battlemage potion', 'Battlemage'],
		id: itemID('Battlemage potion (3)'),
		level: 80,
		xp: 155,
		inputItems: resolveNameBank({
			'Cadantine blood potion (unf)': 1,
			'Potato cactus': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Saradomin brew (3)',
		aliases: ['Saradomin brew (3)', 'Saradomin brew'],
		id: itemID('Saradomin brew (3)'),
		level: 81,
		xp: 180,
		inputItems: resolveNameBank({
			'Toadflax potion (unf)': 1,
			'Crushed nest': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Weapon poison(++)',
		aliases: ['Weapon poison(++)'],
		id: itemID('Weapon poison(++)'),
		level: 82,
		xp: 165,
		inputItems: resolveNameBank({
			'Coconut milk': 1,
			'Cave nightshade': 1,
			'Poison ivy berries': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Extended antifire (4)',
		aliases: ['Extended antifire (4)', 'Extended antifire'],
		id: itemID('Extended antifire (4)'),
		level: 84,
		xp: 110,
		inputItems: resolveNameBank({ 'Antifire potion(4)': 1, 'Lava scale shard': 4 }),
		tickRate: 2,
		bankTimePerPotion: 0.17
	},
	{
		name: 'Anti-venom (4)',
		aliases: ['Anti-venom (4)', 'Anti-venom'],
		id: itemID('Anti-venom (4)'),
		level: 87,
		xp: 120,
		inputItems: resolveNameBank({ 'Antidote++ (4)': 1, "Zulrah's scales": 30 }),
		tickRate: 2,
		bankTimePerPotion: 0.17
	},
	{
		name: 'Super combat potion (4)',
		aliases: ['Super combat potion (4)', 'Super combat potion', 'Super combat'],
		id: itemID('Super combat potion (4)'),
		level: 90,
		xp: 150,
		inputItems: resolveNameBank({
			'Super attack(4)': 1,
			'Super strength (4)': 1,
			'Super defence (4)': 1,
			Torstol: 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.5
	},
	{
		name: 'Super antifire potion (4)',
		aliases: ['Super antifire potion (4)', 'Super antifire potion', 'Super antifire'],
		id: itemID('Super antifire potion (4)'),
		level: 92,
		xp: 130,
		inputItems: resolveNameBank({
			'Antifire potion(4)': 1,
			'Crushed superior dragon bones': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Anti-venom+(4)',
		aliases: ['Anti-venom+(4)', 'Anti-venom+'],
		id: itemID('Anti-venom+(4)'),
		level: 92,
		xp: 125,
		inputItems: resolveNameBank({ 'Anti-venom (4)': 1, Torstol: 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		name: 'Extended super antifire (4)',
		aliases: ['Extended super antifire (4)', 'Extended super antifire'],
		id: itemID('Extended super antifire (4)'),
		level: 98,
		xp: 160,
		inputItems: resolveNameBank({
			'Super antifire potion(4)': 1,
			'Lava scale shard': 4
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	}
];

export default Potions;
