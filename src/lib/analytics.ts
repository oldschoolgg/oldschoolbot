import { ActivityGroup } from '../lib/constants';
import { prisma } from '../lib/settings/prisma';
import { GroupMonsterActivityTaskOptions } from '../lib/types/minions';
import { taskGroupFromActivity } from '../lib/util/taskGroupFromActivity';
import { mahojiClientSettingsFetch } from './util/clientSettings';

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
	const [numberOfMinions, totalSacrificed, numberOfIronmen, totalGP] = (
		await Promise.all(
			[
				'SELECT COUNT(*) FROM users WHERE "minion.hasBought" = true;',
				'SELECT SUM ("sacrificedValue") AS count FROM users;',
				'SELECT COUNT(*) FROM users WHERE "minion.ironman" = true;',
				'SELECT SUM ("GP") AS count FROM users;'
			].map(query => prisma.$queryRawUnsafe(query))
		)
	).map((result: any) => parseInt(result[0].count)) as number[];

	const taskCounts = await calculateMinionTaskCounts();
	const currentClientSettings = await mahojiClientSettingsFetch();
	await prisma.analytic.create({
		data: {
			guildsCount: globalClient.guilds.cache.size,
			membersCount: globalClient.guilds.cache.reduce((acc, curr) => (acc += curr.memberCount || 0), 0),
			timestamp: Math.floor(Date.now() / 1000),
			clueTasksCount: taskCounts.Clue,
			minigameTasksCount: taskCounts.Minigame,
			monsterTasksCount: taskCounts.Monster,
			skillingTasksCount: taskCounts.Skilling,
			ironMinionsCount: numberOfIronmen,
			minionsCount: numberOfMinions,
			totalSacrificed,
			totalGP,
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
			gpLuckyPick: currentClientSettings.gp_luckypick,
			gpSlots: currentClientSettings.gp_slots,
			gpHotCold: currentClientSettings.gp_hotcold,
			gpItemContracts: currentClientSettings.gp_ic
		}
	});
}
