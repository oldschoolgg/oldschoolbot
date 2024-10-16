import type { ChatInputCommandInteraction } from 'discord.js';
import { Time, clamp } from 'e';
import { Bank, type Item } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { resolveItems } from 'oldschooljs/dist/util/util';
import type { AlchingActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, toKMB } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { getItem } from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

const unlimitedFireRuneProviders = resolveItems([
	'Staff of fire',
	'Fire battlestaff',
	'Mystic fire staff',
	'Lava battlestaff',
	'Mystic lava staff',
	'Steam battlestaff',
	'Mystic steam staff',
	'Smoke battlestaff',
	'Mystic smoke staff',
	'Tome of fire'
]);

// 5 tick action
export const timePerAlch = Time.Second * 3;
export const timePerAlchAgility = Time.Second * (3 + 10);

export async function alchCommand(
	interaction: ChatInputCommandInteraction | null,
	channelID: string,
	user: MUser,
	item: string,
	quantity: number | undefined
) {
	const userBank = user.bank;
	let osItem = getItem(item);

	const [favAlchs] = user.favAlchs(calcMaxTripLength(user, 'Alching')) as Item[];
	if (!osItem) osItem = favAlchs;

	if (!osItem) return 'Invalid item.';
	if (!osItem.highalch || !osItem.tradeable) return 'This item cannot be alched.';

	if (user.skillLevel(SkillsEnum.Magic) < 55) {
		return 'You need level 55 Magic to cast High Alchemy';
	}

	const maxTripLength = calcMaxTripLength(user, 'Alching');

	const maxCasts = Math.min(Math.floor(maxTripLength / timePerAlch), userBank.amount(osItem.id));

	if (!quantity) {
		quantity = maxCasts;
	}
	quantity = clamp(quantity, 1, maxCasts);

	if (quantity * timePerAlch > maxTripLength) {
		return `The max number of alchs you can do is ${maxCasts}!`;
	}

	const duration = quantity * timePerAlch;
	let fireRuneCost = quantity * 5;

	for (const runeProvider of unlimitedFireRuneProviders) {
		if (user.hasEquipped(runeProvider)) {
			fireRuneCost = 0;
			break;
		}
	}

	const alchValue = quantity * osItem.highalch;
	const consumedItems = new Bank({
		...(fireRuneCost > 0 ? { 'Fire rune': fireRuneCost } : {}),
		'Nature rune': quantity
	});
	consumedItems.add(osItem.id, quantity);

	if (!user.owns(consumedItems)) {
		return `You don't have the required items, you need ${consumedItems}`;
	}
	if (interaction) {
		await handleMahojiConfirmation(
			interaction,
			`${user}, please confirm you want to alch ${quantity} ${osItem.name} (${toKMB(
				alchValue
			)}). This will take approximately ${formatDuration(duration)}, and consume ${
				fireRuneCost > 0 ? `${fireRuneCost}x Fire rune` : ''
			} ${quantity}x Nature runes.`
		);
	}

	await user.removeItemsFromBank(consumedItems);
	await updateBankSetting('magic_cost_bank', consumedItems);

	await addSubTaskToActivityTask<AlchingActivityTaskOptions>({
		itemID: osItem.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		alchValue,
		type: 'Alching'
	});

	const response = `${user.minionName} is now alching ${quantity}x ${osItem.name}, it'll take around ${formatDuration(
		duration
	)} to finish.`;

	return response;
}
