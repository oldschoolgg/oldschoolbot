import { formatOrdinal } from '@oldschoolgg/toolkit/util';
import type { TriviaQuestion, User } from '@prisma/robochimp';
import { calcWhatPercent, round, sumArr } from 'e';
import deepEqual from 'fast-deep-equal';
import type { Bank } from 'oldschooljs';

import { BOT_TYPE, globalConfig, masteryKey } from './constants';
import { getTotalCl } from './data/Collections';
import { calculateMastery } from './mastery';
import { cacheRoboChimpUser } from './perkTier';
import { MUserStats } from './structures/MUserStats';

export type RobochimpUser = User;

export async function getRandomTriviaQuestions(): Promise<TriviaQuestion[]> {
	if (!globalConfig.isProduction) {
		return [
			{
				id: 1,
				question: 'What is 1+1?',
				answers: ['2']
			},
			{
				id: 2,
				question: 'What is 2+2?',
				answers: ['4']
			}
		];
	}
	const random: TriviaQuestion[] = await roboChimpClient.$queryRaw`SELECT id, question, answers
FROM trivia_question
ORDER BY random()
LIMIT 10;`;
	return random;
}

const clKey: keyof User = 'osb_cl_percent';
const levelKey: keyof User = 'osb_total_level';
const totalXPKey: keyof User = BOT_TYPE === 'OSB' ? 'osb_total_xp' : 'bso_total_xp';

export async function roboChimpSyncData(user: MUser, newCL?: Bank) {
	const id = BigInt(user.id);
	const newCLArray: number[] = (newCL ?? user.cl).itemIDs;
	const clArrayUpdateObject = {
		cl_array: newCLArray,
		cl_array_length: newCLArray.length
	} as const;

	const stats = new MUserStats(
		await prisma.userStats.upsert({
			where: {
				user_id: id
			},
			create: {
				user_id: id,
				...clArrayUpdateObject
			},
			update: {
				...clArrayUpdateObject
			}
		})
	);

	const [totalClItems, clItems] = getTotalCl(user, 'collection', stats);
	const clCompletionPercentage = round(calcWhatPercent(clItems, totalClItems), 2);
	const totalXP = sumArr(Object.values(user.skillsAsXP));

	const { totalMastery } = await calculateMastery(user, stats);

	const updateObj = {
		[clKey]: clCompletionPercentage,
		[levelKey]: user.totalLevel,
		[totalXPKey]: totalXP,
		[masteryKey]: totalMastery
	} as const;

	const newUser: RobochimpUser = await roboChimpClient.user.upsert({
		where: {
			id: BigInt(user.id)
		},
		update: updateObj,
		create: {
			id: BigInt(user.id),
			...updateObj
		}
	});
	cacheRoboChimpUser(newUser);

	if (!deepEqual(newUser.store_bitfield, user.user.store_bitfield)) {
		await user.update({ store_bitfield: newUser.store_bitfield });
	}
	return newUser;
}

export async function roboChimpUserFetch(userID: string): Promise<RobochimpUser> {
	const result: RobochimpUser = await roboChimpClient.user.upsert({
		where: {
			id: BigInt(userID)
		},
		create: {
			id: BigInt(userID)
		},
		update: {}
	});

	cacheRoboChimpUser(result);

	return result;
}

export async function calculateOwnCLRanking(userID: string) {
	const clPercentRank = (
		await roboChimpClient.$queryRaw<{ count: number }[]>`SELECT COUNT(*)::int
FROM public.user
WHERE osb_cl_percent >= (SELECT osb_cl_percent FROM public.user WHERE id = ${BigInt(userID)});`
	)[0].count;

	return formatOrdinal(clPercentRank);
}
