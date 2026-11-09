import { formatDuration, Time } from '@oldschoolgg/toolkit';

import { applyPremiumTimeGrant, calculatePremiumTimeGrant, fetchPremiumTimeBalance } from '@/lib/premiumTime.js';
import { cyrTiers, hasCyrPerkTier, type PatronTier } from '@/util.js';

type GiftTier = { tier: PatronTier; duration: number; isCyr?: boolean };

function hasCurrentMonthGift(lastGift: bigint | null, now = Date.now()) {
	if (lastGift === null) return false;
	const giftDate = new Date(Number(lastGift));
	const nowDate = new Date(now);
	return giftDate.getUTCFullYear() === nowDate.getUTCFullYear() && giftDate.getUTCMonth() === nowDate.getUTCMonth();
}

function getGiftTier(user: {
	bits: number[];
	premium_balance_tier: number | null;
	premium_balance_is_cyr: boolean | null;
	premium_balance_expiry_date: bigint | null;
}): GiftTier | null {
	const perkInput = {
		patreonBits: user.bits,
		premiumTier: user.premium_balance_tier,
		premiumIsCyr: user.premium_balance_is_cyr,
		premiumExpiry: user.premium_balance_expiry_date
	};
	const cyrTier2 = cyrTiers.find(tier => tier.number === 2);
	const cyrTier3 = cyrTiers.find(tier => tier.number === 3);
	const cyrTier4 = cyrTiers.find(tier => tier.number === 4);
	const cyrTier5 = cyrTiers.find(tier => tier.number === 5);
	const cyrTier6 = cyrTiers.find(tier => tier.number === 6);
	if (!cyrTier2 || !cyrTier3 || !cyrTier4 || !cyrTier5 || !cyrTier6) return null;

	let duration = Time.Week;
	let tier: PatronTier | null = null;
	if (hasCyrPerkTier(perkInput, cyrTier4.perkTier)) {
		tier = cyrTier2;
	}
	if (hasCyrPerkTier(perkInput, cyrTier5.perkTier)) {
		tier = cyrTier3;
		if (hasCyrPerkTier(perkInput, cyrTier6.perkTier)) {
			duration = Time.Day * 14;
		}
	}

	return tier ? { tier, duration, isCyr: true } : null;
}

export const perksCommand = defineCommand({
	name: 'perks',
	description: 'Perk commands.',
	options: [
		{
			type: 'Subcommand',
			name: 'donate_tier',
			description: 'Donate temporary patron time to a user.',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user to donate patron time to.',
					required: true
				}
			]
		}
	],
	run: async ({ options, user, interaction }) => {
		if (options.donate_tier) {
			const donor = await roboChimpClient.user.findUniqueOrThrow({
				where: {
					id: user.id
				},
				select: {
					bits: true,
					premium_balance_tier: true,
					premium_balance_is_cyr: true,
					premium_balance_expiry_date: true,
					last_patreon_gift: true
				}
			});
			const giftTier = getGiftTier(donor);

			if (!giftTier) {
				return "You need Cyr's Tier 4 or higher to donate patron time.";
			}

			if (hasCurrentMonthGift(donor.last_patreon_gift)) {
				return 'You have already donated patron time this month. You can donate again on the 1st of next month.';
			}

			const targetUser = await globalClient.fetchRUser(options.donate_tier.user.user.id);
			const now = Date.now();
			const currentBalance = await fetchPremiumTimeBalance(targetUser.id);
			// premium_balance_tier is always active when is_active = true;
			if (currentBalance.is_active && giftTier.tier.perkTier < currentBalance.premium_balance_tier!) {
				return 'You cannot donate Perks to a user with a higher tier.';
			}

			const grant = calculatePremiumTimeGrant({
				currentBalance,
				timeMs: giftTier.duration,
				tier: giftTier.tier.perkTier,
				isCyr: giftTier.isCyr === true,
				now
			});

			await interaction.confirmation(
				`Donate ${formatDuration(giftTier.duration)} of ${giftTier.isCyr ? 'Cyr' : 'Patron'} Tier ${giftTier.tier.number} perks to ${targetUser.mention}? This uses your monthly Patreon gift, it will reset on the 1st.`
			);

			await roboChimpClient.$transaction(async tx => {
				await applyPremiumTimeGrant({
					client: tx,
					userID: targetUser.id,
					grant
				});
				await tx.user.update({
					where: {
						id: user.id
					},
					data: {
						last_patreon_gift: now
					}
				});
			});

			await Promise.all([globalClient.fetchRUser(targetUser.id), globalClient.fetchRUser(user.id)]);

			return `Donated ${formatDuration(giftTier.duration)} of Cyr Tier ${giftTier.tier.number} patron to ${targetUser.mention}. They have ${formatDuration(
				grant.remainingTime
			)} remaining.`;
		}

		return 'Invalid command.';
	}
});
