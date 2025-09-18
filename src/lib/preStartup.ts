import { noOp, uniqueArr } from 'e';

import { syncCustomPrices } from '../mahoji/lib/events.js';
import { cacheBadges } from './badges.js';
import { syncBlacklists } from './blacklists.js';
import { GeImageGenerator } from './canvas/geImage.js';
import { globalConfig } from './constants.js';
import { allCollectionLogsFlat } from './data/Collections.js';
import { GrandExchange } from './grandExchange.js';
import { cacheGEPrices } from './marketPrices.js';
import { populateRoboChimpCache } from './perkTier.js';
import { RawSQL } from './rawSql.js';
import { runStartupScripts } from './startupScripts.js';
import { logWrapFn } from './util.js';
import { syncActiveUserIDs } from './util/cachedUserIDs.js';
import { syncDisabledCommands } from './util/syncDisabledCommands.js';

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

	await Promise.all([
		prisma.clientStorage.upsert({
			where: { id: globalConfig.clientID },
			create: { id: globalConfig.clientID },
			update: {}
		}),
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
