import { chunk } from 'remeda';

import { getUsernameSync } from '@/lib/util.js';
import { doMenu, getPos, LB_PAGE_SIZE } from '@/mahoji/commands/leaderboard.js';

export async function bsoChallengeLeaderboard(interaction: MInteraction) {
	const challengeCount: { id: string; challengescore: number }[] = await prisma.$queryRawUnsafe(
		`SELECT u.user_id::text AS id, u.challengescore
		FROM (
			SELECT COALESCE(main_server_challenges_won, 0) AS challengescore, user_id
			FROM user_stats
		) AS u
		ORDER BY u.challengescore DESC
		LIMIT 100;`
	);

	return doMenu(
		interaction,
		chunk(challengeCount, LB_PAGE_SIZE).map((subList, i) =>
			subList
				.map(
					({ id, challengescore }, j) =>
						`${getPos(i, j)}**${getUsernameSync(id)}:** ${challengescore.toLocaleString()} Challenges`
				)
				.join('\n')
		),
		'Top Challenges Won Leaderboard'
	);
}
