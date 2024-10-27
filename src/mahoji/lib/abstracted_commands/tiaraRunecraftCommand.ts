import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import Runecraft from '../../../lib/skilling/skills/runecraft';
import type { TiaraRunecraftActivityTaskOptions } from '../../../lib/types/minions';
import { stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function tiaraRunecraftCommand({
	user,
	channelID,
	name,
	quantity
}: {
	user: MUser;
	channelID: string;
	quantity?: number;
	name: string;
}) {
	const TIARAS_PER_INVENTORY = 14;
	const tiaraObj = Runecraft.Tiaras.find(
		_tiara => stringMatches(_tiara.name, name) || stringMatches(_tiara.name.split(' ')[0], name)
	);

	if (!tiaraObj) {
		return `That's not a valid tiara. Valid tiaras are ${Runecraft.Tiaras.map(_tiara => _tiara.name).join(', ')}.`;
	}

	if (tiaraObj.qpRequired && user.QP < tiaraObj.qpRequired) {
		return `You need ${tiaraObj.qpRequired} QP to craft this tiara.`;
	}

	const bank = new Bank(user.bank);
	const numTiaraOwned = bank.amount('Tiara');
	const numTalismansOwned = bank.fits(tiaraObj.inputTalisman);

	let { tripLength } = tiaraObj;

	const boosts = [];
	if (userHasGracefulEquipped(user)) {
		tripLength -= tripLength * 0.1;
		boosts.push('10% for Graceful');
	}

	if (user.skillLevel(SkillsEnum.Agility) >= 90) {
		tripLength *= 0.9;
		boosts.push('10% for 90+ Agility');
	} else if (user.skillLevel(SkillsEnum.Agility) >= 60) {
		tripLength *= 0.95;
		boosts.push('5% for 60+ Agility');
	}

	const makeTiaraTime = Time.Second * 0.6;
	const adjTripTime = tripLength + TIARAS_PER_INVENTORY * makeTiaraTime;
	const maxCanDoOwned = numTiaraOwned < numTalismansOwned ? numTiaraOwned : numTalismansOwned;
	const maxTripLength = calcMaxTripLength(user, 'Runecraft');
	const maxCanDo = Math.floor(maxTripLength / adjTripTime) * TIARAS_PER_INVENTORY;

	if (!quantity) {
		quantity = maxCanDoOwned < maxCanDo ? maxCanDoOwned : maxCanDo;
	}

	if (numTiaraOwned === 0 || numTalismansOwned === 0) {
		return `You don't have ${
			numTiaraOwned === 0
				? 'any tiaras. You can acquire some through crafting at a furnance, or purchasing from other players.'
				: `${tiaraObj.inputTalisman}. You can acquire some from PvM, or purchasing from other players.`
		}`;
	} else if (numTalismansOwned < quantity || numTiaraOwned < quantity) {
		return `You don't have enough ${
			numTiaraOwned < quantity ? 'tiaras' : `${tiaraObj.inputTalisman}`
		} to craft ${quantity}x ${tiaraObj.name}. You can acquire some from PvM, or purchasing from other players.`;
	}

	const numberOfInventories = Math.floor(quantity / TIARAS_PER_INVENTORY);
	const quantityInLastInv = quantity % 14;
	let duration = numberOfInventories * adjTripTime;
	if (quantityInLastInv > 0) duration += tripLength + makeTiaraTime * quantityInLastInv;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${tiaraObj.name} you can craft is ${
			maxCanDoOwned < maxCanDo ? maxCanDoOwned : maxCanDo
		}.`;
	}

	const totalCost = new Bank();
	totalCost.add(tiaraObj.inputTalisman.clone().multiply(quantity));
	totalCost.add('Tiara', quantity);

	await user.removeItemsFromBank(totalCost);
	updateBankSetting('runecraft_cost', totalCost);

	await addSubTaskToActivityTask<TiaraRunecraftActivityTaskOptions>({
		tiaraID: tiaraObj.id,
		userID: user.id,
		channelID: channelID.toString(),
		tiaraQuantity: quantity,
		duration,
		type: 'TiaraRunecraft'
	});

	let response = `${user.minionName} is now turning ${quantity}x Tiaras into ${
		tiaraObj.name
	}s, it'll take around ${formatDuration(duration)} to finish.`;

	if (boosts.length > 0) response += `\n\n**Boosts:** ${boosts.join(', ')}`;

	return response;
}
