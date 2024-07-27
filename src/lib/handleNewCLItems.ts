import { formatOrdinal } from '@oldschoolgg/toolkit';
import { UserEventType } from '@prisma/client';
import type { Bank } from 'oldschooljs';

import { Events } from './constants';
import { allCLItems, allCollectionLogsFlat, calcCLDetails } from './data/Collections';
import { roboChimpSyncData } from './roboChimp';
import { fetchCLLeaderboard } from './util/clLeaderboard';
import { insertUserEvent } from './util/userEvents';

async function fetchCurrentMastery(user: MUser) {
	const [masteryRank, mastery, clPercentRank] = await prisma.$transaction([
		prisma.user.count({
			where: {
				mastery: {
					gt: user.user.mastery
				}
			}
		}),
		prisma.user.findFirst({
			where: {
				id: user.id
			},
			select: {
				mastery: true
			}
		}),
		prisma.user.count({
			where: {
				cl_percent: {
					gt: user.user.cl_percent
				}
			}
		})
	]);
	return { masteryRank, mastery, clPercentRank };
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
	if (!didGetNewCLItem) return;

	const previousCLDetails = calcCLDetails(previousCL);

	const { mastery: previousMastery } = await fetchCurrentMastery(user);

	await roboChimpSyncData(user);

	const {
		mastery: newMastery,
		masteryRank: newMasteryRank,
		clPercentRank: newCLPercentRank
	} = await fetchCurrentMastery(user);

	// Mastery tier message
	if (newMastery && previousMastery) {
		for (const percentage of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99]) {
			if (previousMastery.mastery < percentage && newMastery.mastery >= percentage) {
				globalClient.emit(
					Events.ServerNotification,
					`${user.badgedUsername} just reached ${percentage}% Mastery! They are now rank ${newMasteryRank} in mastery.`
				);
			}
		}
	}

	const newCLDetails = calcCLDetails(newCL);

	let newCLPercentMessage: string | null = null;

	const milestonePercentages = [25, 50, 70, 80, 90, 95, 100];
	for (const milestone of milestonePercentages) {
		if (previousCLDetails.percent < milestone && newCLDetails.percent >= milestone) {
			newCLPercentMessage = `${user} just reached ${milestone}% Collection Log completion!`;
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

		const nthUser = (
			await fetchCLLeaderboard({
				items: finishedCL.items,
				resultLimit: 100_000,
				method: 'raw_cl',
				userEvents: null
			})
		).filter(u => u.qty === finishedCL.items.length).length;

		globalClient.emit(
			Events.ServerNotification,
			`${user.badgedUsername} just finished the ${finishedCL.name} collection log! They are the ${formatOrdinal(nthUser)} user to finish this CL, and they are now rank ${newCLPercentRank} in overall CL completion.`
		);
	}
}
