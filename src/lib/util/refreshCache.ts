import { isValidDiscordSnowflake } from '@oldschoolgg/util';

import { roboChimpUserFetch } from '@/lib/roboChimp.js';
import { getIdFromMention } from '@/lib/util.js';

export async function refreshUserCache({
	user,
	guildId,
	possibleTarget
}: {
	user: MUser;
	guildId?: string | null;
	possibleTarget?: string;
}) {
	let refreshUser = user;

	if (possibleTarget) {
		possibleTarget = getIdFromMention(possibleTarget);
		if (user.isMod() || user.isAdmin()) {
			if (!isValidDiscordSnowflake(possibleTarget)) return 'Invalid user ID.';
			refreshUser = await mUserFetch(possibleTarget);
			if (!refreshUser.hasMinion) return 'Target player does not have a minion.';
		} else return 'Ook';
	}

	const updateGuildMember = async (userId: string) => {
		if (guildId) await Cache.getMember({ guildId, userId, refreshCache: true, externalServer: true });
	};
	await Promise.all([
		refreshUser.fetchPerkTier({ guildId, forceNoCache: true }),
		updateGuildMember(refreshUser.id),
		roboChimpUserFetch(refreshUser.id)
	]);
	return `${refreshUser}'s Caches updated successfully!`;
}
