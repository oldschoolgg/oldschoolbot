import type { MahojiUserOption } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { Events } from '../../lib/constants';

import { toKMB } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../lib/util/interactionReply';
import { tradePlayerItems } from '../../lib/util/tradePlayerItems';
import type { OSBMahojiCommand } from '../lib/util';
import { addToGPTaxBalance, mahojiParseNumber } from '../mahojiSettings';

export const payCommand: OSBMahojiCommand = {
	name: 'pay',
	description: 'Send GP to another user.',
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: 'user',
			description: 'The user you want to send the GP too.',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'amount',
			description: 'The amount you want to send. (e.g. 100k, 1m, 2.5b, 5*100m)',
			required: true
		}
	],
	run: async ({
		options,
		userID,
		interaction,
		guildID
	}: CommandRunOptions<{
		user: MahojiUserOption;
		amount: string;
	}>) => {
		await deferInteraction(interaction);
		const user = await mUserFetch(userID.toString());
		const recipient = await mUserFetch(options.user.user.id);
		const amount = mahojiParseNumber({ input: options.amount, min: 1, max: 500_000_000_000 });
		// Ensure the recipient's users row exists:
		if (!amount) return "That's not a valid amount.";
		const { GP } = user;
		const isBlacklisted = BLACKLISTED_USERS.has(recipient.id);
		if (isBlacklisted) return "Blacklisted players can't receive money.";
		if (recipient.id === user.id) return "You can't send money to yourself.";
		if (user.isIronman) return "Iron players can't send money.";
		if (recipient.isIronman) return "Iron players can't receive money.";
		if (GP < amount) return "You don't have enough GP.";
		if (options.user.user.bot) return "You can't send money to a bot.";
		if (recipient.isBusy) return 'That user is busy right now.';

		if (amount > 500_000_000) {
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to pay ${options.user.user.username}#${options.user.user.discriminator} (ID: ${
					recipient.id
				}) ${toKMB(amount)}?`
			);
		}

		const bank = new Bank().add('Coins', amount);

		const { success, message } = await tradePlayerItems(user, recipient, bank);
		if (!success) {
			return message;
		}

		await prisma.economyTransaction.create({
			data: {
				guild_id: guildID ? BigInt(guildID) : undefined,
				sender: BigInt(user.id),
				recipient: BigInt(recipient.id),
				items_sent: bank.toJSON(),
				items_received: undefined,
				type: 'trade'
			}
		});

		globalClient.emit(Events.EconomyLog, `${user.mention} paid ${amount} GP to ${recipient.mention}.`);
		addToGPTaxBalance(user.id, amount);

		return `You sent ${amount.toLocaleString()} GP to ${recipient}.`;
	}
};
