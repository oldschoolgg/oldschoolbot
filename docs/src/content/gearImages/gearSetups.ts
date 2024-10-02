import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear } from '../../../../src/lib/data/cox';
import { getOSItem } from '../../../../src/lib/util/getOSItem';

export const gearSetupsForWIKI = [
	{ name: 'BIS_COX_Mage_Gear', gear: COXMaxMageGear, setup: 'mage', pet: getOSItem('Herbi') },
	{ name: 'BIS_COX_Melee_Gear', gear: COXMaxMeleeGear, setup: 'melee', pet: getOSItem('Herbi') },
	{ name: 'BIS_COX_Range_Gear', gear: COXMaxRangeGear, setup: 'range', pet: getOSItem('Herbi') }
];
