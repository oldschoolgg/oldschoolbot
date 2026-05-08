import { slayerMaskHelms } from '@/lib/bso/skills/slayer/slayerMaskHelms.js';

import type { ItemBank } from 'oldschooljs';

import { slayerMaskLeaderboardCache } from '@/lib/cache.js';

export const allSlayerMaskHelmsAndMasks = new Set(slayerMaskHelms.flatMap(i => [i.mask.id, i.helm.id]));

export async function syncSlayerMaskLeaderboardCache() {
	const result = await prisma.$queryRawUnsafe<
		{ user_id: string; on_task_with_mask_monster_scores: ItemBank }[]
	>(`SELECT user_id::text, on_task_with_mask_monster_scores
FROM user_stats
WHERE on_task_with_mask_monster_scores IS NOT NULL AND on_task_with_mask_monster_scores::text != '{}';`);

	const parsedUsers = [];
	for (const user of result) {
		const kcBank = user.on_task_with_mask_monster_scores as ItemBank;
		const maskKCBank = {} as ItemBank;
		const parsedUser = { userID: user.user_id, maskKCBank };
		for (const { mask, monsters } of slayerMaskHelms) {
			for (const mon of monsters) {
				maskKCBank[mask.id] = (maskKCBank[mask.id] ?? 0) + (kcBank[mon] ?? 0);
			}
		}
		parsedUsers.push(parsedUser);
	}

	for (const { mask, helm } of slayerMaskHelms) {
		const rankOneForThisMask = parsedUsers.sort(
			(a, b) => (b.maskKCBank[mask.id] ?? 0) - (a.maskKCBank[mask.id] ?? 0)
		)[0];

		if (!rankOneForThisMask) continue;
		if (!rankOneForThisMask.maskKCBank[mask.id]) continue;

		slayerMaskLeaderboardCache.set(mask.id, rankOneForThisMask.userID);
		slayerMaskLeaderboardCache.set(helm.id, rankOneForThisMask.userID);
	}
}
