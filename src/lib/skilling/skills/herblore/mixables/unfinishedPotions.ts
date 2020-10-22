import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const unfinishedPotions: Mixable[] = [
	{
		name: 'Guam potion (unf)',
		id: itemID('Guam potion (unf)'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'guam leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Marrentill potion (unf)',
		id: itemID('Marrentill potion (unf)'),
		level: 5,
		xp: 0,
		inputItems: resolveNameBank({ Marrentill: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Tarromin potion (unf)',
		id: itemID('Tarromin potion (unf)'),
		level: 11,
		xp: 0,
		inputItems: resolveNameBank({ Tarromin: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Harralander potion (unf)',
		id: itemID('Harralander potion (unf)'),
		level: 20,
		xp: 0,
		inputItems: resolveNameBank({ Harralander: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Ranarr potion (unf)',
		id: itemID('Ranarr potion (unf)'),
		level: 25,
		xp: 0,
		inputItems: resolveNameBank({ 'Ranarr weed': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Toadflax potion (unf)',
		id: itemID('Toadflax potion (unf)'),
		level: 30,
		xp: 0,
		inputItems: resolveNameBank({ Toadflax: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Irit potion (unf)',
		id: itemID('Irit potion (unf)'),
		level: 40,
		xp: 0,
		inputItems: resolveNameBank({ 'Irit leaf': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Avantoe potion (unf)',
		id: itemID('Avantoe potion (unf)'),
		level: 48,
		xp: 0,
		inputItems: resolveNameBank({ Avantoe: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Kwuarm potion (unf)',
		id: itemID('Kwuarm potion (unf)'),
		level: 54,
		xp: 0,
		inputItems: resolveNameBank({ Kwuarm: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Snapdragon potion (unf)',
		id: itemID('Snapdragon potion (unf)'),
		level: 59,
		xp: 0,
		inputItems: resolveNameBank({ Snapdragon: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Cadantine potion (unf)',
		id: itemID('Cadantine potion (unf)'),
		level: 65,
		xp: 0,
		inputItems: resolveNameBank({ Cadantine: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Lantadyme potion (unf)',
		id: itemID('Lantadyme potion (unf)'),
		level: 67,
		xp: 0,
		inputItems: resolveNameBank({ Lantadyme: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Dwarf weed potion (unf)',
		id: itemID('Dwarf weed potion (unf)'),
		level: 70,
		xp: 0,
		inputItems: resolveNameBank({ 'Dwarf weed': 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	},
	{
		name: 'Torstol potion (unf)',
		id: itemID('Torstol potion (unf)'),
		level: 75,
		xp: 0,
		inputItems: resolveNameBank({ Torstol: 1, 'Vial of water': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0.3,
		zuhar: true
	}
];

export default unfinishedPotions;
