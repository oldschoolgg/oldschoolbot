import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { drawChestLootImage } from '../../lib/bankImage';
import { getItem } from '../../lib/util/getOSItem';
import { ownedItemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const vaultCommand: OSBMahojiCommand = {
	name: 'vault',
	description: 'Allows you to store items securely.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'add',
			description: 'The items you want to add.',
			options: [
				{
					...ownedItemOption(),
					name: 'item'
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The amount of items you want to store.',
					min_value: 1,
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'remove',
			description: 'The items you want to remove.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to remove.',
					required: false,
					autocomplete: async (_, user) => {
						const mUser = await mahojiUsersSettingsFetch(user.id, { vault: true });
						return new Bank(mUser.vault as ItemBank)
							.items()
							.map(i => ({ name: i[0].name, value: i[0].id }));
					}
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The amount of items you want to remove.',
					min_value: 1,
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View your vault.'
		}
	],
	run: async ({
		userID,
		options
	}: CommandRunOptions<{
		add: {
			item?: string;
			quantity?: number;
		};
		remove: {
			item?: string;
			quantity?: number;
		};
	}>) => {
		const MAX_ITEMS_IN_VAULT = 6;
		const user = await mUserFetch(userID);
		const currentVault = new Bank(user.user.vault as ItemBank);

		if (options.add) {
			if (!options.add.item) return 'Invalid item';
			const item = getItem(options.add.item);
			if (!item) return 'Invalid item';
			if (!user.bank.has(item.id)) return `You don't have a ${item.name}.`;
			const quantity = options.add.quantity ?? user.bank.amount(item.id);
			if (quantity > user.bank.amount(item.id)) return `You don't have that many ${item.name}.`;
			if (currentVault.length >= MAX_ITEMS_IN_VAULT) return 'Your vault is full.';
			const cost = new Bank().add(item.id, quantity);
			const newVault = currentVault.clone().add(cost);
			if (!user.bank.has(cost.bank)) return 'You do not have enough items.';
			await user.removeItemsFromBank(cost);
			await user.update({
				vault: newVault.bank
			});
			return `You have added ${quantity}x ${item.name} to your vault.`;
		}

		if (options.remove) {
			if (!options.remove.item) return 'Invalid item';
			const item = getItem(options.remove.item);
			if (!item) return 'Invalid item';
			if (!currentVault.has(item.id)) return `You don't have a ${item.name} in your vault.`;
			const quantity = options.remove.quantity ?? currentVault.amount(item.id);
			if (quantity > currentVault.amount(item.id)) return `You don't have that many ${item.name} in your vault.`;
			const loot = new Bank().add(item.id, quantity);
			const newVault = currentVault.clone().remove(loot);
			await user.addItemsToBank({ items: loot, collectionLog: false });
			await user.update({
				vault: newVault.bank
			});
			return `You have removed ${quantity}x ${item.name} from your vault.`;
		}

		const image = await drawChestLootImage({
			entries: [
				{
					loot: currentVault,
					user,
					previousCL: currentVault,
					customTexts: [],
					title: `Vault (${currentVault.length}/${MAX_ITEMS_IN_VAULT})`
				}
			],
			type: 'Vault'
		});

		return { files: [image] };
	}
};
