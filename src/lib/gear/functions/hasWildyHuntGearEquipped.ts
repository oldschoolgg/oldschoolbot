import { GearTypes } from '..';
import resolveItems from '../../util/resolveItems';
import { hasGearEquipped } from './hasGearEquipped';

export function hasWildyHuntGearEquipped(setup: GearTypes.GearSetup) {
	return hasGearEquipped(setup, {
		body: resolveItems(["Karil's leathertop", "Black d'hide body"]),
		legs: resolveItems(["Karil's leatherskirt", "Black d'hide chaps"])
	});
}
