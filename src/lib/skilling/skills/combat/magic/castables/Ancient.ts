import { resolveNameBank } from '../../../../../util';
import { Castable } from '../../../../types';

const Ancient: Castable[] = [
	{
		name: 'Smoke rush',
		level: 50,
		magicxp: 30,
		baseMaxHit: 13,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Air rune': 1,
			'Fire rune': 1,
			'Chaos rune': 2,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Shadow rush',
		level: 52,
		magicxp: 31,
		baseMaxHit: 14,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Air rune': 1,
			'Chaos rune': 2,
			'Death rune': 2,
			'Soul rune': 1
		}),
		tickRate: 5
	},
	{
		name: 'Blood rush',
		level: 56,
		magicxp: 33,
		baseMaxHit: 15,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Blood rune': 1,
			'Chaos rune': 2,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Ice rush',
		level: 58,
		magicxp: 34,
		baseMaxHit: 16,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Water rune': 2,
			'Chaos rune': 2,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Smoke burst',
		level: 62,
		magicxp: 36,
		baseMaxHit: 17,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Air rune': 2,
			'Fire rune': 2,
			'Chaos rune': 4,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Shadow burst',
		level: 64,
		magicxp: 37,
		baseMaxHit: 18,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Air rune': 1,
			'Chaos rune': 4,
			'Death rune': 2,
			'Soul rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Blood burst',
		level: 68,
		magicxp: 39,
		baseMaxHit: 21,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Blood rune': 2,
			'Chaos rune': 4,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Ice burst',
		level: 70,
		magicxp: 40,
		baseMaxHit: 22,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Water rune': 4,
			'Chaos rune': 4,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Smoke blitz',
		level: 74,
		magicxp: 42,
		baseMaxHit: 23,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Air rune': 2,
			'Fire rune': 2,
			'Blood rune': 2,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Shadow blitz',
		level: 76,
		magicxp: 43,
		baseMaxHit: 24,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Air rune': 2,
			'Blood rune': 2,
			'Death rune': 2,
			'Soul rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Blood blitz',
		level: 80,
		magicxp: 45,
		baseMaxHit: 25,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Blood rune': 4,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Ice blitz',
		level: 82,
		magicxp: 46,
		baseMaxHit: 26,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Water rune': 3,
			'Blood rune': 2,
			'Death rune': 2
		}),
		tickRate: 5
	},
	{
		name: 'Smoke barrage',
		level: 86,
		magicxp: 48,
		baseMaxHit: 27,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Air rune': 4,
			'Fire rune': 4,
			'Blood rune': 2,
			'Death rune': 4
		}),
		tickRate: 5
	},
	{
		name: 'Shadow barrage',
		level: 88,
		magicxp: 49,
		baseMaxHit: 28,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Air rune': 4,
			'Blood rune': 2,
			'Death rune': 4,
			'Soul rune': 3
		}),
		tickRate: 5
	},
	{
		name: 'Blood barrage',
		level: 92,
		magicxp: 51,
		baseMaxHit: 29,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Blood rune': 4,
			'Death rune': 4,
			'Soul rune': 1
		}),
		tickRate: 5
	},
	{
		name: 'Ice barrage',
		level: 94,
		magicxp: 52,
		baseMaxHit: 30,
		category: 'Combat',
		inputItems: resolveNameBank({
			'Water rune': 6,
			'Blood rune': 2,
			'Death rune': 4
		}),
		tickRate: 5
	},
	{
		name: 'Edgeville home teleport',
		level: 0,
		magicxp: 0,
		category: 'Teleport',
		inputItems: resolveNameBank({}),
		tickRate: 22
	},
	{
		name: 'Paddewwa teleport',
		level: 54,
		magicxp: 64,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Air rune': 1, 'Fire rune': 1, 'Law rune': 1 }),
		tickRate: 5
	},
	{
		name: 'Senntisten teleport',
		level: 60,
		magicxp: 70,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Soul rune': 1, 'Law rune': 2 }),
		tickRate: 5
	},
	{
		name: 'Kharyrll teleport',
		level: 66,
		magicxp: 76,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Blood rune': 1, 'Law rune': 2 }),
		tickRate: 5
	},
	{
		name: 'Lassar teleport',
		level: 72,
		magicxp: 82,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 4, 'Law rune': 2 }),
		tickRate: 5
	},
	{
		name: 'Dareeyak teleport',
		level: 78,
		magicxp: 88,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Air rune': 2, 'Fire rune': 3, 'Law rune': 2 }),
		tickRate: 5
	},
	{
		name: 'Carrallangar teleport',
		level: 84,
		magicxp: 94,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Soul rune': 2, 'Law rune': 2 }),
		tickRate: 5
	},
	{
		name: 'Teleport to bounty target',
		level: 85,
		magicxp: 45,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Chaos rune': 1, 'Death rune': 1, 'Law rune': 1 }),
		tickRate: 4
	},
	{
		name: 'Annakarl teleport',
		level: 90,
		magicxp: 100,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Blood rune': 2, 'Law rune': 2 }),
		tickRate: 5
	},
	{
		name: 'Ghorrock teleport',
		level: 96,
		magicxp: 106,
		category: 'Teleport',
		inputItems: resolveNameBank({ 'Water rune': 8, 'Law rune': 2 }),
		tickRate: 5
	}
];

export default Ancient;
