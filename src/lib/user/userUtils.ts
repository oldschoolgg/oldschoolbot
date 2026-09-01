import { EquipmentSlot, type GearSetup, type GearSetupType } from '@oldschoolgg/gear';
import { Bank, Items } from 'oldschooljs';

import { Gear } from '@/lib/structures/Gear.js';

export async function validateEquippedGear(user: MUser) {
	const itemsUnequippedAndRefunded = new Bank();
	for (const [gearSetupName, gear] of Object.entries(user.gear) as [GearSetupType, Gear][]) {
		if (!(gear instanceof Gear)) {
			throw new Error('Invalid gear instance, received: ' + typeof gear);
		}
		const gearSetup: GearSetup = gear.raw();
		if (gearSetup['2h'] !== null) {
			if (gearSetup.weapon?.item) {
				const { refundBank } = await user.forceUnequip(
					gearSetupName,
					EquipmentSlot.Weapon,
					'2h Already equipped'
				);
				itemsUnequippedAndRefunded.add(refundBank);
			}
			if (gearSetup.shield?.item) {
				const { refundBank } = await user.forceUnequip(
					gearSetupName,
					EquipmentSlot.Shield,
					'2h Already equipped'
				);
				itemsUnequippedAndRefunded.add(refundBank);
			}
		}
		for (const slot of Object.values(EquipmentSlot)) {
			const item = gearSetup[slot];
			if (!item) continue;
			const osItem = Items.get(item.item);
			if (!osItem) {
				const { refundBank } = await user.forceUnequip(gearSetupName, slot, 'Invalid item');
				itemsUnequippedAndRefunded.add(refundBank);
				continue;
			}
			if (osItem.equipment?.slot !== slot) {
				const { refundBank } = await user.forceUnequip(gearSetupName, slot, 'Wrong slot');
				itemsUnequippedAndRefunded.add(refundBank);
			}
			if (osItem.equipment?.requirements && !user.hasSkillReqs(osItem.equipment.requirements)) {
				const { refundBank } = await user.forceUnequip(gearSetupName, slot, 'Doesnt meet requirements');
				itemsUnequippedAndRefunded.add(refundBank);
			}
		}
	}
	return {
		itemsUnequippedAndRefunded
	};
}
