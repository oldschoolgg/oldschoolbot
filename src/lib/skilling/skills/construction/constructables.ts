import { resolveNameBank } from 'oldschooljs/dist/util';

import { ItemBank } from '../../../types';

export interface Constructable {
	name: string;
	input: ItemBank;
	xp: number;
	level: number;
	nails?: number;
	ticks: number;
}

const Constructables: Constructable[] = [
	{
		name: 'Crude wooden chair',
		input: resolveNameBank({ Plank: 2 }),
		xp: 58,
		level: 1,
		ticks: 5,
		nails: 2
	},
	{
		name: 'Wooden bookcase',
		input: resolveNameBank({ Plank: 4 }),
		xp: 115,
		level: 4,
		ticks: 5,
		nails: 4
	},
	{
		name: 'Wooden chair',
		input: resolveNameBank({ Plank: 3 }),
		xp: 87,
		level: 8,
		ticks: 5,
		nails: 3
	},
	{
		name: 'Wooden larder',
		input: resolveNameBank({ Plank: 4 }),
		xp: 228,
		level: 9,
		ticks: 5,
		nails: 8
	},
	{
		name: 'Rocking chair',
		input: resolveNameBank({ Plank: 3 }),
		xp: 87,
		level: 14,
		ticks: 5,
		nails: 3
	},
	{
		name: 'Repair bench',
		input: resolveNameBank({ 'Oak plank': 2 }),
		xp: 120,
		level: 15,
		ticks: 5
	},
	{
		name: 'Crafting table 1',
		input: resolveNameBank({ 'Oak plank': 4 }),
		xp: 240,
		level: 16,
		ticks: 5
	},
	{
		name: 'Oak dining table',
		input: resolveNameBank({ 'Oak plank': 4 }),
		xp: 240,
		level: 22,
		ticks: 5
	},
	{
		name: 'Carved oak table',
		input: resolveNameBank({ 'Oak plank': 6 }),
		xp: 360,
		level: 31,
		ticks: 5
	},
	{
		name: 'Oak larder',
		input: resolveNameBank({ 'Oak plank': 8 }),
		xp: 480,
		level: 33,
		ticks: 5
	},
	{
		name: 'Teak table',
		input: resolveNameBank({ 'Teak plank': 4 }),
		xp: 360,
		level: 38,
		ticks: 5
	},
	{
		name: 'Mahogany table',
		input: resolveNameBank({ 'Mahogany plank': 10 }),
		xp: 840,
		level: 52,
		ticks: 5
	},
	{
		name: 'Oak door',
		input: resolveNameBank({ 'Oak plank': 10 }),
		xp: 600,
		level: 74,
		ticks: 5
	}
];

export default Constructables;
