import { GiftBoxStatus } from '@prisma/client';
import { percentChance, roll, round, shuffleArr, sumArr, Time, uniqueArr } from 'e';
import { writeFileSync } from 'fs';
import { Bank } from 'oldschooljs';
import { z } from 'zod';

import { production } from '../config';
import { Emoji } from './constants';
import { prisma } from './settings/prisma';
import { ActivityTaskData } from './types/minions';
import { formatDuration, getInterval } from './util';
import { barChart } from './util/chart';
import resolveItems from './util/resolveItems';

export const smokeyLotteryMaxTickets = {
	petHuntTickets: 8,
	giveawayTickets: 10,
	grinchionTickets: 15,
	challengeTickets: 1
};
const HOURS_PLAYED_PER_DAY = 13;

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

function simulateFinishingSingleChristmas() {
	const totalLoot = new Bank();
	const tripLength = Time.Minute * 30;
	let totalTime = 0;
	let totalGifts = 0;
	let totalGrinchesCaught = 0;
	let totalTickets = 0;
	while (
		resolveItems([...grinchOutfit, ...santaOutfit, 'Grinch santa hat']).some(i => !totalLoot.has(i)) ||
		totalTickets < smokeyLotteryMaxTickets.grinchionTickets
	) {
		totalTime += tripLength;
		const { loot, gifts, grinchesCaught, smokeyLotteryTickets } = determineLoot(totalLoot, tripLength);
		totalLoot.add(loot);
		totalGifts += gifts;
		totalGrinchesCaught += grinchesCaught;
		totalTickets += smokeyLotteryTickets;
	}

	return {
		totalTime,
		totalLoot,
		totalGrinchesCaught,
		totalGifts,
		totalTickets,
		playTimeDays: round(Math.round(totalTime / Time.Hour) / HOURS_PLAYED_PER_DAY, 1)
	};
}

async function simulateAverageFinish() {
	const results: ReturnType<typeof simulateFinishingSingleChristmas>[] = [];
	for (let i = 0; i < 500; i++) {
		results.push(simulateFinishingSingleChristmas());
	}
	results.sort((a, b) => b.totalTime - a.totalTime);
	const averageFinishTime = sumArr(results.map(i => i.totalTime)) / results.length;
	const averageFinishTimeHours = averageFinishTime / Time.Hour;
	const averageDaysToFinish = averageFinishTimeHours / HOURS_PLAYED_PER_DAY;
	const averageGiftsPerFinish = sumArr(results.map(i => i.totalGifts)) / results.length;
	const uniqueHours = uniqueArr(results.map(i => i.playTimeDays)).sort((a, b) => a - b);

	console.log(`
Average of ${formatDuration(averageFinishTime)} to finish, ${averageDaysToFinish.toFixed(
		2
	)} days of playtime (${HOURS_PLAYED_PER_DAY}hrs/day)
Average of ${averageGiftsPerFinish} gifts
`);

	const res = await barChart(
		'Finish Times',
		str => str,
		uniqueHours.map(i => [`${i} days`, results.filter(t => t.playTimeDays === i).length])
	);
	writeFileSync('./finishTimes.png', res);
}
simulateAverageFinish();

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
