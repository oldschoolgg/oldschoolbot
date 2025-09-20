import { Bank, Items } from 'oldschooljs';

import type { Mixable } from '../../../types.js';

const Grimy: Mixable[] = [
	{
		item: Items.getOrThrow('Guam leaf'),
		aliases: ['guam leaf', 'guam', 'grimy guam'],
		level: 3,
		xp: 2.5,
		inputItems: new Bank({ 'Grimy guam leaf': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Marrentill'),
		aliases: ['marrentill', 'grimy marrentill'],
		level: 5,
		xp: 3.8,
		inputItems: new Bank({ 'Grimy marrentill': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Tarromin'),
		aliases: ['tarromin', 'grimy tarromin'],
		level: 11,
		xp: 5,
		inputItems: new Bank({ 'Grimy tarromin': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Harralander'),
		aliases: ['harralander', 'grimy harralander'],
		level: 20,
		xp: 6.3,
		inputItems: new Bank({ 'Grimy harralander': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Ranarr weed'),
		aliases: ['ranarr weed', 'grimy ranarr', 'ranarr', 'grimy ranarr weed'],
		level: 25,
		xp: 7.5,
		inputItems: new Bank({ 'Grimy ranarr weed': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Toadflax'),
		aliases: ['toadflax', 'grimy toadflax'],
		level: 30,
		xp: 8,
		inputItems: new Bank({ 'Grimy toadflax': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Irit leaf'),
		aliases: ['irit leaf', 'irit', 'grimy irit', 'grimy irit leaf'],
		level: 40,
		xp: 8.8,
		inputItems: new Bank({ 'Grimy irit leaf': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Avantoe'),
		aliases: ['avantoe', 'grimy avantoe'],
		level: 48,
		xp: 10,
		inputItems: new Bank({ 'Grimy avantoe': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Kwuarm'),
		aliases: ['kwuarm', 'grimy kwuarm'],
		level: 54,
		xp: 11.3,
		inputItems: new Bank({ 'Grimy kwuarm': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Snapdragon'),
		aliases: ['snapdragon', 'grimy snapdragon'],
		level: 59,
		xp: 11.8,
		inputItems: new Bank({ 'Grimy snapdragon': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Cadantine'),
		aliases: ['cadantine', 'grimy cadantine'],
		level: 65,
		xp: 12.5,
		inputItems: new Bank({ 'Grimy cadantine': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Huasca'),
		aliases: ['huasca', 'grimy huasca'],
		level: 58,
		xp: 11.8,
		inputItems: new Bank({ 'Grimy huasca': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Lantadyme'),
		aliases: ['lantadyme', 'grimy lantadyme'],
		level: 67,
		xp: 13.1,
		inputItems: new Bank({ 'Grimy lantadyme': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Dwarf weed'),
		aliases: ['dwarf weed', 'grimy dwarf weed'],
		level: 70,
		xp: 13.8,
		inputItems: new Bank({ 'Grimy dwarf weed': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Torstol'),
		aliases: ['torstol', 'grimy torstol'],
		level: 75,
		xp: 15,
		inputItems: new Bank({ 'Grimy torstol': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	}
];

export default Grimy;
