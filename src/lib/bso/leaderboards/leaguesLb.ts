import { allLeagueTasks } from "@/lib/bso/leagues/leagues.js";

import { chunk } from "remeda";

import { getUsernameSync } from "@/lib/util.js";
import { doMenu } from "@/mahoji/commands/leaderboard.js";

async function leaguesPointsLeaderboard(interaction: MInteraction) {
	const result = await roboChimpClient.user.findMany({
		where: {
			leagues_points_total: {
				gt: 0
			}
		},
		orderBy: {
			leagues_points_total: 'desc'
		},
		take: 100
	});
	return doMenu(
		interaction,
		chunk(result, 10).map(subList =>
			subList
				.map(
					({ id, leagues_points_total }) =>
						`**${getUsernameSync(id)}:** ${leagues_points_total.toLocaleString()} Pts`
				)
				.join('\n')
		),
		'Leagues Points Leaderboard'
	);
}

async function leastCompletedLeagueTasksLb() {
	const taskCounts = await roboChimpClient.$queryRaw<
		{ task_id: number; qty: number }[]
	>`SELECT task_id, count(*)::int AS qty
FROM (
   SELECT unnest(leagues_completed_tasks_ids) AS task_id
   FROM public.user
   ) sub
GROUP BY 1
ORDER BY 2 ASC;`;
	const taskObj: Record<number, number> = {};
	for (const task of allLeagueTasks) {
		taskObj[task.id] = 0;
	}
	for (const task of taskCounts) {
		taskObj[task.task_id] = task.qty;
	}

	return `**Least Commonly Completed Tasks:**
${Object.entries(taskObj)
			.sort((a, b) => a[1] - b[1])
			.slice(0, 10)
			.map(task => {
				const taskObj = allLeagueTasks.find(t => t.id === Number.parseInt(task[0]))!;
				return `${taskObj.name}: ${task[1]} users completed`;
			})
			.join('\n')}

**Most Commonly Completed Tasks:**
${Object.entries(taskObj)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map((task, index) => {
				const taskObj = allLeagueTasks.find(t => t.id === Number.parseInt(task[0]))!;
				return `${index + 1}. ${taskObj.name}`;
			})
			.join('\n')}`;
}

export async function bsoLeaguesLeaderboard(interaction: MInteraction, type: 'points' | 'tasks' | 'hardest_tasks') {
	if (type === 'points') return leaguesPointsLeaderboard(interaction);
	if (type === 'hardest_tasks') return leastCompletedLeagueTasksLb();
	const result: { id: number; tasks_completed: number }[] =
		await roboChimpClient.$queryRaw`SELECT id::text, COALESCE(cardinality(leagues_completed_tasks_ids), 0) AS tasks_completed
										  FROM public.user
										  ORDER BY tasks_completed DESC
										  LIMIT 100;`;
	return doMenu(
		interaction,
		chunk(result, 10).map(subList =>
			subList
				.map(
					({ id, tasks_completed }) =>
						`**${getUsernameSync(id.toString())}:** ${tasks_completed.toLocaleString()} Tasks`
				)
				.join('\n')
		),
		'Leagues Tasks Leaderboard'
	);
}
