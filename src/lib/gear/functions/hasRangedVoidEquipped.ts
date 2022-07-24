import resolveItems from '../../util/resolveItems';
import { GearSetup, hasGearEquipped } from '..';

export function hasRangedVoidEquipped(setup: GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems(['Void ranger helm']),
		body: resolveItems(['Void knight top']),
		legs: resolveItems(['Void knight robe']),
		hands: resolveItems(['Void knight gloves'])
	});
}
