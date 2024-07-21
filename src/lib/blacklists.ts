import { Time } from 'e';

import { mahojiClientSettingsFetch } from './util/clientSettings';

export const BLACKLISTED_USERS = new Set<string>();
export const BLACKLISTED_GUILDS = new Set<string>();

export async function syncBlacklists() {
	const a = await mahojiClientSettingsFetch({ guildBlacklist: true, userBlacklist: true });
	for (const g of a.guildBlacklist) BLACKLISTED_GUILDS.add(g);
	for (const u of a.userBlacklist) BLACKLISTED_USERS.add(u);
}

setInterval(syncBlacklists, Time.Minute * 10);
