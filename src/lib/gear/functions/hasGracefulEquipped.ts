import { GearTypes } from '..';
import { itemID } from '../../util';
import hasArrayOfItemsEquipped from './hasArrayOfItemsEquipped';
import hasItemEquipped from './hasItemEquipped';

export default function hasGracefulEquipped(setup: GearTypes.GearSetup) {
	if (
		hasArrayOfItemsEquipped(
			[
				'Graceful hood',
				'Graceful top',
				'Graceful legs',
				'Graceful gloves',
				'Graceful boots'
			].map(itemID),
			setup
		) &&
		(hasItemEquipped(itemID('Graceful cape'), setup) ||
			hasItemEquipped(itemID('Agility cape'), setup) ||
			hasItemEquipped(itemID('Agility cape(t)'), setup))
	) {
		return true;
	}
	return false;
}
