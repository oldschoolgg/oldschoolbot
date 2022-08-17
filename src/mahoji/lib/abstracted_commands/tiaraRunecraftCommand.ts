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
	let removeTalisman = new Bank();

	if (!quantity) {
		quantity = 1;
	}

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

	if (numTiaraOwned === 0 || numTiaraOwned < quantity) {
		return `You don't have enough tiaras to craft ${quantity}x ${tiaraObj.name}. You can acquire some through crafting at a furnance, or purchasing from other players.`;
	}

	const maxTripLength = calcMaxTripLength(user, 'Runecraft');
	const numberOfInventories = Math.max(Math.ceil(quantity / 14), 1);
	const duration = numberOfInventories * tripLength;
	const maxCanDo = Math.floor(maxTripLength / tripLength) * 14;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${tiaraObj.name} you can craft is ${Math.floor(maxCanDo)}.`;
	}

	const totalCost = new Bank();

	removeTalisman.add(tiaraObj.inputTalisman.clone().multiply(quantity));
	if (!bank.has(removeTalisman.bank)) {
		return `You don't have enough talismans to craft ${quantity} ${tiaraObj.name}.`;
	}

	totalCost.add(removeTalisman);

	totalCost.add('Tiara', quantity);
	if (!user.owns(totalCost)) return `You don't own: ${totalCost}.`;

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
