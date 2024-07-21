import { Bank } from 'oldschooljs';

import getOSItem from '../../../../util/getOSItem';
import type { Mixable } from '../../../types';

const Grimy: Mixable[] = [
	{
		item: getOSItem('Guam leaf'),
		aliases: ['guam leaf', 'guam', 'grimy guam'],
		level: 3,
		xp: 2.5,
		inputItems: new Bank({ 'Grimy guam leaf': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Marrentill'),
		aliases: ['marrentill', 'grimy marrentill'],
		level: 5,
		xp: 3.8,
		inputItems: new Bank({ 'Grimy marrentill': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Tarromin'),
		aliases: ['tarromin', 'grimy tarromin'],
		level: 11,
		xp: 5,
		inputItems: new Bank({ 'Grimy tarromin': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Harralander'),
		aliases: ['harralander', 'grimy harralander'],
		level: 20,
		xp: 6.3,
		inputItems: new Bank({ 'Grimy harralander': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Ranarr weed'),
		aliases: ['ranarr weed', 'grimy ranarr', 'ranarr', 'grimy ranarr weed'],
		level: 25,
		xp: 7.5,
		inputItems: new Bank({ 'Grimy ranarr weed': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Toadflax'),
		aliases: ['toadflax', 'grimy toadflax'],
		level: 30,
		xp: 8,
		inputItems: new Bank({ 'Grimy toadflax': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Irit leaf'),
		aliases: ['irit leaf', 'irit', 'grimy irit', 'grimy irit leaf'],
		level: 40,
		xp: 8.8,
		inputItems: new Bank({ 'Grimy irit leaf': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Avantoe'),
		aliases: ['avantoe', 'grimy avantoe'],
		level: 48,
		xp: 10,
		inputItems: new Bank({ 'Grimy avantoe': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Kwuarm'),
		aliases: ['kwuarm', 'grimy kwuarm'],
		level: 54,
		xp: 11.3,
		inputItems: new Bank({ 'Grimy kwuarm': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Snapdragon'),
		aliases: ['snapdragon', 'grimy snapdragon'],
		level: 59,
		xp: 11.8,
		inputItems: new Bank({ 'Grimy snapdragon': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Cadantine'),
		aliases: ['cadantine', 'grimy cadantine'],
		level: 65,
		xp: 12.5,
		inputItems: new Bank({ 'Grimy cadantine': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Lantadyme'),
		aliases: ['lantadyme', 'grimy lantadyme'],
		level: 67,
		xp: 13.1,
		inputItems: new Bank({ 'Grimy lantadyme': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Dwarf weed'),
		aliases: ['dwarf weed', 'grimy dwarf weed'],
		level: 70,
		xp: 13.8,
		inputItems: new Bank({ 'Grimy dwarf weed': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: getOSItem('Torstol'),
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
