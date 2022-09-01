import { User as MahojiUser } from '@prisma/client';
import { User } from 'discord.js';
import { notEmpty, Time } from 'e';
import { KlasaUser } from 'klasa';

import { SupportServer } from '../../config';
import { mahojiUserSettingsUpdate } from '../../mahoji/mahojiSettings';
import { BitField, PerkTier, Roles } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';
import { logError } from './logError';

const tier3ElligibleBits = [
	BitField.IsPatronTier3,
	BitField.isContributor,
	BitField.isModerator,
	BitField.IsWikiContributor
];

export function patronMaxTripCalc(user: KlasaUser | MahojiUser) {
	const perkTier = getUsersPerkTier(user);
	if (perkTier === PerkTier.Two) return Time.Minute * 3;
	else if (perkTier === PerkTier.Three) return Time.Minute * 6;
	else if (perkTier >= PerkTier.Four) return Time.Minute * 10;
	return 0;
}

export default function getUsersPerkTier(
	userOrBitfield: KlasaUser | MahojiUser | readonly BitField[] | User,
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

	const bitfield = isMahojiUser
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

	if (bitfield.includes(BitField.IsPatronTier2) || bitfield.includes(BitField.HasPermanentTierOne)) {
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
		const guild = globalClient.guilds.cache.get(SupportServer);
		const member = guild?.members.cache.get(userOrBitfield.id);
		if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
			return PerkTier.One;
		}
	}

	return 0;
}

/**
 * Determines if the user is only a patron because they have shared perks from another account.
 */
export function isPrimaryPatron(user: KlasaUser) {
	const perkTier = getUsersPerkTier(user, true);
	return perkTier > 0;
}

export const dailyResetTime = Time.Hour * 4;
export const spawnLampResetTime = (user: MahojiUser) => {
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

const lastBox: keyof MahojiUser = 'lastGivenBoxx';

export const userTimers = [
	[dailyResetTime, UserSettings.LastDailyTimestamp, 'Daily'],
	[itemContractResetTime, UserSettings.LastItemContractDate, 'ItemContract'],
	[giveBoxResetTime, lastBox, 'GiveBox'],
	[spawnLampResetTime, UserSettings.LastSpawnLamp, 'SpawnLamp']
] as const;
