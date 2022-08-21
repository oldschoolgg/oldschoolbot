import { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { KaramjaDiary, userhasDiaryTier } from '../../../lib/diaries';
import { MUser } from '../../../lib/MUser';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { mahojiChatHead, newChatHeadImage } from '../../../lib/util/chatHeadImage';
import getOSItem from '../../../lib/util/getOSItem';
import { minionName } from '../../../lib/util/minionUtils';
import { mahojiUserSettingsUpdate } from '../../mahojiSettings';

export const agilityArenaBuyables = [
	{
		item: getOSItem('Toadflax'),
		cost: 3,
		aliases: []
	},
	{
		item: getOSItem('Snapdragon'),
		cost: 10,
		aliases: []
	},
	{
		item: getOSItem("Pirate's hook"),
		cost: 800,
		aliases: ['pirates']
	}
];

const ticketQuantities = {
	1: 240,
	10: 248,
	25: 260,
	100: 280,
	1000: 320
};

const plainGraceful = new Bank({
	'Graceful hood': 1,
	'Graceful top': 1,
	'Graceful legs': 1,
	'Graceful gloves': 1,
	'Graceful boots': 1,
	'Graceful cape': 1
});

const brimhavenGraceful = new Bank({
	'Brimhaven graceful hood': 1,
	'Brimhaven graceful top': 1,
	'Brimhaven graceful legs': 1,
	'Brimhaven graceful gloves': 1,
	'Brimhaven graceful boots': 1,
	'Brimhaven graceful cape': 1
});

export function determineXPFromTickets(qty: number, user: User, hasDiary: boolean) {
	let baseXP = ticketQuantities[qty as keyof typeof ticketQuantities] ?? ticketQuantities[1000];
	// The experience reward from the tickets is increased by 5 per ticket for each Agility level above 40.
	baseXP += 5 * (user.skillLevel(SkillsEnum.Agility) - 40);
	let xpToGive = baseXP * qty;
	if (hasDiary) xpToGive *= 1.1;
	return xpToGive;
}

export async function agilityArenaCommand(user: User, klasaUser: KlasaUser, channelID: bigint): CommandResponse {
	const duration = calcMaxTripLength(user, 'AgilityArena');

	if (!klasauserHasGracefulEquipped(user)) {
		return mahojiChatHead({
			content: 'Ahoy there! You need full Graceful equipped to do the Brimhaven Agility Arena!',
			head: 'izzy'
		});
	}

	const boosts = [];

	const [hasKaramjaElite] = await userhasDiaryTier(klasaUser, KaramjaDiary.elite);
	if (hasKaramjaElite) {
		boosts.push('10% extra tickets for Karamja Elite diary');
	}

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'AgilityArena',
		quantity: 1,
		minigameID: 'agility_arena'
	});

	let str = `${minionName(user)} is now doing the Brimhaven Agility Arena for ${formatDuration(duration)}.`;

	if (boosts.length > 0) {
		str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}
	return str;
}

export async function agilityArenaBuyCommand(user: KlasaUser, input: string, qty = 1): CommandResponse {
	const buyable = agilityArenaBuyables.find(
		i => stringMatches(input, i.item.name) || i.aliases.some(alias => stringMatches(alias, input))
	);

	const bank = user.bank();
	const amountTicketsHas = bank.amount('Agility arena ticket');
	if (amountTicketsHas === 0) {
		return {
			attachments: [
				{
					buffer: await newChatHeadImage({
						content: "Are ye serious! You have no tickets, you can't buy anythin!",
						head: 'izzy'
					}),
					fileName: 'image.jpg'
				}
			]
		};
	}

	if (buyable) {
		const cost = qty * buyable.cost;
		if (amountTicketsHas < cost) {
			return "You don't have enough Agility arena tickets.";
		}
		await user.removeItemsFromBank(new Bank().add('Agility arena ticket', cost));
		await user.addItemsToBank({ items: { [buyable.item.id]: qty }, collectionLog: true });
		return `Successfully purchased ${qty}x ${buyable.item.name} for ${cost}x Agility arena tickets.`;
	}

	return 'Invalid options.';
}

export async function agilityArenaRecolorCommand(user: KlasaUser) {
	const bank = user.bank();
	let cost = 250;
	if (!bank.has(plainGraceful)) {
		return mahojiChatHead({
			content: "Ye don't have a full set of Graceful in your bank for me to recolor!",
			head: 'izzy'
		});
	}

	const amountTicketsHas = bank.amount('Agility arena ticket');
	if (amountTicketsHas < cost) {
		return mahojiChatHead({
			content: `Ye don't have enough tickets, I charge ${cost} tickets for a recoloring.`,
			head: 'izzy'
		});
	}
	bank.remove('Agility arena ticket', cost);
	bank.remove(plainGraceful);
	bank.add(brimhavenGraceful);
	await mahojiUserSettingsUpdate(user.id, {
		bank: bank.bank
	});
	await user.addItemsToCollectionLog({ items: brimhavenGraceful });
	return mahojiChatHead({
		content: "I've recolored ye Graceful set, and taken your tickets!",
		head: 'izzy'
	});
}

export async function agilityArenaXPCommand(user: MUser, qty: number): CommandResponse {
	const amountTicketsHas = user.bank().amount('Agility arena ticket');

	if (!(qty in ticketQuantities)) {
		return `You can only redeem tickets for XP at the following quantities: ${Object.keys(ticketQuantities).join(
			', '
		)}.`;
	}
	if (amountTicketsHas < qty) {
		return "You don't have enough Agility arena tickets.";
	}
	const [hasKaramjaMed] = await userhasDiaryTier(user.user, KaramjaDiary.medium);
	const xpToGive = determineXPFromTickets(qty, user, hasKaramjaMed);
	let str = `Redeemed ${qty}x Agility arena tickets for ${xpToGive.toLocaleString()} Agility XP. (${(
		xpToGive / qty
	).toFixed(2)} ea)`;
	await user.removeItemsFromBank(new Bank().add('Agility arena ticket', qty));
	await user.addXP({
		skillName: SkillsEnum.Agility,
		amount: xpToGive,
		artificial: true
	});
	if (hasKaramjaMed) {
		str += '\n\nYou received 10% extra XP for the Karamja Medium Diary.';
	}
	return str;
}
