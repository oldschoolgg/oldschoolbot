import { PerkTier } from '@oldschoolgg/toolkit';
import { pick } from 'lodash';
import { SupportServer } from '../../config';
import { BitField, Roles } from '../../lib/constants';
import type { RobochimpUser } from '../../lib/roboChimp';

const robochimpCachedKeys = [
	'bits',
	'github_id',
	'patreon_id',
	'perk_tier',
	'user_group_id',
	'premium_balance_expiry_date',
	'premium_balance_tier'
] as const;
type CachedRoboChimpUser = Pick<RobochimpUser, (typeof robochimpCachedKeys)[number]>;

export const roboChimpCache = new Map<string, CachedRoboChimpUser>();

export async function populateRoboChimpCache() {
	const users = await roboChimpClient.user.findMany({
		select: {
			id: true,
			bits: true,
			github_id: true,
			patreon_id: true,
			perk_tier: true,
			premium_balance_expiry_date: true,
			premium_balance_tier: true,
			user_group_id: true
		},
		where: {
			perk_tier: {
				not: 0
			}
		}
	});
	for (const user of users) {
		roboChimpCache.set(user.id.toString(), user);
	}
	debugLog(`Populated RoboChimp cache with ${users.length} users.`);
}

export function cacheRoboChimpUser(user: RobochimpUser) {
	if (user.perk_tier === 0) return;
	roboChimpCache.set(user.id.toString(), pick(user, robochimpCachedKeys));
}

export function getPerkTierSync(user: string | MUser) {
	const elligibleTiers = [];
	if (typeof user !== 'string') {
		if (
			[BitField.isContributor, BitField.isModerator, BitField.IsWikiContributor].some(bit =>
				user.bitfield.includes(bit)
			)
		) {
			return PerkTier.Four;
		}

		if (
			user.bitfield.includes(BitField.IsPatronTier1) ||
			user.bitfield.includes(BitField.HasPermanentTierOne) ||
			user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
		) {
			elligibleTiers.push(PerkTier.Two);
		} else {
			const guild = globalClient.guilds.cache.get(SupportServer);
			const member = guild?.members.cache.get(user.id);
			if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
				elligibleTiers.push(PerkTier.One);
			}
		}
	}

	elligibleTiers.push(roboChimpCache.get(typeof user === 'string' ? user : user.id)?.perk_tier ?? 0);
	return Math.max(...elligibleTiers);
}
