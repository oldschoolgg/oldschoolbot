import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const Grimy: Mixable[] = [
	{
		name: 'Guam leaf',
		aliases: ['Guam', 'Grimy guam'],
		id: itemID('Guam leaf'),
		level: 1,
		xp: 2.5,
		inputItems: resolveNameBank({ 'Grimy guam leaf': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Marrentill',
		aliases: ['Grimy marrentill'],
		id: itemID('Marrentill'),
		level: 5,
		xp: 3.8,
		inputItems: resolveNameBank({ 'Grimy marrentill': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Tarromin',
		aliases: ['Grimy tarromin'],
		id: itemID('Tarromin'),
		level: 11,
		xp: 5,
		inputItems: resolveNameBank({ 'Grimy tarromin': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Harralander',
		aliases: ['Grimy harralander'],
		id: itemID('Harralander'),
		level: 20,
		xp: 6.3,
		inputItems: resolveNameBank({ 'Grimy harralander': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Ranarr weed',
		aliases: ['Grimy ranarr', 'Ranarr', 'Grimy ranarr weed'],
		id: itemID('Ranarr weed'),
		level: 25,
		xp: 7.5,
		inputItems: resolveNameBank({ 'Grimy ranarr weed': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Toadflax',
		aliases: ['Grimy toadflax'],
		id: itemID('Toadflax'),
		level: 30,
		xp: 8,
		inputItems: resolveNameBank({ 'Grimy toadflax': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Irit leaf',
		aliases: ['Irit', 'Grimy irit', 'Grimy irit leaf'],
		id: itemID('Irit leaf'),
		level: 40,
		xp: 8.8,
		inputItems: resolveNameBank({ 'Grimy irit leaf': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Avantoe',
		aliases: ['Grimy avantoe'],
		id: itemID('Avantoe'),
		level: 48,
		xp: 10,
		inputItems: resolveNameBank({ 'Grimy avantoe': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Kwuarm',
		aliases: ['Grimy kwuarm'],
		id: itemID('Kwuarm'),
		level: 54,
		xp: 11.3,
		inputItems: resolveNameBank({ 'Grimy kwuarm': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Snapdragon',
		aliases: ['Grimy snapdragon'],
		id: itemID('Snapdragon'),
		level: 59,
		xp: 11.8,
		inputItems: resolveNameBank({ 'Grimy snapdragon': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Cadantine',
		aliases: ['Grimy cadantine'],
		id: itemID('Cadantine'),
		level: 65,
		xp: 12.5,
		inputItems: resolveNameBank({ 'Grimy cadantine': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Lantadyme',
		aliases: ['Grimy lantadyme'],
		id: itemID('Lantadyme'),
		level: 67,
		xp: 13.1,
		inputItems: resolveNameBank({ 'Grimy lantadyme': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Dwarf weed',
		aliases: ['Grimy dwarf weed'],
		id: itemID('Dwarf weed'),
		level: 70,
		xp: 13.8,
		inputItems: resolveNameBank({ 'Grimy dwarf weed': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	},
	{
		name: 'Torstol',
		aliases: ['Grimy torstol'],
		id: itemID('Torstol'),
		level: 75,
		xp: 15,
		inputItems: resolveNameBank({ 'Grimy torstol': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zuhar: true
	}
];

export default Grimy;
