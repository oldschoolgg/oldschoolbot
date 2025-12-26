import { doMenuWrapper } from '@/lib/menuWrapper.js';

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

	return doMenuWrapper({
		interaction,
		users: challengeCount.map(({ id, challengescore }) => ({ id, score: challengescore })),
		title: 'Top Challenges Won Leaderboard',
		ironmanOnly: false
	});
}
