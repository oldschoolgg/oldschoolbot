import { GearTypes } from '..';
import resolveItems from '../../util/resolveItems';
import { hasGearEquipped } from './hasGearEquipped';

export function hasEliteRangedVoidEquipped(setup: GearTypes.GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems([
			'Void ranger helm'
		]),
		body: resolveItems([
			'Elite void top'
		]),
		legs: resolveItems([
			'Elite void robe'
		]),
		hands: resolveItems([
			'Void knight gloves'
		])
	});
}
