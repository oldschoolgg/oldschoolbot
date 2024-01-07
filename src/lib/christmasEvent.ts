import { GiftBoxStatus } from '@prisma/client';
import { percentChance, roll, shuffleArr, Time } from 'e';
import { Bank } from 'oldschooljs';
import { z } from 'zod';

import { production } from '../config';
import { Emoji } from './constants';
import { prisma } from './settings/prisma';
import { ActivityTaskData } from './types/minions';
import { getInterval } from './util';
import resolveItems from './util/resolveItems';

export const smokeyLotteryMaxTickets = {
	petHuntTickets: 8,
	giveawayTickets: 10,
	grinchionTickets: 15,
	challengeTickets: 1
};

export const grinchOutfit = resolveItems(['Grinch head', 'Grinch top', 'Grinch legs', 'Grinch feet', 'Grinch hands']);
export const santaOutfit = resolveItems([
	'Santa costume top (male)',
	'Santa costume top (female)',
	'Santa costume skirt',
	'Santa costume pants',
	'Santa costume gloves',
	'Santa costume boots',
	'Tinsel twirler'
]);
const chanceOfCatchingGrinchionPerMinute = 300;
const chanceOfGiftPerGrinchion = 15;
const chanceOfSantaHatPerGrinchion = 65;

async function pickAndGiveGrinchGift(user: MUser) {
	const present = await prisma.giftBox.findFirst({
		where: {
			status: GiftBoxStatus.Created,
			is_grinch_box: true
		}
	});
	if (!present) return null;
	await prisma.giftBox.update({
		where: {
			id: present.id
		},
		data: {
			status: GiftBoxStatus.Sent,
			owner_id: user.id
		}
	});
	return true;
}

function determineLoot(cl: Bank, duration: number) {
	let minutes = Math.floor(duration / Time.Minute);
	const loot = new Bank();
	if (!production) minutes = 40;
	if (minutes < 1) {
		return { gifts: 0, loot, grinchesCaught: 0, smokeyLotteryTickets: 0 };
	}

	let smokeyLotteryTickets = 0;
	let gifts = 0;
	let grinchesCaught = 0;

	for (let i = 0; i < minutes; i++) {
		if (roll(chanceOfCatchingGrinchionPerMinute)) {
			grinchesCaught++;

			// Outfit
			for (const piece of shuffleArr(grinchOutfit)) {
				if (roll(8 * (cl.amount(piece) + 1))) {
					loot.add(piece);
				}
			}
			for (const piece of shuffleArr(santaOutfit)) {
				if (roll(8 * (cl.amount(piece) + 1))) {
					loot.add(piece);
				}
			}

			// Gift
			if (roll(chanceOfGiftPerGrinchion) && gifts === 0) {
				gifts++;
			}

			if (roll(chanceOfSantaHatPerGrinchion)) {
				loot.add('Grinch santa hat');
			}

			if (percentChance(90)) {
				smokeyLotteryTickets++;
			}
		}
	}

	return {
		gifts,
		loot,
		grinchesCaught,
		smokeyLotteryTickets
	};
}

export async function christmasEventTripEffect({
	users,
	data,
	messages
}: {
	users: MUser[];
	data: ActivityTaskData;
	messages: string[];
}) {
	for (const user of users) {
		const name = users.length === 1 ? 'You' : `${user.usernameOrMention}`;

		const { loot, gifts, grinchesCaught, smokeyLotteryTickets } = determineLoot(user.cl, data.duration);
		if (grinchesCaught === 0) continue;
		if (loot.length > 0) {
			await user.addItemsToBank({ items: loot, collectionLog: true });
		}
		if (gifts > 0 && !user.isIronman) {
			const didGet = await pickAndGiveGrinchGift(user);
			messages.push(
				`<:Grinchion:1180975861206364311> ${Emoji.Gift} ${name} caught a grinchion stealing a present!${
					didGet ? '' : ' But.. it was empty.'
				}`
			);
		} else if (loot.length > 0) {
			messages.push(`<:Grinchion:1180975861206364311> ${name} caught a grinchion and received ${loot}`);
		} else {
			messages.push(`<:Grinchion:1180975861206364311> ${name} caught a grinchion!`);
		}

		if (grinchesCaught > 0) {
			const didGetTicket =
				smokeyLotteryTickets > 0
					? await user.tryGiveSmokeyLotteryTickets('grinchionTickets', smokeyLotteryTickets)
					: false;
			if (didGetTicket) {
				messages.push(
					`<:Grinchion:1180975861206364311> ${name} caught a grinchion and found a Smokey lottery ticket!`
				);
			}
			await user.update({
				grinchions_caught: {
					increment: grinchesCaught
				}
			});
		}
	}
}

export const smokeyLotterySchema = z.object({
	petHuntTickets: z.number().int().min(0).max(smokeyLotteryMaxTickets.petHuntTickets),
	giveawayTickets: z.number().int().min(0).max(smokeyLotteryMaxTickets.giveawayTickets),
	grinchionTickets: z.number().int().min(0).max(smokeyLotteryMaxTickets.grinchionTickets),
	challengeTickets: z.number().int().min(0).max(smokeyLotteryMaxTickets.challengeTickets)
});

export type SmokeyLotteryData = z.infer<typeof smokeyLotterySchema>;

export const defaultSmokeyLotteryData: SmokeyLotteryData = {
	petHuntTickets: 0,
	giveawayTickets: 0,
	grinchionTickets: 0,
	challengeTickets: 0
};

export const getSmokeyLotteryGiveawayInterval = () => getInterval(23);
