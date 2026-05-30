import { easyTasks } from '@/lib/bso/leagues/easyTasks.js';
import { eliteTasks } from '@/lib/bso/leagues/eliteTasks.js';
import { hardTasks } from '@/lib/bso/leagues/hardTasks.js';
import { betterHerbloreStats, type HasFunctionArgs, type Task } from '@/lib/bso/leagues/leaguesUtils.js';
import { masterTasks } from '@/lib/bso/leagues/masterTasks.js';
import { mediumTasks } from '@/lib/bso/leagues/mediumTasks.js';
import {
	calcLeaguesRanking,
	calculateAllFletchedItems,
	calculateDartsFletchedFromScratch,
	totalLampedXP
} from '@/lib/bso/leagues/stats.js';

import { calcWhatPercent, sumArr } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, Items } from 'oldschooljs';

import { Prisma } from '@/prisma/clients/robochimp/client.js';
import { activity_type_enum, type User } from '@/prisma/main.js';
import { BitField } from '@/lib/constants.js';
import { calcCLDetails } from '@/lib/data/Collections.js';
import smithables from '@/lib/skilling/skills/smithing/smithables/index.js';
import { getSlayerTaskStats } from '@/lib/slayer/slayerUtil.js';
import { getPOH } from '@/mahoji/lib/abstracted_commands/pohCommand.js';
import { getParsedStashUnits } from '@/mahoji/lib/abstracted_commands/stashUnitsCommand.js';
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
} from '@/mahoji/lib/abstracted_commands/statCommand.js';

export const leagueTasks = [
	{ name: 'Easy', tasks: easyTasks, points: 20 },
	{ name: 'Medium', tasks: mediumTasks, points: 45 },
	{ name: 'Hard', tasks: hardTasks, points: 85 },
	{ name: 'Elite', tasks: eliteTasks, points: 150 },
	{ name: 'Master', tasks: masterTasks, points: 250 }
];

export const maxLeaguesPoints = sumArr(leagueTasks.map(group => group.tasks.length * group.points));

export const allLeagueTasks = leagueTasks.map(i => i.tasks).flat(2);

const leaguesTaskMetaByID = new Map(
	leagueTasks.flatMap(group => group.tasks.map(task => [task.id, { task, points: group.points }] as const))
);

type LeaguesTaskMeta = typeof leaguesTaskMetaByID extends Map<number, infer T> ? T : never;

function getLeaguesTaskMeta(taskID: number): LeaguesTaskMeta | undefined {
	return leaguesTaskMetaByID.get(taskID);
}

export type LeaguesDuplicateTaskAnalysis = {
	taskID: number;
	taskName: string;
	count: number;
	extraCount: number;
	pointsEach: number;
	pointsToRemove: number;
	knownTask: boolean;
};

export type LeaguesCompletedTaskAnalysis = {
	cleanedTaskIDs: number[];
	duplicateEntriesRemoved: number;
	pointsToRemove: number;
	duplicatedTasks: LeaguesDuplicateTaskAnalysis[];
	unknownDuplicateTaskIDs: number[];
	userId?: string;
};

export function analyzeLeaguesCompletedTaskIDs(taskIDs: number[]): LeaguesCompletedTaskAnalysis {
	const counts = new Map<number, number>();
	const seen = new Set<number>();
	const cleanedTaskIDs: number[] = [];

	for (const taskID of taskIDs) {
		counts.set(taskID, (counts.get(taskID) ?? 0) + 1);
		if (!seen.has(taskID)) {
			seen.add(taskID);
			cleanedTaskIDs.push(taskID);
		}
	}

	let duplicateEntriesRemoved = 0;
	let pointsToRemove = 0;
	const duplicatedTasks: LeaguesDuplicateTaskAnalysis[] = [];

	for (const [taskID, count] of counts) {
		if (count < 2) continue;
		const extraCount = count - 1;
		const meta = getLeaguesTaskMeta(taskID);
		const pointsEach = meta?.points ?? 0;
		const duplicatePoints = extraCount * pointsEach;
		duplicateEntriesRemoved += extraCount;
		pointsToRemove += duplicatePoints;
		duplicatedTasks.push({
			taskID,
			taskName: meta?.task.name ?? `Unknown task ${taskID}`,
			count,
			extraCount,
			pointsEach,
			pointsToRemove: duplicatePoints,
			knownTask: Boolean(meta)
		});
	}

	return {
		cleanedTaskIDs,
		duplicateEntriesRemoved,
		pointsToRemove,
		duplicatedTasks,
		unknownDuplicateTaskIDs: duplicatedTasks.filter(task => !task.knownTask).map(task => task.taskID)
	};
}

