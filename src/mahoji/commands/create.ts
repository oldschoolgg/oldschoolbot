import { readFileSync } from 'node:fs';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import Createables from '../../lib/data/createables';
import type { SkillsEnum } from '../../lib/skilling/types';
import type { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../../lib/slayer/slayerUtil';
import { stringMatches } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';
import { userStatsBankUpdate } from '../mahojiSettings';

const creatablesTable = readFileSync('./src/lib/data/creatablesTable.txt', 'utf8');

const content = 'Theses are the items that you can create:';
const allCreatablesTable = {
	content,
	files: [{ attachment: Buffer.from(creatablesTable), name: 'Creatables.txt' }]
};

export const createCommand: OSBMahojiCommand = {
	name: 'create',
	description: 'Allows you to create items, like godswords or spirit shields - and pack barrows armor sets.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'item',
			description: 'The item you want to create/revert.',
			required: true,
			autocomplete: async value => {
				return Createables.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The amount you want to create.',
			required: false,
			min_value: 1,
			max_value: 1_000_000_000
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'showall',
			description: 'Show all creatable items.',
			required: false
		}
	],
	run: async ({
		options,
		interaction,
		userID
	}: CommandRunOptions<{ item: string; quantity?: number; showall?: boolean }>) => {
		const user = await mUserFetch(userID.toString());

		const itemName = options.item?.toLowerCase();
		let { quantity } = options;
		if (options.showall) {
			return allCreatablesTable;
		}

		const createableItem = Createables.find(item => stringMatches(item.name, itemName));
		if (!createableItem) return "That's not a valid item.";

		if (!quantity || createableItem.cantHaveItems) {
			quantity = 1;
		}

		let action: 'create' | 'revert' | 'fix' | 'unpack' = 'create';
		for (const act of ['revert', 'fix', 'unpack'] as const) {
			if (createableItem.name.toLowerCase().startsWith(act)) {
				action = act;
			}
		}

		if (createableItem.QPRequired && user.QP < createableItem.QPRequired) {
			return `You need ${createableItem.QPRequired} QP to ${action} this item.`;
		}

		if (createableItem.requiredSkills) {
			for (const [skillName, lvl] of Object.entries(createableItem.requiredSkills)) {
				if (user.skillLevel(skillName as SkillsEnum) < lvl) {
					return `You need ${lvl} ${skillName} to ${action} this item.`;
				}
			}
		}
		if (createableItem.requiredSlayerUnlocks) {
			const mySlayerUnlocks = user.user.slayer_unlocks;

			const { success, errors } = hasSlayerUnlock(
				mySlayerUnlocks as SlayerTaskUnlocksEnum[],
				createableItem.requiredSlayerUnlocks
			);
			if (!success) {
				return `You don't have the required Slayer Unlocks to ${action} this item.\n\nRequired: ${errors}`;
			}
		}

		if (createableItem.GPCost && user.GP < createableItem.GPCost * quantity) {
			return `You need ${createableItem.GPCost.toLocaleString()} coins to ${action} this item.`;
		}

		if (createableItem.cantBeInCL) {
			const { cl } = user;
			if (Object.keys(createableItem.outputItems).some(itemID => cl.amount(Number(itemID)) > 0)) {
				return `You can only ${action} this item once!`;
			}
		}
		if (createableItem.maxCanOwn) {
			const allItems = user.allItemsOwned;
			const amountOwned = allItems.amount(createableItem.name);
			if (amountOwned >= createableItem.maxCanOwn) {
				return `You already have ${amountOwned}x ${createableItem.name}, you can't create another.`;
			}
			quantity = createableItem.maxCanOwn - amountOwned;
		}

		const outItems = new Bank(createableItem.outputItems).multiply(quantity);
		const inItems = new Bank(createableItem.inputItems).multiply(quantity);

		if (createableItem.GPCost) {
			inItems.add('Coins', createableItem.GPCost * quantity);
		}

		// Check for any items they cant have 2 of.
		if (createableItem.cantHaveItems) {
			const allItemsOwnedBank = user.allItemsOwned;
			for (const [itemID, qty] of Object.entries(createableItem.cantHaveItems)) {
				const numOwned = allItemsOwnedBank.amount(Number(itemID));
				if (numOwned >= qty) {
					return `You can't ${action} this item, because you have ${new Bank(
						createableItem.cantHaveItems
					)} in your bank.`;
				}
			}
		}

		let str =
			{
				revert: `${user}, please confirm that you want to revert **${inItems}** into ${outItems}`,
				unpack: `${user}, please confirm that you want to unpack **${inItems}** into ${outItems}`
			}[action as string] ??
			`${user}, please confirm that you want to ${action} **${outItems}** using ${inItems}`;

		if (createableItem.type) {
			switch (createableItem.type) {
				case 'pack': {
					str = `${user}, please confirm that you want to pack **${inItems}** into ${outItems}`;
					break;
				}
				case 'unpack': {
					str = `${user}, please confirm that you want to unpack **${inItems}** into ${outItems}`;
					break;
				}
			}
		}

		if (createableItem.customReq) {
			const customReq = await createableItem.customReq(user);
			if (typeof customReq === 'string') {
				return customReq;
			}
		}

		await handleMahojiConfirmation(interaction, str);

		// Ensure they have the required items to create the item.
		if (!user.owns(inItems)) {
			return `You don't have the required items to ${action} this item. You need: ${inItems}.`;
		}

		let extraMessage = '';
		// Handle onCreate() features, and last chance to abort:
		if (createableItem.onCreate) {
			const onCreateResult = await createableItem.onCreate(quantity, user);
			if (!onCreateResult.result) {
				return onCreateResult.message;
			}
			if (onCreateResult.message) extraMessage += `\n\n${onCreateResult.message}`;
		}

		// Only allow +create to add items to CL
		let addToCl = !createableItem.noCl && action === 'create';

		if (createableItem.forceAddToCl) {
			addToCl = true;
		}

		await transactItems({
			userID: userID.toString(),
			collectionLog: addToCl,
			itemsToAdd: outItems,
			itemsToRemove: inItems
		});

		await updateBankSetting('create_cost', inItems);
		await updateBankSetting('create_loot', outItems);
		await userStatsBankUpdate(user, 'create_cost_bank', inItems);
		await userStatsBankUpdate(user, 'create_loot_bank', outItems);

		if (action === 'revert') {
			return `You reverted ${inItems} into ${outItems}.${extraMessage}`;
		}
		return `You received ${outItems}.${extraMessage}`;
	}
};
