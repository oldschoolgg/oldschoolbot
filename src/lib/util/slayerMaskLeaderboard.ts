import { Bank } from 'oldschooljs';

import { slayerMaskHelms } from '../data/slayerMaskHelms';
import { prisma } from '../settings/prisma';
import { ItemBank } from '../types';

export const slayerMaskLeaderboardCache = new Map<number, string>();
export const allSlayerMaskHelmsAndMasks = new Set(slayerMaskHelms.flatMap(i => [i.mask.id, i.helm.id]));

export async function syncSlayerMaskLeaderboardCache() {
	const result = await prisma.$queryRawUnsafe<
		{ user_id: string; on_task_with_mask_monster_scores: ItemBank }[]
	>(`SELECT user_id::text, on_task_with_mask_monster_scores
FROM user_stats
WHERE on_task_with_mask_monster_scores IS NOT NULL AND on_task_with_mask_monster_scores::text != '{}';`);

	const parsedUsers = [];
	for (const user of result) {
		const kcBank = new Bank(user.on_task_with_mask_monster_scores);
		const maskKCBank = new Bank();
		let parsedUser = { userID: user.user_id, maskKCBank };
		for (const { mask, monsters } of slayerMaskHelms) {
			for (const mon of monsters) {
				maskKCBank.add(mask.id, kcBank.amount(mon));
			}
		}
		parsedUsers.push(parsedUser);
	}

	for (const { mask, helm } of slayerMaskHelms) {
		const rankOneForThisMask = parsedUsers.sort(
			(a, b) => b.maskKCBank.amount(mask.id) - a.maskKCBank.amount(mask.id)
		)[0];

		if (!rankOneForThisMask) continue;
		if (!rankOneForThisMask.maskKCBank.has(mask.id)) continue;

		slayerMaskLeaderboardCache.set(mask.id, rankOneForThisMask.userID);
		slayerMaskLeaderboardCache.set(helm.id, rankOneForThisMask.userID);
	}
}
