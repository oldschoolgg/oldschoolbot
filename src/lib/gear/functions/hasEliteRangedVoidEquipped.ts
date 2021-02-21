import { GearSetup, hasGearEquipped } from '..';
import resolveItems from '../../util/resolveItems';

export function hasEliteRangedVoidEquipped(setup: GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems(['Void ranger helm']),
		body: resolveItems(['Elite void top']),
		legs: resolveItems(['Elite void robe']),
		hands: resolveItems(['Void knight gloves'])
	});
}
