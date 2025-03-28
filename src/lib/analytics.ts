import { ActivityGroup, globalConfig } from '../lib/constants';

import type { GroupMonsterActivityTaskOptions } from '../lib/types/minions';
import { taskGroupFromActivity } from '../lib/util/taskGroupFromActivity';
import { sql } from './postgres.js';

async function calculateMinionTaskCounts() {
	const minionTaskCounts: Record<ActivityGroup, number> = {
		[ActivityGroup.Clue]: 0,
		[ActivityGroup.Minigame]: 0,
		[ActivityGroup.Monster]: 0,
		[ActivityGroup.Skilling]: 0
	};

	const currentTasks = await prisma.activity.findMany({
		where: {
			completed: false,
			finish_date: {
				gt: new Date()
			}
		}
	});

	for (const task of currentTasks) {
		const group = taskGroupFromActivity(task.type);

		if (task.group_activity) {
			minionTaskCounts[group] += (task.data as unknown as GroupMonsterActivityTaskOptions).users.length;
		} else {
			minionTaskCounts[group] += 1;
		}
	}
	return minionTaskCounts;
}

export async function analyticsTick() {
	const [{ has_bought_count, total_gp, ironman_count, total_sacrificed_value }]: {
		has_bought_count: bigint;
		total_sacrificed_value: bigint;
		ironman_count: bigint;
		total_gp: bigint;
	}[] = await sql`
SELECT 
    COUNT(*) FILTER (WHERE "minion.hasBought" = true) AS has_bought_count,
    SUM("sacrificedValue")::bigint AS total_sacrificed_value,
    COUNT(*) FILTER (WHERE "minion.ironman" = true) AS ironman_count,
    SUM("GP")::bigint AS total_gp
FROM users;
`;

	const taskCounts = await calculateMinionTaskCounts();
	const currentClientSettings = await prisma.clientStorage.upsert({
		where: {
			id: globalConfig.clientID
		},
		select: {
			economyStats_dicingBank: true,
			economyStats_duelTaxBank: true,
			gp_daily: true,
			gp_alch: true,
			gp_dice: true,
			gp_hotcold: true,
			gp_luckypick: true,
			gp_open: true,
			gp_pickpocket: true,
			gp_pvm: true,
			gp_sell: true,
			gp_slots: true,
			gp_tax_balance: true,
			economyStats_dailiesAmount: true
		},
		create: {
			id: globalConfig.clientID
		},
		update: {}
	});
	await prisma.analytic.create({
		data: {
			guildsCount: globalClient.guilds.cache.size,
			membersCount: globalClient.guilds.cache.reduce((acc, curr) => (acc += curr.memberCount || 0), 0),
			timestamp: Math.floor(Date.now() / 1000),
			clueTasksCount: taskCounts.Clue,
			minigameTasksCount: taskCounts.Minigame,
			monsterTasksCount: taskCounts.Monster,
			skillingTasksCount: taskCounts.Skilling,
			ironMinionsCount: Number(ironman_count),
			minionsCount: Number(has_bought_count),
			totalSacrificed: total_sacrificed_value,
			totalGP: total_gp,
			dicingBank: currentClientSettings.economyStats_dicingBank,
			duelTaxBank: currentClientSettings.economyStats_duelTaxBank,
			dailiesAmount: currentClientSettings.economyStats_dailiesAmount,
			gpAlching: currentClientSettings.gp_alch,
			gpPvm: currentClientSettings.gp_pvm,
			gpSellingItems: currentClientSettings.gp_sell,
			gpPickpocket: currentClientSettings.gp_pickpocket,
			gpOpen: currentClientSettings.gp_open,
			gpDice: currentClientSettings.gp_dice,
			gpDaily: currentClientSettings.gp_daily,
			gpLuckypick: currentClientSettings.gp_luckypick,
			gpSlots: currentClientSettings.gp_slots,
			gpHotCold: currentClientSettings.gp_hotcold
		}
	});
}
