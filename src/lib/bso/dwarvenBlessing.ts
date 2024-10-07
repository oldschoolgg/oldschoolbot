import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { BitField } from '../constants';
import type { GearBank } from '../structures/GearBank';
import getOSItem from '../util/getOSItem';

export function calculateDwarvenBlessingPotsNeeded(duration: number) {
	const fiveMinIncrements = Math.ceil(duration / (Time.Minute * 5));
	const dwarvenBlessingPotsNeeded = Math.max(1, fiveMinIncrements);
	return dwarvenBlessingPotsNeeded;
}

export function dwarvenBlessing({
	gearBank,
	duration,
	bitfield
}: { bitfield: readonly BitField[]; gearBank: GearBank; duration: number }): null | {
	message: string;
	itemCost: Bank;
	percentageReduction: number;
} {
	const dwarvenBlessingItem = getOSItem(
		bitfield.includes(BitField.UseSuperRestoresForDwarvenBlessing) ? 'Super restore(4)' : 'Prayer potion(4)'
	);
	const hasBlessing = gearBank.hasEquipped('Dwarven blessing');
	if (!hasBlessing) return null;

	const hasPrayerMasterCape = gearBank.hasEquipped('Prayer master cape');

	let dwarvenBlessingPotsNeeded = calculateDwarvenBlessingPotsNeeded(duration);
	if (hasPrayerMasterCape) {
		dwarvenBlessingPotsNeeded = Math.max(1, Math.floor(0.6 * dwarvenBlessingPotsNeeded));
	}
	const cost = new Bank().add(dwarvenBlessingItem, dwarvenBlessingPotsNeeded);

	if (!gearBank.bank.has(cost)) {
		return null;
	}

	const hasZealotsAmulet = gearBank.hasEquipped('Amulet of zealots');
	const percentageReduction = hasZealotsAmulet ? 25 : 20;

	return {
		percentageReduction,
		message: `${percentageReduction}% boost from Dwarven blessing${hasPrayerMasterCape ? ' (40% less cost for prayer cape)' : ''}`,
		itemCost: cost
	};
}
