import { activity_type_enum, Minigame, PlayerOwnedHouse, Tame, User } from '@prisma/client';
import { User as RoboChimpUser } from '@prisma/robochimp';
import { calcWhatPercent } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { getPOH } from '../../mahoji/lib/abstracted_commands/pohCommand';
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
import { getSkillsOfMahojiUser, getUserGear, mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { ClueTiers } from '../clues/clueTiers';
import { getParsedStashUnits, ParsedUnit } from '../clues/stashUnits';
import { calcCLDetails } from '../data/Collections';
import { UserFullGearSetup } from '../gear';
import { CustomMonster } from '../minions/data/killableMonsters/custom/customMonsters';
import { roboChimpUserFetch } from '../roboChimp';
import { getMinigameEntity } from '../settings/minigames';
import { prisma } from '../settings/prisma';
import Grimy from '../skilling/skills/herblore/mixables/grimy';
import Potions from '../skilling/skills/herblore/mixables/potions';
import unfinishedPotions from '../skilling/skills/herblore/mixables/unfinishedPotions';
import creatures from '../skilling/skills/hunter/creatures';
import smithables from '../skilling/skills/smithing/smithables';
import { getSlayerTaskStats } from '../slayer/slayerUtil';
import { getAllUserTames } from '../tames';
import { ItemBank, Skills } from '../types';
import { stringMatches } from '../util';
import { getItem } from '../util/getOSItem';
import { easyTasks } from './easyTasks';
import { eliteTasks } from './eliteTasks';
import { hardTasks } from './hardTasks';
import { masterTasks } from './masterTasks';
import { mediumTasks } from './mediumTasks';

// type LeagueTier = 'beginner' | 'easy' | 'medium' | 'hard' | 'elite' | 'master';

interface HasFunctionArgs {
	cl: Bank;
	bank: Bank;
	user: KlasaUser;
	lapScores: ItemBank;
	skillsLevels: Required<Skills>;
	skillsXP: Required<Skills>;
	poh: PlayerOwnedHouse;
	gear: UserFullGearSetup;
	allItemsOwned: Bank;
	monsterScores: ItemBank;
	creatureScores: ItemBank;
	activityCounts: Record<activity_type_enum, number>;
	slayerTasksCompleted: number;
	minigames: Minigame;
	opens: Bank;
	disassembledItems: Bank;
	mahojiUser: User;
	tames: Tame[];
	sacrificedBank: Bank;
	slayerStats: Awaited<ReturnType<typeof getSlayerTaskStats>>;
	clPercent: number;
	conStats: Bank;
	woodcuttingStats: Bank;
	alchingStats: Bank;
	herbloreStats: ReturnType<typeof betterHerbloreStats>;
	miningStats: Bank;
	firemakingStats: Bank;
	smithingStats: Bank;
	spellCastingStats: Awaited<ReturnType<typeof personalSpellCastStats>>;
	collectingStats: Bank;
	smithingSuppliesUsed: Bank;
	actualClues: Bank;
	smeltingStats: Bank;
	stashUnits: ParsedUnit[];
}

export interface Task {
	id: number;
	name: string;
	has: (opts: HasFunctionArgs) => Promise<boolean>;
}

export function leaguesHasKC(args: HasFunctionArgs, mon: Monster | CustomMonster | { id: number }, amount = 1) {
	return (args.monsterScores[mon.id] ?? 0) >= amount;
}

export function leaguesHasCatches(args: HasFunctionArgs, name: string, amount = 1) {
	const creature = creatures.find(i => stringMatches(i.name, name));
	if (!creature) throw new Error(`${name} is not a creature`);
	return (args.creatureScores[creature.id] ?? 0) >= amount;
}

export function leaguesSlayerTaskForMonster(args: HasFunctionArgs, mon: Monster | CustomMonster, amount: number) {
	let data = args.slayerStats.find(i => i.monsterID === mon.id);
	return data !== undefined && data.total_tasks >= amount;
}

export const leagueTasks = [
	{ name: 'Easy', tasks: easyTasks, points: 20 },
	{ name: 'Medium', tasks: mediumTasks, points: 45 },
	{ name: 'Hard', tasks: hardTasks, points: 85 },
	{ name: 'Elite', tasks: eliteTasks, points: 150 },
	{ name: 'Master', tasks: masterTasks, points: 250 }
];

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
	return { attachments: [{ buffer: Buffer.from(str), fileName: 'all-tasks.txt' }] };
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

function betterHerbloreStats(herbStats: Bank) {
	const herbs = new Bank();
	const unfPots = new Bank();
	const pots = new Bank();

	for (const item of herbStats.items()) {
		for (const [array, bank] of [
			[Grimy, herbs],
			[unfinishedPotions, unfPots],
			[Potions, pots]
		] as const) {
			if (array.some(i => i.id === item[0].id)) {
				bank.add(item[0].id, item[1]);
			}
		}
	}

	return { herbs, unfPots, pots };
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

export async function calcActualClues(user: User) {
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
	const cl = new Bank(user.collectionLogBank as ItemBank);
	const opens = new Bank(user.openable_scores as ItemBank);

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

export async function leaguesCheckUser(userID: string) {
	const [klasaUser, mahojiUser, roboChimpUser] = await Promise.all([
		globalClient.fetchUser(userID),
		mahojiUsersSettingsFetch(userID),
		roboChimpUserFetch(BigInt(userID))
	]);
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
		actualClues,
		ranking,
		smeltingStats,
		stashUnits
	] = await Promise.all([
		personalConstructionStats(mahojiUser),
		getPOH(userID),
		getAllUserTames(userID),
		getSlayerTaskStats(userID),
		getActivityCounts(mahojiUser),
		getMinigameEntity(userID),
		prisma.slayerTask.count({ where: { user_id: userID } }),
		personalAlchingStats(mahojiUser),
		personalHerbloreStatsWithoutZahur(mahojiUser),
		personalMiningStats(mahojiUser),
		personalFiremakingStats(mahojiUser),
		personalSmithingStats(mahojiUser),
		personalSpellCastStats(mahojiUser),
		personalCollectingStats(mahojiUser),
		personalWoodcuttingStats(mahojiUser),
		calcActualClues(mahojiUser),
		calcLeaguesRanking(roboChimpUser),
		personalSmeltingStats(mahojiUser),
		getParsedStashUnits(userID)
	]);
	const clPercent = calcCLDetails(mahojiUser).percent;
	const herbloreStats = betterHerbloreStats(_herbloreStats);
	const smithingSuppliesUsed = calcSuppliesUsedForSmithing(smithingStats);
	const args: HasFunctionArgs = {
		cl: new Bank(mahojiUser.collectionLogBank as ItemBank),
		bank: new Bank(mahojiUser.bank as ItemBank),
		user: klasaUser,
		mahojiUser,
		skillsLevels: getSkillsOfMahojiUser(mahojiUser, true),
		skillsXP: getSkillsOfMahojiUser(mahojiUser, false),
		poh,
		gear: getUserGear(mahojiUser),
		allItemsOwned: klasaUser.allItemsOwned(),
		monsterScores: mahojiUser.monsterScores as ItemBank,
		creatureScores: mahojiUser.creatureScores as ItemBank,
		opens: new Bank(mahojiUser.openable_scores as ItemBank),
		disassembledItems: new Bank(mahojiUser.disassembled_items_bank as ItemBank),
		tames,
		sacrificedBank: new Bank(mahojiUser.sacrificedBank as ItemBank),
		slayerStats,
		activityCounts,
		minigames,
		lapScores: mahojiUser.lapsScores as ItemBank,
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
		actualClues,
		smeltingStats,
		stashUnits
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
		finished: finishedIDs
	};
}

export async function leaguesClaimCommand(userID: bigint, finishedTaskIDs: number[]) {
	const roboChimpUser = await roboChimpUserFetch(userID);
	const newlyFinishedTasks = finishedTaskIDs.filter(i => !roboChimpUser.leagues_completed_tasks_ids.includes(i));
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
			id: userID
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

	let response: Awaited<CommandResponse> = {
		content: `You claimed ${newlyFinishedTasks.length} tasks, and received ${pointsToAward} points. You now have a balance of ${newUser.leagues_points_balance_osb} OSB points and ${newUser.leagues_points_balance_bso} BSO points, and ${newUser.leagues_points_total} total points. You have completed a total of ${newUser.leagues_completed_tasks_ids.length} tasks.`
	};

	if (newlyFinishedTasks.length > 10) {
		response.content += '\nAttached is a text file showing all the tasks you just claimed.';
		response.attachments = [
			{ buffer: Buffer.from(fullNewlyFinishedTasks.map(i => i.name).join('\n')), fileName: 'new-tasks.txt' }
		];
	} else {
		response.content += `\n**Finished Tasks:** ${fullNewlyFinishedTasks.map(i => i.name).join(', ')}.`;
	}

	return response;
}
