import { noOp } from 'e';
import { syncCustomPrices } from '../mahoji/lib/events';
import { syncActivityCache } from './Task';
import { cacheBadges } from './badges';
import { syncBlacklists } from './blacklists';
import { globalConfig } from './constants';
import { GrandExchange } from './grandExchange';
import { cacheGEPrices } from './marketPrices';
import { populateRoboChimpCache } from './perkTier';
import { RawSQL } from './rawSql';
import { runStartupScripts } from './startupScripts';
import { logWrapFn } from './util';
import { syncActiveUserIDs } from './util/cachedUserIDs';
import { syncDisabledCommands } from './util/syncDisabledCommands';

export const preStartup = logWrapFn('PreStartup', async () => {
	await Promise.all([
		prisma.clientStorage.upsert({
			where: { id: globalConfig.clientID },
			create: { id: globalConfig.clientID },
			update: {}
		}),
		syncActiveUserIDs(),
		syncActivityCache(),
		runStartupScripts(),
		syncDisabledCommands(),
		syncBlacklists(),
		syncCustomPrices(),
		cacheBadges(),
		GrandExchange.init(),
		populateRoboChimpCache(),
		cacheGEPrices(),
		prisma.$queryRawUnsafe(RawSQL.updateAllUsersCLArrays()).then(noOp)
	]);
});
