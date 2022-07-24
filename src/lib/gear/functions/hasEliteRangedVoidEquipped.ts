import resolveItems from '../../util/resolveItems';
import { GearSetup, hasGearEquipped } from '..';

export function hasEliteRangedVoidEquipped(setup: GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems(['Void ranger helm']),
		body: resolveItems(['Elite void top']),
		legs: resolveItems(['Elite void robe']),
		hands: resolveItems(['Void knight gloves'])
	});
}
