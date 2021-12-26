import { Castable } from './index';
import { Bank } from 'oldschooljs';
import { MagicTypes } from '../../types';

const Ancients: Castable[] = [
  // No implemented use
	// {
	// 	name: 'Edgeville home teleport',
	// 	levels: { Magic: 1 },
	// 	xp: { Magic: 0 },
  //   input: new Bank(),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 22,
	// 	qpRequired: 50
	// },
	{
		name: 'Smoke rush',
		levels: { Magic: 50 },
		xp: { Magic: 30 },
    input: new Bank().add('Air rune', 1).add('Fire rune', 1).add('Chaos rune', 2).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Shadow rush',
		levels: { Magic: 52 },
		xp: { Magic: 31 },
    input: new Bank().add('Air rune', 1).add('Chaos rune', 2).add('Death rune', 2).add('Soul rune', 1),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Paddewwa teleport',
		levels: { Magic: 54 },
		xp: { Magic: 64 },
    input: new Bank().add('Air rune', 1).add('Fire rune', 1).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Blood rush',
		levels: { Magic: 56 },
		xp: { Magic: 33 },
    input: new Bank().add('Blood rune', 1).add('Chaos rune', 2).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Ice rush',
		levels: { Magic: 58 },
		xp: { Magic: 34 },
    input: new Bank().add('Water rune', 2).add('Chaos rune', 2).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Senntisten teleport',
		levels: { Magic: 60 },
		xp: { Magic: 70 },
    input: new Bank().add('Law rune', 2).add('Soul rune', 1),
		category: MagicTypes.Teleport,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Smoke burst',
		levels: { Magic: 62 },
		xp: { Magic: 36 },
    input: new Bank().add('Air rune', 2).add('Fire rune', 2).add('Chaos rune', 4).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Shadow burst',
		levels: { Magic: 64 },
		xp: { Magic: 37 },
    input: new Bank().add('Air rune', 1).add('Chaos rune', 4).add('Death rune', 2).add('Soul rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Kharyrll teleport',
		levels: { Magic: 66 },
		xp: { Magic: 76 },
    input: new Bank().add('Blood rune', 1).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Blood burst',
		levels: { Magic: 68 },
		xp: { Magic: 39 },
    input: new Bank().add('Blood rune', 2).add('Chaos rune', 4).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Ice burst',
		levels: { Magic: 70 },
		xp: { Magic: 40 },
    input: new Bank().add('Water rune', 4).add('Chaos rune', 4).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Lassar teleport',
		levels: { Magic: 72 },
		xp: { Magic: 82 },
    input: new Bank().add('Water rune', 4).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Smoke blitz',
		levels: { Magic: 74 },
		xp: { Magic: 42 },
    input: new Bank().add('Air rune', 2).add('Fire rune', 2).add('Blood rune', 2).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Shadow blitz',
		levels: { Magic: 76 },
		xp: { Magic: 43 },
    input: new Bank().add('Air rune', 2).add('Blood rune', 2).add('Death rune', 2).add('Soul rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Dareeyak teleport',
		levels: { Magic: 78 },
		xp: { Magic: 88 },
    input: new Bank().add('Air rune', 2).add('Fire rune', 3).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Blood blitz',
		levels: { Magic: 80 },
		xp: { Magic: 45 },
    input: new Bank().add('Blood rune', 4).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Ice blitz',
		levels: { Magic: 82 },
		xp: { Magic: 46 },
    input: new Bank().add('Water rune', 3).add('Blood rune', 2).add('Death rune', 2),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Carrallangar teleport',
		levels: { Magic: 84 },
		xp: { Magic: 94 },
    input: new Bank().add('Law rune', 2).add('Soul rune', 2),
		category: MagicTypes.Teleport,
		ticks: 5,
		qpRequired: 50
	},
  // No implemented use
	// {
	// 	name: 'Teleport to target',
	// 	levels: { Magic: 85 },
	// 	xp: { Magic: 45 },
  //   input: new Bank().add('Chaos rune', 1).add('Death rune', 1).add('Law rune', 1),
	// 	category: MagicTypes.Teleport,
	// 	ticks: 5,
	// 	qpRequired: 50
	// },
	{
		name: 'Smoke barrage',
		levels: { Magic: 86 },
		xp: { Magic: 48 },
    input: new Bank().add('Air rune', 4).add('Fire rune', 4).add('Blood rune', 2).add('Death rune', 4),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Shadow barrage',
		levels: { Magic: 88 },
		xp: { Magic: 49 },
    input: new Bank().add('Air rune', 4).add('Blood rune', 2).add('Death rune', 4).add('Soul rune', 3),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Annakarl teleport',
		levels: { Magic: 90 },
		xp: { Magic: 100 },
    input: new Bank().add('Blood rune', 2).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Blood barrage',
		levels: { Magic: 92 },
		xp: { Magic: 51 },
    input: new Bank().add('Blood rune', 4).add('Death rune', 4).add('Soul rune', 1),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Ice barrage',
		levels: { Magic: 94 },
		xp: { Magic: 52 },
    input: new Bank().add('Water rune', 6).add('Blood rune', 2).add('Death rune', 4),
		category: MagicTypes.Combat,
		ticks: 5,
		qpRequired: 50
	},
	{
		name: 'Ghorrock teleport',
		levels: { Magic: 96 },
		xp: { Magic: 106 },
    input: new Bank().add('Water rune', 8).add('Law rune', 2),
		category: MagicTypes.Teleport,
		ticks: 5,
		qpRequired: 50
	}
];

export default Ancients;