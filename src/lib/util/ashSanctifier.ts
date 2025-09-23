import { BitField, BOT_TYPE } from '@/lib/constants.js';
import { ashes } from '@/lib/skilling/skills/prayer.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import type { UpdateBank } from '@/lib/structures/UpdateBank.js';

export function ashSanctifierEffect({
	hasKourendElite,
	updateBank,
	gearBank,
	bitfield,
	duration
}: {
	hasKourendElite: boolean;
	updateBank: UpdateBank;
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
		const amount = updateBank.itemLootBank.amount(ash.inputId);
		if (amount > 0 && chargesLeft >= amount) {
			totalXP += ash.xp * ashXpModifider * amount;
			ashesSanctified.push({ name: ash.name, amount });
			updateBank.itemLootBank.remove(ash.inputId, amount);
			chargesLeft -= amount;
		} else if (amount > 0 && chargesLeft < amount) {
			totalXP += ash.xp * ashXpModifider * chargesLeft;
			ashesSanctified.push({ name: ash.name, amount: chargesLeft });
			updateBank.itemLootBank.remove(ash.inputId, amount);
			chargesLeft = 0;
			break;
		}
	}

	if (startingAshSanctifierCharges - chargesLeft === 0) return;

	const ashString = ashesSanctified.map(ash => `${ash.amount}x ${ash.name}`).join(', ');

	updateBank.xpBank.add('prayer', totalXP, {
		duration,
		minimal: true,
		multiplier: BOT_TYPE === 'BSO',
		source: 'AshSanctifier'
	});
	updateBank.chargeBank.add('ash_sanctifier_charges', startingAshSanctifierCharges - chargesLeft);
	updateBank.userStats.ash_sanctifier_prayer_xp = {
		increment: Math.floor(totalXP)
	};
	return {
		message: `${totalXP} Prayer XP from purifying ${ashString} using the Ash Sanctifier (${chargesLeft} charges left).`
	};
}
