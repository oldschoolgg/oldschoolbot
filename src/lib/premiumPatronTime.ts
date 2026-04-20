import { formatDuration } from '@oldschoolgg/toolkit';

import { roboChimpUserFetch } from '@/lib/roboChimp.js';

export const PremiumPatreonTiers = [1, 2, 3, 4, 5, 6];

export async function premiumPatronTime({
	duration,
	tier,
	user,
	interaction,
	remove
}: {
	duration: number | null | undefined;
	tier: number | null | undefined;
	user: MUser;
	interaction: MInteraction;
	remove: boolean | undefined | null;
}) {
	if (remove) {
		duration = undefined;
		tier = undefined;
	} else {
		if (!tier || !duration) {
			return `You must specify a tier and duration unless you're removing perks.`;
		}
	}

	const isRemoving = remove;
	const roboUser = await roboChimpUserFetch(user.id);
	const roboExpiry = Number(roboUser.premium_balance_expiry_date ?? 0);
	const botExpiry = Number(user.user.premium_balance_expiry_date ?? 0);
	const roboTier = roboExpiry > Date.now() && roboUser.premium_balance_tier ? roboUser.premium_balance_tier : 0;
	const botTier = botExpiry > Date.now() && user.user.premium_balance_tier ? user.user.premium_balance_tier : 0;

	const currentPatreonTier = Math.max(roboTier, botTier);
	const currentExpiry = Math.max(roboExpiry, botExpiry);
	const currentBalance = Math.max(0, currentExpiry - Date.now());

	const isExpired = currentPatreonTier <= 0 || currentBalance <= 0;

	let newBalanceExpiryTime: number | null = Date.now();
	let confirmMsg = '';
	if (isRemoving) {
		if (isExpired) {
			return `${user} does not have any patreon time to remove.`;
		}
		confirmMsg = `Are you sure you wish to remove ${formatDuration(currentBalance)} of Tier ${currentPatreonTier} patreon (PerkTier ${currentPatreonTier + 1}) from ${user}?`;
		newBalanceExpiryTime = null;
		tier = null;
	} else {
		if (!duration || !tier || !PremiumPatreonTiers.includes(tier)) {
			const debugInfo = {
				uid: user.id,
				rx: roboExpiry,
				bx: botExpiry,
				rt: roboTier,
				bt: botTier,
				ct: currentPatreonTier,
				cb: currentBalance,
				tm: duration,
				ie: isExpired,
				ir: isRemoving
			};
			return `This shouldn't happen..... Show this to Magna or Cyr: \`\`\`${JSON.stringify(debugInfo)}\`\`\``;
		}
		if (isExpired) {
			confirmMsg = `Are you sure you wish to give ${user} Tier ${tier} patreon (PerkTier ${tier + 1})?`;
			newBalanceExpiryTime = Date.now() + duration;
		} else if (currentPatreonTier !== tier) {
			const modeStr = tier > currentPatreonTier ? 'upgrade' : '**downgrade**';
			confirmMsg = `They already have ${formatDuration(currentBalance)} of Tier ${currentPatreonTier} (PerkTier: ${currentPatreonTier + 1}); this will ${modeStr} the user's tier to ${tier} (PerkTier: ${tier + 1},  but increase whatever their existing balance of ${formatDuration(currentBalance)} to ${formatDuration(currentBalance + duration)}. Are you sure?`;
			newBalanceExpiryTime = Date.now() + currentBalance + duration;
		} else {
			// so currentPatreonTier === tier
			const increasedDuration = currentBalance + duration;
			confirmMsg = `Are you sure you wish to increase ${user}'s existing ${formatDuration(duration)} of Tier ${tier} patreon (PerkTier ${tier + 1}) to total of ${formatDuration(increasedDuration)}?`;
			newBalanceExpiryTime = Date.now() + increasedDuration;
		}
	}

	await interaction.confirmation(confirmMsg);

	const dataTier = tier ?? 0;
	const dataExpiry = newBalanceExpiryTime ?? 0;

	await user.update({
		premium_balance_tier: dataExpiry,
		premium_balance_expiry_date: dataExpiry
	});

	await roboChimpClient.user.upsert({
		where: {
			id: BigInt(user.id)
		},
		update: { premium_balance_tier: dataTier + 1, premium_balance_expiry_date: dataExpiry },
		create: { id: BigInt(user.id), premium_balance_tier: dataTier + 1, premium_balance_expiry_date: dataExpiry }
	});

	if (isRemoving) {
		return `Removed all time-limited patreon time from ${user}.`;
	}

	return `Gave ${formatDuration(duration!)} of Tier ${tier} patron to ${user}. They have ${formatDuration(
		dataExpiry - Date.now()
	)} remaining.`;
}
