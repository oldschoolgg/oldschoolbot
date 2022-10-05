import { ChatInputCommandInteraction } from 'discord.js';
import { Bank, Util } from 'oldschooljs';

import { percentChance, rand } from '../../../lib/util';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { mahojiParseNumber, updateGPTrackSetting } from '../../mahojiSettings';

export async function diceCommand(user: MUser, interaction: ChatInputCommandInteraction, diceamount?: string) {
	await deferInteraction(interaction);
	const roll = rand(1, 100);
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
		return 'You have to dice atleast 1,000,000.';
	}

	const gp = user.GP;
	if (amount > gp) return "You don't have enough GP.";
	const won = roll >= 55;
	let amountToAdd = won ? amount : -amount;

	await updateGPTrackSetting('gp_dice', amountToAdd);
	await updateGPTrackSetting('gp_dice', amountToAdd, user);

	if (won) {
		await user.update({
			stats_diceWins: { increment: 1 }
		});
		await user.addItemsToBank({ items: new Bank().add('Coins', amount) });
	} else {
		await user.update({
			stats_diceLosses: { increment: 1 }
		});
		await user.removeItemsFromBank(new Bank().add('Coins', amount));
	}

	if (amount >= 100_000_000 && won && percentChance(3)) {
		await user.addItemsToBank({ items: new Bank().add('Gamblers bag'), collectionLog: true });
		return `${user.usernameOrMention} rolled **${roll}** on the percentile dice, and you won ${Util.toKMB(
			amountToAdd
		)} GP.\n\nYou received a **Gamblers Bag**.`;
	}

	return `${user.usernameOrMention} rolled **${roll}** on the percentile dice, and you ${
		won ? 'won' : 'lost'
	} ${Util.toKMB(amountToAdd)} GP.`;
}
