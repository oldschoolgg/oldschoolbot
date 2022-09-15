import { Duration } from '@sapphire/time-utilities';
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageOptions,
	PermissionsBitField
} from 'discord.js';
import { randInt, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { addToGPTaxBalance, prisma } from '../../lib/settings/prisma';
import { channelIsSendable, isSuperUntradeable } from '../../lib/util';
import { generateGiveawayContent } from '../../lib/util/giveaway';
import { logError } from '../../lib/util/logError';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUsersSettingsFetch } from '../mahojiSettings';

function makeGiveawayButtons(giveawayID: number): MessageOptions['components'] {
	return [
		new ActionRowBuilder<ButtonBuilder>().addComponents([
			new ButtonBuilder()
				.setCustomId(`GIVEAWAY_ENTER_${giveawayID}`)
				.setLabel('Join Giveaway')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(`GIVEAWAY_LEAVE_${giveawayID}`)
				.setLabel('Leave Giveaway')
				.setStyle(ButtonStyle.Secondary)
		])
	];
}

export const giveawayCommand: OSBMahojiCommand = {
	name: 'giveaway',
	description: 'Giveaway items from your ban to other players.',
	attributes: {
		requiresMinion: true,
		examples: ['/giveaway items:10 trout, 5 coal time:1h']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Start a giveaway.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'duration',
					description: 'The duration of the giveaway (e.g. 1h, 1d).',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'items',
					description: 'The items you want to giveaway.',
					required: false
				},
				filterOption,
				{
					type: ApplicationCommandOptionType.String,
					name: 'search',
					description: 'A search query for items in your bank to giveaway.',
					required: false
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		guildID,
		interaction,
		channelID,
		user: apiUser
	}: CommandRunOptions<{ start?: { duration: string; items?: string; filter?: string; search?: string } }>) => {
		const user = await mUserFetch(userID);
		if (user.isIronman) return 'You cannot do giveaways!';
		const mUser = await mahojiUsersSettingsFetch(user.id);
		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return 'Invalid channel.';

		if (options.start) {
			if (!channel.permissionsFor(globalClient.user!)?.has(PermissionsBitField.Flags.AddReactions)) {
				return "I'm missing permissions to add reactions.";
			}
			const existingGiveaways = await prisma.giveaway.findMany({
				where: {
					user_id: user.id,
					completed: false
				}
			});

			if (existingGiveaways.length > 5) {
				return 'You cannot have more than 5 giveaways active at a time.';
			}

			if (!guildID) {
				return 'You cannot make a giveaway outside a server.';
			}

			const bank = parseBank({
				inputStr: options.start.items,
				inputBank: user.bank,
				excludeItems: mUser.favoriteItems,
				user,
				search: options.start.search,
				filters: [options.start.filter, 'tradeables'],
				maxSize: 70
			});

			if (bank.items().some(i => isSuperUntradeable(i[0]))) {
				return 'You are trying to sell unsellable items.';
			}

			if (!user.bank.has(bank)) {
				return "You don't own those items.";
			}

			if (interaction) {
				await handleMahojiConfirmation(
					interaction,
					`Are you sure you want to do a giveaway with these items? You cannot cancel the giveaway or retrieve the items back afterwards: ${bank}`
				);
			}

			const duration = new Duration(options.start.duration);
			const ms = duration.offset;
			if (!ms || ms > Time.Day * 7 || ms < Time.Second * 5) {
				return 'Your giveaway cannot last longer than 7 days, or be faster than 5 seconds.';
			}

			await user.sync();
			if (!user.bank.has(bank)) {
				return "You don't own those items.";
			}

			if (bank.length === 0) {
				return 'You cannot have a giveaway with no items in it.';
			}

			const giveawayID = randInt(1, 100_000_000);

			const message = await channel.send({
				content: generateGiveawayContent(user.id, duration.fromNow, []),
				files: [
					new AttachmentBuilder(
						(
							await makeBankImage({
								bank,
								title: `${apiUser.username}'s Giveaway`
							})
						).file.buffer
					)
				],
				components: makeGiveawayButtons(giveawayID)
			});

			try {
				await user.removeItemsFromBank(bank);
			} catch (err: any) {
				return err instanceof Error ? err.message : err;
			}
			if (bank.has('Coins')) {
				addToGPTaxBalance(user.id, bank.amount('Coins'));
			}

			try {
				await prisma.giveaway.create({
					data: {
						id: giveawayID,
						channel_id: channelID.toString(),
						start_date: new Date(),
						finish_date: duration.fromNow,
						completed: false,
						loot: bank.bank,
						user_id: user.id,
						duration: duration.offset,
						message_id: message.id,
						users_entered: []
					}
				});
			} catch (err: any) {
				logError(err, {
					user_id: user.id,
					giveaway: bank.toString()
				});
				return 'Error starting giveaway.';
			}

			return 'Giveaway started.';
		}
	}
};
