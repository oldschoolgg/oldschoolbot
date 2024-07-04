import { Time, increaseNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import Runecraft from '../../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { OuraniaAltarOptions } from '../../../lib/types/minions';
import { formatDuration, itemID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userHasGracefulEquipped } from '../../mahojiSettings';

const gracefulPenalty = 20;

export async function ouraniaAltarStartCommand({
	user,
	channelID,
	quantity,
	usestams,
	daeyalt_essence
}: {
	user: MUser;
	channelID: string;
	quantity?: number;
	usestams?: boolean;
	daeyalt_essence?: boolean;
}) {
	let timePerTrip = Time.Minute * 1.05;
	const stamina: boolean = usestams !== undefined ? usestams : true;
	const daeyalt = daeyalt_essence || false;

	const { bank } = user;
	const numEssenceOwned = bank.amount('Pure essence');
	const daeyaltEssenceOwned = bank.amount('Daeyalt essence');
	const boosts = [];
	const mageLvl = user.skillLevel(SkillsEnum.Magic);
	const spellbookSwap = mageLvl > 95;

	let inventorySize = 28;
	// For each pouch the user has, increase their inventory size.
	for (const pouch of Runecraft.pouches) {
		if (user.skillLevel(SkillsEnum.Runecraft) < pouch.level) continue;
		if (bank.has(pouch.id)) inventorySize += pouch.capacity - 1;
		if (bank.has(pouch.id) && pouch.id === itemID('Colossal pouch')) break;
	}

	if (inventorySize > 28) boosts.push(`+${inventorySize - 28} inv spaces from pouches`);

	if (!userHasGracefulEquipped(user) || !spellbookSwap) {
		boosts.push(`${gracefulPenalty}% slower for no Graceful`);
		timePerTrip = increaseNumByPercent(timePerTrip, gracefulPenalty);
	}

	if (mageLvl < 71 && user.QP < 120) {
		boosts.push('50% slower for not having the Ourania Teleport Spell');
		timePerTrip = increaseNumByPercent(timePerTrip, 50);
	}

	if (stamina || spellbookSwap) {
		timePerTrip *= 0.8;
	}

	if (user.hasEquippedOrInBank(['Ring of endurance'])) {
		boosts.push('2% faster for Ring of Endurance');
		timePerTrip *= 0.98;
	}

	const maxTripLength = calcMaxTripLength(user, 'OuraniaAltar');
	const maxCanDo = Math.floor(maxTripLength / timePerTrip) * inventorySize;

	// If no quantity provided, set it to the max.
	if (daeyalt_essence) {
		if (!quantity) quantity = Math.min(daeyaltEssenceOwned, maxCanDo);
		if (daeyaltEssenceOwned === 0 || quantity === 0 || daeyaltEssenceOwned < quantity) {
			return "You don't have enough Daeyalt Essence to craft these runes. You can acquire Daeyalt Shards through Mining, and then exchange for essence with the `/create` command.";
		}
	} else {
		if (!quantity) quantity = Math.min(numEssenceOwned, maxCanDo);

		if (numEssenceOwned === 0 || quantity === 0 || numEssenceOwned < quantity) {
			return "You don't have enough Pure Essence to craft these runes. You can acquire some through Mining, or purchasing from other players.";
		}
	}

	const numberOfInventories = Math.max(Math.ceil(quantity / inventorySize), 1);
	const duration = numberOfInventories * timePerTrip;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of essence you can craft is ${Math.floor(maxCanDo)}.`;
	}

	const totalCost = new Bank();
	const itemCost = new Bank();

	if (stamina || spellbookSwap) {
		if (spellbookSwap) {
			boosts.push('20% faster for using Spellbook Swap and Vile Vigour instead of Staminas');
		} else {
			itemCost.add('Stamina potion(4)', Math.max(Math.ceil(duration / (Time.Minute * 8)), 1));
			totalCost.add(itemCost);
			boosts.push('20% faster for using Stamina potions.');
			if (!user.owns(totalCost)) {
				return `You don't have enough Stamina potion(4) for this trip. You need ${Math.max(
					Math.ceil(duration / (Time.Minute * 8)),
					1
				)}x Stamina potion(4).`;
			}
		}
	}

	if (daeyalt_essence) {
		totalCost.add('Daeyalt essence', quantity);
		if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;
	} else {
		totalCost.add('Pure essence', quantity);
	}
	if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;

	await user.removeItemsFromBank(totalCost);
	updateBankSetting('runecraft_cost', totalCost);

	await addSubTaskToActivityTask<OuraniaAltarOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'OuraniaAltar',
		channelID: channelID.toString(),
		stamina,
		daeyalt
	});

	let response = `${user.minionName} is now crafting ${quantity}x`;

	if (daeyalt_essence) {
		response += ' Daeyalt ';
	} else {
		response += ' Pure ';
	}

	response += `Essence at the Ourania Altar, it'll take around ${formatDuration(
		duration
	)} to finish, this will take ${numberOfInventories}x trips to the altar.\nYour minion has consumed: ${itemCost}.\n\n**Boosts:** ${boosts.join(
		', '
	)}`;

	return response;
}
