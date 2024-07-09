import type { User } from '@prisma/client';
import { notEmpty } from 'e';

import { SupportServer } from '../config';
import { BitField, PerkTier, Roles } from './constants';
import { logError } from './util/logError';

export const perkTierCache = new Map<string, number>();

const tier3ElligibleBits = [
	BitField.IsPatronTier3,
	BitField.isContributor,
	BitField.isModerator,
	BitField.IsWikiContributor
];

export const allPerkBitfields: BitField[] = [
	BitField.IsPatronTier6,
	BitField.IsPatronTier5,
	BitField.IsPatronTier4,
	BitField.IsPatronTier3,
	BitField.IsPatronTier2,
	BitField.IsPatronTier1,
	BitField.HasPermanentTierOne,
	BitField.BothBotsMaxedFreeTierOnePerks
];

export function getUsersPerkTier(
	userOrBitfield: MUser | User | BitField[],
	noCheckOtherAccounts?: boolean
): PerkTier | 0 {
	// Check if the user has a premium balance tier
	if (userOrBitfield instanceof GlobalMUserClass && userOrBitfield.user.premium_balance_tier !== null) {
		const date = userOrBitfield.user.premium_balance_expiry_date;
		if (date && Date.now() < date) {
			return userOrBitfield.user.premium_balance_tier + 1;
		} else if (date && Date.now() > date) {
			userOrBitfield
				.update({
					premium_balance_tier: null,
					premium_balance_expiry_date: null
				})
				.catch(e => {
					logError(e, { user_id: userOrBitfield.id, message: 'Could not remove premium time' });
				});
		}
	}

	if (noCheckOtherAccounts !== true && userOrBitfield instanceof GlobalMUserClass) {
		const main = userOrBitfield.user.main_account;
		const allAccounts: string[] = [...userOrBitfield.user.ironman_alts, userOrBitfield.id];
		if (main) {
			allAccounts.push(main);
		}

		const allAccountTiers = allAccounts.map(id => perkTierCache.get(id)).filter(notEmpty);

		const highestAccountTier = Math.max(0, ...allAccountTiers);
		return highestAccountTier;
	}

	const bitfield = Array.isArray(userOrBitfield) ? userOrBitfield : userOrBitfield.bitfield;

	if (bitfield.includes(BitField.IsPatronTier6)) {
		return PerkTier.Seven;
	}

	if (bitfield.includes(BitField.IsPatronTier5)) {
		return PerkTier.Six;
	}

	if (bitfield.includes(BitField.IsPatronTier4)) {
		return PerkTier.Five;
	}

	if (tier3ElligibleBits.some(bit => bitfield.includes(bit))) {
		return PerkTier.Four;
	}

	if (bitfield.includes(BitField.IsPatronTier2) || bitfield.includes(BitField.HasPermanentTierOne)) {
		return PerkTier.Three;
	}

	if (
		bitfield.includes(BitField.IsPatronTier1) ||
		bitfield.includes(BitField.HasPermanentTierOne) ||
		bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
	) {
		return PerkTier.Two;
	}

	if (userOrBitfield instanceof GlobalMUserClass) {
		const guild = globalClient.guilds.cache.get(SupportServer);
		const member = guild?.members.cache.get(userOrBitfield.id);
		if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
			return PerkTier.One;
		}
	}

	return 0;
}

export function syncPerkTierOfUser(user: MUser) {
	const perkTier = getUsersPerkTier(user, true);
	perkTierCache.set(user.id, perkTier);
	return perkTier;
}