type LeaguesDuplicateClaimPreview = {
	affectedUsers: number;
	duplicateEntriesRemoved: number;
	pointsToRemove: number;
	unknownDuplicateTaskIDs: number[];
};

type LeaguesPointsSnapshot = {
	osb: number;
	bso: number;
	total: number;
};

export type LeaguesTaskAuditUserResult = {
	userID: string;
	beforeTaskIDs: number[];
	afterTaskIDs: number[];
	removedTaskIDs: number[];
	removedUnknownTaskIDs: number[];
	beforeTaskCount: number;
	afterTaskCount: number;
	beforePoints: LeaguesPointsSnapshot;
	afterPoints: LeaguesPointsSnapshot;
	expectedTotalPoints: number;
	pointDelta: number;
	changed: boolean;
};

export type LeaguesDuplicateClaimCleanupUserResult = {
	userID: string;
	beforePoints: LeaguesPointsSnapshot;
	duplicateEntriesRemoved: number;
	pointsToRemove: number;
	duplicateTaskIDsToRemove: number[];
	duplicatedTasks: LeaguesDuplicateTaskAnalysis[];
	leagues_points_balance_osb: number;
	leagues_points_balance_bso: number;
	leagues_points_total: number;
};

export type LeaguesDuplicateClaimCleanupResult = LeaguesDuplicateClaimPreview & {
	users: LeaguesDuplicateClaimCleanupUserResult[];
	report: string;
};

type RobochimpLeaguesRow = {
	id: bigint;
	leagues_completed_tasks_ids: number[];
};

type RobochimpLeaguesPointsRow = RobochimpLeaguesRow & {
	leagues_points_balance_osb: number;
	leagues_points_balance_bso: number;
	leagues_points_total: number;
};

function splitKnownAndUnknownLeaguesTaskIDs(taskIDs: number[]) {
	const knownTaskIDs: number[] = [];
	const unknownTaskIDs: number[] = [];
	for (const taskID of taskIDs) {
		if (getLeaguesTaskMeta(taskID)) knownTaskIDs.push(taskID);
		else unknownTaskIDs.push(taskID);
	}
	return { knownTaskIDs, unknownTaskIDs };
}

function uniqueTaskIDsPreservingOrder(taskIDs: number[]) {
	const seen = new Set<number>();
	const uniqueTaskIDs: number[] = [];
	for (const taskID of taskIDs) {
		if (seen.has(taskID)) continue;
		seen.add(taskID);
		uniqueTaskIDs.push(taskID);
	}
	return uniqueTaskIDs;
}

function calculateLeaguesPointsForTaskIDs(taskIDs: number[]) {
	let points = 0;
	for (const taskID of taskIDs) {
		points += getLeaguesTaskMeta(taskID)?.points ?? 0;
	}
	return points;
}

function taskIDArraysMatch(first: number[], second: number[]) {
	return first.length === second.length && first.every((taskID, index) => taskID === second[index]);
}

function subtractTaskIDArrays(source: number[], toSubtract: number[]) {
	const counts = new Map<number, number>();
	for (const taskID of toSubtract) {
		counts.set(taskID, (counts.get(taskID) ?? 0) + 1);
	}

	const result: number[] = [];
	for (const taskID of source) {
		const remaining = counts.get(taskID) ?? 0;
		if (remaining > 0) {
			counts.set(taskID, remaining - 1);
			continue;
		}
		result.push(taskID);
	}
	return result;
}

