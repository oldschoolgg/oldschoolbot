import { allDyedItems } from '@/lib/bso/dyedItems.js';

import { EquipmentSlot, Items } from 'oldschooljs';
import type { GearStat } from 'oldschooljs/gear';

import { getSimilarItems } from '@/lib/data/similarItems.js';
import { allEquippableItems } from '@/lib/discord/presetCommandOptions.js';
import { Gear } from '@/lib/structures/Gear.js';

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
					usedItems.add(Items.itemNameFromId(item)!);
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
