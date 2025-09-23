import { TimerManager } from '@sapphire/timer-manager';
import { Time } from 'e';

import { globalConfig } from '@/lib/constants';

export const BLACKLISTED_USERS = new Set<string>();
export const BLACKLISTED_GUILDS = new Set<string>();

export async function syncBlacklists() {
	if (!globalConfig.isProduction) {
		console.log('Skipping blacklist sync because not production');
		return;
	}
	const blacklistedEntities = await roboChimpClient.blacklistedEntity.findMany();
	BLACKLISTED_USERS.clear();
	BLACKLISTED_GUILDS.clear();
	for (const entity of blacklistedEntities) {
		const set = entity.type === 'guild' ? BLACKLISTED_GUILDS : BLACKLISTED_USERS;
		set.add(entity.id.toString());
	}
}

export const startBlacklistSyncing = () => TimerManager.setInterval(syncBlacklists, Time.Minute * 10);
