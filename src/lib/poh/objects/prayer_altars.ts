import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const PrayerAltars: PoHObject[] = [
	{
		id: 13_179,
		name: 'Oak altar',
		slot: 'prayer_altar',
		level: 45,
		itemCost: new Bank().add('Oak plank', 4)
	},
	{
		id: 13_182,
		name: 'Teak altar',
		slot: 'prayer_altar',
		level: 50,
		itemCost: new Bank().add('Teak plank', 4)
	},
	{
		id: 13_185,
		name: 'Cloth altar',
		slot: 'prayer_altar',
		level: 56,
		itemCost: new Bank().add('Teak plank', 4).add('Bolt of cloth', 2)
	},
	{
		id: 13_188,
		name: 'Mahogany altar',
		slot: 'prayer_altar',
		level: 60,
		itemCost: new Bank().add('Mahogany plank', 4).add('Bolt of cloth', 2)
	},
	{
		id: 13_191,
		name: 'Limestone altar',
		slot: 'prayer_altar',
		level: 64,
		itemCost: new Bank().add('Mahogany plank', 6).add('Bolt of cloth', 2).add('Limestone brick')
	},
	{
		id: 13_194,
		name: 'Marble altar',
		slot: 'prayer_altar',
		level: 70,
		itemCost: new Bank().add('Marble block', 2).add('Bolt of cloth', 2)
	},
	{
		id: 13_197,
		name: 'Gilded altar',
		slot: 'prayer_altar',
		level: 75,
		itemCost: new Bank().add('Marble block', 2).add('Bolt of cloth', 2).add('Gold leaf', 4)
	}
];
