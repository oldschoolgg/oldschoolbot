import { ActivityGroup, globalConfig } from '../lib/constants';

import type { GroupMonsterActivityTaskOptions } from '../lib/types/minions';
import { taskGroupFromActivity } from '../lib/util/taskGroupFromActivity';
import { getItem } from './util/getOSItem';

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
				'SELECT COUNT(*)::int FROM users WHERE "minion.hasBought" = true;',
				'SELECT SUM("sacrificedValue") AS count FROM users;',
				'SELECT COUNT(*)::int FROM users WHERE "minion.ironman" = true;',
				'SELECT SUM("GP") AS count FROM users;'
			].map(query => prisma.$queryRawUnsafe(query))
		)
	).map((result: any) => Number.parseInt(result[0].count)) as number[];

	const artifact = getItem('Magical artifact')!;
	const statuette = getItem('Demon statuette')!;

	const [totalGeGp, totalArtifactGp, totalDemonStatuetteGp] = (
		await Promise.all(
			[
				'SELECT quantity AS val FROM ge_bank WHERE item_id = 995',
				`SELECT COALESCE(SUM((bank->>'${artifact.id}')::bigint) * ${artifact.highalch}, 0) as val FROM users WHERE bank->>'${artifact.id}' IS NOT NULL`,
				`SELECT COALESCE(SUM((bank->>'${statuette.id}')::bigint) * ${statuette.highalch}, 0) as val FROM users WHERE bank->>'${artifact.id}' IS NOT NULL`
			].map(q => prisma.$queryRawUnsafe<{ val: bigint }[]>(q))
		)
	).map((v: { val: bigint }[]) => BigInt(v[0]?.val ?? 0));

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
			economyStats_dailiesAmount: true,
			gp_ic: true
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
			ironMinionsCount: numberOfIronmen,
			minionsCount: numberOfMinions,
			totalSacrificed,
			totalGP,
			totalGeGp,
			totalBigAlchGp: totalDemonStatuetteGp + totalArtifactGp,
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
