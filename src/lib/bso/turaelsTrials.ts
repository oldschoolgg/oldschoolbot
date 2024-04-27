import { mentionCommand } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { trackClientBankStats, userStatsBankUpdate } from '../../mahoji/mahojiSettings';
import { TuraelsTrialsOptions } from '../types/minions';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../util/calcMaxTripLength';
import { formatDuration } from '../util/smallUtils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _monsters = [
	{
		monster: Monsters.ColossalHydra
	},
	{
		monster: Monsters.NuclearSmokeDevil
	},
	{
		monster: Monsters.NightBeast
	},
	{
		monster: Monsters.GreaterAbyssalDemon
	},
	{
		monster: Monsters.GuardianDrake
	},
	{
		monster: Monsters.Nechryarch
	},
	{
		monster: Monsters.MarbleGargoyle
	},
	{
		monster: Monsters.KingKurask
	},
	{
		monster: Monsters.ChokeDevil
	},
	{
		monster: Monsters.ShadowWyrm
	},
	{
		monster: Monsters.BasiliskSentinel
	}
];

console.log(_monsters);

// scythe or barrage or chin
// longer max trip length with blood fury

export const TuraelsTrialsMethods = ['melee', 'mage', 'range'] as const;
export type TuraelsTrialsMethod = (typeof TuraelsTrialsMethods)[number];

export function calculateTuraelsTrialsInput({
	maxTripLength,
	method
}: {
	maxTripLength: number;
	method: TuraelsTrialsMethod;
}) {
	let timePerKill = Time.Minute * 2.9;
	let quantity = Math.floor(maxTripLength / timePerKill);
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

	return {
		duration,
		quantity,
		cost,
		scytheChargesNeeded,
		hpHealingNeeded
	};
}

export async function turaelsTrialsStartCommand(user: MUser, channelID: string, method: TuraelsTrialsMethod) {
	if (user.minionIsBusy) {
		return `${user.minionName} is busy.`;
	}

	const { duration, quantity, cost, scytheChargesNeeded } = calculateTuraelsTrialsInput({
		maxTripLength: calcMaxTripLength(user, 'TuraelsTrials'),
		method: 'melee'
	});

	if (scytheChargesNeeded > 0 && user.user.scythe_of_vitur_charges < scytheChargesNeeded) {
		return `You need ${scytheChargesNeeded} Scythe of vitur charges, you have ${
			user.user.scythe_of_vitur_charges
		}x. Charge it using ${mentionCommand(globalClient, 'minion', 'charge')}.`;
	}

	if (!user.owns(cost)) {
		return `You don't have the required items, you need: ${cost}.`;
	}

	await user.removeItemsFromBank(cost);
	await trackClientBankStats('turaels_trials_cost_bank', cost);
	await userStatsBankUpdate(user.id, 'turaels_trials_cost_bank', cost);

	const task = await addSubTaskToActivityTask<TuraelsTrialsOptions>({
		userID: user.id,
		channelID,
		q: quantity,
		duration,
		type: 'TuraelsTrials',
		minigameID: 'turaels_trials',
		m: method
	});

	let response = `${user.minionName} is now participating in Turaels Trials, it'll take around ${formatDuration(
		task.duration
	)} to finish.`;

	return response;
}
