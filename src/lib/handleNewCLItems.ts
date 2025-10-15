import { roll } from '@oldschoolgg/rng';
import { Events, formatOrdinal, roboChimpCLRankQuery, sumArr } from '@oldschoolgg/toolkit';
import type { Bank } from 'oldschooljs';

import { type Prisma, UserEventType } from '@/prisma/main.js';
import { allCLItems, allCollectionLogsFlat, calcCLDetails } from '@/lib/data/Collections.js';
import { calculateMastery } from '@/lib/mastery.js';
import { RawSQL } from '@/lib/rawSql.js';
import { calculateOwnCLRanking, roboChimpSyncData } from '@/lib/roboChimp.js';
import { MUserStats } from '@/lib/structures/MUserStats.js';
import { fetchCLLeaderboard } from '@/lib/util/clLeaderboard.js';
import { insertUserEvent } from '@/lib/util/userEvents.js';

async function createHistoricalData(user: MUser): Promise<Prisma.HistoricalDataUncheckedCreateInput> {
	const clStats = calcCLDetails(user);
	const clRank = await roboChimpClient.$queryRawUnsafe<{ count: number }[]>(roboChimpCLRankQuery(BigInt(user.id)));
	const { totalMastery } = await calculateMastery(user, await MUserStats.fromID(user.id));

	return {
		user_id: user.id,
		GP: user.GP,
		total_xp: sumArr(Object.values(user.skillsAsXP)),
		cl_completion_percentage: clStats.percent,
		cl_completion_count: clStats.owned.length,
		cl_global_rank: Number(clRank[0].count),
		mastery_percentage: totalMastery
	};
}

export async function handleNewCLItems({
	itemsAdded,
	user,
	previousCL,
	newCL
}: {
	user: MUser;
	previousCL: Bank;
	newCL: Bank;
	itemsAdded: Bank;
}) {
	const newCLItems = itemsAdded
		?.clone()
		.filter(i => !previousCL.has(i.id) && newCL.has(i.id) && allCLItems.includes(i.id));

	const didGetNewCLItem = newCLItems && newCLItems.length > 0;
	if (didGetNewCLItem || roll(30)) {
		await prisma.historicalData.create({ data: await createHistoricalData(user) });
	}

	if (didGetNewCLItem) {
		await prisma.$queryRawUnsafe(RawSQL.updateCLArray(user.id));
	}

	if (!didGetNewCLItem) return;

	const previousCLDetails = calcCLDetails(previousCL);
	const previousCLRank = previousCLDetails.percent >= 80 ? await calculateOwnCLRanking(user.id) : null;

	await Promise.all([roboChimpSyncData(user, newCL), user.updateCL()]);
	const newCLRank = previousCLDetails.percent >= 80 ? await calculateOwnCLRanking(user.id) : null;

	const newCLDetails = calcCLDetails(newCL);

	let newCLPercentMessage: string | null = null;

	const milestonePercentages = [25, 50, 70, 80, 90, 95, 100];
	for (const milestone of milestonePercentages) {
		if (previousCLDetails.percent < milestone && newCLDetails.percent >= milestone) {
			newCLPercentMessage = `${user} just reached ${milestone}% Collection Log completion, after receiving ${newCLItems.toString().slice(0, 500)}!`;

			if (previousCLRank !== newCLRank && newCLRank !== null && previousCLRank !== null) {
				newCLPercentMessage += ` In the overall CL leaderboard, they went from rank ${previousCLRank} to rank ${newCLRank}.`;
			}
		}
		break;
	}

	if (newCLPercentMessage) {
		globalClient.emit(Events.ServerNotification, newCLPercentMessage);
	}

	const clsWithTheseItems = allCollectionLogsFlat.filter(
		cl => cl.counts !== false && newCLItems.items().some(([newItem]) => cl.items.includes(newItem.id))
	);

	// Find CLs with the newly added items, that weren't completed in the previous CL, and now are completed.
	const newlyCompletedCLs = clsWithTheseItems.filter(cl => {
		return cl.items.some(item => !previousCL.has(item)) && cl.items.every(item => newCL.has(item));
	});

	for (const finishedCL of newlyCompletedCLs) {
		await insertUserEvent({
			userID: user.id,
			type: UserEventType.CLCompletion,
			collectionLogName: finishedCL.name
		});
		const kcString = finishedCL.fmtProg
			? `They finished after... ${await finishedCL.fmtProg({
					getKC: (id: number) => user.getKC(id),
					user,
					minigames: await user.fetchMinigames(),
					stats: await user.fetchMStats()
				})}!`
			: '';

		const leaderboardUsers = await fetchCLLeaderboard({
			ironmenOnly: false,
			items: finishedCL.items,
			resultLimit: 100_000,
			clName: finishedCL.name
		});

		const nthUser = leaderboardUsers.users.filter(u => u.qty === finishedCL.items.length).length;

		const placeStr = nthUser > 100 ? '' : ` They are the ${formatOrdinal(nthUser)} user to finish this CL.`;

		globalClient.emit(
			Events.ServerNotification,
			`${user.badgedUsername} just finished the ${finishedCL.name} collection log!${placeStr} ${kcString}`
		);
	}
}
