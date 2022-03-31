import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { table } from 'table';

import { client } from '../..';
import Createables from '../../lib/data/createables';
import { gotFavour } from '../../lib/minions/data/kourendFavour';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../../lib/slayer/slayerUtil';
import { stringMatches, updateBankSetting } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation } from '../mahojiSettings';

function showAllCreatables() {
	let content = 'This are the items that you can create:';
	const creatableTable = table([
		['Item Name', 'Input Items', 'Output Items', 'GP Cost', 'Skills Required', 'QP Required'],
		...Createables.map(i => {
			return [
				i.name,
				`${new Bank(i.inputItems)}`,
				`${new Bank(i.outputItems)}`,
				`${i.GPCost ?? 0}`,
				`${
					i.requiredSkills === undefined
						? ''
						: Object.entries(i.requiredSkills)
								.map(entry => `${entry[0]}: ${entry[1]}`)
								.join('\n')
				}`,
				`${i.QPRequired ?? ''}`
			];
		})
	]);
	return {
		content,
		attachments: [{ buffer: Buffer.from(creatableTable), fileName: 'Creatables.txt' }]
	};
}

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
		const user = await client.fetchUser(userID.toString());

		const itemName = options.item.toLowerCase();
		let { quantity } = options;
		if (options.showall) {
			await interaction.deferReply();
			return showAllCreatables();
		}

		const createableItem = Createables.find(item => stringMatches(item.name, itemName));
		if (!createableItem) return "That's not a valid item.";

		if (!quantity || createableItem.cantHaveItems) {
			quantity = 1;
		}

		let action = 'create';
		for (const act of ['revert', 'fix', 'unpack']) {
			if (createableItem.name.toLowerCase().startsWith(act)) {
				action = act;
			}
		}

		if (createableItem.QPRequired && user.settings.get(UserSettings.QP) < createableItem.QPRequired) {
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
			let mySlayerUnlocks = user.settings.get(UserSettings.Slayer.SlayerUnlocks);

			const { success, errors } = hasSlayerUnlock(
				mySlayerUnlocks as SlayerTaskUnlocksEnum[],
				createableItem.requiredSlayerUnlocks
			);
			if (!success) {
				return `You don't have the required Slayer Unlocks to ${action} this item.\n\nRequired: ${errors}`;
			}
		}
		if (createableItem.requiredFavour) {
			const [success, points] = gotFavour(user, createableItem.requiredFavour, 100);
			if (!success) {
				return `You don't have the required amount of Favour to ${action} this item.\n\nRequired: ${points}% ${createableItem.requiredFavour.toString()} Favour.`;
			}
		}

		if (createableItem.name.toLowerCase().includes('kourend')) {
			const currentUserFavour = user.settings.get(UserSettings.KourendFavour);
			for (const [key, value] of Object.entries(currentUserFavour)) {
				if (value < 100) {
					return `You don't have the required amount of Favour to ${action} this item.\n\nRequired: 100% ${key} Favour.`;
				}
			}
		}

		if (createableItem.GPCost && user.settings.get(UserSettings.GP) < createableItem.GPCost * quantity) {
			return `You need ${createableItem.GPCost.toLocaleString()} coins to ${action} this item.`;
		}

		if (createableItem.cantBeInCL) {
			const cl = user.cl();
			if (Object.keys(createableItem.outputItems).some(itemID => cl.amount(Number(itemID)) > 0)) {
				return `You can only ${action} this item once!`;
			}
		}
		if (createableItem.maxCanOwn) {
			const allItems = user.allItemsOwned();
			const amountOwned = allItems.amount(createableItem.name);
			if (amountOwned >= createableItem.maxCanOwn) {
				return `You already have ${amountOwned}x ${createableItem.name}, you can't create another.`;
			}
			quantity = createableItem.maxCanOwn - amountOwned;
		}

		const outItems = new Bank(createableItem.outputItems).multiply(quantity);
		const inItems = new Bank(createableItem.inputItems).multiply(quantity);

		if (createableItem.GPCost) {
			inItems.add('Coins', createableItem.GPCost);
		}

		await user.settings.sync(true);

		// Check for any items they cant have 2 of.
		if (createableItem.cantHaveItems) {
			const allItemsOwned = user.allItemsOwned();
			for (const [itemID, qty] of Object.entries(createableItem.cantHaveItems)) {
				const numOwned = allItemsOwned.amount(Number(itemID));
				if (numOwned >= qty) {
					return `You can't ${action} this item, because you have ${new Bank(
						createableItem.cantHaveItems
					)} in your bank.`;
				}
			}
		}

		if (action === 'revert') {
			await handleMahojiConfirmation(
				interaction,
				`${user}, please confirm that you want to revert **${inItems}${
					createableItem.GPCost ? ` and ${(createableItem.GPCost * quantity).toLocaleString()} GP` : ''
				}** into ${outItems}.`
			);
		} else {
			await handleMahojiConfirmation(
				interaction,
				`${user}, please confirm that you want to ${action} **${outItems}** using ${inItems}${
					createableItem.GPCost ? ` and ${(createableItem.GPCost * quantity).toLocaleString()} GP` : ''
				}.`
			);
		}

		// Ensure they have the required items to create the item.
		if (!user.owns(inItems)) {
			return `You don't have the required items to ${action} this item. You need: ${inItems}${
				createableItem.GPCost ? ` and ${(createableItem.GPCost * quantity).toLocaleString()} GP` : ''
			}.`;
		}

		await user.removeItemsFromBank(inItems);
		await user.addItemsToBank({ items: outItems });

		updateBankSetting(client, ClientSettings.EconomyStats.CreateCost, inItems);
		updateBankSetting(client, ClientSettings.EconomyStats.CreateLoot, outItems);

		// Only allow +create to add items to CL
		if (!createableItem.noCl && action === 'create') await user.addItemsToCollectionLog({ items: outItems });

		if (action === 'revert') {
			return `You reverted ${inItems} into ${outItems}.`;
		}
		return `You received ${outItems}.`;
	}
};
