import type { IMember } from '@oldschoolgg/schemas';

import { globalConfig } from '@/lib/constants.js';

export async function getOrFetchMember({ guildId, userId }: { guildId: string; userId: string }): Promise<IMember> {
	// If we cache this guild, lets check it
	if (globalConfig.guildIdsToCache.includes(guildId)) {
		const key = `${guildId}:${userId}`;
		const delayCheck = await Cache.tryRatelimit(key, 'delay_member_fetch');
		if (!delayCheck.success) {
			// If we're under time out, it could be assumed to be cached, but...
			const cacheMember = await Cache.getMember(guildId, userId);
			if (cacheMember) {
				return cacheMember;
			}
		}
	}
	// We can fetch now
	const member = await globalClient.fetchMember({ guildId, userId });
	// cache
	await Cache.setMember(member);
	return member;
}
