import { reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { client } from '../../..';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, formatDuration, itemID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function roguesDenCommand(user: KlasaUser, channelID: bigint) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	if (user.skillLevel(SkillsEnum.Agility) < 50 || user.skillLevel(SkillsEnum.Thieving) < 50) {
		return "To attempt the Rogues' Den maze you need 50 Agility and 50 Thieving.";
	}

	const staminasToRemove = new Bank();
	const boosts = [];
	let baseTime = Time.Minute * 9;

	let skillPercentage = (user.skillLevel(SkillsEnum.Agility) + user.skillLevel(SkillsEnum.Thieving)) / 20;
	boosts.push(`${skillPercentage}% boost for levels`);

	if (user.skillLevel(SkillsEnum.Thieving) >= 80) {
		skillPercentage += 40;
		boosts.push('40% boost for 80+ Thieving');
	}

	baseTime = reduceNumByPercent(baseTime, skillPercentage);

	let quantity = Math.floor(user.maxTripLength('RoguesDenMaze') / baseTime);

	if (user.hasItemEquippedOrInBank('Stamina potion(4)')) {
		baseTime = reduceNumByPercent(baseTime, 50);

		const potionsInBank = await user.numberOfItemInBank(itemID('Stamina potion(4)'));
		const maxPossibleLaps = Math.floor(user.maxTripLength('RoguesDenMaze') / baseTime);

		// do as many laps as possible with the current stamina potion supply
		quantity = Math.min(potionsInBank * 4, maxPossibleLaps);
		staminasToRemove.add('Stamina potion(4)', Math.max(1, Math.floor(quantity / 4)));
	} else {
		boosts.push('-50% not enough Stamina potions');
	}

	const duration = quantity * baseTime;

	if (staminasToRemove.length > 0) {
		await user.removeItemsFromBank(staminasToRemove.bank);
		await client.settings.update(
			ClientSettings.EconomyStats.RoguesDenStaminas,
			addBanks([client.settings.get(ClientSettings.EconomyStats.RoguesDenStaminas), staminasToRemove.bank])
		);
	}

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		minigameID: 'rogues_den',
		type: 'RoguesDenMaze'
	});

	let str = `${
		user.minionName
	} is now off to complete the Rogues' Den maze ${quantity}x times, their trip will take ${formatDuration(
		duration
	)} (${formatDuration(baseTime)} per lap).`;

	if (staminasToRemove.length > 0) {
		str += ` Removed ${staminasToRemove} from your bank.`;
	}

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}
	return str;
}
