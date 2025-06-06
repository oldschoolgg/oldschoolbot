import { pick } from 'remeda';

import { perkTierCache } from './cache';
import { globalConfig } from './constants';
import type { RobochimpUser } from './roboChimp';

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
	if (!globalConfig.isProduction) {
		console.log('Skipping populating robochimp cache because not production');
		return;
	}
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
		const strId = user.id.toString();
		roboChimpCache.set(strId, user);
		perkTierCache.set(strId, user.perk_tier);
	}
}

export function cacheRoboChimpUser(user: RobochimpUser) {
	if (user.perk_tier === 0) return;
	roboChimpCache.set(user.id.toString(), pick(user, robochimpCachedKeys));
}
