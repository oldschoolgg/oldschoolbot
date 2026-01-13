import { Prisma } from '@/prisma/main.js';
import { doMenuWrapper } from '@/lib/menuWrapper.js';

export async function bsoTamesHatchedLb(interaction: MInteraction, ironmanOnly: boolean) {
	const query = Prisma.sql`
               SELECT id, CAST(nursery->>'eggsHatched' AS INTEGER) as count
               FROM users
               WHERE nursery IS NOT NULL
                 AND CAST(nursery->>'eggsHatched' AS INTEGER) > 0
                 ${ironmanOnly ? Prisma.sql`AND "minion.ironman" = true` : Prisma.empty}
               ORDER BY count DESC
               LIMIT 50;
       `;
	const users = (await prisma.$queryRaw<{ id: string; count: number }[]>(query)).map(res => ({
		...res,
		score: res.count
	}));

	return doMenuWrapper({
		ironmanOnly,
		interaction,
		users,
		title: 'Tames Hatched Leaderboard'
	});
}
