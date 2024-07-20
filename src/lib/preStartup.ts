import { syncCustomPrices } from '../mahoji/lib/events';
import { syncActivityCache } from './Task';
import { cacheBadges } from './badges';
import { syncBlacklists } from './blacklists';
import { GrandExchange } from './grandExchange';
import { cacheGEPrices } from './marketPrices';
import { populateRoboChimpCache } from './perkTier';
import { runStartupScripts } from './startupScripts';
import { runTimedLoggedFn } from './util';
import { syncActiveUserIDs } from './util/cachedUserIDs';
import { syncDisabledCommands } from './util/syncDisabledCommands';

export async function preStartup() {
	await Promise.all([
		syncActiveUserIDs(),
		runTimedLoggedFn('Sync Activity Cache', syncActivityCache),
		runTimedLoggedFn('Startup Scripts', runStartupScripts),
		runTimedLoggedFn('Sync Disabled Commands', syncDisabledCommands),
		runTimedLoggedFn('Sync Blacklist', syncBlacklists),
		runTimedLoggedFn('Syncing prices', syncCustomPrices),
		runTimedLoggedFn('Caching badges', cacheBadges),
		runTimedLoggedFn('Init Grand Exchange', () => GrandExchange.init()),
		runTimedLoggedFn('populateRoboChimpCache', populateRoboChimpCache),
		runTimedLoggedFn('Cache G.E Prices', cacheGEPrices)
	]);
}
