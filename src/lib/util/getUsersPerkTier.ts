import { User as MahojiUser } from '@prisma/client';
import { User } from 'discord.js';
import { notEmpty, Time } from 'e';

import { mahojiUserSettingsUpdate } from '../../mahoji/mahojiSettings';
import { BitField, PerkTier, Roles } from '../constants';
import { MUser } from '../MUser';
import { UserSettings } from '../settings/types/UserSettings';
import { getSupportGuild } from '../util';
import { logError } from './logError';

const tier3ElligibleBits = [
	BitField.IsPatronTier3,
	BitField.isContributor,
	BitField.isModerator,
	BitField.IsWikiContributor
];

export function patronMaxTripCalc(user: MUser | MahojiUser | MUser) {
	const perkTier = getUsersPerkTier(user);
	if (perkTier === PerkTier.Two) return Time.Minute * 3;
	else if (perkTier === PerkTier.Three) return Time.Minute * 6;
	else if (perkTier >= PerkTier.Four) return Time.Minute * 10;
	return 0;
}

export default function getUsersPerkTier(
	userOrBitfield: MUser | KlasaUser | MahojiUser | readonly BitField[],
	noCheckOtherAccounts?: boolean
): PerkTier | 0 {
	const isMahojiUser = typeof userOrBitfield === 'object' && 'main_account' in userOrBitfield;
	if (noCheckOtherAccounts !== true && isMahojiUser) {
		let main = userOrBitfield.main_account;
		const allAccounts: string[] = [...userOrBitfield.ironman_alts, userOrBitfield.id];
		if (main) {
			allAccounts.push(main);
		}

		const allAccountTiers = allAccounts
			.map(id => globalClient.users.cache.get(id))
			.filter(notEmpty)
			.map(t => getUsersPerkTier(t, true));

		const highestAccountTier = Math.max(0, ...allAccountTiers);
		return highestAccountTier;
	} else if (noCheckOtherAccounts !== true && userOrBitfield instanceof KlasaUser) {
		let main = userOrBitfield.settings.get(UserSettings.MainAccount);
		const allAccounts: string[] = [...userOrBitfield.settings.get(UserSettings.IronmanAlts), userOrBitfield.id];
		if (main) {
			allAccounts.push(main);
		}

		const allAccountTiers = allAccounts
			.map(id => userOrBitfield.client.users.cache.get(id))
			.filter(notEmpty)
			.map(t => getUsersPerkTier(t, true));

		const highestAccountTier = Math.max(0, ...allAccountTiers);
		return highestAccountTier;
	}

	if (userOrBitfield instanceof User && userOrBitfield.client.owners.has(userOrBitfield)) {
		return 10;
	}

	const bitfield =
		userOrBitfield instanceof MUser
			? userOrBitfield.user.bitfield
			: isMahojiUser
			? userOrBitfield.bitfield
			: userOrBitfield instanceof User
			? userOrBitfield.settings.get(UserSettings.BitField)
			: userOrBitfield;

	if (isMahojiUser && userOrBitfield.premium_balance_tier !== null) {
		const date = userOrBitfield.premium_balance_expiry_date;
		if (date && Date.now() < date) {
			return userOrBitfield.premium_balance_tier + 1;
		} else if (date && Date.now() > date) {
			mahojiUserSettingsUpdate(userOrBitfield.id, {
				premium_balance_tier: null,
				premium_balance_expiry_date: null
			}).catch(e => {
				logError(e, { user_id: userOrBitfield.id, message: 'Could not remove premium time' });
			});
		}
	} else if (
		userOrBitfield instanceof User &&
		userOrBitfield.settings.get(UserSettings.PremiumBalanceTier) !== null
	) {
		const date = userOrBitfield.settings.get(UserSettings.PremiumBalanceExpiryDate);
		if (date && Date.now() < date) {
			return userOrBitfield.settings.get(UserSettings.PremiumBalanceTier)! + 1;
		} else if (date && Date.now() > date) {
			userOrBitfield.settings.update([
				[UserSettings.PremiumBalanceExpiryDate, null],
				[UserSettings.PremiumBalanceTier, null]
			]);
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
	// This can be combined into one block because both the Mahoji/DB User type and [Klasa]User class have `id` member
	if (isMahojiUser || userOrBitfield instanceof User) {
		const supportGuild = getSupportGuild();
		const member = supportGuild?.members.cache.get(userOrBitfield.id);
		if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
			return PerkTier.One;
		}
	}

	return 0;
}
