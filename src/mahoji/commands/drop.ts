import { Emoji, ellipsize } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { filterOption } from '@/lib/discord/index.js';
import { parseBank } from '@/lib/util/parseStringBank.js';

export const dropCommand = defineCommand({
	name: 'drop',
	description: 'Drop items from your bank.',
	attributes: {
		examples: ['/drop items:10 trout, 5 coal']
	},
	options: [
		{
			type: 'String',
			name: 'items',
			description: 'The item you want to drop.',
			required: false
		},
		filterOption,
		{
			type: 'String',
			name: 'search',
			description: 'A search query for items in your bank to drop.',
			required: false
		}
	],
	run: async ({ interaction, options, user }) => {
		if (!options.filter && !options.items && !options.search) {
			return "You didn't provide any items, filter or search.";
		}

		const bank = parseBank({
			inputStr: options.items,
			inputBank: user.bank,
			excludeItems: user.user.favoriteItems,
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

		const favs = user.user.favoriteItems;
		const itemsToDoubleCheck = [
			...favs,
			...ClueTiers.map(c => [c.id, c.scrollID]),
			...user.bank
				.items()
				.filter(([item, quantity]) => (item.price ?? 0) * quantity >= 100_000_000)
				.map(i => i[0].id)
		].flat(1);
		const doubleCheckItems = itemsToDoubleCheck.filter(f => bank.has(f));

		await interaction.confirmation(
			`${user}, are you sure you want to drop ${ellipsize(
				bank.toString(),
				1800
			)}? This is irreversible, and you will lose the items permanently.`
		);
		if (doubleCheckItems.length > 0) {
			await interaction.confirmation(
				`${Emoji.Warning} ${user}, some of the items you are dropping are on your **favorites** or look valuable, are you *really* sure you want to drop them? ${Emoji.Warning}\n**${doubleCheckItems
					.map(i => Items.itemNameFromId(i))
					.join(', ')}**\n\nDropping: ${ellipsize(bank.toString(), 1000)}`
			);
		}

		await user.removeItemsFromBank(bank);
		await ClientSettings.updateBankSetting('dropped_items', bank);

		return interaction.returnStringOrFile(`Dropped ${bank}.`);
	}
});
