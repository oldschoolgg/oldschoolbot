import { isValidDiscordSnowflake } from '@oldschoolgg/util';

import { globalConfig } from '@/lib/constants.js';
import { roboChimpSyncData } from '@/lib/roboChimp.js';
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
	let systemRefresh = false;

	if (possibleTarget) {
		possibleTarget = getIdFromMention(possibleTarget);
		if (possibleTarget === globalConfig.clientID && (user.isAdmin || user.isGameHacker)) systemRefresh = true;
		if (user.isMod || user.isAdmin) {
			if (!isValidDiscordSnowflake(possibleTarget)) return 'Invalid user ID.';
			if (possibleTarget === globalConfig.clientID) {
				refreshUser = user;
			} else {
				refreshUser = await mUserFetch(possibleTarget);
				if (!refreshUser.hasMinion) return 'Target player does not have a minion.';
			}
		} else return 'Ook';
	}

	const updateGuildMember = async (userId: string) => {
		if (guildId) await Cache.getMember({ guildId, userId, refreshCache: true, externalServer: true });
	};
	await Promise.all([
		refreshUser.fetchPerkTier({ forceNoCache: true }),
		Cache.resetUsername(refreshUser.id),
		updateGuildMember(refreshUser.id),
		Cache.getRoboChimpUser(refreshUser.id, true),
		roboChimpSyncData(refreshUser),
		systemRefresh ? Cache.refreshStaffGrants() : Promise.resolve(),
		systemRefresh ? Cache.refreshExtraSettingsCache() : Promise.resolve()
	]);
	user.updateProperties();
	return `${refreshUser}'s Caches updated successfully!${
		systemRefresh ? ' Staff bestow schedule cache refreshed.' : ''
	}${systemRefresh ? ' Extra settings cache refreshed.' : ''}`;
}
