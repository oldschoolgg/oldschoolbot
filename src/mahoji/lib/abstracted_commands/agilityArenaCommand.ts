import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import { Bank } from 'oldschooljs';

import { Time } from 'e';
import { KaramjaDiary, userhasDiaryTier } from '../../../lib/diaries';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { mahojiChatHead } from '../../../lib/util/chatHeadImage';
import getOSItem from '../../../lib/util/getOSItem';
import { userHasGracefulEquipped } from '../../mahojiSettings';

const plainGraceful = new Bank({
	'Graceful hood': 1,
	'Graceful top': 1,
	'Graceful legs': 1,
	'Graceful gloves': 1,
	'Graceful boots': 1,
	'Graceful cape': 1
}).freeze();

const brimhavenGraceful = new Bank({
	'Brimhaven graceful hood': 1,
	'Brimhaven graceful top': 1,
	'Brimhaven graceful legs': 1,
	'Brimhaven graceful gloves': 1,
	'Brimhaven graceful boots': 1,
	'Brimhaven graceful cape': 1
}).freeze();

export const agilityArenaBuyables = [
	{
		name: 'Toadflax',
		cost: 3,
		aliases: ['toad', 'flax']
	},
	{
		name: 'Snapdragon',
		cost: 10,
		aliases: ['snap', 'dragon']
	},
	{
		name: 'Graceful outfit Recolour',
		input: plainGraceful,
		output: brimhavenGraceful,
		cost: 250,
		aliases: ['brim', 'brimhaven', 'grace', 'graceful', 'recolour', 'recolor', 'purple']
	},
	{
		name: "Pirate's hook",
		cost: 800,
		aliases: ['pirates', 'hook']
	},
	{
		name: 'Amylase pack',
		cost: 60,
		aliases: ['ama', 'amylase', 'pack']
	}
];

export async function agilityArenaCommand(
	user: MUser,
	channelID: string,
	quantity: number | undefined
): CommandResponse {
	const userMaxTrip = calcMaxTripLength(user, 'AgilityArena');
	const maxQuantity = userMaxTrip / Time.Minute;

	if (!quantity || quantity * Time.Minute > userMaxTrip) {
		quantity = maxQuantity;
	}

	const duration = quantity * Time.Minute;

	if (!userHasGracefulEquipped(user)) {
		return mahojiChatHead({
			content: 'Ahoy there! You need full Graceful equipped to do the Brimhaven Agility Arena!',
			head: 'izzy'
		});
	}

	const boosts = [];

	const [hasKaramjaElite] = await userhasDiaryTier(user, KaramjaDiary.elite);
	if (hasKaramjaElite) {
		boosts.push('10% extra tickets for Karamja Elite diary');
	}

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'AgilityArena',
		quantity,
		minigameID: 'agility_arena'
	});

	let str = `${user.minionName} is now doing the Brimhaven Agility Arena for ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}
	return str;
}

export async function agilityArenaBuyCommand(user: MUser, input: string, qty = 1): CommandResponse {
	const buyable = agilityArenaBuyables.find(
		i => stringMatches(input, i.name) || i.aliases.some(alias => stringMatches(alias, input))
	);

	const { bank } = user;
	const amountTicketsHas = bank.amount('Brimhaven voucher');
	if (amountTicketsHas === 0) {
		return mahojiChatHead({
			content: "Are ye serious! You have no vouchers, you can't buy anythin!",
			head: 'izzy'
		});
	}

	if (buyable) {
		let cost = qty * buyable.cost;
		if (buyable.name === 'Graceful outfit Recolour') {
			qty = 1;
			cost = buyable.cost;
			if (!bank.has(plainGraceful)) {
				return mahojiChatHead({
					content: "Ye don't have a full set of Graceful in your bank for me to recolor!",
					head: 'izzy'
				});
			}
			if (amountTicketsHas < cost) {
				return mahojiChatHead({
					content: `Ye don't have enough vouchers, I charge ${buyable.cost} vouchers for a graceful recoloring.`,
					head: 'izzy'
				});
			}
		} else if (amountTicketsHas < cost) {
			return mahojiChatHead({
				content: `Ye don't have enough vouchers, I charge ${buyable.cost * qty} vouchers ${qty}x ${buyable.name}.`,
				head: 'izzy'
			});
		}

		const itemsToAdd = new Bank();
		const itemsToRemove = new Bank();
		if (buyable.input && buyable.output) {
			itemsToAdd.add(buyable.output);
			itemsToRemove.add(buyable.input).add('Brimhaven voucher', cost);
		} else {
			itemsToAdd.add(getOSItem(buyable.name), qty);
			itemsToRemove.add('Brimhaven voucher', cost);
		}
		await user.transactItems({
			itemsToAdd,
			itemsToRemove,
			collectionLog: true
		});
		return `Successfully purchased ${qty}x ${buyable.name} for ${cost}x Brimhaven vouchers.`;
	}

	return 'Invalid options.';
}

export async function agilityArenaXPCommand(user: MUser, qty: number): CommandResponse {
	const amountTicketsHas = user.bank.amount('Agility arena ticket');

	if (amountTicketsHas === 0) {
		return "You don't own a single Agility arena tickets. Earn some by participating in the Brimhaven Agility Arena `/minigames agility_arena start `";
	}
	if (amountTicketsHas < qty) {
		qty = amountTicketsHas;
	}

	const [hasKaramjaMed] = await userhasDiaryTier(user, KaramjaDiary.medium);
	const xpToGive = (hasKaramjaMed ? 379.5 : 345) * qty;

	const str = `Redeemed ${qty}x Agility arena tickets for ${xpToGive.toLocaleString()} Agility XP. (${(xpToGive / qty).toFixed(2)} ea)`;
	await transactItems({ userID: user.id, itemsToRemove: new Bank().add('Agility arena ticket', qty) });
	await user.addXP({
		skillName: SkillsEnum.Agility,
		amount: xpToGive,
		artificial: true
	});
	return str;
}
