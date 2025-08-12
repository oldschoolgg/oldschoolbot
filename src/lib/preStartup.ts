import { noOp, uniqueArr } from 'e';

import { syncCustomPrices } from '../mahoji/lib/events';
import { cacheBadges } from './badges';
import { syncBlacklists } from './blacklists';
import { GeImageGenerator } from './canvas/geImage';
import { globalConfig } from './constants';
import { allCollectionLogsFlat } from './data/Collections.js';
import { GrandExchange } from './grandExchange';
import { cacheGEPrices } from './marketPrices';
import { populateRoboChimpCache } from './perkTier';
import { RawSQL } from './rawSql';
import { runStartupScripts } from './startupScripts';
import { logWrapFn } from './util';
import { syncActiveUserIDs } from './util/cachedUserIDs';
import { syncDisabledCommands } from './util/syncDisabledCommands';

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
