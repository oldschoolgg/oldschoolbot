import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { Giveaway } from '@prisma/client';
import { Duration } from '@sapphire/time-utilities';
import type { BaseMessageOptions } from 'discord.js';
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	messageLink,
	time
} from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, randInt } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { Emoji, patronFeatures } from '../../lib/constants';
import { marketPriceOfBank } from '../../lib/marketPrices';

import { channelIsSendable, isModOrAdmin, makeComponents, toKMB } from '../../lib/util';
import { generateGiveawayContent } from '../../lib/util/giveaway';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { logError } from '../../lib/util/logError';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
import { addToGPTaxBalance } from '../mahojiSettings';

function makeGiveawayButtons(giveawayID: number): BaseMessageOptions['components'] {
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

function makeGiveawayRepeatButton(giveawayID: number) {
	return new ButtonBuilder()
		.setCustomId(`GIVEAWAY_REPEAT_${giveawayID}`)
		.setLabel('Repeat This Giveaway')
		.setEmoji('493286312854683654')
		.setStyle(ButtonStyle.Danger);
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
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'list',
			description: 'List giveaways active in this server.',
			options: []
		}
	],
	run: async ({
		options,
		userID,
		guildID,
		interaction,
		channelID,
		user: apiUser
	}: CommandRunOptions<{
		start?: { duration: string; items?: string; filter?: string; search?: string };
		list?: {};
	}>) => {
		const user = await mUserFetch(userID);
		if (user.isIronman) return 'You cannot do giveaways!';
		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return 'Invalid channel.';

		if (options.start) {
			const existingGiveaways = await prisma.giveaway.findMany({
				where: {
					user_id: user.id,
					completed: false
				}
			});
			if (existingGiveaways.length >= 10 && !isModOrAdmin(user)) {
				return 'You cannot have more than 10 giveaways active at a time.';
			}

			if (!guildID) {
				return 'You cannot make a giveaway outside a server.';
			}

			const bank = parseBank({
				inputStr: options.start.items,
				inputBank: user.bankWithGP,
				excludeItems: user.user.favoriteItems,
				user,
				search: options.start.search,
				filters: [options.start.filter, 'tradeables'],
				maxSize: 70
			});

			if (!user.bankWithGP.has(bank)) {
				return "You don't own those items.";
			}

			if (bank.items().some(i => !itemIsTradeable(i[0].id, true))) {
				return "You can't giveaway untradeable items.";
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
			if (!user.bankWithGP.has(bank)) {
				return "You don't own those items.";
			}

			if (bank.length === 0) {
				return 'You cannot have a giveaway with no items in it.';
			}

			const giveawayID = randInt(1, 500_000_000);

			const message = await channel.send({
				content: generateGiveawayContent(user.id, duration.fromNow, []),
				files: [
					new AttachmentBuilder(
						(
							await makeBankImage({
								bank,
								title: `${apiUser?.username ?? user.rawUsername}'s Giveaway`
							})
						).file.attachment
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
						loot: bank.toJSON(),
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

			return {
				content: 'Giveaway started.',
				ephemeral: true,
				components: makeComponents([makeGiveawayRepeatButton(giveawayID)])
			};
		}

		if (options.list) {
			if (!guildID) {
				return 'You cannot list giveaways outside a server.';
			}
			const guild = globalClient.guilds.cache.get(guildID);
			if (!guild) return;

			const textChannelsOfThisServer = guild.channels.cache
				.filter(c => c.type === ChannelType.GuildText)
				.map(i => i.id);

			const giveaways = await prisma.giveaway.findMany({
				where: {
					channel_id: {
						in: textChannelsOfThisServer
					},
					completed: false
				},
				orderBy: {
					finish_date: 'asc'
				}
			});

			if (giveaways.length === 0) {
				return 'There are no active giveaways in this server.';
			}

			function getEmoji(giveaway: Giveaway) {
				if (giveaway.user_id === user.id || giveaway.users_entered.includes(user.id)) {
					return Emoji.Green;
				}
				return Emoji.RedX;
			}

			return {
				embeds: [
					new EmbedBuilder().setDescription(
						giveaways
							.map(
								g =>
									`${
										user.perkTier() >= patronFeatures.ShowEnteredInGiveawayList.tier
											? `${getEmoji(g)} `
											: ''
									}[${toKMB(marketPriceOfBank(new Bank(g.loot as ItemBank)))} giveaway ending ${time(
										g.finish_date,
										'R'
									)}](${messageLink(g.channel_id, g.message_id)})`
							)
							.slice(0, 30)
							.join('\n')
					)
				],
				ephemeral: true
			};
		}
	}
};
