import { EquipmentSlot, type GearSetup } from '@oldschoolgg/gear';
import { Bank } from 'oldschooljs';

import { isValidGearSetup } from '@/lib/gear/functions/isValidGearSetup.js';
import { parseStringBank } from '@/lib/util/parseStringBank.js';

export function gearEquipMultiImpl(
	user: MUser,
	setup: string,
	items: string
): {
	success: boolean;
	failMsg?: string;
	equipBank?: Bank;
	unequipBank?: Bank;
	skillFailBank?: Bank;
	equippedGear?: GearSetup;
} {
	if (!isValidGearSetup(setup)) return { success: false, failMsg: 'Invalid gear setup' };
	const oneItemPerSlot: { [key in EquipmentSlot]?: boolean } = {};
	const failedToEquipBank = new Bank();
	const equipBank = new Bank();
	for (const [i, _qty] of parseStringBank(items, user.bank, true)) {
		const qty = i.stackable ? _qty || 1 : 1;
		if (user.bank.amount(i.id) < qty) continue;
		// Check skill requirements
		if (i.equipment?.requirements) {
			if (!user.hasSkillReqs(i.equipment.requirements)) {
				// Warn only for skill requirements, and conflicting weapon/2h/shield loadouts (below).
				failedToEquipBank.add(i.id, qty);
				continue;
			}
		}
		// Make sure it's valid equipment
		if (i.equipable && i.equipment && !oneItemPerSlot[i.equipment.slot]) {
			// Ignore items that conflict with previously specified items:
			if (
				(oneItemPerSlot[EquipmentSlot.TwoHanded] &&
					(i.equipment.slot === EquipmentSlot.Weapon || i.equipment.slot === EquipmentSlot.Shield)) ||
				((oneItemPerSlot[EquipmentSlot.Shield] || oneItemPerSlot[EquipmentSlot.Weapon]) &&
					i.equipment.slot === EquipmentSlot.TwoHanded)
			) {
				continue;
			}
			oneItemPerSlot[i.equipment.slot] = true;
			equipBank.add(i.id, qty);
		}
	}

	const equippedGear = { ...user.gear[setup].raw() };

	const unequipBank = new Bank();

	for (const [item, qty] of equipBank.items()) {
		const { slot } = item.equipment!;
		if (slot === EquipmentSlot.TwoHanded && equippedGear[EquipmentSlot.Shield]) {
			unequipBank.add(equippedGear[EquipmentSlot.Shield]?.item, equippedGear[EquipmentSlot.Shield]?.quantity);
			equippedGear[EquipmentSlot.Shield] = null;
		}
		if (slot === EquipmentSlot.TwoHanded && equippedGear[EquipmentSlot.Weapon]) {
			unequipBank.add(equippedGear[EquipmentSlot.Weapon]?.item, equippedGear[EquipmentSlot.Weapon]?.quantity);
			equippedGear[EquipmentSlot.Weapon] = null;
		}
		if (equippedGear[EquipmentSlot.TwoHanded] && (slot === EquipmentSlot.Shield || slot === EquipmentSlot.Weapon)) {
			unequipBank.add(
				equippedGear[EquipmentSlot.TwoHanded]?.item,
				equippedGear[EquipmentSlot.TwoHanded]?.quantity
			);
			equippedGear[EquipmentSlot.TwoHanded] = null;
		}
		if (equippedGear[slot]) {
			unequipBank.add(equippedGear[slot]?.item, equippedGear[slot]?.quantity);
		}
		equippedGear[slot] = { item: item.id, quantity: qty };
	}
	return {
		success: true,
		equipBank,
		unequipBank,
		equippedGear,
		skillFailBank: failedToEquipBank
	};
}