function buildLeaguesTaskAuditUserResult({
	userID,
	beforeTaskIDs,
	afterTaskIDs,
	beforePoints
}: {
	userID: string;
	beforeTaskIDs: number[];
	afterTaskIDs: number[];
	beforePoints: LeaguesPointsSnapshot;
}): LeaguesTaskAuditUserResult {
	const expectedTotalPoints = calculateLeaguesPointsForTaskIDs(afterTaskIDs);
	const pointDelta = expectedTotalPoints - beforePoints.total;
	const removedTaskIDs = subtractTaskIDArrays(beforeTaskIDs, afterTaskIDs);
	const afterPoints = {
		osb: beforePoints.osb + pointDelta,
		bso: beforePoints.bso + pointDelta,
		total: expectedTotalPoints
	};

	return {
		userID,
		beforeTaskIDs,
		afterTaskIDs,
		removedTaskIDs,
		removedUnknownTaskIDs: removedTaskIDs.filter(taskID => !getLeaguesTaskMeta(taskID)),
		beforeTaskCount: beforeTaskIDs.length,
		afterTaskCount: afterTaskIDs.length,
		beforePoints,
		afterPoints,
		expectedTotalPoints,
		pointDelta,
		changed:
			pointDelta !== 0 ||
			!taskIDArraysMatch(beforeTaskIDs, afterTaskIDs) ||
			beforePoints.osb !== afterPoints.osb ||
			beforePoints.bso !== afterPoints.bso
	};
}

async function getRobochimpUsersWithLeaguesPoints(): Promise<RobochimpLeaguesPointsRow[]> {
	return roboChimpClient.$queryRaw<RobochimpLeaguesPointsRow[]>`
SELECT id, leagues_completed_tasks_ids, leagues_points_balance_osb, leagues_points_balance_bso, leagues_points_total
FROM public.user
WHERE COALESCE(cardinality(leagues_completed_tasks_ids), 0) > 0
	OR COALESCE(leagues_points_total, 0) > 0;`;
}

async function getRobochimpLeaguesPointsRow(userID: bigint): Promise<RobochimpLeaguesPointsRow> {
	return roboChimpClient.user.upsert({
		where: { id: userID },
		create: { id: userID },
		update: {},
		select: {
			id: true,
			leagues_completed_tasks_ids: true,
			leagues_points_balance_osb: true,
			leagues_points_balance_bso: true,
			leagues_points_total: true
		}
	});
}

function auditStoredLeaguesTasksForRow(row: RobochimpLeaguesPointsRow): LeaguesTaskAuditUserResult {
	const { knownTaskIDs } = splitKnownAndUnknownLeaguesTaskIDs(row.leagues_completed_tasks_ids);
	return buildLeaguesTaskAuditUserResult({
		userID: row.id.toString(),
		beforeTaskIDs: row.leagues_completed_tasks_ids,
		afterTaskIDs: knownTaskIDs,
		beforePoints: {
			osb: row.leagues_points_balance_osb,
			bso: row.leagues_points_balance_bso,
			total: row.leagues_points_total
		}
	});
}

async function applyLeaguesTaskAuditForUser(
	userID: bigint,
	getAuditResult: (row: RobochimpLeaguesPointsRow) => Promise<LeaguesTaskAuditUserResult> | LeaguesTaskAuditUserResult
): Promise<LeaguesTaskAuditUserResult | null> {
	const MAX_RETRIES = 5;
	let retries = 0;

	while (retries < MAX_RETRIES) {
		try {
			const result = await roboChimpClient.$transaction(
				async tx => {
					const row = await tx.user.findUniqueOrThrow({
						where: { id: userID },
						select: {
							id: true,
							leagues_completed_tasks_ids: true,
							leagues_points_balance_osb: true,
							leagues_points_balance_bso: true,
							leagues_points_total: true
						}
					});

					const auditResult = await getAuditResult(row);
					if (!auditResult.changed) return null;

					const updatedUser = await tx.user.update({
						where: { id: userID },
						data: {
							leagues_completed_tasks_ids: {
								set: auditResult.afterTaskIDs
							},
							leagues_points_balance_osb: auditResult.afterPoints.osb,
							leagues_points_balance_bso: auditResult.afterPoints.bso,
							leagues_points_total: auditResult.afterPoints.total
						}
					});

					return { auditResult, updatedUser };
				},
				{
					isolationLevel: Prisma.TransactionIsolationLevel.Serializable
				}
			);

			if (!result) return null;
			await Cache.setRoboChimpUser(result.auditResult.userID, result.updatedUser);
			return result.auditResult;
		} catch (error) {
			if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2034') {
				retries++;
				if (retries < MAX_RETRIES) continue;
			}
			throw error;
		}
	}

	return null;
}

export async function previewValidateStoredLeaguesTasks(): Promise<LeaguesTaskAuditUserResult[]> {
	const users = await getRobochimpUsersWithLeaguesPoints();
	return users.map(auditStoredLeaguesTasksForRow).filter(user => user.changed);
}

