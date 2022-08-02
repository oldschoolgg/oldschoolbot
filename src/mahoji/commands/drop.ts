import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { ClueTiers } from '../../lib/clues/clueTiers';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { itemNameFromID, updateBankSetting } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUsersSettingsFetch } from '../mahojiSettings';

export const dropCommand: OSBMahojiCommand = {
	name: 'drop',
	description: 'Drop items from your bank.',
	attributes: {
		examples: ['/drop items:10 trout, 5 coal']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'items',
			description: 'The item you want to drop.',
			required: false
		},
		filterOption,
		{
			type: ApplicationCommandOptionType.String,
			name: 'search',
			description: 'A search query for items in your bank to drop.',
			required: false
		}
	],
	run: async ({
		interaction,
		options,
		userID
	}: CommandRunOptions<{ items: string; filter?: string; search?: string }>) => {
		if (!options.filter && !options.items && !options.search) {
			return "You didn't provide any items, filter or search.";
		}
		const user = await globalClient.fetchUser(userID);
		const mUser = await mahojiUsersSettingsFetch(userID, { favoriteItems: true });
		const bank = parseBank({
			inputStr: options.items,
			inputBank: user.bank(),
			excludeItems: mUser.favoriteItems,
			user,
			search: options.search,
			filters: [options.filter],
			maxSize: 70
		});

		if (!user.owns(bank)) {
			return `You don't own ${bank}.`;
		}
		if (bank.length === 0) {
			return 'No valid items that you own were given.';
		}

		const favs = user.settings.get(UserSettings.FavoriteItems);
		let itemsToDoubleCheck = [
			...favs,
			...ClueTiers.map(c => [c.id, c.scrollID]),
			...user
				.bank()
				.items()
				.filter(([item, quantity]) => item.price * quantity >= 100_000_000)
				.map(i => i[0].id)
		].flat(1);
		const doubleCheckItems = itemsToDoubleCheck.filter(f => bank.has(f));

		if (doubleCheckItems.length > 0) {
			await handleMahojiConfirmation(
				interaction,
				`${user}, some of the items you are dropping look valuable, are you *really* sure you want to drop them? **${doubleCheckItems
					.map(itemNameFromID)
					.join(', ')}**`
			);
		} else {
			await handleMahojiConfirmation(
				interaction,
				`${user}, are you sure you want to drop ${bank}? This is irreversible, and you will lose the items permanently.`
			);
		}

		await user.removeItemsFromBank(bank);
		updateBankSetting(globalClient, ClientSettings.EconomyStats.DroppedItems, bank);

		return `Dropped ${bank}.`;
	}
};
