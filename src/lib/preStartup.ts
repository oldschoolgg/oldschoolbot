import { syncActivityCache } from './Task';
import { syncBlacklists } from './blacklists';
import { runStartupScripts } from './startupScripts';
import { runTimedLoggedFn } from './util';
import { syncDisabledCommands } from './util/syncDisabledCommands';

export async function preStartup() {
	await Promise.all([
		runTimedLoggedFn('Sync Activity Cache', syncActivityCache),
		runTimedLoggedFn('Startup Scripts', runStartupScripts),
		runTimedLoggedFn('Sync Disabled Commands', syncDisabledCommands),
		runTimedLoggedFn('Sync Blacklist', syncBlacklists)
	]);
}