export async function validateStoredLeaguesTasks(): Promise<LeaguesTaskAuditUserResult[]> {
	const users = await getRobochimpUsersWithLeaguesPoints();
	const changedUsers: LeaguesTaskAuditUserResult[] = [];

	for (const user of users) {
		const changed = await applyLeaguesTaskAuditForUser(user.id, row => auditStoredLeaguesTasksForRow(row));
		if (changed) changedUsers.push(changed);
	}

	return changedUsers;
}

export async function getRobochimpUsersWithDuplicateLeaguesTasks(): Promise<RobochimpLeaguesRow[]> {
	return roboChimpClient.$queryRaw<RobochimpLeaguesRow[]>`
SELECT id, leagues_completed_tasks_ids
FROM public.user
WHERE COALESCE(cardinality(leagues_completed_tasks_ids), 0) > COALESCE((
	SELECT COUNT(DISTINCT task_id)
	FROM unnest(leagues_completed_tasks_ids) AS duplicate_tasks(task_id)
), 0);`;
}

export function summarizeDuplicateClaimCleanup(
	summaries: LeaguesCompletedTaskAnalysis[]
): LeaguesDuplicateClaimPreview {
	return {
		affectedUsers: summaries.length,
		duplicateEntriesRemoved: sumArr(summaries.map(summary => summary.duplicateEntriesRemoved)),
		pointsToRemove: sumArr(summaries.map(summary => summary.pointsToRemove)),
		unknownDuplicateTaskIDs: [...new Set(summaries.flatMap(summary => summary.unknownDuplicateTaskIDs))].sort(
			(a, b) => a - b
		)
	};
}

async function cleanupDuplicateLeaguesClaimsForUser(
	userID: bigint
): Promise<LeaguesDuplicateClaimCleanupUserResult | null> {
	const MAX_RETRIES = 5;
	let retries = 0;

	while (retries < MAX_RETRIES) {
		try {
			const result = await roboChimpClient.$transaction(
				async tx => {
					const roboChimpUser = await tx.user.findUniqueOrThrow({
						where: { id: userID }
					});
					const analysis = analyzeLeaguesCompletedTaskIDs(roboChimpUser.leagues_completed_tasks_ids);
					if (analysis.duplicateEntriesRemoved === 0) return null;

					const updatedUser = await tx.user.update({
						where: { id: userID },
						data: {
							leagues_completed_tasks_ids: {
								set: analysis.cleanedTaskIDs
							},
							leagues_points_balance_osb: {
								decrement: analysis.pointsToRemove
							},
							leagues_points_balance_bso: {
								decrement: analysis.pointsToRemove
							},
							leagues_points_total: {
								decrement: analysis.pointsToRemove
							}
						}
					});

					return {
						userID: userID.toString(),
						beforePoints: {
							osb: roboChimpUser.leagues_points_balance_osb,
							bso: roboChimpUser.leagues_points_balance_bso,
							total: roboChimpUser.leagues_points_total
						},
						duplicateEntriesRemoved: analysis.duplicateEntriesRemoved,
						pointsToRemove: analysis.pointsToRemove,
						duplicateTaskIDsToRemove: analysis.duplicatedTasks.flatMap(task =>
							Array.from({ length: task.extraCount }, () => task.taskID)
						),
						duplicatedTasks: analysis.duplicatedTasks,
						leagues_points_balance_osb: updatedUser.leagues_points_balance_osb,
						leagues_points_balance_bso: updatedUser.leagues_points_balance_bso,
						leagues_points_total: updatedUser.leagues_points_total,
						updatedUser
					};
				},
				{
					isolationLevel: Prisma.TransactionIsolationLevel.Serializable
				}
			);

			if (!result) return null;
			await Cache.setRoboChimpUser(result.userID, result.updatedUser);
			return {
				userID: result.userID,
				beforePoints: result.beforePoints,
				duplicateEntriesRemoved: result.duplicateEntriesRemoved,
				pointsToRemove: result.pointsToRemove,
				duplicateTaskIDsToRemove: result.duplicateTaskIDsToRemove,
				duplicatedTasks: result.duplicatedTasks,
				leagues_points_balance_osb: result.leagues_points_balance_osb,
				leagues_points_balance_bso: result.leagues_points_balance_bso,
				leagues_points_total: result.leagues_points_total
			};
		} catch (error) {
			if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2034') {
				retries++;
				if (retries < MAX_RETRIES) continue;
			}
			throw error;
		}
	}

	return null;
}

