import { ButtonBuilder, ButtonStyle, EmbedBuilder, messageLink, time } from '@oldschoolgg/discord';
import { Emoji, Time } from '@oldschoolgg/toolkit';
import { Duration } from '@sapphire/time-utilities';
import { Bank, type ItemBank, toKMB } from 'oldschooljs';
import { chunk } from 'remeda';

import type { Giveaway } from '@/prisma/main.js';
import { giveawayCache } from '@/lib/cache.js';
import { patronFeatures } from '@/lib/constants.js';
import { EmojiId } from '@/lib/data/emojis.js';
import { baseFilters, filterableTypes } from '@/lib/data/filterables.js';
import { marketPriceOfBank } from '@/lib/marketPrices.js';
import { generateGiveawayContent } from '@/lib/util/giveaway.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { parseBank } from '@/lib/util/parseStringBank.js';

function makeGiveawayButtons(giveawayID: number) {
	return [
		new ButtonBuilder()
			.setCustomId(`GIVEAWAY_ENTER_${giveawayID}`)
			.setLabel('Join Giveaway')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(`GIVEAWAY_LEAVE_${giveawayID}`)
			.setLabel('Leave Giveaway')
			.setStyle(ButtonStyle.Secondary)
	];
}

function makeGiveawayRepeatButton(giveawayID: number) {
	return new ButtonBuilder()
		.setCustomId(`GIVEAWAY_REPEAT_${giveawayID}`)
		.setLabel('Repeat This Giveaway')
		.setEmoji({ id: EmojiId.MoneyBag })
		.setStyle(ButtonStyle.Danger);
}

export const giveawayCommand = defineCommand({
	name: 'giveaway',
	flags: ['REQUIRES_LOCK'],
	description: 'Giveaway items from your ban to other players.',
	attributes: {
		requiresMinion: true,
		examples: ['/giveaway items:10 trout, 5 coal time:1h']
	},
	options: [
		{
			type: 'Subcommand',
			name: 'start',
			description: 'Start a giveaway.',
			options: [
				{
					type: 'String',
					name: 'duration',
					description: 'The duration of the giveaway (e.g. 1h, 1d).',
					required: true
				},
				{
					type: 'String',
					name: 'items',
					description: 'The items you want to giveaway.',
					required: false
				},
				{
					type: 'String',
					name: 'filter',
					description: 'The filter you want to use.',
					required: false,
					autocomplete: async ({ value }: StringAutoComplete) => {
						const res = !value
							? filterableTypes
							: [...filterableTypes].filter(filter =>
									filter.name.toLowerCase().includes(value.toLowerCase())
								);
						return [...res]
							.sort((a, b) => baseFilters.indexOf(b) - baseFilters.indexOf(a))
							.map(val => ({ name: val.name, value: val.aliases[0] ?? val.name }));
					}
				},
				{
					type: 'String',
					name: 'search',
					description: 'A search query for items in your bank to giveaway.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'list',
			description: 'List giveaways active in this server.',
			options: []
		}
	],
	run: async ({ options, user, guildId, interaction, channelId, user: apiUser, rng }): CommandResponse => {
		if (user.isIronman) return 'You cannot do giveaways!';

		if (options.start) {
			const existingGiveaways = await prisma.giveaway.findMany({
				where: {
					user_id: user.id,
					completed: false
				}
			});
			if (existingGiveaways.length >= 10 && !user.isModOrAdmin()) {
				return 'You cannot have more than 10 giveaways active at a time.';
			}

			if (!guildId) {
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
				await interaction.confirmation(
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

			const giveawayID = rng.randInt(1, 500_000_000);

			const message = await globalClient.sendMessage(channelId, {
				content: generateGiveawayContent(user.id, duration.fromNow, []),
				files: [
					await makeBankImage({
						bank,
						title: `${apiUser?.username ?? user.username}'s Giveaway`
					})
				],
				components: makeGiveawayButtons(giveawayID),
				allowedMentions: { users: [user.id] }
			});
			if (!message) {
				return `There was an error sending the giveaway message. Please ensure I have permission to send messages and attach files in <#${channelId}>.`;
			}

			await user.removeItemsFromBank(bank);

			if (bank.has('Coins')) {
				await ClientSettings.addToGPTaxBalance(user, bank.amount('Coins'));
			}

			try {
				const giveaway = await prisma.giveaway.create({
					data: {
						id: giveawayID,
						channel_id: channelId.toString(),
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
				giveawayCache.set(giveaway.id, giveaway);
			} catch (err: unknown) {
				Logging.logError(err as Error, {
					user_id: user.id,
					giveaway: bank.toString()
				});
				return 'Error starting giveaway.';
			}

			return {
				content: 'Giveaway started.',
				ephemeral: true,
				components: [makeGiveawayRepeatButton(giveawayID)]
			};
		}

		if (options.list) {
			if (!guildId) {
				return 'You cannot list giveaways outside a server.';
			}
			const textChannelsOfThisServer = await globalClient.fetchChannelsOfGuild(guildId);

			const giveaways = await prisma.giveaway.findMany({
				where: {
					channel_id: {
						in: textChannelsOfThisServer.map(i => i.id)
					},
					completed: false
				},
				orderBy: {
					finish_date: 'asc'
				}
			});

			if (giveaways.length === 0) {
				return {
					content: 'There are no active giveaways in this server.',
					ephemeral: true
				};
			}

			function getEmoji(giveaway: Giveaway) {
				if (giveaway.user_id === user.id || giveaway.users_entered.includes(user.id)) {
					return Emoji.Green;
				}
				return Emoji.RedX;
			}

			const perkTier = await user.fetchPerkTier();

			const lines = giveaways.map(
				(g: Giveaway) =>
					`${
						perkTier >= patronFeatures.ShowEnteredInGiveawayList.tier ? `${getEmoji(g)} ` : ''
					}[${toKMB(marketPriceOfBank(new Bank(g.loot as ItemBank)))} giveaway ending ${time(
						g.finish_date,
						'R'
					)}](${messageLink(g.channel_id, g.message_id)})`
			);

			const pages = chunk(lines, 10).map(chunkLines => ({
				embeds: [new EmbedBuilder().setDescription(chunkLines.join('\n'))]
			}));

			return interaction.makePaginatedMessage({ pages, ephemeral: true });
		}
		return 'Invalid subcommand.';
	}
});
