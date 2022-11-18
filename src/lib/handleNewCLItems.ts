import { Stopwatch } from '@sapphire/stopwatch';
import { Bank } from 'oldschooljs';

import { Events } from './constants';
import { allCLItems, allCollectionLogsFlat } from './data/Collections';
import { fetchCLLeaderboard } from './util/clLeaderboard';
import { formatOrdinal } from './util/formatOrdinal';
import { log } from './util/log';

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
			? `They finished after... ${finishedCL.fmtProg({
					getKC: (id: number) => user.getKC(id),
					user,
					minigames: await user.fetchMinigames()
			  })}!`
			: '';

		const stopwatch = new Stopwatch();
		const nthUser = (
			await fetchCLLeaderboard({ ironmenOnly: false, items: finishedCL.items, resultLimit: 100_000 })
		).length;
		log(`Took ${stopwatch.stop()} to calc cl leaderboard for ${finishedCL.name}`);

		globalClient.emit(
			Events.ServerNotification,
			`${user} just finished the ${finishedCL.name} collection log! They are the ${formatOrdinal(
				nthUser
			)} user to finish this CL. ${kcString}`
		);
	}
}
