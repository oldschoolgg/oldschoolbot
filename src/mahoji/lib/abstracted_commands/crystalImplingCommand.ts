import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { trackLoot } from '../../../lib/lootTrack';
import Hunter from '../../../lib/skilling/skills/hunter/hunter';
import { CrystalImplingActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function crystalImplingCommand({
	user,
	quantity,
	stamina_potions,
	hunter_potions,
	channelID
}: {
	user: MUser;
	quantity?: number;
	stamina_potions?: boolean;
	hunter_potions?: boolean;
	channelID: string;
}) {
	const userBank = user.bank;
	let usingStaminaPotion = Boolean(stamina_potions);
	let usingHuntPotion = Boolean(hunter_potions);
	const creature = Hunter.Creatures.find(c => c.name === 'Crystal impling');

	if (!creature) return "That's not a valid creature to hunt.";

	const boosts = [];

	if (userHasGracefulEquipped(user)) {
		boosts.push('5% boost for using Graceful');
	}

	const maxTripLength = calcMaxTripLength(user, 'Hunter');
	if (!quantity) quantity = Math.floor(maxTripLength / Time.Minute);

	let duration = Math.floor(quantity * Time.Minute);

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of minutes you can spend hunting ${creature.name} is ${Math.floor(
			maxTripLength / (quantity * Time.Minute)
		)}.`;
	}

	let removeBank = new Bank();

	if (usingStaminaPotion) {
		let staminaPotionQuantity = Math.round(duration / (9 * Time.Minute));

		if (userBank.amount('Stamina potion(4)') < staminaPotionQuantity) {
			return `You need ${staminaPotionQuantity}x Stamina potion(4) to hunt for the whole trip, try a lower quantity or make/buy more potions.`;
		}
		removeBank.add('Stamina potion(4)', staminaPotionQuantity);
		boosts.push(`20% boost for using ${staminaPotionQuantity}x Stamina potion(4)`);
	}

	if (usingHuntPotion) {
		const hunterPotionQuantity = Math.round(duration / (8 * Time.Minute));
		if (userBank.amount('Hunter potion(4)') < hunterPotionQuantity) {
			return `You need ${hunterPotionQuantity}x Hunter potion(4) to boost your level for the whole trip, try a lower quantity or make/buy more potions.`;
		}
		removeBank.add(itemID('Hunter potion(4)'), hunterPotionQuantity);
		boosts.push(`+2 hunter level for using ${hunterPotionQuantity}x Hunter potion(4) every 2nd minute.`);
	}

	updateBankSetting('hunter_cost', removeBank);
	await user.removeItemsFromBank(removeBank);

	await trackLoot({
		id: creature.name,
		totalCost: removeBank,
		type: 'Skilling',
		changeType: 'cost',
		users: [
			{
				id: user.id,
				cost: removeBank
			}
		]
	});

	await addSubTaskToActivityTask<CrystalImplingActivityTaskOptions>({
		creatureName: creature.name,
		userID: user.id,
		quantity,
		duration,
		usingHuntPotion,
		usingStaminaPotion,
		type: 'CrystalImpling',
		channelID: channelID.toString()
	});

	let response = `${user.minionName} is now hunting ${creature.name}, it'll take around ${formatDuration(
		duration
	)} to finish.`;

	if (boosts.length > 0) {
		response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return response;
}
