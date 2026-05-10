import { Prisma, type UserStats } from '@/prisma/main.js';

export async function fetchUserStats(userId: string): Promise<UserStats> {
	const id = BigInt(userId);
	try {
		const result = await prisma.userStats.upsert({
			where: {
				user_id: id
			},
			create: {
				user_id: id
			},
			update: {}
		});
		return result;
	} catch (err) {
		// Ignore unique constraint errors, they already have a row
		if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2002') {
			throw err;
		}
	}

	// They definitely should have a row now
	const result = await prisma.userStats.findFirstOrThrow({
		where: {
			user_id: id
		}
	});

	return result;
}
