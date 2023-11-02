import { increaseNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { MahojiUserOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';

import { halloweenShop } from '../../lib/halloween/halloween';
import { murMurSort } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { OSBMahojiCommand } from '../lib/util';

export const halloweenCommand: OSBMahojiCommand = {
	name: 'halloween',
	description: 'The Halloween 2023 event.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View your halloween progress.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'shop',
			description: 'View the shop, or buy an item with your halloween currency.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'buy_item',
					description: 'The item to buy.',
					required: false,
					autocomplete: async value => {
						return halloweenShop
							.filter(buyable =>
								!value ? true : buyable.item?.name.toLowerCase().includes(value.toLowerCase())
							)
							.map(i => ({ name: i.item!.name, value: i.item!.name }));
					}
				}
			]
		}
	],
	run: async ({
		interaction,
		options,
		userID
	}: CommandRunOptions<{
		trick?: { user: MahojiUserOption };
		view?: {};
		shop?: { buy_item?: string };
	}>) => {
		const user = await mUserFetch(userID);

		if (options.view) {
			return `You have found a total of: ${user.cl.amount('Splooky fwizzle')}x Splooky fwizzle.
You currently have: ${user.bank.amount('Splooky fwizzle')}x Splooky fwizzle.


You have bought ${halloweenShop.filter(i => user.cl.has(i.item!.id)).length}/${
				halloweenShop.length
			} of the Halloween store items.

**Spookiness**: ${murMurSort([13, 53, 12, 100, 1, 23, 35, 5, 23, 44, 34, 23, 14], user.id)[0]}%
**Evilness**: ${murMurSort([1, 5, 23, 55, 14, 22, 12, 52, 99, 34, 23], user.id)[0]}%
`;
		}

		if (options.shop) {
			if (!options.shop.buy_item) {
				return `<:Pumpkin:764130154662199347> **Halloween Shop** 👻

${halloweenShop
	.map(buyable => `**${buyable.item!.name}**: ${buyable.description} Costs ${buyable.cost}x Splooky fwizzle`)
	.join('\n')}`;
			}
			const buyable = halloweenShop.find(
				i => i.item!.name.toLowerCase() === options.shop!.buy_item!.toLowerCase()
			);
			if (!buyable) {
				return 'Invalid item.';
			}
			let { cost } = buyable;

			// Increase cost by 25% for each owned, except for "Fool's ace"
			if (buyable.item.name !== "Fool's ace") {
				for (let i = 0; i < user.cl.amount(buyable.item!.id); i++) {
					let increasePercent = 25;
					if (buyable.item!.name === 'Spooky aura') increasePercent = 450;
					cost = Math.floor(increaseNumByPercent(cost, increasePercent));
				}
			}

			const itemCost = new Bank().add('Splooky fwizzle', cost);

			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to buy ${buyable.item!.name} for ${itemCost}?`
			);

			if (!user.owns(itemCost)) {
				return `You need ${itemCost} to buy ${buyable.item!.name}.`;
			}

			await user.transactItems({
				itemsToAdd: new Bank().add(buyable.item!.id),
				itemsToRemove: itemCost,
				collectionLog: true
			});

			return `Bought ${buyable.item!.name} for ${itemCost}.`;
		}

		return 'Invalid command.';
	}
};