function buildDuplicateClaimCleanupReport(users: LeaguesDuplicateClaimCleanupUserResult[]): string {
	if (users.length === 0) return 'No duplicate leagues task claims found.';

	return users
		.map(user => {
			const taskSummary = user.duplicatedTasks
				.map(task => {
					if (!task.knownTask) {
						return `${task.taskName} x${task.extraCount} extra`;
					}
					return `${task.taskName} x${task.extraCount} extra (${task.pointsToRemove.toLocaleString()} pts)`;
				})
				.join(', ');
			return [
				`User ${user.userID}`,
				`Removed ${user.duplicateEntriesRemoved} duplicate entries`,
				`Deducted ${user.pointsToRemove.toLocaleString()} from OSB/BSO/Total`,
				`Tasks: ${taskSummary}`
			].join(' | ');
		})
		.join('\n');
}

export async function cleanupDuplicateLeaguesClaims(): Promise<LeaguesDuplicateClaimCleanupResult> {
	const usersWithDuplicates = await getRobochimpUsersWithDuplicateLeaguesTasks();
	const cleanedUsers: LeaguesDuplicateClaimCleanupUserResult[] = [];

	for (const user of usersWithDuplicates) {
		const cleaned = await cleanupDuplicateLeaguesClaimsForUser(user.id);
		if (cleaned) cleanedUsers.push(cleaned);
	}

	const totals = {
		affectedUsers: cleanedUsers.length,
		duplicateEntriesRemoved: sumArr(cleanedUsers.map(user => user.duplicateEntriesRemoved)),
		pointsToRemove: sumArr(cleanedUsers.map(user => user.pointsToRemove)),
		unknownDuplicateTaskIDs: [
			...new Set(
				cleanedUsers.flatMap(user =>
					user.duplicatedTasks.filter(task => !task.knownTask).map(task => task.taskID)
				)
			)
		].sort((a, b) => a - b)
	};

	return {
		...totals,
		users: cleanedUsers,
		report: buildDuplicateClaimCleanupReport(cleanedUsers)
	};
}

