import { Bank, Items } from 'oldschooljs';

import type { Mixable } from '../../../types.js';

const unfinishedPotions: Mixable[] = [
	{
		item: Items.getOrThrow('Guam potion (unf)'),
		aliases: ['guam potion (unf)', 'guam (unf)', 'guam potion'],
		level: 3,
		xp: 0,
		inputItems: new Bank({ 'guam leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Marrentill potion (unf)'),
		aliases: ['marrentill potion (unf)', 'marrentill potion', 'marrentill (unf)'],
		level: 5,
		xp: 0,
		inputItems: new Bank({ Marrentill: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Tarromin potion (unf)'),
		aliases: ['tarromin potion (unf)', 'tarromin potion', 'tarromin (unf)'],
		level: 12,
		xp: 0,
		inputItems: new Bank({ Tarromin: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Harralander potion (unf)'),
		aliases: ['harralander potion (unf)', 'harralander potion', 'harralander (unf)'],
		level: 22,
		xp: 0,
		inputItems: new Bank({ Harralander: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Ranarr potion (unf)'),
		aliases: ['ranarr potion (unf)', 'ranarr potion', 'ranarr (unf)'],
		level: 30,
		xp: 0,
		inputItems: new Bank({ 'Ranarr weed': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Toadflax potion (unf)'),
		aliases: ['toadflax potion (unf)', 'toadflax potion', 'toadflax (unf)'],
		level: 34,
		xp: 0,
		inputItems: new Bank({ Toadflax: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Irit potion (unf)'),
		aliases: ['irit potion (unf)', 'irit potion', 'irit (unf)'],
		level: 45,
		xp: 0,
		inputItems: new Bank({ 'Irit leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Avantoe potion (unf)'),
		aliases: ['avantoe potion (unf)', 'avantoe potion', 'avantoe (unf)'],
		level: 50,
		xp: 0,
		inputItems: new Bank({ Avantoe: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Kwuarm potion (unf)'),
		aliases: ['kwuarm potion (unf)', 'kwuarm potion', 'kwuarm (unf)'],
		level: 55,
		xp: 0,
		inputItems: new Bank({ Kwuarm: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Snapdragon potion (unf)'),
		aliases: ['snapdragon potion (unf)', 'snapdragon potion', 'snapdragon (unf)'],
		level: 63,
		xp: 0,
		inputItems: new Bank({ Snapdragon: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Cadantine potion (unf)'),
		aliases: ['cadantine potion (unf)', 'cadantine potion', 'cadantine (unf)'],
		level: 66,
		xp: 0,
		inputItems: new Bank({ Cadantine: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Lantadyme potion (unf)'),
		aliases: ['lantadyme potion (unf)', 'lantadyme potion', 'lantadyme (unf)'],
		level: 69,
		xp: 0,
		inputItems: new Bank({ Lantadyme: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Dwarf weed potion (unf)'),
		aliases: ['dwarf weed potion', 'dwarf weed (unf)', 'dwarf weed potion (unf)'],
		level: 72,
		xp: 0,
		inputItems: new Bank({ 'Dwarf weed': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Torstol potion (unf)'),
		aliases: ['torstol potion', 'torstol (unf)', 'torstol potion (unf)'],
		level: 78,
		xp: 0,
		inputItems: new Bank({ Torstol: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Cadantine blood potion (unf)'),
		aliases: ['cadantine blood potion (unf)', 'cadantine blood potion', 'cadantine blood'],
		level: 80,
		xp: 0,
		inputItems: new Bank({
			'Vial of blood': 1,
			Cadantine: 1
		}),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: Items.getOrThrow('Huasca potion (unf)'),
		aliases: ['huasca potion (unf)'],
		level: 58,
		xp: 132,
		inputItems: new Bank().add('Huasca').add('Vial of water'),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	}
];

export default unfinishedPotions;
