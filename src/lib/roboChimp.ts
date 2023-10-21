import { formatOrdinal } from '@oldschoolgg/toolkit';
import { PrismaClient, TriviaQuestion, User } from '@prisma/robochimp';
import deepEqual from 'deep-equal';
import { calcWhatPercent, round, sumArr } from 'e';

import { BOT_TYPE } from './constants';
import { getTotalCl } from './data/Collections';
import { fetchStatsForCL } from './util';

declare global {
	const roboChimpClient: PrismaClient;
}
declare global {
	namespace NodeJS {
		interface Global {
			roboChimpClient: PrismaClient;
		}
	}
}

export type RobochimpUser = User;

global.roboChimpClient = global.roboChimpClient || new PrismaClient();

export async function getRandomTriviaQuestions(): Promise<TriviaQuestion[]> {
	const random: TriviaQuestion[] = await roboChimpClient.$queryRaw`SELECT id, question, answers
FROM trivia_question
ORDER BY random()
LIMIT 10;`;
	return random;
}

const clKey: keyof User = 'osb_cl_percent';
const levelKey: keyof User = 'osb_total_level';
const totalXPKey: keyof User = BOT_TYPE === 'OSB' ? 'osb_total_xp' : 'bso_total_xp';

export async function roboChimpSyncData(user: MUser) {
	const [totalClItems, clItems] = getTotalCl(user, 'collection', await fetchStatsForCL(user));

	const updateObj = {
		[clKey]: round(calcWhatPercent(clItems, totalClItems), 2),
		[levelKey]: user.totalLevel,
		[totalXPKey]: sumArr(Object.values(user.skillsAsXP))
	} as const;

	const newUser = await roboChimpClient.user.upsert({
		where: {
			id: BigInt(user.id)
		},
		update: updateObj,
		create: {
			id: BigInt(user.id),
			...updateObj
		}
	});

	if (!deepEqual(newUser.store_bitfield, user.user.store_bitfield)) {
		await user.update({ store_bitfield: newUser.store_bitfield });
	}
	return newUser;
}

export async function roboChimpUserFetch(userID: string) {
	const result = await roboChimpClient.user.upsert({
		where: {
			id: BigInt(userID)
		},
		create: {
			id: BigInt(userID)
		},
		update: {}
	});

	return result;
}

export async function calculateOwnCLRanking(userID: string) {
	const clPercentRank = (
		await roboChimpClient.$queryRaw<{ count: number }[]>`SELECT COUNT(*)
FROM public.user
WHERE osb_cl_percent >= (SELECT osb_cl_percent FROM public.user WHERE id = ${BigInt(userID)});`
	)[0].count;

	return formatOrdinal(clPercentRank);
}
