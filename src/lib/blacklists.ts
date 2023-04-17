import { Time } from 'e';

import { production } from '../config';

export const BLACKLISTED_USERS = new Set<string>();
export const BLACKLISTED_GUILDS = new Set<string>();

export async function syncBlacklists() {}

if (production) {
	setInterval(syncBlacklists, Time.Minute * 10);
}