export function generateLeaguesTasksTextFile(finishedTasksIDs: number[], excludeFinished: boolean | undefined) {
	let totalTasks = 0;
	let totalPoints = 0;
	let str = '';
	for (const { name, tasks, points } of leagueTasks) {
		const realTasks = excludeFinished ? tasks.filter(i => !finishedTasksIDs.includes(i.id)) : tasks;
		const ptsThisGroup = realTasks.length * points;
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
	return { files: [{ buffer: Buffer.from(str), name: 'all-tasks.txt' }] };
}

async function getActivityCounts(user: User) {
	const result: { type: activity_type_enum; count: number }[] =
		await prisma.$queryRawUnsafe(`SELECT type, COUNT(type)::int
FROM activity
WHERE user_id = ${user.id}
GROUP BY type;`);
	const parsed = result.map(i => ({ type: i.type, count: Number(i.count) }));
	// @ts-expect-error trust me
	const rec: Record<activity_type_enum, number> = {};
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
		await prisma.$queryRawUnsafe(`SELECT (data->>'mixableID')::int AS id, SUM((data->>'quantity')::int)::int AS qty
FROM activity
WHERE type = 'Herblore'
AND user_id = '${user.id}'::bigint
AND data->>'mixableID' IS NOT NULL
AND (data->>'zahur')::boolean = false
AND completed = true
GROUP BY data->>'mixableID';`);
	const items = new Bank();
	for (const res of result) {
		const item = Items.getItem(res.id);
		if (!item) continue;
		items.add(item.id, res.qty);
	}
	return items;
}

function calcSuppliesUsedForSmithing(itemsSmithed: Bank) {
	const input = new Bank();
	for (const [item, qty] of itemsSmithed.items()) {
		const smithable = smithables.find(i => i.id === item.id);
		if (!smithable) continue;
		input.add(new Bank(smithable.inputBars).multiply(qty));
	}
	return input;
}

async function buildLeaguesTaskCheckContext(userID: string, includeRanking = false) {
	const user = await mUserFetch(userID);
	const roboChimpUser = await user.fetchRobochimpUser();
	const rankingPromise = includeRanking ? calcLeaguesRanking(roboChimpUser) : Promise.resolve(null);
	const [
		conStats,
		poh,
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
		personalConstructionStats(user),
		getPOH(userID),
		getSlayerTaskStats(userID),
		getActivityCounts(user.user),
		user.fetchMinigames(),
		prisma.slayerTask.count({ where: { user_id: userID } }),
		personalAlchingStats(user),
		personalHerbloreStatsWithoutZahur(user.user),
		personalMiningStats(user),
		personalFiremakingStats(user),
		personalSmithingStats(user),
		personalSpellCastStats(user),
		personalCollectingStats(user),
		personalWoodcuttingStats(user),
		user.calcActualClues(),
		rankingPromise,
		personalSmeltingStats(user),
		getParsedStashUnits(userID),
		calculateAllFletchedItems(user)
	]);
	const clPercent = calcCLDetails(user).percent;
	const herbloreStats = betterHerbloreStats(_herbloreStats);
	const smithingSuppliesUsed = calcSuppliesUsedForSmithing(smithingStats);
	const tames = await user.fetchTames();

	const userStats = await prisma.userStats.upsert({
		where: { user_id: BigInt(userID) },
		create: { user_id: BigInt(userID) },
		update: {}
	});

	const args: HasFunctionArgs = {
		cl: user.cl,
		bank: user.bank,
		user: user,
		mahojiUser: user.user,
		skillsLevels: user.skillsAsLevels,
		skillsXP: user.skillsAsXP,
		poh,
		gear: user.gear,
		allItemsOwned: user.allItemsOwned,
		monsterScores: userStats.monster_scores as ItemBank,
		creatureScores: userStats.creature_scores as ItemBank,
		opens: new Bank(userStats.openable_scores as ItemBank),
		disassembledItems: new Bank(user.user.disassembled_items_bank as ItemBank),
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

	return { user, roboChimpUser, args, ranking };
}

export async function getCurrentlyCompletedLeaguesTaskIDs(userID: string) {
	const { args } = await buildLeaguesTaskCheckContext(userID);
	const finishedIDs: number[] = [];

	for (const { tasks } of leagueTasks) {
		for (const task of tasks) {
			const has = await task.has(args);
			if (has) finishedIDs.push(task.id);
		}
	}

	return finishedIDs;
}

async function verifyStoredLeaguesTaskIDs(userID: string, storedTaskIDs: number[]) {
	const { args } = await buildLeaguesTaskCheckContext(userID);
	const verifiedTaskIDs: number[] = [];

	for (const taskID of uniqueTaskIDsPreservingOrder(storedTaskIDs)) {
		const meta = getLeaguesTaskMeta(taskID);
		if (!meta) continue;
		if (await meta.task.has(args)) {
			verifiedTaskIDs.push(taskID);
		}
	}

	return verifiedTaskIDs;
}

export async function previewVerifyLeaguesTasksForUser(userID: string): Promise<LeaguesTaskAuditUserResult> {
	const row = await getRobochimpLeaguesPointsRow(BigInt(userID));
	const verifiedTaskIDs = await verifyStoredLeaguesTaskIDs(userID, row.leagues_completed_tasks_ids);

	return buildLeaguesTaskAuditUserResult({
		userID,
		beforeTaskIDs: row.leagues_completed_tasks_ids,
		afterTaskIDs: verifiedTaskIDs,
		beforePoints: {
			osb: row.leagues_points_balance_osb,
			bso: row.leagues_points_balance_bso,
			total: row.leagues_points_total
		}
	});
}

export async function verifyLeaguesTasksForUser(userID: string): Promise<LeaguesTaskAuditUserResult | null> {
	return applyLeaguesTaskAuditForUser(BigInt(userID), async row => {
		const verifiedTaskIDs = await verifyStoredLeaguesTaskIDs(userID, row.leagues_completed_tasks_ids);
		return buildLeaguesTaskAuditUserResult({
			userID,
			beforeTaskIDs: row.leagues_completed_tasks_ids,
			afterTaskIDs: verifiedTaskIDs,
			beforePoints: {
				osb: row.leagues_points_balance_osb,
				bso: row.leagues_points_balance_bso,
				total: row.leagues_points_total
			}
		});
	});
}

export async function leaguesCheckUser(userID: string) {
	const { roboChimpUser, args, ranking } = await buildLeaguesTaskCheckContext(userID, true);
	if (!ranking) throw new Error(`Missing leagues ranking for user ${userID}.`);

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

export async function leaguesClaimCommand(user: MUser, finishedTaskIDs: number[]) {
	const roboChimpUser = await user.fetchRobochimpUser();
	const uniqueFinishedTaskIDs = analyzeLeaguesCompletedTaskIDs(finishedTaskIDs).cleanedTaskIDs;

	const unlockMessages: string[] = [];
	for (const unl of unlockables) {
		if (roboChimpUser.leagues_points_total >= unl.points && !unl.hasUnlockedAlready(user)) {
			const result = await unl.onUnlock(user);
			unlockMessages.push(result);
		}
	}

	if (unlockMessages.length > 0) {
		return `**You unlocked...** ${unlockMessages.join(', ')}`;
	}

	const MAX_RETRIES = 5;
	let retries = 0;
	let newUser: Awaited<ReturnType<typeof roboChimpClient.user.update>> | null = null;
	let newlyFinishedTasks: number[] = [];
	let fullNewlyFinishedTasks: Task[] = [];
	let pointsToAward = 0;

	while (retries < MAX_RETRIES) {
		try {
			const result = await roboChimpClient.$transaction(
				async tx => {
					const freshRoboChimpUser = await tx.user.findUniqueOrThrow({
						where: { id: BigInt(user.id) }
					});
					const currentCompletedTaskIDs = freshRoboChimpUser.leagues_completed_tasks_ids;
					const currentCompletedTaskSet = new Set(currentCompletedTaskIDs);
					const tasksToClaim = uniqueFinishedTaskIDs.filter(taskID => !currentCompletedTaskSet.has(taskID));
					if (tasksToClaim.length === 0) {
						return {
							newUser: freshRoboChimpUser,
							newlyFinishedTasks: [] as number[],
							fullNewlyFinishedTasks: [] as Task[],
							pointsToAward: 0
						};
					}

					const fullTasks: Task[] = [];
					let points = 0;
					for (const taskID of tasksToClaim) {
						const meta = getLeaguesTaskMeta(taskID);
						if (!meta) {
							throw new Error(`Unknown leagues task ID ${taskID} while claiming leagues points.`);
						}
						points += meta.points;
						fullTasks.push(meta.task);
					}

					const updatedUser = await tx.user.update({
						where: { id: BigInt(user.id) },
						data: {
							leagues_completed_tasks_ids: {
								set: [...currentCompletedTaskIDs, ...tasksToClaim]
							},
							leagues_points_balance_osb: {
								increment: points
							},
							leagues_points_balance_bso: {
								increment: points
							},
							leagues_points_total: {
								increment: points
							}
						}
					});

					return {
						newUser: updatedUser,
						newlyFinishedTasks: tasksToClaim,
						fullNewlyFinishedTasks: fullTasks,
						pointsToAward: points
					};
				},
				{
					isolationLevel: Prisma.TransactionIsolationLevel.Serializable
				}
			);

			newUser = result.newUser;
			newlyFinishedTasks = result.newlyFinishedTasks;
			fullNewlyFinishedTasks = result.fullNewlyFinishedTasks;
			pointsToAward = result.pointsToAward;
			break;
		} catch (error) {
			if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2034') {
				retries++;
				if (retries < MAX_RETRIES) continue;
			}
			throw error;
		}
	}

	if (newlyFinishedTasks.length === 0) return "You don't have any unclaimed points.";
	if (!newUser) throw new Error(`Failed to update leagues points for user ${user.id}.`);
	await Cache.setRoboChimpUser(user.id, newUser);

	const newTotal = newUser.leagues_points_total;

	const response: Awaited<CommandResponse> = {
		content: `You claimed ${newlyFinishedTasks.length} tasks, and received ${pointsToAward} points. You now have a balance of ${newUser.leagues_points_balance_osb} OSB points and ${newUser.leagues_points_balance_bso} BSO points, and ${newTotal} total points. You have completed a total of ${newUser.leagues_completed_tasks_ids.length} tasks.`
	};

	if (newlyFinishedTasks.length > 10) {
		response.content += '\nAttached is a text file showing all the tasks you just claimed.';
		response.files = [
			{ buffer: Buffer.from(fullNewlyFinishedTasks.map(i => i.name).join('\n')), name: 'new-tasks.txt' }
		];
	} else {
		response.content += `\n**Finished Tasks:** ${fullNewlyFinishedTasks.map(i => i.name).join(', ')}.`;
	}

	return response;
}
