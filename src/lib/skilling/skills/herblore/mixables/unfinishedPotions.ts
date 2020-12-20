import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const unfinishedPotions: Mixable[] = [
	{
		name: 'Guam potion (unf)',
		aliases: ['Guam potion (unf)', 'Guam (unf)', 'Guam potion'],
		id: itemID('Guam potion (unf)'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'guam leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Marrentill potion (unf)',
		aliases: ['Marrentill potion (unf)', 'Marrentill potion', 'Marrentill (unf)'],
		id: itemID('Marrentill potion (unf)'),
		level: 5,
		xp: 0,
		inputItems: resolveNameBank({ Marrentill: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Tarromin potion (unf)',
		aliases: ['Tarromin potion (unf)', 'Tarromin potion', 'Tarromin (unf)'],
		id: itemID('Tarromin potion (unf)'),
		level: 11,
		xp: 0,
		inputItems: resolveNameBank({ Tarromin: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Harralander potion (unf)',
		aliases: ['Harralander potion (unf)', 'Harralander potion', 'Harralander (unf)'],
		id: itemID('Harralander potion (unf)'),
		level: 20,
		xp: 0,
		inputItems: resolveNameBank({ Harralander: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Ranarr potion (unf)',
		aliases: ['Ranarr potion (unf)', 'Ranarr potion', 'Ranarr (unf)'],
		id: itemID('Ranarr potion (unf)'),
		level: 25,
		xp: 0,
		inputItems: resolveNameBank({ 'Ranarr weed': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Toadflax potion (unf)',
		aliases: ['Toadflax potion (unf)', 'Toadflax potion', 'Toadflax (unf)'],
		id: itemID('Toadflax potion (unf)'),
		level: 30,
		xp: 0,
		inputItems: resolveNameBank({ Toadflax: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Irit potion (unf)',
		aliases: ['Irit potion (unf)', 'Irit potion', 'Irit (unf)'],
		id: itemID('Irit potion (unf)'),
		level: 40,
		xp: 0,
		inputItems: resolveNameBank({ 'Irit leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Avantoe potion (unf)',
		aliases: ['Avantoe potion (unf)', 'Avantoe potion', 'Avantoe (unf)'],
		id: itemID('Avantoe potion (unf)'),
		level: 48,
		xp: 0,
		inputItems: resolveNameBank({ Avantoe: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Kwuarm potion (unf)',
		aliases: ['Kwuarm potion (unf)', 'Kwuarm potion', 'Kwuarm (unf)'],
		id: itemID('Kwuarm potion (unf)'),
		level: 54,
		xp: 0,
		inputItems: resolveNameBank({ Kwuarm: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Snapdragon potion (unf)',
		aliases: ['Snapdragon potion (unf)', 'Snapdragon potion', 'Snapdragon (unf)'],
		id: itemID('Snapdragon potion (unf)'),
		level: 59,
		xp: 0,
		inputItems: resolveNameBank({ Snapdragon: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Cadantine potion (unf)',
		aliases: ['Cadantine potion (unf)', 'Cadantine potion', 'Cadantine (unf)'],
		id: itemID('Cadantine potion (unf)'),
		level: 65,
		xp: 0,
		inputItems: resolveNameBank({ Cadantine: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Lantadyme potion (unf)',
		aliases: ['Lantadyme potion (unf)', 'Lantadyme potion', 'Lantadyme (unf)'],
		id: itemID('Lantadyme potion (unf)'),
		level: 67,
		xp: 0,
		inputItems: resolveNameBank({ Lantadyme: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Dwarf weed potion (unf)',
		aliases: ['Dwarf weed potion', 'Dwarf weed (unf)', 'Dwarf weed potion (unf)'],
		id: itemID('Dwarf weed potion (unf)'),
		level: 70,
		xp: 0,
		inputItems: resolveNameBank({ 'Dwarf weed': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Torstol potion (unf)',
		aliases: ['Torstol potion', 'Torstol (unf)', 'Torstol potion (unf)'],
		id: itemID('Torstol potion (unf)'),
		level: 75,
		xp: 0,
		inputItems: resolveNameBank({ Torstol: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	}
];

export default unfinishedPotions;
