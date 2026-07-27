import { formatDuration, Time } from '@oldschoolgg/toolkit';

import { applyPremiumTimeGrant, calculatePremiumTimeGrant, fetchPremiumTimeBalance } from '@/lib/premiumTime.js';
import { Bits, cyrTiers } from '@/util.js';

const cyrTier4PlusBits = [Bits.CyrPatronTier4, Bits.CyrPatronTier5, Bits.CyrPatronTier6, Bits.CyrPatronTier7] as const;
const cyrTier5PlusBits = [Bits.CyrPatronTier5, Bits.CyrPatronTier6, Bits.CyrPatronTier7] as const;

function hasCurrentMonthGift(lastGift: bigint | null, now = Date.now()) {
	if (lastGift === null) return false;
	const giftDate = new Date(Number(lastGift));
	const nowDate = new Date(now);
	return giftDate.getUTCFullYear() === nowDate.getUTCFullYear() && giftDate.getUTCMonth() === nowDate.getUTCMonth();
}

function getGiftTier(bits: readonly number[]) {
	if (cyrTier5PlusBits.some(bit => bits.includes(bit))) {
		return cyrTiers.find(tier => tier.number === 3) ?? null;
	}
	if (cyrTier4PlusBits.some(bit => bits.includes(bit))) {
		return cyrTiers.find(tier => tier.number === 2) ?? null;
	}
	return null;
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
					last_patreon_gift: true
				}
			});
			const giftTier = getGiftTier(donor.bits);

			if (!giftTier) {
				return "You need Cyr's Tier 4 or higher to donate patron time.";
			}

			if (hasCurrentMonthGift(donor.last_patreon_gift)) {
				return 'You have already donated patron time this month. You can donate again on the 1st of next month.';
			}

			const targetUser = await globalClient.fetchRUser(options.donate_tier.user.user.id);
			const now = Date.now();
			const currentBalance = await fetchPremiumTimeBalance(targetUser.id);
			const grant = calculatePremiumTimeGrant({
				currentBalance,
				timeMs: Time.Week,
				tier: giftTier.perkTier,
				now
			});

			await interaction.confirmation(
				`Donate 1 week of Cyr Tier ${giftTier.number} patron to ${targetUser.mention}? This uses your monthly Patreon gift.`
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

			return `Donated 1 week of Cyr Tier ${giftTier.number} patron to ${targetUser.mention}. They have ${formatDuration(
				grant.remainingTime
			)} remaining.`;
		}

		return 'Invalid command.';
	}
});
