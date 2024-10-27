import type { Bank } from 'oldschooljs';

import { BitField } from '../constants';
import { ashes } from '../skilling/skills/prayer';
import type { GearBank } from '../structures/GearBank';
import { UpdateBank } from '../structures/UpdateBank';

export function ashSanctifierEffect({
	hasKourendElite,
	mutableLootToReceive,
	gearBank,
	bitfield,
	duration
}: {
	hasKourendElite: boolean;
	mutableLootToReceive: Bank;
	gearBank: GearBank;
	bitfield: readonly BitField[];
	duration: number;
}) {
	if (!gearBank.bank.has('Ash sanctifier')) return;
	if (bitfield.includes(BitField.DisableAshSanctifier)) return;
	const startingAshSanctifierCharges = gearBank.chargeBank.amount('ash_sanctifier_charges');
	if (startingAshSanctifierCharges === 0) return;

	let chargesLeft = startingAshSanctifierCharges;
	let totalXP = 0;

	const ashXpModifider = hasKourendElite ? 1 : 0.5;
	const ashesSanctified: { name: string; amount: number }[] = [];
	for (const ash of ashes) {
		const amount = mutableLootToReceive.amount(ash.inputId);
		if (amount > 0 && chargesLeft >= amount) {
			totalXP += ash.xp * ashXpModifider * amount;
			ashesSanctified.push({ name: ash.name, amount });
			mutableLootToReceive.remove(ash.inputId, amount);
			chargesLeft -= amount;
		} else if (amount > 0 && chargesLeft < amount) {
			totalXP += ash.xp * ashXpModifider * chargesLeft;
			ashesSanctified.push({ name: ash.name, amount: chargesLeft });
			mutableLootToReceive.remove(ash.inputId, chargesLeft);
			chargesLeft = 0;
			break;
		}
	}

	if (startingAshSanctifierCharges - chargesLeft === 0) return;

	const ashString = ashesSanctified.map(ash => `${ash.amount}x ${ash.name}`).join(', ');

	const updateBank = new UpdateBank();
	updateBank.xpBank.add('prayer', totalXP, { duration, minimal: true, multiplier: false, source: 'AshSanctifier' });
	updateBank.chargeBank.add('ash_sanctifier_charges', startingAshSanctifierCharges - chargesLeft);
	updateBank.userStats.ash_sanctifier_prayer_xp = {
		increment: Math.floor(totalXP)
	};
	return {
		message: `${totalXP} Prayer XP from purifying ${ashString} using the Ash Sanctifier (${chargesLeft} charges left).`,
		updateBank
	};
}
