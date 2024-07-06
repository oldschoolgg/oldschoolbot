import { Time, increaseNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import { trackClientBankStats, userStatsBankUpdate } from '../../mahoji/mahojiSettings';
import { degradeChargeBank } from '../degradeableItems';
import { ChargeBank } from '../structures/Banks';
import type { TuraelsTrialsOptions } from '../types/minions';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import { formatDuration } from '../util/smallUtils';

export const TuraelsTrialsMethods = ['melee', 'mage', 'range'] as const;
export type TuraelsTrialsMethod = (typeof TuraelsTrialsMethods)[number];

export function calculateTuraelsTrialsInput({
	maxTripLength,
	method,
	isUsingBloodFury
}: {
	maxTripLength: number;
	isUsingBloodFury: boolean;
	method: TuraelsTrialsMethod;
}) {
	const timePerKill = Time.Minute * 2.9;
	const quantity = Math.floor(maxTripLength / timePerKill);
	const duration = Math.floor(timePerKill * quantity);
	const minutesRoundedUp = Math.ceil(duration / Time.Minute);

	const cost = new Bank();

	let scytheChargesNeeded = 0;

	if (method === 'melee') {
		scytheChargesNeeded = Math.ceil(4.5 * minutesRoundedUp);
		cost.add('Super combat potion(4)');
	} else if (method === 'mage') {
		const castsPerMinute = 15;
		const casts = castsPerMinute * minutesRoundedUp;
		cost.add('Chaos rune', casts * 4);
		cost.add('Death rune', casts * 2);
		cost.add('Water rune', casts * 4);
		cost.add('Magic potion(4)');
	} else if (method === 'range') {
		cost.add('Black chinchompa', Math.floor(minutesRoundedUp * 1.2));
		cost.add('Ranging potion(4)');
	}

	cost.add('Saradomin brew(4)', 3);
	cost.add('Super restore(4)');

	const hpHealingNeeded = Math.ceil(minutesRoundedUp * 50);

	const chargeBank = new ChargeBank();

	if (scytheChargesNeeded > 0) {
		chargeBank.add('scythe_of_vitur_charges', scytheChargesNeeded);
	}

	if (isUsingBloodFury) {
		const hoursPerBloodyFury = 2;
		const periodInMs = Time.Hour * hoursPerBloodyFury;
		const chargesPerMillisecond = 10_000 / periodInMs;
		const bloodyFuryCharges = Math.floor(duration * chargesPerMillisecond);
		chargeBank.add('blood_fury_charges', bloodyFuryCharges);
	}

	return {
		duration,
		quantity,
		cost,
		chargeBank,
		hpHealingNeeded
	};
}

export async function turaelsTrialsStartCommand(user: MUser, channelID: string, method: TuraelsTrialsMethod) {
	if (user.minionIsBusy) {
		return `${user.minionName} is busy.`;
	}

	if (user.skillsAsLevels.slayer < 120) {
		return 'You need 120 Slayer to do Turaels Trials.';
	}

	const messages: string[] = [];

	const isUsingBloodFury = user.hasEquipped('Amulet of blood fury');
	let maxTripLength = calcMaxTripLength(user, 'TuraelsTrials');
	if (isUsingBloodFury) {
		maxTripLength = increaseNumByPercent(maxTripLength, 20);
		messages.push('+20% Trip length for Blood fury');
	}

	const { duration, quantity, cost, chargeBank } = calculateTuraelsTrialsInput({
		maxTripLength,
		method,
		isUsingBloodFury
	});

	const hasChargesResult = user.hasCharges(chargeBank);
	if (!hasChargesResult.hasCharges) {
		return hasChargesResult.fullUserString!;
	}

	if (!user.owns(cost)) {
		return `You don't have the required items, you need: ${cost}.`;
	}

	const degradeResults = await degradeChargeBank(user, chargeBank);
	await user.removeItemsFromBank(cost);
	await trackClientBankStats('turaels_trials_cost_bank', cost);
	await userStatsBankUpdate(user.id, 'turaels_trials_cost_bank', cost);
	messages.push(degradeResults.map(i => i.userMessage).join(', '));
	messages.push(`Removed ${cost}`);

	const task = await addSubTaskToActivityTask<TuraelsTrialsOptions>({
		userID: user.id,
		channelID,
		q: quantity,
		duration,
		type: 'TuraelsTrials',
		minigameID: 'turaels_trials',
		m: method
	});

	const response = `${user.minionName} is now participating in Turaels Trials, it'll take around ${formatDuration(
		task.duration
	)} to finish.

${messages.join('\n')}`;

	return response;
}
