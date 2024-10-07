import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear } from '../../../../src/lib/data/cox';
import { constructGearSetup } from '../../../../src/lib/structures/Gear';
import { getOSItem } from '../../../../src/lib/util/getOSItem';

const exampleGear = constructGearSetup({
	head: 'Gold helmet',
	neck: 'Seal of passage',
	body: 'Granite body',
	cape: 'Imbued saradomin cape',
	hands: 'Elven gloves',
	legs: 'Granite legs',
	feet: 'Echo boots',
	'2h': 'Barrelchest anchor',
	ring: 'Granite ring'
});

export const gearSetupsForWIKI = [
	{ name: 'EXAMPLE_WIKI_Gear', gear: exampleGear, setup: 'melee', pet: getOSItem('Herbi') },
	{ name: 'BIS_COX_Mage_Gear', gear: COXMaxMageGear, setup: 'mage', pet: getOSItem('Herbi') },
	{ name: 'BIS_COX_Melee_Gear', gear: COXMaxMeleeGear, setup: 'melee', pet: getOSItem('Herbi') },
	{ name: 'BIS_COX_Range_Gear', gear: COXMaxRangeGear, setup: 'range', pet: getOSItem('Herbi') }
];
