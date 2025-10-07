import { noOp, uniqueArr } from '@oldschoolgg/toolkit';

import { cacheBadges } from '@/lib/badges.js';
import { syncBlacklists } from '@/lib/blacklists.js';
import { GeImageGenerator } from '@/lib/canvas/geImage.js';
import { globalConfig } from '@/lib/constants.js';
import { allCollectionLogsFlat } from '@/lib/data/Collections.js';
import { GrandExchange } from '@/lib/grandExchange.js';
import { cacheGEPrices } from '@/lib/marketPrices.js';
import { populateRoboChimpCache } from '@/lib/perkTier.js';
import { RawSQL } from '@/lib/rawSql.js';
import { runStartupScripts } from '@/lib/startupScripts.js';
import { syncActiveUserIDs } from '@/lib/util/cachedUserIDs.js';
import { syncDisabledCommands } from '@/lib/util/syncDisabledCommands.js';
import { logWrapFn } from '@/lib/util.js';
import { syncCustomPrices } from '@/mahoji/lib/events.js';

async function syncCollectionLogSlotTable() {
	await prisma.collectionLogSlot.deleteMany();
	const items = allCollectionLogsFlat
		.filter(i => i.counts !== false)
		.map(cl =>
			uniqueArr(cl.items).map(item => ({
				group_name: cl.name,
				item_id: item
			}))
		)
		.flat(100);
	await prisma.collectionLogSlot.createMany({
		data: items
	});
}

export const preStartup = logWrapFn('PreStartup', async () => {
	await GeImageGenerator.init();

	await prisma.clientStorage.upsert({
		where: { id: globalConfig.clientID },
		create: { id: globalConfig.clientID },
		update: {}
	});

	await Promise.all([
		syncActiveUserIDs(),
		ActivityManager.syncActivityCache(),
		runStartupScripts(),
		syncDisabledCommands(),
		syncBlacklists(),
		syncCustomPrices(),
		cacheBadges(),
		GrandExchange.init(),
		populateRoboChimpCache(),
		cacheGEPrices(),
		prisma.$queryRawUnsafe(RawSQL.updateAllUsersCLArrays()).then(noOp),
		syncCollectionLogSlotTable()
	]);
});
