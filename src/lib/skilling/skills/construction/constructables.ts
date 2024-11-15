import { itemID } from 'oldschooljs/dist/util';

interface Constructable {
	id: number;
	name: string;
	input: [number, number];
	xp: number;
	level: number;
	nails?: number;
	ticks: number;
}

export const Plank = {
	Plank: itemID('Plank'),
	OakPlank: itemID('Oak plank'),
	TeakPlank: itemID('Teak plank'),
	MahoganyPlank: itemID('Mahogany plank')
} as const;

const Constructables: Constructable[] = [
	{
		id: itemID('Crude wooden chair'),
		name: 'Crude wooden chair',
		input: [Plank.Plank, 2],
		xp: 58,
		level: 1,
		ticks: 6.5,
		nails: 2
	},
	{
		id: itemID('Wooden bookcase'),
		name: 'Wooden bookcase',
		input: [Plank.Plank, 4],
		xp: 115,
		level: 4,
		ticks: 6.5,
		nails: 4
	},
	{
		id: itemID('Wooden chair'),
		name: 'Wooden chair',
		input: [Plank.Plank, 3],
		xp: 87,
		level: 8,
		ticks: 6.5,
		nails: 3
	},
	{
		id: itemID('Wooden larder'),
		name: 'Wooden larder',
		input: [Plank.Plank, 8],
		xp: 228,
		level: 9,
		ticks: 6.5,
		nails: 8
	},
	{
		id: itemID('Wood dining table'),
		name: 'Wood dining table',
		input: [Plank.Plank, 4],
		xp: 115,
		level: 10,
		ticks: 6.5,
		nails: 4
	},
	{
		id: itemID('Rocking chair'),
		name: 'Rocking chair',
		input: [Plank.Plank, 3],
		xp: 87,
		level: 14,
		ticks: 6.5,
		nails: 3
	},
	{
		id: itemID('Repair bench'),
		name: 'Repair bench',
		input: [Plank.OakPlank, 2],
		xp: 120,
		level: 15,
		ticks: 6.5
	},
	{
		id: itemID('Crafting table 1'),
		name: 'Crafting table 1',
		input: [Plank.OakPlank, 4],
		xp: 240,
		level: 16,
		ticks: 6.5
	},
	{
		id: itemID('Oak chair'),
		name: 'Oak chair',
		input: [Plank.OakPlank, 2],
		xp: 120,
		level: 19,
		ticks: 6.5
	},
	{
		id: itemID('Oak dining table'),
		name: 'Oak dining table',
		input: [Plank.OakPlank, 4],
		xp: 240,
		level: 22,
		ticks: 6.5
	},
	{
		id: itemID('Oak armchair'),
		name: 'Oak armchair',
		input: [Plank.OakPlank, 3],
		xp: 180,
		level: 26,
		ticks: 6.5
	},
	{
		id: itemID('Carved oak table'),
		name: 'Carved oak table',
		input: [Plank.OakPlank, 6],
		xp: 360,
		level: 31,
		ticks: 6.5
	},
	{
		id: itemID('Oak larder'),
		name: 'Oak larder',
		input: [Plank.OakPlank, 8],
		xp: 480,
		level: 33,
		ticks: 6
	},
	{
		id: itemID('Teak armchair'),
		name: 'Teak armchair',
		input: [Plank.TeakPlank, 2],
		xp: 180,
		level: 35,
		ticks: 6.5
	},
	{
		id: itemID('Teak table'),
		name: 'Teak table',
		input: [Plank.TeakPlank, 4],
		xp: 360,
		level: 38,
		ticks: 5.6
	},
	{
		id: 21_913,
		name: 'Mythical cape (mounted)',
		input: [Plank.TeakPlank, 3],
		xp: 370,
		level: 47,
		ticks: 5.2
	},
	{
		id: itemID('Mahogany armchair'),
		name: 'Mahogany armchair',
		input: [Plank.MahoganyPlank, 2],
		xp: 280,
		level: 50,
		ticks: 6.5
	},
	{
		id: itemID('Mahogany table'),
		name: 'Mahogany table',
		input: [Plank.MahoganyPlank, 6],
		xp: 840,
		level: 52,
		ticks: 5.6
	},
	{
		id: itemID('Teak garden bench'),
		name: 'Teak garden bench',
		input: [Plank.TeakPlank, 6],
		xp: 540,
		level: 66,
		ticks: 4.6
	},
	{
		id: itemID('Oak door'),
		name: 'Oak door',
		input: [Plank.OakPlank, 10],
		xp: 600,
		level: 74,
		ticks: 6.5
	},
	{
		id: itemID('Gnome bench'),
		name: 'Gnome bench',
		input: [Plank.MahoganyPlank, 6],
		xp: 840,
		level: 77,
		ticks: 4.6
	}
];

export default Constructables;
