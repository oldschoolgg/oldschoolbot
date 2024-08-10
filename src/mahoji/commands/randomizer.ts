import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

import { isFunction } from 'e';
import { Bank } from 'oldschooljs';
import { getTotalCl } from '../../lib/data/Collections';
import Buyables from '../../lib/data/buyables/buyables';
import Createables from '../../lib/data/createables';
import { RANDOMIZER_HELP, randomizationMethods, remapBank } from '../../lib/randomizer';
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
			description: 'View your randomizer information.'
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
			description: 'Entirely reset your account/seed.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'randomization_method',
					description: 'The randomization method you want to use.',
					required: true,
					choices: randomizationMethods.map(i => ({ name: i.name, value: i.name }))
				}
			]
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
		reset?: { randomization_method: string };
	}>) => {
		const user = await mUserFetch(userID);
		const map = user.user.item_map as ItemBank;
		const reverseMap = user.user.reverse_item_map as ItemBank;

		if (options.info) {
			let str = RANDOMIZER_HELP(user);
			str += `\n\nYou have tier ${user.perkTier() - 1} perks, unlock higher tiers by filling out more collection log slots.`;

			// let mapStr = 'FROM -> TO\n\n';
			// for (const [key, val] of Object.entries(map)) {
			// 	mapStr += `${itemNameFromID(Number(key))} (${key}) -> ${itemNameFromID(Number(val))} (${val}) \n`;
			// }
			// const attachment = Buffer.from(mapStr);

			let buyableStr = '[Buy This] -> [Get This]\n';
			for (const b of Buyables) {
				const singleOutput: Bank =
					b.outputItems === undefined
						? new Bank().add(b.name)
						: b.outputItems instanceof Bank
							? b.outputItems
							: b.outputItems(user);
				buyableStr += `${b.name} -> ${remapBank(user, singleOutput)}\n`;
			}
			const attachment2 = Buffer.from(buyableStr);

			let creatablesStr = '[Create This] -> [Get This]\n';
			for (const c of Createables) {
				const outItems = new Bank(isFunction(c.outputItems) ? c.outputItems(user) : c.outputItems);
				const inItems = isFunction(c.inputItems) ? c.inputItems(user) : new Bank(c.inputItems);

				creatablesStr += `${inItems} -> ${remapBank(user, outItems)}\n`;
			}
			const attachment3 = Buffer.from(creatablesStr);

			return {
				content: str,
				files: [
					{ attachment: attachment2, name: 'buyables.txt' },
					{ attachment: attachment3, name: 'creatables.txt' }
				]
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

			const mapStr = `${itemNameFromID(reverseMap[item.id])} [${reverseMap[item.id]}] -> ${itemNameFromID(item.id)} [${item.id}] -> ${itemNameFromID(map[item.id])} (${map[item.id]})`;
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
			const maxResets = 5;
			const previousResets = await prisma.fullReset.findMany({
				where: {
					discord_id: user.id
				}
			});
			if (previousResets.length > maxResets) {
				return `You have already reset your account ${previousResets.length}x times.`;
			}

			const randMethod = randomizationMethods.find(i => i.name === options.reset?.randomization_method);
			if (!randMethod) {
				return 'Invalid method.';
			}

			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to reset your account? This will reset your entire account and seed. **You can only do this ${maxResets - previousResets.length}x times**!

You chose: **${randMethod.name} (${randMethod.desc})**`
			);

			const transactions = [];
			transactions.push(prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED`);
			transactions.push(prisma.portent.deleteMany({ where: { user_id: user.id } }));
			transactions.push(prisma.slayerTask.deleteMany({ where: { user_id: user.id } }));
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
			transactions.push(prisma.lastManStandingGame.deleteMany({ where: { user_id: BigInt(user.id) } }));
			transactions.push(
				prisma.fullReset.create({
					data: {
						discord_id: user.id
					}
				})
			);

			try {
				await prisma.$transaction(transactions);
			} catch (err) {
				console.error(`Failed to reset ${user.id}`, err);
				return 'Failed to reset your account, please try again later.';
			}
			return `Your account/seed has been reset.\n${await minionBuyCommand(await mUserFetch(userID), randMethod)}`;
		}

		return 'Invalid command.';
	}
};
