import { Bank, toKMB } from 'oldschooljs';

import { mahojiParseNumber } from '@/mahoji/mahojiSettings.js';

export async function diceCommand(rng: RNGProvider, user: MUser, interaction: MInteraction, diceamount?: string) {
	await interaction.defer();
	const roll = rng.randInt(1, 100);
	const amount = mahojiParseNumber({ input: diceamount, min: 1, max: 500_000_000_000 });

	if (!diceamount) {
		return `You rolled **${roll}** on the percentile dice.`;
	}

	if (!amount) {
		return `You rolled **${roll}** on the percentile dice.`;
	}
	if (user.isIronman) return "You're an ironman and you cant play dice.";

	if (amount > 10_000_000_000) {
		return 'You can only dice up to 10b at a time!';
	}

	if (amount < 1_000_000) {
		return 'You have to dice at least 1,000,000.';
	}

	const gp = user.GP;
	if (amount > gp) return "You don't have enough GP.";
	const won = roll >= 55;
	const amountToAdd = won ? amount : -amount;

	await ClientSettings.updateClientGPTrackSetting('gp_dice', amountToAdd);
	await user.updateGPTrackSetting('gp_dice', amountToAdd);

	if (won) {
		await user.statsUpdate({
			dice_wins: { increment: 1 }
		});
		await user.addItemsToBank({ items: new Bank().add('Coins', amount) });
	} else {
		await user.statsUpdate({
			dice_losses: { increment: 1 }
		});
		await user.removeItemsFromBank(new Bank().add('Coins', amount));
	}

	return `${user.badgedUsername} rolled **${roll}** on the percentile dice, and you ${won ? 'won' : 'lost'
		} ${toKMB(amountToAdd)} GP.`;
}
