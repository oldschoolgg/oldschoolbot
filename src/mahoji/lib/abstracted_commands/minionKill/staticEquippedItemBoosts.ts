import { type Item, Items } from 'oldschooljs';

import type { PvMMethod } from '@/lib/constants';
import type { PrimaryGearSetupType } from '@/lib/gear/types';

interface StaticEquippedItemBoost {
	item: Item;
	attackStyle: PrimaryGearSetupType;
	anyRequiredPVMMethod: PvMMethod[];
	percentageBoost: number;
}

export const staticEquippedItemBoosts: StaticEquippedItemBoost[] = [
	{
		item: Items.getOrThrow('Kodai wand'),
		attackStyle: 'mage',
		anyRequiredPVMMethod: ['barrage', 'burst'],
		percentageBoost: 15
	}
];
