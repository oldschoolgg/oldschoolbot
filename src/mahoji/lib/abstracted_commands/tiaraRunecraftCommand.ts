import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import Runecraft from '../../../lib/skilling/skills/runecraft';
import { RunecraftActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function tiaraRunecraftCommand({
	user,
	channelID,
	name,
	quantity
}: {
	user: KlasaUser;
	channelID: bigint;
	quantity?: number;
	name: string;
}) {
	const TIARAS_PER_INVENTORY = 14;
	const tiaraObj = Runecraft.Tiara.find(
		_tiara => stringMatches(_tiara.name, name) || stringMatches(_tiara.name.split(' ')[0], name)
	);

	if (!tiaraObj) {
		return `That's not a valid tiara. Valid tiaras are ${Runecraft.Tiara.map(_tiara => _tiara.name).join(', ')}.`;
	}

	if (tiaraObj.qpRequired && user.settings.get(UserSettings.QP) < tiaraObj.qpRequired) {
		return `You need ${tiaraObj.qpRequired} QP to craft this tiara.`;
	}

	const bank = user.bank();
	const numTiaraOwned = bank.amount('Tiara');
	const numTalismansOwned = bank.fits(tiaraObj.inputTalisman);

	let { tripLength } = tiaraObj;

	const boosts = [];
	if (user.hasGracefulEquipped()) {
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

	const makeTiaraTime = 0.6;
	const maxCanDoOwned = numTiaraOwned < numTalismansOwned ? numTiaraOwned : numTalismansOwned;

	const maxTripLength = calcMaxTripLength(user, 'Runecraft');
	const maxCanDo = Math.floor((maxTripLength / tripLength) * (TIARAS_PER_INVENTORY * makeTiaraTime));
	if (!quantity) {
		quantity = maxCanDoOwned < maxCanDo ? maxCanDoOwned : maxCanDo;
	}

	if (numTiaraOwned === 0 || numTiaraOwned < quantity) {
		return `You don't have enough tiaras to craft ${quantity}x ${tiaraObj.name}. You can acquire some through crafting at a furnance, or purchasing from other players.`;
	} else if (numTalismansOwned === 0 || numTalismansOwned < quantity) {
		return `You don't have enough talismans to craft ${quantity}x ${tiaraObj.name}. You can acquire some through drops, or purchasing from other players.`;
	}

	const numberOfInventories = Math.ceil(quantity / TIARAS_PER_INVENTORY);
	const duration = numberOfInventories * (tripLength + (makeTiaraTime * quantity));

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${tiaraObj.name} you can craft is ${Math.floor(
			maxCanDoOwned < maxCanDo ? maxCanDoOwned : maxCanDo
		)}.`;
	}

	const totalCost = new Bank();
	totalCost.add(tiaraObj.inputTalisman.clone().multiply(quantity));
	totalCost.add('Tiara', quantity);

	await user.removeItemsFromBank(totalCost);
	updateBankSetting(globalClient, ClientSettings.EconomyStats.RunecraftCost, totalCost);

	await addSubTaskToActivityTask<RunecraftActivityTaskOptions>({
		runeID: tiaraObj.id,
		userID: user.id,
		channelID: channelID.toString(),
		essenceQuantity: quantity,
		useStaminas: false,
		duration,
		imbueCasts: 0,
		type: 'Runecraft'
	});

	let response = `${user.minionName} is now turning ${quantity}x Tiaras into ${
		tiaraObj.name
	}, it'll take around ${formatDuration(
		duration
	)} to finish, this will take ${numberOfInventories}x trips to the altar.\n\n**Boosts:** ${boosts.join(', ')}`;

	return response;
}
