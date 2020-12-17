import { GearTypes } from '..';
import resolveItems from '../../util/resolveItems';
import { hasGearEquipped } from './hasGearEquipped';

export function hasMeleeVoidEquipped(setup: GearTypes.GearSetup) {
	return hasGearEquipped(setup, {
		head: resolveItems([
			'Void melee helm'
		]),
		body: resolveItems([
			'Void knight top'
		]),
		legs: resolveItems([
			'Void knight robe'
		]),
		hands: resolveItems([
			'Void knight gloves'
		])
	});
}
