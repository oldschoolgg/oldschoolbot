import {
	type CommandRunOptions,
	type MahojiUserOption,
	containsBlacklistedWord,
	mentionCommand,
	miniID,
	truncateString
} from '@oldschoolgg/toolkit/util';
import { GiftBoxStatus } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { BOT_TYPE } from '../../lib/constants';

import type { ItemBank } from '../../lib/types';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { isValidNickname } from '../../lib/util/smallUtils';
import type { OSBMahojiCommand } from '../lib/util';

export const giftCommand: OSBMahojiCommand = {
	name: 'gift',
	description: 'Create gifts for other users, or open one you received.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'open',
			description: 'Open one of the gifts you have.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'gift',
					description: 'The gift to open.',
					required: true,
					autocomplete: async (input, user) => {
						const gifts = await prisma.giftBox.findMany({
							where: {
								owner_id: user.id,
								status: GiftBoxStatus.Sent
							}
						});
						return gifts
							.filter(g => {
								if (!input) return true;
								const str = g.name ?? g.id;
								return str.toLowerCase().includes(input.toLowerCase());
							})
							.map(g => ({ name: g.name ? `${g.name} (${g.id})` : g.id, value: g.id }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'list',
			description: 'List the boxes you have.',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'create',
			description: 'Create a gift.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'items',
					description: 'The items to put in this gift.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'A name for your gift (optional).',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'send',
			description: 'Send someone a gift.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'gift',
					description: 'The gift to send.',
					required: true,
					autocomplete: async (input, user) => {
						const gifts = await prisma.giftBox.findMany({
							where: {
								creator_id: user.id,
								status: GiftBoxStatus.Created
							}
						});
						return gifts
							.filter(g => {
								if (!input) return true;
								const str = g.name ?? g.id;
								return str.toLowerCase().includes(input.toLowerCase());
							})
							.map(g => ({ name: g.name ? `${g.name} (${g.id})` : g.id, value: g.id }));
					}
				},
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user to send it to.',
					required: true
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		list?: {};
		create?: {
			items: string;
			name?: string;
		};
		send?: { gift: string; user: MahojiUserOption };
		open?: { gift: string };
	}>) => {
		const user = await mUserFetch(userID);
		if (user.isIronman) {
			return 'Ironmen cannot use this command.';
		}

		if (options.list) {
			const giftsCreatedNotSent = await prisma.giftBox.findMany({
				where: {
					creator_id: user.id,
					status: GiftBoxStatus.Created
				}
			});

			const giftsOwnedButNotOpened = await prisma.giftBox.findMany({
				where: {
					owner_id: user.id,
					status: GiftBoxStatus.Sent
				}
			});

			return `**Gifts You Haven't Sent Yet:**
${giftsCreatedNotSent.map(g => `${g.name ? `${g.name} (${g.id})` : g.id}: ${new Bank(g.items as ItemBank)}`).join('\n')}

**Gifts You Haven't Opened Yet:**
${truncateString(giftsOwnedButNotOpened.map(g => `${g.name ? `${g.name} (${g.id})` : g.id}`).join('\n'), 1000)}`;
		}

		if (options.open) {
			const gift = await prisma.giftBox.findFirst({
				where: {
					id: options.open.gift,
					owner_id: user.id,
					status: GiftBoxStatus.Sent
				}
			});
			if (!gift) {
				return 'Invalid gift box.';
			}
			const loot = new Bank(gift.items as ItemBank);
			await prisma.giftBox.update({
				where: {
					id: gift.id
				},
				data: {
					status: GiftBoxStatus.Opened
				}
			});
			await user.addItemsToBank({
				items: loot,
				collectionLog: false
			});
			const image = await makeBankImage({
				bank: loot,
				title: gift.name ?? 'Gift Box',
				background: 33
			});
			return {
				content: 'You opened the gift box!',
				files: [image.file]
			};
		}

		if (options.create) {
			if (
				options.create.name &&
				(!isValidNickname(options.create.name) || containsBlacklistedWord(options.create.name))
			) {
				return 'That name cannot be used for your gift box; no special characters, less than 30 characters and no inappropriate words.';
			}
			const items = parseBank({
				inputBank: user.bankWithGP,
				inputStr: options.create.items,
				maxSize: 30
			});

			if (items.length === 0 || items.length > 20) {
				return 'You must provide at least one item, and no more than 20.';
			}

			for (const [item] of items.items()) {
				if (BOT_TYPE === 'OSB') {
					if (!itemIsTradeable(item.id, true)) {
						return `You cannot put ${item.name} in a gift box.`;
					}
				}
			}

			if (!user.bankWithGP.has(items)) {
				return 'You do not have the required items to create this gift box.';
			}

			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to create this gift box? You will **lose these items**, and you **cannot get the items back**!

${items}`
			);

			await user.removeItemsFromBank(items);
			const gift = await prisma.giftBox.create({
				data: {
					id: miniID(5),
					creator_id: user.id,
					items: items.toJSON(),
					name: options.create.name,
					status: GiftBoxStatus.Created
				}
			});

			return `You wrapped up your items into a gift box! You can send it to someone with ${mentionCommand(
				globalClient,
				'gift',
				'send'
			)}. This gift box has an id of ${gift.id}${gift.name ? `, and is called \`${gift.name}\`` : ''}.`;
		}

		if (options.send) {
			if (!options.send.gift) {
				return 'You must provide a gift box to send.';
			}
			if (!options.send.user || options.send.user.user.id === userID || options.send.user.user.bot) {
				return 'You must provide a valid user to send the gift box to.';
			}
			const recipient = await mUserFetch(options.send.user.user.id);
			if (recipient.isIronman || BLACKLISTED_USERS.has(recipient.id)) {
				return 'This person cannot receive gift boxes.';
			}
			const giftBox = await prisma.giftBox.findFirst({
				where: {
					id: options.send.gift,
					creator_id: user.id,
					status: GiftBoxStatus.Created
				}
			});
			if (!giftBox || giftBox.status !== GiftBoxStatus.Created) {
				return 'Invalid gift box.';
			}

			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to send this gift box (${giftBox.id}) to ${recipient.badgedUsername}? You cannot get it back.`
			);
			await prisma.giftBox.update({
				where: {
					id: giftBox.id
				},
				data: {
					owner_id: recipient.id,
					status: GiftBoxStatus.Sent
				}
			});
			await prisma.economyTransaction.create({
				data: {
					guild_id: interaction.guildId ? BigInt(interaction.guildId) : undefined,
					sender: BigInt(user.id),
					recipient: BigInt(recipient.id),
					items_sent: giftBox.items as string,
					items_received: undefined,
					type: 'gift'
				}
			});
			return `You sent the gift box to ${recipient.badgedUsername}!`;
		}

		return 'Invalid options.';
	}
};
