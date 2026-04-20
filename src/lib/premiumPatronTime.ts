import { formatDuration, Time } from '@oldschoolgg/toolkit';
import {roboChimpUserFetch} from "@/lib/roboChimp.js";
import {mode} from "simple-statistics";

enum UpdateMode {
	Add = 'add',
	Remove = 'remove',
	Upgrade = 'upgrade',
	Downgrade = 'downgrade'
}

export async function premiumPatronTime(timeMs: number | null, tier: number, userToGive: MUser, interaction: MInteraction) {
	if (![1, 2, 3, 4, 5, 6].includes(tier)) return 'Invalid input.';
	if (timeMs && (timeMs < Time.Second || timeMs > Time.Year * 10)) return 'Invalid input.';

	const currentBalanceTier = userToGive.user.premium_balance_tier;

	if (currentBalanceTier !== null && currentBalanceTier !== tier) {
		await interaction.confirmation(
			`They already have Tier ${currentBalanceTier}; this will replace the existing balance entirely, are you sure?`
		);
	}

	const roboUser = await roboChimpUserFetch(userToGive.id);
	const bestTimedTier = [roboUser.premium_balance_tier ?? 0, userToGive.user.premium_balance_tier ?? 0];
	const currentPatreonTier = Math.max(...bestTimedTier);
	const currentExpiry = Math.max(Number(roboUser.premium_balance_expiry_date ?? 0), Number(userToGive.user.premium_balance_expiry_date ?? 0));
	const currentBalance = currentExpiry - Date.now();

	const expired = currentBalance <= 0;


	let mode : UpdateMode = UpdateMode.Add;
	let confirmMsg = '';
	if (timeMs) {
		if (currentPatreonTier !== tier) {
			mode = tier > currentPatreonTier ? UpdateMode.Upgrade : UpdateMode.Downgrade;

			confirmMsg = `They already have ${formatDuration(currentBalance)} of Tier ${currentPatreonTier}; this will ${mode === 'upgrade' ? 'upgrade' : 'downgrade'} the user's tier, but increase whatever the existing balance. Are you sure?`;
		} else if (timeMs) {
			mode = timeMs > currentBalance ? UpdateMode.Add : UpdateMode.Remove;
			confirmMsg = `They already have ${formatDuration(currentBalance)} of Tier ${currentPatreonTier}; this will ${mode} the existing balance entirely, are you sure?`;
		}
	}


	const confirmMsg = timeMs ?
		`Are you sure you want to add ${formatDuration(timeMs)} of Tier ${tier} patron to ${userToGive}?` :
		`Are you sure you want to remove the temporary Patreon Time from ${userToGive}?`;
	await interaction.confirmation(
		confirmMsg
	);




	await userToGive.update({
		premium_balance_tier: tier,
		premium_balance_expiry_date: newBalanceExpiryTime
	});

	await roboChimpClient.user.upsert({
		where: {
			id: BigInt(userToGive.id)
		},
		update: { premium_balance_tier: tier + 1 },
		create: { id: BigInt(userToGive.id),  premium_balance_tier: tier + 1,  }
	})



	return `Gave ${formatDuration(timeMs)} of Tier ${tier} patron to ${userToGive}. They have ${formatDuration(
		newBalanceExpiryTime - Date.now()
	)} remaining.`;
}
