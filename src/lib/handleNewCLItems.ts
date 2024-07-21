import { formatOrdinal } from '@oldschoolgg/toolkit';
import { UserEventType } from '@prisma/client';
import type { Bank } from 'oldschooljs';

import { Events } from './constants';
import { allCLItems, allCollectionLogsFlat, calcCLDetails } from './data/Collections';
import { roboChimpSyncData } from './roboChimp';
import { MUserStats } from './structures/MUserStats';
import { fetchCLLeaderboard } from './util/clLeaderboard';
import { insertUserEvent } from './util/userEvents';

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

	await roboChimpSyncData(user);

	const newCLDetails = calcCLDetails(newCL);

	let newCLPercentMessage: string | null = null;

	const milestonePercentages = [25, 50, 70, 80, 90, 95, 100];
	for (const milestone of milestonePercentages) {
		if (previousCLDetails.percent < milestone && newCLDetails.percent >= milestone) {
			newCLPercentMessage = `${user} just reached ${milestone}% Collection Log completion, after receiving ${newCLItems
				.toString()
				.slice(0, 500)}!`;
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
					stats: await MUserStats.fromID(user.id)
				})}!`
			: '';

		const nthUser = (
			await fetchCLLeaderboard({
				items: finishedCL.items,
				resultLimit: 100_000,
				method: 'raw_cl',
				userEvents: null
			})
		).filter(u => u.qty === finishedCL.items.length).length;

		const placeStr = nthUser > 100 ? '' : ` They are the ${formatOrdinal(nthUser)} user to finish this CL.`;

		globalClient.emit(
			Events.ServerNotification,
			`${user.badgedUsername} just finished the ${finishedCL.name} collection log!${placeStr} ${kcString}`
		);
	}
}
