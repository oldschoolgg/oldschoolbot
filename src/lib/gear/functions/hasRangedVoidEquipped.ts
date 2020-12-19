import { GearTypes } from '..';
import resolveItems from '../../util/resolveItems';
import { hasGearEquipped } from './hasGearEquipped';

export function hasRangedVoidEquipped(setup: GearTypes.GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems(['Void ranger helm']),
		body: resolveItems(['Void knight top']),
		legs: resolveItems(['Void knight robe']),
		hands: resolveItems(['Void knight gloves'])
	});
}
