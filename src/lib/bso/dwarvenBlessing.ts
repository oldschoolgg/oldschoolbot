import { Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import type { GearBank } from '@/lib/structures/GearBank.js';

export function calculateDwarvenBlessingPotsNeeded(duration: number) {
	const fiveMinIncrements = Math.ceil(duration / (Time.Minute * 5));
	const dwarvenBlessingPotsNeeded = Math.max(1, fiveMinIncrements);
	return dwarvenBlessingPotsNeeded;
}

export function calculateVitriolicCurseElixirsNeeded(duration: number) {
	const oneMinIncrements = Math.ceil(duration / Time.Minute);
	return Math.max(1, oneMinIncrements);
}

export function dwarvenBlessing({
	gearBank,
	duration,
	bitfield
}: {
	bitfield: readonly BitField[];
	gearBank: GearBank;
	duration: number;
}): null | {
	message: string;
	itemCost: Bank;
	percentageReduction: number;
} {
	const hasCurse = gearBank.hasEquipped('Vitrolic curse');
	const hasBlessing = gearBank.hasEquipped('Dwarven blessing');
	const hasZealotsAmulet = gearBank.hasEquipped('Amulet of zealots');
	const hasPrayerMasterCape = gearBank.hasEquipped('Prayer master cape');

	if (!hasCurse && !hasBlessing) return null;

	const cost = new Bank();
	let percentageReduction = 0;
	let itemName = '';

	if (hasCurse) {
		let brimstoneElixirsNeeded = calculateVitriolicCurseElixirsNeeded(duration);
		if (hasPrayerMasterCape) {
			brimstoneElixirsNeeded = Math.max(1, Math.floor(0.25 * brimstoneElixirsNeeded));
		}
		cost.add('Brimstone elixir', brimstoneElixirsNeeded);
		percentageReduction = 25;
		itemName = 'Vitrolic curse';
		if (hasPrayerMasterCape) {
			itemName += ' (75% less cost for prayer cape)';
		}
	} else if (hasBlessing) {
		const dwarvenBlessingItem = Items.getOrThrow(
			bitfield.includes(BitField.UseSuperRestoresForDwarvenBlessing) ? 'Super restore(4)' : 'Prayer potion(4)'
		);

		let dwarvenBlessingPotsNeeded = calculateDwarvenBlessingPotsNeeded(duration);
		if (hasPrayerMasterCape) {
			dwarvenBlessingPotsNeeded = Math.max(1, Math.floor(0.6 * dwarvenBlessingPotsNeeded));
		}
		cost.add(dwarvenBlessingItem, dwarvenBlessingPotsNeeded);
		percentageReduction = 20;
		itemName = 'Dwarven blessing';

		if (hasPrayerMasterCape) {
			itemName += ' (40% less cost for prayer cape)';
		}
	}

	if (hasZealotsAmulet) {
		percentageReduction += 5;
		itemName += ' & Amulet of zealots';
	}

	if (!gearBank.bank.has(cost)) {
		return null;
	}

	return {
		percentageReduction,
		message: `${percentageReduction}% boost from ${itemName}`,
		itemCost: cost
	};
}
