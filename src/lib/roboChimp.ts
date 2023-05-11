import { PrismaClient, TriviaQuestion, User } from '@prisma/robochimp';
import { calcWhatPercent, round, sumArr } from 'e';

import { BOT_TYPE } from './constants';
import { getTotalCl } from './data/Collections';
import { MUserClass } from './MUser';
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

export async function roboChimpSyncData(user: User, _mUser?: MUserClass) {
	const mUser = _mUser ?? (await mUserFetch(user.id.toString()));
	const [totalClItems, clItems] = getTotalCl(mUser, 'collection', await fetchStatsForCL(mUser));

	const newUser = await roboChimpClient.user.update({
		where: {
			id: user.id
		},
		data: {
			[clKey]: round(calcWhatPercent(clItems, totalClItems), 2),
			[levelKey]: mUser.totalLevel,
			[totalXPKey]: sumArr(Object.values(mUser.skillsAsXP))
		}
	});

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
	if (!result[clKey] || !result[levelKey]) {
		return roboChimpSyncData(result);
	}
	return result;
}
