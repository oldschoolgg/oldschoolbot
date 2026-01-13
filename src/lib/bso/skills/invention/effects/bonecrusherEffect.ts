import { InventionID, inventionBoosts, inventionItemBoostRaw } from '@/lib/bso/skills/invention/inventions.js';

import { increaseNumByPercent, Time } from '@oldschoolgg/toolkit';
import { toKMB } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import Prayer from '@/lib/skilling/skills/prayer.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import type { UpdateBank } from '@/lib/structures/UpdateBank.js';

export function bonecrusherEffect({
	gearBank,
	duration,
	messages,
	bitfield,
	disabledInventions,
	updateBank
}: {
	disabledInventions: number[];
	gearBank: GearBank;
	updateBank: UpdateBank;
	duration: number;
	messages: string[];
	bitfield: BitField[] | readonly BitField[];
}) {
	if (!gearBank.hasEquippedOrInBank(['Gorajan bonecrusher', 'Superior bonecrusher'], 'one')) return;
	if (bitfield.includes(BitField.DisabledGorajanBoneCrusher)) return;
	let hasSuperior = gearBank.bank.has('Superior bonecrusher');

	let totalXP = 0;
	for (const bone of Prayer.Bones) {
		const amount = updateBank.itemLootBank.amount(bone.inputId);
		if (amount > 0) {
			totalXP += bone.xp * amount * 4;
			updateBank.itemLootBank.remove(bone.inputId, amount);
		}
	}
	if (totalXP === 0) return;

	const durationForCost = totalXP * 16.8;
	const inventionResult =
		hasSuperior && durationForCost > Time.Minute
			? inventionItemBoostRaw({
					gearBank,
					inventionID: InventionID.SuperiorBonecrusher,
					duration: durationForCost,
					disabledInventions
				})
			: { success: false };

	if (!inventionResult.success || !inventionResult.materialCost) {
		hasSuperior = false;
	} else {
		totalXP = increaseNumByPercent(totalXP, inventionBoosts.superiorBonecrusher.xpBoostPercent);
		updateBank.materialsCostBank.add(inventionResult.materialCost);
	}

	totalXP *= 5;

	updateBank.userStats.bonecrusher_prayer_xp = {
		increment: Math.floor(totalXP)
	};

	updateBank.xpBank.add('prayer', totalXP, { duration, minimal: true, multiplier: false });

	messages.push(
		`${toKMB(totalXP)} Prayer XP ${
			hasSuperior
				? `+${inventionBoosts.superiorBonecrusher.xpBoostPercent}% more from Superior bonecrusher${
						inventionResult.messages ? ` (${inventionResult.messages.join(', ')})` : ''
					}`
				: ' from Gorajan bonecrusher'
		}`
	);
}
