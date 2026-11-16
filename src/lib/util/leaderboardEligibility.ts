export const LEADERBOARD_OVERFETCH = 3;

export async function leaderboardEligibility() {
	const rows = await roboChimpClient.blacklistedEntity.findMany({
		where: { type: 'user' },
		select: { id: true }
	});
	const excluded = new Set(rows.map(row => row.id.toString()));

	return {
		includes: (id: string) => !excluded.has(id)
	};
}
