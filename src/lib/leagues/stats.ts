import { UserStats } from '@prisma/client';
import { User as RoboChimpUser } from '@prisma/robochimp';
import { sumArr } from 'e';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '../clues/clueTiers';
import { prisma } from '../settings/prisma';
import { ItemBank } from '../types';
import { getItem } from '../util/getOSItem';

// Functions in this file should not depend on any other commands
export async function calcActualClues(user: MUser) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'clueID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'ClueCompletion'
AND user_id = '${user.id}'::bigint
AND data->>'clueID' IS NOT NULL
AND completed = true
GROUP BY data->>'clueID';`);
	const casketsCompleted = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		casketsCompleted.add(item.id, res.qty);
	}
	const { cl } = user;
	const stats = await user.fetchStats({ openable_scores: true });
	const opens = new Bank(stats.openable_scores as ItemBank);

	// Actual clues are only ones that you have: received in your cl, completed in trips, and opened.
	const actualClues = new Bank();

	for (const [item, qtyCompleted] of casketsCompleted.items()) {
		const clueTier = ClueTiers.find(i => i.id === item.id)!;
		actualClues.add(
			clueTier.scrollID,
			Math.min(qtyCompleted, cl.amount(clueTier.scrollID), opens.amount(clueTier.id))
		);
	}

	return actualClues;
}

export function totalLampedXP(userStats: UserStats) {
	return sumArr(Object.values(userStats.lamped_xp as ItemBank));
}

export async function calcLeaguesRanking(user: RoboChimpUser) {
	const [pointsRanking, tasksRanking] = await Promise.all([
		roboChimpClient.user.count({
			where: {
				leagues_points_total: {
					gt: user.leagues_points_total
				}
			}
		}),
		roboChimpClient.$queryRaw<any>`SELECT COUNT(*) AS count
FROM public.user
WHERE COALESCE(cardinality(leagues_completed_tasks_ids), 0) > ${user.leagues_completed_tasks_ids.length};`
	]);
	return {
		pointsRanking: pointsRanking + 1,
		tasksRanking: (tasksRanking[0].count as number) + 1
	};
}
