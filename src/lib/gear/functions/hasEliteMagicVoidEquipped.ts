import { GearSetup, hasGearEquipped } from '..';
import resolveItems from '../../util/resolveItems';

export function hasEliteMagicVoidEquipped(setup: GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems(['Void mage helm']),
		body: resolveItems(['Elite void top']),
		legs: resolveItems(['Elite void robe']),
		hands: resolveItems(['Void knight gloves'])
	});
}
