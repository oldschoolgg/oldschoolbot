import { Bank } from 'oldschooljs';

import { findFavour, KourendFavours } from '../../../lib/minions/data/kourendFavour';
import { SkillsEnum } from '../../../lib/skilling/types';
import { KourendFavourActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';

export async function favourCommand(
	user: MUser,
	favourName: string | undefined,
	channelID: string,
	noStams: boolean | undefined
) {
	const currentUserFavour = user.kourendFavour;
	if (!favourName || minionIsBusy(user.id)) {
		let allFavourString: string = 'Your current Kourend Favour:';
		for (const [key, value] of Object.entries(currentUserFavour)) {
			allFavourString += `\n**${key}**: ${value}%`;
		}
		return allFavourString;
	}
	const favour = findFavour(favourName);
	if (!favour) {
		return `Cannot find matching Kourend Favour. Possible Favours are: ${KourendFavours.map(i => i.name).join(
			', '
		)}.`;
	}
	const maxTripLength = calcMaxTripLength(user, 'KourendFavour');
	let currentPoints = 0;
	for (const [key, value] of Object.entries(currentUserFavour)) {
		if (key.toLowerCase() === favour.name.toLowerCase()) {
			if (value >= 100) return `You already have the maximum amount of ${key} Favour ${value}%.`;
			currentPoints = value;
			break;
		}
	}
	let quantity = Math.floor(maxTripLength / favour.duration);
	if (quantity * favour.pointsGain + currentPoints > 100) {
		quantity = Math.ceil((100 - currentPoints) / favour.pointsGain);
	}
	let duration = quantity * favour.duration;

	if (favour.qpRequired && user.QP < favour.qpRequired) {
		return `You need ${favour.qpRequired} QP to do ${favour.name} Favour.`;
	}

	if (favour.skillReqs) {
		for (const [skillName, lvl] of Object.entries(favour.skillReqs)) {
			if (user.skillLevel(skillName as SkillsEnum) < lvl) {
				return `You need ${lvl} ${skillName} to do ${favour.name} Favour.`;
			}
		}
	}
	let cost: Bank = new Bank();
	let ns = false;
	if (favour.itemCost) {
		cost = favour.itemCost.clone().multiply(quantity);
		if (cost.has('Stamina potion(4)') && noStams) {
			// 50% longer trip time for not using stamina potion(4)
			ns = true;
			duration *= 1.5;
			cost.remove('Stamina potion(4)', cost.amount('Stamina potion (4)'));
		}
		if (!user.owns(cost)) {
			return `You don't have the items needed for this trip, you need: ${cost}.`;
		}
		await user.removeItemsFromBank(cost);
	}

	await addSubTaskToActivityTask<KourendFavourActivityTaskOptions>({
		favour: favour.name,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'KourendFavour'
	});

	return `${user.minionName} is now completing ${favour.name} Favour tasks, it'll take around ${formatDuration(
		duration
	)} to finish.${cost.toString().length > 0 ? ` Removed ${cost} from your bank.` : ''}${
		ns ? '\n50% longer trip due to not using Stamina potions.' : ''
	}`;
}
