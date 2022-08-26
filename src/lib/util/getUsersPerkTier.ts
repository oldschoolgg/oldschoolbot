import { User } from 'discord.js';
import { notEmpty } from 'e';

import { BitField, PerkTier, Roles } from '../constants';
import { MUserClass } from '../MUser';
import { getSupportGuild } from '../util';
import { logError } from './logError';

const tier3ElligibleBits = [
	BitField.IsPatronTier3,
	BitField.isContributor,
	BitField.isModerator,
	BitField.IsWikiContributor
];

const perkTierCache = new Map<string, number>();

export function syncPerkTierOfUser(user: MUser) {
	perkTierCache.set(user.id, getUsersPerkTier(user.bitfield, true));
}

export default function getUsersPerkTier(
	userOrBitfield: MUser | readonly BitField[],
	noCheckOtherAccounts?: boolean
): PerkTier | 0 {
	if (noCheckOtherAccounts !== true && userOrBitfield instanceof MUserClass) {
		let main = userOrBitfield.user.main_account;
		const allAccounts: string[] = [...userOrBitfield.user.ironman_alts, userOrBitfield.id];
		if (main) {
			allAccounts.push(main);
		}

		const allAccountTiers = allAccounts.map(id => perkTierCache.get(id)).filter(notEmpty);

		const highestAccountTier = Math.max(0, ...allAccountTiers);
		return highestAccountTier;
	}
	if (userOrBitfield instanceof User && userOrBitfield.client.owners.has(userOrBitfield)) {
		return 10;
	}

	const bitfield = userOrBitfield instanceof MUserClass ? userOrBitfield.bitfield : userOrBitfield;

	if (userOrBitfield instanceof MUserClass && userOrBitfield.user.premium_balance_tier !== null) {
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

	if (bitfield.includes(BitField.IsPatronTier5)) {
		return PerkTier.Six;
	}

	if (bitfield.includes(BitField.IsPatronTier4)) {
		return PerkTier.Five;
	}

	if (tier3ElligibleBits.some(bit => bitfield.includes(bit))) {
		return PerkTier.Four;
	}

	if (bitfield.includes(BitField.IsPatronTier2)) {
		return PerkTier.Three;
	}

	if (bitfield.includes(BitField.IsPatronTier1)) {
		return PerkTier.Two;
	}

	if (bitfield.includes(BitField.HasPermanentTierOne)) {
		return PerkTier.Two;
	}

	if (userOrBitfield instanceof MUserClass) {
		const supportGuild = getSupportGuild();
		const member = supportGuild?.members.cache.get(userOrBitfield.id);
		if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
			return PerkTier.One;
		}
	}

	return 0;
}
