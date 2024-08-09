import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { WildernessDiary, userhasDiaryTier } from '../../../lib/diaries';
import type { SkillsEnum } from '../../../lib/skilling/types';
import type { CollectingOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { collectables } from '../collectables';
import { getPOH } from './pohCommand';

export async function collectCommand(
	user: MUser,
	channelID: string,
	objectName: string,
	quantity?: number,
	no_stams?: boolean
) {
	const collectable = collectables.find(c => stringMatches(c.item.name, objectName));
	if (!collectable) {
		return `That's not something your minion can collect, you can collect these things: ${collectables
			.map(i => i.item.name)
			.join(', ')}.`;
	}

	const maxTripLength = calcMaxTripLength(user, 'Collecting');
	if (collectable.qpRequired && user.QP < collectable.qpRequired) {
		return `You need ${collectable.qpRequired} QP to collect ${collectable.item.name}.`;
	}

	if (collectable.skillReqs) {
		for (const [skillName, lvl] of Object.entries(collectable.skillReqs)) {
			if (user.skillLevel(skillName as SkillsEnum) < lvl) {
				return `You need ${lvl} ${skillName} to collect ${collectable.item.name}.`;
			}
		}
	}

	if (collectable.item.id === 245) {
		const [hasDiary] = await userhasDiaryTier(user, WildernessDiary.hard);
		if (hasDiary) {
			collectable.duration = Time.Minute * 2;
		}
	}

	if (no_stams === undefined) {
		no_stams = false;
	}

	if (!quantity) {
		quantity = Math.floor(maxTripLength / collectable.duration);
	}
	let duration = collectable.duration * quantity;
	if (duration > maxTripLength) {
		return `${user.minionName} can't go on a trip longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for ${collectable.item.name} is ${Math.floor(
			maxTripLength / collectable.duration
		)}.`;
	}

	const poh = await getPOH(user.id);
	const hasJewelleryBox = poh.jewellery_box !== null;

	let cost: Bank = new Bank();

	if (collectable.itemCost) {
		cost = collectable.itemCost.clone().multiply(quantity);
		if (cost.has('Ring of dueling(8)') && hasJewelleryBox)
			cost.remove('Ring of dueling(8)', cost.amount('Ring of dueling(8)'));
		if (cost.has('Stamina potion(4)') && no_stams) {
			// 50% longer trip time for not using stamina potion (4)
			duration *= 1.5;
			cost.remove('Stamina potion(4)', cost.amount('Stamina potion (4)'));
		}
		if (!user.owns(cost)) {
			return `You don't have the items needed for this trip, you need: ${cost}.`;
		}
		await transactItems({ userID: user.id, itemsToRemove: cost });

		await updateBankSetting('collecting_cost', cost);
	}

	await addSubTaskToActivityTask<CollectingOptions>({
		collectableID: collectable.item.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		noStaminas: no_stams,
		type: 'Collecting'
	});

	return `${user.minionName} is now collecting ${quantity * collectable.quantity}x ${
		collectable.item.name
	}, it'll take around ${formatDuration(duration)} to finish.${
		cost.toString().length > 0
			? `
Removed ${cost} from your bank.`
			: ''
	}${no_stams ? '\n50% longer trip due to not using Stamina potions.' : ''}`;
}
