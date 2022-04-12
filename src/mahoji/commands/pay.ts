import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { client } from '../..';
import { Events } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { toKMB } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiParseNumber, MahojiUserOption } from '../mahojiSettings';

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
		interaction
	}: CommandRunOptions<{
		user: MahojiUserOption;
		amount: string;
	}>) => {
		const user = await client.fetchUser(userID.toString());
		const recipient = await client.fetchUser(options.user.user.id);
		const amount = mahojiParseNumber({ input: options.amount, min: 1, max: 500_000_000_000 });
		if (!amount) return "That's not a valid amount.";
		const GP = user.settings.get(UserSettings.GP);

		if (recipient.id === user.id) return "You can't send money to yourself.";
		if (user.isIronman) return "Iron players can't send money.";
		if (recipient.isIronman) return "Iron players can't receive money.";
		if (GP < amount) return "You don't have enough GP.";
		if (recipient.bot) return "You can't send money to a bot.";
		if (client.oneCommandAtATimeCache.has(recipient.id)) return 'That user is busy right now.';

		if (amount > 500_000_000) {
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to pay ${recipient.username}#${recipient.discriminator} (ID: ${
					recipient.id
				}) ${toKMB(amount)}?`
			);
		}

		const bank = new Bank().add('Coins', amount);

		await user.removeItemsFromBank(bank);
		await recipient.addItemsToBank({ items: bank, collectionLog: false });

		client.emit(Events.EconomyLog, `${user.sanitizedName} paid ${amount} GP to ${recipient.sanitizedName}.`);

		return `You sent ${amount.toLocaleString()} GP to ${recipient}.`;
	}
};
