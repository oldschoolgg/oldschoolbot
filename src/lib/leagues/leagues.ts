import { activity_type_enum, User } from '@prisma/client';
import { calcWhatPercent, sumArr } from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { getPOH } from '../../mahoji/lib/abstracted_commands/pohCommand';
import { getParsedStashUnits } from '../../mahoji/lib/abstracted_commands/stashUnitsCommand';
import {
	personalAlchingStats,
	personalCollectingStats,
	personalConstructionStats,
	personalFiremakingStats,
	personalMiningStats,
	personalSmeltingStats,
	personalSmithingStats,
	personalSpellCastStats,
	personalWoodcuttingStats
} from '../../mahoji/lib/abstracted_commands/statCommand';
import { BitField } from '../constants';
import { calcCLDetails } from '../data/Collections';
import { getMinigameEntity } from '../settings/minigames';
import { prisma } from '../settings/prisma';
import smithables from '../skilling/skills/smithing/smithables';
import { getSlayerTaskStats } from '../slayer/slayerUtil';
import { getAllUserTames } from '../tames';
import { ItemBank } from '../types';
import { getItem } from '../util/getOSItem';
import { easyTasks } from './easyTasks';
import { eliteTasks } from './eliteTasks';
import { hardTasks } from './hardTasks';
import { betterHerbloreStats, HasFunctionArgs, Task } from './leaguesUtils';
import { masterTasks } from './masterTasks';
import { mediumTasks } from './mediumTasks';
import {
	calcLeaguesRanking,
	calculateAllFletchedItems,
	calculateDartsFletchedFromScratch,
	totalLampedXP
} from './stats';

export const leagueTasks = [
	{ name: 'Easy', tasks: easyTasks, points: 20 },
	{ name: 'Medium', tasks: mediumTasks, points: 45 },
	{ name: 'Hard', tasks: hardTasks, points: 85 },
	{ name: 'Elite', tasks: eliteTasks, points: 150 },
	{ name: 'Master', tasks: masterTasks, points: 250 }
];

export const maxLeaguesPoints = sumArr(leagueTasks.map(group => group.tasks.length * group.points));

export const allLeagueTasks = leagueTasks.map(i => i.tasks).flat(2);

export function generateLeaguesTasksTextFile(finishedTasksIDs: number[], excludeFinished: boolean | undefined) {
	let totalTasks = 0;
	let totalPoints = 0;
	let str = '';
	for (const { name, tasks, points } of leagueTasks) {
		let realTasks = excludeFinished ? tasks.filter(i => !finishedTasksIDs.includes(i.id)) : tasks;
		let ptsThisGroup = realTasks.length * points;
		str += `--------- ${name} (${realTasks.length} tasks - ${ptsThisGroup.toLocaleString()} points) -----------\n`;
		str += realTasks
			.map(i => i.name)
			.sort((a, b) => b.localeCompare(a))
			.join('\n');
		totalTasks += realTasks.length;
		totalPoints += ptsThisGroup;
		str += '\n\n';
	}
	str = `There are a total of ${totalTasks} tasks (${totalPoints.toLocaleString()} Points).\n\n${str}`;
	return { files: [{ attachment: Buffer.from(str), name: 'all-tasks.txt' }] };
}

async function getActivityCounts(user: User) {
	const result: { type: activity_type_enum; count: bigint }[] = await prisma.$queryRawUnsafe(`SELECT type, COUNT(type)
FROM activity
WHERE user_id = ${user.id}
GROUP BY type;`);
	const parsed = result.map(i => ({ type: i.type, count: Number(i.count) }));
	// @ts-ignore trust me
	let rec: Record<activity_type_enum, number> = {};
	for (const a of Object.values(activity_type_enum)) {
		rec[a] = 0;
	}
	for (const a of parsed) {
		rec[a.type] = a.count;
	}
	return rec;
}

