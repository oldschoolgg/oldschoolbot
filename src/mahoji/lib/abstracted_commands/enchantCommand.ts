import { Time } from 'e';

import { Enchantables } from '../../../lib/skilling/skills/magic/enchantables';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { EnchantingActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { determineRunes } from '../../../lib/util/determineRunes';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export async function enchantCommand(user: MUser, channelID: string, name: string, quantity?: number) {
	const enchantable = Enchantables.find(
		item =>
			stringMatches(item.name, name) ||
			stringMatches(itemNameFromID(item.id)!, name) ||
			item.alias?.some(a => stringMatches(a, name))
	);

	if (!enchantable) {
		return 'That is not a valid item to enchant.';
	}

	if (user.skillLevel(SkillsEnum.Magic) < enchantable.level) {
		return `${user.minionName} needs ${enchantable.level} Magic to enchant ${enchantable.name}.`;
	}

	const userBank = user.bank;

	const maxTripLength = calcMaxTripLength(user, 'Enchanting');

	const timeToEnchantTen = 3 * Time.Second * 0.6 + Time.Second / 4;

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timeToEnchantTen);
		const spellRunes = determineRunes(user, enchantable.input.clone());
		const max = userBank.fits(spellRunes);
		if (max < quantity && max !== 0) quantity = max;
	}

	const duration = quantity * timeToEnchantTen;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${enchantable.name}s you can enchant is ${Math.floor(
			maxTripLength / timeToEnchantTen
		)}.`;
	}

	const cost = determineRunes(user, enchantable.input.clone().multiply(quantity));

	if (!userBank.has(cost)) {
		return `You don't have the materials needed to enchant ${quantity}x ${enchantable.name}, you need ${
			enchantable.input
		}, you're missing **${cost.clone().remove(userBank)}**.`;
	}
	await transactItems({ userID: user.id, itemsToRemove: cost });

	updateBankSetting('magic_cost_bank', cost);

	await addSubTaskToActivityTask<EnchantingActivityTaskOptions>({
		itemID: enchantable.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Enchanting'
	});

	const xpHr = `${Math.round(((enchantable.xp * quantity) / (duration / Time.Minute)) * 60).toLocaleString()} XP/Hr`;

	return `${user.minionName} is now enchanting ${quantity}x ${enchantable.name}, it'll take around ${formatDuration(
		duration
	)} to finish. Removed ${cost} from your bank. ${xpHr}`;
}
