import { roboChimpCLRankQuery } from '@oldschoolgg/toolkit';
import { Stopwatch } from '@sapphire/stopwatch';
import { sumArr } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from './constants';
import { allCLItems, allCollectionLogsFlat, calcCLDetails } from './data/Collections';
import { prisma } from './settings/prisma';
import { fetchStatsForCL } from './util';
import { fetchCLLeaderboard } from './util/clLeaderboard';
import { formatOrdinal } from './util/formatOrdinal';

async function clArrayUpdate(user: MUser, newCL: Bank) {
	const id = BigInt(user.id);
	const newCLArray = Object.keys(newCL.bank).map(i => Number(i));
	const updateObj = {
		cl_array: newCLArray,
		cl_array_length: newCLArray.length
	} as const;

	const clStats = calcCLDetails(user);
	const clRank = await roboChimpClient.$queryRawUnsafe<{ count: number }[]>(roboChimpCLRankQuery(BigInt(user.id)));

	await prisma.$transaction([
		prisma.userStats.upsert({
			where: {
				user_id: id
			},
			create: {
				user_id: id,
				...updateObj
			},
			update: {
				...updateObj
			}
		}),
		prisma.historicalData.create({
			data: {
				user_id: user.id,
				GP: user.GP,
				total_xp: sumArr(Object.values(user.skillsAsXP)),
				cl_completion_percentage: clStats.percent,
				cl_completion_count: clStats.owned.length,
				cl_global_rank: Number(clRank[0].count)
			}
		})
	]);
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
	if (!newCLItems || newCLItems.length === 0) {
		return;
	}

	clArrayUpdate(user, newCL);

	const clsWithTheseItems = allCollectionLogsFlat.filter(
		cl => cl.counts !== false && newCLItems.items().some(([newItem]) => cl.items.includes(newItem.id))
	);

	// Find CLs with the newly added items, that weren't completed in the previous CL, and now are completed.
	const newlyCompletedCLs = clsWithTheseItems.filter(cl => {
		return cl.items.some(item => !previousCL.has(item)) && cl.items.every(item => newCL.has(item));
	});

	if (newlyCompletedCLs.length === 0) return;

	for (const finishedCL of newlyCompletedCLs) {
		const kcString = finishedCL.fmtProg
			? `They finished after... ${await finishedCL.fmtProg({
					getKC: (id: number) => user.getKC(id),
					user,
					minigames: await user.fetchMinigames(),
					stats: await fetchStatsForCL(user)
			  })}!`
			: '';

		const stopwatch = new Stopwatch();
		const nthUser = (
			await fetchCLLeaderboard({
				ironmenOnly: false,
				items: finishedCL.items,
				resultLimit: 100_000,
				method: 'raw_cl'
			})
		).length;
		debugLog(`Took ${stopwatch.stop()} to calc cl leaderboard for ${finishedCL.name}`);

		const placeStr = nthUser > 100 ? '' : ` They are the ${formatOrdinal(nthUser)} user to finish this CL.`;

		globalClient.emit(
			Events.ServerNotification,
			`${user.badgedUsername} just finished the ${finishedCL.name} collection log!${placeStr} ${kcString}`
		);
	}
}
