import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const PrayerAltars: PoHObject[] = [
	{
		id: 13_179,
		name: 'Oak altar',
		slot: 'prayerAltar',
		level: 45,
		itemCost: new Bank().add('Oak plank', 4)
	},
	{
		id: 13_182,
		name: 'Teak altar',
		slot: 'prayerAltar',
		level: 50,
		itemCost: new Bank().add('Teak plank', 4)
	},
	{
		id: 13_185,
		name: 'Cloth altar',
		slot: 'prayerAltar',
		level: 56,
		itemCost: new Bank().add('Teak plank', 4).add('Bolt of cloth', 2)
	},
	{
		id: 13_188,
		name: 'Mahogany altar',
		slot: 'prayerAltar',
		level: 60,
		itemCost: new Bank().add('Mahogany plank', 4).add('Bolt of cloth', 2)
	},
	{
		id: 13_191,
		name: 'Limestone altar',
		slot: 'prayerAltar',
		level: 64,
		itemCost: new Bank().add('Mahogany plank', 6).add('Bolt of cloth', 2).add('Limestone brick')
	},
	{
		id: 13_194,
		name: 'Marble altar',
		slot: 'prayerAltar',
		level: 70,
		itemCost: new Bank().add('Marble block', 2).add('Bolt of cloth', 2)
	},
	{
		id: 13_197,
		name: 'Gilded altar',
		slot: 'prayerAltar',
		level: 75,
		itemCost: new Bank().add('Marble block', 2).add('Bolt of cloth', 2).add('Gold leaf', 4)
	}
];
