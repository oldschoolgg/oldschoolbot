import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { Item } from 'oldschooljs/dist/meta/types';

import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { AlchingActivityTaskOptions } from '../../../lib/types/minions';
import { clamp, formatDuration, toKMB, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { getItem } from '../../../lib/util/getOSItem';
import resolveItems from '../../../lib/util/resolveItems';
import { handleMahojiConfirmation } from '../../mahojiSettings';

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

export async function alchCommand(
	interaction: SlashCommandInteraction | null,
	channelID: bigint,
	user: KlasaUser,
	item: string,
	quantity: number | undefined,
	speedInput: number | undefined
) {
	const userBank = user.bank();
	let osItem = getItem(item);

	const [favAlchs] = user.getUserFavAlchs(calcMaxTripLength(user, 'Alching')) as Item[];
	if (!osItem) osItem = favAlchs;

	if (!osItem) return 'Invalid item.';
	if (!osItem.highalch || !osItem.tradeable) return 'This item cannot be alched.';

	if (user.skillLevel(SkillsEnum.Magic) < 55) {
		return 'You need level 55 Magic to cast High Alchemy';
	}

	const maxTripLength = user.maxTripLength('Alching');

	const maxCasts = Math.min(Math.floor(maxTripLength / timePerAlch), userBank.amount(osItem.id));

	if (!quantity) {
		quantity = maxCasts;
	}
	quantity = clamp(quantity, 1, maxCasts);

	if (quantity * timePerAlch > maxTripLength) {
		return `The max number of alchs you can do is ${maxCasts}!`;
	}

	let duration = quantity * timePerAlch;
	let fireRuneCost = quantity * 5;

	for (const runeProvider of unlimitedFireRuneProviders) {
		if (user.hasItemEquippedAnywhere(runeProvider)) {
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
	let speed = speedInput ? clamp(speedInput, 1, 5) : null;
	if (speed && !isNaN(speed) && typeof speed === 'number' && speed > 1 && speed < 6) {
		consumedItems.multiply(speed);
		consumedItems.add('Nature rune', Math.floor(consumedItems.amount('Nature rune') * 0.5));
		duration /= speed;
	}

	if (!user.owns(consumedItems)) {
		return `You don't have the required items, you need ${consumedItems}`;
	}
	if (interaction) {
		await handleMahojiConfirmation(
			interaction,
			`${user}, please confirm you want to alch ${quantity} ${osItem.name} (${toKMB(
				alchValue
			)}). This will take approximately ${formatDuration(duration)}, and consume ${consumedItems}`
		);
	}
	await user.removeItemsFromBank(consumedItems);
	await updateBankSetting(globalClient, ClientSettings.EconomyStats.MagicCostBank, consumedItems);

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
