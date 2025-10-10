import type { UserStats } from "@prisma/client";
import { chunk } from "remeda";

import { getUsernameSync } from "@/lib/util.js";
import { doMenu } from "@/mahoji/commands/leaderboard.js";

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

	return doMenu(
		interaction,
		chunk(list, 10).map(subList =>
			subList
				.map(
					({ id, percent }) =>
						`**${getUsernameSync(id)}:** ${percent.toFixed(2)}% ${untrimmed ? 'Untrimmed' : 'Trimmed'}`
				)
				.join('\n')
		),
		'Completionist Leaderboard'
	);
}
