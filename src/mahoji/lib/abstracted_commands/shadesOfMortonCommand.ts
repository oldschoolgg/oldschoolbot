import { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from '../../../lib/util/getOSItem';

type Remains = 'Loar' | 'Phrin' | 'Riyl' | 'Fiyr' | 'Asyn' | 'Urium';

interface ShadesLog {
	item: Item;
	fmLevel: number;
	fmXP: number;
	sacOilDoses: number;
	remains: Remains[];
}

const shadesLogs: ShadesLog[] = [
	{
		item: getOSItem('Pyre logs'),
		fmLevel: 5,
		fmXP: 50,
		sacOilDoses: 2,
		remains: ['Loar', 'Phrin']
	},
	{
		item: getOSItem('Oak pyre logs'),
		fmLevel: 20,
		fmXP: 70,
		sacOilDoses: 2,
		remains: ['Loar', 'Phrin']
	},
	{
		item: getOSItem('Willow pyre logs'),
		fmLevel: 35,
		fmXP: 100,
		sacOilDoses: 3,
		remains: ['Loar', 'Phrin', 'Riyl']
	},
	{
		item: getOSItem('Teak pyre logs'),
		fmLevel: 40,
		fmXP: 120,
		sacOilDoses: 3,
		remains: ['Loar', 'Phrin', 'Riyl']
	},
	{
		item: getOSItem('Arctic pyre logs'),
		fmLevel: 47,
		fmXP: 158,
		sacOilDoses: 2,
		remains: ['Loar', 'Phrin', 'Riyl']
	},
	{
		item: getOSItem('Maple pyre logs'),
		fmLevel: 50,
		fmXP: 175,
		sacOilDoses: 3,
		remains: ['Loar', 'Phrin', 'Riyl']
	},
	{
		item: getOSItem('Mahogany pyre logs'),
		fmLevel: 55,
		fmXP: 210,
		sacOilDoses: 4,
		remains: ['Loar', 'Phrin', 'Riyl']
	},
	{
		item: getOSItem('Yew pyre logs'),
		fmLevel: 65,
		fmXP: 255,
		sacOilDoses: 4,
		remains: ['Loar', 'Phrin', 'Riyl', 'Asyn']
	},
	{
		item: getOSItem('Magic pyre logs'),
		fmLevel: 80,
		fmXP: 404.5,
		sacOilDoses: 4,
		remains: ['Loar', 'Phrin', 'Riyl', 'Asyn', 'Fiyr']
	},
	{
		item: getOSItem('Redwood pyre logs'),
		fmLevel: 95,
		fmXP: 500,
		sacOilDoses: 4,
		remains: ['Loar', 'Phrin', 'Riyl', 'Asyn', 'Fiyr', 'Urium']
	}
];

export async function shadesOfMortonStartCommand() {}
