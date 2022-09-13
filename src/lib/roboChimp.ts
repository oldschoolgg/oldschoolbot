import { PrismaClient, TriviaQuestion } from '@prisma/robochimp';

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
	return 1 > 0
		? [
				{
					id: 1,
					question: 'hi',
					answers: ['hi']
				}
		  ]
		: random;
}

export async function roboChimpUserFetch(userID: bigint) {
	const result = await roboChimpClient.user.upsert({
		where: {
			id: userID
		},
		create: {
			id: userID
		},
		update: {}
	});
	return result;
}
