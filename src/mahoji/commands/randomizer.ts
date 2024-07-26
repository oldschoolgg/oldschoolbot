import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

import { RANDOMIZER_HELP } from '../../lib/constants';
import { getTotalCl } from '../../lib/data/Collections';
import { MUserStats } from '../../lib/structures/MUserStats';
import type { ItemBank } from '../../lib/types';
import { getItem, itemNameFromID } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { minionBuyCommand } from '../lib/abstracted_commands/minionBuyCommand';
import { itemOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';

export const randomizerCommand: OSBMahojiCommand = {
	name: 'randomizer',
	description: 'randomizer.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'info',
			description: 'View randomizer information.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'unlock_item_mapping',
			description: 'Check the item mapping for a specific item.',
			options: [
				{
					...itemOption(),
					name: 'item',
					description: 'The item',
					required: true
				}
			]
		},
		// {
		// 	type: ApplicationCommandOptionType.Subcommand,
		// 	name: 'test_mapping',
		// 	description: 'test_mapping',
		// 	options: [
		// 		{
		// 			type: ApplicationCommandOptionType.String,
		// 			name: 'items',
		// 			description: 'The items',
		// 			required: true
		// 		}
		// 	]
		// },
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'reset',
			description: 'Entirely reset your account/seed.'
		}
	],
	run: async ({
		interaction,
		options,
		userID
	}: CommandRunOptions<{
		info?: {};
		unlock_item_mapping?: { item: string };
		// test_mapping?: { items: string };
		reset?: {};
	}>) => {
		const user = await mUserFetch(userID);
		const map = user.user.item_map as ItemBank;
		const reverseMap = user.user.reverse_item_map as ItemBank;

		if (options.info) {
			return {
				content: RANDOMIZER_HELP
			};
		}

		if (options.unlock_item_mapping) {
			const itemID = options.unlock_item_mapping.item;
			const item = getItem(itemID);
			if (!item) {
				return 'Invalid item.';
			}
			const [, clSlots] = await getTotalCl(user, 'collection', await MUserStats.fromID(user.id));
			const SLOTS_PER_MAPPING = 50;
			const amountTheyCanMap = Math.ceil(clSlots / SLOTS_PER_MAPPING);

			if (amountTheyCanMap < 1) {
				return `You can't map any items, you need to fill out at least ${SLOTS_PER_MAPPING} collection log slots to unlock your first mapping.`;
			}

			if (Object.keys(user.user.unlocked_item_map as ItemBank).length >= amountTheyCanMap) {
				return `You can only map ${amountTheyCanMap} items, you have already mapped ${Object.keys(user.user.unlocked_item_map as ItemBank).length}. You unlock a new mapping every ${SLOTS_PER_MAPPING} collection log slots you fill out.`;
			}

			const mapStr = `${itemNameFromID(reverseMap[item.id])} -> ${itemNameFromID(item.id)} -> ${itemNameFromID(map[item.id])}`;
			if ((user.user.unlocked_item_map as ItemBank)[item.id]) {
				return `This item is already unlocked: ${mapStr}`;
			}

			await user.update({
				unlocked_item_map: {
					...(user.user.unlocked_item_map as ItemBank),
					[item.id]: true
				}
			});
			return mapStr;
		}

		// if (options.test_mapping) {
		// 	if (!options.test_mapping.items) {
		// 		return "You didn't provide any items.";
		// 	}
		// 	const bank = parseBank({
		// 		inputStr: options.test_mapping.items,
		// 		maxSize: 70
		// 	});
		// 	bank.bank[995] = 1;
		// 	let str = '';
		// 	for (const id of Object.keys(bank.bank).map(i => Number(i))) {
		// 		str += `${itemNameFromID(reverseMap[id])} -> ${itemNameFromID(id)} -> ${itemNameFromID(map[id])}\n`;
		// 	}
		// 	return str;
		// }

		if (options.reset) {
			const previousResets = await prisma.fullReset.findMany({
				where: {
					discord_id: user.id
				}
			});
			if (previousResets.length > 0) {
				return 'You have already reset your account.';
			}

			await handleMahojiConfirmation(
				interaction,
				'Are you sure you want to reset your account? This will reset your entire account and seed. **You can only do this ONCE!**'
			);

			const transactions = [];
			transactions.push(prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED`);
			transactions.push(prisma.slayerTask.deleteMany({ where: { user_id: user.id } }));
			transactions.push(prisma.newUser.deleteMany({ where: { id: user.id } }));
			transactions.push(prisma.minigame.deleteMany({ where: { user_id: user.id } }));
			transactions.push(prisma.playerOwnedHouse.deleteMany({ where: { user_id: user.id } }));
			transactions.push(prisma.activity.deleteMany({ where: { user_id: BigInt(user.id) } }));
			transactions.push(prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(user.id) } }));
			transactions.push(prisma.userStats.deleteMany({ where: { user_id: BigInt(user.id) } }));
			transactions.push(prisma.stashUnit.deleteMany({ where: { user_id: BigInt(user.id) } }));
			transactions.push(prisma.tameActivity.deleteMany({ where: { user_id: user.id } }));
			transactions.push(prisma.tame.deleteMany({ where: { user_id: user.id } }));
			transactions.push(prisma.user.deleteMany({ where: { id: user.id } }));
			transactions.push(prisma.userEvent.deleteMany({ where: { user_id: user.id } }));
			transactions.push(prisma.portent.deleteMany({ where: { user_id: user.id } }));
			transactions.push(prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(user.id) } }));
			transactions.push(
				prisma.fullReset.create({
					data: {
						discord_id: user.id
					}
				})
			);

			await prisma.$transaction(transactions);
			return `Your account/seed has been reset.\n${await minionBuyCommand(await mUserFetch(userID))}`;
		}

		return 'Invalid command.';
	}
};
