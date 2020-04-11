import { GearTypes } from '..';
import hasItemEquipped from './hasItemEquipped';

export default function hasArrayOfItemsEquipped(items: number[], setup: GearTypes.GearSetup) {
	for (const item of items) {
		if (!hasItemEquipped(item, setup)) return false;
	}
	return true;
}
