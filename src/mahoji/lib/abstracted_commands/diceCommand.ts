import type { ChatInputCommandInteraction } from 'discord.js';
import { Bank, Util } from 'oldschooljs';

import { cryptoRand } from '../../../lib/util';
import { deferInteraction } from '../../../lib/util/interactionReply';
import {
	mahojiParseNumber,
	updateClientGPTrackSetting,
	updateGPTrackSetting,
	userStatsUpdate
} from '../../mahojiSettings';

export async function diceCommand(user: MUser, interaction: ChatInputCommandInteraction, diceamount?: string) {
	await deferInteraction(interaction);
	const roll = cryptoRand(1, 100);
	const amount = mahojiParseNumber({ input: diceamount, min: 1, max: 500_000_000_000 });

	if (!diceamount) {
		return `You rolled **${roll}** on the percentile dice.`;
	}

	if (!amount) {
		return `You rolled **${roll}** on the percentile dice.`;
	}
	if (user.isIronman) return "You're an ironman and you cant play dice.";

	if (amount > 500_000_000) {
		return 'You can only dice up to 500m at a time!';
	}

	if (amount < 1_000_000) {
		return 'You have to dice at least 1,000,000.';
	}

	const gp = user.GP;
	if (amount > gp) return "You don't have enough GP.";
	const won = roll >= 55;
	const amountToAdd = won ? amount : -amount;

	await updateClientGPTrackSetting('gp_dice', amountToAdd);
	await updateGPTrackSetting('gp_dice', amountToAdd, user);

	if (won) {
		await userStatsUpdate(
			user.id,
			{
				dice_wins: { increment: 1 }
			},
			{}
		);
		await user.addItemsToBank({ items: new Bank().add('Coins', amount) });
	} else {
		await userStatsUpdate(
			user.id,
			{
				dice_losses: { increment: 1 }
			},
			{}
		);
		await user.removeItemsFromBank(new Bank().add('Coins', amount));
	}

	return `${user.badgedUsername} rolled **${roll}** on the percentile dice, and you ${
		won ? 'won' : 'lost'
	} ${Util.toKMB(amountToAdd)} GP.`;
}
