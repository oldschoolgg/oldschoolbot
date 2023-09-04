import { Bank } from 'oldschooljs';

import getOSItem from '../../../../util/getOSItem';
import { Mixable } from '../../../types';

const unfinishedPotions: Mixable[] = [
	{
		item: getOSItem('Guam potion (unf)'),
		aliases: ['guam potion (unf)', 'guam (unf)', 'guam potion'],
		level: 3,
		xp: 0,
		inputItems: new Bank({ 'guam leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Marrentill potion (unf)'),
		aliases: ['marrentill potion (unf)', 'marrentill potion', 'marrentill (unf)'],
		level: 5,
		xp: 0,
		inputItems: new Bank({ Marrentill: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Tarromin potion (unf)'),
		aliases: ['tarromin potion (unf)', 'tarromin potion', 'tarromin (unf)'],
		level: 11,
		xp: 0,
		inputItems: new Bank({ Tarromin: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Harralander potion (unf)'),
		aliases: ['harralander potion (unf)', 'harralander potion', 'harralander (unf)'],
		level: 20,
		xp: 0,
		inputItems: new Bank({ Harralander: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Ranarr potion (unf)'),
		aliases: ['ranarr potion (unf)', 'ranarr potion', 'ranarr (unf)'],
		level: 25,
		xp: 0,
		inputItems: new Bank({ 'Ranarr weed': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Toadflax potion (unf)'),
		aliases: ['toadflax potion (unf)', 'toadflax potion', 'toadflax (unf)'],
		level: 30,
		xp: 0,
		inputItems: new Bank({ Toadflax: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Irit potion (unf)'),
		aliases: ['irit potion (unf)', 'irit potion', 'irit (unf)'],
		level: 40,
		xp: 0,
		inputItems: new Bank({ 'Irit leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Avantoe potion (unf)'),
		aliases: ['avantoe potion (unf)', 'avantoe potion', 'avantoe (unf)'],
		level: 48,
		xp: 0,
		inputItems: new Bank({ Avantoe: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Kwuarm potion (unf)'),
		aliases: ['kwuarm potion (unf)', 'kwuarm potion', 'kwuarm (unf)'],
		level: 54,
		xp: 0,
		inputItems: new Bank({ Kwuarm: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Snapdragon potion (unf)'),
		aliases: ['snapdragon potion (unf)', 'snapdragon potion', 'snapdragon (unf)'],
		level: 59,
		xp: 0,
		inputItems: new Bank({ Snapdragon: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Cadantine potion (unf)'),
		aliases: ['cadantine potion (unf)', 'cadantine potion', 'cadantine (unf)'],
		level: 65,
		xp: 0,
		inputItems: new Bank({ Cadantine: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Lantadyme potion (unf)'),
		aliases: ['lantadyme potion (unf)', 'lantadyme potion', 'lantadyme (unf)'],
		level: 67,
		xp: 0,
		inputItems: new Bank({ Lantadyme: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Dwarf weed potion (unf)'),
		aliases: ['dwarf weed potion', 'dwarf weed (unf)', 'dwarf weed potion (unf)'],
		level: 70,
		xp: 0,
		inputItems: new Bank({ 'Dwarf weed': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		item: getOSItem('Torstol potion (unf)'),
		aliases: ['torstol potion', 'torstol (unf)', 'torstol potion (unf)'],
		level: 75,
		xp: 0,
		inputItems: new Bank({ Torstol: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	}
];

export default unfinishedPotions;
