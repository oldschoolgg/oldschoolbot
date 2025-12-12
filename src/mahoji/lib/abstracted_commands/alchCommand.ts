import { Time } from '@oldschoolgg/toolkit';
import { Bank, Items, resolveItems, toKMB } from 'oldschooljs';
import { clamp } from 'remeda';

import type { AlchingActivityTaskOptions } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

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
	interaction: MInteraction | null,
	channelId: string,
	user: MUser,
	item: string,
	quantity: number | undefined
) {
	const userBank = user.bank;
	let osItem = Items.getItem(item);
	const maxTripLength = await user.calcMaxTripLength('Alching');
	const [favAlchs] = user.favAlchs(maxTripLength);
	if (!osItem) osItem = favAlchs;

	if (!osItem) return 'Invalid item.';
	if (!osItem.highalch || !osItem.tradeable) return 'This item cannot be alched.';

	if (user.skillsAsLevels.magic < 55) {
		return 'You need level 55 Magic to cast High Alchemy';
	}

	const maxCasts = Math.min(Math.floor(maxTripLength / timePerAlch), userBank.amount(osItem.id));

	if (!quantity) {
		quantity = maxCasts;
	}
	quantity = clamp(quantity, { min: 1, max: maxCasts });

	if (quantity * timePerAlch > maxTripLength || quantity < 1 || maxCasts < 1) {
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
	const consumedItems = new Bank().add(osItem.id, quantity).add('Nature rune', quantity);
	if (fireRuneCost > 0) {
		consumedItems.add('Fire rune', fireRuneCost);
	}

	if (!user.owns(consumedItems)) {
		return `You don't have the required items, you need ${consumedItems}`;
	}
	if (interaction) {
		await interaction.confirmation(
			`${user}, please confirm you want to alch ${quantity} ${osItem.name} (${toKMB(
				alchValue
			)}). This will take approximately ${await formatTripDuration(user, duration)}, and consume ${consumedItems.clone().remove(osItem.id, quantity)}.`
		);
	}

	await user.transactItems({ itemsToRemove: consumedItems });
	await ClientSettings.updateBankSetting('magic_cost_bank', consumedItems);

	await ActivityManager.startTrip<AlchingActivityTaskOptions>({
		itemID: osItem.id,
		userID: user.id,
		channelId,
		quantity,
		duration,
		alchValue,
		type: 'Alching'
	});

	const response = `${user.minionName} is now alching ${quantity}x ${osItem.name}, it'll take around ${await formatTripDuration(
		user,
		duration
	)} to finish.`;

	return response;
}