export async function personalHerbloreStatsWithoutZahur(user: User) {
	const result: { id: number; qty: number }[] =
		await prisma.$queryRawUnsafe(`SELECT (data->>'mixableID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'Herblore'
AND user_id = '${user.id}'::bigint
AND data->>'mixableID' IS NOT NULL
AND (data->>'zahur')::boolean = false
AND completed = true
GROUP BY data->>'mixableID';`);
	const items = new Bank();
	for (const res of result) {
		const item = getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

function calcSuppliesUsedForSmithing(itemsSmithed: Bank) {
	let input = new Bank();
	for (const [item, qty] of itemsSmithed.items()) {
		const smithable = smithables.find(i => i.id === item.id);
		if (!smithable) continue;
		input.add(new Bank(smithable.inputBars).multiply(qty));
	}
	return input;
}

export async function leaguesCheckUser(userID: string) {
	const mahojiUser = await mUserFetch(userID);
	const roboChimpUser = await mahojiUser.fetchRobochimpUser();
	const [
		conStats,
		poh,
		tames,
		slayerStats,
		activityCounts,
		minigames,
		slayerTasksCompleted,
		alchingStats,
		_herbloreStats,
		miningStats,
		firemakingStats,
		smithingStats,
		spellCastingStats,
		collectingStats,
		woodcuttingStats,
		{ actualCluesBank },
		ranking,
		smeltingStats,
		stashUnits,
		fletchedItems
	] = await Promise.all([
		personalConstructionStats(mahojiUser),
		getPOH(userID),
		getAllUserTames(userID),
		getSlayerTaskStats(userID),
		getActivityCounts(mahojiUser.user),
		getMinigameEntity(userID),
		prisma.slayerTask.count({ where: { user_id: userID } }),
		personalAlchingStats(mahojiUser),
		personalHerbloreStatsWithoutZahur(mahojiUser.user),
		personalMiningStats(mahojiUser),
		personalFiremakingStats(mahojiUser),
		personalSmithingStats(mahojiUser),
		personalSpellCastStats(mahojiUser),
		personalCollectingStats(mahojiUser),
		personalWoodcuttingStats(mahojiUser),
		mahojiUser.calcActualClues(),
		calcLeaguesRanking(roboChimpUser),
		personalSmeltingStats(mahojiUser),
		getParsedStashUnits(userID),
		calculateAllFletchedItems(mahojiUser)
	]);
	const clPercent = calcCLDetails(mahojiUser).percent;
	const herbloreStats = betterHerbloreStats(_herbloreStats);
	const smithingSuppliesUsed = calcSuppliesUsedForSmithing(smithingStats);

	const userStats = await prisma.userStats.upsert({
		where: { user_id: BigInt(userID) },
		create: { user_id: BigInt(userID) },
		update: {}
	});

	const args: HasFunctionArgs = {
		cl: mahojiUser.cl,
		bank: mahojiUser.bank,
		user: mahojiUser,
		mahojiUser: mahojiUser.user,
		skillsLevels: mahojiUser.skillsAsLevels,
		skillsXP: mahojiUser.skillsAsXP,
		poh,
		gear: mahojiUser.gear,
		allItemsOwned: mahojiUser.allItemsOwned,
		monsterScores: userStats.monster_scores as ItemBank,
		creatureScores: userStats.creature_scores as ItemBank,
		opens: new Bank(userStats.openable_scores as ItemBank),
		disassembledItems: new Bank(mahojiUser.user.disassembled_items_bank as ItemBank),
		tames,
		sacrificedBank: new Bank(userStats.sacrificed_bank as ItemBank),
		slayerStats,
		activityCounts,
		minigames,
		lapScores: userStats.laps_scores as ItemBank,
		slayerTasksCompleted,
		clPercent,
		conStats,
		alchingStats,
		herbloreStats,
		miningStats,
		firemakingStats,
		smithingStats,
		spellCastingStats,
		collectingStats,
		woodcuttingStats,
		smithingSuppliesUsed,
		actualClues: actualCluesBank,
		smeltingStats,
		stashUnits,
		totalLampedXP: totalLampedXP(userStats),
		userStats,
		fletchedItems,
		fromScratchDarts: calculateDartsFletchedFromScratch({
			itemsFletched: fletchedItems,
			itemsSmithed: smithingStats
		})
	};

	let resStr = '\n';
	let totalTasks = 0;
	let totalFinished = 0;
	const finishedIDs: number[] = [];

	for (const { name, tasks } of leagueTasks) {
		let finished = 0;
		totalTasks += tasks.length;
		for (const task of tasks) {
			const has = await task.has(args);
			if (has) {
				finishedIDs.push(task.id);
				finished++;
			}
		}
		totalFinished += finished;
		resStr += `**${name}:** Finished ${finished}/${tasks.length}\n`;
	}

	return {
		content: `**Your Leagues Progress**

**Total Tasks Completed:** ${totalFinished} (${calcWhatPercent(totalFinished, totalTasks).toFixed(1)}%) (Rank ${
			ranking.tasksRanking
		})
**Total Points:** ${roboChimpUser.leagues_points_total.toLocaleString()} (Rank ${ranking.pointsRanking})
**Points Balance:** ${roboChimpUser.leagues_points_balance_osb.toLocaleString()} OSB / ${roboChimpUser.leagues_points_balance_bso.toLocaleString()} BSO
${resStr}`,
		finished: [...finishedIDs, ...roboChimpUser.leagues_completed_tasks_ids]
	};
}

const unlockables: {
	name: string;
	points: number;
	onUnlock: (user: MUser) => Promise<string>;
	hasUnlockedAlready: (user: MUser) => boolean;
}[] = [
	{
		name: 'Brain lee pet',
		points: 40_000,
		onUnlock: async (user: MUser) => {
			await user.addItemsToBank({ items: new Bank().add('Brain lee'), collectionLog: true });
			return 'You received a very brainly Brain lee!';
		},
		hasUnlockedAlready: (user: MUser) => {
			return user.cl.has('Brain lee');
		}
	},
	{
		name: '+1m max trip length',
		points: 50_000,
		onUnlock: async (user: MUser) => {
			await user.update({
				bitfield: {
					push: BitField.HasLeaguesOneMinuteLengthBoost
				}
			});
			return "You've unlocked a global +1minute trip length boost!";
		},
		hasUnlockedAlready: (user: MUser) => {
			return user.bitfield.includes(BitField.HasLeaguesOneMinuteLengthBoost);
		}
	}
];

export async function leaguesClaimCommand(userID: string, finishedTaskIDs: number[]) {
	const mahojiUser = await mUserFetch(userID);
	const roboChimpUser = await mahojiUser.fetchRobochimpUser();

	const newlyFinishedTasks = finishedTaskIDs.filter(i => !roboChimpUser.leagues_completed_tasks_ids.includes(i));

	const unlockMessages: string[] = [];
	for (const unl of unlockables) {
		if (roboChimpUser.leagues_points_total >= unl.points && !unl.hasUnlockedAlready(mahojiUser)) {
			const result = await unl.onUnlock(mahojiUser);
			unlockMessages.push(result);
		}
	}

	if (unlockMessages.length > 0) {
		return `**You unlocked...** ${unlockMessages.join(', ')}`;
	}

	if (newlyFinishedTasks.length === 0) return "You don't have any unclaimed points.";

	const fullNewlyFinishedTasks: Task[] = [];
	let pointsToAward = 0;
	for (const task of newlyFinishedTasks) {
		const group = leagueTasks.find(i => i.tasks.some(t => t.id === task))!;
		pointsToAward += group.points;
		fullNewlyFinishedTasks.push(group.tasks.find(i => i.id === task)!);
	}

	const newUser = await roboChimpClient.user.update({
		where: {
			id: BigInt(userID)
		},
		data: {
			leagues_completed_tasks_ids: {
				push: newlyFinishedTasks
			},
			leagues_points_balance_osb: {
				increment: pointsToAward
			},
			leagues_points_balance_bso: {
				increment: pointsToAward
			},
			leagues_points_total: {
				increment: pointsToAward
			}
		}
	});

	const newTotal = newUser.leagues_points_total;

	let response: Awaited<CommandResponse> = {
		content: `You claimed ${newlyFinishedTasks.length} tasks, and received ${pointsToAward} points. You now have a balance of ${newUser.leagues_points_balance_osb} OSB points and ${newUser.leagues_points_balance_bso} BSO points, and ${newTotal} total points. You have completed a total of ${newUser.leagues_completed_tasks_ids.length} tasks.`
	};

	if (newlyFinishedTasks.length > 10) {
		response.content += '\nAttached is a text file showing all the tasks you just claimed.';
		response.files = [
			{ attachment: Buffer.from(fullNewlyFinishedTasks.map(i => i.name).join('\n')), name: 'new-tasks.txt' }
		];
	} else {
		response.content += `\n**Finished Tasks:** ${fullNewlyFinishedTasks.map(i => i.name).join(', ')}.`;
	}

	return response;
}
