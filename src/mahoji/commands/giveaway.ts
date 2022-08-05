import { time } from '@discordjs/builders';
import { Duration } from '@sapphire/time-utilities';
import { MessageAttachment } from 'discord.js';
import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { prisma } from '../../lib/settings/prisma';
import { addToGPTaxBalance, channelIsSendable, getSupportGuild, isSuperUntradeable } from '../../lib/util';
import { logError } from '../../lib/util/logError';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUsersSettingsFetch } from '../mahojiSettings';

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
		channelID
	}: CommandRunOptions<{ start?: { duration: string; items?: string; filter?: string; search?: string } }>) => {
		const user = await globalClient.fetchUser(userID);
		if (user.isIronman) return 'You cannot do giveaways!';
		const mUser = await mahojiUsersSettingsFetch(user.id);
		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return 'Invalid channel.';

		if (options.start) {
			if (!channel.permissionsFor(globalClient.user!)?.has('ADD_REACTIONS')) {
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
				inputBank: user.bank(),
				excludeItems: mUser.favoriteItems,
				user,
				search: options.start.search,
				filters: [options.start.filter],
				maxSize: 70
			});

			if (bank.items().some(i => isSuperUntradeable(i[0]))) {
				return 'You are trying to sell unsellable items.';
			}

			if (!user.bank().fits(bank)) {
				return "You don't own those items.";
			}

			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to do a giveaway with these items? You cannot cancel the giveaway or retrieve the items back afterwards: ${bank}`
			);

			const duration = new Duration(options.start.duration);
			const ms = duration.offset;
			if (!ms || ms > Time.Day * 7 || ms < Time.Second * 5) {
				return 'Your giveaway cannot last longer than 7 days, or be faster than 5 seconds.';
			}

			const supportServer = getSupportGuild();
			if (!supportServer) return "Couldn't find support server!";

			// fetch() always calls the API when no id is specified, so only do it sparingly or if needed.
			if (supportServer.emojis.cache.size === 0) {
				await supportServer.fetch();
			}
			const reaction = supportServer.emojis.cache.random();
			if (!reaction || !reaction.id) {
				return "Couldn't retrieve emojis for this guild, ensure you have some emojis and try again.";
			}

			const message = await channel.send({
				content: `You created a giveaway that will finish at ${time(duration.fromNow, 'F')} (${time(
					duration.fromNow,
					'R'
				)}), the winner will receive these items.
			
React to this messsage with ${reaction} to enter.`,
				files: [
					new MessageAttachment(
						(
							await makeBankImage({
								bank,
								title: `${user.username}'s Giveaway`
							})
						).file.buffer
					)
				]
			});

			const dbData = {
				channel_id: channelID.toString(),
				start_date: new Date(),
				finish_date: duration.fromNow,
				completed: false,
				loot: bank.bank,
				user_id: user.id,
				reaction_id: reaction.id,
				duration: duration.offset,
				message_id: message.id
			};

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
					data: dbData
				});
			} catch (err: any) {
				logError(err, {
					user_id: user.id,
					giveaway_data: JSON.stringify(dbData)
				});
				return 'Error starting giveaway. Please report this error so you can get refunded.';
			}

			try {
				await message.react(reaction);
			} catch (err: any) {
				logError(err, { user_id: user.id, emoji_id: reaction.id, guild_id: guildID.toString() });
				return 'Unknown error. You will be refunded when the giveaway ends if the giveaway fails.';
			}
			return 'Giveaway started.';
		}
	}
};
