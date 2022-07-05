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

export async function getRandomTriviaQuestion(): Promise<TriviaQuestion> {
	const random: TriviaQuestion[] = await roboChimpClient.$queryRaw`SELECT id, question, answers
FROM trivia_question
ORDER BY random()
LIMIT 1;`;
	return random[0];
}
