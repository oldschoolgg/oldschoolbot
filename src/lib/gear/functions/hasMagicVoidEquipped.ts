import { GearTypes } from '..';
import resolveItems from '../../util/resolveItems';
import { hasGearEquipped } from './hasGearEquipped';

export function hasMagicVoidEquipped(setup: GearTypes.GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems(['Void mage helm']),
		body: resolveItems(['Void knight top']),
		legs: resolveItems(['Void knight robe']),
		hands: resolveItems(['Void knight gloves'])
	});
}
