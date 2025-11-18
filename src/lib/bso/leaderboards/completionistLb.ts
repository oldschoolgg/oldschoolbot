import type { UserStats } from '@/prisma/main.js';
import { doMenuWrapper } from '@/lib/menuWrapper.js';

export async function bsoCompletionistLb(interaction: MInteraction, untrimmed: boolean, ironmanOnly: boolean) {
	const key: keyof UserStats = untrimmed ? 'untrimmed_comp_cape_percent' : 'comp_cape_percent';
	const list = await prisma.$queryRawUnsafe<{ id: string; percent: number }[]>(
		`SELECT user_id::text AS id, ${key} AS percent
		 FROM user_stats
		${ironmanOnly ? 'INNER JOIN "users" on "users"."id" = "user_stats"."user_id"::text' : ''}
		 WHERE ${key} IS NOT NULL
		 ${ironmanOnly ? ' AND "users"."minion.ironman" = true ' : ''}
		 ORDER BY ${key} DESC
		 LIMIT 100;`
	);

	return doMenuWrapper({
		interaction,
		users: list.map(({ id, percent }) => ({ id, score: percent })),
		title: ironmanOnly
			? `${untrimmed ? 'Untrimmed' : 'Trimmed'} Completionist Ironman Leaderboard`
			: `${untrimmed ? 'Untrimmed' : 'Trimmed'} Completionist Leaderboard`,
		ironmanOnly: Boolean(ironmanOnly),
		formatter: score => `${score.toFixed(2)}%`
	})
}
