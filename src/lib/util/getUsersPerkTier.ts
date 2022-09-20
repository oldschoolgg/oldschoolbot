import { User } from '@prisma/client';
import { notEmpty, Time } from 'e';

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
	perkTierCache.set(user.id, getUsersPerkTier(user, true));
}
export default function getUsersPerkTier(
	userOrBitfield: MUser | User | BitField[],
	noCheckOtherAccounts?: boolean
): PerkTier | 0 {
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

/**
 * Determines if the user is only a patron because they have shared perks from another account.
 */
export function isPrimaryPatron(user: MUser) {
	const perkTier = getUsersPerkTier(user, true);
	return perkTier > 0;
}

export const dailyResetTime = Time.Hour * 4;
export const spawnLampResetTime = (user: MUser) => {
	const bf = user.bitfield;
	const perkTier = getUsersPerkTier(user, true);

	const hasPerm = bf.includes(BitField.HasPermanentSpawnLamp);
	const hasTier5 = perkTier >= PerkTier.Five;
	const hasTier4 = !hasTier5 && perkTier === PerkTier.Four;

	let cooldown = [PerkTier.Six, PerkTier.Five].includes(perkTier) ? Time.Hour * 12 : Time.Hour * 24;

	if (!hasTier5 && !hasTier4 && hasPerm) {
		cooldown = Time.Hour * 48;
	}

	return cooldown;
};
export const itemContractResetTime = Time.Hour * 8;
export const giveBoxResetTime = Time.Hour * 24;
