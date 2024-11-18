import type { Item } from 'oldschooljs';
import type { PvMMethod } from '../../../../lib/constants';
import type { PrimaryGearSetupType } from '../../../../lib/gear/types';
import getOSItem from '../../../../lib/util/getOSItem';

interface StaticEquippedItemBoost {
	item: Item;
	attackStyle: PrimaryGearSetupType;
	anyRequiredPVMMethod: PvMMethod[];
	percentageBoost: number;
}

export const staticEquippedItemBoosts: StaticEquippedItemBoost[] = [
	{
		item: getOSItem('Kodai wand'),
		attackStyle: 'mage',
		anyRequiredPVMMethod: ['barrage', 'burst'],
		percentageBoost: 15
	}
];
