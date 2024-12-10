import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { allEquippableItems } from '../../mahoji/lib/mahojiCommandOptions';
import { getSimilarItems } from '../data/similarItems';
import { allDyedItems } from '../dyedItems';
import type { GearStat } from '../gear/types';
import { Gear } from '../structures/Gear';
import { itemNameFromID } from './smallUtils';

export function findBestGearSetups(stat: GearStat): Gear[] {
	const finalSetups: Gear[] = [];

	const usedItems = new Set<string>();

	function findItem(slots: EquipmentSlot[]) {
		return allEquippableItems
			.filter(
				i =>
					i.equipment?.[stat] !== undefined &&
					i.equipment[stat] > 0 &&
					!allDyedItems.includes(i.id) &&
					!usedItems.has(i.name)
			)
			.sort((a, b) => b.equipment![stat] - a.equipment![stat])
			.find(i => {
				if (!slots.includes(i.equipment!.slot)) return false;
				if (usedItems.has(i.name)) return false;
				for (const item of getSimilarItems(i.id)) {
					usedItems.add(itemNameFromID(item)!);
				}
				return true;
			})!;
	}

	for (let i = 0; i < 5; i++) {
		const gear = new Gear();
		for (const slot of [
			EquipmentSlot.Ammo,
			EquipmentSlot.Cape,
			EquipmentSlot.Head,
			EquipmentSlot.Feet,
			EquipmentSlot.Hands,
			EquipmentSlot.Legs,
			EquipmentSlot.Neck,
			EquipmentSlot.Ring,
			EquipmentSlot.Body
		]) {
			const item = findItem([slot]);
			if (item) {
				gear.equip(item);
			}
		}

		const firstBestWeapon = findItem([EquipmentSlot.Weapon, EquipmentSlot.TwoHanded]);
		if (firstBestWeapon) {
			gear.equip(firstBestWeapon);

			if (firstBestWeapon.equipment!.slot === EquipmentSlot.Weapon) {
				const bestShield = findItem([EquipmentSlot.Shield]);
				if (bestShield) {
					gear.equip(bestShield);
				}
			}
		}

		finalSetups.push(gear);
	}

	return finalSetups;
}
