import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const unfinishedPotions: Mixable[] = [
	{
		name: 'Guam potion (unf)',
		aliases: ['guam potion (unf)', 'guam (unf)', 'guam potion'],
		id: itemID('Guam potion (unf)'),
		level: 3,
		xp: 0,
		inputItems: resolveNameBank({ 'guam leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zahur: true
	},
	{
		name: 'Marrentill potion (unf)',
		aliases: ['marrentill potion (unf)', 'marrentill potion', 'marrentill (unf)'],
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
		aliases: ['tarromin potion (unf)', 'tarromin potion', 'tarromin (unf)'],
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
		aliases: ['harralander potion (unf)', 'harralander potion', 'harralander (unf)'],
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
		aliases: ['ranarr potion (unf)', 'ranarr potion', 'ranarr (unf)'],
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
		aliases: ['toadflax potion (unf)', 'toadflax potion', 'toadflax (unf)'],
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
		aliases: ['irit potion (unf)', 'irit potion', 'irit (unf)'],
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
		aliases: ['avantoe potion (unf)', 'avantoe potion', 'avantoe (unf)'],
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
		aliases: ['kwuarm potion (unf)', 'kwuarm potion', 'kwuarm (unf)'],
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
		aliases: ['snapdragon potion (unf)', 'snapdragon potion', 'snapdragon (unf)'],
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
		aliases: ['cadantine potion (unf)', 'cadantine potion', 'cadantine (unf)'],
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
		aliases: ['lantadyme potion (unf)', 'lantadyme potion', 'lantadyme (unf)'],
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
		aliases: ['dwarf weed potion', 'dwarf weed (unf)', 'dwarf weed potion (unf)'],
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
		aliases: ['torstol potion', 'torstol (unf)', 'torstol potion (unf)'],
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
