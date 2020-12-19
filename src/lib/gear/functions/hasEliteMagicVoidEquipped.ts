import { GearTypes } from '..';
import resolveItems from '../../util/resolveItems';
import { hasGearEquipped } from './hasGearEquipped';

export function hasEliteMagicVoidEquipped(setup: GearTypes.GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems(['Void mage helm']),
		body: resolveItems(['Elite void top']),
		legs: resolveItems(['Elite void robe']),
		hands: resolveItems(['Void knight gloves'])
	});
}
