import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

const baseBankBass = () => new Bank().add('Oak plank', 2);
export const MountedFishBass: PoHObject[] = [
	{
		id: 13_488,
		name: 'Mounted bass',
		slot: 'mounted_fish',
		level: 36,
		itemCost: baseBankBass().add('Big bass'),
		refundItems: true
	}
];

const baseBankSwordfish = () => new Bank().add('Teak plank', 2);
export const MountedFishSwordfish: PoHObject[] = [
	{
		id: 13_489,
		name: 'Mounted swordfish',
		slot: 'mounted_fish',
		level: 56,
		itemCost: baseBankSwordfish().add('Big swordfish'),
		refundItems: true
	}
	
];

const baseBankShark = () => new Bank().add('Mahogany plank', 2);
export const MountedFishShark: PoHObject[] = [
	{
		id: 13_490,
		name: 'Mounted shark',
		slot: 'mounted_fish',
		level: 76,
		itemCost: baseBankShark().add('Big shark'),
		refundItems: true
	}
];

